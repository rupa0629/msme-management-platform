import React, { useState } from 'react';
import {
  AlertTriangle,
  Building,
  Check,
  CheckCircle2,
  Lock,
  Mail,
  Phone,
  Plus,
  RefreshCw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  UserCheck,
  UserPlus,
  Users,
  X,
  Zap,
} from 'lucide-react';
import { useBusiness } from '../../context/BusinessContext';
import { UserRole } from '../../types';

export const TeamManagementView: React.FC = () => {
  const {
    currentUser,
    userRole,
    permissions,
    switchRole,
    setIsAuthModalOpen,
    setIsOnboardingModalOpen,
    storeInfo,
  } = useBusiness();

  const [filterRole, setFilterRole] = useState<'all' | UserRole>('all');

  const teamMembers = [
    {
      id: 'usr-1',
      name: 'Ramesh Gupta',
      email: 'ramesh.lakshmi.textiles@gmail.com',
      role: 'owner' as UserRole,
      phone: '+91 98450 77123',
      joinedAt: 'Jan 2024',
      status: 'Active',
      avatarColor: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
    },
    {
      id: 'usr-2',
      name: 'Anand Kumar',
      email: 'anand.manager@vyapar.ai',
      role: 'manager' as UserRole,
      phone: '+91 98450 88234',
      joinedAt: 'Jun 2024',
      status: 'Active',
      avatarColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    },
    {
      id: 'usr-3',
      name: 'Pooja Verma',
      email: 'pooja.cashier@vyapar.ai',
      role: 'cashier' as UserRole,
      phone: '+91 98450 11987',
      joinedAt: 'Sep 2024',
      status: 'Active',
      avatarColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    },
    {
      id: 'usr-4',
      name: 'Suresh Iyer (CA)',
      email: 'suresh.ca@vyapar.ai',
      role: 'accountant' as UserRole,
      phone: '+91 98450 44567',
      joinedAt: 'Mar 2024',
      status: 'Active',
      avatarColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    },
  ];

  const permissionsMatrix = [
    {
      feature: 'POS Billing & Checkouts',
      owner: true,
      manager: true,
      cashier: true,
      accountant: false,
      notes: 'Issuing GST invoices and processing sales',
    },
    {
      feature: 'Customer Khata & Udhaar Reminders',
      owner: true,
      manager: true,
      cashier: true,
      accountant: true,
      notes: 'Customer balances and WhatsApp payment links',
    },
    {
      feature: 'Inventory Restock & Stock Movements',
      owner: true,
      manager: true,
      cashier: false,
      accountant: false,
      notes: 'Adding stock and adjusting movement ledger',
    },
    {
      feature: 'View Cost Prices & Gross Profit Margins',
      owner: true,
      manager: true,
      cashier: false,
      accountant: true,
      notes: 'Sensitive margins hidden from Cashier role',
    },
    {
      feature: 'Supplier Khata & Purchase Bills',
      owner: true,
      manager: true,
      cashier: false,
      accountant: true,
      notes: 'Vendor credit balances and purchase entries',
    },
    {
      feature: 'Shop Operational Expenses',
      owner: true,
      manager: true,
      cashier: false,
      accountant: true,
      notes: 'Recording utility bills, staff wages and rent',
    },
    {
      feature: 'GST & Financial Analytics Reports',
      owner: true,
      manager: true,
      cashier: false,
      accountant: true,
      notes: 'Revenue breakdown, ITC credit & tax filing',
    },
    {
      feature: 'Supabase Database Persistence & Audit Trail',
      owner: true,
      manager: false,
      cashier: false,
      accountant: false,
      notes: 'Raw audit logs and database export',
    },
    {
      feature: 'Role Management & Business Registration',
      owner: true,
      manager: false,
      cashier: false,
      accountant: false,
      notes: 'Assigning team permissions and merchant onboarding',
    },
  ];

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'owner':
        return 'bg-teal-500/20 text-teal-300 border-teal-500/40';
      case 'manager':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      case 'accountant':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'cashier':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    }
  };

  const filteredMembers = teamMembers.filter((m) => {
    if (filterRole === 'all') return true;
    return m.role === filterRole;
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Page Title & Top Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-500 via-cyan-500 to-blue-500 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-teal-500/20">
            <ShieldCheck className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white tracking-tight">Team & Role-Based Access Control</h2>
              <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-teal-500/20 text-teal-300 border border-teal-500/40">
                RBAC Security
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Multi-role access enforcement for Indian MSMEs: Owner, Manager, Cashier, and Accountant.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsOnboardingModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1.5"
          >
            <Building className="w-3.5 h-3.5 text-teal-400" />
            <span>Register Store</span>
          </button>
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 text-xs font-black transition-all shadow-md shadow-teal-500/20 flex items-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Switch Role / Sign In</span>
          </button>
        </div>
      </div>

      {/* Active User Security Status Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Current Active Session</span>
              <span className={`text-[11px] px-2.5 py-1 rounded-full font-mono font-bold border uppercase ${getRoleBadge(currentUser.role)}`}>
                {currentUser.role}
              </span>
            </div>

            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-teal-300 font-bold text-lg">
                {currentUser.fullName.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="text-base font-bold text-white">{currentUser.fullName}</h3>
                <p className="text-xs text-slate-400 font-mono">{currentUser.email}</p>
                <div className="text-[11px] text-teal-400 mt-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Store: {storeInfo.storeName}</span>
                </div>
              </div>
            </div>

            {/* Quick privileges tags */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-semibold text-slate-300">Active Permissions:</div>
              <div className="flex flex-wrap gap-1.5">
                {permissions.canManageBusiness && (
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-teal-500/15 text-teal-300 border border-teal-500/30 font-medium">
                    ✓ Manage Business
                  </span>
                )}
                {permissions.canViewAnalytics && (
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-teal-500/15 text-teal-300 border border-teal-500/30 font-medium">
                    ✓ Financial Analytics
                  </span>
                )}
                {permissions.canManageStock && (
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-medium">
                    ✓ Stock Adjustments
                  </span>
                )}
                {permissions.canViewCosts && (
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-300 border border-purple-500/30 font-medium">
                    ✓ Cost Margins Visible
                  </span>
                )}
                {permissions.canAccessDatabaseAudit && (
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-medium">
                    ✓ Supabase Audit Logs
                  </span>
                )}
                {permissions.canCollectPayments && (
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-300 border border-blue-500/30 font-medium">
                    ✓ Accept Payments & POS
                  </span>
                )}
                {!permissions.canViewCosts && (
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-300 border border-rose-500/30 font-medium">
                    ✗ Cost Prices Hidden (Cashier Guard)
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Test different views:</span>
            <div className="flex items-center gap-1.5">
              {(['owner', 'manager', 'cashier', 'accountant'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  onClick={() => switchRole(r)}
                  className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-all ${
                    currentUser.role === r
                      ? 'bg-teal-500 text-slate-950'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Security Summary & Token Bucket card */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Shield className="w-4 h-4 text-teal-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Security Parameters</h4>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[11px] text-slate-400">Rate Limiting Token Bucket</div>
                <div className="text-sm font-mono font-bold text-white mt-0.5">150 req / min</div>
                <div className="text-[10px] text-teal-400 mt-0.5">Automated DDoS & abuse mitigation</div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[11px] text-slate-400">Input Validation Shield</div>
                <div className="text-sm font-mono font-bold text-teal-300 mt-0.5">GSTIN + UPI + Phone</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Strict Indian formatting regex</div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[11px] text-slate-400">Data Isolation</div>
                <div className="text-sm font-mono font-bold text-cyan-300 mt-0.5">PostgreSQL Multi-Tenant RLS</div>
                <div className="text-[10px] text-slate-400 mt-0.5">business_id scoped row security</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Role Comparison Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Defined Roles & Access Scopes</h3>
          <span className="text-xs text-slate-400 font-mono">4 System Roles</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-900 border border-teal-500/40 relative">
            <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-teal-500/20 text-teal-300 border border-teal-500/40 uppercase">
              Owner
            </span>
            <h4 className="text-sm font-bold text-white mt-2">Super Admin</h4>
            <p className="text-xs text-slate-400 mt-1 leading-snug">
              Unrestricted control across all modules, profit calculations, database sync, audit logs, and settings.
            </p>
            <div className="mt-3 text-[11px] text-teal-300 space-y-1">
              <div>✓ Full financial control</div>
              <div>✓ Supabase audit trail</div>
              <div>✓ Manage & delete data</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-cyan-500/40">
            <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 uppercase">
              Manager
            </span>
            <h4 className="text-sm font-bold text-white mt-2">Store Operations</h4>
            <p className="text-xs text-slate-400 mt-1 leading-snug">
              Restocks inventory, adjusts stock counts, supervises billing, manages suppliers, and logs operating expenses.
            </p>
            <div className="mt-3 text-[11px] text-cyan-300 space-y-1">
              <div>✓ Stock movements</div>
              <div>✓ Supplier purchasing</div>
              <div>✓ Operating expenses</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-purple-500/40">
            <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 uppercase">
              Accountant
            </span>
            <h4 className="text-sm font-bold text-white mt-2">Chartered Accountant</h4>
            <p className="text-xs text-slate-400 mt-1 leading-snug">
              Inspects ledger balances, tracks input tax credit (ITC), reviews expenses, and analyzes cash flow.
            </p>
            <div className="mt-3 text-[11px] text-purple-300 space-y-1">
              <div>✓ Tax & GST analytics</div>
              <div>✓ Ledger reconciliation</div>
              <div>✓ Expense verification</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-amber-500/40">
            <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase">
              Cashier
            </span>
            <h4 className="text-sm font-bold text-white mt-2">POS Billing Desk</h4>
            <p className="text-xs text-slate-400 mt-1 leading-snug">
              Frontline checkout counter. Issues sales invoices, accepts UPI/Cash, and checks availability (No cost price access).
            </p>
            <div className="mt-3 text-[11px] text-amber-300 space-y-1">
              <div>✓ Fast sales checkouts</div>
              <div>✓ UPI payment capture</div>
              <div>✗ Gross profit hidden</div>
            </div>
          </div>
        </div>
      </div>

      {/* Granular Permissions Matrix Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            <h4 className="text-sm font-bold text-white">Granular Role Permissions Matrix</h4>
          </div>
          <span className="text-xs text-slate-400 font-mono">Enforced on Frontend & Server</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-950/70 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 font-mono">
                <th className="py-3 px-4">Feature / Action</th>
                <th className="py-3 px-4 text-center">Owner</th>
                <th className="py-3 px-4 text-center">Manager</th>
                <th className="py-3 px-4 text-center">Accountant</th>
                <th className="py-3 px-4 text-center">Cashier</th>
                <th className="py-3 px-4">Enforcement Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {permissionsMatrix.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-850/40 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-200">{item.feature}</td>
                  <td className="py-3 px-4 text-center">
                    {item.owner ? (
                      <Check className="w-4 h-4 text-teal-400 mx-auto" />
                    ) : (
                      <X className="w-4 h-4 text-slate-600 mx-auto" />
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {item.manager ? (
                      <Check className="w-4 h-4 text-cyan-400 mx-auto" />
                    ) : (
                      <X className="w-4 h-4 text-slate-600 mx-auto" />
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {item.accountant ? (
                      <Check className="w-4 h-4 text-purple-400 mx-auto" />
                    ) : (
                      <X className="w-4 h-4 text-slate-600 mx-auto" />
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {item.cashier ? (
                      <Check className="w-4 h-4 text-amber-400 mx-auto" />
                    ) : (
                      <span className="inline-flex items-center text-rose-400 font-bold text-[10px]">
                        <X className="w-3.5 h-3.5 mr-0.5" /> Hidden
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-[11px] text-slate-400 font-mono">{item.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Team Members List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 bg-slate-850 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-bold text-white">Store Team Directory</h4>
            <p className="text-[11px] text-slate-400">Assigned members for {storeInfo.storeName}</p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value as any)}
              className="px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-teal-400 font-medium"
            >
              <option value="all">All Roles</option>
              <option value="owner">Owner</option>
              <option value="manager">Manager</option>
              <option value="accountant">Accountant</option>
              <option value="cashier">Cashier</option>
            </select>

            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add Member</span>
            </button>
          </div>
        </div>

        <div className="divide-y divide-slate-800/60">
          {filteredMembers.map((member) => {
            const isSelf = currentUser.email === member.email;
            return (
              <div
                key={member.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-850/40 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs border ${member.avatarColor}`}
                  >
                    {member.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{member.name}</span>
                      {isSelf && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded font-mono font-bold bg-teal-500/30 text-teal-300 border border-teal-500/50">
                          YOU
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
                      <span className="flex items-center gap-1 font-mono">
                        <Mail className="w-3 h-3 text-slate-500" />
                        {member.email}
                      </span>
                      <span className="flex items-center gap-1 font-mono">
                        <Phone className="w-3 h-3 text-slate-500" />
                        {member.phone}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 self-end sm:self-auto">
                  <span className={`text-[10px] px-2.5 py-1 rounded-full font-mono font-bold border uppercase ${getRoleBadge(member.role)}`}>
                    {member.role}
                  </span>

                  <button
                    onClick={() => switchRole(member.role)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      currentUser.role === member.role
                        ? 'bg-slate-800 text-slate-400 cursor-default'
                        : 'bg-teal-500/15 hover:bg-teal-500/25 text-teal-300 border border-teal-500/30'
                    }`}
                  >
                    {currentUser.role === member.role ? 'Active Role' : `Switch to ${member.role.toUpperCase()}`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
