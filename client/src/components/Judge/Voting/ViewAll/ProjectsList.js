import React from 'react';
import styled, { css } from 'styled-components'

const ProjectRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0.5em 0.7em;
  margin: 0.2rem 0;
  background-color: ${props => props.selected ? '#fff5fc' : 'transparent'};
  font-weight: ${props => props.selected ? 600 : 400};
  color: ${props => props.selected ? '#bb52a0' : 'inherit'};
  border-radius: 4px;

  ${props => !props.selected && css`
    &:hover {
      background-color: #fafafa;
    }
  `}
`

const ProjectInfo = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
`

const ProjectName = styled.span`
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`

const ProjectTable = styled.span`
  font-size: 0.9em;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`

const ProgressIndicator = styled.span`
  box-sizing: border-box;
  justify-content: center;
  align-items: center;
  flex: 0 0 85px;
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
  padding: 0.4em 0.6em;
  text-align: center;  
  text-transform: uppercase;
`

export default function ProjectsList({
  currProjectId,
  projects,
  onVotingEvent,
  progress,
}) {
  return (
       <div className="container">
        {Object.values(projects).map(({objectId, name, table}) => {
          return (
            <ProjectRow
              key={objectId}
              selected={objectId === currProjectId}
              onClick={() => onVotingEvent('jump', objectId)}
            >
              <ProjectInfo>
                <ProjectName>
                  {name}
                </ProjectName>
                <ProjectTable>
                  Table: {table}
                </ProjectTable>

              </ProjectInfo>
              
                <ProgressIndicator done={progress[objectId].isComplete}>
                  {progress[objectId].isComplete ? 'Done' : 'Not done'}
                </ProgressIndicator>
            </ProjectRow>
          )
        })}
      </div>
  )
}