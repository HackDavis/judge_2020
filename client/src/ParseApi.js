import Parse from 'parse';

export default class ParseApi {
  static isAdmin() {
    return Parse.Cloud.run('isAdmin');
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

  static getCompletionStatus(allProjects, projects, judgeId) {
    return Parse.Cloud.run('getCompletionStatus', { allProjects, projects, judgeId });
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

  static async getGeneralCriteria() {
    return Parse.Cloud.run('getGeneralCriteria');
  }

  static async addGeneralCriteria(name, accessor, description, order, maxScore) {
    return Parse.Cloud.run('addGeneralCriteria', {name, accessor, description, order, maxScore});
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

  static async getAllCategories() {
    return Parse.Cloud.run('getAllCategories');
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
    return Parse.Cloud.run('setCategoriesOfJudge', {judgeId, categories}); // todo: implement
  }

  static async getCategory(categoryId) {
    return Parse.Cloud.run('getCategory', { categoryId }); // todo: implement
  }

  static async getCategoryCriteria(categoryId) {
    return Parse.Cloud.run('getCategoryCriteria', { categoryId }); // todo: implement
  }
}