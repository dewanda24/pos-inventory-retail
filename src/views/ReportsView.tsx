import React, { useState } from 'react';
import {
  BarChart3,
  Calendar,
  Download,
  Printer,
  FileSpreadsheet,
  FileText,
  DollarSign,
  ShoppingBag,
  TrendingUp,
  User,
  Filter
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Sale, Product, User as UserType } from '../types';

interface ReportsViewProps {
  sales: Sale[];
  products: Product[];
  users: UserType[];
}

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export const ReportsView: React.FC<ReportsViewProps> = ({ sales, products, users }) => {
  const [dateRange, setDateRange] = useState<'today' | '7days' | '30days' | 'all'>('7days');
  const [selectedCashier, setSelectedCashier] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter sales
  const filteredSales = sales.filter((s) => {
    // Only filtering by cashier and date for KPIs, but for table we also use search
    if (s.status !== 'COMPLETED') return false;
    if (selectedCashier !== 'ALL' && s.userId !== selectedCashier) return false;
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!s.invoiceNo.toLowerCase().includes(q) && !(s.customerName || '').toLowerCase().includes(q)) {
        return false;
      }
    }

    const saleDate = new Date(s.createdAt).getTime();
    const now = Date.now();

    if (dateRange === 'today') {
      const todayStart = new Date().setHours(0, 0, 0, 0);
      return saleDate >= todayStart;
    } else if (dateRange === '7days') {
      return saleDate >= now - 7 * 86400000;
    } else if (dateRange === '30days') {
      return saleDate >= now - 30 * 86400000;
    }
    return true;
  });

  // Aggregations
  const totalOmzet = filteredSales.reduce((acc, s) => acc + s.finalAmount, 0);
  const totalCostOfGoods = filteredSales.reduce(
    (acc, s) => acc + s.items.reduce((iAcc, item) => iAcc + item.qty * item.buyPrice, 0),
    0
  );
  const totalGrossProfit = totalOmzet - totalCostOfGoods;
  const totalItemsSold = filteredSales.reduce(
    (acc, s) => acc + s.items.reduce((iAcc, item) => iAcc + item.qty, 0),
    0
  );

  // Cashier Breakdown
  const cashierMap: Record<string, { name: string; omzet: number; count: number }> = {};
  filteredSales.forEach((s) => {
    if (!cashierMap[s.userId]) {
      cashierMap[s.userId] = { name: s.userName, omzet: 0, count: 0 };
    }
    cashierMap[s.userId].omzet += s.finalAmount;
    cashierMap[s.userId].count += 1;
  });
  const cashierData = Object.values(cashierMap);

  // Category Share
  const categoryMap: Record<string, number> = {};
  filteredSales.forEach((s) => {
    s.items.forEach((item) => {
      const prod = products.find((p) => p.id === item.productId);
      const catName = prod?.categoryName || 'Umum';
      categoryMap[catName] = (categoryMap[catName] || 0) + item.subtotal;
    });
  });
  const categoryData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));

  const handlePrintReport = () => {
    window.print();
  };

  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,No. Nota,Tanggal,Kasir,Pelanggan,Metode,Total Tagihan\n';
    filteredSales.forEach((s) => {
      csvContent += `${s.invoiceNo},${s.date},${s.userName},${s.customerName || 'Umum'},${s.paymentMethod},${s.finalAmount}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `laporan_penjualan_${dateRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header & Export Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-emerald-600" />
            <span>Laporan Penjualan & Performa Kasir</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Analisis omzet, marjin laba kotor, item terlaris, dan kinerja per transaksi kasir.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Excel / CSV</span>
          </button>
          <button
            onClick={handlePrintReport}
            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / Print</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3 no-print">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Rentang Waktu:</span>
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            {(['today', '7days', '30days', 'all'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setDateRange(r)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  dateRange === r
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {r === 'today' ? 'Hari Ini' : r === '7days' ? '7 Hari' : r === '30days' ? '30 Hari' : 'Semua'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Filter Kasir:</span>
          <select
            value={selectedCashier}
            onChange={(e) => setSelectedCashier(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl dark:text-white"
          >
            <option value="ALL">Semua Kasir</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.role})
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Cari No. Nota atau Pelanggan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:border-emerald-500 dark:text-white"
          />
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-medium text-slate-500">Total Omzet Penjualan</p>
          <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
            Rp {totalOmzet.toLocaleString('id-ID')}
          </h3>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-medium text-slate-500">Estimasi Laba Kotor</p>
          <h3 className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            Rp {totalGrossProfit.toLocaleString('id-ID')}
          </h3>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-medium text-slate-500">Total Transaksi Selesai</p>
          <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
            {filteredSales.length} Nota
          </h3>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-medium text-slate-500">Total Produk Terjual</p>
          <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
            {totalItemsSold} Pcs
          </h3>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 no-print">
        {/* Cashier Performance Bar Chart */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Performa Omzet Per Kasir</h3>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cashierData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip formatter={(value: any) => [`Rp ${Number(value).toLocaleString('id-ID')}`, 'Omzet']} />
                <Bar dataKey="omzet" fill="#4f46e5" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Share Pie Chart */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Kontribusi Kategori Kategori Produk</h3>
          <div className="h-60 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={(entry) => entry.name}
                >
                  {categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => [`Rp ${Number(value).toLocaleString('id-ID')}`, 'Omzet']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed Sales Transactions Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 font-bold text-sm text-slate-900 dark:text-white">
          Rincian Riwayat Transaksi Penjualan
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="p-3">No. Nota</th>
                <th className="p-3">Waktu</th>
                <th className="p-3">Pelanggan</th>
                <th className="p-3">Kasir</th>
                <th className="p-3">Metode</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Total Tagihan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredSales.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="p-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {s.invoiceNo}
                  </td>
                  <td className="p-3 text-slate-500">
                    {new Date(s.createdAt).toLocaleString('id-ID')}
                  </td>
                  <td className="p-3 text-slate-600 dark:text-slate-400">{s.customerName || 'Umum'}</td>
                  <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">{s.userName}</td>
                  <td className="p-3 font-bold text-slate-700 dark:text-slate-300">{s.paymentMethod}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400">
                      Selesai
                    </span>
                  </td>
                  <td className="p-3 text-right font-extrabold text-emerald-600 dark:text-emerald-400">
                    Rp {s.finalAmount.toLocaleString('id-ID')}
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
