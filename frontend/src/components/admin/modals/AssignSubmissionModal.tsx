import React from 'react';
import { X, UserCheck } from 'lucide-react';
import { FormSubmission, Operator } from '@/lib/types';
import { ApiService } from '@/lib/api';

interface AssignSubmissionModalProps {
  submission: FormSubmission | null;
  operators: Operator[];
  onClose: () => void;
  onAssigned: (submissionId: string, operatorId: string, operatorName: string) => void;
  showToast: (msg: string) => void;
}

export const AssignSubmissionModal: React.FC<AssignSubmissionModalProps> = ({
  submission,
  operators,
  onClose,
  onAssigned,
  showToast
}) => {
  if (!submission) return null;

  const handleAssign = async (operatorId: string) => {
    try {
      await ApiService.assignSubmission(submission.id, operatorId);
      const op = operators.find(o => o.id === operatorId);
      onAssigned(submission.id, operatorId, op?.full_name || 'Operator');
      showToast(`Application assigned to ${op?.full_name || 'Operator'}`);
      onClose();
    } catch (e: any) {
      showToast(e?.message || 'Assignment failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-5 animate-scale-in">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-lg text-[#18232D]">Assign Operator</h3>
            <p className="text-xs text-[#5B6470]">
              App: <strong className="font-mono text-slate-800">{submission.application_number}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2.5">
          <p className="text-xs font-bold text-[#18232D] uppercase tracking-wider">
            Select Active Operator:
          </p>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {operators.filter(o => o.is_active).map(op => {
              const isEligible = (op.assigned_form_ids && op.assigned_form_ids.includes(submission.form_id)) ||
                (op.assigned_forms && op.assigned_forms.includes(submission.form_slug));
              return (
                <button
                  key={op.id}
                  onClick={() => handleAssign(op.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition ${
                    isEligible
                      ? 'border-emerald-200 bg-emerald-50/40 hover:border-[#159447] hover:bg-emerald-50'
                      : 'border-slate-200 hover:border-slate-300 opacity-80'
                  }`}
                >
                  <div>
                    <div className="font-bold text-xs sm:text-sm text-[#18232D] flex items-center gap-1.5 flex-wrap">
                      <span>{op.full_name}</span>
                      {isEligible && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                          ✓ Certified for this form
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-[#5B6470]">📍 {op.district} • {op.assigned_count} in queue</div>
                  </div>
                  <span className="text-xs font-bold text-[#159447]">Assign →</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
