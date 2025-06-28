"use client"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect, useCallback, memo } from "react"
import axios from "axios"

const Navbar = ({ user, setUser }) => {
    const navigate = useNavigate()
    const location = useLocation()
    const [scrolled, setScrolled] = useState(false)
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    const handleScroll = useCallback(() => {
        setScrolled(window.scrollY > 20)
    }, [])

    useEffect(() => {
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [handleScroll])

    const handleLogout = useCallback(async () => {
        try {
            await axios.post("http://localhost:5001/auth/logout", {}, { withCredentials: true });
            setUser(null);
            navigate("/login", { replace: true });
        } catch (error) {
            console.error("Logout failed:", error);
        }
    }, [setUser, navigate]);

    const isActive = useCallback((path) => location.pathname === path, [location.pathname]);

    const toggleMenu = useCallback(() => {
        setIsMenuOpen(prev => !prev);
    }, []);

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                scrolled 
                    ? "bg-gradient-to-r from-indigo-900/90 via-purple-900/90 to-pink-900/90 backdrop-blur-xl border-b border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]" 
                    : "bg-gradient-to-r from-indigo-900/40 via-purple-900/40 to-pink-900/40 backdrop-blur-md"
            }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <Link to="/" className="flex items-center space-x-2">
                        <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                            %LearnAI
                        </span>
                    </Link>

                    <div className="hidden md:flex items-center space-x-8">
                        {user ? (
                            <>
                                <Link 
                                    to="/dashboard"
                                    className={`text-lg transition duration-300 ${
                                        isActive("/dashboard")
                                            ? "text-blue-400"
                                            : "text-purple-200 hover:text-blue-400"
                                    }`}
                                >
                                    Dashboard
                                </Link>
                                <Link 
                                    to="/assessconfig"
                                    className={`text-lg transition duration-300 ${
                                        isActive("/assessconfig")
                                            ? "text-blue-400"
                                            : "text-purple-200 hover:text-blue-400"
                                    }`}
                                >
                                    Assessment
                                </Link>
                                <Link 
                                    to="/profile"
                                    className={`text-lg transition duration-300 ${
                                        isActive("/profile")
                                            ? "text-blue-400"
                                            : "text-purple-200 hover:text-blue-400"
                                    }`}
                                >
                                    Profile
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="text-lg text-purple-200 hover:text-blue-400 transition duration-300"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link 
                                    to="/login"
                                    className="text-lg text-purple-200 hover:text-blue-400 transition duration-300"
                                >
                                    Login
                                </Link>
                                <Link 
                                    to="/signup"
                                    className="px-6 py-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 transition duration-300 shadow-lg hover:shadow-xl"
                                >
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>

                    <div className="md:hidden">
                        <button
                            onClick={toggleMenu}
                            className="text-purple-200 hover:text-blue-400 transition duration-300"
                            aria-label="Toggle menu"
                        >
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                {isMenuOpen ? (
                                    <path d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-gradient-to-b from-indigo-900/95 via-purple-900/95 to-pink-900/95 backdrop-blur-xl border-b border-white/10"
                    >
                        <div className="px-2 pt-2 pb-3 space-y-1">
                            {user ? (
                                <>
                                    <Link
                                        to="/dashboard"
                                        className={`block px-3 py-2 rounded-md text-base font-medium ${
                                            isActive("/dashboard")
                                                ? "text-blue-400"
                                                : "text-purple-200 hover:text-blue-400"
                                        }`}
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Dashboard
                                    </Link>
                                    <Link
                                        to="/assessconfig"
                                        className={`block px-3 py-2 rounded-md text-base font-medium ${
                                            isActive("/assessconfig")
                                                ? "text-blue-400"
                                                : "text-purple-200 hover:text-blue-400"
                                        }`}
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Assessment
                                    </Link>
                                    <Link
                                        to="/profile"
                                        className={`block px-3 py-2 rounded-md text-base font-medium ${
                                            isActive("/profile")
                                                ? "text-blue-400"
                                                : "text-purple-200 hover:text-blue-400"
                                        }`}
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Profile
                                    </Link>
                                    <button
                                        onClick={() => {
                                            handleLogout();
                                            setIsMenuOpen(false);
                                        }}
                                        className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-purple-200 hover:text-blue-400"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        to="/login"
                                        className="block px-3 py-2 rounded-md text-base font-medium text-purple-200 hover:text-blue-400"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        to="/signup"
                                        className="block px-3 py-2 rounded-md text-base font-medium text-purple-200 hover:text-blue-400"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Sign Up
                                    </Link>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
};

export default memo(Navbar);

