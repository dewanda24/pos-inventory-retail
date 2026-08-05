import React, { useState } from 'react';
import {
  Boxes,
  BookOpen,
  Plus,
  Search,
  Truck,
  FileText,
  Calendar,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { Product, Supplier, GoodsInDocument, StockLedgerEntry, GoodsInItem } from '../types';
import { api } from '../lib/api';

interface InventoryViewProps {
  products: Product[];
  suppliers: Supplier[];
  goodsInDocs: GoodsInDocument[];
  ledger: StockLedgerEntry[];
  onRefresh: () => void;
  initialTab?: 'goods-in' | 'ledger';
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  products,
  suppliers,
  goodsInDocs,
  ledger,
  onRefresh,
  initialTab = 'goods-in'
}) => {
  const [activeTab, setActiveTab] = useState<'goods-in' | 'ledger'>(initialTab);

  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Barang Masuk Form State
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || '');
  const [docDate, setDocDate] = useState(new Date().toISOString().split('T')[0]);
  const [docNotes, setDocNotes] = useState('');
  const [items, setItems] = useState<GoodsInItem[]>([]);

  // Item Form Input
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [inputQty, setInputQty] = useState(10);
  const [inputBuyPrice, setInputBuyPrice] = useState(0);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Ledger Filter
  const [ledgerSearch, setLedgerSearch] = useState('');
  const [ledgerTypeFilter, setLedgerTypeFilter] = useState<string>('ALL');

  // Handle Select Product to Auto Fill Buy Price
  const handleProductSelect = (id: string) => {
    setSelectedProductId(id);
    const p = products.find((prod) => prod.id === id);
    if (p) {
      setInputBuyPrice(p.buyPrice);
    }
  };

  const handleAddItem = () => {
    setErrorMsg(null);
    if (inputQty <= 0) {
      setErrorMsg('Jumlah barang masuk harus lebih dari 0.');
      return;
    }

    const prod = products.find((p) => p.id === selectedProductId);
    if (!prod) return;

    const existingIdx = items.findIndex((i) => i.productId === selectedProductId);
    if (existingIdx > -1) {
      const updated = [...items];
      const newQty = updated[existingIdx].qty + inputQty;
      updated[existingIdx] = {
        ...updated[existingIdx],
        qty: newQty,
        buyPrice: inputBuyPrice,
        subtotal: newQty * inputBuyPrice
      };
      setItems(updated);
    } else {
      setItems([
        ...items,
        {
          productId: prod.id,
          productName: prod.name,
          sku: prod.sku,
          qty: inputQty,
          buyPrice: inputBuyPrice,
          subtotal: inputQty * inputBuyPrice
        }
      ]);
    }
  };

  const removeItem = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmitGoodsIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      setErrorMsg('Tambahkan minimal 1 item barang masuk.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await api.createGoodsInDoc({
        supplierId,
        date: docDate,
        items,
        notes: docNotes
      });

      setSuccessMsg('Pencatatan Barang Masuk berhasil! Stok dan Stock Ledger telah diperbarui.');
      setItems([]);
      setDocNotes('');
      onRefresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan barang masuk.');
    } finally {
      setLoading(false);
    }
  };

  // Filter Ledger
  const filteredLedger = ledger.filter((l) => {
    const matchType = ledgerTypeFilter === 'ALL' || l.type === ledgerTypeFilter;
    const q = ledgerSearch.toLowerCase().trim();
    const matchQ =
      !q ||
      l.productName.toLowerCase().includes(q) ||
      l.sku.toLowerCase().includes(q) ||
      l.referenceNo.toLowerCase().includes(q);
    return matchType && matchQ;
  });

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Boxes className="w-6 h-6 text-emerald-600" />
            <span>Manajemen Inventory & Buku Besar Stok</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Catat penerimaan barang masuk dari supplier dan lacak mutasi stok pada Stock Ledger.
          </p>
        </div>

        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('goods-in')}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
              activeTab === 'goods-in'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Barang Masuk (Receive)</span>
          </button>
          <button
            onClick={() => setActiveTab('ledger')}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
              activeTab === 'ledger'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Stock Ledger (Buku Besar)</span>
          </button>
        </div>
      </div>

      {/* TAB 1: BARANG MASUK FORM & HISTORY */}
      {activeTab === 'goods-in' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Create Goods In */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-600" />
              <span>Input Penerimaan Barang Masuk</span>
            </h3>

            {errorMsg && (
              <div className="p-3 bg-rose-50 text-rose-600 rounded-xl border border-rose-200 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmitGoodsIn} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Pilih Supplier
                  </label>
                  <select
                    value={supplierId}
                    onChange={(e) => setSupplierId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl dark:text-white"
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tanggal Penerimaan
                  </label>
                  <input
                    type="date"
                    value={docDate}
                    onChange={(e) => setDocDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl dark:text-white"
                  />
                </div>
              </div>

              {/* Add Item Row */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <p className="font-bold text-slate-700 dark:text-slate-300">Pilih Produk & Qty Masuk</p>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <div className="sm:col-span-2">
                    <select
                      value={selectedProductId}
                      onChange={(e) => handleProductSelect(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg dark:text-white"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} (Stok Sekarang: {p.stock})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <input
                      type="number"
                      min="1"
                      value={inputQty}
                      onChange={(e) => setInputQty(Number(e.target.value))}
                      placeholder="Jumlah"
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-mono dark:text-white"
                    />
                  </div>

                  <div>
                    <input
                      type="number"
                      min="0"
                      value={inputBuyPrice}
                      onChange={(e) => setInputBuyPrice(Number(e.target.value))}
                      placeholder="Harga Modal/Pcs"
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-mono dark:text-white"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddItem}
                  className="w-full py-2 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300 hover:bg-emerald-100 font-bold rounded-lg border border-emerald-200 dark:border-emerald-800 transition-colors"
                >
                  + Tambahkan ke Daftar
                </button>
              </div>

              {/* Items Table */}
              {items.length > 0 && (
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100 dark:bg-slate-800 font-bold">
                      <tr>
                        <th className="p-2">Produk</th>
                        <th className="p-2 text-center">Jumlah</th>
                        <th className="p-2 text-right">Harga Modal</th>
                        <th className="p-2 text-right">Subtotal</th>
                        <th className="p-2 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {items.map((it, idx) => (
                        <tr key={idx}>
                          <td className="p-2 font-semibold text-slate-900 dark:text-white">{it.productName}</td>
                          <td className="p-2 text-center font-bold">{it.qty} Pcs</td>
                          <td className="p-2 text-right font-mono">Rp {it.buyPrice.toLocaleString('id-ID')}</td>
                          <td className="p-2 text-right font-extrabold text-emerald-600 dark:text-emerald-400">
                            Rp {it.subtotal.toLocaleString('id-ID')}
                          </td>
                          <td className="p-2 text-center">
                            <button
                              type="button"
                              onClick={() => removeItem(idx)}
                              className="text-rose-500 font-bold hover:underline"
                            >
                              Hapus
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Catatan / Nomor Faktur Supplier
                </label>
                <textarea
                  value={docNotes}
                  onChange={(e) => setDocNotes(e.target.value)}
                  placeholder="Contoh: No. Surat Jalan SJ-9918231 dari distributor"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl dark:text-white"
                  rows={2}
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading || items.length === 0}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-50"
              >
                {loading ? 'Menyimpan Barang Masuk...' : 'Proses & Tambah Stok Automatis'}
              </button>
            </form>
          </div>

          {/* History Documents Sidebar */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Riwayat Dokumen Barang Masuk</h3>
            <div className="space-y-3">
              {goodsInDocs.map((doc) => (
                <div key={doc.id} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                  <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                    <span className="text-emerald-600 dark:text-emerald-400 font-mono">{doc.docNo}</span>
                    <span>Rp {doc.totalAmount.toLocaleString('id-ID')}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium mt-1">{doc.supplierName}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{doc.date} &bull; Oleh {doc.userName}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STOCK LEDGER */}
      {activeTab === 'ledger' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden p-5 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={ledgerSearch}
                onChange={(e) => setLedgerSearch(e.target.value)}
                placeholder="Cari di Ledger (Nama Produk, Ref No, SKU)..."
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none dark:text-white"
              />
            </div>

            <select
              value={ledgerTypeFilter}
              onChange={(e) => setLedgerTypeFilter(e.target.value)}
              className="px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl dark:text-white"
            >
              <option value="ALL">Semua Jenis Transaksi</option>
              <option value="BARANG_MASUK">Barang Masuk (+)</option>
              <option value="PENJUALAN">Penjualan (-)</option>
              <option value="STOCK_OPNAME">Stock Opname (+/-)</option>
              <option value="ADJUSTMENT">Adjustment (+/-)</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800 font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="p-3">Waktu</th>
                  <th className="p-3">Produk</th>
                  <th className="p-3">Jenis</th>
                  <th className="p-3 text-center">Stok Sebelum</th>
                  <th className="p-3 text-center">Perubahan</th>
                  <th className="p-3 text-center">Stok Sesudah</th>
                  <th className="p-3">Ref No & Catatan</th>
                  <th className="p-3">Petugas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredLedger.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400">
                      Tidak ada histori di Stock Ledger.
                    </td>
                  </tr>
                ) : (
                  filteredLedger.map((l) => {
                    const isPositive = l.qtyChange > 0;
                    return (
                      <tr key={l.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="p-3 text-slate-500">
                          {new Date(l.date).toLocaleString('id-ID')}
                        </td>
                        <td className="p-3">
                          <p className="font-bold text-slate-900 dark:text-white">{l.productName}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{l.sku}</p>
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              l.type === 'BARANG_MASUK'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                : l.type === 'PENJUALAN'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                            }`}
                          >
                            {l.type}
                          </span>
                        </td>
                        <td className="p-3 text-center font-mono">{l.qtyBefore}</td>
                        <td className="p-3 text-center font-extrabold">
                          <span
                            className={`px-2 py-0.5 rounded-lg inline-flex items-center gap-0.5 ${
                              isPositive ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'
                            }`}
                          >
                            {isPositive ? '+' : ''}
                            {l.qtyChange}
                          </span>
                        </td>
                        <td className="p-3 text-center font-mono font-bold">{l.qtyAfter}</td>
                        <td className="p-3">
                          <p className="font-bold font-mono text-slate-800 dark:text-slate-200">{l.referenceNo}</p>
                          <p className="text-[10px] text-slate-400">{l.notes}</p>
                        </td>
                        <td className="p-3 text-slate-600 dark:text-slate-300">{l.userName}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
