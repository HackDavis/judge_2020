import React from 'react';

export default function ProjectRow(props) {
  return (
    <tr>
      {Object.keys(props.visibleColNames).map(key =>
        <td key={key}>{props.obj[key]}</td>     
      )}
      <td/>
      <td>Expand | Edit | Delete</td>
    </tr>
  );
}