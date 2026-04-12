import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { FaCarSide, FaMotorcycle, FaTaxi } from 'react-icons/fa'
import { IoArrowBack, IoCardOutline } from 'react-icons/io5'

const VehicleTypePanel = ({ pickupLocation, destination, onBack, onSelectVehicle }) => {
  const [selectedVehicle, setSelectedVehicle] = useState('car')
  const [fareByVehicle, setFareByVehicle] = useState({ car: null, auto: null, bike: null })
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
          },
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })

        if (!isCancelled) {
          setFareByVehicle({
            car: response.data?.car ?? null,
            auto: response.data?.auto ?? null,
            bike: response.data?.bike ?? null,
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
  }, [pickupLocation, destination])

  const vehicleOptions = useMemo(() => ([
    {
      id: 'car',
      icon: <FaCarSide className="h-8 w-8 text-neutral-800" />,
      title: 'Car',
      capacity: '4',
      eta: '4 min away',
      away: '4 min away',
      badge: 'Faster',
      fare: fareByVehicle.car,
    },
    {
      id: 'auto',
      icon: <FaTaxi className="h-8 w-8 text-amber-500" />,
      title: 'Auto',
      capacity: '3',
      eta: '5 min away',
      away: '5 min away',
      badge: '',
      fare: fareByVehicle.auto,
    },
    {
      id: 'bike',
      icon: <FaMotorcycle className="h-8 w-8 text-neutral-700" />,
      title: 'Bike',
      capacity: '1',
      eta: '3 min away',
      away: '3 min away',
      badge: '',
      fare: fareByVehicle.bike,
    },
  ]), [fareByVehicle])

  const selectedOption = vehicleOptions.find((option) => option.id === selectedVehicle)

  return (
    <section className="absolute inset-x-0 bottom-0 z-30 rounded-t-3xl bg-white shadow-[0_-10px_30px_rgba(0,0,0,0.16)]">
      <div className="px-4 pb-4 pt-3">
        <div className="mb-3 flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            aria-label="Back to location search"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-neutral-300 bg-white text-neutral-800"
          >
            <IoArrowBack className="h-5 w-5" />
          </button>
          <h3 className="text-2xl font-semibold tracking-tight text-black">Choose a ride</h3>
        </div>

        <div className="rounded-2xl bg-neutral-100 px-4 py-3 text-[0.95rem] text-neutral-700">
          {pickupLocation && destination
            ? `${pickupLocation} -> ${destination}`
            : 'Choose pickup and destination to load route fares.'}
        </div>

        {isFareLoading ? (
          <p className="mt-3 text-sm text-neutral-500">Calculating fares from backend...</p>
        ) : null}

        <div className="mt-4 space-y-2">
          {vehicleOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => {
                setSelectedVehicle(option.id)
                onSelectVehicle?.(option)
              }}
              className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition ${
                selectedVehicle === option.id
                  ? 'bg-neutral-100 ring-1 ring-neutral-300'
                  : 'hover:bg-neutral-50'
              }`}
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white">
                {option.icon}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="text-[1.45rem] font-semibold leading-tight text-black">{option.title}</p>
                  <p className="text-base text-neutral-600">{option.capacity}</p>
                </div>

                <div className="mt-0.5 flex items-center gap-2 text-base text-neutral-700">
                  <span>{option.eta}</span>
                  {option.away ? <span>- {option.away}</span> : null}
                </div>

                {option.badge ? (
                  <span className="mt-1 inline-flex rounded-md bg-blue-600 px-2 py-0.5 text-xs font-medium text-white">
                    {option.badge}
                  </span>
                ) : null}
              </div>

              <p className="text-[1.35rem] font-semibold text-black">
                {option.fare !== null ? `Rs ${option.fare}` : '--'}
              </p>
            </button>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 border-t border-neutral-200 pt-4">
          <button
            type="button"
            className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-neutral-300 bg-white text-neutral-700"
            aria-label="Payment method"
          >
            <IoCardOutline className="h-6 w-6" />
          </button>

          <button
            type="button"
            onClick={() => selectedOption && onSelectVehicle?.({
              ...selectedOption,
              fare: selectedOption.fare !== null ? `Rs ${selectedOption.fare}` : '--',
            })}
            className="h-12 flex-1 rounded-xl bg-black text-[1.25rem] font-semibold text-white"
          >
            Choose {selectedOption?.title || 'Ride'}
          </button>
        </div>
      </div>
    </section>
  )
}

export default VehicleTypePanel