import React, { useState, useEffect } from 'react';
import {
  Settings,
  Building2,
  CreditCard,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Globe2,
  Mail,
  FileText,
  Search,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import { Organization } from '../../types';
import { api } from '../../client/api';
import { GlassCard } from '../ui/GlassCard';

interface SettingsViewProps {
  organization: Organization;
}

interface IntegrationItem {
  name: string;
  category: string;
  isConfigured: boolean;
  status: string;
  authMethod: string;
  sandboxAvailable: boolean;
  mode: string;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ organization }) => {
  const [integrations, setIntegrations] = useState<IntegrationItem[]>([]);
  const [fxRates, setFxRates] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);

  const fetchIntegrations = async () => {
    try {
      setLoading(true);
      const [intRes, fxRes] = await Promise.all([
        api.getIntegrationsStatus(),
        api.getCurrencyRates('USD'),
      ]);
      setIntegrations(intRes.integrations || []);
      setFxRates(fxRes.rates || {});
    } catch (err) {
      console.warn('Failed to fetch integrations status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, []);

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2 text-[#187B61] text-xs font-bold uppercase tracking-wider mb-1">
            <Settings className="w-4 h-4" />
            <span>Autonomous Service Discovery & Integrations</span>
          </div>
          <h1 className="text-xl font-black text-gray-900 tracking-tight">
            Organization Profile & Live API Registry
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Verified external service adapters, sandbox connectors, real-time foreign exchange, and security governance.
          </p>
        </div>

        <button
          onClick={fetchIntegrations}
          disabled={loading}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-lg border border-gray-200 transition-colors shadow-2xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh APIs</span>
        </button>
      </div>

      {/* Organization Card */}
      <div className="bg-white p-6 rounded-xl border border-[#E5E7EB] shadow-2xs space-y-4">
        <h2 className="text-sm font-bold text-gray-900 flex items-center space-x-2">
          <Building2 className="w-4 h-4 text-[#187B61]" />
          <span>Enterprise Tenant Profile</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
            <span className="text-gray-400 block text-[10px] uppercase font-semibold">Legal Entity</span>
            <span className="font-bold text-gray-900 text-sm mt-0.5 block">{organization.name}</span>
          </div>

          <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
            <span className="text-gray-400 block text-[10px] uppercase font-semibold">Tenant Identifier</span>
            <span className="font-mono font-bold text-gray-800 text-sm mt-0.5 block">{organization.id}</span>
          </div>

          <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
            <span className="text-gray-400 block text-[10px] uppercase font-semibold">Authorized Signatory (Owner)</span>
            <span className="font-bold text-gray-900 text-sm mt-0.5 block">{organization.ownerName}</span>
            <span className="text-gray-500 font-mono text-[11px]">{organization.ownerEmail}</span>
          </div>

          <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
            <span className="text-gray-400 block text-[10px] uppercase font-semibold">Operating Currency</span>
            <span className="font-bold text-gray-900 text-sm mt-0.5 block">{organization.currency} (United States Dollar)</span>
          </div>
        </div>
      </div>

      {/* Autonomous External Integrations Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-900 flex items-center space-x-2">
            <Globe2 className="w-4 h-4 text-[#187B61]" />
            <span>Autonomous Service Discovery & Adapter Registry</span>
          </h2>
          <span className="text-xs text-gray-500 font-mono">
            7 Verified Service Adapters
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {integrations.map((item, idx) => (
            <div
              key={idx}
              className="liquid-glass-card p-4 rounded-xl space-y-2.5 bg-white/95"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-gray-500 tracking-wider">
                    {item.category}
                  </span>
                  <h3 className="text-xs font-bold text-gray-900 mt-0.5">{item.name}</h3>
                </div>
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>{item.status}</span>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-gray-100">
                <div>
                  <span className="text-gray-400 block text-[10px]">Auth Method:</span>
                  <span className="text-gray-700 font-medium">{item.authMethod}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">Active Mode:</span>
                  <span className="font-mono text-emerald-800 font-semibold">{item.mode}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Foreign Exchange Rates (Frankfurter ECB API) */}
      <div className="bg-white p-6 rounded-xl border border-[#E5E7EB] shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-900 flex items-center space-x-2">
            <Globe2 className="w-4 h-4 text-blue-600" />
            <span>Real-Time European Central Bank Exchange Rates (USD Base)</span>
          </h2>
          <span className="text-[10px] font-mono text-gray-400">Frankfurter Open Public API</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-1">
          {Object.entries(fxRates).slice(0, 6).map(([curr, rate]) => (
            <div key={curr} className="p-2.5 bg-gray-50 rounded-lg border border-gray-200 text-center">
              <span className="text-[10px] font-mono font-bold text-gray-500 uppercase block">{curr}</span>
              <span className="font-mono font-bold text-gray-900 text-sm mt-0.5 block">
                {typeof rate === 'number' ? rate.toFixed(4) : rate}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Security Governance and Human-Approval Guarantees */}
      <div className="glass-panel p-5 rounded-xl border border-emerald-500/20 text-xs text-gray-700 space-y-2">
        <div className="flex items-center space-x-2 text-[#187B61] font-bold">
          <ShieldCheck className="w-4 h-4" />
          <span>Autonomous API Discovery Governance Contract</span>
        </div>
        <p className="leading-relaxed">
          All external integrations conform to zero-trust boundaries: AI reasoning is bounded by 4-second race timeouts; third-party catalog searches are verified against deterministic corporate spending policies; and financial payments through PayPal require explicit, manual human authorization before server-side capture.
        </p>
      </div>
    </div>
  );
};
