import React from 'react'
import { IoLocationOutline } from 'react-icons/io5'

const LocationSearchPanel = ({ suggestions = [], isLoading = false, onSelectLocation }) => {
  const hasSuggestions = suggestions.length > 0

  return (
    <div className="h-full overflow-y-auto bg-white px-5 pb-5 pt-1 text-neutral-900">
      <div className="space-y-2">
        {isLoading ? (
          <p className="py-4 text-base font-medium text-neutral-600">Loading suggestions...</p>
        ) : null}

        {!isLoading && !hasSuggestions ? (
          <p className="py-4 text-base font-medium text-neutral-600">Start typing to see location suggestions.</p>
        ) : null}

        {suggestions.map((item, index) => {
          const address = typeof item === 'string' ? item : item.description;
          return (
            <button
              key={index}
              type="button"
              onClick={() => onSelectLocation?.(item)}
              className="flex w-full items-start gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-left transition hover:border-neutral-300 hover:bg-neutral-100"
            >
              <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-neutral-700 shadow-sm">
                <IoLocationOutline className="h-4.5 w-4.5" />
              </div>

              <div className="min-w-0">
                <p className="text-base font-semibold leading-snug tracking-tight text-black">{address}</p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default LocationSearchPanel