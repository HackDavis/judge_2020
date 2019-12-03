const axios = require('axios');

module.exports = async () => {
  Parse.initialize(process.env.APP_ID, undefined, process.env.MASTER_KEY);
  Parse.serverURL = process.env.PARSE_SERVER_URL;

  createAdminUser()
    .then(
      (adminUser) => {
        console.log('Created admin user');

        return createAdminRole(adminUser);
      },
      err => console.log(`Creating admin failed. Error: ${err}`)
    ).then(
      (adminRole) => {
        console.log('Created admin role');

        return createJudgeRole(adminRole);
      },
      err => console.log(`Creating admin role failed. Error: ${err}`)
    ).then(
      () => {
        console.log('Created judge role');
        const ProjectSchema = new Parse.Schema('Project');

        return ProjectSchema.save();
      },
      err => console.log(`Creating judge role failed. Error: ${err}`)
    ).then(
      () => {
        console.log("Created schema Project");
        const VoteSchema = new Parse.Schema('Vote');

        return VoteSchema.save();
      },
      err => console.log("Couldn't create project schema", err)
    )
    .then(
      () => {
        console.log("Created schema Vote");

        return setProjectClp();
      },
      err => console.log("Couldn't create vote schema", err)
    )
    .then(
      res => console.log('Project class permissions set. '+res),
      err => console.log("Couldn't set class permissions for porject", err)
    );
}

const createAdminUser = async () => {
  let adminUser = new Parse.User();
  adminUser.set("username", process.env.ADMIN_USERNAME);
  adminUser.set("password", process.env.ADMIN_PWD);
  adminUser.set("display_name", process.env.ADMIN_DISPLAY_NAME); // Creates new column

  return adminUser.signUp();
}

const createAdminRole = async (adminUser) => {
  console.log('Created admin account');
  let adminRoleAcl = new Parse.ACL();
  let adminRole = new Parse.Role('Admin', adminRoleAcl);
  adminRole.getUsers().add(adminUser);

  return adminRole.save(undefined, {useMasterKey: true});
}

const createJudgeRole = async (adminRole) => {
  let judgeRoleAcl = new Parse.ACL();
  let judgeRole = new Parse.Role('Judge', judgeRoleAcl);
  judgeRole.getRoles().add(adminRole);

  return judgeRole.save(undefined, {useMasterKey: true});
};

const setProjectClp = async () => {
  const classLevelPermissions = {
    "find": {
      "requiresAuthentication": true,
      "role:Judge": true
    },
    "get": {
      "requiresAuthentication": true,
      "role:Admin": true
    },
    "create": { "role:Admin": true },
    "update": { "role:Admin": true },
    "delete": { "role:Admin": true },
  }
  const headers = {
    'X-Parse-Application-Id': process.env.APP_ID,
    'X-Parse-Master-Key': process.env.MASTER_KEY
  }

  return axios.put(
    process.env.PARSE_SERVER_URL+'/schemas/Project', 
    { classLevelPermissions },
    { headers }
  )
}