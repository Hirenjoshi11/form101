import React from 'react';
import { X, ExternalLink, Download } from 'lucide-react';
import { FormSubmission } from '@/lib/types';

interface SubmissionDetailsModalProps {
  submission: FormSubmission | null;
  onClose: () => void;
  getStatusBadge: (status: string) => { bg: string; label: string };
}

export const SubmissionDetailsModal: React.FC<SubmissionDetailsModalProps> = ({
  submission,
  onClose,
  getStatusBadge
}) => {
  if (!submission) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-slate-200 space-y-6 max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-black text-lg text-[#18232D]">
                {submission.application_number}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusBadge(submission.status).bg}`}>
                {getStatusBadge(submission.status).label}
              </span>
            </div>
            <p className="text-xs text-[#5B6470] mt-1">
              {submission.form_title_en} ({submission.form_title_gu})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Citizen & Payment Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-50 p-3 rounded-xl">
            <div className="text-[#5B6470]">Citizen Name</div>
            <div className="font-bold text-[#18232D] text-sm mt-0.5">
              {submission.user_name || 'Citizen User'}
            </div>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl">
            <div className="text-[#5B6470]">Phone</div>
            <div className="font-bold text-[#18232D] text-sm mt-0.5">
              {submission.user_phone || '+91 98980 12345'}
            </div>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl">
            <div className="text-[#5B6470]">Fee & Payment</div>
            <div className="font-bold text-[#159447] text-sm mt-0.5">
              ₹{submission.total_fee} (PAID)
            </div>
          </div>
        </div>

        {/* Assigned Operator & Government Portal Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-[#5B6470] block">Assigned Operator:</span>
            <span className="font-bold text-slate-800 text-sm mt-0.5 block">
              {submission.assigned_operator_name ? `📌 ${submission.assigned_operator_name}` : 'Unassigned (In Service Pool)'}
            </span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-[#5B6470] block">Govt Portal Application ID:</span>
            <span className="font-mono font-bold text-slate-800 text-sm mt-0.5 block">
              {submission.govt_portal_application_id || 'Not generated yet'}
            </span>
          </div>
        </div>

        {/* Operator Notes & Status */}
        {submission.operator_notes && (
          <div className="bg-emerald-50/70 border border-emerald-200/80 p-3.5 rounded-2xl text-xs space-y-1">
            <div className="font-bold text-[#159447]">Operator Notes:</div>
            <p className="text-slate-700">{submission.operator_notes}</p>
          </div>
        )}

        {/* Field Values Submitted */}
        <div>
          <h4 className="font-bold text-xs uppercase tracking-wider text-[#18232D] mb-2.5">
            Form Values Submitted:
          </h4>
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2 text-xs">
            {Object.entries(submission.field_values || {}).map(([key, val]) => (
              <div key={key} className="flex justify-between border-b border-slate-200/60 pb-1.5 last:border-0 last:pb-0">
                <span className="font-semibold text-[#5B6470] capitalize">{key.replace(/_/g, ' ')}:</span>
                <span className="font-bold text-[#18232D] text-right">{String(val)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Certificate URL */}
        {submission.certificate_url && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
            <span className="font-bold text-emerald-900">Approved Certificate Attached</span>
            <a
              href={submission.certificate_url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1 bg-[#159447] text-white rounded-lg font-bold flex items-center gap-1 hover:bg-[#12803c]"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </a>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#18232D] text-white font-bold text-xs hover:bg-slate-800"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};
