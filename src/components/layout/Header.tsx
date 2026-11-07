import React from 'react';
import { Building2, Sparkles, CreditCard } from 'lucide-react';
import { Organization } from '../../types';

interface HeaderProps {
  organization: Organization;
  onOpenNewRequest: () => void;
  onRunDemoScenario: (scenario: 'monitors' | 'laptops') => void;
}

export const Header: React.FC<HeaderProps> = ({
  organization,
  onOpenNewRequest,
  onRunDemoScenario,
}) => {
  return (
    <header className="h-16 bg-white border-b border-[#E5E7EB] px-6 flex items-center justify-between shrink-0">
      {/* Left: Organization & Context */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-800">
          <Building2 className="w-4 h-4 text-gray-500" />
          <span className="font-semibold text-gray-900">{organization.name}</span>
          <span className="px-1.5 py-0.2 rounded bg-gray-200 text-gray-700 text-[10px] font-mono">
            {organization.currency}
          </span>
        </div>

        {/* Integration Status Badges */}
        <div className="hidden lg:flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-full font-medium">
            <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
            <span>PayPal Sandbox Active</span>
          </div>
          <div className="flex items-center space-x-1.5 text-xs bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-1 rounded-full font-medium">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>gemini-3.8-flash Agent</span>
          </div>
        </div>
      </div>

      {/* Right: Quick Demo Scenarios & CTA */}
      <div className="flex items-center space-x-3">
        <div className="hidden sm:flex items-center space-x-2 bg-[#F7F8F6] p-1 rounded-lg border border-gray-200 text-xs">
          <span className="text-[11px] font-semibold text-gray-500 px-2 uppercase tracking-wider">
            Quick Demo:
          </span>
          <button
            onClick={() => onRunDemoScenario('monitors')}
            className="px-2.5 py-1 bg-white hover:bg-gray-50 border border-gray-200 rounded text-gray-800 font-medium hover:border-[#187B61] transition-all shadow-2xs"
            title="Demonstrate: Find two 4K monitors with USB-C under $250 each"
          >
            2x 4K USB-C Monitors ($250)
          </button>
          <button
            onClick={() => onRunDemoScenario('laptops')}
            className="px-2.5 py-1 bg-white hover:bg-gray-50 border border-gray-200 rounded text-gray-800 font-medium hover:border-[#187B61] transition-all shadow-2xs"
            title="Demonstrate: Find 5 business laptops with 16GB RAM and 512GB SSD under $4,000"
          >
            5x 16GB Laptops ($4,000)
          </button>
        </div>

        <button
          onClick={onOpenNewRequest}
          className="inline-flex items-center space-x-1.5 bg-[#187B61] hover:bg-[#16835D] text-white px-3.5 py-2 rounded-lg text-xs font-semibold shadow-xs transition-all"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>New AI Procurement</span>
        </button>

        {/* User avatar */}
        <div className="flex items-center space-x-2 pl-2 border-l border-gray-200">
          <div className="w-8 h-8 rounded-full bg-[#187B61]/15 text-[#187B61] flex items-center justify-center font-bold text-xs border border-[#187B61]/30">
            AR
          </div>
          <div className="hidden md:block text-left text-xs leading-none">
            <span className="font-semibold text-gray-900 block">{organization.ownerName}</span>
            <span className="text-[10px] text-gray-500">Business Owner</span>
          </div>
        </div>
      </div>
    </header>
  );
};
