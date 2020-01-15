import React, { useEffect } from 'react'
import propTypes from 'prop-types'
import './RubricRow.css'

const RubricRow = function ({
  TitleElement,
  InputElement,
  hasNext,
}) {
  return (
    // <div className={"vote-row" + (hasNext ? ' vote-row-border' : '')}>
    <React.Fragment>
      <div className="vote-row-title">
        {TitleElement}
      </div>
      <div className="vote-input">
        {InputElement}
      </div>
    </React.Fragment>
    // </div>
  );
}

RubricRow.propTypes = {
  TitleElement: propTypes.element,
  InputElement: propTypes.element,
  hasNext: propTypes.bool,
}

export default RubricRow;