import React from 'react'

const CustomerRequestPanel = ({ pickupLocation, destination, fare, passengerName, onAccept, onIgnore }) => {
  return (
    <div className="rounded-t-2xl bg-surface-container-lowest border-t border-outline-variant/20 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
      <div className="flex justify-center pt-3 pb-1">
        <div className="h-1 w-10 rounded-full bg-outline-variant/30" />
      </div>

      <div className="px-6 py-3">
        <div className="flex items-center gap-2 mb-1">
          <div className="h-2.5 w-2.5 rounded-full bg-primary-container animate-pulse" />
          <p className="text-xs font-bold uppercase tracking-widest text-primary">New Request</p>
        </div>
        <h2 className="font-display text-xl font-extrabold tracking-tight text-on-surface">Incoming Ride</h2>
      </div>

      {/* Passenger & Fare */}
      <div className="mx-6 flex items-center justify-between rounded-lg bg-surface-container-low border border-outline-variant/15 p-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-surface-container border border-outline-variant/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-xl text-on-surface-variant">person</span>
          </div>
          <p className="text-sm font-bold text-on-surface">{passengerName || 'Passenger'}</p>
        </div>
        <p className="text-2xl font-extrabold font-display text-on-surface">{fare || '—'}</p>
      </div>

      {/* Route */}
      <div className="mx-6 rounded-lg border border-outline-variant/15 overflow-hidden mb-4">
        <div className="flex items-start gap-3 p-4 border-b border-outline-variant/10">
          <div className="h-3 w-3 mt-0.5 rounded-full bg-primary-container border-2 border-primary shrink-0" />
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-0.5">Pickup</p>
            <p className="text-sm text-on-surface truncate">{pickupLocation || 'Pickup location'}</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-4">
          <div className="h-3 w-3 mt-0.5 rounded-sm bg-on-surface shrink-0" />
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-0.5">Drop-off</p>
            <p className="text-sm text-on-surface truncate">{destination || 'Destination'}</p>
          </div>
        </div>
      </div>

      <div className="px-6 pb-6 flex gap-3">
        <button
          type="button"
          onClick={onIgnore}
          className="flex-1 rounded-lg border border-outline-variant/30 bg-surface py-3.5 text-sm font-bold text-on-surface uppercase tracking-wider hover:bg-surface-container-low transition-colors"
        >
          Ignore
        </button>
        <button
          type="button"
          onClick={onAccept}
          className="flex-[2] flex items-center justify-center gap-2 rounded-lg bg-primary-container text-on-primary-container py-3.5 text-sm font-bold uppercase tracking-wider hover:brightness-95 transition-all"
        >
          Accept Ride
          <span className="material-symbols-outlined text-lg">check</span>
        </button>
      </div>
    </div>
  )
}

export default CustomerRequestPanel