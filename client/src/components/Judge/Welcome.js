import React from 'react';
import styled from 'styled-components'
import api from '../../ParseApi'
import {Link} from 'react-router-dom';

const Container = styled.div`
  padding: 3em;
  display: flex;
  flex-direction: column;
`
export default class WelcomeJudge extends React.Component {

  state = {
    isReady: false,
    isBlocked: undefined,
  }

  componentDidMount() {
    api.run('isVotingOpen')
      .then((isOpen) => {
        this.setState({
          isReady: true,
          isBlocked: !isOpen
        })
      })
      
  }

  render() {
    if (!this.state.isReady) {
      return 'Loading...'
    }

    if (this.state.isBlocked) {
      return (
        <Container>
          <h1 className="title is-3">Judging has not started yet.</h1>
          <span>When a judge lets you know that judging has started, please refresh this page.</span>
        </Container>
      )
    }

    return (
      <React.Fragment>
        <section className="section">
          <h1 className="title">Welcome, {this.props.getCurrentUser() ? this.props.getCurrentUser().get('display_name') : ''}.</h1>
          <p>Let's get judging!</p>
          <p><Link to="/judge/vote">Vote</Link></p>
        </section>
      </React.Fragment>
    );
  }
}