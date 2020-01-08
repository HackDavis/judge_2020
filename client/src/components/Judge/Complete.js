import React from 'react';
import {Link} from 'react-router-dom';

export default function WelcomeJudge (props) {
  return (
    <React.Fragment>
      <section className="section">
        <h1 className="title">Thank you for voting, {props.getCurrentUser() ? props.getCurrentUser().get('display_name') : ''}!</h1>
        <p>You may now exit the browser or select one of the options below.</p>
        <p><Link to="/judge/vote">View/change votes</Link></p>
      </section>
    </React.Fragment>
  );
} 