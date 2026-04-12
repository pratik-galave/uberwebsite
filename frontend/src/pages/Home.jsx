import { useContext, useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import axios from 'axios'
import { IoChevronDown } from 'react-icons/io5'
import { useNavigate } from 'react-router-dom'
import mapImage from '../assets/map.jpg'
import LocationSearchPanel from '../componenets/locationSearchPanel.jsx'
import ConfirmRidePanel from '../componenets/confirmRidePanel.jsx'
import VehicleFindingPanel from '../componenets/vehicleFindingPanel.jsx'
import DriverDetailsPanel from '../componenets/driverDetailsPanel.jsx'
import VehicleTypePanel from '../componenets/vehicleTypePanel.jsx'
import { SocketDataContext } from '../context/socketDataContext.js'
import { UserDataContext } from '../context/userDataContext.js'

const Home = () => {
  const navigate = useNavigate()
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [isVehiclePanelOpen, setIsVehiclePanelOpen] = useState(false)
  const [isConfirmPanelOpen, setIsConfirmPanelOpen] = useState(false)
  const [isFindingPanelOpen, setIsFindingPanelOpen] = useState(false)
  const [isDriverDetailsPanelOpen, setIsDriverDetailsPanelOpen] = useState(false)
  const [pickupLocation, setPickupLocation] = useState('')
  const [destination, setDestination] = useState('')
  const [locationSuggestions, setLocationSuggestions] = useState([])
  const [isSuggestionLoading, setIsSuggestionLoading] = useState(false)
  const [isCreatingRide, setIsCreatingRide] = useState(false)
  const [createRideError, setCreateRideError] = useState('')
  const [rideOtpInfo, setRideOtpInfo] = useState(null)
  const [activeField, setActiveField] = useState('pickup')
  const [selectedVehicle, setSelectedVehicle] = useState(null)
  const pickupInputRef = useRef(null)
  const destinationInputRef = useRef(null)
  const landingRef = useRef(null)
  const panelRef = useRef(null)
  const backdropRef = useRef(null)
  const vehiclePanelRef = useRef(null)
  const confirmPanelRef = useRef(null)
  const findingPanelRef = useRef(null)
  const driverDetailsPanelRef = useRef(null)
  const didMountRef = useRef(false)
  const didMountVehicleRef = useRef(false)
  const didMountConfirmRef = useRef(false)
  const didMountFindingRef = useRef(false)
  const didMountDriverRef = useRef(false)

  const {sendMessageToEvent, receiveMessageFromEvent, isConnected} = useContext(SocketDataContext)
  const {userData} = useContext(UserDataContext)

  useEffect(() => {
    if (!isConnected) {
      return
    }

    sendMessageToEvent('debug:frontend-connected', {
      source: 'Home',
      timestamp: Date.now(),
    })
  }, [isConnected, sendMessageToEvent])

  useEffect(() => {
    const userId = userData?._id

    if (!userId) {
      console.warn('Join event skipped: userData._id is missing', { userData })
      return
    }

    console.log('Setting up socket connection and joining room with userId:', userId)
    sendMessageToEvent('join',{userType: 'user', userId})
  }, [sendMessageToEvent, userData])

  useEffect(() => {
    const unsubscribeNearbyCaptains = receiveMessageFromEvent('nearbyCaptains', (payload) => {
      const captainNames = Array.isArray(payload?.captainNames) ? payload.captainNames : []

      console.log('Nearby captains found for user:', {
        totalNearbyCaptains: payload?.totalNearbyCaptains ?? captainNames.length,
        captainNames,
      })
    })

    return () => unsubscribeNearbyCaptains()
  }, [receiveMessageFromEvent])

  useEffect(() => {
    const unsubscribeRideAccepted = receiveMessageFromEvent('rideAccepted', (payload) => {
      if (!payload?.otp) {
        return
      }

      setRideOtpInfo({
        rideId: payload.rideId,
        captainId: payload.captainId,
        otp: payload.otp,
        captainName: payload.captainName || 'Your captain',
      })

      console.log('Ride accepted, share OTP with captain:', payload)
    })

    return () => unsubscribeRideAccepted()
  }, [receiveMessageFromEvent])

  useEffect(() => {
    const unsubscribeOtpVerificationRequested = receiveMessageFromEvent('otpVerificationRequested', (payload) => {
      if (!payload?.rideId || !payload?.captainId || !payload?.enteredOtp) {
        return
      }

      const expectedOtp = String(rideOtpInfo?.otp || '').trim()
      const enteredOtp = String(payload.enteredOtp || '').trim()
      const rideMatches = !rideOtpInfo?.rideId || String(rideOtpInfo.rideId) === String(payload.rideId)
      const isValid = rideMatches && Boolean(expectedOtp) && enteredOtp === expectedOtp

      sendMessageToEvent('otpVerificationResult', {
        rideId: payload.rideId,
        captainId: payload.captainId,
        isValid,
      })

      if (isValid) {
        localStorage.setItem('activeUserRideId', String(payload.rideId))
        navigate('/user-ride', {
          state: {
            rideId: payload.rideId,
          },
        })
      }

      console.log('OTP verification requested by captain:', {
        rideId: payload.rideId,
        captainId: payload.captainId,
        isValid,
      })
    })

    return () => unsubscribeOtpVerificationRequested()
  }, [navigate, receiveMessageFromEvent, rideOtpInfo, sendMessageToEvent])

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        if (isFindingPanelOpen) {
          setIsFindingPanelOpen(false)
          return
        }

        if (isConfirmPanelOpen) {
          setIsConfirmPanelOpen(false)
          return
        }

        if (isVehiclePanelOpen) {
          setIsVehiclePanelOpen(false)
          return
        }

        setIsPanelOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isFindingPanelOpen, isConfirmPanelOpen, isVehiclePanelOpen])

  useEffect(() => {
    if (isPanelOpen) {
      window.requestAnimationFrame(() => {
        if (activeField === 'destination') {
          destinationInputRef.current?.focus()
        } else {
          pickupInputRef.current?.focus()
        }
      })
    }
  }, [activeField, isPanelOpen])

  useLayoutEffect(() => {
    gsap.set(landingRef.current, { scale: 1, opacity: 1 })
    gsap.set(panelRef.current, { yPercent: 100, opacity: 0 })
    gsap.set(backdropRef.current, { opacity: 0 })
    gsap.set(vehiclePanelRef.current, { yPercent: 110, opacity: 0 })
    gsap.set(confirmPanelRef.current, { yPercent: 110, opacity: 0 })
    gsap.set(findingPanelRef.current, { yPercent: 110, opacity: 0 })
    gsap.set(driverDetailsPanelRef.current, { yPercent: 110, opacity: 0 })
  }, [])

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true
      return
    }

    gsap.killTweensOf([landingRef.current, panelRef.current, backdropRef.current])

    if (isPanelOpen) {
      const openTimeline = gsap.timeline()

      openTimeline.to(landingRef.current, {
        scale: 1.03,
        opacity: 0.15,
        duration: 0.35,
        ease: 'power3.out',
      }, 0)
      openTimeline.to(backdropRef.current, {
        opacity: 1,
        duration: 0.35,
        ease: 'power2.out',
      }, 0)
      openTimeline.to(panelRef.current, {
        yPercent: 0,
        opacity: 1,
        duration: 0.55,
        ease: 'power4.out',
      }, 0)
    } else {
      const closeTimeline = gsap.timeline()

      closeTimeline.to(panelRef.current, {
        yPercent: 100,
        opacity: 0,
        duration: 0.45,
        ease: 'power4.in',
      }, 0)
      closeTimeline.to(backdropRef.current, {
        opacity: 0,
        duration: 0.3,
        ease: 'power2.out',
      }, 0)
      closeTimeline.to(landingRef.current, {
        scale: 1,
        opacity: 1,
        duration: 0.35,
        ease: 'power2.out',
      }, 0.05)
    }
  }, [isPanelOpen])

  useEffect(() => {
    if (!didMountVehicleRef.current) {
      didMountVehicleRef.current = true
      return
    }

    gsap.killTweensOf(vehiclePanelRef.current)

    if (isVehiclePanelOpen) {
      gsap.to(vehiclePanelRef.current, {
        yPercent: 0,
        opacity: 1,
        duration: 0.5,
        ease: 'power4.out',
      })
    } else {
      gsap.to(vehiclePanelRef.current, {
        yPercent: 110,
        opacity: 0,
        duration: 0.35,
        ease: 'power3.in',
      })
    }
  }, [isVehiclePanelOpen])

  useEffect(() => {
    if (!didMountConfirmRef.current) {
      didMountConfirmRef.current = true
      return
    }

    gsap.killTweensOf(confirmPanelRef.current)

    if (isConfirmPanelOpen) {
      gsap.to(confirmPanelRef.current, {
        yPercent: 0,
        opacity: 1,
        duration: 0.55,
        ease: 'power4.out',
      })
    } else {
      gsap.to(confirmPanelRef.current, {
        yPercent: 110,
        opacity: 0,
        duration: 0.35,
        ease: 'power3.in',
      })
    }
  }, [isConfirmPanelOpen])

  useEffect(() => {
    if (!didMountDriverRef.current) {
      didMountDriverRef.current = true
      return
    }

    gsap.killTweensOf(driverDetailsPanelRef.current)

    if (isDriverDetailsPanelOpen) {
      gsap.to(driverDetailsPanelRef.current, {
        yPercent: 0,
        opacity: 1,
        duration: 0.55,
        ease: 'power4.out',
      })
    } else {
      gsap.to(driverDetailsPanelRef.current, {
        yPercent: 110,
        opacity: 0,
        duration: 0.35,
        ease: 'power3.in',
      })
    }
  }, [isDriverDetailsPanelOpen])

  useEffect(() => {
    if (!didMountFindingRef.current) {
      didMountFindingRef.current = true
      return
    }

    gsap.killTweensOf(findingPanelRef.current)

    if (isFindingPanelOpen) {
      gsap.to(findingPanelRef.current, {
        yPercent: 0,
        opacity: 1,
        duration: 0.55,
        ease: 'power4.out',
      })
    } else {
      gsap.to(findingPanelRef.current, {
        yPercent: 110,
        opacity: 0,
        duration: 0.35,
        ease: 'power3.in',
      })
    }
  }, [isFindingPanelOpen])

  useEffect(() => {
    if (!isPanelOpen) {
      setLocationSuggestions([])
      setIsSuggestionLoading(false)
      return
    }

    const searchInput = activeField === 'pickup' ? pickupLocation : destination
    const trimmedInput = searchInput.trim()

    if (trimmedInput.length < 3) {
      setLocationSuggestions([])
      setIsSuggestionLoading(false)
      return
    }

    let isCancelled = false
    const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:3000'
    const token = localStorage.getItem('token')

    const timer = setTimeout(async () => {
      try {
        setIsSuggestionLoading(true)

        const response = await axios.get(`${baseUrl}/maps/get-suggestions`, {
          params: { input: trimmedInput },
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })

        if (!isCancelled) {
          const suggestions = Array.isArray(response.data)
            ? response.data.map((item) => item.description).filter(Boolean)
            : []

          setLocationSuggestions(suggestions)
        }
      } catch {
        if (!isCancelled) {
          setLocationSuggestions([])
        }
      } finally {
        if (!isCancelled) {
          setIsSuggestionLoading(false)
        }
      }
    }, 300)

    return () => {
      isCancelled = true
      clearTimeout(timer)
    }
  }, [pickupLocation, destination, activeField, isPanelOpen])

  const openPanelForField = (field) => {
    setIsVehiclePanelOpen(false)
    setIsConfirmPanelOpen(false)
    setIsFindingPanelOpen(false)
    setActiveField(field)
    setIsPanelOpen(true)
  }
  const openPanel = () => openPanelForField('pickup')
  const closePanel = () => setIsPanelOpen(false)

  const handleBackToLocationPanel = () => {
    setIsVehiclePanelOpen(false)
    setIsConfirmPanelOpen(false)
    setIsFindingPanelOpen(false)
    setActiveField('destination')
    setIsPanelOpen(true)
  }

  const handleVehicleSelect = (vehicleOption) => {
    setCreateRideError('')
    setSelectedVehicle(vehicleOption)
    setIsVehiclePanelOpen(false)
    setIsConfirmPanelOpen(true)
  }

  const handleConfirmRide = async () => {
    if (!selectedVehicle?.id) {
      setCreateRideError('Please select a vehicle type first.')
      return
    }

    const token = localStorage.getItem('token')
    const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:3000'

    if (!token) {
      setCreateRideError('You are not logged in. Please login again.')
      return
    }

    try {
      setIsCreatingRide(true)
      setCreateRideError('')

      const profileResponse = await axios.get(`${baseUrl}/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      const userId = profileResponse.data?.user?._id
      if (!userId) {
        throw new Error('Unable to find user id from profile')
      }

      const parsedFare = Number(String(selectedVehicle.fare || '').replace(/[^0-9.]/g, ''))

      await axios.post(
        `${baseUrl}/ride/create`,
        {
          origin: pickupLocation.trim(),
          destination: destination.trim(),
          userId,
          vehicleType: selectedVehicle.id,
          fare: Number.isFinite(parsedFare) ? parsedFare : undefined,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      setIsConfirmPanelOpen(false)
      setIsFindingPanelOpen(true)
    } catch (error) {
      const apiMessage = error?.response?.data?.error
      const validationMessage = error?.response?.data?.errors?.[0]?.msg
      setCreateRideError(apiMessage || validationMessage || 'Failed to create ride. Please try again.')
    } finally {
      setIsCreatingRide(false)
    }
  }

  const handleFoundDriver = () => {
    setIsFindingPanelOpen(false)
    setIsDriverDetailsPanelOpen(true)
  }

  const handleLocationSelection = (selectedAddress) => {
    if (activeField === 'pickup') {
      setPickupLocation(selectedAddress)
      setLocationSuggestions([])
      setActiveField('destination')
      window.requestAnimationFrame(() => {
        destinationInputRef.current?.focus()
      })
      return
    }

    setDestination(selectedAddress)
    setLocationSuggestions([])
  }

  const handleProceedToVehicleSelection = () => {
    if (!pickupLocation.trim() || !destination.trim()) {
      return
    }

    setIsPanelOpen(false)
    setIsVehiclePanelOpen(true)
  }

  const inputBaseClasses =
    'flex h-14 w-full items-center rounded-xl border px-4 text-left text-base shadow-sm transition outline-none overflow-hidden'
  const disabledLikeClasses =
    'border-transparent bg-neutral-100 text-neutral-400 placeholder:text-neutral-400'

  const pickupDisplayValue = pickupLocation || 'Add a pick-up location'
  const destinationDisplayValue = destination || 'Enter your destination'
  const hasPickupValue = Boolean(pickupLocation)
  const hasDestinationValue = Boolean(destination)

  return (
    <main className="relative h-screen w-full overflow-hidden bg-neutral-100 text-black">
      {rideOtpInfo ? (
        <section className="absolute left-4 right-4 top-4 z-60 rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-4 shadow-lg">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">Ride Accepted</p>
          <p className="mt-1 text-sm text-emerald-900">
            {rideOtpInfo.captainName} accepted your ride. Share this OTP with the captain.
          </p>
          <p className="mt-2 text-3xl font-bold tracking-[0.35em] text-emerald-900">{rideOtpInfo.otp}</p>
          <button
            type="button"
            onClick={() => setRideOtpInfo(null)}
            className="mt-3 h-10 rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            Close
          </button>
        </section>
      ) : null}

      <div ref={landingRef} className="absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${mapImage})` }}
        />
        <div className="absolute inset-0 bg-linear-to-b from-white/15 via-white/5 to-white/20" />

        

        
        <div className="absolute inset-x-0 bottom-0 px-4 pb-4">
          <button
            type="button"
            onClick={openPanel}
            className="w-full rounded-3xl bg-white/95 px-5 py-5 text-left shadow-[0_18px_50px_rgba(0,0,0,0.16)] backdrop-blur-md"
          >
            <h1 className="text-4xl font-semibold tracking-tight">Find a trip</h1>

            <div className="mt-5 space-y-3">
              <div
                className={`${inputBaseClasses} ${
                  hasPickupValue ? 'border-neutral-300 bg-white text-neutral-900' : disabledLikeClasses
                }`}
              >
                <span className="block w-full truncate">{pickupDisplayValue}</span>
              </div>
              <div
                className={`${inputBaseClasses} ${
                  hasDestinationValue ? 'border-neutral-300 bg-white text-neutral-900' : disabledLikeClasses
                }`}
              >
                <span className="block w-full truncate">{destinationDisplayValue}</span>
              </div>
            </div>
          </button>
        </div>
      </div>

      <div
        ref={backdropRef}
        className="absolute inset-0 z-10 bg-black/10"
        style={{ pointerEvents: isPanelOpen ? 'auto' : 'none' }}
        onClick={closePanel}
        aria-hidden="true"
      />

      <section
        ref={panelRef}
        aria-hidden={!isPanelOpen}
        className="absolute inset-0 z-20 flex h-full flex-col overflow-hidden bg-white"
        style={{ pointerEvents: isPanelOpen ? 'auto' : 'none' }}
      >
        <div className="shrink-0 flex items-start justify-between px-5 pb-4 pt-6">
          <h2 className="text-4xl font-semibold tracking-tight text-black">Find a trip</h2>

          <button
            type="button"
            onClick={closePanel}
            aria-label="Close trip panel"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-900 shadow-sm transition hover:bg-neutral-50"
          >
            <IoChevronDown className="h-5 w-5" />
          </button>
        </div>

        <div className="shrink-0 px-5 pb-4">
          <div className="space-y-3 rounded-3xl border border-neutral-200 bg-white px-4 py-4 shadow-sm">
            <div className="relative">
              <input
                ref={pickupInputRef}
                value={pickupLocation}
                onChange={(event) => {
                  setPickupLocation(event.target.value)
                  setActiveField('pickup')
                }}
                onFocus={() => setActiveField('pickup')}
                onClick={() => openPanelForField('pickup')}
                placeholder="Add a pick-up location"
                className="h-14 w-full rounded-xl border border-amber-300 bg-white px-5 pl-10 text-base text-neutral-900 shadow-sm outline-none placeholder:text-neutral-500 focus:border-amber-400"
              />
            </div>
            <div className="relative">
              <input
                ref={destinationInputRef}
                value={destination}
                onChange={(event) => {
                  setDestination(event.target.value)
                  setActiveField('destination')
                }}
                onFocus={() => setActiveField('destination')}
                onClick={() => openPanelForField('destination')}
                placeholder="Enter your destination"
                className="h-14 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-5 pl-10 text-base text-neutral-900 shadow-sm outline-none placeholder:text-neutral-500 focus:border-neutral-300"
              />
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1">
          <LocationSearchPanel
            suggestions={locationSuggestions}
            isLoading={isSuggestionLoading}
            onSelectLocation={handleLocationSelection}
          />
        </div>

        <div className="shrink-0 border-t border-neutral-200 bg-white px-5 py-4">
          <button
            type="button"
            onClick={handleProceedToVehicleSelection}
            disabled={!pickupLocation.trim() || !destination.trim()}
            className="h-12 w-full rounded-xl bg-black text-[1.1rem] font-semibold text-white transition enabled:hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300"
          >
            Continue
          </button>
        </div>
      </section>

      <div
        ref={vehiclePanelRef}
        className="absolute inset-x-0 bottom-0"
        style={{ pointerEvents: isVehiclePanelOpen ? 'auto' : 'none' }}
      >
        <VehicleTypePanel
          pickupLocation={pickupLocation}
          destination={destination}
          onBack={handleBackToLocationPanel}
          onSelectVehicle={handleVehicleSelect}
        />
      </div>

      <div
        ref={confirmPanelRef}
        className="absolute inset-0 z-40"
        style={{ pointerEvents: isConfirmPanelOpen ? 'auto' : 'none' }}
      >
        <ConfirmRidePanel
          pickupLocation={pickupLocation}
          destination={destination}
          vehicleName={selectedVehicle?.title}
          fare={selectedVehicle?.fare}
          isSubmitting={isCreatingRide}
          errorMessage={createRideError}
          onConfirm={handleConfirmRide}
          onCancel={() => setIsConfirmPanelOpen(false)}
          onBack={() => {
            setIsConfirmPanelOpen(false)
            setIsVehiclePanelOpen(true)
          }}
        />
      </div>

      <div
        ref={findingPanelRef}
        className="absolute inset-0 z-40"
        style={{ pointerEvents: isFindingPanelOpen ? 'auto' : 'none' }}
      >
        <VehicleFindingPanel
          pickupLocation={pickupLocation}
          destination={destination}
          vehicleName={selectedVehicle?.title}
          fare={selectedVehicle?.fare}
          onFoundDriver={handleFoundDriver}
          onClose={() => setIsFindingPanelOpen(false)}
        />
      </div>

      <div
        ref={driverDetailsPanelRef}
        className="absolute inset-0 z-50"
        style={{ pointerEvents: isDriverDetailsPanelOpen ? 'auto' : 'none' }}
      >
        <DriverDetailsPanel
          driverName="Santh"
          driverImage={null}
          vehicleName="White Suzuki S-Presso LXI"
          vehicleNumber="KA15AK00-0"
          rating="4.9"
          vehicleImage={null}
          address="562/11-A Kaikondrahalli, Bengaluru, Karnataka"
          onMessage={() => console.log('Message driver')}
          onSafety={() => console.log('Safety')}
          onShareTrip={() => console.log('Share trip')}
          onCall={() => console.log('Call driver')}
          onClose={() => setIsDriverDetailsPanelOpen(false)}
        />
      </div>
    </main>
  )
}

export default Home