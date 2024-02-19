import Score, { IScore } from '../db/score'
import express, { Request, Response } from 'express';
import mySchool, { ISchool } from '../db/myschools';
import { isValidObjectId } from 'mongoose'


// export const score: express.RequestHandler = async (req: Request, res: Response) => {

//     try {
//         const { exam, ca } = req.body;
//         const { schoolId } = req.params;

//     // Check if the school with the provided schoolId exists
//     const school: ISchool | null = await mySchool.findById(schoolId);

//     if (!school) {
//       return res.status(404).json({ error: 'School not found' });
//     }

    
//       const scoreData: any = {
//         exam,
//         ca,
//         school: school._id,
//       };

     
//     const score: IScore = new Score(scoreData)

//     await score.save();
//     return res.status(201).json({ message: 'Score created successfully', score });

//     } catch (error) {
//         console.error('Error creating Score:', error);
//     return res.status(500).json({ error: 'Internal server error' });
//     }
    
// }

export const score: express.RequestHandler = async (req: Request, res: Response) => {
  try {
      const { exam, ca } = req.body;
      const { schoolId } = req.params;

      // Check if the school with the provided schoolId exists
      const school: ISchool | null = await mySchool.findById(schoolId);

      if (!school) {
          return res.status(404).json({ error: 'School not found' });
      }

      // Parse exam and ca as numbers
      let examScore: number = parseFloat(exam);
      let caScore: number = parseFloat(ca);

      // Calculate the total score
      let totalScore: number = examScore + caScore;

      // Adjust values if the total is not 100
      if (totalScore !== 100) {
          if (totalScore > 100) {
              // Reduce exam score proportionally to make total 100
              const examProportion: number = examScore / totalScore;
              examScore = Math.round(examProportion * 100);
              caScore = 100 - examScore;
          } else {
              // Increase exam score proportionally to make total 100
              const caProportion: number = caScore / totalScore;
              caScore = Math.round(caProportion * 100);
              examScore = 100 - caScore;
          }
      }

      // Create the score object
      const scoreData: any = {
          exam: examScore,
          ca: caScore,
          school: school._id,
      };

      const score: IScore = new Score(scoreData);

      await score.save();
      return res.status(201).json({ message: 'Score created successfully', score });
  } catch (error) {
      console.error('Error creating Score:', error);
      return res.status(500).json({ error: 'Internal server error' });
  }
};


export const updateScoreById: express.RequestHandler = async (req: Request, res: Response) => {
  try {
   
        const { exam, ca } = req.body
        const { id } = req.params;

    // Check if the provided ID is a valid ObjectId (Mongoose ObjectId)
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    // Find the teacher by ID
    const existingScore: IScore | null = await Score.findById(id);

    if (!existingScore) {
      return res.status(404).json({ error: 'Score not found' });
    }
    // Parse exam and ca as numbers
    let examScore: number = parseFloat(exam);
    let caScore: number = parseFloat(ca);

    // Calculate the total score
    let totalScore: number = examScore + caScore;

    // Adjust values if the total is not 100
    if (totalScore !== 100) {
        if (totalScore > 100) {
            // Reduce exam score proportionally to make total 100
            const examProportion: number = examScore / totalScore;
            examScore = Math.round(examProportion * 100);
            caScore = 100 - examScore;
        } else {
            // Increase exam score proportionally to make total 100
            const caProportion: number = caScore / totalScore;
            caScore = Math.round(caProportion * 100);
            examScore = 100 - caScore;
        }
    }
    

    // Update other score information
    existingScore.exam = examScore;
    existingScore.ca = caScore;

    // Save the updated score to the database
    await existingScore.save();

    return res.status(200).json({ message: 'Score updated successfully', updatedScore: existingScore });
  } catch (error) {
    console.error('Error updating score by ID:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

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

  export const getScoreById: express.RequestHandler = async (req, res) => {
    try {
      const { id } = req.params;
  
      // Check if the provided ID is a valid ObjectId (Mongoose ObjectId)
      if (!isValidObjectId(id)) {
        return res.status(400).json({ error: 'Invalid ID' });
      }
  
      const score: IScore | null = await Score.findById(id);
  
      if (!score) {
        return res.status(404).json({ error: 'Score not found' });
      }
  
      return res.status(200).json(score);
    } catch (error) {
      console.error('Error fetching score by Id:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };

  export const deleteScoreById: express.RequestHandler = async (req, res) => {
    try {
    const { id } = req.params;

    // Check if the provided ID is a valid ObjectId (Mongoose ObjectId)
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    // Find the score by ID and delete it
    const deletedScore: IScore | null = await Score.findByIdAndRemove(id);

    if (!deletedScore) {
      return res.status(404).json({ error: 'Score not found' });
    }

    return res.status(200).json({ message: 'Score deleted successfully' });
  } catch (error) {
    console.error('Error deleting score by ID:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

  
