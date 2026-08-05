import React, { useState } from 'react';
import { Settings, Save, Download, Upload, CheckCircle2, AlertCircle, Database } from 'lucide-react';
import { StoreSettings } from '../types';
import { api } from '../lib/api';

interface SettingsViewProps {
  settings: StoreSettings | null;
  onRefresh: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ settings, onRefresh }) => {
  const [formData, setFormData] = useState<StoreSettings>({
    storeName: settings?.storeName || 'Vape Store Retail POS',
    storeAddress: settings?.storeAddress || 'Jl. Raya Merdeka No. 88, Jakarta',
    storePhone: settings?.storePhone || '0812-9900-8811',
    receiptHeader: settings?.receiptHeader || 'Terima kasih telah berbelanja!',
    receiptFooter: settings?.receiptFooter || 'Barang yang sudah dibeli tidak dapat ditukar.',
    enableLowStockAlert: settings?.enableLowStockAlert ?? true,
    taxRatePercent: settings?.taxRatePercent || 0
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      await api.updateSettings(formData);
      onRefresh();
      setSuccessMsg('Pengaturan toko berhasil diperbarui!');
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan pengaturan.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadBackup = () => {
    window.location.href = api.getBackupUrl();
  };

  const handleRestoreBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        await api.restoreBackup(JSON.parse(text));
        alert('Database berhasil direstore sepenuhnya!');
        onRefresh();
      } catch (err: any) {
        alert(err.message || 'Gagal merestore backup JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-emerald-600" />
          <span>Pengaturan Profil Toko & Struk</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Atur informasi header/footer struk kasir, persentase pajak, dan backup database.
        </p>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-rose-50 text-rose-600 rounded-xl border border-rose-200 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Form Settings */}
      <form onSubmit={handleSaveSettings} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 text-xs">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Identitas Toko Retail</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Toko</label>
            <input
              type="text"
              required
              value={formData.storeName}
              onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl dark:text-white font-semibold"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nomor Telepon Toko</label>
            <input
              type="text"
              required
              value={formData.storePhone}
              onChange={(e) => setFormData({ ...formData, storePhone: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl dark:text-white"
            />
          </div>
        </div>

        <div>
          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Alamat Lengkap Toko</label>
          <input
            type="text"
            required
            value={formData.storeAddress}
            onChange={(e) => setFormData({ ...formData, storeAddress: e.target.value })}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl dark:text-white"
          />
        </div>

        <h3 className="text-sm font-bold text-slate-900 dark:text-white pt-3 border-t border-slate-100 dark:border-slate-800">
          Format Struk Thermal Kasir
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Pesan Header Struk</label>
            <textarea
              value={formData.receiptHeader}
              onChange={(e) => setFormData({ ...formData, receiptHeader: e.target.value })}
              rows={2}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl dark:text-white"
            ></textarea>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Pesan Footer Struk</label>
            <textarea
              value={formData.receiptFooter}
              onChange={(e) => setFormData({ ...formData, receiptFooter: e.target.value })}
              rows={2}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl dark:text-white"
            ></textarea>
          </div>
        </div>

        <div className="w-48">
          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tarif Pajak POS (%)</label>
          <input
            type="number"
            min="0"
            max="100"
            value={formData.taxRatePercent}
            onChange={(e) => setFormData({ ...formData, taxRatePercent: Number(e.target.value) })}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl dark:text-white font-mono"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>{loading ? 'Menyimpan...' : 'Simpan Pengaturan Toko'}</span>
        </button>
      </form>

      {/* Backup & Restore Panel */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 text-xs">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-600" />
          <span>Pemeliharaan Data & Backup Database JSON</span>
        </h3>
        <p className="text-slate-500">
          Unduh file cadangan data transaksi, produk, dan stock ledger untuk mencegah kehilangan data.
        </p>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleDownloadBackup}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Unduh Backup Database (.json)</span>
          </button>

          <label className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold rounded-xl border border-slate-300 dark:border-slate-700 cursor-pointer flex items-center gap-2">
            <Upload className="w-4 h-4" />
            <span>Restore Data dari File JSON</span>
            <input type="file" accept=".json" onChange={handleRestoreBackup} className="hidden" />
          </label>
        </div>
      </div>
    </div>
  );
};
