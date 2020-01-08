import React from 'react';
import propTypes from 'prop-types'
import api from '../../../../ParseApi'

import Nav from '../Nav';
import ProjectHeader from './ProjectHeader';
import VotingControls from './VotingControls';
import ProjectDescription from './ProjectDescription';
import ProjectScores from './ProjectScores';
import CompleteBanner from '../CompleteBanner';

import './DisplayProject.css';

export default class DisplayProject extends React.Component {
  static propTypes = {
    currProject: propTypes.object,
    handleButtons: propTypes.func,
    projectsLeftCount: propTypes.number.isRequired,
  }

  scoresBeforeFocus = {};

  votingCriteria = [];

  state = {
    showDescription: true,
    scores: {},
    hasOldScores: false,
  }

  componentDidMount() {
    this.setState({showDescription: true});
    this.getProjectCriteria()
      .then(() => {
        this.initScores();
      });
  }

  componentDidUpdate(prevProps) {
    if (this.props.currProject !== prevProps.currProject) {
      this.setState({showDescription: true});
      this.getProjectCriteria()
        .then(() => {
          this.initScores();
        });
    }
  }

  initScores = async () => {
    let oldVotes = await this.loadOldVotes();

    let scores;
    let hasOldScores;

    if (oldVotes) {
      console.log('oldvotes', oldVotes);
      scores = oldVotes;
      hasOldScores = true;
    } else {
      console.log('no old votes')
  
      scores = {};
      this.votingCriteria.forEach(criterion => {
        let defaultScore = Math.ceil(criterion.maxScore / 2);
        scores[criterion.accessor] = defaultScore;
      });

      hasOldScores = false;
    }

    this.setState({ scores, hasOldScores });
  }

  getProjectCriteria = async () => {
    return api.getGeneralCriteria()
      .then((criteria) => {
        this.votingCriteria = criteria;
      })
  }

  castVotes = () =>  {
    this.syncVotes(this.state.scores, true)
      .then(res => {
        this.setState(state => {
          return {
            showDescription: !state.showDescription
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

  loadOldVotes = async () =>  {
    return api.getVotes(this.props.currProject.objectId)
      .then((resp)=>{
        if (resp.votesCasted) {
          console.log('votesCasted', resp.votesCasted);
          let loadedScores = resp.votesCasted.votes.reduce((aggr, vote) => {
            let category = vote.category;
            aggr[category] = vote.score;
            return aggr;
          }, {});

          return loadedScores;
        }

        return null;
      });
  }

  handleScoreChange = (value, criterion) => {
    this.setState(state => {
      const score = value;

      const newScores = state.scores;
      if (score === '') {
        newScores[criterion.accessor] = '';
      } else if (this.isNumber(score)) {
        newScores[criterion.accessor] = parseInt(score);
      }

      return {
        scores: newScores
      }
    })
  }

  handleIncrementalScoreChange = (delta, criterion) => {
    const {accessor, maxScore} = criterion;
    var newScores;
    this.setState(({scores}) => {
      newScores = {...scores};
      if (delta === 1 && scores[accessor] < maxScore) {
        newScores[accessor] += 1;
      } else if (delta === -1 && scores[accessor] > 1) {
        newScores[accessor] -= 1;
      }

      return {
        scores: newScores
      }
    }, () => {
      this.syncVotes(this.state.scores, false);
    })
  }

  handleBlur = (criterion) => {
    const {accessor, maxScore} = criterion;
    var newScores;
    this.setState(({scores}) => {
      newScores =  {...scores};
  
      if (scores[accessor] === '') {
        newScores[accessor] = this.scoresBeforeFocus[accessor];
      } else if (scores[accessor] > maxScore) {
        newScores[accessor] = maxScore;
      } else if (scores[accessor] < 1) {
        newScores[accessor] = 1;
      }

      console.log('blur', maxScore);

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
            showDescription: !state.showDescription
          }
        });
        break;
      case 'scoreChange':
        this.handleScoreChange(params.value, params.criterion);
        break;
      case 'incremental':
        this.handleIncrementalScoreChange(params.delta, params.criterion);
        break;
      case 'focus':
        this.scoresBeforeFocus[params.criterion.accessor] = this.state.scores[params.criterion.accessor];
        break;
      case 'blur':
        this.handleBlur(params.criterion);
        break;
      default:
        break;
    }
  }

  render() {
    return (
      <React.Fragment>

        { (this.props.projectsLeftCount === 0 || this.state.hasOldScores) &&  <CompleteBanner isAllDone={(this.props.projectsLeftCount === 0)}></CompleteBanner>}
        <section className="section voting-container">
          <div className="columns">
  
            <div className="column">
  
              <ProjectHeader project={this.props.currProject} />
  
              <div className={"container "+ (this.state.showDescription ? "" : "is-hidden-mobile")}>
                <ProjectDescription
                  desc={this.props.currProject.description}
                /> 
              </div>
  
            </div>
  
            <div className="column voting-column right-panel">
  
              <div className={"container vote-scores "+(this.state.showDescription ? "is-hidden-mobile" : "")}>
                <ProjectScores
                  criteria={this.votingCriteria}
                  scores={this.state.scores}
                  handleVoteControls={this.handleVoteControls}
                />
              </div>
  
              <VotingControls
                toggleDesc={() => this.handleVoteControls('toggleDesc')}
                castVotes={() => this.castVotes()}
                showDescription={this.state.showDescription}
              />
  
              <Nav
                handleButtons={this.props.handleButtons}
                hasNext={this.props.projectsLeftCount > 1}
              />
  
            </div>
  
          </div>
        </section>   
      </React.Fragment>
    );

  }
}