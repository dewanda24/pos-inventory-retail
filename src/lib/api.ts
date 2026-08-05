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
  AppNotification,
  DashboardSummary
} from '../types';

const TOKEN_KEY = 'pos_retail_auth_token';
const USER_KEY = 'pos_retail_user_data';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): User | null {
  const u = localStorage.getItem(USER_KEY);
  return u ? JSON.parse(u) : null;
}

export function setAuthSession(token: string, user: User) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuthSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>)
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      if (endpoint !== '/api/auth/login') {
        clearAuthSession();
        window.location.reload();
      }
    }
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  return data as T;
}

export const api = {
  getToken: () => getStoredToken(),
  logout: () => clearAuthSession(),

  // Auth
  login: (username: string, passwordPlain: string) =>
    request<{ user: User; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password: passwordPlain })
    }),

  getCurrentUser: () => request<{ user: User }>('/api/auth/me'),

  // Users
  getUsers: () => request<User[]>('/api/users'),
  createUser: (user: any) =>
    request<User>('/api/users', {
      method: 'POST',
      body: JSON.stringify(user)
    }),
  updateUser: (id: string, updates: any) =>
    request<User>(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    }),
  deleteUser: (id: string) =>
    request<{ success: boolean }>(`/api/users/${id}`, {
      method: 'DELETE'
    }),

  // Categories & Suppliers
  getCategories: () => request<Category[]>('/api/categories'),
  createCategory: (name: string, description?: string) =>
    request<Category>('/api/categories', {
      method: 'POST',
      body: JSON.stringify({ name, description })
    }),
  updateCategory: (id: string, name: string, description?: string) =>
    request<Category>(`/api/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name, description })
    }),
  deleteCategory: (id: string) =>
    request<{ success: boolean }>(`/api/categories/${id}`, {
      method: 'DELETE'
    }),

  getSuppliers: () => request<Supplier[]>('/api/suppliers'),
  createSupplier: (supplier: Omit<Supplier, 'id' | 'code'>) =>
    request<Supplier>('/api/suppliers', {
      method: 'POST',
      body: JSON.stringify(supplier)
    }),
  updateSupplier: (id: string, supplier: Partial<Supplier>) =>
    request<Supplier>(`/api/suppliers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(supplier)
    }),
  deleteSupplier: (id: string) =>
    request<{ success: boolean }>(`/api/suppliers/${id}`, {
      method: 'DELETE'
    }),

  // Products
  getPublicCatalog: async () => {
    // Make a raw fetch without auth header for public catalog
    const res = await fetch('/api/public/catalog', {
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) throw new Error('Failed to load public catalog');
    return res.json() as Promise<{ products: Product[]; categories: Category[] }>;
  },
  getProducts: () => request<Product[]>('/api/products'),
  createProduct: (product: Partial<Product>) =>
    request<Product>('/api/products', {
      method: 'POST',
      body: JSON.stringify(product)
    }),
  updateProduct: (id: string, updates: Partial<Product>) =>
    request<Product>(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    }),
  deleteProduct: (id: string) =>
    request<{ success: boolean }>(`/api/products/${id}`, {
      method: 'DELETE'
    }),

  // Goods In & Ledger
  getGoodsInDocs: () => request<GoodsInDocument[]>('/api/goods-in'),
  createGoodsInDoc: (doc: any) =>
    request<GoodsInDocument>('/api/goods-in', {
      method: 'POST',
      body: JSON.stringify(doc)
    }),
  getLedger: () => request<StockLedgerEntry[]>('/api/ledger'),
  getRestockList: () => request<Product[]>('/api/restock-list'),

  // POS & Sales
  getSales: () => request<Sale[]>('/api/sales'),
  createSale: (saleData: any) =>
    request<Sale>('/api/sales', {
      method: 'POST',
      body: JSON.stringify(saleData)
    }),

  // Opname
  getOpnames: () => request<StockOpname[]>('/api/opname'),
  createOpname: (opnameData: any) =>
    request<StockOpname>('/api/opname', {
      method: 'POST',
      body: JSON.stringify(opnameData)
    }),
  approveOpname: (id: string) =>
    request<StockOpname>(`/api/opname/${id}/approve`, {
      method: 'POST'
    }),
  rejectOpname: (id: string) =>
    request<StockOpname>(`/api/opname/${id}/reject`, {
      method: 'POST'
    }),

  // Expenses & Financials
  getExpenses: async () => {
    const res = await request<{ expenses: Expense[]; categories: ExpenseCategory[] }>('/api/expenses');
    return res.expenses;
  },
  getExpenseCategories: async () => {
    const res = await request<{ expenses: Expense[]; categories: ExpenseCategory[] }>('/api/expenses');
    return res.categories;
  },
  createExpense: (expense: any) =>
    request<Expense>('/api/expenses', {
      method: 'POST',
      body: JSON.stringify(expense)
    }),
  deleteExpense: (id: string) =>
    request<{ success: boolean }>(`/api/expenses/${id}`, {
      method: 'DELETE'
    }),

  // Dashboard & System
  getDashboardSummary: () => request<DashboardSummary>('/api/dashboard'),
  getAuditLogs: () => request<AuditLog[]>('/api/audit-logs'),
  getSettings: () => request<StoreSettings>('/api/settings'),
  updateSettings: (settings: Partial<StoreSettings>) =>
    request<StoreSettings>('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    }),
  getNotifications: () => request<AppNotification[]>('/api/notifications'),
  markNotificationRead: (id: string) =>
    request<{ success: boolean }>(`/api/notifications/${id}/read`, {
      method: 'PUT'
    }),
  getBackupUrl: () => '/api/system/backup',
  restoreBackup: (backupData: any) =>
    request<{ success: boolean }>('/api/system/restore', {
      method: 'POST',
      body: JSON.stringify({ backupData })
    })
};
