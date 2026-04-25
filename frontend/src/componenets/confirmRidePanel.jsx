import React from 'react'
import { IoLocation, IoCarSport, IoCheckmarkCircle, IoArrowBack } from 'react-icons/io5'

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
    <div className="w-full overflow-hidden rounded-t-4xl bg-white shadow-[0_-12px_30px_rgba(0,0,0,0.24)]">
      <div className="px-4 pb-4 pt-3">
        <div className="mx-auto mb-3 h-1.5 w-14 rounded-full bg-neutral-300" />

          <div className="mb-4 flex items-center gap-2">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-neutral-100"
              >
                <IoArrowBack className="h-5 w-5 text-black" />
              </button>
            )}
            <div className="flex-1 text-center">
              <p className="text-3xl font-semibold tracking-tight text-black">Confirm your ride</p>
              <p className="mt-2 text-base text-neutral-500">Review and confirm your ride details</p>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center">
            <div className="relative flex h-40 w-full items-center justify-center rounded-4xl bg-neutral-100">
              <div className="absolute inset-0 rounded-4xl bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.12),transparent_62%)]" />
              <div className="absolute h-24 w-40 rounded-full bg-blue-100/50 blur-xl" />
              {vehicleIcon || <IoCarSport className="relative z-10 h-20 w-20 text-neutral-900 drop-shadow-lg" />}
            </div>
          </div>

          <div className="mt-6 space-y-3 rounded-[1.6rem] border border-neutral-200 bg-white p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-800">
                <IoLocation className="h-4.5 w-4.5" />
              </div>
              <div className="min-w-0">
                <p className="text-[1.15rem] font-semibold leading-tight text-black">{pickupLocation || 'Pickup location'}</p>
                <p className="mt-1 text-sm leading-snug text-neutral-600">Pick-up point</p>
              </div>
            </div>

            <div className="flex items-start gap-3 border-t border-neutral-200 pt-3">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-800">
                <IoLocation className="h-4.5 w-4.5" />
              </div>
              <div className="min-w-0">
                <p className="text-[1.15rem] font-semibold leading-tight text-black">{destination || 'Destination'}</p>
                <p className="mt-1 text-sm leading-snug text-neutral-600">Drop-off point</p>
              </div>
            </div>

            <div className="flex items-start gap-3 border-t border-neutral-200 pt-3">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-800">
                <IoCarSport className="h-4.5 w-4.5" />
              </div>
              <div className="min-w-0">
                <p className="text-[1.15rem] font-semibold leading-tight text-black">{vehicleName || 'Selected vehicle'}</p>
                <p className="mt-1 text-sm leading-snug text-neutral-600">Your chosen ride type</p>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between rounded-[1.35rem] border border-neutral-200 bg-neutral-50 px-4 py-3">
            <div>
              <p className="text-sm text-neutral-500">Estimated fare</p>
              <p className="text-[1.35rem] font-semibold text-black">{fare != null && fare !== '' ? fare : 'Fare unavailable'}</p>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="h-12 flex-1 rounded-xl border border-neutral-300 bg-white text-[1.1rem] font-semibold text-black transition hover:bg-neutral-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={onConfirm}
              disabled={isSubmitting}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-black text-[1.1rem] font-semibold text-white transition hover:bg-neutral-900 disabled:cursor-not-allowed disabled:bg-neutral-500"
            >
              <IoCheckmarkCircle className="h-5 w-5" />
              {isSubmitting ? 'Creating Ride...' : 'Confirm Ride'}
            </button>
          </div>

          {errorMessage ? (
            <p className="mt-3 rounded-lg bg-red-100 px-3 py-2 text-sm font-medium text-red-700">
              {errorMessage}
            </p>
          ) : null}
      </div>
    </div>
  )
}

export default ConfirmRidePanel
