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
  const [showQR, setShowQR] = useState(false)
  const [touchStartY, setTouchStartY] = useState(0)

  const handleTouchStart = (e) => setTouchStartY(e.touches[0].clientY)
  const handleTouchMove = (e) => {
    const touchY = e.touches[0].clientY
    if (touchY - touchStartY > 30) setIsPanelOpen(false)
    else if (touchStartY - touchY > 30) setIsPanelOpen(true)
  }
  const togglePanel = () => setIsPanelOpen((prev) => !prev)

  const { sendMessageToEvent, receiveMessageFromEvent } = useContext(SocketDataContext)
  const { captainData } = useContext(CaptainDataContext)
  const isCaptainView = location.pathname === '/captain-ride'

  const storedRideMeta = useMemo(() => {
    const storageKey = isCaptainView ? 'activeCaptainRideMeta' : 'activeUserRideMeta'
    const storedValue = localStorage.getItem(storageKey)
    if (!storedValue) return null
    try { return JSON.parse(storedValue) } catch { return null }
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
    if (isCaptainView) return undefined
    const unsubscribeCaptainLocation = receiveMessageFromEvent('captainLocationUpdate', (payload) => {
      if (!payload?.location || (rideId && String(payload.rideId) !== String(rideId))) return
      setCaptainLocation(payload.location)
    })
    return () => unsubscribeCaptainLocation()
  }, [isCaptainView, receiveMessageFromEvent, rideId])

  useEffect(() => {
    if (!isCaptainView) return undefined
    const captainId = captainData?._id
    if (!captainId || !window.isSecureContext || !navigator.geolocation) return undefined
    const sendCaptainLocation = () => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          const payload = { userType: 'captain', userId: captainId, location: { latitude, longitude } }
          setCaptainLocation(payload.location)
          sendMessageToEvent('updateLocationCaptain', payload)
        },
        () => {},
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
      )
    }
    sendCaptainLocation()
    const locationInterval = window.setInterval(sendCaptainLocation, 10000)
    return () => window.clearInterval(locationInterval)
  }, [captainData?._id, isCaptainView, sendMessageToEvent])

  const handleStartRide = () => {
    if (!isCaptainView) return
    if (rideId) sendMessageToEvent('captainUpdateRideStatus', { rideId, status: 'in_progress' })
    setIsRideStarted(true)
    const startTime = Date.now()
    setRideStartTime(startTime)
    localStorage.setItem('isRideStarted', 'true')
    localStorage.setItem('rideStartTime', startTime.toString())
  }

  const handleRideCompleted = () => {
    if (!isCaptainView) return
    if (rideId) sendMessageToEvent('captainUpdateRideStatus', { rideId, status: 'completed' })
    try {
      const today = new Date().toLocaleDateString('en-CA')
      const statsStr = localStorage.getItem('captainStats')
      const stats = statsStr ? JSON.parse(statsStr) : { earnings: 0, rides: 0, onlineSeconds: 0, lastResetDate: today }
      if (stats.lastResetDate !== today) { stats.earnings = 0; stats.rides = 0; stats.onlineSeconds = 0; stats.lastResetDate = today }
      const newFare = Number(rideMeta?.fare) || 120
      stats.earnings += newFare
      stats.rides += 1
      if (rideStartTime) stats.onlineSeconds += Math.floor((Date.now() - rideStartTime) / 1000)
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
    if (isCaptainView) return
    navigate('/payment', { state: rideMeta })
  }

  return (
    <main className="fixed inset-0 w-full overflow-hidden bg-background text-on-surface">
      {/* Map */}
      <div className="absolute inset-0 z-0">
        <LiveTracking
          captainLocation={captainLocation}
          pickupCoords={rideMeta.pickupCoordinates}
          destinationCoords={rideMeta.destinationCoordinates}
          pickupString={rideMeta.origin}
          destString={rideMeta.destination}
        />
      </div>

      {/* Top Bar */}
      <header className="absolute inset-x-0 top-0 z-20 p-6 flex items-center justify-between pointer-events-none">
        <Link
          to={isCaptainView ? '/captain-home' : '/home'}
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-container-lowest/95 border border-outline-variant/20 text-on-surface shadow-sm backdrop-blur-sm pointer-events-auto hover:bg-surface-container-low transition-colors"
        >
          <span className="material-symbols-outlined text-xl">arrow_back</span>
        </Link>

        <div className="rounded-lg bg-surface-container-lowest/95 border border-outline-variant/20 px-4 py-2 shadow-sm backdrop-blur-sm pointer-events-auto">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary-container animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
              {isCaptainView ? 'Navigating' : 'Live Tracking'}
            </span>
          </div>
        </div>

        <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-surface-container-lowest/95 border border-outline-variant/20 text-primary shadow-sm backdrop-blur-sm pointer-events-auto">
          <span className="material-symbols-outlined text-xl">my_location</span>
        </div>
      </header>

      {/* Bottom Panel */}
      <div className={`absolute inset-x-0 bottom-0 z-20 rounded-t-2xl bg-surface-container-lowest border-t border-outline-variant/20 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] transition-transform duration-300 ease-in-out ${isPanelOpen ? 'translate-y-0' : 'translate-y-[calc(100%-80px)]'}`}>
        <div
          className="flex w-full cursor-pointer justify-center py-3"
          onClick={togglePanel}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
        >
          <div className="h-1 w-10 rounded-full bg-outline-variant/30" />
        </div>

        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isPanelOpen ? 'max-h-[400px] opacity-100 mb-2' : 'max-h-0 opacity-0 mb-0'}`}>
          {/* Route Info */}
          <div className="mx-6 rounded-lg border border-outline-variant/15 overflow-hidden mb-4">
            <div className="flex items-start gap-3 p-4 border-b border-outline-variant/10">
              <div className="h-3 w-3 mt-0.5 rounded-full bg-primary-container border-2 border-primary shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-0.5">Pickup</p>
                <p className="text-sm text-on-surface truncate">{rideMeta.origin || 'Pickup location'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4">
              <div className="h-3 w-3 mt-0.5 rounded-sm bg-on-surface shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-0.5">Drop-off</p>
                <p className="text-sm text-on-surface truncate">{rideMeta.destination || 'Destination'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 pb-6 space-y-3">
          {isCaptainView ? (
            <>
              <button
                type="button"
                onClick={isRideStarted ? handleRideCompleted : handleStartRide}
                className={`w-full flex items-center justify-center gap-2 rounded-lg py-3.5 text-sm font-bold uppercase tracking-wider transition-all ${
                  isRideStarted
                    ? 'bg-error text-on-error hover:bg-error/90'
                    : 'bg-primary-container text-on-primary-container hover:brightness-95'
                }`}
              >
                <span className="material-symbols-outlined text-lg">{isRideStarted ? 'stop_circle' : 'play_arrow'}</span>
                {isRideStarted ? 'Complete Ride' : 'Start Ride'}
              </button>
              {isRideStarted && (
                <button
                  type="button"
                  onClick={() => setShowQR(true)}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-surface-container-low text-on-surface py-3.5 border border-outline-variant/30 text-sm font-bold uppercase tracking-wider hover:bg-surface-container-high transition-all"
                >
                  <span className="material-symbols-outlined text-lg">qr_code</span>
                  Show Payment QR
                </button>
              )}
            </>
          ) : (
            <button
              type="button"
              onClick={handleUserDropOff}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-on-surface text-surface py-3.5 text-sm font-bold uppercase tracking-wider hover:bg-on-surface/90 transition-all"
            >
              <span className="material-symbols-outlined text-lg">flag</span>
              Arrived at Destination
            </button>
          )}
        </div>
      </div>
      {/* QR Code Modal */}
      {showQR && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 p-6 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-surface p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-xl font-extrabold tracking-tight text-on-surface">Collect Payment</h3>
              <button onClick={() => setShowQR(false)} className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-container hover:bg-surface-container-high transition-colors text-on-surface-variant">
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
            <div className="flex flex-col items-center">
              <div className="rounded-xl border border-outline-variant/30 bg-white p-4 mb-4">
                <img 
                  src={`https://chart.googleapis.com/chart?cht=qr&chs=250x250&chl=${encodeURIComponent(`upi://pay?pa=${import.meta.env.VITE_COMPANY_UPI_ID || 'yourcompany@upi'}&pn=Velocity&am=${rideMeta.fare || 0}&cu=INR`)}`} 
                  alt="UPI QR Code" 
                  className="w-48 h-48"
                />
              </div>
              <p className="text-sm font-bold text-on-surface mb-1">Amount Due: ₹{rideMeta.fare || 0}</p>
              <p className="text-xs text-on-surface-variant text-center">Ask the customer to scan this QR code using any UPI app (GPay, PhonePe, Paytm)</p>
            </div>
            <button
              onClick={() => setShowQR(false)}
              className="mt-6 w-full rounded-lg bg-primary-container py-3 text-sm font-bold tracking-wider text-on-primary-container uppercase transition-colors hover:brightness-95"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </main>
  )
}

export default CaptainRideNavigation
