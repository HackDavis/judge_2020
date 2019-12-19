import React from 'react';
import PropTypes from 'prop-types';
import Parse from 'parse';
import api from '../../../ParseApi';
import ProjectVote from './ProjectVote';
import ViewAll from './ViewAll';

class Voting extends React.Component {
  static propTypes = {
    state: PropTypes.object,
    dispatch: PropTypes.func,
  }
    
  projects = {};
  state = {
    currProjectId: -1,
    loadedProjects: false,
    viewAll: false,
  };
  
  componentDidMount() {
    this.getProjects()
      .then(() => this.findNextProject())
      .then((currProjectId) => {
        this.setState({currProjectId})
      });
  }
    
  getProjects = () => {
    let ret = api.getAllProjects()
      .then((projects) => {
        this.projects = projects;
        this.setState({loadedProjects: true});
      });
    return ret;
  }

  gotoNextProject = async () => {
    // TOOD: SKIP BUG. Can't edit scores of next project
    const nextProjectId = await this.findNextProject();
    if (!nextProjectId) return;

    this.setState({
      currProjectId: nextProjectId,
    });

    console.log(nextProjectId);
    console.log(this.projects[nextProjectId]);
  }

  updateQueueStatus = async () => {
    const votes = await api.getVotes();
    votes.forEach((vote) => {
      console.log('vote',vote);
      let projectId = vote.project.id;
      console.log('pid', projectId);
      this.projects[projectId].done = true;
    });
  }

  findNextProject = async () =>  {
    this.projects = await api.updateQueueStatus(this.projects);

    let queue = await api.getVoteQueue();
    if (!queue || queue.length === 0) {
      // TODO: make createVoteQueue return queue
      await api.createVoteQueue();
      queue = await api.getVoteQueue();
      console.log(queue);
    }

    console.log(this.projects);
    const currProjectId = this.state.currProjectId;
    let posInQ = queue.findIndex((item) => {
      return (item === currProjectId);
    });
    
    console.log('projects', this.projects);

    const nextProjectId = queue.slice(posInQ+1).find((itemId) => {
      console.log(itemId);
      let project = this.projects[itemId];
      return (!project.done);
    });

    //todo: no more projects

    return nextProjectId;
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
    if (!this.state.loadedProjects || this.state.currProjectId === -1) {
      return (
        <section className="section">
          <h1>Please wait...</h1>
        </section>
      );
    }

    if (this.state.viewAll) {
       return <ViewAll projects={this.projects} handleButtons={this.handleButtons}/>
    }

    return (
      <ProjectVote
        currProject={this.projects[this.state.currProjectId]}
        handleButtons={this.handleButtons}
      />
    )
  }
}

export default Voting;