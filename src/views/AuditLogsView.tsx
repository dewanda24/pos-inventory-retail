import React, { useState } from 'react';
import { ShieldCheck, Search, Calendar, User as UserIcon } from 'lucide-react';
import { AuditLog } from '../types';

interface AuditLogsViewProps {
  logs: AuditLog[];
}

export const AuditLogsView: React.FC<AuditLogsViewProps> = ({ logs }) => {
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('ALL');

  const filtered = logs.filter((l) => {
    const matchMod = moduleFilter === 'ALL' || l.module === moduleFilter;
    const q = search.toLowerCase().trim();
    const matchQ =
      !q ||
      l.userName.toLowerCase().includes(q) ||
      l.details.toLowerCase().includes(q) ||
      l.action.toLowerCase().includes(q);
    return matchMod && matchQ;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-emerald-600" />
          <span>Audit Log Aktivitas Sistem</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Catatan Jejak Digital Audit Seluruh Aktivitas Pengguna (Login, Transaksi, Edit Stok, Opname).
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari kata kunci di audit log..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none dark:text-white"
          />
        </div>

        <select
          value={moduleFilter}
          onChange={(e) => setModuleFilter(e.target.value)}
          className="px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl dark:text-white"
        >
          <option value="ALL">Semua Modul</option>
          <option value="AUTH">Authentication</option>
          <option value="POS">POS / Kasir</option>
          <option value="PRODUCTS">Master Produk</option>
          <option value="INVENTORY">Inventory / Goods In</option>
          <option value="STOCK_OPNAME">Stock Opname</option>
          <option value="FINANCIAL">Keuangan</option>
          <option value="USERS">User Management</option>
          <option value="SETTINGS">Settings</option>
        </select>
      </div>

      {/* Audit Log Timeline Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="p-3">Waktu</th>
                <th className="p-3">Pengguna</th>
                <th className="p-3">Modul</th>
                <th className="p-3">Aksi</th>
                <th className="p-3">Rincian Aktivitas</th>
                <th className="p-3">IP / Device</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="p-3 text-slate-500 font-mono">
                    {new Date(log.timestamp).toLocaleString('id-ID')}
                  </td>
                  <td className="p-3">
                    <p className="font-bold text-slate-900 dark:text-white">{log.userName}</p>
                    <span className="text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded">
                      {log.userRole}
                    </span>
                  </td>
                  <td className="p-3 font-bold text-emerald-600 dark:text-emerald-400">{log.module}</td>
                  <td className="p-3 font-mono font-bold text-slate-800 dark:text-slate-200">{log.action}</td>
                  <td className="p-3 text-slate-700 dark:text-slate-300 max-w-xs">{log.details}</td>
                  <td className="p-3 text-[10px] text-slate-400 font-mono">
                    <p>{log.ip || '127.0.0.1'}</p>
                    <p>{log.device || 'Web'}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
