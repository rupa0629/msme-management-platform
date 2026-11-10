export type PaymentStatus = 'paid' | 'pending' | 'partially_paid' | 'overdue';
export type PaymentMethod = 'cash' | 'upi' | 'bank_transfer' | 'cheque' | 'credit';

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  costPrice: number;
  sellingPrice: number;
  stock: number;
  minStockAlert: number;
  unit: string; // 'pcs', 'kg', 'meters', 'boxes'
  barcode?: string;
  lastRestocked?: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Sale {
  id: string;
  invoiceNo: string;
  date: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  customerGstin?: string;
  items: SaleItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  grandTotal: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  notes?: string;
}

export interface PurchaseItem {
  productId?: string;
  productName: string;
  quantity: number;
  unitCost: number;
  total: number;
}

export interface Purchase {
  id: string;
  billNumber: string;
  date: string;
  dueDate?: string;
  supplierId: string;
  supplierName: string;
  supplierGstin?: string;
  items: PurchaseItem[];
  subtotal: number;
  taxAmount: number;
  grandTotal: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  notes?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  gstin?: string;
  outstandingBalance: number; // Positive = customer owes shop (Udhaar)
  totalPurchased: number;
  lastPurchaseDate: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson?: string;
  phone: string;
  email?: string;
  address?: string;
  gstin?: string;
  payableBalance: number; // Positive = shop owes supplier
  totalOrders: number;
  paymentTermsDays: number;
}

export interface Expense {
  id: string;
  title: string;
  category: 'Rent' | 'Electricity & Utilities' | 'Salaries & Wages' | 'Logistics & Courier' | 'Packaging & Bags' | 'Tea & Refreshments' | 'Marketing & Ads' | 'Maintenance' | 'Miscellaneous';
  amount: number;
  date: string;
  paymentMethod: PaymentMethod;
  receiptName?: string;
  notes?: string;
}

export interface PaymentTransaction {
  id: string;
  type: 'received' | 'sent'; // received from customer, or sent to supplier
  entityName: string;
  entityType: 'customer' | 'supplier' | 'vendor';
  entityId: string;
  amount: number;
  date: string;
  paymentMethod: PaymentMethod;
  referenceNo?: string;
  notes?: string;
}

export interface ParsedAiAction {
  actionType: 'purchase' | 'sale' | 'expense' | 'payment_received' | 'payment_sent' | 'unknown';
  confidence: number;
  summary: string;
  entityName: string;
  entityType: 'supplier' | 'customer' | 'expense_category' | 'none';
  paymentStatus: 'paid' | 'pending';
  paymentMethod: PaymentMethod;
  items: {
    productName: string;
    quantity: number;
    unitPrice: number;
    totalAmount: number;
  }[];
  totalAmount: number;
  notes?: string;
}

export interface DailyActionItem {
  id: string;
  type: 'recovery' | 'inventory' | 'payable' | 'growth';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  targetEntity: string;
  amount: number;
  actionLabel: string;
}

export interface BusinessHealth {
  score: number;
  grade: string;
  summary: string;
  strengths: string[];
  risks: string[];
}

export interface StockMovement {
  id: string;
  businessId?: string;
  productId: string;
  productName: string;
  movementType: 'sale' | 'sale_return' | 'purchase' | 'purchase_return' | 'manual_adjustment' | 'damaged' | 'initial_stock';
  quantityChanged: number;
  previousStock: number;
  newStock: number;
  unitCost?: number;
  referenceId?: string;
  referenceType?: string;
  reason?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  businessId?: string;
  userId?: string;
  actorEmail: string;
  action: string;
  entityType: string;
  entityId?: string;
  oldData?: any;
  newData?: any;
  createdAt: string;
}

export interface DatabaseStatusInfo {
  isConfigured: boolean;
  provider: 'supabase' | 'local_persistent';
  supabaseUrl: string;
  activeBusinessId: string;
  totalProducts: number;
  totalSales: number;
  totalCustomers: number;
  totalSuppliers: number;
  totalStockMovements: number;
  totalAuditLogs: number;
  lastSyncedAt: string;
  syncState?: 'idle' | 'syncing' | 'synced' | 'error';
  tablesCreated?: boolean;
  message?: string;
}

export type UserRole = 'owner' | 'manager' | 'cashier' | 'accountant';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  role: UserRole;
  businessId: string;
  businessName: string;
  avatarUrl?: string;
}

export interface RolePermissions {
  canViewAnalytics: boolean;
  canManageStock: boolean;
  canViewCosts: boolean;
  canManageExpenses: boolean;
  canAccessDatabaseAudit: boolean;
  canManageBusiness: boolean;
  canDeleteRecords: boolean;
  canCollectPayments: boolean;
}

export interface BusinessOnboardingData {
  businessName: string;
  category: string;
  tagline?: string;
  gstin?: string;
  pan?: string;
  ownerName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  upiId: string;
}

export interface BusinessTenant {
  id: string;
  name: string;
  tagline?: string;
  gstin?: string;
  city?: string;
  role: UserRole;
}

export type ActiveTab =
  | 'dashboard'
  | 'sales'
  | 'inventory'
  | 'customers'
  | 'suppliers'
  | 'expenses'
  | 'payments'
  | 'scanner'
  | 'assistant'
  | 'analytics'
  | 'database'
  | 'team';


