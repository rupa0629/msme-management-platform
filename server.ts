import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { dbManager } from './server/supabase.ts';
import {
  rateLimiter,
  validateGstin,
  validateUpiId,
  validateIndianPhone,
  validateMonetaryAmount,
  sanitizePayload,
  authenticateUser,
  requireRoles,
  getRolePermissions,
  UserRole,
} from './server/security.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const portArgIndex = process.argv.indexOf('--port');
const cliPort = portArgIndex !== -1 ? parseInt(process.argv[portArgIndex + 1], 10) : null;
const PORT = cliPort || 3000;

// Middleware for parsing JSON with generous payload limit for invoice images
app.use(express.json({ limit: '25mb' }));

// 1. Rate limiter on API endpoints (150 requests per minute with Retry-After headers)
app.use('/api', rateLimiter(60000, 150));

// 2. Recursive input sanitization against XSS and prototype pollution
app.use((req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizePayload(req.body);
  }
  next();
});

// 3. User Authentication & Session Token Resolution
app.use('/api', authenticateUser);

// Helper to get GoogleGenAI client
function getGenAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// ----------------------------------------------------------------------------
// AUTHENTICATION & RBAC APIS (Supabase Auth / Multi-Role Management)
// ----------------------------------------------------------------------------

// Mock team member directory for demo store
const demoTeamMembers = [
  {
    id: 'usr-1',
    name: 'Ramesh Gupta',
    email: 'ramesh.lakshmi.textiles@gmail.com',
    role: 'owner' as UserRole,
    phone: '+91 98450 77123',
    status: 'active',
    joinedAt: '2024-01-15',
  },
  {
    id: 'usr-2',
    name: 'Anand Kumar',
    email: 'anand.manager@vyapar.ai',
    role: 'manager' as UserRole,
    phone: '+91 98450 88234',
    status: 'active',
    joinedAt: '2024-06-10',
  },
  {
    id: 'usr-3',
    name: 'Pooja Verma',
    email: 'pooja.cashier@vyapar.ai',
    role: 'cashier' as UserRole,
    phone: '+91 98450 11987',
    status: 'active',
    joinedAt: '2024-09-01',
  },
  {
    id: 'usr-4',
    name: 'Suresh Iyer (CA)',
    email: 'suresh.ca@vyapar.ai',
    role: 'accountant' as UserRole,
    phone: '+91 98450 44567',
    status: 'active',
    joinedAt: '2024-03-20',
  },
];

// Get currently authenticated user profile & permissions
app.get('/api/auth/me', (req, res) => {
  const user = req.user || {
    id: 'usr-demo-owner',
    email: 'ramesh.lakshmi.textiles@gmail.com',
    role: 'owner' as UserRole,
    businessId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  };

  const permissions = getRolePermissions(user.role);
  return res.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      businessId: user.businessId,
      fullName:
        user.role === 'owner'
          ? 'Ramesh Gupta'
          : user.role === 'manager'
          ? 'Anand Kumar'
          : user.role === 'cashier'
          ? 'Pooja Verma'
          : 'Suresh Iyer (CA)',
    },
    permissions,
  });
});

// User login (Supports both Supabase Auth credentials and 1-click test roles)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password, role = 'owner' } = req.body;
    const supabase = dbManager.getClient();

    // If Supabase client is live and email + password provided, attempt real Supabase Auth
    if (supabase && email && password) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (!error && data.user) {
        const assignedRole = (data.user.user_metadata?.role || role || 'owner') as UserRole;
        await dbManager.recordAuditLog({
          businessId: data.user.user_metadata?.business_id || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
          actorEmail: data.user.email || email,
          action: 'auth.login_success',
          entityType: 'user',
          entityId: data.user.id,
          newData: { method: 'supabase_auth', role: assignedRole },
        });

        return res.json({
          success: true,
          token: data.session?.access_token || 'demo-token',
          user: {
            id: data.user.id,
            email: data.user.email,
            role: assignedRole,
            businessId: data.user.user_metadata?.business_id || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
            fullName: data.user.user_metadata?.full_name || email.split('@')[0],
          },
          permissions: getRolePermissions(assignedRole),
        });
      }
    }

    // Seamless Demo / Fallback Authentication for quick verification
    const selectedRole = (['owner', 'manager', 'cashier', 'accountant'].includes(role) ? role : 'owner') as UserRole;
    const demoEmail = email || `${selectedRole}@vyapar.ai`;
    const demoName =
      selectedRole === 'owner'
        ? 'Ramesh Gupta'
        : selectedRole === 'manager'
        ? 'Anand Kumar'
        : selectedRole === 'cashier'
        ? 'Pooja Verma'
        : 'Suresh Iyer (CA)';

    await dbManager.recordAuditLog({
      businessId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      actorEmail: demoEmail,
      action: 'auth.login_session',
      entityType: 'user',
      newData: { role: selectedRole, email: demoEmail },
    });

    return res.json({
      success: true,
      token: 'demo-token',
      user: {
        id: `usr-demo-${selectedRole}`,
        email: demoEmail,
        role: selectedRole,
        businessId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        fullName: demoName,
      },
      permissions: getRolePermissions(selectedRole),
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Login failed' });
  }
});

// User signup
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, fullName, role = 'cashier', phone } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    if (phone) {
      const phoneValidation = validateIndianPhone(phone);
      if (!phoneValidation.isValid) {
        return res.status(400).json({ error: phoneValidation.error });
      }
    }

    const supabase = dbManager.getClient();
    let userId = `usr-${Date.now()}`;

    if (supabase && password) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role,
            phone,
            business_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
          },
        },
      });

      if (!error && data.user) {
        userId = data.user.id;
      }
    }

    await dbManager.recordAuditLog({
      businessId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      actorEmail: email,
      action: 'auth.user_signup',
      entityType: 'user',
      entityId: userId,
      newData: { email, fullName, role },
    });

    return res.json({
      success: true,
      message: 'Account registered successfully',
      user: {
        id: userId,
        email,
        fullName: fullName || email.split('@')[0],
        role: role as UserRole,
        businessId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      },
      permissions: getRolePermissions(role as UserRole),
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Signup failed' });
  }
});

// Merchant Business Onboarding Registration with strict GSTIN/UPI/Phone validation
app.post('/api/auth/register-business', async (req, res) => {
  try {
    const data = req.body;
    if (!data.businessName || data.businessName.trim() === '') {
      return res.status(400).json({ error: 'Business name is required' });
    }
    if (!data.ownerName || data.ownerName.trim() === '') {
      return res.status(400).json({ error: 'Owner name is required' });
    }

    // Validate Indian Phone
    const phoneRes = validateIndianPhone(data.phone);
    if (!phoneRes.isValid) {
      return res.status(400).json({ error: phoneRes.error });
    }

    // Validate GSTIN if provided
    if (data.gstin) {
      const gstinRes = validateGstin(data.gstin);
      if (!gstinRes.isValid) {
        return res.status(400).json({ error: gstinRes.error });
      }
    }

    // Validate UPI ID if provided
    if (data.upiId) {
      const upiRes = validateUpiId(data.upiId);
      if (!upiRes.isValid) {
        return res.status(400).json({ error: upiRes.error });
      }
    }

    const businessId = `biz-${Date.now()}`;
    const newStoreInfo = {
      storeName: data.businessName.trim(),
      tagline: data.tagline || 'Leading Merchant & Retailer',
      ownerName: data.ownerName.trim(),
      phone: data.phone.trim(),
      email: data.email || 'merchant@vyapar.ai',
      address: data.address || 'Commercial Market',
      city: data.city || 'Mumbai',
      state: data.state || 'Maharashtra',
      pincode: data.pincode || '400001',
      gstin: data.gstin ? data.gstin.trim().toUpperCase() : '',
      upiId: data.upiId ? data.upiId.trim().toLowerCase() : '',
      bankName: 'State Bank of India',
      accountNumber: '98765432101',
      ifscCode: 'SBIN0001234',
    };

    // Record immutable audit log
    await dbManager.recordAuditLog({
      businessId,
      actorEmail: data.email || 'owner@vyapar.ai',
      action: 'business.registered',
      entityType: 'business',
      entityId: businessId,
      newData: {
        businessName: newStoreInfo.storeName,
        gstin: newStoreInfo.gstin,
        owner: newStoreInfo.ownerName,
        upiId: newStoreInfo.upiId,
      },
    });

    return res.json({
      success: true,
      message: `Business "${newStoreInfo.storeName}" successfully registered!`,
      businessId,
      storeInfo: newStoreInfo,
      userRole: 'owner',
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Business onboarding failed' });
  }
});

// Team directory listing
app.get('/api/auth/team', (req, res) => {
  return res.json({
    success: true,
    members: demoTeamMembers,
    rolesMatrix: [
      {
        role: 'owner',
        title: 'Business Owner / Super Admin',
        description: 'Complete unrestricted authority over store operations, financials, team management, database, and settings.',
        access: ['All Modules', 'Financial Audits', 'Role Management', 'Database Export', 'Delete Records'],
      },
      {
        role: 'manager',
        title: 'Store Operations Manager',
        description: 'Supervises sales, supplier restocking, inventory adjustments, and operational expenses.',
        access: ['Sales & POS', 'Inventory Restock', 'Stock Adjustments', 'Customer & Supplier Khata', 'Daily Expenses'],
      },
      {
        role: 'accountant',
        title: 'Chartered Accountant / Tax Auditor',
        description: 'Focuses on ledger reconciliations, balance sheets, input tax credit (ITC), and profit statements.',
        access: ['Business Analytics', 'Tax & GST Reports', 'Expense Approvals', 'Payment Allocations', 'Khata Ledgers'],
      },
      {
        role: 'cashier',
        title: 'Point of Sale (POS) Cashier',
        description: 'Issues sales bills, processes customer checkouts, looks up inventory availability, and receives customer payments.',
        access: ['Create Sales', 'Print Invoices', 'Receive Payments', 'Customer Lookup', 'Check Stock Levels'],
      },
    ],
  });
});

// ----------------------------------------------------------------------------
// DATABASE & PERSISTENCE APIS (Supabase PostgreSQL / Local Isolation Engine)
// ----------------------------------------------------------------------------

// Get database status, provider, table metrics and active business
app.get('/api/db/status', async (req, res) => {
  try {
    const status = await dbManager.getStatus();
    return res.json({ success: true, status });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Database status error' });
  }
});

// Bulk sync active business state to database with audit logging (Protected: Owner, Manager, Accountant)
app.post('/api/db/sync', requireRoles(['owner', 'manager', 'accountant']), async (req, res) => {
  try {
    const { businessData, actor } = req.body;
    if (!businessData) {
      return res.status(400).json({ error: 'Missing businessData payload' });
    }
    const result = await dbManager.syncAll(businessData, actor || req.user?.email || 'merchant@vyapar.ai');
    return res.json(result);
  } catch (err: any) {
    console.error('Error in /api/db/sync:', err);
    return res.status(500).json({ error: err.message || 'Sync failed' });
  }
});

// Fetch Audit Logs (Protected: Owner only)
app.get('/api/db/audit-logs', requireRoles(['owner']), async (req, res) => {
  try {
    const logs = dbManager.getAuditLogs();
    return res.json({ success: true, logs });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch audit logs' });
  }
});

// Fetch Stock Movement Ledger
app.get('/api/db/stock-movements', async (req, res) => {
  try {
    const movements = dbManager.getStockMovements();
    return res.json({ success: true, movements });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch stock movements' });
  }
});

// Record new stock movement (Protected: Owner, Manager)
app.post('/api/db/stock-movements', requireRoles(['owner', 'manager']), async (req, res) => {
  try {
    const movement = req.body;
    if (!movement.productId || movement.quantityChanged === undefined) {
      return res.status(400).json({ error: 'Missing required stock movement fields' });
    }
    const record = await dbManager.recordStockMovement(movement);
    return res.json({ success: true, record });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to record stock movement' });
  }
});

// Record custom audit log
app.post('/api/db/audit-logs', async (req, res) => {
  try {
    const entry = req.body;
    const record = await dbManager.recordAuditLog(entry);
    return res.json({ success: true, record });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to record audit log' });
  }
});

// Export full database JSON backup
app.get('/api/db/export', (req, res) => {
  try {
    const store = dbManager.readLocalStore();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="vyapar_db_backup_${Date.now()}.json"`);
    return res.send(JSON.stringify(store, null, 2));
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Export error' });
  }
});

// Provide raw SQL migration script for 1-click clipboard copy
app.get('/api/db/migration-sql', (req, res) => {
  try {
    const sqlPath = path.resolve(__dirname, 'supabase/migrations/20261108_init_vyapar_schema.sql');
    if (fs.existsSync(sqlPath)) {
      const sql = fs.readFileSync(sqlPath, 'utf-8');
      return res.json({ success: true, sql });
    }
    return res.status(404).json({ error: 'Migration file not found' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to read migration script' });
  }
});

// 1. Natural Language Action Parser Endpoint
// Parses statements like "I purchased 50 shirts from ABC Traders for ₹20,000"
app.post('/api/gemini/parse-action', async (req, res) => {
  try {
    const { prompt, currentProducts, currentSuppliers, currentCustomers } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const ai = getGenAIClient();

    // Fallback rule-based parser in case API key is not yet set
    const fallbackParse = (text: string) => {
      const lower = text.toLowerCase();
      const amountMatch = text.match(/(?:₹|rs\.?|inr)?\s*([\d,]+(?:\.\d+)?)/i);
      let parsedAmount = 0;
      if (amountMatch) {
        parsedAmount = parseFloat(amountMatch[1].replace(/,/g, ''));
      }

      if (lower.includes('purchase') || lower.includes('bought') || lower.includes('khareeda')) {
        const qtyMatch = text.match(/(\d+)\s*(?:pieces?|pcs?|units?|items?|shirts?|pants?|boxes?|sarees?|kg)?/i);
        const qty = qtyMatch ? parseInt(qtyMatch[1], 10) : 10;
        let supplierName = 'ABC Traders';
        if (text.includes('from ')) {
          const parts = text.split(/from /i)[1]?.split(/for |at |on /i);
          if (parts && parts[0]) supplierName = parts[0].trim();
        }

        let itemName = 'Cotton Shirts';
        if (lower.includes('shirt')) itemName = 'Cotton Shirts';
        else if (lower.includes('saree')) itemName = 'Banarasi Silk Saree';
        else if (lower.includes('kurta') || lower.includes('kurti')) itemName = 'Designer Kurti';

        const totalCost = parsedAmount || 20000;
        const unitPrice = Math.round(totalCost / (qty || 1));

        return {
          actionType: 'purchase',
          confidence: 0.94,
          summary: `Purchase of ${qty} units of ${itemName} from ${supplierName} for ₹${totalCost.toLocaleString('en-IN')}`,
          entityName: supplierName,
          entityType: 'supplier',
          paymentStatus: lower.includes('credit') || lower.includes('udhaar') ? 'pending' : 'paid',
          paymentMethod: lower.includes('upi') ? 'upi' : lower.includes('cash') ? 'cash' : 'bank_transfer',
          items: [
            {
              productName: itemName,
              quantity: qty,
              unitPrice: unitPrice,
              totalAmount: totalCost,
            },
          ],
          totalAmount: totalCost,
          notes: 'Auto-parsed from business voice/text command',
        };
      }

      if (lower.includes('sold') || lower.includes('sale') || lower.includes('becha')) {
        const qtyMatch = text.match(/(\d+)\s*(?:pieces?|pcs?|units?|items?|shirts?|sarees?|kurtas?)?/i);
        const qty = qtyMatch ? parseInt(qtyMatch[1], 10) : 2;
        let customerName = 'Walk-in Customer';
        if (text.includes('to ')) {
          const parts = text.split(/to /i)[1]?.split(/for |at |on |via /i);
          if (parts && parts[0]) customerName = parts[0].trim();
        }

        const totalAmount = parsedAmount || 5000;
        return {
          actionType: 'sale',
          confidence: 0.92,
          summary: `Sale of ${qty} items to ${customerName} for ₹${totalAmount.toLocaleString('en-IN')}`,
          entityName: customerName,
          entityType: 'customer',
          paymentStatus: lower.includes('credit') || lower.includes('udhaar') ? 'pending' : 'paid',
          paymentMethod: lower.includes('cash') ? 'cash' : lower.includes('upi') ? 'upi' : 'card',
          items: [
            {
              productName: 'General Goods',
              quantity: qty,
              unitPrice: Math.round(totalAmount / (qty || 1)),
              totalAmount: totalAmount,
            },
          ],
          totalAmount: totalAmount,
          notes: 'Auto-parsed from business voice/text command',
        };
      }

      if (lower.includes('rent') || lower.includes('electricity') || lower.includes('bill') || lower.includes('salary') || lower.includes('expense')) {
        const totalAmount = parsedAmount || 2500;
        let category = 'Utilities';
        if (lower.includes('rent')) category = 'Rent';
        else if (lower.includes('salary') || lower.includes('wages')) category = 'Salaries';

        return {
          actionType: 'expense',
          confidence: 0.95,
          summary: `Business expense of ₹${totalAmount.toLocaleString('en-IN')} for ${category}`,
          entityName: category,
          entityType: 'expense_category',
          paymentStatus: 'paid',
          paymentMethod: lower.includes('cash') ? 'cash' : 'upi',
          items: [],
          totalAmount: totalAmount,
          notes: text,
        };
      }

      return {
        actionType: 'unknown',
        confidence: 0.5,
        summary: `Unrecognized command: "${text}". Please specify whether this is a purchase, sale, expense, or payment.`,
        entityName: '',
        entityType: 'none',
        paymentStatus: 'pending',
        paymentMethod: 'cash',
        items: [],
        totalAmount: parsedAmount || 0,
        notes: text,
      };
    };

    if (!ai) {
      const parsed = fallbackParse(prompt);
      return res.json({ success: true, parsed, source: 'local_engine' });
    }

    const systemPrompt = `You are the AI extraction engine for "Vyapar AI", an Indian MSME Business Operating System.
The shop owner speaks or types natural language commands in English, Hinglish, or Hindi transliteration (e.g., "I purchased 50 shirts from ABC Traders for ₹20,000", "Sold 3 sarees to Ramesh for 7500 UPI", "Paid shop rent 12000 cash", "Received 4000 pending udhaar from Priya").

Extract the structured transaction intent strictly adhering to the JSON schema.
- actionType: "purchase" | "sale" | "expense" | "payment_received" | "payment_sent"
- If a purchase: it increases inventory, adds purchase record, updates supplier payable balance.
- If a sale: it reduces inventory, adds sale record, updates customer record (or creates new customer if named).
- If an expense: records business expense under appropriate category (Rent, Electricity, Logistics, Packaging, Staff Wages, Tea & Snacks, Maintenance, Miscellaneous).
- If payment_received: records payment received from a customer for pending bills.
- If payment_sent: records payment sent to a supplier.
- extract item details: productName, quantity (number), unitPrice (number), totalAmount (number).
- extract entityName (supplier name, customer name, or vendor/category).
- paymentStatus: "paid" | "pending" (if mention of credit, udhaar, baki, pending).
- paymentMethod: "cash" | "upi" | "bank_transfer" | "cheque" | "credit"

Known existing products: ${JSON.stringify(currentProducts || [])}
Known existing suppliers: ${JSON.stringify(currentSuppliers || [])}
Known existing customers: ${JSON.stringify(currentCustomers || [])}

Ensure numerical amounts are clean numbers (no currency symbols or commas).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            actionType: {
              type: Type.STRING,
              description: 'One of: purchase, sale, expense, payment_received, payment_sent',
            },
            confidence: {
              type: Type.NUMBER,
              description: 'Confidence between 0.0 and 1.0',
            },
            summary: {
              type: Type.STRING,
              description: 'Clear one-line summary in English with Indian rupee symbol',
            },
            entityName: {
              type: Type.STRING,
              description: 'Customer name, supplier name, or expense payee',
            },
            entityType: {
              type: Type.STRING,
              description: 'supplier, customer, expense_category, or bank',
            },
            paymentStatus: {
              type: Type.STRING,
              description: 'paid or pending',
            },
            paymentMethod: {
              type: Type.STRING,
              description: 'cash, upi, bank_transfer, cheque, or credit',
            },
            items: {
              type: Type.ARRAY,
              description: 'List of line items',
              items: {
                type: Type.OBJECT,
                properties: {
                  productName: { type: Type.STRING },
                  quantity: { type: Type.NUMBER },
                  unitPrice: { type: Type.NUMBER },
                  totalAmount: { type: Type.NUMBER },
                },
              },
            },
            totalAmount: {
              type: Type.NUMBER,
              description: 'Total financial value in INR',
            },
            notes: {
              type: Type.STRING,
              description: 'Additional notes or context',
            },
          },
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ success: true, parsed, source: 'gemini-3.8-flash' });
  } catch (error: any) {
    console.error('Error in /api/gemini/parse-action:', error);
    return res.status(500).json({ error: error.message || 'Failed to parse action' });
  }
});

// 2. Multimodal OCR Invoice Scanner Endpoint
app.post('/api/gemini/ocr-invoice', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg' } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'imageBase64 is required' });
    }

    const ai = getGenAIClient();
    if (!ai) {
      // Realistic simulation if API key is absent
      return res.json({
        success: true,
        source: 'local_engine',
        invoiceData: {
          supplierName: 'Shree Balaji Textile Hub Pvt Ltd',
          supplierGstin: '24AAACB1234D1Z5',
          supplierPhone: '+91 98251 44320',
          supplierAddress: 'Ring Road Market, Surat, Gujarat 395002',
          invoiceNumber: 'INV-2026-892',
          invoiceDate: new Date().toISOString().split('T')[0],
          dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
          paymentStatus: 'pending',
          paymentMethod: 'bank_transfer',
          items: [
            { productName: 'Cotton Printed Shirts (M/L/XL)', quantity: 40, unitPrice: 380, hsn: '6205', taxRate: 5, totalAmount: 15200 },
            { productName: 'Chanderi Silk Dupattas', quantity: 20, unitPrice: 240, hsn: '6214', taxRate: 5, totalAmount: 4800 },
          ],
          subtotal: 20000,
          cgst: 500,
          sgst: 500,
          totalAmount: 21000,
          notes: 'Verified via OCR scan. 15 days credit terms.',
        },
      });
    }

    const systemPrompt = `You are a high-accuracy Indian GST Tax Invoice & Bill OCR parser.
Analyze the provided invoice image (bill, challan, cash memo, or B2B tax invoice).
Extract:
- supplierName (company or store name)
- supplierGstin (15-digit GSTIN if present, or blank)
- supplierPhone (phone number if present)
- supplierAddress (address if present)
- invoiceNumber (bill number)
- invoiceDate (YYYY-MM-DD or standard format)
- dueDate (YYYY-MM-DD or estimated)
- paymentStatus ("paid" or "pending")
- paymentMethod ("cash", "upi", "bank_transfer", "cheque", "credit")
- items (array of line items with productName, quantity, unitPrice, hsn code if any, taxRate percentage, totalAmount)
- subtotal (numeric)
- cgst (numeric)
- sgst (numeric)
- totalAmount (grand total numeric)
- notes (summary of extracted details)`;

    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data,
            },
          },
          {
            text: 'Extract all invoice fields, line items, quantities, prices, taxes, and supplier data from this invoice image in strict JSON.',
          },
        ],
      },
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            supplierName: { type: Type.STRING },
            supplierGstin: { type: Type.STRING },
            supplierPhone: { type: Type.STRING },
            supplierAddress: { type: Type.STRING },
            invoiceNumber: { type: Type.STRING },
            invoiceDate: { type: Type.STRING },
            dueDate: { type: Type.STRING },
            paymentStatus: { type: Type.STRING },
            paymentMethod: { type: Type.STRING },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  productName: { type: Type.STRING },
                  quantity: { type: Type.NUMBER },
                  unitPrice: { type: Type.NUMBER },
                  hsn: { type: Type.STRING },
                  taxRate: { type: Type.NUMBER },
                  totalAmount: { type: Type.NUMBER },
                },
              },
            },
            subtotal: { type: Type.NUMBER },
            cgst: { type: Type.NUMBER },
            sgst: { type: Type.NUMBER },
            totalAmount: { type: Type.NUMBER },
            notes: { type: Type.STRING },
          },
        },
      },
    });

    const parsedInvoice = JSON.parse(response.text || '{}');
    return res.json({ success: true, source: 'gemini-3.8-flash', invoiceData: parsedInvoice });
  } catch (error: any) {
    console.error('Error in /api/gemini/ocr-invoice:', error);
    return res.status(500).json({ error: error.message || 'Failed to scan invoice' });
  }
});

// 3. AI Business Advisor Chat Endpoint
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { messages, businessContext } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const ai = getGenAIClient();

    const systemInstruction = `You are "Vyapar AI Guru", the senior business advisor, CA & growth consultant for an Indian MSME shop owner.
You speak clearly, warmly, respectfully, and practically with Indian business terminology (e.g., Khata, Udhaar, GPay/PhonePe, GST input tax credit, Diwali restocking, working capital, dead stock).
Never do guesswork on financial totals; use the verified business context provided below:

Current Business Live Snapshot:
${JSON.stringify(businessContext || {}, null, 2)}

Provide actionable, crisp advice. If the user asks to perform an action (e.g., "Add 20 shirts from ABC", "Mark Ramesh's payment as received"), provide the helpful explanation and suggest clicking the AI Quick Action button. Keep answers well-formatted with bullet points, bold key figures in INR (₹), and concise tips.`;

    if (!ai) {
      // Intelligent fallback answer if API key is not configured
      const lastUserMsg = messages[messages.length - 1]?.content?.toLowerCase() || '';
      let reply = `Namaste! Here is your quick business check:\n\n• **Today's Revenue:** ₹18,500 across 8 orders.\n• **Pending Khata Receivables:** ₹12,400 from 3 customers. Recommending a polite WhatsApp reminder to Priya Sharma (₹4,200 pending for 18 days).\n• **Low Stock Alert:** 2 items are below reorder threshold (Linen Kurtas & Denim Jeans).\n• **Working Capital Health:** Good liquidity with an 88/100 business health score!`;
      if (lastUserMsg.includes('tax') || lastUserMsg.includes('gst')) {
        reply = `For your GST filing this month:\n• **Estimated Output Tax collected:** ₹2,450\n• **Input Tax Credit (ITC) available from supplier bills:** ₹1,800\n• **Net GST Payable:** ~₹650\nEnsure all purchase bills from registered GST suppliers are uploaded to claim full ITC.`;
      } else if (lastUserMsg.includes('profit') || lastUserMsg.includes('margin')) {
        reply = `Your gross profit margin is currently running at **32.4%**! Top margin category is Ethnic Wear (42% margin), while Casual Wear is at 28%. We recommend bundling slow-moving casual wear with popular festival items to liquidate aged stock.`;
      }
      return res.json({ success: true, text: reply, source: 'local_engine' });
    }

    // Format conversation history for Gemini
    const contents = messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contents,
      config: {
        systemInstruction,
      },
    });

    return res.json({ success: true, text: response.text || '', source: 'gemini-3.8-flash' });
  } catch (error: any) {
    console.error('Error in /api/gemini/chat:', error);
    return res.status(500).json({ error: error.message || 'Chat service error' });
  }
});

// 4. Daily AI Insights & Health Action Plan
app.post('/api/gemini/daily-insights', async (req, res) => {
  try {
    const { businessContext } = req.body;
    const ai = getGenAIClient();

    const fallbackInsights = {
      healthScore: 88,
      healthGrade: 'Strong',
      summary: 'Business cash flow is stable with strong 32% gross margins, but ₹12,400 in customer credit requires immediate collection.',
      actionItems: [
        {
          id: 'action-1',
          type: 'recovery',
          priority: 'high',
          title: 'Collect ₹4,200 from Priya Sharma',
          description: 'Payment is 18 days overdue. Sending a polite WhatsApp reminder with UPI payment link typically recovers 85% within 24 hours.',
          targetEntity: 'Priya Sharma',
          amount: 4200,
          actionLabel: 'Send WhatsApp Reminder',
        },
        {
          id: 'action-2',
          type: 'inventory',
          priority: 'high',
          title: 'Reorder Cotton Shirts (Only 4 left)',
          description: 'Cotton Shirts has sold 28 units this week. Reorder 30-50 units from ABC Traders to prevent stock-out this weekend.',
          targetEntity: 'ABC Traders',
          amount: 11400,
          actionLabel: 'Create Reorder PO',
        },
        {
          id: 'action-3',
          type: 'payable',
          priority: 'medium',
          title: 'Pay ₹6,000 to Shree Ganesh Textiles',
          description: 'Due in 3 days. Early settlement unlocks 2% cash discount (save ₹120) and preserves preferred supplier tier.',
          targetEntity: 'Shree Ganesh Textiles',
          amount: 6000,
          actionLabel: 'Pay Supplier via UPI',
        },
      ],
      strengths: ['High repeat customer rate (64%)', 'Healthy 1.8x working capital ratio', 'Zero bad debts written off'],
      risks: ['2 SKUs reaching zero stock in 48 hours', 'Overdue receivables increased by 8% this week'],
    };

    if (!ai) {
      return res.json({ success: true, insights: fallbackInsights, source: 'local_engine' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Evaluate this Indian MSME shop's live state and generate a structured Daily Action Plan and Health Score.\nBusiness state: ${JSON.stringify(businessContext || {})}`,
      config: {
        systemInstruction: `You are an elite AI Business Analyst for Indian MSMEs. Compute an accurate business health score (0-100) and identify the top 3 high-impact actionable items for the shopkeeper today (recover overdue udhaar, prevent stockouts, optimize supplier payments, boost weekend sales). Output strict JSON.`,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            healthScore: { type: Type.NUMBER },
            healthGrade: { type: Type.STRING },
            summary: { type: Type.STRING },
            actionItems: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  type: { type: Type.STRING },
                  priority: { type: Type.STRING },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  targetEntity: { type: Type.STRING },
                  amount: { type: Type.NUMBER },
                  actionLabel: { type: Type.STRING },
                },
              },
            },
            strengths: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            risks: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
        },
      },
    });

    const parsedInsights = JSON.parse(response.text || '{}');
    return res.json({ success: true, insights: parsedInsights, source: 'gemini-3.8-flash' });
  } catch (error: any) {
    console.error('Error in /api/gemini/daily-insights:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate insights' });
  }
});

// Setup Vite dev middleware or serve static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Vyapar AI server running on http://0.0.0.0:${PORT} [mode: ${process.env.NODE_ENV || 'development'}]`);
  });
}

startServer();
