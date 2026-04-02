import express from 'express';

export const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});
