const {useMasterKey} = require('./common');

module.exports = class User {

  static async onIsAdmin(request) {
    return isAdmin(request.user);
  }

  static async isAdmin(user) {
    let adminRoleQuery = new Parse.Query('_Role');
    adminRoleQuery.equalTo('name', 'Admin');
    adminRoleQuery.equalTo('users', user);
    const result =  await adminRoleQuery.first(useMasterKey);
    
    return !!result;
  }
}