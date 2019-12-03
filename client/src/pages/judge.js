import React from 'react';
import { BrowserRouter as Router, Route } from "react-router-dom";
import UserHoc from '../components/hoc/user';
import Voting from '../components/Judge/Voting';
import WelcomeJudge from '../components/Judge/Welcome';
import ViewAll from '../components/Judge/Voting/ViewAll';

function JudgePage (props){
  return (
    <Router>
      <Route path="/judge" exact render={(props) => <WelcomeJudge {...props}/>} />
      <Route path="/judge/vote" exact render={(props) => <Voting {...props}/>} />
      <Route path="/judge/projects" render={(props) => <ViewAll {...props}/>} />
    </Router>
  )
}

export default UserHoc(JudgePage);