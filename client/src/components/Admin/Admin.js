import React from 'react'
import styled from 'styled-components'

import Projects from './Projects'
import Criteria from './Criteria'
import Judges from './Judges'
import CreateJudges from './CreateJudges'
import ControlPanel from './ControlPanel'
import Queues from './Queues'

const PaddedContainer = styled.div`
  padding: 1.5rem 2rem;
`

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
      return (
        <PaddedContainer>
          <Projects/>
        </PaddedContainer>
      )
    }
    case 'controlpanel': {
      return (
        <PaddedContainer>
          <ControlPanel/>
        </PaddedContainer>
      )
    }
    case 'categories': {
      return 'Categories'
    }
    case 'queues': {
      return <Queues/>
    }
    case 'criteria': {
      return (
        <PaddedContainer>
          <Criteria/>
        </PaddedContainer>
      )
    }
    case 'judges': {
      return (
        <PaddedContainer>
          <Judges/>
        </PaddedContainer>
      )
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
    activeTab: 'projects',
  }

  tabs = [
    {
      name: 'Control Panel',
      accessor: 'controlpanel',
    },
    {
      name: 'Projects',
      accessor: 'projects',
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
      name: 'Categories',
      accessor: 'categories',
    },
    {
      name: 'Queues',
      accessor: 'queues',
    },
    {
      name: 'Judging Criteria',
      accessor: 'criteria',
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