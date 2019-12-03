import React from 'react';

import propTypes from 'prop-types';
import IncrementalInput from './IncrementalInput';

const ProjectScores = function({categories, scores, handleVoteControls}) { 
  if (!scores) {
    return null;
  }

  return (
    <div className="container" style={{ paddingTop: '3vh', paddingBottom: '3vh', textAlign: 'center'}}>
      { categories.map((category, index) => {
        return (
          <IncrementalInput
            key={category}
            category={category}
            score={scores[category] || 5}
            handleVoteControls={handleVoteControls}
            hasNext={ !(index === (categories.length - 1))}
          />
        )
      })}
    </div>
  )
}

ProjectScores.propTypes = {
  categories: propTypes.array.isRequired,
  scores: propTypes.object.isRequired,
  handleVoteControls: propTypes.func.isRequired,
}

export default ProjectScores;