import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../lib/api';
import { UserSummary } from '@verseora/shared-types';

interface AuthContextType {
  user: UserSummary | null;
  token: string | null;
  isLoading: boolean;
  login: (credentials: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updated: Partial<UserSummary>) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSummary | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('verseora_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      if (localStorage.getItem('verseora_token')) {
        const me = await api.getMe();
        setUser(me);
      } else {
        setUser(null);
      }
    } catch {
      localStorage.removeItem('verseora_token');
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (credentials: any) => {
    const data = await api.login(credentials);
    localStorage.setItem('verseora_token', data.access_token);
    setToken(data.access_token);
    setUser(data.user);
  };

  const register = async (userData: any) => {
    const data = await api.register(userData);
    localStorage.setItem('verseora_token', data.access_token);
    setToken(data.access_token);
    setUser(data.user);
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      // Proceed with local logout regardless
    }
    localStorage.removeItem('verseora_token');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updated: Partial<UserSummary>) => {
    if (user) {
      setUser({ ...user, ...updated });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

