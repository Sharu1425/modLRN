import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useTheme } from "../contexts/ThemeContext";
import { API_BASE_URL } from "../utils/constants";

interface BackendStatusIndicatorProps {
    className?: string;
}

const BackendStatusIndicator: React.FC<BackendStatusIndicatorProps> = ({ className = "" }) => {
    const { mode, colorScheme } = useTheme();
    const [backendStatus, setBackendStatus] = useState<'online' | 'offline' | 'checking'>('checking');

    const checkBackendStatus = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/health`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                signal: AbortSignal.timeout(3000)
            });
            
            setBackendStatus(response.ok ? 'online' : 'offline');
        } catch (error) {
            setBackendStatus('offline');
        }
    }, []);

    useEffect(() => {
        checkBackendStatus();
        const interval = setInterval(checkBackendStatus, 30000);
        
        return () => {
            clearInterval(interval);
        };
    }, [checkBackendStatus]);

    return (
        <motion.div 
            className={`
                group relative flex items-center transition-all duration-300 cursor-pointer
                ${colorScheme === 'dark' 
                    ? mode === 'professional'
                        ? 'bg-gray-800/30 hover:bg-gray-700/50'
                        : 'bg-purple-900/20 hover:bg-purple-800/30'
                    : mode === 'professional'
                        ? 'bg-gray-100/30 hover:bg-gray-200/50'
                        : 'bg-purple-100/20 hover:bg-purple-200/30'
                }
                rounded-xl px-3 py-2 border
                ${colorScheme === 'dark'
                    ? mode === 'professional' ? 'border-gray-600/30' : 'border-purple-500/20'
                    : mode === 'professional' ? 'border-gray-200/30' : 'border-purple-200/20'
                }
                ${className}
            `}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
            <motion.div 
                className={`
                    w-2.5 h-2.5 rounded-full transition-all duration-300
                    ${backendStatus === 'online' ? 'bg-green-400' :
                      backendStatus === 'offline' ? 'bg-red-400' : 'bg-yellow-400'}
                `}
                animate={backendStatus === 'online' ? { 
                    scale: [1, 1.2, 1],
                } : {}}
                transition={{ duration: 2, repeat: Infinity }}
            />
            
            <motion.span
                className={`
                    ml-2 text-sm font-medium transition-all duration-300 overflow-hidden
                    ${colorScheme === 'dark' 
                        ? mode === 'professional' ? 'text-gray-300' : 'text-purple-200'
                        : mode === 'professional' ? 'text-gray-600' : 'text-purple-700'
                    }
                `}
                initial={{ width: 0, opacity: 0 }}
                whileHover={{ width: 'auto', opacity: 1 }}
                transition={{ duration: 0.3 }}
            >
                {backendStatus === 'online' ? 'Online' : backendStatus === 'offline' ? 'Offline' : 'Checking'}
            </motion.span>
        </motion.div>
    );
};

export default BackendStatusIndicator;
