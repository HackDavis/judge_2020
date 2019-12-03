import React from 'react';
import { Redirect } from "react-router-dom";
import Parse from 'parse';

export default class WelcomePage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loggedIn: (Parse.User.current() !== undefined)
    }
  }

  // Maybe implement a Welcome page before sending to login/judge
  render() {
    if (this.state.loggedIn) {
      return (
        <Redirect to="/judge"/>
      );
    }

    return (
      <Redirect to="/login"/>
    );
  }
}