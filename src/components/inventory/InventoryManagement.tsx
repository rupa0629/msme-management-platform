import React, { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Filter,
  Package,
  Plus,
  RefreshCw,
  Search,
  Sliders,
  Tag,
  Trash2,
  X,
} from 'lucide-react';
import { useBusiness } from '../../context/BusinessContext';
import { Product } from '../../types';

const INVENTORY_SEARCH_STORAGE_KEY = 'vyapar_inventory_search_query';

export const InventoryManagement: React.FC = () => {
  const {
    products,
    addProduct,
    updateProductStock,
    adjustStock,
    parseAndOpenAction,
    permissions,
  } = useBusiness();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Persistent search query initialized from localStorage
  const [searchQuery, setSearchQuery] = useState<string>(() => {
    return localStorage.getItem(INVENTORY_SEARCH_STORAGE_KEY) || '';
  });

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [stockStatusFilter, setStockStatusFilter] = useState<'all' | 'low' | 'healthy'>('all');

  // Modal states
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null);
  const [adjustmentDelta, setAdjustmentDelta] = useState<number>(10);
  const [adjustmentReason, setAdjustmentReason] = useState<string>('Restock from supplier');

  // New product form state
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('Menswear');
  const [newProdCost, setNewProdCost] = useState<number>(400);
  const [newProdPrice, setNewProdPrice] = useState<number>(750);
  const [newProdStock, setNewProdStock] = useState<number>(25);
  const [newProdMinStock, setNewProdMinStock] = useState<number>(10);
  const [newProdUnit, setNewProdUnit] = useState('pcs');

  // Sync search query to localStorage
  useEffect(() => {
    localStorage.setItem(INVENTORY_SEARCH_STORAGE_KEY, searchQuery);
  }, [searchQuery]);

  // Keyboard shortcut '/' to instantly focus the persistent inventory search bar
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

  // Categories list
  const categories = ['All', ...Array.from(new Set(products.map((p) => p.category)))];

  // Filtering by SKU, Product Name, Category, Barcode
  const filteredProducts = products.filter((p) => {
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      p.name.toLowerCase().includes(query) ||
      p.sku.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query) ||
      (p.barcode && p.barcode.toLowerCase().includes(query));

    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;

    const isLow = p.stock <= p.minStockAlert;
    const matchesStock =
      stockStatusFilter === 'all' ||
      (stockStatusFilter === 'low' && isLow) ||
      (stockStatusFilter === 'healthy' && !isLow);

    return matchesSearch && matchesCategory && matchesStock;
  });

  // Inventory Totals
  const totalStockUnits = products.reduce((acc, curr) => acc + curr.stock, 0);
  const totalCostValue = products.reduce((acc, curr) => acc + curr.stock * curr.costPrice, 0);
  const totalRetailValue = products.reduce((acc, curr) => acc + curr.stock * curr.sellingPrice, 0);
  const lowStockCount = products.filter((p) => p.stock <= p.minStockAlert).length;

  const handleClearSearch = () => {
    setSearchQuery('');
    searchInputRef.current?.focus();
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim()) return;

    const sku = `APP-${newProdName.slice(0, 3).toUpperCase()}-${Math.floor(Math.random() * 900 + 100)}`;
    addProduct({
      sku,
      name: newProdName.trim(),
      category: newProdCategory,
      costPrice: newProdCost,
      sellingPrice: newProdPrice,
      stock: newProdStock,
      minStockAlert: newProdMinStock,
      unit: newProdUnit,
    });

    setNewProdName('');
    setIsAddProductOpen(false);
  };

  const handleApplyAdjustment = () => {
    if (!adjustingProduct) return;
    adjustStock(adjustingProduct.id, adjustmentDelta, adjustmentReason);
    setAdjustingProduct(null);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-teal-500/10 text-teal-300 border border-teal-500/30">
              Module 03
            </span>
            <span className="text-xs text-slate-400">Inventory & Stock Ledger</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1 tracking-tight">Inventory Management</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Auto-decrements on sales, auto-increments on purchases, with real-time low-stock reorder buffers.
          </p>
        </div>

        {permissions.canManageStock && (
          <button
            onClick={() => setIsAddProductOpen(true)}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-bold text-sm shadow-lg shadow-teal-500/20 transition-all transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        )}
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold uppercase">Total Catalog SKUs</span>
          <div className="text-2xl font-black text-white font-mono mt-1">{products.length} Items</div>
          <div className="text-[11px] text-slate-400 mt-0.5">{totalStockUnits} units in warehouse</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold uppercase">Low Stock Alerts</span>
          <div className={`text-2xl font-black font-mono mt-1 ${lowStockCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {lowStockCount} Products
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Below reorder minimum threshold</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold uppercase">Inventory Cost Asset</span>
          <div className="text-2xl font-black text-cyan-300 font-mono mt-1">
            {permissions.canViewCosts ? `₹${totalCostValue.toLocaleString('en-IN')}` : '••••••••'}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {permissions.canViewCosts ? 'At wholesale cost price' : 'Hidden for Cashier'}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold uppercase">Est. Retail Value</span>
          <div className="text-2xl font-black text-emerald-300 font-mono mt-1">
            ₹{totalRetailValue.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-teal-400 mt-0.5 font-semibold">
            {permissions.canViewCosts
              ? `Potential margin: ₹${(totalRetailValue - totalCostValue).toLocaleString('en-IN')}`
              : 'POS Retail Price Catalog'}
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* PERSISTENT SEARCH & FILTER BAR (Sticky pinned for stock lists) */}
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
            placeholder="Search products by SKU (e.g. APP-SHT-01), product title, category, or barcode..."
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
              {filteredProducts.length} items
            </span>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-teal-500 font-medium"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                Category: {c}
              </option>
            ))}
          </select>

          {/* Stock status toggle */}
          <div className="flex rounded-xl border border-slate-700 bg-slate-950 p-0.5">
            <button
              onClick={() => setStockStatusFilter('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                stockStatusFilter === 'all'
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStockStatusFilter('low')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                stockStatusFilter === 'low'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Low Stock Only
            </button>
          </div>
        </div>
      </div>

      {/* Active Search Filter Pill */}
      {searchQuery && (
        <div className="flex items-center justify-between px-2 text-xs text-slate-300 animate-fadeIn">
          <div className="flex items-center space-x-2">
            <span className="text-slate-400">Filtering catalog for:</span>
            <span className="px-2.5 py-0.5 rounded-full bg-teal-500/15 text-teal-300 border border-teal-500/30 font-semibold flex items-center gap-1 font-mono">
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

      {/* Products Table */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-850 text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4 font-semibold">SKU</th>
                <th className="py-3 px-4 font-semibold">Product Name</th>
                <th className="py-3 px-4 font-semibold">Category</th>
                <th className="py-3 px-4 font-semibold text-right">Cost (₹)</th>
                <th className="py-3 px-4 font-semibold text-right">Selling Price (₹)</th>
                <th className="py-3 px-4 font-semibold text-center">Stock Level</th>
                <th className="py-3 px-4 font-semibold text-center">Status</th>
                <th className="py-3 px-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {filteredProducts.map((p) => {
                const isLow = p.stock <= p.minStockAlert;
                const isZero = p.stock === 0;

                return (
                  <tr key={p.id} className="hover:bg-slate-850/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-cyan-300">{p.sku}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{p.name}</div>
                      {p.lastRestocked && (
                        <div className="text-[10px] text-slate-500">Last restocked: {p.lastRestocked}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-400">{p.category}</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-300">
                      {permissions.canViewCosts ? (
                        `₹${p.costPrice.toLocaleString('en-IN')}`
                      ) : (
                        <span className="text-slate-600 font-mono">••••</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-white font-mono">
                      ₹{p.sellingPrice.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-mono font-bold text-sm text-white">{p.stock}</span>{' '}
                      <span className="text-slate-500 text-[11px]">{p.unit}</span>
                      <div className="text-[10px] text-slate-500">Min: {p.minStockAlert}</div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {isZero ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/40">
                          Out of Stock
                        </span>
                      ) : isLow ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          Low Stock
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          In Stock
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center space-x-1.5">
                        {permissions.canManageStock ? (
                          <button
                            onClick={() => {
                              setAdjustingProduct(p);
                              setAdjustmentDelta(10);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-[11px] font-semibold transition-colors"
                          >
                            Adjust Qty
                          </button>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800/60 text-slate-500 font-mono">
                            Read Only
                          </span>
                        )}
                        {isLow && permissions.canManageStock && (
                          <button
                            onClick={() => {
                              parseAndOpenAction(`I purchased 50 ${p.name} from ABC Traders for ₹${(p.costPrice * 50).toLocaleString('en-IN')}`);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 text-[11px] font-bold transition-colors"
                          >
                            Reorder
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredProducts.length === 0 && (
            <div className="py-12 text-center text-slate-400 text-xs space-y-2">
              <Search className="w-8 h-8 text-slate-600 mx-auto" />
              <div className="font-semibold text-slate-300">
                No products found matching "{searchQuery}"
              </div>
              <p className="text-[11px] text-slate-500">
                Try searching for a different SKU code (e.g. APP-SHT-01), product title, or category.
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

      {/* Modal: Quick Stock Adjustment */}
      {adjustingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Adjust Stock: {adjustingProduct.name}</h3>
              <button
                onClick={() => setAdjustingProduct(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-slate-300">
              Current Stock: <span className="font-mono font-bold text-teal-400">{adjustingProduct.stock} {adjustingProduct.unit}</span>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Adjustment Quantity (+ In, - Out)</label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={adjustmentDelta}
                  onChange={(e) => setAdjustmentDelta(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono text-sm focus:border-teal-500"
                />
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                New Stock will be:{' '}
                <span className="font-bold text-cyan-300 font-mono">
                  {Math.max(0, adjustingProduct.stock + adjustmentDelta)} {adjustingProduct.unit}
                </span>
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Reason for Audit Log</label>
              <select
                value={adjustmentReason}
                onChange={(e) => setAdjustmentReason(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs focus:border-teal-500"
              >
                <option value="Restock from supplier">Restock from supplier</option>
                <option value="Physical stock count audit">Physical stock count audit</option>
                <option value="Damaged / Shop soiled item">Damaged / Shop soiled item</option>
                <option value="Customer return / exchange">Customer return / exchange</option>
              </select>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setAdjustingProduct(null)}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyAdjustment}
                className="px-5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-md"
              >
                Save Adjustment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add New Product */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Package className="w-5 h-5 text-teal-400" />
                <h3 className="text-lg font-bold text-white">Add New Product to Catalog</h3>
              </div>
              <button
                onClick={() => setIsAddProductOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  placeholder="e.g. Pure Cotton Kurti (Blue)"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Category</label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:border-teal-500"
                  >
                    <option value="Menswear">Menswear</option>
                    <option value="Womenswear">Womenswear</option>
                    <option value="Ethnic Wear">Ethnic Wear</option>
                    <option value="Kids & Accessories">Kids & Accessories</option>
                    <option value="Fabrics & Textiles">Fabrics & Textiles</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Unit of Measurement</label>
                  <select
                    value={newProdUnit}
                    onChange={(e) => setNewProdUnit(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:border-teal-500"
                  >
                    <option value="pcs">Pieces (pcs)</option>
                    <option value="meters">Meters</option>
                    <option value="boxes">Boxes</option>
                    <option value="kg">Kilograms (kg)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Purchase Cost Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={newProdCost}
                    onChange={(e) => setNewProdCost(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white font-mono focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Retail Selling Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white font-mono focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Initial Opening Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={newProdStock}
                    onChange={(e) => setNewProdStock(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white font-mono focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Low Stock Alert Threshold</label>
                  <input
                    type="number"
                    min="1"
                    value={newProdMinStock}
                    onChange={(e) => setNewProdMinStock(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white font-mono focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-bold text-xs shadow-md"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
