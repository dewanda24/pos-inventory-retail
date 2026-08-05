import { MongoClient, Db, ObjectId } from 'mongodb';
import dns from 'dns';
import tls from 'tls';

// Fix Node.js 24 + MongoDB Atlas compatibility issues (DNS querySrv ECONNREFUSED and TLS Alert 80)
try {
  tls.DEFAULT_MAX_VERSION = 'TLSv1.2';
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {
  console.warn('Failed to apply network workarounds:', e);
}
import bcrypt from 'bcryptjs';
import {
  User, Category, Supplier, Product, StockLedgerEntry, GoodsInDocument,
  Sale, StockOpname, Expense, ExpenseCategory, AuditLog, StoreSettings,
  AppNotification, DashboardSummary
} from '../types';
import { createSeedData } from './seeds';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = 'vape_retail_db';

export class DBStore {
  private client: MongoClient;
  public db!: Db;
  private isConnected = false;

  constructor() {
    this.client = new MongoClient(MONGODB_URI);
  }

  public async connect() {
    if (this.isConnected) return;
    try {
      await this.client.connect();
      this.db = this.client.db(DB_NAME);
      this.isConnected = true;
      console.log('Successfully connected to MongoDB');
      await this.initializeSeedsIfNeeded();
    } catch (err) {
      console.error('Failed to connect to MongoDB', err);
    }
  }

  private async initializeSeedsIfNeeded() {
    const usersCount = await this.db.collection('users').countDocuments();
    if (usersCount === 0) {
      console.log('Database is empty. Seeding initial data...');
      const seed = createSeedData();
      
      if (seed.users.length > 0) await this.db.collection('users').insertMany(seed.users);
      if (seed.categories.length > 0) await this.db.collection('categories').insertMany(seed.categories);
      if (seed.suppliers.length > 0) await this.db.collection('suppliers').insertMany(seed.suppliers);
      if (seed.products.length > 0) await this.db.collection('products').insertMany(seed.products);
      if (seed.ledger.length > 0) await this.db.collection('ledger').insertMany(seed.ledger);
      if (seed.goodsInDocs.length > 0) await this.db.collection('goodsInDocs').insertMany(seed.goodsInDocs);
      if (seed.sales.length > 0) await this.db.collection('sales').insertMany(seed.sales);
      if (seed.opnames.length > 0) await this.db.collection('opnames').insertMany(seed.opnames);
      if (seed.expenses.length > 0) await this.db.collection('expenses').insertMany(seed.expenses);
      if (seed.expenseCategories.length > 0) await this.db.collection('expenseCategories').insertMany(seed.expenseCategories);
      if (seed.auditLogs.length > 0) await this.db.collection('auditLogs').insertMany(seed.auditLogs);
      if (seed.notifications.length > 0) await this.db.collection('notifications').insertMany(seed.notifications);
      await this.db.collection('settings').updateOne({ id: 'store-settings' }, { $set: seed.settings }, { upsert: true });

      for (const [userId, hash] of Object.entries(seed.userPasswords)) {
        await this.db.collection('userPasswords').updateOne({ userId }, { $set: { userId, hash } }, { upsert: true });
      }
      console.log('Seeding complete.');
    }
  }

  public async addAuditLog(userId: string, userName: string, userRole: any, action: string, module: string, details: string, ip = '127.0.0.1', device = 'Web Application') {
    const log: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      userId, userName, userRole, action, module, details, ip, device
    };
    await this.db.collection('auditLogs').insertOne(log);
    return log;
  }

  // --- Auth Methods ---
  public async findUserByUsername(username: string) {
    return this.db.collection<User>('users').findOne({ username });
  }

  public async verifyPassword(userId: string, passwordPlain: string) {
    const record = await this.db.collection('userPasswords').findOne({ userId });
    if (!record) return false;
    return bcrypt.compare(passwordPlain, record.hash);
  }

  public async recordStockLedgerEntry(productId: string, type: StockLedgerEntry['type'], qtyChange: number, referenceNo: string, notes: string, userId: string, userName: string) {
    const product = await this.db.collection('products').findOne({ id: productId });
    if (!product) throw new Error(`Produk dengan ID ${productId} tidak ditemukan.`);
    
    const qtyBefore = product.stock;
    const qtyAfter = qtyBefore + qtyChange;
    if (qtyAfter < 0 && type === 'PENJUALAN') {
      throw new Error(`Stok produk "${product.name}" tidak mencukupi (Tersisa: ${qtyBefore}, Diminta: ${Math.abs(qtyChange)})`);
    }

    await this.db.collection('products').updateOne(
      { id: productId },
      { $set: { stock: qtyAfter, updatedAt: new Date().toISOString() } }
    );

    const ledgerEntry: StockLedgerEntry = {
      id: `ledg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      date: new Date().toISOString(),
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      type, qtyChange, qtyBefore, qtyAfter, referenceNo,
      buyPrice: product.buyPrice, notes, userId, userName,
      createdAt: new Date().toISOString()
    };
    await this.db.collection('ledger').insertOne(ledgerEntry);

    if (qtyAfter <= product.minStock) {
      const existing = await this.db.collection('notifications').findOne({ type: 'LOW_STOCK', message: { $regex: product.name }, read: false });
      if (!existing) {
        await this.db.collection('notifications').insertOne({
          id: `notif-${Date.now()}`,
          title: 'Peringatan Stok Menipis',
          message: `Stok "${product.name}" tersisa ${qtyAfter} pcs (Min: ${product.minStock}).`,
          type: 'LOW_STOCK', read: false, createdAt: new Date().toISOString()
        });
      }
    }
  }

  public async findUserByUsername(username: string): Promise<User | null> {
    return this.db.collection<User>('users').findOne({ username: { $regex: new RegExp('^' + username + '$', 'i') } });
  }

  public async verifyPassword(userId: string, passwordPlain: string): Promise<boolean> {
    const record = await this.db.collection('userPasswords').findOne({ userId });
    if (!record) return false;
    return bcrypt.compareSync(passwordPlain, record.hash);
  }

  public async createUser(user: Omit<User, 'id' | 'createdAt'>, passwordPlain: string): Promise<User> {
    const id = `usr-${Date.now()}`;
    const newUser: User = { ...user, id, createdAt: new Date().toISOString() };
    await this.db.collection('users').insertOne(newUser);
    const hash = bcrypt.hashSync(passwordPlain, 10);
    await this.db.collection('userPasswords').insertOne({ userId: id, hash });
    return newUser;
  }

  public async updateUser(id: string, updates: Partial<User>, passwordPlain?: string): Promise<User> {
    await this.db.collection('users').updateOne({ id }, { $set: updates });
    if (passwordPlain) {
      const hash = bcrypt.hashSync(passwordPlain, 10);
      await this.db.collection('userPasswords').updateOne({ userId: id }, { $set: { hash } });
    }
    return this.db.collection<User>('users').findOne({ id }) as Promise<User>;
  }
  
  public async deleteUser(id: string, reqUserId: string): Promise<boolean> {
    if (id === reqUserId) throw new Error('Tidak dapat menghapus akun Anda sendiri saat sedang login.');
    const target = await this.db.collection<User>('users').findOne({ id });
    if (!target) throw new Error('Pengguna tidak ditemukan.');
    if (target.role === 'OWNER') {
      const count = await this.db.collection('users').countDocuments({ role: 'OWNER' });
      if (count <= 1) throw new Error('Tidak dapat menghapus satu-satunya akun OWNER toko.');
    }
    await this.db.collection('users').deleteOne({ id });
    await this.db.collection('userPasswords').deleteOne({ userId: id });
    return true;
  }

  public async getProducts(): Promise<Product[]> {
    return this.db.collection<Product>('products').find().sort({ createdAt: -1 }).toArray();
  }

  public async createProduct(prod: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>, userId: string, userName: string): Promise<Product> {
    const id = `prod-${Date.now()}`;
    const newProduct: Product = { ...prod, id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    await this.db.collection('products').insertOne(newProduct);
    if (newProduct.stock > 0) {
      await this.db.collection('ledger').insertOne({
        id: `ledg-${Date.now()}`, date: new Date().toISOString(),
        productId: newProduct.id, productName: newProduct.name, sku: newProduct.sku,
        type: 'BARANG_MASUK', qtyChange: newProduct.stock, qtyBefore: 0, qtyAfter: newProduct.stock,
        referenceNo: 'INIT-STOCK', buyPrice: newProduct.buyPrice, notes: 'Stok awal pendaftaran produk',
        userId, userName, createdAt: new Date().toISOString()
      });
    }
    return newProduct;
  }

  public async updateProduct(id: string, updates: Partial<Product>, userId: string, userName: string): Promise<Product> {
    await this.db.collection('products').updateOne({ id }, { $set: { ...updates, updatedAt: new Date().toISOString() } });
    return this.db.collection<Product>('products').findOne({ id }) as Promise<Product>;
  }

  public async deleteProduct(id: string, userId: string, userName: string): Promise<boolean> {
    const target = await this.db.collection('products').findOne({ id });
    if (!target) throw new Error('Produk tidak ditemukan.');
    await this.db.collection('products').deleteOne({ id });
    await this.addAuditLog(userId, userName, 'OWNER', 'DELETE_PRODUCT', 'PRODUCTS', `Menghapus produk: ${target.name} (${target.sku})`);
    return true;
  }

  public async createGoodsInDoc(doc: Omit<GoodsInDocument, 'id' | 'docNo' | 'createdAt'>, userId: string, userName: string) {
    const docNo = `GR-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
    const newDoc: GoodsInDocument = { ...doc, id: `gin-${Date.now()}`, docNo, createdAt: new Date().toISOString() };
    
    for (const item of newDoc.items) {
      await this.recordStockLedgerEntry(item.productId, 'BARANG_MASUK', item.qty, docNo, `Barang Masuk dari ${doc.supplierName} (${docNo})`, userId, userName);
      if (item.buyPrice > 0) await this.db.collection('products').updateOne({ id: item.productId }, { $set: { buyPrice: item.buyPrice } });
    }
    await this.db.collection('goodsInDocs').insertOne(newDoc);
    return newDoc;
  }

  public async createSale(saleData: Omit<Sale, 'id' | 'invoiceNo' | 'createdAt'>, userId: string, userName: string) {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const countToday = await this.db.collection('sales').countDocuments({ createdAt: { $regex: '^' + now.toISOString().slice(0, 10) } });
    const invoiceNo = `INV-${dateStr}-${String(countToday + 1).padStart(3, '0')}`;

    for (const item of saleData.items) {
      const prod = await this.db.collection('products').findOne({ id: item.productId });
      if (!prod) throw new Error(`Produk "${item.productName}" tidak ditemukan.`);
      if (prod.stock < item.qty) throw new Error(`Stok "${prod.name}" kurang! Tersisa: ${prod.stock}, Dibeli: ${item.qty}`);
    }

    for (const item of saleData.items) {
      await this.recordStockLedgerEntry(item.productId, 'PENJUALAN', -item.qty, invoiceNo, `Transaksi Kasir #${invoiceNo}`, userId, userName);
    }

    const newSale: Sale = { ...saleData, id: `sale-${Date.now()}`, invoiceNo, createdAt: now.toISOString() };
    await this.db.collection('sales').insertOne(newSale);
    await this.addAuditLog(userId, userName, 'KASIR', 'CREATE_SALE', 'POS', `Penjualan ${invoiceNo} senilai Rp ${saleData.finalAmount.toLocaleString('id-ID')} berhasil`);
    return newSale;
  }

  public async createStockOpname(opname: Omit<StockOpname, 'id' | 'docNo' | 'createdAt' | 'status'>, userId: string, userName: string) {
    const docNo = `SO-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`;
    const newOpname: StockOpname = { ...opname, id: `opn-${Date.now()}`, docNo, status: 'DRAFT', createdBy: userId, createdByName: userName, createdAt: new Date().toISOString() };
    await this.db.collection('opnames').insertOne(newOpname);
    await this.db.collection('notifications').insertOne({
      id: `notif-opn-${Date.now()}`, title: 'Draft Stock Opname Baru',
      message: `Dokumen opname ${docNo} telah dibuat oleh ${userName} dan menunggu persetujuan Owner.`,
      type: 'OPNAME_PENDING', read: false, createdAt: new Date().toISOString()
    });
    return newOpname;
  }

  public async approveStockOpname(opnameId: string, ownerUserId: string, ownerUserName: string) {
    const opname = await this.db.collection<StockOpname>('opnames').findOne({ id: opnameId });
    if (!opname) throw new Error('Dokumen stock opname tidak ditemukan');
    if (opname.status !== 'DRAFT') throw new Error('Opname sudah diproses sebelumnya');

    await this.db.collection('opnames').updateOne({ id: opnameId }, { $set: { status: 'APPROVED', approvedBy: ownerUserId, approvedByName: ownerUserName, approvedAt: new Date().toISOString() } });
    
    for (const item of opname.items) {
      if (item.difference !== 0) {
        await this.recordStockLedgerEntry(item.productId, 'STOCK_OPNAME', item.difference, opname.docNo, `Penyesuaian Stock Opname ${opname.docNo} (${item.notes || 'Selisih opname fisik'})`, ownerUserId, ownerUserName);
      }
    }
    await this.addAuditLog(ownerUserId, ownerUserName, 'OWNER', 'APPROVE_OPNAME', 'STOCK_OPNAME', `Stock opname ${opname.docNo} telah disetujui`);
    return this.db.collection('opnames').findOne({ id: opnameId });
  }

  public async rejectStockOpname(opnameId: string, ownerUserId: string, ownerUserName: string) {
    const opname = await this.db.collection('opnames').findOne({ id: opnameId });
    if (!opname || opname.status !== 'DRAFT') throw new Error('Invalid opname');
    await this.db.collection('opnames').updateOne({ id: opnameId }, { $set: { status: 'REJECTED', approvedBy: ownerUserId, approvedByName: ownerUserName, approvedAt: new Date().toISOString() } });
    await this.addAuditLog(ownerUserId, ownerUserName, 'OWNER', 'REJECT_OPNAME', 'STOCK_OPNAME', `Stock opname ${opname.docNo} ditolak`);
    return this.db.collection('opnames').findOne({ id: opnameId });
  }

  public async createExpense(expense: Omit<Expense, 'id' | 'docNo' | 'createdAt'>, userId: string, userName: string) {
    const docNo = `${expense.type === 'KAS_KELUAR' ? 'KK' : 'KM'}-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`;
    const newExp: Expense = { ...expense, id: `exp-${Date.now()}`, docNo, createdAt: new Date().toISOString() };
    await this.db.collection('expenses').insertOne(newExp);
    return newExp;
  }

  public async deleteExpense(id: string, userId: string, userName: string) {
    const exp = await this.db.collection('expenses').findOne({ id });
    if (!exp) throw new Error('Catatan kas tidak ditemukan');
    await this.db.collection('expenses').deleteOne({ id });
    await this.addAuditLog(userId, userName, 'OWNER', 'DELETE_EXPENSE', 'FINANCIAL', `Menghapus catatan kas`);
    return true;
  }

  public async getDashboardSummary(): Promise<DashboardSummary> {
    const todayStr = new Date().toISOString().slice(0, 10);
    const sales = await this.db.collection<Sale>('sales').find({ status: 'COMPLETED' }).toArray();
    const todaySales = sales.filter((s) => s.createdAt.startsWith(todayStr));

    const todayOmzet = todaySales.reduce((acc, s) => acc + s.finalAmount, 0);
    const todayTransactionsCount = todaySales.length;
    const todayItemsSold = todaySales.reduce((acc, s) => acc + s.items.reduce((itemAcc, item) => itemAcc + item.qty, 0), 0);

    const products = await this.db.collection<Product>('products').find({ status: 'ACTIVE' }).toArray();
    const lowStockCount = products.filter((p) => p.stock <= p.minStock).length;
    const totalProductsCount = products.length;
    const totalStockValue = products.reduce((acc, p) => acc + p.stock * p.buyPrice, 0);

    const salesChartData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const dStr = d.toISOString().slice(0, 10);
      const daySales = sales.filter((s) => s.createdAt.startsWith(dStr));
      salesChartData.push({ date: d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' }), omzet: daySales.reduce((acc, s) => acc + s.finalAmount, 0), count: daySales.length });
    }

    const prodMap: Record<string, any> = {};
    for (const sale of sales) {
      for (const item of sale.items) {
        if (!prodMap[item.productId]) prodMap[item.productId] = { productId: item.productId, name: item.productName, qtySold: 0, totalOmzet: 0 };
        prodMap[item.productId].qtySold += item.qty;
        prodMap[item.productId].totalOmzet += item.subtotal;
      }
    }
    const topSellingProducts = Object.values(prodMap).sort((a, b) => b.qtySold - a.qtySold).slice(0, 5);
    
    return {
      todayOmzet, todayTransactionsCount, todayItemsSold, lowStockCount, totalProductsCount, totalStockValue, salesChartData, topSellingProducts,
      recentGoodsIn: await this.db.collection('goodsInDocs').find().sort({ createdAt: -1 }).limit(5).toArray() as any,
      recentLogs: await this.db.collection('auditLogs').find().sort({ timestamp: -1 }).limit(8).toArray() as any,
      notifications: await this.db.collection('notifications').find().sort({ createdAt: -1 }).toArray() as any
    };
  }

  // --- CRUD for Categories & Suppliers ---
  public async getCategories() { return this.db.collection<Category>('categories').find().toArray(); }
  public async createCategory(cat: Omit<Category, 'id'>) {
    const newCat = { ...cat, id: `cat-${Date.now()}` };
    await this.db.collection('categories').insertOne(newCat);
    return newCat;
  }
  public async updateCategory(id: string, updates: Partial<Category>) {
    await this.db.collection('categories').updateOne({ id }, { $set: updates });
    if (updates.name) await this.db.collection('products').updateMany({ categoryId: id }, { $set: { categoryName: updates.name } });
    return this.db.collection('categories').findOne({ id });
  }
  public async deleteCategory(id: string) {
    const inUse = await this.db.collection('products').findOne({ categoryId: id });
    if (inUse) throw new Error('Kategori ini sedang digunakan oleh produk.');
    await this.db.collection('categories').deleteOne({ id });
    return true;
  }

  public async getSuppliers() { return this.db.collection<Supplier>('suppliers').find().toArray(); }
  public async createSupplier(sup: Omit<Supplier, 'id' | 'code'>) {
    const newSup = { ...sup, id: `sup-${Date.now()}`, code: `SUP-${String(Date.now()).slice(-4)}` };
    await this.db.collection('suppliers').insertOne(newSup);
    return newSup;
  }
  public async updateSupplier(id: string, updates: Partial<Supplier>) {
    await this.db.collection('suppliers').updateOne({ id }, { $set: updates });
    if (updates.name) await this.db.collection('products').updateMany({ supplierId: id }, { $set: { supplierName: updates.name } });
    return this.db.collection('suppliers').findOne({ id });
  }
  public async deleteSupplier(id: string) {
    const inUse = await this.db.collection('products').findOne({ supplierId: id });
    if (inUse) throw new Error('Supplier sedang digunakan oleh produk.');
    await this.db.collection('suppliers').deleteOne({ id });
    return true;
  }

  public async getExpenseCategories() { return this.db.collection<ExpenseCategory>('expenseCategories').find().toArray(); }
  public async getExpenses() { return this.db.collection<Expense>('expenses').find().sort({ createdAt: -1 }).toArray(); }
  
  public async getUsers() { return this.db.collection<User>('users').find().toArray(); }
  public async getSales() { return this.db.collection<Sale>('sales').find().sort({ createdAt: -1 }).toArray(); }
  public async getOpnames() { return this.db.collection<StockOpname>('opnames').find().sort({ createdAt: -1 }).toArray(); }
  public async getLedger() { return this.db.collection<StockLedgerEntry>('ledger').find().sort({ createdAt: -1 }).toArray(); }
  public async getGoodsInDocs() { return this.db.collection<GoodsInDocument>('goodsInDocs').find().sort({ createdAt: -1 }).toArray(); }
  
  public async getSettings() {
    const settings = await this.db.collection('settings').findOne({ id: 'store-settings' });
    return settings || {};
  }
  public async updateSettings(updates: Partial<StoreSettings>) {
    await this.db.collection('settings').updateOne({ id: 'store-settings' }, { $set: updates }, { upsert: true });
    return this.getSettings();
  }
  
  public async getNotifications() { return this.db.collection<AppNotification>('notifications').find().sort({ createdAt: -1 }).toArray(); }
  public async markNotificationRead(id: string) {
    await this.db.collection('notifications').updateOne({ id }, { $set: { read: true } });
  }
  public async getAuditLogs() { return this.db.collection<AuditLog>('auditLogs').find().sort({ timestamp: -1 }).toArray(); }
}

export const dbStore = new DBStore();
