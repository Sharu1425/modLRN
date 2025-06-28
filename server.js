import express from 'express';
import session from "express-session";
import cors from 'cors';
import connectDB from './backend/database.js';
import passport from "./backend/passportConfig.js";
import userRoutes from './routes/userRoute.js';
import qnRoutes from './routes/qnRoute.js';
import resultRoutes from './routes/resultRoutes.js';
import authRoutes from './routes/authRoutes.js';

const app = express();
const port = 5001;
connectDB();

app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: true,
    saveUninitialized: true,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: 'lax',
        path: '/'
    }
}));

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
    next();
});

app.post('/api/topic', (req, res) => {
    try {
        const { topic, qnCount, difficulty } = req.body;
        
        if (!req.user || !req.user._id) {
            return res.status(401).json({
                success: false,
                error: 'User not authenticated'
            });
        }

        if (!topic || !qnCount || !difficulty) {
            return res.status(400).json({ 
                success: false,
                error: 'Missing required fields' 
            });
        }

        if (typeof topic !== 'string' || topic.trim() === '') {
            return res.status(400).json({
                success: false,
                error: 'Invalid topic format'
            });
        }

        const parsedQnCount = parseInt(qnCount, 10);
        if (isNaN(parsedQnCount) || parsedQnCount <= 0 || parsedQnCount > 50) {
            return res.status(400).json({
                success: false,
                error: 'Invalid question count'
            });
        }

        const config = {
            userId: req.user._id,
            topic: topic.trim(),
            qnCount: parsedQnCount,
            difficulty: difficulty.trim()
        };
        
        req.session.assessmentConfig = config;
        
        res.json({ 
            success: true, 
            ...config
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            error: 'Internal server error' 
        });
    }
});

app.get('/api/topic', (req, res) => {
    try {
        const config = req.session.assessmentConfig;
        
        if (!config) {
            return res.status(404).json({ 
                success: false,
                error: 'No assessment configuration found' 
            });
        }
        
        if (!req.user || !req.user._id) {
            req.session.assessmentConfig = null;
            return res.status(401).json({
                success: false,
                error: 'User not authenticated'
            });
        }

        res.json({
            success: true,
            ...config,
            userId: req.user._id
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            error: 'Internal server error' 
        });
    }
});

app.use('/api/results', resultRoutes);
app.use("/auth", authRoutes);
app.use('/db', userRoutes);
app.use('/db', qnRoutes);

app.get('/', (req, res) => {
    res.send('Server is running');
});

app.use((err, req, res, next) => {
    res.status(500).json({ message: 'Internal server error', error: err.message });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});