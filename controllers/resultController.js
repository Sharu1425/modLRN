import Result from "../models/result.js";
import User from "../models/user.js";

const getResults = async () => {
    try {
        const results = await Result.find();
        return { status: 200, message: "Results found", results };
    } catch (error) {
        return { status: 500, message: error.message, error: true };
    }
}

const addResult = async (user, questions, userAnswers, score) => {
    try {
        const newResult = new Result({ userId : user._id , questions, userAnswers, score });
        await newResult.save();
        return { status: 200, message: "Result added"};
    }
    catch (error) {
        return { status: 500, error: "Error Adding Result" };
    }
}

export const createResult = async (req, res) => {
    try {
        const { userId, score, totalQuestions, questions, userAnswers, topic, difficulty } = req.body;
        
        console.log('Attempting to create result with data:', {
            userId,
            score,
            totalQuestions,
            questionsCount: questions?.length,
            userAnswersCount: userAnswers?.length,
            topic,
            difficulty
        });

        if (!userId || score === undefined || totalQuestions === undefined || !questions || !userAnswers || !topic || !difficulty) {
             console.error('Validation failed: Missing required fields for result creation.', { userId: !!userId, score: score !== undefined, totalQuestions: totalQuestions !== undefined, questions: !!questions, userAnswers: !!userAnswers, topic: !!topic, difficulty: !!difficulty });
            return res.status(400).json({
                success: false,
                error: 'Missing required fields for result creation.'
            });
        }

        console.log('Validation passed. Creating new Result instance.');
        const result = new Result({
            userId,
            score,
            totalQuestions,
            questions,
            userAnswers,
            topic,
            difficulty
        });

        console.log('Saving result to database...');
        const savedResult = await result.save();
        console.log('Result saved successfully with ID:', savedResult._id);
        
        res.status(201).json({
            success: true,
            message: 'Result saved successfully',
            result: savedResult
        });
    } catch (error) {
        console.error('Error creating or saving result:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to save result due to server error.', 
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export const getUserResults = async (req, res) => {
    try {
        const { userId } = req.params;
        const results = await Result.find({ userId })
            .sort({ date: -1 })
            .select('score totalQuestions date topic difficulty');
        res.status(200).json({
            success: true,
            results
        });
    } catch (error) {
        console.error('Error fetching user results:', error);
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
};

export const getResult = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await Result.findById(id);
        if (!result) {
            return res.status(404).json({ 
                success: false,
                error: "Result not found" 
            });
        }
        res.status(200).json({
            success: true,
            result
        });
    } catch (error) {
        console.error('Error fetching result:', error);
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
};

export { getResults, addResult };