<p align="center">
  <img src="https://img.shields.io/github/license/Sharu1425/modLRN?style=flat-square" alt="License" />
  <img src="https://img.shields.io/github/languages/top/Sharu1425/modLRN?style=flat-square" alt="Top Language" />
  <img src="https://img.shields.io/github/last-commit/Sharu1425/modLRN?style=flat-square" alt="Last Commit" />
</p>

<p align="center">
  <img src="https://user-images.githubusercontent.com/placeholder/logo.png" width="120" alt="modLRN Logo" />
</p>

<h1 align="center"><b>modLRN — AI-powered Adaptive Learning Platform</b></h1>
<p align="center">
  <em>Personalized assessments, real-time analytics, secure authentication, and more — powered by state-of-the-art AI & web technologies.</em>
</p>

---

## 🚀 Features

### Core Functionality
- 🤖 **AI-Powered Question Generation** — Dynamic, topic-based questions via Google Gemini AI
- 🧑‍💻 **Face Recognition Authentication** — Secure access with facial recognition
- 🧠 **Adaptive Learning** — Personalized paths that evolve with progress
- 📊 **Real-time Analytics** — Visualize and track progress with beautiful charts
- 📝 **Interactive Assessments** — Engaging quizzes with smooth animations
- 👤 **Profile Management** — Full account management (Google OAuth included)
- 🔄 **Backend Status Indicator** — Real-time backend health monitoring

### Tech Highlights
- 🎨 **Modern UI/UX** — Responsive Tailwind CSS & Framer Motion animations
- 🔒 **Secure Session Handling** — JWT-based authentication with bcrypt
- ⚡ **FastAPI Backend** — High-performance Python backend with async operations
- 🗄️ **MongoDB Integration** — Reliable data storage with Motor async driver

---

## 🛠️ Tech Stack

<details>
  <summary><strong>Frontend</strong></summary>
  <ul>
    <li><b>React 18</b> & <b>Vite</b></li>
    <li>Tailwind CSS, Framer Motion, React Router DOM</li>
    <li>Axios, Recharts</li>
  </ul>
</details>
<details>
  <summary><strong>Backend</strong></summary>
  <ul>
    <li><b>Python 3.13</b>, <b>FastAPI</b></li>
    <li><b>MongoDB</b> with <b>Motor</b> async driver</li>
    <li><b>Pydantic</b> for data validation</li>
    <li><b>JWT</b> authentication, <b>bcrypt</b> password hashing</li>
  </ul>
</details>
<details>
  <summary><strong>AI & ML</strong></summary>
  <ul>
    <li><b>Google Gemini AI</b> for question generation</li>
    <li><b>Face-API.js</b> for facial recognition</li>
  </ul>
</details>
<details>
  <summary><strong>Authentication</strong></summary>
  <ul>
    <li><b>Google OAuth 2.0</b></li>
    <li><b>Face Recognition</b> with Euclidean distance matching</li>
    <li><b>JWT-based</b> local authentication</li>
  </ul>
</details>

---

## 📁 Project Structure

```tree
modLRN2/
├── backend/                 # Python FastAPI Backend
│   ├── main.py             # FastAPI application entry point
│   ├── database.py         # MongoDB connection
│   ├── run.py              # Server runner
│   ├── requirements.txt    # Python dependencies
│   ├── env.txt            # Environment template
│   ├── models/            # Pydantic models & schemas
│   ├── routers/           # API routes
│   └── utils/             # Utility functions
├── src/                   # React Frontend
│   ├── components/        # React components
│   ├── pages/            # Page components
│   └── App.jsx           # Main app component
├── public/                # Static assets (Face Recognition models)
├── package.json           # Node.js dependencies
└── vite.config.js         # Vite configuration with proxy
```

---

## 🚦 Getting Started

### Prerequisites
- **Python 3.13+**
- **Node.js (v16+)**
- **MongoDB** (local/cloud)
- **Google Gemini API key**
- **Google OAuth credentials** (optional)

### Quick Setup

#### 1. Backend Setup (Python FastAPI)

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp env.txt .env

# Edit .env file with your actual values:
# - MONGO_URI: Your MongoDB connection string
# - SECRET_KEY: A secure random string for JWT
# - GOOGLE_CLIENT_ID: Your Google OAuth client ID
# - GOOGLE_CLIENT_SECRET: Your Google OAuth client secret
# - GEMINI_API_KEY: Your Google Gemini API key

# Start the backend
python run.py
```

#### 2. Frontend Setup (React)

```bash
# In the root directory
npm install
npm run dev
```

### Environment Variables (.env)

```env
# Database Configuration
MONGO_URI=mongodb://localhost:27017

# JWT Configuration
SECRET_KEY=your-super-secret-key-change-this-in-production

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Gemini AI Configuration
GEMINI_API_KEY=your-gemini-api-key

# Server Configuration
HOST=0.0.0.0
PORT=5001
DEBUG=True
```

### Access the Application
- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5001](http://localhost:5001)
- **API Documentation**: [http://localhost:5001/docs](http://localhost:5001/docs)

---

## 👩‍🎓 Usage

### For Users
1. **Sign Up/Login** — Register or use face/Google OAuth
2. **Configure Assessment** — Pick topic, difficulty, quantity
3. **Take Assessment** — Answer AI-generated questions, get instant feedback
4. **View Results** — Detailed analytics and charts
5. **Track Progress** — Visualize your learning journey

### For Developers
- **API Docs** — Auto-generated Swagger documentation at `/docs`
- **Component Library** — Reusable React components
- **Type Safety** — Full Pydantic validation and type hints
- **Error Handling** — Comprehensive error flows

---

## 🔌 API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/face` - Face recognition login
- `POST /auth/register-face` - Register face descriptor
- `GET /auth/google` - Google OAuth initiation
- `GET /auth/google/callback` - Google OAuth callback
- `POST /auth/logout` - User logout
- `GET /auth/status` - Authentication status

### Questions
- `GET /db/questions` - Generate questions with Gemini AI
- `POST /db/questions` - Add questions manually

### Results
- `POST /api/results` - Save assessment results
- `GET /api/results/user/{user_id}` - Get user results
- `GET /api/results/{result_id}` - Get specific result
- `GET /api/results/analytics/{user_id}` - Get user analytics

### Users
- `GET /db/users/{user_id}` - Get user profile
- `PUT /db/users/{user_id}` - Update user profile
- `DELETE /db/users/{user_id}` - Delete user
- `GET /db/users/{user_id}/stats` - Get user statistics

### Assessment Configuration
- `POST /api/topic` - Set assessment configuration
- `GET /api/topic` - Get assessment configuration

### Health Check
- `GET /api/health` - Backend health status

---

## 🔧 Scripts

| Script            | Description                      |
|-------------------|----------------------------------|
| `npm run dev`     | Start Vite dev server            |
| `npm run build`   | Build for production             |
| `npm run preview` | Preview production build         |
| `npm run lint`    | Run ESLint                       |

---

## 🌟 Key Features Explained

<details>
  <summary><b>AI-Powered Question Generation</b></summary>
  <ul>
    <li><b>Topic</b> — Any subject (e.g., "JavaScript", "Machine Learning")</li>
    <li><b>Difficulty</b> — Easy, Medium, Hard</li>
    <li><b>Count</b> — 1-50 questions per assessment</li>
    <li><b>Real-time</b> — Generated on-demand via Google Gemini AI</li>
  </ul>
</details>

<details>
  <summary><b>Face Recognition</b></summary>
  <ul>
    <li><b>Face-API.js</b> for real-time detection</li>
    <li><b>Euclidean distance</b> matching for accuracy</li>
    <li><b>Secure storage</b> of facial descriptors</li>
    <li><b>Multi-user</b> face recognition support</li>
  </ul>
</details>

<details>
  <summary><b>Adaptive Learning</b></summary>
  <ul>
    <li><b>Performance tracking</b> across topics and difficulties</li>
    <li><b>Personalized analytics</b> with detailed charts</li>
    <li><b>Progress visualization</b> with real-time updates</li>
  </ul>
</details>

<details>
  <summary><b>Backend Status Monitoring</b></summary>
  <ul>
    <li><b>Real-time indicator</b> in navbar</li>
    <li><b>5-second health checks</b> to backend</li>
    <li><b>Visual feedback</b> (green/red/yellow status)</li>
    <li><b>Tooltip information</b> with detailed status</li>
  </ul>
</details>

---

## 🔒 Security Features

- **JWT-based authentication** with configurable expiration
- **Password hashing** with bcrypt
- **Face recognition** with Euclidean distance matching
- **Google OAuth 2.0** integration
- **CORS protection** configured
- **Input validation** with Pydantic schemas
- **Type safety** throughout the application

---

## 🚀 Performance Benefits

### Python FastAPI Backend
- **Async/await** for better concurrency
- **Automatic API documentation** (Swagger/ReDoc)
- **Type safety** with Pydantic validation
- **Better error handling** and debugging
- **Faster development** with hot reload

### Frontend Optimizations
- **Vite** for fast development and building
- **Tailwind CSS** for optimized styling
- **Framer Motion** for smooth animations
- **Axios interceptors** for centralized API handling

---

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check MONGO_URI in .env file

2. **Port Already in Use**
   - Change PORT in .env file
   - Update vite.config.js proxy settings

3. **Module Import Errors**
   - Ensure virtual environment is activated
   - Run `pip install -r requirements.txt`

4. **CORS Errors**
   - Check CORS settings in main.py
   - Verify frontend URL in allow_origins

### Debug Mode
Enable debug mode for detailed error messages:
```env
DEBUG=True
```

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch:
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. Commit changes:
   ```bash
   git commit -m 'Add AmazingFeature'
   ```
4. Push:
   ```bash
   git push origin feature/AmazingFeature
   ```
5. Open a Pull Request!

---

## 📝 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

## 🆘 Support

For questions or support:
- **API Documentation**: http://localhost:5001/docs
- **Backend Health Check**: http://localhost:5001/api/health
- **Create an issue** on GitHub

---

## 👥 Authors

- Rahul V S
- Sharvesh Ram K S
- Adhithya R
- Yukesh D

---

<p align="center"><b>Made with ❤️ for learners, by learners.</b></p>
