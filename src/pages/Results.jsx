"use client"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import AnimatedBackground from "../components/AnimatedBackground"

function Results() {
    const location = useLocation()
    const navigate = useNavigate()
    const { score, totalQuestions, topic, difficulty } = location.state || { score: 0, totalQuestions: 0 }
    const percentage = Math.round((score / totalQuestions) * 100)

    if (!location.state) {
        navigate('/dashboard')
        return null
    }

    return (
        <>
            <AnimatedBackground/>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="container mx-auto px-4 pt-24 py-8 relative z-10"
            >
                <motion.div
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    className="text-center mb-12"
                >
                    <h2 className="text-5xl font-bold gradient-text mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                        Assessment Results
                    </h2>
                    <p className="text-purple-200 text-xl">Here's how you did</p>
                </motion.div>

                <motion.div
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    className="glass-card p-8 rounded-2xl neon-border shadow-xl backdrop-blur-xl border-1 relative overflow-hidden hover:shadow-2xl transition-all duration-300"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10"></div>
                    <div className="relative space-y-6">
                        <h3 className="text-3xl font-semibold text-purple-200 text-center">Your Score: {percentage}%</h3>
                        <div className="w-full bg-purple-900/30 rounded-full h-4">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                                className="bg-gradient-to-r from-purple-500 to-pink-500 h-4 rounded-full"
                            ></motion.div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <motion.div 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.2 }}
                                className="p-4 rounded-lg bg-purple-900/20 border border-purple-500/30 hover:bg-purple-900/30 transition-all duration-300 hover:border-purple-400 hover:shadow-lg hover:scale-[1.02]"
                            >
                                <p className="text-purple-200">
                                    <span className="font-semibold">Total Questions:</span> {totalQuestions}
                                </p>
                            </motion.div>
                            <motion.div 
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.2 }}
                                className="p-4 rounded-lg bg-purple-900/20 border border-purple-500/30 hover:bg-purple-900/30 transition-all duration-300 hover:border-purple-400 hover:shadow-lg hover:scale-[1.02]"
                            >
                                <p className="text-purple-200">
                                    <span className="font-semibold">Correct Answers:</span> {score}
                                </p>
                            </motion.div>
                            <motion.div 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.2 }}
                                className="p-4 rounded-lg bg-purple-900/20 border border-purple-500/30 hover:bg-purple-900/30 transition-all duration-300 hover:border-purple-400 hover:shadow-lg hover:scale-[1.02]"
                            >
                                <p className="text-purple-200">
                                    <span className="font-semibold">Topic:</span> {topic}
                                </p>
                            </motion.div>
                            <motion.div 
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.2 }}
                                className="p-4 rounded-lg bg-purple-900/20 border border-purple-500/30 hover:bg-purple-900/30 transition-all duration-300 hover:border-purple-400 hover:shadow-lg hover:scale-[1.02]"
                            >
                                <p className="text-purple-200">
                                    <span className="font-semibold">Difficulty:</span> {difficulty}
                                </p>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    className="mt-8 text-center"
                >
                    <Link
                        to="/dashboard"
                        className="inline-block px-8 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-105"
                    >
                        Back to Dashboard
                    </Link>
                </motion.div>
            </motion.div>
        </>
    )
}

export default Results

