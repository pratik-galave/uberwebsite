import React from 'react'

const LocationSearchPanel = ({ suggestions = [], isLoading = false, onSelectLocation }) => {
  if (isLoading) {
    return (
      <div className="flex items-center gap-3 px-6 py-8 text-on-surface-variant">
        <div className="h-4 w-4 rounded-full border-2 border-outline border-t-primary animate-spin" />
        <span className="text-sm font-medium">Searching locations...</span>
      </div>
    )
  }

  if (!suggestions.length) {
    return (
      <div className="px-6 py-8 text-center">
        <span className="material-symbols-outlined text-3xl text-outline-variant mb-2 block">search</span>
        <p className="text-sm text-on-surface-variant">Type at least 3 characters to search</p>
      </div>
    )
  }

  return (
    <ul className="divide-y divide-outline-variant/15">
      {suggestions.map((item, idx) => {
        const label = typeof item === 'string' ? item : item?.description || item?.name || ''
        return (
          <li key={idx}>
            <button
              type="button"
              onClick={() => onSelectLocation(item)}
              className="w-full flex items-start gap-4 px-6 py-4 text-left hover:bg-surface-container-low transition-colors"
            >
              <span className="material-symbols-outlined text-lg text-on-surface-variant mt-0.5 shrink-0">location_on</span>
              <span className="text-sm text-on-surface leading-snug">{label}</span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}

export default LocationSearchPanel