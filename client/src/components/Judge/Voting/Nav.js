import React, {useEffect} from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

function Nav ({handleButtons, hasNext}) {
  useEffect(() => {
    console.log(hasNext)
  }, [hasNext])
  return (
    <div className="nav__dp container short-container no-padding-bottom">
      <div className="columns is-mobile">
        <div className="column is-half">
          <a href
            className="button is-fullwidth is-primary is-outlined"
            onClick={() => handleButtons('view-all')}
          >View all projects</a>
          {/* todo: toggle text of this button ^ */}
        </div>
          <div className="column is-half">
            { hasNext ? (
              <a href className="button is-fullwidth is-primary" onClick={() => handleButtons('next')}>Skip for now</a>
            ) : (
              <a href className="button is-fullwidth" disabled>No pending projects</a>
            )}
          </div>
      </div>
    </div>
  )
}

Nav.propTypes = {
  handleButtons: PropTypes.func.isRequired,
  hasNext: PropTypes.bool.isRequired,
}

export default withRouter(Nav);
