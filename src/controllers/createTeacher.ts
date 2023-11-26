import express, { Request, Response } from 'express';
import mySchool, { ISchool } from '../db/myschools';
import Teacher, { ITeacher } from '../db/teacher';
import SchoolClass, { ISchoolClass } from '../db/schoolClass';
import { isValidObjectId } from 'mongoose'
import shortid from 'shortid'
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ref, uploadBytes, getDownloadURL, deleteObject, getMetadata } from "firebase/storage"
import { Storage, Bucket_url } from '../config/firebase';
import bcrypt from 'bcrypt'
import axios from 'axios';
import Subject from '../db/subject';
import mongoose from 'mongoose';

function generateStaffId(schoolShortName: string): string {
  return `${schoolShortName}-${shortid.generate()}`;
}

export const createTeacher: express.RequestHandler = async (req: Request, res: Response) => {
  try {
    const { name, lastName, address, phoneNumber, email, gender, teacherClass, teacherSubjects } = req.body;
    const { schoolId } = req.params;

    // Check if the school with the provided schoolId exists
    const school: ISchool | null = await mySchool.findById(schoolId);

    if (!school) {
      return res.status(404).json({ error: 'School not found' });
    }

    const schoolShortName = school.name.substring(0, 3).toUpperCase();

    // Check if the email already exists in the database
    const existingTeacher: ITeacher | null = await Teacher.findOne({ email }) || await mySchool.findOne({ email })

    if (existingTeacher) {
      return res.status(400).json({ error: 'Email already exists' });
    }



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

    // Find the schoolClass by its ObjectId


    const password = `${name.toLowerCase()}123`;

    const hashedPassword = await bcrypt.hash(password, 10);

    const response = await axios.post('https://techxmail.onrender.com/sendmail', {
      name: name,
      mail: email,
      text: `Email: ${email} \n Password: ${password}`,
      subject: "Your Login Details"
    });

    if (school.school_category === "Primary") {
      // Create a new teacher with or without the profile picture URL
      const schoolClass = await SchoolClass.findById(teacherClass);

      if (!schoolClass) {
        return res.status(404).json({ error: 'School class not found' });
      }
      const teacherData: any = {
        name,
        lastName,
        address,
        phoneNumber,
        email,
        gender,
        password: hashedPassword,
        teacherClass: teacherClass, // Store the teacherClassId
        school: school._id,
        role: "Teacher",
        staffId: generateStaffId(schoolShortName),
      };

      if (fileUrl) {
        teacherData.profilePictureUrl = fileUrl;
      }

      // Create the teacher object
      const teacher: ITeacher = new Teacher(teacherData);

      // Save the teacher to the database
      await teacher.save();

      // Update the assignedTeacher field in the schoolClass document
      schoolClass.assignedTeacher = teacher._id; // Use the teacher's ObjectId

      await schoolClass.save();

      return res.status(201).json({ message: 'Teacher created successfully. Login details have been sent to their email.', teacher });

    } else if (school.school_category === "Secondary") {
      // Assign the teacher to the specified subjects
      const teacherData: any = {
        name,
        lastName,
        address,
        phoneNumber,
        email,
        gender,
        password: hashedPassword,
        school: school._id,
        teacherSubject: teacherSubjects,
        role: "Teacher",
        staffId: generateStaffId(schoolShortName),
      };

      // if (teacherSubjects && teacherSubjects.length > 0) {
      //   teacherData.teacherSubject = teacherSubjects;
      // }

      if (fileUrl) {
        teacherData.profilePictureUrl = fileUrl;
      }

      // Create the teacher object
      const teacher: ITeacher = new Teacher(teacherData);
      // Save the teacher to the database
      await teacher.save();
      const subjectIdsArray = teacherSubjects.split(',');

      const cleanedTeacherSubjects: string[] = subjectIdsArray.map((subjectId: string) => subjectId.trim());

      // Assign the teacher to the specified subjects
      for (const subjectId of cleanedTeacherSubjects) {
        const subject = await Subject.findById(subjectId);

        if (subject) {
          subject.teacher = teacher._id; // Use the teacher's ObjectId
          await subject.save();
        }
      }


      return res.status(201).json({ message: 'Teacher created successfully. Login details have been sent to their email.', teacher });
    }



  } catch (error) {
    console.error('Error creating teacher:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// export const createTeacher: express.RequestHandler = async (req: Request, res: Response) => {
//   try {
//     const { name, lastName, address, phoneNumber, email, gender, teacherClass, teacherSubjects } = req.body;
//     const { schoolId } = req.params;

//     // Check if the school with the provided schoolId exists
//     const school: ISchool | null = await mySchool.findById(schoolId);

//     if (!school) {
//       return res.status(404).json({ error: 'School not found' });
//     } 

//     const schoolShortName = school.name.substring(0, 3).toUpperCase();

//     // Check if the email already exists in the database
//     const existingTeacher: ITeacher | null = await Teacher.findOne({ email }) || await mySchool.findOne({ email });

//     if (existingTeacher) {
//       return res.status(400).json({ error: 'Email already exists' });
//     }

//     let fileUrl: string | undefined;

//     if (req.file) {
//       // ... (existing file upload logic)
//     }

//     // Find the schoolClass by its ObjectId
//     const schoolClass = await SchoolClass.findById(teacherClass);

//     if (!schoolClass) {
//       return res.status(404).json({ error: 'School class not found' });
//     }

//     const password = `${name.toLowerCase()}123`;
//     const hashedPassword = await bcrypt.hash(password, 10);

//     if (school.school_category === "Primary") {
//       // Create a new teacher with or without the profile picture URL
//       const teacherData: any = {
//         name,
//         lastName,
//         address,
//         phoneNumber,
//         email,
//         gender,
//         password: hashedPassword,
//         teacherClass: teacherClass, // Store the teacherClassId
//         school: school._id,
//         role: "Teacher",
//         staffId: generateStaffId(schoolShortName),
//       };

//       if (fileUrl) {
//         teacherData.profilePictureUrl = fileUrl;
//       }

//       // Create the teacher object
//       const teacher: ITeacher = new Teacher(teacherData);

//       // Save the teacher to the database
//       await teacher.save();

//       // Update the assignedTeacher field in the schoolClass document
//       schoolClass.assignedTeacher = teacher._id; // Use the teacher's ObjectId

//       await schoolClass.save();

//       return res.status(201).json({ message: 'Teacher created successfully. Login details have been sent to their email.', teacher });
//     }

//     if (school.school_category === "Secondary") {
//       // Assign the teacher to the specified subjects
//       const teacherData: any = {
//         name,
//         lastName,
//         address,
//         phoneNumber,
//         email,
//         gender,
//         password: hashedPassword,
//         school: school._id,
//         role: "Teacher",
//         staffId: generateStaffId(schoolShortName),
//       };

//       if (fileUrl) {
//         teacherData.profilePictureUrl = fileUrl;
//       }

//       // Create the teacher object
//       const teacher: ITeacher = new Teacher(teacherData);

//       // Save the teacher to the database
//       await teacher.save();

//       // Assign the teacher to the specified subjects
//       for (const subjectId of teacherSubjects) {
//         const subject = await Subject.findById(subjectId);
//         if (subject) {
//           subject.teacher = teacher._id; // Use the teacher's ObjectId
//           await subject.save();
//         }
//       }

//       return res.status(201).json({ message: 'Teacher created successfully. Login details have been sent to their email.', teacher });
//     }
//   } catch (error) {
//     console.error('Error creating teacher:', error);
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// };



export const updateTeacherById: express.RequestHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, lastName, address, phoneNumber, gender, role, teacherClass, teacherSubjects } = req.body;

    // Check if the provided ID is a valid ObjectId (Mongoose ObjectId)
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid teacher ID' });
    }

    // Find the teacher by ID
    const existingTeacher: ITeacher | null = await Teacher.findById(id);

    if (!existingTeacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    const school: ISchool | null = await mySchool.findById(existingTeacher.school)

    if (school.school_category === "Primary") {
      const schoolClass = await SchoolClass.findById(teacherClass);

      if (!schoolClass) {
        return res.status(404).json({ error: 'School class not found' });
      }

      // Check if a new image is provided in the request
      if (req.file) {
        // Check if there is an existing profile picture
        if (existingTeacher.profilePictureUrl) {
          // Split the existing URL to get the image name
          const imageUrlParts = existingTeacher.profilePictureUrl.split('/');
          // Construct the reference to the existing image
          const fileRefToDelete = ref(Storage, existingTeacher.profilePictureUrl);
          // console.log('Attempting to delete:', fileRefToDelete.fullPath);
          try {
            const metadata = await getMetadata(fileRefToDelete);
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
        existingTeacher.profilePictureUrl = fileUrl;
      }

      // Update other teacher information
      existingTeacher.name = name;
      existingTeacher.lastName = lastName;
      existingTeacher.address = address;
      existingTeacher.phoneNumber = phoneNumber;
      existingTeacher.gender = gender;
      existingTeacher.role = role;
      existingTeacher.teacherClass = teacherClass;

      // Save the updated teacher to the database
      await existingTeacher.save();

      schoolClass.assignedTeacher = existingTeacher._id; // Use the teacher's ObjectId

      await schoolClass.save();

      return res.status(200).json({ message: 'Profile updated successfully', updatedTeacher: existingTeacher });
    } else if (school.school_category === "Secondary") {
      for (const subjectId of teacherSubjects) {
        const subject = await Subject.findById(subjectId);
        if (subject) {
          subject.teacher = existingTeacher._id; // Use the teacher's ObjectId
          await subject.save();
        }
      }
    }

    return res.status(200).json({ message: 'Teacher updated successfully', existingTeacher });

  } catch (error) {
    console.error('Error updating teacher by ID:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
