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

  const fareDisplay = rideMeta.fare != null ? `₹${rideMeta.fare}` : 'Fare pending'

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
    <main className="relative min-h-screen overflow-hidden bg-background text-on-background antialiased">
      {/* Abstract Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary-container/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-on-tertiary-container/5 blur-[150px] rounded-full pointer-events-none"></div>

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
