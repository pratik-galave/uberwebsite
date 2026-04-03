import React, { useState } from 'react'
import { UserDataContext } from './userDataContext'

const UserContext = ({ children }) => {
  const [userData, setUserData] = useState({
    email: '',
    firstname: '',
    lastname: '',
  })

  return (
    <UserDataContext.Provider value={[userData, setUserData]}>
      {children}
    </UserDataContext.Provider>
  )
}

export default UserContext