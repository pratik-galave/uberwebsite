import { createRide as createRideService, getfare } from "../services/ride.service.js";
import { validationResult } from 'express-validator';
import { getCaptainInRadius,getAddressCoordinates } from "../services/maps.service.js";
import { sendMessageToRoom, sendMessageToSocket } from '../socket.js';
import userModel from '../models/user.model.js';
import rideModel from '../models/ride.model.js';
import captainModel from '../models/captain.model.js';

export async function createRide(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { origin, destination, vehicleType, fare } = req.body;
        const userId = req.user?._id ? String(req.user._id) : req.body?.userId;

        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const ride = await createRideService({ origin, destination, userId, vehicleType, fare });
        res.status(201).json(ride);

        try {
            const user = await userModel.findById(userId).select('fullname email');

            const captainRidePayload = {
                rideId: ride?._id,
                origin: ride?.origin,
                destination: ride?.destination,
                fare: ride?.fare,
                vehicleType,
                user: user
                    ? {
                        _id: user._id,
                        fullname: user.fullname,
                        email: user.email,
                    }
                    : {
                        _id: userId,
                    },
            };

            let captainsInRadius = [];

            try {
                const pickupcoordinates = await getAddressCoordinates(origin);
                captainsInRadius = await getCaptainInRadius(pickupcoordinates.lat, pickupcoordinates.lng, 10000); // 10 km radius in meters
            } catch (locationError) {
                console.error('Failed to resolve captain radius, falling back to online captains:', locationError.message);
            }

            if (!captainsInRadius.length) {
                captainsInRadius = await captainModel.find(
                    { socketId: { $ne: null } },
                    { fullname: 1, socketId: 1 }
                ).limit(100);
            }

            const notifiedCaptainIds = captainsInRadius
                .map((captain) => captain?._id)
                .filter(Boolean);

            await rideModel.updateOne(
                { _id: ride._id },
                { notifiedCaptains: notifiedCaptainIds }
            );

            const nearbyCaptainNames = captainsInRadius
                .map((captain) => [captain?.fullname?.firstname, captain?.fullname?.lastname].filter(Boolean).join(' ').trim())
                .filter(Boolean);

            sendMessageToRoom(userId, {
                rideId: ride?._id,
                totalNearbyCaptains: nearbyCaptainNames.length,
                captainNames: nearbyCaptainNames,
            }, 'nearbyCaptains');

            console.log('Captains in radius:', captainsInRadius);
            captainsInRadius.forEach(captain => {
                if (captain.socketId) {
                    sendMessageToSocket(captain.socketId, captainRidePayload, 'newRideRequest');
                }
            });
        } catch (notifyError) {
            console.error('Ride created but captain notification failed:', notifyError.message);
        }
    } catch (error) {
        console.error('Error creating ride:', error.message);
        if (!res.headersSent) {
            res.status(500).json({ error: error.message || 'Failed to create ride' });
        }
    }   
}

export async function getFare(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { pickup, destination } = req.query;
        const fare = await getfare(pickup, destination);
        res.json(fare);
    } catch (error) {
        console.error('Error fetching fare:', error.message);
        res.status(500).json({ error: 'Failed to fetch fare' });
    }   
}

