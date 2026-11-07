import React, { useState } from 'react';
import { Search, ExternalLink, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { VERIFIED_PRODUCT_CATALOG } from '../../server/services/research.service';

export const ProductCatalogView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const filtered = VERIFIED_PRODUCT_CATALOG.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-[#187B61] text-xs font-bold uppercase tracking-wider mb-1">
          <ShieldCheck className="w-4 h-4" />
          <span>Multi-Supplier Hardware Database</span>
        </div>
        <h1 className="text-xl font-black text-gray-900 tracking-tight">
          Verified Supplier Product Catalog
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Curated commercial hardware models with verified technical specifications, commercial pricing, and supplier reliability ratings.
        </p>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-[#E5E7EB] flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search catalog by hardware, brand, or specs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#187B61] outline-hidden"
          />
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="text-gray-500 font-medium">Category:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-gray-200 rounded-lg px-2.5 py-1 text-xs text-gray-700 bg-white focus:ring-2 focus:ring-[#187B61] outline-hidden"
          >
            <option value="ALL">All Categories</option>
            <option value="Displays & Monitors">Displays & Monitors</option>
            <option value="Computers & Laptops">Computers & Laptops</option>
          </select>
        </div>
      </div>

      {/* Product Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden shadow-2xs flex flex-col"
          >
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-44 w-full object-cover border-b border-gray-100"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=400&q=80';
              }}
            />
            <div className="p-4 flex-1 flex flex-col space-y-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#187B61] uppercase tracking-wider block">
                  {product.brand} • {product.category}
                </span>
                <h3 className="text-sm font-bold text-gray-900 mt-1 line-clamp-2">
                  {product.name}
                </h3>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                  {product.description}
                </p>
              </div>

              {/* Hardware Specs list */}
              <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100 text-[11px] space-y-1">
                {Object.entries(product.specifications).slice(0, 3).map(([key, val]) => (
                  <div key={key} className="flex justify-between text-gray-700">
                    <span className="text-gray-500">{key}:</span>
                    <span className="font-medium truncate max-w-[150px]">{val}</span>
                  </div>
                ))}
              </div>

              {/* Verified Supplier Offers */}
              <div className="mt-auto pt-3 border-t border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  Active Supplier Quotes
                </span>
                <div className="space-y-1">
                  {product.offers.map((offer, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <span className="text-gray-700 truncate">{offer.vendor}</span>
                      <span className="font-mono font-bold text-gray-900 tabular-nums">
                        ${(offer.unitPrice / 100).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
