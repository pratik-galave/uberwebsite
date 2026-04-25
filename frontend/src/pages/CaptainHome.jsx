import React, { useContext, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
  const [currentLocation, setCurrentLocation] = useState(null)
  
  const [captainStats, setCaptainStats] = useState(() => {
    const today = new Date().toLocaleDateString('en-CA')
    const stored = localStorage.getItem('captainStats')
    if (stored) {
      try { 
        const stats = JSON.parse(stored)
        if (stats.lastResetDate !== today) {
          return { earnings: 0, rides: 0, onlineSeconds: 0, lastResetDate: today }
        }
        return stats
      } catch (error) {
        console.error('Failed to parse captain stats:', error)
      }
    }
    return { earnings: 0, rides: 0, onlineSeconds: 0, lastResetDate: today }
  })

  useEffect(() => {
    const checkAndResetStats = () => {
      const today = new Date().toLocaleDateString('en-CA')
      const stored = localStorage.getItem('captainStats')
      
      if (stored) {
        try {
          const stats = JSON.parse(stored)
          if (stats.lastResetDate !== today) {
            const resetStats = { earnings: 0, rides: 0, onlineSeconds: 0, lastResetDate: today }
            setCaptainStats(resetStats)
            localStorage.setItem('captainStats', JSON.stringify(resetStats))
          }
        } catch (error) {
          console.error('Failed to reset captain stats:', error)
        }
      } else {
        const initialStats = { earnings: 0, rides: 0, onlineSeconds: 0, lastResetDate: today }
        setCaptainStats(initialStats)
        localStorage.setItem('captainStats', JSON.stringify(initialStats))
      }
    }

    checkAndResetStats()
    const interval = setInterval(checkAndResetStats, 60000)
    return () => clearInterval(interval)
  }, [])

  const formatOnlineHours = (totalSeconds) => {
    const hours = (totalSeconds / 3600).toFixed(1)
    return hours
  }

  const [locationWarning, setLocationWarning] = useState(() => {
    if (!window.isSecureContext) {
      return 'Location sharing requires HTTPS.'
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
      if (previousQueue.length === 0) return previousQueue
      const [nextRequest, ...remainingRequests] = previousQueue
      setIncomingRideRequest(nextRequest)
      setIsRequestPanelOpen(true)
      return remainingRequests
    })
  }

  useEffect(() => {
    const unsubscribeNewRideRequest = receiveMessageFromEvent('newRideRequest', (payload) => {
      if (!payload?.rideId) return
      console.log('Received new ride request for captain:', payload)
      setRideRequestQueue((previousQueue) => {
        const isDuplicateInQueue = previousQueue.some((request) => request?.rideId === payload.rideId)
        const isDuplicateCurrentRide = incomingRideRequest?.rideId === payload.rideId
        if (isDuplicateInQueue || isDuplicateCurrentRide) return previousQueue
        if (!incomingRideRequest && !isCustomerInfoPanelOpen) {
          setIncomingRideRequest(payload)
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
    if (!captainId) return
    sendMessageToEvent('join', { userType: 'captain', userId: captainId })
  }, [captainData, sendMessageToEvent])



  useEffect(() => {
    const captainId = captainData?._id
    if (!captainId) return undefined
    if (locationWarning) return undefined

    const sendCaptainLocation = () => {
      if (!navigator.geolocation) return
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setCurrentLocation({ latitude, longitude })
          sendMessageToEvent('updateLocationCaptain', {
            userType: 'captain',
            userId: captainId,
            location: { latitude, longitude },
          })
        },
        (error) => {
          setLocationWarning(`Unable to access location: ${error.message}`)
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
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
      sendMessageToEvent('captainUpdateRideStatus', { rideId: incomingRideRequest.rideId, status: 'accepted' })
      sendMessageToEvent('captainAcceptRide', { rideId: incomingRideRequest.rideId, captainId: captainData?._id, captainName })
    }
    setIsRequestPanelOpen(false)
    setIsCustomerInfoPanelOpen(true)
  }

  const handleIgnoreRide = () => {
    if (incomingRideRequest?.rideId) {
      sendMessageToEvent('captainIgnoreRide', { rideId: incomingRideRequest.rideId })
    }
    setIsRequestPanelOpen(false)
    setIncomingRideRequest(null)
    openNextQueuedRideRequest()
  }

  const handleCloseCustomerInfo = () => {
    setIsCustomerInfoPanelOpen(false)
    setIncomingRideRequest(null)
    openNextQueuedRideRequest()
  }

  const handleConfirmRide = () => {
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
    navigate('/captain-ride', { state: activeRideMeta })
  }

  const requestCustomerName = [incomingRideRequest?.user?.fullname?.firstname, incomingRideRequest?.user?.fullname?.lastname]
    .filter(Boolean).join(' ') || 'Unknown customer'
  const requestFare = incomingRideRequest?.fare != null ? `₹${incomingRideRequest.fare}` : 'Fare pending'
  const requestPickup = incomingRideRequest?.origin || 'Pickup unavailable'
  const requestDropoff = incomingRideRequest?.destination || 'Dropoff unavailable'

  const captainName = [captainData?.fullname?.firstname, captainData?.fullname?.lastname].filter(Boolean).join(' ') || 'Captain'

  return (
    <main className="fixed inset-0 w-full overflow-hidden bg-background text-on-surface">
      {/* Location Warning */}
      {locationWarning && (
        <div className="absolute left-6 right-6 top-6 z-[60] rounded-lg bg-error-container border border-error/30 px-4 py-3">
          <div className="flex items-start gap-2">
            <span className="material-symbols-outlined text-lg text-on-error-container">warning</span>
            <p className="text-xs font-medium text-on-error-container">{locationWarning}</p>
          </div>
        </div>
      )}

      {/* Map */}
      <div className="absolute inset-0 z-0">
        <LiveTracking 
          captainLocation={currentLocation || captainData?.location}
          pickupCoords={incomingRideRequest?.pickupCoordinates || null}
          destinationCoords={incomingRideRequest?.destinationCoordinates || null}
          pickupString={incomingRideRequest?.origin}
          destString={incomingRideRequest?.destination}
        />
      </div>
      
      {/* Top Bar */}
      <div className="absolute top-6 left-6 z-20 flex items-center gap-3">
        <img src="/velocity_logo_v2.png" alt="Velocity" className="h-14" />
        <span className="rounded-full bg-surface-container-lowest/90 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-primary border border-outline-variant/20 shadow-sm backdrop-blur-sm">Captain</span>
      </div>

      <Link
        to="/captain-logout"
        className="absolute right-6 top-6 z-20 flex h-10 w-10 items-center justify-center rounded-lg bg-surface-container-lowest/95 border border-outline-variant/20 text-on-surface-variant shadow-sm backdrop-blur-sm hover:text-error transition-colors"
      >
        <span className="material-symbols-outlined text-xl">power_settings_new</span>
      </Link>

      {/* Default: Earnings Panel */}
      {!isRequestPanelOpen && !isCustomerInfoPanelOpen && (
        <div className="absolute inset-x-0 bottom-0 z-30">
          <TotalEarningPanel
            earnings={Math.floor(captainStats.earnings)}
            rides={captainStats.rides}
            onlineHours={formatOnlineHours(captainStats.onlineSeconds)}
            onClose={() => {}}
          />
        </div>
      )}

      {/* Incoming Request */}
      {isRequestPanelOpen && (
        <div className="absolute inset-x-0 bottom-0 z-40">
          <CustomerRequestPanel
            passengerName={requestCustomerName}
            fare={requestFare}
            pickupLocation={requestPickup}
            destination={requestDropoff}
            onAccept={handleAcceptRide}
            onIgnore={handleIgnoreRide}
          />
        </div>
      )}

      {/* Customer Info / OTP */}
      {isCustomerInfoPanelOpen && (
        <div className="absolute inset-x-0 bottom-0 z-40">
          <CustomerInfoPanel
            rideId={incomingRideRequest?.rideId}
            captainId={captainData?._id}
            userId={incomingRideRequest?.user?._id}
            passengerName={requestCustomerName}
            fare={requestFare}
            pickupLocation={requestPickup}
            destination={requestDropoff}
            onStartRide={handleConfirmRide}
            onClose={handleCloseCustomerInfo}
          />
        </div>
      )}
    </main>
  )
}

export default CaptainHome
