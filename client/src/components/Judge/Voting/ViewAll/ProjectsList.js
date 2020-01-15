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
                    <a href className="current" onClick={() => onVotingEvent('jump', objectId)}>{name} (Current)</a>
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