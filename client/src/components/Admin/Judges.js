import React from 'react'
// import PropTypes from 'prop-types'
import MaterialTable from 'material-table'
import api from '../../ParseApi'

const CategoriesField = function(props) {
  return (
    <label class="checkbox">
      <input type="checkbox"/>
    </label>
  )
}

export default class Judges extends React.Component {
  editFuncs = {
    isEditable: rowData => 'admin' !== rowData.username,
    isDeletable: rowData => true,
    onRowAdd: newData =>
      new Promise((resolve, reject) => {
        let {name, accessor, maxScore, description, order} = newData;
        api.addGeneralCriteria(name, accessor, description, order, maxScore)
          .then(() => resolve())
          .catch((err) => {
            let errMsg = `Error: Failed to add new criterion. ${err}`;
            alert(errMsg)
            reject(errMsg);
          });
      }),
    // onRowUpdate: (newData, oldData) =>
    //   new Promise((resolve, reject) => {
    //     reject();
    //   }),
    onRowDelete: oldData => api.deleteCriteria(oldData.objectId),
  }

  tableColumns = [
    { title: 'Username', field: 'username' },
    // { title: 'Password', field: 'password' },
    { title: 'Email', field: 'email' },
    { title: 'Display Name', field: 'display_name' },
  ]

  state = {
    isReady: false,
  }

  componentDidMount() {
    api.getAllCategories()
      .then((categories) => {
        
        categories.forEach((category) => {
          let id = category.id;
          let name = category.get('name');
          this.tableColumns.push({
            title: name,
            field: `cat[${id}]`,
            render: rowData => <CategoriesField/>
          })
        });

        this.setState({ isReady: true })
      })
  }

  render() {
    if (!this.state.isReady) {
      return "Loading..."
    }

    return (
      <MaterialTable
        title='Judging Criteria'
        data={query =>
          new Promise((resolve, reject) => {
            api.getAllUsers()
              .then((users) => {

                let mapUser = async (item) => {
                  let userData = {
                    username: item.username,
                    // password: item.password,
                    email: item.email,
                    display_name: item.display_name,
                    objectId: item.id
                  }

                  let categories = await api.getCategoriesOfJudge(item.id);
                  // todo: add category selects into table

                  return userData;
                };

                return Promise.all(users.map(mapUser));
                
              })
              .then((users) => {

              })
          })
        }
        columns={this.tableColumns}
        options={{
          paging: false,
          sorting: false,
        }}
        editable={this.editFuncs}
      />
    )
  }
}