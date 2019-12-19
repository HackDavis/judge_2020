import Parse from 'parse';

export default class ParseApi {
  static getAllProjects() {
    return Parse.Cloud.run('getAllProjects');
  }

  static getProject(projectId) {
    return Parse.Cloud.run('getProject', {projectId});
  }

  static getVotes(projectId) {
    return Parse.Cloud.run('getVotes', {projectId});
  }

  static getVoteQueue() {
    return Parse.Cloud.run('getVoteQueue');
  }

  static createVoteQueue() {
    // TODO: run this only when opening voting system; move to admin side
    return Parse.Cloud.run('createVoteQueue');
  }

  static syncVotes(projectId, scores, cast) {
    const time = Date.now();
    const projectObjId = projectId;
    const toSync = Object.keys(scores)
      .map(category => {
        return {
          category,
          score: scores[category],
        }
      })
    return Parse.Cloud.run('saveVotes', {scores: toSync, cast, projectObjId, time});
  }

  static async updateQueueStatus(projects) {
    const votes = await ParseApi.getVotes();
    votes.forEach((vote) => {
      let projectId = vote.project.id;
      projects[projectId].done = true;
    });

    return projects;
  }
}