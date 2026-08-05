import React from 'react';
import { ShoppingBag, AlertCircle, Trash2, Minus, Plus } from 'lucide-react';
import { SaleItem } from '../../types';

interface CartPanelProps {
  cart: SaleItem[];
  errorMsg: string | null;
  removeFromCart: (productId: string) => void;
  updateCartQty: (productId: string, delta: number) => void;
  subtotal: number;
  discountAmount: number;
  setDiscountAmount: (val: number) => void;
  taxPercent: number;
  taxAmount: number;
  finalAmount: number;
  onCheckout: () => void;
  isCatalogMode?: boolean;
  isMobileCartOpen?: boolean;
  onCloseMobileCart?: () => void;
}

export const CartPanel: React.FC<CartPanelProps> = ({
  cart,
  errorMsg,
  removeFromCart,
  updateCartQty,
  subtotal,
  discountAmount,
  setDiscountAmount,
  taxPercent,
  taxAmount,
  finalAmount,
  onCheckout,
  isCatalogMode,
  isMobileCartOpen = false,
  onCloseMobileCart
}) => {
  if (isCatalogMode && !isMobileCartOpen) return null;

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileCartOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={onCloseMobileCart}
        />
      )}
      
      <div className={`
        fixed inset-y-0 right-0 z-50 w-full sm:w-[380px] lg:static lg:w-[380px] lg:z-auto
        flex flex-col h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl lg:shadow-lg
        transition-transform duration-300 ease-in-out
        ${isMobileCartOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        ${isCatalogMode ? 'lg:hidden' : 'lg:flex'}
      `}>
        {/* Cart Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-emerald-400" />
            <h2 className="text-sm font-bold">Keranjang Belanja</h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold bg-slate-800 px-2.5 py-0.5 rounded-full text-emerald-300">
              {cart.reduce((acc, i) => acc + i.qty, 0)} item
            </span>
            {onCloseMobileCart && (
              <button onClick={onCloseMobileCart} className="lg:hidden p-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300">
                {/* Close Icon equivalent using SVG for simplicity since X is not imported from lucide */}
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            )}
          </div>
        </div>

      {/* Error Notification */}
      {errorMsg && (
        <div className="mx-4 mt-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-600 dark:text-rose-300 flex items-center gap-2 animate-shake">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span className="flex-1">{errorMsg}</span>
        </div>
      )}

      {/* Items List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <ShoppingBag className="w-16 h-16 mx-auto mb-3 opacity-20" />
            <p className="text-sm font-bold text-slate-500">Keranjang masih kosong</p>
            <p className="text-xs mt-1 text-center max-w-[200px]">Pilih produk atau scan barcode untuk menambahkan barang.</p>
          </div>
        ) : (
          cart.map((item) => (
            <div
              key={item.productId}
              className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800/50 shadow-xs flex items-center gap-3"
            >
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {item.productName}
                </h4>
                <p className="text-[10px] text-slate-400 font-mono">
                  @ Rp {item.sellPrice.toLocaleString('id-ID')}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateCartQty(item.productId, -1)}
                      className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold w-6 text-center text-slate-900 dark:text-white">
                      {item.qty}
                    </span>
                    <button
                      onClick={() => updateCartQty(item.productId, 1)}
                      className="w-6 h-6 rounded-md bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                    Rp {item.subtotal.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
              <button
                onClick={() => removeFromCart(item.productId)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-950/50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Cart Footer */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 space-y-3">
        <div className="space-y-2 text-xs">
          <div className="flex justify-between text-slate-500 font-medium">
            <span>Subtotal</span>
            <span className="text-slate-900 dark:text-white font-bold">Rp {subtotal.toLocaleString('id-ID')}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Diskon</span>
            <div className="flex items-center gap-1">
              <span className="text-slate-400">Rp</span>
              <input
                type="number"
                min="0"
                max={subtotal}
                value={discountAmount || ''}
                onChange={(e) => setDiscountAmount(Number(e.target.value))}
                className="w-20 text-right px-2 py-1 text-xs font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded focus:ring-1 focus:ring-emerald-500 focus:outline-none dark:text-white"
                placeholder="0"
              />
            </div>
          </div>

          {taxPercent > 0 && (
            <div className="flex justify-between text-slate-500 font-medium">
              <span>Pajak ({taxPercent}%)</span>
              <span className="text-slate-900 dark:text-white font-bold">Rp {taxAmount.toLocaleString('id-ID')}</span>
            </div>
          )}
        </div>

        <div className="flex justify-between items-end pt-3 border-t border-slate-200 dark:border-slate-700">
          <span className="text-sm font-bold text-slate-500 uppercase">Total</span>
          <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 leading-none">
            Rp {finalAmount.toLocaleString('id-ID')}
          </span>
        </div>

        <button
          onClick={() => {
             if (onCloseMobileCart) onCloseMobileCart();
             onCheckout();
          }}
          disabled={cart.length === 0}
          className="w-full py-4 mt-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:shadow-none"
        >
          F10 BAYAR
        </button>
      </div>
      </div>
    </>
  );
};
