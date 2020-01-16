import React from 'react';
import styled from 'styled-components'
import './ProjectsList.css'

const ProjectRow = styled.div`
  display: flex;
  flex-direction: row;
  padding: 0.5em 0.7em;
  background-color: ${props => props.selected ? '#fff5fc' : 'transparent'};
  font-weight: ${props => props.selected ? 600 : 400};
  color: ${props => props.selected ? '#bb52a0' : 'inherit'};
  border-radius: 4px;

  a {
    color: inherit;
  }
`

const ProjectName = styled.span`
  flex: 1;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`

const ProgressIndicator = styled.span`
  box-sizing: border-box;
  justify-content: center;
  align-items: center;
  flex: none;
  /* margin-left: 2em; */
  /* background: ${props => props.done ? "#07ce00" : "#ccc"}; */
  background: #fff;
  border: 1px solid #ccc;
  border-color: ${props => props.done ? "#52bb88" : "#ccc"};
  border-radius: 3px;
  color: ${props => props.done ? "#52bb88" : "#333"};
  display: inline-flex;
  font-size: 0.65em;
  font-weight: 700;
  padding: 2px 5px;
  text-align: center;  
  text-transform: uppercase;
  width: 70px;
`

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
            <ProjectRow
              key={objectId}
              selected={objectId === currProjectId}
              onClick={() => onVotingEvent('jump', objectId)}
            >
              <ProjectName>
                <a href onClick={() => onVotingEvent('jump', objectId)}>{name}</a>
              </ProjectName>
              
                <ProgressIndicator done={progress[objectId].isComplete}>
                  {progress[objectId].isComplete ? 'Done' : 'Not done'}
                </ProgressIndicator>
            </ProjectRow>
          )
        })}
      </div>
  )
}