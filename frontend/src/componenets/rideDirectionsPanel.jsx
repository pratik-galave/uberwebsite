import React from 'react'

const RideDirectionsPanel = ({ destination, distance, statusMessage, actionLabel, onAction, showAction = true }) => {
  return (
    <section className="absolute inset-x-0 bottom-0 z-40 rounded-t-3xl bg-white shadow-[0_-12px_30px_rgba(0,0,0,0.24)]">
      <div className="px-4 pb-5 pt-4">
        <div className="mx-auto mb-3 h-1.5 w-14 rounded-full bg-neutral-300" />

        <div className="rounded-2xl border border-neutral-200 p-4">
          <p className="text-sm font-medium uppercase tracking-wide text-neutral-400">Destination</p>
          <p className="mt-1 text-[1.6rem] font-semibold leading-tight text-black">
            {destination || 'Destination unavailable'}
          </p>

          <div className="mt-4 border-t border-neutral-200 pt-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Distance left</p>
            <p className="mt-1 text-2xl font-semibold text-black">{distance || 'Distance unavailable'}</p>
          </div>
        </div>

        {statusMessage ? <p className="mt-3 text-sm text-neutral-500">{statusMessage}</p> : null}

        {showAction ? (
          <button
            type="button"
            onClick={onAction}
            className="mt-4 h-12 w-full rounded-xl bg-amber-400 text-lg font-semibold text-black transition hover:bg-amber-300"
          >
            {actionLabel || 'Continue'}
          </button>
        ) : null}
      </div>
    </section>
  )
}

export default RideDirectionsPanel