import captainModel from "../models/captain.model.js";
import { createCaptain } from "../services/captain.service.js";
import { validationResult } from 'express-validator';

export async function registerCaptain(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { fullname, email, password, vehicle } = req.body;

    if (!fullname?.firstname || !fullname?.lastname || !email || !password || !vehicle?.color || !vehicle?.vehicleType || !vehicle?.vehiclePlate || !vehicle?.capacity) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const isCaptainExist = await captainModel.findOne({ email });
    if (isCaptainExist) {
        return res.status(400).json({ error: 'Captain with this email already exists' });
    }

    const hashPassword = await captainModel.hashPassword(password);
    const  token = captainModel.generateAuthToken();

    const captain = await createCaptain({ 
        firstname:fullname.firstname, 
        lastname:fullname.lastname,
        email,
        password:hashPassword,
        color:vehicle.color,
        vehicleType:vehicle.vehicleType,
        vehiclePlate:vehicle.vehiclePlate,
        capacity:vehicle.capacity
    });
    return res.status(201).json({ message: 'Captain registered successfully', captain, token });
}

const captainController = {
    registerCaptain,
};

export default captainController;