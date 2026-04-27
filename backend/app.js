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
    origin: process.env.FRONTEND_URL || '*',
    credentials: true
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