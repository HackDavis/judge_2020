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

  categoryIds = [];
  judgeCategoryIds = [];
  completedCategoryIds = new Set();

  initialState = {
    ready: false,
    showDescription: true,
    isProjectDone: false,
  }

  constructor(props) {
    super(props);
    this.state = { ...this.initialState };
  }

  componentDidMount() {
    this.setState(this.initialState);
    api.getCategoriesOfJudge()
      .then((judgeCategoryIds) => {
        this.judgeCategoryIds = judgeCategoryIds;
      }).then(() => this.findCategoriesUnion())
      .then(() => this.setState({ ready: true }))
  }

  componentDidUpdate(prevProps) {
    if (this.props.currProject !== prevProps.currProject) {
      this.setState(this.initialState, () => {
        this.completedCategoryIds = new Set();
        this.findCategoriesUnion()
          .then(() => this.setState({ ready: true }))
      });
    }
  }

  async findCategoriesUnion() {
    let projectCategories = this.props.currProject.categories;
    let projectCategoryIds = projectCategories.map((item) => item.id);

    this.categoryIds = projectCategoryIds.reduce((aggr, projectCatId) => {
      console.log(this.judgeCategoryIds)
      console.log(projectCatId)
      if (this.judgeCategoryIds.includes(projectCatId)) {
        aggr.push(projectCatId);
      }
      return aggr;
    }, []);

    return;
  }

  onScoreEvent = (event, params) => {
    const { categoryId } = params;
    switch (event) {
      case 'toggleDesc':
        this.setState(state => {
          return {
            showDescription: !state.showDescription
          }
        });
        break;
      case 'loadedOldVotes':
        this.completedCategoryIds.add(categoryId);
        console.log(this.completedCategoryIds, this.categoryIds)
        if (this.completedCategoryIds.size === this.categoryIds.length) {
          this.setState({ isProjectDone: true });
        }
        break;
      case 'castedVote':
        this.completedCategoryIds.add(categoryId);
        console.log(this.completedCategoryIds, this.categoryIds)
        if (this.completedCategoryIds.size === this.categoryIds.length) {
          this.setState({ isProjectDone: true });
          this.props.handleButtons('next');
        }
        break;
      default:
        break;
    }
  }

  render() {
    if (!this.state.ready) {
      return null
    }

    return (
      <React.Fragment>

        { (this.props.projectsLeftCount === 0 || this.state.isProjectDone) &&  
          <CompleteBanner
            isAllDone={(this.props.projectsLeftCount === 0)}
          />
        }

        <div className="main-container__displayproject columns">
  
            <div className="column">
  
              <ProjectHeader project={this.props.currProject} />
  
              <div className={
                "container "
                + (this.state.showDescription ? "" : "is-hidden-mobile")
              }>
                <ProjectDescription
                  desc={this.props.currProject.description}
                /> 
              </div>
  
            </div>
  
            <div className="column voting-column right-panel">
  
              { this.categoryIds.map( (categoryId) => {
                  return (
                    <div
                      key={categoryId}
                      className={
                        "container vote-scores "
                        + (this.state.showDescription ? "is-hidden-mobile" : "")
                      }
                    >
                      <ProjectScores
                        onScoreEvent={this.onScoreEvent}
                        categoryId={categoryId}
                        projectId={this.props.currProject.objectId}
                      />
                    </div>
                  )
              })}
  
              <Nav
                handleButtons={this.props.handleButtons}
                hasNext={
                  this.props.projectsLeftCount > 1
                  || (this.props.projectsLeftCount === 1
                      && this.state.isProjectDone)
                }
              />
  
            </div>
  
        </div>
        
      </React.Fragment>
    );

  }
}