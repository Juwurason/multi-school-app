import express, { Request, Response } from 'express';
import SchoolClass, { ISchoolClass } from '../db/schoolClass';
import mySchool, { ISchool } from '../db/myschools';
import { isValidObjectId } from 'mongoose'


export const schoolClass: express.RequestHandler = async (req: Request, res: Response) => {
    try {
      const { classNames } = req.body;
      const { schoolId } = req.params;
  
      const school: ISchool | null = await mySchool.findById(schoolId);
  
      if (!school) {
        return res.status(404).json({ error: 'School not found' });
      }
  
      // Initialize an array to store the classes that were successfully created
      const createdClasses: ISchoolClass[] = [];
  
      // Loop through the classNames array and create each class
      for (const className of classNames) {
        // Check if a class with the same name already exists for the school
        const existingClass: ISchoolClass | null = await SchoolClass.findOne({
          school: schoolId,
          schoolClass: className,
        });
  
        if (existingClass) {
          // If the class already exists, skip it and return an error
          return res.status(400).json({ error: `Class '${className}' already exists for this school` });
        }
  
        // Create and save the new class
        const newClass: ISchoolClass = new SchoolClass({
          school: schoolId,
          schoolClass: className,
        });
        
        const savedClass = await newClass.save();
        createdClasses.push(savedClass);
      }
  
      return res.status(201).json({ message: 'Classes created successfully', classes: createdClasses });
    } catch (error) {
      console.error('Error creating classes:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
  


  export const getSchoolClassBySchoolId: express.RequestHandler = async (req, res) => {
    try {
      const { schoolId } = req.params;
  
      // Check if the school with the provided schoolId exists
      const school = await mySchool.findById(schoolId);
  
      if (!school) {
        return res.status(404).json({ error: 'School not found' });
      }
  
      // Fetch SchoolClass associated with the school
      const schoolClass = await SchoolClass.find({ school: school._id });
  
      return res.status(200).json(schoolClass);
    } catch (error) {
      console.error('Error fetching schoolClasses by schoolId:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };

  export const getSchoolClassById: express.RequestHandler = async (req, res) => {
    try {
      const { id } = req.params;
  
      // Check if the provided ID is a valid ObjectId (Mongoose ObjectId)
      if (!isValidObjectId(id)) {
        return res.status(400).json({ error: 'Invalid class ID' });
      }
  
      const schoolClass: ISchoolClass | null = await SchoolClass.findById(id);
  
      if (!schoolClass) {
        return res.status(404).json({ error: 'SchoolClass not found' });
      }
  
      return res.status(200).json(schoolClass);
    } catch (error) {
      console.error('Error fetching school Class by Id:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };