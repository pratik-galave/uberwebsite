import blacklistTokenModel from "../models/blacklistToken.model.js";
import captainModel from "../models/captain.model.js";
import rideModel from "../models/ride.model.js";
import { createCaptain } from "../services/captain.service.js";
import { validationResult } from 'express-validator';
import { OAuth2Client } from 'google-auth-library';
import crypto from 'crypto';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function registerCaptain(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { fullname, email, password, vehicle } = req.body;

    if (!fullname?.firstname || !fullname?.lastname || !email || !password || !vehicle?.color || !vehicle?.vehicleType || !vehicle?.vehiclePlate || !vehicle?.capacity) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const isCaptainExist = await captainModel.findOne({ email });
        if (isCaptainExist) {
            return res.status(400).json({ error: 'Captain with this email already exists' });
        }

        const hashPassword = await captainModel.hashPassword(password);

        const captain = await createCaptain({
            firstname: fullname.firstname,
            lastname: fullname.lastname,
            email,
            password: hashPassword,
            color: vehicle.color,
            vehicleType: vehicle.vehicleType,
            vehiclePlate: vehicle.vehiclePlate,
            capacity: vehicle.capacity
        });

        const token = captain.generateAuthToken();
        res.cookie('token', token, { 
            httpOnly: true, 
            secure: true, 
            sameSite: 'none',
            maxAge: 24 * 60 * 60 * 1000
        });

        return res.status(201).json({ message: 'Captain registered successfully', captain, token });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
}

export async function loginCaptain(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;

    const captain = await captainModel.findOne({ email }).select('+password');

    if (!captain) {
        return res.status(401).json({ error: 'Captain not found' });
    }   
    const isMatch = await captain.comparePassword(password);

    if (!isMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = captain.generateAuthToken();
    res.cookie('token', token, { 
        httpOnly: true, 
        secure: true, 
        sameSite: 'none',
        maxAge: 24 * 60 * 60 * 1000
    }); 
    res.status(200).json({ message: 'Login successful', captain, token });
}

export async function getCaptainProfile(req, res) {
    const captain = req.captain;
    res.status(200).json({ captain });
}   

export async function getCaptainStats(req, res) {
    try {
        const captainId = req.captain?._id;
        if (!captainId) {
            return res.status(401).json({ error: 'Captain not authenticated' });
        }

        const timezoneOffsetMinutes = Number(req.query?.timezoneOffsetMinutes);
        const offsetMinutes = Number.isFinite(timezoneOffsetMinutes) ? timezoneOffsetMinutes : 0;
        const now = Date.now();
        const millisecondsInDay = 24 * 60 * 60 * 1000;

        const localNow = now - (offsetMinutes * 60 * 1000);
        const localMidnight = Math.floor(localNow / millisecondsInDay) * millisecondsInDay;
        const dayStart = new Date(localMidnight + (offsetMinutes * 60 * 1000));
        const dayEnd = new Date(dayStart.getTime() + millisecondsInDay);

        const stats = await rideModel.aggregate([
            {
                $match: {
                    captain: captainId,
                    status: 'completed',
                    updatedAt: {
                        $gte: dayStart,
                        $lt: dayEnd,
                    },
                },
            },
            {
                $project: {
                    fare: { $ifNull: ['$fare', 0] },
                    durationSeconds: {
                        $max: [
                            0,
                            {
                                $divide: [
                                    { $subtract: ['$updatedAt', '$createdAt'] },
                                    1000,
                                ],
                            },
                        ],
                    },
                },
            },
            {
                $group: {
                    _id: null,
                    totalEarnings: { $sum: '$fare' },
                    totalRides: { $sum: 1 },
                    onlineSeconds: { $sum: '$durationSeconds' },
                },
            },
        ]);

        const summary = stats[0] || {
            totalEarnings: 0,
            totalRides: 0,
            onlineSeconds: 0,
        };

        return res.status(200).json({
            stats: {
                earnings: Number(summary.totalEarnings) || 0,
                rides: Number(summary.totalRides) || 0,
                onlineSeconds: Math.floor(Number(summary.onlineSeconds) || 0),
            },
        });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch captain stats' });
    }
}

export async function logoutCaptain(req, res) { 
    const token = req.cookies.token;
    await blacklistTokenModel.create({ token });
    res.clearCookie('token');
    res.status(200).json({ message: 'Logout successful' });
}

export async function googleAuthCaptain(req, res) {
    const { token, vehicle } = req.body;
    if (!token) {
        return res.status(400).json({ error: 'Google token is required' });
    }

    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { email, given_name, family_name } = payload;

        let captain = await captainModel.findOne({ email }).select('+password');

        if (!captain) {
            // Create a new captain if they don't exist
            if (!vehicle || !vehicle.color || !vehicle.vehicleType || !vehicle.vehiclePlate || !vehicle.capacity) {
                return res.status(400).json({ error: 'Vehicle details are required for new Captain registration via Google' });
            }

            const randomPassword = crypto.randomBytes(32).toString('hex');
            const hashPassword = await captainModel.hashPassword(randomPassword);

            captain = await createCaptain({
                firstname: given_name || email.split('@')[0],
                lastname: family_name || '',
                email,
                password: hashPassword,
                color: vehicle.color,
                vehicleType: vehicle.vehicleType,
                vehiclePlate: vehicle.vehiclePlate,
                capacity: vehicle.capacity
            });
        }

        const authToken = captain.generateAuthToken();
        res.cookie('token', authToken, { 
            httpOnly: true, 
            secure: true, 
            sameSite: 'none',
            maxAge: 24 * 60 * 60 * 1000
        }); 
        res.status(200).json({ message: 'Google authentication successful', captain, token: authToken });
    } catch (error) {
        console.error('Google Auth Error:', error);
        res.status(401).json({ error: 'Invalid Google token or creation failed' });
    }   
}

const captainController = {
    registerCaptain,
    loginCaptain,
    getCaptainProfile,
    getCaptainStats,
    logoutCaptain,
    googleAuthCaptain
};

export default captainController;