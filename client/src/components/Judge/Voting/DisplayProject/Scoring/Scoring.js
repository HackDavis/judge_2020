import React from 'react';

import propTypes from 'prop-types';
import IncrementalInput from './IncrementalInput';

import api from '../../../../../ParseApi'

const CastVotesButton = function({castVotes, isPending}) {
  return (
    <div className="cast-votes">
      <div className="buttons">
        <button className={"button is-fullwidth is-primary " + (isPending && 'is-loading')}
          onClick={castVotes}
        >
          Cast Vote
        </button>
      </div>
    </div>
  );
}

const Scoring = class extends React.Component {
  static propTypes = {
    onScoreEvent: propTypes.func,
    categoryId: propTypes.string.isRequired,
    categoryData: propTypes.object.isRequired,
    projectId: propTypes.string.isRequired,
  }

  category = undefined
  scoresBeforeFocus = {};
  votingCriteria = [];

  state = {
    scores: undefined,
    criteriaLoaded: false,
    rubricReady: false,
    isCastingVote: false,
  }

  componentDidMount() {
    this.getProjectCriteria()
      .then(() => {
        this.category = this.props.categoryData;
      })
      .then(() => {
        return this.initScores();
      })
      .then(() => {
        this.setState({ rubricReady: true })
      })
  }

  componentDidUpdate(prevProps) {
    if (prevProps.projectId !== this.props.projectId || (prevProps.categoryId !== this.props.categoryId)) {
      console.log('cat project/cat updated')
      this.setState({ rubricReady: false }, () => {
        this.getProjectCriteria()
          .then(() => {
            this.category = this.props.categoryData;
          })
          .then(() => {
            return this.initScores();
          })
          .then(() => {
            this.setState({ rubricReady: true })
          })
      });
    }
  }

  getProjectCriteria = async () => {
    return api.getVotingCriteria(this.props.categoryId)
      .then((criteria) => {
        criteria.sort((a,b) => {
          let depriortizeWeight = criteria.length
          let a_val = a.order + (a.isGeneral ? 0 : depriortizeWeight);
          let b_val = b.order + (b.isGeneral ? 0 : depriortizeWeight);
          return a_val - b_val;
        })
        this.votingCriteria = criteria;
        this.setState({criteriaLoaded: true})
      })
  }

  initScores = async () => {
    let loadedOldVotes = await this.loadOldVotes();
    if (loadedOldVotes) {
      return;
    }

    let scores = {};
    let hasOldScores = false;

    for (let criterion of this.votingCriteria) {
      let defaultScore = Math.ceil(criterion.maxScore / 2);
      scores[criterion.accessor] = defaultScore;
    }

    this.setState({ scores, hasOldScores });
  }

  loadOldVotes = async () =>  {
    return api.getVotes(this.props.projectId, this.props.categoryId)
      .then((oldVotes)=>{
        if (oldVotes) {
          console.log(oldVotes)
          let loadedScores = oldVotes.votes.reduce((aggr, vote) => {
            let category = vote.category;
            console.log(category, vote.score)
            aggr[category] = vote.score;
            return aggr;
          }, {});

          return {
            scores: loadedScores,
          };
        }

        return null;
      }).then( (loaded) => {
        if (loaded === null) {
          return false;
        }

        let scores = loaded.scores;
        let hasOldScores = true;
        this.setState({ scores, hasOldScores }, () => {
          this.props.onScoreEvent('loadedOldVotes', { categoryId: this.props.categoryId });
        })
        return true;
      });
  }

  castVotes = () =>  {
    this.setState({ isCastingVote: true })

    return api.castVotes(this.props.projectId, this.props.categoryId, this.state.scores)
      .then(() => {
        this.setState({isCastingVote: false})
        this.props.onScoreEvent('castedVote', { categoryId: this.props.categoryId });
      }).catch((err) => {
        this.setState({isCastingVote: false})
        alert(`Error: Failed to cast votes. Err: ${err}`);
      })
  }

  handleScoreChange = (value, criterion) => {
    this.setState(state => {
      const score = value;

      const newScores = state.scores;
      if (score === '') {
        newScores[criterion.accessor] = '';
      } else if (!isNaN(score)) {
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
    })
  }


  handleBlur = (criterion) => {
    const {accessor, maxScore} = criterion;
    var newScores;
    this.setState( ({scores}) => {
      newScores =  {...scores};
  
      if (scores[accessor] === '') {
        newScores[accessor] = this.scoresBeforeFocus[accessor];
      } else if (scores[accessor] > maxScore) {
        newScores[accessor] = maxScore;
      } else if (scores[accessor] < 1) {
        newScores[accessor] = 1;
      }

      return {
        scores: newScores
      }
    });

  }

  onInputEvent = (event, params) => {
    switch (event) {
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
      <React.Fragment>
        <h3 className="title is-4 is-marginless rubric-title">{this.category.name}</h3>
        <div key={this.props.categoryId} className="rubric">
          { this.votingCriteria.map((criterion) => {
            return (
              <IncrementalInput
                key={criterion.accessor}
                criterion={criterion}
                scoreIn={this.state.scores[criterion.accessor]}
                onInputEvent={this.onInputEvent}
              />
            )
          })}
        </div>
  
        <CastVotesButton
          isPending={this.state.isCastingVote}
          castVotes={() => this.castVotes()}
        />
  
      </React.Fragment>
    )
  }
}

export default Scoring;