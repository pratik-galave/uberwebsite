import React from 'react'
import { Link } from 'react-router-dom'

const DriverDetailsPanel = ({ driverName, driverImage, vehicleName, vehicleNumber, rating, vehicleImage, address, onMessage, onSafety, onShareTrip, onCall, onClose }) => {
  return (
    <div className="w-full overflow-hidden rounded-t-3xl bg-surface-variant/40 border border-outline/20 shadow-[0_-20px_40px_rgba(0,0,0,0.6)] backdrop-blur-[40px] relative">
      {/* Subtle top edge highlight */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
      
      <div className="px-container-margin pb-6 pt-5">
        <div className="mb-stack-md flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary-container bg-primary-container/10 px-3 py-1.5 rounded-full border border-primary-container/20">
            <span className="material-symbols-outlined text-[16px]">verified_user</span>
            <span className="font-label-caps text-[12px] uppercase tracking-widest">Pilot Assigned</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-lowest border border-outline/20 text-on-surface shadow-sm transition hover:bg-surface-variant"
          >
            <span className="material-symbols-outlined text-[20px]">expand_more</span>
          </button>
        </div>

        <div className="flex items-center gap-4 bg-surface-container-lowest/60 rounded-2xl border border-outline/10 p-4 shadow-[0_5px_15px_rgba(0,0,0,0.2)] relative overflow-hidden">
          {/* Decorative background glow */}
          <div className="absolute -top-10 -right-10 w-[100px] h-[100px] bg-primary-container/20 rounded-full blur-[30px] pointer-events-none"></div>

          <div className="relative h-[68px] w-[68px] shrink-0 overflow-hidden rounded-xl border border-outline/20 bg-surface-variant shadow-[0_0_15px_rgba(0,0,0,0.3)]">
            {driverImage ? (
              <img src={driverImage} alt={driverName} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-surface-variant to-background text-[24px] font-display-sm text-on-surface-variant">
                {driverName?.charAt(0) || 'D'}
              </div>
            )}
            <div className="absolute bottom-0 right-0 bg-primary-container text-background font-label-caps text-[10px] px-1 py-0.5 rounded-tl-lg font-bold flex items-center">
              {rating || '4.9'} <span className="material-symbols-outlined text-[10px] ml-0.5">star</span>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-display-sm text-[22px] tracking-tight text-on-surface">{driverName || 'Pilot'}</p>
            <p className="font-body-sm text-[12px] text-on-surface-variant/70 mt-0.5">Experienced Driver</p>
          </div>
        </div>

        <div className="mt-stack-md flex items-center gap-4 rounded-2xl bg-surface-variant/20 border border-outline/10 p-3">
          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-gradient-to-b from-surface-container-lowest to-surface-variant border border-outline/20 flex items-center justify-center shadow-inner">
            {vehicleImage ? (
              <img src={vehicleImage} alt={vehicleName} className="h-full w-full object-cover" />
            ) : (
              <span className="material-symbols-outlined text-[28px] text-on-surface">directions_car</span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="font-display-xs text-[18px] text-primary-container tracking-wider uppercase font-bold">{vehicleNumber || 'XX00XX0000'}</p>
            <p className="truncate font-body-sm text-[12px] text-on-surface-variant/70 mt-0.5">{vehicleName || 'Vehicle type'}</p>
          </div>
        </div>

        <div className="mt-stack-md grid grid-cols-4 gap-2">
          <button
            type="button"
            onClick={onCall}
            className="col-span-1 flex flex-col items-center justify-center gap-2 rounded-2xl bg-[#00E676]/10 border border-[#00E676]/30 py-3 transition hover:bg-[#00E676]/20 group"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#00E676]/20 text-[#00E676] group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(0,230,118,0.2)]">
              <span className="material-symbols-outlined text-[24px]">call</span>
            </div>
            <span className="font-label-caps text-[10px] uppercase tracking-widest text-[#00E676]">Call</span>
          </button>

          <button
            type="button"
            onClick={onMessage}
            className="col-span-1 flex flex-col items-center justify-center gap-2 rounded-2xl bg-primary-container/10 border border-primary-container/30 py-3 transition hover:bg-primary-container/20 group"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-container/20 text-primary-container group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(0,229,255,0.2)]">
              <span className="material-symbols-outlined text-[24px]">chat</span>
            </div>
            <span className="font-label-caps text-[10px] uppercase tracking-widest text-primary-container">Chat</span>
          </button>

          <button
            type="button"
            onClick={onSafety}
            className="col-span-1 flex flex-col items-center justify-center gap-2 rounded-2xl bg-surface-container-lowest/40 border border-outline/10 py-3 transition hover:bg-surface-variant/50 group"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-variant text-on-surface group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[24px]">shield</span>
            </div>
            <span className="font-label-caps text-[10px] uppercase tracking-widest text-on-surface">Safety</span>
          </button>

          <button
            type="button"
            onClick={onShareTrip}
            className="col-span-1 flex flex-col items-center justify-center gap-2 rounded-2xl bg-surface-container-lowest/40 border border-outline/10 py-3 transition hover:bg-surface-variant/50 group"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-variant text-on-surface group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[24px]">share</span>
            </div>
            <span className="font-label-caps text-[10px] uppercase tracking-widest text-on-surface">Share</span>
          </button>
        </div>

        <div className="mt-stack-md rounded-2xl border border-outline/10 bg-surface-variant/20 p-4">
          <div className="flex gap-4">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-container-lowest border border-outline/20 text-secondary-fixed shadow-[0_0_10px_rgba(98,255,150,0.1)]">
              <span className="material-symbols-outlined text-[16px]">navigation</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Current Location</p>
              <p className="font-body-sm text-[14px] leading-snug text-on-surface truncate">{address || 'Location information'}</p>
            </div>
          </div>
        </div>

        <div className="mt-stack-md">
          <Link
            to="/payment"
            className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-surface-container-lowest/60 border border-[#00E676]/30 text-[#00E676] font-label-caps text-[14px] uppercase tracking-widest shadow-[0_0_15px_rgba(0,230,118,0.1)] transition-all hover:bg-[#00E676]/10 hover:shadow-[0_0_20px_rgba(0,230,118,0.2)]"
          >
            <span className="material-symbols-outlined text-[20px]">payments</span>
            Payment Options
          </Link>
        </div>
      </div>
    </div>
  )
}

export default DriverDetailsPanel
