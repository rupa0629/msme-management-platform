import React from 'react';
import {
  BarChart3,
  Bot,
  CreditCard,
  Database,
  LayoutDashboard,
  Lock,
  Package,
  Receipt,
  ScanLine,
  ShieldCheck,
  ShoppingCart,
  Store,
  Truck,
  Users,
  X,
  Zap,
} from 'lucide-react';
import { useBusiness } from '../../context/BusinessContext';
import { ActiveTab, UserRole } from '../../types';

interface SidebarProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onCloseMobile }) => {
  const {
    activeTab,
    setActiveTab,
    lowStockProducts,
    customers,
    storeInfo,
    currentUser,
    userRole,
    permissions,
    setIsAuthModalOpen,
  } = useBusiness();

  const pendingCustomerCount = customers.filter((c) => c.outstandingBalance > 0).length;

  // Role gating logic
  const isRestrictedForRole = (tabId: ActiveTab) => {
    if (userRole === 'cashier') {
      return ['database', 'analytics', 'expenses', 'suppliers'].includes(tabId);
    }
    if (userRole === 'accountant') {
      return ['database'].includes(tabId);
    }
    if (userRole === 'manager') {
      return ['database'].includes(tabId);
    }
    return false;
  };

  const navItems: {
    id: ActiveTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string | number;
    badgeColor?: string;
    isAi?: boolean;
    requiredRole?: string;
  }[] = [
    { id: 'dashboard', label: 'Home Dashboard', icon: LayoutDashboard },
    { id: 'sales', label: 'Sales Management', icon: ShoppingCart },
    {
      id: 'inventory',
      label: 'Inventory & Stock',
      icon: Package,
      badge: lowStockProducts.length > 0 ? `${lowStockProducts.length} Low` : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
    {
      id: 'customers',
      label: 'Customer Khata',
      icon: Users,
      badge: pendingCustomerCount > 0 ? `${pendingCustomerCount} Due` : undefined,
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    },
    {
      id: 'suppliers',
      label: 'Supplier Khata',
      icon: Truck,
      requiredRole: userRole === 'cashier' ? 'Manager' : undefined,
    },
    {
      id: 'expenses',
      label: 'Expense Tracking',
      icon: Receipt,
      requiredRole: userRole === 'cashier' ? 'Manager' : undefined,
    },
    { id: 'payments', label: 'Payment Ledger', icon: CreditCard },
    {
      id: 'scanner',
      label: 'AI Invoice Scanner',
      icon: ScanLine,
      isAi: true,
      badge: 'OCR',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    },
    {
      id: 'assistant',
      label: 'AI Guru Advisor',
      icon: Bot,
      isAi: true,
      badge: 'Gemini',
      badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
    },
    {
      id: 'analytics',
      label: 'Business Analytics',
      icon: BarChart3,
      requiredRole: userRole === 'cashier' ? 'Manager' : undefined,
    },
    {
      id: 'database',
      label: 'Database & Audit',
      icon: Database,
      badge: userRole === 'owner' ? 'Supabase' : 'Owner',
      badgeColor: userRole === 'owner' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-slate-800 text-slate-400 border-slate-700',
      requiredRole: userRole !== 'owner' ? 'Owner Only' : undefined,
    },
    {
      id: 'team',
      label: 'Team & RBAC',
      icon: ShieldCheck,
      badge: currentUser.role.toUpperCase(),
      badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
    },
  ];

  const handleSelect = (tab: ActiveTab) => {
    if (isRestrictedForRole(tab)) {
      setIsAuthModalOpen(true);
      return;
    }
    setActiveTab(tab);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden animate-fadeIn"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile Header */}
        <div className="p-4 flex items-center justify-between border-b border-slate-800 lg:hidden">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center font-bold text-slate-950">
              ₹
            </div>
            <span className="font-bold text-white text-base">Vyapar AI</span>
          </div>
          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Business Modules
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isRestricted = isRestrictedForRole(item.id);

            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? 'bg-gradient-to-r from-teal-500/20 to-cyan-500/10 text-teal-300 border border-teal-500/40 shadow-sm'
                    : isRestricted
                    ? 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/40 opacity-70'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon
                    className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                      isActive
                        ? 'text-teal-400'
                        : isRestricted
                        ? 'text-slate-500'
                        : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {isRestricted ? (
                  <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/80 font-mono">
                    <Lock className="w-2.5 h-2.5 text-slate-400" />
                    <span>{item.requiredRole || 'Restricted'}</span>
                  </span>
                ) : item.badge ? (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold border ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        {/* Store Profile Card at bottom (Clickable to switch roles / see profile) */}
        <div
          onClick={() => setIsAuthModalOpen(true)}
          className="p-3 border-t border-slate-800 bg-slate-950/60 m-2 rounded-xl border border-slate-800/80 hover:border-teal-500/40 transition-colors cursor-pointer group"
        >
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-teal-400 font-bold border border-slate-700 group-hover:scale-105 transition-transform">
              <Store className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-white truncate">{storeInfo.storeName}</div>
              <div className="text-[11px] text-teal-300 flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="font-mono font-bold uppercase text-[10px]">{currentUser.role}</span>
                <span className="text-slate-500 text-[10px]">• Switch &rarr;</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
