import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Bot,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  DollarSign,
  LineChart as LineChartIcon,
  Package,
  Plus,
  RefreshCw,
  ScanLine,
  Send,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  TrendingUp,
  Truck,
  Users,
  Wallet,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useBusiness } from '../../context/BusinessContext';

interface HomeDashboardProps {
  onOpenNewSale: () => void;
  onOpenAddExpense: () => void;
  onOpenWhatsAppModal: (customer: any) => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  onOpenNewSale,
  onOpenAddExpense,
  onOpenWhatsAppModal,
}) => {
  const {
    todaySalesTotal,
    totalPendingReceivables,
    totalRevenue,
    totalExpensesAmount,
    totalPayableBalance,
    grossProfit,
    lowStockProducts,
    healthScore,
    dailyActionItems,
    refreshAiInsights,
    isInsightsLoading,
    sales,
    purchases,
    customers,
    transactions,
    setActiveTab,
    parseAndOpenAction,
    currentUser,
    permissions,
  } = useBusiness();

  const [trendMetric, setTrendMetric] = useState<'revenue' | 'orders'>('revenue');

  // 7-day revenue trend data (incorporating today's live sales)
  const sevenDayTrendData = useMemo(() => {
    return [
      { day: '31 Oct', shortDay: 'Sat', revenue: 16800, orders: 7, averageTicket: 2400 },
      { day: '01 Nov', shortDay: 'Sun', revenue: 21500, orders: 9, averageTicket: 2388 },
      { day: '02 Nov', shortDay: 'Mon', revenue: 12400, orders: 5, averageTicket: 2480 },
      { day: '03 Nov', shortDay: 'Tue', revenue: 14800, orders: 6, averageTicket: 2466 },
      { day: '04 Nov', shortDay: 'Wed', revenue: 11200, orders: 4, averageTicket: 2800 },
      { day: '05 Nov', shortDay: 'Thu', revenue: 16900, orders: 6, averageTicket: 2816 },
      { day: '06 Nov', shortDay: 'Fri (Today)', revenue: todaySalesTotal, orders: 4, averageTicket: Math.round(todaySalesTotal / 4) },
    ];
  }, [todaySalesTotal]);

  const total7DayRevenue = useMemo(() => {
    return sevenDayTrendData.reduce((acc, curr) => acc + curr.revenue, 0);
  }, [sevenDayTrendData]);

  const avgDailyRevenue = Math.round(total7DayRevenue / 7);
  const peakDay = [...sevenDayTrendData].sort((a, b) => b.revenue - a.revenue)[0];

  const handleActionItemClick = (item: any) => {
    if (item.type === 'recovery') {
      const targetCustomer = customers.find((c) => c.name.toLowerCase().includes(item.targetEntity.toLowerCase()));
      if (targetCustomer) {
        onOpenWhatsAppModal(targetCustomer);
      } else {
        setActiveTab('customers');
      }
    } else if (item.type === 'inventory') {
      // Trigger voice/AI purchase proposal or navigate
      parseAndOpenAction(`I purchased 40 ${item.targetEntity} from ABC Traders for ₹16,000`);
    } else if (item.type === 'payable') {
      setActiveTab('payments');
    }
  };

  // Custom interactive tooltip for Recharts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-3 shadow-2xl text-xs space-y-1 glow-cyan">
          <div className="font-bold text-white flex items-center justify-between gap-4">
            <span>{data.shortDay}, {data.day}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 font-mono font-bold">
              {data.orders} verified bills
            </span>
          </div>
          <div className="text-lg font-black text-cyan-300 font-mono">
            ₹{data.revenue.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-400">
            Avg Bill Size: <span className="text-white font-mono font-semibold">₹{data.averageTicket?.toLocaleString('en-IN')}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Welcome & Summary Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-teal-500/10 text-teal-300 border border-teal-500/30">
              Live MSME Register
            </span>
            <span className="text-xs text-slate-400">Friday, 6 November 2026</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1 tracking-tight flex items-center gap-2.5">
            <span>Namaste, {currentUser.fullName}!</span>
            <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase bg-teal-500/20 text-teal-300 border border-teal-500/40">
              {currentUser.role}
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Store operations are active. All cash, inventory, and customer ledgers are automatically synchronized.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={onOpenNewSale}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/20 transition-all transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>New Sale (F2)</span>
          </button>

          <button
            onClick={() => setActiveTab('scanner')}
            className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors"
          >
            <ScanLine className="w-4 h-4 text-cyan-400" />
            <span>Scan Bill</span>
          </button>
        </div>
      </div>

      {/* 4 Primary Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Today's Sales */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg relative overflow-hidden group hover:border-teal-500/40 transition-colors">
          <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-bl-full pointer-events-none"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Today's Sales</span>
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-white font-mono tracking-tight">
              ₹{todaySalesTotal.toLocaleString('en-IN')}
            </div>
            <div className="flex items-center space-x-1.5 text-xs text-teal-400 font-semibold mt-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>4 bills billed today</span>
              <span className="text-slate-500 font-normal">• 100% verified</span>
            </div>
          </div>
        </div>

        {/* 2. Pending Receivables (Customer Udhaar) */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg relative overflow-hidden group hover:border-rose-500/40 transition-colors">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-bl-full pointer-events-none"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Customer Udhaar Due</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-rose-300 font-mono tracking-tight">
              ₹{totalPendingReceivables.toLocaleString('en-IN')}
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400 mt-1">
              <span>3 customers pending</span>
              <button
                onClick={() => setActiveTab('customers')}
                className="text-cyan-400 hover:underline font-semibold"
              >
                Send Reminders &rarr;
              </button>
            </div>
          </div>
        </div>

        {/* 3. Total Recorded Revenue & Gross Profit */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg relative overflow-hidden group hover:border-cyan-500/40 transition-colors">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-bl-full pointer-events-none"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Sales Turnover</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-cyan-300 font-mono tracking-tight">
              ₹{totalRevenue.toLocaleString('en-IN')}
            </div>
            <div className="text-xs text-slate-400 mt-1 flex items-center justify-between">
              <span>Est. Gross Profit:</span>
              {permissions.canViewCosts ? (
                <span className="font-bold text-emerald-400 font-mono">₹{grossProfit.toLocaleString('en-IN')} (32%)</span>
              ) : (
                <span className="font-bold text-slate-500 font-mono text-[10px] bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                  Protected (Owner/Mgr)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 4. Supplier Payables */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg relative overflow-hidden group hover:border-amber-500/40 transition-colors">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full pointer-events-none"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Supplier Payables</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-amber-300 font-mono tracking-tight">
              {permissions.canViewCosts ? `₹${totalPayableBalance.toLocaleString('en-IN')}` : '••••••••'}
            </div>
            <div className="text-xs text-slate-400 mt-1 flex items-center justify-between">
              <span>{permissions.canViewCosts ? '3 active suppliers' : 'Restricted for Cashier'}</span>
              {permissions.canViewCosts ? (
                <button
                  onClick={() => setActiveTab('suppliers')}
                  className="text-amber-400 hover:underline font-semibold"
                >
                  View Bills &rarr;
                </button>
              ) : (
                <span className="text-[10px] text-slate-500 font-mono">Role Guarded</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 7-DAY REVENUE TREND LINE (RECHARTS INTERACTIVE VISUALIZATION) */}
      {/* ======================================================== */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4 glow-teal">
        {/* Header & Metric Highlights */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-teal-500/20 text-teal-300">
                <LineChartIcon className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-white tracking-tight">7-Day Revenue Trend Line</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-teal-500/15 text-teal-300 border border-teal-500/30 font-mono">
                Recharts Live
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Daily revenue velocity and customer order patterns over the last 7 days
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="px-3 py-1.5 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-slate-400 text-[10px] block font-semibold uppercase">7-Day Total</span>
              <span className="font-mono font-bold text-white text-sm">
                ₹{total7DayRevenue.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-slate-400 text-[10px] block font-semibold uppercase">Daily Average</span>
              <span className="font-mono font-bold text-cyan-300 text-sm">
                ₹{avgDailyRevenue.toLocaleString('en-IN')}/day
              </span>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-slate-950/70 border border-slate-800 hidden sm:block">
              <span className="text-slate-400 text-[10px] block font-semibold uppercase">Peak Day</span>
              <span className="font-mono font-bold text-emerald-400 text-sm">
                {peakDay.shortDay} (₹{peakDay.revenue.toLocaleString('en-IN')})
              </span>
            </div>
          </div>
        </div>

        {/* Recharts Area / Line Chart Container */}
        <div className="w-full h-72 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sevenDayTrendData} margin={{ top: 10, right: 15, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0D9488" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis
                dataKey="shortDay"
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
              />
              <YAxis
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
                tickFormatter={(value) => `₹${value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#06B6D4"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#revenueGradient)"
                activeDot={{ r: 6, fill: '#14B8A6', stroke: '#FFFFFF', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Chart Footnote / Summary Insight */}
        <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 gap-2">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span>
              Today's sales at <strong className="text-white font-mono">₹{todaySalesTotal.toLocaleString('en-IN')}</strong> are running <strong className="text-emerald-400">+20%</strong> above the weekday average.
            </span>
          </div>

          <button
            onClick={() => setActiveTab('analytics')}
            className="text-cyan-400 hover:text-cyan-300 font-semibold self-start sm:self-auto flex items-center gap-1"
          >
            <span>Explore Full Analytics</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Low Stock Warning Banner if items below threshold */}
      {lowStockProducts.length > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-slate-900 border border-amber-500/40 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-start space-x-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 mt-0.5">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-amber-200">
                  Critical Inventory Reorder Alert ({lowStockProducts.length} items low)
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold uppercase">
                  Action Required
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                {lowStockProducts
                  .map((p) => `${p.name} (${p.stock} ${p.unit} remaining, safety buffer ${p.minStockAlert})`)
                  .join(' • ')}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                const item = lowStockProducts[0];
                parseAndOpenAction(`I purchased 50 ${item.name} from ABC Traders for ₹20,000`);
              }}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all whitespace-nowrap"
            >
              1-Click Reorder 50 Units
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
            >
              View Inventory
            </button>
          </div>
        </div>
      )}

      {/* Middle Grid: Business Health Score + AI Daily Action Plan */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Business Health Score Card */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-teal-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Business Health Score</h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                Live Rating
              </span>
            </div>

            {/* Circular Gauge / Big Score Display */}
            <div className="py-6 flex flex-col items-center justify-center text-center">
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="72"
                    cy="72"
                    r="58"
                    stroke="currentColor"
                    strokeWidth="10"
                    className="text-slate-800"
                    fill="transparent"
                  />
                  <circle
                    cx="72"
                    cy="72"
                    r="58"
                    stroke="currentColor"
                    strokeWidth="10"
                    className="text-teal-400 transition-all duration-1000 ease-out"
                    fill="transparent"
                    strokeDasharray="364"
                    strokeDashoffset={364 - (364 * healthScore) / 100}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-4xl font-black text-white font-mono">{healthScore}</span>
                  <span className="text-[11px] font-bold text-teal-300 uppercase tracking-wider mt-0.5">
                    {healthScore >= 80 ? 'Strong' : healthScore >= 60 ? 'Moderate' : 'Needs Care'}
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-300 max-w-xs mt-3 leading-relaxed">
                Operating efficiency is high. Liquidity is solid with ₹18,500 daily run-rate and balanced working capital.
              </p>
            </div>

            {/* Health Factor Breakdown */}
            <div className="space-y-2.5 pt-2 border-t border-slate-800 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span>Working Capital Liquidity</span>
                <span className="font-bold text-emerald-400">92% (Optimal)</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Gross Profit Margin</span>
                <span className="font-bold text-cyan-400">32.4%</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Customer Udhaar Aging</span>
                <span className="font-bold text-amber-400">14 days avg</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Stock Turnover Velocity</span>
                <span className="font-bold text-teal-400">4.2x / quarter</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('analytics')}
            className="w-full mt-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white text-xs font-semibold text-center transition-colors"
          >
            Deep Dive Analytics &rarr;
          </button>
        </div>

        {/* AI Daily Action Plan (Interactive Recommendations) */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/95 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-teal-500/20 text-teal-300">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">AI Daily Action Plan</h3>
                  <span className="text-[11px] text-slate-400">Grounded in live shop data & Gemini recommendations</span>
                </div>
              </div>

              <button
                onClick={refreshAiInsights}
                disabled={isInsightsLoading}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-teal-300 text-xs font-medium border border-slate-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isInsightsLoading ? 'animate-spin text-teal-400' : ''}`} />
                <span>{isInsightsLoading ? 'Thinking...' : 'Refresh Insights'}</span>
              </button>
            </div>

            {/* List of Action Items */}
            <div className="mt-4 space-y-3">
              {dailyActionItems.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${
                          item.priority === 'high'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {item.priority} priority
                      </span>
                      <span className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {item.title}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
                      {item.description}
                    </p>
                  </div>

                  <button
                    onClick={() => handleActionItemClick(item)}
                    className="self-start sm:self-center px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500/20 to-cyan-500/20 hover:from-teal-500/30 hover:to-cyan-500/30 text-teal-300 border border-teal-500/40 text-xs font-bold transition-all whitespace-nowrap flex items-center space-x-1.5 shadow-sm"
                  >
                    <span>{item.actionLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5 text-cyan-400" />
              Tip: Click any action above to execute instantly with zero manual data entry.
            </span>
            <button
              onClick={() => setActiveTab('assistant')}
              className="text-teal-400 font-semibold hover:underline"
            >
              Consult AI Advisor &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Transaction Feed */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Recent Business Transactions</h3>
            <p className="text-xs text-slate-400">Live ledger of sales, purchases, and collections</p>
          </div>
          <button
            onClick={() => setActiveTab('sales')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
          >
            View All Sales &rarr;
          </button>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-850 text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4 font-semibold">Ref / Date</th>
                <th className="py-3 px-4 font-semibold">Customer / Party</th>
                <th className="py-3 px-4 font-semibold">Type</th>
                <th className="py-3 px-4 font-semibold">Payment Mode</th>
                <th className="py-3 px-4 font-semibold text-right">Amount</th>
                <th className="py-3 px-4 font-semibold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {sales.slice(0, 5).map((sale) => (
                <tr key={sale.id} className="hover:bg-slate-850/60 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-mono font-bold text-white">{sale.invoiceNo}</div>
                    <div className="text-[11px] text-slate-500">{sale.date}</div>
                  </td>
                  <td className="py-3 px-4 font-medium text-white">{sale.customerName}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/10 text-teal-300 border border-teal-500/20">
                      SALE
                    </span>
                  </td>
                  <td className="py-3 px-4 uppercase font-mono text-slate-400">{sale.paymentMethod}</td>
                  <td className="py-3 px-4 text-right font-bold text-cyan-300 font-mono text-sm">
                    ₹{sale.grandTotal.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                        sale.paymentStatus === 'paid'
                          ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                      }`}
                    >
                      {sale.paymentStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Database & Multi-Tenant Security Banner */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse block"></span>
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <span>Supabase PostgreSQL Persistence & Multi-Tenant RLS</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-mono">
                Auto-Sync Active
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              All transactions, inventory movements, and bills are cryptographically tagged with UUIDs and immutable audit logs.
            </div>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('database')}
          className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-teal-300 border border-slate-700 text-xs font-bold whitespace-nowrap transition-colors"
        >
          View Database & Audit Ledger &rarr;
        </button>
      </div>
    </div>
  );
};
