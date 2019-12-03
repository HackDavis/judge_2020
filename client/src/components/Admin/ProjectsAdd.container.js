import React from 'react';
import ProjectInput from '../components/ProjectInput';
import Form from '../components/Form';

// TextAreaField.propTypes = {
//   label: PropTypes.string,
//   dataName: PropTypes.string,
//   placeholder: PropTypes.string,
//   handleInputChange: PropTypes.func
// }

export default class ProjectsAdd extends React.Component {
  constructor(props) {
    super(props);
    this.formFields = [];
    if (props.dataName == 'projects') {
      let nameField = {
        label: 'Name',
        type: 'input',
        dataName: 'name',
        placeholder: 'Great Project',
      }
      let tableField = {
        label: 'Table',
        type: 'input',
        dataName: 'table',
        placeholder: 'A1',
      }
      let descField = {
        label: 'Description',
        type: 'textarea',
        dataName: 'description',
        placeholder: 'A project that\'s really great.',
      }

      this.formFields.push(nameField);
      this.formFields.push(tableField);
      this.formFields.push(descField);
    } else {
      let nameField = {
        label: 'Name',
        type: 'input',
        dataName: 'name',
        placeholder: 'Greatest Project',
      }
      let descField = {
        label: 'Description',
        type: 'textarea',
        dataName: 'description',
        placeholder: 'Whatever project is the greatest.',
      }
      this.formFields.push(nameField);
      this.formFields.push(descField);
    }
  }

  render() {
    return (
      <React.Fragment>
        <div className="panel">
          <div className="panel-heading">
            <p className="title is-5">Add Projects</p>
          </div>
          <div className="panel-block">
            <div className="container">
              <Form fields={this.formFields}/>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}