import React from 'react';
import {Link} from 'react-router-dom';

export default function WelcomeJudge (props) {
  return (
    <React.Fragment>
      <section className="section">
        <h1 className="title">Welcome, {props.getCurrentUser() ? props.getCurrentUser().get('display_name') : ''}.</h1>
        <p>Let's get judging!</p>
        <p><Link to="/judge/vote">Vote</Link></p>
      </section>
    </React.Fragment>
  );
}