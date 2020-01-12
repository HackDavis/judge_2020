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

export default function ViewAll(props) {
  useEffect(() => {
    console.log(props.projects)
  }, [props.projects])

  return (
    <section className="section voting-container">
      <ProjectsList
        currProjectId={props.currProjectId}
        projects={props.projects}
        handleButtons={props.handleButtons}
      />
      <Nav
        handleViewAll={() => props.handleButtons('view-all')}
      />
    </section>   
  )
}