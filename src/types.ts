export type UserRole = 'OWNER' | 'KASIR';
export type UserStatus = 'ACTIVE' | 'INACTIVE';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  avatar?: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface Supplier {
  id: string;
  code: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  notes?: string;
}

export interface Product {
  id: string;
  sku: string;
  barcode: string;
  name: string;
  categoryId: string;
  categoryName?: string;
  supplierId?: string;
  supplierName?: string;
  buyPrice: number;
  sellPrice: number;
  stock: number;
  minStock: number;
  status: 'ACTIVE' | 'INACTIVE';
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export type LedgerTransactionType = 
  | 'BARANG_MASUK' 
  | 'PENJUALAN' 
  | 'STOCK_OPNAME' 
  | 'ADJUSTMENT' 
  | 'RETURN';

export interface StockLedgerEntry {
  id: string;
  date: string;
  productId: string;
  productName: string;
  sku: string;
  type: LedgerTransactionType;
  qtyChange: number;
  qtyBefore: number;
  qtyAfter: number;
  referenceNo: string;
  buyPrice: number;
  notes?: string;
  userId: string;
  userName: string;
  createdAt: string;
}

export interface GoodsInItem {
  productId: string;
  productName?: string;
  sku?: string;
  qty: number;
  buyPrice: number;
  subtotal: number;
}

export interface GoodsInDocument {
  id: string;
  docNo: string;
  date: string;
  supplierId: string;
  supplierName: string;
  items: GoodsInItem[];
  totalAmount: number;
  notes?: string;
  userId: string;
  userName: string;
  createdAt: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  sku: string;
  barcode: string;
  qty: number;
  buyPrice: number;
  sellPrice: number;
  subtotal: number;
}

export type PaymentMethod = 'CASH' | 'QRIS' | 'DEBIT' | 'TRANSFER';

export interface Sale {
  id: string;
  invoiceNo: string;
  date: string;
  shiftId?: string;
  userId: string;
  userName: string;
  customerName?: string;
  items: SaleItem[];
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  finalAmount: number;
  paymentMethod: PaymentMethod;
  payAmount: number;
  changeAmount: number;
  status: 'COMPLETED' | 'CANCELLED';
  createdAt: string;
}

export type OpnameStatus = 'DRAFT' | 'APPROVED' | 'REJECTED';

export interface OpnameItem {
  productId: string;
  productName: string;
  sku: string;
  systemQty: number;
  physicalQty: number;
  difference: number;
  buyPrice: number;
  notes?: string;
}

export interface StockOpname {
  id: string;
  docNo: string;
  date: string;
  status: OpnameStatus;
  items: OpnameItem[];
  notes?: string;
  createdBy: string;
  createdByName: string;
  approvedBy?: string;
  approvedByName?: string;
  approvedAt?: string;
  createdAt: string;
}

export type ExpenseType = 'KAS_KELUAR' | 'KAS_MASUK';

export interface Expense {
  id: string;
  docNo: string;
  date: string;
  categoryId: string;
  categoryName: string;
  type: ExpenseType;
  amount: number;
  description: string;
  userId: string;
  userName: string;
  createdAt: string;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  type: ExpenseType;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  module: string;
  details: string;
  ip?: string;
  device?: string;
}

export interface StoreSettings {
  storeName: string;
  storeAddress: string;
  storePhone: string;
  receiptHeader: string;
  receiptFooter: string;
  enableLowStockAlert: boolean;
  taxRatePercent: number;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'LOW_STOCK' | 'OPNAME_PENDING' | 'SYSTEM';
  read: boolean;
  createdAt: string;
}

export type NotificationItem = AppNotification;

export interface DashboardSummary {
  todayOmzet: number;
  todayGrossProfit: number;
  todayNetProfit: number;
  todayExpenses: number;
  todayTransactionsCount: number;
  todayItemsSold: number;
  lowStockCount: number;
  totalProductsCount: number;
  totalStockValue: number;
  salesChartData: { date: string; omzet: number; count: number; grossProfit: number; netProfit: number }[];
  topSellingProducts: { productId: string; name: string; qtySold: number; totalOmzet: number }[];
  recentGoodsIn: GoodsInDocument[];
  recentLogs: AuditLog[];
  notifications: AppNotification[];
}

export interface CashierShift {
  id: string;
  userId: string;
  userName: string;
  startTime: string;
  endTime?: string;
  startingCash: number;
  expectedEndingCash?: number;
  actualEndingCash?: number;
  difference?: number;
  status: 'OPEN' | 'CLOSED';
  notes?: string;
}

