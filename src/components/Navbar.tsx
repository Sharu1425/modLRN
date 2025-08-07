import React, { useState, useEffect, useCallback, memo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { User } from "../types";
import { useTheme } from "../contexts/ThemeContext";
import ThemeToggle from "./ui/ThemeToggle";
import UserProfileDropdown from "./ui/UserProfileDropdown";
import BackendStatusIndicator from "./BackendStatusIndicator";
import api from "../utils/api";
import { ANIMATION_VARIANTS, TRANSITION_DEFAULTS } from "../utils/constants";

interface NavbarProps {
    user: User | null;
    setUser: (user: User | null) => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, setUser }) => {
    const { mode, colorScheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleScroll = useCallback(() => {
        setScrolled(window.scrollY > 20);
    }, []);

    useEffect(() => {
        window.addEventListener("scroll", handleScroll);
        
        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, [handleScroll]);

    const handleLogout = useCallback(async () => {
        try {
            await api.post("/auth/logout");
            localStorage.removeItem('access_token');
            localStorage.removeItem('user');
            setUser(null);
            navigate("/login", { replace: true });
        } catch (error) {
            console.error("Logout failed:", error);
        }
    }, [setUser, navigate]);

    const isActive = useCallback((path: string) => location.pathname === path, [location.pathname]);

    const navItems = user ? [
        { path: "/dashboard", label: "Dashboard" },
    ] : [
        { path: "/login", label: "Login" }
    ];



    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={TRANSITION_DEFAULTS}
            className={`
                fixed top-0 left-0 right-0 z-50 transition-all duration-500
                ${scrolled 
                    ? colorScheme === 'dark'
                        ? mode === 'professional'
                            ? "bg-gray-900/95 backdrop-blur-xl border-b border-gray-700/50 shadow-2xl"
                            : "bg-gradient-to-r from-indigo-900/95 via-purple-900/95 to-pink-900/95 backdrop-blur-xl border-b border-white/10 shadow-2xl"
                        : mode === 'professional'
                            ? "bg-white/95 backdrop-blur-xl border-b border-gray-200/50 shadow-lg"
                            : "bg-gradient-to-r from-white/95 via-purple-50/95 to-pink-50/95 backdrop-blur-xl border-b border-purple-200/30 shadow-lg"
                    : colorScheme === 'dark'
                        ? mode === 'professional'
                            ? "bg-gray-900/60 backdrop-blur-md"
                            : "bg-gradient-to-r from-indigo-900/60 via-purple-900/60 to-pink-900/60 backdrop-blur-md"
                        : mode === 'professional'
                            ? "bg-white/60 backdrop-blur-md"
                            : "bg-gradient-to-r from-white/60 via-purple-50/60 to-pink-50/60 backdrop-blur-md"
                }
            `}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Left Side - Logo and Status */}
                    <div className="flex items-center space-x-4">
                        <Link to="/" className="flex items-center space-x-3">
                            <motion.div
                                className={`
                                    w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold
                                    ${mode === 'professional'
                                        ? colorScheme === 'dark'
                                            ? 'bg-gradient-to-br from-gray-700 to-gray-800 text-gray-200'
                                            : 'bg-gradient-to-br from-gray-800 to-gray-900 text-white'
                                        : 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
                                    }
                                `}
                                whileHover={{ scale: 1.05, rotate: 5 }}
                                whileTap={{ scale: 0.95 }}
                                transition={TRANSITION_DEFAULTS}
                            >
                                %L
                            </motion.div>
                            <motion.span 
                                className={`
                                    text-2xl font-bold transition-all duration-300
                                    ${mode === 'professional' 
                                        ? colorScheme === 'dark'
                                            ? 'font-serif text-gray-200'
                                            : 'font-serif text-gray-800'
                                        : colorScheme === 'dark'
                                            ? 'bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400'
                                            : 'bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600'
                                    }
                                `}
                                whileHover={{ scale: 1.02 }}
                                transition={TRANSITION_DEFAULTS}
                            >
                                {mode === 'professional' ? 'LearnAI Pro' : 'LearnAI'}
                            </motion.span>
                        </Link>
                        <BackendStatusIndicator />
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        {/* Navigation Links */}
                        <div className="flex items-center space-x-6">
                            {navItems.map((item) => (
                                <Link 
                                    key={item.path}
                                    to={item.path}
                                    className={`
                                        px-4 py-2 rounded-xl transition-all duration-300 font-medium
                                        ${mode === 'professional' ? 'font-serif' : 'font-sans'}
                                        ${isActive(item.path)
                                            ? colorScheme === 'dark'
                                                ? mode === 'professional'
                                                    ? "text-gray-200 bg-gray-800/50"
                                                    : "text-blue-400 bg-purple-900/30"
                                                : mode === 'professional'
                                                    ? "text-gray-800 bg-gray-100/50"
                                                    : "text-blue-600 bg-purple-100/50"
                                            : colorScheme === 'dark'
                                                ? mode === 'professional'
                                                    ? "text-gray-400 hover:text-gray-200 hover:bg-gray-800/30"
                                                    : "text-purple-200 hover:text-blue-400 hover:bg-purple-900/20"
                                                : mode === 'professional'
                                                    ? "text-gray-600 hover:text-gray-800 hover:bg-gray-100/30"
                                                    : "text-purple-700 hover:text-blue-600 hover:bg-purple-100/30"
                                        }
                                    `}
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                        
                        {/* Right Side Controls */}
                        <div className="flex items-center space-x-4">
                            <ThemeToggle />
                            
                            {user ? (
                                <UserProfileDropdown user={user} onLogout={handleLogout} />
                            ) : (
                                <Link 
                                    to="/signup"
                                    className={`
                                        px-6 py-2.5 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105
                                        ${mode === 'professional' 
                                            ? colorScheme === 'dark'
                                                ? 'bg-gradient-to-r from-gray-700 to-gray-800 text-white hover:from-gray-600 hover:to-gray-700' 
                                                : 'bg-gradient-to-r from-gray-800 to-gray-900 text-white hover:from-gray-700 hover:to-gray-800'
                                            : 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white hover:from-blue-600 hover:via-purple-600 hover:to-pink-600'
                                        }
                                    `}
                                >
                                    Sign Up
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center space-x-3">
                        <ThemeToggle />
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className={`
                                p-2 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2
                                ${colorScheme === 'dark' 
                                    ? 'text-purple-200 hover:text-blue-400 hover:bg-purple-900/20 focus:ring-purple-500' 
                                    : 'text-purple-700 hover:text-blue-600 hover:bg-purple-100/30 focus:ring-purple-400'
                                }
                            `}
                            aria-label="Toggle menu"
                        >
                            <svg className="w-6 h-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                                {isMenuOpen ? (
                                    <path d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </motion.button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`
                            md:hidden border-b backdrop-blur-xl
                            ${colorScheme === 'dark' 
                                ? mode === 'professional'
                                    ? 'bg-gray-900/95 border-gray-700/50'
                                    : 'bg-gradient-to-b from-indigo-900/95 via-purple-900/95 to-pink-900/95 border-white/10'
                                : mode === 'professional'
                                    ? 'bg-white/95 border-gray-200/50'
                                    : 'bg-gradient-to-b from-white/95 via-purple-50/95 to-pink-50/95 border-purple-200/30'
                            }
                        `}
                    >
                        <div className="px-4 pt-2 pb-4 space-y-2">
                            {navItems.map((item, index) => (
                                <motion.div
                                    key={item.path}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Link
                                        to={item.path}
                                        className={`
                                            block px-4 py-3 rounded-xl text-base font-medium transition-all duration-200
                                            ${mode === 'professional' ? 'font-serif' : 'font-sans'}
                                            ${isActive(item.path)
                                                ? colorScheme === 'dark' 
                                                    ? mode === 'professional'
                                                        ? "text-gray-200 bg-gray-800/50" 
                                                        : "text-blue-400 bg-purple-800/30"
                                                    : mode === 'professional'
                                                        ? "text-gray-800 bg-gray-100/50"
                                                        : "text-blue-600 bg-purple-100/50"
                                                : colorScheme === 'dark'
                                                    ? mode === 'professional'
                                                        ? "text-gray-400 hover:text-gray-200 hover:bg-gray-800/30"
                                                        : "text-purple-200 hover:text-blue-400 hover:bg-purple-800/20"
                                                    : mode === 'professional'
                                                        ? "text-gray-600 hover:text-gray-800 hover:bg-gray-100/30"
                                                        : "text-purple-700 hover:text-blue-600 hover:bg-purple-100/30"
                                            }
                                        `}
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        {item.label}
                                    </Link>
                                </motion.div>
                            ))}
                            
                            {user && (
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: navItems.length * 0.1 }}
                                    className="pt-2 border-t border-gray-700/30"
                                >
                                    <UserProfileDropdown user={user} onLogout={handleLogout} />
                                </motion.div>
                            )}
                            
                            {!user && (
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: navItems.length * 0.1 }}
                                    className="pt-2"
                                >
                                    <Link
                                        to="/signup"
                                        className={`
                                            block px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 text-center
                                            ${mode === 'professional' 
                                                ? colorScheme === 'dark'
                                                    ? 'bg-gradient-to-r from-gray-700 to-gray-800 text-white' 
                                                    : 'bg-gradient-to-r from-gray-800 to-gray-900 text-white'
                                                : 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white'
                                            }
                                        `}
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Sign Up
                                    </Link>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
};

export default memo(Navbar);
