import React from 'react';

export default function Description (props) {
  return (
    <div className="control">
      <textarea className="textarea" readOnly={true} rows="15" value={props.desc}></textarea>
      {/* TODO: SANITIZE THIS ^^^ */}
    </div>
  );
};