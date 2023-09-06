import express from 'express'


import { login, register } from "../controllers/authentication";

export default (router: express.Router) => {
    router.post("/auth/register", (req, res) => {
        console.log("Request body:", req.body); // Log the request body
        register(req, res); // Call the register function
    });

    router.post('/auth/login', (req, res) =>{
        console.log("Request body:", req.body);
        login(req, res)
    })
}; 
