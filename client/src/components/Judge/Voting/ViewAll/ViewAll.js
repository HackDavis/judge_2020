import React, {useEffect, useState} from 'react'
import ProjectsList from './ProjectsList'
import api from '../../../../ParseApi'
// import Nav from './Nav'

function Nav({ handleViewAll }) {
  return (
    <div className="container short-container no-padding-bottom">
      <div className="columns is-mobile">
        <div className="column">
          <a href
            className="button is-fullwidth is-primary is-outlined"
            onClick={() => handleViewAll()}
          >Back to project</a>
        </div>
      </div>
    </div>
  )
}

export default function ViewAll({ currProjectId, handleButtons }) {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    let queue = [];
    let viewableProjects;
    api.getAllProjects()
      .then( (projects) => {        
        return api.updateQueueStatus(projects);
      }).then( ({projects}) => {
        console.log(projects);
        viewableProjects = projects;
        return api.getVoteQueue();
      }).then( (queue) => {
        viewableProjects = Object.values(viewableProjects).reduce((aggr, project) => {
          if (queue.includes(project.objectId)) {
            aggr.push(project);
          }
          return aggr;
        }, [])
        
        setProjects(viewableProjects);
      })
  }, [projects]);
  
  return (
    <section className="section voting-container">
      <ProjectsList
        currProjectId={currProjectId}
        projects={projects}
        handleButtons={handleButtons}
      />
      <Nav
        handleViewAll={() => handleButtons('view-all')}
      />
    </section>   
  )
}