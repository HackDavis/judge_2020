import React from 'react';
import PropTypes from 'prop-types';

const TextAreaField = (props) => {
  return (
    <div className="field">
      <div className="label">
        <label>{props.label}</label>
      </div>
      <div className="control">
        <textarea className="textarea" name={props.dataName} placeholder={props.placeholder} onChange={props.handleInputChange}></textarea>
      </div>
    </div>
  );
}

TextAreaField.propTypes = {
  label: PropTypes.string,
  dataName: PropTypes.string,
  placeholder: PropTypes.string,
  handleInputChange: PropTypes.func
}

export default TextAreaField;