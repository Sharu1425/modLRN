import { useState, useEffect } from 'react';
import { User } from '../types';
import api from '../utils/api';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    const parsedUser = savedUser ? JSON.parse(savedUser) : null;
    return parsedUser;
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem('access_token');
        
        if (!token) {
          setIsLoading(false);
          return;
        }

        const response = await api.get('/auth/status');
        
        if (response.data.isAuthenticated && response.data.user) {
          console.log('🔐 [AUTH] User authenticated:', response.data.user.email);
          setUser(response.data.user);
          localStorage.setItem('user', JSON.stringify(response.data.user));
        } else {
          console.log('🔐 [AUTH] Token invalid, clearing session');
          setUser(null);
          localStorage.removeItem('user');
          localStorage.removeItem('access_token');
        }
      } catch (error) {
        console.error('❌ [AUTH] Auth check failed:', error);
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('access_token');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = (userData: User, token?: string) => {
    console.log('🔐 [AUTH] User logged in:', userData.email);
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    if (token) {
      localStorage.setItem('access_token', token);
    }
  };

  const logout = () => {
    console.log('🔐 [AUTH] User logged out');
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('access_token');
  };

  return { user, setUser: login, logout, isLoading };
};
