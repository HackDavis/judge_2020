import React from 'react'
import styled from 'styled-components'
import ProjectsList from './ProjectsList'

const ViewAllContainer = styled.div`
  padding: 1.5rem;
  margin: 0;
  /* display: flex;
  flex-direction: column;
  justify-content: center; */
  /* max-width: 500px; */
  @media(min-width: 1024px) {
    padding: 3rem 1.5rem;
  }
`

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

export default function ViewAll({
  currProjectId,
  projects,
  onVotingEvent,
  progress
}) {

  return (
    <ViewAllContainer>
      <ProjectsList
        currProjectId={currProjectId}
        progress={progress}
        projects={projects}
        onVotingEvent={onVotingEvent}
      />
      <Nav
        handleViewAll={() => onVotingEvent('view-all')}
      />
    </ViewAllContainer>
  )
}