import React, { useState } from 'react';
import {
  Check,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
  Phone,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  User,
  UserCheck,
  X,
  Zap,
} from 'lucide-react';
import { useBusiness } from '../../context/BusinessContext';
import { UserRole } from '../../types';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    currentUser,
    switchRole,
    login,
    signup,
  } = useBusiness();

  const [activeTab, setActiveTab] = useState<'login' | 'signup' | 'roles'>('roles');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('owner');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const roleProfiles: {
    role: UserRole;
    name: string;
    email: string;
    title: string;
    tag: string;
    color: string;
    border: string;
    desc: string;
    perms: string[];
  }[] = [
    {
      role: 'owner',
      name: 'Ramesh Gupta',
      email: 'ramesh.lakshmi.textiles@gmail.com',
      title: 'Store Owner (Super Admin)',
      tag: 'Full Authority',
      color: 'bg-teal-500/15 text-teal-300',
      border: 'border-teal-500/40 hover:border-teal-400',
      desc: 'Complete control over entire business, gross profits, database persistence, team roles, and GST tax filings.',
      perms: ['All modules', 'Profit & Margins', 'Database Audit Logs', 'Team RBAC', 'Export Data'],
    },
    {
      role: 'manager',
      name: 'Anand Kumar',
      email: 'anand.manager@vyapar.ai',
      title: 'Operations Manager',
      tag: 'Ops & Inventory',
      color: 'bg-cyan-500/15 text-cyan-300',
      border: 'border-cyan-500/40 hover:border-cyan-400',
      desc: 'Manages sales, customer udhaar, purchase orders, inventory restocking, and daily shop expenses.',
      perms: ['Sales & POS', 'Inventory Restock', 'Stock Adjustments', 'Customer/Supplier Khata', 'Daily Expenses'],
    },
    {
      role: 'accountant',
      name: 'Suresh Iyer (CA)',
      email: 'suresh.ca@vyapar.ai',
      title: 'Chartered Accountant / Auditor',
      tag: 'Finance & Tax',
      color: 'bg-purple-500/15 text-purple-300',
      border: 'border-purple-500/40 hover:border-purple-400',
      desc: 'Reconciles bank accounts, monitors tax reports, inspects expense claims, and analyzes profit & loss statements.',
      perms: ['Business Analytics', 'Tax & GST Reports', 'Expense Approvals', 'Payment Allocations', 'Khata Reconciliations'],
    },
    {
      role: 'cashier',
      name: 'Pooja Verma',
      email: 'pooja.cashier@vyapar.ai',
      title: 'POS Billing Cashier',
      tag: 'Sales & Billing',
      color: 'bg-amber-500/15 text-amber-300',
      border: 'border-amber-500/40 hover:border-amber-400',
      desc: 'Creates customer checkout bills, records UPI/Cash payments, looks up product catalog (Strictly no gross profit or cost prices visibility).',
      perms: ['Quick POS Billing', 'Print GST Invoices', 'Receive UPI/Cash', 'Check Stock Count', 'Customer Lookup'],
    },
  ];

  const handleRoleSelect = async (role: UserRole) => {
    setIsLoading(true);
    await switchRole(role);
    setIsLoading(false);
    setIsAuthModalOpen(false);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      const ok = await login(email, password, selectedRole);
      if (ok) {
        setSuccessMsg('Successfully signed in!');
        setTimeout(() => setIsAuthModalOpen(false), 800);
      } else {
        setErrorMsg('Authentication failed. Please verify credentials or select a demo role.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      const ok = await signup(email, password, fullName, selectedRole, phone);
      if (ok) {
        setSuccessMsg('Account registered successfully! Signed in.');
        setTimeout(() => setIsAuthModalOpen(false), 800);
      } else {
        setErrorMsg('Registration failed. Please check your phone number and email.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-500 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-teal-500/20">
              <ShieldCheck className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">Vyapar Identity & Security</h3>
                <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-teal-500/20 text-teal-300 border border-teal-500/40">
                  Supabase Auth & RBAC
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Active: <span className="text-teal-300 font-semibold">{currentUser.fullName}</span> ({currentUser.role.toUpperCase()})
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 p-1.5 gap-1">
          <button
            onClick={() => {
              setActiveTab('roles');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'roles'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-teal-400" />
            <span>1-Click Test Roles</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('login');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'login'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
            <span>Sign In</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('signup');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'signup'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-purple-400" />
            <span>Sign Up</span>
          </button>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="mx-5 mt-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center gap-2.5 text-xs text-rose-300">
            <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="mx-5 mt-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-2.5 text-xs text-emerald-300">
            <Check className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1">
          {activeTab === 'roles' && (
            <div className="space-y-3">
              <div className="text-xs text-slate-300 mb-2">
                Instantly switch roles to verify granular permissions, UI visibility controls, and protected backend routes:
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {roleProfiles.map((item) => {
                  const isActive = currentUser.role === item.role;
                  return (
                    <div
                      key={item.role}
                      onClick={() => handleRoleSelect(item.role)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all relative group ${
                        isActive
                          ? 'bg-slate-800/90 border-teal-500 shadow-md shadow-teal-500/10'
                          : `bg-slate-950/40 ${item.border} hover:bg-slate-800/50`
                      }`}
                    >
                      {isActive && (
                        <div className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-bold text-teal-400 font-mono">
                          <Check className="w-3.5 h-3.5" />
                          <span>Active</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`text-[10px] px-2 py-0.5 rounded-md font-mono font-bold uppercase ${item.color}`}>
                          {item.role}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">({item.tag})</span>
                      </div>

                      <h4 className="text-xs font-bold text-white group-hover:text-teal-300 transition-colors">
                        {item.name}
                      </h4>
                      <p className="text-[11px] text-slate-400 font-mono mb-2 truncate">{item.email}</p>

                      <p className="text-[11px] text-slate-300 leading-snug line-clamp-2 mb-2.5">{item.desc}</p>

                      <div className="flex flex-wrap gap-1">
                        {item.perms.slice(0, 3).map((perm, idx) => (
                          <span
                            key={idx}
                            className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700/60 text-slate-300 font-medium"
                          >
                            ✓ {perm}
                          </span>
                        ))}
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRoleSelect(item.role);
                        }}
                        className={`w-full mt-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          isActive
                            ? 'bg-teal-500 text-slate-950'
                            : 'bg-slate-800 hover:bg-teal-500/20 text-slate-300 hover:text-teal-300 border border-slate-700 hover:border-teal-500/40'
                        }`}
                      >
                        {isActive ? 'Current Active Role' : `Switch to ${item.role.toUpperCase()}`}
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="p-3 mt-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
                <Shield className="w-4 h-4 text-teal-400 shrink-0" />
                <span>
                  Switching to <strong className="text-slate-200">Cashier</strong> instantly hides gross profit margins, cost prices, database audit logs, and settings tabs across the applet.
                </span>
              </div>
            </div>
          )}

          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="merchant@vyapar.ai"
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-10 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Role Permission Scope</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-teal-400"
                >
                  <option value="owner">Owner (Full Super Admin)</option>
                  <option value="manager">Manager (Ops & Stock)</option>
                  <option value="accountant">Accountant (Tax & Audit)</option>
                  <option value="cashier">Cashier (Point of Sale)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-teal-500/20 disabled:opacity-50"
              >
                {isLoading ? 'Authenticating...' : 'Sign In with Supabase'}
              </button>
            </form>
          )}

          {activeTab === 'signup' && (
            <form onSubmit={handleSignupSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="rahul@textiles.in"
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">10-Digit Mobile (India)</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="98450 12345"
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full pl-9 pr-10 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Role Assignment</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-teal-400"
                >
                  <option value="owner">Owner (Super Admin)</option>
                  <option value="manager">Manager (Operations & Inventory)</option>
                  <option value="accountant">Accountant (Tax & Ledgers)</option>
                  <option value="cashier">Cashier (Point of Sale)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white font-bold text-xs transition-all shadow-md shadow-purple-500/20 disabled:opacity-50"
              >
                {isLoading ? 'Creating Account...' : 'Register Account'}
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between px-5">
          <span className="flex items-center gap-1.5 text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Supabase Auth Shield Active
          </span>
          <span className="font-mono text-slate-400">RLS Isolated</span>
        </div>
      </div>
    </div>
  );
};
