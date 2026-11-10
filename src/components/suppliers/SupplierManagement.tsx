import React, { useState } from 'react';
import {
  ArrowUpRight,
  Building2,
  Check,
  CreditCard,
  ExternalLink,
  Phone,
  Plus,
  Search,
  Truck,
  Wallet,
  X,
} from 'lucide-react';
import { useBusiness } from '../../context/BusinessContext';
import { Supplier } from '../../types';

export const SupplierManagement: React.FC = () => {
  const {
    suppliers,
    purchases,
    addSupplier,
    recordSupplierPayment,
    totalPayableBalance,
    parseAndOpenAction,
  } = useBusiness();

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);
  const [payingSupplier, setPayingSupplier] = useState<Supplier | null>(null);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMode, setPayMode] = useState<any>('bank_transfer');
  const [payRef, setPayRef] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [gstin, setGstin] = useState('');
  const [terms, setTerms] = useState(15);

  const filteredSuppliers = suppliers.filter((s) => {
    return (
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.address && s.address.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  const handleOpenPayModal = (supplier: Supplier) => {
    setPayingSupplier(supplier);
    setPayAmount(supplier.payableBalance);
    setPayRef(`NEFT-${Date.now().toString().slice(-6)}`);
  };

  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingSupplier || payAmount <= 0) return;

    recordSupplierPayment(
      payingSupplier.id,
      payAmount,
      payMode,
      payRef,
      `Payment cleared to ${payingSupplier.name}`
    );

    setPayingSupplier(null);
  };

  const handleCreateSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addSupplier({
      name: name.trim(),
      contactPerson: contactPerson.trim(),
      phone: phone.trim() || '+91 98000 00000',
      email: email.trim(),
      address: address.trim(),
      gstin: gstin.trim(),
      paymentTermsDays: terms,
    });

    setName('');
    setContactPerson('');
    setPhone('');
    setEmail('');
    setAddress('');
    setGstin('');
    setIsAddSupplierOpen(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-teal-500/10 text-teal-300 border border-teal-500/30">
              Module 05
            </span>
            <span className="text-xs text-slate-400">Vendor & Supplier Ledger</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1 tracking-tight">Supplier Management</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage wholesale supplier accounts, purchase bills, and payable credit balances.
          </p>
        </div>

        <button
          onClick={() => setIsAddSupplierOpen(true)}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-bold text-sm shadow-lg shadow-teal-500/20 transition-all transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Supplier</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold uppercase">Total Outstanding Payables</span>
          <div className="text-2xl font-black text-amber-300 font-mono mt-1">
            ₹{totalPayableBalance.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-amber-400 mt-0.5">Total debt owed to textile distributors</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold uppercase">Active Suppliers</span>
          <div className="text-2xl font-black text-white font-mono mt-1">{suppliers.length} Vendors</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Surat, Ahmedabad, Ludhiana, Delhi hubs</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold uppercase">Purchase Orders Logged</span>
          <div className="text-2xl font-black text-cyan-300 font-mono mt-1">{purchases.length} Bills</div>
          <div className="text-[11px] text-teal-400 mt-0.5">Inventory automatically replenished</div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search suppliers by name (e.g. ABC Traders), city, contact person..."
            className="w-full pl-9 pr-4 py-2 bg-slate-950/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-teal-500 font-medium"
          />
        </div>
      </div>

      {/* Suppliers Table */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-850 text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4 font-semibold">Supplier Name</th>
                <th className="py-3 px-4 font-semibold">Contact & Phone</th>
                <th className="py-3 px-4 font-semibold">Location / Address</th>
                <th className="py-3 px-4 font-semibold text-center">Credit Terms</th>
                <th className="py-3 px-4 font-semibold text-right">Payable Balance</th>
                <th className="py-3 px-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {filteredSuppliers.map((supp) => {
                const hasPayable = supp.payableBalance > 0;

                return (
                  <tr key={supp.id} className="hover:bg-slate-850/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white text-sm">{supp.name}</div>
                      {supp.gstin && (
                        <div className="text-[10px] text-slate-500 font-mono">GST: {supp.gstin}</div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-200">{supp.contactPerson || 'Vendor'}</div>
                      <div className="font-mono text-cyan-300 text-[11px]">{supp.phone}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-300 text-xs truncate max-w-xs">{supp.address || 'Direct Textile Market'}</div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[11px]">
                        {supp.paymentTermsDays} Days
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {hasPayable ? (
                        <span className="font-black text-amber-300 font-mono text-sm">
                          ₹{supp.payableBalance.toLocaleString('en-IN')}
                        </span>
                      ) : (
                        <span className="text-emerald-400 font-mono font-semibold">₹0 (All Cleared)</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        {hasPayable ? (
                          <button
                            onClick={() => handleOpenPayModal(supp)}
                            className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-bold flex items-center space-x-1 transition-colors shadow-sm"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Pay ₹</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              parseAndOpenAction(`I purchased 40 shirts from ${supp.name} for ₹16,000`);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-[11px] font-semibold transition-colors"
                          >
                            New Order
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredSuppliers.length === 0 && (
            <div className="py-12 text-center text-slate-500 text-xs">
              No suppliers found matching your query.
            </div>
          )}
        </div>
      </div>

      {/* Modal: Pay Supplier */}
      {payingSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Wallet className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Settle Supplier Bill</h3>
              </div>
              <button
                onClick={() => setPayingSupplier(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-slate-300">
              Supplier: <span className="font-bold text-white">{payingSupplier.name}</span>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Amount to Pay (₹) *</label>
              <input
                type="number"
                min="1"
                max={payingSupplier.payableBalance}
                value={payAmount}
                onChange={(e) => setPayAmount(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-lg font-black font-mono text-amber-300 focus:border-teal-500"
              />
              <div className="text-[11px] text-slate-400 mt-1">
                Remaining bill balance will be:{' '}
                <span className="font-mono font-bold text-white">
                  ₹{Math.max(0, payingSupplier.payableBalance - payAmount).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'bank_transfer', label: 'NEFT / RTGS' },
                { id: 'upi', label: 'UPI / GPay' },
                { id: 'cheque', label: 'Cheque' },
                { id: 'cash', label: 'Cash' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPayMode(m.id)}
                  className={`p-2 rounded-lg text-xs font-semibold border ${
                    payMode === m.id
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">UTR / Cheque / Bank Ref No</label>
              <input
                type="text"
                value={payRef}
                onChange={(e) => setPayRef(e.target.value)}
                placeholder="e.g. UTR-HDFC982104"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white font-mono focus:border-teal-500"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setPayingSupplier(null)}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPayment}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md"
              >
                Confirm Payment Sent
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Supplier */}
      {isAddSupplierOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-teal-400" />
                <h3 className="text-base font-bold text-white">Add New Supplier Profile</h3>
              </div>
              <button
                onClick={() => setIsAddSupplierOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSupplier} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Supplier Business Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Vardhman Textiles Ludhiana"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="e.g. Suresh Jain"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98000 00000"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white font-mono focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Address / Market Location</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Ring Road Textile Market, Surat"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">GSTIN</label>
                  <input
                    type="text"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value)}
                    placeholder="e.g. 24AAACB1234D1Z5"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white font-mono uppercase focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Payment Credit Days</label>
                  <input
                    type="number"
                    min="0"
                    value={terms}
                    onChange={(e) => setTerms(parseInt(e.target.value, 10) || 15)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white font-mono focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddSupplierOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-bold text-xs shadow-md"
                >
                  Save Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
