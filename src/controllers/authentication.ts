

import { getUserByEmail, createUser } from '../db/users';

import { random, authentication } from '../helpers';

import express, { Request, Response } from 'express';
import School, { ISchool } from '../db/school'; // Import your School model
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { serialize } from 'cookie';
import dotenv from 'dotenv';
dotenv.config();
// import { sendOtpEmail } from '../helpers/send-otp';



export const login = async (req: express.Request, res: express.Response) => {
    try {
      const { email, password } = req.body;
  
      // Find the user in your database based on the email
      const user = await School.findOne({ email });
  
      if (!user) {
        return res.status(401).json({ message: 'Invalid email.' });
      }
  
      // Check if the password matches
      const passwordMatch = await bcrypt.compare(password, user.password);
  
      if (!passwordMatch) {
        return res.status(401).json({ message: 'Invalid password.' });
      }
  
      // Generate a JWT token
      const token = jwt.sign(
        { schoolId: user._id, email: user.email, name: user.name, location: user.location,
            address: user.address, phoneNuber: user.phoneNumber, website: user.website, city: user.city,
            state: user.state, role: user.role, category: user.school_category
        },
        "mongodb//sunday:ajibolason@sund",
        {
          expiresIn: '1h', // Token expiration time
        }
      );
  
      // Send the token as an HTTP-only cookie
      res.cookie('token', token, {
        httpOnly: true,
        maxAge: 60 * 60 * 1000, // 1 hour in milliseconds
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      });
      res.status(200).json({ message: 'Login successful.', token});
    } catch (error) {
      console.error('Error during login:', error);
      res.status(500).json({ message: 'An error occurred during login.' });
    }
  }

  // function generateOTP(): string {
  //   const otp = Math.floor(100000 + Math.random() * 900000).toString();
  //   return otp;
  // }
  
export const register = async (req: Request, res: Response) => {
    try {
      // Extract user registration data from the request body
      const {
        // schoolCode,
        name,
        email,
        password,
        location,
        address,
        phoneNumber,
        website,
        city,
        state,
        role,
        school_category,
      } = req.body;

       // Check if any required field is missing
    const requiredFields = ['name', 'email', 'password', 'role']; // Add other required field names
    const missingFields = requiredFields.filter(field => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({ message: `Missing required fields: ${missingFields.join(', ')}` });
    }
  
      // Check if a school with the same email already exists
      const existingSchool = await School.findOne({ email });
      if (existingSchool) {
        return res.status(400).json({ message: 'School with this email already exists.' });
      }

    //    // Generate OTP
    // const otp = generateOTP();

    // // Send OTP email
    // await sendOtpEmail(email, otp);
  
      // Hash the password before storing it in the database
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Create a new school document
      const newSchool: ISchool = new School({
        // schoolCode,
        name,
        email,
        password: hashedPassword, // Store the hashed password
        location,
        address,
        phoneNumber,
        website,
        city,
        state,
        role,
        school_category,
      });
  
      // Save the new school to the database
      await newSchool.save();
  
      const token = jwt.sign(
        { schoolId: newSchool._id, email: newSchool.email, name: newSchool.name, location: newSchool.location,
        address: newSchool.address, phoneNuber: newSchool.phoneNumber, website: newSchool.website, city: newSchool.city,
        state: newSchool.state, role: newSchool.role, category: newSchool.school_category
        },
        "mongodb//sunday:ajibolason@sund", // Replace with your actual secret key
        { expiresIn: '1h' } // Set an expiration time for the token
      );

       // Serialize the token as a cookie
    const serializedToken = serialize('token', token, {
        httpOnly: true, // Make the cookie accessible only through HTTP
        maxAge: 60 * 60 * 1000, // Set an expiration time for the cookie (1 hour)
        sameSite: 'lax', // Adjust this as needed
        secure: process.env.NODE_ENV === 'production', // Set to true in a production environment with HTTPS
      });
      
      // Set the cookie in the response
      res.setHeader('Set-Cookie', serializedToken);
  
      res.status(201).json({ message: 'School registration successful.', token });
    } catch (error) {
      console.error('Error during school registration:', error);
      res.status(500).json({ message: 'An error occurred during registration.' });
    }
  }
  


