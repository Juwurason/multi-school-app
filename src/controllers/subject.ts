import express, { Request, Response } from 'express';
import Subject, { ISubject } from '../db/subject';
import mySchool, { ISchool } from '../db/myschools';
import { isValidObjectId } from 'mongoose'


export const subject: express.RequestHandler = async (req: Request, res: Response) => {
    try {
      const { subject } = req.body;
      const { schoolId } = req.params;
  
      const school: ISchool | null = await mySchool.findById(schoolId);
  
      if (!school) {
        return res.status(404).json({ error: 'School not found' });
      }
  
      // Initialize an array to store the subject that were successfully created
      const createdSubject: ISubject[] = [];
  
      // Loop through the subject array and create each class
      for (const subjectName of subject) {
        // Check if a subject with the same name already exists for the school
        const existingSubject: ISubject | null = await Subject.findOne({
          school: schoolId,
          subject: subjectName,
        });
  
        if (existingSubject) {
          // If the subject already exists, skip it and return an error
          return res.status(400).json({ error: `Class '${subjectName}' already exists for this school` });
        }
  
        // Create and save the new subject
        const newSubject: ISubject = new Subject({
          school: schoolId,
          Subject: subjectName,
        });
        
        const savedSubject = await newSubject.save();
        createdSubject.push(savedSubject);
      }
  
      return res.status(201).json({ message: 'Subject created successfully', subject: createdSubject });
    } catch (error) {
      console.error('Error creating subject:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
  


  export const getSubjectBySchoolId: express.RequestHandler = async (req, res) => {
    try {
      const { schoolId } = req.params;
  
      // Check if the school with the provided schoolId exists
      const school = await mySchool.findById(schoolId);
  
      if (!school) {
        return res.status(404).json({ error: 'School not found' });
      }
  
      // Fetch Subject associated with the school
      const subject = await Subject.find({ school: school._id });
  
      return res.status(200).json(subject);
    } catch (error) {
      console.error('Error fetching subject by schoolId:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };

  export const getSubjectById: express.RequestHandler = async (req, res) => {
    try {
      const { id } = req.params;
  
      // Check if the provided ID is a valid ObjectId (Mongoose ObjectId)
      if (!isValidObjectId(id)) {
        return res.status(400).json({ error: 'Invalid class ID' });
      }
  
      const subject: ISubject | null = await Subject.findById(id);
  
      if (!subject) {
        return res.status(404).json({ error: 'Subject not found' });
      }
  
      return res.status(200).json(subject);
    } catch (error) {
      console.error('Error fetching subject by Id:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };