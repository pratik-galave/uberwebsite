import React, { useEffect, useState } from 'react'
import axios from 'axios'
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

    const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:3000'

    const loadCaptainProfile = async () => {
      try {
        const response = await axios.get(`${baseUrl}/captain/profile`, {
          headers: {
            Authorization: `Bearer ${captainToken}`,
          },
        })

        if (response.data?.captain) {
          const normalizedCaptain = normalizeCaptainData(response.data.captain)
          setCaptainData(normalizedCaptain)
        }
      } catch (error) {
        console.error('Failed to load captain profile:', error)
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
