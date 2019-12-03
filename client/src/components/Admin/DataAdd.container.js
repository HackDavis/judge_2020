import React from 'react';
import Parse from 'parse';
import CategoryInput from '../components/Form';

export default class DataAdd extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentInput: {}
    };
  }

  handleSubmit = (event) => {
    console.log(this.state.currentInput);
    let Project = Parse.Object.extend('Project');
    let newProject = new Project();
    newProject.save(this.state.currentInput)
      .then(project => console.log('saved', project))
      .catch(err => console.log('nope', err));
    event.preventDefault();
  }
  
  handleInputChange = (event) => {
    let col = event.target.name;
    let val = event.target.value 
    // TODO: previous state
    this.setState(state => {
      let newInput = state.currentInput;
      newInput[col] = val;
      return { currentInput: newInput };
    });
  }

  render() {
    return (
      <React.Fragment>
        <p className="title is-5">Add Categories</p>
        <CategoryInput
          {...this.props}
          handleInputChange={this.handleInputChange}
          handleSubmit={this.handleSubmit}
        />
      </React.Fragment>
    );
  }
}