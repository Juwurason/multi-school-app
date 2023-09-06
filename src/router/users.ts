import express from 'express'
// import passport from 'passport'

import { deleteUser, getAllUsers, updateUser } from '../controllers/users'
import { getAllSchools } from '../controllers/schools'
import { isAuthenticated, isOwner } from '../middlewares'
import passport from '../passport-config';

export default (router: express.Router) => {
    router.get('/users', isAuthenticated, getAllUsers);
    router.get('/allschools', passport.authenticate('jwt', { session: false }), getAllSchools);
    router.delete('/users/:id', isAuthenticated, isOwner, deleteUser);
    router.patch('/users/:id', isAuthenticated, isOwner, updateUser);
}