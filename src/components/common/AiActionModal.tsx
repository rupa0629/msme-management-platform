import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Package,
  Plus,
  RefreshCw,
  Sparkles,
  Store,
  Tag,
  User,
  Wallet,
  X,
} from 'lucide-react';
import { useBusiness } from '../../context/BusinessContext';
import { ParsedAiAction } from '../../types';

export const AiActionModal: React.FC = () => {
  const { aiActionModal, closeAiActionModal, confirmAndExecuteAiAction } = useBusiness();
  const { isOpen, parsedAction, rawInput } = aiActionModal;

  const [editedAction, setEditedAction] = useState<ParsedAiAction | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Sync state when modal opens
  React.useEffect(() => {
    if (parsedAction) {
      setEditedAction(JSON.parse(JSON.stringify(parsedAction)));
    }
  }, [parsedAction]);

  if (!isOpen || !editedAction) return null;

  const handleConfirm = () => {
    setIsExecuting(true);
    setTimeout(() => {
      const res = confirmAndExecuteAiAction(editedAction);
      setIsExecuting(false);
      if (res.success) {
        setSuccessToast(res.message);
        setTimeout(() => {
          setSuccessToast(null);
        }, 3000);
      }
    }, 400);
  };

  const getActionColor = (type: string) => {
    switch (type) {
      case 'purchase':
        return 'from-blue-600 to-cyan-600 text-cyan-200 border-cyan-500/30';
      case 'sale':
        return 'from-emerald-600 to-teal-600 text-teal-200 border-teal-500/30';
      case 'expense':
        return 'from-amber-600 to-orange-600 text-amber-200 border-amber-500/30';
      case 'payment_received':
        return 'from-teal-600 to-emerald-600 text-emerald-200 border-emerald-500/30';
      case 'payment_sent':
        return 'from-rose-600 to-pink-600 text-rose-200 border-rose-500/30';
      default:
        return 'from-slate-600 to-slate-700 text-slate-200 border-slate-500/30';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden glow-teal">
        {/* Header with AI gradient */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-b border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 text-white shadow-lg">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-xl font-bold text-white tracking-tight">AI Smart Action Confirmation</h3>
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30">
                    Gemini 3.8 Flash
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Natural language command parsed and ready to update books
                </p>
              </div>
            </div>
            <button
              onClick={closeAiActionModal}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Original command bubble */}
          <div className="mt-4 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start space-x-3">
            <div className="text-xs font-mono text-cyan-400 font-semibold uppercase mt-0.5 whitespace-nowrap">Input:</div>
            <p className="text-sm font-medium text-slate-200 italic">"{rawInput}"</p>
          </div>
        </div>

        {/* Action Details Body */}
        <div className="p-6 space-y-6 max-h-[65vh] overflow-y-auto">
          {/* Action Header Card */}
          <div className="p-4 rounded-xl bg-slate-850 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Identified Intent</span>
              <div className="flex items-center space-x-2">
                <span className={`text-xs px-2.5 py-1 rounded-lg font-bold uppercase tracking-wider bg-gradient-to-r ${getActionColor(editedAction.actionType)} border`}>
                  {editedAction.actionType.replace('_', ' ')}
                </span>
                <span className="text-base font-bold text-white">{editedAction.summary}</span>
              </div>
            </div>
            <div className="text-left md:text-right">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Total Amount</span>
              <div className="text-2xl font-black text-cyan-300 font-mono">
                ₹{editedAction.totalAmount.toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          {/* Cascading Effects Preview (The "ONE INPUT -> AUTOMATIC BUSINESS UPDATES" vision) */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-2">
              <RefreshCw className="w-3.5 h-3.5 text-teal-400" />
              <span>Cascading Automated Updates</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Inventory impact */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start space-x-3">
                <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-300">Inventory Stock</div>
                  <div className="text-sm font-bold text-cyan-300 mt-0.5">
                    {editedAction.actionType === 'purchase'
                      ? `+${editedAction.items.reduce((a, b) => a + b.quantity, 0)} units`
                      : editedAction.actionType === 'sale'
                      ? `-${editedAction.items.reduce((a, b) => a + b.quantity, 0)} units`
                      : 'No stock change'}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Auto-updated in catalog</div>
                </div>
              </div>

              {/* Entity/Khata impact */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start space-x-3">
                <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400">
                  {editedAction.entityType === 'supplier' ? <Store className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-300">
                    {editedAction.entityType === 'supplier' ? 'Supplier Ledger' : 'Customer Khata'}
                  </div>
                  <div className="text-sm font-bold text-teal-300 truncate max-w-[130px] mt-0.5">
                    {editedAction.entityName || 'General Account'}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {editedAction.paymentStatus === 'pending' ? 'Added to Udhaar/Payables' : 'Cleared / Paid'}
                  </div>
                </div>
              </div>

              {/* Financial & Cash Flow impact */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start space-x-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <Wallet className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-300">Cash Flow & Analytics</div>
                  <div className="text-sm font-bold text-emerald-300 mt-0.5">
                    {editedAction.paymentMethod.toUpperCase()}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Revenues & P&L synced</div>
                </div>
              </div>
            </div>
          </div>

          {/* Line items if any */}
          {editedAction.items && editedAction.items.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Extracted Items & Pricing</span>
                <span className="text-slate-500 font-normal">Deterministic math applied</span>
              </h4>
              <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-950/50">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-850 text-slate-400 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-2.5 px-4 font-semibold">Product Name</th>
                      <th className="py-2.5 px-4 font-semibold text-center">Qty</th>
                      <th className="py-2.5 px-4 font-semibold text-right">Unit Price</th>
                      <th className="py-2.5 px-4 font-semibold text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 text-slate-200">
                    {editedAction.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/60 transition-colors">
                        <td className="py-2.5 px-4 font-medium text-white">{item.productName}</td>
                        <td className="py-2.5 px-4 text-center font-mono">{item.quantity}</td>
                        <td className="py-2.5 px-4 text-right font-mono">₹{item.unitPrice.toLocaleString('en-IN')}</td>
                        <td className="py-2.5 px-4 text-right font-bold text-cyan-300 font-mono">
                          ₹{(item.quantity * item.unitPrice).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Quick confirmation parameter adjustments */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-950/40 border border-slate-800/60">
            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1">Entity Name</label>
              <input
                type="text"
                value={editedAction.entityName}
                onChange={(e) => setEditedAction({ ...editedAction, entityName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-teal-500 font-medium"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1">Payment Status</label>
              <select
                value={editedAction.paymentStatus}
                onChange={(e) => setEditedAction({ ...editedAction, paymentStatus: e.target.value as any })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-teal-500 font-medium"
              >
                <option value="paid">Paid (Fully Cleared)</option>
                <option value="pending">Pending (Udhaar / Credit Ledger)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            onClick={closeAiActionModal}
            className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-sm font-semibold transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleConfirm}
            disabled={isExecuting}
            className="flex-1 max-w-sm flex items-center justify-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-bold text-sm shadow-lg shadow-teal-500/25 transition-all transform active:scale-95 disabled:opacity-50"
          >
            {isExecuting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Updating Books...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm & Update All Books</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
