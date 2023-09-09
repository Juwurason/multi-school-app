import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import mySchool, { ISchool } from './db/myschools';


const JWT_SECRET = "mongodb//sunday:ajibolason@sund"; // Replace with your actual secret key

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: JWT_SECRET,
};

passport.use(
  new JwtStrategy(options, async (jwtPayload, done) => {
    try {
      // console.log('Decoded JWT Payload:', jwtPayload);

      const user = await mySchool.findById(jwtPayload.schoolId);

      if (!user) {
        // console.log("decode error");
        return done(null, false);
      }
      
      return done(null, user);
    } catch (error) {
      console.error('Error verifying token:', error);
      return done(error, false);
    }
  })
);

export default passport;
