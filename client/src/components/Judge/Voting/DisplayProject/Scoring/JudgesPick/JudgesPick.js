import React from 'react'
import propTypes from 'prop-types'
import RubricRow from '../RubricRow'
import './JudgesPick.css'

const JudgesPick = function ({
  isPicked,
  onChange,
  hasNext,
}) {
  return (
    <RubricRow
      hasNext={hasNext}
      TitleElement={
        <React.Fragment>
          <div className="rubric-item-name">Judge's Pick</div>
          <div className="rubric-item-desc">
            One per category allowed.
          </div>
        </React.Fragment>
      }
      InputElement={
        <input
          className="checkbox"
          type="checkbox"
          checked={ isPicked }
          onChange={ onChange }
        />
      }
    />
  )
}

JudgesPick.propTypes = {
  isPicked: propTypes.bool.isRequired,
  onChange: propTypes.func.isRequired,
  hasNext: propTypes.bool,
}

export default JudgesPick;