import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';

export interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ 
  id, 
  type, 
  title, 
  message, 
  duration = 4000, 
  onClose 
}) => {
  const { mode, colorScheme } = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const getToastStyles = () => {
    const baseStyles = `
      backdrop-blur-xl border shadow-2xl rounded-2xl overflow-hidden
      ${mode === 'professional' ? 'font-serif' : 'font-sans'}
    `;

    if (colorScheme === 'dark') {
      switch (type) {
        case 'success':
          return `${baseStyles} bg-green-900/90 border-green-500/50 text-green-100`;
        case 'error':
          return `${baseStyles} bg-red-900/90 border-red-500/50 text-red-100`;
        case 'warning':
          return `${baseStyles} bg-yellow-900/90 border-yellow-500/50 text-yellow-100`;
        case 'info':
        default:
          return mode === 'professional' 
            ? `${baseStyles} bg-gray-800/90 border-gray-600/50 text-gray-100`
            : `${baseStyles} bg-purple-900/90 border-purple-500/50 text-purple-100`;
      }
    } else {
      switch (type) {
        case 'success':
          return `${baseStyles} bg-green-50/95 border-green-200/70 text-green-800`;
        case 'error':
          return `${baseStyles} bg-red-50/95 border-red-200/70 text-red-800`;
        case 'warning':
          return `${baseStyles} bg-yellow-50/95 border-yellow-200/70 text-yellow-800`;
        case 'info':
        default:
          return mode === 'professional' 
            ? `${baseStyles} bg-gray-50/95 border-gray-200/70 text-gray-800`
            : `${baseStyles} bg-purple-50/95 border-purple-200/70 text-purple-800`;
      }
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'info':
      default:
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={getToastStyles()}
    >
      <div className="p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 mt-0.5">
            {getIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm">{title}</h4>
            {message && (
              <p className="mt-1 text-sm opacity-90">{message}</p>
            )}
          </div>
          <button
            onClick={() => onClose(id)}
            className="flex-shrink-0 ml-4 opacity-70 hover:opacity-100 transition-opacity"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Progress bar */}
      <motion.div
        className="h-1 bg-current opacity-30"
        initial={{ width: "100%" }}
        animate={{ width: "0%" }}
        transition={{ duration: duration / 1000, ease: "linear" }}
      />
    </motion.div>
  );
};

export default Toast;
