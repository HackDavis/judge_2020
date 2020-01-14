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
  
  state = {
    currProjectId: undefined,
    isProjectsLoaded: false,
    viewAll: false,
    projectsLeftCount: undefined,
    sendToCompletionPage: false,
  };
  
  componentDidMount() {
    // TODO: check if voting open
    this.getProjects()
      .then(() => this.findNextProject())
      .then((nextProjectId) => {
        this.setState({
          currProjectId: nextProjectId,
        })

      });
  }
    
  getProjects = () => {
    return api.getVotingData(true)
      .then( (votingData) => {
        console.log(votingData);
        const { queue, projects, categories, progress } = votingData;

        this.queue = queue;
        this.projects = projects;
        this.categories = categories;
        this.progress = progress;

      }).then(() => {
        this.setState({
          isProjectsLoaded: true,
        })
      })
  }

  gotoNextProject = async () => {
    const nextProjectId = await this.findNextProject();
    if (nextProjectId === this.state.currProjectId) {
      if (this.state.projectsLeftCount === 0) {
        this.setState({ sendToCompletionPage: true });
      }

      return;
    }

    this.setState({
      currProjectId: nextProjectId,
    });
  }

  updateVotingData = async () => {
    return api.getVotingData()
      .then( (votingData) => {
        console.log(votingData);
        const { numPending, progress } = votingData;
        this.progress = progress;
        this.setState({ projectsLeftCount: numPending });
      });
    // const updateResults = await api.updateCompletionStatus(this.projects);
    // this.projects = updateResults.projects;
    // let projectsLeftCount = Object.keys(this.projects).length - updateResults.count;
    // this.setState({ projectsLeftCount });
  }

  findNextProject = async () =>  {
    await this.updateVotingData();

    let queue = await api.getVoteQueue();
    if (!queue || queue.length === 0) {
      queue = await api.createVoteQueue();
      console.log(queue);
    }

    const currProjectId = this.state.currProjectId;
    let posInQ = queue.findIndex((item) => {
      return (item === currProjectId);
    });

    // Check for incomplete projects after current
    let sliceAfterCurr = queue.slice(posInQ+1);
    let nextProjectId = sliceAfterCurr.find((itemId) => {
      console.log(itemId);
      // let project = this.projects[itemId];
      // return (!project.done);

      return !this.progress[itemId].isComplete;
    });

    if (nextProjectId !== undefined) {
      return nextProjectId;
    }

    // Check for incomplete projects before current
    let sliceBeforeCurr = queue.slice(0, posInQ);

    nextProjectId = sliceBeforeCurr.find((itemId) => {
      console.log(itemId);
      // let project = this.projects[itemId];
      // return (!project.done);
      return !this.progress[itemId].isComplete;
    });

    if (nextProjectId !== undefined) {
      return nextProjectId;
    }

    // Try to return currProjectId if no more projects to score,
    // otherwise return first project
    return currProjectId || queue[0];
  }
    
  onVotingEvent = (val, props) =>  {
    switch (val) {
      case 'next': {
        this.gotoNextProject();
        break;
      }
      case 'jump': {
        const newProjectId = props;
      
        this.setState(state => {
          return {
            currProjectId: newProjectId,
            showingDescription: !state.showingDescription,
            viewAll: false
          }
        });
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
        break;
      }
      default:
        break;
    }
  }
  
  render() {
    if (this.state.sendToCompletionPage) {
      return <Redirect to="/judge/complete"/>;
    }

    if (!this.state.isProjectsLoaded || this.state.currProjectId === undefined) {
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
        projectsLeftCount={this.state.projectsLeftCount}
      />
    )
  }
}

export default Voting;