import React, { useState, useEffect } from 'react';
import { CreditCard, Banknote, QrCode, X, CheckCircle2 } from 'lucide-react';
import { PaymentMethod } from '../../types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
  onProcessPayment: (paymentMethod: PaymentMethod, payAmount: number) => void;
  isSubmitting: boolean;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  totalAmount,
  onProcessPayment,
  isSubmitting
}) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [payAmount, setPayAmount] = useState<number>(0);

  useEffect(() => {
    if (isOpen) {
      setPaymentMethod('CASH');
      setPayAmount(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const changeAmount = paymentMethod === 'CASH' ? Math.max(0, payAmount - totalAmount) : 0;
  const isReady = paymentMethod !== 'CASH' || payAmount >= totalAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReady && !isSubmitting) {
      onProcessPayment(paymentMethod, paymentMethod === 'CASH' ? payAmount : totalAmount);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">Pembayaran</h3>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-5 space-y-5">
            {/* Total Amount Display */}
            <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-100 dark:border-emerald-800/50">
              <p className="text-sm text-emerald-700 dark:text-emerald-400 font-medium mb-1">TOTAL TAGIHAN</p>
              <p className="text-3xl font-extrabold text-emerald-700 dark:text-emerald-400">
                Rp {totalAmount.toLocaleString('id-ID')}
              </p>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Metode Pembayaran
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('CASH')}
                  className={`py-3 text-sm font-bold rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                    paymentMethod === 'CASH'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md scale-100'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-emerald-400 hover:text-emerald-500 scale-95 opacity-80'
                  }`}
                >
                  <Banknote className="w-5 h-5" />
                  <span>TUNAI</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('QRIS')}
                  className={`py-3 text-sm font-bold rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                    paymentMethod === 'QRIS'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md scale-100'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-emerald-400 hover:text-emerald-500 scale-95 opacity-80'
                  }`}
                >
                  <QrCode className="w-5 h-5" />
                  <span>QRIS</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('DEBIT')}
                  className={`py-3 text-sm font-bold rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                    paymentMethod === 'DEBIT'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md scale-100'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-emerald-400 hover:text-emerald-500 scale-95 opacity-80'
                  }`}
                >
                  <CreditCard className="w-5 h-5" />
                  <span>DEBIT</span>
                </button>
              </div>
            </div>

            {/* Cash Input */}
            {paymentMethod === 'CASH' && (
              <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Uang Diterima (Rp)
                    </label>
                    <button
                      type="button"
                      onClick={() => setPayAmount(totalAmount)}
                      className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-emerald-600 dark:text-emerald-400 font-bold hover:bg-slate-200 transition-colors"
                    >
                      Uang Pas
                    </button>
                  </div>
                  <input
                    type="number"
                    autoFocus
                    value={payAmount || ''}
                    onChange={(e) => setPayAmount(Number(e.target.value))}
                    placeholder="0"
                    className="w-full px-4 py-3 text-lg bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:border-emerald-500 focus:outline-none dark:text-white font-mono font-bold transition-colors"
                  />
                </div>

                {/* Quick Presets */}
                <div className="flex gap-2">
                  {[50000, 100000, 200000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setPayAmount(amt)}
                      className="flex-1 py-1.5 text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 hover:border-slate-300 transition-colors"
                    >
                      {amt / 1000}k
                    </button>
                  ))}
                </div>

                {/* Change Display */}
                {payAmount >= totalAmount && (
                  <div className="flex justify-between items-center p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800/50 rounded-xl">
                    <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">Kembalian:</span>
                    <span className="text-lg font-extrabold text-emerald-700 dark:text-emerald-400">
                      Rp {changeAmount.toLocaleString('id-ID')}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
            <button
              type="submit"
              disabled={!isReady || isSubmitting}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:shadow-none"
            >
              {isSubmitting ? (
                <span>Memproses...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>PROSES PEMBAYARAN</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
