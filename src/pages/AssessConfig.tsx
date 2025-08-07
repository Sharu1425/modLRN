import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, AssessmentConfig } from "../types";
import AnimatedBackground from "../components/AnimatedBackground";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import api from "../utils/api";
import { ANIMATION_VARIANTS, TRANSITION_DEFAULTS } from "../utils/constants";

interface AssessConfigProps {
    user: User;
}

const AssessConfig: React.FC<AssessConfigProps> = ({ user }) => {
    const [config, setConfig] = useState<AssessmentConfig>({
        topic: "Science",
        qnCount: 5,
        difficulty: "Easy"
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

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

                setIsLoading(false);
            } catch (error) {
                console.error('Auth check failed:', error);
                localStorage.removeItem('access_token');
                localStorage.removeItem('user');
                navigate('/login', { replace: true });
            }
        };

        checkAuth();
    }, [navigate]);

    const handleInputChange = (field: keyof AssessmentConfig, value: string | number) => {
        setConfig(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (isSubmitting) return;
        
        setIsSubmitting(true);
        setError('');
        
        try {
            console.log('📤 Sending assessment config:', config);
            
            // Validate config before sending
            if (!config.topic.trim()) {
                throw new Error('Topic is required');
            }
            
            if (config.qnCount < 1 || config.qnCount > 50) {
                throw new Error('Question count must be between 1 and 50');
            }
            
            const response = await api.post("/api/topic", config);
            
            console.log('📥 Server response:', response.data);
            
            if (response.data.success) {
                console.log('✅ Assessment config saved, navigating to assessment...');
                navigate("/assessment", { replace: true });
            } else {
                throw new Error(response.data.error || 'Failed to start assessment');
            }
        } catch (error: any) {
            console.error("❌ Error details:", {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                config: config
            });
            
            let errorMessage = "Failed to start assessment. Please try again.";
            if (error.response?.data?.detail) {
                errorMessage = error.response.data.detail;
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <>
                <AnimatedBackground />
                <div className="min-h-screen pt-20 px-4 relative z-10 flex items-center justify-center">
                    <LoadingSpinner size="lg" text="Checking authentication..." />
                </div>
            </>
        );
    }

    const difficultyOptions = [
        { value: "Very Easy", label: "Very Easy", color: "from-green-400 to-green-600" },
        { value: "Easy", label: "Easy", color: "from-blue-400 to-blue-600" },
        { value: "Medium", label: "Medium", color: "from-yellow-400 to-orange-500" },
        { value: "Hard", label: "Hard", color: "from-orange-500 to-red-500" },
        { value: "Very Hard", label: "Very Hard", color: "from-red-500 to-red-700" }
    ];

    return (
        <>
            <AnimatedBackground />
            <div className="min-h-screen pt-20 px-4 relative z-10">
                <motion.div
                    variants={ANIMATION_VARIANTS.scale}
                    initial="initial"
                    animate="animate"
                    transition={TRANSITION_DEFAULTS}
                    className="max-w-2xl mx-auto"
                >
                    <Card className="p-8">
                        <motion.div
                            variants={ANIMATION_VARIANTS.slideDown}
                            className="text-center mb-8"
                        >
                            <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
                                Assessment Configuration
                            </h2>
                            <p className="text-purple-200 text-lg">Customize your learning experience</p>
                        </motion.div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200"
                            >
                                <div className="flex items-center">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {error}
                                </div>
                            </motion.div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <motion.div
                                variants={ANIMATION_VARIANTS.stagger}
                                initial="initial"
                                animate="animate"
                                className="space-y-6"
                            >
                                <Input
                                    type="text"
                                    label="Topic"
                                    value={config.topic}
                                    onChange={(e) => handleInputChange('topic', e.target.value)}
                                    placeholder="Enter topic (e.g., Mathematics, Science, History)"
                                    disabled={isSubmitting}
                                    icon={
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                        </svg>
                                    }
                                />

                                <div>
                                    <label className="block text-sm font-medium text-purple-200 mb-2">
                                        Number of Questions
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="range"
                                            min="1"
                                            max="50"
                                            value={config.qnCount}
                                            onChange={(e) => handleInputChange('qnCount', parseInt(e.target.value))}
                                            disabled={isSubmitting}
                                            className="w-full h-2 bg-purple-900/30 rounded-lg appearance-none cursor-pointer slider"
                                        />
                                        <div className="flex justify-between text-sm text-purple-300 mt-2">
                                            <span>1</span>
                                            <span className="text-purple-200 font-semibold">{config.qnCount} questions</span>
                                            <span>50</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-purple-200 mb-4">
                                        Difficulty Level
                                    </label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {difficultyOptions.map((option) => (
                                            <motion.button
                                                key={option.value}
                                                type="button"
                                                onClick={() => handleInputChange('difficulty', option.value)}
                                                disabled={isSubmitting}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                                                    config.difficulty === option.value
                                                        ? `border-purple-400 bg-gradient-to-r ${option.color} text-white shadow-lg`
                                                        : 'border-purple-500/30 bg-purple-900/20 text-purple-200 hover:border-purple-400/50 hover:bg-purple-900/30'
                                                }`}
                                            >
                                                <div className="text-center">
                                                    <div className="font-semibold">{option.label}</div>
                                                    {config.difficulty === option.value && (
                                                        <motion.div
                                                            initial={{ scale: 0 }}
                                                            animate={{ scale: 1 }}
                                                            className="mt-1"
                                                        >
                                                            <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        </motion.div>
                                                    )}
                                                </div>
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                variants={ANIMATION_VARIANTS.slideUp}
                                initial="initial"
                                animate="animate"
                                transition={{ delay: 0.3 }}
                                className="pt-6"
                            >
                                <Button
                                    type="submit"
                                    variant="primary"
                                    size="lg"
                                    className="w-full"
                                    isLoading={isSubmitting}
                                    disabled={isSubmitting || !config.topic.trim()}
                                >
                                    {isSubmitting ? 'Starting Assessment...' : 'Start Assessment'}
                                </Button>
                            </motion.div>
                        </form>

                        {/* Assessment Preview */}
                        <motion.div
                            variants={ANIMATION_VARIANTS.slideUp}
                            initial="initial"
                            animate="animate"
                            transition={{ delay: 0.5 }}
                            className="mt-8 p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg"
                        >
                            <h3 className="text-lg font-semibold text-purple-200 mb-2">Assessment Preview</h3>
                            <div className="text-sm text-purple-300 space-y-1">
                                <p><span className="font-medium">Topic:</span> {config.topic || 'Not specified'}</p>
                                <p><span className="font-medium">Questions:</span> {config.qnCount}</p>
                                <p><span className="font-medium">Difficulty:</span> {config.difficulty}</p>
                                <p><span className="font-medium">Estimated Time:</span> {Math.ceil(config.qnCount * 1.5)} minutes</p>
                            </div>
                        </motion.div>
                    </Card>
                </motion.div>
            </div>
        </>
    );
};

export default AssessConfig;
