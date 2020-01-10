import React from 'react';

import propTypes from 'prop-types';
import IncrementalInput from './IncrementalInput';
import VotingControls from './VotingControls';

import api from '../../../../ParseApi'

const CastVotesButton = function({castVotes}) {
  return (
    <div className="container">
      <div className="buttons">
        <a href className="button is-fullwidth is-primary" 
          onClick={castVotes}
        >
          Cast Vote
        </a>
      </div>
    </div>
  );
}

const ProjectScores = class extends React.Component {
  static propTypes = {
    scores: propTypes.object.isRequired,
    handleVoteControls: propTypes.func,
    categoryId: propTypes.string.isRequired,
    projectId: propTypes.string.isRequired,
  }

  category = undefined
  scoresBeforeFocus = {};
  votingCriteria = {}

  state = {
    scores: undefined,
    criteriaLoaded: false,
  }

  componentDidMount() {
    this.getProjectCriteria()
      .then(() => {
        this.initScores();
      });
  }

  componentDidUpdate(prevProps) {
    if (this.props.projectId !== prevProps.projectId) {
      this.setState({showDescription: true});
      this.getProjectCriteria()
        .then(() => {
          this.initScores();
        });
    }
  }

  getProjectCriteria = async () => {
    return api.getGeneralCriteria()
      .then((criteria) => {
        this.votingCriteria = criteria;
        this.setState({criteriaLoaded: true})
      })
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

  syncVotes = async (scores, cast) => {
    console.log('cast');
    return api.syncVotes(this.props.projectId, this.props.categoryId, scores, cast);
  }

  castVotes = async () =>  {
    return this.syncVotes(this.state.scores, true)
      .then(res => {
        // this.setState(state => {
        //   return {
        //     showDescription: !state.showDescription
        //   }
        // });
        // this.props.handleButtons('next');
      }).catch((err) => {
        alert(`Error: Failed to cast votes. Err: ${err}`);
      })
  }

  loadOldVotes = async () =>  {
    return api.getVotes(this.props.projectId)
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
        // this.setState(state => {
        //   return {
        //     showDescription: !state.showDescription
        //   }
        // });
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
    if (!this.state.criteriaLoaded || !this.state.scores) {
      return 'Loading...';
    }
  
    return (
      <div className="container" style={{ paddingTop: '3vh', paddingBottom: '3vh', textAlign: 'center'}}>
        { this.votingCriteria.map((criterion, index) => {
          return (
            <IncrementalInput
              key={criterion.accessor}
              criterion={criterion}
              score={this.state.scores[criterion.accessor]}
              handleVoteControls={this.handleVoteControls}
              hasNext={ !(index === (this.props.criteria.length - 1))}
            />
          )
        })}
  
        <CastVotesButton
          castVotes={() => this.castVotes()}
        />
  
      </div>
    )
  }
}

// const ProjectScores = function({criteria, scores, handleVoteControls}) { 
//   if (!scores) {
//     return null;
//   }

//   return (
//     <div className="container" style={{ paddingTop: '3vh', paddingBottom: '3vh', textAlign: 'center'}}>
//       { criteria.map((criterion, index) => {
//         return (
//           <IncrementalInput
//             key={criterion.accessor}
//             criterion={criterion}
//             score={scores[criterion.accessor]}
//             handleVoteControls={handleVoteControls}
//             hasNext={ !(index === (criteria.length - 1))}
//           />
//         )
//       })}

//       <VotingControls
//         castVotes={() => this.castVotes()}
//       />

//     </div>
//   )
// }

export default ProjectScores;