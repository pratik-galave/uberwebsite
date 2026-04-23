import React, { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import MakePaymentPanel from '../componenets/makePaymentPanel.jsx'

const UserPayment = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [isPaymentDone, setIsPaymentDone] = useState(false)

  const rideMeta = useMemo(() => {
    const stateMeta = location.state && typeof location.state === 'object' ? location.state : {}
    const storedValue = localStorage.getItem('activeUserRideMeta')

    let storedMeta = {}
    if (storedValue) {
      try {
        storedMeta = JSON.parse(storedValue)
      } catch {
        storedMeta = {}
      }
    }

    return {
      rideId: stateMeta.rideId || storedMeta.rideId || localStorage.getItem('activeUserRideId') || null,
      fare: stateMeta.fare ?? storedMeta.fare ?? null,
    }
  }, [location.state])

  const fareDisplay = rideMeta.fare != null ? `Rs ${rideMeta.fare}` : 'Fare pending'

  const handleMakePayment = () => {
    setIsPaymentDone(true)
  }

  const handleDone = () => {
    if (!isPaymentDone) {
      return
    }

    localStorage.removeItem('activeUserRideId')
    localStorage.removeItem('activeUserRideMeta')
    navigate('/home', { replace: true })
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-neutral-100 text-black">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.95),rgba(245,245,245,0.9))]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-md items-end">
        <MakePaymentPanel
          customerName="You"
          fare={fareDisplay}
          isPaymentDone={isPaymentDone}
          onMakePayment={handleMakePayment}
          onDone={handleDone}
        />
      </div>
    </main>
  )
}

export default UserPayment
