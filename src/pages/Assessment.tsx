import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { User, Question, AssessmentConfig } from "../types";
import { useTheme } from "../contexts/ThemeContext";
import { useToast } from "../hooks/useToast";
import AnimatedBackground from "../components/AnimatedBackground";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import api from "../utils/api";
import { ANIMATION_VARIANTS, TRANSITION_DEFAULTS } from "../utils/constants";

interface AssessmentProps {
    user: User;
}

const Assessment: React.FC<AssessmentProps> = ({ user }) => {
    const { mode, colorScheme } = useTheme();
    const { success, error: showError } = useToast();
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [userAnswers, setUserAnswers] = useState<string[]>([]);
    const [score, setScore] = useState(0);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState(0);
    const [config, setConfig] = useState<AssessmentConfig | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isAuthChecking, setIsAuthChecking] = useState(true);
    const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false); // Add flag to prevent multiple submissions
    const navigate = useNavigate();
    const questionsFetched = useRef(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const token = localStorage.getItem('access_token');
                if (!token) {
                    navigate('/login', { replace: true });
                    return;
                }
                const response = await api.get('/auth/status');
                if (!response.data.isAuthenticated) {
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('user');
                    navigate('/login', { replace: true });
                    return;
                }
                setIsAuthChecking(false);
            } catch (error) {
                console.error('Auth check failed:', error);
                localStorage.removeItem('access_token');
                localStorage.removeItem('user');
                navigate('/login', { replace: true });
            }
        };

        checkAuth();
    }, [navigate]);

    const getDifficultyTime = (difficulty: string, questionCount: number) => {
        const timePerQuestion = {
            'easy': 60,      // 1 minute per question
            'medium': 90,    // 1.5 minutes per question
            'hard': 120      // 2 minutes per question
        };
        return (timePerQuestion[difficulty as keyof typeof timePerQuestion] || 90) * questionCount;
    };

    const fetchQuestions = useCallback(async () => {
        try {
            console.log("🔍 Fetching assessment configuration...");
            const configResponse = await api.get("/api/topic");
                        
            if (!configResponse.data.success) {
                throw new Error(configResponse.data.error || 'Failed to get assessment configuration');
            }
            const { topic, qnCount, difficulty } = configResponse.data;
            console.log("✅ Config received:", { topic, qnCount, difficulty });
                        
            const assessmentConfig: AssessmentConfig = {
                topic,
                qnCount,
                difficulty
            };
                        
            setConfig(assessmentConfig);
                        
            // Set timer based on difficulty
            const totalTime = getDifficultyTime(difficulty, qnCount);
            setTimeRemaining(totalTime);
                        
            console.log("🔍 Fetching questions from Gemini...");
            const geminiResponse = await api.get("/db/questions", {
                params: {
                    topic,
                    difficulty,
                    count: qnCount
                }
            });
                        
            console.log("✅ Questions received:", geminiResponse.data);
                        
            if (!Array.isArray(geminiResponse.data) || geminiResponse.data.length === 0) {
                throw new Error('No questions were generated. Please try again.');
            }
                        
            setQuestions(geminiResponse.data);
            setLoading(false);
        } catch (error: any) {
            console.error("❌ Error fetching questions:", error);
            let errorMessage = 'Failed to load questions';
                        
            if (error.response?.data?.detail) {
                errorMessage = typeof error.response.data.detail === 'string'
                     ? error.response.data.detail
                     : JSON.stringify(error.response.data.detail);
            } else if (error.message) {
                errorMessage = error.message;
            }
                        
            setError(errorMessage);
            setLoading(false);
        }
    }, []);

    const handleEndAssessment = useCallback(async (finalScore: number) => {
        if (isSubmitting) return; // Prevent multiple submissions
        setIsSubmitting(true);
        try {
            if (!config) {
                throw new Error('No assessment configuration found');
            }

            // Calculate time taken
            const totalTime = getDifficultyTime(config.difficulty, config.qnCount);
            const timeTaken = Math.max(0, totalTime - (timeRemaining || 0));
            console.log(`⏱️ [TIME_CALC] Total time: ${totalTime}s, Time remaining: ${timeRemaining}s, Time taken: ${timeTaken}s`);

            // Fetch explanations for questions
            let explanations = [];
            try {
                console.log("🔍 Fetching explanations for questions...");
                const explanationsResponse = await api.post("/db/questions/explanations", {
                    questions: questions,
                    topic: config.topic,
                    difficulty: config.difficulty
                });
                
                if (explanationsResponse.data.success) {
                    explanations = explanationsResponse.data.explanations;
                    console.log("✅ Explanations received:", explanations);
                } else {
                    console.log("⚠️ Explanations not available, continuing without them");
                }
            } catch (error) {
                console.error("❌ Error fetching explanations:", error);
                // Continue without explanations if they fail
                console.log("⚠️ Continuing assessment completion without explanations");
            }

            const result = {
                user_id: user._id || user.id,
                score: finalScore,
                total_questions: questions.length,
                questions: questions.map(q => ({
                    question: q.question,
                    options: q.options,
                    answer: q.answer
                })),
                user_answers: userAnswers,
                topic: config.topic,
                difficulty: config.difficulty,
                time_taken: timeTaken,
                explanations: explanations
            };
            
            console.log("📤 Saving result with enhanced data:", result);
            const response = await api.post("/api/results", result);
                        
            if (!response.data.success) {
                throw new Error(response.data.error || 'Failed to save results');
            }
                        
            // Clear timer
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }

            success('Assessment Complete!', `You scored ${finalScore}/${questions.length}`);
                        
            const resultState = {
                score: finalScore,
                totalQuestions: questions.length,
                topic: config.topic,
                difficulty: config.difficulty,
                questions: questions,
                userAnswers: userAnswers,
                timeTaken: timeTaken,
                explanations: explanations // Include explanations in state
            };
                        
            console.log("📊 Navigating to results with state:", resultState);
            navigate("/results", { state: resultState });
        } catch (error: any) {
            let errorMessage = "Failed to save results. Please try again.";
                        
            if (error.response?.data?.detail) {
                errorMessage = typeof error.response.data.detail === 'string'
                     ? error.response.data.detail
                     : JSON.stringify(error.response.data.detail);
            } else if (error.message) {
                errorMessage = error.message;
            }
                        
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    }, [config, questions, userAnswers, navigate, user._id, success, timeRemaining, isSubmitting]);

    useEffect(() => {
        if (!questionsFetched.current && !isAuthChecking) {
            questionsFetched.current = true;
            fetchQuestions();
        }
    }, [fetchQuestions, isAuthChecking]);

    useEffect(() => {
        if (userAnswers.length === questions.length && questions.length > 0 && !isSubmitting) {
            const newScore = userAnswers.reduce((acc, answer, index) => {
                const correctAnswer = questions[index]?.answer;
                const isCorrect = correctAnswer && answer === correctAnswer;
                return isCorrect ? acc + 1 : acc;
            }, 0);
            setScore(newScore);
            handleEndAssessment(newScore);
        }
    }, [userAnswers, questions, handleEndAssessment, isSubmitting]);

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

    // Timer effect
    useEffect(() => {
        if (timeRemaining !== null && timeRemaining > 0 && !loading && !isSubmitting) {
            timerRef.current = setInterval(() => {
                setTimeRemaining(prev => {
                    if (prev === null || prev <= 1) {
                        // Time's up - auto submit
                        const finalScore = userAnswers.reduce((acc, answer, index) => {
                            const correctAnswer = questions[index]?.answer;
                            return answer === correctAnswer ? acc + 1 : acc;
                        }, 0);
                        showError('Time Up!', 'Assessment has been automatically submitted');
                        handleEndAssessment(finalScore);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => {
                if (timerRef.current) {
                    clearInterval(timerRef.current);
                }
            };
        }
    }, [timeRemaining, loading, userAnswers, questions, handleEndAssessment, error, isSubmitting]);

    const handleAnswer = useCallback((answer: string) => {
        setUserAnswers(prevAnswers => [...prevAnswers, answer]);
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(prev => prev + 1);
        }
    }, [currentQuestion, questions.length]);

    const formatTime = (seconds: number): string => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const question = questions.length > 0 ? questions[currentQuestion] : null;

    if (isAuthChecking) {
        return (
            <>
                <AnimatedBackground />
                <div className="min-h-screen pt-20 px-4 relative z-10 flex items-center justify-center">
                    <LoadingSpinner size="lg" text="Checking authentication..." />
                </div>
            </>
        );
    }

    return (
        <>
            <AnimatedBackground />
            <motion.div
                initial="initial"
                animate="animate"
                exit="exit"
                variants={ANIMATION_VARIANTS.fadeIn}
                className="container mx-auto px-4 pt-24 pb-8 relative z-10"
            >
                <motion.div
                    variants={ANIMATION_VARIANTS.slideDown}
                    className="text-center mb-8"
                >
                    <h2 className={`
                        text-5xl font-bold mb-4
                        ${mode === 'professional' 
                            ? colorScheme === 'dark'
                                ? 'text-gray-200 font-serif'
                                : 'text-gray-800 font-serif'
                            : colorScheme === 'dark'
                                ? 'bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400'
                                : 'bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600'
                        }
                    `}>
                        {mode === 'professional' ? 'Assessment' : 'Adaptive Assessment'}
                    </h2>
                    <p className={`
                        text-xl
                        ${mode === 'professional'
                            ? colorScheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                            : colorScheme === 'dark' ? 'text-purple-200' : 'text-purple-700'
                        }
                    `}>
                        Test your knowledge
                    </p>
                </motion.div>

                {loading ? (
                    <motion.div
                        variants={ANIMATION_VARIANTS.fadeIn}
                        className="text-center"
                    >
                        <LoadingSpinner size="lg" text="Loading questions..." />
                        <div className={`
                            w-full max-w-md mx-auto mt-6 rounded-full h-2.5
                            ${mode === 'professional'
                                ? colorScheme === 'dark' ? 'bg-gray-800/30' : 'bg-gray-200/50'
                                : colorScheme === 'dark' ? 'bg-purple-900/30' : 'bg-purple-100/50'
                            }
                        `}>
                            <motion.div
                                 className={`
                                    h-2.5 rounded-full
                                    ${mode === 'professional'
                                        ? 'bg-gradient-to-r from-gray-600 to-gray-700'
                                        : 'bg-gradient-to-r from-purple-500 to-pink-500'
                                    }
                                 `}
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                            />
                        </div>
                    </motion.div>
                ) : error ? (
                    <motion.div
                        variants={ANIMATION_VARIANTS.slideUp}
                        className="text-center"
                    >
                        <Card className="p-8 max-w-md mx-auto">
                            <div className="text-red-400 mb-4">
                                <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <p className="text-red-300 text-lg mb-6">{error}</p>
                            <Button
                                 onClick={() => navigate("/assessconfig")}
                                variant="primary"
                            >
                                Configure Assessment
                            </Button>
                        </Card>
                    </motion.div>
                ) : question && (
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentQuestion}
                            initial={{ x: 300, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -300, opacity: 0 }}
                            transition={TRANSITION_DEFAULTS}
                            className="max-w-4xl mx-auto"
                        >
                            {isSubmitting ? (
                                <Card className="p-8 text-center">
                                    <LoadingSpinner size="lg" text="Submitting assessment..." />
                                    <p className="text-purple-300 mt-4">Please wait while we save your results...</p>
                                </Card>
                            ) : (
                                <Card className="p-8">
                                <div className="space-y-6">
                                    {/* Progress Header with Timer */}
                                    <div className="flex justify-between items-center mb-6">
                                        <div className="flex items-center space-x-4">
                                            <h3 className={`
                                                text-xl font-semibold
                                                ${mode === 'professional' ? 'font-serif' : 'font-sans'}
                                                ${mode === 'professional'
                                                    ? colorScheme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                                                    : colorScheme === 'dark' ? 'text-purple-200' : 'text-purple-800'
                                                }
                                            `}>
                                                Question {currentQuestion + 1} of {questions.length}
                                            </h3>
                                            
                                            {/* Progress Ring */}
                                            <div className="flex items-center space-x-3">
                                                <div className={`
                                                    w-24 rounded-full h-2
                                                    ${mode === 'professional'
                                                        ? colorScheme === 'dark' ? 'bg-gray-800/30' : 'bg-gray-200/50'
                                                        : colorScheme === 'dark' ? 'bg-purple-900/30' : 'bg-purple-100/50'
                                                    }
                                                `}>
                                                    <motion.div
                                                         className={`
                                                            h-2 rounded-full
                                                            ${mode === 'professional'
                                                                ? 'bg-gradient-to-r from-gray-600 to-gray-700'
                                                                : 'bg-gradient-to-r from-purple-500 to-pink-500'
                                                            }
                                                         `}
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                                                        transition={TRANSITION_DEFAULTS}
                                                    />
                                                </div>
                                                <span className={`
                                                    text-sm font-medium
                                                    ${mode === 'professional'
                                                        ? colorScheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                                        : colorScheme === 'dark' ? 'text-purple-300' : 'text-purple-600'
                                                    }
                                                `}>
                                                    {Math.round(((currentQuestion + 1) / questions.length) * 100)}%
                                                </span>
                                            </div>
                                        </div>
                                        
                                        {/* Timer */}
                                        {timeRemaining !== null && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className={`
                                                    flex items-center space-x-2 rounded-xl px-4 py-2 border
                                                    ${mode === 'professional'
                                                        ? colorScheme === 'dark' 
                                                            ? 'bg-gray-800/30 border-gray-600/30' 
                                                            : 'bg-gray-50/80 border-gray-200/50'
                                                        : colorScheme === 'dark' 
                                                            ? 'bg-purple-900/30 border-purple-500/30' 
                                                            : 'bg-purple-50/80 border-purple-200/50'
                                                    }
                                                `}
                                            >
                                                <svg className={`w-5 h-5 ${
                                                    mode === 'professional'
                                                        ? colorScheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                                        : colorScheme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                                                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span className={`
                                                    font-mono text-lg font-semibold
                                                    ${timeRemaining < 60 
                                                        ? 'text-red-400' 
                                                        : mode === 'professional'
                                                            ? colorScheme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                                                            : colorScheme === 'dark' ? 'text-purple-200' : 'text-purple-800'
                                                    }
                                                `}>
                                                    {formatTime(timeRemaining)}
                                                </span>
                                            </motion.div>
                                        )}
                                    </div>
                                                                        
                                    {/* Question */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className={`
                                            rounded-xl p-6 border
                                            ${mode === 'professional'
                                                ? colorScheme === 'dark' 
                                                    ? 'bg-gray-800/20 border-gray-600/30' 
                                                    : 'bg-gray-50/50 border-gray-200/50'
                                                : colorScheme === 'dark' 
                                                    ? 'bg-purple-900/20 border-purple-500/30' 
                                                    : 'bg-purple-50/50 border-purple-200/50'
                                            }
                                        `}
                                    >
                                        <p className={`
                                            text-xl leading-relaxed
                                            ${mode === 'professional' ? 'font-serif' : 'font-sans'}
                                            ${mode === 'professional'
                                                ? colorScheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                                                : colorScheme === 'dark' ? 'text-purple-100' : 'text-purple-900'
                                            }
                                        `}>
                                            {question.question}
                                        </p>
                                    </motion.div>
                                                                        
                                    {/* Options */}
                                    <motion.div
                                        variants={ANIMATION_VARIANTS.stagger}
                                        initial="initial"
                                        animate="animate"
                                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                                    >
                                        {question.options?.map((option, index) => (
                                            <motion.div
                                                key={index}
                                                variants={ANIMATION_VARIANTS.slideUp}
                                                transition={{ delay: 0.3 + index * 0.1 }}
                                            >
                                                <Button
                                                    onClick={() => handleAnswer(option)}
                                                    variant="outline"
                                                    className={`
                                                        w-full p-6 text-left justify-start h-auto transition-all duration-300 group rounded-xl
                                                        ${mode === 'professional'
                                                            ? colorScheme === 'dark' 
                                                                ? 'bg-gray-800/20 border-gray-600/30 text-gray-200 hover:bg-gray-800/40 hover:border-gray-500/50 hover:text-white' 
                                                                : 'bg-gray-50/50 border-gray-200/50 text-gray-800 hover:bg-gray-100/80 hover:border-gray-300/70 hover:text-gray-900'
                                                            : colorScheme === 'dark' 
                                                                ? 'bg-purple-900/20 border-purple-500/30 text-purple-200 hover:bg-purple-900/40 hover:border-purple-400/50 hover:text-white' 
                                                                : 'bg-purple-50/50 border-purple-200/50 text-purple-800 hover:bg-purple-100/80 hover:border-purple-300/70 hover:text-purple-900'
                                                        }
                                                    `}
                                                >
                                                    <div className="flex items-center space-x-3 w-full">
                                                        <div className={`
                                                            w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border transition-all duration-300
                                                            ${mode === 'professional'
                                                                ? colorScheme === 'dark' 
                                                                    ? 'bg-gray-700/20 border-gray-600/30 group-hover:bg-gray-600/30 group-hover:border-gray-500/50' 
                                                                    : 'bg-gray-100/80 border-gray-200/50 group-hover:bg-gray-200/80 group-hover:border-gray-300/70'
                                                                : colorScheme === 'dark' 
                                                                    ? 'bg-purple-500/20 border-purple-500/30 group-hover:bg-purple-500/30 group-hover:border-purple-400/50' 
                                                                    : 'bg-purple-100/80 border-purple-200/50 group-hover:bg-purple-200/80 group-hover:border-purple-300/70'
                                                            }
                                                        `}>
                                                            {String.fromCharCode(65 + index)}
                                                        </div>
                                                        <span className="flex-1 text-left">{option}</span>
                                                    </div>
                                                </Button>
                                            </motion.div>
                                        ))}
                                    </motion.div>
                                </div>
                            </Card>
                            )}
                        </motion.div>
                    </AnimatePresence>
                )}
            </motion.div>
        </>
    );
};

export default Assessment;
