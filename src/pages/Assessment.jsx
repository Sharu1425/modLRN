import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedBackground from "../components/AnimatedBackground";
import axios from "axios";

const api = axios.create({
    withCredentials: true
});

function Assessment() {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [userAnswers, setUserAnswers] = useState([]);
    const [score, setScore] = useState(0);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState(0);
    const [config, setConfig] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const questionsFetched = useRef(false);

    const fetchQuestions = useCallback(async () => {
        try {
            const configResponse = await api.get("/api/topic");
            
            if (!configResponse.data.success) {
                throw new Error(configResponse.data.error || 'Failed to get assessment configuration');
            }

            const { topic, qnCount, difficulty } = configResponse.data;
            setConfig(configResponse.data);
            
            const geminiResponse = await api.get("/db/questions", {
                params: {
                    topic,
                    difficulty,
                    count: qnCount
                }
            });
            
            if (!Array.isArray(geminiResponse.data) || geminiResponse.data.length === 0) {
                throw new Error('No questions were generated. Please try again.');
            }
            
            setQuestions(geminiResponse.data);
            setLoading(false);
        } catch (error) {
            setError(error.response?.data?.error || error.message || 'Failed to load questions');
            setLoading(false);
        }
    }, []);

    const handleEndAssessment = useCallback(async (finalScore) => {
        try {
            if (!config) {
                throw new Error('No assessment configuration found');
            }

            const result = {
                userId: config.userId,
                score: finalScore,
                totalQuestions: questions.length,
                questions: questions.map(q => ({
                    question: q.question,
                    options: q.options,
                    answer: q.answer
                })),
                userAnswers: userAnswers,
                topic: config.topic,
                difficulty: config.difficulty
            };

            const response = await api.post("/api/results", result);
            
            if (!response.data.success) {
                throw new Error(response.data.error || 'Failed to save results');
            }
            
            navigate("/results", { 
                state: { 
                    score: finalScore,
                    totalQuestions: questions.length,
                    topic: config.topic,
                    difficulty: config.difficulty
                } 
            });
        } catch (error) {
            setError(error.response?.data?.error || "Failed to save results. Please try again.");
        }
    }, [config, questions, userAnswers, navigate]);

    useEffect(() => {
        if (!questionsFetched.current) {
            questionsFetched.current = true;
            fetchQuestions();
        }
    }, [fetchQuestions]);

    useEffect(() => {
        if (userAnswers.length === questions.length && questions.length > 0) {
            const newScore = userAnswers.reduce((acc, answer, index) => {
                const correctAnswer = questions[index]?.answer;
                const isCorrect = correctAnswer && answer === correctAnswer;
                return isCorrect ? acc + 1 : acc;
            }, 0);
            setScore(newScore);
            handleEndAssessment(newScore);
        }
    }, [userAnswers, questions, handleEndAssessment]);

    useEffect(() => {
        if (loading) {
            const interval = setInterval(() => {
                setProgress((prevProgress) => {
                    if (prevProgress < 95) {
                        return Math.min(prevProgress + 1, 95);
                    } else {
                        clearInterval(interval);
                        return prevProgress;
                    }
                });
            }, 20);
            return () => clearInterval(interval);
        }
    }, [loading]);

    const handleAnswer = useCallback((answer) => {
        setUserAnswers(prevAnswers => [...prevAnswers, answer]);
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(prev => prev + 1);
        }
    }, [currentQuestion, questions.length]);

    const question = useMemo(() => 
        questions.length > 0 ? questions[currentQuestion] : null,
        [questions, currentQuestion]
    );

    return (
        <>
            <AnimatedBackground />
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="container mx-auto px-4 pt-24 pb-8 relative z-10"
            >
                <motion.div
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    className="text-center mb-12"
                >
                    <h2 className="text-5xl font-bold gradient-text mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                        Adaptive Assessment
                    </h2>
                    <p className="text-purple-200 text-xl">Test your knowledge</p>
                </motion.div>

                {loading ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center"
                    >
                        <p className="text-purple-200 text-lg mb-4">Loading questions...</p>
                        <div className="w-full bg-purple-900/30 rounded-full h-2.5">
                            <motion.div 
                                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2.5 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                            ></motion.div>
                        </div>
                    </motion.div>
                ) : error ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center"
                    >
                        <p className="text-red-300 text-lg mb-4">{error}</p>
                        <button 
                            onClick={() => navigate("/assess-config")}
                            className="px-8 py-3 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700 transition-colors duration-300"
                        >
                            Configure Assessment
                        </button>
                    </motion.div>
                ) : question && (
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentQuestion}
                            initial={{ x: 300, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -300, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="glass-card p-8 rounded-2xl neon-border shadow-xl backdrop-blur-xl border-1 relative overflow-hidden hover:shadow-2xl transition-all duration-300"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10"></div>
                            <div className="relative space-y-6">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-xl font-semibold text-purple-200">
                                        Question {currentQuestion + 1} of {questions.length}
                                    </h3>
                                    <div className="w-32 bg-purple-900/30 rounded-full h-2">
                                        <div 
                                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                                            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                                
                                <p className="text-xl text-purple-200">{question?.question}</p>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {question?.options?.map((option, index) => (
                                        <motion.button
                                            key={index}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => handleAnswer(option)}
                                            className="p-4 rounded-lg bg-purple-900/20 border border-purple-500/30 text-purple-200 hover:bg-purple-900/30 transition-all duration-300 hover:border-purple-400 hover:shadow-lg hover:scale-[1.02]"
                                        >
                                            {option}
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                )}
            </motion.div>
        </>
    );
}

export default Assessment;
