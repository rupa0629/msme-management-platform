import React, { useState } from 'react';
import {
  AlertCircle,
  Building,
  Check,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  FileText,
  MapPin,
  Phone,
  QrCode,
  ShieldCheck,
  Sparkles,
  Store,
  User,
  X,
} from 'lucide-react';
import { useBusiness } from '../../context/BusinessContext';
import { BusinessOnboardingData } from '../../types';

export const BusinessOnboardingModal: React.FC = () => {
  const {
    isOnboardingModalOpen,
    setIsOnboardingModalOpen,
    registerBusiness,
    storeInfo,
  } = useBusiness();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [formData, setFormData] = useState<BusinessOnboardingData>({
    businessName: '',
    category: 'Textiles & Readymade Garments',
    tagline: 'Quality Fabrics & Retail Apparel',
    gstin: '',
    pan: '',
    ownerName: '',
    phone: '',
    email: '',
    address: '',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
    upiId: '',
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  if (!isOnboardingModalOpen) return null;

  // Real-time validations
  const validateStep1 = () => {
    const errors: Record<string, string> = {};
    if (!formData.businessName.trim()) {
      errors.businessName = 'Business name is required.';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = () => {
    const errors: Record<string, string> = {};
    if (formData.gstin && formData.gstin.trim()) {
      const gstinClean = formData.gstin.trim().toUpperCase();
      const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
      if (!gstinRegex.test(gstinClean)) {
        errors.gstin = 'Invalid Indian GSTIN. Format: 29AAACH1928K1Z3 (15 alphanumeric characters).';
      }
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep3 = () => {
    const errors: Record<string, string> = {};
    if (!formData.ownerName.trim()) {
      errors.ownerName = 'Owner name is required.';
    }

    const phoneClean = formData.phone.replace(/[\s\-\+]/g, '');
    const phoneRegex = /^(?:91)?[6-9]\d{9}$/;
    if (!phoneRegex.test(phoneClean)) {
      errors.phone = 'Valid 10-digit Indian mobile number is required (starting with 6-9).';
    }

    if (formData.upiId && formData.upiId.trim()) {
      const upiClean = formData.upiId.trim().toLowerCase();
      const upiRegex = /^[a-zA-Z0-9.\-_]{2,49}@[a-zA-Z]{2,49}$/;
      if (!upiRegex.test(upiClean)) {
        errors.upiId = 'Invalid UPI ID format. Expected: username@bank (e.g. shop@oksbi).';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    setServerError(null);
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    if (!validateStep3()) return;

    setIsSubmitting(true);
    const result = await registerBusiness(formData);
    setIsSubmitting(false);

    if (!result.success) {
      setServerError(result.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-500 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-teal-500/20">
              <Store className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">Register New MSME Business</h3>
                <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-teal-500/20 text-teal-300 border border-teal-500/40">
                  Step {step} of 3
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Setup your store with GSTIN, UPI settlements, and isolated multi-tenant database.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsOnboardingModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Steps Progress Bar */}
        <div className="grid grid-cols-3 border-b border-slate-800 bg-slate-950/40 text-xs">
          <div
            onClick={() => setStep(1)}
            className={`p-3 text-center cursor-pointer transition-colors border-r border-slate-800 flex items-center justify-center gap-2 ${
              step === 1 ? 'bg-teal-500/10 text-teal-300 font-bold border-b-2 border-b-teal-400' : 'text-slate-400'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-mono">1</span>
            <span className="truncate">Store Info</span>
          </div>
          <div
            onClick={() => {
              if (validateStep1()) setStep(2);
            }}
            className={`p-3 text-center cursor-pointer transition-colors border-r border-slate-800 flex items-center justify-center gap-2 ${
              step === 2 ? 'bg-teal-500/10 text-teal-300 font-bold border-b-2 border-b-teal-400' : 'text-slate-400'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-mono">2</span>
            <span className="truncate">Tax & GSTIN</span>
          </div>
          <div
            onClick={() => {
              if (validateStep1() && validateStep2()) setStep(3);
            }}
            className={`p-3 text-center cursor-pointer transition-colors flex items-center justify-center gap-2 ${
              step === 3 ? 'bg-teal-500/10 text-teal-300 font-bold border-b-2 border-b-teal-400' : 'text-slate-400'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-mono">3</span>
            <span className="truncate">UPI & Owner</span>
          </div>
        </div>

        {/* Error notification */}
        {serverError && (
          <div className="mx-5 mt-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center gap-2.5 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{serverError}</span>
          </div>
        )}

        {/* Wizard Form Body */}
        <div className="p-5 overflow-y-auto flex-1">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Business / Trading Name <span className="text-teal-400">*</span>
                </label>
                <div className="relative">
                  <Store className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    placeholder="e.g. Mahavir Silk & Sarees Hub"
                    className={`w-full pl-9 pr-3 py-2 bg-slate-950 border rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none ${
                      validationErrors.businessName ? 'border-rose-500' : 'border-slate-700 focus:border-teal-400'
                    }`}
                  />
                </div>
                {validationErrors.businessName && (
                  <p className="text-[11px] text-rose-400 mt-1">{validationErrors.businessName}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Business Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-teal-400"
                >
                  <option value="Textiles & Readymade Garments">Textiles & Readymade Garments</option>
                  <option value="Kirana & Grocery Retail">Kirana & Grocery Retail</option>
                  <option value="Footwear & Leather Goods">Footwear & Leather Goods</option>
                  <option value="Hardware & Electricals">Hardware & Electricals</option>
                  <option value="Mobile & Electronics">Mobile & Electronics</option>
                  <option value="Jewellery & Gems">Jewellery & Gems</option>
                  <option value="Pharma & Chemist Store">Pharma & Chemist Store</option>
                  <option value="Other MSME Enterprise">Other MSME Enterprise</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Tagline / Motto</label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  placeholder="e.g. Trusted Wholesale & Retailers Since 2015"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-400 shrink-0" />
                <span>
                  All invoices, bills, and WhatsApp reminders will automatically use this store branding.
                </span>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Indian GSTIN (15 Alphanumeric)
                  </label>
                  <span className="text-[10px] text-slate-400">Optional for non-GST stores</span>
                </div>
                <div className="relative">
                  <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    maxLength={15}
                    value={formData.gstin}
                    onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                    placeholder="29AAACH1928K1Z3"
                    className={`w-full pl-9 pr-3 py-2 bg-slate-950 border rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none uppercase font-mono ${
                      validationErrors.gstin ? 'border-rose-500' : 'border-slate-700 focus:border-teal-400'
                    }`}
                  />
                </div>
                {validationErrors.gstin ? (
                  <p className="text-[11px] text-rose-400 mt-1">{validationErrors.gstin}</p>
                ) : (
                  <p className="text-[10px] text-slate-400 mt-1">
                    Format: 2 digits (State) + 10 chars (PAN) + 1 entity + 1 'Z' + 1 checksum.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">PAN Card Number</label>
                <input
                  type="text"
                  maxLength={10}
                  value={formData.pan}
                  onChange={(e) => setFormData({ ...formData, pan: e.target.value.toUpperCase() })}
                  placeholder="AAACH1928K"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none uppercase font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">State</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-teal-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Pincode</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-teal-400 font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Owner / Proprietor Full Name <span className="text-teal-400">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={formData.ownerName}
                    onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                    placeholder="e.g. Ramesh Gupta"
                    className={`w-full pl-9 pr-3 py-2 bg-slate-950 border rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none ${
                      validationErrors.ownerName ? 'border-rose-500' : 'border-slate-700 focus:border-teal-400'
                    }`}
                  />
                </div>
                {validationErrors.ownerName && (
                  <p className="text-[11px] text-rose-400 mt-1">{validationErrors.ownerName}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    10-Digit Phone <span className="text-teal-400">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="98450 77123"
                      className={`w-full pl-9 pr-3 py-2 bg-slate-950 border rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none font-mono ${
                        validationErrors.phone ? 'border-rose-500' : 'border-slate-700 focus:border-teal-400'
                      }`}
                    />
                  </div>
                  {validationErrors.phone && (
                    <p className="text-[11px] text-rose-400 mt-1">{validationErrors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Business Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="store@gmail.com"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  UPI VPA / QR ID for Customer Settlements
                </label>
                <div className="relative">
                  <QrCode className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={formData.upiId}
                    onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                    placeholder="lakshmitextiles@oksbi"
                    className={`w-full pl-9 pr-3 py-2 bg-slate-950 border rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none font-mono ${
                      validationErrors.upiId ? 'border-rose-500' : 'border-slate-700 focus:border-teal-400'
                    }`}
                  />
                </div>
                {validationErrors.upiId ? (
                  <p className="text-[11px] text-rose-400 mt-1">{validationErrors.upiId}</p>
                ) : (
                  <p className="text-[10px] text-slate-400 mt-1">
                    Customers can scan your dynamic UPI QR code on invoices to clear credit dues directly.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Shop Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Shop #12, Commercial Market, Main Road"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
                />
              </div>
            </div>
          )}
        </div>

        {/* Wizard Footer Navigation */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((step - 1) as any)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800/80 transition-colors"
            >
              Back
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsOnboardingModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800/80 transition-colors"
            >
              Cancel
            </button>
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md shadow-teal-500/20"
            >
              <span>Continue</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 text-xs font-black flex items-center gap-1.5 transition-all shadow-md shadow-teal-500/20 disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Registering...' : 'Complete Registration'}</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
