import React from 'react';
import PropTypes from 'prop-types';
import Parse from 'parse';
import DataViewerRow from '../components/DataViewerRow';
import DataViewerHeader from '../components/DataViewerHeader';

class DataTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      objs: []
    }
  }

  componentDidMount() {
    let object = new Parse.Object.extend(this.props.parseClassName);
    let query = new Parse.Query(object);
    query.find().then(
      list => {
        list.forEach(obj => {
          console.log(obj);
          this.setState(state => {
            let newObjs = state.objs;
            newObjs.push(obj.toJSON());
            return {objs: newObjs};
          })
        })
      }
    )
  }

  render() {
    return (
      <React.Fragment>
        <p className="title is-5">Explore {this.props.displayName}</p>
        <table className="table is-fullwidth is-striped is-bordered is-narrow">
          <DataViewerHeader
            visibleColNames={this.props.visibleColNames}
          />
          <tbody>
            {this.state.objs.map(obj => 
              <DataViewerRow 
                key={obj}
                visibleColNames={this.props.visibleColNames}
                obj={obj}
              />
            )}
          </tbody>
        </table>
      </React.Fragment>
    );
  }
}

DataTable.propTypes = {
  displayName: PropTypes.string,
  parseClassName: PropTypes.string
}

export default DataTable;