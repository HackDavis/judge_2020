import React from 'react';
import { Redirect } from 'react-router-dom';

import Parse from 'parse';

import Header from '../common/Header';
import LoginInput from './LoginInput';

export default class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      redirectTo: undefined,
    }

    this.handlePasswordChange = this.handlePasswordChange.bind(this);
    this.handleUsernameChange = this.handleUsernameChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    if(Parse.User.current()) {
      Parse.Cloud.run('isAdmin')
        .then(isAdmin => {
          console.log(isAdmin);
          this.setState({
            redirectTo: (isAdmin === true) ? '/admin' : '/judge'
          });
        });
    }
  }

  handleSubmit(event) {
    Parse.User.logIn(this.state.username, this.state.password)
      .catch(err => console.log(`Login error: ${err}`))
      .then(() => Parse.Cloud.run('isAdmin'))
      .then(isAdmin => {
        this.setState({
          redirectTo: (isAdmin === true) ? '/admin' : '/judge'
        });
        console.log('redirect' + isAdmin);
      });
    event.preventDefault();
  }

  handleUsernameChange(event) {
    this.setState({ username: event.target.value });
  }

  handlePasswordChange(event) {
    this.setState({ password: event.target.value });
  }

  render() {
    if(this.state.redirectTo) {
      return <Redirect to={this.state.redirectTo}/>
    }

    return (
      <React.Fragment>
        <Header />
        <div className="main-container">
          <LoginInput 
            handleUsernameChange={this.handleUsernameChange}
            handlePasswordChange={this.handlePasswordChange}
            handleSubmit={this.handleSubmit}
          />
        </div>
      </React.Fragment>
    );
  }
}
