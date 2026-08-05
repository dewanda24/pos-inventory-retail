import React from 'react';
import { X, Bell, AlertTriangle, ClipboardCheck, Check } from 'lucide-react';
import { AppNotification } from '../types';

interface NotificationDrawerProps {
  isOpen?: boolean;
  notifications: AppNotification[];
  onClose: () => void;
  onMarkRead?: (id: string) => void;
  onNavigateTab: (tab: string) => void;
  userRole: string;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen = true,
  notifications = [],
  onClose,
  onMarkRead,
  onNavigateTab,
  userRole
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Pemberitahuan Sistem</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Bell className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Tidak ada notifikasi baru.</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  notif.read
                    ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    : 'bg-white dark:bg-slate-800 border-amber-300 dark:border-amber-700/60 shadow-xs'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      notif.type === 'LOW_STOCK'
                        ? 'bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400'
                        : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400'
                    }`}
                  >
                    {notif.type === 'LOW_STOCK' ? (
                      <AlertTriangle className="w-4 h-4" />
                    ) : (
                      <ClipboardCheck className="w-4 h-4" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{notif.title}</h4>
                      <span className="text-[10px] text-slate-400">
                        {new Date(notif.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-snug">
                      {notif.message}
                    </p>

                    <div className="mt-2.5 flex items-center justify-between">
                      {notif.type === 'LOW_STOCK' ? (
                        userRole === 'OWNER' && (
                          <button
                            onClick={() => {
                              onNavigateTab('suppliers');
                              onClose();
                            }}
                            className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                          >
                            Restock Sekarang &rarr;
                          </button>
                        )
                      ) : (
                        <button
                          onClick={() => {
                            onNavigateTab('opname');
                            onClose();
                          }}
                          className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                        >
                          Lihat Opname &rarr;
                        </button>
                      )}

                      {!notif.read && (
                        <button
                          onClick={() => onMarkRead && onMarkRead(notif.id)}
                          className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" /> Tandai Dibaca
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
