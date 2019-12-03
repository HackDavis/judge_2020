import React from 'react';

export default function ProjectHeader (props) {
  return (
    <div className="container short-container no-padding-top no-padding-bottom">
      <p className="title">{props.project.name}</p>
      <p className="subtitle">Table: <b>{props.project.table}</b></p>
    </div>
  );
};