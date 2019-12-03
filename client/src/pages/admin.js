import React from 'react';
import UserHoc from 'components/hoc/user';
import Admin from 'components/Admin';

function AdminPage (props) {
  return (
    <Admin {...props}/>
  )
}

export default UserHoc(AdminPage);