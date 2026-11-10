import React, { useState } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  CreditCard,
  DollarSign,
  Filter,
  Plus,
  Search,
  Truck,
  Users,
  Wallet,
} from 'lucide-react';
import { useBusiness } from '../../context/BusinessContext';

export const PaymentManagement: React.FC = () => {
  const {
    customers,
    suppliers,
    transactions,
    totalPendingReceivables,
    totalPayableBalance,
    recordCustomerPayment,
    recordSupplierPayment,
    setActiveTab,
  } = useBusiness();

  const [activeSubTab, setActiveSubTab] = useState<'receivables' | 'payables' | 'ledger'>('receivables');
  const [searchQuery, setSearchQuery] = useState('');

  // Pending customers
  const pendingCustomers = customers.filter((c) => c.outstandingBalance > 0);
  // Pending suppliers
  const pendingSuppliers = suppliers.filter((s) => s.payableBalance > 0);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-teal-500/10 text-teal-300 border border-teal-500/30">
              Module 07
            </span>
            <span className="text-xs text-slate-400">Cash Flow & Debt Management</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1 tracking-tight">Payment Management</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Track customer receivables (money to collect), supplier payables, and historical money flow ledger.
          </p>
        </div>

        {/* Sub tab navigation */}
        <div className="flex rounded-xl border border-slate-700 bg-slate-950 p-1">
          <button
            onClick={() => setActiveSubTab('receivables')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'receivables'
                ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Receivables (₹{totalPendingReceivables.toLocaleString('en-IN')})
          </button>
          <button
            onClick={() => setActiveSubTab('payables')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'payables'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Payables (₹{totalPayableBalance.toLocaleString('en-IN')})
          </button>
          <button
            onClick={() => setActiveSubTab('ledger')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'ledger'
                ? 'bg-slate-800 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Transactions Ledger
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Receivables (To Collect)</span>
            <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-300 font-mono mt-2">
            ₹{totalPendingReceivables.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">{pendingCustomers.length} customer debts pending</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Payables (To Pay)</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-300 font-mono mt-2">
            ₹{totalPayableBalance.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">{pendingSuppliers.length} supplier invoices due</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Net Working Gap</span>
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-cyan-300 font-mono mt-2">
            ₹{Math.abs(totalPendingReceivables - totalPayableBalance).toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-teal-400 mt-0.5 font-medium">Controlled operating buffer</div>
        </div>
      </div>

      {/* 1. Receivables Tab */}
      {activeSubTab === 'receivables' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Pending Customer Receivables (Udhaar Due)</h3>
            <span className="text-xs text-rose-400 font-semibold">{pendingCustomers.length} active debts</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-850 text-slate-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4 font-semibold">Customer Name</th>
                  <th className="py-3 px-4 font-semibold">Contact</th>
                  <th className="py-3 px-4 font-semibold text-right">Pending Amount</th>
                  <th className="py-3 px-4 font-semibold text-center">Aging Bracket</th>
                  <th className="py-3 px-4 font-semibold text-center">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {pendingCustomers.map((c, i) => (
                  <tr key={c.id} className="hover:bg-slate-850/60 transition-colors">
                    <td className="py-3 px-4 font-bold text-white">{c.name}</td>
                    <td className="py-3 px-4 font-mono text-cyan-300">{c.phone}</td>
                    <td className="py-3 px-4 text-right font-black text-rose-300 font-mono text-sm">
                      ₹{c.outstandingBalance.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {i === 0 ? '18+ Days Overdue' : i === 1 ? '12 Days Overdue' : '8 Days'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => setActiveTab('customers')}
                        className="px-3 py-1 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 text-[11px] font-bold transition-colors"
                      >
                        Open Khata & Remind
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. Payables Tab */}
      {activeSubTab === 'payables' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Pending Supplier Payables</h3>
            <span className="text-xs text-amber-400 font-semibold">{pendingSuppliers.length} active bills</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-850 text-slate-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4 font-semibold">Supplier Name</th>
                  <th className="py-3 px-4 font-semibold">Market Hub</th>
                  <th className="py-3 px-4 font-semibold text-center">Credit Term</th>
                  <th className="py-3 px-4 font-semibold text-right">Payable Balance</th>
                  <th className="py-3 px-4 font-semibold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {pendingSuppliers.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-850/60 transition-colors">
                    <td className="py-3 px-4 font-bold text-white">{s.name}</td>
                    <td className="py-3 px-4 text-slate-400">{s.address}</td>
                    <td className="py-3 px-4 text-center font-mono">{s.paymentTermsDays} Days</td>
                    <td className="py-3 px-4 text-right font-black text-amber-300 font-mono text-sm">
                      ₹{s.payableBalance.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => setActiveTab('suppliers')}
                        className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-bold transition-colors"
                      >
                        Pay Vendor &rarr;
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. Historical Transactions Ledger Tab */}
      {activeSubTab === 'ledger' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Verified Cash & Bank Ledger</h3>
            <span className="text-xs text-slate-400 font-mono">{transactions.length} entries recorded</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-850 text-slate-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4 font-semibold">Date</th>
                  <th className="py-3 px-4 font-semibold">Entity / Payee</th>
                  <th className="py-3 px-4 font-semibold">Flow</th>
                  <th className="py-3 px-4 font-semibold">Payment Mode</th>
                  <th className="py-3 px-4 font-semibold">Reference</th>
                  <th className="py-3 px-4 font-semibold text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-850/60 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-400">{t.date}</td>
                    <td className="py-3 px-4 font-bold text-white">{t.entityName}</td>
                    <td className="py-3 px-4">
                      {t.type === 'received' ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                          + INFLOW (RECEIVE)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                          - OUTFLOW (PAID)
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 uppercase font-mono text-slate-400">{t.paymentMethod}</td>
                    <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">{t.referenceNo || 'Direct'}</td>
                    <td className="py-3 px-4 text-right font-black font-mono text-sm">
                      <span className={t.type === 'received' ? 'text-emerald-400' : 'text-rose-400'}>
                        {t.type === 'received' ? '+' : '-'}₹{t.amount.toLocaleString('en-IN')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
