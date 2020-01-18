const dotenv = require('dotenv');
const dotenvExpand = require('dotenv-expand')
dotenvExpand(dotenv.config());
const express = require('express');
const { default: ParseServer, ParseGraphQLServer } = require('parse-server');
const ParseDashboard = require('parse-dashboard');

const APP_NAME = 'HackDavis Judging';

const APP_ID = process.env.APP_ID;
const MASTER_KEY = process.env.MASTER_KEY;
const PARSE_PORT = process.env.PARSE_PORT;
const SERVER_URL = process.env.PARSE_SERVER_URL;
const PUBLIC_SERVER_URL = process.env.PUBLIC_PARSE_SERVER_URL;

const parseServer = new ParseServer({
  databaseURI: process.env.MONGODB_URL, // Connection string for your MongoDB database
  cloud: './cloud/main.js', // Absolute path to your Cloud Code
  appId: APP_ID,
  masterKey: MASTER_KEY, 
  serverURL: SERVER_URL,
  publicServerURL: PUBLIC_SERVER_URL,
  allowClientClassCreation: false,
});

// Create the GraphQL Server Instance
const parseGraphQLServer = new ParseGraphQLServer(
  parseServer,
  {
    graphQLPath: '/graphql',
    playgroundPath: '/playground'
  }
);

const dashboard = new ParseDashboard({
  apps: [
    {
      serverURL: PUBLIC_SERVER_URL,
      appId: APP_ID,
      masterKey: MASTER_KEY,
      appName: APP_NAME,
      graphQLServerURL: "http://localhost:8080/graphql"
    }
  ]
});

const app = express();
app.use('/parse', parseServer.app);
// Mounts the GraphQL API using graphQLPath: '/graphql'
parseGraphQLServer.applyGraphQL(app);
// (Optional) Mounts the GraphQL Playground - do NOT use in Production
// parseGraphQLServer.applyPlayground(app);
app.use('/dashboard', dashboard);

const httpServer = require('http').createServer(app);
httpServer.listen(PARSE_PORT, () => {
  console.log('Now listening on port ' + PARSE_PORT);
});