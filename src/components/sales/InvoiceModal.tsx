import React, { useState } from 'react';
import {
  Check,
  Copy,
  ExternalLink,
  MessageSquare,
  Phone,
  Printer,
  QrCode,
  Share2,
  Store,
  X,
} from 'lucide-react';
import { useBusiness } from '../../context/BusinessContext';
import { Sale } from '../../types';

interface InvoiceModalProps {
  sale: Sale | null;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ sale, onClose }) => {
  const { storeInfo } = useBusiness();
  const [copied, setCopied] = useState(false);
  const [showWhatsAppShareModal, setShowWhatsAppShareModal] = useState(false);
  const [targetPhone, setTargetPhone] = useState('');
  const [customWhatsAppMsg, setCustomWhatsAppMsg] = useState('');

  if (!sale) return null;

  // Generate standardized Indian digital invoice WhatsApp message
  const generateInvoiceWhatsAppText = (phoneNumber: string) => {
    const itemsList = sale.items
      .map((i) => `• ${i.productName} (x${i.quantity}) - ₹${i.total.toLocaleString('en-IN')}`)
      .join('\n');

    const paymentText =
      sale.paymentStatus === 'paid'
        ? `✅ Status: PAID in Full (${sale.paymentMethod.toUpperCase()})`
        : `⚠️ Status: PENDING / UDHAAR (Due Amount: ₹${sale.grandTotal.toLocaleString('en-IN')})`;

    return `🧾 *TAX INVOICE - ${storeInfo.storeName.toUpperCase()}*
----------------------------------------
Invoice No: *${sale.invoiceNo}*
Date: ${sale.date}
Customer: *${sale.customerName}*

*Items Billed:*
${itemsList}

Subtotal: ₹${sale.subtotal.toLocaleString('en-IN')}
${sale.discountAmount > 0 ? `Discount: -₹${sale.discountAmount.toLocaleString('en-IN')}\n` : ''}GST (CGST+SGST): ₹${sale.taxAmount.toLocaleString('en-IN')}
*Grand Total: ₹${sale.grandTotal.toLocaleString('en-IN')}*
${paymentText}

Payment UPI ID: *${storeInfo.upiId}*
Bank: ${storeInfo.bankName} (A/C: ${storeInfo.accountNumber})

${storeInfo.address}, ${storeInfo.city}
📞 Contact: ${storeInfo.phone}
Thank you for your business! 🙏`;
  };

  const handleOpenWhatsAppShare = () => {
    const initialPhone = sale.customerPhone || '+91 ';
    setTargetPhone(initialPhone);
    setCustomWhatsAppMsg(generateInvoiceWhatsAppText(initialPhone));
    setShowWhatsAppShareModal(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLaunchWhatsApp = () => {
    const cleanPhone = targetPhone.replace(/[^0-9]/g, '');
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(customWhatsAppMsg)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white text-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Action Bar (Dark) */}
        <div className="px-6 py-3 bg-slate-900 border-b border-slate-800 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold font-mono text-teal-400">GST TAX INVOICE</span>
            <span className="text-xs text-slate-400">• {sale.invoiceNo}</span>
          </div>

          <div className="flex items-center space-x-2">
            {/* Share via WhatsApp Button */}
            <button
              onClick={handleOpenWhatsAppShare}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-emerald-600/30 transition-all active:scale-95"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Share via WhatsApp</span>
            </button>

            <button
              onClick={() => handleCopyText(generateInvoiceWhatsAppText(sale.customerPhone || ''))}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-teal-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold flex items-center space-x-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Sheet */}
        <div id="printable-invoice" className="p-8 overflow-y-auto space-y-6 text-sm">
          {/* Header */}
          <div className="flex justify-between items-start border-b border-slate-200 pb-6">
            <div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-black text-sm">
                  ₹
                </div>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">{storeInfo.storeName}</h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">{storeInfo.tagline}</p>
              <p className="text-xs text-slate-600 mt-1">
                {storeInfo.address}, {storeInfo.city}, {storeInfo.state} - {storeInfo.pincode}
              </p>
              <p className="text-xs text-slate-600">
                Phone: <span className="font-semibold text-slate-800">{storeInfo.phone}</span> | GSTIN:{' '}
                <span className="font-semibold font-mono text-slate-800">{storeInfo.gstin}</span>
              </p>
            </div>

            <div className="text-right">
              <span className="inline-block px-3 py-1 rounded bg-teal-50 text-teal-700 font-bold text-xs uppercase tracking-wider border border-teal-200">
                Original For Recipient
              </span>
              <div className="mt-2">
                <div className="text-xs text-slate-500">Invoice Number:</div>
                <div className="text-base font-black font-mono text-slate-900">{sale.invoiceNo}</div>
              </div>
              <div className="mt-1">
                <div className="text-xs text-slate-500">Invoice Date:</div>
                <div className="text-xs font-semibold text-slate-800">{sale.date}</div>
              </div>
            </div>
          </div>

          {/* Customer / Billed To Section */}
          <div className="grid grid-cols-2 gap-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Billed To (Customer):</span>
              <div className="text-sm font-bold text-slate-900 mt-0.5">{sale.customerName}</div>
              {sale.customerPhone && <div className="text-xs text-slate-600 mt-0.5">Phone: {sale.customerPhone}</div>}
              {sale.customerGstin && (
                <div className="text-xs text-slate-600">
                  GSTIN: <span className="font-mono">{sale.customerGstin}</span>
                </div>
              )}
            </div>

            <div className="text-right">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Payment Status:</span>
              <div className="mt-0.5">
                <span
                  className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                    sale.paymentStatus === 'paid'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}
                >
                  {sale.paymentStatus === 'paid' ? 'Paid in Full' : 'Pending (Udhaar)'}
                </span>
              </div>
              <div className="text-xs text-slate-600 mt-1">
                Payment Mode: <span className="font-bold uppercase font-mono">{sale.paymentMethod}</span>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 font-bold">#</th>
                  <th className="py-2.5 px-3 font-bold">Item Description</th>
                  <th className="py-2.5 px-3 font-bold text-center">Qty</th>
                  <th className="py-2.5 px-3 font-bold text-right">Unit Price</th>
                  <th className="py-2.5 px-3 font-bold text-right">Total (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sale.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-2.5 px-3 text-slate-400 font-mono">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">{item.productName}</td>
                    <td className="py-2.5 px-3 text-center font-mono">{item.quantity}</td>
                    <td className="py-2.5 px-3 text-right font-mono">₹{item.unitPrice.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-3 text-right font-bold font-mono text-slate-900">
                      ₹{item.total.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals & UPI QR Code */}
          <div className="grid grid-cols-2 gap-6 pt-2">
            {/* UPI QR & Bank details */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center space-x-4">
              <div className="w-20 h-20 bg-white border border-slate-300 rounded-lg flex flex-col items-center justify-center p-1 shadow-sm">
                <QrCode className="w-14 h-14 text-slate-900" />
                <span className="text-[9px] font-bold text-slate-600">Scan to Pay</span>
              </div>
              <div className="text-xs text-slate-600 space-y-0.5">
                <div className="font-bold text-slate-800">Direct UPI Payment</div>
                <div className="font-mono text-[11px] text-teal-700 font-semibold">{storeInfo.upiId}</div>
                <div className="text-[10px] text-slate-500 mt-1">Bank: {storeInfo.bankName}</div>
                <div className="text-[10px] text-slate-500 font-mono">A/C: {storeInfo.accountNumber}</div>
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-1.5 text-xs text-slate-700">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span>Subtotal:</span>
                <span className="font-mono font-semibold">₹{sale.subtotal.toLocaleString('en-IN')}</span>
              </div>
              {sale.discountAmount > 0 && (
                <div className="flex justify-between py-1 border-b border-slate-100 text-emerald-600">
                  <span>Special Discount:</span>
                  <span className="font-mono font-semibold">-₹{sale.discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span>GST (CGST 2.5% + SGST 2.5%):</span>
                <span className="font-mono font-semibold">₹{sale.taxAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-2 text-base font-black text-slate-900 border-t-2 border-slate-900">
                <span>Grand Total:</span>
                <span className="font-mono text-teal-700">₹{sale.grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Quick WhatsApp Share Action Strip */}
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span className="text-xs text-emerald-900 font-semibold">
                Send digital copy of Invoice #{sale.invoiceNo} directly to customer's WhatsApp
              </span>
            </div>
            <button
              onClick={handleOpenWhatsAppShare}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1 shadow-sm transition-all"
            >
              <span>Send Digital Invoice</span>
              <ExternalLink className="w-3 h-3 ml-1" />
            </button>
          </div>

          {/* Footer Terms */}
          <div className="text-[10px] text-slate-400 border-t border-slate-200 pt-4 flex justify-between items-center">
            <span>• Goods once sold can be exchanged within 7 days in original condition.</span>
            <span>Thank you for your business!</span>
          </div>
        </div>

        {/* Modal: Interactive WhatsApp Digital Invoice Share Dialog */}
        {showWhatsAppShareModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
            <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 text-white rounded-2xl shadow-2xl p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Share Digital Invoice via WhatsApp</h3>
                    <p className="text-xs text-slate-400">Invoice #{sale.invoiceNo} • {sale.customerName}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowWhatsAppShareModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Recipient WhatsApp Mobile Number *</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={targetPhone}
                    onChange={(e) => setTargetPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Digital Invoice Message Preview</label>
                <textarea
                  rows={8}
                  value={customWhatsAppMsg}
                  onChange={(e) => setCustomWhatsAppMsg(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500 leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <button
                  onClick={() => handleCopyText(customWhatsAppMsg)}
                  className="px-4 py-2 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-teal-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied Text!' : 'Copy Text'}</span>
                </button>

                <button
                  onClick={handleLaunchWhatsApp}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-lg shadow-emerald-600/30 transition-all active:scale-95"
                >
                  <span>Open & Send in WhatsApp</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
