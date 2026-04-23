import React, { useContext, useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { IoArrowBackOutline, IoNavigate } from 'react-icons/io5'
import { SocketDataContext } from '../context/socketDataContext.js'
import { CaptainDataContext } from '../context/captainDataContext.js'
import LiveTracking from '../componenets/liveTracking.jsx'

const CaptainRideNavigation = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [isRideStarted, setIsRideStarted] = useState(false)
  const [captainLocation, setCaptainLocation] = useState(null)
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

    localStorage.removeItem('activeCaptainRideId')
    localStorage.removeItem('activeCaptainRideMeta')

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
    <main className="relative h-screen w-full overflow-hidden bg-neutral-100 text-black">
      <div className="absolute inset-0">
        <LiveTracking
          captainLocation={captainLocation}
          pickupCoords={rideMeta.pickupCoordinates}
          destinationCoords={rideMeta.destinationCoordinates}
          pickupString={rideMeta.origin}
          destString={rideMeta.destination}
        />
      </div>
      <div className="absolute inset-0 bg-white/20" />

      <header className="absolute inset-x-0 top-0 z-20 border-b border-neutral-200 bg-white/95 px-4 pb-3 pt-4 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-3">
          <Link
            to={isCaptainView ? '/captain-home' : '/home'}
            aria-label={isCaptainView ? 'Back to captain home' : 'Back to home'}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 text-neutral-900"
          >
            <IoArrowBackOutline className="h-5 w-5" />
          </Link>

          <p className="text-xl font-semibold tracking-tight text-black">{isCaptainView ? 'Pick up' : 'Live Ride'}</p>

          <div className="h-9 w-9" />
        </div>

        <div className="mt-3 flex items-center gap-2 rounded-md bg-amber-400 px-3 py-2 text-sm text-black">
          <span className="font-semibold">Live</span>
          <span>{isCaptainView ? 'Captain location updates every 10 seconds' : 'Tracking your captain in real time'}</span>
        </div>
      </header>

      <div className="absolute inset-x-0 bottom-0 z-20 rounded-t-3xl bg-white px-4 pb-5 pt-4 shadow-[0_-12px_30px_rgba(0,0,0,0.24)]">
        <div className="mx-auto mb-3 h-1.5 w-14 rounded-full bg-neutral-300" />

        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-400 text-sm font-semibold text-black">
            A
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm text-neutral-400">Pick up at</p>
            <p className="text-[1.7rem] font-semibold leading-tight text-black">{rideMeta.origin || 'Pickup location'}</p>
            <p className="mt-1 text-base text-neutral-500">
              {rideMeta.destination ? `Drop at ${rideMeta.destination}` : 'Destination not available'}
            </p>
          </div>
        </div>

        {isCaptainView ? (
          <button
            type="button"
            onClick={isRideStarted ? handleRideCompleted : handleStartRide}
            className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-black text-lg font-semibold text-white transition hover:bg-neutral-800"
          >
            <IoNavigate className="h-5 w-5" />
            {isRideStarted ? 'Drop Off' : 'Start Ride'}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleUserDropOff}
            className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-black text-lg font-semibold text-white transition hover:bg-neutral-800"
          >
            <IoNavigate className="h-5 w-5" />
            Drop Off
          </button>
        )}
      </div>
    </main>
  )
}

export default CaptainRideNavigation