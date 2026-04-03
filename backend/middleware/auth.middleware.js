import userModel from "../models/user.model.js";
import captainModel from "../models/captain.model.js";
import jwt from "jsonwebtoken";
import blacklistTokenModel from "../models/blacklistToken.model.js";

export async function authUser(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = req.cookies?.token || authHeader?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const isBlacklistedToken = await blacklistTokenModel.findOne({ token : token });
    if (isBlacklistedToken) {
        return res.status(401).json({ error: 'Token has been blacklisted. Please log in again.' });
     }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await userModel.findById(decoded._id);
        if (!req.user) {
            return res.status(401).json({ error: 'User not found' });
        }
        next();
    } catch (error) {
        res.status(400).json({ error: 'Invalid token.' });
    }
}

export async function authCaptain(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = req.cookies?.token || authHeader?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const isBlacklistedToken = await blacklistTokenModel.findOne({ token : token });
    if (isBlacklistedToken) {
        return res.status(401).json({ error: 'Token has been blacklisted. Please log in again.' });
     }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.captain = await captainModel.findById(decoded._id);
        if (!req.captain) {
            return res.status(401).json({ error: 'Captain not found' });
        }
        return next();
    } catch (error) {
        res.status(400).json({ error: 'Invalid token.' });
    }
}


const authMiddleware = {
    authUser,
    authCaptain 
};

export default authMiddleware;