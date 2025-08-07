import React, { useState, useEffect, useRef, useCallback } from "react";
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
    
    const [testHistory, setTestHistory] = useState<TestResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isRegisteringFace, setIsRegisteringFace] = useState(false);
    const [faceRegistrationError, setFaceRegistrationError] = useState("");
    const [faceRegistrationSuccess, setFaceRegistrationSuccess] = useState(false);
    const [hasRegisteredFace, setHasRegisteredFace] = useState(false);
    const [checkingFaceStatus, setCheckingFaceStatus] = useState(false);
    const [startingCamera, setStartingCamera] = useState(false);
    const [faceDetected, setFaceDetected] = useState(false);

    const [stats, setStats] = useState({
        averageScore: 0,
        totalAttempts: 0,
        topicsStudied: 0,
        bestScore: 0
    });
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [cameraActive, setCameraActive] = useState(false);

    useEffect(() => {
        if (user?._id || user?.id) {
            fetchTestHistory();
            loadFaceModels();
            checkFaceStatus();
        }
    }, [user?._id, user?.id]);



    const fetchTestHistory = async () => {
        try {
            const userId = user._id || user.id;
            setLoading(true);
            setError("");
            
            const response = await api.get(`/api/results/user/${userId}`);
            
            if (!response.data.success) {
                throw new Error(response.data.error || 'Failed to fetch test history');
            }

            const results = response.data.results || [];
            setTestHistory(results);
            
            // Calculate stats
            if (results.length > 0) {
                const totalScore = results.reduce((sum: number, result: TestResult) => 
                    sum + (result.score / result.total_questions) * 100, 0);
                const averageScore = totalScore / results.length;
                const bestScore = Math.max(...results.map((result: TestResult) => 
                    (result.score / result.total_questions) * 100));
                const uniqueTopics = new Set(results.map((result: TestResult) => result.topic));
                
                setStats({
                    averageScore: Math.round(averageScore),
                    totalAttempts: results.length,
                    topicsStudied: uniqueTopics.size,
                    bestScore: Math.round(bestScore)
                });
            } else {
                setStats({
                    averageScore: 0,
                    totalAttempts: 0,
                    topicsStudied: 0,
                    bestScore: 0
                });
            }
        } catch (error: any) {
            console.error("Error fetching test history:", error);
            setError(error.response?.data?.detail || error.message || 'Failed to fetch test history');
        } finally {
            setLoading(false);
        }
    };

    const checkFaceStatus = async () => {
        try {
            setCheckingFaceStatus(true);
            const token = localStorage.getItem('access_token');
            
            if (!token) {
                setFaceRegistrationError("Please log in first to register your face.");
                return;
            }
            
            const response = await api.get("/auth/face-status");
            if (response.data.success) {
                setHasRegisteredFace(response.data.has_face);
            }
        } catch (error: any) {
            console.error("Error checking face status:", error);
            if (error.response?.status === 401) {
                setFaceRegistrationError("Please log in first to register your face.");
            }
        } finally {
            setCheckingFaceStatus(false);
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
            setFaceRegistrationError("Failed to load face detection models. Please check your internet connection and try again.");
        }
    };

    const startVideo = async () => {
        try {
            setStartingCamera(true);
            setFaceRegistrationError("");
            console.log("🔍 Starting camera...");
            
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: {
                    width: 640,
                    height: 480,
                    facingMode: 'user'
                } 
            });
            
            console.log("✅ Camera stream obtained:", stream);
            console.log("🔍 Stream tracks:", stream.getTracks());
            
            if (videoRef.current) {
                console.log("✅ Video element found, setting srcObject...");
                videoRef.current.srcObject = stream;
                
                // Ensure video starts playing
                videoRef.current.onloadedmetadata = () => {
                    console.log("✅ Video metadata loaded, starting playback...");
                    console.log("🔍 Video readyState:", videoRef.current?.readyState);
                    console.log("🔍 Video paused:", videoRef.current?.paused);
                    
                    videoRef.current?.play().then(() => {
                        console.log("✅ Video playback started successfully");
                        console.log("🔍 Video paused after play:", videoRef.current?.paused);
                    }).catch(err => {
                        console.error("❌ Error starting video playback:", err);
                    });
                };
                
                // Add event listeners for debugging
                videoRef.current.onplay = () => console.log("🎥 Video started playing");
                videoRef.current.onpause = () => console.log("⏸️ Video paused");
                videoRef.current.onerror = (e) => console.error("❌ Video error:", e);
                videoRef.current.oncanplay = () => console.log("✅ Video can play");
                videoRef.current.oncanplaythrough = () => console.log("✅ Video can play through");
                
                setCameraActive(true);
                console.log("✅ Camera started successfully");
                
                // Fallback: try to play video after a short delay
                setTimeout(() => {
                    if (videoRef.current && videoRef.current.paused) {
                        console.log("🔄 Attempting to start video playback (fallback)...");
                        videoRef.current.play().catch(err => {
                            console.error("❌ Fallback video playback failed:", err);
                        });
                    }
                }, 1000);
            } else {
                console.error("❌ Video element not found!");
            }
        } catch (err) {
            console.error("❌ Camera access error:", err);
            setFaceRegistrationError("Failed to access camera. Please check camera permissions.");
        } finally {
            setStartingCamera(false);
        }
    };

    const startContinuousFaceDetection = useCallback(async () => {
        if (!cameraActive || !modelsLoaded || !videoRef.current) {
            return;
        }
        
        try {
            const detections = await faceapi
                .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions({ 
                    inputSize: 224, 
                    scoreThreshold: 0.5 
                }))
                .withFaceLandmarks();
            
            if (detections && canvasRef.current && videoRef.current) {
                const canvas = canvasRef.current;
                const video = videoRef.current;
                const displaySize = { width: video.offsetWidth, height: video.offsetHeight };
                
                canvas.width = displaySize.width;
                canvas.height = displaySize.height;
                
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    
                    const resizedDetection = faceapi.resizeResults(detections, displaySize);
                    faceapi.draw.drawDetections(canvas, resizedDetection);
                    faceapi.draw.drawFaceLandmarks(canvas, resizedDetection);
                    
                    setFaceDetected(true);
                }
            } else {
                setFaceDetected(false);
                if (canvasRef.current) {
                    const ctx = canvasRef.current.getContext('2d');
                    if (ctx) {
                        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                    }
                }
            }
        } catch (error) {
            console.error("Face detection error:", error);
            setFaceDetected(false);
        }
        
        // Continue detection
        if (cameraActive) {
            setTimeout(startContinuousFaceDetection, 100);
        }
    }, [cameraActive, modelsLoaded]);

    // Start face detection when camera becomes active
    useEffect(() => {
        if (cameraActive && modelsLoaded) {
            console.log("🔍 Camera became active, starting face detection...");
            setTimeout(() => {
                startContinuousFaceDetection();
            }, 1000);
        }
    }, [cameraActive, modelsLoaded, startContinuousFaceDetection]);

    const stopVideo = () => {
        if (videoRef.current?.srcObject) {
            const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
            tracks.forEach(track => track.stop());
            videoRef.current.srcObject = null;
            setCameraActive(false);
        }
    };

    const registerFace = async () => {
        if (!modelsLoaded || isRegisteringFace || !videoRef.current) {
            return;
        }
        
        // Check authentication first
        const token = localStorage.getItem('access_token');
        if (!token) {
            setFaceRegistrationError("Please log in first to register your face.");
            return;
        }
        
        setIsRegisteringFace(true);
        setFaceRegistrationError("");
        setFaceRegistrationSuccess(false);

        try {
            // Wait for video to be ready
            if (videoRef.current?.readyState < 2) {
                await new Promise(resolve => {
                    videoRef.current!.onloadeddata = resolve;
                });
            }
            
            const detectionOptions = new faceapi.TinyFaceDetectorOptions({
                inputSize: 224,
                scoreThreshold: 0.5
            });
            
            const detections = await faceapi
                .detectSingleFace(videoRef.current, detectionOptions)
                .withFaceLandmarks()
                .withFaceDescriptor();

            if (!detections) {
                setFaceRegistrationError("No face detected. Please ensure your face is clearly visible and well-lit in the camera view.");
                return;
            }

            // Draw face detection results on canvas
            if (canvasRef.current && videoRef.current) {
                const canvas = canvasRef.current;
                const video = videoRef.current;
                const displaySize = { width: video.offsetWidth, height: video.offsetHeight };
                
                canvas.width = displaySize.width;
                canvas.height = displaySize.height;
                
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    
                    const resizedDetection = faceapi.resizeResults(detections, displaySize);
                    faceapi.draw.drawDetections(canvas, resizedDetection);
                    faceapi.draw.drawFaceLandmarks(canvas, resizedDetection);
                }
            }

            const faceDescriptor = Array.from(detections.descriptor);
            
            const response = await api.post("/auth/register-face", {
                face_descriptor: faceDescriptor
            });

            if (response.data.success) {
                setFaceRegistrationSuccess(true);
                setHasRegisteredFace(true);
                stopVideo();
            } else {
                setFaceRegistrationError(response.data.error || "Failed to register face");
            }
        } catch (error: any) {
            console.error("Face registration error:", error);
            let errorMessage = "An error occurred during face registration";
            
            if (error.response?.status === 401) {
                errorMessage = "Please log in first to register your face.";
            } else if (error.response?.data?.detail) {
                errorMessage = error.response.data.detail;
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            setFaceRegistrationError(errorMessage);
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
                                    {hasRegisteredFace && (
                                        <span className="ml-2 px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-full border border-green-500/30">
                                            Registered
                                        </span>
                                    )}
                                </h3>
                                
                                <div className="space-y-4">
                                    {/* Debug info */}
                                    <div className="text-xs text-purple-300 bg-purple-900/20 p-2 rounded">
                                        Debug: cameraActive={cameraActive.toString()}, modelsLoaded={modelsLoaded.toString()}, hasRegisteredFace={hasRegisteredFace.toString()}
                                    </div>
                                    
                                    {hasRegisteredFace && !cameraActive && (
                                        <div className="text-center p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                                            <p className="text-green-300 text-sm">
                                                ✅ Your face is already registered. You can use face login on the login page.
                                            </p>
                                        </div>
                                    )}
                                    

                                    
                                    {/* Camera section - always render video element */}
                                    <div className="text-center">
                                        <div className="relative inline-block">
                                            {/* Camera placeholder when not active */}
                                            {!cameraActive && (
                                                <div className="w-64 h-48 bg-gray-900 rounded-lg mx-auto mb-4 flex items-center justify-center border-2 border-purple-500/30">
                                                    <svg className="w-16 h-16 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                    </svg>
                                                </div>
                                            )}
                                            
                                            {/* Video element - always rendered but conditionally visible */}
                                            <video 
                                                ref={videoRef} 
                                                autoPlay 
                                                playsInline
                                                muted
                                                className={`rounded-lg w-64 h-48 object-cover border-2 border-purple-500/30 bg-gray-800 ${cameraActive ? 'block' : 'hidden'}`}
                                                style={{ backgroundColor: '#1f2937', opacity: cameraActive ? 1 : 0 }}
                                            />
                                            <canvas 
                                                ref={canvasRef} 
                                                className={`absolute top-0 left-0 w-full h-full rounded-lg pointer-events-none ${cameraActive ? 'block' : 'hidden'}`}
                                            />
                                            <div className="absolute inset-0 border-2 border-purple-500/50 rounded-lg pointer-events-none"></div>
                                            {cameraActive && (
                                                <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                                                    Live
                                                </div>
                                            )}
                                            {faceDetected && (
                                                <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                                                    Face Detected
                                                </div>
                                            )}
                                            {cameraActive && !videoRef.current?.srcObject && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 rounded-lg">
                                                    <div className="text-center text-white">
                                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto mb-2"></div>
                                                        <p className="text-sm">Starting camera...</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        
                                        {/* Camera controls */}
                                        <div className="mt-4 space-y-2">
                                            {!cameraActive ? (
                                                <Button
                                                    onClick={startVideo}
                                                    disabled={!modelsLoaded || startingCamera}
                                                    isLoading={startingCamera}
                                                    variant="outline"
                                                >
                                                    {startingCamera ? 'Starting Camera...' : (modelsLoaded ? 'Start Camera' : 'Loading Models...')}
                                                </Button>
                                            ) : (
                                                <div className="space-x-2">
                                                    <Button
                                                        onClick={registerFace}
                                                        disabled={isRegisteringFace || !modelsLoaded || !faceDetected}
                                                        isLoading={isRegisteringFace}
                                                        variant="primary"
                                                    >
                                                        {isRegisteringFace ? 'Registering...' : (faceDetected ? 'Register Face' : 'No Face Detected')}
                                                    </Button>
                                                    <Button
                                                        onClick={stopVideo}
                                                        variant="outline"
                                                    >
                                                        Stop Camera
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                        
                                        {/* Debug info when camera is active */}
                                        {cameraActive && (
                                            <div className="mt-2 space-y-2">
                                                <div className="text-xs text-purple-300">
                                                    Video State: {videoRef.current?.readyState || 'unknown'} | 
                                                    Paused: {videoRef.current?.paused ? 'Yes' : 'No'} | 
                                                    Has Stream: {videoRef.current?.srcObject ? 'Yes' : 'No'}
                                                </div>
                                                {videoRef.current?.paused && (
                                                    <Button
                                                        onClick={() => {
                                                            console.log("🔍 Manual play attempt...");
                                                            videoRef.current?.play().then(() => {
                                                                console.log("✅ Manual play successful");
                                                            }).catch(err => {
                                                                console.error("❌ Manual play failed:", err);
                                                            });
                                                        }}
                                                        variant="outline"
                                                        size="sm"
                                                    >
                                                        Start Video
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                        
                                        {!modelsLoaded && (
                                            <p className="text-xs text-purple-300 mt-2">
                                                Loading face detection models...
                                            </p>
                                        )}
                                    </div>
                                    
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
