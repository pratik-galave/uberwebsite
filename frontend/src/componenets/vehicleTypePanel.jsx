import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { BASE_URL } from '../config.js'

const vehicleOptions = [
  { id: 'car', title: 'Velocity Car', desc: 'Comfortable sedan', icon: 'directions_car', capacity: '4 seats', eta: '3 min' },
  { id: 'auto', title: 'Velocity Auto', desc: 'Quick & economical', icon: 'electric_rickshaw', capacity: '3 seats', eta: '2 min' },
  { id: 'bike', title: 'Velocity Moto', desc: 'Fastest option', icon: 'two_wheeler', capacity: '1 seat', eta: '1 min' },
]

const VehicleTypePanel = ({ pickupLocation, destination, pickupCoords, destinationCoords, onBack, onSelectVehicle }) => {
  const [fares, setFares] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [selectedId, setSelectedId] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const baseUrl = BASE_URL
    const fetchFares = async () => {
      try {
        setIsLoading(true)
        const response = await axios.get(`${baseUrl}/ride/get-fare`, {
          params: { 
            pickup: pickupLocation, 
            destination,
            pickupLat: pickupCoords?.lat,
            pickupLng: pickupCoords?.lng,
            destLat: destinationCoords?.lat,
            destLng: destinationCoords?.lng
          },
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        if (response.data) setFares(response.data)
      } catch (err) {
        console.error('Failed to fetch fares', err)
      } finally {
        setIsLoading(false)
      }
    }
    if (pickupLocation && destination) fetchFares()
    else setIsLoading(false)
  }, [pickupLocation, destination])

  const handleConfirm = () => {
    if (!selectedId) return
    const option = vehicleOptions.find((v) => v.id === selectedId)
    const fare = fares[selectedId]
    onSelectVehicle({ ...option, fare })
  }

  return (
    <div className="rounded-t-2xl bg-surface-container-lowest border-t border-outline-variant/20 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
      {/* Handle */}
      <div className="flex justify-center pt-3 pb-1">
        <div className="h-1 w-10 rounded-full bg-outline-variant/30" />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Choose Ride</p>
          <h2 className="font-display text-xl font-extrabold tracking-tight text-on-surface mt-1">Select Vehicle</h2>
        </div>
        <button type="button" onClick={onBack} className="flex h-10 w-10 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors">
          <span className="material-symbols-outlined text-xl">arrow_back</span>
        </button>
      </div>

      {/* Route Summary */}
      <div className="mx-6 rounded-lg bg-surface-container-low border border-outline-variant/15 px-4 py-3 mb-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-2.5 w-2.5 rounded-full bg-primary-container border-2 border-primary" />
          <p className="text-xs text-on-surface-variant truncate">{pickupLocation}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-2.5 w-2.5 rounded-sm bg-on-surface" />
          <p className="text-xs text-on-surface-variant truncate">{destination}</p>
        </div>
      </div>

      {/* Vehicle Options */}
      <div className="px-6 pb-3 space-y-2 max-h-60 overflow-y-auto hide-scrollbar">
        {vehicleOptions.map((v) => {
          const fare = fares[v.id]
          const isSelected = selectedId === v.id
          return (
            <button
              key={v.id}
              type="button"
              onClick={() => setSelectedId(v.id)}
              className={`w-full flex items-center gap-4 rounded-lg border p-4 text-left transition-all ${
                isSelected
                  ? 'border-primary bg-primary-container/10 ring-1 ring-primary'
                  : 'border-outline-variant/20 bg-surface hover:bg-surface-container-low'
              }`}
            >
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${isSelected ? 'bg-primary-container text-on-primary-container' : 'bg-surface-container-low text-on-surface-variant'}`}>
                <span className="material-symbols-outlined text-2xl">{v.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-on-surface">{v.title}</p>
                  <p className="text-sm font-extrabold text-on-surface ml-2">
                    {isLoading ? '...' : fare != null ? `₹${fare}` : '—'}
                  </p>
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-on-surface-variant">{v.desc}</span>
                  <span className="text-xs text-outline">·</span>
                  <span className="text-xs text-on-surface-variant">{v.capacity}</span>
                  <span className="text-xs text-outline">·</span>
                  <span className="text-xs font-medium text-primary">{v.eta}</span>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Confirm */}
      <div className="px-6 pb-6 pt-3">
        <button
          type="button"
          onClick={handleConfirm}
          disabled={!selectedId}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-on-surface text-surface py-3.5 text-sm font-bold uppercase tracking-wider disabled:opacity-30 hover:bg-on-surface/90 transition-all"
        >
          Continue
          <span className="material-symbols-outlined text-lg">arrow_forward</span>
        </button>
      </div>
    </div>
  )
}

export default VehicleTypePanel