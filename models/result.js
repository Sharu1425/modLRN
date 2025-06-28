import mongoose from "mongoose";

const resultSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    score: {
        type: Number,
        required: true
    },
    totalQuestions: {
        type: Number,
        required: true
    },
    questions: [{
        question: String,
        options: [String],
        answer: String
    }],
    userAnswers: [String],
    date: {
        type: Date,
        default: Date.now
    },
    topic: {
        type: String,
        required: true
    },
    difficulty: {
        type: String,
        required: true
    }
});

const Result = mongoose.model("Result", resultSchema);

export default Result;


































