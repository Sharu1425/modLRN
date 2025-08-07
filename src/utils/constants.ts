// API Configuration
export const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'https://modlrn.onrender.com';

// Animation variants for Framer Motion
export const ANIMATION_VARIANTS = {
    fadeIn: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 }
    },
    slideUp: {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 }
    },
    slideDown: {
        initial: { opacity: 0, y: -20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 20 }
    },
    slideRight: {
        initial: { opacity: 0, x: -20 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: 20 }
    },
    scaleIn: {
        initial: { opacity: 0, scale: 0.8 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.8 }
    },
    stagger: {
        animate: {
            transition: {
                staggerChildren: 0.1
            }
        }
    }
};

// Transition defaults
export const TRANSITION_DEFAULTS = {
    duration: 0.3,
    ease: "easeInOut"
};

// Assessment configuration
export const DIFFICULTY_LEVELS = [
    "Very Easy",
    "Easy", 
    "Medium", 
    "Hard", 
    "Very Hard"
];

export const TOPICS = [
    "JavaScript",
    "Python", 
    "React",
    "Node.js",
    "MongoDB",
    "TypeScript",
    "HTML/CSS",
    "SQL",
    "Git",
    "Docker",
    "AWS",
    "Linux",
    "Data Structures",
    "Algorithms",
    "System Design",
    "Machine Learning",
    "Artificial Intelligence",
    "Web Development",
    "Mobile Development",
    "DevOps"
];

// Question count limits
export const MIN_QUESTIONS = 1;
export const MAX_QUESTIONS = 50;
export const DEFAULT_QUESTIONS = 10;

// Time limits (in seconds)
export const DIFFICULTY_TIME_LIMITS = {
    "Very Easy": 30,
    "Easy": 45,
    "Medium": 60,
    "Hard": 90,
    "Very Hard": 120
};

// Face recognition settings
export const FACE_RECOGNITION_THRESHOLD = 0.8;
export const FACE_DESCRIPTOR_LENGTH = 128;

// UI Constants
export const TOAST_DURATION = 3000;
export const LOADING_TIMEOUT = 30000;
export const ANIMATION_DURATION = 2500;
  