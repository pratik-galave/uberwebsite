import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { BASE_URL } from '../config'
import { UserDataContext } from './userDataContext'

const getUserIdFromToken = (token) => {
  try {
    const payload = token.split('.')[1]
    if (!payload) {
      return null
    }

    const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/')
    const decodedPayload = JSON.parse(window.atob(normalizedPayload))
    return decodedPayload?._id || null
  } catch {
    return null
  }
}


const UserContext = ({ children }) => {
  const [userData, setUserData] = useState(() => {
    const token = localStorage.getItem('token')
    const tokenUserId = token ? getUserIdFromToken(token) : null

    return {
      _id: tokenUserId || '',
      email: '',
      firstname: '',
      lastname: '',
    }
  })

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      return
    }

    const loadUserProfile = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/user/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.data?.user) {
          setUserData(response.data.user)
        }
      } catch (error) {
        if (error?.response?.status !== 401) {
          console.error('Failed to load user profile:', error)
        }
      }
    }

    loadUserProfile()
  }, [])

  return (
    <UserDataContext.Provider value={{ userData, setUserData }}>
      {children}
    </UserDataContext.Provider>
  )
}

export default UserContext