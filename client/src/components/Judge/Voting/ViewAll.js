import React, {useEffect, useState} from 'react'
import ProjectsViewer from './ProjectsViewer'
import api from '../../../ParseApi'
import Nav from './Nav'

export default function ViewAll({handleButtons}) {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    api.getAllProjects().then((projects => {
      api.updateQueueStatus(projects)
        .then((updatedProjects) => {
          setProjects(updatedProjects);
        })
    }));
  }, [])
  
  return (
    <section className="section voting-container has-background-white-ter">
      <ProjectsViewer
        projects={projects}
        handleButtons={handleButtons}
      />
      <Nav
        handleButtons={handleButtons}
        hideSkip={true}
      />
    </section>   
  )
}