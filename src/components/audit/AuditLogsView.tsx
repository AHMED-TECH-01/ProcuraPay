import React, { useState } from 'react';
import {
  ScrollText,
  ShieldCheck,
  Search,
  Filter,
  AlertTriangle,
  Info,
  CheckCircle2,
  Terminal,
} from 'lucide-react';
import { AuditLogEntry } from '../../types';

interface AuditLogsViewProps {
  logs: AuditLogEntry[];
}

export const AuditLogsView: React.FC<AuditLogsViewProps> = ({ logs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');

  const filtered = logs.filter((log) => {
    const matchSearch =
      log.eventType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      JSON.stringify(log.details).toLowerCase().includes(searchTerm.toLowerCase());

    const matchSeverity = severityFilter === 'ALL' || log.severity === severityFilter;
    return matchSearch && matchSeverity;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-[#187B61] text-xs font-bold uppercase tracking-wider mb-1">
          <ScrollText className="w-4 h-4" />
          <span>Tamper-Resistant Audit Trail</span>
        </div>
        <h1 className="text-xl font-black text-gray-900 tracking-tight">
          Procurement & Financial Audit Logs
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Append-only verifiable ledger recording every AI agent action, deterministic policy check, human approval decision, and PayPal transaction event.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3 rounded-xl border border-[#E5E7EB] flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by event type, actor, or payload details..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#187B61] outline-hidden font-mono"
          />
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <Filter className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-gray-500 font-medium">Severity:</span>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-2.5 py-1 text-xs text-gray-700 bg-white focus:ring-2 focus:ring-[#187B61] outline-hidden"
          >
            <option value="ALL">All Severities</option>
            <option value="INFO">INFO</option>
            <option value="WARNING">WARNING</option>
            <option value="CRITICAL">CRITICAL</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-gray-50 text-[11px] font-semibold text-gray-500 uppercase tracking-wider font-mono">
                <th className="py-2.5 px-4">Timestamp</th>
                <th className="py-2.5 px-4">Severity</th>
                <th className="py-2.5 px-4">Event Type</th>
                <th className="py-2.5 px-4">Actor / System</th>
                <th className="py-2.5 px-4">Audit Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-mono text-[11px]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400 font-sans text-xs">
                    No matching audit entries.
                  </td>
                </tr>
              ) : (
                filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3 px-4 text-gray-500 shrink-0 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleTimeString()} • {new Date(log.timestamp).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          log.severity === 'INFO'
                            ? 'bg-blue-50 text-blue-700'
                            : log.severity === 'WARNING'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-red-50 text-red-700'
                        }`}
                      >
                        {log.severity}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-gray-900 whitespace-nowrap">
                      {log.eventType}
                    </td>
                    <td className="py-3 px-4 text-gray-700 whitespace-nowrap">
                      {log.actor}
                    </td>
                    <td className="py-3 px-4 text-gray-600 font-mono max-w-md truncate">
                      {JSON.stringify(log.details)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
