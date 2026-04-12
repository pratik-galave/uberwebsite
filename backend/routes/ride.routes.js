import express from 'express';
const router = express.Router();
import { body, query } from 'express-validator';
import * as rideController from '../controllers/ride.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

router.post('/create', 
    body('origin').notEmpty().withMessage('Origin is required'),
    body('destination').notEmpty().withMessage('Destination is required'),
    body('vehicleType')
        .notEmpty().withMessage('Vehicle type is required')
        .isIn(['car', 'auto', 'bike']).withMessage('Vehicle type must be car, auto, or bike'),
    authMiddleware.authUser,
    rideController.createRide
);
router.get('/get-fare', 
    query('pickup').notEmpty().withMessage('Pickup location is required'),
    query('destination').notEmpty().withMessage('Destination is required'),
    rideController.getFare
);

export default router;