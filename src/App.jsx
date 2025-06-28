"use client"

import { useState, useEffect } from "react"
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom"
import { AnimatePresence } from "framer-motion"
import Navbar from "./components/Navbar"
import LandingPage from "./pages/LandingPage"
import Dashboard from "./pages/Dashboard"
import AssessConfig from "./pages/AssessConfig"
import Assessment from "./pages/Assessment"
import Results from "./pages/Results"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import UserProfile from "./pages/UserProfile"

function App() {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    useEffect(() => {
        if (user) {
            localStorage.setItem('user', JSON.stringify(user));
        } else {
            localStorage.removeItem('user');
        }
    }, [user]);

    return (
        <Router>
            <div className="min-h-screen relative overflow-hidden">
                <Navbar user={user} setUser={setUser} />
                <AnimatePresence mode="wait">
                    <Routes>
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/login" element={<Login setUser={setUser} />} />
                        <Route path="/signup" element={<Signup setUser={setUser} />} />
                        <Route path="/dashboard" element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} />
                        <Route path="/assessconfig" element={user ? <AssessConfig user={user} /> : <Navigate to="/login" />} /> 
                        <Route path="/assessment" element={user ? <Assessment user={user} /> : <Navigate to="/login" />} />
                        <Route path="/results" element={user ? <Results user={user} /> : <Navigate to="/login" />} />
                        <Route path="/profile" element={<UserProfile user={user} />} />
                    </Routes>
                </AnimatePresence>
            </div>
        </Router>
    )
}

export default App

