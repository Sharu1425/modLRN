import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import AnimatedBackground from "../components/AnimatedBackground";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { ANIMATION_VARIANTS, SPRING_TRANSITION } from "../utils/constants";

interface Feature {
    title: string;
    description: string;
    icon: React.ReactNode;
}

const features: Feature[] = [
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
];

const LandingPage: React.FC = () => {
    return (
        <>
            <AnimatedBackground />
            <motion.div
                initial="initial"
                animate="animate"
                exit="exit"
                variants={ANIMATION_VARIANTS.fadeIn}
                className="container mx-auto px-4 py-8 relative z-20"
            >
                <div className="text-center max-w-4xl mx-auto mt-20">
                    <motion.h1
                        initial={{ y: -50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={SPRING_TRANSITION}
                        className="text-6xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 mb-8"
                    >
                        %LearnAI
                    </motion.h1>
                    
                    <motion.p
                        variants={ANIMATION_VARIANTS.slideUp}
                        initial="initial"
                        animate="animate"
                        transition={{ delay: 0.2 }}
                        className="text-xl mb-8 text-purple-200 leading-relaxed"
                    >
                        Experience the future of learning with our AI-powered adaptive assessment system. 
                        Personalized learning paths that evolve with you.
                    </motion.p>
                    
                    <motion.div
                        variants={ANIMATION_VARIANTS.scaleIn}
                        initial="initial"
                        animate="animate"
                        transition={{ delay: 0.4 }}
                    >
                        <Link to="/signup">
                            <Button variant="primary" size="lg" className="text-xl px-12 py-4">
                                Start Your Journey
                            </Button>
                        </Link>
                    </motion.div>
                </div>

                <motion.div
                    variants={ANIMATION_VARIANTS.stagger}
                    initial="initial"
                    animate="animate"
                    className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8"
                >
                    {features.map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            variants={ANIMATION_VARIANTS.slideUp}
                            transition={{ delay: 0.6 + index * 0.2 }}
                        >
                            <Card className="p-6 h-full">
                                <motion.div 
                                    className="h-12 w-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mb-4"
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    transition={SPRING_TRANSITION}
                                >
                                    {feature.icon}
                                </motion.div>
                                <h3 className="text-xl font-semibold mb-4 text-purple-200">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-300 leading-relaxed">
                                    {feature.description}
                                </p>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Additional CTA Section */}
                <motion.div
                    variants={ANIMATION_VARIANTS.slideUp}
                    initial="initial"
                    animate="animate"
                    transition={{ delay: 1.2 }}
                    className="mt-20 text-center"
                >
                    <Card className="p-12 max-w-2xl mx-auto">
                        <h2 className="text-3xl font-bold text-purple-200 mb-4">
                            Ready to Transform Your Learning?
                        </h2>
                        <p className="text-purple-300 mb-8 text-lg">
                            Join thousands of learners who have already discovered the power of AI-driven education.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/signup">
                                <Button variant="primary" size="lg">
                                    Get Started Free
                                </Button>
                            </Link>
                            <Link to="/login">
                                <Button variant="outline" size="lg">
                                    Sign In
                                </Button>
                            </Link>
                        </div>
                    </Card>
                </motion.div>
            </motion.div>
        </>
    );
};

export default LandingPage;
