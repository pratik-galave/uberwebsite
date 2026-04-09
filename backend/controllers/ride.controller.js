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
            distanceText: ride?.distanceText,
            durationText: ride?.durationText,
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

export async function getRideById(req, res) {
    try {
        const { rideId } = req.params;

        if (!rideId) {
            return res.status(400).json({ error: 'Ride ID is required' });
        }

        const ride = await rideModel.findById(rideId)
            .populate('user', 'fullname email')
            .populate('captain', 'fullname email');

        if (!ride) {
            return res.status(404).json({ error: 'Ride not found' });
        }

        const userId = req.user?._id ? String(req.user._id) : null;
        const captainId = req.captain?._id ? String(req.captain._id) : null;
        const rideUserId = ride.user?._id ? String(ride.user._id) : null;
        const rideCaptainId = ride.captain?._id ? String(ride.captain._id) : null;

        const isRideOwner = userId && rideUserId === userId;
        const isRideCaptain = captainId && rideCaptainId === captainId;

        if (!isRideOwner && !isRideCaptain) {
            return res.status(403).json({ error: 'You do not have access to this ride' });
        }

        return res.status(200).json({
            rideId: ride._id,
            origin: ride.origin,
            destination: ride.destination,
            fare: ride.fare,
            distanceText: ride.distanceText || '',
            durationText: ride.durationText || '',
            status: ride.status,
            user: ride.user,
            captain: ride.captain,
        });
    } catch (error) {
        console.error('Error fetching ride details:', error.message);
        return res.status(500).json({ error: 'Failed to fetch ride details' });
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

