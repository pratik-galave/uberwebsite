import React from 'react'

const DriverDetailsPanel = ({ driverName, driverImage, vehicleName, vehicleNumber, rating, vehicleImage, address, onMessage, onSafety, onShareTrip, onCall, onClose }) => {
  return (
    <div className="rounded-t-2xl bg-surface-container-lowest border-t border-outline-variant/20 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
      <div className="flex justify-center pt-3 pb-1">
        <div className="h-1 w-10 rounded-full bg-outline-variant/30" />
      </div>

      {/* Header */}
      <div className="px-6 py-3">
        <div className="flex items-center gap-2 mb-1">
          <div className="h-2 w-2 rounded-full bg-primary-container animate-pulse" />
          <p className="text-xs font-bold uppercase tracking-widest text-primary">Driver Found</p>
        </div>
        <h2 className="font-display text-xl font-extrabold tracking-tight text-on-surface">Your ride is arriving</h2>
      </div>

      {/* Driver Card */}
      <div className="mx-6 rounded-lg border border-outline-variant/15 p-4 mb-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-surface-container-low border border-outline-variant/20 flex items-center justify-center shrink-0 overflow-hidden">
            {driverImage ? (
              <img src={driverImage} alt={driverName} className="h-full w-full object-cover" />
            ) : (
              <span className="material-symbols-outlined text-2xl text-on-surface-variant">person</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-bold text-on-surface">{driverName || 'Captain'}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="material-symbols-outlined text-sm text-amber-500">star</span>
              <span className="text-sm font-medium text-on-surface">{rating || '4.9'}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-outline-variant/15">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-xl text-on-surface-variant">directions_car</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-on-surface">{vehicleName || 'Vehicle'}</p>
              <p className="text-xs font-medium text-on-surface-variant mt-0.5 tracking-wider uppercase">{vehicleNumber || 'XX-00-XX-0000'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mx-6 grid grid-cols-4 gap-2 mb-4">
        {[
          { icon: 'chat', label: 'Message', action: onMessage },
          { icon: 'call', label: 'Call', action: onCall },
          { icon: 'share', label: 'Share', action: onShareTrip },
          { icon: 'shield', label: 'Safety', action: onSafety },
        ].map((btn) => (
          <button
            key={btn.label}
            type="button"
            onClick={btn.action}
            className="flex flex-col items-center gap-1.5 rounded-lg bg-surface-container-low border border-outline-variant/15 py-3 text-on-surface-variant hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-xl">{btn.icon}</span>
            <span className="text-[10px] font-bold uppercase tracking-wider">{btn.label}</span>
          </button>
        ))}
      </div>

      {/* Pickup Address */}
      {address && (
        <div className="mx-6 rounded-lg bg-surface-container-low border border-outline-variant/15 p-4 mb-4">
          <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1">Pickup Point</p>
          <p className="text-sm text-on-surface">{address}</p>
        </div>
      )}

      <div className="px-6 pb-6">
        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-lg border border-outline-variant/30 bg-surface py-3 text-sm font-bold text-on-surface uppercase tracking-wider hover:bg-surface-container-low transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  )
}

export default DriverDetailsPanel
