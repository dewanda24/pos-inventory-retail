import React, { useState } from 'react';
import { Printer, CheckCircle2, X, Download, Bluetooth, Usb, Loader2, AlertCircle } from 'lucide-react';
import { Sale, StoreSettings } from '../types';
import { useThermalPrinter } from '../hooks/useThermalPrinter';
import { generateReceiptBuffer } from '../lib/escpos';

interface ReceiptModalProps {
  sale: Sale;
  settings: StoreSettings | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ sale, settings, onClose }) => {
  const { isPrinting, error, printViaBluetooth, printViaUSB } = useThermalPrinter();
  const [showOptions, setShowOptions] = useState(false);

  const handlePrintBrowser = () => {
    window.print();
  };

  const handlePrintBT = async () => {
    const buffer = generateReceiptBuffer(sale, settings);
    await printViaBluetooth(buffer);
  };

  const handlePrintUSB = async () => {
    const buffer = generateReceiptBuffer(sale, settings);
    await printViaUSB(buffer);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="w-full max-w-sm bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-4 py-3 bg-emerald-600 text-white flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-200" />
            <h3 className="text-sm font-bold">Transaksi Berhasil</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-emerald-700 rounded-lg text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Thermal Printable Area */}
        <div className="p-6 overflow-y-auto font-mono text-xs space-y-3 bg-slate-50 text-slate-900 leading-tight print-area">
          {/* Store Info Header */}
          <div className="text-center space-y-1 pb-2 border-b border-dashed border-slate-300">
            <h2 className="text-sm font-bold uppercase tracking-wide">
              {settings?.storeName || 'TOKO BERKAH RETAIL'}
            </h2>
            <p className="text-[10px] text-slate-600">{settings?.storeAddress}</p>
            <p className="text-[10px] text-slate-600">Telp: {settings?.storePhone}</p>
          </div>

          {/* Transaction Metadata */}
          <div className="space-y-0.5 text-[11px] pb-2 border-b border-dashed border-slate-300">
            <div className="flex justify-between">
              <span>No. Nota:</span>
              <span className="font-bold">{sale.invoiceNo}</span>
            </div>
            <div className="flex justify-between">
              <span>Tanggal:</span>
              <span>{new Date(sale.date).toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between">
              <span>Kasir:</span>
              <span>{sale.userName}</span>
            </div>
            {sale.customerName && (
              <div className="flex justify-between">
                <span>Pelanggan:</span>
                <span>{sale.customerName}</span>
              </div>
            )}
          </div>

          {/* Itemized Table */}
          <div className="space-y-2 py-1 border-b border-dashed border-slate-300">
            {sale.items.map((item, idx) => (
              <div key={idx} className="space-y-0.5">
                <p className="font-semibold">{item.productName}</p>
                <div className="flex justify-between text-[10px] text-slate-600 pl-2">
                  <span>
                    {item.qty} x Rp {item.sellPrice.toLocaleString('id-ID')}
                  </span>
                  <span className="font-bold text-slate-900">
                    Rp {item.subtotal.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="space-y-1 text-xs pt-1">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>Rp {sale.subtotal.toLocaleString('id-ID')}</span>
            </div>
            {sale.discountAmount > 0 && (
              <div className="flex justify-between text-rose-600">
                <span>Diskon:</span>
                <span>- Rp {sale.discountAmount.toLocaleString('id-ID')}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-sm pt-1 border-t border-slate-300">
              <span>TOTAL TAGIHAN:</span>
              <span>Rp {sale.finalAmount.toLocaleString('id-ID')}</span>
            </div>

            <div className="flex justify-between pt-1 text-[11px]">
              <span>Metode Bayar:</span>
              <span className="font-bold">{sale.paymentMethod}</span>
            </div>

            <div className="flex justify-between text-[11px]">
              <span>Bayar:</span>
              <span>Rp {sale.payAmount.toLocaleString('id-ID')}</span>
            </div>

            <div className="flex justify-between text-[11px] font-bold text-emerald-700">
              <span>Kembalian:</span>
              <span>Rp {sale.changeAmount.toLocaleString('id-ID')}</span>
            </div>
          </div>

          {/* Footer Note */}
          <div className="text-center pt-3 border-t border-dashed border-slate-300 text-[10px] text-slate-500 space-y-1">
            <p>{settings?.receiptHeader}</p>
            <p>{settings?.receiptFooter}</p>
            <p className="pt-2 text-[9px] text-slate-400">=== POS Retail System Powered by AI Studio ===</p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mx-4 mb-0 mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-semibold flex items-start gap-2 no-print">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Modal Action Buttons */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex flex-col gap-2 no-print">
          {showOptions ? (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handlePrintBT}
                disabled={isPrinting}
                className="py-2 px-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-[10px] font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all"
              >
                {isPrinting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Bluetooth className="w-3 h-3" />}
                <span>Bluetooth</span>
              </button>
              <button
                onClick={handlePrintUSB}
                disabled={isPrinting}
                className="py-2 px-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-[10px] font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all"
              >
                {isPrinting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Usb className="w-3 h-3" />}
                <span>USB/Serial</span>
              </button>
              <button
                onClick={handlePrintBrowser}
                className="col-span-2 py-2 px-2 bg-slate-600 hover:bg-slate-700 text-white text-[10px] font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all"
              >
                <Printer className="w-3 h-3" />
                <span>Printer Standar (Browser Dialog)</span>
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => setShowOptions(true)}
                className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Struk / Print</span>
              </button>
              <button
                onClick={onClose}
                className="py-2 px-4 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-all"
              >
                Tutup
              </button>
            </div>
          )}
          {showOptions && (
            <button
              onClick={onClose}
              className="w-full py-2 px-4 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-all"
            >
              Tutup
            </button>
          )}
        </div>
      </div>

      {/* Print Specific CSS */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-area, .print-area * {
            visibility: visible;
          }
          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 80mm;
            padding: 10px;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};
