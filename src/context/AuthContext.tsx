import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { api, getStoredUser, setAuthSession, getStoredToken, clearAuthSession } from '../lib/api';

export interface AuthContextType {
  currentUser: User | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  handleNavigateTab: (tab: string) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  showLoginModal: boolean;
  setShowLoginModal: (show: boolean) => void;
  handleLoginSuccess: (user: User, token?: string) => void;
  handleLogout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(() => getStoredUser());
  const [activeTab, setActiveTab] = useState<string>('pos');
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('pos_retail_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [showLoginModal, setShowLoginModal] = useState(!getStoredToken());

  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'KASIR') {
        setActiveTab('pos');
      } else {
        setActiveTab('dashboard');
      }
    }
  }, [currentUser]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    localStorage.setItem('pos_retail_theme', !darkMode ? 'dark' : 'light');
  };

  const handleLoginSuccess = (user: User, token?: string) => {
    if (token) {
      setAuthSession(token, user);
    }
    setCurrentUser(user);
    setShowLoginModal(false);
  };

  const handleLogout = () => {
    clearAuthSession();
    setCurrentUser(null);
    setShowLoginModal(true);
    setActiveTab('pos');
  };

  const handleNavigateTab = (tab: string) => {
    // Access control check
    if (currentUser?.role === 'KASIR') {
      const allowedTabsForKasir = ['pos', 'catalog', 'products', 'opname'];
      if (!allowedTabsForKasir.includes(tab)) {
        alert('Akses Terbatas: Fitur ini khusus untuk Owner Toko.');
        return;
      }
    }
    setActiveTab(tab);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        activeTab,
        setActiveTab,
        handleNavigateTab,
        darkMode,
        toggleDarkMode,
        showLoginModal,
        setShowLoginModal,
        handleLoginSuccess,
        handleLogout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
