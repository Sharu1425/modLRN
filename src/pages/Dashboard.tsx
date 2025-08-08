import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Analytics, TestResult } from "../types";
import ProgressCharts from "../components/ProgressCharts";
import AnimatedBackground from "../components/AnimatedBackground";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import StatsCard from "../components/StatsCard";
import ErrorState from "../components/ErrorState";
import api from "../utils/api";
import { ANIMATION_VARIANTS, TRANSITION_DEFAULTS } from "../utils/constants";

interface DashboardProps {
    user: User;
}

interface DashboardStats {
    completedAssessments: number;
    averageScore: number;
    totalQuestions: number;
    topicsStudied: number;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
    console.log('📊 [DASHBOARD] Loading dashboard for user:', user?.email);
    
    const [stats, setStats] = useState<DashboardStats>({
        completedAssessments: 0,
        averageScore: 0,
        totalQuestions: 0,
        topicsStudied: 0
    });
    const [recentTests, setRecentTests] = useState<TestResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (user?._id || user?.id) {
            console.log('📊 [DASHBOARD] Fetching analytics for user:', user.email);
            fetchStats();
            fetchRecentTests();
        }
    }, [user?._id, user?.id]);

    const fetchStats = async () => {
        try {
            const userId = user._id || user.id;
            setLoading(true);
            setError(null);
            
            const url = `/api/results/analytics/${userId}`;
            const response = await api.get(url);
            
            if (response.data.success) {
                const analytics: Analytics = response.data.analytics;
                console.log('📊 [DASHBOARD] Analytics loaded for user:', user.email);
                
                const newStats = {
                    completedAssessments: analytics.total_assessments || 0,
                    averageScore: analytics.average_score || 0,
                    totalQuestions: analytics.total_questions || 0,
                    topicsStudied: analytics.topics?.length || 0
                };
                
                setStats(newStats);
            } else {
                throw new Error(response.data.error || 'Failed to fetch analytics');
            }
        } catch (error: any) {
            console.error("❌ [DASHBOARD] Analytics error:", error.message);
            let errorMessage = "Failed to load dashboard statistics";
            if (error.response?.data?.detail) {
                errorMessage = error.response.data.detail;
            } else if (error.message) {
                errorMessage = error.message;
            }
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const fetchRecentTests = async () => {
        try {
            console.log('🔄 [DASHBOARD] Starting fetchRecentTests...');
            const userId = user._id || user.id;
            console.log('👤 [DASHBOARD] User ID:', userId);
            
            const url = `/api/results/user/${userId}`;
            console.log('🌐 [DASHBOARD] Making recent tests API request to:', url);
            
            const startTime = Date.now();
            const response = await api.get(url);
            const endTime = Date.now();
            
            console.log('⏱️ [DASHBOARD] Recent tests request completed in:', endTime - startTime, 'ms');
            console.log('📥 [DASHBOARD] Response status:', response.status);
            console.log('📥 [DASHBOARD] Response data:', response.data);
            
            if (response.data.success) {
                const results = response.data.results || [];
                console.log('📋 [DASHBOARD] Number of results received:', results.length);
                console.log('📋 [DASHBOARD] Results:', results);
                
                const recentTests = results.slice(0, 5); // Show last 5 tests
                console.log('📋 [DASHBOARD] Setting recent tests:', recentTests);
                setRecentTests(recentTests);
            } else {
                console.error('❌ [DASHBOARD] Recent tests API returned success: false');
                throw new Error(response.data.error || 'Failed to fetch recent tests');
            }
            
            console.log('✅ [DASHBOARD] fetchRecentTests completed successfully');
        } catch (error: any) {
            console.error("❌ [DASHBOARD] Error in fetchRecentTests:", error);
            console.error("❌ [DASHBOARD] Error details:", {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                statusText: error.response?.statusText,
                config: error.config
            });
            
            // Don't set error for recent tests, just log it
            console.log('⚠️ [DASHBOARD] Recent tests failed, but continuing...');
        }
    };

    const statCards = [
        {
            title: "Completed Assessments",
            value: stats.completedAssessments,
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            color: "from-blue-500 to-cyan-500"
        },
        {
            title: "Average Score",
            value: `${Math.round(stats.averageScore)}%`,
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
            ),
            color: "from-purple-500 to-pink-500"
        },
        {
            title: "Total Questions",
            value: stats.totalQuestions,
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            color: "from-green-500 to-teal-500"
        },
        {
            title: "Topics Studied",
            value: stats.topicsStudied,
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
            ),
            color: "from-orange-500 to-red-500"
        }
    ];

    return (
        <>
            <AnimatedBackground />
            <div className="min-h-screen pt-20 px-4 relative z-10">
                <motion.div
                    variants={ANIMATION_VARIANTS.fadeIn}
                    initial="initial"
                    animate="animate"
                    className="max-w-7xl mx-auto"
                >
                    <Card className="p-8 mb-8">
                        <motion.div
                            variants={ANIMATION_VARIANTS.slideDown}
                            className="text-center mb-8"
                        >
                            <h1 className="text-4xl font-bold text-purple-200 mb-2">
                                Welcome back, {user.username || user.name || 'Learner'}!
                            </h1>
                            <p className="text-purple-300 text-lg">
                                Ready to continue your learning journey?
                            </p>
                        </motion.div>

                        {/* Quick Stats Grid */}
                        <motion.div
                            variants={ANIMATION_VARIANTS.stagger}
                            initial="initial"
                            animate="animate"
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
                        >
                            {statCards.map((stat, index) => (
                                <motion.div
                                    key={stat.title}
                                    variants={ANIMATION_VARIANTS.slideUp}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <StatsCard
                                        title={stat.title}
                                        value={stat.value}
                                        icon={stat.icon}
                                        color={stat.color}
                                        loading={loading}
                                    />
                                </motion.div>
                            ))}
                        </motion.div>

                        {/* Progress Charts */}
                        {!loading && !error && (
                            <motion.div
                                variants={ANIMATION_VARIANTS.slideUp}
                                initial="initial"
                                animate="animate"
                                transition={{ delay: 0.4 }}
                                className="mb-8"
                            >
                                <ProgressCharts user={user} />
                            </motion.div>
                        )}

                        {error && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-8"
                            >
                                <ErrorState
                                    title="Dashboard Error"
                                    message={error}
                                    onRetry={fetchStats}
                                    retryText="Retry"
                                    showCard={false}
                                />
                            </motion.div>
                        )}

                        {/* Recent Test History */}
                        {recentTests.length > 0 && (
                            <motion.div
                                variants={ANIMATION_VARIANTS.slideUp}
                                initial="initial"
                                animate="animate"
                                transition={{ delay: 0.5 }}
                                className="mb-8"
                            >
                                <Card className="p-6">
                                    <h3 className="text-xl font-semibold text-purple-200 mb-6 flex items-center">
                                        <span className="mr-2">📊</span>
                                        Recent Tests
                                    </h3>
                                    <div className="space-y-3">
                                        {recentTests.map((test, index) => (
                                            <Link
                                                key={test.id}
                                                to={`/test-result/${test.id}`}
                                                className="block"
                                            >
                                                <motion.div
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.1 }}
                                                    className="p-4 rounded-lg bg-purple-900/20 border border-purple-500/30 hover:bg-purple-900/30 hover:border-purple-400/50 transition-all duration-300 cursor-pointer group"
                                                >
                                                    <div className="flex justify-between items-center">
                                                        <div>
                                                            <p className="text-purple-200 font-medium group-hover:text-purple-100 transition-colors">
                                                                {test.topic}
                                                            </p>
                                                            <p className="text-purple-300 text-sm">
                                                                {new Date(test.date).toLocaleDateString()} • {test.difficulty}
                                                                {test.time_taken && (
                                                                    <span className="ml-2">• {Math.floor(test.time_taken / 60)}:{(test.time_taken % 60).toString().padStart(2, '0')}</span>
                                                                )}
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className={`text-lg font-bold ${
                                                                (test.percentage || (test.score / test.total_questions) * 100) >= 80 
                                                                    ? 'text-green-400' 
                                                                    : (test.percentage || (test.score / test.total_questions) * 100) >= 60 
                                                                    ? 'text-yellow-400' 
                                                                    : 'text-red-400'
                                                            }`}>
                                                                {Math.round(test.percentage || (test.score / test.total_questions) * 100)}%
                                                            </div>
                                                            <p className="text-purple-300 text-sm">
                                                                {test.score}/{test.total_questions}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            </Link>
                                        ))}
                                    </div>
                                    <div className="text-center mt-4">
                                        <Link to="/profile">
                                            <Button variant="outline" size="sm">
                                                View All Tests
                                            </Button>
                                        </Link>
                                    </div>
                                </Card>
                            </motion.div>
                        )}

                        {/* Action Cards */}
                        <motion.div
                            variants={ANIMATION_VARIANTS.stagger}
                            initial="initial"
                            animate="animate"
                            className="grid grid-cols-1 md:grid-cols-2 gap-6"
                        >
                            <motion.div variants={ANIMATION_VARIANTS.slideUp}>
                                <Card className="p-6 h-full">
                                    <div className="flex items-center mb-4">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center mr-4">
                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-xl font-semibold text-purple-200">Start New Assessment</h3>
                                    </div>
                                    <p className="text-purple-300 mb-6 leading-relaxed">
                                        Test your knowledge with our AI-powered adaptive assessment system. 
                                        Get personalized questions that adapt to your skill level.
                                    </p>
                                    <Link to="/assessconfig">
                                        <Button variant="primary" className="w-full">
                                            Begin Assessment
                                        </Button>
                                    </Link>
                                </Card>
                            </motion.div>

                            <motion.div variants={ANIMATION_VARIANTS.slideRight}>
                                <Card className="p-6 h-full">
                                    <div className="flex items-center mb-4">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mr-4">
                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-xl font-semibold text-purple-200">View Profile</h3>
                                    </div>
                                    <p className="text-purple-300 mb-6 leading-relaxed">
                                        Manage your account settings, view detailed statistics, 
                                        and set up face recognition for secure login.
                                    </p>
                                    <Link to="/profile">
                                        <Button variant="secondary" className="w-full">
                                            Go to Profile
                                        </Button>
                                    </Link>
                                </Card>
                            </motion.div>
                        </motion.div>
                    </Card>
                </motion.div>
            </div>
        </>
    );
};

export default Dashboard;
