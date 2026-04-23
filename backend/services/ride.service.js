import rideModel from "../models/ride.model.js";
import { getDistanceAndTime } from "./maps.service.js";
import { randomInt } from "crypto";

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

const toCoordinatePair = (latValue, lngValue) => {
    const lat = Number(latValue);
    const lng = Number(lngValue);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        return null;
    }

    return { lat, lng };
};

export async function getfare(pickup, destination, pickupLat, pickupLng, destLat, destLng) {
    if(pickup && destination) {
        const baseFares = { car: 40, auto: 25, bike: 15 };
        const perMinuteRates = { car: 0.8, auto: 0.5, bike: 0.25 };
        let distance = null;
        let duration = null;

        try {
            const originObj = (pickupLat && pickupLng) ? { lat: pickupLat, lng: pickupLng } : pickup;
            const destObj = (destLat && destLng) ? { lat: destLat, lng: destLng } : destination;
            const distanceAndDuration = await getDistanceAndTime(originObj, destObj);
            distance = distanceAndDuration?.distance || null;
            duration = distanceAndDuration?.duration || null;
        } catch (error) {
            console.error('Fare calculation failed because distance lookup failed:', error.message);
            throw new Error('Unable to calculate fare from route data');
        }

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

export async function createRide({
    origin,
    destination,
    userId,
    vehicleType,
    fare,
    pickupLat,
    pickupLng,
    destLat,
    destLng,
    pickupCoordinates,
    destinationCoordinates,
}) {
    if (!origin || !destination || !userId || !vehicleType) {
        throw new Error('All fields are required');
    }

    const allowedVehicleTypes = ['car', 'auto', 'bike'];
    if (!allowedVehicleTypes.includes(vehicleType)) {
        throw new Error('Invalid vehicle type');
    }

    const baseFares = { car: 40, auto: 25, bike: 15 };
    let resolvedFare = Number(fare);

    if (!Number.isFinite(resolvedFare) || resolvedFare <= 0) {
        try {
            const calculatedFare = await getfare(origin, destination);
            resolvedFare = Number(calculatedFare?.[vehicleType]);
        } catch {
            resolvedFare = baseFares[vehicleType];
        }
    }

    if (!Number.isFinite(resolvedFare) || resolvedFare <= 0) {
        throw new Error('Unable to determine fare for this ride');
    }

    const resolvedPickupCoordinates = normalizeCoordinates(pickupCoordinates)
        || toCoordinatePair(pickupLat, pickupLng);
    const resolvedDestinationCoordinates = normalizeCoordinates(destinationCoordinates)
        || toCoordinatePair(destLat, destLng);

    const ride = await rideModel.create({
        origin,
        destination,
        pickupCoordinates: resolvedPickupCoordinates || undefined,
        destinationCoordinates: resolvedDestinationCoordinates || undefined,
        user: userId,
        fare: Math.round(resolvedFare),
        otp: getotp(6),
    });
    return ride;
}

