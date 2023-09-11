import express, { Request, Response } from 'express';
import mySchool, { ISchool } from '../db/myschools';
import Teacher, { ITeacher } from '../db/teacher';
import { isValidObjectId } from 'mongoose'
import shortid from 'shortid'
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { admin } from '../firebaseConfig';

function generateStaffId() {
  return `STF-${shortid.generate()}`;
}

// Update your createTeacher route
export const createTeacher: express.RequestHandler = async (req: Request, res: Response) => {
  try {
    const { name, lastName, address, phoneNumber, email, gender, teacherClass } = req.body;
    const { schoolId } = req.params;

    // Check if the school with the provided schoolId exists
    const school: ISchool | null = await mySchool.findById(schoolId);

    if (!school) {
      return res.status(404).json({ error: 'School not found' });
    }

    // Check if the email already exists in the database
    const existingTeacher: ITeacher | null = await Teacher.findOne({ email });

    if (existingTeacher) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    let fileUrl: string | undefined;

    // Check if a profile picture is provided
    if (req.file) {
      // Upload the profile picture to Firebase Storage
      const file = req.file;

      // Generate a unique filename for the profile picture
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

      // Get the profile picture URL
      fileUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
    }

    const staffId: string = generateStaffId();

    // Create a new teacher with or without the profile picture URL
    const teacherData: any = {
      name,
      lastName,
      address,
      phoneNumber,
      email,
      gender,
      teacherClass,
      school: school._id,
      staffId,
    };

    if (fileUrl) {
      teacherData.profilePictureUrl = fileUrl;
    }

    // Create the teacher object
    const teacher: ITeacher = new Teacher(teacherData);

    // Save the teacher to the database
    await teacher.save();

    return res.status(201).json({ message: 'Teacher created successfully', teacher });
  } catch (error) {
    console.error('Error creating teacher:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};


export const updateTeacherById: express.RequestHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, lastName, address, phoneNumber, gender, teacherClass } = req.body;
    
    // Check if the provided ID is a valid ObjectId (Mongoose ObjectId)
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid teacher ID' });
    }
    
    // Find the teacher by ID
    const existingTeacher: ITeacher | null = await Teacher.findById(id);

    if (!existingTeacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    // Check if a profile picture is provided
    if (req.file) {
      // Delete the existing profile picture from Firebase Storage
      if (existingTeacher.profilePictureUrl) {
        const bucket = admin.storage().bucket();
        const existingFileName = existingTeacher.profilePictureUrl.split('/').pop();
        if (existingFileName) {
          const fileToDelete = bucket.file(existingFileName);
          await fileToDelete.delete();
        }
      }

      // Upload the new profile picture to Firebase Storage
      const file = req.file;

      // Generate a unique filename for the profile picture
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

      // Get the profile picture URL
      const fileUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

      // Update the teacher's profile picture URL in the database
      existingTeacher.profilePictureUrl = fileUrl;
    }

    // Update other teacher information
    existingTeacher.name = name;
    existingTeacher.lastName = lastName;
    existingTeacher.address = address;
    existingTeacher.phoneNumber = phoneNumber;
    existingTeacher.gender = gender;
    existingTeacher.teacherClass = teacherClass;

    // Save the updated teacher to the database
    await existingTeacher.save();

    return res.status(200).json({ message: 'Profile updated successfully', updatedTeacher: existingTeacher });
  } catch (error) {
    console.error('Error updating teacher by ID:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
