import React, { useState } from 'react';
import { X, Sparkles, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { PurchaseRequest } from '../../types';

interface NewRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    rawPrompt: string;
    title: string;
    category: string;
    quantity: number;
    maxBudget: number; // in cents
    mandatorySpecs: string[];
    preferences: string[];
  }) => Promise<PurchaseRequest>;
}

export const NewRequestModal: React.FC<NewRequestModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [rawPrompt, setRawPrompt] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Displays & Monitors');
  const [quantity, setQuantity] = useState(2);
  const [budgetDollars, setBudgetDollars] = useState('500.00');
  const [mandatorySpecs, setMandatorySpecs] = useState<string[]>(['4K resolution', 'USB-C']);
  const [newMandatory, setNewMandatory] = useState('');
  const [preferences, setPreferences] = useState<string[]>(['Adjustable height stand']);
  const [newPref, setNewPref] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleApplyPreset = (type: 'monitors' | 'laptops') => {
    if (type === 'monitors') {
      setRawPrompt('Find two 4K monitors with USB-C under $250 each. Prefer reliable suppliers with fast delivery.');
      setTitle('Two 4K Monitors with USB-C');
      setCategory('Displays & Monitors');
      setQuantity(2);
      setBudgetDollars('500.00');
      setMandatorySpecs(['4K UHD resolution', 'USB-C connectivity with Power Delivery']);
      setPreferences(['IPS panel', 'Under $250 each', 'B&H or Dell supplier']);
    } else {
      setRawPrompt('Find five business laptops with at least 16GB RAM, 512GB SSD, and a maximum total budget of $4,000. Prefer reliable suppliers.');
      setTitle('Five 16GB RAM / 512GB SSD Business Laptops');
      setCategory('Computers & Laptops');
      setQuantity(5);
      setBudgetDollars('4000.00');
      setMandatorySpecs(['16GB RAM', '512GB SSD', 'Windows 11 Pro']);
      setPreferences(['Lenovo ThinkPad or Dell Latitude', 'Ryzen 5 or Intel i5']);
    }
  };

  const handleAddMandatory = () => {
    if (newMandatory.trim() && !mandatorySpecs.includes(newMandatory.trim())) {
      setMandatorySpecs([...mandatorySpecs, newMandatory.trim()]);
      setNewMandatory('');
    }
  };

  const handleRemoveMandatory = (index: number) => {
    setMandatorySpecs(mandatorySpecs.filter((_, i) => i !== index));
  };

  const handleAddPref = () => {
    if (newPref.trim() && !preferences.includes(newPref.trim())) {
      setPreferences([...preferences, newPref.trim()]);
      setNewPref('');
    }
  };

  const handleRemovePref = (index: number) => {
    setPreferences(preferences.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawPrompt.trim()) {
      setError('Please provide a natural-language purchasing description.');
      return;
    }

    const budgetCents = Math.round(parseFloat(budgetDollars || '0') * 100);
    if (isNaN(budgetCents) || budgetCents <= 0) {
      setError('Please specify a valid positive budget amount.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSubmit({
        rawPrompt: rawPrompt.trim(),
        title: title.trim() || rawPrompt.slice(0, 50),
        category,
        quantity: Math.max(1, quantity),
        maxBudget: budgetCents,
        mandatorySpecs,
        preferences,
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to launch procurement agent');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-2xl my-8 overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/70">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#187B61] text-white flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Create AI Procurement Request</h2>
              <p className="text-xs text-gray-500">Autonomous research with deterministic human-in-the-loop approval</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 rounded-lg p-1 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Presets */}
        <div className="px-6 pt-4 pb-2 bg-emerald-50/40 border-b border-emerald-100 flex items-center justify-between text-xs">
          <span className="font-semibold text-emerald-900">Demo Presets:</span>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => handleApplyPreset('monitors')}
              className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-emerald-900 border border-emerald-300 rounded font-medium shadow-2xs"
            >
              2x 4K Monitors with USB-C ($250 ea)
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('laptops')}
              className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-emerald-900 border border-emerald-300 rounded font-medium shadow-2xs"
            >
              5x Business Laptops (16GB RAM, $4k)
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-xs text-red-800">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Natural Language Prompt */}
          <div>
            <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-1">
              Natural Language Request <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={rawPrompt}
              onChange={(e) => setRawPrompt(e.target.value)}
              placeholder="e.g., Find two 4K monitors with USB-C under $250 each. Prefer reliable suppliers with fast delivery."
              className="w-full text-sm p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#187B61] focus:border-[#187B61] outline-hidden leading-relaxed"
              required
            />
          </div>

          {/* Title & Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Request Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Two 4K Monitors with USB-C"
                className="w-full text-sm px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#187B61] outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-sm px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#187B61] outline-hidden bg-white"
              >
                <option value="Displays & Monitors">Displays & Monitors</option>
                <option value="Computers & Laptops">Computers & Laptops</option>
                <option value="Office Furniture">Office Furniture</option>
                <option value="Enterprise Networking">Enterprise Networking</option>
              </select>
            </div>
          </div>

          {/* Quantity & Budget */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Quantity Units
              </label>
              <input
                type="number"
                min={1}
                max={100}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="w-full text-sm px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#187B61] outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Maximum Total Budget (USD $)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-sm text-gray-500 font-medium">$</span>
                <input
                  type="text"
                  value={budgetDollars}
                  onChange={(e) => setBudgetDollars(e.target.value)}
                  placeholder="500.00"
                  className="w-full text-sm pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#187B61] outline-hidden tabular-nums font-mono"
                />
              </div>
            </div>
          </div>

          {/* Mandatory Specs (Hard Filters) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-gray-800">
                Mandatory Specifications (Enforced as Hard Filters)
              </label>
              <span className="text-[11px] text-amber-700 font-medium">Offers failing any spec are disqualified</span>
            </div>
            <div className="flex space-x-2 mb-2">
              <input
                type="text"
                value={newMandatory}
                onChange={(e) => setNewMandatory(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddMandatory();
                  }
                }}
                placeholder="e.g. 4K UHD, USB-C, 16GB RAM"
                className="flex-1 text-xs px-3 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#187B61] outline-hidden"
              />
              <button
                type="button"
                onClick={handleAddMandatory}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-medium rounded-md flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Filter</span>
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {mandatorySpecs.map((spec, index) => (
                <span
                  key={index}
                  className="inline-flex items-center space-x-1.5 bg-gray-100 text-gray-800 px-2.5 py-1 rounded-md text-xs font-medium border border-gray-200"
                >
                  <span>{spec}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveMandatory(index)}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Optional Preferences */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Optional Preferences (Weighted in Scoring Engine)
            </label>
            <div className="flex space-x-2 mb-2">
              <input
                type="text"
                value={newPref}
                onChange={(e) => setNewPref(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddPref();
                  }
                }}
                placeholder="e.g. Dell or B&H supplier, Next-day delivery"
                className="flex-1 text-xs px-3 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#187B61] outline-hidden"
              />
              <button
                type="button"
                onClick={handleAddPref}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-medium rounded-md flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {preferences.map((pref, index) => (
                <span
                  key={index}
                  className="inline-flex items-center space-x-1.5 bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-md text-xs font-medium border border-emerald-200"
                >
                  <span>{pref}</span>
                  <button
                    type="button"
                    onClick={() => handleRemovePref(index)}
                    className="text-emerald-600 hover:text-red-600"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-gray-200 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-[#187B61] hover:bg-[#16835D] text-white text-xs font-semibold rounded-lg shadow-xs transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Launching Agent...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Launch ProcuraPay AI Agent</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
