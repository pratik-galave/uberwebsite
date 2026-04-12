import  axios from 'axios';
import dotenv from 'dotenv';
import captainModel from '../models/captain.model.js';

dotenv.config();

export const getAddressCoordinates = async (address) => {
	if (!address || typeof address !== 'string' || !address.trim()) {
		throw new Error('Address is required');
	}

	const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAP_API_KEY;

	if (!apiKey) {
		throw new Error('Google Maps API key is not configured');
	}

	const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
		params: {
			address: address.trim(),
			key: apiKey,
		},
	});

	if (response.data.status !== 'OK' || !response.data.results?.length) {
		throw new Error('Unable to fetch coordinates for the provided address');
	}

	const { lat, lng } = response.data.results[0].geometry.location;

	return { lat, lng };
};
    
export const getDistanceAndTime = async (origin, destination) => {
    if (!origin || !destination) {
        throw new Error('Origin and destination are required');
    }
    const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAP_API_KEY;

    if (!apiKey) {
        throw new Error('Google Maps API key is not configured');
    }
    const url=`https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(destination)}&key=${apiKey}`;
    
    try {
        const response = await axios.get(url);  
        if (response.data.status !== 'OK') {
            throw new Error('Unable to fetch distance and time for the provided origin and destination');
        }
        else{
            if (!response.data.rows?.length || !response.data.rows[0].elements?.length) {
                throw new Error('No distance and time data available for the provided origin and destination');
            }
            return response.data.rows[0].elements[0];
        }
    } catch (error) {
        console.error('Error fetching distance and time:', error.message);
        throw new Error('Failed to fetch distance and time');
    }
}

export const getSuggestions = async (input) => {
    if(!input || typeof input !== 'string' || !input.trim()) {
        throw new Error('Input is required for suggestions');
    }
    const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAP_API_KEY;

    if (!apiKey) {
        throw new Error('Google Maps API key is not configured');
    }
    const normalizedInput = input.trim();
    const placesUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(normalizedInput)}&key=${apiKey}`;
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(normalizedInput)}&key=${apiKey}`;

    try {
        const response = await axios.get(placesUrl);
        if (response.data.status === 'ZERO_RESULTS') {
            return [];
        }

        if (response.data.status !== 'OK') {
            throw new Error(response.data.status || 'Unable to fetch suggestions for the provided input');
        }
        return response.data.predictions;
    } catch (error) {
        console.error('Places autocomplete failed, trying geocode fallback:', error.message);

        try {
            const geocodeResponse = await axios.get(geocodeUrl);

            if (geocodeResponse.data.status === 'ZERO_RESULTS') {
                return [];
            }

            if (geocodeResponse.data.status !== 'OK') {
                throw new Error(geocodeResponse.data.status || 'Geocode fallback request failed');
            }

            const results = Array.isArray(geocodeResponse.data.results)
                ? geocodeResponse.data.results
                : [];

            return results.slice(0, 5).map((result) => ({
                description: result.formatted_address,
                place_id: result.place_id,
            }));
        } catch (fallbackError) {
            console.error('Geocode fallback failed:', fallbackError.message);

            try {
                const nominatimResponse = await axios.get('https://nominatim.openstreetmap.org/search', {
                    params: {
                        q: normalizedInput,
                        format: 'json',
                        addressdetails: 1,
                        limit: 5,
                    },
                    headers: {
                        'User-Agent': 'uber-app/1.0 (local-dev)',
                    },
                    timeout: 5000,
                });

                const places = Array.isArray(nominatimResponse.data) ? nominatimResponse.data : [];

                if (!places.length) {
                    return [
                        { description: normalizedInput },
                        { description: `${normalizedInput}, Pune` },
                        { description: `${normalizedInput}, Maharashtra` },
                    ];
                }

                return places.map((item) => ({
                    description: item.display_name,
                    place_id: item.place_id ? String(item.place_id) : undefined,
                })).filter((item) => Boolean(item.description));
            } catch (osmError) {
                console.error('Nominatim fallback failed:', osmError.message);
                return [
                    { description: normalizedInput },
                    { description: `${normalizedInput}, Pune` },
                    { description: `${normalizedInput}, Maharashtra` },
                ];
            }
        }
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