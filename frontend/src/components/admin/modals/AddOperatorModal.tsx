import React, { useState } from 'react';
import { UserPlus, X } from 'lucide-react';
import { Operator } from '@/lib/types';
import { ApiService } from '@/lib/api';

interface AddOperatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOperatorAdded: (newOp: Operator) => void;
  showToast: (msg: string) => void;
}

export const AddOperatorModal: React.FC<AddOperatorModalProps> = ({
  isOpen,
  onClose,
  onOperatorAdded,
  showToast
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [district, setDistrict] = useState('Ahmedabad');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    setSubmitting(true);
    try {
      const newOp = await ApiService.addOperator({
        full_name: name,
        email,
        phone: phone || '+91 98250 00000',
        district
      });
      onOperatorAdded(newOp);
      showToast('New operator registered successfully');
      setName('');
      setEmail('');
      setPhone('');
      onClose();
    } catch (e: any) {
      showToast(e?.message || 'Failed to create operator');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-5 animate-scale-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#EAF6EE] text-[#159447] flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-[#18232D]">Register Operator</h3>
              <p className="text-xs text-[#5B6470]">Add certified filing specialist</p>
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
              placeholder="e.g. Ramesh Patel"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-[#18232D] focus:ring-2 focus:ring-[#159447]/30 focus:border-[#159447]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#18232D] uppercase tracking-wider mb-1">
              Email Address *
            </label>
            <input
              type="email"
              required
              placeholder="ramesh.operator@formseva.in"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-[#18232D] focus:ring-2 focus:ring-[#159447]/30 focus:border-[#159447]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#18232D] uppercase tracking-wider mb-1">
              Mobile Phone
            </label>
            <input
              type="text"
              placeholder="+91 98250 11223"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-[#18232D] focus:ring-2 focus:ring-[#159447]/30 focus:border-[#159447]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#18232D] uppercase tracking-wider mb-1">
              Gujarat District *
            </label>
            <select
              value={district}
              onChange={e => setDistrict(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-[#18232D] bg-white focus:ring-2 focus:ring-[#159447]/30 focus:border-[#159447]"
            >
              {['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar', 'Bhavnagar', 'Jamnagar', 'Junagadh', 'Kutch', 'Mehsana', 'Anand', 'Navsari'].map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
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
              className="px-5 py-2 rounded-xl bg-[#159447] hover:bg-[#12803c] text-white text-xs font-bold shadow-sm transition disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Register Operator'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
