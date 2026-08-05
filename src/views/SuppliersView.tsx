import React, { useState } from 'react';
import { Truck, Plus, AlertTriangle, Phone, Mail, MapPin, UserCheck, ShoppingBag, Edit2, Trash2 } from 'lucide-react';
import { Supplier, Product } from '../types';
import { api } from '../lib/api';

interface SuppliersViewProps {
  suppliers: Supplier[];
  products: Product[];
  onNavigateTab: (tab: string) => void;
  onRefresh: () => void;
}

export const SuppliersView: React.FC<SuppliersViewProps> = ({
  suppliers,
  products,
  onNavigateTab,
  onRefresh
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    notes: ''
  });

  const [loading, setLoading] = useState(false);

  // Filter products needing restock
  const restockItems = products.filter((p) => p.stock <= p.minStock && p.status === 'ACTIVE');

  const openAddSupplier = () => {
    setEditingSupplier(null);
    setFormData({
      name: '',
      contactPerson: '',
      phone: '',
      email: '',
      address: '',
      notes: ''
    });
    setShowModal(true);
  };

  const openEditSupplier = (sup: Supplier) => {
    setEditingSupplier(sup);
    setFormData({
      name: sup.name,
      contactPerson: sup.contactPerson,
      phone: sup.phone,
      email: sup.email,
      address: sup.address,
      notes: sup.notes || ''
    });
    setShowModal(true);
  };

  const handleSaveSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingSupplier) {
        await api.updateSupplier(editingSupplier.id, formData);
      } else {
        await api.createSupplier(formData);
      }
      onRefresh();
      setShowModal(false);
      setFormData({ name: '', contactPerson: '', phone: '', email: '', address: '', notes: '' });
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan supplier.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSupplier = async (sup: Supplier) => {
    if (window.confirm(`Yakin ingin menghapus supplier "${sup.name}" (${sup.code})?`)) {
      try {
        await api.deleteSupplier(sup.id);
        onRefresh();
      } catch (err: any) {
        alert(err.message || 'Gagal menghapus supplier.');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Truck className="w-6 h-6 text-emerald-600" />
            <span>Master Supplier & Notifikasi Restock</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Kelola daftar pendaftaran supplier mitra dan daftar produk yang memerlukan restock secepatnya.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/30 flex items-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Supplier Baru</span>
        </button>
      </div>

      {/* Urgent Restock List */}
      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-5 rounded-2xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200">
              Daftar Produk Perlu Restock (&le; Minimum Stok)
            </h3>
          </div>
          <button
            onClick={() => onNavigateTab('inventory')}
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            Buat Barang Masuk &rarr;
          </button>
        </div>

        {restockItems.length === 0 ? (
          <p className="text-xs text-amber-700 dark:text-amber-300">
            Semua stok produk berada di atas batas aman minimum.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {restockItems.map((p) => (
              <div
                key={p.id}
                className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-amber-200 dark:border-amber-800/60 shadow-2xs flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{p.name}</p>
                  <p className="text-[10px] text-slate-400">{p.supplierName || 'Pemasok Umum'}</p>
                  <p className="text-[11px] font-bold text-rose-600 dark:text-rose-400 mt-1">
                    Stok: {p.stock} Pcs (Min: {p.minStock})
                  </p>
                </div>
                <button
                  onClick={() => onNavigateTab('inventory')}
                  className="px-2.5 py-1 bg-emerald-600 text-white font-bold text-[10px] rounded-lg shadow-xs hover:bg-emerald-700"
                >
                  Restock
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Supplier Directory Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {suppliers.map((sup) => (
          <div
            key={sup.id}
            className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">
                  {sup.code}
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1">{sup.name}</h3>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => openEditSupplier(sup)}
                  className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950 rounded-lg transition-colors"
                  title="Edit Supplier"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteSupplier(sup)}
                  className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-lg transition-colors"
                  title="Hapus Supplier"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                <span>Contact: {sup.contactPerson}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{sup.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{sup.email}</span>
              </div>
              <div className="flex items-start gap-2 pt-1 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
                <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                <span>{sup.address}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Supplier Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold">
                {editingSupplier ? 'Edit Data Supplier' : 'Pendaftaran Supplier Baru'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-slate-800 rounded text-slate-400">
                Tutup
              </button>
            </div>

            <form onSubmit={handleSaveSupplier} className="p-6 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Perusahaan / Supplier</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: PT Indofood Sukses Makmur"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Contact Person</label>
                <input
                  type="text"
                  required
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  placeholder="Pak Hartono"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nomor Telepon / WA</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Alamat Kantor / Gudang</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={2}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl dark:text-white"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg transition-all"
              >
                {loading ? 'Menyimpan...' : 'Simpan Supplier'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
