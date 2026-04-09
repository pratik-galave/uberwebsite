import React, { useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserDataContext } from '../context/userDataContext.js'

const UserLogout = () => {
  const navigate = useNavigate()
  const { setUserData } = useContext(UserDataContext)

  useEffect(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('userData')
    setUserData({
      _id: '',
      email: '',
      firstname: '',
      lastname: '',
    })

    navigate('/login', { replace: true })
  }, [navigate, setUserData])

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-200 px-6 text-black">
      <p className="text-lg font-medium">Logging you out...</p>
    </main>
  )
}

export default UserLogout
