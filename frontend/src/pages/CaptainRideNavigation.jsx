import React, { useContext, useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { SocketDataContext } from '../context/socketDataContext.js'
import { CaptainDataContext } from '../context/captainDataContext.js'
import LiveTracking from '../componenets/liveTracking.jsx'

const CaptainRideNavigation = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [isRideStarted, setIsRideStarted] = useState(() => {
    return localStorage.getItem('isRideStarted') === 'true'
  })
  const [rideStartTime, setRideStartTime] = useState(() => {
    const stored = localStorage.getItem('rideStartTime')
    return stored ? parseInt(stored, 10) : null
  })
  const [captainLocation, setCaptainLocation] = useState(null)
  const [isPanelOpen, setIsPanelOpen] = useState(true)
  const [touchStartY, setTouchStartY] = useState(0)

  const handleTouchStart = (e) => setTouchStartY(e.touches[0].clientY)

  const handleTouchMove = (e) => {
    const touchY = e.touches[0].clientY
    if (touchY - touchStartY > 30) {
      // Swiped down
      setIsPanelOpen(false)
    } else if (touchStartY - touchY > 30) {
      // Swiped up
      setIsPanelOpen(true)
    }
  }

  const togglePanel = () => setIsPanelOpen((prev) => !prev)

  const { sendMessageToEvent, receiveMessageFromEvent } = useContext(SocketDataContext)
  const { captainData } = useContext(CaptainDataContext)
  const isCaptainView = location.pathname === '/captain-ride'

  const storedRideMeta = useMemo(() => {
    const storageKey = isCaptainView ? 'activeCaptainRideMeta' : 'activeUserRideMeta'
    const storedValue = localStorage.getItem(storageKey)

    if (!storedValue) {
      return null
    }

    try {
      return JSON.parse(storedValue)
    } catch {
      return null
    }
  }, [isCaptainView])

  const rideMeta = useMemo(() => {
    const stateMeta = location.state && typeof location.state === 'object' ? location.state : {}
    const storageRideId = isCaptainView ? localStorage.getItem('activeCaptainRideId') : localStorage.getItem('activeUserRideId')

    return {
      rideId: stateMeta.rideId || storedRideMeta?.rideId || storageRideId || null,
      origin: stateMeta.origin || storedRideMeta?.origin || '',
      destination: stateMeta.destination || storedRideMeta?.destination || '',
      pickupCoordinates: stateMeta.pickupCoordinates || storedRideMeta?.pickupCoordinates || null,
      destinationCoordinates: stateMeta.destinationCoordinates || storedRideMeta?.destinationCoordinates || null,
      fare: stateMeta.fare ?? storedRideMeta?.fare ?? null,
    }
  }, [isCaptainView, location.state, storedRideMeta])

  const rideId = rideMeta.rideId

  useEffect(() => {
    const idKey = isCaptainView ? 'activeCaptainRideId' : 'activeUserRideId'
    const metaKey = isCaptainView ? 'activeCaptainRideMeta' : 'activeUserRideMeta'

    if (rideMeta.rideId) {
      localStorage.setItem(idKey, String(rideMeta.rideId))
      localStorage.setItem(metaKey, JSON.stringify(rideMeta))
    }
  }, [isCaptainView, rideMeta])

  useEffect(() => {
    if (isCaptainView) {
      return undefined
    }

    const unsubscribeCaptainLocation = receiveMessageFromEvent('captainLocationUpdate', (payload) => {
      if (!payload?.location || (rideId && String(payload.rideId) !== String(rideId))) {
        return
      }

      setCaptainLocation(payload.location)
    })

    return () => unsubscribeCaptainLocation()
  }, [isCaptainView, receiveMessageFromEvent, rideId])

  useEffect(() => {
    if (!isCaptainView) {
      return undefined
    }

    const captainId = captainData?._id
    if (!captainId || !window.isSecureContext || !navigator.geolocation) {
      return undefined
    }

    const sendCaptainLocation = () => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          const payload = {
            userType: 'captain',
            userId: captainId,
            location: {
              latitude,
              longitude,
            },
          }

          setCaptainLocation(payload.location)
          sendMessageToEvent('updateLocationCaptain', payload)
        },
        () => {},
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
  }, [captainData?._id, isCaptainView, sendMessageToEvent])

  const handleStartRide = () => {
    if (!isCaptainView) {
      return
    }

    if (rideId) {
      sendMessageToEvent('captainUpdateRideStatus', {
        rideId,
        status: 'in_progress',
      })
    }

    setIsRideStarted(true)
    const startTime = Date.now()
    setRideStartTime(startTime)
    localStorage.setItem('isRideStarted', 'true')
    localStorage.setItem('rideStartTime', startTime.toString())
  }

  const handleRideCompleted = () => {
    if (!isCaptainView) {
      return
    }

    if (rideId) {
      sendMessageToEvent('captainUpdateRideStatus', {
        rideId,
        status: 'completed',
      })
    }

    // Update captain stats
    try {
      const today = new Date().toLocaleDateString('en-CA')
      const statsStr = localStorage.getItem('captainStats')
      const stats = statsStr ? JSON.parse(statsStr) : { earnings: 0, rides: 0, onlineSeconds: 0, lastResetDate: today }
      
      // If stats are from a previous day, reset them first
      if (stats.lastResetDate !== today) {
        stats.earnings = 0
        stats.rides = 0
        stats.onlineSeconds = 0
        stats.lastResetDate = today
      }

      const newFare = Number(rideMeta?.fare) || 120
      stats.earnings += newFare
      stats.rides += 1
      
      // Calculate and add ride duration
      if (rideStartTime) {
        const durationInSeconds = Math.floor((Date.now() - rideStartTime) / 1000)
        stats.onlineSeconds += durationInSeconds
      }
      
      localStorage.setItem('captainStats', JSON.stringify(stats))
    } catch (err) {
      console.error('Failed to update stats on ride completion:', err)
    }

    localStorage.removeItem('activeCaptainRideId')
    localStorage.removeItem('activeCaptainRideMeta')
    localStorage.removeItem('isRideStarted')
    localStorage.removeItem('rideStartTime')

    navigate('/captain-home')
  }

  const handleUserDropOff = () => {
    if (isCaptainView) {
      return
    }

    navigate('/payment', {
      state: rideMeta,
    })
  }

  return (
    <main className="fixed inset-0 w-full overflow-hidden bg-background text-on-background antialiased">
      <div className="absolute inset-0 z-0">
        <LiveTracking
          captainLocation={captainLocation}
          pickupCoords={rideMeta.pickupCoordinates}
          destinationCoords={rideMeta.destinationCoordinates}
          pickupString={rideMeta.origin}
          destString={rideMeta.destination}
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-background/60 pointer-events-none z-10" />

      <header className="absolute inset-x-0 top-0 z-20 px-container-margin pt-6 pb-4 bg-gradient-to-b from-surface-variant/80 to-transparent backdrop-blur-md border-b border-outline/10">
        <div className="flex items-center justify-between gap-3">
          <Link
            to={isCaptainView ? '/captain-home' : '/home'}
            aria-label={isCaptainView ? 'Back to captain home' : 'Back to home'}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-lowest border border-outline/20 text-on-surface shadow-[0_0_15px_rgba(0,0,0,0.5)] transition hover:bg-surface-variant"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </Link>

          <p className="font-display-sm text-[20px] font-bold tracking-tight text-on-surface">{isCaptainView ? 'Active Mission' : 'Live Tracking'}</p>

          <div className="h-10 w-10 flex items-center justify-center rounded-full bg-surface-container-lowest border border-outline/20 text-primary-container shadow-[0_0_15px_rgba(0,0,0,0.5)]">
            <span className="material-symbols-outlined text-[20px]">my_location</span>
          </div>
        </div>

        <div className="mt-stack-sm flex items-center gap-2 rounded-xl border border-[#00E676]/30 bg-[#00E676]/10 px-3 py-2 text-[#00E676] shadow-[0_0_15px_rgba(0,230,118,0.15)] backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00E676] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00E676]"></span>
          </span>
          <span className="font-label-caps text-[10px] uppercase tracking-widest pt-0.5 font-bold">Live Status</span>
          <span className="font-body-sm text-[12px] opacity-80 border-l border-[#00E676]/30 pl-2 ml-1 truncate">
            {isCaptainView ? 'Transmitting telemetry' : 'Tracking captain telemetry'}
          </span>
        </div>
      </header>

      <div className={`absolute inset-x-0 bottom-0 z-20 rounded-t-3xl bg-surface-variant/40 border border-outline/20 shadow-[0_-20px_40px_rgba(0,0,0,0.6)] backdrop-blur-[40px] px-container-margin pt-2 pb-6 transition-transform duration-300 ease-in-out ${isPanelOpen ? 'translate-y-0' : 'translate-y-[calc(100%-80px)]'}`}>
        {/* Subtle top edge highlight */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        
        <div
          className="flex w-full cursor-pointer justify-center pb-3 pt-2"
          onClick={togglePanel}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
        >
          <div className="h-1.5 w-14 rounded-full bg-outline/30" />
        </div>

        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isPanelOpen ? 'max-h-64 opacity-100 mb-stack-md' : 'max-h-0 opacity-0 mb-0'}`}>
          <div className="flex items-start gap-4 rounded-2xl bg-surface-container-lowest/40 border border-outline/10 p-4 relative">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-container/20 border border-primary-container/30 text-primary-container shadow-[0_0_10px_rgba(0,229,255,0.2)]">
              <span className="material-symbols-outlined text-[18px]">radio_button_checked</span>
            </div>

            <div className="min-w-0 flex-1">
              <p className="font-label-caps text-[10px] text-primary-container uppercase tracking-widest mb-1">Current Objective</p>
              <p className="font-display-sm text-[20px] font-semibold leading-tight text-on-surface truncate">{rideMeta.origin || 'Pickup location'}</p>
              
              <div className="mt-3 pt-3 border-t border-outline/10 flex items-start gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-variant/50 border border-outline/20 text-[#00B8D4]">
                  <span className="material-symbols-outlined text-[14px]">location_on</span>
                </div>
                <p className="font-body-sm text-[14px] text-on-surface-variant/80 truncate pt-0.5">
                  {rideMeta.destination || 'Destination pending'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {isCaptainView ? (
          <button
            type="button"
            onClick={isRideStarted ? handleRideCompleted : handleStartRide}
            className={`inline-flex h-14 w-full items-center justify-center gap-2 rounded-xl text-background font-label-caps text-[14px] uppercase tracking-widest font-bold shadow-[0_0_20px_rgba(0,0,0,0.3)] transition-all ${isRideStarted ? 'bg-gradient-to-r from-error to-[#FF5252] shadow-[0_0_20px_rgba(255,82,82,0.3)] hover:shadow-[0_0_25px_rgba(255,82,82,0.5)]' : 'bg-gradient-to-r from-[#00E676] to-[#00C853] shadow-[0_0_20px_rgba(0,230,118,0.3)] hover:shadow-[0_0_25px_rgba(0,230,118,0.5)]'}`}
          >
            <span className="material-symbols-outlined text-[20px]">{isRideStarted ? 'stop_circle' : 'navigation'}</span>
            {isRideStarted ? 'Complete Mission' : 'Commence Journey'}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleUserDropOff}
            className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#00E676] to-[#00C853] text-background font-label-caps text-[14px] uppercase tracking-widest font-bold shadow-[0_0_20px_rgba(0,230,118,0.3)] transition-all hover:shadow-[0_0_25px_rgba(0,230,118,0.5)]"
          >
            <span className="material-symbols-outlined text-[20px]">navigation</span>
            Arrive at Destination
          </button>
        )}
      </div>
    </main>
  )
}

export default CaptainRideNavigation