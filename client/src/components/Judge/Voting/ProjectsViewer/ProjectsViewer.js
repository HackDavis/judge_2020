import React from 'react';
import './ProjectsViewer.css'

export default function ProjectsViewer({projects, handleButtons}) {
  return (
       <div className="container">
        {Object.values(projects).map(project => {
          return (
            <div className="project-row" key={project.objectId}>
              <span className="project-name">
                <a href onClick={() => handleButtons('jump', project.objectId)}>{project.name}</a>
              </span>
              
                {project.skipped ? (
                  <span className="project-status skipped">Skipped</span>
                  ) : (
                    project.done ? (
                      <span className="project-status done">Done</span>
                    ) : (
                      <span className="project-status to-do">Not done</span>
                    )
                  )
                }
            </div>
          )
        })}
         </div>
  )
}