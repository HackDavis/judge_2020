import React from 'react';

export default function ProjectHeader (props) {
  return (
    <div className="project-title__dp padding-1__dp">
      <p className="title">{props.project.name}</p>
      <p className="subtitle">Table: <b>{props.project.table}</b></p>
    </div>
  );
};