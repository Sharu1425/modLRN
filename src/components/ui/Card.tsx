import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
}

const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  hover = true,
  gradient = true 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hover ? { y: -2, scale: 1.01 } : {}}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`
        backdrop-blur-xl border border-purple-500/30 rounded-2xl shadow-xl
        ${gradient ? 'bg-gradient-to-br from-purple-900/20 via-pink-900/10 to-blue-900/20' : 'bg-purple-900/20'}
        ${hover ? 'hover:shadow-2xl hover:border-purple-400/50' : ''}
        ${className}
      `}
    >
      {gradient && (
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-2xl" />
      )}
      <div className="relative">
        {children}
      </div>
    </motion.div>
  );
};

export default Card;
