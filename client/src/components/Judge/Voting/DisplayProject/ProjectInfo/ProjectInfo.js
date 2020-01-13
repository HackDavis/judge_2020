import React from 'react'
import ProjectHeader from './ProjectHeader';
import ProjectDescription from './ProjectDescription';

const ProjectInfo = function({
  project,
  showDescription,
  onToggleDesc,
}) {
  return (
    <React.Fragment>
      <ProjectHeader project={project} />

      <button
        className="toggleDisplay__dp margin-1__dp button"
        onClick={onToggleDesc}
      >{(showDescription) ? "Switch to rubric" : "Switch to project info"}</button>

      <div className={
        "project-description__dp margin-1__dp "
        + (showDescription ? "" : "is-hidden-mobile")
      }>
        <ProjectDescription
          desc={project.description}
        /> 
      </div>
    </React.Fragment>
  )
}

export default ProjectInfo;