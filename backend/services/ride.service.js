import rideModel from "../models/ride.model.js";
import { getDistanceAndTime } from "./maps.service.js";
import { randomInt } from "crypto";

export async function getfare(pickup,destination) {
    if(pickup && destination) {
        const baseFares = { car: 40, auto: 25, bike: 15 };
        const perMinuteRates = { car: 0.8, auto: 0.5, bike: 0.25 };
        const { distance, duration } = await getDistanceAndTime(pickup, destination);
        const perKmRates = { car: 9, auto: 6, bike: 4 };
        const distanceInKm = (distance?.value || 0) / 1000;
        const durationInMinutes = (duration?.value || 0) / 60;
        const longTripDiscount = distanceInKm > 50 ? 0.9 : 1;

        const calculateFare = (vehicleType) => {
            const rawFare = baseFares[vehicleType]
                + (distanceInKm * perKmRates[vehicleType])
                + (durationInMinutes * perMinuteRates[vehicleType]);

            return Math.max(Math.round(rawFare * longTripDiscount), baseFares[vehicleType]);
        };

        
        return {
            car: calculateFare('car'),
            auto: calculateFare('auto'),
            bike: calculateFare('bike')
        };
    } else {
        throw new Error('Pickup and destination are required to calculate fare');
    }
}

function getotp(num) {
    if (!Number.isInteger(num) || num < 1) {
        throw new Error('num must be a positive integer');
    }

    const otpDigits = [];

    for (let index = 0; index < num; index += 1) {
        if (index === 0 && num > 1) {
            otpDigits.push(randomInt(1, 10));
        } else {
            otpDigits.push(randomInt(0, 10));
        }
    }

    const otp = otpDigits.join('');
    return otp;
}

export async function createRide({ origin, destination, userId, vehicleType }) {
    if (!origin || !destination || !userId || !vehicleType) {
        throw new Error('All fields are required');
    }
    const fare = await getfare(origin, destination);
    const ride = await rideModel.create({ origin, destination, user: userId, fare: fare[vehicleType], otp: getotp(6) });
    return ride;
}

