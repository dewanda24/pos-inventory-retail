import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Store } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({ isOpen, onClose, url }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Store className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                Katalog Pelanggan
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-8 flex flex-col items-center text-center">
            <div className="bg-white p-4 rounded-xl shadow-inner border border-slate-100 mb-6">
              <QRCodeSVG value={url} size={200} level="H" includeMargin={false} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Scan untuk Memesan</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Arahkan kamera pelanggan ke QR Code ini untuk membuka halaman katalog interaktif dan melakukan pemesanan (Self-Order).
            </p>
          </div>
          
          {/* Footer */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
            <p className="text-xs text-center text-slate-500 dark:text-slate-400 font-mono break-all">
              {url}
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
