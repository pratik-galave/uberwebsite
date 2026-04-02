import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
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
}, { timestamps: true });

userSchema.methods.generateAuthToken = function() {
    const token = jwt.sign({ _id: this._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    return token;
};

userSchema.statics.hashPassword=    async function(password) {  
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};

userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

const userModel = mongoose.model('user', userSchema);
export default userModel;
