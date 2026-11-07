import React, { useState } from 'react';
import {
  Receipt,
  CreditCard,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
  Search,
  Filter,
  FileCheck,
} from 'lucide-react';
import { PaymentTransaction } from '../../types';

interface TransactionsViewProps {
  payments: PaymentTransaction[];
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({ payments }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTxn, setSelectedTxn] = useState<PaymentTransaction | null>(null);

  const filtered = payments.filter((p) => {
    return (
      p.transactionReference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.paypalOrderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.paypalCaptureId && p.paypalCaptureId.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-[#187B61] text-xs font-bold uppercase tracking-wider mb-1">
          <CreditCard className="w-4 h-4" />
          <span>PayPal Developer Sandbox</span>
        </div>
        <h1 className="text-xl font-black text-gray-900 tracking-tight">
          Verified Settlement Transactions
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Immutable payment records verified against PayPal Orders API v2 and incoming webhooks.
        </p>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-[#E5E7EB] flex items-center justify-between gap-3 shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by transaction reference, order ID, or capture ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#187B61] outline-hidden"
          />
        </div>

        <div className="flex items-center space-x-2 text-xs text-gray-500">
          <ShieldCheck className="w-4 h-4 text-[#187B61]" />
          <span>Server Verified Only</span>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-gray-50 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                <th className="py-3 px-4">Transaction Ref</th>
                <th className="py-3 px-4">PayPal Order ID</th>
                <th className="py-3 px-4">PayPal Capture ID</th>
                <th className="py-3 px-4">Date / Time</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-center">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-mono">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400 font-sans">
                    No verified transactions found.
                  </td>
                </tr>
              ) : (
                filtered.map((txn) => (
                  <tr key={txn.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-gray-900">
                      {txn.transactionReference}
                    </td>
                    <td className="py-3 px-4 text-gray-700">
                      {txn.paypalOrderId}
                    </td>
                    <td className="py-3 px-4 text-gray-700">
                      {txn.paypalCaptureId || (
                        <span className="text-gray-400 font-sans italic text-[11px]">Uncaptured</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-gray-500 text-[11px] font-sans">
                      {new Date(txn.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                          txn.status === 'COMPLETED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : txn.status === 'ORDER_CREATED'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        <span>{txn.status}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-bold tabular-nums text-gray-900">
                      ${(txn.amount / 100).toFixed(2)} {txn.currency}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => setSelectedTxn(txn)}
                        className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-[11px] font-sans font-semibold inline-flex items-center space-x-1"
                      >
                        <FileCheck className="w-3 h-3 text-gray-500" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Inspection Modal */}
      {selectedTxn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 border border-gray-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 mb-4">
              <div className="flex items-center space-x-2">
                <Receipt className="w-5 h-5 text-[#187B61]" />
                <h3 className="text-base font-bold text-gray-900">Procurement Audit Receipt</h3>
              </div>
              <button
                onClick={() => setSelectedTxn(null)}
                className="text-gray-400 hover:text-gray-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-gray-500 font-sans">Transaction Reference:</span>
                  <span className="font-bold text-gray-900">{selectedTxn.transactionReference}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-sans">PayPal Order ID:</span>
                  <span className="text-gray-800">{selectedTxn.paypalOrderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-sans">PayPal Capture ID:</span>
                  <span className="text-emerald-700 font-bold">{selectedTxn.paypalCaptureId || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-sans">Verification Engine:</span>
                  <span className="text-gray-800 font-sans">PayPal Orders API v2</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-sans">Settlement Status:</span>
                  <span className="text-emerald-700 font-bold font-sans">{selectedTxn.status}</span>
                </div>
              </div>

              <div className="flex justify-between text-sm font-bold pt-2 border-t border-gray-200">
                <span className="font-sans">Settled Total:</span>
                <span className="text-emerald-700">${(selectedTxn.amount / 100).toFixed(2)} {selectedTxn.currency}</span>
              </div>

              <p className="text-[11px] text-gray-500 font-sans leading-relaxed pt-2">
                Note: This record represents a verified PayPal Sandbox checkout transaction authenticated by the business owner and processed idempotently.
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-gray-200 text-right">
              <button
                onClick={() => setSelectedTxn(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold rounded-lg"
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
