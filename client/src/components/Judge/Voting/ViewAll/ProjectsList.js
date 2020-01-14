import React from 'react';
import './ProjectsList.css'

export default function ProjectsList({
  currProjectId,
  projects,
  onVotingEvent,
  progress,
}) {
  return (
       <div className="container">
        {Object.values(projects).map(({objectId, name}) => {
          return (
            <div className="project-row" key={objectId}>
              <span className="project-name">
                
                  { currProjectId === objectId? (
                    <a href onClick={() => onVotingEvent('jump', objectId)}><b>{name} (Current)</b></a>
                  ) : (
                    <a href onClick={() => onVotingEvent('jump', objectId)}>{name}</a>
                  )}
              </span>
              
                {progress[objectId].isComplete ? (
                  <span className="project-status done">Done</span>
                ) : (
                  <span className="project-status to-do">Not done</span>
                )}
            </div>
          )
        })}
      </div>
  )
}