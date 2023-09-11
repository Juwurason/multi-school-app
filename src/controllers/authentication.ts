

import { getUserByEmail, createUser } from '../db/users';

import { random, authentication } from '../helpers';

import express, { Request, Response } from 'express';
import mySchool, { ISchool } from '../db/myschools'; // Import your School model
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { serialize } from 'cookie';
import dotenv from 'dotenv';
dotenv.config();
import { isValidObjectId } from 'mongoose'
import { v4 as uuidv4 } from 'uuid';
import { admin } from '../firebaseConfig';
import * as path from 'path';


export const login = async (req: express.Request, res: express.Response) => {
    try {
      const { email, password } = req.body;
  
      // Find the user in your database based on the email
      const user = await mySchool.findOne({ email });
  
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
        { schoolId: user._id, email: user.email, name: user.name,
            address: user.address, phoneNuber: user.phoneNumber, city: user.city,
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
        name,
        email,
        password,
        // location,
        address,
        phoneNumber,
        // website,
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
      const existingSchool = await mySchool.findOne({ email });
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
      const newSchool: ISchool = new mySchool({
        name,
        email,
        password: hashedPassword, // Store the hashed password
        address,
        phoneNumber,
        city,
        state,
        role,
        school_category,
      });
  
      // Save the new school to the database
      await newSchool.save();
  
      const token = jwt.sign(
        { schoolId: newSchool._id, email: newSchool.email, name: newSchool.name,
        address: newSchool.address, phoneNuber: newSchool.phoneNumber, city: newSchool.city,
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
  
  export const getSchoolById: express.RequestHandler = async (req, res) => {
    try {
      const { id } = req.params;
  
      // Check if the provided ID is a valid ObjectId (Mongoose ObjectId)
      if (!isValidObjectId(id)) {
        return res.status(400).json({ error: 'Invalid school ID' });
      }
  
      const teacher: ISchool | null = await mySchool.findById(id);
  
      if (!teacher) {
        return res.status(404).json({ error: 'School not found' });
      }
  
      return res.status(200).json(teacher);
    } catch (error) {
      console.error('Error fetching school by schoolId:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
  
  export const updateSchoolById: express.RequestHandler = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { name, address, phoneNumber, city, state, role, school_category, website } = req.body;
      
      // Check if the provided ID is a valid ObjectId (Mongoose ObjectId)
      if (!isValidObjectId(id)) {
        return res.status(400).json({ error: 'Invalid school ID' });
      }
      
      // Find the school by ID
      const existingSchool: ISchool | null = await mySchool.findById(id);
  
      if (!existingSchool) {
        return res.status(404).json({ error: 'School not found' });
      }
  
      // Check if a school Logo is provided
      if (req.file) {
        // Delete the existing school Logo from Firebase Storage
        if (existingSchool.schoolLogoUrl) {
          const bucket = admin.storage().bucket();
          const existingFileName = existingSchool.schoolLogoUrl.split('/').pop();
          if (existingFileName) {
            const fileToDelete = bucket.file(existingFileName);
            await fileToDelete.delete();
          }
        }
  
        // Upload the new school Logo to Firebase Storage
        const file = req.file;
  
        // Generate a unique filename for the school Logo
        const fileName = `${uuidv4()}${path.extname(file.originalname)}`;
        const bucket = admin.storage().bucket();
  
        const fileUpload = bucket.file(fileName);
        const fileBuffer = file.buffer;
  
        // Upload the file to Firebase Storage
        await fileUpload.save(fileBuffer, {
          metadata: {
            contentType: file.mimetype,
          },
        });
  
        // Get the school Logo URL
        const fileUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
  
        // Update the teacher's school Logo URL in the database
        existingSchool.schoolLogoUrl = fileUrl;
      }
      // Update other teacher information
      existingSchool.name = name;
      existingSchool.address = address;
      existingSchool.phoneNumber = phoneNumber;
      existingSchool.city = city;
      existingSchool.state = state;
      existingSchool.role = role;
      existingSchool.school_category = school_category;
      existingSchool.website = website;
  
      // Save the updated school to the database
      await existingSchool.save();
  
      return res.status(200).json({ message: 'School updated successfully', updatedSchool: existingSchool });
    } catch (error) {
      console.error('Error updating school by ID:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };

