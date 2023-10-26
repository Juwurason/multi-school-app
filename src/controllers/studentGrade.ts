import express, { Request, Response } from 'express';
import mySchool, { ISchool } from '../db/myschools';
import { isValidObjectId } from 'mongoose'
import StudentGradeFormat, { IStudentGradeFormat } from '../db/studentGrade';
import Student, {IStudent} from '../db/student';
import Subject, {ISubject} from '../db/subject';


export const studentGrade: express.RequestHandler = async (req: Request, res: Response) => {

    try {
        const { exam, ca } = req.body
        const { schoolId, studentId, subjectId } = req.params;

    // Check if the school with the provided schoolId exists
    const school: ISchool | null = await mySchool.findById(schoolId);

    if (!school) {
      return res.status(404).json({ error: 'School not found' });
    }

    const student: IStudent | null = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const subject: ISubject | null = await Subject.findById(subjectId);

    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    
      const scoreData: any = {
        exam,
        ca,
        school: school._id,
        student: student._id,
        subject: subject._id,
      };

     
    const score: IStudentGradeFormat = new StudentGradeFormat(scoreData)

    await score.save();
    return res.status(201).json({ message: 'Student Score created successfully', score });

    } catch (error) {
        console.error('Error creating Score:', error);
    return res.status(500).json({ error: 'Internal server error' });
    }
    
}

export const updateStudentScoreById: express.RequestHandler = async (req: Request, res: Response) => {
  try {
   
        const { exam, ca } = req.body
        const { id } = req.params;

    // Check if the provided ID is a valid ObjectId (Mongoose ObjectId)
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    
    const existingScore: IStudentGradeFormat | null = await StudentGradeFormat.findById(id);

    if (!existingScore) {
      return res.status(404).json({ error: 'grade not found' });
    }

    

    // Update other score information
    existingScore.exam = exam;
    existingScore.ca = ca;

    // Save the updated score to the database
    await existingScore.save();

    return res.status(200).json({ message: 'Score updated successfully', updatedScore: existingScore });
  } catch (error) {
    console.error('Error updating score by ID:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getStudentScoreById: express.RequestHandler = async (req, res) => {
    try {
      const { schoolId, studentId } = req.params;
  
      // Check if the school with the provided schoolId exists
      const school = await mySchool.findById(schoolId);
  
      if (!school) {
        return res.status(404).json({ error: 'School not found' });
      }

      const student: IStudent | null = await Student.findById(studentId);

      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }
  
    
      const scores = await StudentGradeFormat.find({ school: school._id, student: student._id });
      // Validate the fetched scores against school's limits
      const validatedScores = [];
      for (const score of scores) {
        try {
          await score.validate();
          validatedScores.push(score);
        } catch (error) {
          // Handle validation error, e.g., log the error or respond with an error message
          console.error('Score validation error:', error);
        }
      }

    return res.status(200).json(validatedScores);
    //   return res.status(200).json(score);
    } catch (error) {
      console.error('Error fetching score by schoolId:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };

  export const getScoresById: express.RequestHandler = async (req, res) => {
    try {
      const { id } = req.params;
  
      // Check if the provided ID is a valid ObjectId (Mongoose ObjectId)
      if (!isValidObjectId(id)) {
        return res.status(400).json({ error: 'Invalid ID' });
      }
  
      const score: IStudentGradeFormat | null = await StudentGradeFormat.findById(id);
  
      if (!score) {
        return res.status(404).json({ error: 'Score not found' });
      }
  
      return res.status(200).json(score);
    } catch (error) {
      console.error('Error fetching score by Id:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };

  export const deleteStudentScoreById: express.RequestHandler = async (req, res) => {
    try {
    const { id } = req.params;

    // Check if the provided ID is a valid ObjectId (Mongoose ObjectId)
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    // Find the score by ID and delete it
    const deletedScore: IStudentGradeFormat | null = await StudentGradeFormat.findByIdAndRemove(id);

    if (!deletedScore) {
      return res.status(404).json({ error: 'Score not found' });
    }

    return res.status(200).json({ message: 'Score deleted successfully' });
  } catch (error) {
    console.error('Error deleting score by ID:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

  
