// Import necessary modules and models
import express from 'express';
import Teacher, { ITeacher } from '../db/teacher'; // Import the Teacher model
import mySchool, { ISchool } from '../db/myschools'; // Import the School model
import { isValidObjectId } from 'mongoose'
import SchoolClass, { ISchoolClass } from '../db/schoolClass';
import mongoose from 'mongoose';

// export const getTeachersById: express.RequestHandler = async (req, res) => {
//   try {
//     const { id } = req.params;

//     // Check if the provided ID is a valid ObjectId (Mongoose ObjectId)
//     if (!isValidObjectId(id)) {
//       return res.status(400).json({ error: 'Invalid teacher ID' });
//     }

//     const teacher: ITeacher | null = await Teacher.findById(id).populate('teacherClass');

//     if (!teacher) {
//       return res.status(404).json({ error: 'Teacher not found' });
//     }

//     const school = await mySchool.findById(teacher.school)
    
//     if (school.school_category === "Primary") {
//       return res.status(200).json(teacher);
//     }

    
//   } catch (error) {
//     console.error('Error fetching teachers by schoolId:', error);
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// };

export const getTeachersById: express.RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the provided ID is a valid ObjectId (Mongoose ObjectId)
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid teacher ID' });
    }

    const teacher: ITeacher | null = await Teacher.findById(id);

    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    const school = await mySchool.findById(teacher.school);

    if (!school) {
      return res.status(404).json({ error: 'School not found' });
    }

    if (school.school_category === "Primary") {
      // Populate the teacherClass field for Primary school
      await teacher.populate('teacherClass');
    } else if (school.school_category === "Secondary") {
      // Populate the school and teacherSubjects field for Secondary school
      await (await teacher.populate('school')).populate('teacherSubject')
    }

    return res.status(200).json(teacher);
  } catch (error) {
    console.error('Error fetching teachers by ID:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};




export const getTeachersBySchoolId: express.RequestHandler = async (req, res) => {
  try {
    const { schoolId } = req.params;

    // Check if the school with the provided schoolId exists
    const school = await mySchool.findById(schoolId);

    if (!school) {
      return res.status(404).json({ error: 'School not found' });
    }

    // Fetch teachers associated with the school
    const teacher = await Teacher.find({ school: school._id })
    .populate('teacherClass')
    .populate('teacherSubject')
    

    return res.status(200).json(teacher);
  } catch (error) {
    console.error('Error fetching teachers by schoolId:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// export const deleteTeacherById: express.RequestHandler = async (req, res) => {
//     try {
//     const { id } = req.params;

//     // Check if the provided ID is a valid ObjectId (Mongoose ObjectId)
//     if (!isValidObjectId(id)) {
//       return res.status(400).json({ error: 'Invalid teacher ID' });
//     }


//     // Find the teacher by ID
//     const deletedTeacher: ITeacher | null = await Teacher.findById(id);

//     if (!deletedTeacher) {
//       return res.status(404).json({ error: 'Teacher not found' });
//     }

//     // Update the assignedTeacher field to null in schoolClasses documents
//     await SchoolClass.updateMany({ assignedTeacher: id }, { $set: { assignedTeacher: null } });
//     await SchoolClass.updateMany({ teacherSubject: id }, { $set: { teacherSubject: null } });

//     // Delete the teacher
//     await Teacher.findByIdAndRemove(id);


//     return res.status(200).json({ message: 'Teacher deleted successfully' });
//   } catch (error) {
//     console.error('Error deleting teacher by ID:', error);
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// };

export const deleteTeacherById: express.RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the provided ID is a valid ObjectId (Mongoose ObjectId)
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid teacher ID' });
    }

    // Find the teacher by ID
    const deletedTeacher: ITeacher | null = await Teacher.findById(id);

    if (!deletedTeacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    // Check the school category
    const school = await mySchool.findById(deletedTeacher.school);

    if (!school) {
      return res.status(500).json({ error: 'Internal server error: School not found for the teacher' });
    }

    if (school.school_category === 'Primary') {
      // Update the assignedTeacher field to null in schoolClasses documents
      await SchoolClass.updateMany({ assignedTeacher: id }, { $set: { assignedTeacher: null } });
    } else if (school.school_category === 'Secondary') {
      // Update the teacherSubject field to null in schoolClasses documents
      await SchoolClass.updateMany({ teacherSubject: id }, { $set: { teacherSubject: null } });
    }

    // Delete the teacher
    await Teacher.findByIdAndRemove(id);

    return res.status(200).json({ message: 'Teacher deleted successfully' });
  } catch (error) {
    console.error('Error deleting teacher by ID:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

