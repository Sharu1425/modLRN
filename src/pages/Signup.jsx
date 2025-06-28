"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import AnimatedBackground from "../components/AnimatedBackground"
import axios from "axios"

function Signup({ setUser }) {
    console.log("Signup Function Called");
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [error, setError] = useState("")
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (password !== confirmPassword) {
            setError("Passwords don't match")
            return
        }
        await axios.post("/db/users/register", { username, email, password })
            .then((res) => {
                console.log(res)
                setUser({ username })
                navigate("/dashboard")
            })
            .catch((err) => {
                const errorMessage = err.response?.data?.error || "An error occurred";
                setError(errorMessage);
                console.error(errorMessage)
            })
    }

    const handleGoogleLogin = () => {
        window.location.href = "http://localhost:5001/auth/google";
    };

    return (
        <>
            <AnimatedBackground />
            <div className="min-h-screen flex items-center justify-center px-4 py-16 border border-gray-700 relative z-10">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="w-full max-w-md"
                >
                    <div className="glass-card p-8 rounded-2xl neon-border shadow-xl backdrop-blur-xl border-1 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10"></div>
                        <motion.div
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="text-center mb-8 relative"
                        >
                            <h2 className="text-4xl font-bold gradient-text mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">Create Account</h2>
                            <p className="text-purple-200 text-lg">Start your learning journey</p>
                        </motion.div>

                        <form onSubmit={handleSubmit} className="space-y-6 relative">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
                                    <label htmlFor="username" className="block text-sm font-medium text-purple-200 mb-2">
                                        Username
                                    </label>
                                    <input
                                        type="text"
                                        id="username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                        className="w-full px-4 py-3 rounded-lg bg-purple-900/20 border border-purple-500/30 text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 hover:border-purple-400"
                                        placeholder="Choose a username"
                                    />
                                </motion.div>

                                <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
                                    <label htmlFor="email" className="block text-sm font-medium text-purple-200 mb-2">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="w-full px-4 py-3 rounded-lg bg-purple-900/20 border border-purple-500/30 text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 hover:border-purple-400"
                                        placeholder="Enter your email"
                                    />
                                </motion.div>

                                <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
                                    <label htmlFor="password" className="block text-sm font-medium text-purple-200 mb-2">
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        id="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="w-full px-4 py-3 rounded-lg bg-purple-900/20 border border-purple-500/30 text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 hover:border-purple-400"
                                        placeholder="Create a password"
                                    />
                                </motion.div>

                                <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.6 }}>
                                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-purple-200 mb-2">
                                        Confirm Password
                                    </label>
                                    <input
                                        type="password"
                                        id="confirmPassword"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        className="w-full px-4 py-3 rounded-lg bg-purple-900/20 border border-purple-500/30 text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 hover:border-purple-400"
                                        placeholder="Confirm your password"
                                    />
                                </motion.div>
                            </motion.div>

                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.7 }}
                                className="space-y-4"
                            >
                                <button 
                                    type="submit" 
                                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 text-lg font-medium rounded-lg hover:from-purple-600 hover:to-pink-600 transition duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                >
                                    Sign Up
                                </button>
                                {error && (
                                    <motion.p 
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-center text-red-400 bg-red-500/10 py-2 rounded-lg"
                                    >
                                        Error: {error}
                                    </motion.p>
                                )}
                                <div className="relative my-6">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-purple-500/30"></div>
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-2 bg-purple-900/50 text-purple-300">Or continue with</span>
                                    </div>
                                </div>
                                <div className="flex flex-col space-y-3">
                                    <button
                                        type="button"
                                        onClick={handleGoogleLogin}
                                        className="w-full bg-white text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition duration-300 shadow-md hover:shadow-lg flex items-center justify-center space-x-3 border border-gray-200"
                                    >
                                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                                            <path
                                                fill="#4285F4"
                                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                            />
                                            <path
                                                fill="#34A853"
                                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                            />
                                            <path
                                                fill="#FBBC05"
                                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                            />
                                            <path
                                                fill="#EA4335"
                                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                            />
                                        </svg>
                                        <span className="font-medium">Google</span>
                                    </button>
                                    <button
                                        type="button"
                                        className="w-full bg-[#24292F] text-white py-3 px-4 rounded-lg hover:bg-[#24292F]/90 transition duration-300 shadow-md hover:shadow-lg flex items-center justify-center space-x-3"
                                    >
                                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                                        </svg>
                                        <span className="font-medium">GitHub</span>
                                    </button>
                                </div>
                                <p className="text-center text-purple-200">
                                    Already have an account?{" "}
                                    <a 
                                        href="/login" 
                                        className="text-purple-400 hover:text-purple-300 transition-colors duration-300 font-medium hover:underline"
                                    >
                                        Login
                                    </a>
                                </p>
                            </motion.div>
                        </form>
                    </div>
                </motion.div>
            </div>
        </>
    )
}

export default Signup

