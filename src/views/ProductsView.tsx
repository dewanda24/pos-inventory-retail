import React, { useState } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  AlertTriangle,
  Barcode,
  Upload,
  Download,
  X,
  CheckCircle2,
  Eye,
  EyeOff
} from 'lucide-react';
import { Product, Category, Supplier, UserRole } from '../types';
import { api } from '../lib/api';

interface ProductsViewProps {
  products: Product[];
  categories: Category[];
  suppliers: Supplier[];
  role: UserRole;
  onRefresh: () => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  products,
  categories,
  suppliers,
  role,
  onRefresh
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [filterLowStock, setFilterLowStock] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [editingCatId, setEditingCatId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    barcode: '',
    categoryId: '',
    supplierId: '',
    buyPrice: 0,
    sellPrice: 0,
    stock: 0,
    minStock: 10,
    imageUrl: ''
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchCat = selectedCategory === 'ALL' || p.categoryId === selectedCategory;
    const matchLowStock = !filterLowStock || p.stock <= p.minStock;
    const q = searchQuery.toLowerCase().trim();
    const matchQ =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.barcode.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q);
    return matchCat && matchLowStock && matchQ;
  });

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      sku: `SKU-${Date.now().toString().slice(-6)}`,
      barcode: `899${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      categoryId: categories[0]?.id || '',
      supplierId: suppliers[0]?.id || '',
      buyPrice: 0,
      sellPrice: 0,
      stock: 0,
      minStock: 10,
      imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300'
    });
    setErrorMsg(null);
    setShowModal(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku,
      barcode: product.barcode,
      categoryId: product.categoryId,
      supplierId: product.supplierId || '',
      buyPrice: product.buyPrice,
      sellPrice: product.sellPrice,
      stock: product.stock,
      minStock: product.minStock,
      imageUrl: product.imageUrl || ''
    });
    setErrorMsg(null);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate uniqueness
    const duplicateSku = products.find(p => p.sku === formData.sku && p.id !== editingProduct?.id);
    const duplicateBarcode = products.find(p => p.barcode === formData.barcode && p.id !== editingProduct?.id);
    
    if (duplicateSku) {
      setErrorMsg('SKU sudah digunakan oleh produk lain.');
      return;
    }
    if (duplicateBarcode) {
      setErrorMsg('Barcode sudah digunakan oleh produk lain.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      if (editingProduct) {
        await api.updateProduct(editingProduct.id, formData);
      } else {
        await api.createProduct(formData);
      }
      onRefresh();
      setShowModal(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan produk.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (product: Product) => {
    if (window.confirm(`Yakin ingin menghapus produk "${product.name}" (${product.sku})?`)) {
      try {
        await api.deleteProduct(product.id);
        onRefresh();
      } catch (err: any) {
        alert(err.message || 'Gagal menghapus produk');
      }
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCatId) {
        await api.updateCategory(editingCatId, catName, catDesc);
      } else {
        await api.createCategory(catName, catDesc);
      }
      onRefresh();
      setCatName('');
      setCatDesc('');
      setEditingCatId(null);
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan kategori');
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (window.confirm(`Yakin ingin menghapus kategori "${name}"?`)) {
      try {
        await api.deleteCategory(id);
        onRefresh();
      } catch (err: any) {
        alert(err.message || 'Gagal menghapus kategori');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Package className="w-6 h-6 text-emerald-600" />
            <span>Master Produk & Katalog</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Kelola daftar barang, harga modal, harga jual, barcode, dan batas stok minimum.
          </p>
        </div>

        {role === 'OWNER' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setEditingCatId(null);
                setCatName('');
                setCatDesc('');
                setShowCategoryModal(true);
              }}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl flex items-center gap-2 transition-all"
            >
              <span>Kelola Kategori</span>
            </button>
            <button
              onClick={openAddModal}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/30 flex items-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Produk Baru</span>
            </button>
          </div>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari produk berdasarkan Nama, Barcode, atau SKU..."
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:text-white"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:text-white"
          >
            <option value="ALL">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Low Stock Toggle */}
          <button
            onClick={() => setFilterLowStock(!filterLowStock)}
            className={`px-3 py-2 text-xs font-bold rounded-xl border flex items-center gap-2 transition-all ${
              filterLowStock
                ? 'bg-amber-500 text-white border-amber-500'
                : 'bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Hanya Stok Menipis</span>
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-4">Produk</th>
                <th className="p-4">SKU / Barcode</th>
                <th className="p-4">Kategori</th>
                {role === 'OWNER' && <th className="p-4">Harga Modal</th>}
                <th className="p-4">Harga Jual</th>
                <th className="p-4">Stok</th>
                <th className="p-4">Status</th>
                {role === 'OWNER' && <th className="p-4 text-center">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    Tidak ada produk yang memenuhi kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isLow = p.stock <= p.minStock;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                          />
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">{p.name}</p>
                            <p className="text-[10px] text-slate-400">{p.supplierName || 'Pemasok Umum'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                        <p>{p.sku}</p>
                        <p className="text-slate-400">{p.barcode}</p>
                      </td>
                      <td className="p-4 text-slate-600 dark:text-slate-300 font-medium">
                        {p.categoryName}
                      </td>
                      {role === 'OWNER' && (
                        <td className="p-4 font-bold text-slate-700 dark:text-slate-300">
                          Rp {p.buyPrice.toLocaleString('id-ID')}
                        </td>
                      )}
                      <td className="p-4 font-extrabold text-emerald-600 dark:text-emerald-400">
                        Rp {p.sellPrice.toLocaleString('id-ID')}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 rounded-lg font-bold text-[11px] inline-flex items-center gap-1 ${
                            isLow
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                          }`}
                        >
                          {isLow && <AlertTriangle className="w-3 h-3" />}
                          {p.stock} Pcs
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {p.status}
                        </span>
                      </td>
                      {role === 'OWNER' && (
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => openEditModal(p)}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950 rounded-lg transition-colors"
                              title="Edit Produk"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p)}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-lg transition-colors"
                              title="Hapus Produk"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold">
                {editingProduct ? 'Edit Master Produk' : 'Tambah Produk Baru'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-slate-800 rounded-lg text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
              {errorMsg && (
                <div className="p-3 bg-rose-50 text-rose-600 rounded-xl border border-rose-200 font-semibold">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Produk</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none dark:text-white"
                  placeholder="Contoh: Indomie Goreng 85g"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">SKU</label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Barcode</label>
                  <input
                    type="text"
                    required
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Kategori</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl dark:text-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Supplier</label>
                  <select
                    value={formData.supplierId}
                    onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl dark:text-white"
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Harga Modal (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.buyPrice}
                    onChange={(e) => setFormData({ ...formData, buyPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Harga Jual (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.sellPrice}
                    onChange={(e) => setFormData({ ...formData, sellPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Stok Awal</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Batas Minimum Stok</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.minStock}
                    onChange={(e) => setFormData({ ...formData, minStock: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">URL Foto Produk</label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl dark:text-white"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all"
                >
                  {loading ? 'Menyimpan...' : 'Simpan Produk'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Management Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-700">
              <h3 className="font-bold text-slate-900 dark:text-white">Kelola Kategori Produk</h3>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {editingCatId ? 'Edit Nama Kategori' : 'Tambah Kategori Baru'}
                </label>
                <div className="flex gap-2 mt-1">
                  <input
                    type="text"
                    value={catName}
                    onChange={(e) => setCatName(e.target.value)}
                    placeholder="Nama kategori..."
                    required
                    className="flex-1 px-3 py-2 text-sm bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl dark:text-white"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl"
                  >
                    {editingCatId ? 'Simpan' : 'Tambah'}
                  </button>
                  {editingCatId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCatId(null);
                        setCatName('');
                        setCatDesc('');
                      }}
                      className="px-3 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl"
                    >
                      Batal
                    </button>
                  )}
                </div>
              </div>
            </form>

            <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700 border border-slate-100 dark:border-slate-700 rounded-xl">
              {categories.map((c) => (
                <div key={c.id} className="flex items-center justify-between p-3 text-sm">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{c.name}</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCatId(c.id);
                        setCatName(c.name);
                        setCatDesc(c.description || '');
                      }}
                      className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950 rounded-lg"
                      title="Edit Kategori"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(c.id, c.name)}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-lg"
                      title="Hapus Kategori"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
