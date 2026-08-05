import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Product } from '../../types';

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAdd }) => {
  const [imgError, setImgError] = useState(false);
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock <= product.minStock;

  return (
    <button
      onClick={() => onAdd(product)}
      disabled={isOutOfStock}
      className={`p-3 rounded-2xl bg-white dark:bg-slate-900 border text-left transition-all flex flex-col justify-between group relative overflow-hidden ${
        isOutOfStock
          ? 'opacity-60 border-slate-200 dark:border-slate-800 cursor-not-allowed'
          : 'border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-md active:scale-98'
      }`}
    >
      <div>
        {/* Image Thumbnail */}
        <div className="w-full aspect-square rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden mb-2 relative flex items-center justify-center">
          {!imgError ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              onError={() => setImgError(true)}
              className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="text-slate-300 dark:text-slate-600 text-[10px] font-bold tracking-widest uppercase">
              NO IMAGE
            </div>
          )}
          {isLowStock && !isOutOfStock && (
            <span className="absolute top-1 left-1 bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow-xs">
              Stok {product.stock}
            </span>
          )}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-slate-950/70 text-white text-xs font-bold flex items-center justify-center">
              HABIS
            </div>
          )}
          {!isOutOfStock && !isLowStock && (
            <span className="absolute top-1 left-1 bg-slate-800/80 backdrop-blur-sm text-emerald-400 text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow-xs">
              Stok {product.stock}
            </span>
          )}
        </div>

        <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2 leading-tight mt-2">
          {product.name}
        </p>
        <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">{product.sku}</p>
      </div>

      <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
        <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
          Rp {product.sellPrice.toLocaleString('id-ID')}
        </span>
        <span className="w-6 h-6 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
          <Plus className="w-3.5 h-3.5" />
        </span>
      </div>
    </button>
  );
};
