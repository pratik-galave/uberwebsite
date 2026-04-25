import React from 'react'

const TotalEarningPanel = ({
  totalEarning = '₹ 0',
  changeLabel = '+0% from last week',
  completedRides = '0 rides',
  onlineHours = '0h 00m',
  captainName = 'Captain',
  captainImage = null,
}) => {
  const captainInitial = captainName?.charAt(0)?.toUpperCase() || 'C'

  return (
    <section className="w-full overflow-hidden rounded-t-3xl bg-surface-variant/40 border border-outline/20 shadow-[0_-20px_40px_rgba(0,0,0,0.6)] backdrop-blur-[40px] relative">
      {/* Subtle top edge highlight */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
      
      <div className="px-container-margin pb-6 pt-5">
        <div className="flex items-center justify-between gap-3 mb-stack-md">
          <div className="flex items-center gap-3 bg-surface-container-lowest/60 rounded-full pl-1 pr-4 py-1 border border-outline/10 backdrop-blur-sm">
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-outline/20 bg-surface-variant shadow-inner">
              {captainImage ? (
                <img src={captainImage} alt={captainName} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-surface-variant to-background text-[14px] font-display-sm text-on-surface-variant">
                  {captainInitial}
                </div>
              )}
            </div>

            <div>
              <p className="font-label-caps text-[10px] uppercase tracking-widest text-on-surface-variant/70">Online Pilot</p>
              <p className="font-display-xs text-[14px] text-on-surface truncate max-w-[100px]">{captainName}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1 text-[#00E676] bg-[#00E676]/10 px-2.5 py-1 rounded-full border border-[#00E676]/20">
            <span className="material-symbols-outlined text-[14px]">wifi</span>
            <span className="font-label-caps text-[10px] uppercase tracking-widest pt-0.5">Online</span>
          </div>
        </div>

        <div className="rounded-2xl bg-surface-container-lowest/40 border border-outline/10 p-5 relative overflow-hidden">
          {/* Decorative background glow */}
          <div className="absolute -top-10 -right-10 w-[150px] h-[150px] bg-primary-container/10 rounded-full blur-[40px] pointer-events-none"></div>
          
          <div className="flex items-end justify-between relative z-10">
            <div>
              <p className="font-label-caps text-[12px] text-primary-container uppercase tracking-widest mb-1">Today's Earnings</p>
              <p className="font-display-lg text-[40px] text-on-surface tracking-tighter leading-none">{totalEarning}</p>
            </div>
            
            <div className="mb-1 inline-flex items-center gap-1 rounded border border-[#00E676]/30 bg-[#00E676]/10 px-2 py-0.5 text-[10px] font-label-caps uppercase text-[#00E676]">
              <span className="material-symbols-outlined text-[12px]">trending_up</span>
              {changeLabel}
            </div>
          </div>
        </div>

        <div className="mt-stack-sm grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-surface-variant/20 border border-outline/10 p-4 transition-all hover:bg-surface-variant/40 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-container-lowest border border-outline/20 text-secondary-fixed shadow-[0_0_10px_rgba(98,255,150,0.05)]">
              <span className="material-symbols-outlined text-[20px]">local_taxi</span>
            </div>
            <div>
              <p className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest">Completed</p>
              <p className="font-display-sm text-[20px] text-on-surface leading-tight">{completedRides}</p>
            </div>
          </div>

          <div className="rounded-2xl bg-surface-variant/20 border border-outline/10 p-4 transition-all hover:bg-surface-variant/40 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-container-lowest border border-outline/20 text-[#00B8D4] shadow-[0_0_10px_rgba(0,184,212,0.05)]">
              <span className="material-symbols-outlined text-[20px]">timer</span>
            </div>
            <div>
              <p className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest">Online Time</p>
              <p className="font-display-sm text-[20px] text-on-surface leading-tight">{onlineHours}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default TotalEarningPanel