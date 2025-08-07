import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import * as faceapi from "@vladmandic/face-api";
import { User, TestResult } from "../types";
import AnimatedBackground from "../components/AnimatedBackground";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import LoadingSpinner from "../components/ui/LoadingSpinner";

import api from "../utils/api";
import { ANIMATION_VARIANTS, TRANSITION_DEFAULTS } from "../utils/constants";

interface UserProfileProps {
    user: User;
}

const UserProfile: React.FC<UserProfileProps> = ({ user }) => {
    console.log('🔄 [PROFILE] Component rendered');
    console.log('👤 [PROFILE] User prop:', user);
    console.log('🆔 [PROFILE] User ID check:', {
        '_id': user?._id,
        'id': user?.id,
        'hasOwnProperty _id': user?.hasOwnProperty('_id'),
        'hasOwnProperty id': user?.hasOwnProperty('id'),
        'keys': user ? Object.keys(user) : 'No user object'
    });
    
    const [testHistory, setTestHistory] = useState<TestResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isRegisteringFace, setIsRegisteringFace] = useState(false);
    const [faceRegistrationError, setFaceRegistrationError] = useState("");
    const [faceRegistrationSuccess, setFaceRegistrationSuccess] = useState(false);

    const [stats, setStats] = useState({
        averageScore: 0,
        totalAttempts: 0,
        topicsStudied: 0,
        bestScore: 0
    });
    const videoRef = useRef<HTMLVideoElement>(null);
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [cameraActive, setCameraActive] = useState(false);

    useEffect(() => {
        console.log('🔄 [PROFILE] useEffect triggered');
        console.log('👤 [PROFILE] User object:', user);
        console.log('🆔 [PROFILE] User ID:', user?._id || user?.id);
        console.log('🔑 [PROFILE] Access token:', localStorage.getItem('access_token') ? 'Present' : 'Missing');
        
        if (user?._id || user?.id) {
            console.log('✅ [PROFILE] User ID found, calling fetch functions');
            fetchTestHistory();
            loadFaceModels();
        } else {
            console.log('❌ [PROFILE] No user ID found, skipping API calls');
        }
    }, [user?._id, user?.id]);

    const fetchTestHistory = async () => {
        try {
            console.log('🔄 [PROFILE] Starting fetchTestHistory...');
            const userId = user._id || user.id;
            console.log('👤 [PROFILE] User ID:', userId);
            console.log('🔑 [PROFILE] Access token:', localStorage.getItem('access_token') ? 'Present' : 'Missing');
            
            setLoading(true);
            setError("");
            
            const url = `/api/results/user/${userId}`;
            console.log('🌐 [PROFILE] Making API request to:', url);
            console.log('📡 [PROFILE] Request details:', {
                method: 'GET',
                url: url,
                baseURL: 'http://localhost:5001',
                withCredentials: true
            });
            
            const startTime = Date.now();
            const response = await api.get(url);
            const endTime = Date.now();
            
            console.log('⏱️ [PROFILE] Request completed in:', endTime - startTime, 'ms');
            console.log('📥 [PROFILE] Response status:', response.status);
            console.log('📥 [PROFILE] Response headers:', response.headers);
            console.log('📥 [PROFILE] Full response:', response);
            console.log('📊 [PROFILE] Response data:', response.data);
            
            if (!response.data.success) {
                console.error('❌ [PROFILE] API returned success: false');
                throw new Error(response.data.error || 'Failed to fetch test history');
            }

            const results = response.data.results || [];
            console.log('📋 [PROFILE] Number of results received:', results.length);
            console.log('📋 [PROFILE] Results:', results);
            
            setTestHistory(results);
            
            // Calculate stats
            if (results.length > 0) {
                console.log('📊 [PROFILE] Calculating stats...');
                const totalScore = results.reduce((sum: number, result: TestResult) => 
                    sum + (result.score / result.total_questions) * 100, 0);
                const averageScore = totalScore / results.length;
                const bestScore = Math.max(...results.map((result: TestResult) => 
                    (result.score / result.total_questions) * 100));
                const uniqueTopics = new Set(results.map((result: TestResult) => result.topic));
                
                const calculatedStats = {
                    averageScore: Math.round(averageScore),
                    totalAttempts: results.length,
                    topicsStudied: uniqueTopics.size,
                    bestScore: Math.round(bestScore)
                };
                
                console.log('📊 [PROFILE] Calculated stats:', calculatedStats);
                setStats(calculatedStats);
            } else {
                console.log('📊 [PROFILE] No results found, setting default stats');
                setStats({
                    averageScore: 0,
                    totalAttempts: 0,
                    topicsStudied: 0,
                    bestScore: 0
                });
            }
            
            console.log('✅ [PROFILE] fetchTestHistory completed successfully');
        } catch (error: any) {
            console.error("❌ [PROFILE] Error in fetchTestHistory:", error);
            console.error("❌ [PROFILE] Error details:", {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                statusText: error.response?.statusText,
                config: error.config
            });
            
            let errorMessage = "Failed to load test history";
            if (error.response?.data?.detail) {
                errorMessage = error.response.data.detail;
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            console.error("❌ [PROFILE] Setting error message:", errorMessage);
            setError(errorMessage);
        } finally {
            console.log('🏁 [PROFILE] Setting loading to false');
            setLoading(false);
        }
    };

    const loadFaceModels = async () => {
        try {
            await Promise.all([
                faceapi.nets.tinyFaceDetector.loadFromUri("https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights"),
                faceapi.nets.faceRecognitionNet.loadFromUri("https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights"),
                faceapi.nets.faceLandmark68Net.loadFromUri("https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights")
            ]);
            setModelsLoaded(true);
        } catch (error) {
            console.error("Error loading face detection models:", error);
            setFaceRegistrationError("Failed to load face detection models");
        }
    };

    const startVideo = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setCameraActive(true);
            }
        } catch (err) {
            console.error("Camera access error:", err);
            setFaceRegistrationError("Failed to access camera");
        }
    };

    const stopVideo = () => {
        if (videoRef.current?.srcObject) {
            const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
            tracks.forEach(track => track.stop());
            videoRef.current.srcObject = null;
            setCameraActive(false);
        }
    };

    const registerFace = async () => {
        if (!modelsLoaded || isRegisteringFace || !videoRef.current) return;
        
        setIsRegisteringFace(true);
        setFaceRegistrationError("");
        setFaceRegistrationSuccess(false);

        try {
            const detections = await faceapi
                .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
                .withFaceLandmarks()
                .withFaceDescriptor();

            if (!detections) {
                setFaceRegistrationError("No face detected. Please position your face in the camera.");
                return;
            }

            const faceDescriptor = Array.from(detections.descriptor);
            
            const response = await api.post("/auth/register-face", {
                face_descriptor: faceDescriptor
            });

            if (response.data.success) {
                setFaceRegistrationSuccess(true);
                stopVideo();
            } else {
                setFaceRegistrationError(response.data.error || "Failed to register face");
            }
        } catch (error: any) {
            console.error("Face registration error:", error);
            setFaceRegistrationError(error.response?.data?.detail || "An error occurred during face registration");
        } finally {
            setIsRegisteringFace(false);
        }
    };

    const statCards = [
        {
            title: "Total Attempts",
            value: stats.totalAttempts,
            icon: "📊",
            color: "from-blue-500 to-cyan-500"
        },
        {
            title: "Average Score",
            value: `${stats.averageScore}%`,
            icon: "📈",
            color: "from-purple-500 to-pink-500"
        },
        {
            title: "Best Score",
            value: `${stats.bestScore}%`,
            icon: "🏆",
            color: "from-yellow-500 to-orange-500"
        },
        {
            title: "Topics Studied",
            value: stats.topicsStudied,
            icon: "📚",
            color: "from-green-500 to-teal-500"
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
                    className="max-w-6xl mx-auto"
                >
                    {/* Profile Header */}
                    <Card className="p-8 mb-8">
                        <motion.div
                            variants={ANIMATION_VARIANTS.slideDown}
                            className="flex items-center space-x-6 mb-8"
                        >
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-2 border-purple-500/30 flex items-center justify-center">
                                {user?.profile_picture ? (
                                    <img 
                                        src={user.profile_picture || "/placeholder.svg"} 
                                        alt="Profile" 
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                ) : (
                                    <svg className="w-12 h-12 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                )}
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-purple-200 mb-2">
                                    {user?.name || user?.username || 'User'}
                                </h1>
                                <p className="text-purple-300 text-lg">{user?.email}</p>
                                <div className="flex items-center mt-2 space-x-4">
                                    <span className="text-sm text-purple-400">
                                        {user?.has_face_descriptor ? '🔐 Face ID Enabled' : '🔓 Face ID Not Set'}
                                    </span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Stats Grid */}
                        <motion.div
                            variants={ANIMATION_VARIANTS.stagger}
                            initial="initial"
                            animate="animate"
                            className="grid grid-cols-2 md:grid-cols-4 gap-4"
                        >
                            {statCards.map((stat, index) => (
                                <motion.div
                                    key={stat.title}
                                    variants={ANIMATION_VARIANTS.slideUp}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Card className="p-4 text-center" hover={true}>
                                        <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${stat.color} flex items-center justify-center mx-auto mb-3 text-white text-lg`}>
                                            {stat.icon}
                                        </div>
                                        <h3 className="text-xl font-bold text-purple-200 mb-1">
                                            {loading ? <LoadingSpinner size="sm" /> : stat.value}
                                        </h3>
                                        <p className="text-purple-300 text-sm">{stat.title}</p>
                                    </Card>
                                </motion.div>
                            ))}
                        </motion.div>
                    </Card>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Face Recognition Section */}
                        <Card className="p-6">
                            <motion.div variants={ANIMATION_VARIANTS.slideLeft}>
                                <h3 className="text-xl font-semibold text-purple-200 mb-6 flex items-center">
                                    <span className="mr-2">🔐</span>
                                    Face Recognition Setup
                                </h3>
                                
                                <div className="space-y-4">
                                    {!cameraActive ? (
                                        <div className="text-center">
                                            <div className="w-64 h-48 bg-gray-900 rounded-lg mx-auto mb-4 flex items-center justify-center border-2 border-purple-500/30">
                                                <svg className="w-16 h-16 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <Button
                                                onClick={startVideo}
                                                disabled={!modelsLoaded}
                                                variant="outline"
                                            >
                                                {modelsLoaded ? 'Start Camera' : 'Loading Models...'}
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="text-center">
                                            <div className="relative inline-block">
                                                <video 
                                                    ref={videoRef} 
                                                    autoPlay 
                                                    className="rounded-lg w-64 h-48 object-cover border-2 border-purple-500/30"
                                                />
                                                <div className="absolute inset-0 border-2 border-purple-500/50 rounded-lg pointer-events-none"></div>
                                            </div>
                                            <div className="mt-4 space-x-2">
                                                <Button
                                                    onClick={registerFace}
                                                    disabled={isRegisteringFace}
                                                    isLoading={isRegisteringFace}
                                                    variant="primary"
                                                >
                                                    {isRegisteringFace ? 'Registering...' : 'Register Face'}
                                                </Button>
                                                <Button
                                                    onClick={stopVideo}
                                                    variant="outline"
                                                >
                                                    Stop Camera
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {faceRegistrationError && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3"
                                        >
                                            <span className="mr-2">⚠️</span>
                                            {faceRegistrationError}
                                        </motion.div>
                                    )}

                                    {faceRegistrationSuccess && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="text-green-400 text-sm bg-green-500/10 border border-green-500/20 rounded-lg p-3"
                                        >
                                            <span className="mr-2">✅</span>
                                            Face registered successfully! You can now use face login.
                                        </motion.div>
                                    )}
                                </div>
                            </motion.div>
                        </Card>

                        {/* Test History Section */}
                        <Card className="p-6">
                            <motion.div variants={ANIMATION_VARIANTS.slideRight}>
                                <h3 className="text-xl font-semibold text-purple-200 mb-6 flex items-center">
                                    <span className="mr-2">📊</span>
                                    Recent Test History
                                </h3>
                                
                                {loading ? (
                                    <div className="flex items-center justify-center py-8">
                                        <LoadingSpinner text="Loading test history..." />
                                    </div>
                                ) : error ? (
                                    <div className="text-center py-8">
                                        <p className="text-red-400 mb-4">{error}</p>
                                        <Button 
                                            onClick={fetchTestHistory}
                                            variant="outline"
                                        >
                                            Retry
                                        </Button>
                                    </div>
                                ) : testHistory.length === 0 ? (
                                    <div className="text-center py-8 text-purple-200">
                                        <svg className="w-16 h-16 mx-auto mb-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <p className="mb-4">No test attempts yet</p>
                                        <p className="text-purple-300 text-sm">Start your first assessment to see your progress here!</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3 max-h-96 overflow-y-auto">
                                        {testHistory.slice(0, 10).map((test, index) => (
                                            <Link
                                                key={test.id}
                                                to={`/test-result/${test.id}`}
                                                className="block"
                                            >
                                                <motion.div
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.05 }}
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
                                                            <p className="text-purple-400 text-xs mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                Click to view details →
                                                            </p>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        </Card>
                    </div>
                </motion.div>
            </div>
        </>
    );
};

export default UserProfile;
