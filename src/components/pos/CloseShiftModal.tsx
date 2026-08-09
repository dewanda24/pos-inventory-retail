import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { LogOut, DollarSign, Loader2, Calculator } from 'lucide-react';
import { api } from '../../lib/api';
import { useAppData } from '../../context/AppDataContext';
import { CashierShift, Sale } from '../../types';

interface CloseShiftModalProps {
  onClose: () => void;
  onSuccess: () => void;
  shift: CashierShift;
  sales: Sale[];
}

export const CloseShiftModal: React.FC<CloseShiftModalProps> = ({ onClose, onSuccess, shift, sales }) => {
  const [actualEndingCash, setActualEndingCash] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const cashSales = sales.filter(s => s.shiftId === shift.id && s.paymentMethod === 'CASH' && s.status === 'COMPLETED');
  const totalCashSales = cashSales.reduce((acc, s) => acc + s.finalAmount, 0);
  const expectedCash = shift.startingCash + totalCashSales;

  const actualCashNum = parseInt(actualEndingCash.replace(/\D/g, ''), 10);
  const difference = isNaN(actualCashNum) ? 0 : actualCashNum - expectedCash;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isNaN(actualCashNum) || actualCashNum < 0) {
      setError('Masukkan nominal aktual yang valid.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      await api.closeShift(shift.id, actualCashNum, notes);
      toast.success('Kasir berhasil ditutup dan laporan tersimpan');
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Gagal menutup kasir');
      toast.error(err.message || 'Gagal menutup kasir');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (val: string) => {
    const num = parseInt(val.replace(/\D/g, ''), 10);
    return isNaN(num) ? '' : num.toLocaleString('id-ID');
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
      >
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl"
        >
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-rose-50 dark:bg-rose-900/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-full flex items-center justify-center">
              <LogOut className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 dark:text-white">Tutup Kasir</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Rekapitulasi Shift: {new Date(shift.startTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} - Sekarang</p>
            </div>
          </div>
        </div>

        <div className="p-6 grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-bold mb-1">Modal Awal</p>
            <p className="text-lg font-black text-slate-700 dark:text-slate-300">Rp {shift.startingCash.toLocaleString('id-ID')}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-bold mb-1">Total Pemasukan Tunai</p>
            <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">+ Rp {totalCashSales.toLocaleString('id-ID')}</p>
          </div>
          <div className="col-span-2 mt-2 pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-bold">
              <Calculator className="w-5 h-5 text-indigo-500" />
              <span>Harapan Uang Fisik di Laci:</span>
            </div>
            <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
              Rp {expectedCash.toLocaleString('id-ID')}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-sm font-bold rounded-xl text-center">
              {error}
            </div>
          )}
          
          <div className="mb-4">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Uang Fisik Aktual (Hitung di Laci)</label>
            <div className="relative">
              <DollarSign className="absolute left-4 top-3.5 w-6 h-6 text-slate-400" />
              <input
                type="text"
                autoFocus
                value={formatCurrency(actualEndingCash)}
                onChange={(e) => setActualEndingCash(e.target.value)}
                placeholder="0"
                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:border-emerald-500 focus:outline-none dark:text-white text-xl font-black transition-colors"
                required
              />
            </div>
          </div>

          {!isNaN(actualCashNum) && actualEndingCash !== '' && difference !== 0 && (
            <div className={`mb-4 p-4 rounded-xl border-2 flex items-center justify-between ${
              difference > 0 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400' 
                : 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-400'
            }`}>
              <span className="font-bold">{difference > 0 ? 'Kelebihan Uang (Surplus)' : 'Kekurangan Uang (Minus)'}</span>
              <span className="text-xl font-black">{difference > 0 ? '+' : '-'} Rp {Math.abs(difference).toLocaleString('id-ID')}</span>
            </div>
          )}

          {!isNaN(actualCashNum) && actualEndingCash !== '' && difference !== 0 && (
            <div className="mb-6">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Catatan Selisih (Wajib)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={difference < 0 ? 'Alasan mengapa uang kurang...' : 'Alasan mengapa uang lebih...'}
                className="w-full p-3 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:border-rose-500 focus:outline-none dark:text-white transition-colors"
                required
                rows={2}
              />
            </div>
          )}

          <div className="flex gap-3 mt-8">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-3 px-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !actualEndingCash || (difference !== 0 && !notes.trim())}
              className="flex-1 py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-black transition-colors flex items-center justify-center disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Selesaikan Shift'}
            </button>
          </div>
        </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
