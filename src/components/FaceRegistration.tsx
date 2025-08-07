import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import * as faceapi from "@vladmandic/face-api";
import Card from "./ui/Card";
import Button from "./ui/Button";
import LoadingSpinner from "./ui/LoadingSpinner";
import api from "../utils/api";

interface FaceRegistrationProps {
    onSuccess?: () => void;
    onCancel?: () => void;
}

const FaceRegistration: React.FC<FaceRegistrationProps> = ({ onSuccess, onCancel }) => {
    const [isRegisteringFace, setIsRegisteringFace] = useState(false);
    const [faceRegistrationError, setFaceRegistrationError] = useState("");
    const [faceRegistrationSuccess, setFaceRegistrationSuccess] = useState(false);
    const [hasRegisteredFace, setHasRegisteredFace] = useState(false);
    const [checkingFaceStatus, setCheckingFaceStatus] = useState(false);
    const [startingCamera, setStartingCamera] = useState(false);
    const [faceDetected, setFaceDetected] = useState(false);
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [cameraActive, setCameraActive] = useState(false);

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        loadFaceModels();
        checkFaceStatus();
    }, []);

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
            
            if (videoRef.current) {
                console.log("✅ Video element found, setting srcObject...");
                videoRef.current.srcObject = stream;
                
                // Ensure video starts playing
                videoRef.current.onloadedmetadata = () => {
                    console.log("✅ Video metadata loaded, starting playback...");
                    videoRef.current?.play().then(() => {
                        console.log("✅ Video playback started successfully");
                    }).catch(err => {
                        console.error("❌ Error starting video playback:", err);
                    });
                };
                
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
                onSuccess?.();
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

    return (
        <Card className="p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
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
                    {hasRegisteredFace && !cameraActive && (
                        <div className="text-center p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                            <p className="text-green-300 text-sm">
                                ✅ Your face is already registered. You can use face login on the login page.
                            </p>
                        </div>
                    )}
                    
                    {/* Camera section */}
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
                            
                            {/* Video element */}
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
    );
};

export default FaceRegistration;
