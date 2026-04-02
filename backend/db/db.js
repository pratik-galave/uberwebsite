import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
        const dbName = process.env.MONGO_DB_NAME || "uber";

        if (!mongoUri) {
            throw new Error("Missing MONGO_URI or MONGODB_URI in environment");
        }

        await mongoose.connect(mongoUri, { dbName });
        console.log(`MongoDB connected successfully (db: ${dbName})`);
    } catch (error) {
        console.error("MongoDB connection error:", error);
        process.exit(1); // Exit process with failure
    }   
};

export default connectDB;