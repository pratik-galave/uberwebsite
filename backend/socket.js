import { Server } from 'socket.io';
import userModel from './models/user.model.js';
import captainModel from './models/captain.model.js';
import rideModel from './models/ride.model.js';

let io = null;
const PENDING_RIDE_REPLAY_WINDOW_MS = 2 * 60 * 1000;

function getParticipantId(participant) {
    if (!participant) {
        return null;
    }

    return String(participant._id || participant);
}

function emitRideStatusUpdate(ride, updatedByType, updatedById) {
    const payload = {
        rideId: String(ride._id),
        status: ride.status,
        updatedByType,
        updatedById: String(updatedById),
        origin: ride.origin,
        destination: ride.destination,
        distanceText: ride.distanceText || '',
        durationText: ride.durationText || '',
    };

    const recipientIds = [getParticipantId(ride.user), getParticipantId(ride.captain)].filter(Boolean);
    const uniqueRecipientIds = [...new Set(recipientIds)];

    uniqueRecipientIds.forEach((recipientId) => {
        sendMessageToRoom(recipientId, payload, 'rideStatusUpdated');
    });
}

async function replayPendingRidesForCaptain(captainId, socketId) {
    if (!captainId || !socketId) {
        return;
    }

    const replayCutoff = new Date(Date.now() - PENDING_RIDE_REPLAY_WINDOW_MS);

    const pendingRides = await rideModel.find({
        status: 'requested',
        notifiedCaptains: captainId,
        captain: null,
        createdAt: { $gte: replayCutoff },
    })
        .populate('user', 'fullname email')
        .sort({ createdAt: 1 })
        .limit(50);

    pendingRides.forEach((ride) => {
        const payload = {
            rideId: String(ride._id),
            origin: ride.origin,
            destination: ride.destination,
            fare: ride.fare,
            distanceText: ride.distanceText,
            durationText: ride.durationText,
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
            origin: '*',
            methods: ['GET', 'POST']
        }
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
                        { new: true }
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
                        { new: true }
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
                    { new: true }
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
                const ride = await rideModel.findById(rideId).select('+otp user');

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
            const actorId = data?.actorId || socket.data?.userId;
            const actorType = data?.actorType || socket.data?.userType;

            if (!['captain', 'user'].includes(actorType) || !actorId || !rideId || !status) {
                return;
            }

            const allowedStatuses = ['accepted', 'in_progress', 'completed'];
            if (!allowedStatuses.includes(status)) {
                return;
            }

            try {
                const ride = await rideModel.findById(rideId).select('user captain status origin destination distanceText durationText');

                if (!ride) {
                    return;
                }

                const rideUserId = getParticipantId(ride.user);
                const rideCaptainId = getParticipantId(ride.captain);
                const actorMatchesRide = (actorType === 'user' && rideUserId === String(actorId))
                    || (actorType === 'captain' && rideCaptainId === String(actorId));

                if (!actorMatchesRide) {
                    return;
                }

                if (status === 'accepted') {
                    if (actorType !== 'captain') {
                        return;
                    }

                    const updatedRide = await rideModel.findOneAndUpdate(
                        {
                            _id: rideId,
                            status: { $in: ['requested', 'accepted'] },
                            $or: [
                                { captain: null },
                                { captain: actorId },
                            ],
                        },
                        {
                            status: 'accepted',
                            captain: actorId,
                        },
                        { new: true }
                    );

                    if (updatedRide) {
                        emitRideStatusUpdate(updatedRide, actorType, actorId);
                    }

                    return;
                }

                if (status === 'in_progress') {
                    if (!['accepted', 'in_progress'].includes(ride.status)) {
                        return;
                    }

                    const updatedRide = await rideModel.findOneAndUpdate(
                        {
                            _id: rideId,
                            status: { $in: ['accepted', 'in_progress'] },
                            $or: [
                                { captain: actorId },
                                { user: actorId },
                            ],
                        },
                        { status: 'in_progress' },
                        { new: true }
                    );

                    if (updatedRide) {
                        emitRideStatusUpdate(updatedRide, actorType, actorId);
                    }

                    return;
                }

                if (!['in_progress', 'completed'].includes(ride.status)) {
                    return;
                }

                const updatedRide = await rideModel.findOneAndUpdate(
                    {
                        _id: rideId,
                        status: { $in: ['in_progress', 'completed'] },
                        $or: [
                            { captain: actorId },
                            { user: actorId },
                        ],
                    },
                    { status: 'completed' },
                    { new: true }
                );

                if (updatedRide) {
                    emitRideStatusUpdate(updatedRide, actorType, actorId);
                }
            } catch (error) {
                console.error('Error handling captainUpdateRideStatus:', error.message);
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