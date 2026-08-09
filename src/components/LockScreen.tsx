import React, { useState } from 'react';
import { Lock, Unlock, Delete } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { toast } from 'sonner';

export const LockScreen: React.FC = () => {
  const { currentUser, unlockScreen } = useAuth();
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);

  const handleNumpadClick = (num: string) => {
    if (pin.length < 6) {
      setPin(prev => prev + num);
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!pin) return;
    
    setLoading(true);
    try {
      await api.verifyPin(pin);
      toast.success('Sesi berhasil dibuka');
      unlockScreen();
    } catch (err: any) {
      toast.error(err.message || 'PIN salah');
      setPin('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-xl"
      >
        <div className="w-full max-w-sm mx-auto p-6 flex flex-col items-center">
          <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6">
            <Lock className="w-10 h-10 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">POS Terkunci</h2>
          <p className="text-slate-400 text-center mb-8">
            Silakan masukkan PIN untuk melanjutkan sesi kasir <strong>{currentUser?.name}</strong>
          </p>

          <form onSubmit={handleSubmit} className="w-full">
            <div className="flex justify-center gap-3 mb-8">
              {[...Array(6)].map((_, i) => (
                <div 
                  key={i} 
                  className={`w-4 h-4 rounded-full transition-all ${i < pin.length ? 'bg-emerald-500 scale-110 shadow-[0_0_10px_rgba(16,185,129,0.8)]' : 'bg-slate-700'}`} 
                />
              ))}
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleNumpadClick(num.toString())}
                  className="h-16 rounded-2xl bg-slate-800/50 hover:bg-slate-700 text-2xl font-bold text-white shadow-lg transition-colors border border-slate-700"
                >
                  {num}
                </button>
              ))}
              <button
                type="button"
                onClick={handleBackspace}
                className="h-16 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-xl font-bold text-rose-500 shadow-lg transition-colors border border-rose-500/20 flex items-center justify-center"
              >
                <Delete className="w-6 h-6" />
              </button>
              <button
                type="button"
                onClick={() => handleNumpadClick('0')}
                className="h-16 rounded-2xl bg-slate-800/50 hover:bg-slate-700 text-2xl font-bold text-white shadow-lg transition-colors border border-slate-700"
              >
                0
              </button>
              <button
                type="submit"
                disabled={loading || pin.length === 0}
                className="h-16 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-xl font-bold text-white shadow-lg shadow-emerald-900/50 transition-colors border border-emerald-500 flex items-center justify-center"
              >
                {loading ? <span className="animate-spin text-2xl">⏳</span> : <Unlock className="w-6 h-6" />}
              </button>
            </div>
            
            <p className="text-center text-slate-500 text-xs">
              Lupa PIN? Silakan hubungi Owner Toko.
            </p>
          </form>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
