import express, { Request, Response } from 'express';

import Student, { IStudent } from '../db/student';
import axios from 'axios';
import { isValidObjectId } from 'mongoose';
import StudentGradeFormat, { IStudentGradeFormat } from '../db/studentGrade';
import Report, { IReport } from '../db/report';
import mySchool, { ISchool } from '../db/myschools';
import TermSession, { ITermSession } from '../db/termSession';
import * as pdf from 'html-pdf';

export const report: express.RequestHandler = async (req: Request, res: Response) => {

  try {
    const { sPresentNo, attentiveness, honesty, neatness, puntuality,
      leadershipRespon, handling, handWriting, publicSpeack, drawingPainting,
      sportGames, classTeacher, headTeacher, } = req.body
    const { studentId } = req.params;

    const student: IStudent | null = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }


    const school: ISchool | null = await mySchool.findById(student.school);

    const { term, session, presentNo } = school;
              const total = Number(presentNo) - Number(sPresentNo);
    const report = {
      presentNo: sPresentNo, absentNo: total, attentiveness, honesty, neatness, puntuality,
      leadershipRespon, handling, handWriting, publicSpeack, drawingPainting,
      sportGames, classTeacher, headTeacher, term: term, session: session, student: student._id
    }

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
    const { sPresentNo, absentNo, attentiveness, honesty, neatness, puntuality,
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
    existingReport.presentNo = sPresentNo;
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
    const { studentId, term, session, } = req.params;

    // Find the student by ID
    const student: IStudent | null = await Student.findById(studentId);

    // If the student is not found, return a 404 error
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Find the student's report
    const report: IReport | null = await Report.findOne({ student: student._id, term: term, session: session });

    // Find the student's score
    const score: IStudentGradeFormat[] | null = await StudentGradeFormat.find({ student: student._id, term: term, session: session }).populate('subject');

    // If the report or score is not found, return an error
    // if (!report || !score) {
    //   return res.status(404).json({ error: 'Report or score not found for the student' });
    // }

    // Respond with the report and score data
    return res.status(200).json({message:"Report Loaded Successfully", report, score });
  } catch (error) {
    console.error('Error fetching report and score:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};


interface ScoreWithPopulatedSubject {
  _id: string; // assuming _id is a string, adjust it based on your schema
  subject: {
    _id: string; // assuming _id is a string, adjust it based on your schema
    subject: string;
    // add other fields from the subject schema if needed
  };
  ca: number;
  exam: number;
  gradeRemark: string;
  // add other fields from the score schema if needed
}


export const sendReportAndScoreByEmail: express.RequestHandler = async (req: Request, res: Response) => {
  try {
    const { studentId, term, session,  } = req.params;

    // Find the student by ID
    const student: IStudent | null = await Student.findById(studentId);

    // If the student is not found, return a 404 error
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const school: ISchool | null = await mySchool.findById(student.school);

    if (!school) {
      return res.status(404).json({ error: 'School not found' });
    }

    const schoolLogoUrl: string | undefined = school?.letterHead;
    // Find the student's report
    const report: IReport | null = await Report.findOne({ student: student._id, term: term, session: session });
    // console.log(report);

    // If the report or score is not found, return an error
    // if (!report || !score) {
    //   return res.status(404).json({ error: 'Report or score not found for the student' });
    // }

    // Find the student's score
    const score: ScoreWithPopulatedSubject[] | null = await StudentGradeFormat.find({ student: student._id, term: term, session: session })
      .populate('subject')
      .lean();
  
    const emailContent = `
    <div style="background-image: url(${schoolLogoUrl}); background-repeat: no-repeat; height: 100vh; width: 100%; background-size: cover; display: flex; justify-content: center; align-items: center;">
      <div style=" padding: 20px; border-radius: 10px; width: 100%;">
      <h3>Student Report Scores</h3>
      <table border="1" cellpadding="0" cellspacing="0" style="border-collapse: collapse; width: 100%;">
        <tr style="background-color: #f2f2f2;">
          <th>Subject</th>
          <th>CA</th>
          <th>Exam</th>
          <th>Total</th>
          <th>Remark</th>
        </tr>
        ${score?.map((scores, i) => `
          <tr>
            <td style="text-align: center;">${scores.subject?.subject}</td>
            <td style="text-align: center;">${scores.ca}</td>
            <td style="text-align: center;">${scores.exam}</td>
            <td style="text-align: center;">${Number(scores.ca) + Number(scores.exam)}</td>
            <td style="text-align: center;">${scores.gradeRemark}</td>
          </tr>
        `).join('')}
      </table>
      </div>

      <h3>Student Report  Attendance Details</h3>
      <table border="1" cellpadding="0" cellspacing="0" style="border-collapse: collapse; width: 100%;">
        <tr style="background-color: #f2f2f2;">
          <th>Present No.</th>
          <th>Absent No.</th>
          <th>Attentiveness</th>
          <th>Honesty</th>
          <th>Neatness</th>
          <th>Puntuality</th>
          <th>LeaderShip</th>
          <th>Handling</th>
          <th>Handwriting</th>
          <th>Public Speack</th>
          <th>Drawing Painting</th>
          <th>Sport Games</th>
          
        </tr>
        
          <tr>
            <td style="text-align: center;">${report?.presentNo}</td>
            <td style="text-align: center;">${report?.absentNo}</td>
            <td style="text-align: center;">${report?.attentiveness}</td>
            <td style="text-align: center;">${report?.honesty}</td>
            <td style="text-align: center;">${report?.neatness}</td>
            <td style="text-align: center;">${report?.puntuality}</td>
            <td style="text-align: center;">${report?.leadershipRespon}</td>
            <td style="text-align: center;">${report?.handling}</td>
            <td style="text-align: center;">${report?.handWriting}</td>
            <td style="text-align: center;">${report?.publicSpeack}</td>
            <td style="text-align: center;">${report?.drawingPainting}</td>
            <td style="text-align: center;">${report?.sportGames}</td>
          </tr>
        
      </table>
      <h3>Teacher Comment:</h3>
      <p>${report?.classTeacher}</p>

      <h3>Headmaster Comment:</h3>
      <p>${report?.headTeacher}</p> 

      </div>
  `;


    const response = await axios.post('https://techxmail.onrender.com/sendmail', {
       name: student.name,
       mail: student.email,
       text: "Student Card",
       subject: "Student report",
       html: emailContent
      });


    return res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending report and score by email:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};


