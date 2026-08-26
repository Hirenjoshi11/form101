import React, { useState } from 'react';
import {
  Plus,
  Layers,
  Edit2,
  Trash2,
  Search,
  CheckCircle2,
  Clock,
  IndianRupee,
  AlertCircle
} from 'lucide-react';
import { CertificateForm } from '@/lib/types';
import { useLanguage } from '@/i18n/LanguageContext';
import { FormIcon } from '@/components/FormIcon';

interface FormsTabProps {
  formsList: CertificateForm[];
  onOpenCreateForm: () => void;
  onEditForm: (form: CertificateForm) => void;
  onDeleteRequest: (form: CertificateForm) => void;
  onToggleFormActive: (formId: string) => void;
  loading?: boolean;
}

export const FormsTab: React.FC<FormsTabProps> = ({
  formsList,
  onOpenCreateForm,
  onEditForm,
  onDeleteRequest,
  onToggleFormActive,
  loading = false
}) => {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredForms = formsList.filter(f => {
    const q = searchQuery.toLowerCase().trim();
    return !q || (
      f.title_en.toLowerCase().includes(q) ||
      f.title_gu.toLowerCase().includes(q) ||
      f.slug.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#18232D] tracking-tight">
            Government Services, Fields & Rate Editor
          </h1>
          <p className="text-xs sm:text-sm text-[#5B6470] mt-1">
            Configure dynamic fields, official government fees, operator assistance fees, and public citizen visibility.
          </p>
        </div>

        <button
          onClick={onOpenCreateForm}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#159447] hover:bg-[#12803c] text-white font-bold text-xs sm:text-sm shadow-sm hover:shadow transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add New Service</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search forms by title or slug..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-[#159447]/30"
          />
        </div>
      </div>

      {/* Forms Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredForms.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-200/80">
            <Layers className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            No government forms match your search.
          </div>
        ) : (
          filteredForms.map(form => {
            const isFormActive = form.is_active !== false;
            return (
              <div
                key={form.id}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-[#159447] transition flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FormIcon slug={form.slug} size="md" />
                      <div className="min-w-0">
                        <h3 className="font-extrabold text-sm text-[#18232D] truncate" title={form.title_en}>
                          {form.title_en}
                        </h3>
                        <p className="text-xs text-[#159447] font-semibold truncate">{form.title_gu}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => onEditForm(form)}
                        className="p-1.5 rounded-lg border border-slate-200 hover:border-slate-400 text-slate-700 bg-white hover:bg-slate-50 transition"
                        title="Edit Form & Rates"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteRequest(form)}
                        className="p-1.5 rounded-lg border border-red-200 hover:border-red-400 text-red-600 bg-red-50/50 hover:bg-red-50 transition"
                        title="Delete Form"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-2 mt-3 leading-relaxed">
                    {form.description_en}
                  </p>

                  <div className="mt-3 grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Total Citizen Fee:</span>
                      <span className="font-bold text-[#159447] text-sm">
                        ₹{form.official_fee + form.service_fee}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        (₹{form.official_fee} govt + ₹{form.service_fee} fee)
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px]">Turnaround SLA:</span>
                      <span className="font-bold text-slate-800 text-sm">
                        {form.turnaround_days || 3} Days
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {form.fields?.length || 0} fields configured
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-[11px] text-slate-500">
                    Visibility: <strong className={isFormActive ? 'text-[#159447]' : 'text-slate-400'}>
                      {isFormActive ? '🟢 Live for Citizens' : '⚪ Hidden / Paused'}
                    </strong>
                  </div>

                  {/* Public Citizen Toggle Switch */}
                  <button
                    type="button"
                    onClick={() => onToggleFormActive(form.id)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      isFormActive ? 'bg-[#159447]' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        isFormActive ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
