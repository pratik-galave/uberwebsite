import React, { useMemo, useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import axios from 'axios'
import { BASE_URL } from '../config.js'
import 'leaflet/dist/leaflet.css'

delete L.Icon.Default.prototype._getIconUrl

L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
})

const defaultCenter = [41.8781, -87.6298]

const normalizeCoords = (value) => {
    if (!value || typeof value !== 'object') {
        return null
    }

    const lat = Number(value.lat)
    const lng = Number(value.lng ?? value.lon)

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        return null
    }

    return { lat, lng }
}

const RecenterMap = ({ center, destination }) => {
    const map = useMap()

    useEffect(() => {
        if (center && destination) {
            const bounds = L.latLngBounds([center, destination])
            map.fitBounds(bounds, { padding: [50, 50] })
        } else if (center) {
            map.setView([center.lat, center.lng], 15)
        }
    }, [center, destination, map])

    return null
}

const LiveTracking = ({ captainLocation, pickupCoords, destinationCoords, pickupString, destString }) => {
    const [path, setPath] = useState([])
    const [resolvedPickup, setResolvedPickup] = useState(null)
    const [resolvedDest, setResolvedDest] = useState(null)

    const captainCoords = useMemo(() => {
        if (!captainLocation) {
            return null
        }

        return normalizeCoords({
            lat: captainLocation.latitude ?? captainLocation.lat,
            lng: captainLocation.longitude ?? captainLocation.lng,
        })
    }, [captainLocation])

    const effectivePickup = useMemo(() => normalizeCoords(pickupCoords) || resolvedPickup, [pickupCoords, resolvedPickup])
    const effectiveDestination = useMemo(() => normalizeCoords(destinationCoords) || resolvedDest, [destinationCoords, resolvedDest])

    useEffect(() => {
        let cancelled = false

        const fetchGeocode = async (address) => {
            const normalizedAddress = String(address || '').trim()
            if (normalizedAddress.length < 3) {
                return null
            }

            const token = localStorage.getItem('token')
            const baseUrl = BASE_URL

            try {
                const response = await axios.get(`${baseUrl}/maps/get-coordinates`, {
                    params: {
                        address: normalizedAddress,
                    },
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                    timeout: 5000,
                })

                const backendCoords = normalizeCoords(response.data)
                if (backendCoords) {
                    return backendCoords
                }
            } catch {
                // Fall back to direct Nominatim call if backend lookup is unavailable.
            }

            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(normalizedAddress)}&format=json&limit=1`)
                const data = await response.json()
                if (Array.isArray(data) && data.length > 0) {
                    return normalizeCoords({ lat: data[0]?.lat, lng: data[0]?.lon })
                }
            } catch {
                return null
            }

            return null
        }

        const resolveCoords = async () => {
            if (normalizeCoords(pickupCoords)) {
                setResolvedPickup(null)
            } else if (pickupString) {
                const pickupFromAddress = await fetchGeocode(pickupString)
                if (!cancelled) {
                    setResolvedPickup(pickupFromAddress)
                }
            } else {
                setResolvedPickup(null)
            }

            if (normalizeCoords(destinationCoords)) {
                setResolvedDest(null)
            } else if (destString) {
                const destinationFromAddress = await fetchGeocode(destString)
                if (!cancelled) {
                    setResolvedDest(destinationFromAddress)
                }
            } else {
                setResolvedDest(null)
            }
        }

        const timerId = setTimeout(() => {
            resolveCoords()
        }, 1500) // 1.5s debounce to prevent rate-limiting

        return () => {
            cancelled = true
            clearTimeout(timerId)
        }
    }, [pickupString, destString, pickupCoords, destinationCoords])

    useEffect(() => {
        const origin = captainCoords || effectivePickup
        const destination = effectiveDestination || effectivePickup

        if (!origin || !destination) {
            setPath([])
            return
        }

        let cancelled = false

        const fetchRoute = async () => {
            try {
                const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`
                const response = await fetch(osrmUrl)
                const data = await response.json()

                if (cancelled) {
                    return
                }

                if (data.code === 'Ok' && Array.isArray(data.routes) && data.routes.length > 0) {
                    const coords = data.routes[0].geometry.coordinates.map((coordinate) => [coordinate[1], coordinate[0]])
                    setPath(coords)
                    return
                }

                setPath([])
            } catch {
                if (!cancelled) {
                    setPath([])
                }
            }
        }

        fetchRoute()

        return () => {
            cancelled = true
        }
    }, [captainCoords, effectivePickup, effectiveDestination])

    const center = captainCoords || effectivePickup || { lat: defaultCenter[0], lng: defaultCenter[1] }

    return (
        <div style={{ height: '100%', width: '100%' }}>
            <MapContainer
                center={[center.lat, center.lng]}
                zoom={captainCoords ? 15 : 12}
                style={{ height: '100%', width: '100%', zIndex: 0 }}
                zoomControl={false}
            >
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    attribution="&copy; OpenStreetMap contributors &copy; CARTO"
                />
                {captainCoords ? <RecenterMap center={captainCoords} destination={effectiveDestination} /> : null}
                {captainCoords ? <Marker position={[captainCoords.lat, captainCoords.lng]} /> : null}
                {effectiveDestination ? <Marker position={[effectiveDestination.lat, effectiveDestination.lng]} /> : null}
                {path.length > 0 ? <Polyline positions={path} color="#00FFC2" weight={6} opacity={1} lineCap="square" /> : null}
            </MapContainer>
        </div>
    )
}

export default LiveTracking