import Letter, { ILetter } from '../db/newsletter'
import express, { Request, Response } from 'express';
import mySchool, { ISchool } from '../db/myschools';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import {Storage, Bucket_url} from '../config/firebase';
import SchoolClass from '../db/schoolClass';
import Student from '../db/student';
import axios from 'axios';

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

export const getLetterBySchoolId: express.RequestHandler = async (req, res) => {
    try {
      const { schoolId } = req.params;
  
      // Check if the school with the provided schoolId exists
      const school = await mySchool.findById(schoolId);
  
      if (!school) {
        return res.status(404).json({ error: 'School not found' });
      }
  
      // Fetch teachers associated with the school
      const newsLetter = await Letter.find({ school: school._id });
  
      return res.status(200).json(newsLetter);
    } catch (error) {
      console.error('Error fetching newsLetter by schoolId:', error);
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

        const students = await Student.find({ class: classId })

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
          const students = await Student.find({ class: classId });

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

