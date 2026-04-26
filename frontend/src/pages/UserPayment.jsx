import React, { useMemo, useState, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import MakePaymentPanel from '../componenets/makePaymentPanel.jsx'

const UserPayment = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [paymentStatus, setPaymentStatus] = useState('pending') // pending | processing | success | failed
  const [paymentError, setPaymentError] = useState('')

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

  const fareAmount = rideMeta.fare != null ? Number(rideMeta.fare) : 0
  const fareDisplay = fareAmount > 0 ? `₹${fareAmount}` : 'Fare pending'

  const handleMakePayment = useCallback(async () => {
    if (fareAmount <= 0) {
      setPaymentError('Invalid fare amount')
      return
    }

    const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:3000'
    const token = localStorage.getItem('token')

    if (!token) {
      setPaymentError('You are not logged in. Please login again.')
      return
    }

    try {
      setPaymentStatus('processing')
      setPaymentError('')

      // Step 1: Create a Razorpay order via backend (fare is fetched from DB server-side)
      const { data } = await axios.post(
        `${baseUrl}/payment/create-order`,
        { rideId: rideMeta.rideId },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (!data.success || !data.order) {
        throw new Error(data.error || 'Failed to create payment order')
      }

      const { order, key } = data

      // Step 2: Open Razorpay Checkout
      const options = {
        key: key,
        amount: order.amount,
        currency: order.currency,
        name: 'Velocity',
        description: `Ride Payment${rideMeta.rideId ? ` - ${rideMeta.rideId.slice(-6).toUpperCase()}` : ''}`,
        order_id: order.id,
        handler: async function (response) {
          // Step 3: Verify payment on backend
          try {
            const verifyRes = await axios.post(
              `${baseUrl}/payment/verify`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                rideId: rideMeta.rideId,
              },
              { headers: { Authorization: `Bearer ${token}` } }
            )

            if (verifyRes.data.success) {
              setPaymentStatus('success')
            } else {
              setPaymentStatus('failed')
              setPaymentError('Payment verification failed. Contact support.')
            }
          } catch (verifyErr) {
            console.error('Verification error:', verifyErr)
            setPaymentStatus('failed')
            setPaymentError('Payment verification failed. Please contact support.')
          }
        },
        prefill: {
          name: '',
          email: '',
          contact: '',
        },
        theme: {
          color: '#00E5CC', // matches Velocity primary accent
        },
        modal: {
          ondismiss: function () {
            setPaymentStatus('pending')
            setPaymentError('Payment was cancelled')
          },
        },
      }

      // Check if Razorpay script is loaded
      if (typeof window.Razorpay === 'undefined') {
        throw new Error('Payment service is not loaded. Please refresh and try again.')
      }

      const rzp = new window.Razorpay(options)

      rzp.on('payment.failed', function (response) {
        setPaymentStatus('failed')
        setPaymentError(
          response.error?.description || 'Payment failed. Please try again.'
        )
      })

      rzp.open()
    } catch (error) {
      console.error('Payment error:', error)
      setPaymentStatus('pending')
      setPaymentError(
        error?.response?.data?.error || error.message || 'Something went wrong. Please try again.'
      )
    }
  }, [fareAmount, rideMeta.rideId])

  const handleDone = () => {
    localStorage.removeItem('activeUserRideId')
    localStorage.removeItem('activeUserRideMeta')
    navigate('/home', { replace: true })
  }

  const handleRetry = () => {
    setPaymentStatus('pending')
    setPaymentError('')
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
          paymentStatus={paymentStatus}
          paymentError={paymentError}
          onMakePayment={handleMakePayment}
          onDone={handleDone}
          onRetry={handleRetry}
        />
      </div>
    </main>
  )
}

export default UserPayment
