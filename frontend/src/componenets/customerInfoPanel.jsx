import React, { useContext, useRef, useState } from 'react'
import { SocketDataContext } from '../context/socketDataContext.js'

const CustomerInfoPanel = ({ rideId, captainId, passengerName, pickupLocation, destination, fare, onStartRide, onClose }) => {
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', ''])
  const [otpStatus, setOtpStatus] = useState('idle') // idle | verifying | verified | error
  const [otpError, setOtpError] = useState('')
  const inputRefs = useRef([])
  const { sendMessageToEvent, receiveMessageFromEvent } = useContext(SocketDataContext)

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return
    const newValues = [...otpValues]
    newValues[index] = value.slice(-1)
    setOtpValues(newValues)
    setOtpError('')
    setOtpStatus('idle')
    if (value && index < 5) inputRefs.current[index + 1]?.focus()
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pasted) return
    const newValues = [...otpValues]
    for (let i = 0; i < 6; i++) newValues[i] = pasted[i] || ''
    setOtpValues(newValues)
    const nextEmpty = newValues.findIndex((v) => !v)
    const focusIndex = nextEmpty === -1 ? 5 : nextEmpty
    inputRefs.current[focusIndex]?.focus()
  }

  const handleVerify = () => {
    const otp = otpValues.join('')
    if (otp.length !== 6) { setOtpError('Please enter the full 6-digit code'); return }

    setOtpStatus('verifying')
    sendMessageToEvent('otpVerificationRequested', { rideId, captainId, enteredOtp: otp })

    const unsubscribe = receiveMessageFromEvent('otpVerificationResult', (payload) => {
      if (String(payload?.rideId) !== String(rideId)) return
      unsubscribe()
      if (payload.isValid) {
        setOtpStatus('verified')
        if (onStartRide) onStartRide()
      } else {
        setOtpStatus('error')
        setOtpError('Invalid OTP. Please check and try again.')
        setOtpValues(['', '', '', '', '', ''])
        inputRefs.current[0]?.focus()
      }
    })

    setTimeout(() => {
      if (otpStatus === 'verifying') {
        setOtpStatus('error')
        setOtpError('Verification timed out. Please try again.')
      }
    }, 15000)
  }

  return (
    <div className="rounded-t-2xl bg-surface-container-lowest border-t border-outline-variant/20 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
      <div className="flex justify-center pt-3 pb-1">
        <div className="h-1 w-10 rounded-full bg-outline-variant/30" />
      </div>

      <div className="px-6 py-3">
        <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1">Ride Details</p>
        <h2 className="font-display text-xl font-extrabold tracking-tight text-on-surface">Customer Info</h2>
      </div>

      {/* Passenger */}
      <div className="mx-6 flex items-center gap-4 rounded-lg bg-surface-container-low border border-outline-variant/15 p-4 mb-4">
        <div className="h-12 w-12 rounded-full bg-surface-container border border-outline-variant/20 flex items-center justify-center">
          <span className="material-symbols-outlined text-2xl text-on-surface-variant">person</span>
        </div>
        <div className="flex-1">
          <p className="text-base font-bold text-on-surface">{passengerName || 'Passenger'}</p>
          {fare && <p className="text-sm font-extrabold text-primary mt-0.5">{fare}</p>}
        </div>
      </div>

      {/* Route */}
      <div className="mx-6 rounded-lg border border-outline-variant/15 overflow-hidden mb-4">
        <div className="flex items-start gap-3 p-4 border-b border-outline-variant/10">
          <div className="h-3 w-3 mt-0.5 rounded-full bg-primary-container border-2 border-primary shrink-0" />
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-0.5">Pickup</p>
            <p className="text-sm text-on-surface truncate">{pickupLocation || 'Pickup'}</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-4">
          <div className="h-3 w-3 mt-0.5 rounded-sm bg-on-surface shrink-0" />
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-0.5">Drop-off</p>
            <p className="text-sm text-on-surface truncate">{destination || 'Destination'}</p>
          </div>
        </div>
      </div>

      {/* OTP Entry */}
      <div className="mx-6 rounded-lg border border-outline-variant/15 p-4 mb-4">
        <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-3">Verify Passenger OTP</p>
        <div className="flex justify-center gap-2 mb-3" onPaste={handlePaste}>
          {otpValues.map((val, i) => (
            <input
              key={i}
              ref={(el) => (inputRefs.current[i] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={val}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className={`h-12 w-12 rounded-lg border text-center text-lg font-bold text-on-surface outline-none transition-all ${
                otpStatus === 'verified'
                  ? 'border-primary bg-primary-container/15'
                  : otpStatus === 'error'
                    ? 'border-error bg-error-container/15'
                    : 'border-outline-variant bg-surface focus:border-primary focus:ring-2 focus:ring-primary-container'
              }`}
            />
          ))}
        </div>
        {otpError && <p className="text-xs text-error text-center">{otpError}</p>}
        {otpStatus === 'verified' && (
          <p className="text-xs text-primary text-center font-bold">✓ Verified successfully</p>
        )}
      </div>

      <div className="px-6 pb-6 flex gap-3">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 rounded-lg border border-outline-variant/30 bg-surface py-3.5 text-sm font-bold text-on-surface uppercase tracking-wider hover:bg-surface-container-low transition-colors"
        >
          Close
        </button>
        <button
          type="button"
          onClick={handleVerify}
          disabled={otpValues.join('').length !== 6 || otpStatus === 'verifying' || otpStatus === 'verified'}
          className="flex-[2] flex items-center justify-center gap-2 rounded-lg bg-primary-container text-on-primary-container py-3.5 text-sm font-bold uppercase tracking-wider disabled:opacity-40 hover:brightness-95 transition-all"
        >
          {otpStatus === 'verifying' ? 'Verifying...' : otpStatus === 'verified' ? 'Verified ✓' : 'Verify OTP'}
        </button>
      </div>
    </div>
  )
}

export default CustomerInfoPanel