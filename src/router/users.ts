import express from 'express'
import { getTeachersBySchoolId, getTeachersById, deleteTeacherById } from '../controllers/getTeacher'
import { createTeacher, updateTeacherById } from '../controllers/createTeacher';
import passport from '../passport-config';
import multer from 'multer';
import { getSchoolById, updateSchoolById } from '../controllers/authentication';
import { newsLetter, getLetterBySchoolId } from '../controllers/newsLetter'
import { createStudent, deleteStudentById, getStudentsById, getStudentsBySchoolId, updateStudentById } from '../controllers/student';
import { getSchoolClassById, getSchoolClassBySchoolId, schoolClass } from '../controllers/schoolClass';
import { getSubjectById, getSubjectBySchoolId, subject } from '../controllers/subject';
// Create a Multer storage for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

export default (router: express.Router) => {
    router.get("/", (req, res) =>{
        res.json({message: "Hello, backend"})
    })
    router.get('/get_all_teacher-by_school_Id/:schoolId/teachers', passport.authenticate('jwt', { session: false }), getTeachersBySchoolId);
    router.get('/get_all_school-classes-by_school_Id/:schoolId/classes', passport.authenticate('jwt', { session: false }), getSchoolClassBySchoolId);
    router.get('/get_all_school-subjects-by_school_Id/:schoolId/subjects', passport.authenticate('jwt', { session: false }), getSubjectBySchoolId);
    router.get('/get_all_students-by_school_Id/:schoolId/students', passport.authenticate('jwt', { session: false }), getStudentsBySchoolId);
    router.get('/get_all_news_Letter_by_school_Id/:schoolId/newsLetter', passport.authenticate('jwt', { session: false }), getLetterBySchoolId);
    router.get('/get_teacher_byId/:id', passport.authenticate('jwt', { session: false }), getTeachersById);
    router.get('/get_class_byId/:id', passport.authenticate('jwt', { session: false }), getSchoolClassById);
    router.get('/get_subject_byId/:id', passport.authenticate('jwt', { session: false }), getSubjectById);
    router.get('/get_student_byId/:id', passport.authenticate('jwt', { session: false }), getStudentsById);
    router.get('/get_school_byId/:id', passport.authenticate('jwt', { session: false }), getSchoolById);
    router.post('/delete_teacher/:id', passport.authenticate('jwt', { session: false }), deleteTeacherById);
    router.post('/delete_student/:id', passport.authenticate('jwt', { session: false }), deleteStudentById);
    router.post('/add_teacher/:schoolId/teachers', upload.single('profilePicture'), passport.authenticate('jwt', { session: false }), createTeacher);
    router.post('/add_classes/:schoolId/classes', passport.authenticate('jwt', { session: false }), schoolClass);
    router.post('/add_subjects/:schoolId/subjects', passport.authenticate('jwt', { session: false }), subject);
    router.post('/add_student/:schoolId/student', upload.single('profilePicture'), passport.authenticate('jwt', { session: false }), createStudent);
    router.post('/news_Letter/:schoolId/school_news', upload.single('newsLetter'), passport.authenticate('jwt', { session: false }), newsLetter);
    router.post('/update_teacher/:id', upload.single('profilePicture'), passport.authenticate('jwt', { session: false }), updateTeacherById);
    router.post('/update_student/:id', upload.single('profilePicture'), passport.authenticate('jwt', { session: false }), updateStudentById);
    router.post('/update_school/:id', upload.single('schoolLogo'), passport.authenticate('jwt', { session: false }), updateSchoolById);
 
}