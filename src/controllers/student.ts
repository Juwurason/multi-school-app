import express, { Request, Response } from 'express';
import mySchool, { ISchool } from '../db/myschools';
import Student, { IStudent } from '../db/student';
import { isValidObjectId } from 'mongoose'
import shortid from 'shortid'
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ref, uploadBytes, getDownloadURL, deleteObject, getMetadata } from "firebase/storage"
import {Storage, Bucket_url} from '../config/firebase';
import SchoolClass from '../db/schoolClass';

function generateId() {
    return `STF-${shortid.generate()}`;
  }


async function generateStudentId(schoolId: string): Promise<string> {
  try {
    const lastStudent = await Student.findOne({ schoolId }).sort({ studentId: -1 });

    let newStudentNumber = 1; // Default starting number
    if (lastStudent) {
      // If there is a last student, increment the number
      const lastStudentNumber: number = parseInt(lastStudent.studentId, 10);
      newStudentNumber = lastStudentNumber + 1;
    }

    const paddedNumber: string = String(newStudentNumber).padStart(3, '0'); // Pad with leading zeros
    const newStudentId: string = paddedNumber;

    return newStudentId;
  } catch (error) {
    throw new Error(`Error generating student ID: ${error.message}`);
  }
}

  

  export const createStudent: express.RequestHandler = async (req: Request, res: Response) => {
    try {
      const { name, lastName, address, dateOfBirth, phoneNumber, email, gender, studentClass, guardainsFullName } = req.body;
      const { schoolId } = req.params;
  
      // Check if the school with the provided schoolId exists
      const school: ISchool | null = await mySchool.findById(schoolId);
  
      if (!school) {
        return res.status(404).json({ error: 'School not found' });
      }
  
      // const Bucket_url = "gs://grapple-a4d53.appspot.com"
      // Check if the email already exists in the database
      const existingStudent: IStudent | null = await Student.findOne({ email });
  
      if (existingStudent) {
        return res.status(400).json({ error: 'Email already exists' });
      }
      // const fileName = `${uuidv4()}${path.extname(file.originalname)}
      let fileUrl: string | undefined;
  
      if (req.file) {
        const file = req.file;
        const fileName = `${uuidv4()}${path.extname(file.originalname)}`
        const folderName = 'My-School-app'
        const bucketRef = ref(Storage, Bucket_url);
        const fileRef = ref(bucketRef, `${folderName}/${fileName}`);
        await uploadBytes(fileRef, req.file.buffer, {
          contentType: req.file.mimetype,
        });
  
         // Get the profile picture URL
  
          fileUrl = await getDownloadURL(fileRef);
      }
  
  
      const studentId: string = await generateStudentId(schoolId);
  
      // Create a new student with or without the profile picture URL
      const studentData: any = {
        name,
        lastName,
        address,
        phoneNumber,
        dateOfBirth,
        email,
        gender,
        studentClass,
        guardainsFullName,
        school: school._id,
        studentId,
      };
  
      if (fileUrl) {
        studentData.profilePictureUrl = fileUrl;
      }
  
      // Create the student object
      const student = new Student(studentData);
  
      // Save the student to the database
      await student.save();
  
      return res.status(201).json({ message: 'Student created successfully', student });
    } catch (error) {
      console.error('Error creating student:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };

  export const updateStudentById: express.RequestHandler = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { name, lastName, address, dateOfBirth, phoneNumber, gender, studentClass, guardainsFullName } = req.body;
  
      // Check if the provided ID is a valid ObjectId (Mongoose ObjectId)
      if (!isValidObjectId(id)) {
        return res.status(400).json({ error: 'Invalid student ID' });
      }
  
      // Find the teacher by ID
      const existingStudent: IStudent | null = await Student.findById(id);
  
      if (!existingStudent) {
        return res.status(404).json({ error: 'Student not found' });
      }
  
      // Check if a new image is provided in the request
      if (req.file) {
        // Check if there is an existing profile picture
        if (existingStudent.profilePictureUrl) {
          // Split the existing URL to get the image name
        //   const imageUrlParts = existingStudent.profilePictureUrl.split('/');
          // Construct the reference to the existing image
          const fileRefToDelete = ref(Storage, existingStudent.profilePictureUrl);
          // console.log('Attempting to delete:', fileRefToDelete.fullPath);
          try {
            // const metadata = await getMetadata(fileRefToDelete);
            // console.log('Metadata of the object:', metadata);
            // Now, you can safely delete the object
            await deleteObject(fileRefToDelete);
            // console.log('Deleted successfully');
          } catch (error) {
            console.error('Error deleting existing image:', error);
            // Handle the error as needed
          }
        }
      
        // Upload the new image
        const file = req.file;
        const fileName = `${uuidv4()}${path.extname(file.originalname)}`;
        const folderName = 'My-School-app';
        const bucketRef = ref(Storage, Bucket_url);
        const fileRef = ref(bucketRef, `${folderName}/${fileName}`);
        await uploadBytes(fileRef, req.file.buffer, {
          contentType: req.file.mimetype,
        });
      
        // Update the profile picture URL with the URL of the new image
        const fileUrl = await getDownloadURL(fileRef);
        existingStudent.profilePictureUrl = fileUrl;
      }
  
      // Update other teacher information
      existingStudent.name = name;
      existingStudent.lastName = lastName;
      existingStudent.address = address;
      existingStudent.phoneNumber = phoneNumber;
      existingStudent.gender = gender;
      existingStudent.studentClass = studentClass;
      existingStudent.guardainsFullName = guardainsFullName;
      existingStudent.dateOfBirth = dateOfBirth;
      
      // Save the updated teacher to the database
      await existingStudent.save();
  
      return res.status(200).json({ message: 'Profile updated successfully', updatedStudent: existingStudent });
    } catch (error) {
      console.error('Error updating student by ID:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };

  export const getStudentsBySchoolId: express.RequestHandler = async (req, res) => {
    try {
      const { schoolId } = req.params;
  
      // Check if the school with the provided schoolId exists
      const school = await mySchool.findById(schoolId);
  
      if (!school) {
        return res.status(404).json({ error: 'School not found' });
      }
  
      // Fetch student associated with the school
      const students = await Student.find({ school: school._id });
  
      return res.status(200).json(students);
    } catch (error) {
      console.error('Error fetching students by schoolId:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };

  export const getStudentsById: express.RequestHandler = async (req, res) => {
    try {
      const { id } = req.params;
  
      // Check if the provided ID is a valid ObjectId (Mongoose ObjectId)
      if (!isValidObjectId(id)) {
        return res.status(400).json({ error: 'Invalid student ID' });
      }
  
      const student: IStudent | null = await Student.findById(id).populate('studentClass');
  
      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }
  
      return res.status(200).json(student);
    } catch (error) {
      console.error('Error fetching student by Id:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };

  export const getStudentsByClassId: express.RequestHandler = async (req, res) => {
    try {

      const { classId } = req.params;
      
      // Find class details
      const targetClass = await SchoolClass.findById(classId);
      
      if (!targetClass) {
        return res.status(404).json({ error: 'Class not found' });
    }

      const students = await Student.find({ studentClass: classId })

     if (!students) {
        return res.status(404).json({ error: 'Student not found' });
      }

      return res.status(200).json(students);
    } catch (error) {
      console.error('Error fetching student by classId:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };

  export const deleteStudentById: express.RequestHandler = async (req, res) => {
    try {
    const { id } = req.params;

    // Check if the provided ID is a valid ObjectId (Mongoose ObjectId)
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid student ID' });
    }

    // Find the student by ID and delete it
    const deletedStudent: IStudent | null = await Student.findByIdAndRemove(id);

    if (!deletedStudent) {
      return res.status(404).json({ error: 'Student not found' });
    }

    return res.status(200).json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Error deleting student by ID:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};