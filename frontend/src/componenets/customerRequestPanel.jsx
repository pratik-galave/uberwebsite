import React from 'react'

const CustomerRequestPanel = ({ customerName, fare, distance, pickup, dropoff, onAccept, onIgnore }) => {
  return (
    <section className="absolute inset-x-0 bottom-0 z-40 rounded-t-3xl bg-white shadow-[0_-12px_30px_rgba(0,0,0,0.24)]">
      <div className="px-4 pb-5 pt-4">
        <div className="mx-auto mb-3 h-1.5 w-14 rounded-full bg-neutral-300" />

        <div className="flex items-start justify-between gap-3 border-b border-neutral-200 pb-3">
          <div>
            <p className="text-2xl font-semibold leading-tight text-black">{customerName}</p>
            <p className="mt-1 text-sm text-neutral-500">New ride request</p>
          </div>

          <div className="text-right">
            <p className="text-2xl font-bold text-black">{fare}</p>
            <p className="text-sm text-neutral-500">{distance}</p>
          </div>
        </div>

        <div className="space-y-4 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Pick up</p>
            <p className="mt-1 text-[1.35rem] font-medium leading-tight text-black">{pickup}</p>
          </div>

          <div className="border-t border-neutral-200 pt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Drop off</p>
            <p className="mt-1 text-[1.35rem] font-medium leading-tight text-black">{dropoff}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 border-t border-neutral-200 pt-4">
          <button
            type="button"
            onClick={onIgnore}
            className="h-12 flex-1 rounded-xl bg-neutral-100 text-lg font-medium text-neutral-500"
          >
            Ignore
          </button>

          <button
            type="button"
            onClick={onAccept}
            className="h-12 flex-1 rounded-xl bg-amber-400 text-lg font-semibold text-black transition hover:bg-amber-300"
          >
            Accept
          </button>
        </div>
      </div>
    </section>
  )
}

export default CustomerRequestPanel