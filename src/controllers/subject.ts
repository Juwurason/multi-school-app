import express, { Request, Response } from 'express';
import Subject, { ISubject } from '../db/subject';
import mySchool, { ISchool } from '../db/myschools';
import { isValidObjectId } from 'mongoose'


// export const subject: express.RequestHandler = async (req: Request, res: Response) => {
//   try {
//     const { subjectNames, schoolClassId } = req.body;
//     const { schoolId } = req.params;

//     const school: ISchool | null = await mySchool.findById(schoolId);

//     if (!school) {
//       return res.status(404).json({ error: 'School not found' });
//     }

//     const createdSubjects: ISubject[] = [];

//     // Loop through the subject array and create each subject
//     for (const subjectName of subjectNames) {
//       // Check if a subject with the same name and schoolClass already exists for the school
//       const existingSubject: ISubject | null = await Subject.findOne({
//         school: schoolId,
//         subject: subjectName,
//         schoolClass: schoolClassId || null, // If schoolClassId is provided, filter by it, otherwise, get general subjects
//       });

//       if (existingSubject) {
//         // If the subject already exists, skip it and return an error
//         return res.status(400).json({ error: `Subject '${subjectName}' already exists for this school or class` });
//       }

//       // Create and save the new subject
//       const newSubject: ISubject = new Subject({
//         school: schoolId,
//         subject: subjectName,
//         schoolClass: schoolClassId || null, // Assign schoolClassId if provided, otherwise, set to null for general subjects
//       });

//       const savedSubject = await newSubject.save();
//       createdSubjects.push(savedSubject);
//     }

//     return res.status(201).json({ message: 'Subjects created successfully', subjects: createdSubjects });
//   } catch (error) {
//     console.error('Error creating subjects:', error);
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// };

// export const subject: express.RequestHandler = async (req: Request, res: Response) => {
//   try {
//     const { subjects } = req.body; // subjects is an array of objects containing subjectName and schoolClassIds

//     const { schoolId } = req.params;

//     const school: ISchool | null = await mySchool.findById(schoolId);

//     if (!school) {
//       return res.status(404).json({ error: 'School not found' });
//     }

//     const createdSubjects: ISubject[] = [];

//     // Loop through the subjects array and create each subject
//     for (const subjectData of subjects) {
//       const { subjectName, schoolClassIds } = subjectData;

//       // Check if a subject with the same name already exists for the school and any of the specified classes
//       const existingSubject: ISubject | null = await Subject.findOne({
//         school: schoolId,
//         subject: subjectName,
//         schoolClass: { $in: schoolClassIds },
//       });

//       if (existingSubject) {
//         // If the subject already exists for any of the specified classes, skip it and return an error
//         return res.status(400).json({ error: `Subject '${subjectName}' already exists for this school or class` });
//       }

//       // Create and save the new subject
//       const newSubject: ISubject = new Subject({
//         school: schoolId,
//         subject: subjectName,
//         schoolClass: schoolClassIds, // Assign an array of schoolClassIds
//       });

//       const savedSubject = await newSubject.save();
//       createdSubjects.push(savedSubject);
//     }

//     return res.status(201).json({ message: 'Subjects created successfully', subjects: createdSubjects });
//   } catch (error) {
//     console.error('Error creating subjects:', error);
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// };

export const subject: express.RequestHandler = async (req: Request, res: Response) => {
  try {
      const { subjectNames, schoolClassIds } = req.body;
      const { schoolId } = req.params;

      // Check if subjectNames and schoolClassIds are defined and have elements
      if (!subjectNames || !schoolClassIds || subjectNames.length !== schoolClassIds.length) {
          return res.status(400).json({ error: 'Invalid request data' });
      }

      const school: ISchool | null = await mySchool.findById(schoolId);

      if (!school) {
          return res.status(404).json({ error: 'School not found' });
      }

      const createdSubjects: ISubject[] = [];

      // Loop through the subjectNames array and create each subject
      for (let i = 0; i < subjectNames.length; i++) {
          const subjectName = subjectNames[i];
          const schoolClassId = schoolClassIds[i];

          // Check if a subject with the same name already exists for the school and specified class
          const existingSubject: ISubject | null = await Subject.findOne({
              school: schoolId,
              subject: subjectName,
              schoolClass: schoolClassId,
          });

          if (existingSubject) {
              // If the subject already exists for the specified class, skip it and return an error
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
  
      // Fetch Subject associated with the school
      const subject = await Subject.find({ school: school._id });
  
      return res.status(200).json(subject);
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
        });

        return res.status(200).json({ subjects });
    } catch (error) {
        console.error('Error fetching subject by classId:', error);
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

  export const deleteSubjectById: express.RequestHandler = async (req, res) => {
    try {
    const { id } = req.params;

    // Check if the provided ID is a valid ObjectId (Mongoose ObjectId)
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid teacher ID' });
    }

    // Find the subject by ID and delete it
    const deletedSubject: ISubject | null = await Subject.findByIdAndRemove(id);

    if (!deletedSubject) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    return res.status(200).json({ message: 'Subject deleted successfully' });
  } catch (error) {
    console.error('Error deleting Subject by ID:', error);
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

