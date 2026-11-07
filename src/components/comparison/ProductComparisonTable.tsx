import React, { useState } from 'react';
import { ProductOffer } from '../../types';
import {
  CheckCircle2,
  XCircle,
  ExternalLink,
  Award,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
} from 'lucide-react';

interface ProductComparisonTableProps {
  offers: ProductOffer[];
  quantity: number;
  selectedOfferId?: string;
  onSelectOffer?: (offer: ProductOffer) => void;
}

export const ProductComparisonTable: React.FC<ProductComparisonTableProps> = ({
  offers,
  quantity,
  selectedOfferId,
  onSelectOffer,
}) => {
  const [filterEligibleOnly, setFilterEligibleOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'score' | 'price' | 'delivery'>('score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [expandedOfferId, setExpandedOfferId] = useState<string | null>(null);

  const displayedOffers = offers
    .filter(o => (filterEligibleOnly ? o.isEligible : true))
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'score') {
        comparison = a.scores.totalScore - b.scores.totalScore;
      } else if (sortBy === 'price') {
        comparison = a.unitPrice - b.unitPrice;
      } else if (sortBy === 'delivery') {
        comparison = a.deliveryDays - b.deliveryDays;
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });

  const toggleSort = (field: 'score' | 'price' | 'delivery') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(field);
      setSortOrder(field === 'price' || field === 'delivery' ? 'asc' : 'desc');
    }
  };

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden shadow-2xs">
      {/* Controls Bar */}
      <div className="px-4 py-3 border-b border-[#E5E7EB] bg-gray-50/70 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center space-x-2">
          <SlidersHorizontal className="w-4 h-4 text-gray-500" />
          <span className="font-semibold text-gray-800">
            Multi-Supplier Evaluated Offers ({displayedOffers.length} of {offers.length})
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <label className="flex items-center space-x-1.5 cursor-pointer text-gray-700">
            <input
              type="checkbox"
              checked={filterEligibleOnly}
              onChange={(e) => setFilterEligibleOnly(e.target.checked)}
              className="rounded text-[#187B61] focus:ring-[#187B61]"
            />
            <span>Eligible Only</span>
          </label>

          <div className="flex items-center space-x-1 border border-gray-200 rounded-md p-0.5 bg-white">
            <button
              onClick={() => toggleSort('score')}
              className={`px-2 py-1 rounded text-[11px] font-medium flex items-center space-x-1 ${
                sortBy === 'score' ? 'bg-[#187B61] text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span>Score</span>
              {sortBy === 'score' && (sortOrder === 'desc' ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />)}
            </button>
            <button
              onClick={() => toggleSort('price')}
              className={`px-2 py-1 rounded text-[11px] font-medium flex items-center space-x-1 ${
                sortBy === 'price' ? 'bg-[#187B61] text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span>Price</span>
              {sortBy === 'price' && (sortOrder === 'asc' ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />)}
            </button>
            <button
              onClick={() => toggleSort('delivery')}
              className={`px-2 py-1 rounded text-[11px] font-medium flex items-center space-x-1 ${
                sortBy === 'delivery' ? 'bg-[#187B61] text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span>Delivery</span>
              {sortBy === 'delivery' && (sortOrder === 'asc' ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />)}
            </button>
          </div>
        </div>
      </div>

      {/* Grid / Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#E5E7EB] bg-gray-50 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
              <th className="py-2.5 px-3">Product & Supplier</th>
              <th className="py-2.5 px-3">Unit Price</th>
              <th className="py-2.5 px-3">Total ({quantity}x)</th>
              <th className="py-2.5 px-3">Delivery</th>
              <th className="py-2.5 px-3">Reliability</th>
              <th className="py-2.5 px-3 text-center">Score (100)</th>
              <th className="py-2.5 px-3 text-center">Status</th>
              <th className="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {displayedOffers.map((offer, idx) => {
              const isTop = idx === 0 && offer.isEligible;
              const isSelected = selectedOfferId === offer.id;
              const isExpanded = expandedOfferId === offer.id;
              const totalAmount = offer.unitPrice * quantity;

              return (
                <React.Fragment key={offer.id}>
                  <tr
                    className={`transition-colors hover:bg-gray-50/80 ${
                      isSelected
                        ? 'bg-[#187B61]/5 font-medium'
                        : isTop
                        ? 'bg-emerald-50/20'
                        : !offer.isEligible
                        ? 'bg-red-50/15 opacity-70'
                        : ''
                    }`}
                  >
                    {/* Product & Supplier */}
                    <td className="py-3 px-3">
                      <div className="flex items-start space-x-2.5">
                        <img
                          src={offer.imageUrl}
                          alt={offer.productName}
                          className="w-10 h-10 object-cover rounded-md border border-gray-200 shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=150&q=80';
                          }}
                        />
                        <div className="min-w-0 max-w-xs">
                          <div className="flex items-center space-x-1.5 mb-0.5">
                            {isTop && (
                              <span className="inline-flex items-center space-x-0.5 bg-[#187B61] text-white text-[10px] font-bold px-1.5 py-0.2 rounded">
                                <Award className="w-2.5 h-2.5" />
                                <span>#1 Recommended</span>
                              </span>
                            )}
                            <span className="text-[10px] font-mono text-gray-500">{offer.brand}</span>
                          </div>
                          <a
                            href={offer.productUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-semibold text-gray-900 hover:text-[#187B61] line-clamp-1 flex items-center space-x-1"
                          >
                            <span>{offer.productName}</span>
                            <ExternalLink className="w-2.5 h-2.5 shrink-0 text-gray-400" />
                          </a>
                          <div className="text-[11px] text-gray-500 mt-0.5">
                            Supplier: <span className="font-medium text-gray-700">{offer.vendor}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Unit Price */}
                    <td className="py-3 px-3 tabular-nums font-mono font-medium text-gray-900">
                      ${(offer.unitPrice / 100).toFixed(2)}
                    </td>

                    {/* Total Cost */}
                    <td className="py-3 px-3 tabular-nums font-mono font-bold text-gray-900">
                      ${(totalAmount / 100).toFixed(2)}
                    </td>

                    {/* Delivery */}
                    <td className="py-3 px-3">
                      <span className="text-gray-700 font-medium block">
                        {offer.deliveryDays <= 2 ? 'Express' : 'Standard'} ({offer.deliveryDays}d)
                      </span>
                      <span className="text-[10px] text-gray-500 line-clamp-1">{offer.deliveryEstimate}</span>
                    </td>

                    {/* Reliability */}
                    <td className="py-3 px-3">
                      <div className="flex items-center space-x-1.5">
                        <div className="w-12 bg-gray-200 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-[#187B61] h-full rounded-full"
                            style={{ width: `${offer.vendorReliabilityScore}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-mono font-semibold text-gray-700">
                          {offer.vendorReliabilityScore}%
                        </span>
                      </div>
                    </td>

                    {/* Deterministic Score */}
                    <td className="py-3 px-3 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span
                          className={`px-2 py-0.5 rounded-md font-mono text-xs font-bold ${
                            offer.scores.totalScore >= 80
                              ? 'bg-emerald-100 text-emerald-800'
                              : offer.scores.totalScore >= 60
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {offer.scores.totalScore}
                        </span>
                        <button
                          onClick={() => setExpandedOfferId(isExpanded ? null : offer.id)}
                          className="text-[10px] text-gray-400 hover:text-gray-700 mt-0.5 underline"
                        >
                          {isExpanded ? 'Hide' : 'Weights'}
                        </button>
                      </div>
                    </td>

                    {/* Eligibility Status */}
                    <td className="py-3 px-3 text-center">
                      {offer.isEligible ? (
                        <span className="inline-flex items-center space-x-1 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[11px] font-medium">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Eligible</span>
                        </span>
                      ) : (
                        <span
                          className="inline-flex items-center space-x-1 text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded text-[11px] font-medium cursor-help"
                          title={offer.disqualificationReason}
                        >
                          <XCircle className="w-3 h-3 text-red-600" />
                          <span>Disqualified</span>
                        </span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="py-3 px-3 text-right">
                      {offer.isEligible && onSelectOffer && (
                        <button
                          onClick={() => onSelectOffer(offer)}
                          className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                            isSelected
                              ? 'bg-[#187B61] text-white shadow-xs'
                              : 'bg-gray-100 hover:bg-[#187B61] hover:text-white text-gray-700'
                          }`}
                        >
                          {isSelected ? 'Selected' : 'Select'}
                        </button>
                      )}
                    </td>
                  </tr>

                  {/* Expanded Breakdown Row */}
                  {isExpanded && (
                    <tr className="bg-gray-50/90 text-xs">
                      <td colSpan={8} className="p-3 pl-12 border-t border-gray-100">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <span className="font-semibold text-gray-800 block mb-1">
                              Deterministic Weight Breakdown
                            </span>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-gray-600">
                              <div>Price Score (35%): <span className="font-mono font-bold">{offer.scores.priceScore} pts</span></div>
                              <div>Specs Score (30%): <span className="font-mono font-bold">{offer.scores.specsScore} pts</span></div>
                              <div>Vendor Reliability (20%): <span className="font-mono font-bold">{offer.scores.vendorScore} pts</span></div>
                              <div>Delivery Speed (10%): <span className="font-mono font-bold">{offer.scores.deliveryScore} pts</span></div>
                              <div>Stock Availability (5%): <span className="font-mono font-bold">{offer.scores.availabilityScore} pts</span></div>
                            </div>
                            {offer.disqualificationReason && (
                              <div className="mt-2 text-[11px] text-red-700 font-semibold bg-red-50 p-2 rounded border border-red-200">
                                Disqualification Reason: {offer.disqualificationReason}
                              </div>
                            )}
                          </div>
                          <div>
                            <span className="font-semibold text-gray-800 block mb-1">
                              AI Recommendation Explanation
                            </span>
                            <p className="text-[11px] text-gray-600 leading-relaxed italic bg-white p-2 rounded border border-gray-200">
                              "{offer.aiExplanation}"
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
