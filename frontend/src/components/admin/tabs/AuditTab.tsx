import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';
import { AuditLogItem } from '@/lib/types';
import { useLanguage } from '@/i18n/LanguageContext';

interface AuditTabProps {
  auditLogs: AuditLogItem[];
  loading?: boolean;
}

export const AuditTab: React.FC<AuditTabProps> = ({
  auditLogs,
  loading = false
}) => {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const filteredLogs = useMemo(() => {
    return auditLogs.filter(log => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || (
        (log.actor_id && log.actor_id.toLowerCase().includes(q)) ||
        (log.actor_role && log.actor_role.toLowerCase().includes(q)) ||
        (log.action && log.action.toLowerCase().includes(q)) ||
        (log.entity_type && log.entity_type.toLowerCase().includes(q)) ||
        (log.entity_id && log.entity_id.toLowerCase().includes(q)) ||
        (log.client_ip && log.client_ip.includes(q))
      );

      const matchesAction = actionFilter === 'all' || log.action === actionFilter;

      return matchesSearch && matchesAction;
    });
  }, [auditLogs, searchQuery, actionFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / pageSize));
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLogs.slice(start, start + pageSize);
  }, [filteredLogs, currentPage, pageSize]);

  const uniqueActions = Array.from(new Set(auditLogs.map(l => l.action))).filter(Boolean);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#18232D] tracking-tight">
            Security & Lifecycle Audit Trail
          </h1>
          <p className="text-xs sm:text-sm text-[#5B6470] mt-1">
            Immutable, append-only log recording actor roles, IP addresses, timestamps, and state transitions.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search audit trail by actor, IP, action, or entity..."
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-[#159447]/30"
            />
          </div>

          <select
            value={actionFilter}
            onChange={e => {
              setActionFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 font-semibold text-slate-700"
          >
            <option value="all">All Audit Actions ({auditLogs.length})</option>
            {uniqueActions.map(act => (
              <option key={act} value={act}>{act}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700">
                <th className="py-3.5 px-4 font-bold">Timestamp</th>
                <th className="py-3.5 px-4 font-bold">Action Event</th>
                <th className="py-3.5 px-4 font-bold">Actor</th>
                <th className="py-3.5 px-4 font-bold">Entity</th>
                <th className="py-3.5 px-4 font-bold">Client IP / Context</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 font-sans">
                    <ShieldCheck className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    No audit records match the current filter.
                  </td>
                </tr>
              ) : (
                paginatedLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-bold text-[#159447] bg-[#EAF6EE] px-2 py-0.5 rounded">
                        {log.action}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{log.actor_role}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[140px]">{log.actor_id}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">{log.entity_type}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[140px]">{log.entity_id}</div>
                    </td>

                    <td className="py-3 px-4 text-slate-600">
                      <div>{log.client_ip || 'internal'}</div>
                      {log.user_agent && (
                        <div className="text-[10px] text-slate-400 truncate max-w-[180px]" title={log.user_agent}>
                          {log.user_agent}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 font-sans">
          <div>
            Showing <strong className="text-slate-800">{Math.min(filteredLogs.length, (currentPage - 1) * pageSize + 1)}</strong> to{' '}
            <strong className="text-slate-800">{Math.min(filteredLogs.length, currentPage * pageSize)}</strong> of{' '}
            <strong className="text-slate-800">{filteredLogs.length}</strong> audit records
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-40 hover:bg-slate-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-bold text-slate-700 px-1">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-40 hover:bg-slate-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
