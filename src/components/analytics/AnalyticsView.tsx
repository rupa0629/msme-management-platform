import React from 'react';
import {
  ArrowUpRight,
  BarChart3,
  Calendar,
  CheckCircle2,
  DollarSign,
  LineChart,
  PieChart,
  Sparkles,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { useBusiness } from '../../context/BusinessContext';

export const AnalyticsView: React.FC = () => {
  const {
    todaySalesTotal,
    totalRevenue,
    totalExpensesAmount,
    totalPendingReceivables,
    totalPayableBalance,
    grossProfit,
    healthScore,
    sales,
    products,
  } = useBusiness();

  // Net Profit = Gross Profit - Operating Expenses
  const netProfit = Math.max(0, grossProfit - totalExpensesAmount);
  const profitMarginPct = totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(1) : '32.4';

  // Weekly sales trend data
  const weeklyData = [
    { day: 'Mon', sales: 12400, bills: 6 },
    { day: 'Tue', sales: 15200, bills: 7 },
    { day: 'Wed', sales: 9800, bills: 4 },
    { day: 'Thu', sales: 14600, bills: 8 },
    { day: 'Fri (Today)', sales: todaySalesTotal, bills: 4 },
    { day: 'Sat (Proj)', sales: 22000, bills: 12 },
    { day: 'Sun (Proj)', sales: 26500, bills: 15 },
  ];

  const maxWeekly = Math.max(...weeklyData.map((d) => d.sales));

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-teal-500/10 text-teal-300 border border-teal-500/30">
              Module 10
            </span>
            <span className="text-xs text-slate-400">Executive Intelligence & Reporting</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1 tracking-tight">Business Analytics & P&L</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time cash flow velocity, profit margins, sales trends and working capital analytics.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-mono text-cyan-300 font-bold">
            Q3 FY 2026-27
          </span>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold uppercase">Total Sales Turnover</span>
          <div className="text-2xl font-black text-white font-mono mt-1">
            ₹{totalRevenue.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-teal-400 mt-0.5 font-medium">+18.4% month-on-month</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold uppercase">Gross Profit Margin</span>
          <div className="text-2xl font-black text-emerald-300 font-mono mt-1">
            {profitMarginPct}%
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">₹{grossProfit.toLocaleString('en-IN')} Gross Margin</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold uppercase">Operating Overhead</span>
          <div className="text-2xl font-black text-amber-300 font-mono mt-1">
            ₹{totalExpensesAmount.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Rent, wages & BESCOM power</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold uppercase">Estimated Net Profit</span>
          <div className="text-2xl font-black text-cyan-300 font-mono mt-1">
            ₹{netProfit.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-cyan-400 mt-0.5 font-semibold">Post operational overheads</div>
        </div>
      </div>

      {/* Sales Trend Bar Chart */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-teal-400" />
              Weekly Sales Velocity (INR)
            </h3>
            <p className="text-xs text-slate-400">Actual sales vs weekend projections</p>
          </div>
          <div className="flex items-center space-x-3 text-xs">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded bg-teal-400"></span> Actual Sales
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2.5 h-2.5 rounded bg-slate-700"></span> Projections
            </span>
          </div>
        </div>

        {/* Visual Bar Chart */}
        <div className="pt-6 pb-2 grid grid-cols-7 gap-3 items-end h-64">
          {weeklyData.map((d, idx) => {
            const heightPct = Math.round((d.sales / maxWeekly) * 100);
            const isToday = d.day.includes('Today');
            const isProj = d.day.includes('Proj');

            return (
              <div key={idx} className="flex flex-col items-center h-full justify-end group">
                <div className="text-[11px] font-mono font-bold text-slate-400 mb-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  ₹{(d.sales / 1000).toFixed(1)}k
                </div>
                <div className="w-full max-w-[48px] bg-slate-950 rounded-xl overflow-hidden p-1 flex items-end h-full">
                  <div
                    className={`w-full rounded-lg transition-all duration-500 ${
                      isToday
                        ? 'bg-gradient-to-t from-teal-500 to-cyan-400 shadow-lg shadow-teal-500/25'
                        : isProj
                        ? 'bg-slate-700 border border-dashed border-slate-500'
                        : 'bg-gradient-to-t from-slate-700 to-teal-600'
                    }`}
                    style={{ height: `${heightPct}%` }}
                  />
                </div>
                <div className="text-[11px] font-semibold text-slate-300 mt-2 text-center">{d.day}</div>
                <div className="text-[10px] text-slate-500 font-mono">{d.bills} bills</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Product Contribution & Working Capital Runway */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Product Movers */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              Top Category & SKU Movers
            </h3>
            <span className="text-xs text-slate-400">By Profit Contribution</span>
          </div>

          <div className="space-y-3">
            {products.slice(0, 5).map((p) => {
              const margin = p.sellingPrice - p.costPrice;
              const marginPct = Math.round((margin / p.sellingPrice) * 100);

              return (
                <div key={p.id} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white">{p.name}</div>
                    <div className="text-[11px] text-slate-400">{p.category} • Cost: ₹{p.costPrice}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-mono font-bold text-emerald-400">{marginPct}% margin</div>
                    <div className="text-[11px] text-slate-400 font-mono">₹{margin} profit/unit</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Working Capital & Liquidity Runway */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Wallet className="w-4 h-4 text-emerald-400" />
              Working Capital Health Breakdown
            </h3>
            <span className="text-xs text-emerald-400 font-bold">Health: {healthScore}/100</span>
          </div>

          <div className="space-y-3 text-xs text-slate-300">
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex justify-between items-center">
              <div>
                <div className="font-bold text-white">Debtor Collection Days</div>
                <div className="text-[11px] text-slate-400">Average time to collect customer credit</div>
              </div>
              <div className="text-sm font-bold text-cyan-300 font-mono">14 Days</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex justify-between items-center">
              <div>
                <div className="font-bold text-white">Creditor Settlement Days</div>
                <div className="text-[11px] text-slate-400">Payment terms with Surat wholesale suppliers</div>
              </div>
              <div className="text-sm font-bold text-amber-300 font-mono">21 Days</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex justify-between items-center">
              <div>
                <div className="font-bold text-white">Current Working Capital Buffer</div>
                <div className="text-[11px] text-slate-400">Cash & receivables vs upcoming supplier bills</div>
              </div>
              <div className="text-sm font-bold text-emerald-400 font-mono">Positive (+1.8x)</div>
            </div>

            <div className="p-3.5 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs flex items-center gap-2">
              <Sparkles className="w-4 h-4 shrink-0 text-teal-400" />
              <span>
                Gemini Advice: Collecting Priya Sharma's ₹4,200 overdue will increase working capital buffer to 2.1x before weekend restocking.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
