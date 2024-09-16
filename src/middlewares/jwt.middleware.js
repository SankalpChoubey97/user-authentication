import jwt from 'jsonwebtoken';
import { ApplicationError } from '../error-handler/applicationError.js';

const jwtAuth = (req, res, next) => {
    // Read the token from the Authorization header
    const token = req.headers['authorization'];

    console.log('Token received in middleware:', token);

    if (!token) {
        const error = 'Please login to view this page';
        console.log(error);
        return res.json({message:"failure",error});
    }

    try {
        // Verify the token
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Payload:', payload);
        req.email=payload.email;
        console.log("email",req.email);
        next();
    } catch (err) {
        console.error('Error verifying token:', err);
        throw new ApplicationError('Authorization failure, please signin again', 404);
    }
};

export default jwtAuth;
