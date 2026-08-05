import React, { useState } from 'react';
import { Bell, ChevronRight, LogOut } from 'lucide-react';
import { User } from '../../types';

interface POSHeaderProps {
  user: User;
  onLogout?: () => void;
  onQuickSwitchUser?: (username: string) => void;
}

export const POSHeader: React.FC<POSHeaderProps> = ({ user, onLogout, onQuickSwitchUser }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between shadow-xs">
      {/* Left: Breadcrumb */}
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
        <span className="text-emerald-600 dark:text-emerald-400">POS</span>
        <ChevronRight className="w-4 h-4 text-slate-400" />
        <span>Kasir</span>
      </div>

      {/* Center: Keyboard Shortcuts Guide */}
      <div className="hidden lg:flex items-center gap-4 text-[11px] font-medium text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1.5"><kbd className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 font-mono text-slate-600 dark:text-slate-300 shadow-xs">F2</kbd> Cari</div>
        <div className="flex items-center gap-1.5"><kbd className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 font-mono text-slate-600 dark:text-slate-300 shadow-xs">F4</kbd> Scan</div>
        <div className="flex items-center gap-1.5"><kbd className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 font-mono text-slate-600 dark:text-slate-300 shadow-xs">F8</kbd> Pelanggan</div>
        <div className="flex items-center gap-1.5"><kbd className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 font-mono text-slate-600 dark:text-slate-300 shadow-xs">F9</kbd> Diskon</div>
        <div className="flex items-center gap-1.5"><kbd className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 font-mono text-slate-600 dark:text-slate-300 shadow-xs">F10</kbd> Bayar</div>
        <div className="flex items-center gap-1.5"><kbd className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 font-mono text-slate-600 dark:text-slate-300 shadow-xs">ESC</kbd> Batal</div>
      </div>

      {/* Right: User Profile */}
      <div className="flex items-center gap-4">
        <button className="relative text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
        </button>

        <div className="relative">
          <button 
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-700 hover:opacity-80 transition-opacity text-left"
          >
            <div className="hidden sm:block">
              <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{user.name}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold text-right">{user.role}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center border border-emerald-200 dark:border-emerald-800 overflow-hidden">
              <img src={user.avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${user.username}`} alt="avatar" className="w-9 h-9 object-cover" />
            </div>
          </button>

          {/* User Dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-50 text-xs">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700">
                <p className="font-bold text-slate-900 dark:text-white">{user.name}</p>
                <p className="text-[10px] text-slate-400">@{user.username} • {user.role}</p>
              </div>

              {onQuickSwitchUser && (
                <div className="px-3 py-2 bg-slate-50 dark:bg-slate-800/50 my-1 space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Demo Switch</p>
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onQuickSwitchUser('owner');
                      }}
                      className={`flex-1 py-1 text-[10px] font-bold rounded border ${
                        user.role === 'OWNER'
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      Owner
                    </button>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onQuickSwitchUser('kasir');
                      }}
                      className={`flex-1 py-1 text-[10px] font-bold rounded border ${
                        user.role === 'KASIR'
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      Kasir
                    </button>
                  </div>
                </div>
              )}

              {onLogout && (
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
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
