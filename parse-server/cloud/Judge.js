const {useMasterKey, User, Project, Category, Vote, Queue, JudgingCriteria, JudgeToCategory} = require('./common');

module.exports = class Judge {
  static async onSetCategoriesOfJudge(request) {
    let {judgeId, categories} = request.params;
    
    let userQuery = new Parse.Query(User);
    let user = await userQuery.get(judgeId, useMasterKey);

    let query = new Parse.Query(JudgeToCategory);
    query.equalTo('judge', user);

    let queryResults = await query.find();
    let judgeToCategory;

    if (queryResults.length > 0) {
      judgeToCategory = queryResults[0];
    } else {
      judgeToCategory = new JudgeToCategory();
      judgeToCategory.set('judge', user);
    }

    var pointers = categories.map((categoryId) => {
      var pointer = new Category();
      pointer.id = categoryId;
      return pointer;
    });
    judgeToCategory.set('categories', pointers);
    
    return judgeToCategory.save(null, useMasterKey);
  }
}