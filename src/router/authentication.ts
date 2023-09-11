import express from 'express'
import { verifyEmail, confirmPassword, register } from "../controllers/authentication";

export default (router: express.Router) => {
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
