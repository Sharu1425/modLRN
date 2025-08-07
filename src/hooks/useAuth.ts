import { useState, useEffect } from 'react';
import { User } from '../types';
import api from '../utils/api';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    const parsedUser = savedUser ? JSON.parse(savedUser) : null;
    console.log('🔄 [USE_AUTH] Initial user from localStorage:', parsedUser);
    return parsedUser;
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        console.log('🔄 [USE_AUTH] Checking auth status...');
        const token = localStorage.getItem('access_token');
        console.log('🔑 [USE_AUTH] Token present:', !!token);
        
        if (!token) {
          console.log('❌ [USE_AUTH] No token found, setting loading to false');
          setIsLoading(false);
          return;
        }

        console.log('🌐 [USE_AUTH] Making auth status request...');
        const response = await api.get('/auth/status');
        console.log('📥 [USE_AUTH] Auth status response:', response.data);
        
        if (response.data.isAuthenticated && response.data.user) {
          console.log('✅ [USE_AUTH] User authenticated, setting user:', response.data.user);
          setUser(response.data.user);
          localStorage.setItem('user', JSON.stringify(response.data.user));
        } else {
          console.log('❌ [USE_AUTH] User not authenticated, clearing user');
          setUser(null);
          localStorage.removeItem('user');
          localStorage.removeItem('access_token');
        }
      } catch (error) {
        console.error('❌ [USE_AUTH] Auth check failed:', error);
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('access_token');
      } finally {
        console.log('🏁 [USE_AUTH] Setting loading to false');
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = (userData: User, token?: string) => {
    console.log('🔄 [USE_AUTH] Login called with userData:', userData);
    console.log('🔑 [USE_AUTH] Token provided:', !!token);
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    if (token) {
      localStorage.setItem('access_token', token);
    }
    console.log('✅ [USE_AUTH] User logged in successfully');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('access_token');
  };

  return { user, setUser: login, logout, isLoading };
};
