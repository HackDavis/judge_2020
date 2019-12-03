import React from 'react';

export default function ProjectInput(props) {
  return (
    <React.Fragment>
      <div className="field">
        <div className="label">
          <label>Project Name</label>
        </div>
        <div className="control">
          <input className="input" type="text" placeholder="Great Project"></input>
        </div>
      </div>
      <div className="field">
        <div className="label">
          <label>Table</label>
        </div>
        <div className="control">
          <input className="input" type="text" placeholder="A1"></input>
        </div>
      </div>
      <div className="field">
        <div className="label">
          <label>Description</label>
        </div>
        <div className="control">
          <textarea className="textarea" placeholder="A project that is really great."></textarea>
        </div>
      </div>
      <div className="field">
        <div className="control">
          <button className="button is-primary">Add</button>
        </div>
      </div>
    </React.Fragment>
  );
}