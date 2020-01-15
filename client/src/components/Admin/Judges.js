import React from 'react'
// import PropTypes from 'prop-types'
import MaterialTable from 'material-table'
import api from '../../ParseApi'

const CategoriesField = function(props) {
  return (
    <label className="checkbox">
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
    onRowUpdate: (newData, oldData) =>
      new Promise((resolve, reject) => {
        let update = {
          username: newData.username,
          email: newData.email,
          display_name: newData.display_name,
        }

        if (newData.password !== "") {
          update.password = newData.password;
        }

        let categories = [];
        this.categoryIds.forEach((categoryId) => {
          let key = this.getCategoryKey(categoryId);
          if (newData[key]) {
            categories.push(categoryId);
          }
        });

        return api.setCategoriesOfJudge(newData.objectId, categories)
          .then(() => resolve())
          .catch((err) => {
            console.error(err);
            alert('Failed to set categories of judge')
            reject();
          })
    }),
    onRowDelete: oldData => api.deleteCriteria(oldData.objectId),
  }

  tableColumns = [
    { title: 'Username', field: 'username' },
    { title: 'Password', field: 'password' },
    { title: 'Email', field: 'email' },
    { title: 'Display Name', field: 'display_name' },
  ]

  categoryIds = [];

  state = {
    isReady: false,
  }

  componentDidMount() {
    this.initCategories();
  }

  /**
   * Generates a key for the MaterialTable column key for a category
   * @param {string} categoryId The objectId of the category object
   */
  getCategoryKey(categoryId) {
    return `cat_${categoryId}`;
  }

  parseCategoryIdFromKey(columnKey) {
    if (!columnKey.startsWith('cat_')) {
      throw new Error("Invalid key. Doesn't start with 'cat_'");
    }

    return columnKey.slice(4);
  }

  /**
   * Fetches all possible categories and creates new columns for each.
   */
  initCategories() {
    api.getAllCategories()
      .then((categories) => {
        
        categories.forEach((category) => {
          let id = category.id;
          this.categoryIds.push(category.id);
          let name = category.get('name');
          this.tableColumns.push({
            title: name,
            field: this.getCategoryKey(id),
            type: 'boolean',
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
        columns={this.tableColumns}
        data={query =>
          new Promise((resolve, reject) => {
            api.getAllUsers()
              .then((users) => {

                let mapUser = async (item) => {
                  let userData = {
                    username: item.username,
                    password: '',
                    email: item.email,
                    display_name: item.display_name,
                    objectId: item.objectId
                  }

                  let categories = await api.getCategoriesOfJudge(item.objectId);
                  if(categories) {
                    categories.forEach((categoryId) => {
                      let key = this.getCategoryKey(categoryId);
                      userData[key] = true;
                    })
                  }

                  return userData;
                };

                return Promise.all(users.map(mapUser));
                
              }).then((users) => {
                console.log(users);
                return resolve({data: users});
              })
          })
        }
        options={{
          paging: false,
          sorting: false,
          search: false,
        }}
        editable={this.editFuncs}
      />
    )
  }
}