import React from "react";
import { motion } from "framer-motion";
import Card from "./ui/Card";
import Button from "./ui/Button";
import { useTheme } from "../contexts/ThemeContext";

interface ErrorStateProps {
    title?: string;
    message: string;
    onRetry?: () => void;
    onBack?: () => void;
    backText?: string;
    retryText?: string;
    showCard?: boolean;
    className?: string;
}

const ErrorState: React.FC<ErrorStateProps> = ({ 
    title = "Error",
    message,
    onRetry,
    onBack,
    backText = "Go Back",
    retryText = "Retry",
    showCard = true,
    className = ""
}) => {
    const { mode, colorScheme } = useTheme();

    const errorIcon = (
        <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    );

    const content = (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className={`text-center ${className}`}
        >
            <div className="text-red-400 mb-4">
                {errorIcon}
            </div>
            <h3 className={`text-xl font-bold mb-4 ${
                mode === 'professional'
                    ? colorScheme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                    : 'text-purple-200'
            }`}>
                {title}
            </h3>
            <p className={`mb-6 ${
                mode === 'professional'
                    ? colorScheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    : 'text-purple-300'
            }`}>
                {message}
            </p>
            <div className="space-x-4">
                {onRetry && (
                    <Button 
                        onClick={onRetry}
                        variant="primary"
                    >
                        {retryText}
                    </Button>
                )}
                {onBack && (
                    <Button 
                        onClick={onBack}
                        variant="outline"
                    >
                        {backText}
                    </Button>
                )}
            </div>
        </motion.div>
    );

    if (showCard) {
        return (
            <Card className="p-8 max-w-md mx-auto text-center">
                {content}
            </Card>
        );
    }

    return content;
};

export default ErrorState;
