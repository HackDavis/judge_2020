import React, {useEffect} from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

function Nav ({onVotingEvent, hasNext}) {
  
  return (
    <div className="nav__dp">
      <div className="columns is-mobile">
        <div className="column is-half">
          <a href
            className="button is-fullwidth is-primary is-outlined"
            onClick={() => onVotingEvent('view-all')}
          >View all projects</a>
        </div>
          <div className="column is-half">
            { hasNext ? (
              <a href className="button is-fullwidth is-primary" onClick={() => onVotingEvent('next')}>Skip for now</a>
            ) : (
              <a href className="button is-fullwidth" disabled>No pending projects</a>
            )}
          </div>
      </div>
    </div>
  )
}

Nav.propTypes = {
  onVotingEvent: PropTypes.func.isRequired,
  hasNext: PropTypes.bool.isRequired,
}

export default withRouter(Nav);
