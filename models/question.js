import mongoose from "mongoose";

const questionsSchema = new mongoose.Schema({
    topic: {
        type: String,
        required: true
    },
    difficulty: {
        type: String,
        required: true
    },
    question: {
        type: String,
        required: true,
        unique: true
    },
    answer: {
        type: String,
        required: true
    },
    options: {
        type: Array,
        required: true
    }
});

const Question = mongoose.model("question", questionsSchema);
export default Question;