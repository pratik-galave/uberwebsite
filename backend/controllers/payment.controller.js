import crypto from "crypto";
import razorpayInstance from "../razorpay/razorpay.js";
import rideModel from "../models/ride.model.js";

/**
 * POST /payment/create-order
 * Creates a Razorpay order for a given ride.
 * Body: { rideId }
 * Amount is fetched from the database — never trust the client.
 */
export const createOrder = async (req, res) => {
    try {
        const { rideId } = req.body;

        if (!rideId) {
            return res.status(400).json({ error: "Ride ID is required" });
        }

        // Fetch fare from the database — never trust client-sent amount
        const ride = await rideModel.findById(rideId);
        if (!ride) {
            return res.status(404).json({ error: "Ride not found" });
        }

        if (!ride.fare || ride.fare <= 0) {
            return res.status(400).json({ error: "Invalid fare for this ride" });
        }

        // Ensure only the ride's own user can pay
        if (String(ride.user) !== String(req.user._id)) {
            return res.status(403).json({ error: "You are not authorized to pay for this ride" });
        }

        const options = {
            amount: Math.round(ride.fare * 100), // Razorpay expects paise
            currency: "INR",
            receipt: rideId,
            notes: {
                rideId: rideId,
            },
        };

        const order = await razorpayInstance().orders.create(options);

        // Save the Razorpay orderId to the ride document
        if (rideId) {
            await rideModel.findByIdAndUpdate(rideId, { orderId: order.id });
        }

        res.status(200).json({
            success: true,
            order,
            key: process.env.RAZORPAY_KEY_ID, // frontend needs this to open checkout
        });
    } catch (error) {
        console.error("Error creating Razorpay order:", error.message);
        res.status(500).json({ error: error.message || "Failed to create order" });
    }
};

/**
 * POST /payment/verify
 * Verifies the Razorpay payment signature using HMAC SHA256.
 * Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature, rideId }
 */
export const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, rideId } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ error: "Missing payment verification fields" });
        }

        // Generate expected signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest("hex");

        const isValid = expectedSignature === razorpay_signature;

        if (!isValid) {
            return res.status(400).json({ success: false, error: "Payment verification failed. Invalid signature." });
        }

        // Update ride with payment details
        if (rideId) {
            await rideModel.findByIdAndUpdate(rideId, {
                paymentId: razorpay_payment_id,
                orderId: razorpay_order_id,
                signature: razorpay_signature,
            });
        }

        res.status(200).json({
            success: true,
            message: "Payment verified successfully",
            paymentId: razorpay_payment_id,
        });
    } catch (error) {
        console.error("Error verifying payment:", error.message);
        res.status(500).json({ error: error.message || "Payment verification failed" });
    }
};