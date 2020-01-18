import React from 'react'
import styled from 'styled-components'

import Projects from './Projects'
import Criteria from './Criteria'
import Judges from './Judges'
import CreateJudges from './CreateJudges'
import ControlPanel from './ControlPanel'
import Assignments from './Assignments'

const TabNav = function({tabs, selected, handleTabClick}) {
  return (
    <div className="tabs is-centered is-marginless">
      <ul>
        { tabs.map(({name, accessor}) => {
          return (
            <li key={accessor} className={(selected === accessor) ? "is-active" : undefined}>
              <a href onClick={() => handleTabClick(accessor)}>
                {name}
              </a>
            </li>
          )
        }) }
      </ul>
    </div>
  )
}

const TabContents = function({selected}) {
  switch (selected) {
    case 'projects': {
      return <Projects/>
    }
    case 'controlpanel': {
      return (
          <ControlPanel/>
      )
    }
    case 'assignments': {
      return <Assignments/>
    }
    case 'criteria': {
      return <Criteria/>
    }
    case 'judges': {
      return <Judges/>
    }
    case 'createjudges': {
      return <CreateJudges/>
    }
    default: {
      return 'Nothing here'
    }
  }
}

class AdminPage extends React.Component {
  state = {
    activeTab: 'controlpanel',
  }

  tabs = [
    {
      name: 'Control Panel',
      accessor: 'controlpanel',
    },
    {
      name: 'Create Judges',
      accessor: 'createjudges',
    },
    {
      name: 'Judges',
      accessor: 'judges',
    },
    {
      name: 'Judging Criteria',
      accessor: 'criteria',
    },
    {
      name: 'Projects',
      accessor: 'projects',
    },
    {
      name: 'Assignments',
      accessor: 'assignments',
    },
  ]

  handleTabClick = (tab) => {
    this.setState({activeTab: tab});
  }

  render() {
    return (
      <React.Fragment>

        <TabNav 
          tabs={ this.tabs }
          selected={ this.state.activeTab }
          handleTabClick={ this.handleTabClick }
        ></TabNav>

        <TabContents selected={ this.state.activeTab }></TabContents>

      </React.Fragment>
    );
  }
}

export default AdminPage;