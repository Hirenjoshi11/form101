import React, { useState } from 'react';
import {
  UserPlus,
  Users,
  Edit2,
  Trash2,
  MapPin,
  Mail,
  Phone,
  CheckCircle2,
  Search
} from 'lucide-react';
import { Operator, CertificateForm } from '@/lib/types';
import { useLanguage } from '@/i18n/LanguageContext';

interface OperatorsTabProps {
  operators: Operator[];
  formsList: CertificateForm[];
  onOpenAddOperator: () => void;
  onEditOperator: (op: Operator) => void;
  onDeleteRequest: (op: Operator) => void;
  onToggleOperator: (operatorId: string) => void;
  loading?: boolean;
}

export const OperatorsTab: React.FC<OperatorsTabProps> = ({
  operators,
  formsList,
  onOpenAddOperator,
  onEditOperator,
  onDeleteRequest,
  onToggleOperator,
  loading = false
}) => {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [districtFilter, setDistrictFilter] = useState('all');

  const filteredOperators = operators.filter(op => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || (
      op.full_name.toLowerCase().includes(q) ||
      op.email.toLowerCase().includes(q) ||
      (op.phone && op.phone.includes(q))
    );
    const matchesDistrict = districtFilter === 'all' || op.district === districtFilter;
    return matchesSearch && matchesDistrict;
  });

  const districts = Array.from(new Set(operators.map(o => o.district))).filter(Boolean);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#18232D] tracking-tight">
            Certified Operator Management
          </h1>
          <p className="text-xs sm:text-sm text-[#5B6470] mt-1">
            Manage certified citizen filing operators, monitor real-time active statuses, and configure district desks.
          </p>
        </div>

        <button
          onClick={onOpenAddOperator}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#159447] hover:bg-[#12803c] text-white font-bold text-xs sm:text-sm shadow-sm hover:shadow transition-all"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Register New Operator</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search operators by name, email, or phone..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-[#159447]/30"
            />
          </div>

          <select
            value={districtFilter}
            onChange={e => setDistrictFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 font-semibold text-slate-700"
          >
            <option value="all">All Districts ({operators.length})</option>
            {districts.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Operator Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOperators.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-200/80">
            <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            No operators found matching your search.
          </div>
        ) : (
          filteredOperators.map(op => (
            <div
              key={op.id}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-[#159447] transition flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-[#18232D] text-[#159447] font-black text-lg flex items-center justify-center shadow-xs">
                    {op.full_name.slice(0, 2).toUpperCase()}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onEditOperator(op)}
                      className="p-1.5 rounded-lg border border-slate-200 hover:border-slate-400 text-slate-700 bg-white hover:bg-slate-50 transition"
                      title="Edit Operator Profile"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteRequest(op)}
                      className="p-1.5 rounded-lg border border-red-200 hover:border-red-400 text-red-600 bg-red-50/50 hover:bg-red-50 transition"
                      title="Delete Operator"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mt-3">
                  <h3 className="font-extrabold text-base text-[#18232D]">{op.full_name}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-semibold">{op.district}, Gujarat</span>
                  </div>
                </div>

                <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs space-y-1.5 text-slate-600">
                  <div className="flex items-center gap-1.5 font-mono truncate">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{op.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{op.phone || '+91 98250 00000'}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Queue Load</span>
                  <span className="font-black text-xs text-[#18232D]">{op.assigned_count} active</span>
                </div>

                {/* Active Toggle Switch */}
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-bold ${op.is_active ? 'text-[#159447]' : 'text-slate-400'}`}>
                    {op.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <button
                    type="button"
                    onClick={() => onToggleOperator(op.id)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      op.is_active ? 'bg-[#159447]' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        op.is_active ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
