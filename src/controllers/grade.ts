import express, { Request, Response } from 'express';
import GradeFormat, { IGradeFormat } from '../db/grade';
import mySchool, { ISchool } from '../db/myschools';

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
