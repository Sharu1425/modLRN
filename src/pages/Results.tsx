import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { User, Question } from "../types";
import AnimatedBackground from "../components/AnimatedBackground";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import api from "../utils/api";
import { ANIMATION_VARIANTS, TRANSITION_DEFAULTS } from "../utils/constants";

interface ResultsProps {
    user: User;
}

interface Explanation {
    questionIndex: number;
    explanation: string;
}

const Results: React.FC<ResultsProps> = ({ user }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { score, totalQuestions, topic, difficulty, questions, userAnswers, timeTaken, explanations: stateExplanations } = location.state || { 
        score: 0, 
        totalQuestions: 0, 
        questions: [], 
        userAnswers: [],
        timeTaken: 0,
        explanations: []
    };
    
    const [explanations, setExplanations] = useState<Explanation[]>(stateExplanations || []);
    const [loadingExplanations, setLoadingExplanations] = useState(false);
    const [explanationsError, setExplanationsError] = useState<string | null>(null);
    const [showExplanations, setShowExplanations] = useState(false);
    const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false); // Add flag to prevent duplicate requests
    
    const percentage = Math.round((score / totalQuestions) * 100);

    useEffect(() => {
        console.log("📊 Results page state:", location.state);
        
        if (!location.state) {
            console.log("❌ No state found, redirecting to dashboard");
            navigate('/dashboard');
            return;
        }
        
        // Only fetch explanations if not already provided in state and haven't attempted before
        if (questions && questions.length > 0 && (!stateExplanations || stateExplanations.length === 0) && !hasAttemptedFetch) {
            setHasAttemptedFetch(true);
            fetchExplanations();
        }
    }, [location.state, navigate, questions, stateExplanations, hasAttemptedFetch]);

    const fetchExplanations = async () => {
        setLoadingExplanations(true);
        setExplanationsError(null);
        
        try {
            console.log("🔍 Fetching explanations for questions...");
            
            const response = await api.post("/db/questions/explanations", {
                questions: questions,
                topic: topic,
                difficulty: difficulty
            });
            
            if (response.data.success) {
                setExplanations(response.data.explanations);
                console.log("✅ Explanations received:", response.data.explanations);
            } else {
                throw new Error("Failed to fetch explanations");
            }
            
        } catch (error) {
            console.error("❌ Error fetching explanations:", error);
            setExplanationsError("Failed to load explanations");
        } finally {
            setLoadingExplanations(false);
        }
    };

    const getScoreColor = (percentage: number) => {
        if (percentage >= 80) return "from-green-500 to-emerald-500";
        if (percentage >= 60) return "from-yellow-500 to-orange-500";
        return "from-red-500 to-pink-500";
    };

    const getScoreMessage = (percentage: number) => {
        if (percentage >= 90) return "Excellent! Outstanding performance! 🎉";
        if (percentage >= 80) return "Great job! You're doing very well! 👏";
        if (percentage >= 70) return "Good work! Keep it up! 👍";
        if (percentage >= 60) return "Not bad! There's room for improvement! 📚";
        return "Keep practicing! You'll get better! 💪";
    };

    const formatTime = (seconds: number | undefined) => {
        if (!seconds) return 'N/A';
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    if (!location.state) {
        return (
            <>
                <AnimatedBackground />
                <div className="min-h-screen pt-20 px-4 relative z-10 flex items-center justify-center">
                    <EmptyState
                        title="No Results Found"
                        message="No assessment results were found. Please complete an assessment first."
                        actionText="Start Assessment"
                        onAction={() => navigate("/assessconfig")}
                        icon={
                            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        }
                    />
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
                transition={TRANSITION_DEFAULTS}
                className="container mx-auto px-4 pt-24 py-8 relative z-10"
            >
                <motion.div
                    variants={ANIMATION_VARIANTS.slideDown}
                    className="text-center mb-12"
                >
                    <h2 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400 mb-4">
                        Assessment Results
                    </h2>
                    <p className="text-purple-200 text-xl">Here's how you performed</p>
                </motion.div>

                {/* Score Card */}
                <motion.div
                    variants={ANIMATION_VARIANTS.slideUp}
                    className="max-w-4xl mx-auto mb-8"
                >
                    <Card className="p-8 text-center">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
                            className="mb-6"
                        >
                            <div className={`w-32 h-32 rounded-full bg-gradient-to-r ${getScoreColor(percentage)} flex items-center justify-center mx-auto mb-4 shadow-2xl`}>
                                <span className="text-4xl font-bold text-white">{percentage}%</span>
                            </div>
                            <h3 className="text-2xl font-bold text-purple-200 mb-2">
                                {getScoreMessage(percentage)}
                            </h3>
                        </motion.div>

                        <div className="w-full bg-purple-900/30 rounded-full h-4 mb-6">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
                                className={`bg-gradient-to-r ${getScoreColor(percentage)} h-4 rounded-full shadow-lg`}
                            />
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            {[
                                { label: "Total Questions", value: totalQuestions, icon: "📝" },
                                { label: "Correct Answers", value: score, icon: "✅" },
                                { label: "Time Taken", value: formatTime(timeTaken), icon: "⏱️" },
                                { label: "Topic", value: topic, icon: "📚" },
                                { label: "Difficulty", value: difficulty, icon: "⚡" }
                            ].map((stat, index) => (
                                <motion.div
                                    key={stat.label}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.7 + index * 0.1 }}
                                    className="p-4 rounded-lg bg-purple-900/20 border border-purple-500/30"
                                >
                                    <div className="text-2xl mb-2">{stat.icon}</div>
                                    <p className="text-purple-200 font-semibold">
                                        {stat.value}
                                    </p>
                                    <p className="text-purple-300 text-sm">{stat.label}</p>
                                </motion.div>
                            ))}
                        </div>
                    </Card>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                    variants={ANIMATION_VARIANTS.slideUp}
                    className="text-center mb-8 space-x-4"
                >
                    <Link to="/assessconfig">
                        <Button variant="primary" size="lg">
                            Take Another Assessment
                        </Button>
                    </Link>
                    <Link to="/dashboard">
                        <Button variant="secondary" size="lg">
                            Back to Dashboard
                        </Button>
                    </Link>
                    {questions && questions.length > 0 && (
                        <Button 
                            variant="outline" 
                            size="lg"
                            onClick={() => setShowExplanations(!showExplanations)}
                        >
                            {showExplanations ? 'Hide' : 'Show'} Question Review
                        </Button>
                    )}
                </motion.div>

                {/* Question Review Section */}
                <AnimatePresence>
                    {showExplanations && questions && questions.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="max-w-4xl mx-auto"
                        >
                            <Card className="p-8">
                                <div className="text-center mb-8">
                                    <h3 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400 mb-4">
                                        Question Review
                                    </h3>
                                    {loadingExplanations && (
                                        <div className="flex items-center justify-center">
                                            <LoadingSpinner size="sm" />
                                            <span className="ml-2 text-purple-300">Generating AI explanations...</span>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="space-y-6">
                                    {questions.map((question: Question, index: number) => {
                                        const userAnswer = userAnswers[index];
                                        const correctAnswer = question.answer;
                                        const isCorrect = userAnswer === correctAnswer;
                                        const explanation = explanations.find(exp => exp.questionIndex === index);
                                        
                                        return (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                                className={`border rounded-xl p-6 transition-all duration-300 ${
                                                    isCorrect 
                                                        ? 'border-green-500/50 bg-green-500/5' 
                                                        : 'border-red-500/50 bg-red-500/5'
                                                }`}
                                            >
                                                {/* Question Header */}
                                                <div className="flex items-center justify-between mb-4">
                                                    <h4 className="text-lg font-semibold text-purple-200">
                                                        Question {index + 1}
                                                    </h4>
                                                    <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-2 ${
                                                        isCorrect 
                                                            ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                                                            : 'bg-red-500/20 text-red-300 border border-red-500/30'
                                                    }`}>
                                                        <span>{isCorrect ? '✓' : '✗'}</span>
                                                        <span>{isCorrect ? 'Correct' : 'Incorrect'}</span>
                                                    </div>
                                                </div>
                                                
                                                {/* Question Text */}
                                                <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4 mb-6">
                                                    <p className="text-purple-100 text-lg leading-relaxed">
                                                        {question.question}
                                                    </p>
                                                </div>
                                                
                                                {/* Options */}
                                                <div className="space-y-3 mb-6">
                                                    {question.options.map((option, optionIndex) => {
                                                        const isUserChoice = option === userAnswer;
                                                        const isCorrectChoice = option === correctAnswer;
                                                        
                                                        let optionClasses = "p-4 rounded-lg border transition-all duration-200 ";
                                                        
                                                        if (isCorrectChoice) {
                                                            optionClasses += "bg-green-500/20 border-green-500/50 text-green-200";
                                                        } else if (isUserChoice && !isCorrect) {
                                                            optionClasses += "bg-red-500/20 border-red-500/50 text-red-200";
                                                        } else {
                                                            optionClasses += "bg-purple-900/20 border-purple-500/30 text-purple-200";
                                                        }
                                                        
                                                        return (
                                                            <div key={optionIndex} className={optionClasses}>
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-center space-x-3">
                                                                        <div className="w-6 h-6 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-xs font-medium">
                                                                            {String.fromCharCode(65 + optionIndex)}
                                                                        </div>
                                                                        <span className="flex-1">{option}</span>
                                                                    </div>
                                                                    <div className="flex items-center space-x-2">
                                                                        {isCorrectChoice && (
                                                                            <span className="text-green-400 font-medium text-sm flex items-center">
                                                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                                </svg>
                                                                                Correct
                                                                            </span>
                                                                        )}
                                                                        {isUserChoice && !isCorrect && (
                                                                            <span className="text-red-400 font-medium text-sm flex items-center">
                                                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                                </svg>
                                                                                Your Choice
                                                                            </span>
                                                                        )}
                                                                        {isUserChoice && isCorrect && (
                                                                            <span className="text-green-400 font-medium text-sm flex items-center">
                                                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                                </svg>
                                                                                Your Choice
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                                
                                                {/* Explanation Section */}
                                                <div className="border-t border-purple-500/20 pt-4">
                                                    <h5 className="text-md font-semibold text-purple-300 mb-3 flex items-center">
                                                        <span className="mr-2">💡</span>
                                                        Explanation
                                                    </h5>
                                                    
                                                    {loadingExplanations ? (
                                                        <div className="flex items-center space-x-2">
                                                            <LoadingSpinner size="sm" />
                                                            <span className="text-purple-300 text-sm">Loading explanation...</span>
                                                        </div>
                                                    ) : explanationsError ? (
                                                        <div className="text-red-300 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                                                            <span className="mr-2">⚠️</span>
                                                            {explanationsError}
                                                        </div>
                                                    ) : explanation ? (
                                                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                                                            <p className="text-blue-200 leading-relaxed">
                                                                {explanation.explanation}
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <div className="text-purple-300 text-sm bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
                                                            <span className="mr-2">ℹ️</span>
                                                            Explanation not available
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </>
    );
};

export default Results;
