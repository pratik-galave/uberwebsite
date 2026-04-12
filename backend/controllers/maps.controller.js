import { getAddressCoordinates } from '../services/maps.service.js';
import { validationResult } from 'express-validator';
import { getDistanceAndTime } from '../services/maps.service.js';
import { getSuggestions as getSuggestionsService } from '../services/maps.service.js';

export const getCoordinates = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { address } = req.query;
        if (!address) {
            return res.status(400).json({ error: 'Address query parameter is required' });
        }
        const coordinates = await getAddressCoordinates(address);
        res.json(coordinates);
    } catch (error) {
        console.error('Error fetching coordinates:', error.message);
        res.status(500).json({ error: 'Failed to fetch coordinates' });
    }
};

export  const getDistance = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { origin, destination } = req.query;
        if (!origin || !destination) {
            return res.status(400).json({ error: 'Origin and destination query parameters are required' });
        }
        const distanceAndTime = await getDistanceAndTime(origin, destination);
        res.json(distanceAndTime);

    } catch (error) {
        console.error('Error fetching distance and time:', error.message);
        res.status(500).json({ error: 'Failed to fetch distance and time' });
    }
};

export const getSuggestions = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { input } = req.query;
        const suggestions = await getSuggestionsService(input);
        res.json(suggestions);
    } catch (error) {
        console.error('Error fetching suggestions:', error.message);
        res.json([]);
    }
};
