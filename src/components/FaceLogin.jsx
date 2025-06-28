"use client";

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as faceapi from '@vladmandic/face-api';
import axios from 'axios';
import { motion } from 'framer-motion';

const MODEL_URL = 'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights';
const MODEL_LOAD_TIMEOUT = 30000;

const FaceLogin = ({ onLoginSuccess }) => {
  const videoRef = useRef();
  const canvasRef = useRef();
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('Loading face detection models...');
  const [error, setError] = useState(null);

  const loadModels = useCallback(async () => {
    try {
      setLoadingMessage('Loading face detection models...');
      
      const modelLoadPromise = Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
      ]);

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Model loading timed out')), MODEL_LOAD_TIMEOUT)
      );

      await Promise.race([modelLoadPromise, timeoutPromise]);

      setLoadingMessage('Starting video stream...');
      await startVideo();
      setIsLoading(false);
    } catch (err) {
      setError(err.message === 'Model loading timed out' 
        ? 'Face detection models took too long to load. Please check your internet connection and try again.'
        : 'Failed to load face detection models. Please try again later.');
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
      videoRef.current.srcObject = stream;
      
      return new Promise((resolve) => {
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          resolve();
        };
      });
    } catch (err) {
      setError('Unable to access camera. Please make sure you have granted camera permissions.');
      throw err;
    }
  }, []);

  const detectFace = useCallback(async () => {
    if (!videoRef.current || !videoRef.current.readyState === 4) {
      setError('Video stream is not ready. Please wait a moment and try again.');
      return;
    }

    try {
      setIsLoading(true);
      setLoadingMessage('Detecting face...');
      setError(null);

      const detections = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detections) {
        setError('No face detected. Please ensure your face is clearly visible.');
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.post('/api/auth/face', {
          faceDescriptor: Array.from(detections.descriptor)
        });

        if (response.data.success) {
          onLoginSuccess(response.data.user);
        }
      } catch (error) {
        setError('Face recognition failed. Please try again.');
        setIsLoading(false);
      }
    } catch (error) {
      setError('Error detecting face. Please try again.');
      setIsLoading(false);
    }
  }, [onLoginSuccess]);

  useEffect(() => {
    loadModels();

    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [loadModels]);

  const buttonClasses = useMemo(() => 
    `px-6 py-2 rounded-full text-white font-semibold ${
      isLoading
        ? 'bg-gray-500 cursor-not-allowed'
        : 'bg-blue-600 hover:bg-blue-700'
    }`,
    [isLoading]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center space-y-4 p-4"
    >
      <div className="relative w-[640px] h-[480px] bg-gray-900 rounded-lg overflow-hidden">
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
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white mb-2"></div>
              <p>{loadingMessage}</p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-red-500 text-center"
        >
          {error}
        </motion.div>
      )}

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={detectFace}
        disabled={isLoading}
        className={buttonClasses}
      >
        {isLoading ? 'Processing...' : 'Detect Face'}
      </motion.button>
    </motion.div>
  );
};

export default React.memo(FaceLogin);
