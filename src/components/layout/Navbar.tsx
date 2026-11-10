import React, { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  Calendar,
  Check,
  CheckCheck,
  CheckCircle2,
  Clock,
  CreditCard,
  Database,
  ExternalLink,
  Menu,
  MessageSquare,
  Package,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Store,
  Trash2,
  User,
  X,
  Zap,
} from 'lucide-react';
import { useBusiness } from '../../context/BusinessContext';
import { ActiveTab } from '../../types';

interface NavbarProps {
  onToggleMobileSidebar: () => void;
}

export type NotificationCategory = 'all' | 'payment_deadlines' | 'low_stock' | 'daily_summary';

export interface AppNotification {
  id: string;
  category: 'payment_deadlines' | 'low_stock' | 'daily_summary';
  title: string;
  description: string;
  timeAgo: string;
  isRead: boolean;
  priority: 'high' | 'medium' | 'info';
  actionLabel: string;
  targetTab: ActiveTab;
  metadata?: any;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleMobileSidebar }) => {
  const {
    storeInfo,
    healthScore,
    resetToDemoData,
    lowStockProducts,
    totalPendingReceivables,
    totalPayableBalance,
    todaySalesTotal,
    customers,
    suppliers,
    setActiveTab,
    parseAndOpenAction,
    isSyncing,
    databaseStatus,
    currentUser,
    userRole,
    setIsAuthModalOpen,
    setIsOnboardingModalOpen,
  } = useBusiness();

  const [showNotificationMenu, setShowNotificationMenu] = useState(false);
  const [activeCategory, setActiveCategory] = useState<NotificationCategory>('all');
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Dynamic notification list generated from live business state
  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: 'notif-deadline-1',
      category: 'payment_deadlines',
      title: 'Supplier Bill Due in 2 Days: Shree Ganesh Textiles',
      description: '₹6,000 payable balance is due by Nov 8. Early clearance unlocks 2% vendor cash discount.',
      timeAgo: 'Due in 48h',
      isRead: false,
      priority: 'high',
      actionLabel: 'Settle Bill',
      targetTab: 'payments',
    },
    {
      id: 'notif-deadline-2',
      category: 'payment_deadlines',
      title: 'Overdue Udhaar: Priya Sharma (₹4,200)',
      description: 'Payment is 18 days overdue. Send a polite WhatsApp reminder with your UPI QR link.',
      timeAgo: '18 days overdue',
      isRead: false,
      priority: 'high',
      actionLabel: 'Send Reminder',
      targetTab: 'customers',
    },
    {
      id: 'notif-stock-1',
      category: 'low_stock',
      title: 'Critical Stock: Cotton Formal Shirts (Only 4 pcs left)',
      description: 'Current inventory has breached the safety buffer of 15 pcs. Fast-selling item this week.',
      timeAgo: '2h ago',
      isRead: false,
      priority: 'high',
      actionLabel: '1-Click Reorder',
      targetTab: 'inventory',
      metadata: { productName: 'Cotton Formal Shirts (Slim Fit)' },
    },
    {
      id: 'notif-stock-2',
      category: 'low_stock',
      title: 'Low Stock Buffer: Embroidered Linen Kurta',
      description: 'Only 3 units remaining in catalog against threshold of 10 units.',
      timeAgo: '4h ago',
      isRead: false,
      priority: 'medium',
      actionLabel: 'View Stock',
      targetTab: 'inventory',
    },
    {
      id: 'notif-summary-1',
      category: 'daily_summary',
      title: 'AI Daily Business Summary & Action Plan Ready',
      description: `Today's revenue is ₹${todaySalesTotal.toLocaleString('en-IN')}. Health score at ${healthScore}/100. Gemini generated 3 high-impact actions for cash flow.`,
      timeAgo: 'Just now',
      isRead: false,
      priority: 'info',
      actionLabel: 'View Action Plan',
      targetTab: 'dashboard',
    },
    {
      id: 'notif-deadline-3',
      category: 'payment_deadlines',
      title: 'Supplier Payment Scheduled: ABC Traders',
      description: '₹14,500 payable balance under 15-day credit terms. Due on Nov 10.',
      timeAgo: 'Due in 4 days',
      isRead: true,
      priority: 'medium',
      actionLabel: 'Review Bill',
      targetTab: 'suppliers',
    },
  ]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotificationMenu(false);
      }
    };
    if (showNotificationMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotificationMenu]);

  // Unread count
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Filtered notifications
  const filteredNotifications = notifications.filter((n) => {
    if (activeCategory === 'all') return true;
    return n.category === activeCategory;
  });

  const handleMarkAsRead = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleDeleteNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleNotificationAction = (notif: AppNotification) => {
    handleMarkAsRead(notif.id);
    setShowNotificationMenu(false);

    if (notif.category === 'low_stock' && notif.actionLabel.includes('Reorder')) {
      const prodName = notif.metadata?.productName || 'Cotton Formal Shirts (Slim Fit)';
      parseAndOpenAction(`I purchased 50 ${prodName} from ABC Traders for ₹20,000`);
    } else {
      setActiveTab(notif.targetTab);
    }
  };

  const getCategoryIcon = (category: AppNotification['category']) => {
    switch (category) {
      case 'payment_deadlines':
        return <Clock className="w-4 h-4 text-amber-400" />;
      case 'low_stock':
        return <AlertTriangle className="w-4 h-4 text-rose-400" />;
      case 'daily_summary':
        return <Sparkles className="w-4 h-4 text-teal-400" />;
    }
  };

  const getPriorityBadge = (priority: AppNotification['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      case 'medium':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'info':
        return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
      <div className="px-4 lg:px-8 py-3 flex items-center justify-between gap-4">
        {/* Left: Mobile menu toggle & Brand identity */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center space-x-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 via-cyan-500 to-blue-500 flex items-center justify-center shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform">
              <span className="text-slate-950 font-black text-lg">₹</span>
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-cyan-100 to-teal-300 bg-clip-text text-transparent">
                  Vyapar<span className="text-teal-400 font-black ml-0.5">AI</span>
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-teal-500/20 text-teal-300 border border-teal-500/40">
                  MSME OS
                </span>
              </div>
              <div className="text-[11px] text-slate-400 hidden sm:block truncate max-w-[200px]">
                {storeInfo.storeName}
              </div>
            </div>
          </div>
        </div>

        {/* Center: Omni-Search Bar */}
        <div className="hidden md:flex items-center space-x-4 flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products, customers, bills, GSTIN..."
              className="w-full pl-9 pr-4 py-1.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-teal-400 transition-colors"
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-3">
          {/* Business Health Score pill */}
          <div
            onClick={() => setActiveTab('dashboard')}
            className="cursor-pointer hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 hover:border-teal-500/40 transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            <div className="text-left">
              <div className="text-[10px] text-slate-400 font-semibold uppercase leading-tight">Health Score</div>
              <div className="text-xs font-bold text-white font-mono">
                {healthScore}/100 <span className="text-teal-400 font-sans font-medium text-[11px]">Strong</span>
              </div>
            </div>
          </div>

          {/* Database Persistence Status Pill */}
          <div
            onClick={() => setActiveTab('database')}
            title="PostgreSQL / Supabase Database Persistence & Multi-Tenant RLS"
            className="cursor-pointer hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 hover:border-emerald-500/40 transition-colors group"
          >
            <Database className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
            <div className="text-left">
              <div className="text-[10px] text-slate-400 font-semibold uppercase leading-tight">Database</div>
              <div className="text-xs font-bold text-slate-200 font-mono flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${isSyncing ? 'bg-amber-400 animate-spin' : 'bg-emerald-400'}`}></span>
                <span>{isSyncing ? 'Syncing...' : 'Live DB'}</span>
              </div>
            </div>
          </div>

          {/* User Identity & Active Role Pill */}
          <div
            onClick={() => setIsAuthModalOpen(true)}
            title={`Active User: ${currentUser.fullName} (${currentUser.role.toUpperCase()}). Click to switch role or log in.`}
            className="cursor-pointer flex items-center space-x-2 px-2.5 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 hover:border-teal-500/50 transition-colors group"
          >
            <div className="w-6 h-6 rounded-lg bg-teal-500/20 text-teal-300 border border-teal-500/40 flex items-center justify-center font-bold text-xs">
              {currentUser.fullName ? currentUser.fullName.slice(0, 1) : 'U'}
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-[10px] text-slate-400 font-semibold truncate max-w-[95px] leading-tight">
                {currentUser.fullName.split(' ')[0]}
              </div>
              <div className="text-[9px] font-mono font-bold uppercase tracking-wider text-teal-300 leading-tight">
                {currentUser.role}
              </div>
            </div>
            <span className="text-[9px] px-1 py-0.2 rounded bg-slate-750 text-slate-300 font-mono hidden md:inline border border-slate-700">
              RBAC
            </span>
          </div>

          {/* ======================================================== */}
          {/* NOTIFICATION BELL WITH ALERTS DROPDOWN */}
          {/* ======================================================== */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowNotificationMenu(!showNotificationMenu)}
              aria-label="Open notifications"
              className={`relative p-2.5 rounded-xl border transition-all ${
                showNotificationMenu
                  ? 'bg-slate-800 text-teal-300 border-teal-500/60 glow-teal'
                  : unreadCount > 0
                  ? 'bg-slate-800/80 text-white border-slate-700 hover:border-teal-500/50 hover:bg-slate-800'
                  : 'bg-slate-800/50 text-slate-400 border-slate-700/60 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Bell className="w-4 h-4" />

              {/* Dynamic Unread Badge */}
              {unreadCount > 0 && (
                <>
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-[10px] font-black text-white shadow-md animate-fadeIn">
                    {unreadCount}
                  </span>
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-cyan-400 animate-ping pointer-events-none"></span>
                </>
              )}
            </button>

            {/* Notification Center Dropdown Popover */}
            {showNotificationMenu && (
              <div className="absolute right-0 mt-3 w-96 max-w-[calc(100vw-2rem)] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden z-50 animate-fadeIn glow-cyan">
                {/* Header */}
                <div className="p-4 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 rounded-lg bg-teal-500/20 text-teal-300">
                      <Bell className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white tracking-tight">Notification Center</h4>
                      <p className="text-[11px] text-slate-400">
                        {unreadCount > 0 ? `${unreadCount} unread business alerts` : 'All alerts caught up'}
                      </p>
                    </div>
                  </div>

                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-[11px] text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-1 transition-colors px-2 py-1 rounded-lg hover:bg-slate-800"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>Mark all read</span>
                    </button>
                  )}
                </div>

                {/* Category Filter Tabs */}
                <div className="px-3 pt-2 pb-1 border-b border-slate-800/80 flex items-center gap-1 overflow-x-auto bg-slate-950/40 text-[11px]">
                  {[
                    { id: 'all', label: 'All Alerts', count: notifications.length },
                    {
                      id: 'payment_deadlines',
                      label: 'Deadlines',
                      count: notifications.filter((n) => n.category === 'payment_deadlines').length,
                    },
                    {
                      id: 'low_stock',
                      label: 'Low Stock',
                      count: notifications.filter((n) => n.category === 'low_stock').length,
                    },
                    {
                      id: 'daily_summary',
                      label: 'Daily Summary',
                      count: notifications.filter((n) => n.category === 'daily_summary').length,
                    },
                  ].map((tab) => {
                    const isActive = activeCategory === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveCategory(tab.id as NotificationCategory)}
                        className={`whitespace-nowrap px-2.5 py-1 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                          isActive
                            ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                        }`}
                      >
                        <span>{tab.label}</span>
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono ${
                            isActive ? 'bg-teal-400 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {tab.count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Notifications List */}
                <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-800/60 p-2 space-y-1.5">
                  {filteredNotifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => handleNotificationAction(notif)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer group relative ${
                        !notif.isRead
                          ? 'bg-slate-850/90 border-slate-700/80 hover:border-teal-500/40 hover:bg-slate-800'
                          : 'bg-slate-950/40 border-slate-800/50 opacity-75 hover:opacity-100 hover:bg-slate-800/40'
                      }`}
                    >
                      {/* Unread indicator dot */}
                      {!notif.isRead && (
                        <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400/50"></span>
                      )}

                      <div className="flex items-start space-x-3">
                        <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 shrink-0 mt-0.5">
                          {getCategoryIcon(notif.category)}
                        </div>

                        <div className="flex-1 min-w-0 pr-4">
                          <div className="flex items-center space-x-2">
                            <span
                              className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider border ${getPriorityBadge(
                                notif.priority
                              )}`}
                            >
                              {notif.category.replace('_', ' ')}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium font-mono">
                              {notif.timeAgo}
                            </span>
                          </div>

                          <h5 className="text-xs font-bold text-white mt-1 group-hover:text-cyan-300 transition-colors leading-snug">
                            {notif.title}
                          </h5>

                          <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                            {notif.description}
                          </p>

                          {/* Quick Action Footer */}
                          <div className="mt-2.5 flex items-center justify-between">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleNotificationAction(notif);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-teal-500/15 hover:bg-teal-500/25 text-teal-300 border border-teal-500/30 text-[10px] font-bold flex items-center space-x-1 transition-colors"
                            >
                              <span>{notif.actionLabel}</span>
                              <ArrowRight className="w-3 h-3 ml-0.5" />
                            </button>

                            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {!notif.isRead && (
                                <button
                                  onClick={(e) => handleMarkAsRead(notif.id, e)}
                                  title="Mark as read"
                                  className="p-1 rounded text-slate-400 hover:text-teal-300 hover:bg-slate-750"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button
                                onClick={(e) => handleDeleteNotification(notif.id, e)}
                                title="Dismiss notification"
                                className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-750"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {filteredNotifications.length === 0 && (
                    <div className="py-10 text-center text-slate-400 text-xs">
                      <CheckCircle2 className="w-8 h-8 text-teal-400 mx-auto mb-2 opacity-80" />
                      <div className="font-semibold text-slate-300">All clear in this category!</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">No pending alerts for {activeCategory.replace('_', ' ')}.</div>
                    </div>
                  )}
                </div>

                {/* Footer status bar */}
                <div className="p-2.5 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between px-4">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></span>
                    Live monitoring active
                  </span>
                  <button
                    onClick={() => {
                      setActiveTab('dashboard');
                      setShowNotificationMenu(false);
                    }}
                    className="text-cyan-400 hover:underline font-semibold"
                  >
                    View All in Dashboard &rarr;
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Reset Demo Data Button */}
          <div className="relative">
            <button
              onClick={() => setResetConfirmOpen(!resetConfirmOpen)}
              title="Reset Demo Data"
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-750 text-slate-300 hover:text-white text-xs font-medium border border-slate-700 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden lg:inline text-[11px]">Reset Data</span>
            </button>

            {resetConfirmOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-xl p-3 z-50 text-xs">
                <p className="text-slate-300 mb-2 font-medium">Reset all demo sales, stock and khata to default state?</p>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setResetConfirmOpen(false)}
                    className="px-2.5 py-1 text-slate-400 hover:text-white rounded"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      resetToDemoData();
                      setResetConfirmOpen(false);
                    }}
                    className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded font-bold"
                  >
                    Reset
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* AI Guru Quick Assistant button */}
          <button
            onClick={() => setActiveTab('assistant')}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-teal-500/20 to-cyan-500/20 border border-teal-500/40 text-teal-300 hover:bg-teal-500/30 text-xs font-semibold shadow-sm transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span className="hidden sm:inline">Ask AI Guru</span>
          </button>
        </div>
      </div>
    </header>
  );
};
