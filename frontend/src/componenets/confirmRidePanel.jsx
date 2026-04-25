import React from 'react'

const ConfirmRidePanel = ({ pickupLocation, destination, vehicleName, fare, isSubmitting, errorMessage, onConfirm, onCancel, onBack }) => {
  return (
    <div className="rounded-t-2xl bg-surface-container-lowest border-t border-outline-variant/20 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
      <div className="flex justify-center pt-3 pb-1">
        <div className="h-1 w-10 rounded-full bg-outline-variant/30" />
      </div>

      <div className="px-6 py-3">
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Review</p>
          <button type="button" onClick={onBack || onCancel} className="flex h-8 w-8 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors">
            <span className="material-symbols-outlined text-lg">arrow_back</span>
          </button>
        </div>
        <h2 className="font-display text-xl font-extrabold tracking-tight text-on-surface">Confirm Ride</h2>
      </div>

      {/* Trip Details */}
      <div className="mx-6 rounded-lg border border-outline-variant/15 overflow-hidden mb-4">
        <div className="flex items-start gap-3 p-4 border-b border-outline-variant/10">
          <div className="h-3 w-3 mt-1 rounded-full bg-primary-container border-2 border-primary shrink-0" />
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1">Pickup</p>
            <p className="text-sm text-on-surface truncate">{pickupLocation || 'Not set'}</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-4">
          <div className="h-3 w-3 mt-1 rounded-sm bg-on-surface shrink-0" />
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1">Drop-off</p>
            <p className="text-sm text-on-surface truncate">{destination || 'Not set'}</p>
          </div>
        </div>
      </div>

      {/* Vehicle & Fare */}
      <div className="mx-6 flex items-center justify-between rounded-lg bg-surface-container-low border border-outline-variant/15 p-4 mb-4">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-2xl text-on-surface-variant">directions_car</span>
          <div>
            <p className="text-sm font-bold text-on-surface">{vehicleName || 'Selected Vehicle'}</p>
            <p className="text-xs text-on-surface-variant mt-0.5">Estimated fare</p>
          </div>
        </div>
        <p className="text-xl font-extrabold font-display text-on-surface">{fare || '—'}</p>
      </div>

      {errorMessage && (
        <div className="mx-6 mb-4 rounded-md border border-error/30 bg-error-container px-4 py-3">
          <p className="text-sm text-on-error-container">{errorMessage}</p>
        </div>
      )}

      <div className="px-6 pb-6 flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-lg border border-outline-variant/30 bg-surface py-3 text-sm font-bold text-on-surface uppercase tracking-wider hover:bg-surface-container-low transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isSubmitting}
          className="flex-[2] flex items-center justify-center gap-2 rounded-lg bg-primary-container text-on-primary-container py-3 text-sm font-bold uppercase tracking-wider disabled:opacity-50 hover:brightness-95 transition-all"
        >
          {isSubmitting ? 'Requesting...' : 'Confirm Ride'}
          {!isSubmitting && <span className="material-symbols-outlined text-lg">check</span>}
        </button>
      </div>
    </div>
  )
}

export default ConfirmRidePanel
