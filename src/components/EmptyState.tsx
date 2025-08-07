import React from "react";
import { motion } from "framer-motion";
import Card from "./ui/Card";
import Button from "./ui/Button";
import { useTheme } from "../contexts/ThemeContext";

interface EmptyStateProps {
    title: string;
    message: string;
    icon?: React.ReactNode;
    actionText?: string;
    onAction?: () => void;
    showCard?: boolean;
    className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
    title,
    message,
    icon,
    actionText,
    onAction,
    showCard = true,
    className = ""
}) => {
    const { mode, colorScheme } = useTheme();

    const defaultIcon = (
        <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
    );

    const content = (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className={`text-center ${className}`}
        >
            <div className={`mb-4 ${
                mode === 'professional'
                    ? colorScheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    : 'text-purple-400'
            }`}>
                {icon || defaultIcon}
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
            {actionText && onAction && (
                <Button 
                    onClick={onAction}
                    variant="primary"
                >
                    {actionText}
                </Button>
            )}
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

export default EmptyState;
