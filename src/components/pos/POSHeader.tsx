import React, { useState } from 'react';
import { Bell, ChevronRight, LogOut, Lock, Store, ReceiptText } from 'lucide-react';
import { User } from '../../types';

interface POSHeaderProps {
  user: User;
  onLogout?: () => void;
  onCloseShift?: () => void;
  onLockScreen?: () => void;
  onShowQR?: () => void;
  onShowHistory?: () => void;
  onShowPendingOrders?: () => void;
  pendingOrdersCount?: number;
}

export const POSHeader: React.FC<POSHeaderProps> = ({ user, onLogout, onCloseShift, onLockScreen, onShowQR, onShowHistory, onShowPendingOrders, pendingOrdersCount = 0 }) => {
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
        {/* Desktop Action Buttons */}
        <div className="hidden lg:flex items-center gap-4">
          {onShowPendingOrders && (
            <button 
              onClick={onShowPendingOrders}
              className="relative flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-600 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:hover:bg-amber-900/40 rounded-lg text-sm font-bold border border-amber-200 dark:border-amber-800 transition-colors"
              title="Pesanan Online (Self-Order)"
            >
              <Bell className="w-4 h-4" />
              <span>Pesanan</span>
              {pendingOrdersCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-slate-900">
                  {pendingOrdersCount}
                </span>
              )}
            </button>
          )}
          {onShowHistory && (
            <button 
              onClick={onShowHistory}
              className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 dark:hover:bg-indigo-900/40 rounded-lg text-sm font-bold border border-indigo-200 dark:border-indigo-800 transition-colors"
              title="Riwayat Transaksi"
            >
              <ReceiptText className="w-4 h-4" />
              <span>Riwayat</span>
            </button>
          )}
          {onShowQR && (
            <button 
              onClick={onShowQR}
              className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/40 rounded-lg text-sm font-bold border border-emerald-200 dark:border-emerald-800 transition-colors"
              title="Tampilkan QR Katalog Pelanggan"
            >
              <Store className="w-4 h-4" />
              <span>QR Katalog</span>
            </button>
          )}
          {onCloseShift && (
            <button 
              onClick={onCloseShift}
              className="flex items-center gap-2 px-4 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:hover:bg-rose-900/40 rounded-lg text-sm font-bold border border-rose-200 dark:border-rose-800 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Tutup Kasir
            </button>
          )}
          {onLockScreen && (
            <button 
              onClick={onLockScreen}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 rounded-lg text-sm font-bold border border-slate-200 dark:border-slate-700 transition-colors"
              title="Kunci Layar (PIN)"
            >
              <Lock className="w-4 h-4" />
              <span>Kunci</span>
            </button>
          )}
        </div>

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
