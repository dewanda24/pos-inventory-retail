import React, { useState } from 'react';
import {
  ClipboardCheck,
  Plus,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  UserCheck,
  ArrowRight
} from 'lucide-react';
import { Product, StockOpname, OpnameItem, UserRole } from '../types';
import { api } from '../lib/api';

interface OpnameViewProps {
  products: Product[];
  opnames: StockOpname[];
  role: UserRole;
  onRefresh: () => void;
}

export const OpnameView: React.FC<OpnameViewProps> = ({ products, opnames, role, onRefresh }) => {
  const [showModal, setShowModal] = useState(false);
  const [opnameDate, setOpnameDate] = useState(new Date().toISOString().split('T')[0]);
  const [opnameNotes, setOpnameNotes] = useState('');
  
  // Opname Items Entry State
  const [itemsMap, setItemsMap] = useState<Record<string, { physicalQty: number; notes: string }>>({});

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Initialize selected products for opname
  const handleOpenModal = () => {
    const initialMap: Record<string, { physicalQty: number; notes: string }> = {};
    products.forEach((p) => {
      initialMap[p.id] = { physicalQty: p.stock, notes: '' };
    });
    setItemsMap(initialMap);
    setShowModal(true);
  };

  const handlePhysicalQtyChange = (productId: string, physicalQty: number) => {
    setItemsMap((prev) => ({
      ...prev,
      [productId]: { ...prev[productId], physicalQty }
    }));
  };

  const handleNotesChange = (productId: string, notes: string) => {
    setItemsMap((prev) => ({
      ...prev,
      [productId]: { ...prev[productId], notes }
    }));
  };

  const handleCreateOpname = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const opnameItems: OpnameItem[] = Object.entries(itemsMap)
        .map(([productId, val]: [string, { physicalQty: number; notes: string }]) => {
          const prod = products.find((p) => p.id === productId);
          if (!prod) return null;
          const diff = val.physicalQty - prod.stock;
          return {
            productId: prod.id,
            productName: prod.name,
            sku: prod.sku,
            systemQty: prod.stock,
            physicalQty: val.physicalQty,
            difference: diff,
            buyPrice: prod.buyPrice,
            notes: val.notes
          };
        })
        .filter(Boolean) as OpnameItem[];

      await api.createOpname({
        date: opnameDate,
        items: opnameItems,
        notes: opnameNotes
      });

      onRefresh();
      setShowModal(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan stock opname.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    if (!confirm('Setujui Stock Opname ini? Penyesuaian stok akan otomatis dimasukkan ke Stock Ledger.')) return;
    try {
      await api.approveOpname(id);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Gagal menyetujui opname.');
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm('Tolak dan batalkan sesi Stock Opname ini?')) return;
    try {
      await api.rejectOpname(id);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Gagal menolak opname.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ClipboardCheck className="w-6 h-6 text-emerald-600" />
            <span>Audit Stok Fisik (Stock Opname)</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Audit kesesuaian antara stok komputer dan fisik toko. Persetujuan Owner akan otomatis membuat penyesuaian di Stock Ledger.
          </p>
        </div>

        <button
          onClick={handleOpenModal}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/30 flex items-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Sesi Opname Baru</span>
        </button>
      </div>

      {/* History */}
      <div className="space-y-4">
        {opnames.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-slate-400">
            Belum ada riwayat audit stok fisik.
          </div>
        ) : (
          opnames.map((opn) => (
            <div
              key={opn.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 dark:text-white">{opn.docNo}</h3>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        opn.status === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : opn.status === 'REJECTED'
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {opn.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Tanggal: {opn.date} &bull; Dibuat oleh: {opn.createdByName}
                  </p>
                </div>

                {opn.status === 'DRAFT' && role === 'OWNER' && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleApprove(opn.id)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>Setujui (Owner)</span>
                    </button>
                    <button
                      onClick={() => handleReject(opn.id)}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Tolak</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Items List */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 font-bold text-slate-500">
                    <tr>
                      <th className="p-2">Produk</th>
                      <th className="p-2 text-center">Stok Sistem</th>
                      <th className="p-2 text-center">Stok Fisik</th>
                      <th className="p-2 text-center">Selisih</th>
                      <th className="p-2">Catatan Selisih</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {opn.items.map((it, idx) => (
                      <tr key={idx}>
                        <td className="p-2 font-bold text-slate-900 dark:text-white">{it.productName}</td>
                        <td className="p-2 text-center font-mono">{it.systemQty}</td>
                        <td className="p-2 text-center font-mono font-bold text-emerald-600">{it.physicalQty}</td>
                        <td className="p-2 text-center font-bold">
                          <span
                            className={
                              it.difference === 0
                                ? 'text-slate-400'
                                : it.difference > 0
                                ? 'text-emerald-600'
                                : 'text-rose-600 font-extrabold'
                            }
                          >
                            {it.difference > 0 ? `+${it.difference}` : it.difference}
                          </span>
                        </td>
                        <td className="p-2 text-slate-500">{it.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Opname Session */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold">Input Stock Opname Fisik</h3>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-slate-800 rounded text-slate-400">
                Tutup
              </button>
            </div>

            <form onSubmit={handleCreateOpname} className="p-6 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
              {errorMsg && <p className="text-rose-600 font-bold">{errorMsg}</p>}

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tanggal Opname
                </label>
                <input
                  type="date"
                  value={opnameDate}
                  onChange={(e) => setOpnameDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl dark:text-white"
                />
              </div>

              <div className="space-y-3">
                <p className="font-bold text-slate-700 dark:text-slate-300">Masukkan Stok Fisik Hasil Penghitungan:</p>
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                  {products.map((p) => {
                    const phys = itemsMap[p.id]?.physicalQty ?? p.stock;
                    const diff = phys - p.stock;
                    return (
                      <div key={p.id} className="p-3 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/30">
                        <div className="flex-1">
                          <p className="font-bold text-slate-900 dark:text-white">{p.name}</p>
                          <p className="text-[10px] text-slate-400">Stok Komputer: {p.stock} Pcs</p>
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            value={phys}
                            onChange={(e) => handlePhysicalQtyChange(p.id, Number(e.target.value))}
                            className="w-20 px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-center font-bold font-mono dark:text-white"
                          />
                          <span
                            className={`w-12 text-center text-xs font-bold ${
                              diff === 0 ? 'text-slate-400' : diff > 0 ? 'text-emerald-600' : 'text-rose-600'
                            }`}
                          >
                            {diff > 0 ? `+${diff}` : diff}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg transition-all"
              >
                Simpan Draft Opname
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
