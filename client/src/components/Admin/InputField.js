import React from 'react';
import PropTypes from 'prop-types';

const InputField = (props) => {
  return (
    <div className="field">
      <div className="label">
        <label>{props.label}</label>
      </div>
      <div className="control">
        <input className="input" type="text" name={props.dataName} placeholder={props.placeholder} onChange={props.handleInputChange}></input>
      </div>
    </div>
  )
}

InputField.propTypes = {
  label: PropTypes.string,
  dataName: PropTypes.string,
  placeholder: PropTypes.string,
  handleInputChange: PropTypes.func
}

export default InputField;