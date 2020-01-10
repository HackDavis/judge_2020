const dotenv = require('dotenv');
const dotenvExpand = require('dotenv-expand')
dotenvExpand(dotenv.config());
const express = require('express');
const ParseServer = require('parse-server').ParseServer;
const ParseDashboard = require('parse-dashboard');

const initDb = require('./db/init.js');

const APP_NAME = 'HackDavis Judging';

const APP_ID = process.env.APP_ID;
const MASTER_KEY = process.env.MASTER_KEY;
const PARSE_PORT = process.env.PARSE_PORT;
const SERVER_URL = process.env.PARSE_SERVER_URL;
const PUBLIC_SERVER_URL = process.env.PUBLIC_PARSE_SERVER_URL;

const DO_DB_INIT = process.argv.includes('initdb');

const api = new ParseServer({
  databaseURI: process.env.MONGODB_URL, // Connection string for your MongoDB database
  // cloud: './build/cloud.bundle.js', // Absolute path to your Cloud Code
  cloud: './cloud/main.js', // Absolute path to your Cloud Code
  appId: APP_ID,
  masterKey: MASTER_KEY, 
  serverURL: SERVER_URL,
  publicServerURL: PUBLIC_SERVER_URL,
  allowClientClassCreation: true,
});

const dashboard = new ParseDashboard({
  apps: [
    {
      serverURL: SERVER_URL,
      appId: APP_ID,
      masterKey: MASTER_KEY,
      appName: APP_NAME
    }
  ]
});

const app = express();
app.use('/parse', api);
app.use('/dashboard', dashboard);

const httpServer = require('http').createServer(app);
httpServer.listen(PARSE_PORT, () => {
  console.log('Now listening on port ' + PARSE_PORT);
  if (DO_DB_INIT) {
    initDb();
  }
});