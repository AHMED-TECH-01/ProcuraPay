import React, { useState } from 'react';
import {
  CheckSquare,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  UserCheck,
  ArrowRight,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { PurchaseProposal, PurchaseRequest, ApprovalRecord } from '../../types';

interface ApprovalsViewProps {
  pendingProposals: { proposal: PurchaseProposal; request?: PurchaseRequest }[];
  history: ApprovalRecord[];
  onApprove: (proposalId: string) => Promise<void>;
  onReject: (proposalId: string, reason: string) => Promise<void>;
  onOpenWorkspace: (request: PurchaseRequest) => void;
}

export const ApprovalsView: React.FC<ApprovalsViewProps> = ({
  pendingProposals,
  history,
  onApprove,
  onReject,
  onOpenWorkspace,
}) => {
  const [rejectingProposalId, setRejectingProposalId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirmReject = async () => {
    if (!rejectingProposalId || !rejectReason.trim()) return;
    try {
      setIsProcessing(true);
      await onReject(rejectingProposalId, rejectReason.trim());
      setRejectingProposalId(null);
      setRejectReason('');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-[#187B61] text-xs font-bold uppercase tracking-wider mb-1">
          <ShieldCheck className="w-4 h-4" />
          <span>Human-In-The-Loop Governance</span>
        </div>
        <h1 className="text-xl font-black text-gray-900 tracking-tight">
          Financial Approvals & Governance Queue
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Autonomous agents formulate proposals, but strict human financial authorization is required prior to payment capture.
        </p>
      </div>

      {/* Pending Approvals Section */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold text-gray-600 uppercase tracking-wider flex items-center space-x-2">
          <span>Pending Authorization Queue ({pendingProposals.length})</span>
        </h2>

        {pendingProposals.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-dashed border-gray-300 text-center text-xs text-gray-500">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="font-semibold text-gray-800">Governance Queue Is Clear</p>
            <p className="text-[11px] text-gray-400 mt-0.5">All generated purchase proposals have been decided.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingProposals.map(({ proposal, request }) => (
              <div
                key={proposal.id}
                className="bg-white rounded-xl border border-amber-200 p-6 shadow-xs space-y-4"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-bold font-mono px-2 py-0.5 rounded">
                        PENDING HUMAN APPROVAL
                      </span>
                      <span className="text-xs text-gray-400 font-mono">Proposal #{proposal.id}</span>
                    </div>
                    <h3 className="text-base font-bold text-gray-900">
                      {proposal.selectedOffer.productName}
                    </h3>
                    <p className="text-xs text-gray-500">
                      Supplier: <span className="font-semibold text-gray-800">{proposal.selectedOffer.vendor}</span> • Delivery: <span className="font-medium text-gray-700">{proposal.selectedOffer.deliveryEstimate}</span>
                    </p>
                  </div>

                  <div className="text-left md:text-right bg-gray-50 p-3 rounded-lg border border-gray-100 min-w-[160px]">
                    <span className="text-[10px] text-gray-400 uppercase font-semibold block">Total Proposal Amount</span>
                    <span className="text-xl font-bold font-mono text-[#187B61] tabular-nums">
                      ${(proposal.totalAmount / 100).toFixed(2)}
                    </span>
                    <span className="text-[11px] text-gray-500 block">
                      {proposal.quantity} Units @ ${(proposal.unitPrice / 100).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* AI Reasoning */}
                <div className="p-3 bg-[#F7F8F6] rounded-lg border border-gray-200 text-xs text-gray-700 leading-relaxed">
                  <span className="font-bold text-gray-900 block mb-1">AI Recommendation Rationale:</span>
                  {proposal.recommendationReasoning}
                </div>

                {/* Policy Validation Banner */}
                <div className="flex items-center space-x-2 bg-emerald-50 text-emerald-800 border border-emerald-200 p-2.5 rounded-lg text-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Deterministic policy verification passed. Amount conforms to organization limit ($4,500.00). Pre-approved supplier domain.
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  {request && (
                    <button
                      onClick={() => onOpenWorkspace(request)}
                      className="text-xs text-[#187B61] font-semibold hover:underline flex items-center space-x-1"
                    >
                      <span>Inspect in Agent Workspace</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <div className="flex items-center space-x-3 ml-auto">
                    <button
                      onClick={() => setRejectingProposalId(proposal.id)}
                      disabled={isProcessing}
                      className="px-4 py-2 border border-red-200 text-red-700 hover:bg-red-50 text-xs font-bold rounded-lg transition-all"
                    >
                      Reject Proposal
                    </button>
                    <button
                      onClick={() => onApprove(proposal.id)}
                      disabled={isProcessing}
                      className="inline-flex items-center space-x-1.5 px-5 py-2 bg-[#187B61] hover:bg-[#16835D] text-white text-xs font-bold rounded-lg shadow-xs transition-all"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>Approve & Authorize</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Approval History */}
      <div className="space-y-4 pt-6 border-t border-gray-200">
        <h2 className="text-xs font-bold text-gray-600 uppercase tracking-wider">
          Decision Audit History ({history.length})
        </h2>

        {history.length === 0 ? (
          <p className="text-xs text-gray-400">No decisions recorded yet.</p>
        ) : (
          <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden shadow-2xs divide-y divide-gray-100">
            {history.map((record) => (
              <div key={record.id} className="p-4 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        record.decision === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {record.decision}
                    </span>
                    <span className="font-semibold text-gray-900">
                      {record.proposalSnapshot.productName}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Decided by <span className="font-medium text-gray-700">{record.decidedBy}</span> on{' '}
                    {new Date(record.decidedAt).toLocaleString()}
                  </p>
                  {record.rejectionReason && (
                    <p className="text-[11px] text-red-700 font-medium">
                      Reason: "{record.rejectionReason}"
                    </p>
                  )}
                </div>

                <div className="text-right font-mono">
                  <span className="font-bold text-gray-900 block tabular-nums">
                    ${(record.proposalSnapshot.amount / 100).toFixed(2)}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    Vendor: {record.proposalSnapshot.vendor}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rejection Reason Modal */}
      {rejectingProposalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-gray-200">
            <h3 className="text-base font-bold text-gray-900 mb-1">Mandatory Rejection Audit</h3>
            <p className="text-xs text-gray-500 mb-3">
              Explain why this proposal is rejected. This reason is committed to the immutable organization audit log.
            </p>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Budget re-assigned; alternate vendor preferred; requirements changed."
              className="w-full text-xs p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-hidden mb-4"
              required
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setRejectingProposalId(null)}
                className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                disabled={!rejectReason.trim() || isProcessing}
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
