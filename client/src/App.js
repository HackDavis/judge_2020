import React, {useReducer} from 'react';
import { reducer, initialState, StateProvider } from 'store/app';

import { BrowserRouter as Router, Route } from "react-router-dom";
import LoginPage from './pages/login';
import JudgePage from './pages/judge';
import AdminPage from './pages/admin';
import WelcomePage from './pages/welcome';
import { DispatchProvider } from 'store/app';

export default function(props) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <StateProvider value={state}>
      <DispatchProvider value={dispatch}>
        <Router>
          <Route path="/" exact render={() => (<WelcomePage {...props}/>)} />
          <Route path="/login" render={props => (<LoginPage {...props}/>)} />
          <Route path="/judge" render={() => (<JudgePage {...props}/>)} />
          <Route path="/admin" render={() => (<AdminPage {...props}/>)} />
        </Router>
      </DispatchProvider>
    </StateProvider>
  );
}