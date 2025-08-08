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
} from "recharts";
import { User, Analytics } from "../types";
import api from "../utils/api";
import Card from "./ui/Card";
import LoadingSpinner from "./ui/LoadingSpinner";
import { ANIMATION_VARIANTS } from "../utils/constants";

const COLORS = ["#6366f1", "#8b5cf6", "#3b82f6", "#2dd4bf"];

interface ProgressChartsProps {
    user: User;
}

interface ChartData {
    name: string;
    score: number;
}

interface SubjectData {
    name: string;
    value: number;
}

const ProgressCharts: React.FC<ProgressChartsProps> = ({ user }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [progressData, setProgressData] = useState<ChartData[]>([]);
    const [subjectData, setSubjectData] = useState<SubjectData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (user?._id) {
            fetchAnalytics();
        }
    }, [user?._id]);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get(`/api/results/analytics/${user._id}`);
            
            if (response.data.success) {
                const analytics: Analytics = response.data.analytics;
                
                if (analytics.recent_results && analytics.recent_results.length > 0) {
                    const progress = analytics.recent_results.reverse().map((result, index) => ({
                        name: `Test ${index + 1}`,
                        score: Math.round((result.score / result.total_questions) * 100)
                    }));
                    setProgressData(progress);
                }
                
                if (analytics.topic_stats) {
                    const subjects = Object.entries(analytics.topic_stats).map(([topic, stats]) => ({
                        name: topic,
                        value: stats.count
                    }));
                    setSubjectData(subjects);
                }
            }
        } catch (error) {
            console.error("Error fetching analytics:", error);
            setError("Failed to load analytics data");
            // Fallback data
            setProgressData([
                { name: "Test 1", score: 65 },
                { name: "Test 2", score: 72 },
                { name: "Test 3", score: 78 },
                { name: "Test 4", score: 85 },
                { name: "Test 5", score: 88 },
            ]);
            setSubjectData([
                { name: "Mathematics", value: 35 },
                { name: "Physics", value: 25 },
                { name: "Chemistry", value: 20 },
                { name: "Biology", value: 20 },
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

    if (error) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[1, 2].map((i) => (
                    <Card key={i} className="h-[400px] flex items-center justify-center">
                        <div className="text-center">
                            <p className="text-red-400 mb-4">{error}</p>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={fetchAnalytics}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-300"
                            >
                                Retry
                            </motion.button>
                        </div>
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
                    <h3 className="text-xl font-semibold mb-4 text-gray-100">Progress Over Time</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={progressData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="name" stroke="#9ca3af" />
                            <YAxis stroke="#9ca3af" />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "#1e293b",
                                    border: "1px solid #374151",
                                    borderRadius: "0.5rem",
                                    color: "#e2e8f0",
                                }}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="score" 
                                stroke="#6366f1" 
                                fillOpacity={1} 
                                fill="url(#colorScore)" 
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </motion.div>
            </Card>

            <Card className="h-[400px] p-6">
                <motion.div variants={ANIMATION_VARIANTS.slideUp}>
                    <h3 className="text-xl font-semibold mb-4 text-white">Subject Distribution</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={subjectData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                fill="#ffffff"
                                paddingAngle={5}
                                dataKey="value"
                                onMouseEnter={(_, index) => setActiveIndex(index)}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            >
                                {subjectData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={COLORS[index % COLORS.length]}
                                        opacity={index === activeIndex ? 1 : 0.7}
                                    />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "#1e293b",
                                    border: "1px solid #374151",
                                    borderRadius: "0.5rem",
                                    color: "#ffffff",
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </motion.div>
            </Card>
        </motion.div>
    );
};

export default ProgressCharts;
