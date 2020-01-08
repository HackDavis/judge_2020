import React from 'react';

import propTypes from 'prop-types';
import IncrementalInput from './IncrementalInput';

const ProjectScores = function({criteria, scores, handleVoteControls}) { 
  if (!scores) {
    return null;
  }

  return (
    <div className="container" style={{ paddingTop: '3vh', paddingBottom: '3vh', textAlign: 'center'}}>
      { criteria.map((criterion, index) => {
        return (
          <IncrementalInput
            key={criterion.accessor}
            criterion={criterion}
            score={scores[criterion.accessor]}
            handleVoteControls={handleVoteControls}
            hasNext={ !(index === (criteria.length - 1))}
          />
        )
      })}
    </div>
  )
}

ProjectScores.propTypes = {
  criteria: propTypes.array.isRequired,
  scores: propTypes.object.isRequired,
  handleVoteControls: propTypes.func.isRequired,
}

export default ProjectScores;