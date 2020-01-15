import React from 'react'
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

export default function ViewAll({
  currProjectId,
  projects,
  onVotingEvent,
  progress
}) {

  return (
    <section className="section voting-container">
      <ProjectsList
        currProjectId={currProjectId}
        progress={progress}
        projects={projects}
        onVotingEvent={onVotingEvent}
      />
      <Nav
        handleViewAll={() => onVotingEvent('view-all')}
      />
    </section>   
  )
}