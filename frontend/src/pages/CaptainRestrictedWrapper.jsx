import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const CaptainRestrictedWrapper = ({ children }) => {
  const navigate = useNavigate()

  useEffect(() => {
    const captainToken = localStorage.getItem('captainToken')
    if (!captainToken) {
      navigate('/captain-login', { replace: true })
    }
  }, [navigate])

  const captainToken = localStorage.getItem('captainToken')
  if (!captainToken) {
    return null
  }

  return <>{children}</>
}

export default CaptainRestrictedWrapper
