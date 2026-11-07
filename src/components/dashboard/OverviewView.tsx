import React from 'react';
import {
  DollarSign,
  Clock,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  Bot,
  PlusCircle,
  Receipt,
  ShieldCheck,
} from 'lucide-react';
import { PurchaseRequest, PaymentTransaction } from '../../types';

interface OverviewViewProps {
  analytics: any;
  requests: PurchaseRequest[];
  payments: PaymentTransaction[];
  onOpenNewRequest: () => void;
  onSelectRequest: (request: PurchaseRequest) => void;
  onNavigateTab: (tab: any) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  analytics,
  requests,
  payments,
  onOpenNewRequest,
  onSelectRequest,
  onNavigateTab,
}) => {
  const pendingApprovalsCount = analytics?.pendingApprovalsCount ?? 0;
  const totalSpending = analytics?.totalSpendingFormatted ?? '$0.00';
  const activeRequestsCount = analytics?.activeRequestsCount ?? 0;
  const completedPurchasesCount = analytics?.completedPurchasesCount ?? 0;
  const budgetUtilization = analytics?.budgetUtilizationPercent ?? 0;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs">
        <div>
          <div className="flex items-center space-x-2 text-[#187B61] text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Autonomous Procurement Engine Active</span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Autonomous Procurement. Human-Controlled Payments.
          </h1>
          <p className="text-xs text-gray-500 mt-1 max-w-2xl leading-relaxed">
            Natural-language B2B requests researched, compared against verified hardware suppliers, and validated against spending policies. Human authorization required prior to PayPal settlement.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={onOpenNewRequest}
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-[#187B61] hover:bg-[#16835D] text-white text-xs font-bold rounded-xl shadow-xs transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Purchase Request</span>
          </button>
        </div>
      </div>

      {/* Pending Approvals Callout (if any) */}
      {pendingApprovalsCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-900">
                {pendingApprovalsCount} Purchase {pendingApprovalsCount === 1 ? 'Proposal' : 'Proposals'} Awaiting Your Authorization
              </h4>
              <p className="text-xs text-amber-700">
                The AI Agent completed research and proposal generation. Your approval is required before PayPal checkout.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('approvals')}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow-2xs flex items-center space-x-1"
          >
            <span>Review Approvals</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Spend */}
        <div className="bg-white p-5 rounded-xl border border-[#E5E7EB] shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Procurement Spend
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-[#187B61] flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-gray-900">
            {totalSpending}
          </div>
          <div className="mt-2 flex items-center space-x-1 text-[11px] text-gray-500">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#187B61]" />
            <span>Verified via PayPal Sandbox</span>
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="bg-white p-5 rounded-xl border border-[#E5E7EB] shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Pending Approvals
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-gray-900">
            {pendingApprovalsCount}
          </div>
          <div className="mt-2 text-[11px] text-gray-500">
            Human-in-the-loop control
          </div>
        </div>

        {/* Active Requests */}
        <div className="bg-white p-5 rounded-xl border border-[#E5E7EB] shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Active Requests
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-gray-900">
            {activeRequestsCount}
          </div>
          <div className="mt-2 text-[11px] text-gray-500">
            Under AI research & review
          </div>
        </div>

        {/* Budget Utilization */}
        <div className="bg-white p-5 rounded-xl border border-[#E5E7EB] shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Policy Utilization
            </span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-gray-900">
            {budgetUtilization}%
          </div>
          <div className="mt-2 w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#187B61] h-full rounded-full"
              style={{ width: `${Math.min(100, budgetUtilization)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Two Column Layout: Recent Requests & Recent Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Procurement Requests */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-2xs overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900">Recent Procurement Requests</h3>
            <button
              onClick={() => onNavigateTab('procurement')}
              className="text-xs text-[#187B61] hover:underline font-semibold"
            >
              View all ({requests.length})
            </button>
          </div>
          <div className="divide-y divide-gray-100">
            {requests.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-xs">
                No procurement requests yet. Launch your first one above!
              </div>
            ) : (
              requests.slice(0, 4).map((req) => (
                <div
                  key={req.id}
                  onClick={() => onSelectRequest(req)}
                  className="p-4 hover:bg-gray-50/80 cursor-pointer transition-colors flex items-center justify-between"
                >
                  <div className="min-w-0 pr-3">
                    <h4 className="text-xs font-bold text-gray-900 truncate">{req.title}</h4>
                    <p className="text-[11px] text-gray-500 truncate mt-0.5 font-normal">
                      "{req.rawPrompt}"
                    </p>
                    <div className="flex items-center space-x-2 mt-1.5 text-[10px] text-gray-400 font-mono">
                      <span>{req.quantity} units</span>
                      <span>•</span>
                      <span>Budget: ${(req.maxBudget / 100).toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 shrink-0">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        req.status === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : req.status === 'PENDING_APPROVAL'
                          ? 'bg-amber-100 text-amber-800'
                          : req.status === 'CHECKOUT_READY'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {req.status}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Verified PayPal Transactions */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-2xs overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900">Verified PayPal Transactions</h3>
            <button
              onClick={() => onNavigateTab('transactions')}
              className="text-xs text-[#187B61] hover:underline font-semibold"
            >
              View all ({payments.length})
            </button>
          </div>
          <div className="divide-y divide-gray-100">
            {payments.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-xs">
                No PayPal transactions recorded yet.
              </div>
            ) : (
              payments.slice(0, 4).map((txn) => (
                <div key={txn.id} className="p-4 flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-gray-900">
                        {txn.transactionReference}
                      </span>
                      <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded text-[10px] font-mono font-semibold">
                        {txn.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-500 font-mono mt-1">
                      Order: {txn.paypalOrderId} • Capture: {txn.paypalCaptureId || 'Pending'}
                    </div>
                    <span className="text-[10px] text-gray-400">
                      {new Date(txn.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-sm tabular-nums text-gray-900 block">
                      ${(txn.amount / 100).toFixed(2)}
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">
                      {txn.currency}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
