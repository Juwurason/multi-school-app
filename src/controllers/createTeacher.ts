import express, { Request, Response } from 'express';
import mySchool, { ISchool } from '../db/myschools';
import Teacher, { ITeacher } from '../db/teacher';
import { isValidObjectId } from 'mongoose'
import shortid from 'shortid'
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ref, uploadBytes, getDownloadURL, deleteObject, getMetadata } from "firebase/storage"
import {Storage, Bucket_url} from '../config/firebase';

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

    // const Bucket_url = "gs://grapple-a4d53.appspot.com"
    // Check if the email already exists in the database
    const existingTeacher: ITeacher | null = await Teacher.findOne({ email });

    if (existingTeacher) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    // const fileName = `${uuidv4()}${path.extname(file.originalname)}
    let fileUrl: string | undefined;

    if (req.file) {
      const file = req.file;
      const fileName = `${uuidv4()}${path.extname(file.originalname)}`
      const folderName = 'My-School-app'
      const bucketRef = ref(Storage, Bucket_url);
      const fileRef = ref(bucketRef, `${folderName}/${fileName}`);
      await uploadBytes(fileRef, req.file.buffer, {
        contentType: req.file.mimetype,
      });

       // Get the profile picture URL

        fileUrl = await getDownloadURL(fileRef);
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

    // Check if a new image is provided in the request
    if (req.file) {
      // Check if there is an existing profile picture
      if (existingTeacher.profilePictureUrl) {
        // Split the existing URL to get the image name
        const imageUrlParts = existingTeacher.profilePictureUrl.split('/');
        // Construct the reference to the existing image
        const fileRefToDelete = ref(Storage, existingTeacher.profilePictureUrl);
        // console.log('Attempting to delete:', fileRefToDelete.fullPath);
        try {
          const metadata = await getMetadata(fileRefToDelete);
          // console.log('Metadata of the object:', metadata);
          // Now, you can safely delete the object
          await deleteObject(fileRefToDelete);
          // console.log('Deleted successfully');
        } catch (error) {
          console.error('Error deleting existing image:', error);
          // Handle the error as needed
        }
      }
    
      // Upload the new image
      const file = req.file;
      const fileName = `${uuidv4()}${path.extname(file.originalname)}`;
      const folderName = 'My-School-app';
      const bucketRef = ref(Storage, Bucket_url);
      const fileRef = ref(bucketRef, `${folderName}/${fileName}`);
      await uploadBytes(fileRef, req.file.buffer, {
        contentType: req.file.mimetype,
      });
    
      // Update the profile picture URL with the URL of the new image
      const fileUrl = await getDownloadURL(fileRef);
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
