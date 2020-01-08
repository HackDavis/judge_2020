import React from 'react'
import propTypes from 'prop-types'

const VotingControls = function({toggleDesc, castVotes, showingDescription}) {
  return (
    <div className="container">
      <div className="columns">
        <div className="column">
          <div className="buttons is-hidden-tablet no-margin-bottom">
            <a href className={ 'button is-fullwidth is-primary ' + (showingDescription ? "" : 'is-outlined') }
              onClick={toggleDesc}>
              { showingDescription ? 'Vote' : 'See Description' }
            </a>

            {showingDescription ? (
              null
            ) : (
              <a href className="button is-fullwidth is-primary" 
                onClick={castVotes}
              >
                Cast Vote
              </a>
            )}
          </div>
          <div className="buttons is-hidden-mobile">
            <a href className="button is-fullwidth is-primary" 
              onClick={castVotes}
            >
              Cast Vote
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

VotingControls.propTypes = {
  handleVoteControls: propTypes.func,
  castVotes: propTypes.func,
  showingDescription: propTypes.bool,
}

export default VotingControls;