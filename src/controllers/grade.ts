import express, { Request, Response } from 'express';
import GradeFormat, { IGradeFormat } from '../db/grade';
import mySchool, { ISchool } from '../db/myschools';
import { isValidObjectId } from 'mongoose';

// export const createGradeFormat: express.RequestHandler = async (req: Request, res: Response) => {
//   try {
//     const { grade, miniScore, maxScore } = req.body;
//     const { schoolId } = req.params;

//     // Check if the school with the provided schoolId exists
//     const school: ISchool | null = await mySchool.findById(schoolId);

//     if (!school) {
//       return res.status(404).json({ error: 'School not found' });
//     }

//     const newGradeFormat: IGradeFormat = new GradeFormat({
//       school: schoolId,
//       grade,
//       miniScore,
//       maxScore,
//     });

//     const savedGradeFormat = await newGradeFormat.save();
//     return res.status(201).json({ message: 'Grade format created successfully', gradeFormat: savedGradeFormat });
//   } catch (error) {
//     console.error('Error creating grade format:', error);
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// };

export const createGradeFormat: express.RequestHandler = async (req: Request, res: Response) => {
    try {
      const { gradeFormats } = req.body; // gradeFormats is an array of objects containing grade, miniScore, and maxScore
      const { schoolId } = req.params;
  
      const createdGradeFormats: IGradeFormat[] = [];
  
      for (const format of gradeFormats) {
        const { grade, miniScore, maxScore } = format;
  
        const newGradeFormat: IGradeFormat = new GradeFormat({
          school: schoolId,
          grade,
          miniScore,
          maxScore,
        });
  
        const savedGradeFormat = await newGradeFormat.save();
        createdGradeFormats.push(savedGradeFormat);
      }
  
      return res.status(201).json({ message: 'Grade formats created successfully', gradeFormats: createdGradeFormats });
    } catch (error) {
      console.error('Error creating grade formats:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
  

export const getGradeFormatsBySchoolId: express.RequestHandler = async (req: Request, res: Response) => {
  try {
    const { schoolId } = req.params;

    // Check if the school with the provided schoolId exists
    const school = await mySchool.findById(schoolId);
  
    if (!school) {
      return res.status(404).json({ error: 'School not found' });
    }

    const gradeFormats: IGradeFormat[] = await GradeFormat.find({ school: schoolId });

    return res.status(200).json({ gradeFormats });
  } catch (error) {
    console.error('Error fetching grade formats:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getGradeFormatById: express.RequestHandler = async (req, res) => {
  try {
      const { id } = req.params;

      // Check if the provided ID is valid (you may want to add more validation logic here)
      if (!isValidObjectId(id)) {
          return res.status(400).json({ error: 'Invalid grade format ID' });
      }

      // Find the grade format by ID
      const gradeFormat = await GradeFormat.findById(id);

      if (!gradeFormat) {
          return res.status(404).json({ error: 'Grade format not found' });
      }

      return res.status(200).json({ gradeFormat });
  } catch (error) {
      console.error('Error fetching grade format by ID:', error);
      return res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateGradeById: express.RequestHandler = async (req, res) => {
    try {
        const { id } = req.params;
        const { grade, miniScore, maxScore } = req.body;

        // Check if the provided ID is valid (you may want to add more validation logic here)
        if (!isValidObjectId(id)) {
            return res.status(400).json({ error: 'Invalid grade ID' });
        }

        // Find the grade format by ID and update it with the new data
        const existingGrade = await GradeFormat.findById(id);

        if (!existingGrade) {
            return res.status(404).json({ error: 'Grade format not found' });
        }

        // Update the grade format fields with the new data
        existingGrade.grade = grade;
        existingGrade.miniScore = miniScore;
        existingGrade.maxScore = maxScore;

        await existingGrade.save(); // Save the updated grade format to the database

        return res.status(200).json({ message: 'Grade format updated successfully', updatedGrade: existingGrade });
    } catch (error) {
        console.error('Error updating grade format by ID:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

export const deleteGradeFormatById: express.RequestHandler = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if the provided ID is valid (you may want to add more validation logic here)
        if (!isValidObjectId(id)) {
            return res.status(400).json({ error: 'Invalid grade format ID' });
        }

        // Find the grade format by ID and delete it
        const deletedGradeFormat = await GradeFormat.findByIdAndDelete(id);

        if (!deletedGradeFormat) {
            return res.status(404).json({ error: 'Grade format not found' });
        }

        return res.status(200).json({ message: 'Grade format deleted successfully' });
    } catch (error) {
        console.error('Error deleting grade format by ID:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
