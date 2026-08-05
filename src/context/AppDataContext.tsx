import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User,
  Product,
  Category,
  Supplier,
  Sale,
  GoodsInDocument,
  StockLedgerEntry,
  StockOpname,
  Expense,
  ExpenseCategory,
  DashboardSummary,
  StoreSettings,
  NotificationItem
} from '../types';
import { api } from '../lib/api';
import { useAuth } from './AuthContext';

export interface AppDataContextType {
  summary: DashboardSummary | null;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  suppliers: Supplier[];
  setSuppliers: React.Dispatch<React.SetStateAction<Supplier[]>>;
  sales: Sale[];
  setSales: React.Dispatch<React.SetStateAction<Sale[]>>;
  goodsInDocs: GoodsInDocument[];
  setGoodsInDocs: React.Dispatch<React.SetStateAction<GoodsInDocument[]>>;
  ledger: StockLedgerEntry[];
  setLedger: React.Dispatch<React.SetStateAction<StockLedgerEntry[]>>;
  opnames: StockOpname[];
  setOpnames: React.Dispatch<React.SetStateAction<StockOpname[]>>;
  expenses: Expense[];
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
  expenseCategories: ExpenseCategory[];
  setExpenseCategories: React.Dispatch<React.SetStateAction<ExpenseCategory[]>>;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  settings: StoreSettings | null;
  setSettings: React.Dispatch<React.SetStateAction<StoreSettings | null>>;
  notifications: NotificationItem[];
  setNotifications: React.Dispatch<React.SetStateAction<NotificationItem[]>>;
  loadAppData: () => Promise<void>;
  receiptSale: Sale | null;
  setReceiptSale: (sale: Sale | null) => void;
  showNotifDrawer: boolean;
  setShowNotifDrawer: (show: boolean) => void;
  handleSaleSuccess: (sale: Sale) => void;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const { currentUser, setCurrentUser, setShowLoginModal } = useAuth();

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [goodsInDocs, setGoodsInDocs] = useState<GoodsInDocument[]>([]);
  const [ledger, setLedger] = useState<StockLedgerEntry[]>([]);
  const [opnames, setOpnames] = useState<StockOpname[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // UI Modals
  const [receiptSale, setReceiptSale] = useState<Sale | null>(null);
  const [showNotifDrawer, setShowNotifDrawer] = useState<boolean>(false);

  // Fetch all data from API
  const loadAppData = async () => {
    if (!api.getToken()) return;

    try {
      const [
        sumData,
        prodData,
        catData,
        supData,
        salesData,
        goodsData,
        ledgerData,
        opnameData,
        expData,
        expCatData,
        userData,
        settData,
        notifData
      ] = await Promise.all([
        api.getDashboardSummary(),
        api.getProducts(),
        api.getCategories(),
        api.getSuppliers(),
        api.getSales(),
        api.getGoodsInDocs(),
        currentUser?.role === 'OWNER' ? api.getLedger() : Promise.resolve([]),
        api.getOpnames(),
        currentUser?.role === 'OWNER' ? api.getExpenses() : Promise.resolve([]),
        currentUser?.role === 'OWNER' ? api.getExpenseCategories() : Promise.resolve([]),
        currentUser?.role === 'OWNER' ? api.getUsers() : Promise.resolve([]),
        api.getSettings(),
        api.getNotifications()
      ]);

      setSummary(sumData);
      setProducts(prodData);
      setCategories(catData);
      setSuppliers(supData);
      setSales(salesData);
      setGoodsInDocs(goodsData);
      setLedger(ledgerData);
      setOpnames(opnameData);
      setExpenses(expData);
      setExpenseCategories(expCatData);
      if (userData.length > 0) setUsers(userData);
      setSettings(settData);
      setNotifications(notifData);
    } catch (err: any) {
      console.error('Error loading app data:', err);
      if (err.message?.includes('401') || err.message?.includes('Unauthorized')) {
        api.logout();
        setCurrentUser(null);
        setShowLoginModal(true);
      }
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadAppData();
    }
  }, [currentUser]);

  const handleSaleSuccess = (sale: Sale) => {
    setReceiptSale(sale);
    loadAppData();
  };

  return (
    <AppDataContext.Provider
      value={{
        summary,
        products,
        setProducts,
        categories,
        setCategories,
        suppliers,
        setSuppliers,
        sales,
        setSales,
        goodsInDocs,
        setGoodsInDocs,
        ledger,
        setLedger,
        opnames,
        setOpnames,
        expenses,
        setExpenses,
        expenseCategories,
        setExpenseCategories,
        users,
        setUsers,
        settings,
        setSettings,
        notifications,
        setNotifications,
        loadAppData,
        receiptSale,
        setReceiptSale,
        showNotifDrawer,
        setShowNotifDrawer,
        handleSaleSuccess
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData(): AppDataContextType {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
}
