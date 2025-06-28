import express from "express";
import session from "express-session";
import passport from "../passportConfig.js";
import authRoutes from "../routes/authRoutes.js";

const app = express(); 

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session());

app.use("/auth", authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


