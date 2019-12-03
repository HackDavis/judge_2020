import React from 'react'

import FileUpload from './FileUpload'

class AdminPage extends React.Component {
  state = {
    activeTab: 'projects', 
    // actualName: 'Display Name;
    projectVisibleCols: {
      name: 'Name',
      table: 'Table'
    },
    categoryVisibleCols: {
      id: 'ID',
      name: 'Name'
    }
  }

  handleTabClick(tab) {
    this.setState({activeTab: tab});
  }

  render() {
    return (
      <React.Fragment>
        <div className="tabs is-centered">
          <ul>
            <li className={(this.state.activeTab === 'projects') ? "is-active" : undefined}>
              <a href onClick={() => this.handleTabClick('projects')}>
                Projects
              </a>
            </li>
            <li className={(this.state.activeTab === 'categories') ? "is-active" : undefined}>
            <a href onClick={() => this.handleTabClick('categories')}>
              Categories
            </a>
            </li>
          </ul>
        </div>
        
        <section className="section">
          {/* { this.state.activeTab == 'projects'
              ? <DataViewer
                  displayName="Projects"
                  parseClassName="Project"
                  visibleColNames={this.state.projectVisibleCols}
                />
              : <DataViewer
                  displayName="Categories"
                  parseClassName="Category"
                  visibleColNames={this.state.categoryVisibleCols}
                />
          } */}
        </section>

        <section className="section is-medium">
          {/* <ProjectsAdd/> */}
          <FileUpload/>
        </section>
      </React.Fragment>
    );
  }
}

export default AdminPage;