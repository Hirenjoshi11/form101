import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  FileText,
  UserCheck,
  Eye,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { FormSubmission, Operator, CertificateForm } from '@/lib/types';
import { useLanguage } from '@/i18n/LanguageContext';

interface SubmissionsTabProps {
  submissions: FormSubmission[];
  operators: Operator[];
  formsList: CertificateForm[];
  onOpenAssignModal: (sub: FormSubmission) => void;
  onOpenDetailsModal: (sub: FormSubmission) => void;
  getStatusBadge: (status: string) => { bg: string; label: string };
  loading?: boolean;
}

export const SubmissionsTab: React.FC<SubmissionsTabProps> = ({
  submissions,
  operators,
  formsList,
  onOpenAssignModal,
  onOpenDetailsModal,
  getStatusBadge,
  loading = false
}) => {
  const { language } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [formFilter, setFormFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filteredSubmissions = useMemo(() => {
    return submissions.filter(sub => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || (
        sub.application_number.toLowerCase().includes(q) ||
        (sub.user_name && sub.user_name.toLowerCase().includes(q)) ||
        (sub.user_phone && sub.user_phone.includes(q)) ||
        sub.form_slug.toLowerCase().includes(q) ||
        (sub.form_title_en && sub.form_title_en.toLowerCase().includes(q))
      );

      const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
      const matchesForm = formFilter === 'all' || sub.form_slug === formFilter || sub.form_id === formFilter;

      return matchesSearch && matchesStatus && matchesForm;
    });
  }, [submissions, searchQuery, statusFilter, formFilter]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredSubmissions.length / pageSize));
  const paginatedSubmissions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredSubmissions.slice(start, start + pageSize);
  }, [filteredSubmissions, currentPage, pageSize]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#18232D] tracking-tight">
            Citizen Submissions & Operator Assignments
          </h1>
          <p className="text-xs sm:text-sm text-[#5B6470] mt-1">
            Browse, search, and assign operator specialists to submitted certificate applications.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by App ID, Citizen, Mobile, or Form..."
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-[#159447]/30"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 font-semibold text-slate-700"
          >
            <option value="all">All Application Statuses ({submissions.length})</option>
            <option value="submitted">Submitted (New / Unassigned)</option>
            <option value="resubmitted">⚡ Resubmitted by Citizen</option>
            <option value="operator_filling">In Progress (Operator Filing)</option>
            <option value="awaiting_otp">Awaiting Citizen OTP</option>
            <option value="submitted_to_govt_portal">Submitted to Govt Portal</option>
            <option value="approved">Approved & Completed</option>
            <option value="rejected">Rejected / Needs Correction</option>
          </select>

          {/* Form Scheme Filter */}
          <select
            value={formFilter}
            onChange={e => {
              setFormFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 font-semibold text-slate-700"
          >
            <option value="all">All Service Categories ({formsList.length})</option>
            {formsList.map(f => (
              <option key={f.id} value={f.slug}>
                {f.title_en}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Submissions Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700">
                <th className="py-3.5 px-4 font-bold">App ID</th>
                <th className="py-3.5 px-4 font-bold">Service & Department</th>
                <th className="py-3.5 px-4 font-bold">Citizen Applicant</th>
                <th className="py-3.5 px-4 font-bold">Fee Status</th>
                <th className="py-3.5 px-4 font-bold">Current Status</th>
                <th className="py-3.5 px-4 font-bold">Assigned Operator</th>
                <th className="py-3.5 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <FileText className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    No applications match your search criteria.
                  </td>
                </tr>
              ) : (
                paginatedSubmissions.map(sub => {
                  const badge = getStatusBadge(sub.status);
                  return (
                    <tr key={sub.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {sub.application_number}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-slate-900 text-xs truncate max-w-[200px]">
                          {sub.form_title_en}
                        </div>
                        <div className="text-[10px] text-slate-400">{sub.form_slug}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{sub.user_name || 'Citizen User'}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{sub.user_phone || '+91 XXXXX'}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-[#159447]">₹{sub.total_fee}</span>
                        <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded ml-1 font-bold">
                          PAID
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.bg}`}>
                          {badge.label}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        {sub.assigned_operator_name ? (
                          <div className="flex items-center gap-1 font-bold text-slate-800">
                            <span>📌</span>
                            <span>{sub.assigned_operator_name}</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => onOpenAssignModal(sub)}
                            className="text-[11px] font-bold text-blue-600 hover:text-blue-800 underline"
                          >
                            + Assign Specialist
                          </button>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onOpenAssignModal(sub)}
                            className="p-1.5 rounded-lg border border-slate-200 hover:border-slate-400 text-slate-700 bg-white hover:bg-slate-50"
                            title="Re-assign Operator"
                          >
                            <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                          </button>
                          <button
                            onClick={() => onOpenDetailsModal(sub)}
                            className="p-1.5 rounded-lg border border-slate-200 hover:border-slate-400 text-slate-700 bg-white hover:bg-slate-50"
                            title="View Full Details"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Showing <strong className="text-slate-800">{Math.min(filteredSubmissions.length, (currentPage - 1) * pageSize + 1)}</strong> to{' '}
            <strong className="text-slate-800">{Math.min(filteredSubmissions.length, currentPage * pageSize)}</strong> of{' '}
            <strong className="text-slate-800">{filteredSubmissions.length}</strong> applications
          </div>

          <div className="flex items-center gap-2">
            <select
              value={pageSize}
              onChange={e => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700 font-semibold"
            >
              <option value={10}>10 / page</option>
              <option value={25}>25 / page</option>
              <option value={50}>50 / page</option>
            </select>

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
