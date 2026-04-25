import React from 'react'
import { IoLocationOutline } from 'react-icons/io5'

const LocationSearchPanel = ({ suggestions = [], isLoading = false, onSelectLocation }) => {
  const hasSuggestions = suggestions.length > 0

  return (
    <div className="h-full overflow-y-auto bg-transparent px-container-margin pb-5 pt-4">
      <div className="space-y-3">
        {isLoading ? (
          <p className="py-4 text-center font-body-sm text-body-sm text-on-surface-variant/70 animate-pulse">Scanning the grid...</p>
        ) : null}

        {!isLoading && !hasSuggestions ? (
          <p className="py-4 text-center font-body-sm text-body-sm text-on-surface-variant/70">Enter a destination to continue.</p>
        ) : null}

        {suggestions.map((item, index) => {
          const address = typeof item === 'string' ? item : item.description;
          return (
            <button
              key={index}
              type="button"
              onClick={() => onSelectLocation?.(item)}
              className="flex w-full items-center gap-4 rounded-xl border border-outline/10 bg-surface-variant/20 px-4 py-3 text-left transition hover:border-outline/30 hover:bg-surface-variant/40 active:scale-[0.98] group"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-container-lowest/80 text-primary-container shadow-[0_0_10px_rgba(255,255,255,0.05)] group-hover:shadow-[0_0_15px_rgba(255,255,255,0.15)] transition-shadow">
                <span className="material-symbols-outlined text-[20px]">location_on</span>
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-body-md text-body-md font-medium text-on-surface truncate">{address}</p>
                <p className="font-body-sm text-[12px] text-on-surface-variant/60 truncate mt-0.5">Tap to select this location</p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default LocationSearchPanel