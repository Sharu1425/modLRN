import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    LineChart,
    Line,
} from "recharts";
import { User, Analytics } from "../types";
import api from "../utils/api";
import Card from "./ui/Card";
import LoadingSpinner from "./ui/LoadingSpinner";
import { ANIMATION_VARIANTS } from "../utils/constants";

const COLORS = ["#6366f1", "#8b5cf6", "#3b82f6", "#2dd4bf", "#f59e0b", "#ef4444", "#10b981", "#8b5cf6"];

interface ProgressChartsProps {
    user: User;
}

interface ChartData {
    name: string;
    score: number;
    date: string;
}

interface SubjectData {
    name: string;
    value: number;
    averageScore: number;
}

interface PerformanceData {
    name: string;
    score: number;
    questions: number;
}

const ProgressCharts: React.FC<ProgressChartsProps> = ({ user }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [progressData, setProgressData] = useState<ChartData[]>([]);
    const [subjectData, setSubjectData] = useState<SubjectData[]>([]);
    const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
    const [hasRealData, setHasRealData] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?._id) {
            fetchAnalytics();
        }
    }, [user?._id]);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/api/results/analytics/${user._id}`);
            
            if (response.data.success) {
                const analytics: Analytics = response.data.analytics;
                
                // Check if we have real data (more than 5 tests)
                if (analytics.recent_results && analytics.recent_results.length >= 5) {
                    setHasRealData(true);
                    
                    // Process recent results for progress chart
                    const progress = analytics.recent_results
                        .slice(-10) // Show last 10 tests
                        .reverse()
                        .map((result, index) => ({
                            name: `Test ${analytics.recent_results.length - 9 + index}`,
                            score: Math.round((result.score / result.total_questions) * 100),
                            date: new Date(result.date).toLocaleDateString()
                        }));
                    setProgressData(progress);
                    
                    // Process topic stats for subject distribution
                    if (analytics.topic_stats && Object.keys(analytics.topic_stats).length > 0) {
                        const subjects = Object.entries(analytics.topic_stats)
                            .filter(([_, stats]) => stats.count > 0)
                            .map(([topic, stats]) => ({
                                name: topic,
                                value: stats.count,
                                averageScore: Math.round(stats.average_score)
                            }))
                            .sort((a, b) => b.value - a.value); // Sort by count
                        setSubjectData(subjects);
                    }
                    
                    // Create performance data for bar chart
                    const performance = Object.entries(analytics.topic_stats || {})
                        .filter(([_, stats]) => stats.count > 0)
                        .map(([topic, stats]) => ({
                            name: topic,
                            score: Math.round(stats.average_score),
                            questions: stats.total_questions
                        }))
                        .sort((a, b) => b.score - a.score); // Sort by average score
                    setPerformanceData(performance);
                    
                } else {
                    // Show placeholder data for users with less than 5 tests
                    setHasRealData(false);
                    setProgressData([
                        { name: "Test 1", score: 65, date: "2024-01-15" },
                        { name: "Test 2", score: 72, date: "2024-01-20" },
                        { name: "Test 3", score: 78, date: "2024-01-25" },
                        { name: "Test 4", score: 85, date: "2024-01-30" },
                        { name: "Test 5", score: 88, date: "2024-02-05" },
                    ]);
                    setSubjectData([
                        { name: "Mathematics", value: 35, averageScore: 78 },
                        { name: "Physics", value: 25, averageScore: 82 },
                        { name: "Chemistry", value: 20, averageScore: 75 },
                        { name: "Biology", value: 20, averageScore: 80 },
                    ]);
                    setPerformanceData([
                        { name: "Mathematics", score: 78, questions: 150 },
                        { name: "Physics", score: 82, questions: 120 },
                        { name: "Chemistry", score: 75, questions: 100 },
                        { name: "Biology", score: 80, questions: 80 },
                    ]);
                }
            } else {
                throw new Error("Failed to fetch analytics");
            }
        } catch (error) {
            console.error("Error fetching analytics:", error);
            // Show placeholder data
            setHasRealData(false);
            setProgressData([
                { name: "Test 1", score: 65, date: "2024-01-15" },
                { name: "Test 2", score: 72, date: "2024-01-20" },
                { name: "Test 3", score: 78, date: "2024-01-25" },
                { name: "Test 4", score: 85, date: "2024-01-30" },
                { name: "Test 5", score: 88, date: "2024-02-05" },
            ]);
            setSubjectData([
                { name: "Mathematics", value: 35, averageScore: 78 },
                { name: "Physics", value: 25, averageScore: 82 },
                { name: "Chemistry", value: 20, averageScore: 75 },
                { name: "Biology", value: 20, averageScore: 80 },
            ]);
            setPerformanceData([
                { name: "Mathematics", score: 78, questions: 150 },
                { name: "Physics", score: 82, questions: 120 },
                { name: "Chemistry", score: 75, questions: 100 },
                { name: "Biology", score: 80, questions: 80 },
            ]);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[1, 2].map((i) => (
                    <Card key={i} className="h-[400px] flex items-center justify-center">
                        <LoadingSpinner text="Loading analytics..." />
                    </Card>
                ))}
            </div>
        );
    }



    return (
        <motion.div 
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            variants={ANIMATION_VARIANTS.stagger}
            initial="initial"
            animate="animate"
        >
            <Card className="h-[400px] p-6">
                <motion.div variants={ANIMATION_VARIANTS.slideUp}>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold text-gray-100">Performance Progress</h3>
                        {hasRealData && (
                            <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-full">
                                Real Data
                            </span>
                        )}
                    </div>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={progressData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis 
                                dataKey="name" 
                                stroke="#9ca3af" 
                                fontSize={12}
                                tick={{ fill: '#9ca3af' }}
                            />
                            <YAxis 
                                stroke="#9ca3af" 
                                domain={[0, 100]}
                                tick={{ fill: '#9ca3af' }}
                                fontSize={12}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "#1e293b",
                                    border: "1px solid #374151",
                                    borderRadius: "0.5rem",
                                    color: "#e2e8f0",
                                }}
                                formatter={(value: any) => [`${value}%`, 'Score']}
                                labelFormatter={(label) => `Test: ${label}`}
                            />
                            <Line 
                                type="monotone" 
                                dataKey="score" 
                                stroke="#6366f1" 
                                strokeWidth={3}
                                dot={{ fill: '#6366f1', strokeWidth: 2, r: 4 }}
                                activeDot={{ r: 6, stroke: '#6366f1', strokeWidth: 2, fill: '#ffffff' }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </motion.div>
            </Card>

            <Card className="h-[400px] p-6">
                <motion.div variants={ANIMATION_VARIANTS.slideUp}>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold text-white">Subject Performance</h3>
                        {hasRealData && (
                            <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-full">
                                Real Data
                            </span>
                        )}
                    </div>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={performanceData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis 
                                dataKey="name" 
                                stroke="#9ca3af" 
                                fontSize={12}
                                tick={{ fill: '#9ca3af' }}
                                angle={-45}
                                textAnchor="end"
                                height={80}
                            />
                            <YAxis 
                                stroke="#9ca3af" 
                                domain={[0, 100]}
                                tick={{ fill: '#9ca3af' }}
                                fontSize={12}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "#1e293b",
                                    border: "1px solid #374151",
                                    borderRadius: "0.5rem",
                                    color: "#ffffff",
                                }}
                                formatter={(value: any) => [`${value}%`, 'Average Score']}
                            />
                            <Bar 
                                dataKey="score" 
                                fill="#6366f1"
                                radius={[4, 4, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>
            </Card>
        </motion.div>
    );
};

export default ProgressCharts;
