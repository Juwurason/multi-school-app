import express, { Request, Response } from 'express';
import Subject, { ISubject } from '../db/subject';
import mySchool, { ISchool } from '../db/myschools';
import { isValidObjectId, Aggregate, PopulateOptions } from 'mongoose'
import mongoose, { Types } from 'mongoose';


interface CreateSubjectRequest {
  subjectNames: string[];
  schoolClassIds: string[];
}

export const subject: express.RequestHandler = async (req: Request, res: Response) => {
  try {
    const { subjectNames, schoolClassIds }: CreateSubjectRequest = req.body;
    const { schoolId } = req.params;

    // Check if subjectNames and schoolClassIds are defined
    if (!subjectNames || !schoolClassIds) {
      return res.status(400).json({ error: 'Invalid request data' });
    }

    const school: ISchool | null = await mySchool.findById(schoolId);

    if (!school) {
      return res.status(404).json({ error: 'School not found' });
    }

    const createdSubjects: ISubject[] = [];

    // Loop through subjectNames and schoolClassIds arrays and create each subject
    for (let i = 0; i < subjectNames.length; i++) {
      const subjectName = subjectNames[i];

      // Loop through schoolClassIds for the current subject and create a subject for each class
      for (let j = 0; j < schoolClassIds.length; j++) {
        const schoolClassId = schoolClassIds[j];

        // Check if a subject with the same name already exists for the school and specified class
        const existingSubject: ISubject | null = await Subject.findOne({
          school: schoolId,
          subject: subjectName,
          schoolClass: schoolClassId,
        });

        if (existingSubject) {
          // If the subject already exists for the specified class, skip it and continue to the next subject
          return res.status(400).json({ error: `Subject '${subjectName}' already exists for this school and class` });
        }

        // Create and save the new subject
        const newSubject: ISubject = new Subject({
          school: schoolId,
          subject: subjectName,
          schoolClass: schoolClassId,
        });

        const savedSubject = await newSubject.save();
        createdSubjects.push(savedSubject);
      }
    }

    return res.status(201).json({ message: 'Subjects created successfully', subjects: createdSubjects });
  } catch (error) {
    console.error('Error creating subjects:', error);
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

    // Use aggregation framework to group subjects by their names and populate associated classes
    const subjects: Aggregate<any[]> = Subject.aggregate([
      {
        $match: { school: school._id },
      },
      {
        $group: {
          _id: '$subject', // Group by subject name
          schoolClass: {
            $push: '$schoolClass', // Push associated classes into an array
          },
        },
      },
      {
        $project: {
          subject: '$_id', // Rename the grouped field to 'subject'
          schoolClass: 1, // Include the schoolClass field
          _id: 0, // Exclude the default _id field from the output
        },
      },

    ]);

    // Execute aggregation and populate classes with assigned teachers
    const populatedSubjects = await subjects.exec();
    const options: PopulateOptions[] = [
      { path: 'schoolClass', populate: { path: 'assignedTeacher', model: 'Teacher' } },
      { path: 'schoolClass', model: 'SchoolClass' }
    ];
    const subjectsWithPopulatedClasses = await Subject.populate(populatedSubjects, options);

    return res.status(200).json(subjectsWithPopulatedClasses);
  } catch (error) {
    console.error('Error fetching subject by schoolId:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};


export const getSubjectByClassId: express.RequestHandler = async (req: Request, res: Response) => {
  try {
    const { classId, schoolId } = req.params;

    // Retrieve subjects for the specific school where schoolClass is either null or matches the provided classId
    const subjects: ISubject[] = await Subject.find({
      school: schoolId,
      $or: [
        { schoolClass: null },
        { schoolClass: { $exists: false } },
        { schoolClass: classId }
      ]
    }).populate('schoolClass');

    return res.status(200).json({ subjects });
  } catch (error) {
    console.error('Error fetching subject by classId:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};


export const getSubjectById: express.RequestHandler = async (req, res) => {
  try {
    const { subject, schoolId } = req.params;

    const school: ISchool | null = await mySchool.findById(schoolId);

    if (!school) {
      return res.status(404).json({ error: 'School not found' });
    }

    // const subject: ISubject | null = await Subject.findById(id).populate('schoolClass');
    const subjecti: ISubject | null = await Subject.findOne({
      school: school._id,
      subject: subject
    }).populate('subject');

    if (!subjecti) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    return res.status(200).json(subjecti);
  } catch (error) {
    console.error('Error fetching subject by Id:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};


export const deleteSubjectById: express.RequestHandler = async (req, res) => {
  try {
    const { subject, schoolId } = req.params;

    const school: ISchool | null = await mySchool.findById(schoolId);

    if (!school) {
      return res.status(404).json({ error: 'School not found' });
    }

    // Find and delete the subject by schoolId and subject name
    const deletedSubject = await Subject.findOneAndDelete({
      school: school._id,
      subject: subject
    });

    if (!deletedSubject) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    return res.status(200).json({ message: 'Subject deleted successfully', deletedSubject });
  } catch (error) {
    console.error('Error deleting subject:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};





export const createSubject: express.RequestHandler = async (req: Request, res: Response) => {
  try {
    const { subjectNames, isGeneralSubject, schoolClassId } = req.body;
    const { schoolId } = req.params;

    const school: ISchool | null = await mySchool.findById(schoolId);

    if (!school) {
      return res.status(404).json({ error: 'School not found' });
    }

    const createdSubjects: ISubject[] = [];

    // Loop through the subject array and create each subject
    for (const subjectName of subjectNames) {
      // Check if a subject with the same name already exists for the school
      const existingSubject: ISubject | null = await Subject.findOne({
        school: schoolId,
        subject: subjectName,
        schoolClass: isGeneralSubject ? null : schoolClassId || null,
      });

      if (existingSubject) {
        // If the subject already exists, skip it and return an error
        return res.status(400).json({ error: `Subject '${subjectName}' already exists for this school or class` });
      }

      // Create and save the new subject
      const newSubject: ISubject = new Subject({
        school: schoolId,
        subject: subjectName,
        schoolClass: isGeneralSubject ? null : schoolClassId || null, // Use specificSchoolClassId if provided
      });

      const savedSubject = await newSubject.save();
      createdSubjects.push(savedSubject);
    }

    return res.status(201).json({ message: 'Subjects created successfully', subjects: createdSubjects });
  } catch (error) {
    console.error('Error creating subjects:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};



