import mongoose from "mongoose";

const rideSchema = new mongoose.Schema({
    origin: {
        type: String,
        required: true
    },
    destination: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    captain: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'captain'
    },
    notifiedCaptains: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'captain',
        default: []
    },
    fare: { 
        type: Number,
        required: true
    },
    distanceText: {
        type: String
    },
    durationText: {
        type: String
    },
    status: {
        type: String,
        enum: ['requested', 'accepted', 'in_progress', 'completed', 'cancelled'],
        default: 'requested'
    },
    duration: {
        type: Number
    },
    distance: {
        type: Number
    },
    paymentId: {
        type: String
    },
    orderId: {
        type: String
    },
    signature: {    
        type: String
    },
    otp: {
        type: String,
        select: false,
        required: true
    }
}, { timestamps: true });

export default mongoose.model('ride', rideSchema);