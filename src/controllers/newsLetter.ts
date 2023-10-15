import Letter, { ILetter } from '../db/newsletter'
import express, { Request, Response } from 'express';
import mySchool, { ISchool } from '../db/myschools';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ref, uploadBytes, getDownloadURL, deleteObject, getMetadata } from "firebase/storage"
import {Storage, Bucket_url} from '../config/firebase';
import SchoolClass from '../db/schoolClass';
import Student from '../db/student';
import axios from 'axios';
import { isValidObjectId } from 'mongoose'

export const newsLetter: express.RequestHandler = async (req: Request, res: Response) => {

    try {
        const { subject, content } = req.body
        const { schoolId } = req.params;

    // Check if the school with the provided schoolId exists
    const school: ISchool | null = await mySchool.findById(schoolId);

    if (!school) {
      return res.status(404).json({ error: 'School not found' });
    }

    let fileUrl: string | undefined;

    // Check if a news Letter is provided
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

      const newsLetterData: any = {
        subject,
        content,
        school: school._id,
      };

      if (fileUrl) {
        newsLetterData.newsLetterUrl = fileUrl;
      }

      // Create the letter object
    const newsLetter: ILetter = new Letter(newsLetterData);

    // Save the letter to the database
    await newsLetter.save();
    return res.status(201).json({ message: 'NewsLetter created successfully', newsLetter });

    } catch (error) {
        console.error('Error creating newsLetter:', error);
    return res.status(500).json({ error: 'Internal server error' });
    }
    
}

export const updateNewsLetterById: express.RequestHandler = async (req: Request, res: Response) => {
  try {
    // const { id } = req.params;
    // const { name, lastName, address, phoneNumber, gender, role, teacherClass } = req.body;
    const { subject, content } = req.body
        const { id } = req.params;

    // Check if the provided ID is a valid ObjectId (Mongoose ObjectId)
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    // Find the teacher by ID
    const existingLetter: ILetter | null = await Letter.findById(id);

    if (!existingLetter) {
      return res.status(404).json({ error: 'Letter not found' });
    }

    // Check if a new image is provided in the request
    if (req.file) {
      // Check if there is an existing profile picture
      if (existingLetter.newsLetterUrl) {
        // Split the existing URL to get the image name
        const imageUrlParts = existingLetter.newsLetterUrl.split('/');
        // Construct the reference to the existing image
        const fileRefToDelete = ref(Storage, existingLetter.newsLetterUrl);
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
      existingLetter.newsLetterUrl = fileUrl;
    }

    // Update other teacher information
    existingLetter.subject = subject;
    existingLetter.content = content;

    // Save the updated teacher to the database
    await existingLetter.save();

    return res.status(200).json({ message: 'Letter updated successfully', updatedLetter: existingLetter });
  } catch (error) {
    console.error('Error updating letter by ID:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getLetterBySchoolId: express.RequestHandler = async (req, res) => {
    try {
      const { schoolId } = req.params;
  
      // Check if the school with the provided schoolId exists
      const school = await mySchool.findById(schoolId);
  
      if (!school) {
        return res.status(404).json({ error: 'School not found' });
      }
  
      
      const newsLetter = await Letter.find({ school: school._id });
  
      return res.status(200).json(newsLetter);
    } catch (error) {
      console.error('Error fetching newsLetter by schoolId:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };

  export const getLetterById: express.RequestHandler = async (req, res) => {
    try {
      const { id } = req.params;
  
      // Check if the provided ID is a valid ObjectId (Mongoose ObjectId)
      if (!isValidObjectId(id)) {
        return res.status(400).json({ error: 'Invalid ID' });
      }
  
      const letter: ILetter | null = await Letter.findById(id);
  
      if (!letter) {
        return res.status(404).json({ error: 'Letter not found' });
      }
  
      return res.status(200).json(letter);
    } catch (error) {
      console.error('Error fetching letter by Id:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };

  export const deleteLetterById: express.RequestHandler = async (req, res) => {
    try {
    const { id } = req.params;

    // Check if the provided ID is a valid ObjectId (Mongoose ObjectId)
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid student ID' });
    }

    // Find the letter by ID and delete it
    const deletedLetter: ILetter | null = await Letter.findByIdAndRemove(id);

    if (!deletedLetter) {
      return res.status(404).json({ error: 'Letter not found' });
    }

    return res.status(200).json({ message: 'Letter deleted successfully' });
  } catch (error) {
    console.error('Error deleting letter by ID:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

  export async function sendEmail(email: string, subject: string, content: string, fileUrl?: string): Promise<void> {
    try {
  
      const name: string = 'MySchoolApp';

      const emailContent = fileUrl
            ? `<p>${content}</p><img src="${fileUrl}" alt="Image"/>`
            : `<p>${content}</p>`;
  
      const response = await axios.post('https://mail.onrender.com/sendmail', {
        name: name,
        mail: email,
        subject: subject,
        html: emailContent
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

  export const sendNewsLetter: express.RequestHandler = async (req, res) => {
    try {
        const { subject, content } = req.body;
        const { classId } = req.params;

        // Find class details
        const targetClass = await SchoolClass.findById(classId);

        if (!targetClass) {
            return res.status(404).json({ error: 'Class not found' });
        }

        let fileUrl: string | undefined;

        // Check if a newsletter file is provided
        if (req.file) {
            const file = req.file;
            const fileName = `${uuidv4()}${path.extname(file.originalname)}`
            const folderName = 'My-School-app'
            const bucketRef = ref(Storage, Bucket_url);
            const fileRef = ref(bucketRef, `${folderName}/${fileName}`);
            await uploadBytes(fileRef, req.file.buffer, {
                contentType: req.file.mimetype,
            });

            // Get the newsletter file URL
            fileUrl = await getDownloadURL(fileRef);
        }

        const students = await Student.find({ studentClass: classId })

        // Sending newsletters to parents
        students.forEach(async (student) => {
            try {
                // Assuming you have a sendEmail function to send emails
                await sendEmail(student.email, subject, content, fileUrl);
            } catch (error) {
                console.error(`Error sending newsletter to ${student.email}:`, error);
            }
        });

        return res.status(200).json({ message: 'Newsletters sent successfully' });
    } catch (error) {
        console.error('Error sending newsletters:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

export const sendNewsLetterToAll: express.RequestHandler = async (req, res) => {
  try {
      const { subject, content } = req.body;
      const { schoolId } = req.params;
      // Retrieve all classes in the school
      const allClasses = await SchoolClass.find({ school: schoolId });
      
      let fileUrl: string | undefined;

      // Check if a newsletter file is provided
      if (req.file) {
          const file = req.file;
          const fileName = `${uuidv4()}${path.extname(file.originalname)}`
          const folderName = 'My-School-app'
          const bucketRef = ref(Storage, Bucket_url);
          const fileRef = ref(bucketRef, `${folderName}/${fileName}`);
          await uploadBytes(fileRef, req.file.buffer, {
              contentType: req.file.mimetype,
          });

          // Get the newsletter file URL
          fileUrl = await getDownloadURL(fileRef);
      }

      // Iterate through each class
      for (const targetClass of allClasses) {
          const classId = targetClass._id;

          // Find students in the current class
          const students = await Student.find({ studentClass: classId });

          // Sending newsletters to parents of students in this class
          students.forEach(async (student) => {
              try {
                  // Assuming you have a sendEmail function to send emails
                  await sendEmail(student.email, subject, content, fileUrl);
              } catch (error) {
                  console.error(`Error sending newsletter to ${student.email}:`, error);
              }
          });
      }

      return res.status(200).json({ message: 'Newsletters sent successfully to all classes\' parents.' });
  } catch (error) {
      console.error('Error sending newsletters:', error);
      return res.status(500).json({ error: 'Internal server error' });
  }
};

