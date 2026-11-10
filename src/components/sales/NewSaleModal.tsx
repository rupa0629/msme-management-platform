import React, { useState } from 'react';
import {
  AlertCircle,
  Check,
  CreditCard,
  Plus,
  QrCode,
  Trash2,
  User,
  Wallet,
  X,
} from 'lucide-react';
import { useBusiness } from '../../context/BusinessContext';
import { Customer, PaymentMethod, PaymentStatus, Product, SaleItem } from '../../types';

interface NewSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaleCreated: (sale: any) => void;
}

export const NewSaleModal: React.FC<NewSaleModalProps> = ({
  isOpen,
  onClose,
  onSaleCreated,
}) => {
  const { products, customers, addSale, addCustomer } = useBusiness();

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers[0]?.id || '');
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [isNewCustomer, setIsNewCustomer] = useState(false);

  // Line items
  const [items, setItems] = useState<SaleItem[]>([
    {
      productId: products[0]?.id || '',
      productName: products[0]?.name || '',
      quantity: 1,
      unitPrice: products[0]?.sellingPrice || 500,
      total: products[0]?.sellingPrice || 500,
    },
  ]);

  const [discount, setDiscount] = useState<number>(0);
  const [applyGst, setApplyGst] = useState<boolean>(true);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('paid');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  // Math Calculations (Deterministic)
  const subtotal = items.reduce((acc, curr) => acc + curr.total, 0);
  const taxAmount = applyGst ? Math.round(subtotal * 0.05) : 0; // 5% GST for textiles
  const grandTotal = Math.max(0, subtotal + taxAmount - discount);

  const handleProductChange = (index: number, productId: string) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    setItems((prev) => {
      const updated = [...prev];
      updated[index] = {
        productId: prod.id,
        productName: prod.name,
        quantity: 1,
        unitPrice: prod.sellingPrice,
        total: prod.sellingPrice * 1,
      };
      return updated;
    });
  };

  const handleQuantityChange = (index: number, qty: number) => {
    const safeQty = Math.max(1, qty);
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        quantity: safeQty,
        total: updated[index].unitPrice * safeQty,
      };
      return updated;
    });
  };

  const handlePriceChange = (index: number, price: number) => {
    const safePrice = Math.max(0, price);
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        unitPrice: safePrice,
        total: safePrice * updated[index].quantity,
      };
      return updated;
    });
  };

  const handleAddItem = () => {
    const defaultProd = products[0];
    if (!defaultProd) return;
    setItems((prev) => [
      ...prev,
      {
        productId: defaultProd.id,
        productName: defaultProd.name,
        quantity: 1,
        unitPrice: defaultProd.sellingPrice,
        total: defaultProd.sellingPrice,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let customerId = selectedCustomerId;
    let customerName = 'Walk-in Customer';
    let customerPhone = '';

    if (isNewCustomer && newCustomerName.trim()) {
      const created = addCustomer({
        name: newCustomerName.trim(),
        phone: newCustomerPhone.trim() || '+91 98000 00000',
      });
      customerId = created.id;
      customerName = created.name;
      customerPhone = created.phone;
    } else {
      const cust = customers.find((c) => c.id === selectedCustomerId);
      if (cust) {
        customerName = cust.name;
        customerPhone = cust.phone;
      }
    }

    // If payment method is 'credit', status is automatically 'pending'
    const finalStatus: PaymentStatus = paymentMethod === 'credit' ? 'pending' : paymentStatus;

    const createdSale = addSale({
      date: new Date().toISOString().split('T')[0],
      customerId,
      customerName,
      customerPhone,
      items,
      subtotal,
      taxAmount,
      discountAmount: discount,
      grandTotal,
      paymentMethod,
      paymentStatus: finalStatus,
      notes,
    });

    onSaleCreated(createdSale);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-6 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">Record New Sale Bill</h3>
              <p className="text-xs text-slate-400">Inventory and Khata auto-update upon confirmation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Customer Selection */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-teal-400" /> Customer Information
              </span>
              <button
                type="button"
                onClick={() => setIsNewCustomer(!isNewCustomer)}
                className="text-xs text-teal-400 hover:text-teal-300 font-semibold"
              >
                {isNewCustomer ? 'Select Existing Customer' : '+ Quick Add New Customer'}
              </button>
            </div>

            {isNewCustomer ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Customer Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newCustomerName}
                    onChange={(e) => setNewCustomerName(e.target.value)}
                    placeholder="e.g. Ramesh Chandra"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Phone / WhatsApp Number</label>
                  <input
                    type="text"
                    value={newCustomerPhone}
                    onChange={(e) => setNewCustomerPhone(e.target.value)}
                    placeholder="+91 98765 00000"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-teal-500 font-mono"
                  />
                </div>
              </div>
            ) : (
              <div>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-teal-500"
                >
                  <option value="">Walk-in Customer (Cash Counter)</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone}) {c.outstandingBalance > 0 ? `• [Udhaar Due: ₹${c.outstandingBalance.toLocaleString('en-IN')}]` : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Line Items Picker */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Products & Quantities</span>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Another Item
              </button>
            </div>

            <div className="space-y-2">
              {items.map((item, index) => {
                const currentProd = products.find((p) => p.id === item.productId);
                const isOutOfStock = currentProd && currentProd.stock < item.quantity;

                return (
                  <div
                    key={index}
                    className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 flex flex-col sm:flex-row sm:items-center gap-3"
                  >
                    <div className="flex-1">
                      <label className="text-[10px] text-slate-400 block mb-1">Select Product</label>
                      <select
                        value={item.productId}
                        onChange={(e) => handleProductChange(index, e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-teal-500"
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} (Stock: {p.stock} {p.unit}) - ₹{p.sellingPrice}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="w-24">
                      <label className="text-[10px] text-slate-400 block mb-1">Quantity</label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(index, parseInt(e.target.value, 10) || 1)}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-teal-500 text-center"
                      />
                    </div>

                    <div className="w-28">
                      <label className="text-[10px] text-slate-400 block mb-1">Rate (₹)</label>
                      <input
                        type="number"
                        min="0"
                        value={item.unitPrice}
                        onChange={(e) => handlePriceChange(index, parseFloat(e.target.value) || 0)}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-teal-500 text-right"
                      />
                    </div>

                    <div className="w-28 text-right">
                      <label className="text-[10px] text-slate-400 block mb-1">Total</label>
                      <div className="text-xs font-bold text-cyan-300 font-mono py-1.5">
                        ₹{item.total.toLocaleString('en-IN')}
                      </div>
                    </div>

                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors self-end sm:self-center"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}

                    {isOutOfStock && (
                      <div className="w-full text-[11px] text-amber-400 flex items-center gap-1 font-medium">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Warning: Current inventory has only {currentProd?.stock} units available!</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Payment Method & GST Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Payment Mode</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'upi', label: 'UPI / GPay / QR', icon: QrCode },
                  { id: 'cash', label: 'Cash Counter', icon: Wallet },
                  { id: 'bank_transfer', label: 'Bank Transfer', icon: CreditCard },
                  { id: 'credit', label: 'Udhaar (Credit)', icon: AlertCircle },
                ].map((mode) => {
                  const Icon = mode.icon;
                  const isSelected = paymentMethod === mode.id;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => {
                        setPaymentMethod(mode.id as PaymentMethod);
                        if (mode.id === 'credit') setPaymentStatus('pending');
                        else setPaymentStatus('paid');
                      }}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center space-x-2 transition-all ${
                        isSelected
                          ? 'bg-teal-500/20 text-teal-300 border-teal-500/60 shadow-sm'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{mode.label}</span>
                    </button>
                  );
                })}
              </div>

              {paymentMethod === 'credit' && (
                <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-[11px] text-rose-300">
                  Bill will be added to the customer's pending Udhaar Khata ledger.
                </div>
              )}
            </div>

            {/* Discounts, Tax & Grand Total */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2.5 text-xs">
              <div className="flex justify-between items-center text-slate-400">
                <span>Subtotal ({items.reduce((a, b) => a + b.quantity, 0)} items):</span>
                <span className="font-mono font-semibold text-white">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between items-center text-slate-400">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={applyGst}
                    onChange={(e) => setApplyGst(e.target.checked)}
                    className="rounded bg-slate-800 text-teal-500 focus:ring-0"
                  />
                  <span>Add 5% GST (CGST + SGST)</span>
                </label>
                <span className="font-mono font-semibold text-white">₹{taxAmount.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between items-center text-slate-400">
                <span>Discount / Round off (₹):</span>
                <input
                  type="number"
                  min="0"
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  className="w-24 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-right text-xs text-white font-mono"
                />
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-base font-bold">
                <span className="text-white">Grand Total:</span>
                <span className="text-xl font-black text-cyan-300 font-mono">
                  ₹{grandTotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-6 bg-slate-850 border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-sm font-semibold transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-bold text-sm shadow-lg shadow-teal-500/25 transition-all transform active:scale-95"
          >
            <Check className="w-4 h-4" />
            <span>Confirm Sale & Generate Bill</span>
          </button>
        </div>
      </div>
    </div>
  );
};
