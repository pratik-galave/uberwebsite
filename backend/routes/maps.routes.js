import express from 'express';
const router = express.Router();
import authMiddleware from '../middleware/auth.middleware.js';
import * as mapsController from '../controllers/maps.controller.js';
import { query } from 'express-validator';


router.get('/get-coordinates', [
    query('address').notEmpty().withMessage('Address query parameter is required')
], authMiddleware.authUser, mapsController.getCoordinates);

router.get('/get-distance-time', [
    query('origin').notEmpty().withMessage('Origin query parameter is required'),
    query('destination').notEmpty().withMessage('Destination query parameter is required')
], authMiddleware.authUser, mapsController.getDistance);

router.get('/get-suggestions', authMiddleware.authUser, mapsController.getSuggestions);

export default router;