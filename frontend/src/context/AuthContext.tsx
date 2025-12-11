import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userId, setUserId] = useState<string | null>(() => {
    try {
      return localStorage.getItem('userId');
    } catch {
      return null;
    }
  });
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      return localStorage.getItem('isAdmin') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      if (userId) localStorage.setItem('userId', userId);
      else localStorage.removeItem('userId');
      localStorage.setItem('isAdmin', String(isAdmin));
    } catch {
      // ignore localStorage errors
    }
  }, [userId, isAdmin]);

  const login = (id: string, admin: boolean = false) => {
    setUserId(id);
    setIsAdmin(admin);
  };

  const logout = () => {
    setUserId(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ userId, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export default AuthContext;
