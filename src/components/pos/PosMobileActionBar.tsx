import React from 'react';
import { Bell, ReceiptText, Store } from 'lucide-react';

interface PosMobileActionBarProps {
  onOpenPendingOrders: () => void;
  pendingOrdersCount: number;
  onShowHistory?: () => void;
  onShowQR?: () => void;
}

export const PosMobileActionBar: React.FC<PosMobileActionBarProps> = ({
  onOpenPendingOrders,
  pendingOrdersCount,
  onShowHistory,
  onShowQR
}) => {
  return (
    <div className="lg:hidden fixed bottom-0 inset-x-0 h-[60px] bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-around z-40 shadow-[0_-4px_10px_-1px_rgba(0,0,0,0.05)] pb-safe">
      <button
        onClick={onOpenPendingOrders}
        className="relative flex flex-col items-center justify-center w-full h-full text-slate-500 hover:text-amber-600 dark:text-slate-400 dark:hover:text-amber-400 transition-colors"
      >
        <Bell className="w-5 h-5 mb-1" />
        <span className="text-[10px] font-medium">Pesanan</span>
        {pendingOrdersCount > 0 && (
          <span className="absolute top-1.5 right-1/2 -mr-3 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm">
            {pendingOrdersCount}
          </span>
        )}
      </button>

      {onShowHistory && (
        <button
          onClick={onShowHistory}
          className="flex flex-col items-center justify-center w-full h-full text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
        >
          <ReceiptText className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-medium">Riwayat</span>
        </button>
      )}

      {onShowQR && (
        <button
          onClick={onShowQR}
          className="flex flex-col items-center justify-center w-full h-full text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors"
        >
          <Store className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-medium">QR</span>
        </button>
      )}
    </div>
  );
};
