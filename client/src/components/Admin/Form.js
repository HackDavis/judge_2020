import React from 'react';
import PropTypes from 'prop-types';
import TextAreaField from './TextAreaField';
import InputField from './InputField';

const Form = (props) => {
  return (
    <form id="category-add-form" onSubmit={props.handleSubmit}>
      {props.fields.map(field => {
        if (field.type == "textarea") {
          return <TextAreaField key={field.dataName} {...field}/>
        } else if (field.type == "input") {
          return <InputField key={field.dataName} {...field}/>
        }
      })}
    </form>
  );
}

Form.propTypes = {
  fields: PropTypes.arrayOf(PropTypes.object)
}

export default Form;