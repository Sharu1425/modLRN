import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';

interface UserProfileDropdownProps {
  user: User;
  onLogout: () => void;
}

const UserProfileDropdown: React.FC<UserProfileDropdownProps> = ({ user, onLogout }) => {
  const { mode, colorScheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menuItems = [
    {
      label: 'Profile',
      path: '/profile',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      label: 'Settings',
      path: '/settings',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center space-x-3 px-4 py-2 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2
          ${mode === 'professional'
            ? colorScheme === 'dark'
              ? 'bg-gray-800/50 hover:bg-gray-700/50 text-gray-200 focus:ring-gray-500'
              : 'bg-gray-100/50 hover:bg-gray-200/50 text-gray-800 focus:ring-gray-400'
            : colorScheme === 'dark'
              ? 'bg-purple-900/30 hover:bg-purple-800/40 text-purple-200 focus:ring-purple-500'
              : 'bg-purple-100/50 hover:bg-purple-200/50 text-purple-800 focus:ring-purple-400'
          }
        `}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className={`
          w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
          ${mode === 'professional'
            ? colorScheme === 'dark'
              ? 'bg-gray-600 text-gray-200'
              : 'bg-gray-700 text-white'
            : 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
          }
        `}>
          {getInitials(user.name || user.username || 'User')}
        </div>
        <span className={`font-medium ${mode === 'professional' ? 'font-serif' : 'font-sans'}`}>
          {user.name || user.username}
        </span>
        <motion.svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </motion.svg>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`
              absolute right-0 mt-2 w-48 rounded-xl shadow-2xl border backdrop-blur-xl z-50
              ${colorScheme === 'dark'
                ? mode === 'professional'
                  ? 'bg-gray-800/95 border-gray-600/50'
                  : 'bg-purple-900/95 border-purple-500/30'
                : mode === 'professional'
                  ? 'bg-white/95 border-gray-200/50'
                  : 'bg-white/95 border-purple-200/30'
              }
            `}
          >
            <div className="py-2">
              {menuItems.map((item, index) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`
                    flex items-center space-x-3 px-4 py-3 text-sm transition-all duration-200
                    ${mode === 'professional' ? 'font-serif' : 'font-sans'}
                    ${colorScheme === 'dark'
                      ? mode === 'professional'
                        ? 'text-gray-200 hover:bg-gray-700/50'
                        : 'text-purple-200 hover:bg-purple-800/30'
                      : mode === 'professional'
                        ? 'text-gray-700 hover:bg-gray-100/50'
                        : 'text-purple-700 hover:bg-purple-100/50'
                    }
                  `}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
              
              <div className={`
                my-1 border-t
                ${colorScheme === 'dark'
                  ? mode === 'professional' ? 'border-gray-600/50' : 'border-purple-500/30'
                  : mode === 'professional' ? 'border-gray-200/50' : 'border-purple-200/30'
                }
              `} />
              
              <button
                onClick={() => {
                  onLogout();
                  setIsOpen(false);
                }}
                className={`
                  flex items-center space-x-3 px-4 py-3 text-sm w-full text-left transition-all duration-200
                  ${mode === 'professional' ? 'font-serif' : 'font-sans'}
                  ${colorScheme === 'dark'
                    ? 'text-red-400 hover:bg-red-900/20'
                    : 'text-red-600 hover:bg-red-100/50'
                  }
                `}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Logout</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserProfileDropdown;
