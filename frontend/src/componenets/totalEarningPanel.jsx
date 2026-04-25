import React from 'react'

const TotalEarningPanel = ({ earnings = 0, rides = 0, onlineHours = '0.0', onClose }) => {
  return (
    <div className="rounded-t-2xl bg-surface-container-lowest border-t border-outline-variant/20 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
      <div className="flex justify-center pt-3 pb-1">
        <div className="h-1 w-10 rounded-full bg-outline-variant/30" />
      </div>

      <div className="px-6 py-3">
        <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1">Today</p>
        <h2 className="font-display text-xl font-extrabold tracking-tight text-on-surface">Earnings Overview</h2>
      </div>

      {/* Main Earnings */}
      <div className="mx-6 rounded-lg bg-surface-container-low border border-outline-variant/15 p-6 mb-4 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Total Earned</p>
        <p className="text-4xl font-black font-display tracking-tight text-on-surface">₹{earnings}</p>
      </div>

      {/* Stats Grid */}
      <div className="mx-6 grid grid-cols-2 gap-3 mb-4">
        <div className="rounded-lg border border-outline-variant/15 p-4 text-center">
          <span className="material-symbols-outlined text-2xl text-primary mb-2 block">directions_car</span>
          <p className="text-xl font-extrabold font-display text-on-surface">{rides}</p>
          <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mt-1">Rides</p>
        </div>
        <div className="rounded-lg border border-outline-variant/15 p-4 text-center">
          <span className="material-symbols-outlined text-2xl text-primary mb-2 block">schedule</span>
          <p className="text-xl font-extrabold font-display text-on-surface">{onlineHours}h</p>
          <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mt-1">Online</p>
        </div>
      </div>

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

export default TotalEarningPanel