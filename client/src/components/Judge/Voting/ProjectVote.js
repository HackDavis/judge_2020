import React from 'react';
import propTypes from 'prop-types'
import Nav from './Nav';
import ProjectHeader from './ProjectHeader';
import VotingControls from './VotingControls';
import ProjectDescription from './ProjectDescription';
import VoteScores from './ProjectScores';
import api from '../../../ParseApi'

import './Voting.css';

export default class ProjectVote extends React.Component {
  static propTypes = {
    currProject: propTypes.object,
    handleButtons: propTypes.func
  }

  scoresBeforeFocus = {};

  state = {
    showingDescription: true,
    scores: {},
  }

  componentDidMount() {
    this.setState({
      showingDescription: true,
      scores: this.initScores(),
    });
  }

  initScores() {
    this.loadOldVotes();
    const scores = {};
    this.props.currProject.categories.forEach(category => {
      scores[category] = 5;
    });

    return scores;
  }

  castVotes = () =>  {
    this.syncVotes(this.state.scores, true)
      .then(res => {
        this.setState(state => {
          return {
            showingDescription: !state.showingDescription
          }
        });
        this.props.handleButtons('next');
      });
  }

  syncVotes = (scores, cast) => {
    return api.syncVotes(this.props.currProject.objectId, scores, cast);
  }

  isNumber = (val) =>  {
    return (val === '0' || val === 0 || !!(+val));
  }

  loadOldVotes = () =>  {
    api.getVotes(this.props.currProject.objectId).then(console.log);
    // TODO: load old votes
  }

  handleScoreChange = (value, category) => {
    this.setState(state => {
      const score = value;

      const newScores = state.scores;
      if (score === '') {
        newScores[category] = '';
      } else if (this.isNumber(score)) {
        newScores[category] = parseInt(score);
      }

      return {
        scores: newScores
      }
    })
  }

  handleIncrementalScoreChange = (delta, category) => {
    var newScores;
    this.setState(({scores}) => {
      newScores = {...scores};
      if (delta === 1 && scores[category] < 10) {
        newScores[category] += 1;
      } else if (delta === -1 && scores[category] > 1) {
        newScores[category] -= 1;
      }

      return {
        scores: newScores
      }
    }, () => {
      this.syncVotes(this.state.scores, false);
    })
  }

  handleBlur = (category) => {
    var newScores;
    this.setState(({scores}) => {
      newScores =  {...scores};
  
      if (scores[category] === '') {
        newScores[category] = this.scoresBeforeFocus[category];
      } else if (scores[category] > 10) {
        newScores[category] = 10;
      } else if (scores[category] < 1) {
        newScores[category] = 1;
      }

      return {
        scores: newScores
      }
    }, () => {
      this.syncVotes(this.state.scores, false);
    });

  }

  handleVoteControls = (event, params) => {
    switch (event) {
      case 'toggleDesc':
        this.setState(state => {
          return {
            showingDescription: !state.showingDescription
          }
        });
        break;
      case 'scoreChange':
        this.handleScoreChange(params.value, params.category);
        break;
      case 'incremental':
        this.handleIncrementalScoreChange(params.delta, params.category);
        break;
      case 'focus':
        this.scoresBeforeFocus[params.category] = this.state.scores[params.category];
        break;
      case 'blur':
        this.handleBlur(params.category);
        break;
      default:
        break;
    }
  }

  render() {
    return (
      <React.Fragment>
        <section className="section voting-container has-background-white-ter">
          <div className="columns">
  
            <div className="column">
  
              <ProjectHeader project={this.props.currProject} />
  
              <div className={"container "+ (this.state.showingDescription ? "" : "is-hidden-mobile")}>
                <ProjectDescription
                  desc={this.props.currProject.description}
                /> 
              </div>
  
            </div>
  
            <div className="column voting-column right-panel">
  
              <div className={"container "+(this.state.showingDescription ? "is-hidden-mobile" : "")}>
                <VoteScores
                  categories={this.props.currProject.categories}
                  scores={this.state.scores}
                  handleVoteControls={this.handleVoteControls}
                />
              </div>
  
              <VotingControls
                toggleDesc={() => this.handleVoteControls('toggleDesc')}
                castVotes={() => this.castVotes()}
                showingDescription={this.state.showingDescription}
              />
  
              <Nav
                handleButtons={this.props.handleButtons}
              />
  
            </div>
  
          </div>
        </section>   
      </React.Fragment>
    );

  }
}