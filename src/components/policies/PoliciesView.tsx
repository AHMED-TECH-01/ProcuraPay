import React, { useState } from 'react';
import { ShieldCheck, Lock, AlertTriangle, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { SpendingPolicy } from '../../types';

interface PoliciesViewProps {
  policy: SpendingPolicy;
  onUpdatePolicy: (data: Partial<SpendingPolicy>) => Promise<void>;
}

export const PoliciesView: React.FC<PoliciesViewProps> = ({
  policy,
  onUpdatePolicy,
}) => {
  const [maxAmountDollars, setMaxAmountDollars] = useState(
    (policy.maxPurchaseAmount / 100).toFixed(2)
  );
  const [approvalRequired, setApprovalRequired] = useState(policy.approvalRequired);
  const [domains, setDomains] = useState<string[]>(policy.allowedVendorDomains || []);
  const [newDomain, setNewDomain] = useState('');
  const [blockedCategories, setBlockedCategories] = useState<string[]>(policy.blockedCategories || []);
  const [newCategory, setNewCategory] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const cents = Math.round(parseFloat(maxAmountDollars) * 100);
    if (isNaN(cents) || cents <= 0) return;

    try {
      setIsSaving(true);
      await onUpdatePolicy({
        maxPurchaseAmount: cents,
        approvalRequired,
        allowedVendorDomains: domains,
        blockedCategories,
      });
      setSuccessMessage('Deterministic spending policies successfully committed to governance engine.');
      setTimeout(() => setSuccessMessage(null), 4000);
    } finally {
      setIsSaving(false);
    }
  };

  const addDomain = () => {
    if (newDomain.trim() && !domains.includes(newDomain.trim().toLowerCase())) {
      setDomains([...domains, newDomain.trim().toLowerCase()]);
      setNewDomain('');
    }
  };

  const removeDomain = (idx: number) => {
    setDomains(domains.filter((_, i) => i !== idx));
  };

  const addBlocked = () => {
    if (newCategory.trim() && !blockedCategories.includes(newCategory.trim())) {
      setBlockedCategories([...blockedCategories, newCategory.trim()]);
      setNewCategory('');
    }
  };

  const removeBlocked = (idx: number) => {
    setBlockedCategories(blockedCategories.filter((_, i) => i !== idx));
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-[#187B61] text-xs font-bold uppercase tracking-wider mb-1">
          <ShieldCheck className="w-4 h-4" />
          <span>Governance & Compliance Rules</span>
        </div>
        <h1 className="text-xl font-black text-gray-900 tracking-tight">
          Organization Spending Policies
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Deterministic financial constraints enforced on all AI procurement proposals. The AI agent cannot override these rules.
        </p>
      </div>

      {successMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center space-x-2 text-xs text-emerald-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Policy Form */}
      <form onSubmit={handleSave} className="bg-white p-6 rounded-xl border border-[#E5E7EB] shadow-2xs space-y-6">
        {/* Maximum Spend Limit */}
        <div>
          <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-1">
            Maximum Authorized Single Purchase Amount (USD $)
          </label>
          <div className="relative max-w-xs">
            <span className="absolute left-3 top-2.5 text-sm text-gray-500 font-medium">$</span>
            <input
              type="text"
              value={maxAmountDollars}
              onChange={(e) => setMaxAmountDollars(e.target.value)}
              className="w-full text-sm pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#187B61] outline-hidden font-mono font-bold tabular-nums"
              required
            />
          </div>
          <p className="text-[11px] text-gray-500 mt-1">
            Any procurement proposal exceeding this ceiling is automatically rejected with a policy violation.
          </p>
        </div>

        {/* Mandatory Human Approval Switch */}
        <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-800 uppercase tracking-wider block">
              Mandatory Human-In-The-Loop Approval
            </span>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Enforce that all procurement proposals require explicit owner sign-off prior to PayPal checkout generation.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={approvalRequired}
              onChange={(e) => setApprovalRequired(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#187B61]"></div>
          </label>
        </div>

        {/* Pre-Approved Vendor Domains */}
        <div className="pt-4 border-t border-gray-100 space-y-2">
          <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider">
            Pre-Approved Supplier Domains
          </label>
          <div className="flex space-x-2 max-w-md">
            <input
              type="text"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              placeholder="e.g. dell.com, bhphotovideo.com"
              className="flex-1 text-xs px-3 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#187B61] outline-hidden"
            />
            <button
              type="button"
              onClick={addDomain}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold rounded-md"
            >
              Add Domain
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {domains.map((dom, i) => (
              <span
                key={i}
                className="inline-flex items-center space-x-1.5 bg-gray-100 text-gray-800 px-2.5 py-1 rounded-md text-xs font-mono font-medium border border-gray-200"
              >
                <span>{dom}</span>
                <button
                  type="button"
                  onClick={() => removeDomain(i)}
                  className="text-gray-400 hover:text-red-600"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Blocked Categories */}
        <div className="pt-4 border-t border-gray-100 space-y-2">
          <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider">
            Strictly Prohibited Categories
          </label>
          <div className="flex space-x-2 max-w-md">
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="e.g. Gambling, Cryptocurrency, Luxury Jewelry"
              className="flex-1 text-xs px-3 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#187B61] outline-hidden"
            />
            <button
              type="button"
              onClick={addBlocked}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold rounded-md"
            >
              Block Category
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {blockedCategories.map((cat, i) => (
              <span
                key={i}
                className="inline-flex items-center space-x-1.5 bg-red-50 text-red-800 px-2.5 py-1 rounded-md text-xs font-medium border border-red-200"
              >
                <span>{cat}</span>
                <button
                  type="button"
                  onClick={() => removeBlocked(i)}
                  className="text-red-400 hover:text-red-700"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-gray-200 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 bg-[#187B61] hover:bg-[#16835D] text-white text-xs font-bold rounded-lg shadow-xs transition-all disabled:opacity-50"
          >
            {isSaving ? 'Updating Policies...' : 'Save Spending Policies'}
          </button>
        </div>
      </form>
    </div>
  );
};
