import  express from 'express';
const router = express.Router();
import  {body} from 'express-validator';
import userController from "../controllers/user.controller.js";

router.post('/register', [
    body('firstname').isLength({ min: 3 }).withMessage('First name must be at least 3 characters long'),
    body('email').isEmail().withMessage('Invalid email format'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
],userController.registerUser);

export default router;