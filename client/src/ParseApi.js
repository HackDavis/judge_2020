import Parse from 'parse';

export default class ParseApi {
  static isAdmin() {
    return Parse.Cloud.run('isAdmin');
  }

  /**
   * 
   * @param {boolean} expand Expand project and category data
   */
  static getVotingData(expand) {
    return Parse.Cloud.run('getVotingData', { expand });
  }
  static getAllProjects() {
    return Parse.Cloud.run('getAllProjects');
  }

  static getProjects(projectIds) {
    return Parse.Cloud.run('getProjects', {projectIds});
  }

  static getProject(projectId) {
    return Parse.Cloud.run('getProject', {projectId});
  }

  static getVotes(projectId, categoryId) {
    return Parse.Cloud.run('getVotes', { projectId, categoryId });
  }

  static hasVoteCasted(projectId, categoryId, judgeId) {
    return Parse.Cloud.run('getVotes', { projectId, categoryId, judgeId });
  }

  static getVoteQueue() {
    return Parse.Cloud.run('getVoteQueue');
  }

  static createVoteQueue() {
    // TODO: run this only when opening voting system; move to admin side
    return Parse.Cloud.run('createVoteQueue');
  }

  static castVotes(projectId, categoryId, scores, isJudgesPick) {
    console.log(isJudgesPick)
    const time = Date.now();
    const projectObjId = projectId;
    const toSync = Object.keys(scores)
      .map(category => {
        return {
          category,
          score: scores[category],
        }
      })
    return Parse.Cloud.run('saveVotes', {scores: toSync, isJudgesPick, projectObjId, categoryId, time});
  }

  static async updateCompletionStatus(projects) {
    let doneCount = 0;
    const votes = await ParseApi.getCompletionStatus(true);

    for (let [id, isComplete] of Object.entries(votes.projectCompletions)) {
      projects[id].done = isComplete;
      if (isComplete) {
        doneCount++;
      }
    }

    return { projects, count: doneCount };
  }

  /**
   * 
   * @param {string} categoryId Leave undefined for general criteria
   */
  static async getCriteria(categoryId) {
    return Parse.Cloud.run('getCriteria', {categoryId});
  }

  /**
   * 
   * @param {*} name Display name
   * @param {string} accessor ID that is unique amongst all criteria
   * @param {string} description 
   * @param {number} order 
   * @param {number} maxScore 
   * @param {string} categoryId Leave blank for general criteria
   */
  static async createCriterion(name, accessor, description, order, maxScore, categoryId) {
    return Parse.Cloud.run('createCriterion', {name, accessor, description, order, maxScore, categoryId});
  }

  static async deleteCriteria(objectId) {
    return Parse.Cloud.run('deleteCriteria', {objectId});
  }

  static async updateCriteria(objectId, update) {
    return Parse.Cloud.run('updateCriteria', {objectId, update});
  }

  static async getAllUsers() {
    return Parse.Cloud.run('getAllUsers');
  }

  /**
   * @param {string} userId objectId of user to update
   * @param {Object<string, string>} update Data to update. 
   *    Example keys: 'username', 'display_name', 'password', 'email'
   */
  static async updateUser(userId, updateData) {
    return Parse.Cloud.run('updateUser', {userId, updateData}); // todo: implement
  }

  /**
   * 
   * @param {boolean} toJSON Convert to JSON before retrieval
   */
  static async getAllCategories(toJSON) {
    return Parse.Cloud.run('getAllCategories', { toJSON });
  }

  /**
   * Get the categories that a judge is selected to vote in
   * @param {string} judgeId objectId of judge. 
   *    If left undefined, it will get the categories of the current user
   */
  static async getCategoriesOfJudge(judgeId) {
    return Parse.Cloud.run('getCategoriesOfJudge', {judgeId});
  }

  /**
   * Set and overwrite categories that judge will be voting in
   * @param {string} userId objectId of user to update
   * @param {Array<string>} categories Array of category objectIds strings
   */
  static async setCategoriesOfJudge(judgeId, categories) {
    return Parse.Cloud.run('setCategoriesOfJudge', {judgeId, categories});
  }

  static async getCategory(categoryId) {
    return Parse.Cloud.run('getCategory', { categoryId });
  }

  static async getCategoryCriteria(categoryId) {
    return Parse.Cloud.run('getCategoryCriteria', { categoryId }); // todo: implement
  }
}