import React from 'react'
// import PropTypes from 'prop-types'
import api from '../../ParseApi'
import MaterialTable, { MTableToolbar } from 'material-table'

import CategoryDropdown from './CategoryDropdown'

export default class Criteria extends React.Component {
  editFuncs = {
    isEditable: rowData => true,
    isDeletable: rowData => true,
    onRowAdd: newData =>
      new Promise((resolve, reject) => {
        let {name, accessor, maxScore, description, order} = newData;
        api.createCriterion(name, accessor, description, order, maxScore, this.state.categoryId)
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
        
        return api.updateCriteria(newData.objectId, update)
          .then(() => resolve())
          .catch((err) => {
            let errMsg = `Error: Failed to update criterion. ${err}`;
            alert(errMsg)
            reject(errMsg);
          });
      }),
    onRowDelete: oldData => api.deleteCriteria(oldData.objectId),
  }

  state = {
    categoryId: null,
  }

  tableRef = React.createRef();

  componentDidMount() {
    api.getCriteria()
      .then((criteria) => {
      })
  }

  getCriteria = () => {
    return api.getCriteria(this.state.categoryId)
      .then((criteria) => {
        
        let ret = criteria.map((item) => {
          return {
            order: item.order,
            name: item.name,
            accessor: item.accessor,
            description: item.description,
            maxScore: item.maxScore,
          }
        })
        
        return { data: ret }
      })
  }

  onSelect = (categoryId) => {
    this.setState({categoryId}, () => {
      if (this.tableRef.current) {
        this.tableRef.current.onQueryChange();
      }
    })
  }

  render() {
    return (
      <MaterialTable
        tableRef={this.tableRef}
        components={{
          Toolbar: props => (
            <div>
              <MTableToolbar {...props} />
              <div style={{padding: '0px 10px'}}>
                <CategoryDropdown
                  onSelect={this.onSelect}
                  selected={this.state.categoryId}
                />
              </div>
            </div>
          ),
        }}
        title='Judging Criteria'
        data={this.getCriteria}
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
          search: false,
        }}
        editable={this.editFuncs}
      />
    )
  }
}