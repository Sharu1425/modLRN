import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Assessment = () => {
    const [user, setUser] = useState(null);
    const [score, setScore] = useState(0);
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState([]);
    const [config, setConfig] = useState({ topic: '', difficulty: '', qnCount: 0 });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserAndConfig = async () => {
            try {
                // Get user data
                const userResponse = await axios.get('/auth/status');
                if (userResponse.data.isAuthenticated) {
                    setUser(userResponse.data.user);
                } else {
                    navigate('/login');
                    return;
                }

                // Get assessment config
                const configResponse = await axios.get('/api/topic');
                if (configResponse.data) {
                    console.log('Received config:', configResponse.data);
                    setConfig(configResponse.data);
                } else {
                    setError('No assessment configuration found');
                    navigate('/assess-config');
                }
            } catch (error) {
                console.error('Error fetching user or config:', error);
                setError('Failed to load assessment data');
            }
        };

        fetchUserAndConfig();
    }, [navigate]);

    const handleEndAssessment = async () => {
        if (!user) {
            setError('User not authenticated');
            return;
        }

        if (!config.topic || !config.difficulty) {
            setError('Invalid assessment configuration');
            return;
        }

        try {
            const result = {
                userId: user._id,
                score: score,
                totalQuestions: questions.length,
                questions: questions.map(q => ({
                    question: q.question,
                    options: q.options,
                    answer: q.answer
                })),
                userAnswers: answers,
                topic: config.topic,
                difficulty: config.difficulty
            };

            console.log('Sending result:', result);

            const response = await axios.post('/api/results', result);
            console.log('Result saved:', response.data);
            
            // Clear the assessment config from session
            await axios.post('/api/topic', { clear: true });
            
            navigate('/results');
        } catch (error) {
            console.error('Error saving result:', error);
            setError('Failed to save results. Please try again.');
        }
    };

    return (
        <div>
            {error && <div className="error-message">{error}</div>}
            {/* Render your assessment components here */}
        </div>
    );
};

export default Assessment; 