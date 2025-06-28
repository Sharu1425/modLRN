"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import AnimatedBackground from "../components/AnimatedBackground";
import axios from "axios";

function AssessConfig() {
    const [topic, setTopic] = useState("Science");
    const [qnCount, setQuestionCount] = useState(5);
    const [difficulty, setDifficulty] = useState("Easy");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    async function sendData(topic, qnCount, difficulty) {
        if (isSubmitting) return;
        setIsSubmitting(true);
        setError('');
        
        try {
            console.log('Sending assessment config:', { topic, qnCount, difficulty });
            const response = await axios.post("/api/topic", { 
                topic, 
                qnCount: parseInt(qnCount, 10), 
                difficulty 
            }, {
                withCredentials: true
            });
            
            console.log('Server response:', response.data);
            
            if (response.data.success) {
                navigate("/assessment", { replace: true });
            } else {
                throw new Error(response.data.error || 'Failed to start assessment');
            }
        } catch (error) {
            console.error("Error details:", {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            setError(error.response?.data?.error || "Failed to start assessment. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <>
            <AnimatedBackground />
            <div className="min-h-screen pt-20 px-4 relative z-10">
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="max-w-md mx-auto"
                >
                    <div className="glass-card p-8 rounded-2xl neon-border shadow-xl backdrop-blur-xl border-1 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10"></div>
                        <motion.div
                            initial={{ y: -10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.3 }}
                            className="text-center mb-8 relative"
                        >
                            <h2 className="text-4xl font-bold gradient-text mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                                Assessment Configuration
                            </h2>
                            <p className="text-purple-200 text-lg">Customize your learning experience</p>
                        </motion.div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200"
                            >
                                {error}
                            </motion.div>
                        )}

                        <form className="space-y-6 relative" onSubmit={(e) => {
                            e.preventDefault();
                            sendData(topic, qnCount, difficulty);
                        }}>
                            <motion.div
                                initial={{ x: -10, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-4"
                            >
                                <div>
                                    <label htmlFor="topic" className="block text-sm font-medium text-purple-200 mb-2">
                                        Topic
                                    </label>
                                    <input
                                        type="text"
                                        id="topic"
                                        name="topic"
                                        value={topic}
                                        onChange={(e) => setTopic(e.target.value)}
                                        className="w-full px-4 py-3 rounded-lg bg-purple-900/20 border border-purple-500/30 text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 hover:border-purple-400"
                                        placeholder="Enter topic"
                                        disabled={isSubmitting}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="qnCount" className="block text-sm font-medium text-purple-200 mb-2">
                                        Number of Questions
                                    </label>
                                    <input
                                        type="number"
                                        id="qnCount"
                                        name="qnCount"
                                        value={qnCount}
                                        onChange={(e) => setQuestionCount(Math.max(1, Math.min(50, parseInt(e.target.value, 10) || 5)))}
                                        min="1"
                                        max="50"
                                        className="w-full px-4 py-3 rounded-lg bg-purple-900/20 border border-purple-500/30 text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 hover:border-purple-400"
                                        placeholder="Enter number of questions"
                                        disabled={isSubmitting}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="difficulty" className="block text-sm font-medium text-purple-200 mb-2">
                                        Difficulty
                                    </label>
                                    <select
                                        id="difficulty"
                                        name="difficulty"
                                        value={difficulty}
                                        onChange={(e) => setDifficulty(e.target.value)}
                                        className="w-full px-4 py-3 rounded-lg bg-purple-900/20 border border-purple-500/30 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 hover:border-purple-400"
                                        disabled={isSubmitting}
                                    >
                                        <option value="Very Easy">Very Easy</option>
                                        <option value="Easy">Easy</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Hard">Hard</option>
                                        <option value="Very Hard">Very Hard</option>
                                    </select>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ y: 10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-4"
                            >
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 text-lg font-medium rounded-lg hover:from-purple-600 hover:to-pink-600 transition duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
                                >
                                    {isSubmitting ? 'Starting Assessment...' : 'Start Assessment'}
                                </button>
                            </motion.div>
                        </form>
                    </div>
                </motion.div>
            </div>
        </>
    );
}

export default AssessConfig;