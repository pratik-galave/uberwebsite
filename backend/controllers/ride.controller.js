import { createRide as createRideService, getfare } from "../services/ride.service.js";
import { validationResult } from 'express-validator';
import { getCaptainInRadius,getAddressCoordinates } from "../services/maps.service.js";
import { sendMessageToRoom, sendMessageToSocket } from '../socket.js';
import userModel from '../models/user.model.js';
import rideModel from '../models/ride.model.js';

export async function createRide(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { userId, origin, destination, vehicleType } = req.body;
        const ride = await createRideService({ origin, destination, userId, vehicleType });
        res.status(201).json(ride);

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


        const  pickupcoordinates = await getAddressCoordinates(origin);    
        const captainsInRadius = await getCaptainInRadius(pickupcoordinates.lat, pickupcoordinates.lng, 10000); // 10 km radius in meters
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
    } catch (error) {
        console.error('Error creating ride:', error.message);
        res.status(500).json({ error: 'Failed to create ride' });
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

