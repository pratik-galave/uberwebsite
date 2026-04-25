import React from 'react'
import { IoTrendingUpOutline, IoCarSportOutline, IoTimeOutline } from 'react-icons/io5'

const TotalEarningPanel = ({
  totalEarning = 'Rs 0',
  changeLabel = '+0% from last week',
  completedRides = '0 rides',
  onlineHours = '0h 00m',
  captainName = 'Captain',
  captainImage = null,
}) => {
  const captainInitial = captainName?.charAt(0)?.toUpperCase() || 'C'

  return (
    <section className="w-full rounded-t-3xl bg-white px-4 pb-5 pt-4 shadow-[0_-12px_30px_rgba(0,0,0,0.24)]">
      <div className="mx-auto mb-3 h-1.5 w-14 rounded-full bg-neutral-300" />

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full border border-neutral-200 bg-neutral-100">
            {captainImage ? (
              <img src={captainImage} alt={captainName} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-neutral-200 text-base font-semibold text-neutral-700">
                {captainInitial}
              </div>
            )}
          </div>

          <div>
            <p className="text-sm font-medium text-neutral-500">Total Earning</p>
            <p className="text-sm text-neutral-500">{captainName}</p>
          </div>
        </div>

        <div className="text-right">
          <p className="mt-1 text-3xl font-bold tracking-tight text-black">{totalEarning}</p>
        </div>
      </div>

      <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
        <IoTrendingUpOutline className="h-3.5 w-3.5" />
        {changeLabel}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 border-t border-neutral-200 pt-4">
        <div className="rounded-xl bg-neutral-100 px-3 py-2.5">
          <div className="mb-1 inline-flex h-7 w-7 items-center justify-center rounded-full bg-black text-white">
            <IoCarSportOutline className="h-4 w-4" />
          </div>
          <p className="text-xs text-neutral-500">Completed</p>
          <p className="text-base font-semibold text-black">{completedRides}</p>
        </div>

        <div className="rounded-xl bg-neutral-100 px-3 py-2.5">
          <div className="mb-1 inline-flex h-7 w-7 items-center justify-center rounded-full bg-black text-white">
            <IoTimeOutline className="h-4 w-4" />
          </div>
          <p className="text-xs text-neutral-500">Online Today</p>
          <p className="text-base font-semibold text-black">{onlineHours}</p>
        </div>
      </div>
    </section>
  )
}

export default TotalEarningPanel