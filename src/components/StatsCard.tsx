import React from "react";
import { motion } from "framer-motion";
import Card from "./ui/Card";
import LoadingSpinner from "./ui/LoadingSpinner";

interface StatsCardProps {
    title: string;
    value: number | string;
    icon: React.ReactNode;
    color: string;
    loading?: boolean;
    className?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ 
    title, 
    value, 
    icon, 
    color, 
    loading = false,
    className = ""
}) => {
    return (
        <Card className={`p-6 text-center ${className}`} hover={true}>
            <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${color} flex items-center justify-center mx-auto mb-4 text-white`}>
                {icon}
            </div>
            <h3 className="text-2xl font-bold text-purple-200 mb-2">
                {loading ? <LoadingSpinner size="sm" /> : value}
            </h3>
            <p className="text-purple-300 text-sm">{title}</p>
        </Card>
    );
};

export default StatsCard;
