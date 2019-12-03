import React from 'react';

export default class LoginForm extends React.Component {
  handleSubmit(event) {
    Parse.User.logIn(this.state.username, this.state.password)
      .catch(err => console.log(`Login error: ${err}`))
      .then(user => this.checkUserAdmin(user))
      .then(isAdmin => {
        this.setState({
          redirectTo: (isAdmin === true) ? '/admin' : '/judge'
        });
      });
    event.preventDefault();
  }

  handleUsernameChange(event) {
    this.setState({ username: event.target.value });
  }

  handlePasswordChange(event) {
    this.setState({ password: event.target.value });
  }
}