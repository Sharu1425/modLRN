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

### Tech Highlights
- 🎨 **Modern UI/UX** — Responsive Tailwind CSS & Framer Motion animations
- 🔒 **Secure Session Handling** — Robust session and authentication flows
- ⚡ **RESTful API** — Clean, well-documented backend endpoints
- 🗄️ **MongoDB Integration** — Reliable data storage & modeling

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
    <li>Node.js, Express.js</li>
    <li>MongoDB, Mongoose</li>
    <li>Passport.js, bcryptjs, Express Session</li>
  </ul>
</details>
<details>
  <summary><strong>AI & ML</strong></summary>
  <ul>
    <li>Google Gemini AI</li>
    <li>Face-API.js, TensorFlow.js</li>
  </ul>
</details>
<details>
  <summary><strong>Authentication</strong></summary>
  <ul>
    <li>Google OAuth 2.0</li>
    <li>Face Recognition</li>
    <li>Local (Username/Password)</li>
  </ul>
</details>

---

## 📁 Project Structure

```tree
modLRN/
├── backend/                 # Backend config & entry points
│   ├── database.js
│   ├── index.js
│   └── passportConfig.js
├── client/                  # Frontend source
│   └── src/
│       ├── components/
│       └── pages/
├── controllers/             # Logic/Controllers
├── models/                  # Mongoose schemas
├── routes/                  # API routes
├── public/                  # Static assets (incl. Face Recognition models)
├── src/                     # Main React app
│   ├── components/
│   ├── pages/
│   └── assets/
```

---

## 🚦 Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB (local/cloud)
- Google Gemini API key
- Google OAuth credentials (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Sharu1425/modLRN.git
   cd modLRN
   ```
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Environment setup** — Create a `.env` file in the root:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   GEMINI_API_KEY=your_gemini_api_key
   SESSION_SECRET=your_session_secret
   GOOGLE_CLIENT_ID=your_google_oauth_client_id
   GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
   ```
4. **Start servers**
   ```bash
   npm run dev:all     # Both frontend & backend
   # or individually:
   npm run dev         # Frontend
   npm run server      # Backend
   ```
5. **Access the app**
   - Frontend: [http://localhost:5173](http://localhost:5173)
   - Backend: [http://localhost:5001](http://localhost:5001)

---

## 👩‍🎓 Usage

### For Users
1. **Sign Up/Login** — Register or use face/Google OAuth
2. **Configure Assessment** — Pick topic, difficulty, quantity
3. **Take Assessment** — Answer AI-generated questions, get instant feedback
4. **View Results** — Detailed analytics and charts
5. **Track Progress** — Visualize your learning journey

### For Developers
- **API Docs** — All endpoints are RESTful and documented
- **Component Library** — Reusable React components
- **State Management** — Local state via hooks/context
- **Error Handling** — Robust error flows

---

## 🔧 Scripts

| Script            | Description                      |
|-------------------|----------------------------------|
| `npm run dev`     | Start Vite dev server            |
| `npm run server`  | Start Express backend            |
| `npm run dev:all` | Start frontend & backend         |
| `npm run build`   | Build for production             |
| `npm run preview` | Preview production build         |
| `npm run lint`    | Run ESLint                       |

---

## 🌟 Key Features Explained

<details>
  <summary><b>AI-Powered Question Generation</b></summary>
  <ul>
    <li>Topic — Any subject (e.g., "JavaScript", "ML")</li>
    <li>Difficulty — Easy, Medium, Hard</li>
    <li>Count — 1-50 questions per assessment</li>
  </ul>
</details>

<details>
  <summary><b>Face Recognition</b></summary>
  <ul>
    <li>Face-API.js for real-time detection</li>
    <li>Secure storage of facial descriptors</li>
    <li>Seamless biometric authentication</li>
  </ul>
</details>

<details>
  <summary><b>Adaptive Learning</b></summary>
  <ul>
    <li>Tracks user performance</li>
    <li>Personalized recommendations & adaptive difficulty</li>
  </ul>
</details>

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

For questions or support, email [support@modlrn.com](mailto:support@modlrn.com) or create an issue.

---

## 👥 Authors

- Rahul V S
- Sharvesh Ram K S
- Adhithya R
- Yukesh D

---

<p align="center"><b>Made with ❤️ for learners, by learners.</b></p>
