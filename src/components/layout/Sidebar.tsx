import React from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  PlusCircle,
  Bot,
  Search,
  CheckSquare,
  Receipt,
  BarChart3,
  ShieldCheck,
  Settings,
  ScrollText,
} from 'lucide-react';

import { ProcuraLogo } from '../branding/ProcuraLogo';

export type NavTab =
  | 'overview'
  | 'procurement'
  | 'new-request'
  | 'agent-activity'
  | 'product-research'
  | 'approvals'
  | 'transactions'
  | 'analytics'
  | 'policies'
  | 'audit-logs'
  | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  pendingApprovalsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  pendingApprovalsCount,
}) => {
  return (
    <aside className="w-64 bg-white border-r border-[#E5E7EB] flex flex-col h-screen shrink-0 select-none">
      {/* Brand Header */}
      <div className="h-16 px-6 border-b border-[#E5E7EB] flex items-center justify-between">
        <ProcuraLogo size="sm" />
      </div>

      {/* Nav Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {/* WORKSPACE */}
        <div>
          <div className="px-3 mb-1.5 text-[11px] font-semibold tracking-wider text-[#64748B] uppercase">
            Workspace
          </div>
          <div className="space-y-0.5">
            <NavItem
              icon={<LayoutDashboard className="w-4 h-4" />}
              label="Overview"
              active={currentTab === 'overview'}
              onClick={() => onSelectTab('overview')}
            />
            <NavItem
              icon={<ShoppingCart className="w-4 h-4" />}
              label="Procurement"
              active={currentTab === 'procurement'}
              onClick={() => onSelectTab('procurement')}
            />
            <NavItem
              icon={<PlusCircle className="w-4 h-4 text-[#187B61]" />}
              label="New Purchase Request"
              active={currentTab === 'new-request'}
              onClick={() => onSelectTab('new-request')}
              highlight
            />
          </div>
        </div>

        {/* AI INTELLIGENCE */}
        <div>
          <div className="px-3 mb-1.5 text-[11px] font-semibold tracking-wider text-[#64748B] uppercase">
            AI Intelligence
          </div>
          <div className="space-y-0.5">
            <NavItem
              icon={<Bot className="w-4 h-4" />}
              label="Agent Workspace"
              active={currentTab === 'agent-activity'}
              onClick={() => onSelectTab('agent-activity')}
            />
            <NavItem
              icon={<Search className="w-4 h-4" />}
              label="Product Catalog"
              active={currentTab === 'product-research'}
              onClick={() => onSelectTab('product-research')}
            />
          </div>
        </div>

        {/* FINANCE */}
        <div>
          <div className="px-3 mb-1.5 text-[11px] font-semibold tracking-wider text-[#64748B] uppercase">
            Finance & Approvals
          </div>
          <div className="space-y-0.5">
            <NavItem
              icon={<CheckSquare className="w-4 h-4" />}
              label="Human Approvals"
              badge={pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined}
              active={currentTab === 'approvals'}
              onClick={() => onSelectTab('approvals')}
            />
            <NavItem
              icon={<Receipt className="w-4 h-4" />}
              label="PayPal Transactions"
              active={currentTab === 'transactions'}
              onClick={() => onSelectTab('transactions')}
            />
            <NavItem
              icon={<BarChart3 className="w-4 h-4" />}
              label="Spend Analytics"
              active={currentTab === 'analytics'}
              onClick={() => onSelectTab('analytics')}
            />
          </div>
        </div>

        {/* GOVERNANCE & AUDIT */}
        <div>
          <div className="px-3 mb-1.5 text-[11px] font-semibold tracking-wider text-[#64748B] uppercase">
            Configuration
          </div>
          <div className="space-y-0.5">
            <NavItem
              icon={<ShieldCheck className="w-4 h-4" />}
              label="Spending Policies"
              active={currentTab === 'policies'}
              onClick={() => onSelectTab('policies')}
            />
            <NavItem
              icon={<ScrollText className="w-4 h-4" />}
              label="Audit Logs"
              active={currentTab === 'audit-logs'}
              onClick={() => onSelectTab('audit-logs')}
            />
            <NavItem
              icon={<Settings className="w-4 h-4" />}
              label="Settings & Sandbox"
              active={currentTab === 'settings'}
              onClick={() => onSelectTab('settings')}
            />
          </div>
        </div>
      </div>

      {/* Footer / System Status */}
      <div className="p-3 border-t border-[#E5E7EB] bg-[#F7F8F6]">
        <div className="bg-white rounded-lg p-2.5 border border-[#E5E7EB] text-xs">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="font-medium text-[11px] text-gray-700">Governance Engine</span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
          <p className="text-[11px] text-gray-500 leading-tight">
            Deterministic Policies Active. Zero Autonomous Payment Capture.
          </p>
        </div>
      </div>
    </aside>
  );
};

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  badge?: number;
  highlight?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({
  icon,
  label,
  active,
  onClick,
  badge,
  highlight,
}) => {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${
        active
          ? 'bg-[#187B61]/10 text-[#187B61] font-semibold'
          : highlight
          ? 'text-[#187B61] hover:bg-[#187B61]/5'
          : 'text-[#475569] hover:bg-gray-100 hover:text-[#111827]'
      }`}
    >
      <div className="flex items-center space-x-2.5 min-w-0">
        <span className={active ? 'text-[#187B61]' : 'text-gray-500'}>{icon}</span>
        <span className="truncate">{label}</span>
      </div>
      {badge !== undefined && (
        <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-semibold bg-[#D69E36]/20 text-[#B87A18]">
          {badge}
        </span>
      )}
    </button>
  );
};
