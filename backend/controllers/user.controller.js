import userModel from "../models/user.model.js";
import { createUser } from "../services/user.service.js";
import { validationResult } from 'express-validator';
import blacklistTokenModel from "../models/blacklistToken.model.js";

export async function registerUser(req, res ,next) {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { firstname, lastname, email, password } = req.body;

    const hashPassword = await userModel.hashPassword(password); 

    try {
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
        res.cookie('token', token, { httpOnly: true }); // Set token in cookie
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

const userController = {
    registerUser,
    loginUser,
    getUserProfile,
    logoutUser

};

export default userController;
