import React, { useState } from 'react';
import { X, Star, Save, MessageSquare } from 'lucide-react';
import { FeedbackItem } from '@/lib/types';
import { ApiService } from '@/lib/api';

interface FeedbackDetailsModalProps {
  feedback: FeedbackItem | null;
  onClose: () => void;
  onFeedbackUpdated: (feedbackId: string, status: string, notes?: string) => void;
  showToast: (msg: string) => void;
}

export const FeedbackDetailsModal: React.FC<FeedbackDetailsModalProps> = ({
  feedback,
  onClose,
  onFeedbackUpdated,
  showToast
}) => {
  if (!feedback) return null;

  const [status, setStatus] = useState<string>(feedback.status);
  const [adminNotes, setAdminNotes] = useState<string>(feedback.admin_notes || '');
  const [updating, setUpdating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await ApiService.updateAdminFeedbackStatus(feedback.id, status, adminNotes);
      onFeedbackUpdated(feedback.id, status, adminNotes);
      showToast(`Feedback marked as ${status}`);
      onClose();
    } catch (e: any) {
      showToast(e?.message || 'Failed to update feedback status');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-5 animate-scale-in max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-[#18232D]">Review Citizen Feedback</h3>
              <p className="text-xs text-[#5B6470]">ID: <span className="font-mono">{feedback.id}</span></p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Metadata */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70 text-xs space-y-2">
          <div className="flex justify-between">
            <span className="text-slate-500">Citizen:</span>
            <span className="font-bold text-slate-800">{feedback.name || 'Anonymous Citizen'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Phone:</span>
            <span className="font-mono font-bold text-slate-800">{feedback.mobile || feedback.email || 'N/A'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Rating:</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(star => (
                <Star
                  key={star}
                  className={`w-3.5 h-3.5 ${
                    star <= (feedback.rating || 5)
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-slate-200'
                  }`}
                />
              ))}
            </div>
          </div>
          {feedback.service_name && (
            <div className="flex justify-between">
              <span className="text-slate-500">Service:</span>
              <span className="font-bold text-slate-800">{feedback.service_name}</span>
            </div>
          )}
        </div>

        {/* Message Content */}
        <div className="space-y-1">
          <label className="block text-xs font-bold text-[#18232D] uppercase tracking-wider">
            Citizen Remarks:
          </label>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 italic leading-relaxed">
            "{feedback.message || 'No comment text provided.'}"
          </div>
        </div>

        {/* Status Update Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-xs font-bold text-[#18232D] uppercase tracking-wider mb-1">
              Action Status
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['NEW', 'REVIEWED', 'RESOLVED'].map(st => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatus(st)}
                  className={`py-2 rounded-xl text-xs font-bold transition ${
                    status === st
                      ? 'bg-[#18232D] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#18232D] uppercase tracking-wider mb-1">
              Admin Internal Notes
            </label>
            <textarea
              rows={3}
              value={adminNotes}
              onChange={e => setAdminNotes(e.target.value)}
              placeholder="Internal follow-up notes or resolution summary..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-[#18232D] focus:ring-2 focus:ring-[#159447]/30"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updating}
              className="px-5 py-2.5 rounded-xl bg-[#159447] hover:bg-[#12803c] text-white text-xs font-bold shadow-sm transition disabled:opacity-50 flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>{updating ? 'Saving...' : 'Save Feedback'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
