import express from "express";
import { createOrder, verifyPayment } from "../controllers/payment.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

// Create a Razorpay order
router.post("/create-order", authMiddleware.authUser, createOrder);

// Verify payment after Razorpay checkout
router.post("/verify", authMiddleware.authUser, verifyPayment);

export default router;
