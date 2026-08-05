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

  const users: User[] = [
    {
      id: 'usr-owner',
      username: 'owner',
      name: 'Budi Santoso (Owner)',
      role: 'OWNER',
      status: 'ACTIVE',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString()
    },
    {
      id: 'usr-kasir1',
      username: 'kasir',
      name: 'Siti Rahma (Kasir Utama)',
      role: 'KASIR',
      status: 'ACTIVE',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      createdAt: new Date(Date.now() - 20 * 86400000).toISOString()
    },
    {
      id: 'usr-kasir2',
      username: 'kasir2',
      name: 'Andi Pratama (Kasir Shift 2)',
      role: 'KASIR',
      status: 'ACTIVE',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      createdAt: new Date(Date.now() - 10 * 86400000).toISOString()
    }
  ];

  const userPasswords: Record<string, string> = {
    'usr-owner': hashPassword('password123'),
    'usr-kasir1': hashPassword('password123'),
    'usr-kasir2': hashPassword('password123')
  };

  const categories: Category[] = [
    { id: 'cat-1', name: 'Liquid Freebase', description: 'Liquid dengan nikotin freebase untuk mod' },
    { id: 'cat-2', name: 'Liquid Saltnic', description: 'Liquid saltnic untuk pod system' },
    { id: 'cat-3', name: 'Pods & AIO', description: 'Device pod dan AIO (All In One)' },
    { id: 'cat-4', name: 'Mods', description: 'Device Mod, Mechanical, Electrical' },
    { id: 'cat-5', name: 'Coil & Cartridge', description: 'Replacement coil dan cartridge' },
    { id: 'cat-6', name: 'Kapas & Kawat', description: 'Kapas vape dan kawat (wire) prebuilt/roll' }
  ];

  const suppliers: Supplier[] = [
    {
      id: 'sup-1',
      code: 'SUP-001',
      name: 'PT Indofood Sukses Makmur',
      contactPerson: 'Pak Hartono',
      phone: '081234567890',
      email: 'sales@indofood.co.id',
      address: 'Jl. Industri No. 12, Jakarta',
      notes: 'Pemasok mi instan dan snack'
    },
    {
      id: 'sup-2',
      code: 'SUP-002',
      name: 'PT Mayora Indah Tbk',
      contactPerson: 'Ibu Linda',
      phone: '081987654321',
      email: 'distributor@mayora.co.id',
      address: 'Jl. Daan Mogot Km 18, Tangerang',
      notes: 'Biskuit, permen, kopi Kopiko'
    },
    {
      id: 'sup-3',
      code: 'SUP-003',
      name: 'Distributor Sembako Nusantara',
      contactPerson: 'Pak Haryanto',
      phone: '085711223344',
      email: 'orders@sembakonusantara.com',
      address: 'Pasar Induk Kramat Jati Blok B2',
      notes: 'Minyak, beras, gula pasir'
    },
    {
      id: 'sup-4',
      code: 'SUP-004',
      name: 'PT Unilever Indonesia Tbk',
      contactPerson: 'Mbak Dewi',
      phone: '081344556677',
      email: 'care@unilever.co.id',
      address: 'BSD Green Office Park, Tangerang',
      notes: 'Sabun, shampo, deterjen'
    }
  ];

  const products: Product[] = [
    {
      id: 'prod-1',
      sku: 'LIQ-FB-01',
      barcode: '899100100001',
      name: 'Oat Drips V1 100ml 3mg',
      categoryId: 'cat-1',
      categoryName: 'Liquid Freebase',
      supplierId: 'sup-1',
      supplierName: 'Distributor Vape Jakarta',
      buyPrice: 120000,
      sellPrice: 150000,
      stock: 50,
      minStock: 10,
      status: 'ACTIVE',
      imageUrl: 'https://images.unsplash.com/photo-1596773229671-55c91b5c4900?w=300',
      createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 86400000).toISOString()
    },
    {
      id: 'prod-2',
      sku: 'LIQ-SALT-01',
      barcode: '899100100002',
      name: 'Foom Apple 30ml 30mg',
      categoryId: 'cat-2',
      categoryName: 'Liquid Saltnic',
      supplierId: 'sup-1',
      supplierName: 'Distributor Vape Jakarta',
      buyPrice: 90000,
      sellPrice: 110000,
      stock: 35,
      minStock: 15,
      status: 'ACTIVE',
      imageUrl: 'https://images.unsplash.com/photo-1620857319409-eb7412845c43?w=300',
      createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 86400000).toISOString()
    },
    {
      id: 'prod-3',
      sku: 'POD-OXV-01',
      barcode: '899200200001',
      name: 'Oxva Xlim Pro Kit - Black Carbon',
      categoryId: 'cat-3',
      categoryName: 'Pods & AIO',
      supplierId: 'sup-2',
      supplierName: 'Grosir Device Vape',
      buyPrice: 320000,
      sellPrice: 380000,
      stock: 5,
      minStock: 10,
      status: 'ACTIVE',
      imageUrl: 'https://images.unsplash.com/photo-1572111197775-6fbf4a0a5749?w=300',
      createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 86400000).toISOString()
    },
    {
      id: 'prod-4',
      sku: 'MNM-KOP-01',
      barcode: '899200200002',
      name: 'Torabika Creamy Latte 25g',
      categoryId: 'cat-2',
      categoryName: 'Minuman',
      supplierId: 'sup-2',
      supplierName: 'PT Mayora Indah Tbk',
      buyPrice: 1500,
      sellPrice: 2500,
      stock: 95,
      minStock: 20,
      status: 'ACTIVE',
      imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=300',
      createdAt: new Date(Date.now() - 24 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 3 * 86400000).toISOString()
    },
    {
      id: 'prod-5',
      sku: 'SMB-MYK-01',
      barcode: '899300300001',
      name: 'Bimoli Minyak Goreng Pouch 2L',
      categoryId: 'cat-3',
      categoryName: 'Sembako',
      supplierId: 'sup-3',
      supplierName: 'Distributor Sembako Nusantara',
      buyPrice: 32000,
      sellPrice: 38000,
      stock: 12, // Intentionally low stock
      minStock: 20,
      status: 'ACTIVE',
      imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=300',
      createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 86400000).toISOString()
    },
    {
      id: 'prod-6',
      sku: 'SMB-BRS-01',
      barcode: '899300300002',
      name: 'Beras Ramos Super 5kg',
      categoryId: 'cat-3',
      categoryName: 'Sembako',
      supplierId: 'sup-3',
      supplierName: 'Distributor Sembako Nusantara',
      buyPrice: 65000,
      sellPrice: 76000,
      stock: 35,
      minStock: 10,
      status: 'ACTIVE',
      imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300',
      createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 4 * 86400000).toISOString()
    },
    {
      id: 'prod-7',
      sku: 'SMB-GUL-01',
      barcode: '899300300003',
      name: 'Gulaku Gula Pasir Putih 1kg',
      categoryId: 'cat-3',
      categoryName: 'Sembako',
      supplierId: 'sup-3',
      supplierName: 'Distributor Sembako Nusantara',
      buyPrice: 14500,
      sellPrice: 17500,
      stock: 50,
      minStock: 15,
      status: 'ACTIVE',
      imageUrl: 'https://images.unsplash.com/photo-1581441363689-1f3c3c414635?w=300',
      createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 86400000).toISOString()
    },
    {
      id: 'prod-8',
      sku: 'KBS-LIFE-01',
      barcode: '899400400001',
      name: 'Lifebuoy Sabun Mandi Cair 450ml',
      categoryId: 'cat-4',
      categoryName: 'Kebersihan & Perawatan',
      supplierId: 'sup-4',
      supplierName: 'PT Unilever Indonesia Tbk',
      buyPrice: 21000,
      sellPrice: 26500,
      stock: 28,
      minStock: 10,
      status: 'ACTIVE',
      imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300',
      createdAt: new Date(Date.now() - 22 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 86400000).toISOString()
    },
    {
      id: 'prod-9',
      sku: 'KBS-RIN-01',
      barcode: '899400400002',
      name: 'Rinso Anti Noda Deterjen 770g',
      categoryId: 'cat-4',
      categoryName: 'Kebersihan & Perawatan',
      supplierId: 'sup-4',
      supplierName: 'PT Unilever Indonesia Tbk',
      buyPrice: 22500,
      sellPrice: 28000,
      stock: 8, // Low stock
      minStock: 15,
      status: 'ACTIVE',
      imageUrl: 'https://images.unsplash.com/photo-1585670149967-b4f4da88cc9f?w=300',
      createdAt: new Date(Date.now() - 22 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 86400000).toISOString()
    },
    {
      id: 'prod-10',
      sku: 'RMH-TIS-01',
      barcode: '899500500001',
      name: 'Paseo Tisu Wajah 250 Sheets',
      categoryId: 'cat-5',
      categoryName: 'Alat Tulis & Rumah Tangga',
      supplierId: 'sup-2',
      supplierName: 'PT Mayora Indah Tbk',
      buyPrice: 12000,
      sellPrice: 16000,
      stock: 45,
      minStock: 12,
      status: 'ACTIVE',
      imageUrl: 'https://images.unsplash.com/photo-1584556812952-905ffd0c611a?w=300',
      createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 86400000).toISOString()
    }
  ];

  const ledger: StockLedgerEntry[] = [
    {
      id: 'ledg-1',
      date: new Date(Date.now() - 20 * 86400000).toISOString(),
      productId: 'prod-1',
      productName: 'Oat Drips V1 100ml 3mg',
      sku: 'LIQ-FB-01',
      type: 'BARANG_MASUK',
      qtyChange: 150,
      qtyBefore: 0,
      qtyAfter: 150,
      referenceNo: 'GR-2026-0801',
      buyPrice: 120000,
      notes: 'Stok awal barang masuk dari supplier',
      userId: 'usr-owner',
      userName: 'Budi Santoso (Owner)',
      createdAt: new Date(Date.now() - 20 * 86400000).toISOString()
    },
    {
      id: 'ledg-2',
      date: new Date(Date.now() - 10 * 86400000).toISOString(),
      productId: 'prod-1',
      productName: 'Indomie Goreng Original 85g',
      sku: 'MKN-IND-01',
      type: 'PENJUALAN',
      qtyChange: -30,
      qtyBefore: 150,
      qtyAfter: 120,
      referenceNo: 'INV-20260802-001',
      buyPrice: 120000,
      notes: 'Penjualan Kasir',
      userId: 'usr-kasir1',
      userName: 'Siti Rahma (Kasir Utama)',
      createdAt: new Date(Date.now() - 10 * 86400000).toISOString()
    }
  ];

  const goodsInDocs: GoodsInDocument[] = [
    {
      id: 'gin-1',
      docNo: 'GR-2026-0801',
      date: new Date(Date.now() - 20 * 86400000).toISOString().split('T')[0],
      supplierId: 'sup-1',
      supplierName: 'PT Indofood Sukses Makmur',
      items: [
        {
          productId: 'prod-1',
          productName: 'Oat Drips V1 100ml 3mg',
          sku: 'LIQ-FB-01',
          qty: 150,
          buyPrice: 120000,
          subtotal: 18000000
        },
        {
          productId: 'prod-2',
          productName: 'Foom Apple 30ml 30mg',
          sku: 'LIQ-SALT-01',
          qty: 100,
          buyPrice: 90000,
          subtotal: 9000000
        }
      ],
      totalAmount: 27000000,
      notes: 'Pemesanan reguler awal bulan',
      userId: 'usr-owner',
      userName: 'Budi Santoso (Owner)',
      createdAt: new Date(Date.now() - 20 * 86400000).toISOString()
    }
  ];

  // Helper for generating historical daily sales
  const sales: Sale[] = [];
  const now = new Date();

  for (let i = 14; i >= 0; i--) {
    const saleDate = new Date(now.getTime() - i * 86400000);
    const numSales = Math.floor(Math.random() * 4) + 2; // 2 to 5 sales per day

    for (let j = 1; j <= numSales; j++) {
      const invNum = `INV-${saleDate.toISOString().slice(0,10).replace(/-/g,'')}-${String(j).padStart(3, '0')}`;
      const isKasir2 = j % 2 === 0;

      sales.push({
        id: `sale-${i}-${j}`,
        invoiceNo: invNum,
        date: saleDate.toISOString(),
        userId: isKasir2 ? 'usr-kasir2' : 'usr-kasir1',
        userName: isKasir2 ? 'Andi Pratama' : 'Siti Rahma',
        customerName: j % 2 === 1 ? 'Pelanggan Umum' : 'Ibu Endang',
        items: [
          {
            productId: 'prod-1',
            productName: 'Oat Drips V1 100ml 3mg',
            sku: 'LIQ-FB-01',
            barcode: '899100100001',
            qty: 2,
            buyPrice: 120000,
            sellPrice: 150000,
            subtotal: 300000
          },
          {
            productId: 'prod-3',
            productName: 'Foom Apple 30ml 30mg',
            sku: 'LIQ-SALT-01',
            barcode: '899100100002',
            qty: 1,
            buyPrice: 90000,
            sellPrice: 110000,
            subtotal: 110000
          }
        ],
        subtotal: 410000,
        discountAmount: 0,
        taxAmount: 0,
        finalAmount: 410000,
        paymentMethod: j % 3 === 0 ? 'QRIS' : 'CASH',
        payAmount: 450000,
        changeAmount: 40000,
        status: 'COMPLETED',
        createdAt: saleDate.toISOString()
      });
    }
  }

  const opnames: StockOpname[] = [
    {
      id: 'opn-1',
      docNo: 'SO-2026-001',
      date: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0],
      status: 'APPROVED',
      notes: 'Stock opname rutin bulanan area Sembako',
      items: [
        {
          productId: 'prod-5',
          productName: 'Bimoli Minyak Goreng Pouch 2L',
          sku: 'SMB-MYK-01',
          systemQty: 15,
          physicalQty: 12,
          difference: -3,
          buyPrice: 32000,
          notes: '3 pouch bocor saat penataan rak'
        }
      ],
      createdBy: 'usr-kasir1',
      createdByName: 'Siti Rahma',
      approvedBy: 'usr-owner',
      approvedByName: 'Budi Santoso (Owner)',
      approvedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString()
    }
  ];

  const expenseCategories: ExpenseCategory[] = [
    { id: 'exp-cat-1', name: 'Operasional & Utility', type: 'KAS_KELUAR' },
    { id: 'exp-cat-2', name: 'Gaji Karyawan', type: 'KAS_KELUAR' },
    { id: 'exp-cat-3', name: 'Sewa Tempat & Maintenance', type: 'KAS_KELUAR' },
    { id: 'exp-cat-4', name: 'Pemasokan / Modal Lain', type: 'KAS_MASUK' }
  ];

  const expenses: Expense[] = [
    {
      id: 'exp-1',
      docNo: 'KK-2026-001',
      date: new Date(Date.now() - 10 * 86400000).toISOString().split('T')[0],
      categoryId: 'exp-cat-1',
      categoryName: 'Operasional & Utility',
      type: 'KAS_KELUAR',
      amount: 450000,
      description: 'Bayar Token Listrik & Air Pam Toko',
      userId: 'usr-owner',
      userName: 'Budi Santoso (Owner)',
      createdAt: new Date(Date.now() - 10 * 86400000).toISOString()
    },
    {
      id: 'exp-2',
      docNo: 'KK-2026-002',
      date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
      categoryId: 'exp-cat-2',
      categoryName: 'Gaji Karyawan',
      type: 'KAS_KELUAR',
      amount: 2500000,
      description: 'Uang Makan & Bonus Kasir',
      userId: 'usr-owner',
      userName: 'Budi Santoso (Owner)',
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString()
    }
  ];

  const auditLogs: AuditLog[] = [
    {
      id: 'log-1',
      timestamp: new Date(Date.now() - 1 * 3600000).toISOString(),
      userId: 'usr-owner',
      userName: 'Budi Santoso (Owner)',
      userRole: 'OWNER',
      action: 'LOGIN',
      module: 'AUTH',
      details: 'User Owner login berhasil ke sistem',
      ip: '127.0.0.1',
      device: 'Desktop Chrome / Windows 11'
    },
    {
      id: 'log-2',
      timestamp: new Date(Date.now() - 25 * 60000).toISOString(),
      userId: 'usr-kasir1',
      userName: 'Siti Rahma',
      userRole: 'KASIR',
      action: 'CREATE_SALE',
      module: 'POS',
      details: 'Transaksi INV-20260803-005 senilai Rp 25.500 berhasil diselesaikan',
      ip: '127.0.0.1',
      device: 'Tablet Chrome / Android'
    }
  ];

  const settings: StoreSettings = {
    storeName: 'Vape Store Retail POS',
    storeAddress: 'Jl. Raya Merdeka No. 88, Kebayoran, Jakarta',
    storePhone: '0812-9900-8811',
    receiptHeader: 'Terima kasih telah berbelanja di Vape Store Retail!',
    receiptFooter: 'Barang yang sudah dibeli tidak dapat ditukar/dikembalikan.',
    enableLowStockAlert: true,
    taxRatePercent: 0
  };

  const notifications: AppNotification[] = [
    {
      id: 'notif-1',
      title: 'Peringatan Stok Menipis',
      message: 'Produk "Oxva Xlim Pro Kit" tersisa 5 pcs (Min. 10 pcs). Segera lakukan restock!',
      type: 'LOW_STOCK',
      read: false,
      createdAt: new Date(Date.now() - 2 * 3600000).toISOString()
    },
    {
      id: 'notif-2',
      title: 'Peringatan Stok Menipis',
      message: 'Produk "Bimoli Minyak Goreng 2L" tersisa 12 pcs (Min. 20 pcs).',
      type: 'LOW_STOCK',
      read: false,
      createdAt: new Date(Date.now() - 1 * 3600000).toISOString()
    }
  ];

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
