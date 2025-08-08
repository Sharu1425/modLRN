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
    analytics?: Analytics | null;
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

const ProgressCharts: React.FC<ProgressChartsProps> = ({ user, analytics }) => {
    const [progressData, setProgressData] = useState<ChartData[]>([]);
    const [subjectData, setSubjectData] = useState<SubjectData[]>([]);
    const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
    const [hasRealData, setHasRealData] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log('🔍 [PROGRESS_CHARTS] Analytics prop received:', analytics);
        
        if (analytics) {
            console.log('📊 [PROGRESS_CHARTS] Processing analytics data:', analytics);
            processAnalyticsData(analytics);
        } else if (user?._id) {
            // Fallback: if no analytics prop, fetch it ourselves
            console.log('📊 [PROGRESS_CHARTS] No analytics prop, fetching data...');
            fetchAnalytics();
        }
    }, [analytics, user?._id]);

    const processAnalyticsData = (analyticsData: Analytics) => {
        console.log('🔄 [PROGRESS_CHARTS] Processing analytics data...');
        setLoading(true);
        
        try {
            // Check if we have real data (more than 5 tests)
            if (analyticsData.recent_results && analyticsData.recent_results.length >= 5) {
                console.log('✅ [PROGRESS_CHARTS] Using real data with', analyticsData.recent_results.length, 'tests');
                setHasRealData(true);
                
                // Process recent results for progress chart
                const progress = analyticsData.recent_results
                    .slice(-10) // Show last 10 tests
                    .reverse()
                    .map((result, index) => ({
                        name: `Test ${analyticsData.recent_results.length - 9 + index}`,
                        score: Math.round((result.score / result.total_questions) * 100),
                        date: new Date(result.date).toLocaleDateString()
                    }));
                console.log('📈 [PROGRESS_CHARTS] Setting progress data:', progress);
                setProgressData(progress);
                
                // Process topic stats for subject distribution
                if (analyticsData.topic_stats && Object.keys(analyticsData.topic_stats).length > 0) {
                    const subjects = Object.entries(analyticsData.topic_stats)
                        .filter(([_, stats]) => stats.count > 0)
                        .map(([topic, stats]) => ({
                            name: topic,
                            value: stats.count,
                            averageScore: Math.round(stats.average_score)
                        }))
                        .sort((a, b) => b.value - a.value); // Sort by count
                    console.log('📊 [PROGRESS_CHARTS] Setting subject data:', subjects);
                    setSubjectData(subjects);
                }
                
                // Create performance data for bar chart
                const performance = Object.entries(analyticsData.topic_stats || {})
                    .filter(([_, stats]) => stats.count > 0)
                    .map(([topic, stats]) => ({
                        name: topic,
                        score: Math.round(stats.average_score),
                        questions: stats.total_questions
                    }))
                    .sort((a, b) => b.score - a.score); // Sort by average score
                console.log('📊 [PROGRESS_CHARTS] Setting performance data:', performance);
                setPerformanceData(performance);
                
            } else {
                console.log('📊 [PROGRESS_CHARTS] Using placeholder data (less than 5 tests)');
                setHasRealData(false);
                setPlaceholderData();
            }
        } catch (error) {
            console.error('❌ [PROGRESS_CHARTS] Error processing analytics:', error);
            setHasRealData(false);
            setPlaceholderData();
        } finally {
            setLoading(false);
        }
    };

    const setPlaceholderData = () => {
        const placeholderProgress = [
            { name: "Test 1", score: 65, date: "2024-01-15" },
            { name: "Test 2", score: 72, date: "2024-01-20" },
            { name: "Test 3", score: 78, date: "2024-01-25" },
            { name: "Test 4", score: 85, date: "2024-01-30" },
            { name: "Test 5", score: 88, date: "2024-02-05" },
        ];
        const placeholderSubjects = [
            { name: "Mathematics", value: 35, averageScore: 78 },
            { name: "Physics", value: 25, averageScore: 82 },
            { name: "Chemistry", value: 20, averageScore: 75 },
            { name: "Biology", value: 20, averageScore: 80 },
        ];
        const placeholderPerformance = [
            { name: "Mathematics", score: 78, questions: 150 },
            { name: "Physics", score: 82, questions: 120 },
            { name: "Chemistry", score: 75, questions: 100 },
            { name: "Biology", score: 80, questions: 80 },
        ];
        
        console.log('📊 [PROGRESS_CHARTS] Setting placeholder data');
        setProgressData(placeholderProgress);
        setSubjectData(placeholderSubjects);
        setPerformanceData(placeholderPerformance);
    };

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            console.log('🔍 [PROGRESS_CHARTS] Fetching analytics for user:', user._id);
            
            const response = await api.get(`/api/results/analytics/${user._id}`);
            console.log('📥 [PROGRESS_CHARTS] Analytics response:', response.data);
            
            if (response.data.success) {
                const analytics: Analytics = response.data.analytics;
                
                // Check if we have real data (more than 5 tests)
                if (analytics.recent_results && analytics.recent_results.length >= 5) {
                    console.log('✅ [PROGRESS_CHARTS] Using real data with', analytics.recent_results.length, 'tests');
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
                    console.log('📈 [PROGRESS_CHARTS] Setting progress data:', progress);
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
                        console.log('📊 [PROGRESS_CHARTS] Setting subject data:', subjects);
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
                    console.log('📊 [PROGRESS_CHARTS] Setting performance data:', performance);
                    setPerformanceData(performance);
                    
                } else {
                    console.log('📊 [PROGRESS_CHARTS] Using placeholder data (less than 5 tests)');
                    // Show placeholder data for users with less than 5 tests
                    setHasRealData(false);
                    
                    const placeholderProgress = [
                        { name: "Test 1", score: 65, date: "2024-01-15" },
                        { name: "Test 2", score: 72, date: "2024-01-20" },
                        { name: "Test 3", score: 78, date: "2024-01-25" },
                        { name: "Test 4", score: 85, date: "2024-01-30" },
                        { name: "Test 5", score: 88, date: "2024-02-05" },
                    ];
                    const placeholderSubjects = [
                        { name: "Mathematics", value: 35, averageScore: 78 },
                        { name: "Physics", value: 25, averageScore: 82 },
                        { name: "Chemistry", value: 20, averageScore: 75 },
                        { name: "Biology", value: 20, averageScore: 80 },
                    ];
                    const placeholderPerformance = [
                        { name: "Mathematics", score: 78, questions: 150 },
                        { name: "Physics", score: 82, questions: 120 },
                        { name: "Chemistry", score: 75, questions: 100 },
                        { name: "Biology", score: 80, questions: 80 },
                    ];
                    
                    console.log('📊 [PROGRESS_CHARTS] Setting placeholder data for < 5 tests');
                    setProgressData(placeholderProgress);
                    setSubjectData(placeholderSubjects);
                    setPerformanceData(placeholderPerformance);
                }
            } else {
                throw new Error("Failed to fetch analytics");
            }
        } catch (error) {
            console.error("❌ [PROGRESS_CHARTS] Error fetching analytics:", error);
            // Show placeholder data
            setHasRealData(false);
            
            const placeholderProgress = [
                { name: "Test 1", score: 65, date: "2024-01-15" },
                { name: "Test 2", score: 72, date: "2024-01-20" },
                { name: "Test 3", score: 78, date: "2024-01-25" },
                { name: "Test 4", score: 85, date: "2024-01-30" },
                { name: "Test 5", score: 88, date: "2024-02-05" },
            ];
            const placeholderSubjects = [
                { name: "Mathematics", value: 35, averageScore: 78 },
                { name: "Physics", value: 25, averageScore: 82 },
                { name: "Chemistry", value: 20, averageScore: 75 },
                { name: "Biology", value: 20, averageScore: 80 },
            ];
            const placeholderPerformance = [
                { name: "Mathematics", score: 78, questions: 150 },
                { name: "Physics", score: 82, questions: 120 },
                { name: "Chemistry", score: 75, questions: 100 },
                { name: "Biology", score: 80, questions: 80 },
            ];
            
            console.log('📊 [PROGRESS_CHARTS] Error: Setting placeholder data');
            setProgressData(placeholderProgress);
            setSubjectData(placeholderSubjects);
            setPerformanceData(placeholderPerformance);
        } finally {
            console.log('✅ [PROGRESS_CHARTS] Setting loading to false');
            setLoading(false);
        }
    };

    console.log('🔍 [PROGRESS_CHARTS] Render state:', {
        loading,
        progressDataLength: progressData.length,
        subjectDataLength: subjectData.length,
        performanceDataLength: performanceData.length,
        hasRealData
    });

    if (loading && progressData.length === 0) {
        console.log('⏳ [PROGRESS_CHARTS] Showing loading spinner');
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

    // Fallback: if no data after loading, show placeholder
    if (progressData.length === 0) {
        console.log('⚠️ [PROGRESS_CHARTS] No data available, showing fallback charts');
        const fallbackData = [
            { name: "Test 1", score: 65, date: "2024-01-15" },
            { name: "Test 2", score: 72, date: "2024-01-20" },
            { name: "Test 3", score: 78, date: "2024-01-25" },
            { name: "Test 4", score: 85, date: "2024-01-30" },
            { name: "Test 5", score: 88, date: "2024-02-05" },
        ];
        const fallbackSubjects = [
            { name: "Mathematics", value: 35, averageScore: 78 },
            { name: "Physics", value: 25, averageScore: 82 },
            { name: "Chemistry", value: 20, averageScore: 75 },
            { name: "Biology", value: 20, averageScore: 80 },
        ];
        const fallbackPerformance = [
            { name: "Mathematics", score: 78, questions: 150 },
            { name: "Physics", score: 82, questions: 120 },
            { name: "Chemistry", score: 75, questions: 100 },
            { name: "Biology", score: 80, questions: 80 },
        ];
        
        setProgressData(fallbackData);
        setSubjectData(fallbackSubjects);
        setPerformanceData(fallbackPerformance);
        setHasRealData(false);
        setLoading(false);
    }

    console.log('📊 [PROGRESS_CHARTS] Rendering charts with data:', {
        progressData,
        subjectData,
        performanceData
    });



    console.log('🎨 [PROGRESS_CHARTS] About to render charts with data:', {
        progressDataLength: progressData.length,
        performanceDataLength: performanceData.length,
        hasRealData,
        loading
    });

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
                    <div className="h-[300px] w-full">
                        {progressData.length > 0 ? (
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
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">
                                <p>No chart data available</p>
                            </div>
                        )}
                    </div>
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
                    <div className="h-[300px] w-full">
                        {performanceData.length > 0 ? (
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
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">
                                <p>No chart data available</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </Card>
        </motion.div>
    );
};

export default ProgressCharts;
