import React, {useState, useEffect} from 'react'
import api from '../../ParseApi'
import * as Styles from './Styles'

import CategoryDropdown from './CategoryDropdown'

export default class Assignments extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedFilename: 'No file selected ):',
      selectedCategory: null,
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
      api.run('importAssignCsv', {csv: encodeURIComponent(fileContents)})
        .then(url => {
          alert(url);
        }).catch((err) => {
          console.error(err);
          alert(`Error: Failed to upload assignments`);
        })
    };

    reader.onerror = function(event) {
    };
  }

  exportJudges = () => {
    return api.run('createJudgesCsv', {categoryId: this.state.selectedCategory})
      .then((url) => {
        window.open(url, '_blank');
      })
      .catch((err) => {
        alert(err)
      })
  }

  exportAssign = () => {
    return api.run('createAssignCsv', {categoryId: this.state.selectedCategory})
      .then((url) => {
        window.open(url, '_blank');
      })
      .catch((err) => {
        alert(err)
      })
  }

  onSelect = (categoryId) => {
    this.setState({selectedCategory: categoryId})
  }

  render() {
    return (
      <Styles.Container>

        <Styles.MarginVertical>
          <CategoryDropdown
            key="assignments"
            onSelect={this.onSelect}
            selected={this.state.selectedCategory}
            defaultText="Select..."
          />
        </Styles.MarginVertical>

        {this.state.selectedCategory && 
          <React.Fragment>

            <Styles.MarginVertical>
              <button className="button" onClick={this.exportJudges}>Export Judges</button>
            </Styles.MarginVertical>

            <Styles.MarginVertical>
              <button className="button" onClick={this.exportAssign}>Export assignment list</button>
            </Styles.MarginVertical>
            
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
        }

      </Styles.Container>
    )
  }
}