const csvParse = require('csv-parse');

const useMasterKey = { useMasterKey: true };
const Project = Parse.Object.extend('Project');
const Vote = Parse.Object.extend('Vote');
const Queue = Parse.Object.extend('Queue');

Parse.Cloud.define('loadCsv', loadCsv);
Parse.Cloud.define('isAdmin', isAdmin);
Parse.Cloud.define('saveVotes', saveVotes);
Parse.Cloud.define('getVotes', getVotes);
Parse.Cloud.define('createVoteQueue', createVoteQueue);
Parse.Cloud.define('getVoteQueue', getVoteQueue);
Parse.Cloud.define('getAllProjects', getAllProjects);
Parse.Cloud.define('getProject', getProject);

/*
 * Auth
 */ 

async function isAdmin(request) {
  let adminRoleQuery = new Parse.Query('_Role');
  adminRoleQuery.equalTo('name', 'Admin');
  adminRoleQuery.equalTo('users', request.user);
  return adminRoleQuery.first(useMasterKey)
    .then(match => {
      return !!match;
    }).catch(err => {
      throw err;
    });
}

/*
 * CSV
 */ 

async function loadCsv(request) {
  return isAdmin(request)
    .then(authorized => {
      if (!authorized || !request.params.csv) {
        throw new Error('Not admin');
      }
      return decodeURIComponent(request.params.csv);
    })
    .then(csv => {
      return parseCsv(csv)
    })
    .catch(err => console.log('Error', err));
}

async function parseCsv(csv) {
  return new Promise((resolve, reject) => {
    let csvParseOptions = {
      columns: true,
      relax_column_count: true
    }

    csvParse(csv, csvParseOptions,
      (err, output) => {
        if (err) {
          reject('CSV Error:', err.message);
          return;
        }
  
        let projects = [];
        output.forEach(_project => {
          console.log(_project);
          _project.categories = _project.categories.split(',');
          let project = new Project();
          project.set(_project);
          projects.push(project);
        });


  
        Parse.Object.saveAll(projects, useMasterKey)
          .then(() => resolve('Uploaded.'))
          .catch(err => {
            reject('Couldn\'t save projects');
            return;
          });
      }
    );
  });
}

/*
* Votes
*/ 

async function saveVotes (request) {
  const {time, projectObjId, scores, cast} = request.params;
  const user = request.user;

  let project;

  return new Parse.Query(Project).get(projectObjId, useMasterKey)
    .then(retrieved => {
      project = retrieved;

      const voteQuery = new Parse.Query(Vote);
      voteQuery.equalTo('project', project);
      voteQuery.equalTo('judge', user);
      voteQuery.limit(1000);

      return voteQuery.find(useMasterKey);
    }).then(oldVotes => {
      let toDestroy = [];
      if (oldVotes.length) {
        oldVotes.forEach(oldVote => {
          if (oldVote.get('time') > time) {
            throw new Error('Newer vote already saved.');
          } else if (oldVote.get('casted') === false || cast) {
            toDestroy.push(oldVote);
          }
        });
      }

      toDestroy.forEach(oldVote => oldVote.destroy());
      
      const newVote = new Vote();
      newVote.set('project', project);
      newVote.set('judge', user);
      newVote.set('votes', scores);
      newVote.set('time', time);
      newVote.set('casted', cast);

      return newVote.save();
    }).then(() => {
      return 'Saved';
    }).catch(err => {
      console.log('ProjectGet Error:', err);
      return 'Error';
    });
}

async function getVotes(request) {
  const user = request.user;

  if (request.params.hasOwnProperty("projectId")) {
    return getProjectVotes(user, request.params.projectId);
  } else {
    return getAllVotes(user);
  }
}

async function getProjectVotes(user, projectObjId) {
  return new Parse.Query(Project)
    .get(projectObjId, useMasterKey)
    .then(retrieved => {
      let project = retrieved;
      const voteQuery = new Parse.Query(Vote);
      voteQuery.equalTo('project', project);
      voteQuery.equalTo('judge', user);
      voteQuery.limit(1000);

      return voteQuery.find(useMasterKey);
    }).then(oldVotes => {
      let votesCasted;
      let votesWip;
      if (oldVotes.length) {
        oldVotes.forEach(oldVote => {
          if (oldVote.get('casted')) {
            votesCasted = oldVote.toJSON();
          } else {
            votesWip = oldVote.toJSON();
          }
        });
      }
      return { votesCasted, votesWip };
    }).catch(err => {
      console.log(err);
    });
}

async function getAllVotes(user) {
  const query = new Parse.Query(Vote);
  query.equalTo("judge", user);
  query.limit(1000);
  return query.find(useMasterKey)
    .then(votes => {
      votes = votes.map((vote) => {
        let json = vote.toJSON();
        return json;
      });
      return votes;
    })
    .catch(err => console.log(err));
}

async function createVoteQueue(request) {
  const user = request.user;
  const queryExisting = new Parse.Query(Queue);
  queryExisting.equalTo('user', user);
  queryExisting.limit(1000);
  const existing = await queryExisting.find(useMasterKey);

  return new Parse.Query(Project)
    .find(useMasterKey)
    .then(projects => {
      const queueItems = projects.map(project => {
        console.log(project.objectId);
        return project.id
      });

      const queue = existing.length ? existing[0] : new Queue();
      queue.set('user', user);
      queue.set('items', queueItems);
      return queue.save(null, useMasterKey);
    }).then(results => {
      return results;
    }).catch(err => console.log(err));
};

/*
 * Projects
 */ 

async function getVoteQueue(request) {
  const user = request.user;
  const query = new Parse.Query(Queue);
  query.equalTo('user', user);
  query.limit(1000);
  return query
    .find(useMasterKey)
    .then(queues => {
      let items = queues[0].get('items');
      return items;
    }).catch(err => console.log(err));
}

async function getAllProjects(request) {
  // TODO: check role
  let query = new Parse.Query(Project);
  query.limit(1000);
  return query.find()
    .then(list => {
      const projects = list.reduce((map, project) => {
        project = project.toJSON();
        project.skipped = false;
        project.done = false;
        map[project.objectId] = project;

        return map;
      },{});

      return projects;
    });
}

async function getProject(request) {
  // TODO: check role
  let query = new Parse.Query(Project).get(request.params.projectId)
  return await query
    .then(project => {
        project = project.toJSON();
        project.skipped = false;
        project.done = false;

      return project
    });
}