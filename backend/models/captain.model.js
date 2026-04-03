import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const captainSchema = new mongoose.Schema({
    fullname:{
        firstname: { 
            type: String,
            required: true ,
            minlength: [3, "First name must be at least 3 characters long"],
        },
        lastname: {
            type: String,
            required: true ,    
            minlength: [3, "Last name must be at least 3 characters long"],
        },
    },
    email: {
        type: String,
        required: true,
        unique: true,
        minlength: [5, "Email must be at least 5 characters long"],
    },
    password: {
        type: String,
        required: true,
        select: false,
        minlength: [6, "Password must be at least 6 characters long"],
    },
    socketId: {
        type: String,
        default: null,
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'inactive',
    },
    vehicle: {
        color: {
            type: String,
            required: true,
        },
        vehicleType: {
            type: String,
            required: true,
            enum: ['car', 'bike', 'auto'],
        },
        vehiclePlate: {
            type: String,
            required: true,
            unique: true,
        },
        capacity: {
            type: Number,
            min: [1, "Capacity must be at least 1"],
        },
    },
    location: {
        latitude: {
            type: Number,
            required: false,
        },
        longitude: {
            type: Number,
            required: false,
        },
    },
}, { timestamps: true });

captainSchema.methods.generateAuthToken = function() {
    const token = jwt.sign({ _id: this._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    return token;
};

captainSchema.statics.hashPassword = async function(password) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};

captainSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

const captainModel = mongoose.model('captain', captainSchema);
export default captainModel;