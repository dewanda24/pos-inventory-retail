import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { LogIn, DollarSign, Loader2 } from 'lucide-react';
import { api } from '../../lib/api';
import { useAppData } from '../../context/AppDataContext';

interface StartShiftModalProps {
  onSuccess: () => void;
}

export const StartShiftModal: React.FC<StartShiftModalProps> = ({ onSuccess }) => {
  const [startingCash, setStartingCash] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { setCurrentShift } = useAppData();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(startingCash.replace(/\D/g, ''), 10);
    if (isNaN(amount) || amount < 0) {
      setError('Masukkan nominal awal yang valid.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      const shift = await api.startShift(amount);
      setCurrentShift(shift);
      toast.success('Shift kasir berhasil dibuka');
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Gagal membuka kasir');
      toast.error(err.message || 'Gagal membuka kasir');
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
        className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
      >
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
        >
        <div className="p-6 text-center border-b border-slate-100 dark:border-slate-800">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white">Buka Shift Kasir</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Silakan masukkan jumlah uang tunai fisik yang ada di dalam laci kasir saat ini sebagai modal awal.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-sm font-bold rounded-xl text-center">
              {error}
            </div>
          )}
          
          <div className="mb-6">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Modal Awal (Rp)</label>
            <div className="relative">
              <DollarSign className="absolute left-4 top-3.5 w-6 h-6 text-slate-400" />
              <input
                type="text"
                autoFocus
                value={formatCurrency(startingCash)}
                onChange={(e) => setStartingCash(e.target.value)}
                placeholder="0"
                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:border-emerald-500 focus:outline-none dark:text-white text-xl font-black transition-colors"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !startingCash}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-lg transition-colors flex items-center justify-center disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Buka Kasir Sekarang'}
          </button>
        </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
