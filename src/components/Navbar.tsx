import React, { useState } from 'react';
import {
  Store,
  Bell,
  User as UserIcon,
  LogOut,
  ShieldAlert,
  ShoppingBag,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';
import { User, AppNotification, StoreSettings } from '../types';

interface NavbarProps {
  user: User | null;
  settings?: StoreSettings | null;
  storeName?: string;
  notifications: any[];
  onLogout: () => void;
  onOpenNotifications: () => void;
  onOpenLogin?: () => void;
  darkMode: boolean;
  onToggleDarkMode?: () => void;
  setDarkMode?: (val: boolean) => void;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  settings,
  storeName,
  notifications = [],
  onLogout,
  onOpenNotifications,
  onOpenLogin,
  darkMode,
  onToggleDarkMode,
  setDarkMode,
  activeTab = 'dashboard',
  setActiveTab
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const unreadNotifs = notifications.filter((n) => !n.read).length;

  const handleToggleTheme = () => {
    // Disabled
  };

  const getPageTitle = (tab: string) => {
    switch (tab) {
      case 'dashboard': return 'Dashboard Overview';
      case 'pos': return 'POS / Kasir';
      case 'products': return 'Katalog Produk';
      case 'inventory': return 'Barang Masuk';
      case 'ledger': return 'Stock Ledger';
      case 'opname': return 'Stock Opname';
      case 'reports': return 'Laporan Penjualan';
      case 'financials': return 'Keuangan & Kas';
      case 'suppliers': return 'Supplier & Restock';
      case 'users': return 'Pengelola User';
      case 'audit-logs': return 'Audit Log';
      case 'settings': return 'Pengaturan Toko';
      default: return 'Overview';
    }
  };

  return (
    <header className="h-14 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 md:px-6 flex items-center justify-between sticky top-0 z-30 transition-colors shadow-xs">
      {/* Left: Breadcrumbs & Page Info */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span>Pages</span> <span className="text-slate-300 dark:text-slate-700">/</span>{' '}
          <span className="text-slate-900 dark:text-white font-medium">{getPageTitle(activeTab)}</span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>{storeName || settings?.storeName || 'Vape Store Retail'}</span>
        </div>
      </div>

      {/* Center/Right Actions: Search & Utilities */}
      <div className="flex items-center gap-3">
        {/* Search Input Bar */}
        <div className="relative hidden md:block">
          <input
            type="text"
            placeholder="Search (⌘+K)..."
            className="bg-slate-100 dark:bg-slate-800 border-none rounded-lg py-1.5 pl-8 pr-4 text-xs w-48 lg:w-64 focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white placeholder:text-slate-400"
          />
          <svg className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Quick POS Action Button if not currently on POS */}
        {activeTab !== 'pos' && setActiveTab && (
          <button
            onClick={() => setActiveTab('pos')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-2xs transition-all"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>POS / Kasir</span>
          </button>
        )}

        {/* Dark Mode Toggle Removed */}

        {/* Notifications Icon Button */}
        <button
          onClick={onOpenNotifications}
          className="relative p-1.5 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          title="Notifikasi"
        >
          <Bell className="w-4 h-4" />
          {unreadNotifs > 0 && (
            <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {unreadNotifs}
            </span>
          )}
        </button>

        {/* User Avatar Menu */}
        {user ? (
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <img
                src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                alt={user.name}
                className="w-7 h-7 rounded-full object-cover border border-slate-300 dark:border-slate-700"
              />
              <div className="text-left hidden lg:block">
                <div className="text-xs font-bold text-slate-900 dark:text-white leading-none truncate max-w-[100px]">
                  {user.name}
                </div>
                <span className="text-[9px] font-bold text-slate-400 uppercase">
                  {user.role}
                </span>
              </div>
            </button>

            {/* User Dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-50 text-xs">
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700">
                  <p className="font-bold text-slate-900 dark:text-white">{user.name}</p>
                  <p className="text-[10px] text-slate-400">@{user.username} • {user.role}</p>
                </div>

                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onLogout();
                  }}
                  className="w-full text-left px-3 py-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2 font-medium"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          onOpenLogin && (
            <button
              onClick={onOpenLogin}
              className="px-3 py-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 rounded-lg hover:bg-emerald-100"
            >
              Login
            </button>
          )
        )}
      </div>
    </header>
  );
};
