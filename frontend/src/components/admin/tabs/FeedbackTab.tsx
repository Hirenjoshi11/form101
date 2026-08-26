import React, { useState, useMemo } from 'react';
import {
  MessageSquare,
  Search,
  Star,
  Eye,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';
import { FeedbackItem } from '@/lib/types';
import { useLanguage } from '@/i18n/LanguageContext';

interface FeedbackTabProps {
  feedbacks: FeedbackItem[];
  onOpenFeedbackDetails: (fb: FeedbackItem) => void;
  loading?: boolean;
}

export const FeedbackTab: React.FC<FeedbackTabProps> = ({
  feedbacks,
  onOpenFeedbackDetails,
  loading = false
}) => {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filteredFeedbacks = useMemo(() => {
    return feedbacks.filter(fb => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || (
        (fb.name && fb.name.toLowerCase().includes(q)) ||
        (fb.mobile && fb.mobile.includes(q)) ||
        (fb.email && fb.email.toLowerCase().includes(q)) ||
        (fb.message && fb.message.toLowerCase().includes(q)) ||
        (fb.service_name && fb.service_name.toLowerCase().includes(q))
      );

      const matchesStatus = statusFilter === 'all' || fb.status === statusFilter;
      const matchesRating = ratingFilter === 0 || fb.rating === ratingFilter;

      return matchesSearch && matchesStatus && matchesRating;
    });
  }, [feedbacks, searchQuery, statusFilter, ratingFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredFeedbacks.length / pageSize));
  const paginatedFeedbacks = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredFeedbacks.slice(start, start + pageSize);
  }, [filteredFeedbacks, currentPage, pageSize]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#18232D] tracking-tight">
            Citizen Grievances & Service Feedback
          </h1>
          <p className="text-xs sm:text-sm text-[#5B6470] mt-1">
            Review user ratings, assisted filing experience remarks, and track resolution status.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search feedback remarks or citizen..."
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-[#159447]/30"
            />
          </div>

          <select
            value={statusFilter}
            onChange={e => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 font-semibold text-slate-700"
          >
            <option value="all">All Feedback Statuses ({feedbacks.length})</option>
            <option value="NEW">New (Unreviewed)</option>
            <option value="REVIEWED">Under Review</option>
            <option value="RESOLVED">Resolved</option>
          </select>

          <select
            value={ratingFilter}
            onChange={e => {
              setRatingFilter(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 font-semibold text-slate-700"
          >
            <option value={0}>All Star Ratings</option>
            <option value={5}>⭐⭐⭐⭐⭐ (5 Stars)</option>
            <option value={4}>⭐⭐⭐⭐ (4 Stars)</option>
            <option value={3}>⭐⭐⭐ (3 Stars)</option>
            <option value={2}>⭐⭐ (2 Stars)</option>
            <option value={1}>⭐ (1 Star - Urgent Grievance)</option>
          </select>
        </div>
      </div>

      {/* Feedbacks Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700">
                <th className="py-3.5 px-4 font-bold">Citizen</th>
                <th className="py-3.5 px-4 font-bold">Rating</th>
                <th className="py-3.5 px-4 font-bold">Service</th>
                <th className="py-3.5 px-4 font-bold">Remarks & Feedback</th>
                <th className="py-3.5 px-4 font-bold">Status</th>
                <th className="py-3.5 px-4 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedFeedbacks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <MessageSquare className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    No citizen feedback found matching current filters.
                  </td>
                </tr>
              ) : (
                paginatedFeedbacks.map(fb => (
                  <tr key={fb.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{fb.name || 'Anonymous Citizen'}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{fb.mobile || fb.email || 'N/A'}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star
                            key={star}
                            className={`w-3.5 h-3.5 ${
                              star <= (fb.rating || 5)
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      {fb.service_name || 'General Platform'}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 max-w-[280px]">
                      <p className="truncate italic">"{fb.message || 'No comment provided'}"</p>
                      {fb.admin_notes && (
                        <p className="text-[10px] text-emerald-800 font-medium truncate mt-0.5">
                          Admin: {fb.admin_notes}
                        </p>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        fb.status === 'RESOLVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : fb.status === 'REVIEWED'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {fb.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => onOpenFeedbackDetails(fb)}
                        className="p-1.5 rounded-lg border border-slate-200 hover:border-slate-400 text-slate-700 bg-white hover:bg-slate-50"
                        title="Review Feedback"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-600" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Showing <strong className="text-slate-800">{Math.min(filteredFeedbacks.length, (currentPage - 1) * pageSize + 1)}</strong> to{' '}
            <strong className="text-slate-800">{Math.min(filteredFeedbacks.length, currentPage * pageSize)}</strong> of{' '}
            <strong className="text-slate-800">{filteredFeedbacks.length}</strong> feedbacks
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
