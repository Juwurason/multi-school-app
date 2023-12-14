import express, { Request, Response } from 'express';
import Subject, { ISubject } from '../db/subject';
import mySchool, { ISchool } from '../db/myschools';
import { isValidObjectId, Aggregate, PopulateOptions } from 'mongoose'



interface CreateSubjectRequest {
  subjectNames: string[];
  schoolClassIds: string[];
}


export const subject: express.RequestHandler = async (req: Request, res: Response) => {
  try {
    const { subjectNames, schoolClassIds }: CreateSubjectRequest = req.body;
    const { schoolId } = req.params;

    // Check if subjectNames and schoolClassIds are defined
    if (!subjectNames) {
      return res.status(400).json({ error: 'Invalid request data' });
    }

    const school: ISchool | null = await mySchool.findById(schoolId);

    if (!school) {
      return res.status(404).json({ error: 'School not found' });
    }

    const createdSubjects: ISubject[] = [];

    if (school.school_category === "Primary") {
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
    } else if (school.school_category === "Secondary") {
      // For secondary school, create subjects without associating them with specific classes
      for (let i = 0; i < subjectNames.length; i++) {
        const subjectName = subjectNames[i];

        // Check if a subject with the same name already exists for the school
        const existingSubject: ISubject | null = await Subject.findOne({
          school: schoolId,
          subject: subjectName,
        });

        if (existingSubject) {
          // If the subject already exists for the school, skip it and continue to the next subject
          return res.status(400).json({ error: `Subject '${subjectName}' already exists for this school` });
        }

        // Create and save the new subject without associating it with a class
        const newSubject: ISubject = new Subject({
          school: schoolId,
          subject: subjectName,
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

    if (school.school_category === "Primary") {
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
    } else if (school.school_category === 'Secondary') {
      // For secondary school, fetch subjects without aggregation
      const subjects = await Subject.find({ school: school._id });
      return res.status(200).json(subjects);
    }
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

export const getClassBySubject: express.RequestHandler = async (req: Request, res: Response) => {
  try {
    const {subjectName, schoolId} = req.params
    
    const school = await mySchool.findById(schoolId);

    if (!school) {
      return res.status(404).json({ error: 'School not found' });
    }

    const schoolClass: ISubject[] = await Subject.find({ school: school._id, subjcet: subjectName })
    
    if (!schoolClass) {
      return res.status(404).json({ error: 'Class not found' });
    }

    
    return res.status(200).json({message: "Class found", schoolClass});
  } catch (error) {
    console.error('Error getting class by subjcet:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }

}


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
    });

    if (!subjecti) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    return res.status(200).json(subjecti);
  } catch (error) {
    console.error('Error fetching subject by Id:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateSubject: express.RequestHandler = async (req, res) => {
  try {
    const { subject, schoolId } = req.params;

    const { subjectName, schoolClassIds } = req.body

    const school: ISchool | null = await mySchool.findById(schoolId);

    if (!school) {
      return res.status(404).json({ error: 'School not found' });
    }

    const existingSubject: ISubject | null = await Subject.findOne({
      school: school._id,
      subject: subject
    });

    if (!existingSubject) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    // Update the subject with the new data
    existingSubject.subject = subjectName
    existingSubject.schoolClass = schoolClassIds
    await existingSubject.save()

    return res.status(200).json({message: "Subject updated successfully"});
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






