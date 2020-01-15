import React from 'react'
import ReactDataGrid from 'react-data-grid';
import api from '../../ParseApi'

export default class Judges extends React.Component {
  judges = [];
  columns = [
    { name: 'ID', key: 'objectId' },
    { name: 'Username', key: 'username' },
    { name: 'Display Name', key: 'display_name' },
    { name: 'Password', key: 'password' },
    { name: 'Email', key: 'email' },
  ]

  state = {
    isReady: false,
  }

  componentDidMount() {
    this.getUsers();
  }

  getUsers() {
    return api.getAllUsers()
      .then((users) => {
        return users.map((item) => {
          return {
            username: item.username,
            password: '',
            email: item.email,
            display_name: item.display_name,
            objectId: item.objectId
          }
        });
      })
      .then((users) => {
        console.log(users);
        this.judges = users
      })
      .then(() => this.setState({isReady: true}))
  }

  render() {
    if (!this.state.isReady) {
      return 'Loading...'
    }

    return (
      <ReactDataGrid
        columns={this.columns}
        rowGetter={i => this.judges[i]}
        rowsCount={this.judges.length}
        minHeight={300}
      />
    );
  }
}