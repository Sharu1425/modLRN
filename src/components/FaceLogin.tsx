import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as faceapi from '@vladmandic/face-api';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { User } from '../types';
import { useToast } from '../hooks/useToast';
import api from '../utils/api';
import Button from './ui/Button';
import LoadingSpinner from './ui/LoadingSpinner';

const MODEL_URL = 'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights';
const MODEL_LOAD_TIMEOUT = 30000;

interface FaceLoginProps {
  onSuccess: (user: User) => void;
  onCancel: () => void;
}

const FaceLogin: React.FC<FaceLoginProps> = ({ onSuccess, onCancel }) => {
  const { success, error: showError } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('Loading face detection models...');
  const [error, setError] = useState<string | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [cameraStopped, setCameraStopped] = useState(false);

  const loadModels = useCallback(async () => {
    try {
      console.log('🔍 [FACE_LOGIN] Starting model loading...');
      setLoadingMessage('Loading face detection models...');
      
      const modelLoadPromise = Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
      ]);

      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Model loading timed out')), MODEL_LOAD_TIMEOUT)
      );

      await Promise.race([modelLoadPromise, timeoutPromise]);
      console.log('✅ [FACE_LOGIN] Models loaded successfully');

      console.log('🔍 [FACE_LOGIN] Starting video stream...');
      setLoadingMessage('Starting video stream...');
      await startVideo();
      console.log('✅ [FACE_LOGIN] Video started successfully');
      
      setIsLoading(false);
      console.log('🔍 [FACE_LOGIN] Starting face detection immediately...');
      
      // Start detection immediately after video is ready
      startFaceDetection();
    } catch (err) {
      console.error('❌ [FACE_LOGIN] Model loading error:', err);
      const errorMessage = err instanceof Error && err.message === 'Model loading timed out' 
        ? 'Face detection models took too long to load. Please check your internet connection and try again.'
        : 'Failed to load face detection models. Please try again later.';
      setError(errorMessage);
      setIsLoading(false);
    }
  }, []);

  const startVideo = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: 640,
          height: 480,
          facingMode: 'user'
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        return new Promise<void>((resolve) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = () => {
              videoRef.current?.play();
              resolve();
            };
          }
        });
      }
    } catch (err) {
      setError('Unable to access camera. Please make sure you have granted camera permissions.');
      throw err;
    }
  }, []);

  // Simple face detection function
  const startFaceDetection = useCallback(() => {
    if (!videoRef.current) {
      console.log('❌ [FACE_LOGIN] No video ref');
      return;
    }

    console.log('🔍 [FACE_LOGIN] Starting face detection...');
    
    const detectLoop = async () => {
      if (!videoRef.current || !videoRef.current.srcObject || showSuccessAnimation || cameraStopped) {
        console.log('🔍 [FACE_LOGIN] Detection stopped - camera inactive, success animation showing, or camera stopped');
        return;
      }

      try {
        const detections = await faceapi
          .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
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
            console.log('✅ [FACE_LOGIN] Face detected, attempting login...');
            
            // Attempt login when face is detected
            if (!isDetecting) {
              attemptLogin();
            }
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
        console.error("❌ [FACE_LOGIN] Face detection error:", error);
        setFaceDetected(false);
      }

      // Continue detection if camera is still active, no success animation, and camera not stopped
      if (videoRef.current && videoRef.current.srcObject && !showSuccessAnimation && !cameraStopped) {
        setTimeout(detectLoop, 100);
      }
    };

    detectLoop();
  }, [showSuccessAnimation, cameraStopped]);

  // Function to stop camera
  const stopCamera = useCallback(() => {
    console.log('🔍 [FACE_LOGIN] Stopping camera...');
    setCameraStopped(true); // Immediately stop detection loop
    
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      console.log('🔍 [FACE_LOGIN] Found tracks:', tracks.length);
      tracks.forEach(track => {
        console.log('🔍 [FACE_LOGIN] Stopping track:', track.kind, 'enabled:', track.enabled);
        track.stop();
      });
      videoRef.current.srcObject = null;
      console.log('✅ [FACE_LOGIN] Camera stopped successfully');
    } else {
      console.log('❌ [FACE_LOGIN] No video srcObject to stop');
    }
  }, []);

  // Function to attempt login
  const attemptLogin = useCallback(async () => {
    if (!videoRef.current || videoRef.current.readyState !== 4) {
      console.log('❌ [FACE_LOGIN] Video not ready for login');
      return;
    }

    try {
      console.log('🔍 [FACE_LOGIN] Starting face recognition...');
      setIsDetecting(true);
      setError(null);

      const detections = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detections) {
        console.log('❌ [FACE_LOGIN] No face detected for login');
        setIsDetecting(false);
        return;
      }

      const faceDescriptor = Array.from(detections.descriptor);
      console.log('🔍 [FACE_LOGIN] Face descriptor length:', faceDescriptor.length);

      console.log('🌐 [FACE_LOGIN] Making API request to /auth/face');
      const response = await api.post('/auth/face', {
        face_descriptor: faceDescriptor
      });

      console.log('✅ [FACE_LOGIN] API response:', response.data);

      if (response.data.success) {
        console.log('✅ [FACE_LOGIN] Face login successful!');
        
        // Stop detection and show success animation
        setShowSuccessAnimation(true);
        
        // Store auth data
        localStorage.setItem('access_token', response.data.access_token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Wait for animation then navigate
        setTimeout(() => {
          console.log('✅ [FACE_LOGIN] Animation complete, stopping camera and navigating...');
          stopCamera();
          success('Face Login Successful!', `Welcome back, ${response.data.user.name || response.data.user.username}!`);
          onSuccess(response.data.user);
        }, 2500); // 2.5 seconds for animation
      }
    } catch (error: any) {
      console.error('❌ [FACE_LOGIN] Face recognition error:', error);
      
      let errorMessage = 'Face recognition failed. Please try again.';
      
      if (error.response?.data?.detail) {
        if (error.response.data.detail.includes('No registered faces found')) {
          errorMessage = 'No registered faces found. Please register your face first in your profile settings.';
        } else if (error.response.data.detail.includes('Face recognition failed')) {
          errorMessage = 'Face not recognized. Please ensure you are using the same face that was registered.';
        } else {
          errorMessage = error.response.data.detail;
        }
      }
      
      setError(errorMessage);
      showError('Face Login Failed', errorMessage);
    } finally {
      setIsDetecting(false);
    }
  }, [stopCamera, onSuccess]);

  useEffect(() => {
    console.log('🔍 [FACE_LOGIN] Component mounted, starting models...');
    setCameraStopped(false); // Reset camera stopped flag
    loadModels();

    return () => {
      console.log('🔍 [FACE_LOGIN] Component unmounting, cleaning up...');
      stopCamera();
    };
  }, [loadModels, stopCamera]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center space-y-4 p-4"
    >
             <div className="relative w-[320px] h-[240px] bg-gray-900 rounded-lg overflow-hidden border-2 border-purple-500/30">
         <video
           ref={videoRef}
           className="w-full h-full object-cover"
           playsInline
           muted
         />
         <canvas ref={canvasRef} className="absolute top-0 left-0" />
         
         {faceDetected && !showSuccessAnimation && (
           <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
             Face Detected
           </div>
         )}
         
         {isDetecting && !showSuccessAnimation && (
           <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
             Logging In...
           </div>
         )}
         
         {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="text-center text-white">
              <LoadingSpinner size="md" />
              <p className="mt-2 text-sm">{loadingMessage}</p>
            </div>
          </div>
        )}

        {/* Success Animation */}
        <AnimatePresence>
          {showSuccessAnimation && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute inset-0 flex items-center justify-center bg-green-500 bg-opacity-90"
            >
              <div className="text-center text-white">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <motion.svg
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="w-8 h-8 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20,6 9,17 4,12" />
                  </motion.svg>
                </motion.div>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="text-lg font-semibold"
                >
                  Login Successful!
                </motion.p>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.0 }}
                  className="text-sm opacity-90"
                >
                  Redirecting to dashboard...
                </motion.p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
       </div>

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-red-400 text-center text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3 max-w-sm"
        >
          {error}
          {error.includes('No registered faces found') && (
            <div className="mt-3">
              <Link
                to="/profile"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                Go to Profile Settings
              </Link>
            </div>
          )}
        </motion.div>
      )}

             <div className="text-center text-sm text-gray-400 mb-4">
         <p>Position your face in the camera view to log in automatically.</p>
         <p className="mt-1">
           <Link to="/profile" className="text-blue-400 hover:text-blue-300 underline">
             Register Face in Profile Settings
           </Link>
         </p>
       </div>
       
                               <div className="flex space-x-3">
           <Button
             onClick={() => {
               console.log('🔍 [FACE_LOGIN] Cancel clicked, stopping camera...');
               stopCamera();
               onCancel();
             }}
             disabled={isLoading || isDetecting || showSuccessAnimation}
             variant="outline"
             size="md"
           >
             Cancel
           </Button>
         </div>
    </motion.div>
  );
};

export default React.memo(FaceLogin);
