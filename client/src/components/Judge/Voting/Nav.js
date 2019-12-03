import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

function Nav ({handleButtons, hideSkip}) {
  return (
    <div className="container short-container no-padding-bottom">
      <div className="columns is-mobile">
        <div className={'column '+ (hideSkip ? '' : 'is-half')}>
          <a href
            className="button is-fullwidth is-primary is-outlined"
            onClick={() => handleButtons('view-all')}
          >{hideSkip ? 'Back to project' : 'View all projects'}</a>
        </div>
        {!hideSkip ? (
          <div className="column is-half">
            <a href className="button is-fullwidth is-primary" onClick={() => handleButtons('next')}>Skip for now</a>
          </div>
        ) : (
          null
        )}
      </div>
    </div>
  )
}

Nav.propTypes = {
  handleNav: PropTypes.func,
  hideSkip: PropTypes.bool,
}

export default withRouter(Nav);
