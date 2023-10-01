import axios from 'axios';
import mySchool, { ISchool } from '../db/myschools';
import express, { Request, Response } from 'express';
import moment from 'moment'

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
    const user = await mySchool.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if the provided OTP matches the stored OTP
    if (user.otp !== otp) {
      return res.status(401).json({ error: 'Invalid OTP' });
    }

    // Check if the OTP is expired (you can store an expiration timestamp in your model)
    const currentTimestamp = Date.now();
    if (user.otpExpiration && currentTimestamp > user.otpExpiration.getTime()) {
      return res.status(401).json({ error: 'OTP has expired' });
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
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Function to generate a random OTP
const generateOTP = (): string => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP
  return otp;
};

interface User {
  email: string;
  otp: string;
  otpExpiration: Date;
}

const users: { [key: string]: User } = {}; // Simulated database for storing users and their OTPs
const fetchUsersFromDatabase = async () => {
  try {
    // Fetch teacher data from the database
    const school: ISchool[] = await mySchool.find();

    // Populate the users object using teacher emails as keys
    school.forEach((school: ISchool) => {
      // Generate an initial OTP for each school (optional)
      const initialOTP = generateOTP(); // Assuming you have a generateOTP function

      // Set the OTP expiration time (e.g., 10 minutes from now)
      const otpExpiration = new Date();
      otpExpiration.setMinutes(otpExpiration.getMinutes() + 10);

      // Add the school to the users object
      users[school.email] = {
        email: school.email,
        otp: initialOTP, // You can use the initial OTP or generate a new one here
        otpExpiration,
      };

      // Optionally, send the initial OTP to the school's email
      // sendVerificationEmail(school.email, initialOTP);
    });

    // console.log('Users fetched and stored in the users object:', users);
  } catch (error) {
    console.error('Error fetching users:', error);
  }
};

// Example usage: Fetch users from the database and populate the users object
fetchUsersFromDatabase();

export const resendOTP = (req: Request, res: Response) => {
  const { email } = req.body;

  // Check if the user exists in your database (simulated by users object)
  if (users[email]) {
    const { otp, otpExpiration } = users[email];

    // Check if the existing OTP is expired
    if (moment()>(moment(otpExpiration))) {
      // Generate a new OTP and update the expiration time
      const newOTP = Math.floor(100000 + Math.random() * 900000).toString();
      const newOTPExpiration = moment().add(5, 'minutes'); // Set the expiration time (5 minutes in this example)

      // Update user's OTP and OTP expiration in the database
      users[email].otp = newOTP;
      users[email].otpExpiration = newOTPExpiration.toDate();

      // Send the new OTP via email
      sendVerificationEmail(email, newOTP);

      return res.status(200).json({ message: 'New OTP sent successfully.' });
    } else {
      // OTP is still valid, resend the existing OTP
      sendVerificationEmail(email, otp);

      return res.status(200).json({ message: 'Existing OTP resent successfully.' });
    }
  } else {
    // User not found in the database
    return res.status(404).json({ message: 'User not found.' });
  }
};

// export async function getOTP(Email) {
//   try {
//     
//     const { Token, TokenExpired } = rows[0];
//       let token = Token
//     let now = new Date();
//     const expiry = new Date(TokenExpired);
//     console.log(now, expiry);
//     if (now > expiry) {
//       await resendOTP(Email)
//       return { error: 'OTP has expired. A new OTP has been sent to your registered email address.' };
//     } else{
//       await sendVerificationEmail(Email, token)
//       return token;
//     }
    
//   } catch (error) {
//     console.error('Error while getting OTP:', error);
//     throw error;
//   }
// }


// app.post("/resend-otp", async (req, res) =>{
//     const {Email} = req.body
//     try {
//           const  token = await getOTP(Email)
//        if (token.error) {
//         return res.status(400).json({ error: token.error });
//        }
//        res.json({ message: 'OTP resend successfully', token: token });
//     } catch (error) {
//       res.status(500).json({ message: 'Error resending OTP' });
//     }
// })