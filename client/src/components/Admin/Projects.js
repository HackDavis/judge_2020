import React from 'react';
import api from 'ParseApi'

export default class Projects extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedFilename: 'No file selected ):'
    }
    this.handleFileSelect = this.handleFileSelect.bind(this);
    this.handleUpload = this.handleUpload.bind(this);
  }

  handleFileSelect(event) {
    let files = event.target.files;
    this.selectedFile = files[0];
    this.setState({selectedFilename: files[0].name})
  }

  handleUpload() {
    let reader = new FileReader();
    reader.readAsText(this.selectedFile, "UTF-8");
    reader.onload = function(event) {
      let fileContents = event.target.result;
      api.uploadProjects(encodeURIComponent(fileContents))
        .then(res => {
          alert(res);
        }).catch((err) => {
          console.error(err);
          alert(`Error: Failed to upload projects`);
        })
    };

    reader.onerror = function(event) {
    };
  }

  render() {
    return (
      <React.Fragment>
        <div className="field file has-name">
          <label className="file-label">
            <input className="file-input" type="file" name="projects" onChange={this.handleFileSelect}/>
            <span className="file-cta">
              <span className="file-icon">
                <i className="fas fa-upload"></i>
              </span>
              <span className="file-label">
                Choose a file…
              </span>
            </span>
            <span className="file-name">
              { this.state.selectedFilename }
            </span>
          </label>
        </div>
        <div className="field">
          <button onClick={this.handleUpload} className="button is-primary">Upload</button>
        </div>
      </React.Fragment>
    )
  }
}