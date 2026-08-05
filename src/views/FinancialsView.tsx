import React, { useState } from 'react';
import {
  DollarSign,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
  PieChart,
  Calendar,
  AlertCircle,
  Trash2
} from 'lucide-react';
import { Expense, ExpenseCategory } from '../types';
import { api } from '../lib/api';

interface FinancialsViewProps {
  expenses: Expense[];
  expenseCategories: ExpenseCategory[];
  totalGrossProfit: number;
  onRefresh: () => void;
}

export const FinancialsView: React.FC<FinancialsViewProps> = ({
  expenses,
  expenseCategories,
  totalGrossProfit,
  onRefresh
}) => {
  const [showModal, setShowModal] = useState(false);
  const [categoryId, setCategoryId] = useState(expenseCategories[0]?.id || '');
  const [type, setType] = useState<'KAS_KELUAR' | 'KAS_MASUK'>('KAS_KELUAR');
  const [amount, setAmount] = useState<number>(100000);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Calculations
  const totalKasKeluar = expenses
    .filter((e) => e.type === 'KAS_KELUAR')
    .reduce((acc, e) => acc + e.amount, 0);

  const totalKasMasukLain = expenses
    .filter((e) => e.type === 'KAS_MASUK')
    .reduce((acc, e) => acc + e.amount, 0);

  const netProfit = totalGrossProfit + totalKasMasukLain - totalKasKeluar;

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      setErrorMsg('Jumlah nominal harus lebih besar dari 0');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      await api.createExpense({
        categoryId,
        type,
        amount,
        description,
        date
      });
      onRefresh();
      setShowModal(false);
      setDescription('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan transaksi kas');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExpense = async (id: string, desc: string) => {
    if (!confirm(`Hapus catatan arus kas "${desc}"?`)) return;
    try {
      await api.deleteExpense(id);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus catatan kas.');
    }
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-emerald-600" />
            <span>Manajemen Keuangan & Kas Toko</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Catat pengeluaran operasional (listrik, gaji, sewa) dan pantau estimasi Laba Bersih Toko.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/30 flex items-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Catat Kas Masuk / Keluar</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Total Pengeluaran Kas (Beban)</span>
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
              <ArrowDownRight className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-2">
            Rp {totalKasKeluar.toLocaleString('id-ID')}
          </h3>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Laba Kotor Penjualan</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            Rp {totalGrossProfit.toLocaleString('id-ID')}
          </h3>
        </div>

        <div className="p-5 bg-gradient-to-br from-emerald-600 to-emerald-800 text-white rounded-2xl shadow-lg">
          <span className="text-xs font-bold text-emerald-100">Estimasi Laba Bersih Toko</span>
          <h3 className="text-2xl font-black mt-2">
            Rp {netProfit.toLocaleString('id-ID')}
          </h3>
          <p className="text-[10px] text-emerald-200 mt-1">Laba Kotor &minus; Beban Operasional</p>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 font-bold text-sm text-slate-900 dark:text-white">
          Riwayat Kas Masuk & Kas Keluar
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="p-3">No. Dokumen</th>
                <th className="p-3">Tanggal</th>
                <th className="p-3">Kategori</th>
                <th className="p-3">Tipe</th>
                <th className="p-3">Keterangan / Deskripsi</th>
                <th className="p-3 text-right">Nominal (Rp)</th>
                <th className="p-3">Petugas</th>
                <th className="p-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {expenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="p-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {exp.docNo}
                  </td>
                  <td className="p-3 text-slate-500">{exp.date}</td>
                  <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">{exp.categoryName}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        exp.type === 'KAS_KELUAR'
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}
                    >
                      {exp.type}
                    </span>
                  </td>
                  <td className="p-3 text-slate-600 dark:text-slate-300">{exp.description}</td>
                  <td
                    className={`p-3 text-right font-extrabold ${
                      exp.type === 'KAS_KELUAR' ? 'text-rose-600' : 'text-emerald-600'
                    }`}
                  >
                    {exp.type === 'KAS_KELUAR' ? '-' : '+'} Rp {exp.amount.toLocaleString('id-ID')}
                  </td>
                  <td className="p-3 text-slate-500">{exp.userName}</td>
                  <td className="p-3 text-center">
                    <button
                      type="button"
                      onClick={() => handleDeleteExpense(exp.id, exp.description)}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-lg transition-colors"
                      title="Hapus Catatan Kas"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Transaction Entry */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold">Pencatatan Transaksi Kas</h3>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-slate-800 rounded text-slate-400">
                Tutup
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="p-6 space-y-4 text-xs">
              {errorMsg && <p className="text-rose-600 font-bold">{errorMsg}</p>}

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tipe Transaksi</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setType('KAS_KELUAR')}
                    className={`py-2 text-xs font-bold rounded-xl border ${
                      type === 'KAS_KELUAR'
                        ? 'bg-rose-600 text-white border-rose-600'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    Kas Keluar (Beban)
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('KAS_MASUK')}
                    className={`py-2 text-xs font-bold rounded-xl border ${
                      type === 'KAS_MASUK'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    Kas Masuk (Lain)
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Kategori Pengeluaran</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl dark:text-white"
                >
                  {expenseCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nominal (Rp)</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono font-bold text-sm dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Deskripsi / Keterangan</label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Contoh: Pembayaran Token Listrik & Air bulan ini"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl dark:text-white"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg transition-all"
              >
                {loading ? 'Menyimpan...' : 'Simpan Transaksi Kas'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
