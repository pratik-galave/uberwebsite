import React, { useMemo } from 'react'
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api'

const mapContainerStyle = {
	width: '100%',
	height: '100%',
}

const defaultCenter = {
	lat: 41.8781,
	lng: -87.6298,
}

const LiveTracking = ({ captainLocation }) => {
	const mapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || import.meta.env.VITE_GOOGLE_MAP_API_KEY || ''

	const { isLoaded, loadError } = useJsApiLoader({
		id: 'google-map-script',
		googleMapsApiKey: mapsApiKey,
	})

	const markerPosition = useMemo(() => {
		if (
			!captainLocation
			|| typeof captainLocation.latitude !== 'number'
			|| typeof captainLocation.longitude !== 'number'
		) {
			return null
		}

		return {
			lat: captainLocation.latitude,
			lng: captainLocation.longitude,
		}
	}, [captainLocation])

	const center = markerPosition || defaultCenter

	if (!mapsApiKey) {
		return (
			<div className="flex h-full w-full items-center justify-center bg-neutral-200 text-center text-sm text-neutral-700">
				Missing Google Maps API key. Set VITE_GOOGLE_MAPS_API_KEY in frontend .env.
			</div>
		)
	}

	if (loadError) {
		return (
			<div className="flex h-full w-full items-center justify-center bg-neutral-200 text-center text-sm text-red-600">
				Failed to load Google Maps.
			</div>
		)
	}

	if (!isLoaded) {
		return (
			<div className="flex h-full w-full items-center justify-center bg-neutral-200 text-center text-sm text-neutral-700">
				Loading map...
			</div>
		)
	}

	return (
		<GoogleMap
			mapContainerStyle={mapContainerStyle}
			center={center}
			zoom={markerPosition ? 15 : 12}
			options={{
				disableDefaultUI: true,
				zoomControl: true,
				gestureHandling: 'greedy',
			}}
		>
			{markerPosition ? (
				<Marker
					position={markerPosition}
					title="Captain Location"
				/>
			) : null}
		</GoogleMap>
	)
}

export default LiveTracking