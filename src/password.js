import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

import dotenv from "dotenv";

dotenv.config();

// Serialize user into session
passport.serializeUser((user, done) => {
  done(null, user);
});

// Deserialize user from session
passport.deserializeUser((user, done) => {
  done(null, user);
});

// Configure Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID, // Client ID from your .env file
      clientSecret: process.env.CLIENT_SECRET, // Client Secret from your .env file
      callbackURL: "http://localhost:8000/api/v1/users/google/callback", // Your callback URL
      passReqToCallback: true, // Allows the request object to be passed into the callback
    },
    (req, accessToken, refreshToken, profile, done) => {
      // Here, you typically find or create a user in the database
      try {
        // For now, we'll just return the profile as is
        done(null, profile);
      } catch (err) {
        done(err, false); // In case of error
      }
    }
  )
);

export default passport;
