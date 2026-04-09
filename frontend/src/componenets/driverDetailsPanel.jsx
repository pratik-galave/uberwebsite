import React from 'react'
import { IoClose, IoShield, IoShareSocial, IoCall, IoLocation } from 'react-icons/io5'
import { Link } from 'react-router-dom'

const DriverDetailsPanel = ({ driverName, driverImage, vehicleName, vehicleNumber, rating, vehicleImage, address, onMessage, onSafety, onShareTrip, onCall, onClose }) => {
  return (
    <section className="absolute inset-0 z-50 flex items-end bg-black/20 backdrop-blur-[1px]">
      <div className="w-full overflow-hidden rounded-t-4xl bg-white shadow-[0_-12px_30px_rgba(0,0,0,0.24)]">
        <div className="px-4 pb-6 pt-4">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex-1" />
            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-neutral-100"
            >
              <IoClose className="h-6 w-6 text-black" />
            </button>
          </div>

          <div className="flex items-start gap-4">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full border-2 border-neutral-200 bg-neutral-100">
              {driverImage ? (
                <img src={driverImage} alt={driverName} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-neutral-300 text-2xl font-semibold text-neutral-600">
                  {driverName?.charAt(0) || 'D'}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-2xl font-bold tracking-tight text-black">{driverName || 'Driver'}</p>
              <div className="mt-2 flex items-center gap-1">
                <span className="text-lg font-semibold text-black">{rating || '4.9'}</span>
                <span className="text-xl text-amber-400">★</span>
              </div>
            </div>
          </div>

          <div className="mt-5 flex h-16 items-center gap-3 rounded-2xl bg-neutral-50 p-3">
            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-white">
              {vehicleImage ? (
                <img src={vehicleImage} alt={vehicleName} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-neutral-200 text-xs font-semibold text-neutral-600">
                  🚗
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-black">{vehicleNumber || 'XX00XX0000'}</p>
              <p className="truncate text-xs leading-snug text-neutral-600">{vehicleName || 'Vehicle type'}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onMessage}
            className="mt-4 w-full rounded-2xl bg-neutral-100 px-4 py-3.5 text-center text-base font-semibold text-black transition hover:bg-neutral-200 flex items-center justify-center gap-2"
          >
            Send a message...
            <span className="text-lg">▶</span>
          </button>

          <div className="mt-5 grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={onSafety}
              className="flex flex-col items-center gap-2 rounded-2xl bg-neutral-100 py-3 transition hover:bg-neutral-200"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600">
                <IoShield className="h-6 w-6 text-white" />
              </div>
              <span className="text-xs font-semibold text-black text-center leading-tight">Safety</span>
            </button>

            <button
              type="button"
              onClick={onShareTrip}
              className="flex flex-col items-center gap-2 rounded-2xl bg-neutral-100 py-3 transition hover:bg-neutral-200"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600">
                <IoShareSocial className="h-6 w-6 text-white" />
              </div>
              <span className="text-xs font-semibold text-black text-center leading-tight">Share my trip</span>
            </button>

            <button
              type="button"
              onClick={onCall}
              className="flex flex-col items-center gap-2 rounded-2xl bg-neutral-100 py-3 transition hover:bg-neutral-200"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600">
                <IoCall className="h-6 w-6 text-white" />
              </div>
              <span className="text-xs font-semibold text-black text-center leading-tight">Call driver</span>
            </button>
          </div>

          <div className="mt-5 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
            <div className="flex gap-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black text-white">
                <IoLocation className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-neutral-600">Driver's location</p>
                <p className="mt-1 text-sm leading-snug text-black break-words">{address || 'Location information'}</p>
              </div>
            </div>
          </div>

          <Link
            to="/payment"
            className="mt-5 block w-full rounded-xl bg-emerald-600 py-3 text-center text-base font-semibold text-white transition hover:bg-emerald-700"
          >
            Make a Payment
          </Link>
        </div>
      </div>
    </section>
  )
}

export default DriverDetailsPanel
