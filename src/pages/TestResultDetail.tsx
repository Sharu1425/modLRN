import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, DetailedTestResult, QuestionReview } from '../types';
import AnimatedBackground from '../components/AnimatedBackground';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import api from '../utils/api';
import { ANIMATION_VARIANTS, TRANSITION_DEFAULTS } from '../utils/constants';

interface TestResultDetailProps {
    user: User;
}

const TestResultDetail: React.FC<TestResultDetailProps> = ({ user }) => {
    const { resultId } = useParams<{ resultId: string }>();
    const navigate = useNavigate();
    const [result, setResult] = useState<DetailedTestResult | null>(null);
    const [questionReviews, setQuestionReviews] = useState<QuestionReview[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showExplanations, setShowExplanations] = useState(false);

    useEffect(() => {
        if (resultId) {
            fetchDetailedResult();
        }
    }, [resultId]);

    const fetchDetailedResult = async () => {
        try {
            setLoading(true);
            setError(null);
            
            console.log('🔍 Fetching detailed result:', resultId);
            const response = await api.get(`/api/results/${resultId}/detailed`);
            
            if (response.data.success) {
                setResult(response.data.result);
                setQuestionReviews(response.data.question_reviews);
                console.log('✅ Detailed result received:', response.data);
            } else {
                throw new Error(response.data.error || 'Failed to fetch detailed result');
            }
        } catch (error: any) {
            console.error('❌ Error fetching detailed result:', error);
            setError(error.response?.data?.detail || error.message || 'Failed to load test result');
        } finally {
            setLoading(false);
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

    if (loading) {
        return (
            <>
                <AnimatedBackground />
                <div className="min-h-screen pt-20 px-4 relative z-10 flex items-center justify-center">
                    <LoadingState text="Loading test result..." showCard={true} />
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <AnimatedBackground />
                <div className="min-h-screen pt-20 px-4 relative z-10 flex items-center justify-center">
                    <ErrorState
                        title="Error Loading Result"
                        message={error}
                        onRetry={fetchDetailedResult}
                        onBack={() => navigate('/profile')}
                        retryText="Retry"
                        backText="Back to Profile"
                    />
                </div>
            </>
        );
    }

    if (!result) {
        return (
            <>
                <AnimatedBackground />
                <div className="min-h-screen pt-20 px-4 relative z-10 flex items-center justify-center">
                    <ErrorState
                        title="Result Not Found"
                        message="The requested test result could not be found."
                        onBack={() => navigate('/profile')}
                        backText="Back to Profile"
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
                    className="text-center mb-8"
                >
                    <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400 mb-4">
                        Test Result Details
                    </h2>
                    <p className="text-purple-200 text-lg">{result.topic} • {result.difficulty}</p>
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
                            <div className={`w-32 h-32 rounded-full bg-gradient-to-r ${getScoreColor(result.percentage)} flex items-center justify-center mx-auto mb-4 shadow-2xl`}>
                                <span className="text-4xl font-bold text-white">{Math.round(result.percentage)}%</span>
                            </div>
                            <h3 className="text-2xl font-bold text-purple-200 mb-2">
                                {getScoreMessage(result.percentage)}
                            </h3>
                        </motion.div>

                        <div className="w-full bg-purple-900/30 rounded-full h-4 mb-6">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${result.percentage}%` }}
                                transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
                                className={`bg-gradient-to-r ${getScoreColor(result.percentage)} h-4 rounded-full shadow-lg`}
                            />
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            {[
                                { label: "Total Questions", value: result.total_questions, icon: "📝" },
                                { label: "Correct Answers", value: result.correct_answers, icon: "✅" },
                                { label: "Incorrect Answers", value: result.incorrect_answers, icon: "❌" },
                                { label: "Time Taken", value: formatTime(result.time_taken), icon: "⏱️" },
                                { label: "Date", value: new Date(result.date).toLocaleDateString(), icon: "📅" }
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
                    <Link to="/profile">
                        <Button variant="secondary" size="lg">
                            Back to Profile
                        </Button>
                    </Link>
                    {questionReviews.length > 0 && (
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
                    {showExplanations && questionReviews.length > 0 && (
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
                                </div>
                                
                                <div className="space-y-6">
                                    {questionReviews.map((review, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className={`border rounded-xl p-6 transition-all duration-300 ${
                                                review.is_correct 
                                                    ? 'border-green-500/50 bg-green-500/5' 
                                                    : 'border-red-500/50 bg-red-500/5'
                                            }`}
                                        >
                                            {/* Question Header */}
                                            <div className="flex items-center justify-between mb-4">
                                                <h4 className="text-lg font-semibold text-purple-200">
                                                    Question {review.question_index + 1}
                                                </h4>
                                                <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-2 ${
                                                    review.is_correct 
                                                        ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                                                        : 'bg-red-500/20 text-red-300 border border-red-500/30'
                                                }`}>
                                                    <span>{review.is_correct ? '✓' : '✗'}</span>
                                                    <span>{review.is_correct ? 'Correct' : 'Incorrect'}</span>
                                                </div>
                                            </div>
                                            
                                            {/* Question Text */}
                                            <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4 mb-6">
                                                <p className="text-purple-100 text-lg leading-relaxed">
                                                    {review.question}
                                                </p>
                                            </div>
                                            
                                            {/* Options */}
                                            <div className="space-y-3 mb-6">
                                                {review.options.map((option, optionIndex) => {
                                                    const isUserChoice = option === review.user_answer;
                                                    const isCorrectChoice = option === review.correct_answer;
                                                    
                                                    let optionClasses = "p-4 rounded-lg border transition-all duration-200 ";
                                                    
                                                    if (isCorrectChoice) {
                                                        optionClasses += "bg-green-500/20 border-green-500/50 text-green-200";
                                                    } else if (isUserChoice && !review.is_correct) {
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
                                                                    {isUserChoice && !review.is_correct && (
                                                                        <span className="text-red-400 font-medium text-sm flex items-center">
                                                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                            </svg>
                                                                            Your Choice
                                                                        </span>
                                                                    )}
                                                                    {isUserChoice && review.is_correct && (
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
                                            {review.explanation && (
                                                <div className="border-t border-purple-500/20 pt-4">
                                                    <h5 className="text-md font-semibold text-purple-300 mb-3 flex items-center">
                                                        <span className="mr-2">💡</span>
                                                        Explanation
                                                    </h5>
                                                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                                                        <p className="text-blue-200 leading-relaxed">
                                                            {review.explanation}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </>
    );
};

export default TestResultDetail;
