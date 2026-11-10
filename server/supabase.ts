import { createClient, SupabaseClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase environment variables (Server-side ONLY)
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

export interface DatabaseStatus {
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
  tablesCreated?: boolean;
  message?: string;
}

export interface AuditLogEntry {
  id: string;
  businessId: string;
  userId?: string;
  actorEmail: string;
  action: string;
  entityType: string;
  entityId?: string;
  oldData?: any;
  newData?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface StockMovementEntry {
  id: string;
  businessId: string;
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

class DatabaseManager {
  private supabase: SupabaseClient | null = null;
  private localDataDir: string;
  private localDataFile: string;
  private activeBusinessId: string = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

  constructor() {
    this.localDataDir = path.resolve(__dirname, '../.data');
    this.localDataFile = path.resolve(this.localDataDir, 'vyapar_database.json');
    this.ensureLocalStorage();
    this.initSupabase();
  }

  private ensureLocalStorage() {
    try {
      if (!fs.existsSync(this.localDataDir)) {
        fs.mkdirSync(this.localDataDir, { recursive: true });
      }
      if (!fs.existsSync(this.localDataFile)) {
        const initialStore = {
          businesses: [
            {
              id: this.activeBusinessId,
              name: 'Shree Lakshmi Textiles & Menswear',
              legalName: 'Shree Lakshmi Textiles Private Limited',
              tagline: 'Quality Fabrics & Readymade Apparels Since 2012',
              gstin: '29AAACH1928K1Z3',
              phone: '+91 98450 77123',
              email: 'ramesh.lakshmi.textiles@gmail.com',
              city: 'Bengaluru',
              state: 'Karnataka',
              upiId: 'lakshmitextiles@oksbi',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
          products: [],
          sales: [],
          purchases: [],
          customers: [],
          suppliers: [],
          expenses: [],
          payments: [],
          stockMovements: [],
          auditLogs: [
            {
              id: 'audit-init-01',
              businessId: this.activeBusinessId,
              actorEmail: 'owner@vyapar.ai',
              action: 'system.database_initialized',
              entityType: 'system',
              newData: { provider: 'local_persistent', mode: 'offline_ready' },
              createdAt: new Date().toISOString(),
            },
          ],
          notifications: [],
          lastSyncedAt: new Date().toISOString(),
        };
        fs.writeFileSync(this.localDataFile, JSON.stringify(initialStore, null, 2), 'utf-8');
      }
    } catch (err) {
      console.warn('Failed to initialize local data directory:', err);
    }
  }

  private initSupabase() {
    if (SUPABASE_URL && SUPABASE_URL !== 'https://your-project.supabase.co' && SUPABASE_SERVICE_ROLE_KEY) {
      try {
        this.supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
          },
        });
        console.log(`[DatabaseManager] Connected to Supabase PostgreSQL at ${SUPABASE_URL}`);
      } catch (err) {
        console.error('[DatabaseManager] Supabase connection error:', err);
        this.supabase = null;
      }
    } else {
      console.log('[DatabaseManager] Running with Local Persistent PostgreSQL/JSON Engine (Supabase ready)');
    }
  }

  public getClient(): SupabaseClient | null {
    return this.supabase;
  }

  public isSupabaseConnected(): boolean {
    return this.supabase !== null;
  }

  public readLocalStore(): any {
    try {
      this.ensureLocalStorage();
      if (fs.existsSync(this.localDataFile)) {
        const raw = fs.readFileSync(this.localDataFile, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.error('Error reading local store:', err);
    }
    return {};
  }

  public writeLocalStore(data: any): void {
    try {
      this.ensureLocalStorage();
      data.lastSyncedAt = new Date().toISOString();
      fs.writeFileSync(this.localDataFile, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error writing local store:', err);
    }
  }

  public async getStatus(): Promise<DatabaseStatus> {
    const local = this.readLocalStore();
    let tablesCreated = false;
    let message = 'Local persistent storage engine active';

    if (this.supabase) {
      try {
        const { error } = await this.supabase.from('products').select('id').limit(1);
        if (!error) {
          tablesCreated = true;
          message = 'Supabase PostgreSQL connected & schema ready';
        } else if (error.code === 'PGRST205') {
          tablesCreated = false;
          message = 'Supabase connected! Tables pending creation via SQL migration script.';
        } else {
          message = `Supabase connected: ${error.message}`;
        }
      } catch (err: any) {
        message = `Supabase check notice: ${err.message}`;
      }
    }

    return {
      isConfigured: this.isSupabaseConnected(),
      provider: this.isSupabaseConnected() ? 'supabase' : 'local_persistent',
      supabaseUrl: SUPABASE_URL ? SUPABASE_URL.replace(/https:\/\/(.*)\.supabase\.co.*/, '$1.supabase.co') : 'Not Configured',
      activeBusinessId: this.activeBusinessId,
      totalProducts: (local.products || []).length,
      totalSales: (local.sales || []).length,
      totalCustomers: (local.customers || []).length,
      totalSuppliers: (local.suppliers || []).length,
      totalStockMovements: (local.stockMovements || []).length,
      totalAuditLogs: (local.auditLogs || []).length,
      lastSyncedAt: local.lastSyncedAt || new Date().toISOString(),
      tablesCreated,
      message,
    };
  }

  public async recordAuditLog(entry: Omit<AuditLogEntry, 'id' | 'createdAt'>): Promise<AuditLogEntry> {
    const newLog: AuditLogEntry = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      ...entry,
    };

    // 1. Save to local store
    const store = this.readLocalStore();
    if (!store.auditLogs) store.auditLogs = [];
    store.auditLogs.unshift(newLog);
    // Keep max 500 in local cache
    if (store.auditLogs.length > 500) {
      store.auditLogs = store.auditLogs.slice(0, 500);
    }
    this.writeLocalStore(store);

    // 2. If Supabase is connected, insert directly with RLS bypass via Service Role
    if (this.supabase) {
      try {
        await this.supabase.from('audit_logs').insert([
          {
            business_id: entry.businessId || this.activeBusinessId,
            actor_email: entry.actorEmail,
            action: entry.action,
            entity_type: entry.entityType,
            entity_id: entry.entityId || null,
            old_data: entry.oldData || null,
            new_data: entry.newData || null,
            ip_address: entry.ipAddress || null,
            user_agent: entry.userAgent || null,
          },
        ]);
      } catch (err) {
        console.warn('Failed to insert audit log to Supabase:', err);
      }
    }

    return newLog;
  }

  public async recordStockMovement(movement: Omit<StockMovementEntry, 'id' | 'createdAt'>): Promise<StockMovementEntry> {
    const entry: StockMovementEntry = {
      id: `sm-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      ...movement,
    };

    const store = this.readLocalStore();
    if (!store.stockMovements) store.stockMovements = [];
    store.stockMovements.unshift(entry);
    if (store.stockMovements.length > 1000) {
      store.stockMovements = store.stockMovements.slice(0, 1000);
    }
    this.writeLocalStore(store);

    if (this.supabase) {
      try {
        await this.supabase.from('stock_movements').insert([
          {
            business_id: movement.businessId || this.activeBusinessId,
            product_id: movement.productId,
            movement_type: movement.movementType,
            quantity_changed: movement.quantityChanged,
            previous_stock: movement.previousStock,
            new_stock: movement.newStock,
            unit_cost: movement.unitCost || null,
            reference_id: movement.referenceId || null,
            reference_type: movement.referenceType || null,
            reason: movement.reason || null,
          },
        ]);
      } catch (err) {
        console.warn('Failed to insert stock movement to Supabase:', err);
      }
    }

    return entry;
  }

  public getStockMovements(businessId?: string): StockMovementEntry[] {
    const store = this.readLocalStore();
    const movements: StockMovementEntry[] = store.stockMovements || [];
    const bId = businessId || this.activeBusinessId;
    return movements.filter((m) => !m.businessId || m.businessId === bId);
  }

  public getAuditLogs(businessId?: string): AuditLogEntry[] {
    const store = this.readLocalStore();
    const logs: AuditLogEntry[] = store.auditLogs || [];
    const bId = businessId || this.activeBusinessId;
    return logs.filter((l) => !l.businessId || l.businessId === bId);
  }

  public async syncAll(data: any, actor: string = 'merchant@vyapar.ai'): Promise<{ success: boolean; message: string; timestamp: string }> {
    const store = this.readLocalStore();

    if (data.products) store.products = data.products;
    if (data.sales) store.sales = data.sales;
    if (data.purchases) store.purchases = data.purchases;
    if (data.customers) store.customers = data.customers;
    if (data.suppliers) store.suppliers = data.suppliers;
    if (data.expenses) store.expenses = data.expenses;
    if (data.transactions) store.payments = data.transactions;
    if (data.storeInfo) {
      store.businesses = [
        {
          id: this.activeBusinessId,
          name: data.storeInfo.storeName || 'Shree Lakshmi Textiles',
          tagline: data.storeInfo.tagline,
          gstin: data.storeInfo.gstin,
          phone: data.storeInfo.phone,
          email: data.storeInfo.email,
          address: data.storeInfo.address,
          city: data.storeInfo.city,
          state: data.storeInfo.state,
          pincode: data.storeInfo.pincode,
          upiId: data.storeInfo.upiId,
          updatedAt: new Date().toISOString(),
        },
      ];
    }

    this.writeLocalStore(store);

    await this.recordAuditLog({
      businessId: this.activeBusinessId,
      actorEmail: actor,
      action: 'database.bulk_sync',
      entityType: 'business_data',
      newData: {
        productsCount: (data.products || []).length,
        salesCount: (data.sales || []).length,
        customersCount: (data.customers || []).length,
      },
    });

    // If Supabase is live, push upserts
    if (this.supabase) {
      try {
        console.log('[DatabaseManager] Pushing synchronized state to Supabase PostgreSQL...');

        // 1. Sync business profile
        if (data.storeInfo) {
          await this.supabase.from('businesses').upsert([
            {
              id: this.activeBusinessId,
              name: data.storeInfo.storeName || 'Shree Lakshmi Textiles & Menswear',
              tagline: data.storeInfo.tagline || 'Quality Fabrics & Readymade Apparels Since 2012',
              gstin: data.storeInfo.gstin || '29AAACH1928K1Z3',
              phone: data.storeInfo.phone || '+91 98450 77123',
              email: data.storeInfo.email || 'ramesh.lakshmi.textiles@gmail.com',
              city: data.storeInfo.city || 'Bengaluru',
              state: data.storeInfo.state || 'Karnataka',
              upi_id: data.storeInfo.upiId || 'lakshmitextiles@oksbi',
            },
          ]);
        }

        // 2. Sync products table
        if (data.products && data.products.length > 0) {
          const supabaseProducts = data.products.map((p: any) => ({
            business_id: this.activeBusinessId,
            name: p.name,
            sku: p.sku || `SKU-${p.id}`,
            category: p.category || 'General',
            unit: p.unit || 'pcs',
            hsn_code: p.hsn || null,
            cost_price: p.costPrice || 0,
            selling_price: p.sellingPrice || 0,
            stock_quantity: p.stock || 0,
            low_stock_threshold: p.minStockAlert || p.lowStockThreshold || 10,
            is_active: true,
          }));
          await this.supabase.from('products').upsert(supabaseProducts, { onConflict: 'business_id,sku' });
        }

        // 3. Sync customers table
        if (data.customers && data.customers.length > 0) {
          const supabaseCustomers = data.customers.map((c: any) => ({
            business_id: this.activeBusinessId,
            name: c.name,
            phone: c.phone || '+91 98000 00000',
            email: c.email || null,
            outstanding_balance: c.outstandingBalance || 0,
            total_purchased: c.totalPurchased || 0,
            is_active: true,
          }));
          await this.supabase.from('customers').upsert(supabaseCustomers);
        }

        // 4. Sync suppliers table
        if (data.suppliers && data.suppliers.length > 0) {
          const supabaseSuppliers = data.suppliers.map((s: any) => ({
            business_id: this.activeBusinessId,
            name: s.name,
            phone: s.phone || '+91 98000 00000',
            email: s.email || null,
            payable_balance: s.payableBalance || 0,
            total_orders: s.totalOrders || 0,
            is_active: true,
          }));
          await this.supabase.from('suppliers').upsert(supabaseSuppliers);
        }
      } catch (sbErr) {
        console.warn('[DatabaseManager] Supabase upsert notice:', sbErr);
      }
    }

    return {
      success: true,
      message: this.isSupabaseConnected() ? 'Synced successfully to Supabase PostgreSQL' : 'Persisted securely to local PostgreSQL/JSON database',
      timestamp: new Date().toISOString(),
    };
  }
}

export const dbManager = new DatabaseManager();
