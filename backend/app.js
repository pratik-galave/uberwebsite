import express from 'express';
import cors from 'cors';
import connectDB from './db/db.js';
import userRoutes from './routes/user.routes.js';
import captainRoutes from './routes/captain.routes.js';
import cookieParser from 'cookie-parser';
import mapsRoutes from './routes/maps.routes.js';
import rideRoutes from './routes/ride.routes.js';
import paymentRoutes from './routes/payment.routes.js';
connectDB();

const app = express();
app.use(cookieParser());
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);
        // Allow any origin for now but ensure we echo it back correctly for credentials
        callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/user', userRoutes);
app.use('/captain', captainRoutes);
app.use('/maps', mapsRoutes);
app.use('/ride', rideRoutes);
app.use('/payment', paymentRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the Uber backend!' });
});

export default app;