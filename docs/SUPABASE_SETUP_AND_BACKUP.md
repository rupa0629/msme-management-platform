# Supabase PostgreSQL Database Setup, Backup & Disaster Recovery Guide

This document outlines the database architecture, security practices, backup routines, and recovery procedures for **Vyapar AI – MSME Operating System**.

---

## 1. Database Architecture & Key Principles

Vyapar AI is architected for high reliability, strict multi-tenant isolation, and zero loss of financial ledgers.

* **Database Engine**: PostgreSQL 15+ hosted on Supabase.
* **Primary Keys**: RFC 4122 UUID v4 (`gen_random_uuid()`).
* **Multi-Tenant Root**: Every transactional and master table strictly references `business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE`.
* **Zero Credential Exposure**:
  * The frontend application **never** receives `SUPABASE_SERVICE_ROLE_KEY` or raw database connection strings.
  * All database mutations and queries are routed either through secure server-side Express proxy endpoints (`/api/db/*`) or via the Supabase client using restricted Row Level Security (RLS) policies.

---

## 2. Initial Setup in Supabase

### Step 1: Create a Supabase Project
1. Log in to [https://supabase.com](https://supabase.com).
2. Create a new project (e.g. `vyapar-ai-production`).
3. Choose the region closest to your merchants (e.g., `ap-south-1` Mumbai for Indian MSMEs).
4. Save your database password securely in your password manager.

### Step 2: Apply the Schema Migration
1. In the Supabase Dashboard, navigate to the **SQL Editor**.
2. Click **New Query**.
3. Copy the entire contents of `/supabase/migrations/20261108_init_vyapar_schema.sql` from this repository.
4. Paste into the SQL editor and click **Run**.
5. Verify in **Table Editor** that all 13 tables are created:
   * `businesses`
   * `business_memberships`
   * `profiles`
   * `products`
   * `stock_movements`
   * `customers`
   * `suppliers`
   * `sales` & `sale_items`
   * `purchases` & `purchase_items`
   * `expenses` & `expense_categories`
   * `payments` & `payment_allocations`
   * `invoices`
   * `notifications`
   * `audit_logs`

### Step 3: Configure Environment Variables
In your server environment (or `.env` file for local development), set:

```bash
# Server-side environment variables (Never bundle in frontend)
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="eyJh...[your-service-role-secret]"
SUPABASE_ANON_KEY="eyJh...[your-public-anon-key]"
```

---

## 3. Row Level Security (RLS) & Access Control

Every table has Row Level Security enabled. Tenant isolation is enforced through the security definer function:

```sql
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
```

### Verification Query:
To test RLS isolation between two test businesses:
```sql
-- Run as authenticated user 1
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claim.sub" = '<USER_1_UUID>';

-- Should ONLY return products belonging to user 1's business
SELECT id, name, sku FROM public.products;
```

---

## 4. Backup Strategies

### A. Automatic Cloud Backups (Managed by Supabase)
1. **Daily Backups**: Supabase automatically creates daily snapshots of your database retained for 7 to 30 days depending on your project tier.
2. **Point-in-Time Recovery (PITR)**:
   * Recommended for production MSME deployments.
   * Allows restoring the database to any specified second within the retention window (e.g., right before an accidental bulk deletion).
   * Enable in: **Supabase Dashboard → Project Settings → Database → Point-in-Time Recovery**.

### B. Automated Off-Site CLI / pg_dump Backups
For regulatory compliance and independent off-site archiving, schedule daily automated backups via `pg_dump`:

```bash
#!/bin/bash
# Script: backup_vyapar_db.sh
set -e

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/var/backups/vyapar_ai"
BACKUP_FILE="${BACKUP_DIR}/vyapar_backup_${TIMESTAMP}.dump"

mkdir -p "$BACKUP_DIR"

# Connection string from Supabase: Project Settings -> Database -> Connection String (URI)
# Ensure sslmode=require is enabled
export PGPASSWORD="<YOUR_DB_PASSWORD>"
pg_dump -h db.<PROJECT_REF>.supabase.co \
        -U postgres \
        -p 5432 \
        -d postgres \
        -F c \
        -b \
        -v \
        -f "$BACKUP_FILE"

# Encrypt backup with GPG
gpg --symmetric --cipher-algo AES256 "$BACKUP_FILE"
rm -f "$BACKUP_FILE"

echo "Backup completed and encrypted: ${BACKUP_FILE}.gpg"
```

To schedule as a cron job running every night at 2:00 AM IST:
```cron
0 2 * * * /usr/local/bin/backup_vyapar_db.sh >> /var/log/vyapar_backup.log 2>&1
```

---

## 5. Disaster Recovery & Restoration Procedure

### Scenario 1: Restoring from a Point in Time (Supabase UI)
1. Go to **Supabase Dashboard → Project Settings → Database**.
2. Select **Point in Time Recovery**.
3. Choose the exact timestamp (e.g. `2026-11-08 07:30:00 UTC`).
4. Click **Restore Database**. Supabase spins up the restored replica without downtime to your primary project.

### Scenario 2: Restoring from `pg_dump` Backup Archive
To restore to a fresh database or recovery instance:

```bash
# 1. Decrypt the backup
gpg -d vyapar_backup_20261108_020000.dump.gpg > vyapar_backup.dump

# 2. Restore into target PostgreSQL database
pg_restore -h db.<NEW_PROJECT_REF>.supabase.co \
           -U postgres \
           -d postgres \
           -v \
           --clean \
           --if-exists \
           vyapar_backup.dump

# 3. Clean up unencrypted dump file
rm -f vyapar_backup.dump
```

---

## 6. Audit Trail & Compliance

Every critical financial event writes an immutable entry into `public.audit_logs`:
* **Actor**: User UUID and email.
* **Entity**: Sale, Purchase, Payment, Product stock adjustment.
* **Payload**: Before (`old_data`) and After (`new_data`) JSON snapshots.
* **Origin**: Request IP address and User Agent.

This ensures Indian GST audit readiness, dispute resolution for customer credit (*Udhaar*), and tracking of any unauthorized inventory shrinkages.
