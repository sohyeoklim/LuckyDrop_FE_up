import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import apiClient from '../api/client';

interface User {
  id: string;
  role: 'USER' | 'HOST' | 'ADMIN';
  name?: string;
  nickname: string;
  email: string;
  phone?: string;
  address?: string;
  invitationCode?: string;
  googleLinked?: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updatedUserData: Partial<User>) => void;
  fetchUserDetails: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isAuthenticated = !!user;

  const updateUser = (updatedUserData: Partial<User>) => {
    setUser(prev => {
      if (!prev) return null;
      const newUser: User = { ...prev, ...updatedUserData };
      localStorage.setItem('userData', JSON.stringify(newUser));
      return newUser;
    });
  };

  const fetchUserDetails = async () => {
    try {
      const response = await apiClient.get('/api/user/me');
      const userData: User = {
        ...response.data,
        id: String(response.data.id),
      };
      setUser(userData);
      localStorage.setItem('userData', JSON.stringify(userData));
    } catch (error: any) {
      if (error.response?.status === 401) {
        setUser(null);
        localStorage.removeItem('userData');
        localStorage.removeItem('accessToken');
        return;
      }
      console.error('user/me 실패:', error);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      // localStorage에서 복원 (토큰 유무 상관없이!)
      const localUserData = localStorage.getItem('userData');
      
      if (localUserData) {
        try {
          const parsed: any = JSON.parse(localUserData);
          const safeUser: User = {
            id: String(parsed.id),
            role: parsed.role as 'USER' | 'HOST' | 'ADMIN',
            nickname: String(parsed.nickname),
            email: String(parsed.email),
            ...(parsed.phone && { phone: String(parsed.phone) }),
            ...(parsed.address && { address: String(parsed.address) }),
            ...(parsed.invitationCode && { invitationCode: String(parsed.invitationCode) }),
            ...(typeof parsed.googleLinked === 'boolean' && { googleLinked: parsed.googleLinked }),
            ...(parsed.name && { name: String(parsed.name) }),
          };
          setUser(safeUser);
        } catch (e) {
          console.error('localStorage 파싱 실패:', e);
        }
      }

      // HttpOnly 쿠키 기반 로그인(일반 로그인·Google OAuth)을 모두 복원한다.
      await fetchUserDetails().catch(console.warn);
      
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await apiClient.post('/api/user/login', { email, password });
      
      if (!response.data.authenticated) {
        throw new Error('로그인 실패');
      }

      // 토큰 여러 곳에서 찾기
      let token = response.data.token || response.data.accessToken;
      if (!token) {
        token = response.headers.authorization?.replace('Bearer ', '');
      }

      const userInfo = response.data.user;

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
      await apiClient.post('/api/user/logout');
    } catch (error) {
      console.warn('Logout API 실패. 클라이언트 상태만 정리:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('userData');
      localStorage.removeItem('accessToken');
    }
  };


  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, updateUser, fetchUserDetails, isLoading }}>
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
