import React, { useEffect } from 'react'
import propTypes from 'prop-types'
import './RubricRow.css'

const RubricRow = function ({
  TitleElement,
  InputElement,
  hasNext,
}) {
  return (
    <React.Fragment>
      <div className="vote-row-title">
        {TitleElement}
      </div>
      <div className="vote-input">
        {InputElement}
      </div>
    </React.Fragment>
  );
}

RubricRow.propTypes = {
  TitleElement: propTypes.element,
  InputElement: propTypes.element,
}

export default RubricRow;