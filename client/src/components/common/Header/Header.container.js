import React from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';
import Parse from 'parse';

import Header from './Header';

class HeaderContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      redirect: false
    }
  }

  handleLogout = () => {
    Parse.User.logOut().then(
      () => this.setState({ redirect: true }),
      err => console.log('logout err '+err)
    );
    
  }

  render() {
    if(this.state.redirect) {
      return <Redirect to="/login" />
    }

    return (
      <React.Fragment>
        <Header 
          includeLogout={this.props.includeLogout} 
          handleLogout={this.handleLogout}
        />
      </React.Fragment>
    );
  }
}

HeaderContainer.defaultProps = {
  includeLogout: false
}

HeaderContainer.propTypes = {
  incudeLogout: PropTypes.bool
}

export default HeaderContainer;