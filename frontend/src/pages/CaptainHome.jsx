import React, { useContext, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { IoLogOutOutline } from 'react-icons/io5'
import LiveTracking from '../componenets/liveTracking.jsx'
import CustomerRequestPanel from '../componenets/customerRequestPanel.jsx'
import CustomerInfoPanel from '../componenets/customerInfoPanel.jsx'
import TotalEarningPanel from '../componenets/totalEarningPanel.jsx'
import { SocketDataContext } from '../context/socketDataContext.js'
import { CaptainDataContext } from '../context/captainDataContext.js'

const CaptainHome = () => {
  const navigate = useNavigate()
  const [isRequestPanelOpen, setIsRequestPanelOpen] = useState(false)
  const [isCustomerInfoPanelOpen, setIsCustomerInfoPanelOpen] = useState(false)
  const [incomingRideRequest, setIncomingRideRequest] = useState(null)
  const [, setRideRequestQueue] = useState([])
  const [enteredOtp, setEnteredOtp] = useState('')
  const [otpVerificationStatus, setOtpVerificationStatus] = useState('idle')
  const [locationWarning, setLocationWarning] = useState(() => {
    if (!window.isSecureContext) {
      return 'Location sharing requires HTTPS. Open this page on a secure origin to enable live updates.'
    }

    if (!navigator.geolocation) {
      return 'This browser does not support location sharing.'
    }

    return ''
  })
  const { sendMessageToEvent, receiveMessageFromEvent } = useContext(SocketDataContext)
  const { captainData } = useContext(CaptainDataContext)

  const openNextQueuedRideRequest = () => {
    setRideRequestQueue((previousQueue) => {
      if (previousQueue.length === 0) {
        return previousQueue
      }

      const [nextRequest, ...remainingRequests] = previousQueue
      setIncomingRideRequest(nextRequest)
      setEnteredOtp('')
      setOtpVerificationStatus('idle')
      setIsRequestPanelOpen(true)

      return remainingRequests
    })
  }

  useEffect(() => {
    const unsubscribeNewRideRequest = receiveMessageFromEvent('newRideRequest', (payload) => {
      if (!payload?.rideId) {
        return
      }

      console.log('Received new ride request for captain:', payload)

      setRideRequestQueue((previousQueue) => {
        const isDuplicateInQueue = previousQueue.some((request) => request?.rideId === payload.rideId)
        const isDuplicateCurrentRide = incomingRideRequest?.rideId === payload.rideId

        if (isDuplicateInQueue || isDuplicateCurrentRide) {
          return previousQueue
        }

        if (!incomingRideRequest && !isCustomerInfoPanelOpen) {
          setIncomingRideRequest(payload)
          setEnteredOtp('')
          setOtpVerificationStatus('idle')
          setIsRequestPanelOpen(true)
          return previousQueue
        }

        return [...previousQueue, payload]
      })
    })

    return () => unsubscribeNewRideRequest()
  }, [incomingRideRequest, isCustomerInfoPanelOpen, receiveMessageFromEvent])

  useEffect(() => {
    const captainId = captainData?._id

    if (!captainId) {
      console.warn('Captain join event skipped: captainData._id is missing', { captainData })
      return
    }

    console.log('Setting up socket connection and joining room with captainId:', captainId)
    sendMessageToEvent('join', { userType: 'captain', userId: captainId })
  }, [captainData, sendMessageToEvent])

  useEffect(() => {
    const unsubscribeOtpResult = receiveMessageFromEvent('otpVerificationResultForCaptain', (payload) => {
      if (!payload?.rideId || payload.rideId !== incomingRideRequest?.rideId) {
        return
      }

      setOtpVerificationStatus(payload?.isValid ? 'success' : 'failed')
    })

    return () => unsubscribeOtpResult()
  }, [incomingRideRequest?.rideId, receiveMessageFromEvent])

  useEffect(() => {
    if (otpVerificationStatus === 'success') {
      const activeRideMeta = {
        rideId: incomingRideRequest?.rideId || null,
        origin: incomingRideRequest?.origin || '',
        destination: incomingRideRequest?.destination || '',
        pickupCoordinates: incomingRideRequest?.pickupCoordinates || null,
        destinationCoordinates: incomingRideRequest?.destinationCoordinates || null,
        fare: incomingRideRequest?.fare ?? null,
      }

      if (activeRideMeta.rideId) {
        localStorage.setItem('activeCaptainRideId', String(activeRideMeta.rideId))
        localStorage.setItem('activeCaptainRideMeta', JSON.stringify(activeRideMeta))
      }

      navigate('/captain-ride', {
        state: activeRideMeta,
      })
    }
  }, [incomingRideRequest, navigate, otpVerificationStatus])

  useEffect(() => {
    const captainId = captainData?._id

    if (!captainId) {
      return undefined
    }

    if (locationWarning) {
      console.warn('Captain location updates require HTTPS or localhost. Current origin:', window.location.origin)
      return undefined
    }

    const sendCaptainLocation = () => {
      if (!navigator.geolocation) {
        console.warn('Geolocation is not supported by this browser')
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords

          console.log('Sending captain location update:', {
            captainId,
            latitude,
            longitude,
          })

          sendMessageToEvent('updateLocationCaptain', {
            userType: 'captain',
            userId: captainId,
            location: {
              latitude,
              longitude,
            },
          })
        },
        (error) => {
          setLocationWarning(`Unable to access location: ${error.message}`)
          console.error('Unable to get captain location:', error.message)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        },
      )
    }

    sendCaptainLocation()
    const locationInterval = window.setInterval(sendCaptainLocation, 10000)

    return () => window.clearInterval(locationInterval)
  }, [captainData, sendMessageToEvent, locationWarning])

  const handleAcceptRide = () => {
    if (incomingRideRequest?.rideId) {
      localStorage.setItem('activeCaptainRideId', String(incomingRideRequest.rideId))
      const captainName = [captainData?.firstname, captainData?.lastname].filter(Boolean).join(' ').trim()

      sendMessageToEvent('captainUpdateRideStatus', {
        rideId: incomingRideRequest.rideId,
        status: 'accepted',
      })

      sendMessageToEvent('captainAcceptRide', {
        rideId: incomingRideRequest.rideId,
        captainId: captainData?._id,
        captainName,
      })
    }

    setIsRequestPanelOpen(false)
    setIsCustomerInfoPanelOpen(true)
  }

  const handleIgnoreRide = () => {
    if (incomingRideRequest?.rideId) {
      sendMessageToEvent('captainIgnoreRide', {
        rideId: incomingRideRequest.rideId,
      })
    }

    setIsRequestPanelOpen(false)
    setIncomingRideRequest(null)
    setEnteredOtp('')
    setOtpVerificationStatus('idle')
    openNextQueuedRideRequest()
  }

  const handleCloseCustomerInfo = () => {
    setIsCustomerInfoPanelOpen(false)
    setIncomingRideRequest(null)
    setEnteredOtp('')
    setOtpVerificationStatus('idle')
    openNextQueuedRideRequest()
  }

  const handleVerifyOtp = () => {
    const cleanedOtp = enteredOtp.trim()
    if (!incomingRideRequest?.rideId || !incomingRideRequest?.user?._id || cleanedOtp.length !== 6) {
      return
    }

    setOtpVerificationStatus('pending')

    sendMessageToEvent('verifyOtpWithUser', {
      rideId: incomingRideRequest.rideId,
      userId: incomingRideRequest.user._id,
      captainId: captainData?._id,
      enteredOtp: cleanedOtp,
    })
  }

  const handleConfirmRide = () => {
    if (otpVerificationStatus !== 'success') {
      return
    }

    const activeRideMeta = {
      rideId: incomingRideRequest?.rideId || null,
      origin: incomingRideRequest?.origin || '',
      destination: incomingRideRequest?.destination || '',
      pickupCoordinates: incomingRideRequest?.pickupCoordinates || null,
      destinationCoordinates: incomingRideRequest?.destinationCoordinates || null,
      fare: incomingRideRequest?.fare ?? null,
    }

    if (activeRideMeta.rideId) {
      localStorage.setItem('activeCaptainRideId', String(activeRideMeta.rideId))
      localStorage.setItem('activeCaptainRideMeta', JSON.stringify(activeRideMeta))
    }

    navigate('/captain-ride', {
      state: activeRideMeta,
    })
  }

  const requestCustomerName = [incomingRideRequest?.user?.fullname?.firstname, incomingRideRequest?.user?.fullname?.lastname]
    .filter(Boolean)
    .join(' ')
    || 'Unknown customer'
  const requestFare = incomingRideRequest?.fare != null ? `Rs ${incomingRideRequest.fare}` : 'Fare pending'
  const requestDistance = incomingRideRequest?.distanceText || 'Distance unavailable'
  const requestPickup = incomingRideRequest?.origin || 'Pickup unavailable'
  const requestDropoff = incomingRideRequest?.destination || 'Dropoff unavailable'
  const requestNote = incomingRideRequest?.user?.email
    ? `User email: ${incomingRideRequest.user.email}`
    : 'User contact details unavailable'

  return (
    <main className="relative h-screen w-full overflow-hidden bg-neutral-100 text-black">
      {locationWarning ? (
        <div className="absolute left-4 right-4 top-4 z-40 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900 shadow-md">
          {locationWarning}
        </div>
      ) : null}

      <div className="absolute inset-0 z-0">
        <LiveTracking 
          captainLocation={captainData?.location}
          pickupCoords={incomingRideRequest?.pickupCoordinates || null}
          destinationCoords={incomingRideRequest?.destinationCoordinates || null}
          pickupString={incomingRideRequest?.origin}
          destString={incomingRideRequest?.destination}
        />
      </div>
      <div className="absolute inset-0 bg-linear-to-b from-white/10 via-transparent to-white/20 pointer-events-none z-10" />

      <Link
        to="/captain-logout"
        aria-label="Logout captain"
        title="Logout"
        className="absolute right-4 top-4 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-white/95 text-black shadow-md backdrop-blur-sm transition hover:bg-white"
      >
        <IoLogOutOutline className="h-6 w-6" />
      </Link>

      {!isRequestPanelOpen && !isCustomerInfoPanelOpen ? (
        <div className="absolute inset-x-0 bottom-0 z-30">
          <TotalEarningPanel
            totalEarning="Rs 4,250"
            changeLabel="+12% from last week"
            completedRides="18 rides"
            onlineHours="7h 20m"
          />
        </div>
      ) : null}



      {isRequestPanelOpen ? (
        <CustomerRequestPanel
          customerName={requestCustomerName}
          fare={requestFare}
          distance={requestDistance}
          pickup={requestPickup}
          dropoff={requestDropoff}
          onAccept={handleAcceptRide}
          onIgnore={handleIgnoreRide}
        />
      ) : null}

      {isCustomerInfoPanelOpen ? (
        <CustomerInfoPanel
          customerName={requestCustomerName}
          fare={requestFare}
          distance={requestDistance}
          pickup={requestPickup}
          dropoff={requestDropoff}
          note={requestNote}
          otpValue={enteredOtp}
          verificationStatus={otpVerificationStatus}
          onOtpChange={setEnteredOtp}
          onVerifyOtp={handleVerifyOtp}
          onClose={handleCloseCustomerInfo}
          onConfirm={handleConfirmRide}
        />
      ) : null}
    </main>
  )
}

export default CaptainHome
