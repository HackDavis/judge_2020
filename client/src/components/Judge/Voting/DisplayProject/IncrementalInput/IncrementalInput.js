import React, { useEffect } from 'react'
import propTypes from 'prop-types'
import './IncrementalInput.css'

const IncrementalInput = function ({
  criterion,
  score,
  handleVoteControls,
  hasNext,
}) {
  useEffect(() => {
    console.log('updated', score)
  }, [score])

  const incremental = delta => handleVoteControls('incremental', {criterion, delta});
  const handleScoreChange = event => handleVoteControls('scoreChange', {criterion, value: event.target.value});
  const handleBlur = () => handleVoteControls('blur', {criterion});
  const handleFocus = () => handleVoteControls('focus', {criterion});

  return (
    <div className={"vote-row" + (hasNext ? ' vote-row-border' : '')}>
      <div className="vote-row-title">
        <div className="criteria-name">{criterion.name}</div>
        <div className="max-points">{criterion.maxScore} points max</div>
      </div>
      <div className="increment-input">
        <a href className="increment-input-button is-grey" onClick={() =>  incremental(-1)}>
          &#65293;
        </a>
        <input
          type="text" 
          onChange={ handleScoreChange }
          onFocus={ handleFocus }
          onBlur = { handleBlur }
          value={ score }
        />
        <a href className="increment-input-button is-primary" onClick={() => incremental(1)}>
          &#65291;
        </a>
      </div>
    </div>
  );
}

IncrementalInput.propTypes = {
  criterion: propTypes.object.isRequired,
  score: propTypes.number.isRequired,
  handleVoteControls: propTypes.func.isRequired,
  hasNext: propTypes.bool,
}

export default IncrementalInput;