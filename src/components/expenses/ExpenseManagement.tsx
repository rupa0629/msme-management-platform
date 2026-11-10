import React, { useState } from 'react';
import {
  Calendar,
  DollarSign,
  Filter,
  PieChart,
  Plus,
  Receipt,
  Search,
  Tag,
  Wallet,
  X,
} from 'lucide-react';
import { useBusiness } from '../../context/BusinessContext';
import { Expense, PaymentMethod } from '../../types';

export const ExpenseManagement: React.FC = () => {
  const { expenses, addExpense, totalExpensesAmount } = useBusiness();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Expense['category']>('Rent');
  const [amount, setAmount] = useState<number>(1000);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [notes, setNotes] = useState('');

  const categories: Expense['category'][] = [
    'Rent',
    'Electricity & Utilities',
    'Salaries & Wages',
    'Logistics & Courier',
    'Packaging & Bags',
    'Tea & Refreshments',
    'Marketing & Ads',
    'Maintenance',
    'Miscellaneous',
  ];

  // Category breakdown calculation
  const categoryTotals: Record<string, number> = {};
  expenses.forEach((e) => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });

  const filteredExpenses = expenses.filter((e) => {
    const matchesSearch =
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'All' || e.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || amount <= 0) return;

    addExpense({
      title: title.trim(),
      category,
      amount,
      date: new Date().toISOString().split('T')[0],
      paymentMethod,
      notes: notes.trim(),
    });

    setTitle('');
    setAmount(1000);
    setNotes('');
    setIsAddExpenseOpen(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-teal-500/10 text-teal-300 border border-teal-500/30">
              Module 06
            </span>
            <span className="text-xs text-slate-400">Operating Overhead & Petty Cash</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1 tracking-tight">Expense Management</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Log overhead costs, monitor recurring store utilities, and analyze P&L operating margins.
          </p>
        </div>

        <button
          onClick={() => setIsAddExpenseOpen(true)}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-bold text-sm shadow-lg shadow-teal-500/20 transition-all transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Expense</span>
        </button>
      </div>

      {/* KPI Cards & Category Visual Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Expenses (Month)</span>
            <div className="text-3xl font-black text-amber-300 font-mono mt-2">
              ₹{totalExpensesAmount.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Includes shop lease, BESCOM power, helper wages, courier and packaging.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <span>Logged Entries:</span>
            <span className="font-bold text-white font-mono">{expenses.length} Receipts</span>
          </div>
        </div>

        {/* Category Breakdown Bar Visual */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <PieChart className="w-4 h-4 text-cyan-400" />
              Category-wise Expense Distribution
            </span>
            <span className="text-[11px] text-teal-400 font-mono">100% accounted</span>
          </div>

          <div className="space-y-2 pt-1">
            {Object.entries(categoryTotals).map(([cat, total]) => {
              const pct = Math.round((total / (totalExpensesAmount || 1)) * 100);
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-medium">{cat}</span>
                    <span className="font-mono text-slate-200">
                      ₹{total.toLocaleString('en-IN')} <span className="text-slate-500 text-[10px]">({pct}%)</span>
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search expense description, payee, category..."
            className="w-full pl-9 pr-4 py-2 bg-slate-950/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-teal-500 font-medium"
          />
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-teal-500 font-medium"
          >
            <option value="All">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Expenses List Table */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-850 text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4 font-semibold">Date</th>
                <th className="py-3 px-4 font-semibold">Title / Payee</th>
                <th className="py-3 px-4 font-semibold">Category</th>
                <th className="py-3 px-4 font-semibold">Payment Mode</th>
                <th className="py-3 px-4 font-semibold text-right">Amount (₹)</th>
                <th className="py-3 px-4 font-semibold">Notes / Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {filteredExpenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-850/60 transition-colors">
                  <td className="py-3 px-4 font-mono text-slate-400">{exp.date}</td>
                  <td className="py-3 px-4 font-bold text-white">{exp.title}</td>
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-cyan-300 border border-slate-700">
                      {exp.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 uppercase font-mono text-slate-400">{exp.paymentMethod}</td>
                  <td className="py-3 px-4 text-right font-black text-rose-300 font-mono text-sm">
                    ₹{exp.amount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 text-slate-400 truncate max-w-xs">{exp.notes || 'Verified'}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredExpenses.length === 0 && (
            <div className="py-12 text-center text-slate-500 text-xs">
              No expenses recorded matching the query.
            </div>
          )}
        </div>
      </div>

      {/* Modal: Add Expense */}
      {isAddExpenseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Receipt className="w-5 h-5 text-teal-400" />
                <h3 className="text-base font-bold text-white">Record Operating Expense</h3>
              </div>
              <button
                onClick={() => setIsAddExpenseOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Expense Title / Payee *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. BESCOM Electricity Bill"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:border-teal-500"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={amount}
                    onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm font-bold text-white font-mono focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:border-teal-500"
                >
                  <option value="upi">UPI / GPay / PhonePe</option>
                  <option value="cash">Cash Counter</option>
                  <option value="bank_transfer">Bank Transfer (NEFT/IMPS)</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Notes / Voucher Reference</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Consumer ID #4910223"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:border-teal-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddExpenseOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-bold text-xs shadow-md"
                >
                  Record Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
