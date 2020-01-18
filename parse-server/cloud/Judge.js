const {useMasterKey, User, Project, Category, Vote, Queue, JudgingCriteria, JudgeToCategory} = require('./common');

module.exports = class Judge {
  static async onSetCategoriesOfJudge(request) {
    let {judgeId, categories} = request.params;
    
    let userQuery = new Parse.Query(User);
    let user = await userQuery.get(judgeId, useMasterKey);

    var pointers = categories.map((categoryId) => {
      var pointer = new Category();
      pointer.id = categoryId;
      return pointer;
    });
    user.set('categories', pointers);
    return user.save(null, useMasterKey);
  }
}