import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { FaCarSide, FaMotorcycle, FaTaxi } from 'react-icons/fa'
import { IoArrowBack, IoCardOutline } from 'react-icons/io5'

const VehicleTypePanel = ({ pickupLocation, destination, pickupCoords, destinationCoords, onBack, onSelectVehicle }) => {
  const [selectedVehicle, setSelectedVehicle] = useState('car')
  const [fareByVehicle, setFareByVehicle] = useState({ 
    car: null, auto: null, bike: null, 
    carDuration: null, autoDuration: null, bikeDuration: null,
    distance: null 
  })
  const [isFareLoading, setIsFareLoading] = useState(false)

  useEffect(() => {
    if (!pickupLocation?.trim() || !destination?.trim()) {
      setFareByVehicle({ car: null, auto: null, bike: null })
      return
    }

    let isCancelled = false
    const token = localStorage.getItem('token')
    const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:3000'

    const fetchFare = async () => {
      try {
        setIsFareLoading(true)
        const response = await axios.get(`${baseUrl}/ride/get-fare`, {
          params: {
            pickup: pickupLocation,
            destination,
            pickupLat: pickupCoords?.lat,
            pickupLng: pickupCoords?.lng,
            destLat: destinationCoords?.lat,
            destLng: destinationCoords?.lng,
          },
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })

        if (!isCancelled) {
          setFareByVehicle({
            car: response.data?.car ?? null,
            auto: response.data?.auto ?? null,
            bike: response.data?.bike ?? null,
            carDuration: response.data?.carDuration ?? null,
            autoDuration: response.data?.autoDuration ?? null,
            bikeDuration: response.data?.bikeDuration ?? null,
            distance: response.data?.distance ?? null,
          })
        }
      } catch {
        if (!isCancelled) {
          setFareByVehicle({ car: null, auto: null, bike: null })
        }
      } finally {
        if (!isCancelled) {
          setIsFareLoading(false)
        }
      }
    }

    fetchFare()

    return () => {
      isCancelled = true
    }
  }, [pickupLocation, destination, pickupCoords, destinationCoords])

  const vehicleOptions = useMemo(() => ([
    {
      id: 'car',
      icon: <span className="material-symbols-outlined text-[36px] text-primary-container">directions_car</span>,
      title: 'Car',
      capacity: '4',
      eta: fareByVehicle.distance || '...',
      away: fareByVehicle.carDuration || 'Calculating...',
      badge: 'Faster',
      fare: fareByVehicle.car,
    },
    {
      id: 'auto',
      icon: <span className="material-symbols-outlined text-[36px] text-[#FFC107]">local_taxi</span>,
      title: 'Auto',
      capacity: '3',
      eta: fareByVehicle.distance || '...',
      away: fareByVehicle.autoDuration || 'Calculating...',
      badge: '',
      fare: fareByVehicle.auto,
    },
    {
      id: 'bike',
      icon: <span className="material-symbols-outlined text-[36px] text-on-surface">two_wheeler</span>,
      title: 'Bike',
      capacity: '1',
      eta: fareByVehicle.distance || '...',
      away: fareByVehicle.bikeDuration || 'Calculating...',
      badge: '',
      fare: fareByVehicle.bike,
    },
  ]), [fareByVehicle])

  const selectedOption = vehicleOptions.find((option) => option.id === selectedVehicle)

  return (
    <section className="absolute inset-x-0 bottom-0 z-30 rounded-t-3xl bg-surface-variant/40 border border-outline/20 shadow-[0_-20px_40px_rgba(0,0,0,0.6)] backdrop-blur-[40px] overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
      <div className="px-container-margin pb-6 pt-5">
        <div className="mb-stack-md flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              aria-label="Back to location search"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-lowest border border-outline/20 text-on-surface shadow-sm transition hover:bg-surface-variant"
            >
              <IoArrowBack className="h-5 w-5" />
            </button>
            <h3 className="font-display-sm text-display-sm tracking-tight text-on-surface">Select Vehicle</h3>
          </div>
          
          <div className="flex gap-2">
            <span className="material-symbols-outlined text-on-surface-variant/70 text-[20px]">schedule</span>
            <span className="font-label-caps text-[12px] text-on-surface-variant/70 uppercase pt-0.5">{isFareLoading ? 'CALC...' : 'NOW'}</span>
          </div>
        </div>

        <div className="rounded-xl bg-surface-container-lowest/60 border border-outline/10 px-4 py-3 text-[12px] text-on-surface-variant/80 font-body-sm truncate flex gap-2 items-center">
          <span className="material-symbols-outlined text-[16px] text-[#00B8D4]">route</span>
          {pickupLocation && destination
            ? <span className="truncate">{pickupLocation} <span className="mx-1">→</span> {destination}</span>
            : 'Choose pickup and destination...'}
        </div>

        <div className="mt-stack-md space-y-3">
          {vehicleOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => {
                setSelectedVehicle(option.id)
              }}
              className={`flex w-full items-center gap-4 rounded-2xl border px-4 py-4 text-left transition-all overflow-hidden relative ${
                selectedVehicle === option.id
                  ? 'bg-surface-container-lowest/80 border-primary-container shadow-[0_0_20px_rgba(0,229,255,0.15)]'
                  : 'bg-surface-variant/20 border-outline/10 hover:bg-surface-variant/40'
              }`}
            >
              {selectedVehicle === option.id && (
                <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-primary-container shadow-[0_0_10px_#00E5FF]"></div>
              )}
              
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-gradient-to-b from-surface-container-lowest to-surface-variant shadow-inner">
                {option.icon}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-display-xs text-display-xs leading-tight text-on-surface tracking-wide">{option.title}</p>
                  <div className="flex items-center gap-1 text-on-surface-variant/80 text-[12px] font-body-sm bg-surface-variant px-1.5 py-0.5 rounded-full">
                    <span className="material-symbols-outlined text-[12px]">person</span>
                    <span>{option.capacity}</span>
                  </div>
                </div>

                <div className="mt-1 flex items-center gap-2 font-body-sm text-body-sm text-on-surface-variant/70">
                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">map</span> {option.eta}</span>
                  {option.away ? <span className="flex items-center gap-1">· <span className="material-symbols-outlined text-[14px]">schedule</span> {option.away}</span> : null}
                </div>

                {option.badge ? (
                  <span className="mt-1.5 inline-block rounded border border-[#00B8D4]/30 bg-[#00B8D4]/10 px-2 py-0.5 text-[10px] font-label-caps uppercase text-[#00B8D4]">
                    {option.badge}
                  </span>
                ) : null}
              </div>

              <div className="text-right flex flex-col items-end gap-1">
                <p className="font-display-sm text-[20px] text-primary-container tracking-tighter">
                  {option.fare !== null ? `₹${option.fare}` : '--'}
                </p>
                {isFareLoading && <p className="text-[10px] text-on-surface-variant animate-pulse font-label-caps">Loading</p>}
              </div>
            </button>
          ))}
        </div>

        <div className="mt-stack-lg pt-4 flex gap-3">
          <button
            type="button"
            className="flex w-[60px] flex-col items-center justify-center rounded-xl border border-outline/20 bg-surface-container-lowest/60 text-on-surface hover:bg-surface-variant/40 transition"
            aria-label="Payment method"
          >
            <span className="material-symbols-outlined text-[24px] mb-1 text-secondary-fixed">payments</span>
            <span className="text-[10px] font-label-caps uppercase text-on-surface-variant">Cash</span>
          </button>

          <button
            type="button"
            onClick={() => selectedOption && onSelectVehicle?.({
              ...selectedOption,
              fare: selectedOption.fare,
            })}
            disabled={!selectedOption || selectedOption.fare === null || isFareLoading}
            className="h-14 flex-1 rounded-xl bg-gradient-to-r from-primary-container to-[#00B8D4] font-label-caps text-label-caps text-on-primary-fixed uppercase tracking-widest shadow-[0_0_20px_rgba(0,229,255,0.25)] transition-all enabled:hover:shadow-[0_0_25px_rgba(0,229,255,0.4)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            Book {selectedOption?.title || 'Ride'}
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>
      </div>
    </section>
  )
}

export default VehicleTypePanel