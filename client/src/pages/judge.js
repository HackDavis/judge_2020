import React from 'react';
import { BrowserRouter as Router, Route } from "react-router-dom";
import UserHoc from '../components/hoc/user';
import Voting from '../components/Judge/Voting';
import WelcomeJudge from '../components/Judge/Welcome';
import ViewAll from '../components/Judge/Voting/ViewAll';
import Complete from '../components/Judge/Complete';

function JudgePage (props){
  return (
    <Router>
      <Route path="/judge" exact render={() => <WelcomeJudge {...props}/>} />
      <Route path="/judge/vote" exact render={() => <Voting {...props}/>} />
      <Route path="/judge/projects" render={() => <ViewAll {...props}/>} />
      <Route path="/judge/complete" render={() => <Complete {...props}/>} />
    </Router>
  )
}

export default UserHoc(JudgePage);