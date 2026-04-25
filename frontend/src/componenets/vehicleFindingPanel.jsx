import React from 'react'
import { IoLocation, IoCarSport, IoCashOutline } from 'react-icons/io5'

const VehicleFindingPanel = ({ pickupLocation, destination, vehicleName, fare, onClose, onFoundDriver }) => {
  return (
    <div className="w-full overflow-hidden rounded-t-4xl bg-white shadow-[0_-12px_30px_rgba(0,0,0,0.24)]">
      <div className="px-4 pb-4 pt-3">
        <div className="mx-auto mb-3 h-1.5 w-14 rounded-full bg-neutral-300" />

          <div className="text-center">
            <p className="text-3xl font-semibold tracking-tight text-black">Looking for nearby drivers</p>
            <p className="mt-2 text-base text-neutral-500">Matching you with the closest available ride</p>
          </div>

          <div className="mt-6 flex items-center justify-center">
            <div className="relative flex h-40 w-full items-center justify-center rounded-4xl bg-neutral-100">
              <div className="absolute inset-0 rounded-4xl bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.12),transparent_62%)]" />
              <div className="absolute h-24 w-40 rounded-full bg-blue-100/50 blur-xl" />
              <IoCarSport className="relative z-10 h-20 w-20 text-neutral-900 drop-shadow-lg" />
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
                <p className="mt-1 text-sm leading-snug text-neutral-600">Driver search in progress</p>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between rounded-[1.35rem] border border-neutral-200 bg-neutral-50 px-4 py-3">
            <div>
              <p className="text-sm text-neutral-500">Estimated fare</p>
              <p className="text-[1.35rem] font-semibold text-black">{fare != null && fare !== '' ? fare : 'Fare unavailable'}</p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-black px-4 py-2 text-base font-semibold text-white"
            >
              Cancel
            </button>
          </div>

          <div className="mt-4 flex items-center gap-2 rounded-[1.35rem] border border-neutral-200 bg-white px-4 py-3 text-neutral-700">
            <IoCashOutline className="h-5 w-5" />
            <span className="text-sm font-medium">Cash / Payment method ready</span>
          </div>

          <button
            type="button"
            onClick={onFoundDriver}
            className="mt-4 w-full rounded-xl bg-black py-3 text-[1.1rem] font-semibold text-white transition hover:bg-neutral-900"
          >
            Driver Found
          </button>
      </div>
    </div>
  )
}

export default VehicleFindingPanel