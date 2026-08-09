import React, { useEffect, useState } from 'react';
import { X, Clock, ShoppingCart, User, CheckCircle2, XCircle } from 'lucide-react';
import { PendingOrder } from '../../types';
import { api } from '../../lib/api';
import { toast } from 'sonner';

interface PendingOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProcessOrder: (order: PendingOrder) => void;
}

export const PendingOrdersModal: React.FC<PendingOrdersModalProps> = ({ isOpen, onClose, onProcessOrder }) => {
  const [orders, setOrders] = useState<PendingOrder[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await api.getPendingOrders();
      setOrders(data);
    } catch (err: any) {
      toast.error('Gagal mengambil daftar pesanan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchOrders();
    }
  }, [isOpen]);

  const handleCancelOrder = async (id: string) => {
    if (!confirm('Yakin ingin membatalkan pesanan ini?')) return;
    try {
      await api.updatePendingOrderStatus(id, 'CANCELLED');
      toast.success('Pesanan dibatalkan');
      fetchOrders();
    } catch (err) {
      toast.error('Gagal membatalkan pesanan');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh]">
        <div className="p-4 bg-emerald-600 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            <h3 className="text-sm font-bold">Pesanan Pelanggan (Online / QR)</h3>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchOrders} className="p-1.5 bg-emerald-700 hover:bg-emerald-800 rounded-lg text-xs font-bold transition-colors">
              Refresh
            </button>
            <button onClick={onClose} className="p-1 hover:bg-emerald-700 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-4 overflow-y-auto flex-1 bg-slate-50 dark:bg-slate-950">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin text-emerald-600">⏳</div>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-10 text-slate-500">
              Tidak ada pesanan tertunda.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {orders.map(order => (
                <div key={order.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <User className="w-4 h-4 text-emerald-600" />
                        {order.customerName}
                      </h4>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                        {order.tableNumber && (
                          <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-0.5 rounded font-bold">
                            Meja: {order.tableNumber}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {new Date(order.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500">Total Tagihan</p>
                      <p className="font-extrabold text-emerald-600 dark:text-emerald-400">
                        Rp {order.subtotal.toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg max-h-32 overflow-y-auto">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-xs">
                        <span className="text-slate-700 dark:text-slate-300">
                          {item.qty}x {item.productName}
                        </span>
                        <span className="text-slate-500">
                          Rp {(item.qty * item.price).toLocaleString('id-ID')}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCancelOrder(order.id)}
                      className="flex-1 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400 rounded-lg text-xs font-bold transition-colors flex justify-center items-center gap-1"
                    >
                      <XCircle className="w-4 h-4" /> Tolak
                    </button>
                    <button
                      onClick={() => onProcessOrder(order)}
                      className="flex-[2] py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors flex justify-center items-center gap-1 shadow-md shadow-emerald-600/20"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Tarik ke Kasir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
