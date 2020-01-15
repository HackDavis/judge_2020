import React from 'react'
import styled from 'styled-components'

import Projects from './Projects'
import Criteria from './Criteria'
import Judges from './Judges'
import Judges2 from './Judges2'
import ControlPanel from './ControlPanel'

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
    case 'judges2': {
      return <Judges2/>
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
      name: 'Judges',
      accessor: 'judges',
    },
    {
      name: 'Judges2',
      accessor: 'judges2',
    },
    {
      name: 'Categories',
      accessor: 'categories',
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