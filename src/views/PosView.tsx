import React, { useState, useEffect, useRef } from 'react';
import { Search, Scan, Maximize2, Minimize2, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import { Product, Category, SaleItem, PaymentMethod, Sale, StoreSettings, User } from '../types';
import { api } from '../lib/api';

import { POSHeader } from '../components/pos/POSHeader';
import { ProductCard } from '../components/pos/ProductCard';
import { CartPanel } from '../components/pos/CartPanel';
import { PaymentModal } from '../components/pos/PaymentModal';
import { StartShiftModal } from '../components/pos/StartShiftModal';
import { CloseShiftModal } from '../components/pos/CloseShiftModal';
import { useAppData } from '../context/AppDataContext';

interface PosViewProps {
  user: User;
  products: Product[];
  categories: Category[];
  settings?: StoreSettings | null;
  storeName?: string;
  onSaleSuccess?: (sale: Sale) => void;
  onSaleComplete?: (sale: Sale) => void;
  onRefreshProducts?: () => void;
  onLogout?: () => void;
}

export const PosView: React.FC<PosViewProps> = ({
  user,
  products,
  categories,
  settings,
  storeName,
  onSaleSuccess,
  onSaleComplete,
  onRefreshProducts,
  onLogout
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  
  const [isCatalogMode, setIsCatalogMode] = useState(false);
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isCloseShiftModalOpen, setIsCloseShiftModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { currentShift, sales } = useAppData();

  const searchInputRef = useRef<HTMLInputElement>(null);
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // Keyboard Shortcuts (F2, F4, F8, F9, F10, Esc)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if inside the payment modal
      if (isPaymentModalOpen) return;

      if (e.key === 'F2') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'F4') {
        e.preventDefault();
        barcodeInputRef.current?.focus();
      } else if (e.key === 'F9') {
        e.preventDefault();
        // Focus discount input if needed, handled differently here just by setting a dummy if we had a ref
      } else if (e.key === 'F10') {
        e.preventDefault();
        if (cart.length > 0) {
          setIsPaymentModalOpen(true);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        if (cart.length > 0 && confirm('Kosongkan keranjang belanja?')) {
          setCart([]);
          setDiscountAmount(0);
          setErrorMsg(null);
          toast.info('Keranjang dikosongkan');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart, isPaymentModalOpen]);

  // Filtered Products List
  const filteredProducts = products.filter((p) => {
    if (p.status !== 'ACTIVE') return false;
    const matchCat = selectedCategory === 'ALL' || p.categoryId === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchQuery =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.barcode.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q);
    return matchCat && matchQuery;
  });

  // Cart Operations
  const addToCart = (product: Product) => {
    setErrorMsg(null);
    if (product.stock <= 0) {
      setErrorMsg(`Stok "${product.name}" telah habis!`);
      toast.error(`Stok "${product.name}" telah habis!`);
      return;
    }

    setCart((prev) => {
      const existingIdx = prev.findIndex((item) => item.productId === product.id);
      if (existingIdx > -1) {
        const currentQty = prev[existingIdx].qty;
        if (currentQty + 1 > product.stock) {
          setErrorMsg(`Stok "${product.name}" terbatas (${product.stock} pcs)!`);
          toast.error(`Stok "${product.name}" terbatas (${product.stock} pcs)!`);
          return prev;
        }
        const updated = [...prev];
        const newQty = currentQty + 1;
        updated[existingIdx] = {
          ...updated[existingIdx],
          qty: newQty,
          subtotal: newQty * product.sellPrice
        };
        toast.success(`Jumlah ${product.name} diperbarui`);
        return updated;
      } else {
        toast.success(`${product.name} ditambahkan ke keranjang`);
        return [
          ...prev,
          {
            productId: product.id,
            productName: product.name,
            sku: product.sku,
            barcode: product.barcode,
            qty: 1,
            buyPrice: product.buyPrice,
            sellPrice: product.sellPrice,
            subtotal: product.sellPrice
          }
        ];
      }
    });
  };

  const handleBarcodescan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    const matchedProduct = products.find(
      (p) => p.barcode === barcodeInput.trim() || p.sku.toLowerCase() === barcodeInput.trim().toLowerCase()
    );

    if (matchedProduct) {
      addToCart(matchedProduct);
      setBarcodeInput('');
    } else {
      setErrorMsg(`Produk dengan barcode/SKU "${barcodeInput}" tidak ditemukan!`);
    }
  };

  const updateCartQty = (productId: string, delta: number) => {
    setErrorMsg(null);
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.productId === productId) {
            const newQty = item.qty + delta;
            if (newQty > prod.stock) {
              setErrorMsg(`Stok "${prod.name}" terbatas (${prod.stock} pcs)!`);
              return item;
            }
            if (newQty <= 0) return null;
            return {
              ...item,
              qty: newQty,
              subtotal: newQty * item.sellPrice
            };
          }
          return item;
        })
        .filter(Boolean) as SaleItem[];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  // Calculations
  const subtotal = cart.reduce((acc, item) => acc + item.subtotal, 0);
  const taxPercent = settings?.taxRatePercent || 0;
  const taxAmount = Math.round((subtotal - discountAmount) * (taxPercent / 100));
  const finalAmount = Math.max(0, subtotal - discountAmount + taxAmount);

  // Checkout Handler (Triggered from PaymentModal)
  const handleCheckoutProcess = async (paymentMethod: PaymentMethod, payAmount: number) => {
    if (cart.length === 0) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const saleData = {
        shiftId: currentShift?.id,
        items: cart,
        customerName: 'Pelanggan Umum', // Simplified for this layout update
        subtotal,
        discountAmount,
        taxAmount,
        finalAmount,
        paymentMethod,
        payAmount,
        changeAmount: paymentMethod === 'CASH' ? Math.max(0, payAmount - finalAmount) : 0
      };

      const completedSale = await api.createSale(saleData);
      if (onSaleSuccess) onSaleSuccess(completedSale);
      if (onSaleComplete) onSaleComplete(completedSale);
      if (onRefreshProducts) onRefreshProducts();

      // Reset state
      setCart([]);
      setDiscountAmount(0);
      setIsPaymentModalOpen(false);
      
      toast.success('Transaksi Berhasil diproses!');
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal memproses transaksi.');
      toast.error(err.message || 'Gagal memproses transaksi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-100 dark:bg-slate-950">
      <POSHeader 
        user={user} 
        onLogout={onLogout}
        onCloseShift={() => setIsCloseShiftModalOpen(true)}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Main Product Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Controls: Search, Barcode, Catalog Toggle */}
          <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-3 top-3 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari produk / SKU (F2)..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:border-emerald-500 focus:outline-none dark:text-white transition-colors"
              />
            </div>

            <form onSubmit={handleBarcodescan} className="relative flex-1 sm:max-w-xs">
              <Scan className="w-5 h-5 absolute left-3 top-3 text-emerald-500" />
              <input
                ref={barcodeInputRef}
                type="text"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                placeholder="Scan Barcode (F4)"
                className="w-full pl-10 pr-4 py-2.5 bg-emerald-50/50 dark:bg-emerald-900/20 border-2 border-emerald-200 dark:border-emerald-800 rounded-xl focus:border-emerald-500 focus:outline-none dark:text-white font-mono transition-colors placeholder:text-emerald-600/50"
              />
            </form>

            <button
              onClick={() => setIsCatalogMode(!isCatalogMode)}
              className="px-4 py-2.5 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center gap-2 text-slate-600 dark:text-slate-300 hover:border-emerald-500 hover:text-emerald-600 transition-colors hidden lg:flex"
              title="Mode Katalog (Sembunyikan Keranjang)"
            >
              {isCatalogMode ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
          </div>

          {/* Category Pills */}
          <div className="bg-white dark:bg-slate-900 px-4 py-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
              <button
                onClick={() => setSelectedCategory('ALL')}
                className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                  selectedCategory === 'ALL'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                Semua
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            {filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 py-12">
                <ShoppingBag className="w-16 h-16 mb-4 opacity-20" />
                <p className="text-lg font-bold text-slate-600 dark:text-slate-300">Produk tidak ditemukan</p>
                <p className="text-sm">Coba kata kunci lain atau scan barcode.</p>
              </div>
            ) : (
              <div className={`grid gap-4 md:gap-6 ${isCatalogMode ? 'grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6' : 'grid-cols-2 sm:grid-cols-3 xl:grid-cols-4'}`}>
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} onAdd={addToCart} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Cart Sidebar */}
        <CartPanel
          isCatalogMode={isCatalogMode}
          isMobileCartOpen={isMobileCartOpen}
          onCloseMobileCart={() => setIsMobileCartOpen(false)}
          cart={cart}
          errorMsg={errorMsg}
          removeFromCart={removeFromCart}
          updateCartQty={updateCartQty}
          subtotal={subtotal}
          discountAmount={discountAmount}
          setDiscountAmount={setDiscountAmount}
          taxPercent={taxPercent}
          taxAmount={taxAmount}
          finalAmount={finalAmount}
          onCheckout={() => setIsPaymentModalOpen(true)}
        />
      </div>

      {/* Mobile Bottom Cart Bar */}
      {!isCatalogMode && cart.length > 0 && (
        <div className="lg:hidden fixed bottom-[60px] md:bottom-0 inset-x-0 p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-30">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex flex-col">
              <span className="text-xs text-slate-500 font-bold flex items-center gap-1"><ShoppingBag className="w-3.5 h-3.5"/> {cart.reduce((a,c)=>a+c.qty, 0)} item</span>
              <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">Rp {finalAmount.toLocaleString('id-ID')}</span>
            </div>
            <button 
              onClick={() => setIsMobileCartOpen(true)}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/30"
            >
              Lihat Keranjang
            </button>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        totalAmount={finalAmount}
        onProcessPayment={handleCheckoutProcess}
        isSubmitting={isSubmitting}
      />

      {/* Shift Management Modals */}
      {!currentShift && (
        <StartShiftModal onSuccess={() => {}} />
      )}
      
      {currentShift && isCloseShiftModalOpen && (
        <CloseShiftModal 
          shift={currentShift} 
          sales={sales}
          onClose={() => setIsCloseShiftModalOpen(false)}
          onSuccess={() => {
            setIsCloseShiftModalOpen(false);
            window.location.reload(); // Quick way to reset state and show StartShiftModal again
          }} 
        />
      )}
    </div>
  );
};
