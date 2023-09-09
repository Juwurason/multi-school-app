import express from 'express'
import { getTeachersBySchoolId, getTeachersById, deleteTeacherById } from '../controllers/getTeacher'
import { createTeacher, updateTeacherById } from '../controllers/createTeacher';
import passport from '../passport-config';

export default (router: express.Router) => {
    
    router.get('/get_all_teacher-by_school_Id/:schoolId/teachers', passport.authenticate('jwt', { session: false }), getTeachersBySchoolId);
    router.get('/get_teacher_byId/:id', passport.authenticate('jwt', { session: false }), getTeachersById);
    router.post('/delete_teacher/:id', passport.authenticate('jwt', { session: false }), deleteTeacherById);
    router.post('/add_teacher/:schoolId/teachers', passport.authenticate('jwt', { session: false }), createTeacher);
    router.post('/update_teacher/:id', passport.authenticate('jwt', { session: false }), updateTeacherById);
  
}