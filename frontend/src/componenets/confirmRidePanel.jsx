import React from 'react'

const ConfirmRidePanel = ({
  pickupLocation,
  destination,
  vehicleName,
  vehicleIcon,
  fare,
  onConfirm,
  onCancel,
  onBack,
  isSubmitting = false,
  errorMessage = '',
}) => {
  return (
    <div className="w-full overflow-hidden rounded-t-3xl bg-surface-variant/40 border border-outline/20 shadow-[0_-20px_40px_rgba(0,0,0,0.6)] backdrop-blur-[40px] relative">
      {/* Subtle top edge highlight */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
      
      <div className="px-container-margin pb-6 pt-5">
        <div className="mb-stack-md flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-lowest border border-outline/20 text-on-surface shadow-sm transition hover:bg-surface-variant"
              >
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
            )}
            <h3 className="font-display-sm text-display-sm tracking-tight text-on-surface">Confirm Ride</h3>
          </div>
        </div>

        <div className="mt-stack-md flex items-center justify-center">
          <div className="relative flex h-32 w-full items-center justify-center rounded-2xl bg-gradient-to-b from-surface-container-lowest/80 to-surface-variant/40 border border-outline/10 overflow-hidden shadow-inner">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,229,255,0.05),transparent_70%)]" />
            <div className="absolute h-20 w-40 rounded-full bg-primary-container/20 blur-xl" />
            {vehicleIcon || <span className="material-symbols-outlined text-[64px] text-primary-container relative z-10 drop-shadow-[0_0_15px_rgba(0,229,255,0.3)]">directions_car</span>}
          </div>
        </div>

        <div className="mt-stack-md flex flex-col gap-3 relative rounded-2xl bg-surface-container-lowest/40 border border-outline/10 p-4">
          {/* Connecting line */}
          <div className="absolute left-[35px] top-[40px] bottom-[40px] w-[2px] bg-outline/20 z-0 border-l border-dashed border-outline/50"></div>
          
          <div className="relative z-10 flex items-start gap-4">
            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-variant/50 text-primary-container border border-outline/10 shadow-[0_0_10px_rgba(255,255,255,0.02)]">
              <span className="material-symbols-outlined text-[18px]">radio_button_checked</span>
            </div>
            <div className="min-w-0 flex-1 border-b border-outline/10 pb-3">
              <p className="font-display-xs text-[16px] leading-tight text-on-surface tracking-wide truncate">{pickupLocation || 'Pickup location'}</p>
              <p className="mt-0.5 font-body-sm text-[12px] text-on-surface-variant/70 uppercase font-label-caps">Pick-up point</p>
            </div>
          </div>

          <div className="relative z-10 flex items-start gap-4">
            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-variant/50 text-[#00B8D4] border border-outline/10 shadow-[0_0_10px_rgba(255,255,255,0.02)]">
              <span className="material-symbols-outlined text-[18px]">location_on</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-display-xs text-[16px] leading-tight text-on-surface tracking-wide truncate">{destination || 'Destination'}</p>
              <p className="mt-0.5 font-body-sm text-[12px] text-on-surface-variant/70 uppercase font-label-caps">Drop-off point</p>
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between rounded-2xl border border-primary-container/20 bg-primary-container/5 px-5 py-4 backdrop-blur-sm">
          <div>
            <p className="font-label-caps text-[10px] text-primary-container uppercase tracking-widest mb-1">Estimated Fare</p>
            <p className="font-display-md text-[24px] text-on-surface tracking-tighter">
              {fare != null && fare !== '' ? fare : '--'}
            </p>
          </div>
          <div className="flex flex-col items-end">
            <p className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Vehicle</p>
            <p className="font-display-xs text-[16px] text-on-surface tracking-wide">{vehicleName || 'Standard'}</p>
          </div>
        </div>

        <div className="mt-stack-lg flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="h-14 w-[100px] rounded-xl border border-outline/20 bg-surface-container-lowest/60 text-on-surface font-label-caps text-[12px] uppercase tracking-widest transition hover:bg-surface-variant/40 disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center justify-center gap-1"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="flex h-14 flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-container to-[#00B8D4] text-on-primary-fixed font-label-caps text-[14px] uppercase tracking-widest shadow-[0_0_20px_rgba(0,229,255,0.25)] transition-all enabled:hover:shadow-[0_0_25px_rgba(0,229,255,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined animate-spin text-[20px]">refresh</span>
                Processing...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Confirm
                <span className="material-symbols-outlined text-[20px]">check_circle</span>
              </span>
            )}
          </button>
        </div>

        {errorMessage ? (
          <p className="mt-4 rounded-lg border border-error-container bg-error-container/10 px-4 py-3 text-[12px] font-body-sm text-error">
            {errorMessage}
          </p>
        ) : null}
      </div>
    </div>
  )
}

export default ConfirmRidePanel
