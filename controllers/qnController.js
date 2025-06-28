import Question from "../models/question.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

const addQuestion = async (Topic, Difficulty, questions) => {
    try {
        for (const qn of questions) {
            const { question, options, correctAnswer } = qn;
            const newQuestion = new Question({ 
                topic: Topic.trim(), 
                difficulty: Difficulty.trim(), 
                question, 
                options, 
                answer: correctAnswer 
            });
            await newQuestion.save();
        }
        return { status: 201, message: "Questions added successfully" };
    } catch (error) {
        console.error('Error adding questions:', error);
        return { status: 400, error: "Error adding questions" };
    }
}

const fetchQuestionsFromGemini = async (req, res) => {
    try {
        const { topic, difficulty, count } = req.query;
        console.log('Fetching questions from Gemini:', { topic, difficulty, count });

        if (!topic || !difficulty || !count) {
            return res.status(400).json({ 
                success: false,
                error: 'Missing required parameters' 
            });
        }

        const prompt = `Generate ${count} multiple-choice questions on ${topic} with ${difficulty} difficulty. Provide the questions in JSON format with the following structure: [{"question": "", "options": ["", "", "", ""], "correctAnswer": ""}]`;
        
        console.log('Using prompt:', prompt);
        
        const result = await model.generateContent(prompt);
        const questions = JSON.parse(result.response.text().replace(/```json|```/g, ''));
        
        console.log(`Generated ${questions.length} questions from Gemini`);
        
        try {
            await addQuestion(topic, difficulty, questions);
            console.log('Questions stored in database');
        } catch (dbError) {
            console.error('Error storing questions in database:', dbError);
        }

        const questionsForFrontend = questions.map(q => ({
            question: q.question,
            options: q.options,
            answer: q.correctAnswer 
        }));

        res.json(questionsForFrontend);
    } catch (error) {
        console.error('Error generating questions:', error);
        if (error.message.includes('API key')) {
            res.status(500).json({ 
                success: false,
                error: 'Gemini API key is not configured properly' 
            });
        } else {
            res.status(500).json({ 
                success: false,
                error: 'Failed to generate questions from Gemini API' 
            });
        }
    }
};

export { addQuestion, fetchQuestionsFromGemini };