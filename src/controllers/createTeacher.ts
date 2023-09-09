import express, { Request, Response } from 'express';
import mySchool, { ISchool } from '../db/myschools';
import Teacher, { ITeacher } from '../db/teacher';
import { isValidObjectId } from 'mongoose'
import shortid from 'shortid'


function generateStaffId() {
  return `STF-${shortid.generate()}`;
}


export const createTeacher: express.RequestHandler = async (req: Request, res: Response) => {
  try {
    const { name, lastName, address, phoneNumber, email, gender, teacherClass } = req.body;
    const { schoolId } = req.params;

    // Check if the school with the provided schoolId exists
    const school: ISchool | null = await mySchool.findById(schoolId);

    if (!school) {
      return res.status(404).json({ error: 'School not found' });
    }

    // Check if the email already exists in the database
    const existingTeacher: ITeacher | null = await Teacher.findOne({ email });

    if (existingTeacher) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const staffId: string = generateStaffId();

    // Create a new teacher and associate it with the school
    const teacher: ITeacher = new Teacher({
      name,
      lastName,
      address,
      phoneNumber,
      email,
      gender,
      teacherClass,
      school: school._id, // Associate the teacher with the school using its _id
      staffId,
    });

    // Save the teacher to the database
    await teacher.save();

    return res.status(201).json({message: "Teacher created successfully", teacher});
  } catch (error) {
    console.error('Error creating teacher:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateTeacherById: express.RequestHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { name, lastName, address, phoneNumber, gender, teacherClass } = req.body;

    // Check if the provided ID is a valid ObjectId (Mongoose ObjectId)
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid teacher ID' });
    }

       // Find the teacher by ID and update their information
    const updatedTeacher: ITeacher | null = await Teacher.findByIdAndUpdate(
      id,
      {
        name,
        lastName,
        address,
        phoneNumber,
        gender,
        teacherClass,
      },
      { new: true } // Set { new: true } to return the updated document
    );

    if (!updatedTeacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    return res.status(200).json({message: "profile updates successfully", updatedTeacher});
  } catch (error) {
    console.error('Error updating teacher by ID:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
 
};

