import React from 'react'
// import PropTypes from 'prop-types'
import MaterialTable from 'material-table'
import api from '../../ParseApi'

export default class Criteria extends React.Component {
  editFuncs = {
    isEditable: rowData => true,
    isDeletable: rowData => true,
    onRowAdd: newData =>
      new Promise((resolve, reject) => {
        console.log(newData);
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
          order: newData.order,
          name: newData.name,
          accessor: newData.accessor,
          description: newData.description,
          maxScore: newData.maxScore,
          isGeneral: newData.isGeneral,
        }
        api.updateCriteria(newData.objectId, update)
          .then(() => resolve())
          .catch((err) => {
            let errMsg = `Error: Failed to update criterion. ${err}`;
            alert(errMsg)
            reject(errMsg);
          });
      }),
    onRowDelete: oldData => api.deleteCriteria(oldData.objectId),
  }

  componentDidMount() {
    api.getGeneralCriteria()
      .then((criteria) => {
        console.log(criteria)
      })
  }

  render() {
    return (
      <MaterialTable
        title='Judging Criteria'
        data={query =>
          new Promise((resolve, reject) => {
            api.getGeneralCriteria()
              .then((criteria) => {
                
                let ret = criteria.map((item) => {
                  return {
                    order: item.order,
                    name: item.name,
                    description: item.description,
                    maxScore: item.maxScore,
                  }
                })
                
                resolve({ data: ret })
              })
          })
        }
        columns={[
          { title: 'Order', field: 'order', type: 'numeric' },
          { title: 'Name', field: 'name' },
          { title: 'accessor', field: 'accessor' },
          { title: 'Description', field: 'description' },
          { title: 'Max Score', field: 'maxScore', type: 'numeric' },
        ]}
        options={{
          paging: false,
          sorting: false,
        }}
        editable={this.editFuncs}
      />
    )
  }
}