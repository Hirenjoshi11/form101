import React, { useState } from 'react';
import { Edit2, X, Trash2, Save } from 'lucide-react';
import { Operator } from '@/lib/types';
import { ApiService } from '@/lib/api';

interface EditOperatorModalProps {
  operator: Operator | null;
  onClose: () => void;
  onOperatorUpdated: (updated: Operator) => void;
  onDeleteRequest: (op: Operator) => void;
  showToast: (msg: string) => void;
}

export const EditOperatorModal: React.FC<EditOperatorModalProps> = ({
  operator,
  onClose,
  onOperatorUpdated,
  onDeleteRequest,
  showToast
}) => {
  if (!operator) return null;

  const [formData, setFormData] = useState<Operator>({ ...operator });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const updated = await ApiService.updateOperator(formData.id, formData);
      onOperatorUpdated(updated);
      showToast('Operator profile updated successfully');
      onClose();
    } catch (e: any) {
      showToast(e?.message || 'Failed to update operator profile');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-5 animate-scale-in max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#EAF6EE] text-[#159447] flex items-center justify-center">
              <Edit2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-[#18232D]">Edit Operator Profile</h3>
              <p className="text-xs text-[#5B6470]">Update details and active state</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#18232D] uppercase tracking-wider mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={formData.full_name}
              onChange={e => setFormData({ ...formData, full_name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-[#18232D] focus:ring-2 focus:ring-[#159447]/30"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#18232D] uppercase tracking-wider mb-1">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-[#18232D] focus:ring-2 focus:ring-[#159447]/30"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#18232D] uppercase tracking-wider mb-1">
              Mobile Phone
            </label>
            <input
              type="text"
              value={formData.phone || ''}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-[#18232D] focus:ring-2 focus:ring-[#159447]/30"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#18232D] uppercase tracking-wider mb-1">
              Gujarat District Assignment *
            </label>
            <select
              value={formData.district}
              onChange={e => setFormData({ ...formData, district: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-[#18232D] bg-white focus:ring-2 focus:ring-[#159447]/30"
            >
              {['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar', 'Bhavnagar', 'Jamnagar', 'Junagadh', 'Kutch', 'Mehsana', 'Anand', 'Navsari'].map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="opActiveCheck"
              checked={formData.is_active}
              onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4 text-[#159447] rounded focus:ring-[#159447]"
            />
            <label htmlFor="opActiveCheck" className="text-xs font-bold text-[#18232D]">
              Operator is Active and available for application processing
            </label>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                onDeleteRequest(formData);
                onClose();
              }}
              className="px-4 py-2 rounded-xl text-red-600 bg-red-50 hover:bg-red-100 text-xs font-bold flex items-center gap-1.5 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Operator</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 rounded-xl bg-[#159447] hover:bg-[#12803c] text-white text-xs font-bold shadow-sm transition disabled:opacity-50 flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{submitting ? 'Saving...' : 'Save Profile'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
