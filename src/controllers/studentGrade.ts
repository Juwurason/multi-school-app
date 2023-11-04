import express, { Request, Response } from 'express';
import mySchool, { ISchool } from '../db/myschools';
import { isValidObjectId } from 'mongoose'
import StudentGradeFormat, { IStudentGradeFormat } from '../db/studentGrade';
import Student, { IStudent } from '../db/student';
import Subject, { ISubject } from '../db/subject';
import GradeFormat, { IGradeFormat } from '../db/grade';


export const studentGrade: express.RequestHandler = async (req: Request, res: Response) => {

  try {
    const { exam, ca } = req.body
    const { schoolId, studentId, subject } = req.params;

    // Check if the school with the provided schoolId exists
    const school: ISchool | null = await mySchool.findById(schoolId);

    if (!school) {
      return res.status(404).json({ error: 'School not found' });
    }

    const student: IStudent | null = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // const subject: ISubject | null = await Subject.findById(subjectId);

    // if (!subject) {
    //   return res.status(404).json({ error: 'Subject not found' });
    // }

    const subjectName: ISubject | null = await Subject.findOne({
      school: school._id,
      subject: subject
    });

    if (!subjectName) {
      return res.status(404).json({ error: 'Subject not found for the school' });
    }

    // Fetch term and session from the school object
    const { term, session } = school;

    const existingScore: IStudentGradeFormat | null = await StudentGradeFormat.findOne({
      school: school._id,
      student: student._id,
      subject: subjectName,
    });

    if (existingScore) {
      return res.status(400).json({ error: 'Score already exists for this student and subject' });
    }

    const studentTotalScore: number = parseFloat(ca) + parseFloat(exam);
    const grades: IGradeFormat[] | null = await GradeFormat.find({
      school: school._id
    });

    if (!grades) {
      return res.status(500).json({ error: 'Grade format not found for the school' });
    }

    let gradeRemark: string | null = null;


    // Iterate through all grades to find a match for studentTotalScore
    for (const grade of grades) {
      if (studentTotalScore >= grade.miniScore && studentTotalScore <= grade.maxScore) {
        gradeRemark = grade.grade;
        break; // Exit loop once a matching grade is found
      }
    }

    if (!gradeRemark) {
      gradeRemark = 'N/A'; // Assign a default grade if no matching grade range is found
    }

    const scoreData: any = {
      exam,
      ca,
      gradeRemark,
      school: school._id,
      student: student._id,
      subject: subjectName,
      term,
      session
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
    const { exam, ca } = req.body;
    const { schoolId, studentId, subjectName } = req.params;

    // Check if the school with the provided schoolId exists
    const school: ISchool | null = await mySchool.findById(schoolId);

    if (!school) {
      return res.status(404).json({ error: 'School not found' });
    }

    // Check if the specified subject exists for the school
    const subject: ISubject | null = await Subject.findOne({
      school: school._id,
      subject: subjectName
    });

    if (!subject) {
      return res.status(404).json({ error: 'Subject not found for the school' });
    }

    // Check if the student with the provided studentId exists
    const student: IStudent | null = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Check if the student's grade for the specified subject already exists
    let score: IStudentGradeFormat | null = await StudentGradeFormat.findOne({
      school: school._id,
      student: student._id,
      subject: subjectName
    });

    if (!score) {
      return res.status(404).json({ error: 'Student grade not found for the specified subject' });
    }

    // Update the student's grade with the new exam and ca scores
    score.exam = exam;
    score.ca = ca;

    // Recalculate gradeRemark based on new scores and existing grade ranges (if needed)
    // Recalculate gradeRemark based on new scores and existing grade ranges
    const grades: IGradeFormat[] | null = await GradeFormat.find({
      school: school._id
    });

    if (!grades) {
      return res.status(500).json({ error: 'Grade format not found for the school' });
    }

    let gradeRemark: string | null = null;

    // Iterate through all grades to find a match for studentTotalScore
    const studentTotalScore: number = parseFloat(ca) + parseFloat(exam);
    for (const grade of grades) {
      if (studentTotalScore >= grade.miniScore && studentTotalScore <= grade.maxScore) {
        gradeRemark = grade.grade;
        break; // Exit loop once a matching grade is found
      }
    }

    if (!gradeRemark) {
      gradeRemark = 'N/A'; // Assign a default grade if no matching grade range is found
    }

    // Update gradeRemark in the score object
    score.gradeRemark = gradeRemark;


    // Save the updated student's grade
    await score.save();

    return res.status(200).json({ message: 'Student grade updated successfully', score });
  } catch (error) {
    console.error('Error updating student grade:', error);
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

    const scores = await StudentGradeFormat.find({ school: school._id, student: student._id })
      .populate('subject')
      .populate('student');
    // const scores = await StudentGradeFormat.find({ school: school._id, student: student._id }).populate('subject');
    // Validate the fetched scores against school's limits
    const validatedScores = [];
    for (const score of scores) {
      try {
        await score.validate();
        validatedScores.push({score, studentName: student.name, studentlastName: student.lastName});
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


