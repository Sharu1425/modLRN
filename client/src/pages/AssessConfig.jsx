import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AssessConfig = () => {
    const [selectedTopic, setSelectedTopic] = useState('');
    const [questionCount, setQuestionCount] = useState('');
    const [selectedDifficulty, setSelectedDifficulty] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const config = {
                topic: selectedTopic,
                qnCount: parseInt(questionCount, 10),
                difficulty: selectedDifficulty
            };

            console.log('Submitting config:', config);
            const response = await axios.post('/api/topic', config);
            console.log('Config saved:', response.data);

            if (response.data) {
                navigate('/assessment');
            } else {
                setError('Failed to save configuration');
            }
        } catch (error) {
            console.error('Error saving config:', error);
            setError('Failed to save configuration. Please try again.');
        }
    };

    return (
        <div>
            {/* Render your form here */}
        </div>
    );
};

export default AssessConfig; 