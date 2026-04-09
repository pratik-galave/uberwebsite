import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const UserRestrictedWrapper = ({ children }) => {
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login', { replace: true })
    }
  }, [navigate])

  const token = localStorage.getItem('token')
  if (!token) {
    return null
  }

  return <>{children}</>
}

export default UserRestrictedWrapper