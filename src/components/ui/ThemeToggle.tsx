import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { colorScheme, toggleColorScheme, mode } = useTheme();

  return (
    <motion.button
      onClick={toggleColorScheme}
      className={`
        relative w-14 h-7 rounded-full p-1 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2
        ${mode === 'professional'
          ? colorScheme === 'dark'
            ? 'bg-gray-700 focus:ring-gray-500'
            : 'bg-gray-300 focus:ring-gray-400'
          : colorScheme === 'dark'
            ? 'bg-purple-600 focus:ring-purple-500'
            : 'bg-purple-200 focus:ring-purple-400'
        }
      `}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        className={`
          w-5 h-5 rounded-full flex items-center justify-center text-xs transition-all duration-300
          ${colorScheme === 'dark' ? 'bg-gray-900 text-yellow-400' : 'bg-white text-gray-600'}
        `}
        animate={{
          x: colorScheme === 'dark' ? 0 : 28,
        }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      >
        {colorScheme === 'dark' ? (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        ) : (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
          </svg>
        )}
      </motion.div>
    </motion.button>
  );
};

export default ThemeToggle;
