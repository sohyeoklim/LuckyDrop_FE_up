// contexts/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import apiClient from '../../api/client';

interface User {
  id: string;
  nickname: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const userData = localStorage.getItem('userData');
      const token = localStorage.getItem('accessToken');

      if (userData && token) {
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
        } catch (error) {
          console.error('Failed to parse userData:', error);
          localStorage.removeItem('userData');
          localStorage.removeItem('accessToken');
        }
      }
      setIsLoading(false);
    };
    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await apiClient.post('/api/member/login', { email, password });
      const { authenticated, user: userInfo } = response.data;

      if (!authenticated) {
        throw new Error('로그인 실패');
      }

      // accessToken은 헤더에서 가져와서 저장
      const token = response.headers.authorization?.replace('Bearer ', '');
      if (token) {
        localStorage.setItem('accessToken', token);
      }

      localStorage.setItem('userData', JSON.stringify(userInfo));
      setUser(userInfo);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      localStorage.removeItem('userData');
      localStorage.removeItem('accessToken');
      throw error;
    }
  };

  const logout = async () => {
    try {
      // 서버 쪽 로그아웃 API (옵션)
      await apiClient.post('/api/member/logout', {}, { withCredentials: true });
    } catch (error) {
      console.error('Logout API failed:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('userData');
      localStorage.removeItem('accessToken');
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
