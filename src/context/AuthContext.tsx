import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { api, getStoredUser, setAuthSession } from '../lib/api';

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
  isLocked: boolean;
  lockScreen: () => void;
  unlockScreen: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [isLocked, setIsLocked] = useState<boolean>(false);

  // Initialize Auth
  useEffect(() => {
    // Load currentUser from token
    const token = api.getToken();
    const storedUser = getStoredUser();
    if (token && storedUser) {
      setCurrentUser(storedUser);
      if (storedUser.role === 'KASIR') {
        setActiveTab('pos');
      } else {
        setActiveTab('dashboard');
      }
      
      const lockedState = localStorage.getItem('pos_retail_locked');
      if (lockedState === 'true') {
        setIsLocked(true);
      }
    } else {
      setShowLoginModal(true);
    }
  }, []);

  const toggleDarkMode = () => {
    // Disabled for Light Vape Store Theme
  };

  const handleLoginSuccess = (user: User, token?: string) => {
    if (token) {
      setAuthSession(token, user);
    }
    setCurrentUser(user);
    setShowLoginModal(false);
    if (user.role === 'KASIR') {
      setActiveTab('pos');
    } else {
      setActiveTab('dashboard');
    }
  };

  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
    setIsLocked(false);
    localStorage.removeItem('pos_retail_locked');
    setShowLoginModal(true);
  };

  const lockScreen = () => {
    setIsLocked(true);
    localStorage.setItem('pos_retail_locked', 'true');
  };

  const unlockScreen = () => {
    setIsLocked(false);
    localStorage.removeItem('pos_retail_locked');
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
        handleLogout,
        isLocked,
        lockScreen,
        unlockScreen
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
