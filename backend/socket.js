import { Server } from 'socket.io';
import userModel from './models/user.model.js';
import captainModel from './models/captain.model.js';
import rideModel from './models/ride.model.js';

let io = null;

const allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    process.env.FRONTEND_URL,
].filter(Boolean);

const normalizeCoordinates = (value) => {
    if (!value || typeof value !== 'object') {
        return null;
    }

    const lat = Number(value.lat);
    const lng = Number(value.lng ?? value.lon);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        return null;
    }

    return { lat, lng };
};

async function replayPendingRidesForCaptain(captainId, socketId) {
    if (!captainId || !socketId) {
        return;
    }

    const replayWindowStart = new Date(Date.now() - (2 * 60 * 60 * 1000));

    const pendingRides = await rideModel.find({
        status: 'requested',
        notifiedCaptains: captainId,
        captain: null,
        createdAt: { $gte: replayWindowStart },
    })
        .populate('user', 'fullname email')
        .sort({ createdAt: 1 })
        .limit(50);

    pendingRides.forEach((ride) => {
        const payload = {
            rideId: String(ride._id),
            origin: ride.origin,
            destination: ride.destination,
            pickupCoordinates: normalizeCoordinates(ride.pickupCoordinates),
            destinationCoordinates: normalizeCoordinates(ride.destinationCoordinates),
            fare: ride.fare,
            user: ride.user
                ? {
                    _id: ride.user._id,
                    fullname: ride.user.fullname,
                    email: ride.user.email,
                }
                : null,
        };

        sendMessageToSocket(socketId, payload, 'newRideRequest');
    });
}

export function initializeSocket(server) {
    io = new Server(server, {
        cors: {
            origin: allowedOrigins,
            methods: ['GET', 'POST'],
            credentials: true
        },
        transports: ['websocket', 'polling'],
        allowUpgrades: true
    });

    io.on('connection', (socket) => {
        console.log('New client connected:', socket.id);

        socket.on('join', async (data) => {
            const { userId, userType } = data || {};
            console.log(`Client ${socket.id} joining with userId: ${userId}, userType: ${userType}`);
            if (!userId || !userType) {
                return;
            }

            try {
                if (userType === 'user') {
                    const user = await userModel.findByIdAndUpdate(
                        userId,
                        { socketId: socket.id },
                        { returnDocument: 'after' }
                    );

                    if (user) {
                        socket.data.userType = 'user';
                        socket.data.userId = String(user._id);
                        socket.join(String(user._id));
                    }
                } else if (userType === 'captain') {
                    const captain = await captainModel.findByIdAndUpdate(
                        userId,
                        { socketId: socket.id },
                        { returnDocument: 'after' }
                    );

                    if (captain) {
                        socket.data.userType = 'captain';
                        socket.data.userId = String(captain._id);
                        socket.join(String(captain._id));
                        await replayPendingRidesForCaptain(String(captain._id), socket.id);
                    }
                }
            } catch (error) {
                console.error('Socket join handler error:', error.message);
            }
        });

        socket.on('disconnect', async () => {
            const { userType, userId } = socket.data || {};
            if (!userType || !userId) {
                return;
            }

            try {
                if (userType === 'user') {
                    await userModel.updateOne(
                        { _id: userId, socketId: socket.id },
                        { socketId: null }
                    );
                } else if (userType === 'captain') {
                    await captainModel.updateOne(
                        { _id: userId, socketId: socket.id },
                        { socketId: null }
                    );
                }
            } catch (error) {
                console.error('Socket disconnect cleanup error:', error.message);
            }
        });

        socket.on('updateLocationCaptain', async (data) => {
            const { userId, userType, location } = data || {};
            const captainId = userId || socket.data?.userId;
            const captainType = userType || socket.data?.userType;

            if (captainType !== 'captain' || !captainId || !location || location.latitude == null || location.longitude == null) {
                return;
            }

            try {
                await captainModel.findByIdAndUpdate(
                    captainId,
                    {
                        location: {
                            latitude: location.latitude,
                            longitude: location.longitude,
                        },
                    },
                    { returnDocument: 'after' }
                );

                const activeRides = await rideModel.find(
                    {
                        captain: captainId,
                        status: { $in: ['accepted', 'in_progress'] },
                    },
                    {
                        _id: 1,
                        user: 1,
                    }
                );

                activeRides.forEach((ride) => {
                    if (!ride?.user) {
                        return;
                    }

                    sendMessageToRoom(
                        String(ride.user),
                        {
                            rideId: String(ride._id),
                            captainId: String(captainId),
                            location: {
                                latitude: location.latitude,
                                longitude: location.longitude,
                            },
                        },
                        'captainLocationUpdate'
                    );
                });
            } catch (error) {
                console.error('Error updating captain location:', error.message);
            }
        });

        socket.on('captainAcceptRide', async (data) => {
            const { rideId, captainId, captainName } = data || {};
            const acceptedCaptainId = captainId || socket.data?.userId;
            const acceptedCaptainType = socket.data?.userType;

            if (acceptedCaptainType !== 'captain' || !acceptedCaptainId || !rideId) {
                return;
            }

            try {
                const ride = await rideModel.findById(rideId).select('+otp');

                if (!ride?.user || !ride?.otp) {
                    return;
                }

                if (ride.status === 'requested' || (ride.status === 'accepted' && String(ride.captain) === String(acceptedCaptainId))) {
                    ride.status = 'accepted';
                    ride.captain = acceptedCaptainId;
                    await ride.save();
                }

                sendMessageToRoom(
                    String(ride.user),
                    {
                        rideId: String(ride._id),
                        otp: ride.otp,
                        captainId: acceptedCaptainId,
                        captainName: captainName || 'Your captain',
                        origin: ride.origin,
                        destination: ride.destination,
                        pickupCoordinates: normalizeCoordinates(ride.pickupCoordinates),
                        destinationCoordinates: normalizeCoordinates(ride.destinationCoordinates),
                        fare: ride.fare,
                    },
                    'rideAccepted'
                );
            } catch (error) {
                console.error('Error handling captainAcceptRide:', error.message);
            }
        });

        socket.on('verifyOtpWithUser', (data) => {
            const { rideId, userId, captainId, enteredOtp } = data || {};
            const senderType = socket.data?.userType;
            const senderCaptainId = socket.data?.userId;

            if (senderType !== 'captain' || !senderCaptainId || !rideId || !userId || !enteredOtp) {
                return;
            }

            sendMessageToRoom(
                String(userId),
                {
                    rideId: String(rideId),
                    captainId: String(captainId || senderCaptainId),
                    enteredOtp: String(enteredOtp),
                },
                'otpVerificationRequested'
            );
        });

        socket.on('otpVerificationResult', (data) => {
            const { rideId, captainId, isValid } = data || {};
            const senderType = socket.data?.userType;
            const senderUserId = socket.data?.userId;

            if (senderType !== 'user' || !senderUserId || !rideId || !captainId) {
                return;
            }

            sendMessageToRoom(
                String(captainId),
                {
                    rideId: String(rideId),
                    isValid: Boolean(isValid),
                    verifiedByUserId: String(senderUserId),
                },
                'otpVerificationResultForCaptain'
            );
        });

        socket.on('captainUpdateRideStatus', async (data) => {
            const { rideId, status } = data || {};
            const captainId = socket.data?.userId;
            const userType = socket.data?.userType;

            if (userType !== 'captain' || !captainId || !rideId || !status) {
                return;
            }

            const allowedStatuses = ['accepted', 'in_progress', 'completed', 'cancelled'];
            if (!allowedStatuses.includes(status)) {
                return;
            }

            try {
                if (status === 'accepted') {
                    await rideModel.updateOne(
                        {
                            _id: rideId,
                            status: 'requested',
                            $or: [
                                { captain: null },
                                { captain: captainId },
                            ],
                        },
                        {
                            status: 'accepted',
                            captain: captainId,
                        }
                    );

                    return;
                }

                if (status === 'in_progress') {
                    await rideModel.updateOne(
                        {
                            _id: rideId,
                            $or: [
                                { captain: captainId },
                                {
                                    captain: null,
                                    status: 'requested',
                                },
                            ],
                        },
                        {
                            status: 'in_progress',
                            captain: captainId,
                        }
                    );

                    return;
                }

                await rideModel.updateOne(
                    { _id: rideId, captain: captainId },
                    { status }
                );
            } catch (error) {
                console.error('Error handling captainUpdateRideStatus:', error.message);
            }
        });

        socket.on('captainIgnoreRide', async (data) => {
            const { rideId } = data || {};
            const captainId = socket.data?.userId;
            const userType = socket.data?.userType;

            if (userType !== 'captain' || !captainId || !rideId) {
                return;
            }

            try {
                await rideModel.updateOne(
                    {
                        _id: rideId,
                        status: 'requested',
                        captain: null,
                    },
                    {
                        $pull: { notifiedCaptains: captainId },
                    }
                );
            } catch (error) {
                console.error('Error handling captainIgnoreRide:', error.message);
            }
        });

    });

    return io;
}

export function sendMessageToSocket(socketId, messageObject, eventName = 'message') {
    if (!io || !socketId) {
        return;
    }

    console.log(`Emitting ${eventName} to socket ${socketId}:`, messageObject);

    io.to(socketId).emit(eventName, messageObject);
}

export function sendMessageToRoom(roomId, messageObject, eventName = 'message') {
    if (!io || !roomId) {
        return;
    }

    console.log(`Emitting ${eventName} to room ${roomId}:`, messageObject);
    io.to(String(roomId)).emit(eventName, messageObject);
}