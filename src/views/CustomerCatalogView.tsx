import React, { useState, useMemo } from 'react';
import {
  Store,
  Search,
  ScanLine,
  ShoppingBag,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Plus,
  Minus,
  Trash2,
  QrCode,
  Sparkles,
  ArrowRight,
  Info,
  Tag
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Product, Category } from '../types';

interface CustomerCatalogViewProps {
  products: Product[];
  categories: Category[];
  storeName: string;
  isPublicMode?: boolean;
}

interface WishlistItem {
  product: Product;
  qty: number;
}

export const CustomerCatalogView: React.FC<CustomerCatalogViewProps> = ({
  products,
  categories,
  storeName,
  isPublicMode = false
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [wishlist, setWishlist] = useState<Record<string, WishlistItem>>({});
  const [showWishlistModal, setShowWishlistModal] = useState(false);
  const [quickCheckModalProduct, setQuickCheckModalProduct] = useState<Product | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);

  // Filter products based on search and category (only ACTIVE products)
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (p.status === 'INACTIVE') return false;

      const matchCategory =
        selectedCategory === 'ALL' || p.categoryId === selectedCategory;

      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.barcode.toLowerCase().includes(q) ||
        (p.categoryName && p.categoryName.toLowerCase().includes(q));

      return matchCategory && matchQuery;
    });
  }, [products, selectedCategory, searchQuery]);

  // Handle instant barcode match for Price Checker Kiosk Mode
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim() !== '') {
      const q = searchQuery.trim().toLowerCase();
      const exactMatch = products.find(
        (p) =>
          p.status === 'ACTIVE' &&
          (p.barcode.toLowerCase() === q || p.sku.toLowerCase() === q)
      );

      if (exactMatch) {
        setQuickCheckModalProduct(exactMatch);
      }
    }
  };

  // Wishlist Actions
  const handleAddToWishlist = (product: Product) => {
    if (product.stock <= 0) return;
    setWishlist((prev) => {
      const currentQty = prev[product.id]?.qty || 0;
      if (currentQty >= product.stock) return prev;
      return {
        ...prev,
        [product.id]: {
          product,
          qty: currentQty + 1
        }
      };
    });
  };

  const handleUpdateWishlistQty = (productId: string, delta: number) => {
    setWishlist((prev) => {
      const item = prev[productId];
      if (!item) return prev;
      const newQty = item.qty + delta;
      if (newQty <= 0) {
        const copy = { ...prev };
        delete copy[productId];
        return copy;
      }
      if (newQty > item.product.stock) return prev;
      return {
        ...prev,
        [productId]: {
          ...item,
          qty: newQty
        }
      };
    });
  };

  const handleClearWishlist = () => {
    setWishlist({});
    setShowWishlistModal(false);
  };

  const wishlistItems: WishlistItem[] = Object.values(wishlist) as WishlistItem[];
  const totalWishlistCount = wishlistItems.reduce((acc: number, i: WishlistItem) => acc + i.qty, 0);
  const totalWishlistAmount = wishlistItems.reduce(
    (acc: number, i: WishlistItem) => acc + i.qty * i.product.sellPrice,
    0
  );

  // Helper for stock badge
  const renderStockBadge = (stock: number) => {
    if (stock <= 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
          <XCircle className="w-3.5 h-3.5" />
          <span>Stok Habis</span>
        </span>
      );
    }
    if (stock <= 10) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Stok Terbatas ({stock})</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span>Tersedia ({stock})</span>
      </span>
    );
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Kiosk Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-purple-600 to-emerald-800 p-6 sm:p-8 text-white shadow-xl shadow-emerald-600/20">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-emerald-100 border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Customer Self-Service Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Katalog & Cek Harga Mandiri
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90">
              Selamat datang di <span className="font-bold text-white">{storeName}</span>! Cari barang, cek harga publik, ketersediaan stok, dan buat daftar belanja Anda sebelum ke meja kasir.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
              <ScanLine className="w-8 h-8 text-amber-300 shrink-0" />
              <div className="text-xs">
                <p className="font-bold">Tips Cek Cepat:</p>
                <p className="text-emerald-100">Scan barcode atau ketik nama/SKU lalu tekan Enter untuk lihat harga cepat.</p>
              </div>
            </div>
            
            {!isPublicMode && (
              <button
                onClick={() => setShowQRModal(true)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-emerald-900/40 hover:bg-emerald-900/60 backdrop-blur-md border border-white/20 rounded-xl text-xs font-bold text-white transition-all shadow-md"
              >
                <QrCode className="w-4 h-4" />
                <span>Tampilkan QR Code Katalog</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Search Bar & Category Filter */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Ketik nama produk, SKU, atau scan barcode barang di sini... (Tekan Enter untuk cek barcode)"
            className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:border-emerald-600 focus:outline-hidden shadow-xs transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
            >
              Hapus
            </button>
          )}
        </div>

        {/* Categories Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === 'ALL'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-emerald-500'
            }`}
          >
            Semua Produk ({products.filter((p) => p.status === 'ACTIVE').length})
          </button>
          {categories.map((cat) => {
            const count = products.filter(
              (p) => p.categoryId === cat.id && p.status === 'ACTIVE'
            ).length;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-emerald-500'
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-3">
          <Store className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600" />
          <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">
            Produk tidak ditemukan
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Coba gunakan kata kunci pencarian yang lain atau periksa kategori produk yang Anda pilih.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map((p) => (
            <div
              key={p.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    {p.categoryName || 'Umum'}
                  </span>
                  {renderStockBadge(p.stock)}
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-2">
                    {p.name}
                  </h3>
                  <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                    SKU: {p.sku} | Barcode: {p.barcode}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">Harga Publik</span>
                  <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                    Rp {p.sellPrice.toLocaleString('id-ID')}
                  </span>
                </div>

                <button
                  type="button"
                  disabled={p.stock <= 0}
                  onClick={() => handleAddToWishlist(p)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    p.stock <= 0
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                      : 'bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-600 hover:text-white text-emerald-600 dark:text-emerald-400'
                  }`}
                  title="Tambah ke Daftar Belanja Anda"
                >
                  <Plus className="w-4 h-4" />
                  <span>Daftar</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Floating Bottom Bar for Wishlist */}
      {totalWishlistCount > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-xl px-4">
          <div className="bg-slate-900 text-white rounded-2xl shadow-2xl p-4 border border-slate-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center font-bold text-sm shrink-0 shadow-md shadow-emerald-600/40">
                {totalWishlistCount}
              </div>
              <div>
                <p className="text-xs text-slate-400">Daftar Belanja Anda</p>
                <p className="text-sm font-extrabold text-white">
                  Rp {totalWishlistAmount.toLocaleString('id-ID')}
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowWishlistModal(true)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition-all"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Lihat Daftar & QR Kasir</span>
            </button>
          </div>
        </div>
      )}

      {/* Modal Wishlist / QR Kasir */}
      {showWishlistModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-5 bg-gradient-to-r from-emerald-600 to-purple-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                <h3 className="text-sm font-bold">Daftar Belanja Mandiri Anda</h3>
              </div>
              <button
                onClick={() => setShowWishlistModal(false)}
                className="p-1 hover:bg-white/20 rounded-lg text-xs"
              >
                Tutup
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 p-4 rounded-2xl flex items-center gap-3">
                <QrCode className="w-10 h-10 text-emerald-600 shrink-0" />
                <div className="text-xs">
                  <p className="font-bold text-slate-900 dark:text-white">Tunjukkan ke Meja Kasir</p>
                  <p className="text-slate-600 dark:text-slate-300">
                    Kasir dapat memvalidasi barang belanjaan Anda berdasarkan daftar atau barcode pesanan ini.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {wishlistItems.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-900 dark:text-white text-xs truncate">
                        {item.product.name}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Rp {item.product.sellPrice.toLocaleString('id-ID')} &times; {item.qty}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleUpdateWishlistQty(item.product.id, -1)}
                        className="p-1 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-6 text-center text-xs font-bold text-slate-900 dark:text-white">
                        {item.qty}
                      </span>
                      <button
                        onClick={() => handleUpdateWishlistQty(item.product.id, 1)}
                        disabled={item.qty >= item.product.stock}
                        className="p-1 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 disabled:opacity-40"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-right shrink-0 min-w-20">
                      <p className="font-extrabold text-emerald-600 dark:text-emerald-400 text-xs">
                        Rp {(item.qty * item.product.sellPrice).toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500">Total Estimasi Tagihan:</span>
                  <p className="text-lg font-extrabold text-slate-900 dark:text-white">
                    Rp {totalWishlistAmount.toLocaleString('id-ID')}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleClearWishlist}
                    className="px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-xl"
                  >
                    Kosongkan Daftar
                  </button>
                  <button
                    onClick={() => setShowWishlistModal(false)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Quick Price Checker (exact Barcode/SKU match) */}
      {quickCheckModalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-center p-6 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Tag className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                {quickCheckModalProduct.categoryName || 'Umum'}
              </span>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                {quickCheckModalProduct.name}
              </h3>
              <p className="text-xs font-mono text-slate-400">
                Barcode: {quickCheckModalProduct.barcode}
              </p>
            </div>

            <div className="py-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-400 uppercase font-bold block">Harga Publik</span>
              <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                Rp {quickCheckModalProduct.sellPrice.toLocaleString('id-ID')}
              </span>
            </div>

            <div className="flex items-center justify-center">
              {renderStockBadge(quickCheckModalProduct.stock)}
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={() => {
                  handleAddToWishlist(quickCheckModalProduct);
                  setQuickCheckModalProduct(null);
                }}
                disabled={quickCheckModalProduct.stock <= 0}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
              >
                + Tambah ke Daftar Belanja
              </button>
              <button
                onClick={() => setQuickCheckModalProduct(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal for Sharing */}
      {showQRModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 rounded-lg flex items-center justify-center">
                  <QrCode className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">QR Code Katalog</h3>
                  <p className="text-[10px] text-slate-500">Scan untuk buka di HP pelanggan</p>
                </div>
              </div>
              <button
                onClick={() => setShowQRModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-8 flex flex-col items-center">
              <div className="bg-white p-4 rounded-2xl shadow-inner border border-slate-100">
                <QRCodeSVG 
                  value={`${window.location.origin}/katalog`} 
                  size={200}
                  level="H"
                  includeMargin={false}
                  className="w-48 h-48"
                />
              </div>
              <p className="mt-6 text-sm font-bold text-slate-900 dark:text-white text-center">
                Minta pelanggan Anda melakukan scan kode ini
              </p>
              <p className="mt-1 text-xs text-slate-500 text-center">
                Mereka akan dapat melihat katalog tanpa perlu login
              </p>
              
              <div className="mt-4 w-full p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Direct Link</p>
                <a href="/katalog" target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline break-all">
                  {window.location.origin}/katalog
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
