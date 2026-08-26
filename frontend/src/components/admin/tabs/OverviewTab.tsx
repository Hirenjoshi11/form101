import React from 'react';
import {
  FileText,
  Users,
  CheckCircle2,
  Clock,
  UserPlus,
  Plus,
  ArrowUpRight,
  TrendingUp,
  Activity,
  Award,
  Layers,
  Sparkles
} from 'lucide-react';
import { AdminStats, Operator, FormSubmission, CertificateForm } from '@/lib/types';
import { useLanguage } from '@/i18n/LanguageContext';
import { FormIcon } from '@/components/FormIcon';

interface OverviewTabProps {
  stats: AdminStats | null;
  operators: Operator[];
  submissions: FormSubmission[];
  formsList: CertificateForm[];
  onOpenAddOperator: () => void;
  onOpenCreateForm: () => void;
  onSelectSubmission: (sub: FormSubmission) => void;
  getStatusBadge: (status: string) => { bg: string; label: string };
  loading?: boolean;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  stats,
  operators,
  submissions,
  formsList,
  onOpenAddOperator,
  onOpenCreateForm,
  onSelectSubmission,
  getStatusBadge,
  loading = false
}) => {
  const { language } = useLanguage();

  if (loading && !stats) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-slate-200 rounded-xl w-1/3" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="h-28 bg-slate-200 rounded-2xl" />
          <div className="h-28 bg-slate-200 rounded-2xl" />
          <div className="h-28 bg-slate-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  const activeOperatorsCount = operators.filter(o => o.is_active).length;
  const pendingPickupCount = submissions.filter(s => s.status === 'submitted' || s.status === 'resubmitted').length;

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Header Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#18232D] tracking-tight">
            {language === 'gu' ? 'વહીવટી ડેશબોર્ડ' : 'Administrative Operations Dashboard'}
          </h1>
          <p className="text-xs sm:text-sm text-[#5B6470] mt-1">
            Live analytics, operator queues, and revenue metrics across Gujarat citizen services.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenAddOperator}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#159447] hover:bg-[#12803c] text-white font-bold text-xs sm:text-sm shadow-sm hover:shadow transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Register Operator</span>
          </button>
          <button
            onClick={onOpenCreateForm}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#18232D] hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add New Service</span>
          </button>
        </div>
      </div>

      {/* ─── ROW 1: 3 PRIMARY OPERATIONAL KPI CARDS ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Card 1: Total Applications */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5B6470] uppercase tracking-wider">Total Applications</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-[#18232D]">
              {stats?.total_submissions || submissions.length}
            </span>
            <span className="text-xs font-bold text-[#159447] flex items-center gap-1 bg-[#EAF6EE] px-2 py-0.5 rounded-full">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Active</span>
            </span>
          </div>
          <p className="text-[11px] text-[#5B6470] pt-1 border-t border-slate-100">
            Across {formsList.length} Gujarat official certificate schemes
          </p>
        </div>

        {/* Card 2: Active Operators */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5B6470] uppercase tracking-wider">Certified Operators</span>
            <div className="w-9 h-9 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-[#18232D]">
              {activeOperatorsCount} / {operators.length}
            </span>
            <span className="text-xs font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-full">
              Online
            </span>
          </div>
          <p className="text-[11px] text-[#5B6470] pt-1 border-t border-slate-100">
            Certified across Gujarat districts
          </p>
        </div>

        {/* Card 3: Completed / Approved Rate */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5B6470] uppercase tracking-wider">Approved Certificates</span>
            <div className="w-9 h-9 rounded-xl bg-[#EAF6EE] text-[#159447] flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-[#18232D]">
              {stats?.completed_submissions || submissions.filter(s => s.status === 'approved').length}
            </span>
            <span className="text-xs font-bold text-[#159447] bg-[#EAF6EE] px-2 py-0.5 rounded-full">
              {submissions.length > 0
                ? `${Math.round(((stats?.completed_submissions || submissions.filter(s => s.status === 'approved').length) / submissions.length) * 100)}% Success`
                : '100%'}
            </span>
          </div>
          <p className="text-[11px] text-[#5B6470] pt-1 border-t border-slate-100">
            Issued with official government verification
          </p>
        </div>
      </div>

      {/* ─── ROW 2: OPERATOR WORKLOAD & RECENT SUBMISSIONS ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 5 Cols: Operator Workload Summary */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#159447]" />
              <h3 className="font-extrabold text-sm text-[#18232D]">Operator Workload Status</h3>
            </div>
            <span className="text-xs font-bold text-slate-500">{operators.length} Registered</span>
          </div>

          <div className="space-y-3">
            {operators.slice(0, 5).map(op => (
              <div key={op.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 flex items-center justify-between">
                <div>
                  <div className="font-bold text-xs text-slate-900">{op.full_name}</div>
                  <div className="text-[11px] text-slate-500">📍 {op.district} • {op.assigned_count} in queue</div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                  op.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                }`}>
                  {op.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right 7 Cols: Recent Submissions */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <h3 className="font-extrabold text-sm text-[#18232D]">Recent Citizen Applications</h3>
            </div>
            <span className="text-xs font-bold text-slate-500">{submissions.length} Total</span>
          </div>

          <div className="space-y-2.5">
            {submissions.slice(0, 5).map(sub => {
              const badge = getStatusBadge(sub.status);
              return (
                <div
                  key={sub.id}
                  onClick={() => onSelectSubmission(sub)}
                  className="p-3 rounded-xl border border-slate-200/80 hover:border-[#159447] bg-white flex items-center justify-between gap-3 transition cursor-pointer"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900">{sub.application_number}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.bg}`}>
                        {badge.label}
                      </span>
                    </div>
                    <p className="text-xs font-extrabold text-slate-800 truncate mt-0.5">{sub.form_title_en}</p>
                    <p className="text-[11px] text-slate-500">Citizen: {sub.user_name || 'Applicant'}</p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-extrabold text-[#159447] block">₹{sub.total_fee}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {sub.assigned_operator_name ? `Op: ${sub.assigned_operator_name.split(' ')[0]}` : 'Unassigned'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
};
