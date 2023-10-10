import axios from 'axios';
import mySchool, { ISchool } from '../db/myschools';
import express, { Request, Response } from 'express';
import moment from 'moment'
import Teacher from '../db/teacher';

export async function sendVerificationEmail(email: string, otp: string): Promise<void> {
  try {

    const name: string = 'MySchoolApp';
    const subject: string = 'Email Verification';
    const message: string = `Here Is Your One Time Password(OTP) to Validate your Email Address ${otp}`;

    const response = await axios.post('https://techxmail.onrender.com/sendmail', {
      name: name,
      mail: email,
      subject: subject,
      text: message
    });

    if (response.status === 200) {
      console.log('Message sent successfully');
    } else {
      console.error('Failed to send message');
    }
  } catch (error) {
    console.error('Error sending message:', error);
  }
}
// Import your Teacher model or whichever model you are using

export const verifyOTP: express.RequestHandler = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    // Find the user by email
    const user = await mySchool.findOne({ email }) || await Teacher.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the provided OTP matches the stored OTP
    if (user.otp !== otp) {
      return res.status(401).json({ message: 'Invalid OTP' });
    }

    // Check if the OTP is expired (you can store an expiration timestamp in your model)
    const currentTimestamp = Date.now();
    if (user.otpExpiration && currentTimestamp > user.otpExpiration.getTime()) {
      return res.status(401).json({ message: 'OTP has expired' });
    }
    user.isEmailVerified = true
    // If OTP is valid and not expired, mark email as verified or perform necessary actions
    // For example: user.isEmailVerified = true;
    // You can update the user object and save it back to the database

    // Save the updated user object (this depends on your schema)
    await user.save();

    return res.status(200).json({ message: 'OTP verified successfully' });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Function to generate a random OTP
const generateOTP = (): string => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP
  return otp;
};


export const resendOTP = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    // Find the user in your database based on the email (assuming you have a User model)
    const user = await mySchool.findOne({ email }) || await Teacher.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Generate a new OTP and update the expiration time
    const newOTP = Math.floor(100000 + Math.random() * 900000).toString();
    const newOTPExpiration = moment().add(5, 'minutes'); // Set the expiration time (5 minutes in this example)

    // Update user's OTP and OTP expiration in the database
    user.otp = newOTP;
    user.otpExpiration = newOTPExpiration.toDate();
    await user.save();

    // Send the new OTP via email
    await sendVerificationEmail(email, newOTP);

    return res.status(200).json({ message: 'New OTP sent successfully.' });
  } catch (error) {
    console.error('Error during OTP resend:', error);
    return res.status(500).json({ message: 'An error occurred while resending OTP.' });
  }
};


