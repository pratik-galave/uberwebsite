import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { BASE_URL } from '../config'
import { CaptainDataContext } from './captainDataContext'

const getCaptainIdFromToken = (token) => {
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

const normalizeCaptainData = (captain, fallbackId = '') => ({
  _id: captain?._id || fallbackId || '',
  email: captain?.email ?? '',
  firstname: captain?.fullname?.firstname ?? '',
  lastname: captain?.fullname?.lastname ?? '',
  vehicleColor: captain?.vehicle?.color ?? '',
  vehiclePlate: captain?.vehicle?.vehiclePlate ?? '',
  vehicleCapacity: captain?.vehicle?.capacity?.toString?.() ?? '',
  vehicleType: captain?.vehicle?.vehicleType ?? '',
})

const CaptainContext = ({ children }) => {
  const [captainData, setCaptainData] = useState(() => {
    const captainToken = localStorage.getItem('captainToken')
    const captainId = captainToken ? getCaptainIdFromToken(captainToken) : ''

    return {
      _id: captainId || '',
      email: '',
      firstname: '',
      lastname: '',
      vehicleColor: '',
      vehiclePlate: '',
      vehicleCapacity: '',
      vehicleType: '',
    }
  })

  useEffect(() => {
    const captainToken = localStorage.getItem('captainToken')
    if (!captainToken) {
      return
    }

    const loadCaptainProfile = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/captain/profile`, {
          headers: {
            Authorization: `Bearer ${captainToken}`,
          },
        })

        if (response.data?.captain) {
          const normalizedCaptain = normalizeCaptainData(response.data.captain)
          setCaptainData(normalizedCaptain)
        }
      } catch (error) {
        if (error?.response?.status !== 401) {
          console.error('Failed to load captain profile:', error)
        }
      }
    }

    loadCaptainProfile()
  }, [])

  return (
    <CaptainDataContext.Provider value={{ captainData, setCaptainData }}>
      {children}
    </CaptainDataContext.Provider>
  )
}

export default CaptainContext
