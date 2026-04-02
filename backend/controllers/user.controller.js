import userModel from "../models/user.model.js";
import { createUser } from "../services/user.service.js";
import { validationResult } from 'express-validator';

export async function registerUser(req, res ,next) {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { firstname, lastname, email, password } = req.body;

    const hashPassword = await userModel.hashPassword(password); 

    try {
        const user = await createUser({ firstname, lastname, email, password: hashPassword });

        const token = user.generateAuthToken();
        res.status(201).json({ message: 'User registered successfully', user, token });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }   
}

const userController = {
    registerUser,
};

export default userController;
