import React from 'react';
import PropTypes from 'prop-types';

const DataViewerHeader = (props) => {
  return (
    <thead>
      <tr>
        {Object.keys(props.visibleColNames)
          .map( (colName) => 
            <th key={colName}>
              {props.visibleColNames[colName]}
            </th>
          )}
        <th>...</th>
        <th>Actions</th>
      </tr>
    </thead>
  );
};

DataViewerHeader.propTypes = {
  visibleColNames: PropTypes.object
};

export default DataViewerHeader;