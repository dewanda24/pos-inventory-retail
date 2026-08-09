import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ReceiptText, Clock, CreditCard, AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Sale } from '../../types';
import { api } from '../../lib/api';

interface TransactionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  sales: Sale[];
  userId: string;
  onViewReceipt: (sale: Sale) => void;
  onRefresh?: () => void;
}

export const TransactionHistoryModal: React.FC<TransactionHistoryModalProps> = ({ 
  isOpen, 
  onClose, 
  sales, 
  userId,
  onViewReceipt,
  onRefresh
}) => {
  const [voidingSaleId, setVoidingSaleId] = useState<string | null>(null);
  const [pinInput, setPinInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleVoid = async (sale: Sale) => {
    if (!pinInput) {
      toast.error('Masukkan PIN Owner untuk membatalkan transaksi.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await api.voidSale(sale.id, pinInput);
      toast.success('Transaksi berhasil dibatalkan dan stok telah dikembalikan.');
      setVoidingSaleId(null);
      setPinInput('');
      if (onRefresh) onRefresh();
    } catch (err: any) {
      toast.error(err.message || 'Gagal membatalkan transaksi');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter today's sales for this user
  const today = new Date().toISOString().slice(0, 10);
  const myTodaySales = sales.filter(s => 
    s.userId === userId && 
    s.createdAt.startsWith(today)
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[85vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <ReceiptText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-800 dark:text-white leading-tight">
                  Riwayat Transaksi Saya
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Transaksi yang Anda lakukan hari ini
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 bg-slate-50 dark:bg-slate-950">
            {myTodaySales.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 py-12">
                <ReceiptText className="w-16 h-16 mb-4 opacity-20" />
                <p className="text-lg font-bold text-slate-600 dark:text-slate-300">Belum ada transaksi</p>
                <p className="text-sm">Anda belum melakukan transaksi hari ini.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {myTodaySales.map((sale) => (
                  <div key={sale.id} className="flex flex-col">
                    <div 
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-colors"
                    >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 shrink-0">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-slate-900 dark:text-white">{sale.invoiceNo}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            sale.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                          }`}>
                            {sale.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {new Date(sale.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span>{sale.items.length} Item</span>
                          <span>{sale.paymentMethod}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-0 border-slate-100 dark:border-slate-800 pt-3 sm:pt-0 mt-3 sm:mt-0">
                      <div className="text-right">
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Harga</p>
                        <p className="text-base font-bold text-indigo-600 dark:text-indigo-400">
                          Rp {sale.finalAmount.toLocaleString('id-ID')}
                        </p>
                      </div>
                      <button 
                        onClick={() => onViewReceipt(sale)}
                        className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/40 dark:text-indigo-300 font-bold text-sm rounded-lg border border-indigo-200 dark:border-indigo-800/50 transition-colors"
                      >
                        Lihat Struk
                      </button>
                      
                      {sale.status === 'COMPLETED' && (
                        <button
                          onClick={() => setVoidingSaleId(sale.id)}
                          className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:hover:bg-rose-900/40 dark:text-rose-300 font-bold text-sm rounded-lg border border-rose-200 dark:border-rose-800/50 transition-colors"
                        >
                          Batalkan
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Void PIN Prompt */}
                  {voidingSaleId === sale.id && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }} 
                      animate={{ opacity: 1, height: 'auto' }} 
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-2 p-4 bg-rose-50 dark:bg-rose-900/10 rounded-xl border border-rose-200 dark:border-rose-800"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-bold text-rose-900 dark:text-rose-300">Konfirmasi Pembatalan</p>
                          <p className="text-xs text-rose-700 dark:text-rose-400">
                            Membatalkan transaksi akan mengubah status menjadi CANCELLED dan mengembalikan stok barang ke inventaris. Masukkan PIN Owner untuk melanjutkan.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="password"
                          maxLength={6}
                          placeholder="PIN Owner (6 digit)"
                          value={pinInput}
                          onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                          className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                          disabled={isSubmitting}
                        />
                        <button
                          onClick={() => setVoidingSaleId(null)}
                          className="px-4 py-2 text-slate-600 dark:text-slate-400 font-medium text-sm hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          disabled={isSubmitting}
                        >
                          Batal
                        </button>
                        <button
                          onClick={() => handleVoid(sale)}
                          disabled={isSubmitting || pinInput.length < 4}
                          className="flex items-center justify-center min-w-[100px] px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm rounded-lg shadow-sm disabled:opacity-50 transition-colors"
                        >
                          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Konfirmasi'}
                        </button>
                      </div>
                    </motion.div>
                  )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
