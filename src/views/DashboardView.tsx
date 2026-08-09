import React from 'react';
import {
  DollarSign,
  ShoppingBag,
  Package,
  AlertTriangle,
  TrendingUp,
  ArrowUpRight,
  Boxes,
  ShieldCheck,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar
} from 'recharts';
import { DashboardSummary, UserRole } from '../types';

interface DashboardViewProps {
  summary: DashboardSummary | null;
  role: UserRole;
  onNavigateTab: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ summary, role, onNavigateTab }) => {
  if (!summary) {
    return (
      <div className="p-8 text-center text-slate-400">
        <Sparkles className="w-8 h-8 mx-auto mb-2 animate-spin text-emerald-500" />
        <p className="text-sm font-semibold">Memuat data realtime dashboard...</p>
      </div>
    );
  }

  // Calculate dynamic omzet percentage
  const yesterday = summary.yesterdayOmzet || 0;
  const today = summary.todayOmzet || 0;
  let omzetPercent = 0;
  if (yesterday > 0) {
    omzetPercent = ((today - yesterday) / yesterday) * 100;
  } else if (today > 0) {
    omzetPercent = 100;
  }
  const isPositive = omzetPercent >= 0;
  const percentStr = `${isPositive ? '+' : ''}${omzetPercent.toFixed(1)}%`;

  return (
    <div className="space-y-5">
      {/* Top Banner - High Density Header Bar */}
      <div className="p-5 bg-slate-900 text-white rounded-xl border border-slate-800 shadow-xs relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="relative z-10">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30">
              RETAIL OS DASHBOARD
            </span>
            <span className="text-xs text-slate-400">• Realtime Sync</span>
          </div>
          <h1 className="text-xl font-bold mt-1 text-white">Ringkasan Operasional & Kinerja Store</h1>
          <p className="text-xs text-slate-300 mt-0.5 max-w-xl">
            Monitor otomatis omzet harian, transaksi kasir, mutasi stok, dan audit log secara akurat.
          </p>
        </div>

        <div className="flex gap-2 relative z-10">
          <button
            onClick={() => onNavigateTab('pos')}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-2xs transition-all flex items-center gap-1.5"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Buka POS Kasir</span>
          </button>
          <button
            onClick={() => onNavigateTab('reports')}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-lg border border-slate-700 transition-all"
          >
            Laporan Penjualan
          </button>
        </div>
      </div>

      {/* KPI Stats Grid - High Density 4 Columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Omzet Hari Ini */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                Omzet Hari Ini
              </p>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Rp {summary.todayOmzet.toLocaleString('id-ID')}
              </h3>
            </div>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <span className={`${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'} font-bold`}>
              {percentStr}
            </span> vs hari lalu • Realtime
          </div>
        </div>

        {/* Transaksi Hari Ini */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                Total Transaksi
              </p>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {summary.todayTransactionsCount} TRX
              </h3>
            </div>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-[10px] text-slate-500 dark:text-slate-400">
            {summary.todayItemsSold} pcs produk terjual hari ini
          </div>
        </div>

        {/* Stok Menipis Warning */}
        <div
          onClick={() => onNavigateTab('products')}
          className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/20 dark:bg-rose-950/10 shadow-2xs cursor-pointer hover:border-rose-400 transition-all group"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider mb-1">
                Stok Menipis
              </p>
              <h3 className="text-xl font-bold text-rose-700 dark:text-rose-300">
                {summary.lowStockCount} Produk
              </h3>
            </div>
            <div className="p-2 bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-300 rounded-lg">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-[10px] text-rose-600 dark:text-rose-400 font-bold underline flex items-center gap-1 group-hover:text-rose-700">
            <span>Lihat daftar restock</span>
            <ArrowUpRight className="w-3 h-3" />
          </div>
        </div>

        {/* Nilai Aset Stok */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                Aset Stok Modal
              </p>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Rp {summary.totalStockValue.toLocaleString('id-ID')}
              </h3>
            </div>
            <div className="p-2 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-lg">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-[10px] text-slate-500 dark:text-slate-400">
            {summary.totalProductsCount} jenis varian produk terdaftar
          </div>
        </div>
        {/* Financial KPI Row (Owner Only) */}
        {role === 'OWNER' && (
          <div className="bg-emerald-50 dark:bg-emerald-950/20 p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/50 shadow-2xs col-span-1 sm:col-span-2 lg:col-span-4 mt-2">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="font-bold text-sm text-emerald-800 dark:text-emerald-400">Ringkasan Laba/Rugi (Hari Ini)</h3>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-[10px] font-bold text-emerald-600/70 dark:text-emerald-400/70 uppercase tracking-wider mb-1">Laba Kotor</p>
                <p className="text-lg font-black text-emerald-700 dark:text-emerald-300">Rp {summary.todayGrossProfit.toLocaleString('id-ID')}</p>
              </div>
              <div className="border-l border-emerald-200 dark:border-emerald-800/50 pl-4">
                <p className="text-[10px] font-bold text-emerald-600/70 dark:text-emerald-400/70 uppercase tracking-wider mb-1">Pengeluaran</p>
                <p className="text-lg font-black text-rose-600 dark:text-rose-400">- Rp {summary.todayExpenses.toLocaleString('id-ID')}</p>
              </div>
              <div className="border-l border-emerald-200 dark:border-emerald-800/50 pl-4 bg-emerald-100/50 dark:bg-emerald-900/30 rounded-r-lg">
                <p className="text-[10px] font-bold text-emerald-800 dark:text-emerald-200 uppercase tracking-wider mb-1">Laba Bersih</p>
                <p className="text-xl font-black text-emerald-700 dark:text-emerald-300">Rp {summary.todayNetProfit.toLocaleString('id-ID')}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mid Section: Chart & Top Products Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Sales Trend Chart */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Grafik Penjualan & Laba Mingguan</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">7 Hari Terakhir</p>
            </div>
            <div className="flex gap-2">
              <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-md border border-indigo-200 dark:border-indigo-800 flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-indigo-500"></div> Omzet
              </span>
              {role === 'OWNER' && (
                <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Laba Bersih
                </span>
              )}
            </div>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={summary.salesChartData}>
                <defs>
                  <linearGradient id="colorOmzet" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                <YAxis
                  tick={{ fontSize: 10 }}
                  stroke="#94a3b8"
                  tickFormatter={(v) => `${v / 1000}k`}
                />
                <Tooltip
                  formatter={(value: any, name: string) => [`Rp ${Number(value).toLocaleString('id-ID')}`, name === 'omzet' ? 'Omzet' : 'Laba Bersih']}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '11px' }}
                />
                <Area
                  type="monotone"
                  dataKey="omzet"
                  stroke="#4f46e5"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorOmzet)"
                />
                {role === 'OWNER' && (
                  <Area
                    type="monotone"
                    dataKey="netProfit"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorProfit)"
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products / Restock Alert Card */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Produk Terlaris</h4>
              <button
                onClick={() => onNavigateTab('reports')}
                className="text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
              >
                Lihat Laporan
              </button>
            </div>

            <div className="space-y-2.5 overflow-y-auto max-h-[220px] pr-1">
              {summary.topSellingProducts.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">Belum ada data penjualan.</p>
              ) : (
                summary.topSellingProducts.map((p, idx) => (
                  <div
                    key={p.productId}
                    className="p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-lg flex items-center justify-between border border-slate-100 dark:border-slate-800"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] flex items-center justify-center">
                        #{idx + 1}
                      </span>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{p.name}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">{p.qtySold} pcs terjual</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      Rp {p.totalOmzet.toLocaleString('id-ID')}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('suppliers')}
            className="w-full mt-3 py-2 text-xs font-bold border border-dashed border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
          >
            + Restock Purchase Order
          </button>
        </div>
      </div>

      {/* Bottom Section: System Logs & Stock Ledger */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">Aktivitas Sistem & Stock Ledger</h4>
          </div>
          <button
            onClick={() => onNavigateTab('audit-logs')}
            className="text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
          >
            Lihat Seluruh Audit Log
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
              <tr>
                <th className="px-5 py-2.5">Waktu</th>
                <th className="px-5 py-2.5">User</th>
                <th className="px-5 py-2.5">Aktivitas</th>
                <th className="px-5 py-2.5">Detail Catatan</th>
                <th className="px-5 py-2.5 text-right">Status Ledger</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {summary.recentLogs.slice(0, 5).map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="px-5 py-2.5 font-mono text-slate-500 dark:text-slate-400 text-[11px]">
                    {new Date(log.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td className="px-5 py-2.5 font-semibold text-slate-900 dark:text-white">
                    {log.userName}
                  </td>
                  <td className="px-5 py-2.5 text-slate-700 dark:text-slate-300">
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-5 py-2.5 text-slate-600 dark:text-slate-400 max-w-xs truncate">
                    {log.details}
                  </td>
                  <td className="px-5 py-2.5 text-right">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold">
                      SYNCED
                    </span>
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
