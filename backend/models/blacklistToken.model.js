import mongoose from "mongoose";

const blacklistTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: Date.now()+24*60*60*1000, // Default to 1 day from now
    },
}, { timestamps: true });

export default mongoose.model('blacklistToken', blacklistTokenSchema);