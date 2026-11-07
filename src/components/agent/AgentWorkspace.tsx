import React, { useState } from 'react';
import {
  PurchaseRequest,
  PurchaseProposal,
  AgentRun,
} from '../../types';
import { ProductComparisonTable } from '../comparison/ProductComparisonTable';
import {
  Sparkles,
  Bot,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  RefreshCw,
  Info,
  DollarSign,
  Package,
  Layers,
  FileText,
  UserCheck,
  Award,
} from 'lucide-react';

interface AgentWorkspaceProps {
  request: PurchaseRequest;
  proposal?: PurchaseProposal;
  agentRun?: AgentRun;
  onRunAgent: (requestId: string) => Promise<void>;
  onApproveProposal: (proposalId: string) => Promise<void>;
  onRejectProposal: (proposalId: string, reason: string) => Promise<void>;
  onOpenCheckout: (proposal: PurchaseProposal) => void;
  isLoading?: boolean;
}

export const AgentWorkspace: React.FC<AgentWorkspaceProps> = ({
  request,
  proposal,
  agentRun,
  onRunAgent,
  onApproveProposal,
  onRejectProposal,
  onOpenCheckout,
  isLoading = false,
}) => {
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [isProcessingApproval, setIsProcessingApproval] = useState(false);

  const handleApprove = async () => {
    if (!proposal) return;
    try {
      setIsProcessingApproval(true);
      await onApproveProposal(proposal.id);
    } finally {
      setIsProcessingApproval(false);
    }
  };

  const handleReject = async () => {
    if (!proposal || !rejectReason.trim()) return;
    try {
      setIsProcessingApproval(true);
      await onRejectProposal(proposal.id, rejectReason.trim());
      setShowRejectModal(false);
      setRejectReason('');
    } finally {
      setIsProcessingApproval(false);
    }
  };

  const allOffers = proposal
    ? [proposal.selectedOffer, ...(proposal.alternativeOffers || [])]
    : [];

  return (
    <div className="flex flex-col h-full bg-[#F7F8F6]">
      {/* Workspace Top Banner */}
      <div className="bg-white border-b border-[#E5E7EB] px-6 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-[#187B61] text-white flex items-center justify-center shadow-xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-bold text-gray-900">{request.title}</h1>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide font-mono ${
                  request.status === 'COMPLETED'
                    ? 'bg-emerald-100 text-emerald-800'
                    : request.status === 'CHECKOUT_READY'
                    ? 'bg-blue-100 text-blue-800'
                    : request.status === 'PENDING_APPROVAL'
                    ? 'bg-amber-100 text-amber-800'
                    : request.status === 'RESEARCHING'
                    ? 'bg-purple-100 text-purple-800 animate-pulse'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {request.status}
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Ref: <span className="font-mono">{request.id}</span> • Created {new Date(request.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => onRunAgent(request.id)}
            disabled={isLoading || request.status === 'RESEARCHING'}
            className="inline-flex items-center space-x-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading || request.status === 'RESEARCHING' ? 'animate-spin' : ''}`} />
            <span>{agentRun ? 'Re-Run Agent' : 'Execute Research Agent'}</span>
          </button>
        </div>
      </div>

      {/* 3-Panel Main Workspace */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden">
        {/* ======================================================== */}
        {/* LEFT PANEL: Request Details & Policy Guardrails (Col 3)  */}
        {/* ======================================================== */}
        <div className="lg:col-span-3 border-r border-[#E5E7EB] bg-white flex flex-col h-full overflow-y-auto p-4 space-y-4">
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
              <FileText className="w-3.5 h-3.5 text-gray-400" />
              <span>Purchasing Intent</span>
            </h3>
            <div className="bg-[#F7F8F6] p-3 rounded-lg border border-gray-200 text-xs text-gray-800 leading-relaxed font-normal">
              "{request.rawPrompt}"
            </div>
          </div>

          {/* Structured Parameters */}
          <div className="space-y-2 text-xs">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center space-x-1.5">
              <Layers className="w-3.5 h-3.5 text-gray-400" />
              <span>Extracted Requirements</span>
            </h3>

            <div className="flex justify-between py-1.5 border-b border-gray-100">
              <span className="text-gray-500">Target Quantity:</span>
              <span className="font-bold text-gray-900">{request.quantity} Units</span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-gray-100">
              <span className="text-gray-500">Maximum Budget:</span>
              <span className="font-mono font-bold text-gray-900 tabular-nums">
                ${(request.maxBudget / 100).toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-gray-100">
              <span className="text-gray-500">Category:</span>
              <span className="font-medium text-gray-900">{request.category}</span>
            </div>
          </div>

          {/* Mandatory Specs (Hard Filters) */}
          <div>
            <h4 className="text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Mandatory Filters</span>
              <span className="text-[10px] text-red-600 font-semibold">Strict Hard Filter</span>
            </h4>
            <div className="space-y-1">
              {request.mandatorySpecs.map((spec, i) => (
                <div
                  key={i}
                  className="flex items-center space-x-1.5 bg-gray-50 border border-gray-200 px-2.5 py-1.5 rounded-md text-xs text-gray-800 font-medium"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#187B61] shrink-0" />
                  <span className="truncate">{spec}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Preferences */}
          {request.preferences.length > 0 && (
            <div>
              <h4 className="text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                Preferences (Scored)
              </h4>
              <div className="space-y-1">
                {request.preferences.map((pref, i) => (
                  <div
                    key={i}
                    className="flex items-center space-x-1.5 bg-emerald-50/50 border border-emerald-100 px-2.5 py-1 rounded-md text-xs text-emerald-900"
                  >
                    <Info className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span className="truncate">{pref}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Policy Compliance Certificate */}
          {proposal?.policyValidation && (
            <div className="mt-auto bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs">
              <div className="flex items-center space-x-2 text-emerald-900 font-bold mb-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Deterministic Policy Check</span>
              </div>
              <p className="text-[11px] text-emerald-800 leading-tight">
                Backend validated compliance with spending policies. Zero autonomous payment bypass.
              </p>
              <div className="mt-2 text-[10px] text-emerald-700 font-mono">
                Verified: {new Date(proposal.policyValidation.checkedAt).toLocaleTimeString()}
              </div>
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* CENTER PANEL: Live Agent Execution Timeline (Col 4)      */}
        {/* ======================================================== */}
        <div className="lg:col-span-4 border-r border-[#E5E7EB] bg-[#F7F8F6] flex flex-col h-full overflow-y-auto p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center space-x-1.5">
              <Bot className="w-4 h-4 text-[#187B61]" />
              <span>Autonomous Agent Telemetry</span>
            </h3>
            {agentRun && (
              <span className="text-[10px] text-gray-500 font-mono">
                Run ID: {agentRun.id}
              </span>
            )}
          </div>

          {!agentRun && (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-gray-500">
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mb-3">
                <Bot className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-xs font-medium text-gray-700 mb-1">Agent Has Not Executed</p>
              <p className="text-xs text-gray-500 mb-4">
                Click below to start research, offer comparison, and proposal synthesis.
              </p>
              <button
                onClick={() => onRunAgent(request.id)}
                disabled={isLoading}
                className="px-4 py-2 bg-[#187B61] text-white text-xs font-semibold rounded-lg shadow-xs hover:bg-[#16835D]"
              >
                Launch AI Procurement Agent
              </button>
            </div>
          )}

          {agentRun && (
            <div className="space-y-3">
              {agentRun.steps.map((step, idx) => {
                const isCompleted = step.status === 'COMPLETED';
                const isRunning = step.status === 'RUNNING';
                const isFailed = step.status === 'FAILED';

                return (
                  <div
                    key={step.id}
                    className={`bg-white rounded-lg border p-3 shadow-2xs transition-all ${
                      isRunning
                        ? 'border-[#187B61] ring-1 ring-[#187B61]'
                        : isCompleted
                        ? 'border-gray-200'
                        : 'border-red-200 bg-red-50/20'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-700">
                          {idx + 1}
                        </span>
                        <div>
                          <h4 className="text-xs font-bold text-gray-900 leading-tight">
                            {step.stepName}
                          </h4>
                          {step.toolCalled && (
                            <span className="text-[10px] font-mono text-[#187B61] font-medium block">
                              Tool: {step.toolCalled}()
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-1.5">
                        {step.durationMs !== undefined && (
                          <span className="text-[10px] font-mono text-gray-400">
                            {step.durationMs}ms
                          </span>
                        )}
                        {isRunning && (
                          <span className="w-2.5 h-2.5 border-2 border-[#187B61] border-t-transparent rounded-full animate-spin" />
                        )}
                        {isCompleted && (
                          <CheckCircle2 className="w-4 h-4 text-[#16835D]" />
                        )}
                        {isFailed && (
                          <AlertTriangle className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                    </div>

                    {step.inputSummary && (
                      <div className="mt-2 text-[11px] text-gray-600 bg-gray-50 p-2 rounded border border-gray-100">
                        <span className="text-gray-400 font-semibold block text-[9px] uppercase">Input</span>
                        {step.inputSummary}
                      </div>
                    )}

                    {step.outputSummary && (
                      <div className="mt-1.5 text-[11px] text-gray-800 bg-emerald-50/50 p-2 rounded border border-emerald-100/60 leading-normal">
                        <span className="text-emerald-700 font-semibold block text-[9px] uppercase">Output Telemetry</span>
                        {step.outputSummary}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* RIGHT PANEL: Recommendation & Comparison Grid (Col 5)   */}
        {/* ======================================================== */}
        <div className="lg:col-span-5 bg-white flex flex-col h-full overflow-y-auto p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center space-x-1.5">
              <Award className="w-4 h-4 text-[#187B61]" />
              <span>Recommended Hardware & Pricing</span>
            </h3>
            {proposal && (
              <span className="text-[11px] text-[#187B61] font-semibold">
                Saved ${(proposal.savingsCalculated / 100).toFixed(2)}
              </span>
            )}
          </div>

          {!proposal && (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-gray-400">
              <Package className="w-8 h-8 text-gray-300 mb-2" />
              <p className="text-xs">Awaiting agent proposal generation...</p>
            </div>
          )}

          {proposal && (
            <>
              {/* Selected Top Recommendation Card */}
              <div className="border border-emerald-300 rounded-xl bg-gradient-to-br from-emerald-50/40 via-white to-white p-4 shadow-2xs">
                <div className="flex items-start space-x-3">
                  <img
                    src={proposal.selectedOffer.imageUrl}
                    alt={proposal.selectedOffer.productName}
                    className="w-16 h-16 object-cover rounded-lg border border-gray-200 shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=200&q=80';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="bg-[#187B61] text-white text-[10px] font-bold px-2 py-0.5 rounded">
                        TOP RECOMMENDATION
                      </span>
                      <span className="text-xs font-mono font-bold text-emerald-800">
                        Score: {proposal.selectedOffer.scores.totalScore}/100
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-gray-900 mt-1 line-clamp-2">
                      {proposal.selectedOffer.productName}
                    </h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Supplier: <span className="font-semibold text-gray-800">{proposal.selectedOffer.vendor}</span> • Delivery: <span className="font-medium text-gray-800">{proposal.selectedOffer.deliveryEstimate}</span>
                    </p>
                  </div>
                </div>

                {/* AI Reasoning */}
                <div className="mt-3 p-2.5 bg-gray-50 rounded-lg border border-gray-200 text-xs text-gray-700 leading-relaxed">
                  <span className="font-semibold text-gray-900 block mb-0.5">AI Recommendation Analysis:</span>
                  {proposal.recommendationReasoning}
                </div>

                {/* Cost Breakdown */}
                <div className="mt-3 pt-3 border-t border-gray-200 space-y-1 text-xs">
                  <div className="flex justify-between text-gray-600">
                    <span>Item Subtotal ({proposal.quantity}x @ ${(proposal.unitPrice / 100).toFixed(2)}):</span>
                    <span className="font-mono tabular-nums font-medium text-gray-900">
                      ${(proposal.subtotal / 100).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Estimated Sales Tax (8.25%):</span>
                    <span className="font-mono tabular-nums text-gray-800">
                      ${(proposal.estimatedTax / 100).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Priority Delivery & Logistics:</span>
                    <span className="font-mono tabular-nums text-gray-800">
                      {proposal.estimatedShipping === 0 ? 'FREE' : `$${(proposal.estimatedShipping / 100).toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-gray-900 pt-1 border-t border-gray-200">
                    <span>Total Procurement Amount:</span>
                    <span className="font-mono tabular-nums text-[#187B61] text-base">
                      ${(proposal.totalAmount / 100).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Multi-Supplier Comparison Table */}
              <div>
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  All Evaluated Supplier Offers
                </h4>
                <ProductComparisonTable
                  offers={allOffers}
                  quantity={proposal.quantity}
                  selectedOfferId={proposal.selectedOffer.id}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* BOTTOM ACTION BAR: Human-In-The-Loop Approval & Checkout */}
      {/* ======================================================== */}
      {proposal && (
        <div className="bg-white border-t border-[#E5E7EB] px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 shrink-0 shadow-lg">
          {/* Left: Summary Amount & Proposal Status */}
          <div className="flex items-center space-x-4">
            <div>
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
                Total Authorized Amount
              </span>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-xl font-bold font-mono tabular-nums text-gray-900">
                  ${(proposal.totalAmount / 100).toFixed(2)}
                </span>
                <span className="text-xs font-mono text-gray-500">{proposal.currency}</span>
              </div>
            </div>

            <div className="h-8 w-px bg-gray-200 hidden sm:block" />

            <div className="text-xs hidden md:block">
              <span className="text-gray-500 block">Governance State</span>
              <span className="font-semibold text-gray-800">
                {proposal.status === 'PENDING_APPROVAL' && 'Awaiting Business Owner Approval'}
                {proposal.status === 'APPROVED' && 'Approved — Ready for PayPal Sandbox Checkout'}
                {proposal.status === 'REJECTED' && 'Rejected by Business Owner'}
              </span>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center space-x-3">
            {proposal.status === 'PENDING_APPROVAL' && (
              <>
                <button
                  onClick={() => setShowRejectModal(true)}
                  disabled={isProcessingApproval}
                  className="px-4 py-2 border border-red-200 text-red-700 hover:bg-red-50 text-xs font-semibold rounded-lg transition-all"
                >
                  Reject Proposal
                </button>
                <button
                  onClick={handleApprove}
                  disabled={isProcessingApproval}
                  className="inline-flex items-center space-x-2 px-5 py-2.5 bg-[#187B61] hover:bg-[#16835D] text-white text-xs font-bold rounded-lg shadow-xs transition-all"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Authorize & Approve Proposal</span>
                </button>
              </>
            )}

            {proposal.status === 'APPROVED' && request.status !== 'COMPLETED' && (
              <button
                onClick={() => onOpenCheckout(proposal)}
                className="inline-flex items-center space-x-2 px-6 py-2.5 bg-[#0070BA] hover:bg-[#003087] text-white text-xs font-bold rounded-lg shadow-sm transition-all"
              >
                <CreditCard className="w-4 h-4" />
                <span>Launch PayPal Sandbox Checkout</span>
              </button>
            )}

            {request.status === 'COMPLETED' && (
              <div className="inline-flex items-center space-x-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 px-4 py-2 rounded-lg text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Payment Captured & Reconciled via PayPal</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reject Modal with Mandatory Reason */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-gray-200">
            <h3 className="text-base font-bold text-gray-900 mb-1">Reject Purchase Proposal</h3>
            <p className="text-xs text-gray-500 mb-3">
              Per compliance requirements, a mandatory rejection reason is required for the immutable audit trail.
            </p>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Budget re-allocated, alternative supplier preferred, or spec discrepancy."
              className="w-full text-xs p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-hidden mb-4"
              required
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim()}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-md disabled:opacity-50"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
