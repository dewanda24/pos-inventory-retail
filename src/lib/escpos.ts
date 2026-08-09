import { Sale, StoreSettings } from '../types';

export class EscPosEncoder {
  private buffer: number[] = [];

  constructor() {
    this.initialize();
  }

  public initialize() {
    this.buffer.push(0x1b, 0x40); // ESC @
    return this;
  }

  public alignLeft() {
    this.buffer.push(0x1b, 0x61, 0x00); // ESC a 0
    return this;
  }

  public alignCenter() {
    this.buffer.push(0x1b, 0x61, 0x01); // ESC a 1
    return this;
  }

  public alignRight() {
    this.buffer.push(0x1b, 0x61, 0x02); // ESC a 2
    return this;
  }

  public bold(on: boolean) {
    this.buffer.push(0x1b, 0x45, on ? 1 : 0); // ESC E n
    return this;
  }

  public newline(count: number = 1) {
    for (let i = 0; i < count; i++) {
      this.buffer.push(0x0a); // LF
    }
    return this;
  }

  public text(text: string) {
    // Basic ASCII encoding. For extended characters, a specific code page encoder is needed.
    const encoder = new TextEncoder();
    const encoded = encoder.encode(text);
    for (let i = 0; i < encoded.length; i++) {
      this.buffer.push(encoded[i]);
    }
    return this;
  }

  public textLine(text: string) {
    return this.text(text).newline();
  }

  public cut() {
    this.buffer.push(0x1d, 0x56, 0x41, 0x03); // GS V A 3 (partial cut with feed)
    return this;
  }

  public encode(): Uint8Array {
    return new Uint8Array(this.buffer);
  }
}

export function generateReceiptBuffer(sale: Sale, settings: StoreSettings | null): Uint8Array {
  const encoder = new EscPosEncoder();
  const width = 32; // Assuming 32 chars width for 58mm printer

  // Helper to format left/right columns
  const row = (left: string, right: string) => {
    let spaces = width - left.length - right.length;
    if (spaces < 1) spaces = 1;
    return left + ' '.repeat(spaces) + right;
  };

  const hr = '-'.repeat(width);

  // Header
  encoder.alignCenter().bold(true);
  encoder.textLine(settings?.storeName || 'TOKO BERKAH RETAIL');
  encoder.bold(false);
  if (settings?.storeAddress) encoder.textLine(settings.storeAddress);
  if (settings?.storePhone) encoder.textLine(`Telp: ${settings.storePhone}`);
  encoder.textLine(hr);
  
  // Metadata
  encoder.alignLeft();
  encoder.textLine(row('No. Nota:', sale.invoiceNo));
  encoder.textLine(row('Tanggal:', new Date(sale.date).toLocaleString('id-ID')));
  encoder.textLine(row('Kasir:', sale.userName));
  if (sale.customerName) encoder.textLine(row('Pelanggan:', sale.customerName));
  encoder.textLine(hr);

  // Items
  for (const item of sale.items) {
    encoder.textLine(item.productName);
    const detailLeft = `${item.qty} x ${item.sellPrice.toLocaleString('id-ID')}`;
    const detailRight = `${item.subtotal.toLocaleString('id-ID')}`;
    encoder.textLine(row(`  ${detailLeft}`, detailRight));
  }
  encoder.textLine(hr);

  // Totals
  encoder.textLine(row('Subtotal:', sale.subtotal.toLocaleString('id-ID')));
  if (sale.discountAmount > 0) {
    encoder.textLine(row('Diskon:', `-${sale.discountAmount.toLocaleString('id-ID')}`));
  }
  encoder.bold(true);
  encoder.textLine(row('TOTAL:', sale.finalAmount.toLocaleString('id-ID')));
  encoder.bold(false);
  
  encoder.textLine(row('Metode Bayar:', sale.paymentMethod));
  encoder.textLine(row('Bayar:', sale.payAmount.toLocaleString('id-ID')));
  encoder.textLine(row('Kembalian:', sale.changeAmount.toLocaleString('id-ID')));
  encoder.textLine(hr);

  // Footer
  encoder.alignCenter();
  if (settings?.receiptHeader) encoder.textLine(settings.receiptHeader);
  if (settings?.receiptFooter) encoder.textLine(settings.receiptFooter);
  
  // Feed & Cut
  encoder.newline(3).cut();

  return encoder.encode();
}
