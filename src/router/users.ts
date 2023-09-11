import express from 'express'
import { getTeachersBySchoolId, getTeachersById, deleteTeacherById } from '../controllers/getTeacher'
import { createTeacher, updateTeacherById } from '../controllers/createTeacher';
import passport from '../passport-config';
import multer from 'multer';
import { getSchoolById, updateSchoolById } from '../controllers/authentication';
// Create a Multer storage for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

export default (router: express.Router) => {
    router.get("/", (req, res) =>{
        res.json({message: "Hello, backend"})
    })
    router.get('/get_all_teacher-by_school_Id/:schoolId/teachers', passport.authenticate('jwt', { session: false }), getTeachersBySchoolId);
    router.get('/get_teacher_byId/:id', passport.authenticate('jwt', { session: false }), getTeachersById);
    router.get('/get_school_byId/:id', passport.authenticate('jwt', { session: false }), getSchoolById);
    router.post('/delete_teacher/:id', passport.authenticate('jwt', { session: false }), deleteTeacherById);
    router.post('/add_teacher/:schoolId/teachers', upload.single('profilePicture'), passport.authenticate('jwt', { session: false }), createTeacher);
    router.post('/update_teacher/:id', upload.single('profilePicture'), passport.authenticate('jwt', { session: false }), updateTeacherById);
    router.post('/update_school/:id', upload.single('schoolLogo'), passport.authenticate('jwt', { session: false }), updateSchoolById);
 
}