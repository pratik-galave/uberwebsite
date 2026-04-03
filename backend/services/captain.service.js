import captainModel from "../models/captain.model.js";
export async function createCaptain({ firstname, lastname, email, password,color, vehicleType, vehiclePlate, capacity }) {

    if(!firstname || !email || !password || !color || !vehicleType || !vehiclePlate || !capacity) {
        throw new Error('All fields are required');
    }

    const captain = await captainModel.create({ 
        fullname: { 
            firstname, 
            lastname 
        }, 
        email, 
        password, 
        vehicle: { 
            color, 
            vehicleType, 
            vehiclePlate, 
            capacity 
        } 
    });
    return captain;

}