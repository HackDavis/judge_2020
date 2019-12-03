# HackDavis Judging App

## How to setup
1. Install mongodb
2. Install Parse server dependencies
   
  - `cd [MAIN_DIR]/parse-server`
  - `npm install`

3. Install React app dependencies
   
  - `cd [MAIN_DIR]/client`
  - `npm install`

4. Create `.env` files from templates and configure in both `/parse-server` and `/client`

# How to run
1. Start mongodb
2. Start parse server and dashboard
  - `cd [MAIN_DIR]/parse-server`
  - `npm start` / `npm start initdb` (First time)
3. Start react-app
  - `cd [MAIN_DIR]/client`
  - `npm start`

# Parse Dashboard
Default: `http://localhost:8080/dashboard`

# Parse Classes
If anyone of these don't exist after running `npm start initdb`, you'll need to create it through the dashboard.
* Role
* Session
* User
* Category
* Global
* Project
* Team
* Vote