import React, { useState } from 'react';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { AiAssistant } from './components/assistant/AiAssistant';
import { AiActionModal } from './components/common/AiActionModal';
import { GlobalAiInputBar } from './components/common/GlobalAiInputBar';
import { CustomerManagement } from './components/customers/CustomerManagement';
import { HomeDashboard } from './components/dashboard/HomeDashboard';
import { ExpenseManagement } from './components/expenses/ExpenseManagement';
import { InventoryManagement } from './components/inventory/InventoryManagement';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { PaymentManagement } from './components/payments/PaymentManagement';
import { InvoiceModal } from './components/sales/InvoiceModal';
import { NewSaleModal } from './components/sales/NewSaleModal';
import { SalesManagement } from './components/sales/SalesManagement';
import { InvoiceScanner } from './components/scanner/InvoiceScanner';
import { SupplierManagement } from './components/suppliers/SupplierManagement';
import { DatabaseAuditView } from './components/database/DatabaseAuditView';
import { TeamManagementView } from './components/team/TeamManagementView';
import { AuthModal } from './components/auth/AuthModal';
import { BusinessOnboardingModal } from './components/auth/BusinessOnboardingModal';
import { BusinessProvider, useBusiness } from './context/BusinessContext';
import { Customer, Sale } from './types';

const MainAppContent: React.FC = () => {
  const { activeTab, setActiveTab } = useBusiness();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Global modals triggered from dashboard shortcuts
  const [isNewSaleOpen, setIsNewSaleOpen] = useState(false);
  const [createdSaleForInvoice, setCreatedSaleForInvoice] = useState<Sale | null>(null);

  const renderModuleContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <HomeDashboard
            onOpenNewSale={() => setIsNewSaleOpen(true)}
            onOpenAddExpense={() => setActiveTab('expenses')}
            onOpenWhatsAppModal={() => setActiveTab('customers')}
          />
        );
      case 'sales':
        return <SalesManagement />;
      case 'inventory':
        return <InventoryManagement />;
      case 'customers':
        return <CustomerManagement />;
      case 'suppliers':
        return <SupplierManagement />;
      case 'expenses':
        return <ExpenseManagement />;
      case 'payments':
        return <PaymentManagement />;
      case 'scanner':
        return <InvoiceScanner />;
      case 'assistant':
        return <AiAssistant />;
      case 'analytics':
        return <AnalyticsView />;
      case 'database':
        return <DatabaseAuditView />;
      case 'team':
        return <TeamManagementView />;
      default:
        return (
          <HomeDashboard
            onOpenNewSale={() => setIsNewSaleOpen(true)}
            onOpenAddExpense={() => setActiveTab('expenses')}
            onOpenWhatsAppModal={() => setActiveTab('customers')}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#0B132B] text-slate-100 flex flex-col font-sans selection:bg-teal-500 selection:text-slate-950">
      {/* Top Navbar */}
      <Navbar onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)} />

      {/* Main Layout Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Right Main Content Scroll View */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Prominent Global AI Voice & Text Command Bar */}
          <div className="max-w-7xl mx-auto">
            <GlobalAiInputBar />
          </div>

          {/* Active Module Screen */}
          <div className="max-w-7xl mx-auto pb-12">
            {renderModuleContent()}
          </div>
        </main>
      </div>

      {/* AI Smart Action Confirmation Modal (Triggered by voice or text commands) */}
      <AiActionModal />

      {/* Global New Sale Modal */}
      <NewSaleModal
        isOpen={isNewSaleOpen}
        onClose={() => setIsNewSaleOpen(false)}
        onSaleCreated={(sale) => setCreatedSaleForInvoice(sale)}
      />

      {/* Global Invoice Preview Modal */}
      <InvoiceModal
        sale={createdSaleForInvoice}
        onClose={() => setCreatedSaleForInvoice(null)}
      />

      {/* Supabase Authentication & Role Switcher Modal */}
      <AuthModal />

      {/* Merchant Business Onboarding Registration Wizard */}
      <BusinessOnboardingModal />
    </div>
  );
};

export default function App() {
  return (
    <BusinessProvider>
      <MainAppContent />
    </BusinessProvider>
  );
}
