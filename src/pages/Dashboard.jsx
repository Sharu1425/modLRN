"use client"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import ProgressCharts from "../components/ProgressCharts"
import AnimatedBackground from "../components/AnimatedBackground"

function Dashboard({ user }) {
    return (
        <>
            <AnimatedBackground />
            <div className="min-h-screen pt-20 px-4 relative z-10">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="max-w-7xl mx-auto"
                >
                    <div className="glass-card p-8 rounded-2xl border border-purple-500/30 shadow-xl backdrop-blur-xl">
                        <h2 className="text-3xl font-bold mb-8 text-purple-200 text-center">
                            Welcome, {user.username || user.name}!
                        </h2>

                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="mb-10"
                        >
                            <ProgressCharts />
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <motion.div
                                initial={{ x: -50, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="glass-card p-6 rounded-xl border border-purple-500/30 shadow-lg"
                            >
                                <h3 className="text-xl font-semibold mb-4 mt-2 text-purple-200">Quick Stats</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-purple-300">Completed Assessments</span>
                                        <span className="text-purple-400 font-semibold">5</span>
                                    </div>
                                    <div className="flex justify-between items-center mt-4">
                                        <span className="text-purple-300">Average Score</span>
                                        <span className="text-purple-400 font-semibold">75%</span>
                                    </div>
                                    <div className="w-full bg-purple-900/30 rounded-full h-2.5 mt-2">
                                        <div
                                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2.5 rounded-full"
                                            style={{ width: "75%" }}
                                        ></div>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ x: 50, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.6 }}
                                className="glass-card p-6 rounded-xl border border-purple-500/30 shadow-lg"
                            >
                                <h3 className="text-xl font-semibold mb-4 mt-2 text-purple-200">Start New Assessment</h3>
                                <p className="text-purple-300 mb-6">Test your knowledge with our adaptive assessment system</p>
                                <Link 
                                    to="/assessconfig" 
                                    className="btn-primary w-full text-center block hover:scale-105 transition-transform duration-300"
                                >
                                    Begin Assessment
                                </Link>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </>
    )
}

export default Dashboard

