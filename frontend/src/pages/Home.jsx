import { useContext, useEffect, useRef, useState } from 'react'
import axios from 'axios'
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
    if (!isConnected) return
    sendMessageToEvent('debug:frontend-connected', { source: 'Home', timestamp: Date.now() })
  }, [isConnected, sendMessageToEvent])

  useEffect(() => {
    const userId = userData?._id
    if (!userId) return
    sendMessageToEvent('join', {userType: 'user', userId})
  }, [sendMessageToEvent, userData])

  useEffect(() => {
    const unsubscribeNearbyCaptains = receiveMessageFromEvent('nearbyCaptains', (payload) => {
      const captainNames = Array.isArray(payload?.captainNames) ? payload.captainNames : []
      console.log('Nearby captains:', { total: payload?.totalNearbyCaptains ?? captainNames.length, captainNames })
    })
    return () => unsubscribeNearbyCaptains()
  }, [receiveMessageFromEvent])

  useEffect(() => {
    const unsubscribeRideAccepted = receiveMessageFromEvent('rideAccepted', (payload) => {
      if (!payload?.otp) return
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
    })
    return () => unsubscribeRideAccepted()
  }, [destination, destinationCoords, pickupCoords, pickupLocation, receiveMessageFromEvent])

  useEffect(() => {
    const unsubscribeOtpVerificationRequested = receiveMessageFromEvent('otpVerificationRequested', (payload) => {
      if (!payload?.rideId || !payload?.captainId || !payload?.enteredOtp) return

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
        navigate('/user-ride', { state: activeRideMeta })
      }
    })
    return () => unsubscribeOtpVerificationRequested()
  }, [destination, destinationCoords, navigate, pickupCoords, pickupLocation, receiveMessageFromEvent, rideOtpInfo, selectedVehicle, sendMessageToEvent])

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        if (isFindingPanelOpen) { setIsFindingPanelOpen(false); return }
        if (isConfirmPanelOpen) { setIsConfirmPanelOpen(false); return }
        if (isVehiclePanelOpen) { setIsVehiclePanelOpen(false); return }
        setIsPanelOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isFindingPanelOpen, isConfirmPanelOpen, isVehiclePanelOpen])

  useEffect(() => {
    if (isPanelOpen) {
      window.requestAnimationFrame(() => {
        if (activeField === 'destination') destinationInputRef.current?.focus()
        else pickupInputRef.current?.focus()
      })
    }
  }, [activeField, isPanelOpen])

  useEffect(() => {
    if (!isPanelOpen) { setLocationSuggestions([]); setIsSuggestionLoading(false); return }
    const searchInput = activeField === 'pickup' ? pickupLocation : destination
    const trimmedInput = searchInput.trim()
    if (trimmedInput.length < 3) { setLocationSuggestions([]); setIsSuggestionLoading(false); return }

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
        if (!isCancelled) setLocationSuggestions(Array.isArray(response.data) ? response.data : [])
      } catch {
        if (!isCancelled) setLocationSuggestions([])
      } finally {
        if (!isCancelled) setIsSuggestionLoading(false)
      }
    }, 300)
    return () => { isCancelled = true; clearTimeout(timer) }
  }, [pickupLocation, destination, activeField, isPanelOpen])

  const openPanelForField = (field) => {
    setIsVehiclePanelOpen(false); setIsConfirmPanelOpen(false); setIsFindingPanelOpen(false)
    setActiveField(field); setIsPanelOpen(true)
  }
  const openPanel = () => openPanelForField('pickup')
  const closePanel = () => setIsPanelOpen(false)

  const handleBackToLocationPanel = () => {
    setIsVehiclePanelOpen(false); setIsConfirmPanelOpen(false); setIsFindingPanelOpen(false)
    setActiveField('destination'); setIsPanelOpen(true)
  }

  const handleVehicleSelect = (vehicleOption) => {
    setCreateRideError(''); setSelectedVehicle(vehicleOption)
    setIsVehiclePanelOpen(false); setIsConfirmPanelOpen(true)
  }

  const handleConfirmRide = async () => {
    if (!selectedVehicle?.id) { setCreateRideError('Please select a vehicle type first.'); return }
    const token = localStorage.getItem('token')
    const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:3000'
    if (!token) { setCreateRideError('You are not logged in. Please login again.'); return }

    try {
      setIsCreatingRide(true); setCreateRideError('')
      const profileResponse = await axios.get(`${baseUrl}/user/profile`, { headers: { Authorization: `Bearer ${token}` } })
      const userId = profileResponse.data?.user?._id
      if (!userId) throw new Error('Unable to find user id from profile')

      const parsedFare = Number.isFinite(selectedVehicle.fare) ? Number(selectedVehicle.fare) : Number(String(selectedVehicle.fare || '').replace(/[^0-9.]/g, ''))

      await axios.post(`${baseUrl}/ride/create`, {
        origin: pickupLocation.trim(), destination: destination.trim(),
        pickupLat: pickupCoords?.lat, pickupLng: pickupCoords?.lng,
        destLat: destinationCoords?.lat, destLng: destinationCoords?.lng,
        userId, vehicleType: selectedVehicle.id,
        fare: Number.isFinite(parsedFare) ? parsedFare : undefined,
      }, { headers: { Authorization: `Bearer ${token}` } })

      setIsConfirmPanelOpen(false); setIsFindingPanelOpen(true)
    } catch (error) {
      const apiMessage = error?.response?.data?.error
      const validationMessage = error?.response?.data?.errors?.[0]?.msg
      setCreateRideError(apiMessage || validationMessage || 'Failed to create ride. Please try again.')
    } finally {
      setIsCreatingRide(false)
    }
  }

  const handleFoundDriver = () => { setIsFindingPanelOpen(false); setIsDriverDetailsPanelOpen(true) }

  const resolveAddressCoordinates = async (address) => {
    const normalizedAddress = String(address || '').trim()
    if (!normalizedAddress) return null
    const token = localStorage.getItem('token')
    const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:3000'
    try {
      const response = await axios.get(`${baseUrl}/maps/get-coordinates`, {
        params: { address: normalizedAddress },
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      const lat = Number(response.data?.lat)
      const lng = Number(response.data?.lng)
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
      return { lat, lng }
    } catch { return null }
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
      setLocationSuggestions([]); setActiveField('destination')
      window.requestAnimationFrame(() => { destinationInputRef.current?.focus() })
      return
    }
    setDestination(address)
    if (coords) setDestinationCoords(coords)
    setLocationSuggestions([])
  }

  const handlePickupChange = async (coords) => {
    setPickupCoords(coords)
    try {
      const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?lat=${coords.lat}&lon=${coords.lng}&format=json`)
      if (res.data?.display_name) setPickupLocation(res.data.display_name)
    } catch {}
  }

  const handleDestinationChange = async (coords) => {
    setDestinationCoords(coords)
    try {
      const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?lat=${coords.lat}&lon=${coords.lng}&format=json`)
      if (res.data?.display_name) setDestination(res.data.display_name)
    } catch {}
  }

  const handleProceedToVehicleSelection = () => {
    if (!pickupLocation.trim() || !destination.trim()) return
    const proceed = async () => {
      const pickupToSet = pickupCoords || await resolveAddressCoordinates(pickupLocation)
      const destinationToSet = destinationCoords || await resolveAddressCoordinates(destination)
      if (pickupToSet) setPickupCoords(pickupToSet)
      if (destinationToSet) setDestinationCoords(destinationToSet)
      setIsPanelOpen(false); setIsVehiclePanelOpen(true)
    }
    proceed()
  }

  return (
    <main className="fixed inset-0 w-full overflow-hidden bg-background text-on-surface">
      {/* OTP Banner */}
      {rideOtpInfo && (
        <section className="absolute left-6 right-6 top-6 z-[60] rounded-xl bg-surface-container-lowest border border-outline-variant/30 p-6 shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <span className="h-2 w-2 rounded-full bg-primary-container" />
            <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Your Ride OTP</p>
          </div>
          <p className="text-sm text-on-surface-variant mb-4">
            Captain <span className="font-bold text-on-surface">{rideOtpInfo.captainName}</span> is approaching. Share this code:
          </p>
          <p className="text-5xl font-black tracking-[0.2em] text-on-surface text-center leading-none mb-4 bg-surface-container-low py-4 rounded-lg font-display">{rideOtpInfo.otp}</p>
          <button
            type="button"
            onClick={() => setRideOtpInfo(null)}
            className="w-full rounded-md bg-on-surface text-surface py-3 text-sm font-bold uppercase tracking-wider hover:bg-on-surface/90 transition-colors"
          >
            Dismiss
          </button>
        </section>
      )}

      {/* Map */}
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

      {/* Logo */}
      <div className="absolute top-6 left-6 z-20">
        <div className="rounded-lg bg-surface-container-lowest/95 border border-outline-variant/20 px-4 py-2 shadow-sm backdrop-blur-sm">
          <span className="text-lg font-extrabold tracking-tight font-display">Velocity<span className="text-primary">.</span></span>
        </div>
      </div>

      {/* Search Card */}
      <div className="absolute inset-x-0 bottom-0 px-6 pb-6 z-20 pointer-events-none">
        <button
          type="button"
          onClick={openPanel}
          className="w-full rounded-xl bg-surface-container-lowest/95 border border-outline-variant/20 p-5 text-left shadow-lg backdrop-blur-sm pointer-events-auto transition-transform active:scale-[0.99]"
        >
          <h1 className="font-display text-xl font-extrabold tracking-tight text-on-surface mb-4">Where to?</h1>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-primary-container border-2 border-primary" />
              <span className={`text-sm font-medium truncate ${pickupLocation ? 'text-on-surface' : 'text-outline'}`}>
                {pickupLocation || 'Enter pickup location'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-sm bg-on-surface" />
              <span className={`text-sm font-medium truncate ${destination ? 'text-on-surface' : 'text-outline'}`}>
                {destination || 'Enter destination'}
              </span>
            </div>
          </div>
        </button>
      </div>

      {/* Location Search Panel (Full Screen) */}
      {isPanelOpen && (
        <>
          <div className="absolute inset-0 z-30 bg-on-surface/5 pointer-events-auto backdrop-blur-[1px]" onClick={closePanel} />
          <section className="absolute inset-0 z-40 flex flex-col overflow-hidden bg-background pointer-events-auto">
            {/* Panel Header */}
            <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-outline-variant/20 bg-surface-container-lowest">
              <h2 className="font-display text-lg font-extrabold tracking-tight text-on-surface">Set Route</h2>
              <button type="button" onClick={closePanel} className="flex h-10 w-10 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors">
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {/* Inputs */}
            <div className="shrink-0 px-6 py-5 bg-surface-container-lowest border-b border-outline-variant/20">
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1.5">Pickup</label>
                  <div className="flex items-center rounded-md border border-outline-variant bg-surface overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary-container transition-all">
                    <span className="material-symbols-outlined text-primary text-lg ml-3 mr-2">my_location</span>
                    <input
                      ref={pickupInputRef}
                      value={pickupLocation}
                      onChange={(e) => { setPickupLocation(e.target.value); setActiveField('pickup') }}
                      onFocus={() => setActiveField('pickup')}
                      placeholder="Enter pickup location"
                      className="flex-1 bg-transparent h-11 text-on-surface text-sm outline-none placeholder:text-outline px-2"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1.5">Destination</label>
                  <div className="flex items-center rounded-md border border-outline-variant bg-surface overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary-container transition-all">
                    <span className="material-symbols-outlined text-on-surface text-lg ml-3 mr-2">location_on</span>
                    <input
                      ref={destinationInputRef}
                      value={destination}
                      onChange={(e) => { setDestination(e.target.value); setActiveField('destination') }}
                      onFocus={() => setActiveField('destination')}
                      placeholder="Enter destination"
                      className="flex-1 bg-transparent h-11 text-on-surface text-sm outline-none placeholder:text-outline px-2"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="min-h-0 flex-1 overflow-y-auto hide-scrollbar bg-background">
              <LocationSearchPanel suggestions={locationSuggestions} isLoading={isSuggestionLoading} onSelectLocation={handleLocationSelection} />
            </div>

            {/* CTA */}
            <div className="shrink-0 border-t border-outline-variant/20 bg-surface-container-lowest px-6 py-4">
              <button
                type="button"
                onClick={handleProceedToVehicleSelection}
                disabled={!pickupLocation.trim() || !destination.trim()}
                className="w-full flex items-center justify-center gap-2 rounded-md bg-on-surface text-surface py-3.5 text-sm font-bold uppercase tracking-wider disabled:opacity-30 hover:bg-on-surface/90 transition-all"
              >
                Find Rides
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </button>
            </div>
          </section>
        </>
      )}

      {/* Vehicle Type Panel */}
      {isVehiclePanelOpen && (
        <div className="absolute inset-x-0 bottom-0 pointer-events-auto z-40">
          <VehicleTypePanel
            pickupLocation={pickupLocation} destination={destination}
            pickupCoords={pickupCoords} destinationCoords={destinationCoords}
            onBack={handleBackToLocationPanel} onSelectVehicle={handleVehicleSelect}
          />
        </div>
      )}

      {/* Backdrop for bottom panels */}
      {(isConfirmPanelOpen || isFindingPanelOpen || isDriverDetailsPanelOpen) && (
        <div className="absolute inset-0 z-30 bg-on-surface/5 backdrop-blur-[1px] pointer-events-auto" />
      )}

      {isConfirmPanelOpen && (
        <div className="absolute inset-x-0 bottom-0 z-40 pointer-events-auto">
          <ConfirmRidePanel
            pickupLocation={pickupLocation} destination={destination}
            vehicleName={selectedVehicle?.title}
            fare={selectedVehicle?.fare != null ? `Rs ${selectedVehicle.fare}` : null}
            isSubmitting={isCreatingRide} errorMessage={createRideError}
            onConfirm={handleConfirmRide} onCancel={() => setIsConfirmPanelOpen(false)}
            onBack={() => { setIsConfirmPanelOpen(false); setIsVehiclePanelOpen(true) }}
          />
        </div>
      )}

      {isFindingPanelOpen && (
        <div className="absolute inset-x-0 bottom-0 z-40 pointer-events-auto">
          <VehicleFindingPanel
            pickupLocation={pickupLocation} destination={destination}
            vehicleName={selectedVehicle?.title}
            fare={selectedVehicle?.fare != null ? `Rs ${selectedVehicle.fare}` : null}
            onFoundDriver={handleFoundDriver} onClose={() => setIsFindingPanelOpen(false)}
          />
        </div>
      )}

      {isDriverDetailsPanelOpen && (
        <div className="absolute inset-x-0 bottom-0 z-40 pointer-events-auto">
          <DriverDetailsPanel
            driverName="Santh" driverImage={null}
            vehicleName="White Suzuki S-Presso LXI" vehicleNumber="KA15AK00-0"
            rating="4.9" vehicleImage={null}
            address="562/11-A Kaikondrahalli, Bengaluru, Karnataka"
            onMessage={() => console.log('Message driver')}
            onSafety={() => console.log('Safety')}
            onShareTrip={() => console.log('Share trip')}
            onCall={() => console.log('Call driver')}
            onClose={() => setIsDriverDetailsPanelOpen(false)}
          />
        </div>
      )}
    </main>
  )
}

export default Home