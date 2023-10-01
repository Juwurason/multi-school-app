import express from 'express'
import { Request, Response, NextFunction } from 'express';
import { resendOTP, verifyOTP } from '../helpers/send-otp';
import { verifyEmail, confirmPassword, register } from "../controllers/authentication";

export default (router: express.Router) => {
    router.post("/verify-otp", (req: Request, res: Response, next: NextFunction) => {
        verifyOTP(req, res, next); // Call the verifyOTP function with all three parameters
    });

    router.post("/resend-otp", (req: Request, res: Response) => {
        resendOTP(req, res); // Call the resendOTP function
    });

    router.post("/auth/register", (req, res) => {
        // console.log("Request body:", req.body); // Log the request body
        register(req, res); // Call the register function
    });


    router.post('/auth/confirm_email', (req, res) => {
        // console.log("Request body:", req.body);
        verifyEmail(req, res);
    });

    router.post('/auth/confirm_password', (req, res) => {
        // console.log("Request body:", req.body);
        confirmPassword(req, res);
    });
}; 
