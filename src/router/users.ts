import express from 'express'
import { getTeachersBySchoolId, getTeachersById, deleteTeacherById } from '../controllers/getTeacher'
import { createTeacher, updateTeacherById } from '../controllers/createTeacher';
import passport from '../passport-config';
import multer from 'multer';
import { getSchoolById, updateSchoolById } from '../controllers/authentication';
import { newsLetter, getLetterBySchoolId, sendNewsLetter, sendNewsLetterToAll, updateNewsLetterById, deleteLetterById, getLetterById } from '../controllers/newsLetter'
import { createStudent, deleteStudentById, getStudentsByClassId, getStudentsById, getStudentsBySchoolId, updateStudentById } from '../controllers/student';
import { deleteSchoolClassById, getSchoolClassById, getSchoolClassBySchoolId, schoolClass } from '../controllers/schoolClass';
import { deleteSubjectById, getSubjectByClassId, getSubjectById, getSubjectBySchoolId, subject } from '../controllers/subject';
import { deleteScoreById, getScoreById, getScoreBySchoolId, score, updateScoreById } from '../controllers/score';
import { createGradeFormat, deleteGradeFormatById, getGradeFormatById, getGradeFormatsBySchoolId, updateGradeById } from '../controllers/grade';
import { deleteStudentScoreById, getScoresById, getStudentScoreById, studentGrade, updateStudentScoreById } from '../controllers/studentGrade';
import { deleteReportById, getReportAndScoreByEmail, getReportById, getReportsByStudentId, report, updateReportById } from '../controllers/report';
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
    router.get('/get_grade/:schoolId', passport.authenticate('jwt', { session: false }), getGradeFormatsBySchoolId);
    router.get('/get_score/:schoolId', passport.authenticate('jwt', { session: false }), getScoreBySchoolId);
    router.get('/get_class_byId/:id', passport.authenticate('jwt', { session: false }), getSchoolClassById);
    router.get('/get_subject_byId/:id', passport.authenticate('jwt', { session: false }), getSubjectById);
    router.get('/get_subject_byClassId/:classId/:schoolId', passport.authenticate('jwt', { session: false }), getSubjectByClassId);
    router.get('/get_student_byId/:id', passport.authenticate('jwt', { session: false }), getStudentsById);
    router.get('/get_student_byClassId/:classId', passport.authenticate('jwt', { session: false }), getStudentsByClassId);
    router.get('/get_school_byId/:id', passport.authenticate('jwt', { session: false }), getSchoolById);
    router.post('/delete_teacher/:id', passport.authenticate('jwt', { session: false }), deleteTeacherById);
    router.post('/delete_subject/:id', passport.authenticate('jwt', { session: false }), deleteSubjectById);
    router.post('/delete_school_class/:id', passport.authenticate('jwt', { session: false }), deleteSchoolClassById);
    router.post('/delete_student/:id', passport.authenticate('jwt', { session: false }), deleteStudentById);
    router.post('/add_teacher/:schoolId/teachers', upload.single('profilePicture'), passport.authenticate('jwt', { session: false }), createTeacher);
    router.post('/add_classes/:schoolId/classes', passport.authenticate('jwt', { session: false }), schoolClass);
    router.post('/add_subjects/:schoolId/subjects', passport.authenticate('jwt', { session: false }), subject);
    router.post('/add_score/:schoolId', passport.authenticate('jwt', { session: false }), score);
    router.post('/add_report/:studentId', passport.authenticate('jwt', { session: false }), report);
    router.post('/update_report/:reportId', passport.authenticate('jwt', { session: false }), updateReportById);
    router.get('/report_details/:reportId', passport.authenticate('jwt', { session: false }), getReportById);
    router.get('/get_student_report/:studentId', passport.authenticate('jwt', { session: false }), getReportsByStudentId);
    router.post('/delete_report/:reportId', passport.authenticate('jwt', { session: false }), deleteReportById);
    router.post('/add_student_score/:schoolId/:studentId/:subjectId', passport.authenticate('jwt', { session: false }), studentGrade);
    router.post('/update_student_score/:id', passport.authenticate('jwt', { session: false }), updateStudentScoreById);
    router.get('/get_student_score/:schoolId/:studentId', passport.authenticate('jwt', { session: false }), getStudentScoreById);
    router.get('/get_student_score_byId/:id', passport.authenticate('jwt', { session: false }), getScoresById);
    router.get('/get_student_score_&_report/:studentId', passport.authenticate('jwt', { session: false }), getReportAndScoreByEmail);
    router.post('/delete_student_score_byId/:id', passport.authenticate('jwt', { session: false }), deleteStudentScoreById);
    router.post('/update_score/:id', passport.authenticate('jwt', { session: false }), updateScoreById);
    router.post('/delete_score/:id', passport.authenticate('jwt', { session: false }), deleteScoreById);
    router.get('/get_score_byId/:id', passport.authenticate('jwt', { session: false }), getScoreById);
    router.post('/add_grade/:schoolId', passport.authenticate('jwt', { session: false }), createGradeFormat);
    router.post('/update_grade/:id', passport.authenticate('jwt', { session: false }), updateGradeById);
    router.post('/delete_grade/:id', passport.authenticate('jwt', { session: false }), deleteGradeFormatById);
    router.get('/get_grade_byId/:id', passport.authenticate('jwt', { session: false }), getGradeFormatById);
    router.post('/add_student/:schoolId/student', upload.single('profilePicture'), passport.authenticate('jwt', { session: false }), createStudent);
    router.post('/news_Letter/:schoolId/school_news', upload.single('newsLetter'), passport.authenticate('jwt', { session: false }), newsLetter);
    router.post('/update_Letter/:id', upload.single('newsLetter'), passport.authenticate('jwt', { session: false }), updateNewsLetterById);
    router.post('/delete_Letter/:id', passport.authenticate('jwt', { session: false }), deleteLetterById);
    router.get('/get_Letter_details/:id', passport.authenticate('jwt', { session: false }), getLetterById);
    router.post('/send-newsletter/:classId', upload.single('newsLetter'), passport.authenticate('jwt', { session: false }), sendNewsLetter);
    router.post('/send-newsletter_to_all/:schoolId', upload.single('newsLetter'), passport.authenticate('jwt', { session: false }), sendNewsLetterToAll);
    router.post('/update_teacher/:id', upload.single('profilePicture'), passport.authenticate('jwt', { session: false }), updateTeacherById);
    router.post('/update_student/:id', upload.single('profilePicture'), passport.authenticate('jwt', { session: false }), updateStudentById);
    router.post('/update_school/:id', upload.single('schoolLogo'), passport.authenticate('jwt', { session: false }), updateSchoolById);
 
}