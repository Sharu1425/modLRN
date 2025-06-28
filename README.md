# %LearnAI (modLRN)

An AI-powered adaptive learning platform that provides personalized assessments and real-time analytics using cutting-edge technologies including face recognition, Google Gemini AI, and modern web development stack.

## 🚀 Features

### Core Features
- **AI-Powered Question Generation**: Dynamic question generation using Google Gemini AI based on topic and difficulty
- **Face Recognition Authentication**: Secure login using facial recognition technology
- **Adaptive Learning System**: Personalized learning paths that evolve with user progress
- **Real-time Analytics**: Comprehensive progress tracking and performance metrics
- **Interactive Assessments**: Engaging quiz interface with smooth animations
- **User Profile Management**: Complete user account management with Google OAuth integration

### Technical Features
- **Modern UI/UX**: Beautiful, responsive design with Framer Motion animations
- **Real-time Progress Tracking**: Live progress indicators and performance analytics
- **Session Management**: Secure session handling with Express sessions
- **Database Integration**: MongoDB with Mongoose ODM for data persistence
- **RESTful API**: Well-structured backend API with proper error handling

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks and functional components
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library for smooth transitions
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client for API communication
- **Recharts** - Data visualization library

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **Passport.js** - Authentication middleware
- **bcryptjs** - Password hashing
- **Express Session** - Session management

### AI & ML
- **Google Gemini AI** - AI-powered question generation
- **Face-API.js** - Face detection and recognition
- **TensorFlow.js** - Machine learning framework

### Authentication
- **Google OAuth 2.0** - Social login integration
- **Face Recognition** - Biometric authentication
- **Local Authentication** - Traditional username/password

## 📁 Project Structure

```
modLRN/
├── backend/                 # Backend configuration
│   ├── database.js         # MongoDB connection
│   ├── index.js           # Server entry point
│   └── passportConfig.js  # Passport authentication setup
├── client/                 # Frontend source code
│   └── src/
│       ├── components/     # Reusable React components
│       └── pages/         # Page components
├── controllers/           # Business logic controllers
├── models/               # MongoDB schemas
├── routes/               # API route definitions
├── public/              # Static assets
│   └── models/          # Face recognition models
└── src/                 # Main React application
    ├── components/      # UI components
    ├── pages/          # Page components
    └── assets/         # Static assets
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- Google Gemini API key
- Google OAuth credentials (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd modLRN
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   GEMINI_API_KEY=your_gemini_api_key
   SESSION_SECRET=your_session_secret
   GOOGLE_CLIENT_ID=your_google_oauth_client_id
   GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
   ```

4. **Start the development servers**
   ```bash
   # Start both frontend and backend concurrently
   npm run dev:all
   
   # Or start them separately
   npm run dev      # Frontend (Vite)
   npm run server   # Backend (Express)
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:5001

## 📖 Usage

### For Users
1. **Sign Up/Login**: Create an account or use face recognition/Google OAuth
2. **Configure Assessment**: Choose topic, difficulty, and question count
3. **Take Assessment**: Answer AI-generated questions with real-time feedback
4. **View Results**: Analyze performance with detailed analytics
5. **Track Progress**: Monitor learning journey with progress charts

### For Developers
- **API Documentation**: All endpoints are RESTful and well-documented
- **Component Library**: Reusable React components with consistent styling
- **State Management**: Local state with React hooks and context
- **Error Handling**: Comprehensive error handling throughout the application

## 🔧 Available Scripts

- `npm run dev` - Start Vite development server
- `npm run server` - Start Express backend server
- `npm run dev:all` - Start both frontend and backend concurrently
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🌟 Key Features Explained

### AI Question Generation
The platform uses Google Gemini AI to dynamically generate questions based on:
- **Topic**: Any subject matter (e.g., "JavaScript", "Machine Learning")
- **Difficulty**: Easy, Medium, Hard
- **Count**: Number of questions (1-50)

### Face Recognition
- Uses Face-API.js for real-time face detection
- Stores face descriptors securely in the database
- Provides seamless biometric authentication

### Adaptive Learning
- Tracks user performance across assessments
- Provides personalized recommendations
- Adapts question difficulty based on performance

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support, email support@modlrn.com or create an issue in the repository.

---

**Built with ❤️ using modern web technologies**
