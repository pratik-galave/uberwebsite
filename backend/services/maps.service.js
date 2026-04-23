import axios from 'axios';
import dotenv from 'dotenv';
import captainModel from '../models/captain.model.js';

dotenv.config();

// Simple in-memory cache for Nominatim to prevent 429 Too Many Requests
const nominatimCache = new Map();
const osrmCache = new Map();
const CACHE_TTL_MS = 3600000;

const getCachedData = (cache, cacheKey) => {
    if (!cache.has(cacheKey)) {
        return null;
    }

    const cached = cache.get(cacheKey);
    if (Date.now() - cached.timestamp >= CACHE_TTL_MS) {
        cache.delete(cacheKey);
        return null;
    }

    return cached.data;
};

const setCachedData = (cache, cacheKey, data) => {
    cache.set(cacheKey, { timestamp: Date.now(), data });
};

const normalizeCoordinates = (value) => {
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

const fetchFromNominatim = async (url, params = {}) => {
    const cacheKey = `${url}?${new URLSearchParams(params).toString()}`;

    const cachedData = getCachedData(nominatimCache, cacheKey);
    if (cachedData) {
        return cachedData;
    }

    try {
        const response = await axios.get(url, {
            params: {
                ...params,
                format: 'json',
            },
            headers: {
                // Nominatim strictly prefers a valid User-Agent
                'User-Agent': 'uber-app/1.0 (local-dev)',
            },
            timeout: 5000,
        });

        setCachedData(nominatimCache, cacheKey, response.data);
        return response.data;
    } catch (error) {
        console.error('Nominatim request failed:', error.message);
        throw error;
    }
};

const fetchFromOsrm = async (originCoords, destinationCoords) => {
    const profile = 'driving';
    const osrmUrl = `https://router.project-osrm.org/route/v1/${profile}/${originCoords.lng},${originCoords.lat};${destinationCoords.lng},${destinationCoords.lat}?overview=false`;
    const cacheKey = `${originCoords.lat},${originCoords.lng}->${destinationCoords.lat},${destinationCoords.lng}`;

    const cachedData = getCachedData(osrmCache, cacheKey);
    if (cachedData) {
        return cachedData;
    }

    const response = await axios.get(osrmUrl, { timeout: 5000 });
    setCachedData(osrmCache, cacheKey, response.data);
    return response.data;
};

export const getAddressCoordinates = async (address) => {
    if (!address || typeof address !== 'string' || !address.trim()) {
        throw new Error('Address is required');
    }

    try {
        const places = await fetchFromNominatim('https://nominatim.openstreetmap.org/search', {
            q: address.trim(),
            limit: 1,
        });

        if (!places || places.length === 0) {
            throw new Error('Unable to fetch coordinates for the provided address');
        }

        return {
            lat: parseFloat(places[0].lat),
            lng: parseFloat(places[0].lon)
        };
    } catch (error) {
        throw new Error('Unable to fetch coordinates for the provided address');
    }
};

export const getDistanceAndTime = async (origin, destination) => {
    if (!origin || !destination) {
        throw new Error('Origin and destination are required');
    }

    try {
        // First we need coordinates for origin and destination since OSRM requires them
        let originCoords = null;
        let destCoords = null;

        originCoords = normalizeCoordinates(origin);
        if (!originCoords) {
            originCoords = await getAddressCoordinates(origin);
        }

        destCoords = normalizeCoordinates(destination);
        if (!destCoords) {
            destCoords = await getAddressCoordinates(destination);
        }

        const response = { data: await fetchFromOsrm(originCoords, destCoords) };
        
        if (response.data.code !== 'Ok' || !response.data.routes || response.data.routes.length === 0) {
            throw new Error('No route found');
        }

        const route = response.data.routes[0];
        
        return {
            distance: {
                value: route.distance, // in meters
                text: `${(route.distance / 1000).toFixed(1)} km`,
            },
            duration: {
                value: route.duration, // in seconds 
                text: `${Math.round(route.duration / 60)} mins`,
            }
        };

    } catch (error) {
        console.error('Error fetching distance and time from OSRM:', error.message);
        throw new Error('Failed to fetch distance and time');
    }
}

export const getSuggestions = async (input) => {
    if(!input || typeof input !== 'string' || !input.trim()) {
        throw new Error('Input is required for suggestions');
    }
    const normalizedInput = input.trim();

    try {
        const places = await fetchFromNominatim('https://nominatim.openstreetmap.org/search', {
            q: normalizedInput,
            addressdetails: 1,
            limit: 5,
        });

        if (!places || places.length === 0) {
            return [];
        }

        return places.map((item) => ({
            description: item.display_name,
            place_id: item.place_id ? String(item.place_id) : undefined,
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon)
        })).filter((item) => Boolean(item.description));
    } catch (osmError) {
        console.error('Nominatim failed:', osmError.message);
        return [];
    }
}

export const getCaptainInRadius = async (lat, lng, radius) => {
    if (typeof lat !== 'number' || typeof lng !== 'number' || typeof radius !== 'number') {
        throw new Error('Latitude, longitude, and radius must be numbers');
    }

    // Uses straight-line (Haversine) distance against stored captain coordinates.
    const toRadians = (value) => (value * Math.PI) / 180;
    const getDistanceInMeters = (fromLat, fromLng, toLat, toLng) => {
        const earthRadius = 6371000;
        const dLat = toRadians(toLat - fromLat);
        const dLng = toRadians(toLng - fromLng);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2)
            + Math.cos(toRadians(fromLat))
            * Math.cos(toRadians(toLat))
            * Math.sin(dLng / 2)
            * Math.sin(dLng / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return earthRadius * c;
    };

    const captains = await captainModel.find(
        {
            'location.latitude': { $ne: null },
            'location.longitude': { $ne: null },
        },
        {
            fullname: 1,
            socketId: 1,
            location: 1,
        }
    );

    return captains.filter((captain) => {
        const captainLat = captain?.location?.latitude;
        const captainLng = captain?.location?.longitude;

        if (typeof captainLat !== 'number' || typeof captainLng !== 'number') {
            return false;
        }

        return getDistanceInMeters(lat, lng, captainLat, captainLng) <= radius;
    });
}