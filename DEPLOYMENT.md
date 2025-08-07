# 🚀 Production Deployment Guide

## Overview
This guide covers the deployment of modLRN to production environments.

### Current Production URLs
- **Frontend**: https://modlrn.vercel.app/
- **Backend**: https://modlrn.onrender.com/

## 🔧 Configuration Changes Made

### 1. Frontend API Configuration
- **File**: `src/utils/api.ts`
- **Change**: Updated to use production backend URL
- **Environment Variable**: `VITE_API_BASE_URL`

### 2. Backend CORS Settings
- **File**: `backend/main.py`
- **Change**: Added production frontend URL to allowed origins
- **URLs Added**:
  - `https://modlrn.vercel.app` (Production frontend)
  - `https://modlrn.onrender.com` (Production backend)

### 3. Environment-Based Configuration
- **File**: `src/utils/constants.ts`
- **Change**: Added `API_BASE_URL` constant for environment-based configuration

### 4. Health Check Updates
- **File**: `src/components/BackendStatusIndicator.tsx`
- **Change**: Updated to use production API URL for health checks

## 🌍 Environment Variables

### Frontend (Vite)
```bash
VITE_API_BASE_URL=https://modlrn.onrender.com
```

### Backend (Render)
```bash
MONGO_URI=your_mongodb_connection_string
SECRET_KEY=your_jwt_secret_key
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
GEMINI_API_KEY=your_google_gemini_api_key
DB_NAME=modlrn
```

## 📦 Deployment Platforms

### Frontend - Vercel
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Backend - Render
1. Connect your GitHub repository to Render
2. Set environment variables in Render dashboard
3. Configure build command: `pip install -r requirements.txt`
4. Configure start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

## 🔍 Health Check Endpoints

### Backend Health
- **URL**: `https://modlrn.onrender.com/api/health`
- **Response**: JSON with status, database health, and timestamp

### Frontend Status
- **URL**: `https://modlrn.vercel.app/`
- **Response**: React application with backend status indicator

## 🛠️ Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check that frontend URL is in backend CORS allowlist
   - Verify HTTPS/HTTP protocol matches

2. **API Connection Issues**
   - Verify environment variables are set correctly
   - Check backend is running and accessible

3. **Authentication Issues**
   - Ensure JWT secret is properly configured
   - Check token expiration settings

### Debug Steps

1. **Check Backend Status**
   ```bash
   curl https://modlrn.onrender.com/api/health
   ```

2. **Check Frontend API Calls**
   - Open browser dev tools
   - Check Network tab for failed requests
   - Verify API base URL in console

3. **Environment Variable Verification**
   - Check Vercel dashboard for frontend env vars
   - Check Render dashboard for backend env vars

## 🔒 Security Considerations

### Frontend Security Headers
- Added security headers in `vercel.json`
- XSS protection enabled
- Content type sniffing disabled
- Frame options set to deny

### Backend Security
- CORS properly configured for production domains
- JWT tokens with secure expiration
- Environment variables for sensitive data
- Input validation on all endpoints

## 📊 Monitoring

### Backend Monitoring
- Health check endpoint for uptime monitoring
- Database connection status
- Error logging and monitoring

### Frontend Monitoring
- Backend status indicator in navbar
- Error boundary for React errors
- Console logging for debugging

## 🔄 Update Process

### Frontend Updates
1. Push changes to GitHub
2. Vercel automatically deploys
3. Verify deployment at https://modlrn.vercel.app/

### Backend Updates
1. Push changes to GitHub
2. Render automatically redeploys
3. Verify health check at https://modlrn.onrender.com/api/health

## 📝 Notes

- Both frontend and backend are configured for automatic deployment
- Environment variables are managed through platform dashboards
- Health checks are available for monitoring
- CORS is properly configured for production domains
- Security headers are implemented for both platforms
