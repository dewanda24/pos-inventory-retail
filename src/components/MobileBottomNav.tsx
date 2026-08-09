import React from 'react';
import { LayoutDashboard, ShoppingBag, Package, BookOpen, BarChart3, Store } from 'lucide-react';
import { UserRole } from '../types';

interface MobileBottomNavProps {
  role: UserRole;
  activeTab: string;
  setActiveTab?: (tab: string) => void;
  onSelectTab?: (tab: string) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ role, activeTab, setActiveTab, onSelectTab }) => {
  const handleSelect = (id: string) => {
    if (onSelectTab) onSelectTab(id);
    else if (setActiveTab) setActiveTab(id);
  };
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-t border-slate-200/50 dark:border-slate-800/50 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-around h-16 px-2 relative">
        {role === 'OWNER' && (
          <button
            onClick={() => handleSelect('dashboard')}
            className={`flex flex-col items-center justify-center w-14 h-full text-[10px] font-medium transition-colors ${
              activeTab === 'dashboard'
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
            }`}
          >
            <LayoutDashboard className="w-5 h-5 mb-0.5" />
            <span>Dashboard</span>
          </button>
        )}

        {role === 'KASIR' && (
          <button
            onClick={() => handleSelect('catalog')}
            className={`flex flex-col items-center justify-center w-14 h-full text-[10px] font-medium transition-colors ${
              activeTab === 'catalog'
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
            }`}
          >
            <Store className="w-5 h-5 mb-0.5" />
            <span>Katalog</span>
          </button>
        )}

        <button
          onClick={() => handleSelect('products')}
          className={`flex flex-col items-center justify-center w-14 h-full text-[10px] font-medium transition-colors ${
            activeTab === 'products'
              ? 'text-emerald-600 dark:text-emerald-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
          }`}
        >
          <Package className="w-5 h-5 mb-0.5" />
          <span>Produk</span>
        </button>

        {/* Center Floating Action Button (FAB) for POS Kasir */}
        {role === 'KASIR' && (
          <div className="relative -top-5">
            <button
              onClick={() => handleSelect('pos')}
              className={`w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-xl shadow-emerald-600/40 flex items-center justify-center transition-all duration-300 active:scale-95 ${
                activeTab === 'pos' ? 'ring-4 ring-emerald-200 dark:ring-emerald-950 scale-105' : 'hover:-translate-y-1'
              }`}
              title="Buka Kasir"
            >
              <ShoppingBag className="w-7 h-7" />
            </button>
          </div>
        )}

        {role === 'OWNER' && (
          <button
            onClick={() => handleSelect('inventory')}
            className={`flex flex-col items-center justify-center w-14 h-full text-[10px] font-medium transition-colors ${
              activeTab === 'inventory'
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <BookOpen className="w-5 h-5 mb-0.5" />
            <span>Inventory</span>
          </button>
        )}

        {role === 'OWNER' && (
          <button
            onClick={() => handleSelect('reports')}
            className={`flex flex-col items-center justify-center w-14 h-full text-[10px] font-medium transition-colors ${
              activeTab === 'reports'
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <BarChart3 className="w-5 h-5 mb-0.5" />
            <span>Laporan</span>
          </button>
        )}
      </div>
    </div>
  );
};
