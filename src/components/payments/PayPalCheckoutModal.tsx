import React, { useState, useEffect } from 'react';
import {
  X,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Lock,
} from 'lucide-react';
import { PurchaseProposal, PaymentTransaction } from '../../types';
import { api } from '../../client/api';

interface PayPalCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposal: PurchaseProposal;
  onPaymentSuccess: (transaction: PaymentTransaction) => void;
}

export const PayPalCheckoutModal: React.FC<PayPalCheckoutModalProps> = ({
  isOpen,
  onClose,
  proposal,
  onPaymentSuccess,
}) => {
  const [isInitializing, setIsInitializing] = useState(true);
  const [isCapturing, setIsCapturing] = useState(false);
  const [paypalOrderId, setPaypalOrderId] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [approvalUrl, setApprovalUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [capturedTransaction, setCapturedTransaction] = useState<PaymentTransaction | null>(null);

  useEffect(() => {
    if (!isOpen || !proposal) return;

    let isMounted = true;
    setIsInitializing(true);
    setError(null);
    setCapturedTransaction(null);

    // Call server to create idempotent PayPal order
    api
      .createPayPalOrder(proposal.id)
      .then((res) => {
        if (!isMounted) return;
        setPaypalOrderId(res.paypalOrderId);
        setTransactionId(res.transaction.id);
        if (res.approvalUrl) setApprovalUrl(res.approvalUrl);
        setIsInitializing(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.message || 'Failed to initialize PayPal order');
        setIsInitializing(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, proposal]);

  if (!isOpen) return null;

  const handleCapture = async () => {
    if (!transactionId || !paypalOrderId) return;
    try {
      setIsCapturing(true);
      setError(null);
      const res = await api.capturePayPalOrder(transactionId, paypalOrderId);
      setCapturedTransaction(res.transaction);
      onPaymentSuccess(res.transaction);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Server-side capture failed');
    } finally {
      setIsCapturing(false);
    }
  };

  const amountFormatted = `$${(proposal.totalAmount / 100).toFixed(2)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-[#003087] text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-white text-[#003087] flex items-center justify-center font-black">
              P
            </div>
            <div>
              <h3 className="text-base font-bold leading-none">PayPal Checkout Sandbox</h3>
              <p className="text-[11px] text-blue-200 mt-1">Authorized B2B Procurement Settlement</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-blue-200 hover:text-white p-1 rounded-md hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-xs text-red-800">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Success State */}
          {capturedTransaction && (
            <div className="text-center py-4 space-y-3">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-base font-bold text-gray-900">Payment Captured & Verified</h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  Server verified capture state with PayPal Orders API v2
                </p>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-xs text-left space-y-1.5 font-mono">
                <div className="flex justify-between">
                  <span className="text-gray-500">Transaction Ref:</span>
                  <span className="font-bold text-gray-800">{capturedTransaction.transactionReference}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">PayPal Order ID:</span>
                  <span className="text-gray-800">{capturedTransaction.paypalOrderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">PayPal Capture ID:</span>
                  <span className="text-emerald-700 font-bold">{capturedTransaction.paypalCaptureId}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-1 text-sm">
                  <span className="text-gray-700 font-sans font-semibold">Total Paid:</span>
                  <span className="font-bold text-gray-900">{amountFormatted} USD</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-2.5 bg-[#187B61] text-white text-xs font-bold rounded-lg hover:bg-[#16835D]"
              >
                Done & Return to Workspace
              </button>
            </div>
          )}

          {/* Checkout In-Progress State */}
          {!capturedTransaction && (
            <>
              {/* Order Itemization */}
              <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-200 space-y-2 text-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="font-bold text-gray-900">{proposal.selectedOffer.productName}</h5>
                    <p className="text-[11px] text-gray-500">Supplier: {proposal.selectedOffer.vendor}</p>
                  </div>
                  <span className="font-mono font-bold text-sm text-gray-900">{amountFormatted}</span>
                </div>
                <div className="text-[11px] text-gray-500 flex items-center justify-between pt-2 border-t border-gray-200">
                  <span>Quantity: {proposal.quantity} Units</span>
                  <span className="font-mono">Status: {proposal.status}</span>
                </div>
              </div>

              {/* PayPal Order Metadata */}
              <div className="text-xs space-y-1 bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                <div className="flex justify-between font-mono text-[11px]">
                  <span className="text-blue-900">PayPal Order ID:</span>
                  <span className="font-bold text-blue-950">
                    {isInitializing ? 'Generating...' : paypalOrderId}
                  </span>
                </div>
                <div className="flex justify-between font-mono text-[11px]">
                  <span className="text-blue-900">Environment:</span>
                  <span className="font-bold text-blue-950">Sandbox Developer Tier</span>
                </div>
              </div>

              {/* Security & Human-In-The-Loop Disclaimer */}
              <div className="flex items-start space-x-2 text-[11px] text-gray-500 bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                <ShieldCheck className="w-4 h-4 text-[#187B61] shrink-0 mt-0.5" />
                <span>
                  Client credentials never reach the browser. Payment intent and amounts are strictly verified server-side against immutable proposal snapshots.
                </span>
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-2">
                {approvalUrl && (
                  <a
                    href={approvalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 bg-[#FFC439] hover:bg-[#F4BB38] text-[#111827] rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition-all shadow-xs"
                  >
                    <span>Authenticate in PayPal Sandbox Portal</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}

                {/* Direct Server-Side Capture Trigger */}
                <button
                  onClick={handleCapture}
                  disabled={isInitializing || isCapturing}
                  className="w-full py-3 bg-[#0070BA] hover:bg-[#003087] text-white rounded-lg text-xs font-bold flex items-center justify-center space-x-2 transition-all shadow-sm disabled:opacity-50"
                >
                  {isCapturing ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Verifying & Capturing PayPal Order...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>Authorize & Capture {amountFormatted} via PayPal</span>
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
