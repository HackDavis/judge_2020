import React from 'react'

import Projects from './Projects'
import Criteria from './Criteria'
import Judges from './Judges'

const TabNav = function({tabs, selected, handleTabClick}) {
  return (
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
  )
}

const TabContents = function({selected}) {
  switch (selected) {
    case 'projects': {
      return <Projects/>
    }
    case 'categories': {
      return 'Categories'
    }
    case 'criteria': {
      return <Criteria/>
    }
    case 'judges': {
      return <Judges/>
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
      name: 'Projects',
      accessor: 'projects',
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
      name: 'Judging Criteria',
      accessor: 'criteria',
    }
  ]

  handleTabClick = (tab) => {
    this.setState({activeTab: tab});
  }

  render() {
    return (
      <React.Fragment>
        <div className="tabs is-centered">

          <TabNav 
            tabs={ this.tabs }
            selected={ this.state.activeTab }
            handleTabClick={ this.handleTabClick }
          ></TabNav>

        </div>

        <section className="section is-small">

          <TabContents selected={ this.state.activeTab }></TabContents>
          
        </section>

      </React.Fragment>
    );
  }
}

export default AdminPage;