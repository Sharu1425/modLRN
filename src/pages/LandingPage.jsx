"use client"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import AnimatedBackground from "../components/AnimatedBackground"

function LandingPage() {
    return (
        <>
            <AnimatedBackground />
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="container mx-auto px-4 py-8 relative z-20"
            >
                <div className="text-center max-w-4xl mx-auto mt-20">
                    <motion.h1
                        initial={{ y: -50 }}
                        animate={{ y: 0 }}
                        transition={{ type: "spring", stiffness: 100 }}
                        className="text-7xl font-bold gradient-text mb-8"
                    >
                        %LearnAI
                    </motion.h1>
                    <motion.p
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl mb-8 text-purple-200"
                    >
                        Experience the future of learning with our AI-powered adaptive assessment system. Personalized learning
                        paths that evolve with you.
                    </motion.p>
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        <Link to="/signup" className="btn-primary text-lg inline-block hover:backdropblur-md hover:shadow-md hover:scale-110 ease-in-out duration-300">
                            Start Your Journey
                        </Link>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8"
                >
                    {features.map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.8 + index * 0.2 }}
                            className="glass-card p-6 rounded-xl  border border-gray-700 shadow-md"
                        >
                            <div className="h-12 w-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mb-4 hover:scale-110 ease-in-out duration-300">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-semibold mb-4 text-purple-200">{feature.title}</h3>
                            <p className="text-gray-300">{feature.description}</p>
                        </motion.div>
                    ))}
                </motion.div>


            </motion.div>
        </>
    );
}

const features = [
    {
        title: "AI-Powered Learning",
        description: "Our advanced AI algorithms adapt to your learning style and pace in real-time.",
        icon: (
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
        ),
    },
    {
        title: "Personalized Path",
        description: "Get a customized learning experience that evolves with your progress.",
        icon: (
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
            </svg>
        ),
    },
    {
        title: "Real-time Analytics",
        description: "Track your progress with detailed insights and performance metrics.",
        icon: (
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
            </svg>
        ),
    },
]

export default LandingPage

