import React from 'react';

import { BrowserRouter as Router, Route } from "react-router-dom";
import LoginPage from './pages/login';
import JudgePage from './pages/judge';
import AdminPage from './pages/admin';
import WelcomePage from './pages/welcome';

export default function(props) {
  return (
    
        <Router>
          <Route path="/" exact render={() => (<WelcomePage {...props}/>)} />
          <Route path="/login" render={() => (<LoginPage {...props}/>)} />
          <Route path="/judge" render={() => (<JudgePage {...props}/>)} />
          <Route path="/admin" render={() => (<AdminPage {...props}/>)} />
        </Router>
      
  );
}