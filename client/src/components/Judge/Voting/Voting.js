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
    
  projects = {};
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
    let ret = api.getAllProjects()
      .then(async (projects) => {
        this.projects = projects;
        await this.updateQueueStatus();

        this.setState({
          isProjectsLoaded: true,
        });

      });
    return ret;
  }

  gotoNextProject = async () => {
    const nextProjectId = await this.findNextProject();
    if (nextProjectId === this.state.currProjectId) {
      if (this.state.projectsLeftCount === 0) {
        this.setState({ sendToCompletionPage: true });
      } else {
        // todo: prompt that no other projects need voting on
      }

      return;
    }

    this.setState({
      currProjectId: nextProjectId,
    });
  }

  updateQueueStatus = async () => {
    const updateResults = await api.updateQueueStatus(this.projects);
    this.projects = updateResults.projects;
    let projectsLeftCount = Object.keys(this.projects).length - updateResults.count;
    this.setState({ projectsLeftCount });
  }

  findNextProject = async () =>  {
    await this.updateQueueStatus();

    let queue = await api.getVoteQueue();
    if (!queue || queue.length === 0) {
      // TODO: make createVoteQueue return queue
      await api.createVoteQueue();
      queue = await api.getVoteQueue();
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
      let project = this.projects[itemId];
      return (!project.done);
    });

    if (nextProjectId !== undefined) {
      return nextProjectId;
    }

    // Check for incomplete projects before current
    let sliceBeforeCurr = queue.slice(0, posInQ);

    nextProjectId = sliceBeforeCurr.find((itemId) => {
      console.log(itemId);
      let project = this.projects[itemId];
      return (!project.done);
    });

    if (nextProjectId !== undefined) {
      return nextProjectId;
    }

    // Try to return currProjectId if no more projects to score,
    // otherwise return first project
    return currProjectId || queue[0];
  }
    
  handleButtons = (val, props) =>  {
    if (val === 'next') {
      this.gotoNextProject();
    } else if (val === 'jump') {
      const newProjectId = props;
      
      this.setState(state => {
        return {
          currProjectId: newProjectId,
          showingDescription: !state.showingDescription,
          viewAll: false
        }
      });
    } else if (val === 'view-all') {
      this.setState(state => {
        return {
          viewAll: !state.viewAll
        }
      });
    } else if (val === 'toggleDesc') {
      this.setState(state => {
        return {
          showingDescription: !state.showingDescription
        }
      });
    }
  }

  handleParseError = (err) => {
    switch (err.code) {
      case Parse.Error.INVALID_SESSION_TOKEN:
        Parse.User.logOut();
        break;
      default:
        console.log("Parse Error", err.code);
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
          handleButtons={this.handleButtons}
        />
      )
    }

    return (
      <DisplayProject
        currProject={this.projects[this.state.currProjectId]}
        handleButtons={this.handleButtons}
        projectsLeftCount={this.state.projectsLeftCount}
      />
    )
  }
}

export default Voting;