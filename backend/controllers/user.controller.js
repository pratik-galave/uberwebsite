import userModel from "../models/user.model.js";
import { createUser } from "../services/user.service.js";
import { validationResult } from 'express-validator';
import blacklistTokenModel from "../models/blacklistToken.model.js";
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import crypto from 'crypto';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function registerUser(req, res ,next) {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { fullname, email, password } = req.body;
    const { firstname, lastname } = fullname || {};

    try {
        const isUserExist = await userModel.findOne({ email });
        if (isUserExist) {
            return res.status(400).json({ error: 'User with this email already exists' });
        }

        const hashPassword = await userModel.hashPassword(password);
        const user = await createUser({ firstname, lastname, email, password: hashPassword });

        const token = user.generateAuthToken();
        res.status(201).json({ message: 'User registered successfully', user, token });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

export async function loginUser(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
        const user = await userModel.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = user.generateAuthToken();
        res.cookie('token', token, { 
            httpOnly: true, 
            secure: true, // Required for cross-site cookies
            sameSite: 'none', // Required for cross-site cookies
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        }); 
        res.status(200).json({ message: 'Login successful', user, token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export async function getUserProfile(req, res) {
    res.status(200).json({ user: req.user });
}

export async function logoutUser(req, res) {
    res.clearCookie('token');
    const token= req.cookies?.token || req.headers.authorization?.split(' ')[1];
    if (token) {
        await blacklistTokenModel.create({ token });
    }
    res.status(200).json({ message: 'Logout successful' });
}

export async function googleAuthUser(req, res) {
    const { token } = req.body;
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

        let user = await userModel.findOne({ email }).select('+password');

        if (!user) {
            // Create a new user if they don't exist
            // Generate a random secure password for google users
            const randomPassword = crypto.randomBytes(32).toString('hex');
            const hashPassword = await userModel.hashPassword(randomPassword);
            
            user = await createUser({
                firstname: given_name || email.split('@')[0],
                lastname: family_name || '',
                email,
                password: hashPassword
            });
        }

        const authToken = user.generateAuthToken();
        res.cookie('token', authToken, { 
            httpOnly: true, 
            secure: true,
            sameSite: 'none',
            maxAge: 24 * 60 * 60 * 1000 
        }); 
        
        res.status(200).json({ message: 'Google authentication successful', user, token: authToken });
    } catch (error) {
        console.error('Google Auth Error:', error);
        res.status(401).json({ error: 'Invalid Google token' });
    }
}

const userController = {
    registerUser,
    loginUser,
    getUserProfile,
    logoutUser,
    googleAuthUser
};

export async function googleAuth(req, res) {
    const { token } = req.body;
    try {
        const user = await userModel.findOrCreateGoogleUser(token);
        const authToken = user.generateAuthToken();
        res.cookie('token', authToken, { 
            httpOnly: true, 
            secure: true, // Required for cross-site cookies
            sameSite: 'none', // Required for cross-site cookies
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        }); 
        res.status(200).json({ message: 'Google authentication successful', user, token: authToken });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }   
}

export default userController;
