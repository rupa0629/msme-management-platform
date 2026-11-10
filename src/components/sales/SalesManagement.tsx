import React, { useEffect, useRef, useState } from 'react';
import {
  Clock,
  Download,
  Eye,
  Filter,
  Plus,
  Printer,
  QrCode,
  Search,
  ShoppingCart,
  TrendingUp,
  X,
} from 'lucide-react';
import { useBusiness } from '../../context/BusinessContext';
import { Sale } from '../../types';
import { InvoiceModal } from './InvoiceModal';
import { NewSaleModal } from './NewSaleModal';

const SALES_SEARCH_STORAGE_KEY = 'vyapar_sales_search_query';

export const SalesManagement: React.FC = () => {
  const { sales, todaySalesTotal } = useBusiness();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Persistent search query initialized from localStorage
  const [searchQuery, setSearchQuery] = useState<string>(() => {
    return localStorage.getItem(SALES_SEARCH_STORAGE_KEY) || '';
  });

  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending'>('all');
  const [selectedSaleForInvoice, setSelectedSaleForInvoice] = useState<Sale | null>(null);
  const [isNewSaleOpen, setIsNewSaleOpen] = useState(false);

  // Sync search query to localStorage
  useEffect(() => {
    localStorage.setItem(SALES_SEARCH_STORAGE_KEY, searchQuery);
  }, [searchQuery]);

  // Keyboard shortcut '/' to instantly focus the persistent search bar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filtered sales matching invoice no, customer name, customer phone, product item names, payment mode, or notes
  const filteredSales = sales.filter((s) => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return statusFilter === 'all' || s.paymentStatus === statusFilter;
    }

    const matchesInvoice = s.invoiceNo.toLowerCase().includes(query);
    const matchesCustomer = s.customerName.toLowerCase().includes(query);
    const matchesPhone = s.customerPhone ? s.customerPhone.toLowerCase().includes(query) : false;
    const matchesPayment = s.paymentMethod.toLowerCase().includes(query);
    const matchesNotes = s.notes ? s.notes.toLowerCase().includes(query) : false;
    const matchesItems = s.items.some(
      (item) =>
        item.productName.toLowerCase().includes(query) ||
        (item.productId && item.productId.toLowerCase().includes(query))
    );

    const matchesSearch =
      matchesInvoice || matchesCustomer || matchesPhone || matchesPayment || matchesNotes || matchesItems;

    const matchesStatus = statusFilter === 'all' || s.paymentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalFilteredAmount = filteredSales.reduce((acc, curr) => acc + curr.grandTotal, 0);

  const handleClearSearch = () => {
    setSearchQuery('');
    searchInputRef.current?.focus();
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-teal-500/10 text-teal-300 border border-teal-500/30">
              Module 02
            </span>
            <span className="text-xs text-slate-400">Point of Sale & Billing</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1 tracking-tight">Sales Management</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Add sales, auto-decrement stock, manage customer credit, and issue GST tax invoices.
          </p>
        </div>

        <button
          onClick={() => setIsNewSaleOpen(true)}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-bold text-sm shadow-lg shadow-teal-500/20 transition-all transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Sale</span>
        </button>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold uppercase">Today's Total Sales</span>
          <div className="text-2xl font-black text-white font-mono mt-1">
            ₹{todaySalesTotal.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-teal-400 mt-0.5 font-medium">Billed across verified transactions</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold uppercase">Total Sales Recorded</span>
          <div className="text-2xl font-black text-cyan-300 font-mono mt-1">
            {sales.length} Invoices
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Lifetime database history</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold uppercase">Filtered Revenue</span>
          <div className="text-2xl font-black text-emerald-300 font-mono mt-1">
            ₹{totalFilteredAmount.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">{filteredSales.length} matching bills</div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* PERSISTENT SEARCH & FILTER BAR (Sticky pinned for long lists) */}
      {/* ======================================================== */}
      <div className="sticky top-[61px] z-20 p-4 rounded-2xl bg-slate-900/95 backdrop-blur-md border border-slate-700/80 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-3 glow-teal">
        {/* Search Input Container */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-teal-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search transactions by invoice # (e.g. VAI-2026-101), customer, product item, or phone..."
            className="w-full pl-10 pr-24 py-2.5 bg-slate-950 border border-slate-700/90 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400/40 font-medium transition-all"
          />

          {/* Right Action within Search Input: Clear Button & Result Count */}
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center space-x-1.5">
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                title="Clear search query"
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              {filteredSales.length} found
            </span>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center space-x-2 shrink-0">
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-cyan-400" /> Filter:
          </span>
          {(['all', 'paid', 'pending'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                statusFilter === status
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-bold shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
              }`}
            >
              {status === 'pending' ? 'Pending (Udhaar)' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Active Search Filter Badge Indicator */}
      {searchQuery && (
        <div className="flex items-center justify-between px-2 text-xs text-slate-300 animate-fadeIn">
          <div className="flex items-center space-x-2">
            <span className="text-slate-400">Filtering transactions for:</span>
            <span className="px-2.5 py-0.5 rounded-full bg-teal-500/15 text-teal-300 border border-teal-500/30 font-semibold flex items-center gap-1">
              "{searchQuery}"
              <button onClick={handleClearSearch} className="hover:text-white ml-0.5">
                <X className="w-3 h-3" />
              </button>
            </span>
          </div>
          <button
            onClick={handleClearSearch}
            className="text-xs text-cyan-400 hover:underline font-semibold"
          >
            Reset filter
          </button>
        </div>
      )}

      {/* Sales Table */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-850 text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4 font-semibold">Invoice No</th>
                <th className="py-3 px-4 font-semibold">Date</th>
                <th className="py-3 px-4 font-semibold">Customer</th>
                <th className="py-3 px-4 font-semibold">Items Sold</th>
                <th className="py-3 px-4 font-semibold">Payment Mode</th>
                <th className="py-3 px-4 font-semibold text-right">Grand Total</th>
                <th className="py-3 px-4 font-semibold text-center">Status</th>
                <th className="py-3 px-4 font-semibold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {filteredSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-slate-850/60 transition-colors">
                  <td className="py-3 px-4 font-bold font-mono text-cyan-300">{sale.invoiceNo}</td>
                  <td className="py-3 px-4 text-slate-400">{sale.date}</td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-white">{sale.customerName}</div>
                    {sale.customerPhone && <div className="text-[11px] text-slate-500 font-mono">{sale.customerPhone}</div>}
                  </td>
                  <td className="py-3 px-4">
                    <div className="max-w-xs truncate text-slate-300 font-medium">
                      {sale.items.map((i) => `${i.productName} (${i.quantity})`).join(', ')}
                    </div>
                  </td>
                  <td className="py-3 px-4 uppercase font-mono text-[11px] text-slate-400">
                    <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                      {sale.paymentMethod}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-black text-white font-mono text-sm">
                    ₹{sale.grandTotal.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        sale.paymentStatus === 'paid'
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {sale.paymentStatus === 'paid' ? 'Paid' : 'Udhaar Due'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => setSelectedSaleForInvoice(sale)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-teal-500/20 text-slate-300 hover:text-teal-300 border border-slate-700 hover:border-teal-500/40 text-[11px] font-semibold flex items-center space-x-1 mx-auto transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Bill</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredSales.length === 0 && (
            <div className="py-12 text-center text-slate-400 text-xs space-y-2">
              <Search className="w-8 h-8 text-slate-600 mx-auto" />
              <div className="font-semibold text-slate-300">
                No transactions found matching "{searchQuery}"
              </div>
              <p className="text-[11px] text-slate-500">
                Try searching for a different customer name, invoice number, or product item.
              </p>
              <button
                onClick={handleClearSearch}
                className="mt-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-300 text-xs font-semibold"
              >
                Clear Search Filter
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <NewSaleModal
        isOpen={isNewSaleOpen}
        onClose={() => setIsNewSaleOpen(false)}
        onSaleCreated={(sale) => setSelectedSaleForInvoice(sale)}
      />

      <InvoiceModal
        sale={selectedSaleForInvoice}
        onClose={() => setSelectedSaleForInvoice(null)}
      />
    </div>
  );
};
