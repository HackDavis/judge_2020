import React, { useEffect, useState } from 'react'
import propTypes from 'prop-types'
import RubricRow from '../RubricRow'
import './IncrementalInput.css'

const IncrementalInput = function ({
  criterion,
  scoreIn,
  onInputEvent,
  hasNext,
}) {
  const [score, setScore] = useState(scoreIn);
  const incremental = delta => onInputEvent('incremental', {criterion, delta});
  const handleScoreChange = event => onInputEvent('scoreChange', {criterion, value: event.target.value});
  const handleBlur = () => onInputEvent('blur', {criterion});
  const handleFocus = () => onInputEvent('focus', {criterion});

  useEffect(() => {
    setScore(scoreIn);
  }, [scoreIn])

  return (
    <RubricRow
      hasNext={hasNext}
      TitleElement={
        <React.Fragment>
          <div className="rubric-item-name">{criterion.name}</div>
          <div className="rubric-item-desc">{criterion.maxScore} points max</div>
        </React.Fragment>
      }
      InputElement={
        <React.Fragment>
          <a href className="increment-input-button is-grey" onClick={() =>  incremental(-1)}>
            &#65293;
          </a>
          <input
            className="__incrementalinput"
            type="text" 
            onChange={ handleScoreChange }
            onFocus={ handleFocus }
            onBlur = { handleBlur }
            value={ score }
          ></input>
          <a href className="increment-input-button is-primary" onClick={() => incremental(1)}>
            &#65291;
          </a>
        </React.Fragment>
      }
    />
  )
}

IncrementalInput.propTypes = {
  criterion: propTypes.object.isRequired,
  scoreIn: propTypes.number.isRequired,
  onInputEvent: propTypes.func.isRequired,
  hasNext: propTypes.bool,
}

export default IncrementalInput;