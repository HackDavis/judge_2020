import React from 'react';
import Parse from 'parse';
import { Redirect } from 'react-router-dom';

import Header from '../common/Header';

export default function UserHoc (WrappedComponent, checkAdmin = false) {
  return class extends React.Component {
    state = {
      redirectTo: undefined,
    }
  
    componentDidMount() {
      if (!Parse.User.current()) {
        this.setState({ redirectTo: '/login' });
        return;
      }

      if (checkAdmin === true) {
        Parse.Cloud.run('isAdmin')
        .then(isAdmin => {
          if (isAdmin === false) {
            this.setState({ redirectTo: '/judge' });
            return;
          }
        })
      }
    }

    getCurrentUser() {
      const currentUser = Parse.User.current();
      if (currentUser) {
        return currentUser;
      } else {
        this.setState({ redirectTo: '/login' });
        return null;
      }
    }

    render() {
      if (this.state.redirectTo) {
        console.log('not authorized');
        return <Redirect to={ this.state.redirectTo }/>;
      }

      return (
        <React.Fragment>
          <Header includeLogout={true}></Header>
          <WrappedComponent
            {...this.props}
            getCurrentUser={this.getCurrentUser}
            handleParseError={this.handleParseError}
          />
        </React.Fragment>
      )
    }
  };
}