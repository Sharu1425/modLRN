import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as faceapi from '@vladmandic/face-api';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { User } from '../types';
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('Loading face detection models...');
  const [error, setError] = useState<string | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);

  const loadModels = useCallback(async () => {
    try {
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

      setLoadingMessage('Starting video stream...');
      await startVideo();
      setIsLoading(false);
    } catch (err) {
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

  const detectFace = useCallback(async () => {
    if (!videoRef.current || videoRef.current.readyState !== 4) {
      setError('Video stream is not ready. Please wait a moment and try again.');
      return;
    }

    try {
      setIsDetecting(true);
      setError(null);

      console.log('🔍 Starting face detection for login...');
      const detections = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detections) {
        setError('No face detected. Please ensure your face is clearly visible in the camera.');
        return;
      }

      console.log('✅ Face detected, extracting descriptor...');
      const faceDescriptor = Array.from(detections.descriptor);
      console.log('🔍 Face descriptor length:', faceDescriptor.length);

      const response = await api.post('/auth/face', {
        face_descriptor: faceDescriptor
      });

      if (response.data.success) {
        console.log('✅ Face login successful');
        onSuccess(response.data.user);
      }
    } catch (error: any) {
      console.error('❌ Face recognition error:', error);
      
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
    } finally {
      setIsDetecting(false);
    }
  }, [onSuccess]);

  useEffect(() => {
    loadModels();

    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [loadModels]);

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
        
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="text-center text-white">
              <LoadingSpinner size="md" />
              <p className="mt-2 text-sm">{loadingMessage}</p>
            </div>
          </div>
        )}
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
        <p>Make sure you have registered your face in your profile settings first.</p>
        <p className="mt-1">
          <Link to="/profile" className="text-blue-400 hover:text-blue-300 underline">
            Go to Profile Settings
          </Link>
        </p>
      </div>
      
      <div className="flex space-x-3">
        <Button
          onClick={detectFace}
          disabled={isLoading || isDetecting}
          isLoading={isDetecting}
          variant="primary"
          size="md"
        >
          {isDetecting ? 'Detecting...' : 'Detect Face'}
        </Button>
        <Button
          onClick={onCancel}
          disabled={isLoading || isDetecting}
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
