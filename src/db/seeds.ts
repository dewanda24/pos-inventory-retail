import bcrypt from 'bcryptjs';
import {
  User,
  Category,
  Supplier,
  Product,
  StockLedgerEntry,
  GoodsInDocument,
  Sale,
  StockOpname,
  Expense,
  ExpenseCategory,
  AuditLog,
  StoreSettings,
  AppNotification
} from '../types';

export interface DatabaseData {
  users: User[];
  userPasswords: Record<string, string>;
  categories: Category[];
  suppliers: Supplier[];
  products: Product[];
  ledger: StockLedgerEntry[];
  goodsInDocs: GoodsInDocument[];
  sales: Sale[];
  opnames: StockOpname[];
  expenses: Expense[];
  expenseCategories: ExpenseCategory[];
  auditLogs: AuditLog[];
  settings: StoreSettings;
  notifications: AppNotification[];
}

export function createSeedData(): DatabaseData {
  const hashPassword = (pw: string) => bcrypt.hashSync(pw, 10);

  // Hanya simpan 1 akun Owner default. Kasir bisa ditambahkan manual dari sistem.
  const users: User[] = [
    {
      id: 'usr-owner',
      username: 'owner',
      name: 'Owner Toko',
      role: 'OWNER',
      status: 'ACTIVE',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      createdAt: new Date().toISOString()
    }
  ];

  const userPasswords: Record<string, string> = {
    'usr-owner': hashPassword('password123')
  };

  const categories: Category[] = [];
  const suppliers: Supplier[] = [];
  const products: Product[] = [];
  const ledger: StockLedgerEntry[] = [];
  const goodsInDocs: GoodsInDocument[] = [];
  const sales: Sale[] = [];
  const opnames: StockOpname[] = [];
  
  // Kategori pengeluaran standar yang umum digunakan
  const expenseCategories: ExpenseCategory[] = [
    { id: 'exp-cat-1', name: 'Operasional & Listrik/Air', type: 'KAS_KELUAR' },
    { id: 'exp-cat-2', name: 'Gaji Karyawan', type: 'KAS_KELUAR' },
    { id: 'exp-cat-3', name: 'Sewa Tempat & Perawatan', type: 'KAS_KELUAR' },
    { id: 'exp-cat-4', name: 'Tambahan Modal', type: 'KAS_MASUK' }
  ];

  const expenses: Expense[] = [];
  const auditLogs: AuditLog[] = [];
  const notifications: AppNotification[] = [];

  const settings: StoreSettings = {
    storeName: 'Vape Store / Retail POS',
    storeAddress: 'Alamat Toko Anda',
    storePhone: '0812-xxxx-xxxx',
    receiptHeader: 'Terima kasih telah berbelanja!',
    receiptFooter: 'Barang yang sudah dibeli tidak dapat ditukar/dikembalikan.',
    enableLowStockAlert: true,
    taxRatePercent: 0
  };

  return {
    users,
    userPasswords,
    categories,
    suppliers,
    products,
    ledger,
    goodsInDocs,
    sales,
    opnames,
    expenses,
    expenseCategories,
    auditLogs,
    settings,
    notifications
  };
}
