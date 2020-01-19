import React, { useState, useCallback, useEffect } from 'react'
import api from '../../ParseApi'
import * as Styles from './Styles'
import styled from 'styled-components'
import ReactDataGrid from 'react-data-grid'

const FlexVertical = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  flex-wrap: wrap;
  justify-content: center;
`

const FlexWrap = styled.div`
  display: flex;
  width: 100%;
  flex-wrap: wrap;
  justify-content: center;
`

const Tile = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5em;
  margin: 0.5em;
  border: 1px solid #f0f0f0;
  border-radius: 5px;
`

class ProjectsExport extends React.Component {

  categories;

  state = {
    loadedCategories: false
  }

  componentDidMount() {
    api.getAllCategories()
      .then((categories) => {
        this.categories = categories;
        let stateCats = categories.reduce((aggr, cat) => {
          aggr[cat.id] = false;
          return aggr;
        }, {})
        this.setState({ loadedCategories: true, ...stateCats })
      })
  }

  handleInputChange = (event) => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    }, () => console.log(this.state));
  }

  exportProjects = () => {
    let ids = this.categories.map((cat) => cat.id);
    let categoryIds = [];
    for (let id of ids) {
      if (this.state[id]) {
        categoryIds.push(id);
      }
    }

    api.run('exportProjectAssigns', {categoryIds})
      .then((url) => {
        // alert(url);
        window.open(url, '_blank');
      })
  }

  render() {
    return (
      <FlexVertical>
        { this.state.loadedCategories &&
          this.categories.map((cat) => 
            <React.Fragment key={cat.id}>

              <label>
                {cat.get('name')}:
                <input
                  name={cat.id}
                  type="checkbox"
                  checked={this.state[cat.id]}
                  onChange={this.handleInputChange} />
              </label>
              <br/>

            </React.Fragment>
         )}

         <button className="button" onClick={this.exportProjects}>Export Projects</button>
      </FlexVertical>
    );
  }
}

const SaveButton = function({value}) {
  const onClick = useCallback(() => {
    api.run('exportUserQueues', {userId: value})
      .then((url) => {
        window.open(url, '_blank');
      })
  }, [value]);

  return <a href onClick={onClick}>Save</a>
}

// objectId, display_name, name, assocation, save
export default function Exports(props) {
  const [users, setUsers] = useState();

  useEffect(() => {
    api.getAllUsers()
      .then((users) => {
        setUsers(users)
      })
  }, [])

  return (
    <Styles.Container>

      { users && 
        <Styles.MarginVertical>
          <ReactDataGrid
            columns={[
              { key: 'display_name', name: 'Display Name' },
              { key: 'username', name: 'Username' },
              { key: 'assocation', name: 'Assocation' },
              { key: 'objectId', name: 'Save', formatter: SaveButton},
            ]}
            rowGetter={i => users[i]}
            rowsCount={users.length}
            minHeight={150}
          />
        </Styles.MarginVertical>
      }

      <Styles.MarginVertical>
        <FlexWrap>
          <ProjectsExport/>
        </FlexWrap>
      </Styles.MarginVertical>

    </Styles.Container>
  )
}