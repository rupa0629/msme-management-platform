import React, { useState } from 'react';
import {
  Activity,
  AlertCircle,
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Copy,
  Database,
  Download,
  ExternalLink,
  FileCode,
  FileSpreadsheet,
  HardDrive,
  Layers,
  Lock,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Store,
  UserCheck,
} from 'lucide-react';
import { useBusiness } from '../../context/BusinessContext';
import { BusinessTenant } from '../../types';

export const DatabaseAuditView: React.FC = () => {
  const {
    databaseStatus,
    isSyncing,
    syncToDatabase,
    stockMovements,
    auditLogs,
    refreshDatabaseData,
    storeInfo,
  } = useBusiness();

  const [activeSubTab, setActiveSubTab] = useState<'audit' | 'movements' | 'schema' | 'tenancy'>('audit');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedScript, setCopiedScript] = useState(false);
  const [activeTenantId, setActiveTenantId] = useState('biz-shree-lakshmi-01');

  const demoTenants: BusinessTenant[] = [
    {
      id: 'biz-shree-lakshmi-01',
      name: 'Shree Lakshmi Textiles & Menswear',
      tagline: 'Main Retail Counter - Brigade Road',
      gstin: '29AAACH1928K1Z3',
      city: 'Bengaluru, Karnataka',
      role: 'owner',
    },
    {
      id: 'biz-lakshmi-silks-02',
      name: 'Shree Lakshmi Silks & Sarees',
      tagline: 'Wholesale Depot - Avenue Road',
      gstin: '29AAACH1928K2Z4',
      city: 'Bengaluru, Karnataka',
      role: 'owner',
    },
    {
      id: 'biz-lakshmi-textiles-mysuru',
      name: 'Lakshmi Fabrics & Tailoring',
      tagline: 'Branch Outlet - D. Devaraj Urs Road',
      gstin: '29AAACH1928K3Z5',
      city: 'Mysuru, Karnataka',
      role: 'manager',
    },
  ];

  const handleManualSync = async () => {
    await syncToDatabase();
    await refreshDatabaseData();
  };

  const filteredLogs = auditLogs.filter(
    (l) =>
      l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.entityType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.actorEmail && l.actorEmail.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredMovements = stockMovements.filter(
    (m) =>
      m.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.movementType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.reason && m.reason.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Top Banner: Database Persistence & Supabase PostgreSQL Status */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 p-6 shadow-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-60 h-60 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="p-2 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
                <Database className="w-5 h-5" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-400 font-mono">
                PostgreSQL Database & Audit Engine
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                <ShieldCheck className="w-3 h-3 mr-1" />
                RLS Multi-Tenant
              </span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Supabase PostgreSQL Database & Ledger Audit
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Every sale, purchase, stock adjustment, and customer khata payment is automatically persisted with UUID primary keys, immutable audit trails, and strict row-level security.
            </p>
          </div>

          {/* Sync & Backup Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition-all ${
                isSyncing
                  ? 'bg-teal-500/30 text-teal-300 cursor-wait'
                  : 'bg-teal-600 hover:bg-teal-500 text-slate-950 font-black shadow-lg shadow-teal-500/20'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Persisting to DB...' : 'Sync Database Now'}</span>
            </button>

            <a
              href="/api/db/export"
              download
              className="px-4 py-2.5 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 flex items-center space-x-2 transition-colors"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span>Export DB Backup</span>
            </a>
          </div>
        </div>

        {/* Database Health Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800/80">
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">DB Engine</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <div className="text-sm font-bold text-white mt-1">
              {databaseStatus.isConfigured ? 'Supabase PostgreSQL' : 'PostgreSQL Engine'}
            </div>
            <div className="text-[11px] text-teal-400 font-mono mt-0.5">
              {databaseStatus.isConfigured ? databaseStatus.supabaseUrl : 'Multi-Tenant Offline Ready'}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-xs text-slate-400 font-medium">Row Level Security</span>
            <div className="text-sm font-bold text-emerald-400 mt-1 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              <span>Enforced on 13 Tables</span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-0.5">UUID Tenant Boundary</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-xs text-slate-400 font-medium">Stock Movements</span>
            <div className="text-sm font-bold text-white font-mono mt-1">
              {stockMovements.length} Recorded
            </div>
            <div className="text-[11px] text-cyan-400 font-mono mt-0.5">Full Inventory History</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-xs text-slate-400 font-medium">Last Persistent Sync</span>
            <div className="text-sm font-bold text-white font-mono mt-1">
              {new Date(databaseStatus.lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
            <div className="text-[11px] text-emerald-400 font-mono mt-0.5">Automatic Debounce Active</div>
          </div>
        </div>

        {/* Live Supabase Connection Notice */}
        <div className="mt-4 p-3.5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs bg-slate-950/80 border-slate-700/80">
          <div className="flex items-center space-x-2.5">
            <span
              className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                databaseStatus.isConfigured
                  ? databaseStatus.tablesCreated
                    ? 'bg-emerald-400'
                    : 'bg-amber-400 animate-ping'
                  : 'bg-cyan-400'
              }`}
            ></span>
            <div>
              <div className="font-bold text-white flex items-center gap-2">
                <span>
                  {databaseStatus.isConfigured
                    ? `Supabase Project Connected (${databaseStatus.supabaseUrl})`
                    : 'Local Persistent PostgreSQL Engine Active'}
                </span>
                <span
                  className={`text-[10px] px-2 py-0.2 rounded font-mono font-bold ${
                    databaseStatus.tablesCreated
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}
                >
                  {databaseStatus.tablesCreated ? 'LIVE TABLES ACTIVE' : 'ONE-TIME MIGRATION PENDING'}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                {databaseStatus.message ||
                  (databaseStatus.tablesCreated
                    ? 'All transactions, stock changes, and khata balances are writing directly to your live Supabase database.'
                    : 'Your Supabase credentials are authenticated! Paste the migration SQL into Supabase SQL Editor to finish setting up the 13 tables.')}
              </p>
            </div>
          </div>

          {!databaseStatus.tablesCreated && (
            <button
              onClick={() => setActiveSubTab('schema')}
              className="px-3 py-1.5 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 font-bold text-xs whitespace-nowrap transition-colors"
            >
              View SQL Script &rarr;
            </button>
          )}
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveSubTab('audit')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all ${
              activeSubTab === 'audit'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Audit Trail Ledger ({auditLogs.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('movements')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all ${
              activeSubTab === 'movements'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Stock Movements Ledger ({stockMovements.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('tenancy')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all ${
              activeSubTab === 'tenancy'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Multi-Business Tenancy</span>
          </button>

          <button
            onClick={() => setActiveSubTab('schema')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all ${
              activeSubTab === 'schema'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>Supabase Schema & RLS SQL</span>
          </button>
        </div>

        {/* Search input for logs and movements */}
        {(activeSubTab === 'audit' || activeSubTab === 'movements') && (
          <div className="relative w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`Search ${activeSubTab === 'audit' ? 'audit actions...' : 'product movements...'}`}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-teal-400"
            />
          </div>
        )}
      </div>

      {/* TAB 1: AUDIT TRAIL LEDGER */}
      {activeSubTab === 'audit' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 bg-slate-850/60 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Immutable Event & Transaction Audit Log</h3>
              <p className="text-xs text-slate-400">
                Maintains a verifiable trail of changes for GST compliance, stock verification, and credit recovery.
              </p>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Showing {filteredLogs.length} of {auditLogs.length} entries
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/70 text-slate-400 uppercase tracking-wider text-[10px] font-mono border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Timestamp (UTC)</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Entity</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Payload Summary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-850/40 transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-teal-500/15 text-teal-300 border border-teal-500/30">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-white capitalize">
                      {log.entityType}
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                      {log.actorEmail}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-300 max-w-xs truncate">
                      {log.newData ? JSON.stringify(log.newData) : log.oldData ? JSON.stringify(log.oldData) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: STOCK MOVEMENTS LEDGER */}
      {activeSubTab === 'movements' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 bg-slate-850/60 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Stock Movement Ledger</h3>
              <p className="text-xs text-slate-400">
                Tracks each inventory delta with previous and updated stock balances.
              </p>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {filteredMovements.length} movements
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/70 text-slate-400 uppercase tracking-wider text-[10px] font-mono border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4 text-center">Change</th>
                  <th className="py-3 px-4 text-center">Balance Transition</th>
                  <th className="py-3 px-4">Reason / Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredMovements.map((move) => {
                  const isPositive = move.quantityChanged > 0;
                  return (
                    <tr key={move.id} className="hover:bg-slate-850/40 transition-colors">
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                        {new Date(move.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-bold text-white">
                        {move.productName}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] uppercase border ${
                            move.movementType === 'purchase'
                              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                              : move.movementType === 'sale'
                              ? 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                              : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                          }`}
                        >
                          {move.movementType.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-black">
                        <span
                          className={`inline-flex items-center ${
                            isPositive ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {isPositive ? (
                            <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                          ) : (
                            <ArrowDownLeft className="w-3.5 h-3.5 mr-0.5" />
                          )}
                          {isPositive ? `+${move.quantityChanged}` : move.quantityChanged}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-slate-300">
                        <span className="text-slate-400">{move.previousStock}</span>
                        <span className="text-slate-500 mx-1.5">&rarr;</span>
                        <span className="text-teal-300 font-bold">{move.newStock}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-300 text-[11px]">
                        {move.reason || 'General operation'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: MULTI-BUSINESS TENANCY */}
      {activeSubTab === 'tenancy' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-base font-bold text-white">Multi-Business Tenant Isolation</h3>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Vyapar AI isolates each merchant location using a dedicated <code className="text-teal-400 font-mono">business_id</code> foreign key on every table. Supabase Row Level Security ensures cashiers and managers only view data for authorized businesses.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              {demoTenants.map((tenant) => {
                const isSelected = activeTenantId === tenant.id;
                return (
                  <div
                    key={tenant.id}
                    onClick={() => setActiveTenantId(tenant.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-slate-800/90 border-teal-500 shadow-lg shadow-teal-500/10'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="p-2 rounded-lg bg-teal-500/15 text-teal-400">
                        <Store className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-teal-300 border border-slate-700">
                        {tenant.role}
                      </span>
                    </div>

                    <h4 className="font-bold text-white text-sm mt-3">{tenant.name}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{tenant.tagline}</p>

                    <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                      <span>GST: {tenant.gstin}</span>
                      <span className="font-mono text-teal-400">{tenant.city}</span>
                    </div>

                    {isSelected && (
                      <div className="mt-3 flex items-center text-teal-400 text-xs font-bold gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Active Tenant Scope</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SUPABASE SCHEMA & RLS CODE */}
      {activeSubTab === 'schema' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white">PostgreSQL Supabase Migration & RLS Script</h3>
              <p className="text-xs text-slate-400">
                Created at <code className="text-teal-400 font-mono">/supabase/migrations/20261108_init_vyapar_schema.sql</code>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={async () => {
                  try {
                    const res = await fetch('/api/db/migration-sql');
                    const data = await res.json();
                    if (data.sql) {
                      await navigator.clipboard.writeText(data.sql);
                      setCopiedScript(true);
                      setTimeout(() => setCopiedScript(false), 3000);
                    }
                  } catch (err) {
                    console.error('Failed to copy SQL:', err);
                  }
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  copiedScript
                    ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                    : 'bg-teal-600 hover:bg-teal-500 text-slate-950 shadow-lg shadow-teal-500/20'
                }`}
              >
                {copiedScript ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedScript ? 'SQL Copied to Clipboard!' : '1-Click Copy Full SQL'}</span>
              </button>

              <a
                href="https://supabase.com/dashboard/project/jvlnokivqbgqwkholxuw/sql/new"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors"
              >
                <ExternalLink className="w-4 h-4 text-cyan-400" />
                <span>Open Supabase SQL Editor</span>
              </a>
            </div>
          </div>

          {/* Step by Step Action Guide */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-teal-500/30 space-y-3">
            <h4 className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              <span>3-Step Supabase Setup (Takes 30 Seconds):</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-300">
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <div className="font-bold text-white mb-1">1. Copy the Script</div>
                <p className="text-slate-400 text-[11px]">
                  Click the green <strong className="text-teal-300">&quot;1-Click Copy Full SQL&quot;</strong> button above to copy the complete schema with 13 tables &amp; RLS policies.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <div className="font-bold text-white mb-1">2. Paste in SQL Editor</div>
                <p className="text-slate-400 text-[11px]">
                  Open <a href="https://supabase.com/dashboard/project/jvlnokivqbgqwkholxuw/sql/new" target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline">Supabase SQL Editor</a>, paste the SQL query into the text area.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <div className="font-bold text-white mb-1">3. Click &quot;Run&quot;</div>
                <p className="text-slate-400 text-[11px]">
                  Click the green <strong>RUN</strong> button (or press Ctrl+Enter). Return here and click <strong>&quot;Sync Database Now&quot;</strong>!
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 font-mono text-xs text-slate-300 border border-slate-800 overflow-x-auto space-y-2">
            <div className="text-teal-400 font-bold">-- Core Tables Provisioned in Supabase:</div>
            <div className="text-slate-400 pl-4">
              1. public.businesses (UUID PK, Multi-tenant Root)<br />
              2. public.business_memberships (RBAC: owner, admin, manager, cashier)<br />
              3. public.profiles (Auth integration)<br />
              4. public.products &amp; public.stock_movements (Inventory Ledger)<br />
              5. public.customers &amp; public.suppliers (Khata Ledgers)<br />
              6. public.sales &amp; public.sale_items<br />
              7. public.purchases &amp; public.purchase_items<br />
              8. public.expenses &amp; public.expense_categories<br />
              9. public.payments &amp; public.payment_allocations<br />
              10. public.invoices<br />
              11. public.notifications<br />
              12. public.audit_logs (Immutable audit trail)<br />
            </div>

            <div className="text-teal-400 font-bold pt-2">-- Row Level Security (RLS) Policy Example:</div>
            <div className="text-cyan-300 pl-4">
              ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;<br />
              CREATE POLICY &quot;Business members can view products&quot;<br />
              &nbsp;&nbsp;ON public.products FOR SELECT<br />
              &nbsp;&nbsp;USING (public.check_user_business_access(business_id));
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
