const UserHandler = require('./User')
const JudgeHandler = require('./Judge')

const {useMasterKey, User, Project, Category, Vote, Queue, JudgingCriteria, JudgeToCategory} = require('./common');

const csvParse = require('csv-parse');

let cloudFuncs = {
  'loadCsv': loadCsvHandler,
  'isAdmin': UserHandler.onIsAdmin,
  'getAllUsers': getAllUsers,
  'updateUser': updateUserHandler,

  'getVotingData': onGetVotingData,
  'createVoteQueue': onCreateVoteQueue,
  'getVoteQueue': onGetVoteQueue,
  'saveVotes': onSaveVotes,
  'getVotes': onGetVotes,
  'getJudgesPick': onGetJudgesPick,

  'getProjects': onGetProjects,
  'getAllProjects': getAllProjects,
  'getProject': onGetProject,

  'getCriteria': onGetCriteria,
  'createCriterion': onCreateCriterion,
  'updateCriteria': updateCriteria,
  'deleteCriteria': deleteCriteria,
  'getVotingCriteria': onGetVotingCriteria,

  'getCategoriesOfJudge': onGetCategoriesOfJudge,
  'getAllCategories': getAllCategories,
  'getCategory': onGetCategory,
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
              let category = await getCategoryByName(categoryName, true);
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
  // todo: implement
}

/*
 * Criteria
 */

function onGetCriteria(request) {
  const {categoryId} = request.params;
  const query = new Parse.Query(JudgingCriteria);
  if (categoryId) {
    query.equalTo("isGeneral", false);
    let ptr = new Category();
    ptr.id = categoryId;
    query.equalTo("category", ptr);
  } else {
    query.equalTo("isGeneral", true);
  }
  query.ascending("order");
  query.limit(1000);
  return query.find(useMasterKey)
    .then(criteria => criteria.map((criterion) => {
        let json = criterion.toJSON();
        return json;
      }))
    .catch(err => console.log(err));
}

function onGetVotingCriteria(request) {
  const {categoryId} = request.params;

  const generalQuery = new Parse.Query(JudgingCriteria);
  generalQuery.equalTo("isGeneral", true);
  generalQuery.ascending("order");
  generalQuery.limit(1000);

  const specificQuery = new Parse.Query(JudgingCriteria);
  specificQuery.equalTo("isGeneral", false);
  let ptr = new Category();
  ptr.id = categoryId;
  specificQuery.equalTo("category", ptr);
  specificQuery.ascending("order");
  specificQuery.limit(1000);

  var mainQuery = Parse.Query.or(generalQuery, specificQuery);
  return mainQuery.find(useMasterKey)
    .then(criteria => criteria.map((criterion) => {
      let json = criterion.toJSON();
      return json;
    }))
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

async function doesCriteriaOrderNumExist(order, categoryId, idIgnore) {
  let isGeneral = (categoryId === undefined)
  const query = new Parse.Query(JudgingCriteria);
  query.equalTo("order", Number(order));
  query.equalTo("isGeneral", isGeneral);
  if (!isGeneral) {
    let ptr = new Category();
    ptr.id = categoryId;
    query.equalTo("category", ptr);
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

async function validateCriteriaInput(params, objectId) {
  let {name, order, accessor, maxScore, categoryId} = params;

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
  if (await doesCriteriaOrderNumExist(order, categoryId, objectId)) {
    throw new Error("Criterion with provided order number exists");
  }

  if (isNaN(maxScore)) {
    throw new Error("MaxScore must be a number");
  }

  if (categoryId !== undefined) {
    if (isStringEmpty(categoryId)) {
      throw new Error("Category can't be empty");
    }
  }

  return true;
}

async function onCreateCriterion(request) {
  if (!await UserHandler.isAdmin(request.user)) {
    throw new Error('Not admin');
  }

  let criterion = new JudgingCriteria();

  let {name, description, order, accessor, maxScore, categoryId} = request.params;

  try {
    await validateCriteriaInput(request.params, request.params.objectId);
  } catch (err) {
    throw err;
  }
  
  criterion.set("name", name);
  criterion.set("description", description);
  criterion.set("order", Number(order));
  criterion.set("accessor", accessor);
  criterion.set("maxScore", Number(maxScore));
  if (categoryId === undefined) {
    criterion.set("isGeneral", true);
  } else {
    let ptr = new Category();
    ptr.id = categoryId;
    criterion.set("isGeneral", false);
    criterion.set("category", ptr);
  }
  return criterion.save(null, useMasterKey);
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
    await validateCriteriaInput(request.params.update, request.params.objectId);
  } catch (err) {
    throw err;
  }
  
  return new Parse.Query(JudgingCriteria)
    .get(request.params.objectId, useMasterKey)
    .then((obj) => {
      let {name, description, order, accessor, maxScore, categoryId} = request.params.update;
      obj.set("name", name);
      obj.set("description", description);
      obj.set("order", Number(order));
      obj.set("accessor", accessor);
      obj.set("maxScore", Number(maxScore));
      if (categoryId === undefined) {
        obj.set("isGeneral", true);
      } else {
        let ptr = new Category();
        ptr.id = categoryId;
        obj.set("isGeneral", false);
        obj.set("category", ptr);
      }
      obj.save();
    });
}

/*
* Votes
*/ 

async function onSaveVotes(request) {
  const {time, projectObjId, categoryId, scores, isJudgesPick} = request.params;
  const user = request.user;

  let project;

  if (isJudgesPick) {
    let existingPick = await getJudgesPick(user, categoryId);
    if (existingPick !== null && existingPick.id !== projectObjId) {
      throw new Error('Judge\'s pick already selected');
    }
  }

  return new Parse.Query(Project).get(projectObjId, useMasterKey)
    .then(retrieved => {
      project = retrieved;

      let categoryPtr = new Category();
      categoryPtr.id = categoryId;

      const voteQuery = new Parse.Query(Vote);
      voteQuery.equalTo('project', project);
      voteQuery.equalTo('judge', user);
      voteQuery.equalTo('category', categoryPtr);

      voteQuery.limit(1000);

      return voteQuery.find(useMasterKey);
    }).then(oldVotes => {
      if (oldVotes.length == 0) {
        return;
      }

      let oldVote = oldVotes[0];
      if (oldVote.get('time') > time) {
        throw new Error('Newer vote already saved.');
      }

      return oldVote.destroy();
    }).then(() => {
      return new Parse.Query(Category).get(categoryId, useMasterKey);
    }).then((category) => {
      const newVote = new Vote();
      newVote.set('project', project);
      newVote.set('judge', user);
      newVote.set('votes', scores);
      newVote.set('time', time);
      newVote.set('isJudgesPick', isJudgesPick)
      newVote.set('category', category);

      return newVote.save();
    }).then(() => {
      return 'Saved';
    }).catch(err => {
      console.log('Save votes error:', err);
      return 'Error';
    });
}

async function onGetVotes(request) {
  const { projectId, categoryId, judgeId} = request.params;
  let user;
  if (judgeId) {
    if (!await UserHandler.isAdmin(request.user)) {
      throw new Error('Not admin');
    }

    let query = new Parse.Query(User)
    user = await query.get(judgeId);
  } else {
    user = request.user;
  }

  return getProjectVotes(user, projectId, categoryId);
}

async function onGetVotingData(request) {
  let { expand } = request.params; // expand projects and categories
  let judge = request.user;
  let userCategoryIds = await getCategoryIdsOfJudge(judge);
  let projectsQueue = await getVoteQueue(judge);

  
  let numPending = 0;
  let progress = {};
  let projectData = {};
  let categoryData = {};

  for (projectId of projectsQueue) {

    /* Get project data and reduce categories to only ids of judge categories */

    let project = await getProject(projectId);
    project = project.toJSON();
    project.categories = project.categories.reduce((aggr, category) => {

      let id = category.objectId;
      if (userCategoryIds.includes(id)) {
        aggr.push(id);
      }

      return aggr;
    }, [])
    projectData[projectId] = project;


    /* Get category data and get voting progress */

    progress[projectId] = {
      isComplete: undefined,
      isCategoryComplete: {},
    }

    let categoryIds = project.categories;
    let categoriesPending = 0;
    for (categoryId of categoryIds) {
      
      // Category Data
      if (expand && !categoryData[categoryId]) {
        let category = await getCategory(categoryId);
        category = category.toJSON();
        categoryData[categoryId] = category;
      }

      // Category progress
      let vote = await getProjectVotes(judge, projectId, categoryId);
      let categoryComplete = (vote !== null);
      progress[projectId].isCategoryComplete[categoryId] = categoryComplete;
      if (!categoryComplete) {
        categoriesPending++; 
      }

    }
    
    // Project progress
    let projectComplete = (0 === categoriesPending);
    if (!projectComplete) {
      numPending++;
    }
    progress[projectId].isComplete = projectComplete;

  }

  let resp = {
    queue: projectsQueue,
    numPending,
    progress: progress,
  }

  if (expand) {
    resp.projects = projectData;
    resp.categories = categoryData;
  }

  return resp;
}

async function onGetJudgesPick(request) {
  const { judgeId, categoryId } = request.params;
  let judge;
  if (judgeId) {
    if (!await UserHandler.isAdmin(request.user)) {
      throw new Error('Not admin');
    }

    let query = new Parse.Query(User)
    judge = await query.get(judgeId);
  } else {
    judge = request.user;
  }

  return getJudgesPick(judge, categoryId);
}

async function getJudgesPick(judge, categoryId) {
  const voteQuery = new Parse.Query(Vote);
  voteQuery.equalTo('judge', judge);
  let ptr = new Category();
  ptr.id = categoryId;
  voteQuery.equalTo('category', ptr);
  voteQuery.equalTo('isJudgesPick', true);
  voteQuery.limit(1000);
  
  let queryResults = await voteQuery.find();
  if (queryResults.length == 0) {
    return null;
  }

  return queryResults[0];
}

async function getProjectVotes(user, projectObjId, categoryId) {
  return new Parse.Query(Project)
    .get(projectObjId, useMasterKey)
    .then(retrieved => {
      let project = retrieved;
      const voteQuery = new Parse.Query(Vote);
      voteQuery.equalTo('project', project);
      voteQuery.equalTo('judge', user);
      let ptr = new Category();
      ptr.id = categoryId;
      voteQuery.equalTo('category', ptr);
      voteQuery.limit(1000);

      return voteQuery.find(useMasterKey);
    }).then(oldVotes => {
      
      if (oldVotes.length == 0) {
        return null;
      }
      
      return oldVotes[0].toJSON();
    }).catch(err => {
      console.log(err);
    });
}

async function onCreateVoteQueue(request) {
  const user = request.user;
  return createVoteQueue(user);
};

async function createVoteQueue(user) {
  const queryExisting = new Parse.Query(Queue);
  queryExisting.equalTo('user', user);
  queryExisting.limit(1000);
  const existing = await queryExisting.find(useMasterKey);

  let queueItems;

  return getCategoryIdsOfJudge(user)
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
      queueItems = projects.map((project) => project.id);
      queue.set('user', user);
      queue.set('items', queueItems);
      return queue.save(null, useMasterKey);
    }).then(() => {
      return queueItems;
    }).catch(err => console.log(err));
}

/*
 * Projects
 */ 

async function onGetVoteQueue(request) {
  const { user } = request.params;
  return getVoteQueue(user);
}

async function getVoteQueue(user) {
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

async function onGetProjects(request) {
  const { projectIds } = request.params;
  let projects = {};
  for (id of projectIds) {
    let obj = await getProject(id);
    projects[id] = obj.toJSON();
  }

  return projects;
}

async function getAllProjects(request) {
  if (!await UserHandler.isAdmin(request.user)) {
    throw new Error('Not admin');
  }

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

async function onGetProject(request) {
  return getProject(request.params.projectId);
}

async function getProject(projectId) {
  let query = new Parse.Query(Project);
  let ret = query.get(projectId);

  return ret;
}

/**
 * Get the categories of a project
 * @param {string} projectId objectId of project
 */
async function getCategoriesOfProject(projectId) {
  let query = new Parse.Query(Project);
  let ret = query.get(projectId)
    .then(project => {
      return project.get('categories');
    })

  return ret;
}

async function getCategoryIdsOfProject(projectId) {
  return getCategoriesOfProject(projectId)
    .then((categories) => {
      return categories.map((category) => category.id);
    });
}

async function onGetCategoriesOfJudge(request) {
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

  return getCategoryIdsOfJudge(judge);
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
      return categories;
    })

  return ret;
}

async function getCategoryIdsOfJudge(judge) {
  return getCategoriesOfJudge(judge)
    .then((categories) => categories.map((category) => category.id))
}

async function getAllCategories(request) {
  if (!await UserHandler.isAdmin(request.user)) {
    throw new Error('Not admin');
  }

  const { toJSON } = request.params;

  let query = new Parse.Query(Category);
  query.limit(1000);

  if (toJSON) {
    return query.find(useMasterKey)
      .then((res) => res.map((obj) => obj.toJSON()));
  }

  return query.find(useMasterKey);
}

async function onGetCategory(request) {
  const { categoryId } = request.params;
  return getCategory(categoryId)
    .then((cat) => cat.toJSON());
}

function getCategory(categoryId) {
  let query = new Parse.Query(Category);
  return query.get(categoryId, useMasterKey);
}

async function getCategoryByName(name, createIfNotExists) {
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