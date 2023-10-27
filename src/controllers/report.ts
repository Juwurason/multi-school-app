import express, { Request, Response } from 'express';

import Student , { IStudent } from '../db/student';
import axios from 'axios';
import { isValidObjectId } from 'mongoose'
import StudentGradeFormat, { IStudentGradeFormat } from '../db/studentGrade';
import Report, {IReport} from '../db/report';

export const report: express.RequestHandler = async (req: Request, res: Response) => {

    try {
        const { presentNo,absentNo,attentiveness,honesty,neatness,puntuality,
            leadershipRespon,handling,handWriting,publicSpeack,drawingPainting,
            sportGames,classTeacher,headTeacher, } = req.body
        const { studentId } = req.params;

        const student: IStudent | null = await Student.findById(studentId);

        if (!student) {
          return res.status(404).json({ error: 'Student not found' });
        }

        const report = { presentNo,absentNo,attentiveness,honesty,neatness,puntuality,
            leadershipRespon,handling,handWriting,publicSpeack,drawingPainting,
            sportGames,classTeacher,headTeacher, studentId: student._id }

            const newReport = new Report(report);
            await newReport.save();

            return res.status(201).json({ message: 'Report created successfully', report });
    } catch (error) {
        console.error('Error creating report:', error);
    return res.status(500).json({ error: 'Internal server error' });
    }
}


export const updateReportById: express.RequestHandler = async (req: Request, res: Response) => {
    try {
      const { presentNo, absentNo, attentiveness, honesty, neatness, puntuality, 
              leadershipRespon, handling, handWriting, publicSpeack, drawingPainting, 
              sportGames, classTeacher, headTeacher } = req.body;

      const { reportId } = req.params;
        
      if (!isValidObjectId(reportId)) {
        return res.status(400).json({ error: 'Invalid ID' });
      }
      // Find the report by ID
      const existingReport: IReport | null = await Report.findById(reportId);
  
      // If the report is not found, return a 404 error
      if (!existingReport) {
        return res.status(404).json({ error: 'Report not found' });
      }
  
      // Update the report with the provided data
      existingReport.presentNo = presentNo;
      existingReport.absentNo = absentNo;
      existingReport.attentiveness = attentiveness;
      existingReport.honesty = honesty;
      existingReport.neatness = neatness;
      existingReport.puntuality = puntuality;
      existingReport.leadershipRespon = leadershipRespon;
      existingReport.handling = handling;
      existingReport.handWriting = handWriting;
      existingReport.publicSpeack = publicSpeack;
      existingReport.drawingPainting = drawingPainting;
      existingReport.sportGames = sportGames;
      existingReport.classTeacher = classTeacher;
      existingReport.headTeacher = headTeacher;
  
      // Save the updated report to the database
      await existingReport.save();
  
      // Respond with a success message or the updated report object
      return res.status(200).json({ message: 'Report updated successfully', report: existingReport });
    } catch (error) {
      console.error('Error updating report:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };

  export const getReportById: express.RequestHandler = async (req: Request, res: Response) => {
    try {
      const { reportId } = req.params;
  
      // Find the report by ID
      const report: IReport | null = await Report.findById(reportId);
  
      // If the report is not found, return a 404 error
      if (!report) {
        return res.status(404).json({ error: 'Report not found' });
      }
  
      // Respond with the report object
      return res.status(200).json(report);
    } catch (error) {
      console.error('Error fetching report by ID:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };

  export const getReportsByStudentId: express.RequestHandler = async (req: Request, res: Response) => {
    try {
      const { studentId } = req.params;
  
      // Find reports based on the student's ID
      const reports: IReport[] = await Report.find({ student: studentId });
  
      // If no reports are found, return an empty array
      if (!reports || reports.length === 0) {
        return res.status(404).json({ error: 'No reports found for the student' });
      }
  
      // Respond with the array of report objects
      return res.status(200).json(reports);
    } catch (error) {
      console.error('Error fetching reports by student ID:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };

  export const deleteReportById: express.RequestHandler = async (req: Request, res: Response) => {
    try {
      const { reportId } = req.params;
  
      // Find the report by ID and delete it
      const deletedReport = await Report.findByIdAndDelete(reportId);
  
      // If the report is not found, return a 404 error
      if (!deletedReport) {
        return res.status(404).json({ error: 'Report not found' });
      }
  
      // Respond with a success message or the deleted report object
      return res.status(200).json({ message: 'Report deleted successfully', report: deletedReport });
    } catch (error) {
      console.error('Error deleting report by ID:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };

  export const getReportAndScoreByEmail: express.RequestHandler = async (req: Request, res: Response) => {
    try {
      const { studentId } = req.params;
  
      // Find the student by ID
      const student: IStudent | null = await Student.findById(studentId);
  
      // If the student is not found, return a 404 error
      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }
  
      // Find the student's report
      const report: IReport | null = await Report.findOne({ student: student._id });
  
      // Find the student's score
      const score: IStudentGradeFormat | null = await StudentGradeFormat.findOne({ student: student._id });
  
      // If the report or score is not found, return an error
      if (!report || !score) {
        return res.status(404).json({ error: 'Report or score not found for the student' });
      }
  
      // Respond with the report and score data
      return res.status(200).json({ report, score });
    } catch (error) {
      console.error('Error fetching report and score by email:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };