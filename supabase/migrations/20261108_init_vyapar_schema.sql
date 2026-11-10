-- ============================================================================
-- VYAPAR AI - MSME OPERATING SYSTEM
-- Complete PostgreSQL Database Schema for Supabase
-- Version: 1.0.0
-- Includes: Multi-tenancy, UUID PKs, RLS, Indexes, Constraints, Audit Logs,
--           Stock Movements, Invoices, Payment Allocations & Automatic Triggers
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. USERS & PROFILES
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ============================================================================
-- 2. BUSINESSES (Multi-Tenant Isolation Root)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    legal_name TEXT,
    tagline TEXT,
    gstin VARCHAR(15),
    pan VARCHAR(10),
    phone TEXT,
    email TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    pincode VARCHAR(10),
    upi_id TEXT,
    bank_name TEXT,
    bank_account_number TEXT,
    bank_ifsc TEXT,
    currency VARCHAR(5) NOT NULL DEFAULT 'INR',
    currency_symbol VARCHAR(5) NOT NULL DEFAULT '₹',
    financial_year_start DATE DEFAULT DATE_TRUNC('year', CURRENT_DATE),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ============================================================================
-- 3. BUSINESS MEMBERSHIPS & ROLES (RBAC)
-- ============================================================================
CREATE TYPE public.business_role AS ENUM ('owner', 'admin', 'manager', 'cashier', 'accountant');

CREATE TABLE IF NOT EXISTS public.business_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role public.business_role NOT NULL DEFAULT 'manager',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(business_id, user_id)
);

-- Helper function to check business membership in RLS policies
CREATE OR REPLACE FUNCTION public.check_user_business_access(b_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.business_memberships bm
        WHERE bm.business_id = b_id
          AND bm.user_id = auth.uid()
          AND bm.is_active = TRUE
    );
$$;

-- ============================================================================
-- 4. CUSTOMERS & SUPPLIERS (Khata Ledgers)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    address TEXT,
    city TEXT,
    gstin VARCHAR(15),
    credit_limit NUMERIC(12, 2) NOT NULL DEFAULT 50000.00,
    outstanding_balance NUMERIC(12, 2) NOT NULL DEFAULT 0.00, -- Amount owed by customer (Udhaar)
    total_purchased NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    last_purchase_date TIMESTAMPTZ,
    notes TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    contact_person TEXT,
    phone TEXT NOT NULL,
    email TEXT,
    address TEXT,
    city TEXT,
    gstin VARCHAR(15),
    payment_terms_days INTEGER NOT NULL DEFAULT 15,
    payable_balance NUMERIC(12, 2) NOT NULL DEFAULT 0.00, -- Amount owed to supplier
    total_orders INTEGER NOT NULL DEFAULT 0,
    total_purchased_value NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    notes TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ============================================================================
-- 5. PRODUCTS & INVENTORY
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    sku VARCHAR(64) NOT NULL,
    barcode VARCHAR(64),
    category TEXT NOT NULL DEFAULT 'General',
    unit VARCHAR(16) NOT NULL DEFAULT 'pcs',
    hsn_code VARCHAR(16),
    tax_rate NUMERIC(5, 2) NOT NULL DEFAULT 5.00, -- GST rate in percent (e.g. 5%, 12%, 18%)
    cost_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    selling_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    low_stock_threshold INTEGER NOT NULL DEFAULT 10,
    image_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(business_id, sku)
);

-- ============================================================================
-- 6. STOCK MOVEMENTS (Audit-compliant Inventory Ledger)
-- ============================================================================
CREATE TYPE public.stock_movement_type AS ENUM (
    'sale',
    'sale_return',
    'purchase',
    'purchase_return',
    'manual_adjustment',
    'damaged',
    'initial_stock'
);

CREATE TABLE IF NOT EXISTS public.stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    movement_type public.stock_movement_type NOT NULL,
    quantity_changed INTEGER NOT NULL, -- Negative for sales/damage, positive for purchases/returns
    previous_stock INTEGER NOT NULL,
    new_stock INTEGER NOT NULL,
    unit_cost NUMERIC(12, 2),
    reference_id UUID, -- References sale_id or purchase_id if applicable
    reference_type VARCHAR(32), -- 'sale', 'purchase', 'adjustment'
    reason TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ============================================================================
-- 7. SALES & SALE ITEMS
-- ============================================================================
CREATE TYPE public.sale_status AS ENUM ('completed', 'cancelled', 'refunded');
CREATE TYPE public.payment_status AS ENUM ('paid', 'pending', 'partial');
CREATE TYPE public.payment_method AS ENUM ('cash', 'upi', 'card', 'bank_transfer', 'credit');

CREATE TABLE IF NOT EXISTS public.sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    invoice_number VARCHAR(64) NOT NULL,
    sale_date TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    tax_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    grand_total NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    amount_paid NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    amount_pending NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    payment_status public.payment_status NOT NULL DEFAULT 'paid',
    payment_method public.payment_method NOT NULL DEFAULT 'cash',
    sale_status public.sale_status NOT NULL DEFAULT 'completed',
    notes TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(business_id, invoice_number)
);

CREATE TABLE IF NOT EXISTS public.sale_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0),
    tax_rate NUMERIC(5, 2) NOT NULL DEFAULT 5.00,
    tax_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ============================================================================
-- 8. PURCHASES & PURCHASE ITEMS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
    bill_number VARCHAR(64) NOT NULL,
    purchase_date TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    tax_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    grand_total NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    amount_paid NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    amount_pending NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    payment_status public.payment_status NOT NULL DEFAULT 'paid',
    payment_method public.payment_method NOT NULL DEFAULT 'bank_transfer',
    invoice_image_url TEXT,
    ocr_extracted_data JSONB,
    notes TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(business_id, bill_number)
);

CREATE TABLE IF NOT EXISTS public.purchase_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    purchase_id UUID NOT NULL REFERENCES public.purchases(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_cost NUMERIC(12, 2) NOT NULL CHECK (unit_cost >= 0),
    tax_rate NUMERIC(5, 2) NOT NULL DEFAULT 5.00,
    tax_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ============================================================================
-- 9. EXPENSES & EXPENSE CATEGORIES
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.expense_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(business_id, name)
);

CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.expense_categories(id) ON DELETE SET NULL,
    category_name TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method public.payment_method NOT NULL DEFAULT 'cash',
    recipient TEXT,
    notes TEXT,
    receipt_url TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ============================================================================
-- 10. PAYMENTS & PAYMENT ALLOCATIONS (Reconciliation)
-- ============================================================================
CREATE TYPE public.payment_flow AS ENUM ('inward', 'outward'); -- inward = from customer, outward = to supplier

CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    payment_type public.payment_flow NOT NULL,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    payment_method public.payment_method NOT NULL DEFAULT 'upi',
    reference_number TEXT,
    transaction_date TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    notes TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.payment_allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    payment_id UUID NOT NULL REFERENCES public.payments(id) ON DELETE CASCADE,
    sale_id UUID REFERENCES public.sales(id) ON DELETE CASCADE,
    purchase_id UUID REFERENCES public.purchases(id) ON DELETE CASCADE,
    allocated_amount NUMERIC(12, 2) NOT NULL CHECK (allocated_amount > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ============================================================================
-- 11. INVOICES
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    sale_id UUID REFERENCES public.sales(id) ON DELETE SET NULL,
    invoice_number VARCHAR(64) NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT,
    customer_gstin VARCHAR(15),
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE,
    subtotal NUMERIC(12, 2) NOT NULL,
    tax_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    grand_total NUMERIC(12, 2) NOT NULL,
    amount_paid NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    balance_due NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    upi_qr_string TEXT,
    pdf_url TEXT,
    is_whatsapp_shared BOOLEAN NOT NULL DEFAULT FALSE,
    whatsapp_shared_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(business_id, invoice_number)
);

-- ============================================================================
-- 12. NOTIFICATIONS
-- ============================================================================
CREATE TYPE public.notification_category AS ENUM ('payment_deadlines', 'low_stock', 'daily_summary', 'system');
CREATE TYPE public.notification_priority AS ENUM ('high', 'medium', 'info');

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    category public.notification_category NOT NULL,
    priority public.notification_priority NOT NULL DEFAULT 'medium',
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    action_label TEXT,
    target_tab VARCHAR(32) NOT NULL DEFAULT 'dashboard',
    metadata JSONB,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ============================================================================
-- 13. AUDIT LOGS (Compliance, Security & Traceability)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    actor_email TEXT,
    action VARCHAR(64) NOT NULL, -- e.g. 'sale.created', 'product.stock_adjusted', 'customer.payment_received'
    entity_type VARCHAR(64) NOT NULL, -- 'sale', 'product', 'customer', 'supplier', 'expense'
    entity_id UUID,
    old_data JSONB,
    new_data JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ============================================================================
-- INDEXES FOR HIGH QUERY VELOCITY & DATA ISOLATION
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_memberships_user_business ON public.business_memberships(user_id, business_id);
CREATE INDEX IF NOT EXISTS idx_products_business_sku ON public.products(business_id, sku);
CREATE INDEX IF NOT EXISTS idx_products_business_low_stock ON public.products(business_id) WHERE stock_quantity <= low_stock_threshold;
CREATE INDEX IF NOT EXISTS idx_sales_business_date ON public.sales(business_id, sale_date DESC);
CREATE INDEX IF NOT EXISTS idx_sales_customer ON public.sales(customer_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_sale ON public.sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_purchases_business_date ON public.purchases(business_id, purchase_date DESC);
CREATE INDEX IF NOT EXISTS idx_purchases_supplier ON public.purchases(supplier_id);
CREATE INDEX IF NOT EXISTS idx_purchase_items_purchase ON public.purchase_items(purchase_id);
CREATE INDEX IF NOT EXISTS idx_customers_business_balance ON public.customers(business_id, outstanding_balance DESC);
CREATE INDEX IF NOT EXISTS idx_suppliers_business_balance ON public.suppliers(business_id, payable_balance DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_business_date ON public.expenses(business_id, expense_date DESC);
CREATE INDEX IF NOT EXISTS idx_payments_business_date ON public.payments(business_id, transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_stock_movements_product ON public.stock_movements(product_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_business_read ON public.notifications(business_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_business_date ON public.audit_logs(business_id, created_at DESC);

-- ============================================================================
-- AUTOMATIC UPDATED_AT TRIGGER FUNCTION
-- ============================================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_businesses_updated_at BEFORE UPDATE ON public.businesses FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE OR REPLACE TRIGGER trg_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE OR REPLACE TRIGGER trg_suppliers_updated_at BEFORE UPDATE ON public.suppliers FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE OR REPLACE TRIGGER trg_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE OR REPLACE TRIGGER trg_sales_updated_at BEFORE UPDATE ON public.sales FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE OR REPLACE TRIGGER trg_purchases_updated_at BEFORE UPDATE ON public.purchases FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE OR REPLACE TRIGGER trg_expenses_updated_at BEFORE UPDATE ON public.expenses FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE OR REPLACE TRIGGER trg_invoices_updated_at BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Strict multi-tenant isolation across every table
-- ============================================================================

-- Businesses
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view businesses they are members of"
    ON public.businesses FOR SELECT
    USING (public.check_user_business_access(id) OR created_by = auth.uid());

CREATE POLICY "Owners can update their businesses"
    ON public.businesses FOR UPDATE
    USING (public.check_user_business_access(id));

CREATE POLICY "Authenticated users can create businesses"
    ON public.businesses FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- Business Memberships
ALTER TABLE public.business_memberships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view memberships of their businesses"
    ON public.business_memberships FOR SELECT
    USING (public.check_user_business_access(business_id) OR user_id = auth.uid());

-- Products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Business members can view products"
    ON public.products FOR SELECT
    USING (public.check_user_business_access(business_id));

CREATE POLICY "Business members can insert products"
    ON public.products FOR INSERT
    WITH CHECK (public.check_user_business_access(business_id));

CREATE POLICY "Business members can update products"
    ON public.products FOR UPDATE
    USING (public.check_user_business_access(business_id));

CREATE POLICY "Business members can delete products"
    ON public.products FOR DELETE
    USING (public.check_user_business_access(business_id));

-- Stock Movements
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Business members can view stock movements"
    ON public.stock_movements FOR SELECT
    USING (public.check_user_business_access(business_id));

CREATE POLICY "Business members can insert stock movements"
    ON public.stock_movements FOR INSERT
    WITH CHECK (public.check_user_business_access(business_id));

-- Customers
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Business members can view customers"
    ON public.customers FOR SELECT
    USING (public.check_user_business_access(business_id));

CREATE POLICY "Business members can mutate customers"
    ON public.customers FOR ALL
    USING (public.check_user_business_access(business_id));

-- Suppliers
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Business members can view suppliers"
    ON public.suppliers FOR SELECT
    USING (public.check_user_business_access(business_id));

CREATE POLICY "Business members can mutate suppliers"
    ON public.suppliers FOR ALL
    USING (public.check_user_business_access(business_id));

-- Sales & Sale Items
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Business members can access sales"
    ON public.sales FOR ALL
    USING (public.check_user_business_access(business_id));

ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Business members can access sale items"
    ON public.sale_items FOR ALL
    USING (public.check_user_business_access(business_id));

-- Purchases & Purchase Items
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Business members can access purchases"
    ON public.purchases FOR ALL
    USING (public.check_user_business_access(business_id));

ALTER TABLE public.purchase_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Business members can access purchase items"
    ON public.purchase_items FOR ALL
    USING (public.check_user_business_access(business_id));

-- Expenses & Categories
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Business members can access expenses"
    ON public.expenses FOR ALL
    USING (public.check_user_business_access(business_id));

ALTER TABLE public.expense_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Business members can access expense categories"
    ON public.expense_categories FOR ALL
    USING (public.check_user_business_access(business_id));

-- Payments & Allocations
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Business members can access payments"
    ON public.payments FOR ALL
    USING (public.check_user_business_access(business_id));

ALTER TABLE public.payment_allocations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Business members can access payment allocations"
    ON public.payment_allocations FOR ALL
    USING (public.check_user_business_access(business_id));

-- Invoices
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Business members can access invoices"
    ON public.invoices FOR ALL
    USING (public.check_user_business_access(business_id));

-- Notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Business members can access notifications"
    ON public.notifications FOR ALL
    USING (public.check_user_business_access(business_id));

-- Audit Logs (Read-only for business members, insert-only via server service role or member)
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Business members can view audit logs"
    ON public.audit_logs FOR SELECT
    USING (public.check_user_business_access(business_id));

CREATE POLICY "Business members can record audit logs"
    ON public.audit_logs FOR INSERT
    WITH CHECK (public.check_user_business_access(business_id));
