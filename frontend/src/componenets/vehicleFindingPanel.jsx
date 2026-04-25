import React from 'react'

const VehicleFindingPanel = ({ pickupLocation, destination, vehicleName, fare, onClose, onFoundDriver }) => {
  return (
    <div className="w-full overflow-hidden rounded-t-3xl bg-surface-variant/40 border border-outline/20 shadow-[0_-20px_40px_rgba(0,0,0,0.6)] backdrop-blur-[40px] relative">
      {/* Subtle top edge highlight */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
      
      {/* Scanning laser line animation */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-primary-container shadow-[0_0_15px_#00E5FF] opacity-70 animate-[scan_2s_ease-in-out_infinite]"></div>
      
      <div className="px-container-margin pb-6 pt-5">
        <div className="mb-stack-lg text-center">
          <h3 className="font-display-sm text-display-sm tracking-tight text-on-surface">Connecting to Grid</h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant/70 mt-1">Locating optimal pilot...</p>
        </div>

        <div className="mt-stack-md flex items-center justify-center relative py-6">
          {/* Radar effect */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="absolute w-[200px] h-[200px] rounded-full border border-primary-container/20 animate-ping" style={{ animationDuration: '3s' }}></div>
            <div className="absolute w-[150px] h-[150px] rounded-full border border-primary-container/30 animate-ping" style={{ animationDuration: '3s', animationDelay: '1s' }}></div>
            <div className="absolute w-[100px] h-[100px] rounded-full border border-primary-container/40 animate-ping" style={{ animationDuration: '3s', animationDelay: '2s' }}></div>
          </div>
          
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-surface-container-lowest/80 border border-outline/20 shadow-[0_0_30px_rgba(0,229,255,0.2)] z-10">
            <span className="material-symbols-outlined text-[40px] text-primary-container">radar</span>
          </div>
        </div>

        <div className="mt-stack-lg flex flex-col gap-3 relative rounded-2xl bg-surface-container-lowest/40 border border-outline/10 p-4">
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
            <p className="font-label-caps text-[10px] text-primary-container uppercase tracking-widest mb-1">Target Fare</p>
            <p className="font-display-md text-[24px] text-on-surface tracking-tighter">
              {fare != null && fare !== '' ? fare : '--'}
            </p>
          </div>
          <div className="flex flex-col items-end">
            <p className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Class</p>
            <p className="font-display-xs text-[16px] text-on-surface tracking-wide">{vehicleName || 'Standard'}</p>
          </div>
        </div>

        <div className="mt-stack-lg flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-xl border border-error-container/30 bg-error-container/10 text-error font-label-caps text-[14px] uppercase tracking-widest transition hover:bg-error-container/20"
          >
            <span className="material-symbols-outlined text-[20px]">cancel</span>
            Abort Search
          </button>
        </div>
        
        {/* Hidden button to simulate finding driver for dev purposes */}
        <button
          type="button"
          onClick={onFoundDriver}
          className="mt-4 w-full text-[10px] text-on-surface-variant/30 font-label-caps uppercase text-center hover:text-on-surface-variant/70 transition"
        >
          [Dev: Force Driver Found]
        </button>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0% { top: 0; opacity: 0; }
          10% { opacity: 0.7; }
          50% { top: 100%; opacity: 0.7; }
          60% { opacity: 0; }
          100% { top: 100%; opacity: 0; }
        }
      `}} />
    </div>
  )
}

export default VehicleFindingPanel