import express from  "express";
import http from "http";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import compression from "compression";
import mongoose from "mongoose"
import cors from "cors"
import passport from 'passport'

import router from "./router"

const app = express()

app.use(cors({
    credentials: true,
}))

app.use(compression())
app.use(cookieParser())
app.use(bodyParser.json())
app.use(passport.initialize());


const server = http.createServer(app)

server.listen(8080, ()=>{
    console.log("server running on http://localhost:8080/");
    
})

const MONGO_URL = "mongodb+srv://sunday:ajibolason@sunday.ssmpiyu.mongodb.net/schools?retryWrites=true&w=majority"
// "mongodb+srv://sunday:<password>@sunday.ssmpiyu.mongodb.net/?retryWrites=true&w=majority"

mongoose.Promise = Promise
mongoose.connect(MONGO_URL)
mongoose.connection.on('error', (error: Error) => (error));
    
app.use('/', router())