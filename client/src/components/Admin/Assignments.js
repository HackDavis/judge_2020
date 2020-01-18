import React, {useState, useEffect} from 'react'
import api from '../../ParseApi'
import * as Styles from './Styles'

const CSV = function(props) {
  const [csv, setCsv] = useState('')

  useEffect(() => {
    api.run('exportQueuesToCsv')
      .then((_csv) => {
        setCsv(_csv);
      })
  }, [csv])

  return (
    <textarea className="textarea" readOnly value={csv}/>
  )
}
export default class Assignments extends React.Component {
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

  render() {
    return (
      <Styles.Container>
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

        <CSV/>

      </Styles.Container>
    )
  }
}