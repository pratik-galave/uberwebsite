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
      try { storedMeta = JSON.parse(storedValue) } catch { storedMeta = {} }
    }
    return {
      rideId: stateMeta.rideId || storedMeta.rideId || localStorage.getItem('activeUserRideId') || null,
      fare: stateMeta.fare ?? storedMeta.fare ?? null,
    }
  }, [location.state])

  const fareDisplay = rideMeta.fare != null ? `₹${rideMeta.fare}` : 'Fare pending'

  const handleMakePayment = () => setIsPaymentDone(true)

  const handleDone = () => {
    if (!isPaymentDone) return
    localStorage.removeItem('activeUserRideId')
    localStorage.removeItem('activeUserRideMeta')
    navigate('/home', { replace: true })
  }

  return (
    <main className="fixed inset-0 w-full overflow-hidden bg-background text-on-surface flex flex-col justify-end">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
           style={{ backgroundImage: 'radial-gradient(#1a1b22 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

      <div className="relative w-full max-w-md mx-auto">
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
