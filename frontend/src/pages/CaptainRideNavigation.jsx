import React, { useContext, useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { IoArrowBackOutline } from 'react-icons/io5'
import RideDirectionsPanel from '../componenets/rideDirectionsPanel.jsx'
import MakePaymentPanel from '../componenets/makePaymentPanel.jsx'
import { SocketDataContext } from '../context/socketDataContext.js'
import { CaptainDataContext } from '../context/captainDataContext.js'
import { UserDataContext } from '../context/userDataContext.js'
import LiveTracking from '../componenets/liveTracking.jsx'

const CaptainRideNavigation = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [isRideStarted, setIsRideStarted] = useState(false)
  const [isPaymentPanelOpen, setIsPaymentPanelOpen] = useState(false)
  const [captainLocation, setCaptainLocation] = useState(null)
  const [rideDetails, setRideDetails] = useState({})
  const { sendMessageToEvent, receiveMessageFromEvent, isConnected } = useContext(SocketDataContext)
  const { captainData } = useContext(CaptainDataContext)
  const { userData } = useContext(UserDataContext)
  const isCaptainView = location.pathname === '/captain-ride'
  const isUserView = !isCaptainView
  const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:4000'
  const rideStatus = rideDetails.status || (isRideStarted ? 'in_progress' : '')
  const rideHasStarted = rideStatus === 'in_progress'
  const rideHasCompleted = rideStatus === 'completed'

  const rideId = isCaptainView
    ? (location.state?.rideId || localStorage.getItem('activeCaptainRideId') || null)
    : (location.state?.rideId || localStorage.getItem('activeUserRideId') || null)

  const rideSummaryFromState = useMemo(() => ({
    origin: location.state?.origin || '',
    destination: location.state?.destination || '',
    distanceText: location.state?.distanceText || '',
    durationText: location.state?.durationText || '',
    fare: location.state?.fare || '',
  }), [location.state?.destination, location.state?.distanceText, location.state?.durationText, location.state?.fare, location.state?.origin])

  useEffect(() => {
    setRideDetails(rideSummaryFromState)
  }, [rideSummaryFromState])

  useEffect(() => {
    if (location.state?.rideId && isCaptainView) {
      localStorage.setItem('activeCaptainRideId', String(location.state.rideId))
    }
  }, [isCaptainView, location.state?.rideId])

  useEffect(() => {
    if (location.state?.rideId && !isCaptainView) {
      localStorage.setItem('activeUserRideId', String(location.state.rideId))
    }
  }, [isCaptainView, location.state?.rideId])

  useEffect(() => {
    if (!isConnected) {
      return
    }

    if (isCaptainView && captainData?._id) {
      sendMessageToEvent('join', {
        userType: 'captain',
        userId: captainData._id,
      })
      return
    }

    if (isUserView && userData?._id) {
      sendMessageToEvent('join', {
        userType: 'user',
        userId: userData._id,
      })
    }
  }, [captainData?._id, isCaptainView, isConnected, isUserView, sendMessageToEvent, userData?._id])

  useEffect(() => {
    if (!rideId) {
      return undefined
    }

    if (rideSummaryFromState.destination && rideSummaryFromState.distanceText) {
      return undefined
    }

    let isCancelled = false

    const loadRideDetails = async () => {
      try {
        const token = localStorage.getItem(isCaptainView ? 'captainToken' : 'token')
        const response = await axios.get(`${baseUrl}/ride/${rideId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })

        if (!isCancelled) {
          setRideDetails((currentDetails) => ({
            ...currentDetails,
            ...response.data,
          }))

          if (response.data?.status === 'in_progress') {
            setIsRideStarted(true)
          }

          if (response.data?.status === 'completed') {
            setIsRideStarted(true)
            if (isUserView) {
              setIsPaymentPanelOpen(true)
            }
          }
        }
      } catch (error) {
        console.error('Failed to load ride details:', error?.response?.data?.error || error.message)
      }
    }

    loadRideDetails()

    return () => {
      isCancelled = true
    }
  }, [baseUrl, isCaptainView, isUserView, rideId, rideSummaryFromState.destination, rideSummaryFromState.distanceText])

  useEffect(() => {
    const unsubscribeRideStatusUpdated = receiveMessageFromEvent('rideStatusUpdated', (payload) => {
      if (!payload?.rideId || String(payload.rideId) !== String(rideId)) {
        return
      }

      setRideDetails((currentDetails) => ({
        ...currentDetails,
        ...payload,
      }))

      if (payload.status === 'in_progress') {
        setIsRideStarted(true)
        setIsPaymentPanelOpen(false)
        return
      }

      if (payload.status === 'completed') {
        setIsRideStarted(true)
        if (isUserView) {
          setIsPaymentPanelOpen(true)
        } else {
          setIsPaymentPanelOpen(false)
        }
      }
    })

    return () => unsubscribeRideStatusUpdated()
  }, [isUserView, receiveMessageFromEvent, rideId])

  useEffect(() => {
    if (!rideHasCompleted) {
      return
    }

    if (isCaptainView) {
      localStorage.removeItem('activeCaptainRideId')
      navigate('/captain-home')
      return
    }

    setIsPaymentPanelOpen(true)
  }, [isCaptainView, navigate, rideHasCompleted])

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

  const handleRideAction = () => {
    if (!rideId) {
      return
    }

    const nextStatus = rideHasStarted ? 'completed' : 'in_progress'
    const actorId = isCaptainView ? captainData?._id : userData?._id
    const actorType = isCaptainView ? 'captain' : 'user'

    setRideDetails((currentDetails) => ({
      ...currentDetails,
      status: nextStatus,
    }))

    if (nextStatus === 'in_progress') {
      setIsRideStarted(true)
      setIsPaymentPanelOpen(false)
    }

    if (nextStatus === 'completed' && isUserView) {
      setIsPaymentPanelOpen(true)
    }

    sendMessageToEvent('captainUpdateRideStatus', {
      rideId,
      status: nextStatus,
      actorId,
      actorType,
    })
  }

  const handleRideCompleted = () => {
    if (!isUserView) {
      return
    }

    localStorage.removeItem('activeUserRideId')
    setIsPaymentPanelOpen(false)
    navigate('/home')
  }

  return (
    <main className="relative h-screen w-full overflow-hidden bg-neutral-100 text-black">
      <div className="absolute inset-0">
        <LiveTracking captainLocation={captainLocation} />
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

      <RideDirectionsPanel
        destination={rideDetails.destination || rideSummaryFromState.destination}
        distance={rideDetails.distanceText || rideSummaryFromState.distanceText}
        statusMessage={rideHasCompleted
          ? (isUserView ? 'Ride completed. Please complete payment.' : 'Ride completed. Return to the captain home screen when ready.')
          : rideHasStarted
            ? 'Ride in progress. End the ride when you reach the destination.'
            : 'Confirm the destination before starting the ride.'}
        actionLabel={rideHasCompleted ? '' : (rideHasStarted ? 'End Ride' : 'Start Ride')}
        onAction={handleRideAction}
        showAction={!rideHasCompleted}
      />

      {isUserView && isPaymentPanelOpen ? (
        <MakePaymentPanel
          customerName={rideDetails.captain?.fullname
            ? [rideDetails.captain.fullname.firstname, rideDetails.captain.fullname.lastname].filter(Boolean).join(' ').trim()
            : 'Your captain'}
          fare="$25.00"
          viewRole="user"
          onDone={handleRideCompleted}
        />
      ) : null}
    </main>
  )
}

export default CaptainRideNavigation