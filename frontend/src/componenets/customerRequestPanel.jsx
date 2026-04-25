import React from 'react'

const CustomerRequestPanel = ({ customerName, fare, distance, pickup, dropoff, onAccept, onIgnore }) => {
  return (
    <section className="absolute inset-x-0 bottom-0 z-40 rounded-t-3xl bg-surface-variant/40 border border-outline/20 shadow-[0_-20px_40px_rgba(0,0,0,0.6)] backdrop-blur-[40px] overflow-hidden">
      {/* Subtle top edge highlight */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
      
      {/* Pulsing alert bar */}
      <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-[#00E676] to-transparent animate-pulse shadow-[0_0_15px_#00E676]"></div>
      
      <div className="px-container-margin pb-6 pt-6">
        <div className="flex items-start justify-between gap-3 border-b border-outline/10 pb-4">
          <div className="flex gap-3 items-center">
            <div className="h-12 w-12 shrink-0 rounded-full bg-gradient-to-br from-[#00E676]/20 to-surface-variant border border-[#00E676]/30 flex items-center justify-center text-[#00E676] shadow-[0_0_15px_rgba(0,230,118,0.15)] relative">
              <span className="material-symbols-outlined text-[24px]">person</span>
              <div className="absolute -right-1 -bottom-1 h-4 w-4 bg-[#00E676] rounded-full border-2 border-background animate-pulse"></div>
            </div>
            <div>
              <p className="font-label-caps text-[10px] uppercase tracking-widest text-[#00E676] mb-0.5">Incoming Request</p>
              <p className="font-display-sm text-[22px] leading-none tracking-tight text-on-surface">{customerName}</p>
            </div>
          </div>

          <div className="text-right flex flex-col items-end justify-center">
            <p className="font-display-md text-[28px] leading-none font-bold text-primary-container tracking-tighter">{fare}</p>
            <div className="flex items-center gap-1 text-on-surface-variant mt-1 bg-surface-container-lowest/60 px-2 py-0.5 rounded border border-outline/10">
              <span className="material-symbols-outlined text-[12px]">route</span>
              <p className="font-body-sm text-[12px]">{distance}</p>
            </div>
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
              <p className="font-display-xs text-[16px] leading-tight text-on-surface tracking-wide truncate">{pickup || 'Pickup location'}</p>
              <p className="mt-0.5 font-body-sm text-[12px] text-on-surface-variant/70 uppercase font-label-caps">Pick-up point</p>
            </div>
          </div>

          <div className="relative z-10 flex items-start gap-4">
            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-variant/50 text-[#00B8D4] border border-outline/10 shadow-[0_0_10px_rgba(255,255,255,0.02)]">
              <span className="material-symbols-outlined text-[18px]">location_on</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-display-xs text-[16px] leading-tight text-on-surface tracking-wide truncate">{dropoff || 'Destination'}</p>
              <p className="mt-0.5 font-body-sm text-[12px] text-on-surface-variant/70 uppercase font-label-caps">Drop-off point</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-stack-lg">
          <button
            type="button"
            onClick={onIgnore}
            className="h-14 w-[100px] rounded-xl border border-outline/20 bg-surface-container-lowest/60 text-on-surface font-label-caps text-[12px] uppercase tracking-widest transition hover:bg-surface-variant/40 flex flex-col items-center justify-center gap-1"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
            Ignore
          </button>

          <button
            type="button"
            onClick={onAccept}
            className="flex h-14 flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#00E676] to-[#00C853] text-background font-label-caps text-[14px] uppercase tracking-widest shadow-[0_0_20px_rgba(0,230,118,0.3)] transition-all hover:shadow-[0_0_25px_rgba(0,230,118,0.5)] font-bold"
          >
            Accept Mission
            <span className="material-symbols-outlined text-[20px]">check_circle</span>
          </button>
        </div>
      </div>
    </section>
  )
}

export default CustomerRequestPanel