import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as LocalStrategy } from 'passport-local';
import User from "../models/user.js";
import { loginUser } from '../controllers/userController.js';

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "http://localhost:5001/auth/google/callback"
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const existingUser = await User.findOne({ email: profile.emails[0].value });
                if (existingUser) {
                    if (!existingUser.googleId) {
                        existingUser.googleId = profile.id;
                        existingUser.name = profile.displayName;
                        existingUser.profilePicture = profile.photos[0].value;
                        await existingUser.save();
                    }
                    return done(null, existingUser);
                }

                const username = profile.emails[0].value.split('@')[0];
                const newUser = new User({
                    username,
                    email: profile.emails[0].value,
                    googleId: profile.id,
                    name: profile.displayName,
                    profilePicture: profile.photos[0].value,
                    isAdmin: false
                });
                await newUser.save();
                done(null, newUser);
            } catch (error) {
                console.error("Google auth error:", error);
                done(error, false);
            }
        }
    )
);

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
},
async (email, password, done) => {
    try {
        const user = await loginUser(email, password);
        
        if (user.user) {
            return done(null, user.user);
        } else {
            return done(null, false, { message: user.message || 'Authentication failed' });
        }
    } catch (error) {
        return done(error);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

export default passport;

