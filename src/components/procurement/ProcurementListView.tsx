import React, { useState } from 'react';
import {
  Search,
  PlusCircle,
  Filter,
  ArrowRight,
  Bot,
  Calendar,
  Layers,
  DollarSign,
} from 'lucide-react';
import { PurchaseRequest } from '../../types';

interface ProcurementListViewProps {
  requests: PurchaseRequest[];
  onSelectRequest: (request: PurchaseRequest) => void;
  onOpenNewRequest: () => void;
}

export const ProcurementListView: React.FC<ProcurementListViewProps> = ({
  requests,
  onSelectRequest,
  onOpenNewRequest,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredRequests = requests.filter((r) => {
    const matchSearch =
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.rawPrompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus = statusFilter === 'ALL' || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-gray-900 tracking-tight">
            Procurement Purchase Requests
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage natural-language purchasing requests, review research progress, and audit outcomes.
          </p>
        </div>
        <button
          onClick={onOpenNewRequest}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-[#187B61] hover:bg-[#16835D] text-white text-xs font-bold rounded-xl shadow-xs transition-all shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Purchase Request</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-[#E5E7EB] flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by keywords, specs, category, or title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#187B61] outline-hidden"
          />
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <Filter className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-gray-500 font-medium">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-2.5 py-1 text-xs text-gray-700 bg-white focus:ring-2 focus:ring-[#187B61] outline-hidden"
          >
            <option value="ALL">All Statuses ({requests.length})</option>
            <option value="PENDING_APPROVAL">Pending Approval</option>
            <option value="CHECKOUT_READY">Checkout Ready</option>
            <option value="COMPLETED">Completed</option>
            <option value="RESEARCHING">Researching</option>
            <option value="DRAFT">Draft</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-3">
        {filteredRequests.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-xl border border-dashed border-gray-300">
            <Bot className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-gray-700">No Procurement Requests Found</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              No requests matched your search criteria. Try clearing your filters or create a new request.
            </p>
          </div>
        ) : (
          filteredRequests.map((req) => (
            <div
              key={req.id}
              onClick={() => onSelectRequest(req)}
              className="bg-white p-5 rounded-xl border border-[#E5E7EB] hover:border-[#187B61] cursor-pointer transition-all shadow-2xs hover:shadow-xs group"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        req.status === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : req.status === 'PENDING_APPROVAL'
                          ? 'bg-amber-100 text-amber-800'
                          : req.status === 'CHECKOUT_READY'
                          ? 'bg-blue-100 text-blue-800'
                          : req.status === 'RESEARCHING'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {req.status}
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">#{req.id}</span>
                    <span className="text-gray-300">•</span>
                    <span className="text-[11px] text-gray-500 font-medium">{req.category}</span>
                  </div>

                  <h3 className="text-sm font-bold text-gray-900 group-hover:text-[#187B61] transition-colors">
                    {req.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                    "{req.rawPrompt}"
                  </p>

                  {/* Badges / Specs */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-3">
                    {req.mandatorySpecs.map((spec, i) => (
                      <span
                        key={i}
                        className="bg-gray-100 text-gray-700 text-[10px] font-medium px-2 py-0.5 rounded border border-gray-200"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right Metadata & Action */}
                <div className="flex items-center justify-between md:flex-col md:items-end md:justify-center border-t md:border-t-0 pt-3 md:pt-0 border-gray-100">
                  <div className="text-left md:text-right">
                    <span className="text-[10px] text-gray-400 uppercase font-semibold block">Budget Ceiling</span>
                    <span className="text-base font-bold font-mono text-gray-900 tabular-nums">
                      ${(req.maxBudget / 100).toFixed(2)}
                    </span>
                    <span className="text-[11px] text-gray-500 block">
                      {req.quantity} {req.quantity === 1 ? 'unit' : 'units'}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1 text-xs text-[#187B61] font-semibold mt-2 group-hover:translate-x-1 transition-transform">
                    <span>Open Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
