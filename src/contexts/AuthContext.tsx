// contexts/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import apiClient from '../api/client';


interface User {
  id: string;
  role: 'USER' | 'HOST';
  name?: string;        
  nickname: string;
  email: string;
  phone?: string;
  address?: string;
  invitationCode?: string;  
}


interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (updatedUserData: Partial<User>) => void;
  fetchUserDetails: () => Promise<void>;
  isLoading: boolean;
}


const AuthContext = createContext<AuthContextType | undefined>(undefined);


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const updateUser = (updatedUserData: Partial<User>) => {
    setUser(prev => {
      if (!prev) return null;
      const newUser = { ...prev, ...updatedUserData };
      localStorage.setItem('userData', JSON.stringify(newUser));
      return newUser;
    });
  };

  const fetchUserDetails = async () => {
    try {
      const response = await apiClient.get('/api/user/me');
      updateUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user details', error);
      // Potentially handle token expiry or other errors here, though interceptor should handle 401
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        // Set user from localStorage for immediate UI response
        const localUserData = localStorage.getItem('userData');
        if (localUserData) {
          try {
            setUser(JSON.parse(localUserData));
          } catch {
            // ignore if parsing fails
          }
        }
        // Fetch fresh, detailed user data from the server
        await fetchUserDetails();
      }
      setIsLoading(false);
    };
    initializeAuth();
  }, []);


  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await apiClient.post('/api/user/login', { email, password });
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
      await apiClient.post('/api/user/logout', {}, { withCredentials: true });
    } catch (error) {
      console.error('Logout API failed:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('userData');
      localStorage.removeItem('accessToken');
    }
  };


  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, fetchUserDetails, isLoading }}>
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
