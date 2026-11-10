import React, { useState } from 'react';
import {
  ArrowDownLeft,
  Check,
  Clock,
  Copy,
  ExternalLink,
  Eye,
  Gift,
  History,
  MessageSquare,
  Phone,
  Plus,
  QrCode,
  Search,
  Send,
  Sparkles,
  User,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import { useBusiness } from '../../context/BusinessContext';
import { Customer } from '../../types';

interface CustomerManagementProps {
  onOpenWhatsAppModalFromParent?: (customer: Customer) => void;
}

export type WhatsAppTemplateType = 'reminder' | 'statement' | 'greeting';

export const CustomerManagement: React.FC<CustomerManagementProps> = () => {
  const {
    customers,
    sales,
    addCustomer,
    recordCustomerPayment,
    totalPendingReceivables,
    storeInfo,
  } = useBusiness();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'due' | 'settled'>('all');

  // Modals
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [activeWhatsAppCustomer, setActiveWhatsAppCustomer] = useState<Customer | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<WhatsAppTemplateType>('reminder');
  const [whatsappPhone, setWhatsappPhone] = useState('');
  const [customReminderMsg, setCustomReminderMsg] = useState('');
  const [copied, setCopied] = useState(false);

  // Customer Profile Detail Modal
  const [viewingProfileCustomer, setViewingProfileCustomer] = useState<Customer | null>(null);

  // Payment receive modal
  const [receivingPaymentCustomer, setReceivingPaymentCustomer] = useState<Customer | null>(null);
  const [receivedAmount, setReceivedAmount] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState<any>('upi');
  const [txnRef, setTxnRef] = useState('');

  // Form states for new customer
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [gstin, setGstin] = useState('');

  // Generate WhatsApp text based on template
  const generateMessageText = (customer: Customer, template: WhatsAppTemplateType) => {
    if (template === 'reminder') {
      return `Namaste ${customer.name} ji 🙏,
This is a gentle payment reminder from *${storeInfo.storeName}*.

Your current pending Udhaar balance is: *₹${customer.outstandingBalance.toLocaleString('en-IN')}*.

Kindly clear the balance at your convenience via UPI:
🔗 UPI ID: *${storeInfo.upiId}*
Bank: ${storeInfo.bankName} (A/C: ${storeInfo.accountNumber})

Thank you for your valued support!
📞 Contact: ${storeInfo.phone}`;
    } else if (template === 'statement') {
      return `📄 *KHATA STATEMENT - ${storeInfo.storeName.toUpperCase()}*
----------------------------------------
Customer: *${customer.name}*
Contact: ${customer.phone}
${customer.address ? `Address: ${customer.address}\n` : ''}
Lifetime Purchases: *₹${customer.totalPurchased.toLocaleString('en-IN')}*
Current Outstanding Balance: *${
        customer.outstandingBalance > 0
          ? `₹${customer.outstandingBalance.toLocaleString('en-IN')} (Pending)`
          : '₹0 (All Cleared ✅)'
      }*

UPI Payment ID: *${storeInfo.upiId}*
${storeInfo.address}, ${storeInfo.city}
Thank you for shopping with us! 🙏`;
    } else {
      return `✨ *FESTIVAL SPECIAL GREETINGS - ${storeInfo.storeName.toUpperCase()}* ✨

Dear ${customer.name} ji,
Warm greetings from ${storeInfo.storeName}! As a valued VIP customer, we are delighted to offer you an exclusive *10% festive discount* on our new festive collection (Banarasi Sarees, Kurtas, Menswear & Ethnic Wear).

Show this message at the counter to redeem your discount!
📍 Location: ${storeInfo.address}, ${storeInfo.city}
📞 Contact: ${storeInfo.phone}

We look forward to welcoming you! 🎉`;
    }
  };

  const handleOpenWhatsApp = (customer: Customer, initialTemplate?: WhatsAppTemplateType) => {
    const template = initialTemplate || (customer.outstandingBalance > 0 ? 'reminder' : 'statement');
    setSelectedTemplate(template);
    setWhatsappPhone(customer.phone);
    setCustomReminderMsg(generateMessageText(customer, template));
    setActiveWhatsAppCustomer(customer);
  };

  const handleTemplateChange = (template: WhatsAppTemplateType) => {
    setSelectedTemplate(template);
    if (activeWhatsAppCustomer) {
      setCustomReminderMsg(generateMessageText(activeWhatsAppCustomer, template));
    }
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(customReminderMsg);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLaunchWhatsApp = () => {
    const cleanPhone = whatsappPhone.replace(/[^0-9]/g, '');
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(customReminderMsg)}`;
    window.open(url, '_blank');
  };

  const handleOpenReceivePayment = (customer: Customer) => {
    setReceivingPaymentCustomer(customer);
    setReceivedAmount(customer.outstandingBalance);
    setTxnRef(`UPI-${Date.now().toString().slice(-6)}`);
  };

  const handleConfirmReceivePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!receivingPaymentCustomer || receivedAmount <= 0) return;

    recordCustomerPayment(
      receivingPaymentCustomer.id,
      receivedAmount,
      paymentMode,
      txnRef,
      `Payment received from ${receivingPaymentCustomer.name}`
    );

    setReceivingPaymentCustomer(null);
  };

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addCustomer({
      name: name.trim(),
      phone: phone.trim() || '+91 98000 00000',
      address: address.trim(),
      gstin: gstin.trim(),
    });

    setName('');
    setPhone('');
    setAddress('');
    setGstin('');
    setIsAddCustomerOpen(false);
  };

  // Filter logic
  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.address && c.address.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesFilter =
      filterType === 'all' ||
      (filterType === 'due' && c.outstandingBalance > 0) ||
      (filterType === 'settled' && c.outstandingBalance === 0);

    return matchesSearch && matchesFilter;
  });

  const dueCustomersCount = customers.filter((c) => c.outstandingBalance > 0).length;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-teal-500/10 text-teal-300 border border-teal-500/30">
              Module 04
            </span>
            <span className="text-xs text-slate-400">Customer Khata & WhatsApp Engine</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1 tracking-tight">Customer Management</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Track customer profiles, purchase history, outstanding Udhaar, and send direct WhatsApp reminders & digital statements.
          </p>
        </div>

        <button
          onClick={() => setIsAddCustomerOpen(true)}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-bold text-sm shadow-lg shadow-teal-500/20 transition-all transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Customer</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold uppercase">Total Customer Udhaar Due</span>
          <div className="text-2xl font-black text-rose-300 font-mono mt-1">
            ₹{totalPendingReceivables.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-rose-400 mt-0.5 font-medium">{dueCustomersCount} customers with unpaid bills</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold uppercase">Registered Customers</span>
          <div className="text-2xl font-black text-white font-mono mt-1">{customers.length} Profiles</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Active retail and wholesale khata</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold uppercase">Total Purchases Handled</span>
          <div className="text-2xl font-black text-cyan-300 font-mono mt-1">
            ₹{customers.reduce((acc, c) => acc + c.totalPurchased, 0).toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-teal-400 mt-0.5 font-semibold">High repeat customer retention (68%)</div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer name (e.g. Priya Sharma), phone, address..."
            className="w-full pl-9 pr-4 py-2 bg-slate-950/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-teal-500 font-medium"
          />
        </div>

        <div className="flex items-center space-x-2">
          {(['all', 'due', 'settled'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setFilterType(filter)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                filterType === filter
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-bold shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
              }`}
            >
              {filter === 'due' ? 'Udhaar Due Only' : filter === 'settled' ? 'Zero Due' : 'All Customers'}
            </button>
          ))}
        </div>
      </div>

      {/* Customers Table */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-850 text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4 font-semibold">Customer</th>
                <th className="py-3 px-4 font-semibold">Phone & Location</th>
                <th className="py-3 px-4 font-semibold text-right">Lifetime Sales</th>
                <th className="py-3 px-4 font-semibold text-right">Outstanding Udhaar</th>
                <th className="py-3 px-4 font-semibold text-center">Status</th>
                <th className="py-3 px-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {filteredCustomers.map((cust) => {
                const hasDue = cust.outstandingBalance > 0;

                return (
                  <tr key={cust.id} className="hover:bg-slate-850/60 transition-colors">
                    <td className="py-3 px-4">
                      <div
                        onClick={() => setViewingProfileCustomer(cust)}
                        className="font-bold text-white text-sm hover:text-teal-300 cursor-pointer flex items-center gap-1.5"
                      >
                        <span>{cust.name}</span>
                        <Eye className="w-3.5 h-3.5 text-slate-500 hover:text-teal-400" />
                      </div>
                      {cust.gstin && (
                        <div className="text-[10px] text-slate-500 font-mono">GST: {cust.gstin}</div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-mono text-cyan-300 font-medium">{cust.phone}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-xs">{cust.address || 'In-store customer'}</div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-300">
                      ₹{cust.totalPurchased.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {hasDue ? (
                        <span className="font-black text-rose-300 font-mono text-sm">
                          ₹{cust.outstandingBalance.toLocaleString('en-IN')}
                        </span>
                      ) : (
                        <span className="text-emerald-400 font-mono font-semibold">₹0 (Cleared)</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {hasDue ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/40">
                          Payment Due
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          Settled
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center space-x-1.5">
                        {/* Share via WhatsApp Button on Customer Profile */}
                        <button
                          onClick={() => handleOpenWhatsApp(cust)}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/35 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold flex items-center space-x-1 transition-all active:scale-95"
                          title="Share via WhatsApp (Reminder or Statement)"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Share via WhatsApp</span>
                        </button>

                        {/* Receive Udhaar Payment Button */}
                        {hasDue && (
                          <button
                            onClick={() => handleOpenReceivePayment(cust)}
                            className="px-2.5 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 text-[11px] font-bold flex items-center space-x-1 transition-colors shadow-sm"
                          >
                            <ArrowDownLeft className="w-3.5 h-3.5" />
                            <span>Receive ₹</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredCustomers.length === 0 && (
            <div className="py-12 text-center text-slate-500 text-xs">
              No customers found. Click "Add New Customer" to create a Khata account.
            </div>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL: SHARE VIA WHATSAPP (Payment Reminder & Khata Statement) */}
      {/* ======================================================== */}
      {activeWhatsAppCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Share via WhatsApp</h3>
                  <p className="text-xs text-slate-400">
                    {activeWhatsAppCustomer.name} • {activeWhatsAppCustomer.phone}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveWhatsAppCustomer(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Template Selector Pills */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Select Message Format
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleTemplateChange('reminder')}
                  className={`p-2 rounded-xl text-xs font-semibold border flex flex-col items-center justify-center gap-1 transition-all ${
                    selectedTemplate === 'reminder'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500 shadow-sm'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Payment Due</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTemplateChange('statement')}
                  className={`p-2 rounded-xl text-xs font-semibold border flex flex-col items-center justify-center gap-1 transition-all ${
                    selectedTemplate === 'statement'
                      ? 'bg-teal-500/20 text-teal-300 border-teal-500 shadow-sm'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  <Wallet className="w-3.5 h-3.5" />
                  <span>Statement</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTemplateChange('greeting')}
                  className={`p-2 rounded-xl text-xs font-semibold border flex flex-col items-center justify-center gap-1 transition-all ${
                    selectedTemplate === 'greeting'
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500 shadow-sm'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  <Gift className="w-3.5 h-3.5" />
                  <span>Offer Greeting</span>
                </button>
              </div>
            </div>

            {/* Recipient Phone input */}
            <div>
              <label className="text-xs text-slate-400 block mb-1">Recipient Mobile Number *</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={whatsappPhone}
                  onChange={(e) => setWhatsappPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Live Message Preview & Editor */}
            <div>
              <label className="text-xs text-slate-400 block mb-1">Message Body (Editable)</label>
              <textarea
                rows={7}
                value={customReminderMsg}
                onChange={(e) => setCustomReminderMsg(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-mono leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <button
                onClick={handleCopyMessage}
                className="px-4 py-2 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-teal-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied Text!' : 'Copy Text'}</span>
              </button>

              <button
                onClick={handleLaunchWhatsApp}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-lg shadow-emerald-600/30 transition-all active:scale-95"
              >
                <span>Share via WhatsApp</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: CUSTOMER PROFILE & PURCHASE HISTORY */}
      {/* ======================================================== */}
      {viewingProfileCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold text-lg border border-teal-500/30">
                  {viewingProfileCustomer.name[0]}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{viewingProfileCustomer.name}</h3>
                  <div className="text-xs text-cyan-300 font-mono">{viewingProfileCustomer.phone}</div>
                </div>
              </div>
              <button
                onClick={() => setViewingProfileCustomer(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Overview Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Lifetime Purchases</span>
                <div className="text-xl font-black text-cyan-300 font-mono mt-0.5">
                  ₹{viewingProfileCustomer.totalPurchased.toLocaleString('en-IN')}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Current Udhaar Balance</span>
                <div className={`text-xl font-black font-mono mt-0.5 ${viewingProfileCustomer.outstandingBalance > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  ₹{viewingProfileCustomer.outstandingBalance.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            {/* Customer Contact Details */}
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-1.5 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Address:</span>
                <span className="font-medium text-white">{viewingProfileCustomer.address || 'In-store regular customer'}</span>
              </div>
              {viewingProfileCustomer.gstin && (
                <div className="flex justify-between">
                  <span className="text-slate-400">GSTIN:</span>
                  <span className="font-mono text-white">{viewingProfileCustomer.gstin}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-400">Last Purchase Date:</span>
                <span className="font-mono text-teal-400">{viewingProfileCustomer.lastPurchaseDate}</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <button
                onClick={() => setViewingProfileCustomer(null)}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold"
              >
                Close
              </button>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    const cust = viewingProfileCustomer;
                    setViewingProfileCustomer(null);
                    handleOpenWhatsApp(cust);
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-emerald-600/30 transition-all active:scale-95"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Share via WhatsApp</span>
                </button>

                {viewingProfileCustomer.outstandingBalance > 0 && (
                  <button
                    onClick={() => {
                      const cust = viewingProfileCustomer;
                      setViewingProfileCustomer(null);
                      handleOpenReceivePayment(cust);
                    }}
                    className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs"
                  >
                    Receive Payment
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Receive Customer Payment */}
      {receivingPaymentCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Wallet className="w-5 h-5 text-teal-400" />
                <h3 className="text-base font-bold text-white">Receive Payment (Clear Udhaar)</h3>
              </div>
              <button
                onClick={() => setReceivingPaymentCustomer(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-slate-300">
              Customer: <span className="font-bold text-white">{receivingPaymentCustomer.name}</span>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Amount Received (₹) *</label>
              <input
                type="number"
                min="1"
                max={receivingPaymentCustomer.outstandingBalance}
                value={receivedAmount}
                onChange={(e) => setReceivedAmount(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-lg font-black font-mono text-cyan-300 focus:border-teal-500"
              />
              <div className="text-[11px] text-slate-400 mt-1">
                Remaining Udhaar will be:{' '}
                <span className="font-mono font-bold text-white">
                  ₹{Math.max(0, receivingPaymentCustomer.outstandingBalance - receivedAmount).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'upi', label: 'UPI / PhonePe' },
                { id: 'cash', label: 'Cash' },
                { id: 'bank_transfer', label: 'Bank NEFT' },
                { id: 'cheque', label: 'Cheque' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPaymentMode(m.id)}
                  className={`p-2 rounded-lg text-xs font-semibold border ${
                    paymentMode === m.id
                      ? 'bg-teal-500/20 text-teal-300 border-teal-500'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Transaction Ref / Cheque No</label>
              <input
                type="text"
                value={txnRef}
                onChange={(e) => setTxnRef(e.target.value)}
                placeholder="e.g. UPI/2026/88912"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white font-mono focus:border-teal-500"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setReceivingPaymentCustomer(null)}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReceivePayment}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-bold text-xs shadow-md"
              >
                Confirm Payment Received
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add New Customer */}
      {isAddCustomerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-teal-400" />
                <h3 className="text-base font-bold text-white">Create Customer Profile</h3>
              </div>
              <button
                onClick={() => setIsAddCustomerOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Customer Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Vikram Malhotra"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:border-teal-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Mobile / WhatsApp Number *</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white font-mono focus:border-teal-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Address / Landmark</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. MG Road, Bengaluru"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:border-teal-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">GSTIN (Optional for B2B)</label>
                <input
                  type="text"
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value)}
                  placeholder="e.g. 29ABCDE1234F1Z5"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white font-mono uppercase focus:border-teal-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddCustomerOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-bold text-xs shadow-md"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
