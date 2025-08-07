import React from 'react';
import { motion } from 'framer-motion';
import { Question } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (answer: string) => void;
  timeRemaining?: number;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  questionNumber,
  totalQuestions,
  onAnswer,
  timeRemaining
}) => {
  const { mode, colorScheme } = useTheme();

  const cardVariants = {
    enter: { x: 300, opacity: 0, scale: 0.9 },
    center: { x: 0, opacity: 1, scale: 1 },
    exit: { x: -300, opacity: 0, scale: 0.9 }
  };

  const optionVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.9 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        delay: i * 0.1 + 0.3,
        type: "spring",
        stiffness: 100
      }
    }),
    hover: {
      scale: 1.02,
      y: -2,
      transition: { type: "spring", stiffness: 400 }
    },
    tap: { scale: 0.98 }
  };

  const getOptionColor = (index: number) => {
    const colors = [
      'from-blue-500 to-blue-600',
      'from-green-500 to-green-600',
      'from-orange-500 to-orange-600',
      'from-red-500 to-red-600'
    ];
    return colors[index % colors.length];
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className={`max-w-4xl mx-auto ${
        mode === 'professional' ? 'font-serif' : 'font-sans'
      }`}
    >
      <div className={`
        backdrop-blur-xl border rounded-2xl shadow-2xl overflow-hidden
        ${colorScheme === 'dark' 
          ? 'bg-gradient-to-br from-purple-900/20 via-pink-900/10 to-blue-900/20 border-purple-500/30' 
          : 'bg-gradient-to-br from-white/80 via-purple-50/50 to-pink-50/50 border-purple-200/50'
        }
      `}>
        {/* Header */}
        <div className={`
          p-6 border-b
          ${colorScheme === 'dark' ? 'border-purple-500/20' : 'border-purple-200/50'}
        `}>
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <motion.div
                className={`
                  w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg
                  ${colorScheme === 'dark' 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                    : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  }
                `}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                {questionNumber}
              </motion.div>
              <div>
                <h3 className={`
                  text-xl font-semibold
                  ${colorScheme === 'dark' ? 'text-purple-200' : 'text-purple-800'}
                `}>
                  Question {questionNumber} of {totalQuestions}
                </h3>
                {timeRemaining && (
                  <p className={`
                    text-sm
                    ${timeRemaining < 60 
                      ? 'text-red-400' 
                      : colorScheme === 'dark' ? 'text-purple-300' : 'text-purple-600'
                    }
                  `}>
                    Time remaining: {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
                  </p>
                )}
              </div>
            </div>
            
            {/* Progress Ring */}
            <motion.div
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 150 }}
            >
              <svg className="w-16 h-16 transform -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="transparent"
                  className={colorScheme === 'dark' ? 'text-purple-900/30' : 'text-purple-200/50'}
                />
                <motion.circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="url(#progressGradient)"
                  strokeWidth="4"
                  fill="transparent"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 28}`}
                  strokeDashoffset={`${2 * Math.PI * 28 * (1 - questionNumber / totalQuestions)}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 28 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 28 * (1 - questionNumber / totalQuestions) }}
                  transition={{ duration: 1, ease: "easeInOut" }}
                />
                <defs>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>
              </svg>
            </motion.div>
          </div>
        </div>

        {/* Question Content */}
        <div className="p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`
              p-6 rounded-xl mb-8 border
              ${colorScheme === 'dark' 
                ? 'bg-purple-900/20 border-purple-500/30' 
                : 'bg-white/60 border-purple-200/50'
              }
            `}
          >
            <p className={`
              text-xl leading-relaxed
              ${mode === 'professional' ? 'font-serif' : 'font-sans'}
              ${colorScheme === 'dark' ? 'text-purple-100' : 'text-purple-900'}
            `}>
              {question.question}
            </p>
          </motion.div>

          {/* Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {question.options?.map((option, index) => (
              <motion.button
                key={index}
                custom={index}
                variants={optionVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                whileTap="tap"
                onClick={() => onAnswer(option)}
                className={`
                  group relative p-6 rounded-xl text-left transition-all duration-300 overflow-hidden
                  ${colorScheme === 'dark' 
                    ? 'bg-purple-900/20 border border-purple-500/30 hover:bg-purple-900/40 hover:border-purple-400/50' 
                    : 'bg-white/60 border border-purple-200/50 hover:bg-white/80 hover:border-purple-300/70'
                  }
                `}
              >
                <div className="flex items-center space-x-4 relative z-10">
                  <motion.div
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center font-bold text-white
                      bg-gradient-to-r ${getOptionColor(index)}
                    `}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    {String.fromCharCode(65 + index)}
                  </motion.div>
                  <span className={`
                    flex-1 font-medium
                    ${mode === 'professional' ? 'font-serif' : 'font-sans'}
                    ${colorScheme === 'dark' ? 'text-purple-200 group-hover:text-white' : 'text-purple-800 group-hover:text-purple-900'}
                  `}>
                    {option}
                  </span>
                </div>
                
                {/* Hover effect overlay */}
                <motion.div
                  className={`
                    absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300
                    bg-gradient-to-r ${getOptionColor(index)} opacity-10
                  `}
                  initial={false}
                />
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default QuestionCard;
