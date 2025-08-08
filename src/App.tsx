import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import { ThemeProvider } from "./contexts/ThemeContext";
import { ToastProvider, useToast } from "./contexts/ToastContext";
import { useAuth } from "./hooks/useAuth";
import Navbar from "./components/Navbar";
import ToastContainer from "./components/ui/ToastContainer";
import LoadingState from "./components/LoadingState";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import AssessConfig from "./pages/AssessConfig";
import Assessment from "./pages/Assessment";
import Results from "./pages/Results";
import TestResultDetail from "./pages/TestResultDetail";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import UserProfile from "./pages/UserProfile";
import Settings from "./pages/Settings";

const AppContent: React.FC = () => {
    const { user, setUser, logout, isLoading } = useAuth();
    const { toasts, removeToast } = useToast();

    if (isLoading) {
        return <LoadingState text="Loading application..." size="lg" fullScreen={true} />;
    }

    return (
        <Router>
            <div className="min-h-screen relative overflow-hidden transition-colors duration-300">
                <Navbar user={user} setUser={logout} />
                <ToastContainer toasts={toasts} onClose={removeToast} />
                <AnimatePresence mode="wait">
                    <Routes>
                        <Route path="/" element={<LandingPage />} />
                        <Route 
                            path="/login" 
                            element={user ? <Navigate to="/dashboard" replace /> : <Login setUser={setUser} />} 
                        />
                        <Route 
                            path="/signup" 
                            element={user ? <Navigate to="/dashboard" replace /> : <Signup setUser={setUser} />} 
                        />
                        <Route 
                            path="/dashboard" 
                            element={user ? <Dashboard user={user} /> : <Navigate to="/login" replace />} 
                        />
                        <Route 
                            path="/assessconfig" 
                            element={user ? <AssessConfig user={user} /> : <Navigate to="/login" replace />}
                        /> 
                        <Route 
                            path="/assessment" 
                            element={user ? <Assessment user={user} /> : <Navigate to="/login" replace />} 
                        />
                        <Route 
                            path="/results" 
                            element={user ? <Results user={user} /> : <Navigate to="/login" replace />} 
                        />
                        <Route 
                            path="/test-result/:resultId" 
                            element={user ? <TestResultDetail user={user} /> : <Navigate to="/login" replace />} 
                        />
                        <Route 
                            path="/profile" 
                            element={user ? <UserProfile user={user} /> : <Navigate to="/login" replace />} 
                        />
                        <Route 
                            path="/settings" 
                            element={user ? <Settings user={user} /> : <Navigate to="/login" replace />} 
                        />
                    </Routes>
                </AnimatePresence>
            </div>
        </Router>
    );
};

const App: React.FC = () => {
    return (
        <ThemeProvider>
            <ToastProvider>
                <AppContent />
            </ToastProvider>
        </ThemeProvider>
    );
};

export default App;
