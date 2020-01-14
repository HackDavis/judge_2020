import React from 'react';
import propTypes from 'prop-types'
import api from '../../../../ParseApi'

import Nav from '../Nav';
import ProjectInfo from './ProjectInfo'
import Scoring from './Scoring'
import ProjectScores from './Scoring/CategoryScores';
import CompleteBanner from '../CompleteBanner';

import './DisplayProject.css'

export default class DisplayProject extends React.Component {
  static propTypes = {
    progress: propTypes.object,
    categoryData: propTypes.object,
    project: propTypes.object,
    onVotingEvent: propTypes.func,
    projectsLeftCount: propTypes.number.isRequired,
  }

  categoryIds = [];
  judgeCategoryIds = [];
  completedCategoryIds = new Set();

  initialState = {
    ready: false,
    showDescription: true,
    isProjectDone: false,
    currCategoryId: undefined,
  }

  constructor(props) {
    super(props);
    this.state = { ...this.initialState };
  }

  componentDidMount() {
    this.setState(this.initialState, () => {
      this.categoryIds = this.props.project.categories;
      this.updateProgress();
      this.setState({ ready: true })
    });
  }

  componentDidUpdate(prevProps) {
    if (this.props.project !== prevProps.project) {
      this.setState(this.initialState, () => {
        this.completedCategoryIds = new Set();
        this.categoryIds = this.props.project.categories;
        this.updateProgress();
        this.setState({ ready: true })
      });
    }
  }

  updateProgress = () => {
    let progress = this.props.progress;
    if (progress.isComplete) {
      this.setState({
        isProjectDone: true,
        currCategoryId: this.categoryIds[0],
      })

      console.log(this.categoryIds[0]);

      return;
    }

    let currCategoryId;
    for (let id of this.categoryIds) {
      if (!progress.isCategoryComplete[id]) {
        currCategoryId = id;
        break;
      }
    }

    console.log(currCategoryId);

    this.setState({ currCategoryId })
  }

  onToggleDesc = () => {
    this.setState(({showDescription}) => {
      return {showDescription: !showDescription}
    })
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
          this.props.onVotingEvent('next');
        }

        this.props.onVotingEvent('updateVotingData')
          .then(() => {
            this.updateProgress();
          })
        break;
      case 'changeCategory':
        this.setState({currCategoryId: categoryId});
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
      <div className="main-container">

        { (this.props.projectsLeftCount === 0 || this.state.isProjectDone) &&  
          <CompleteBanner
            isAllDone={(this.props.projectsLeftCount === 0)}
          />
        }

        <div className="main-container__dp">
  
            <div className="main-panel__dp info-panel__dp">

              <ProjectInfo
                project={this.props.project}
                showDescription={this.state.showDescription}
                onToggleDesc={this.onToggleDesc}
              />

              <div className="nav-container__dp nav-desktop__dp">
                <Nav
                  onVotingEvent={this.props.onVotingEvent}
                  hasNext={
                    this.props.projectsLeftCount > 1
                    || (this.props.projectsLeftCount === 1
                        && this.state.isProjectDone)
                  }
                />
              </div>
  
            </div>
  
            <div className="main-panel__dp voting-panel__dp">
  
              <Scoring
                projectId={this.props.project.objectId}
                categoryData={this.props.categoryData}
                categoryIds={this.categoryIds}
                currCategoryId={this.state.currCategoryId}
                onScoreEvent={this.onScoreEvent}
                showDescription={this.state.showDescription}
              />
  
              <div className="nav-container__dp nav-mobile__dp">
                <Nav
                  onVotingEvent={this.props.onVotingEvent}
                  hasNext={
                    this.props.projectsLeftCount > 1
                    || (this.props.projectsLeftCount === 1
                        && this.state.isProjectDone)
                  }
                />
              </div>

            </div>

  
        </div>

      </div>
    );
  }
}