const UserHandler = require('./User')
const JudgeHandler = require('./Judge')

const {useMasterKey, User, Project, Category, Vote, Queue, JudgingCriteria, JudgeToCategory} = require('./common');

const csvParse = require('csv-parse');

let cloudFuncs = {
  'loadCsv': loadCsvHandler,
  'isAdmin': UserHandler.onIsAdmin,
  'getAllUsers': getAllUsers,
  'updateUser': updateUserHandler,

  'createVoteQueue': createVoteQueueHandler,
  'getVoteQueue': getVoteQueue,
  'saveVotes': saveVotesHandler,
  'getVotes': getVotesHandler,

  'getAllProjects': getAllProjects,
  'getProject': getProject,

  'getGeneralCriteria': getGeneralCriteria,
  'addGeneralCriteria': addGeneralCriteria,
  'updateCriteria': updateCriteria,
  'deleteCriteria': deleteCriteria,

  'getCategoriesOfJudge': getCategoriesOfJudgeHandler,
  'getAllCategories': getAllCategories,
  'setCategoriesOfJudge': setCategoriesOfJudgeHandler,
  'setCategoriesOfJudge': JudgeHandler.onSetCategoriesOfJudge,
}

Object.keys(cloudFuncs).forEach((remote) => {
  Parse.Cloud.define(remote, cloudFuncs[remote]);
});

function isStringEmpty(string) {
  return !string.trim() || 0 === string.length;
}

/*
 * CSV
 */ 

async function loadCsvHandler(request) {
  if (!await UserHandler.isAdmin(request.user)) {
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
  
        let projects = [];
        for (_project of parsedOutput) {
          // todo: ignore empty rows
          if (_project.categories.trim().length > 0) {
            let categoryNames = _project.categories.split(',')
            let categories = [];
            for (categoryName of categoryNames) {
              categoryName = categoryName.trim();
              let category = await getCategory(categoryName, true);
              categories.push(category);
            }

            _project.categories = categories;   
          } else {
            _project.categories = [];
          }

          let project = new Project();
          project.set(_project);
          projects.push(project);
        }

        await deleteOldProjects();
  
        Parse.Object.saveAll(projects, useMasterKey)
          .then(() => resolve('Uploaded.'))
          .catch(err => {
            reject(`Couldn\'t save projects. Err: ${err}`);
            return;
          });

        // Parse.Object.saveAll(categories, useMasterKey)
        //   .then(() => resolve('Uploaded.'))
        //   .catch(err => {
        //     reject('Couldn\'t save categories');
        //     return;
        //   });
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

async function getAllUsers(request) {
  if (!await UserHandler.isAdmin(request.user)) {
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

async function updateUserHandler(request) {

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
  if (!await UserHandler.isAdmin(request.user)) {
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
  if (!await UserHandler.isAdmin(request.user)) {
    throw new Error('Not admin');
  }

  return new Parse.Query(JudgingCriteria)
    .get(request.params.objectId, useMasterKey)
    .then((obj) => obj.destroy());
}

async function updateCriteria(request) {
  if (!await UserHandler.isAdmin(request.user)) {
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

async function saveVotesHandler(request) {
  const {time, projectObjId, categoryId, scores, cast} = request.params;
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
            // toDestroy.push(oldVote);
            toDestroy.push(oldVote.destroy());
          }
        });
      }

      // toDestroy.forEach(oldVote => oldVote.destroy());
      return Promise.all(toDestroy);
    }).then(() => {
      return new Parse.Query(Category).get(categoryId, useMasterKey);
    }).then((category) => {
      const newVote = new Vote();
      newVote.set('project', project);
      newVote.set('judge', user);
      newVote.set('votes', scores);
      newVote.set('time', time);
      newVote.set('casted', cast);
      newVote.set('category', category);

      return newVote.save();
    }).then(() => {
      return 'Saved';
    }).catch(err => {
      console.log('Save votes error:', err);
      return 'Error';
    });
}

async function getVotesHandler(request) {
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

async function createVoteQueueHandler(request) {
  const user = request.user;
  const queryExisting = new Parse.Query(Queue);
  queryExisting.equalTo('user', user);
  queryExisting.limit(1000);
  const existing = await queryExisting.find(useMasterKey);

  return getCategoriesOfJudge(user)
    .then((categories) => {
      if (categories.length == 0) {
        throw new Error('This user is not assigned to any categories.');
      }

      let partialQueries = categories.map((categoryId) => {
        const partialQuery = new Parse.Query(Project);
        const pointer = new Category();
        pointer.id = categoryId;
        partialQuery.equalTo('categories', pointer);
        return partialQuery;
      });

      var queryProjects = Parse.Query.or(...partialQueries);
      return queryProjects.find(useMasterKey);
    }).then(projects => {
      const queue = existing.length ? existing[0] : new Queue();
      projects = projects.map((project) => project.id);
      queue.set('user', user);
      queue.set('items', projects);
      return queue.save(null, useMasterKey);
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
      if (queues.length == 0) {
        return null;
      }

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

async function getCategoriesOfJudgeHandler(request) {
  let judge;

  if (request.params.judgeId) {

    if (!await UserHandler.isAdmin(request.user)) {
      throw new Error('Not admin');
    }

    let query = new Parse.Query(User);
    judge = await query.get(request.params.judgeId, useMasterKey);

  } else {
    judge = request.user;
  }

  return getCategoriesOfJudge(judge);
}

async function getCategoriesOfJudge(judge) {
  let query = new Parse.Query(JudgeToCategory);
  query.equalTo('judge', judge);
  let ret = query.find(useMasterKey)
    .then((obj) => {

      if (obj.length == 0) {
        return null;
      }

      let categories = obj[0].get('categories');
      return categories.map((category) => category.id);
    })
    // .then((results) => {
    //   return results.toJSON();
    // });

  return ret;
}

async function getAllCategories(request) {
  if (!await UserHandler.isAdmin(request.user)) {
    throw new Error('Not admin');
  }

  let query = new Parse.Query(Category);
  query.limit(1000);

  return query.find(useMasterKey);
}

async function getCategory(name, createIfNotExists) {
  let categoryQuery = new Parse.Query(Category);
  categoryQuery.equalTo('name', name);

  return categoryQuery.find(useMasterKey)
    .then((results) => {
      if (results.length > 0) {
        return results[0];
      }

      if (createIfNotExists) {
        return createCategory(name, true);
      } else {
        return null;
      }

    })
}

async function createCategory(name, skipCheck) {
  if (!skipCheck && doesCategoryExist(name)) {
    throw new Error('Category already exists');
  }

  let category = new Category();
  category.set('name', name);
  return category.save(null, useMasterKey);
}

async function doesCategoryExist(name, idIgnore) {
  let query = new Parse.Query(Category);
  query.equalTo('name', name);
  let results = await query.find(useMasterKey);

  if (results.length == 0) {
    return false;
  }

  if (results.length === 1 && results[0].id === idIgnore) {
    return false;
  }

  return true;
}

async function setCategoriesOfJudgeHandler(request) {

}