import React, { useEffect, useState } from 'react'

const VehicleFindingPanel = ({ pickupLocation, destination, vehicleName, fare, onFoundDriver, onClose }) => {
  const [dots, setDots] = useState('')

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'))
    }, 500)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="rounded-t-2xl bg-surface-container-lowest border-t border-outline-variant/20 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
      <div className="flex justify-center pt-3 pb-1">
        <div className="h-1 w-10 rounded-full bg-outline-variant/30" />
      </div>

      <div className="px-6 py-4 text-center">
        {/* Animated Radar */}
        <div className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-primary-container/30 animate-ping" />
          <div className="absolute inset-3 rounded-full border border-primary-container/50 animate-ping" style={{ animationDelay: '0.3s' }} />
          <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-primary-container/15 border border-primary-container/30">
            <span className="material-symbols-outlined text-3xl text-primary">local_taxi</span>
          </div>
        </div>

        <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Searching</p>
        <h2 className="font-display text-xl font-extrabold tracking-tight text-on-surface">
          Finding your driver{dots}
        </h2>
        <p className="mt-2 text-sm text-on-surface-variant">Looking for nearby captains to match your ride</p>
      </div>

      {/* Trip Summary */}
      <div className="mx-6 rounded-lg bg-surface-container-low border border-outline-variant/15 p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-bold text-on-surface">{vehicleName || 'Vehicle'}</span>
          <span className="text-sm font-extrabold text-on-surface">{fare || '—'}</span>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary-container border border-primary" />
            <p className="text-xs text-on-surface-variant truncate">{pickupLocation}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-sm bg-on-surface" />
            <p className="text-xs text-on-surface-variant truncate">{destination}</p>
          </div>
        </div>
      </div>

      <div className="px-6 pb-6">
        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-lg border border-outline-variant/30 bg-surface py-3 text-sm font-bold text-on-surface uppercase tracking-wider hover:bg-surface-container-low transition-colors"
        >
          Cancel Search
        </button>
      </div>
    </div>
  )
}

export default VehicleFindingPanel