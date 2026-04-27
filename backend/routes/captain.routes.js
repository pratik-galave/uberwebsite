import express from "express";
const router = express.Router();
import { body } from "express-validator";
import captainController from "../controllers/captain.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

router.post('/register', [
    body('fullname.firstname').isLength({ min: 3 }).withMessage('First name must be at least 3 characters long'),
    body('fullname.lastname').isLength({ min: 3 }).withMessage('Last name must be at least 3 characters long'),
    body('email').notEmpty().withMessage('Email is required'),
    body('password').notEmpty().withMessage('Password is required'),
    body('vehicle.color').notEmpty().withMessage('Vehicle color is required'),
    body('vehicle.vehicleType').notEmpty().withMessage('Vehicle type is required'),
    body('vehicle.vehiclePlate').notEmpty().withMessage('Vehicle plate is required'),
    body('vehicle.capacity').notEmpty().withMessage('Vehicle capacity is required')

], captainController.registerCaptain);

router.post('/login', [
    body('email').notEmpty().withMessage('Email is required'),
    body('password').notEmpty().withMessage('Password is required'),
], captainController.loginCaptain);

router.get('/profile', authMiddleware.authCaptain,captainController.getCaptainProfile);
router.get('/stats', authMiddleware.authCaptain, captainController.getCaptainStats);

router.get('/logout', authMiddleware.authCaptain, captainController.logoutCaptain   );

export default router;