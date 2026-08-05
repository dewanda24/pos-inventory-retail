import React, { useEffect, useState } from 'react';
import { CustomerCatalogView } from './CustomerCatalogView';
import { api } from '../lib/api';
import { Product, Category } from '../types';
import { Store, Loader2 } from 'lucide-react';

export const PublicCatalogView: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{ products: Product[]; categories: Category[] } | null>(null);

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const result = await api.getPublicCatalog();
        setData(result);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCatalog();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="flex flex-col items-center gap-4 text-emerald-600">
          <Loader2 className="w-12 h-12 animate-spin" />
          <p className="font-semibold">Memuat Katalog...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50 dark:bg-slate-900 p-6 text-center">
        <div className="max-w-md p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-xl">
          <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Store className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Gagal Memuat Katalog</h2>
          <p className="text-slate-500 dark:text-slate-400">{error || 'Data tidak tersedia.'}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-slate-50 dark:bg-slate-900">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 shadow-sm z-10 flex-shrink-0">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-emerald-500/20 shadow-lg">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">Vape Store Retail</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Katalog Pelanggan Publik</p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        <CustomerCatalogView
          products={data.products}
          categories={data.categories}
          storeName="Vape Store Retail"
          isPublicMode={true}
        />
      </div>
    </div>
  );
};
