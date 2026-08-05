import React from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Boxes,
  BookOpen,
  ClipboardCheck,
  BarChart3,
  DollarSign,
  Truck,
  History,
  Users,
  Settings,
  ShieldCheck,
  AlertTriangle,
  Store
} from 'lucide-react';
import { UserRole } from '../types';

interface SidebarProps {
  user?: import('../types').User | null;
  role: UserRole;
  activeTab: string;
  setActiveTab?: (tab: string) => void;
  onSelectTab?: (tab: string) => void;
  lowStockCount?: number;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
  roles: UserRole[];
  category?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ user, role, activeTab, setActiveTab, onSelectTab, lowStockCount = 0 }) => {
  const handleSelect = (id: string) => {
    if (onSelectTab) onSelectTab(id);
    else if (setActiveTab) setActiveTab(id);
  };

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard Overview',
      icon: LayoutDashboard,
      roles: ['OWNER'],
      category: 'MAIN MENU'
    },
    {
      id: 'pos',
      label: 'POS / Kasir',
      icon: ShoppingBag,
      roles: ['OWNER', 'KASIR'],
      category: 'MAIN MENU'
    },
    {
      id: 'catalog',
      label: 'Katalog Pelanggan',
      icon: Store,
      roles: ['OWNER', 'KASIR'],
      category: 'MAIN MENU'
    },
    {
      id: 'products',
      label: 'Katalog Produk',
      icon: Package,
      badge: lowStockCount > 0 ? lowStockCount : undefined,
      roles: ['OWNER', 'KASIR'],
      category: 'INVENTORY'
    },
    {
      id: 'inventory',
      label: 'Barang Masuk',
      icon: Boxes,
      roles: ['OWNER'],
      category: 'INVENTORY'
    },
    {
      id: 'ledger',
      label: 'Stock Ledger',
      icon: BookOpen,
      roles: ['OWNER'],
      category: 'INVENTORY'
    },
    {
      id: 'opname',
      label: 'Stock Opname',
      icon: ClipboardCheck,
      roles: ['OWNER', 'KASIR'],
      category: 'INVENTORY'
    },
    {
      id: 'reports',
      label: 'Laporan Penjualan',
      icon: BarChart3,
      roles: ['OWNER'],
      category: 'OPERATIONAL'
    },
    {
      id: 'financials',
      label: 'Keuangan & Kas',
      icon: DollarSign,
      roles: ['OWNER'],
      category: 'OPERATIONAL'
    },
    {
      id: 'suppliers',
      label: 'Supplier & Restock',
      icon: Truck,
      roles: ['OWNER'],
      category: 'OPERATIONAL'
    },
    {
      id: 'users',
      label: 'Pengelola User',
      icon: Users,
      roles: ['OWNER'],
      category: 'SYSTEM'
    },
    {
      id: 'audit-logs',
      label: 'Audit Log',
      icon: ShieldCheck,
      roles: ['OWNER'],
      category: 'SYSTEM'
    },
    {
      id: 'settings',
      label: 'Pengaturan Toko',
      icon: Settings,
      roles: ['OWNER'],
      category: 'SYSTEM'
    }
  ];

  const visibleItems = navItems.filter((item) => item.roles.includes(role));
  const categories = Array.from(new Set(visibleItems.map((item) => item.category || 'MENU')));

  return (
    <aside className="w-[220px] bg-[#0f172a] text-slate-200 flex-shrink-0 flex flex-col justify-between hidden md:flex border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div>
        <div className="p-4 flex items-center gap-3 border-b border-slate-800">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold shadow-xs">
            R
          </div>
          <span className="font-bold text-base tracking-tight text-white">
            RETAIL<span className="text-emerald-500">OS</span>
          </span>
        </div>

        {/* Navigation Categories & Links */}
        <nav className="p-3 space-y-4 overflow-y-auto max-h-[calc(100vh-280px)] scrollbar-none">
          {categories.map((cat) => (
            <div key={cat} className="space-y-1">
              <div className="text-[10px] font-bold text-slate-500 uppercase px-3 py-1 tracking-wider">
                {cat}
              </div>
              {visibleItems
                .filter((item) => item.category === cat)
                .map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-emerald-900/40 text-emerald-400 font-semibold border border-emerald-800/50'
                          : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                        <span>{item.label}</span>
                      </div>

                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1">
                          <AlertTriangle className="w-2.5 h-2.5" />
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
            </div>
          ))}
        </nav>
      </div>

      {/* Role & Shift Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/50 space-y-4">
        {activeTab === 'pos' && (
          <div className="space-y-2 bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
            <div className="flex items-center gap-2 text-xs mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-bold text-slate-200">Shift Aktif</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                <img src={user?.avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${user?.username || 'user'}`} alt="avatar" className="w-8 h-8 rounded-full" />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate">{user?.name || 'Kasir'}</p>
                <p className="text-[10px] text-emerald-400 font-medium truncate">Mulai 08:02</p>
              </div>
            </div>
            <div className="mt-3 bg-slate-800/80 rounded-lg p-2 border border-slate-700">
              <p className="text-[10px] text-slate-400 font-semibold mb-1">Modal Awal Shift</p>
              <p className="text-xs font-bold text-white">Rp 500.000</p>
            </div>
            <button className="w-full py-1.5 mt-2 border border-slate-600 hover:border-slate-500 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition-colors">
              Tutup Shift
            </button>
          </div>
        )}

        {/* User Info */}
        {!activeTab.includes('pos') && (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
              <img src={user?.avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${user?.username || 'user'}`} alt="avatar" className="w-8 h-8 rounded-full" />
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="text-xs font-bold truncate text-white">
                {user?.name || 'User'}
              </div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">
                {role}
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span className="text-[10px] text-slate-400">Online • Data tersimpan</span>
        </div>
      </div>
    </aside>
  );
};
