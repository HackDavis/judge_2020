import React from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';
import Parse from 'parse';
import api from '../../../ParseApi';
import DisplayProject from './DisplayProject';
import ViewAll from './ViewAll';

class Voting extends React.Component {
  static propTypes = {
    state: PropTypes.object,
    dispatch: PropTypes.func,
  }
  
  queue;
  projects;
  categories;
  progress;
  _isMounted;
  projectsLeftCount;
  
  state = {
    currProjectId: undefined,
    isReady: false,
    viewAll: false,
    sendToCompletionPage: false,
  };
  
  componentDidMount() {

    // TODO: check if voting open

    console.log(this.props);

    return api.getVotingData(true)
      .then( (votingData) => {
        const { queue, projects, categories, progress, numPending } = votingData;

        this.queue = queue;
        this.projects = projects;
        this.categories = categories;
        this.progress = progress;
        this.projectsLeftCount = numPending;

      })
      .then(() => {
        if (this.props.match && this.props.match.params.projectId) {
          return this.props.match.params.projectId;
        }
        
        return this.findNextProject();
        
      })
      .then((nextProjectId) => {
        
        if (nextProjectId === null) {
          this.setState({ sendToCompletionPage: true });
          return;
        }

        this.gotoProject(nextProjectId, { isReady: true });
      })
  }

  gotoProject = (projectId, moreStates) => {
    this.props.history.push(`/judge/vote/${projectId}`);
    this.setState({
      currProjectId: projectId,
      viewAll: false,
      ...moreStates
    });
  }

  onNext = async () => {
    const nextProjectId = await this.findNextProject();

    if (nextProjectId === null) { // none in queue
      this.setState({ sendToCompletionPage: true });
    }

    if (nextProjectId === this.state.currProjectId) {
      if (this.projectsLeftCount === 0) {
        this.setState({ sendToCompletionPage: true });
      }

      return;
    }

    this.gotoProject(nextProjectId);
  }

  updateVotingData = async () => {
    return api.getVotingData()
      .then( (votingData) => {
        const { numPending, progress } = votingData;
        this.progress = progress;
        this.projectsLeftCount = numPending;
        return votingData;
      })
  }
    
  onVotingEvent = (val, params) =>  {
    switch (val) {
      case 'next': {
        this.onNext();
        break;
      }
      case 'jump': {
        const newProjectId = params;
        this.gotoProject(newProjectId);
        break;
      }
      case 'view-all': {
        this.updateVotingData()
          .then(() => {
            this.setState(state => {
              return {
                viewAll: !state.viewAll
              }
            });
          })
        break;
      }
      case 'toggleDesc': {
        this.setState(state => {
          return {
            showingDescription: !state.showingDescription
          }
        });
        break;
      }
      case 'updateVotingData': {
        return this.updateVotingData();
      }
      default:
        break;
    }
  }

  findNextProject = async () =>  {
    let votingData = await this.updateVotingData();
    let { queue } = votingData;

    if (!queue || queue.length === 0) {
      return null;
    }

    const currProjectId = this.state.currProjectId;
    let posInQ = queue.findIndex((item) => {
      return (item === currProjectId);
    });

    // Check for incomplete projects after current
    let sliceAfterCurr = queue.slice(posInQ+1);
    let nextProjectId = sliceAfterCurr.find((itemId) => {
      return !this.progress[itemId].isComplete;
    });

    if (nextProjectId !== undefined) {
      return nextProjectId;
    }

    // Check for incomplete projects before current
    let sliceBeforeCurr = queue.slice(0, posInQ);

    nextProjectId = sliceBeforeCurr.find((itemId) => {
      return !this.progress[itemId].isComplete;
    });

    if (nextProjectId !== undefined) {
      return nextProjectId;
    }

    // Try to return currProjectId if no more projects to score,
    // otherwise return first project
    return currProjectId || queue[0];
  }
  
  render() {
    if (this.state.sendToCompletionPage) {
      return <Redirect to="/judge/complete"/>;
    }

    if (!this.state.isReady || this.state.currProjectId === undefined) {
      return (
        <section className="section">
          <h1>Please wait...</h1>
        </section>
      );
    }

    if (this.state.viewAll) {
      return (
        <ViewAll
          currProjectId={this.state.currProjectId}
          progress={this.progress}
          projects={this.projects}
          onVotingEvent={this.onVotingEvent}
        />
      )
    }

    return (
      <DisplayProject
        progress={this.progress[this.state.currProjectId]}
        categoryData={this.categories}
        project={this.projects[this.state.currProjectId]}
        onVotingEvent={this.onVotingEvent}
        projectsLeftCount={this.projectsLeftCount}
      />
    )
  }
}

export default Voting;