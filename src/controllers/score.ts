import Score, { IScore } from '../db/score'
import express, { Request, Response } from 'express';
import mySchool, { ISchool } from '../db/myschools';


export const score: express.RequestHandler = async (req: Request, res: Response) => {

    try {
        const { exam, ca } = req.body
        const { schoolId } = req.params;

    // Check if the school with the provided schoolId exists
    const school: ISchool | null = await mySchool.findById(schoolId);

    if (!school) {
      return res.status(404).json({ error: 'School not found' });
    }

    

      const scoreData: any = {
        exam,
        ca,
        school: school._id,
      };

     
    const score: IScore = new Score(scoreData)

    await score.save();
    return res.status(201).json({ message: 'Score created successfully', score });

    } catch (error) {
        console.error('Error creating Score:', error);
    return res.status(500).json({ error: 'Internal server error' });
    }
    
}

export const getScoreBySchoolId: express.RequestHandler = async (req, res) => {
    try {
      const { schoolId } = req.params;
  
      // Check if the school with the provided schoolId exists
      const school = await mySchool.findById(schoolId);
  
      if (!school) {
        return res.status(404).json({ error: 'School not found' });
      }
  
    
      const score = await Score.find({ school: school._id });
  
      return res.status(200).json(score);
    } catch (error) {
      console.error('Error fetching score by schoolId:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };