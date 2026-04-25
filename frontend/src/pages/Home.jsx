import { useContext, useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { IoChevronDown } from 'react-icons/io5'
import { useNavigate } from 'react-router-dom'
import InteractiveMap from '../componenets/InteractiveMap.jsx'
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
  const [pickupCoords, setPickupCoords] = useState(null)
  const [destinationCoords, setDestinationCoords] = useState(null)
  const [locationSuggestions, setLocationSuggestions] = useState([])
  const [isSuggestionLoading, setIsSuggestionLoading] = useState(false)
  const [isCreatingRide, setIsCreatingRide] = useState(false)
  const [createRideError, setCreateRideError] = useState('')
  const [rideOtpInfo, setRideOtpInfo] = useState(null)
  const [activeField, setActiveField] = useState('pickup')
  const [selectedVehicle, setSelectedVehicle] = useState(null)
  const pickupInputRef = useRef(null)
  const destinationInputRef = useRef(null)

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
        origin: payload.origin || pickupLocation,
        destination: payload.destination || destination,
        pickupCoordinates: payload.pickupCoordinates || pickupCoords || null,
        destinationCoordinates: payload.destinationCoordinates || destinationCoords || null,
        fare: payload.fare ?? null,
      })

      console.log('Ride accepted, share OTP with captain:', payload)
    })

    return () => unsubscribeRideAccepted()
  }, [destination, destinationCoords, pickupCoords, pickupLocation, receiveMessageFromEvent])

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

        const activeRideMeta = {
          rideId: String(payload.rideId),
          origin: rideOtpInfo?.origin || pickupLocation.trim(),
          destination: rideOtpInfo?.destination || destination.trim(),
          pickupCoordinates: rideOtpInfo?.pickupCoordinates || pickupCoords || null,
          destinationCoordinates: rideOtpInfo?.destinationCoordinates || destinationCoords || null,
          fare: rideOtpInfo?.fare ?? selectedVehicle?.fare ?? null,
        }

        localStorage.setItem('activeUserRideMeta', JSON.stringify(activeRideMeta))

        navigate('/user-ride', {
          state: activeRideMeta,
        })
      }

      console.log('OTP verification requested by captain:', {
        rideId: payload.rideId,
        captainId: payload.captainId,
        isValid,
      })
    })

    return () => unsubscribeOtpVerificationRequested()
  }, [destination, destinationCoords, navigate, pickupCoords, pickupLocation, receiveMessageFromEvent, rideOtpInfo, selectedVehicle, sendMessageToEvent])

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
            ? response.data
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

      const parsedFare = Number.isFinite(selectedVehicle.fare)
        ? Number(selectedVehicle.fare)
        : Number(String(selectedVehicle.fare || '').replace(/[^0-9.]/g, ''))

      await axios.post(
        `${baseUrl}/ride/create`,
        {
          origin: pickupLocation.trim(),
          destination: destination.trim(),
          pickupLat: pickupCoords?.lat,
          pickupLng: pickupCoords?.lng,
          destLat: destinationCoords?.lat,
          destLng: destinationCoords?.lng,
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

  const resolveAddressCoordinates = async (address) => {
    const normalizedAddress = String(address || '').trim()
    if (!normalizedAddress) {
      return null
    }

    const token = localStorage.getItem('token')
    const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:3000'

    try {
      const response = await axios.get(`${baseUrl}/maps/get-coordinates`, {
        params: { address: normalizedAddress },
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })

      const lat = Number(response.data?.lat)
      const lng = Number(response.data?.lng)

      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        return null
      }

      return { lat, lng }
    } catch {
      return null
    }
  }

  const handleLocationSelection = async (selectedItem) => {
    const address = typeof selectedItem === 'string' ? selectedItem : selectedItem?.description
    const lat = Number(selectedItem?.lat)
    const lng = Number(selectedItem?.lng)
    const directCoords = Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null
    const coords = directCoords || await resolveAddressCoordinates(address)

    if (activeField === 'pickup') {
      setPickupLocation(address)
      if (coords) setPickupCoords(coords)
      setLocationSuggestions([])
      setActiveField('destination')
      window.requestAnimationFrame(() => {
        destinationInputRef.current?.focus()
      })
      return
    }

    setDestination(address)
    if (coords) setDestinationCoords(coords)
    setLocationSuggestions([])
  }

  const handlePickupChange = async (coords) => {
     setPickupCoords(coords);
     try {
         const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?lat=${coords.lat}&lon=${coords.lng}&format=json`);
         if(res.data && res.data.display_name) {
             setPickupLocation(res.data.display_name);
         }
     } catch(e) {}
  };

  const handleDestinationChange = async (coords) => {
     setDestinationCoords(coords);
     try {
         const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?lat=${coords.lat}&lon=${coords.lng}&format=json`);
         if(res.data && res.data.display_name) {
             setDestination(res.data.display_name);
         }
     } catch(e) {}
  };

  const handleProceedToVehicleSelection = () => {
    if (!pickupLocation.trim() || !destination.trim()) {
      return
    }

    const proceed = async () => {
      const pickupToSet = pickupCoords || await resolveAddressCoordinates(pickupLocation)
      const destinationToSet = destinationCoords || await resolveAddressCoordinates(destination)

      if (pickupToSet) {
        setPickupCoords(pickupToSet)
      }

      if (destinationToSet) {
        setDestinationCoords(destinationToSet)
      }

      setIsPanelOpen(false)
      setIsVehiclePanelOpen(true)
    }

    proceed()
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
    <main className="fixed inset-0 w-full overflow-hidden bg-background text-on-background antialiased">
      {rideOtpInfo ? (
        <section className="absolute left-4 right-4 top-14 z-60 rounded-xl border border-secondary-fixed/50 bg-secondary-fixed/10 backdrop-blur-md px-4 py-4 shadow-[0_10px_30px_rgba(98,255,150,0.2)]">
          <p className="font-label-caps text-label-caps text-secondary-fixed uppercase tracking-widest">Ride Accepted</p>
          <p className="mt-1 font-body-sm text-body-sm text-on-surface">
            {rideOtpInfo.captainName} accepted your ride. Share this OTP.
          </p>
          <p className="mt-2 text-4xl font-bold tracking-[0.35em] text-secondary-fixed text-center">{rideOtpInfo.otp}</p>
          <button
            type="button"
            onClick={() => setRideOtpInfo(null)}
            className="mt-3 w-full h-10 rounded-lg bg-surface-variant/50 border border-outline/30 px-4 font-label-caps text-label-caps text-on-surface transition hover:bg-surface-variant"
          >
            Close
          </button>
        </section>
      ) : null}

      <div className="absolute inset-0">
        <div className="absolute inset-0 z-0">
          <InteractiveMap 
             pickupCoords={pickupCoords} 
             destinationCoords={destinationCoords}
             pickupString={pickupLocation}
             destinationString={destination}
             onPickupChange={handlePickupChange}
             onDestinationChange={handleDestinationChange}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent pointer-events-none z-10" />

        <div className="absolute inset-x-0 bottom-0 px-container-margin pb-6 z-20 pointer-events-none flex flex-col gap-4">
          
          <button
            type="button"
            onClick={openPanel}
            className="w-full rounded-2xl bg-surface-variant/40 border border-outline/20 p-stack-lg text-left shadow-[0_20px_40px_rgba(0,0,0,0.6)] backdrop-blur-[40px] pointer-events-auto relative overflow-hidden"
          >
            {/* Subtle top edge highlight */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
            
            <h1 className="font-display-md text-display-md text-primary-container tracking-tighter">Find a trip</h1>

            <div className="mt-stack-md flex flex-col gap-3 relative">
              {/* Connecting line */}
              <div className="absolute left-[20px] top-[24px] bottom-[24px] w-[2px] bg-outline/30 z-0 border-l border-dashed border-outline/50"></div>
              
              <div
                className={`relative z-10 flex items-center bg-surface-container-lowest/60 border border-outline/30 rounded-xl px-4 py-3 h-14 backdrop-blur-sm`}
              >
                <span className="material-symbols-outlined text-primary-container text-[20px] mr-3">radio_button_checked</span>
                <span className={`block w-full truncate font-body-md text-body-md ${hasPickupValue ? 'text-on-surface' : 'text-on-surface-variant/50'}`}>
                  {pickupDisplayValue}
                </span>
              </div>
              <div
                className={`relative z-10 flex items-center bg-surface-container-lowest/60 border border-outline/30 rounded-xl px-4 py-3 h-14 backdrop-blur-sm`}
              >
                <span className="material-symbols-outlined text-[#00B8D4] text-[20px] mr-3">location_on</span>
                <span className={`block w-full truncate font-body-md text-body-md ${hasDestinationValue ? 'text-on-surface' : 'text-on-surface-variant/50'}`}>
                  {destinationDisplayValue}
                </span>
              </div>
            </div>
          </button>
        </div>
      </div>

      {isPanelOpen ? (
        <>
          <div
            className="absolute inset-0 z-10 bg-black/10 pointer-events-auto"
            onClick={closePanel}
            aria-hidden="true"
          />

          <section className="absolute inset-0 z-20 flex flex-col overflow-hidden bg-background pointer-events-auto">
        <div className="shrink-0 flex items-center justify-between px-container-margin pb-4 pt-6 border-b border-outline/10 bg-surface-variant/20 backdrop-blur-md">
          <h2 className="font-display-sm text-display-sm text-on-surface tracking-tight">Search Location</h2>

          <button
            type="button"
            onClick={closePanel}
            aria-label="Close trip panel"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-lowest border border-outline/20 text-on-surface shadow-sm transition hover:bg-surface-variant"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="shrink-0 px-container-margin py-stack-md bg-surface-variant/10">
          <div className="flex flex-col gap-3 relative">
            {/* Connecting line */}
            <div className="absolute left-[20px] top-[24px] bottom-[24px] w-[2px] border-l border-dashed border-outline/50 z-0"></div>
            
            <div className="relative z-10 flex items-center bg-surface-container-lowest/80 border border-outline/30 rounded-xl h-14 backdrop-blur-sm overflow-hidden focus-within:border-primary-container focus-within:ring-1 focus-within:ring-primary-container transition-colors">
              <span className="material-symbols-outlined text-primary-container text-[20px] ml-4 mr-2">radio_button_checked</span>
              <input
                ref={pickupInputRef}
                value={pickupLocation}
                onChange={(event) => {
                  setPickupLocation(event.target.value)
                  setActiveField('pickup')
                }}
                onFocus={() => setActiveField('pickup')}
                onClick={() => openPanelForField('pickup')}
                placeholder="Pick-up location"
                className="flex-1 bg-transparent h-full text-on-surface font-body-md text-body-md outline-none placeholder:text-on-surface-variant/40 px-2"
              />
            </div>
            <div className="relative z-10 flex items-center bg-surface-container-lowest/80 border border-outline/30 rounded-xl h-14 backdrop-blur-sm overflow-hidden focus-within:border-[#00B8D4] focus-within:ring-1 focus-within:ring-[#00B8D4] transition-colors">
              <span className="material-symbols-outlined text-[#00B8D4] text-[20px] ml-4 mr-2">location_on</span>
              <input
                ref={destinationInputRef}
                value={destination}
                onChange={(event) => {
                  setDestination(event.target.value)
                  setActiveField('destination')
                }}
                onFocus={() => setActiveField('destination')}
                onClick={() => openPanelForField('destination')}
                placeholder="Where to?"
                className="flex-1 bg-transparent h-full text-on-surface font-body-md text-body-md outline-none placeholder:text-on-surface-variant/40 px-2"
              />
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto hide-scrollbar bg-background">
          <LocationSearchPanel
            suggestions={locationSuggestions}
            isLoading={isSuggestionLoading}
            onSelectLocation={handleLocationSelection}
          />
        </div>

        <div className="shrink-0 border-t border-outline/20 bg-surface-variant/30 backdrop-blur-md px-container-margin py-4">
          <button
            type="button"
            onClick={handleProceedToVehicleSelection}
            disabled={!pickupLocation.trim() || !destination.trim()}
            className="w-full rounded-xl bg-primary-container py-3.5 text-on-primary-fixed font-label-caps text-label-caps uppercase tracking-widest shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-all enabled:hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none flex justify-center items-center gap-2"
          >
            Confirm Locations
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>
      </section>
        </>
      ) : null}

      {isVehiclePanelOpen ? (
        <div className="absolute inset-x-0 bottom-0 pointer-events-auto">
          <VehicleTypePanel
            pickupLocation={pickupLocation}
            destination={destination}
            pickupCoords={pickupCoords}
            destinationCoords={destinationCoords}
            onBack={handleBackToLocationPanel}
            onSelectVehicle={handleVehicleSelect}
          />
        </div>
      ) : null}

      {isConfirmPanelOpen || isFindingPanelOpen || isDriverDetailsPanelOpen ? (
        <div
          className="absolute inset-0 z-30 bg-black/20 backdrop-blur-[1px] pointer-events-auto"
          aria-hidden="true"
        />
      ) : null}

      {isConfirmPanelOpen ? (
        <div className="absolute inset-x-0 bottom-0 z-40 pointer-events-auto">
        <ConfirmRidePanel
          pickupLocation={pickupLocation}
          destination={destination}
          vehicleName={selectedVehicle?.title}
          fare={selectedVehicle?.fare != null ? `Rs ${selectedVehicle.fare}` : null}
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
      ) : null}

      {isFindingPanelOpen ? (
        <div className="absolute inset-x-0 bottom-0 z-40 pointer-events-auto">
        <VehicleFindingPanel
          pickupLocation={pickupLocation}
          destination={destination}
          vehicleName={selectedVehicle?.title}
          fare={selectedVehicle?.fare != null ? `Rs ${selectedVehicle.fare}` : null}
          onFoundDriver={handleFoundDriver}
          onClose={() => setIsFindingPanelOpen(false)}
        />
        </div>
      ) : null}

      {isDriverDetailsPanelOpen ? (
        <div className="absolute inset-x-0 bottom-0 z-40 pointer-events-auto">
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
      ) : null}
    </main>
  )
}

export default Home