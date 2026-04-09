import React from 'react'
import { IoArrowForwardOutline, IoArrowUndoOutline, IoGitMergeOutline } from 'react-icons/io5'

const rideSteps = [
  { id: 1, icon: <IoArrowForwardOutline className="h-4 w-4" />, text: 'Head southwest on Madison St', miles: '18 miles' },
  { id: 2, icon: <IoArrowUndoOutline className="h-4 w-4" />, text: 'Turn left onto 4th Ave', miles: '12 miles' },
  {
    id: 3,
    icon: <IoGitMergeOutline className="h-4 w-4" />,
    text: 'Turn right at 105th N Link Rd',
    miles: '40 miles',
    hint: 'Pass by Executive Hotel Pacific (on the left)',
  },
  {
    id: 4,
    icon: <IoGitMergeOutline className="h-4 w-4 text-amber-600" />,
    text: 'Turn right at 105 William St, Chicago, US',
    miles: '250 miles',
    active: true,
  },
  {
    id: 5,
    icon: <IoArrowForwardOutline className="h-4 w-4" />,
    text: 'Continue straight to stay on Vancouver',
    miles: '24 miles',
    hint: 'Entering California',
  },
]

const RideDirectionsPanel = ({ pickup, est, distance, fare, onDropOff }) => {
  return (
    <section className="absolute inset-x-0 bottom-0 z-40 rounded-t-3xl bg-white shadow-[0_-12px_30px_rgba(0,0,0,0.24)]">
      <div className="px-4 pb-5 pt-4">
        <div className="mx-auto mb-3 h-1.5 w-14 rounded-full bg-neutral-300" />

        <div className="rounded-2xl border border-neutral-200 p-4">
          <p className="text-sm text-neutral-400">Pick up at</p>
          <p className="mt-1 text-[1.65rem] font-semibold leading-tight text-black">{pickup}</p>

          <div className="mt-4 grid grid-cols-3 border-t border-neutral-200 pt-3 text-center">
            <div>
              <p className="text-xs uppercase tracking-wide text-neutral-400">Est</p>
              <p className="text-2xl font-semibold text-black">{est}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-neutral-400">Distance</p>
              <p className="text-2xl font-semibold text-black">{distance}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-neutral-400">Fare</p>
              <p className="text-2xl font-semibold text-black">{fare}</p>
            </div>
          </div>
        </div>

        <div className="mt-4 max-h-64 space-y-3 overflow-y-auto pr-1">
          {rideSteps.map((step) => (
            <div key={step.id} className="border-b border-neutral-100 pb-3 last:border-b-0">
              <div className="flex items-start gap-3">
                <div className="mt-1 flex h-6 w-6 items-center justify-center text-neutral-700">{step.icon}</div>
                <div>
                  <p className={`text-lg leading-tight ${step.active ? 'font-semibold text-amber-700' : 'text-black'}`}>
                    {step.text}
                  </p>
                  {step.hint ? <p className="mt-1 text-sm text-neutral-500">{step.hint}</p> : null}
                  <p className="mt-1 text-sm text-neutral-500">{step.miles}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={onDropOff}
          className="mt-4 h-12 w-full rounded-xl bg-amber-400 text-lg font-semibold text-black transition hover:bg-amber-300"
        >
          Drop Off
        </button>
      </div>
    </section>
  )
}

export default RideDirectionsPanel