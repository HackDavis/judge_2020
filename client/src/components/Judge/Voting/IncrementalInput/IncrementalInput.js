import React from 'react'
import propTypes from 'prop-types'
import './IncrementalInput.css'

const IncrementalInput = function ({
  category,
  score,
  handleVoteControls,
  hasNext,
}) {
  const incremental = delta => handleVoteControls('incremental', {category, delta});
  const handleScoreChange = event => handleVoteControls('scoreChange', {category, value: event.target.value});
  const handleBlur = () => handleVoteControls('focus', {category});
  const handleFocus = () => handleVoteControls('blur', {category});

  return (
    <div className={"vote-row" + (hasNext ? ' vote-row-border' : '')}>
      <div className="vote-row-title">
        {category}
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
  category: propTypes.string.isRequired,
  score: propTypes.number.isRequired,
  handleVoteControls: propTypes.func.isRequired,
  hasNext: propTypes.bool,
}

export default IncrementalInput;