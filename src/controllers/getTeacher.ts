// Import necessary modules and models
import express from 'express';
import Teacher, { ITeacher } from '../db/teacher'; // Import the Teacher model
import mySchool, { ISchool } from '../db/myschools'; // Import the School model
import { isValidObjectId } from 'mongoose'
import { Storage } from '@google-cloud/storage';

import * as path from 'path';

// const serviceAccountPath = path.join(__dirname, 'school-app-62650-firebase-adminsdk-d2vuw-226f2decbc.json');

const storage = new Storage({
  keyFilename: path.join(__dirname, 'school-app-62650-firebase-adminsdk-d2vuw-226f2decbc.json'),
});


async function getSignedUrl(bucketName: string, filename: string): Promise<string | null> {
  try {
    const options: {
      version: 'v4'; // Use version 4 of the signed URL
      action: 'read'; // Specify the action as 'read'
      expires: number;
    } = {
      version: 'v4',
      action: 'read',
      expires: Date.now() + 15 * 60 * 1000, // Expiration time (15 minutes)
    };

    const [url] = await storage.bucket(bucketName).file(filename).getSignedUrl(options);
    return url;
  } catch (error) {
    console.error('Error generating signed URL:', error);
    return null;
  }
}

export const getTeachersById: express.RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the provided ID is a valid ObjectId (Mongoose ObjectId)
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid teacher ID' });
    }

    const teacher: ITeacher | null = await Teacher.findById(id);

    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    //  // Generate a signed URL for the teacher's image
    //  const imageUrl = await getSignedUrl('school-app-62650.appspot.com', teacher.profilePictureUrl);

    //  if (imageUrl) {
    //   // Add the image URL to the teacher object
    //   teacher.profilePictureUrl = imageUrl;
    // }

    return res.status(200).json(teacher);
  } catch (error) {
    console.error('Error fetching teachers by schoolId:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTeachersBySchoolId: express.RequestHandler = async (req, res) => {
  try {
    const { schoolId } = req.params;

    // Check if the school with the provided schoolId exists
    const school = await mySchool.findById(schoolId);

    if (!school) {
      return res.status(404).json({ error: 'School not found' });
    }

    // Fetch teachers associated with the school
    const teachers = await Teacher.find({ school: school._id });

    return res.status(200).json(teachers);
  } catch (error) {
    console.error('Error fetching teachers by schoolId:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteTeacherById: express.RequestHandler = async (req, res) => {
    try {
    const { id } = req.params;

    // Check if the provided ID is a valid ObjectId (Mongoose ObjectId)
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid teacher ID' });
    }

    // Find the teacher by ID and delete it
    const deletedTeacher: ITeacher | null = await Teacher.findByIdAndRemove(id);

    if (!deletedTeacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    return res.status(200).json({ message: 'Teacher deleted successfully' });
  } catch (error) {
    console.error('Error deleting teacher by ID:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

