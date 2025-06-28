import express from 'express';
import { addQuestion, fetchQuestionsFromGemini } from '../controllers/qnController.js';

const router = express.Router();

router.post("/questions", async (req, res) => {
    const { Topic, Difficulty, questions } = req.body;
    const newQuestion = await addQuestion(Topic, Difficulty, questions);
    res.status(newQuestion.status).json({message : newQuestion.message, error: newQuestion.error });
} );

router.get('/questions', fetchQuestionsFromGemini);

export default router;