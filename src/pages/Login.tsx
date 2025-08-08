import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { User } from "../types";
import { useTheme } from "../contexts/ThemeContext";
import { useToast } from "../hooks/useToast";
import AnimatedBackground from "../components/AnimatedBackground";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import FaceLogin from "../components/FaceLogin";
import api from "../utils/api";
import { ANIMATION_VARIANTS, TRANSITION_DEFAULTS } from "../utils/constants";

interface LoginProps {
    setUser: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ setUser }) => {
    const { mode, colorScheme } = useTheme();
    const { success, error } = useToast();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [showFaceLogin, setShowFaceLogin] = useState(false);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Handle Google OAuth callback
    useEffect(() => {
        const token = searchParams.get('token');
        const errorParam = searchParams.get('error');
        
        console.log('🔍 Login component - checking URL parameters');
        console.log('🔍 Token:', token ? `${token.substring(0, 20)}...` : 'None');
        console.log('🔍 Error:', errorParam || 'None');
        
        if (errorParam) {
            console.log('❌ Google OAuth error detected:', errorParam);
            error('Google Login Failed', decodeURIComponent(errorParam));
            // Clean up URL
            navigate('/login', { replace: true });
            return;
        }
        
        if (token) {
            console.log('🔍 Google OAuth token received, processing...');
            // Handle successful Google OAuth callback
            localStorage.setItem('access_token', token);
            
            // Fetch user info using the token
            const fetchUserInfo = async () => {
                try {
                    console.log('🔍 Fetching user info from backend...');
                    const response = await api.get('/auth/status', {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    
                    console.log('🔍 User info response:', response.data);
                    
                    if (response.data.isAuthenticated && response.data.user) {
                        console.log('✅ Google login successful, setting user:', response.data.user);
                        setUser(response.data.user);
                        success('Google Login Successful!', `Welcome back, ${response.data.user.name || response.data.user.username}!`);
                        navigate("/dashboard", { replace: true });
                    } else {
                        console.log('❌ User info response indicates not authenticated');
                        throw new Error('Failed to get user info');
                    }
                } catch (err: any) {
                    console.error("❌ Google login error:", err);
                    error('Google Login Failed', 'Failed to complete Google login. Please try again.');
                    localStorage.removeItem('access_token');
                }
            };
            
            fetchUserInfo();
        }
    }, [searchParams, setUser, success, error, navigate]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await api.post("/auth/login", formData);
            
            if (response.data.success) {
                const { access_token, user } = response.data;
                localStorage.setItem('access_token', access_token);
                localStorage.setItem('user', JSON.stringify(user));
                setUser(user);
                success('Login Successful!', `Welcome back, ${user.name || user.username}!`);
                navigate("/dashboard", { replace: true });
            } else {
                throw new Error(response.data.error || 'Login failed');
            }
        } catch (err: any) {
            console.error("Login error:", err);
            const errorMessage = err.response?.data?.detail || err.message || 'Login failed. Please try again.';
            error('Login Failed', errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            window.location.href = "https://modlrn.onrender.com/auth/google";
        } catch (err) {
            error('Google Login Failed', 'Unable to initiate Google login');
        }
    };

    const handleFaceLoginSuccess = (user: User) => {
        setUser(user);
        success('Face Login Successful!', `Welcome back, ${user.name || user.username}!`);
        navigate("/dashboard", { replace: true });
    };

    return (
        <>
            <AnimatedBackground />
            <div className="min-h-screen flex items-center justify-center px-4 relative z-10">
                <motion.div
                    variants={ANIMATION_VARIANTS.fadeIn}
                    initial="initial"
                    animate="animate"
                    className="w-full max-w-md"
                >
                    <Card className="p-8">
                        <motion.div
                            variants={ANIMATION_VARIANTS.slideDown}
                            className="text-center mb-8"
                        >
                            <motion.div
                                className={`
                                    w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center text-2xl font-bold
                                    ${mode === 'professional'
                                        ? colorScheme === 'dark'
                                            ? 'bg-gradient-to-br from-gray-700 to-gray-800 text-gray-200'
                                            : 'bg-gradient-to-br from-gray-800 to-gray-900 text-white'
                                        : 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
                                    }
                                `}
                                whileHover={{ scale: 1.05, rotate: 5 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                %L
                            </motion.div>
                            <h2 className={`
                                text-3xl font-bold mb-2
                                ${mode === 'professional' 
                                    ? colorScheme === 'dark'
                                        ? 'text-gray-200 font-serif'
                                        : 'text-gray-800 font-serif'
                                    : colorScheme === 'dark'
                                        ? 'bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400'
                                        : 'bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600'
                                }
                            `}>
                                Welcome Back
                            </h2>
                            <p className={`
                                ${mode === 'professional'
                                    ? colorScheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                    : colorScheme === 'dark' ? 'text-purple-200' : 'text-purple-700'
                                }
                            `}>
                                Sign in to continue your learning journey
                            </p>
                        </motion.div>

                        {!showFaceLogin ? (
                            <motion.form
                                variants={ANIMATION_VARIANTS.stagger}
                                initial="initial"
                                animate="animate"
                                onSubmit={handleSubmit}
                                className="space-y-6"
                            >
                                <motion.div variants={ANIMATION_VARIANTS.slideUp}>
                                    <Input
                                        type="email"
                                        name="email"
                                        placeholder="Email address"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </motion.div>

                                <motion.div variants={ANIMATION_VARIANTS.slideUp}>
                                    <Input
                                        type="password"
                                        name="password"
                                        placeholder="Password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </motion.div>

                                <motion.div variants={ANIMATION_VARIANTS.slideUp}>
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        className="w-full"
                                        isLoading={isLoading}
                                    >
                                        Sign In
                                    </Button>
                                </motion.div>

                                <motion.div 
                                    variants={ANIMATION_VARIANTS.slideUp}
                                    className="flex items-center space-x-4"
                                >
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="flex-1"
                                        onClick={handleGoogleLogin}
                                    >
                                        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                                            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                        </svg>
                                        Google
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => setShowFaceLogin(true)}
                                    >
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        Face ID
                                    </Button>
                                </motion.div>

                                <motion.div 
                                    variants={ANIMATION_VARIANTS.slideUp}
                                    className="text-center"
                                >
                                    <p className={`
                                        text-sm
                                        ${mode === 'professional'
                                            ? colorScheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                            : colorScheme === 'dark' ? 'text-purple-300' : 'text-purple-600'
                                        }
                                    `}>
                                        Don't have an account?{" "}
                                        <Link
                                            to="/signup"
                                            className={`
                                                font-medium transition-colors duration-200
                                                ${mode === 'professional'
                                                    ? colorScheme === 'dark' ? 'text-gray-200 hover:text-white' : 'text-gray-800 hover:text-gray-900'
                                                    : colorScheme === 'dark' ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-700'
                                                }
                                            `}
                                        >
                                            Sign up
                                        </Link>
                                    </p>
                                </motion.div>
                            </motion.form>
                        ) : (
                            <FaceLogin
                                onSuccess={handleFaceLoginSuccess}
                                onCancel={() => setShowFaceLogin(false)}
                            />
                        )}
                    </Card>
                </motion.div>
            </div>
        </>
    );
};

export default Login;
