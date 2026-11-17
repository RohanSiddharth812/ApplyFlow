import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Profile } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, name: string) => Promise<{ message: string; email: string; dev_verification_url?: string }>;
  verifyEmail: (token: string) => Promise<void>;
  resendVerification: (email: string) => Promise<{ message: string; email: string; dev_verification_url?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      const me = await api.getMe();
      setUser(me);
      const prof = await api.getProfile().catch(() => null);
      setProfile(prof);
    } catch {
      api.clearToken();
      setUser(null);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await api.login(email, pass);
      setUser(res.user);
      const prof = await api.getProfile().catch(() => null);
      setProfile(prof);
    } finally {
      setIsLoading(false);
    }
  };

  const register = (email: string, pass: string, name: string) => api.register(email, pass, name);

  const verifyEmail = async (token: string) => {
    const res = await api.verifyEmail(token);
    setUser(res.user);
    const prof = await api.getProfile().catch(() => null);
    setProfile(prof);
  };

  const resendVerification = (email: string) => api.resendVerification(email);

  const logout = async () => {
    await api.logout();
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, isLoading, login, register, verifyEmail, resendVerification, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
