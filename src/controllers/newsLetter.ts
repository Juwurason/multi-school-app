import Letter, { ILetter } from '../db/newsletter'
import express, { Request, Response } from 'express';
import mySchool, { ISchool } from '../db/myschools';
import { admin } from '../firebaseConfig';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';


export const newsLetter: express.RequestHandler = async (req: Request, res: Response) => {

    try {
        const { message } = req.body
    const { schoolId } = req.params;

    // Check if the school with the provided schoolId exists
    const school: ISchool | null = await mySchool.findById(schoolId);

    if (!school) {
      return res.status(404).json({ error: 'School not found' });
    }

    let fileUrl: string | undefined;

    // Check if a news Letter is provided
    if (req.file) {
        // Upload the news Letter to Firebase Storage
        const file = req.file;
  
        // Generate a unique filename for the news Letter
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
  
        // Get the news Letter URL
        fileUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
      }

      const newsLetterData: any = {
        message,
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
