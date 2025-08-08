import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User } from "../types";
import { useTheme } from "../contexts/ThemeContext";
import { useToast } from "../hooks/useToast";
import AnimatedBackground from "../components/AnimatedBackground";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import api from "../utils/api";
import { ANIMATION_VARIANTS, TRANSITION_DEFAULTS } from "../utils/constants";

interface SignupProps {
    setUser: (user: User, token?: string) => void;
}

const Signup: React.FC<SignupProps> = ({ setUser }) => {
    const { mode, colorScheme } = useTheme();
    const { success, error: showError } = useToast();
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: ""
    });
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords don't match");
            showError('Registration Failed', 'Passwords do not match');
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const response = await api.post("/auth/register", {
                username: formData.username,
                email: formData.email,
                password: formData.password
            });

            if (response.data.access_token) {
                localStorage.setItem('access_token', response.data.access_token);
            }
            
            setUser(response.data.user);
            success('Registration Successful!', `Welcome, ${response.data.user.name || response.data.user.username}!`);
            navigate("/dashboard", { replace: true });
        } catch (err: any) {
            const errorMessage = err.response?.data?.detail || "Registration failed";
            setError(errorMessage);
            showError('Registration Failed', errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignup = () => {
        window.location.href = "https://modlrn.onrender.com/auth/google";
    };

    return (
        <>
            <AnimatedBackground />
            <div className="min-h-screen flex items-center justify-center px-4 py-16 relative z-10">
                <motion.div
                    variants={ANIMATION_VARIANTS.scaleIn}
                    initial="initial"
                    animate="animate"
                    transition={TRANSITION_DEFAULTS}
                    className="w-full max-w-md"
                >
                    <Card className="p-8">
                        <motion.div
                            variants={ANIMATION_VARIANTS.slideDown}
                            className="text-center mb-8"
                        >
                            <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
                                Create Account
                            </h2>
                            <p className="text-purple-200 text-lg">Start your learning journey</p>
                        </motion.div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <motion.div
                                variants={ANIMATION_VARIANTS.stagger}
                                initial="initial"
                                animate="animate"
                                className="space-y-4"
                            >
                                <Input
                                    type="text"
                                    name="username"
                                    label="Username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    placeholder="Choose a username"
                                    required
                                    icon={
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    }
                                />

                                <Input
                                    type="email"
                                    name="email"
                                    label="Email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Enter your email"
                                    required
                                    icon={
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                        </svg>
                                    }
                                />

                                <Input
                                    type="password"
                                    name="password"
                                    label="Password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Create a password"
                                    required
                                    icon={
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    }
                                />

                                <Input
                                    type="password"
                                    name="confirmPassword"
                                    label="Confirm Password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Confirm your password"
                                    required
                                    error={formData.password !== formData.confirmPassword && formData.confirmPassword ? "Passwords don't match" : ""}
                                    icon={
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    }
                                />
                            </motion.div>

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-red-400 text-center text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3"
                                >
                                    {error}
                                </motion.div>
                            )}

                            <motion.div
                                variants={ANIMATION_VARIANTS.slideUp}
                                className="space-y-4"
                            >
                                <Button 
                                    type="submit" 
                                    variant="primary"
                                    size="lg"
                                    className="w-full"
                                    isLoading={isLoading}
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Creating Account...' : 'Create Account'}
                                </Button>

                                <div className="relative my-6">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-purple-500/30"></div>
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-2 bg-purple-900/50 text-purple-300">Or continue with</span>
                                    </div>
                                </div>

                                <motion.button
                                    type="button"
                                    onClick={handleGoogleSignup}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full bg-white text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition duration-300 shadow-md hover:shadow-lg flex items-center justify-center space-x-3 border border-gray-200"
                                >
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                    <span className="font-medium">Continue with Google</span>
                                </motion.button>

                                <p className="text-center text-purple-200">
                                    Already have an account?{" "}
                                    <motion.a 
                                        href="/login" 
                                        className="text-purple-400 hover:text-purple-300 transition-colors duration-300 font-medium hover:underline"
                                        whileHover={{ scale: 1.05 }}
                                    >
                                        Sign in
                                    </motion.a>
                                </p>
                            </motion.div>
                        </form>
                    </Card>
                </motion.div>
            </div>
        </>
    );
};

export default Signup;
