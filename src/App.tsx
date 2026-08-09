import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { LoginModal } from './components/LoginModal';
import { ReceiptModal } from './components/ReceiptModal';
import { NotificationDrawer } from './components/NotificationDrawer';

import { PosView } from './views/PosView';
import { DashboardView } from './views/DashboardView';
import { ProductsView } from './views/ProductsView';
import { InventoryView } from './views/InventoryView';
import { OpnameView } from './views/OpnameView';
import { ReportsView } from './views/ReportsView';
import { FinancialsView } from './views/FinancialsView';
import { SuppliersView } from './views/SuppliersView';
import { AuditLogsView } from './views/AuditLogsView';
import { UsersView } from './views/UsersView';
import { SettingsView } from './views/SettingsView';
import { CustomerCatalogView } from './views/CustomerCatalogView';

import { AuthProvider, useAuth } from './context/AuthContext';
import { AppDataProvider, useAppData } from './context/AppDataContext';

function AppContent() {
  const {
    currentUser,
    activeTab,
    handleNavigateTab,
    darkMode,
    toggleDarkMode,
    showLoginModal,
    setShowLoginModal,
    handleLoginSuccess,
    handleLogout
  } = useAuth();

  const {
    summary,
    products,
    categories,
    suppliers,
    sales,
    goodsInDocs,
    ledger,
    opnames,
    expenses,
    expenseCategories,
    users,
    settings,
    notifications,
    loadAppData,
    receiptSale,
    setReceiptSale,
    showNotifDrawer,
    setShowNotifDrawer,
    handleSaleSuccess
  } = useAppData();

  const totalGrossProfit = sales
    .filter(s => s.status === 'COMPLETED')
    .reduce((acc, sale) => {
      const saleProfit = sale.items.reduce((itemAcc, item) => itemAcc + ((item.sellPrice - item.buyPrice) * item.qty), 0);
      // Subtract applied discount from profit (assuming discount eats into profit)
      return acc + saleProfit - sale.discountAmount;
    }, 0);

  if (!currentUser) {
    return (
      <div className={`min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased selection:bg-emerald-500 selection:text-white`}>
        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased selection:bg-emerald-500 selection:text-white`}>
      {/* Top Navbar */}
      {activeTab !== 'pos' && (
        <Navbar
          user={currentUser}
          settings={settings}
          storeName={settings?.storeName || 'Vape Store Retail'}
          onOpenLogin={() => setShowLoginModal(true)}
          onLogout={handleLogout}
          notifications={notifications}
          onOpenNotifications={() => setShowNotifDrawer(true)}
          darkMode={darkMode}
          onToggleDarkMode={toggleDarkMode}
          activeTab={activeTab}
          setActiveTab={handleNavigateTab}
        />
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <Sidebar
          user={currentUser}
          activeTab={activeTab}
          onSelectTab={handleNavigateTab}
          role={currentUser?.role || 'KASIR'}
          lowStockCount={summary?.lowStockCount || 0}
        />

        {/* Main Content View Container */}
        <main className={`flex-1 overflow-y-auto ${activeTab === 'pos' ? 'bg-slate-100 dark:bg-slate-950' : 'p-4 md:p-6 pb-24 md:pb-8'}`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className={`w-full ${activeTab === 'pos' ? 'h-full' : 'max-w-7xl mx-auto'}`}
            >
              {activeTab === 'pos' && (
                <PosView
                  user={currentUser!}
                  products={products}
                  categories={categories}
                  onSaleComplete={handleSaleSuccess}
                  storeName={settings?.storeName || 'Vape Store Retail'}
                  onLogout={handleLogout}
                />
              )}
              
              {activeTab === 'catalog' && (
              <CustomerCatalogView
                products={products}
                categories={categories}
                storeName={settings?.storeName || 'Vape Store Retail'}
              />
            )}

            {activeTab === 'dashboard' && (
              <DashboardView
                summary={summary}
                role={currentUser?.role || 'KASIR'}
                onNavigateTab={handleNavigateTab}
              />
            )}

            {activeTab === 'products' && (
              <ProductsView
                products={products}
                categories={categories}
                suppliers={suppliers}
                role={currentUser?.role || 'KASIR'}
                onRefresh={loadAppData}
              />
            )}

            {(activeTab === 'inventory' || activeTab === 'ledger') && (
              <InventoryView
                products={products}
                suppliers={suppliers}
                goodsInDocs={goodsInDocs}
                ledger={ledger}
                initialTab={activeTab === 'ledger' ? 'ledger' : 'goods-in'}
                onRefresh={loadAppData}
              />
            )}

            {activeTab === 'opname' && (
              <OpnameView
                products={products}
                opnames={opnames}
                role={currentUser?.role || 'KASIR'}
                onRefresh={loadAppData}
              />
            )}

            {activeTab === 'reports' && (
              <ReportsView sales={sales} products={products} users={users} />
            )}

            {activeTab === 'financials' && (
              <FinancialsView
                expenses={expenses}
                expenseCategories={expenseCategories}
                totalGrossProfit={totalGrossProfit}
                onRefresh={loadAppData}
              />
            )}

            {activeTab === 'suppliers' && (
              <SuppliersView
                suppliers={suppliers}
                products={products}
                onNavigateTab={handleNavigateTab}
                onRefresh={loadAppData}
              />
            )}

            {activeTab === 'audit-logs' && (
              <AuditLogsView logs={summary?.recentLogs || []} />
            )}

            {activeTab === 'users' && <UsersView users={users} onRefresh={loadAppData} />}

                {activeTab === 'settings' && (
                  <SettingsView settings={settings} onRefresh={loadAppData} />
                )}
              </motion.div>
            </AnimatePresence>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        activeTab={activeTab}
        onSelectTab={handleNavigateTab}
        role={currentUser?.role || 'KASIR'}
      />

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Thermal Receipt Modal */}
      {receiptSale && (
        <ReceiptModal
          sale={receiptSale}
          onClose={() => setReceiptSale(null)}
          storeName={settings?.storeName || 'Vape Store Retail'}
          storeAddress={settings?.storeAddress || 'Jl. Raya Merdeka No. 88, Jakarta'}
          storePhone={settings?.storePhone || '0812-9900-8811'}
        />
      )}

      {/* Notification Drawer */}
      <NotificationDrawer
        isOpen={showNotifDrawer}
        onClose={() => setShowNotifDrawer(false)}
        notifications={notifications}
        onNavigateTab={handleNavigateTab}
        userRole={currentUser?.role || 'KASIR'}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppDataProvider>
        <AppContent />
      </AppDataProvider>
    </AuthProvider>
  );
}
