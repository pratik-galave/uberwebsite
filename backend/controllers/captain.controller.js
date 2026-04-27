import blacklistTokenModel from "../models/blacklistToken.model.js";
import captainModel from "../models/captain.model.js";
import { createCaptain } from "../services/captain.service.js";
import { validationResult } from 'express-validator';

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

export async function logoutCaptain(req, res) { 
    const token = req.cookies.token;
    await blacklistTokenModel.create({ token });
    res.clearCookie('token');
    res.status(200).json({ message: 'Logout successful' });
}

const captainController = {
    registerCaptain,
    loginCaptain,
    getCaptainProfile,
    logoutCaptain
};

export default captainController;