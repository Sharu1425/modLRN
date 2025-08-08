import React from "react";
import { motion } from "framer-motion";
import LoadingSpinner from "./ui/LoadingSpinner";
import Card from "./ui/Card";
import { useTheme } from "../contexts/ThemeContext";

interface LoadingStateProps {
    text?: string;
    size?: "sm" | "md" | "lg";
    showCard?: boolean;
    className?: string;
    fullScreen?: boolean;
}

const LoadingState: React.FC<LoadingStateProps> = ({ 
    text = "Loading...", 
    size = "md", 
    showCard = false,
    className = "",
    fullScreen = false
}) => {
    const content = (
        <div className={`flex flex-col items-center justify-center ${className}`}>
            <LoadingSpinner size={size} text={text} />
        </div>
    );

    if (fullScreen) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
                {content}
            </div>
        );
    }

    if (showCard) {
        return (
            <Card className="p-8 max-w-md mx-auto text-center">
                {content}
            </Card>
        );
    }

    return content;
};

export default LoadingState;
