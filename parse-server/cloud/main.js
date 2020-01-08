const csvParse = require('csv-parse');

const useMasterKey = { useMasterKey: true };
const User = Parse.Object.extend('User');
const Project = Parse.Object.extend('Project');
const Category = Parse.Object.extend('Category');
const Vote = Parse.Object.extend('Vote');
const Queue = Parse.Object.extend('Queue');
const JudgingCriteria = Parse.Object.extend('JudgingCriteria');
const JudgeToCategory = Parse.Object.extend('JudgeToCategory');

let cloudFuncs = {
  'loadCsv': loadCsv,
  'isAdmin': isAdmin,
  'saveVotes': saveVotes,
  'getVotes': getVotes,
  'createVoteQueue': createVoteQueue,
  'getVoteQueue': getVoteQueue,
  'getAllProjects': getAllProjects,
  'getProject': getProject,
  'getGeneralCriteria': getGeneralCriteria,
  'addGeneralCriteria': addGeneralCriteria,
  'updateCriteria': updateCriteria,
  'deleteCriteria': deleteCriteria,
  'getCategoriesOfJudge': getCategoriesOfJudge,
  'getAllCategories': getAllCategories,
  'getAllUsers': getAllUsers,
}

Object.keys(cloudFuncs).forEach((remote) => {
  Parse.Cloud.define(remote, cloudFuncs[remote]);
});

// Parse.Cloud.define('loadCsv', loadCsv);
// Parse.Cloud.define('isAdmin', isAdmin);
// Parse.Cloud.define('saveVotes', saveVotes);
// Parse.Cloud.define('getVotes', getVotes);
// Parse.Cloud.define('createVoteQueue', createVoteQueue);
// Parse.Cloud.define('getVoteQueue', getVoteQueue);
// Parse.Cloud.define('getAllProjects', getAllProjects);
// Parse.Cloud.define('getProject', getProject);
// Parse.Cloud.define('getGeneralCriteria', getGeneralCriteria);
// Parse.Cloud.define('addGeneralCriteria', addGeneralCriteria);
// Parse.Cloud.define('deleteCriteria', deleteCriteria);
// Parse.Cloud.define('updateCriteria', updateCriteria);

function isStringEmpty(string) {
  return !string.trim() || 0 === string.length;
}

/*
 * Auth
 */ 

async function isAdmin(request) {
  let adminRoleQuery = new Parse.Query('_Role');
  adminRoleQuery.equalTo('name', 'Admin');
  adminRoleQuery.equalTo('users', request.user);
  const result =  await adminRoleQuery.first(useMasterKey);
  
  return !!result;
}

/*
 * CSV
 */ 

async function loadCsv(request) {
  if (!await isAdmin(request)) {
    throw new Error('Not admin');
  }

  if (!request.params.csv) {
    throw new Error('No CSV file included')
  }

  const csv = decodeURIComponent(request.params.csv);
  return parseCsv(csv);
}

async function parseCsv(csv) {
  return new Promise((resolve, reject) => {
    let csvParseOptions = {
      columns: true,
      relax_column_count: true
    }

    csvParse(csv, csvParseOptions,
      async (err, parsedOutput) => {

        if (err) {
          reject('CSV Error:', err.message);
          return;
        }
  
        let allCategoryNames = new Set();
        let projects = [];
        parsedOutput.forEach(_project => {

          _project.categories = 
            _project.categories.split(',')
            .map((category) => {
              category = category.trim();
              allCategoryNames.add(category);
              return category;
            })

          let project = new Project();
          project.set(_project);
          projects.push(project);
        });

        let categories = [];
        allCategoryNames.forEach((categoryName) => {
          let category = new Category();
          category.set("name", categoryName);
          categories.push(category);
        })

        await deleteOldProjects();
  
        Parse.Object.saveAll(projects, useMasterKey)
          .then(() => resolve('Uploaded.'))
          .catch(err => {
            reject('Couldn\'t save projects');
            return;
          });

        Parse.Object.saveAll(categories, useMasterKey)
          .then(() => resolve('Uploaded.'))
          .catch(err => {
            reject('Couldn\'t save categories');
            return;
          });
      }
    );
  });
}

async function deleteOldProjects() {
  let toDelete = [];

  const projectsQuery = new Parse.Query(Project);
  projectsQuery.limit(1000);
  toDelete = toDelete.concat(await projectsQuery.find(useMasterKey));

  const voteQuery = new Parse.Query(Vote);
  voteQuery.limit(1000);
  toDelete = toDelete.concat(await voteQuery.find(useMasterKey));

  const queueQuery = new Parse.Query(Queue);
  queueQuery.limit(1000);
  toDelete = toDelete.concat(await queueQuery.find(useMasterKey));

  let deletePromises = toDelete.map((obj) => {
    return obj.destroy()
  })
  
  return Promise.all(deletePromises);
}

/*
 * Criteria
 */

async function getGeneralCriteria() {
  const query = new Parse.Query(JudgingCriteria);
  query.equalTo("isGeneral", true);
  query.limit(1000);
  return query.find(useMasterKey)
    .then(criteria => {
      criteria = criteria.map((criterion) => {
        let json = criterion.toJSON();
        return json;
      });
      return criteria;
    })
    .catch(err => console.log(err));
}

async function doesCriteriaAccessorExist(accessor, idIgnore) {
  const query = new Parse.Query(JudgingCriteria);
  query.equalTo("accessor", accessor);
  const results = await query.find();

  if (results.length == 0) {
    return false;
  }

  if (results.length === 1 && results[0].id === idIgnore) {
    return false;
  }

  return true;
}

async function doesCriteriaOrderNumExist(order, category, idIgnore) {
  let isGeneral = (category === undefined)
  const query = new Parse.Query(JudgingCriteria);
  query.equalTo("order", Number(order));
  query.equalTo("isGeneral", isGeneral);
  if (!isGeneral) {
    query.equalTo("category", category);
  }
  const results = await query.find();

  if (results.length == 0) {
    return false;
  }

  if (results.length === 1 && results[0].id === idIgnore) {
    return false;
  }
  
  return true;
}

async function validateCriteriaInput(params, category, objectId) {
  let {name, order, accessor, maxScore} = params;

  if (isStringEmpty(name)) {
    throw new Error("Name can't be empty");
  }

  if (await doesCriteriaAccessorExist(accessor, objectId)) {
    throw new Error("Accessor exists");
  }

  if (isStringEmpty(accessor)) {
    throw new Error("Accessor can't be empty");
  }

  if (isNaN(order)) {
    throw new Error("Order must be a number");
  }

  // todo: doesn't seem to work
  if (await doesCriteriaOrderNumExist(order, category, objectId)) {
    throw new Error("Criterion with provided order number exists");
  }

  if (isNaN(maxScore)) {
    throw new Error("MaxScore must be a number");
  }

  if (category !== undefined) {
    if (isStringEmpty(category)) {
      throw new Error("Category can't be empty");
    }
  }

  return true;
}

async function addGeneralCriteria(request) {
  if (!await isAdmin(request)) {
    throw new Error('Not admin');
  }

  let criterion = new JudgingCriteria();

  let {name, description, order, accessor, maxScore} = request.params;

  try {
    await validateCriteriaInput(request.params);
  } catch (err) {
    throw err;
  }
  
  criterion.set("name", name);
  criterion.set("description", description);
  criterion.set("order", Number(order));
  criterion.set("accessor", accessor);
  criterion.set("maxScore", Number(maxScore));
  criterion.set("isGeneral", true);
  return criterion.save(null, useMasterKey);
}

async function addCustomCriteria(custom) {

}

async function deleteCriteria(request) {
  if (!await isAdmin(request)) {
    throw new Error('Not admin');
  }

  return new Parse.Query(JudgingCriteria)
    .get(request.params.objectId, useMasterKey)
    .then((obj) => obj.destroy());
}

async function updateCriteria(request) {
  if (!await isAdmin(request)) {
    throw new Error('Not admin');
  }

  try {
    await validateCriteriaInput(request.params.update, undefined, request.params.objectId);
  } catch (err) {
    throw err;
  }
  
  return new Parse.Query(JudgingCriteria)
    .get(request.params.objectId, useMasterKey)
    .then((obj) => {
      let {name, description, order, accessor, maxScore} = request.params.update;
      obj.set("name", name);
      obj.set("description", description);
      obj.set("order", Number(order));
      obj.set("accessor", accessor);
      obj.set("maxScore", Number(maxScore));
      obj.set("isGeneral", true);
      obj.save();
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
  let query = new Parse.Query(Project);
  let ret = query.get(request.params.projectId)
    .then(project => {
        project = project.toJSON();
        project.skipped = false;
        project.done = false;

      return project
    });

  return ret;
}

async function getCategoriesOfJudge(request) {
  let judge;

  if (request.params.judgeId) {

    if (!await isAdmin(request)) {
      throw new Error('Not admin');
    }

    let query = new Parse.Query(User);
    judge = await query.get(request.params.judgeId);
  } else {
    judge = request.user;
  }

  let query = new Parse.Query(JudgeToCategory);
  query.equalTo('judge', judge);
  let ret = query.find(useMasterKey)
    .then((obj) => {

      if (obj.length == 0) {
        return null;
      }

      let categoriesQuery = obj[0].get('categories').query();
      return categoriesQuery.find(useMasterKey);
    })
    // .then((results) => {
    //   return results.toJSON();
    // });

  return ret;
}

async function getAllCategories(request) {
  if (!await isAdmin(request)) {
    throw new Error('Not admin');
  }

  let query = new Parse.Query(Category);
  query.limit(1000);

  return query.find(useMasterKey);
}

async function getAllUsers(request) {
  if (!await isAdmin(request)) {
    throw new Error('Not admin');
  }

  let query = new Parse.Query(User);
  query.limit(1000);

  let ret = query.find(useMasterKey)
    .then((users) => {
      users = users.map((user) => {
        let json = user.toJSON();
        return json;
      });

      return users;
    })

  return ret;
}