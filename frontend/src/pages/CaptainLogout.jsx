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
    <main className="flex min-h-screen items-center justify-center bg-background px-6 text-on-surface">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-outline/20 border-t-primary-container"></div>
        <p className="font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant">Signing out...</p>
      </div>
    </main>
  )
}

export default CaptainLogout
