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
  categoryIds = [];

  state = {
    showDescription: true,
    scores: {},
    hasOldScores: false,
  }

  componentDidMount() {
    this.setState({showDescription: true});
    api.getCategoriesOfJudge()
      .then((judgeCategories) => {
        let judgeCategoryIds = judgeCategories.map((category) => {
          return category.id;
        })
        
        let projectCategories = this.props.currProject.categories;
        let projectCategoryIds = projectCategories;

        this.categoryIds = projectCategoryIds.reduce((aggr, projectCatId) => {
          console.log(judgeCategoryIds)
          console.log(projectCatId)
          if (judgeCategoryIds.includes(projectCatId)) {
            aggr.push(projectCatId);
          }
          return aggr;
        }, []);

        console.log(this.categoryIds);
      });
    console.log(this.props.currProject.categories);
  }

  componentDidUpdate(prevProps) {
    if (this.props.currProject !== prevProps.currProject) {
      this.setState({showDescription: true});
    }
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
        // this.handleScoreChange(params.value, params.criterion);
        break;
      case 'incremental':
        // this.handleIncrementalScoreChange(params.delta, params.criterion);
        break;
      case 'focus':
        // this.scoresBeforeFocus[params.criterion.accessor] = this.state.scores[params.criterion.accessor];
        break;
      case 'blur':
        // this.handleBlur(params.criterion);
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
                  categoryId="aaa"
                  projectId={this.props.currProject.objectId}
                />
              </div>
  
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