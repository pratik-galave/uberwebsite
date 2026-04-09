import React, { useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CaptainDataContext } from '../context/captainDataContext.js'

const CaptainLogout = () => {
  const navigate = useNavigate()
  const { setCaptainData } = useContext(CaptainDataContext)

  useEffect(() => {
    localStorage.removeItem('captainToken')
    localStorage.removeItem('captainData')
    setCaptainData({
      _id: '',
      email: '',
      firstname: '',
      lastname: '',
      vehicleColor: '',
      vehiclePlate: '',
      vehicleCapacity: '',
      vehicleType: '',
    })

    navigate('/captain-login', { replace: true })
  }, [navigate, setCaptainData])

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-200 px-6 text-black">
      <p className="text-lg font-medium">Logging captain out...</p>
    </main>
  )
}

export default CaptainLogout
