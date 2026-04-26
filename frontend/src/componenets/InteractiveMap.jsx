import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;

const customPickupIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const customDestIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const normalizeCoords = (value) => {
    if (!value || typeof value !== 'object') {
        return null;
    }

    const lat = Number(value.lat);
    const lng = Number(value.lng ?? value.lon);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        return null;
    }

    return { lat, lng };
};

const FitBounds = ({ path, pickupCoords, destinationCoords }) => {
    const map = useMap();

    useEffect(() => {
        if (path && path.length > 0) {
            const bounds = L.latLngBounds(path);
            map.fitBounds(bounds, { padding: [50, 50] });
        } else if (pickupCoords && destinationCoords) {
            const bounds = L.latLngBounds([pickupCoords, destinationCoords]);
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [path, pickupCoords, destinationCoords, map]);

    useEffect(() => {
        if (pickupCoords && !destinationCoords && !path.length) {
            map.setView([pickupCoords.lat, pickupCoords.lng], 15);
        } else if (destinationCoords && !pickupCoords && !path.length) {
            map.setView([destinationCoords.lat, destinationCoords.lng], 15);
        }
    }, [pickupCoords, destinationCoords, map, path.length]);

    return null;
};

const InteractiveMap = ({
    pickupCoords,
    destinationCoords,
    pickupString,
    destinationString,
    onPickupChange,
    onDestinationChange
}) => {
    const [resolvedPickup, setResolvedPickup] = useState(null);
    const [resolvedDestination, setResolvedDestination] = useState(null);
    const [path, setPath] = useState([]);

    const pickupRef = useRef(null);
    const destRef = useRef(null);

    const effectivePickupCoords = useMemo(() => {
        return normalizeCoords(pickupCoords) || resolvedPickup;
    }, [pickupCoords, resolvedPickup]);

    const effectiveDestinationCoords = useMemo(() => {
        return normalizeCoords(destinationCoords) || resolvedDestination;
    }, [destinationCoords, resolvedDestination]);

    useEffect(() => {
        let cancelled = false;

        const resolveAddress = async (address) => {
            const normalizedAddress = String(address || '').trim();
            if (normalizedAddress.length < 3) {
                return null;
            }

            try {
                const response = await axios.get('https://nominatim.openstreetmap.org/search', {
                    params: {
                        q: normalizedAddress,
                        format: 'json',
                        limit: 1,
                    },
                    timeout: 5000,
                });

                if (!Array.isArray(response.data) || response.data.length === 0) {
                    return null;
                }

                const firstResult = response.data[0];
                return normalizeCoords({ lat: firstResult?.lat, lng: firstResult?.lon });
            } catch {
                return null;
            }
        };

        const resolveMissingCoordinates = async () => {
            if (normalizeCoords(pickupCoords)) {
                if (!cancelled) setResolvedPickup(null);
            } else {
                const pickupFromAddress = await resolveAddress(pickupString);
                if (!cancelled) {
                    setResolvedPickup(pickupFromAddress);
                }
            }

            if (normalizeCoords(destinationCoords)) {
                if (!cancelled) setResolvedDestination(null);
            } else {
                const destinationFromAddress = await resolveAddress(destinationString);
                if (!cancelled) {
                    setResolvedDestination(destinationFromAddress);
                }
            }
        };

        const timerId = setTimeout(() => {
            resolveMissingCoordinates();
        }, 1500); // 1.5 second debounce to respect Nominatim rate limits

        return () => {
            cancelled = true;
            clearTimeout(timerId);
        };
    }, [pickupCoords, destinationCoords, pickupString, destinationString]);

    useEffect(() => {
        if (!effectivePickupCoords || !effectiveDestinationCoords) {
            setPath([]);
            return;
        }

        let cancelled = false;

        const fetchRoute = async () => {
            try {
                const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${effectivePickupCoords.lng},${effectivePickupCoords.lat};${effectiveDestinationCoords.lng},${effectiveDestinationCoords.lat}?overview=full&geometries=geojson`;
                const response = await axios.get(osrmUrl, { timeout: 5000 });

                if (cancelled) {
                    return;
                }

                if (response.data.code === 'Ok' && Array.isArray(response.data.routes) && response.data.routes.length > 0) {
                    const coords = response.data.routes[0].geometry.coordinates.map((coordinate) => [coordinate[1], coordinate[0]]);
                    setPath(coords);
                    return;
                }

                setPath([]);
            } catch {
                if (!cancelled) {
                    setPath([]);
                }
            }
        };

        fetchRoute();

        return () => {
            cancelled = true;
        };
    }, [effectivePickupCoords, effectiveDestinationCoords]);

    const handlePickupDragEnd = () => {
        const marker = pickupRef.current;
        if (!marker) {
            return;
        }

        const { lat, lng } = marker.getLatLng();
        onPickupChange?.({ lat, lng });
    };

    const handleDestDragEnd = () => {
        const marker = destRef.current;
        if (!marker) {
            return;
        }

        const { lat, lng } = marker.getLatLng();
        onDestinationChange?.({ lat, lng });
    };

    const defaultCenter = [18.5204, 73.8567];
    const mapCenter = effectivePickupCoords ? [effectivePickupCoords.lat, effectivePickupCoords.lng] : defaultCenter;

    return (
        <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%', minHeight: '100vh', zIndex: 0 }} zoomControl={false}>
            <TileLayer
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                attribution="&copy; OpenStreetMap contributors &copy; CARTO"
            />
            {effectivePickupCoords ? (
                <Marker
                    position={[effectivePickupCoords.lat, effectivePickupCoords.lng]}
                    icon={customPickupIcon}
                    draggable={true}
                    eventHandlers={{ dragend: handlePickupDragEnd }}
                    ref={pickupRef}
                />
            ) : null}
            {effectiveDestinationCoords ? (
                <Marker
                    position={[effectiveDestinationCoords.lat, effectiveDestinationCoords.lng]}
                    icon={customDestIcon}
                    draggable={true}
                    eventHandlers={{ dragend: handleDestDragEnd }}
                    ref={destRef}
                />
            ) : null}
            {path.length > 0 ? <Polyline positions={path} color="#00FFC2" weight={8} opacity={1} lineCap="square" /> : null}
            <FitBounds
                path={path}
                pickupCoords={effectivePickupCoords}
                destinationCoords={effectiveDestinationCoords}
            />
        </MapContainer>
    );
};

export default InteractiveMap;
