import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  ActiveTab,
  AuditLog,
  BusinessHealth,
  BusinessOnboardingData,
  Customer,
  DailyActionItem,
  DatabaseStatusInfo,
  Expense,
  ParsedAiAction,
  PaymentTransaction,
  Product,
  Purchase,
  RolePermissions,
  Sale,
  StockMovement,
  Supplier,
  UserProfile,
  UserRole,
} from '../types';
import {
  initialCustomers,
  initialExpenses,
  initialProducts,
  initialPurchases,
  initialSales,
  initialSuppliers,
  initialTransactions,
} from '../data/mockData';

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  owner: {
    canViewAnalytics: true,
    canManageStock: true,
    canViewCosts: true,
    canManageExpenses: true,
    canAccessDatabaseAudit: true,
    canManageBusiness: true,
    canDeleteRecords: true,
    canCollectPayments: true,
  },
  manager: {
    canViewAnalytics: true,
    canManageStock: true,
    canViewCosts: true,
    canManageExpenses: true,
    canAccessDatabaseAudit: false,
    canManageBusiness: false,
    canDeleteRecords: false,
    canCollectPayments: true,
  },
  accountant: {
    canViewAnalytics: true,
    canManageStock: false,
    canViewCosts: true,
    canManageExpenses: true,
    canAccessDatabaseAudit: false,
    canManageBusiness: false,
    canDeleteRecords: false,
    canCollectPayments: true,
  },
  cashier: {
    canViewAnalytics: false,
    canManageStock: false,
    canViewCosts: false,
    canManageExpenses: false,
    canAccessDatabaseAudit: false,
    canManageBusiness: false,
    canDeleteRecords: false,
    canCollectPayments: true,
  },
};

export interface StoreInfo {
  storeName: string;
  tagline: string;
  ownerName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  gstin: string;
  upiId: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
}

export const defaultStoreInfo: StoreInfo = {
  storeName: 'Shree Lakshmi Textiles & Menswear',
  tagline: 'Quality Fabrics & Readymade Apparels Since 2012',
  ownerName: 'Ramesh Gupta',
  phone: '+91 98450 77123',
  email: 'ramesh.lakshmi.textiles@gmail.com',
  address: 'Shop #14, Commercial Plaza, Brigade Road',
  city: 'Bengaluru',
  state: 'Karnataka',
  pincode: '560001',
  gstin: '29AAACH1928K1Z3',
  upiId: 'lakshmitextiles@oksbi',
  bankName: 'State Bank of India',
  accountNumber: '39482910394',
  ifscCode: 'SBIN0004122',
};

interface BusinessContextType {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  products: Product[];
  sales: Sale[];
  purchases: Purchase[];
  customers: Customer[];
  suppliers: Supplier[];
  expenses: Expense[];
  transactions: PaymentTransaction[];
  storeInfo: StoreInfo;
  updateStoreInfo: (info: StoreInfo) => void;
  theme: 'navy' | 'light';
  toggleTheme: () => void;
  setTheme: (theme: 'navy' | 'light') => void;

  // Actions
  addSale: (saleData: Omit<Sale, 'id' | 'invoiceNo'>) => Sale;
  addPurchase: (purchaseData: Omit<Purchase, 'id' | 'billNumber'>) => Purchase;
  addExpense: (expenseData: Omit<Expense, 'id'>) => Expense;
  addProduct: (productData: Omit<Product, 'id'>) => Product;
  updateProductStock: (productId: string, newStock: number) => void;
  adjustStock: (productId: string, delta: number, reason: string) => void;
  addCustomer: (customerData: Omit<Customer, 'id' | 'totalPurchased' | 'outstandingBalance' | 'lastPurchaseDate'>) => Customer;
  addSupplier: (supplierData: Omit<Supplier, 'id' | 'totalOrders' | 'payableBalance'>) => Supplier;
  recordCustomerPayment: (customerId: string, amount: number, paymentMethod: any, referenceNo?: string, notes?: string) => void;
  recordSupplierPayment: (supplierId: string, amount: number, paymentMethod: any, referenceNo?: string, notes?: string) => void;

  // AI Prompt Modal & Processing
  aiActionModal: {
    isOpen: boolean;
    parsedAction: ParsedAiAction | null;
    rawInput: string;
  };
  openAiActionModal: (parsed: ParsedAiAction, rawInput: string) => void;
  closeAiActionModal: () => void;
  confirmAndExecuteAiAction: (actionToExecute: ParsedAiAction) => { success: boolean; message: string };

  // Calculations & Analytics
  todaySalesTotal: number;
  totalPendingReceivables: number;
  totalPayableBalance: number;
  totalRevenue: number;
  totalExpensesAmount: number;
  grossProfit: number;
  lowStockProducts: Product[];
  healthScore: number;
  dailyActionItems: DailyActionItem[];
  refreshAiInsights: () => Promise<void>;
  isInsightsLoading: boolean;

  // Reset
  resetToDemoData: () => void;

  // Global AI Action Trigger Helper
  parseAndOpenAction: (text: string) => Promise<{ success: boolean; parsed?: ParsedAiAction }>;

  // Database & Persistence (Supabase PostgreSQL & Local Multi-Tenant Engine)
  databaseStatus: DatabaseStatusInfo;
  isSyncing: boolean;
  syncToDatabase: () => Promise<boolean>;
  stockMovements: StockMovement[];
  auditLogs: AuditLog[];
  refreshDatabaseData: () => Promise<void>;
  recordStockMovement: (data: Omit<StockMovement, 'id' | 'createdAt'>) => Promise<void>;
  recordAuditLog: (action: string, entityType: string, entityId?: string, oldData?: any, newData?: any) => Promise<void>;

  // Authentication & RBAC (Supabase Auth / Multi-Role)
  currentUser: UserProfile;
  userRole: UserRole;
  permissions: RolePermissions;
  switchRole: (role: UserRole) => void;
  login: (email?: string, password?: string, role?: UserRole) => Promise<boolean>;
  signup: (email: string, password: string, fullName: string, role?: UserRole, phone?: string) => Promise<boolean>;
  logout: () => void;
  registerBusiness: (data: BusinessOnboardingData) => Promise<{ success: boolean; message: string }>;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isOnboardingModalOpen: boolean;
  setIsOnboardingModalOpen: (open: boolean) => void;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PRODUCTS: 'vyapar_products_v1',
  SALES: 'vyapar_sales_v1',
  PURCHASES: 'vyapar_purchases_v1',
  CUSTOMERS: 'vyapar_customers_v1',
  SUPPLIERS: 'vyapar_suppliers_v1',
  EXPENSES: 'vyapar_expenses_v1',
  TRANSACTIONS: 'vyapar_txns_v1',
  STORE_INFO: 'vyapar_store_v1',
  USER_PROFILE: 'vyapar_user_profile_v1',
};

export const BusinessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // User Profile & Authentication State
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return {
      id: 'usr-demo-owner',
      email: 'ramesh.lakshmi.textiles@gmail.com',
      fullName: 'Ramesh Gupta',
      role: 'owner',
      businessId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      businessName: 'Shree Lakshmi Textiles & Menswear',
    };
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(currentUser));
  }, [currentUser]);

  const userRole = currentUser.role;
  const permissions = useMemo(() => {
    return ROLE_PERMISSIONS[currentUser.role] || ROLE_PERMISSIONS.owner;
  }, [currentUser.role]);

  // Load state from localStorage with fallback to initial mock data
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return saved ? JSON.parse(saved) : initialProducts;
  });

  const [sales, setSales] = useState<Sale[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SALES);
    return saved ? JSON.parse(saved) : initialSales;
  });

  const [purchases, setPurchases] = useState<Purchase[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PURCHASES);
    return saved ? JSON.parse(saved) : initialPurchases;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    return saved ? JSON.parse(saved) : initialCustomers;
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SUPPLIERS);
    return saved ? JSON.parse(saved) : initialSuppliers;
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    return saved ? JSON.parse(saved) : initialExpenses;
  });

  const [transactions, setTransactions] = useState<PaymentTransaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return saved ? JSON.parse(saved) : initialTransactions;
  });

  const [storeInfo, setStoreInfo] = useState<StoreInfo>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STORE_INFO);
    return saved ? JSON.parse(saved) : defaultStoreInfo;
  });

  // AI Action Confirmation Modal state
  const [aiActionModal, setAiActionModal] = useState<{
    isOpen: boolean;
    parsedAction: ParsedAiAction | null;
    rawInput: string;
  }>({
    isOpen: false,
    parsedAction: null,
    rawInput: '',
  });

  const [theme, setThemeState] = useState<'navy' | 'light'>('navy');

  const setTheme = (newTheme: 'navy' | 'light') => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    // No-op since theme toggle has been removed
  };

  useEffect(() => {
    document.documentElement.classList.remove('theme-light');
    document.documentElement.classList.add('theme-navy');
    localStorage.removeItem('vyapar_theme_v1');
  }, []);

  const [isInsightsLoading, setIsInsightsLoading] = useState(false);
  const [customDailyActions, setCustomDailyActions] = useState<DailyActionItem[] | null>(null);

  // Sync with localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PURCHASES, JSON.stringify(purchases));
  }, [purchases]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STORE_INFO, JSON.stringify(storeInfo));
  }, [storeInfo]);

  // ==========================================================================
  // DATABASE PERSISTENCE & MULTI-TENANT ENGINE (Supabase PostgreSQL / Local)
  // ==========================================================================
  const [databaseStatus, setDatabaseStatus] = useState<DatabaseStatusInfo>({
    isConfigured: false,
    provider: 'local_persistent',
    supabaseUrl: 'Initializing...',
    activeBusinessId: 'biz-shree-lakshmi-01',
    totalProducts: products.length,
    totalSales: sales.length,
    totalCustomers: customers.length,
    totalSuppliers: suppliers.length,
    totalStockMovements: 0,
    totalAuditLogs: 1,
    lastSyncedAt: new Date().toISOString(),
    syncState: 'synced',
  });

  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Fetch initial database status, movements, and audit trail
  const refreshDatabaseData = async () => {
    try {
      const [statusRes, moveRes, logsRes] = await Promise.all([
        fetch('/api/db/status'),
        fetch('/api/db/stock-movements'),
        fetch('/api/db/audit-logs'),
      ]);

      if (statusRes.ok) {
        const sData = await statusRes.json();
        if (sData.status) {
          setDatabaseStatus((prev) => ({
            ...prev,
            ...sData.status,
            syncState: 'synced',
          }));
        }
      }

      if (moveRes.ok) {
        const mData = await moveRes.json();
        if (mData.movements) setStockMovements(mData.movements);
      }

      if (logsRes.ok) {
        const lData = await logsRes.json();
        if (lData.logs) setAuditLogs(lData.logs);
      }
    } catch (err) {
      console.warn('Initial database status fetch warning (non-blocking):', err);
    }
  };

  useEffect(() => {
    refreshDatabaseData();
  }, []);

  // Record Stock Movement to database & local state
  const recordStockMovement = async (data: Omit<StockMovement, 'id' | 'createdAt'>) => {
    const tempId = `sm-${Date.now()}`;
    const newEntry: StockMovement = {
      id: tempId,
      createdAt: new Date().toISOString(),
      ...data,
    };
    setStockMovements((prev) => [newEntry, ...prev]);

    try {
      await fetch('/api/db/stock-movements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } catch (err) {
      console.warn('Background stock movement recording notice:', err);
    }
  };

  // Record Audit Log to database & local state
  const recordAuditLog = async (
    action: string,
    entityType: string,
    entityId?: string,
    oldData?: any,
    newData?: any
  ) => {
    const tempId = `audit-${Date.now()}`;
    const newEntry: AuditLog = {
      id: tempId,
      businessId: databaseStatus.activeBusinessId,
      actorEmail: storeInfo.email || 'owner@vyapar.ai',
      action,
      entityType,
      entityId,
      oldData,
      newData,
      createdAt: new Date().toISOString(),
    };
    setAuditLogs((prev) => [newEntry, ...prev]);

    try {
      await fetch('/api/db/audit-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: databaseStatus.activeBusinessId,
          actorEmail: storeInfo.email || 'owner@vyapar.ai',
          action,
          entityType,
          entityId,
          oldData,
          newData,
        }),
      });
    } catch (err) {
      console.warn('Background audit log notice:', err);
    }
  };

  // Sync current business state to database
  const syncToDatabase = async (): Promise<boolean> => {
    setIsSyncing(true);
    setDatabaseStatus((prev) => ({ ...prev, syncState: 'syncing' }));

    try {
      const payload = {
        businessData: {
          products,
          sales,
          purchases,
          customers,
          suppliers,
          expenses,
          transactions,
          storeInfo,
        },
        actor: storeInfo.email || 'owner@vyapar.ai',
      };

      const res = await fetch('/api/db/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        setDatabaseStatus((prev) => ({
          ...prev,
          lastSyncedAt: data.timestamp || new Date().toISOString(),
          syncState: 'synced',
          totalProducts: products.length,
          totalSales: sales.length,
          totalCustomers: customers.length,
          totalSuppliers: suppliers.length,
        }));
        setIsSyncing(false);
        return true;
      }
    } catch (err) {
      console.warn('Sync to database warning:', err);
    }

    setIsSyncing(false);
    setDatabaseStatus((prev) => ({ ...prev, syncState: 'idle' }));
    return false;
  };

  // Automatic debounced database persistence
  useEffect(() => {
    const timer = setTimeout(() => {
      syncToDatabase();
    }, 2000);

    return () => clearTimeout(timer);
  }, [products, sales, purchases, customers, suppliers, expenses, transactions, storeInfo]);


  // Financial calculations
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Today's Sales calculation
  const todaySalesTotal = useMemo(() => {
    return sales
      .filter((s) => s.date === '2026-11-06' || s.date === todayStr)
      .reduce((acc, curr) => acc + curr.grandTotal, 0);
  }, [sales, todayStr]);

  // Pending Receivables (Udhaar owed by customers to shop)
  const totalPendingReceivables = useMemo(() => {
    return customers.reduce((acc, curr) => acc + (curr.outstandingBalance > 0 ? curr.outstandingBalance : 0), 0);
  }, [customers]);

  // Pending Payables (Money shop owes to suppliers)
  const totalPayableBalance = useMemo(() => {
    return suppliers.reduce((acc, curr) => acc + (curr.payableBalance > 0 ? curr.payableBalance : 0), 0);
  }, [suppliers]);

  // Total Lifetime Revenue recorded
  const totalRevenue = useMemo(() => {
    return sales.reduce((acc, curr) => acc + curr.grandTotal, 0);
  }, [sales]);

  // Total Expenses
  const totalExpensesAmount = useMemo(() => {
    return expenses.reduce((acc, curr) => acc + curr.amount, 0);
  }, [expenses]);

  // Estimated Gross Profit = Total Sales - Cost of Goods Sold in those sales
  const grossProfit = useMemo(() => {
    let cogs = 0;
    sales.forEach((s) => {
      s.items.forEach((item) => {
        const prod = products.find((p) => p.id === item.productId || p.name.toLowerCase() === item.productName.toLowerCase());
        const unitCost = prod ? prod.costPrice : item.unitPrice * 0.6;
        cogs += unitCost * item.quantity;
      });
    });
    return Math.max(0, totalRevenue - cogs);
  }, [sales, products, totalRevenue]);

  // Low Stock products
  const lowStockProducts = useMemo(() => {
    return products.filter((p) => p.stock <= p.minStockAlert);
  }, [products]);

  // Dynamic Business Health Score (0 - 100)
  const healthScore = useMemo(() => {
    let score = 70; // baseline
    if (todaySalesTotal >= 15000) score += 10;
    else if (todaySalesTotal >= 8000) score += 5;

    // Debt vs Revenue ratio
    const debtRatio = totalPendingReceivables / (totalRevenue || 1);
    if (debtRatio < 0.25) score += 8;
    else if (debtRatio > 0.4) score -= 10;

    // Low stock impact
    if (lowStockProducts.length === 0) score += 6;
    else if (lowStockProducts.length > 3) score -= 8;
    else score -= 3;

    // Supplier payables manageable
    if (totalPayableBalance < totalRevenue * 0.4) score += 6;

    return Math.min(98, Math.max(45, score));
  }, [todaySalesTotal, totalPendingReceivables, totalRevenue, lowStockProducts, totalPayableBalance]);

  // Default smart daily action items
  const dailyActionItems: DailyActionItem[] = useMemo(() => {
    if (customDailyActions) return customDailyActions;

    const items: DailyActionItem[] = [];

    // Find highest customer with pending balance
    const topDebtor = [...customers].sort((a, b) => b.outstandingBalance - a.outstandingBalance)[0];
    if (topDebtor && topDebtor.outstandingBalance > 0) {
      items.push({
        id: 'action-recovery',
        type: 'recovery',
        priority: 'high',
        title: `Collect ₹${topDebtor.outstandingBalance.toLocaleString('en-IN')} from ${topDebtor.name}`,
        description: `Payment is pending. Send a polite WhatsApp reminder with UPI QR to recover dues faster.`,
        targetEntity: topDebtor.name,
        amount: topDebtor.outstandingBalance,
        actionLabel: 'Send WhatsApp Reminder',
      });
    }

    // Low stock alert item
    const criticalStock = lowStockProducts[0];
    if (criticalStock) {
      items.push({
        id: 'action-stock',
        type: 'inventory',
        priority: 'high',
        title: `Reorder ${criticalStock.name} (${criticalStock.stock} ${criticalStock.unit} left)`,
        description: `Current stock has fallen below the safety buffer of ${criticalStock.minStockAlert} ${criticalStock.unit}.`,
        targetEntity: criticalStock.name,
        amount: criticalStock.costPrice * 25,
        actionLabel: 'Quick Reorder',
      });
    }

    // Payable due
    const topSupplier = [...suppliers].sort((a, b) => b.payableBalance - a.payableBalance)[0];
    if (topSupplier && topSupplier.payableBalance > 0) {
      items.push({
        id: 'action-payable',
        type: 'payable',
        priority: 'medium',
        title: `Pay ₹${topSupplier.payableBalance.toLocaleString('en-IN')} to ${topSupplier.name}`,
        description: `Payment settlement keeps your credit rating prime and avoids vendor supply holds.`,
        targetEntity: topSupplier.name,
        amount: topSupplier.payableBalance,
        actionLabel: 'Settle Supplier Bill',
      });
    }

    return items;
  }, [customDailyActions, customers, lowStockProducts, suppliers]);

  // 1. ADD SALE: Automatically updates inventory, customer records, and payment transactions
  const addSale = (saleData: Omit<Sale, 'id' | 'invoiceNo'>): Sale => {
    const newInvoiceNo = `VAI-2026-${100 + sales.length + 1}`;
    const newSale: Sale = {
      ...saleData,
      id: `sale-${Date.now()}`,
      invoiceNo: newInvoiceNo,
    };

    // Deduct stock for each sold item
    setProducts((prevProducts) =>
      prevProducts.map((p) => {
        const soldItem = newSale.items.find((item) => item.productId === p.id || item.productName.toLowerCase() === p.name.toLowerCase());
        if (soldItem) {
          const updatedStock = Math.max(0, p.stock - soldItem.quantity);
          return { ...p, stock: updatedStock };
        }
        return p;
      })
    );

    // If sale has customer and is pending/credit, update customer balance
    if (newSale.customerId && newSale.paymentStatus === 'pending') {
      setCustomers((prev) =>
        prev.map((c) => {
          if (c.id === newSale.customerId) {
            return {
              ...c,
              outstandingBalance: c.outstandingBalance + newSale.grandTotal,
              totalPurchased: c.totalPurchased + newSale.grandTotal,
              lastPurchaseDate: newSale.date,
            };
          }
          return c;
        })
      );
    } else if (newSale.customerId) {
      // Paid sale
      setCustomers((prev) =>
        prev.map((c) => {
          if (c.id === newSale.customerId) {
            return {
              ...c,
              totalPurchased: c.totalPurchased + newSale.grandTotal,
              lastPurchaseDate: newSale.date,
            };
          }
          return c;
        })
      );

      // Record in transactions if paid
      const newTxn: PaymentTransaction = {
        id: `txn-${Date.now()}`,
        type: 'received',
        entityName: newSale.customerName,
        entityType: 'customer',
        entityId: newSale.customerId,
        amount: newSale.grandTotal,
        date: newSale.date,
        paymentMethod: newSale.paymentMethod,
        referenceNo: `INV-${newInvoiceNo}`,
        notes: `Sale payment via ${newSale.paymentMethod.toUpperCase()}`,
      };
      setTransactions((prev) => [newTxn, ...prev]);
    }

    setSales((prev) => [newSale, ...prev]);

    // Record stock movements for each sold item in audit ledger
    newSale.items.forEach((item) => {
      const prod = products.find((p) => p.id === item.productId || p.name.toLowerCase() === item.productName.toLowerCase());
      if (prod) {
        recordStockMovement({
          productId: prod.id,
          productName: prod.name,
          movementType: 'sale',
          quantityChanged: -item.quantity,
          previousStock: prod.stock,
          newStock: Math.max(0, prod.stock - item.quantity),
          unitCost: prod.costPrice,
          referenceId: newSale.id,
          referenceType: 'sale',
          reason: `Sale Invoice #${newSale.invoiceNo} to ${newSale.customerName}`,
        });
      }
    });

    // Record immutable audit log
    recordAuditLog('sale.created', 'sale', newSale.id, null, {
      invoiceNo: newSale.invoiceNo,
      customer: newSale.customerName,
      grandTotal: newSale.grandTotal,
      itemsCount: newSale.items.length,
      paymentMethod: newSale.paymentMethod,
    });

    // Celebratory confetti
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#0D9488', '#06B6D4', '#10B981'],
    });

    return newSale;
  };

  // 2. ADD PURCHASE: Increases inventory, updates supplier payables, records transaction
  const addPurchase = (purchaseData: Omit<Purchase, 'id' | 'billNumber'>): Purchase => {
    const newBillNo = `PUR-${Date.now().toString().slice(-5)}`;
    const newPurchase: Purchase = {
      ...purchaseData,
      id: `purch-${Date.now()}`,
      billNumber: newBillNo,
    };

    // Increase inventory stock or create new product if it doesn't exist
    setProducts((prevProducts) => {
      const updated = [...prevProducts];
      newPurchase.items.forEach((item) => {
        const existingIndex = updated.findIndex(
          (p) => (item.productId && p.id === item.productId) || p.name.toLowerCase() === item.productName.toLowerCase()
        );
        if (existingIndex >= 0) {
          updated[existingIndex] = {
            ...updated[existingIndex],
            stock: updated[existingIndex].stock + item.quantity,
            costPrice: item.unitCost > 0 ? item.unitCost : updated[existingIndex].costPrice,
            lastRestocked: newPurchase.date,
          };
        } else {
          // Auto-create new product item in catalog
          updated.push({
            id: `prod-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            sku: `SKU-${item.productName.slice(0, 3).toUpperCase()}-${Math.floor(Math.random() * 900 + 100)}`,
            name: item.productName,
            category: 'General Apparel',
            costPrice: item.unitCost || 400,
            sellingPrice: Math.round((item.unitCost || 400) * 1.5),
            stock: item.quantity,
            minStockAlert: 10,
            unit: 'pcs',
            lastRestocked: newPurchase.date,
          });
        }
      });
      return updated;
    });

    // Update supplier payable if pending / credit
    setSuppliers((prev) => {
      const existing = prev.find((s) => s.id === newPurchase.supplierId || s.name.toLowerCase() === newPurchase.supplierName.toLowerCase());
      if (existing) {
        return prev.map((s) => {
          if (s.id === existing.id) {
            return {
              ...s,
              payableBalance: newPurchase.paymentStatus === 'pending' ? s.payableBalance + newPurchase.grandTotal : s.payableBalance,
              totalOrders: s.totalOrders + 1,
            };
          }
          return s;
        });
      } else {
        // Create new supplier
        const newSupplier: Supplier = {
          id: `supp-${Date.now()}`,
          name: newPurchase.supplierName,
          phone: '+91 98000 00000',
          payableBalance: newPurchase.paymentStatus === 'pending' ? newPurchase.grandTotal : 0,
          totalOrders: 1,
          paymentTermsDays: 15,
        };
        return [...prev, newSupplier];
      }
    });

    if (newPurchase.paymentStatus === 'paid') {
      const newTxn: PaymentTransaction = {
        id: `txn-${Date.now()}`,
        type: 'sent',
        entityName: newPurchase.supplierName,
        entityType: 'supplier',
        entityId: newPurchase.supplierId,
        amount: newPurchase.grandTotal,
        date: newPurchase.date,
        paymentMethod: newPurchase.paymentMethod,
        referenceNo: `BILL-${newBillNo}`,
        notes: `Purchase bill clearance`,
      };
      setTransactions((prev) => [newTxn, ...prev]);
    }

    setPurchases((prev) => [newPurchase, ...prev]);

    // Record stock movements for purchased items
    newPurchase.items.forEach((item) => {
      const existing = products.find((p) => (item.productId && p.id === item.productId) || p.name.toLowerCase() === item.productName.toLowerCase());
      const prevStock = existing ? existing.stock : 0;
      recordStockMovement({
        productId: existing ? existing.id : `prod-${Date.now()}`,
        productName: item.productName,
        movementType: 'purchase',
        quantityChanged: item.quantity,
        previousStock: prevStock,
        newStock: prevStock + item.quantity,
        unitCost: item.unitCost,
        referenceId: newPurchase.id,
        referenceType: 'purchase',
        reason: `Purchase Bill #${newPurchase.billNumber} from ${newPurchase.supplierName}`,
      });
    });

    recordAuditLog('purchase.created', 'purchase', newPurchase.id, null, {
      billNumber: newPurchase.billNumber,
      supplier: newPurchase.supplierName,
      grandTotal: newPurchase.grandTotal,
      paymentStatus: newPurchase.paymentStatus,
    });

    return newPurchase;
  };

  // 3. ADD EXPENSE
  const addExpense = (expenseData: Omit<Expense, 'id'>): Expense => {
    const newExpense: Expense = {
      ...expenseData,
      id: `exp-${Date.now()}`,
    };
    setExpenses((prev) => [newExpense, ...prev]);

    // Record out-flow payment
    const newTxn: PaymentTransaction = {
      id: `txn-${Date.now()}`,
      type: 'sent',
      entityName: newExpense.category,
      entityType: 'vendor',
      entityId: newExpense.id,
      amount: newExpense.amount,
      date: newExpense.date,
      paymentMethod: newExpense.paymentMethod,
      notes: newExpense.title,
    };
    setTransactions((prev) => [newTxn, ...prev]);

    return newExpense;
  };

  // 4. ADD PRODUCT
  const addProduct = (productData: Omit<Product, 'id'>): Product => {
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
      lastRestocked: new Date().toISOString().split('T')[0],
    };
    setProducts((prev) => [newProduct, ...prev]);
    return newProduct;
  };

  // 5. UPDATE PRODUCT STOCK
  const updateProductStock = (productId: string, newStock: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stock: Math.max(0, newStock), lastRestocked: new Date().toISOString().split('T')[0] } : p))
    );
  };

  const adjustStock = (productId: string, delta: number, reason: string) => {
    const prod = products.find((p) => p.id === productId);
    if (prod) {
      const nextStock = Math.max(0, prod.stock + delta);
      recordStockMovement({
        productId: prod.id,
        productName: prod.name,
        movementType: delta < 0 ? 'damaged' : 'manual_adjustment',
        quantityChanged: delta,
        previousStock: prod.stock,
        newStock: nextStock,
        reason: reason || 'Manual stock adjustment',
      });
      recordAuditLog('inventory.stock_adjusted', 'product', prod.id, { previousStock: prod.stock }, { newStock: nextStock, reason });
    }

    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const nextStock = Math.max(0, p.stock + delta);
          return { ...p, stock: nextStock };
        }
        return p;
      })
    );
  };

  // 6. ADD CUSTOMER
  const addCustomer = (customerData: Omit<Customer, 'id' | 'totalPurchased' | 'outstandingBalance' | 'lastPurchaseDate'>): Customer => {
    const newCustomer: Customer = {
      ...customerData,
      id: `cust-${Date.now()}`,
      outstandingBalance: 0,
      totalPurchased: 0,
      lastPurchaseDate: new Date().toISOString().split('T')[0],
    };
    setCustomers((prev) => [newCustomer, ...prev]);
    return newCustomer;
  };

  // 7. ADD SUPPLIER
  const addSupplier = (supplierData: Omit<Supplier, 'id' | 'totalOrders' | 'payableBalance'>): Supplier => {
    const newSupplier: Supplier = {
      ...supplierData,
      id: `supp-${Date.now()}`,
      payableBalance: 0,
      totalOrders: 0,
      paymentTermsDays: supplierData.paymentTermsDays || 15,
    };
    setSuppliers((prev) => [newSupplier, ...prev]);
    return newSupplier;
  };

  // 8. RECORD CUSTOMER PAYMENT (Receiving Udhaar)
  const recordCustomerPayment = (customerId: string, amount: number, paymentMethod: any, referenceNo?: string, notes?: string) => {
    const customer = customers.find((c) => c.id === customerId);
    if (!customer) return;

    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === customerId) {
          return {
            ...c,
            outstandingBalance: Math.max(0, c.outstandingBalance - amount),
          };
        }
        return c;
      })
    );

    const newTxn: PaymentTransaction = {
      id: `txn-${Date.now()}`,
      type: 'received',
      entityName: customer.name,
      entityType: 'customer',
      entityId: customerId,
      amount,
      date: new Date().toISOString().split('T')[0],
      paymentMethod,
      referenceNo: referenceNo || `RCV-${Date.now().toString().slice(-4)}`,
      notes: notes || `Udhaar recovery from ${customer.name}`,
    };
    setTransactions((prev) => [newTxn, ...prev]);

    confetti({
      particleCount: 40,
      spread: 50,
      origin: { y: 0.7 },
      colors: ['#06B6D4', '#10B981'],
    });
  };

  // 9. RECORD SUPPLIER PAYMENT (Paying bills)
  const recordSupplierPayment = (supplierId: string, amount: number, paymentMethod: any, referenceNo?: string, notes?: string) => {
    const supplier = suppliers.find((s) => s.id === supplierId);
    if (!supplier) return;

    setSuppliers((prev) =>
      prev.map((s) => {
        if (s.id === supplierId) {
          return {
            ...s,
            payableBalance: Math.max(0, s.payableBalance - amount),
          };
        }
        return s;
      })
    );

    const newTxn: PaymentTransaction = {
      id: `txn-${Date.now()}`,
      type: 'sent',
      entityName: supplier.name,
      entityType: 'supplier',
      entityId: supplierId,
      amount,
      date: new Date().toISOString().split('T')[0],
      paymentMethod,
      referenceNo: referenceNo || `PAY-${Date.now().toString().slice(-4)}`,
      notes: notes || `Supplier payment to ${supplier.name}`,
    };
    setTransactions((prev) => [newTxn, ...prev]);
  };

  // 10. AI ACTION CONFIRMATION & EXECUTION ENGINE
  const openAiActionModal = (parsed: ParsedAiAction, rawInput: string) => {
    setAiActionModal({
      isOpen: true,
      parsedAction: parsed,
      rawInput,
    });
  };

  const closeAiActionModal = () => {
    setAiActionModal({
      isOpen: false,
      parsedAction: null,
      rawInput: '',
    });
  };

  const confirmAndExecuteAiAction = (action: ParsedAiAction): { success: boolean; message: string } => {
    const today = new Date().toISOString().split('T')[0];

    try {
      if (action.actionType === 'purchase') {
        // "I purchased 50 shirts from ABC Traders for ₹20,000"
        let supplier = suppliers.find((s) => s.name.toLowerCase().includes(action.entityName.toLowerCase()));
        let supplierId = supplier ? supplier.id : `supp-${Date.now()}`;

        const items =
          action.items.length > 0
            ? action.items.map((i) => ({
                productName: i.productName,
                quantity: i.quantity,
                unitCost: i.unitPrice,
                total: i.totalAmount || i.quantity * i.unitPrice,
              }))
            : [
                {
                  productName: 'General Goods',
                  quantity: 1,
                  unitCost: action.totalAmount,
                  total: action.totalAmount,
                },
              ];

        addPurchase({
          date: today,
          supplierId,
          supplierName: action.entityName || 'Supplier',
          items,
          subtotal: action.totalAmount,
          taxAmount: 0,
          grandTotal: action.totalAmount,
          paymentMethod: action.paymentMethod || 'bank_transfer',
          paymentStatus: action.paymentStatus || 'paid',
          notes: `Automated by Vyapar AI: "${aiActionModal.rawInput}"`,
        });

        closeAiActionModal();
        return {
          success: true,
          message: `Successfully recorded purchase from ${action.entityName}! Added items to inventory and updated supplier balance.`,
        };
      } else if (action.actionType === 'sale') {
        // "Sold 5 cotton sarees to Ramesh for 7500 UPI"
        let customer = customers.find((c) => c.name.toLowerCase().includes(action.entityName.toLowerCase()));
        let customerId = customer ? customer.id : `cust-${Date.now()}`;

        const items =
          action.items.length > 0
            ? action.items.map((i) => ({
                productId: 'prod-item',
                productName: i.productName,
                quantity: i.quantity,
                unitPrice: i.unitPrice,
                total: i.totalAmount || i.quantity * i.unitPrice,
              }))
            : [
                {
                  productId: 'prod-general',
                  productName: 'Retail Sale Goods',
                  quantity: 1,
                  unitPrice: action.totalAmount,
                  total: action.totalAmount,
                },
              ];

        addSale({
          date: today,
          customerId,
          customerName: action.entityName || 'Walk-in Customer',
          items,
          subtotal: action.totalAmount,
          taxAmount: 0,
          discountAmount: 0,
          grandTotal: action.totalAmount,
          paymentMethod: action.paymentMethod || 'cash',
          paymentStatus: action.paymentStatus || 'paid',
          notes: `Automated sale by Vyapar AI: "${aiActionModal.rawInput}"`,
        });

        closeAiActionModal();
        return {
          success: true,
          message: `Recorded sale of ₹${action.totalAmount.toLocaleString('en-IN')}! Inventory deducted and customer ledger updated.`,
        };
      } else if (action.actionType === 'expense') {
        // "Paid shop rent ₹18,000"
        addExpense({
          title: action.notes || action.summary,
          category: (action.entityName as any) || 'Miscellaneous',
          amount: action.totalAmount,
          date: today,
          paymentMethod: action.paymentMethod || 'upi',
          notes: `Voice/AI logged: "${aiActionModal.rawInput}"`,
        });

        closeAiActionModal();
        return {
          success: true,
          message: `Logged expense of ₹${action.totalAmount.toLocaleString('en-IN')} for ${action.entityName}.`,
        };
      } else if (action.actionType === 'payment_received') {
        // "Received 4,200 pending payment from Priya Sharma"
        const customer = customers.find((c) => c.name.toLowerCase().includes(action.entityName.toLowerCase()));
        if (customer) {
          recordCustomerPayment(customer.id, action.totalAmount, action.paymentMethod || 'upi', undefined, 'AI voice cleared payment');
        } else {
          // Log general payment
          const newTxn: PaymentTransaction = {
            id: `txn-${Date.now()}`,
            type: 'received',
            entityName: action.entityName,
            entityType: 'customer',
            entityId: 'cust-general',
            amount: action.totalAmount,
            date: today,
            paymentMethod: action.paymentMethod || 'upi',
            notes: `Received from ${action.entityName}`,
          };
          setTransactions((prev) => [newTxn, ...prev]);
        }

        closeAiActionModal();
        return {
          success: true,
          message: `Received ₹${action.totalAmount.toLocaleString('en-IN')} from ${action.entityName}. Udhaar balance cleared!`,
        };
      } else if (action.actionType === 'payment_sent') {
        // "Sent 6,000 to Shree Ganesh"
        const supplier = suppliers.find((s) => s.name.toLowerCase().includes(action.entityName.toLowerCase()));
        if (supplier) {
          recordSupplierPayment(supplier.id, action.totalAmount, action.paymentMethod || 'bank_transfer', undefined, 'AI logged payment');
        }
        closeAiActionModal();
        return {
          success: true,
          message: `Sent payment of ₹${action.totalAmount.toLocaleString('en-IN')} to ${action.entityName}.`,
        };
      }

      closeAiActionModal();
      return { success: false, message: 'Unrecognized action type' };
    } catch (err: any) {
      console.error(err);
      return { success: false, message: err.message || 'Execution failed' };
    }
  };

  // 11. Helper to parse text using server-side Gemini API
  const parseAndOpenAction = async (text: string) => {
    try {
      const response = await fetch('/api/gemini/parse-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: text,
          currentProducts: products.map((p) => p.name),
          currentSuppliers: suppliers.map((s) => s.name),
          currentCustomers: customers.map((c) => c.name),
        }),
      });

      const data = await response.json();
      if (data.success && data.parsed) {
        openAiActionModal(data.parsed, text);
        return { success: true, parsed: data.parsed };
      }
      return { success: false };
    } catch (error) {
      console.error('Failed to parse AI action:', error);
      return { success: false };
    }
  };

  // 12. Refresh AI Insights
  const refreshAiInsights = async () => {
    setIsInsightsLoading(true);
    try {
      const response = await fetch('/api/gemini/daily-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessContext: {
            todaySalesTotal,
            totalPendingReceivables,
            totalPayableBalance,
            totalRevenue,
            totalExpensesAmount,
            grossProfit,
            healthScore,
            lowStockCount: lowStockProducts.length,
            lowStockItems: lowStockProducts.map((p) => `${p.name} (${p.stock} left)`),
            topDebtors: customers.filter((c) => c.outstandingBalance > 0).map((c) => `${c.name}: ₹${c.outstandingBalance}`),
          },
        }),
      });
      const data = await response.json();
      if (data.success && data.insights?.actionItems) {
        setCustomDailyActions(data.insights.actionItems);
      }
    } catch (err) {
      console.error('Insights fetch failed:', err);
    } finally {
      setIsInsightsLoading(false);
    }
  };

  // Reset to default demo data
  const resetToDemoData = () => {
    localStorage.clear();
    setProducts(initialProducts);
    setSales(initialSales);
    setPurchases(initialPurchases);
    setCustomers(initialCustomers);
    setSuppliers(initialSuppliers);
    setExpenses(initialExpenses);
    setTransactions(initialTransactions);
    setStoreInfo(defaultStoreInfo);
    setCustomDailyActions(null);
  };

  const updateStoreInfo = (info: StoreInfo) => {
    setStoreInfo(info);
  };

  // ==========================================================================
  // AUTHENTICATION & RBAC ROLE SWITCHING ENGINE
  // ==========================================================================

  const switchRole = async (targetRole: UserRole) => {
    const roleNames: Record<UserRole, { name: string; email: string }> = {
      owner: { name: 'Ramesh Gupta', email: 'ramesh.lakshmi.textiles@gmail.com' },
      manager: { name: 'Anand Kumar', email: 'anand.manager@vyapar.ai' },
      cashier: { name: 'Pooja Verma', email: 'pooja.cashier@vyapar.ai' },
      accountant: { name: 'Suresh Iyer (CA)', email: 'suresh.ca@vyapar.ai' },
    };

    const prevRole = currentUser.role;
    const nextUser: UserProfile = {
      ...currentUser,
      role: targetRole,
      fullName: roleNames[targetRole].name,
      email: roleNames[targetRole].email,
    };

    setCurrentUser(nextUser);
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(nextUser));

    // Record immutable audit log
    await recordAuditLog('auth.role_switched', 'user', currentUser.id, { previousRole: prevRole }, { newRole: targetRole });

    // If cashier, switch tab to 'sales' if currently on a restricted tab
    if (targetRole === 'cashier' && ['analytics', 'database', 'team', 'expenses'].includes(activeTab)) {
      setActiveTab('sales');
    }
  };

  const login = async (email?: string, password?: string, role?: UserRole): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          const profile: UserProfile = {
            id: data.user.id,
            email: data.user.email,
            fullName: data.user.fullName,
            role: data.user.role,
            businessId: data.user.businessId || databaseStatus.activeBusinessId,
            businessName: storeInfo.storeName,
          };
          setCurrentUser(profile);
          setIsAuthModalOpen(false);
          return true;
        }
      }
    } catch (err) {
      console.error('Login error:', err);
    }
    return false;
  };

  const signup = async (
    email: string,
    password: string,
    fullName: string,
    role: UserRole = 'cashier',
    phone?: string
  ): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName, role, phone }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          const profile: UserProfile = {
            id: data.user.id,
            email: data.user.email,
            fullName: data.user.fullName,
            role: data.user.role,
            businessId: data.user.businessId || databaseStatus.activeBusinessId,
            businessName: storeInfo.storeName,
          };
          setCurrentUser(profile);
          setIsAuthModalOpen(false);
          return true;
        }
      }
    } catch (err) {
      console.error('Signup error:', err);
    }
    return false;
  };

  const logout = () => {
    const demoCashier: UserProfile = {
      id: 'usr-demo-cashier',
      email: 'pooja.cashier@vyapar.ai',
      fullName: 'Pooja Verma',
      role: 'cashier',
      businessId: databaseStatus.activeBusinessId,
      businessName: storeInfo.storeName,
    };
    setCurrentUser(demoCashier);
    setActiveTab('sales');
  };

  const registerBusiness = async (data: BusinessOnboardingData): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch('/api/auth/register-business', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const resData = await res.json();

      if (!res.ok) {
        return { success: false, message: resData.error || 'Registration failed' };
      }

      if (resData.storeInfo) {
        setStoreInfo(resData.storeInfo);
        const newProfile: UserProfile = {
          id: `usr-${Date.now()}`,
          email: resData.storeInfo.email,
          fullName: resData.storeInfo.ownerName,
          role: 'owner',
          businessId: resData.businessId,
          businessName: resData.storeInfo.storeName,
        };
        setCurrentUser(newProfile);
        setIsOnboardingModalOpen(false);

        // Immediate persistence sync
        setTimeout(() => syncToDatabase(), 500);

        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#0D9488', '#06B6D4', '#F59E0B'],
        });

        return { success: true, message: resData.message };
      }

      return { success: false, message: 'Invalid server response' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Onboarding error' };
    }
  };

  return (
    <BusinessContext.Provider
      value={{
        activeTab,
        setActiveTab,
        products,
        sales,
        purchases,
        customers,
        suppliers,
        expenses,
        transactions,
        storeInfo,
        updateStoreInfo,

        addSale,
        addPurchase,
        addExpense,
        addProduct,
        updateProductStock,
        adjustStock,
        addCustomer,
        addSupplier,
        recordCustomerPayment,
        recordSupplierPayment,

        aiActionModal,
        openAiActionModal,
        closeAiActionModal,
        confirmAndExecuteAiAction,
        parseAndOpenAction,

        todaySalesTotal,
        totalPendingReceivables,
        totalPayableBalance,
        totalRevenue,
        totalExpensesAmount,
        grossProfit,
        lowStockProducts,
        healthScore,
        dailyActionItems,
        refreshAiInsights,
        isInsightsLoading,

        resetToDemoData,
        theme,
        toggleTheme,
        setTheme,

        databaseStatus,
        isSyncing,
        syncToDatabase,
        stockMovements,
        auditLogs,
        refreshDatabaseData,
        recordStockMovement,
        recordAuditLog,

        // Authentication & RBAC
        currentUser,
        userRole,
        permissions,
        switchRole,
        login,
        signup,
        logout,
        registerBusiness,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isOnboardingModalOpen,
        setIsOnboardingModalOpen,
      }}
    >
      {children}
    </BusinessContext.Provider>
  );
};

export const useBusiness = () => {
  const context = useContext(BusinessContext);
  if (!context) {
    throw new Error('useBusiness must be used within a BusinessProvider');
  }
  return context;
};
