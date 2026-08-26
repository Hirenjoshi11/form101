import React from 'react';
import Link from 'next/link';
import {
  Activity,
  Receipt,
  FileText,
  Users,
  Layers,
  MessageSquare,
  ShieldCheck,
  ArrowLeft,
  UserCheck
} from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

export type AdminTabId = 'overview' | 'billing' | 'submissions' | 'operators' | 'forms' | 'feedback' | 'audit';

interface AdminSideNavProps {
  activeTab: AdminTabId;
  onSelectTab: (tab: AdminTabId) => void;
  badges?: {
    submissions?: number | string | null;
    feedback?: number | string | null;
    operators?: number | string | null;
  };
}

export const AdminSideNav: React.FC<AdminSideNavProps> = ({
  activeTab,
  onSelectTab,
  badges = {}
}) => {
  const { language } = useLanguage();

  const navItems = [
    {
      id: 'overview' as AdminTabId,
      label: language === 'gu' ? 'ઝાંખી' : 'Overview',
      icon: Activity,
      color: 'text-blue-500',
      bg: 'bg-blue-50',
      badge: null
    },
    {
      id: 'billing' as AdminTabId,
      label: language === 'gu' ? 'બિલિંગ' : 'Billing & Revenue',
      icon: Receipt,
      color: 'text-violet-500',
      bg: 'bg-violet-50',
      badge: null
    },
    {
      id: 'submissions' as AdminTabId,
      label: language === 'gu' ? 'અરજીઓ' : 'Submissions',
      icon: FileText,
      color: 'text-amber-500',
      bg: 'bg-amber-50',
      badge: badges.submissions
    },
    {
      id: 'operators' as AdminTabId,
      label: language === 'gu' ? 'ઓપરેટર્સ' : 'Operators',
      icon: Users,
      color: 'text-cyan-500',
      bg: 'bg-cyan-50',
      badge: badges.operators
    },
    {
      id: 'forms' as AdminTabId,
      label: language === 'gu' ? 'ફોર્મ્સ & દર' : 'Forms & Rates',
      icon: Layers,
      color: 'text-orange-500',
      bg: 'bg-orange-50',
      badge: null
    },
    {
      id: 'feedback' as AdminTabId,
      label: language === 'gu' ? 'પ્રતિસાદ' : 'Feedback',
      icon: MessageSquare,
      color: 'text-pink-500',
      bg: 'bg-pink-50',
      badge: badges.feedback
    },
    {
      id: 'audit' as AdminTabId,
      label: language === 'gu' ? 'ઓડિટ લોગ' : 'Audit Logs',
      icon: ShieldCheck,
      color: 'text-[#159447]',
      bg: 'bg-[#EAF6EE]',
      badge: null
    },
  ];

  return (
    <>
      {/* ─── DESKTOP LEFT SIDEBAR ─── */}
      <aside className="hidden md:flex flex-col w-60 shrink-0 bg-white border-r border-slate-200/80 sticky top-[80px] h-[calc(100vh-80px)] overflow-y-auto">
        {/* Admin identity badge */}
        <div className="px-5 pt-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#18232D] flex items-center justify-center shrink-0 shadow-2xs">
              <ShieldCheck className="w-5 h-5 text-[#159447]" />
            </div>
            <div>
              <p className="text-[11px] font-black text-[#18232D] uppercase tracking-wider leading-tight">Admin Console</p>
              <p className="text-[10px] text-[#5B6470] mt-0.5">Gujarat State</p>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          <p className="px-3 pb-2 text-[10px] font-black text-[#5B6470] uppercase tracking-widest">Main Menu</p>
          {navItems.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all group ${
                  isActive
                    ? 'bg-[#18232D] text-white shadow-sm'
                    : 'text-[#5B6470] hover:bg-slate-100 hover:text-[#18232D]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                    isActive ? 'bg-white/10 text-white' : `${tab.bg} ${tab.color}`
                  }`}>
                    <Icon className="w-4 h-4" />
                  </span>
                  <span className="text-[13px] leading-tight truncate">{tab.label}</span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  {tab.badge && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#159447] shrink-0" />
                  )}
                </div>
              </button>
            );
          })}

          <div className="pt-4 mt-2 border-t border-slate-100 space-y-0.5">
            <p className="px-3 pb-2 text-[10px] font-black text-[#5B6470] uppercase tracking-widest">Quick Links</p>
            <Link
              href="/"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold text-[#5B6470] hover:bg-slate-100 hover:text-[#18232D] transition-all"
            >
              <span className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                <ArrowLeft className="w-4 h-4 text-slate-500" />
              </span>
              Citizen Portal
            </Link>
            <Link
              href="/operator"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold text-[#5B6470] hover:bg-[#EAF6EE] hover:text-[#159447] transition-all"
            >
              <span className="w-7 h-7 rounded-lg bg-[#EAF6EE] flex items-center justify-center shrink-0">
                <UserCheck className="w-4 h-4 text-[#159447]" />
              </span>
              Operator Portal
            </Link>
          </div>
        </nav>

        {/* Bottom status */}
        <div className="px-5 py-4 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#159447] animate-pulse" />
            <span className="text-[11px] text-[#5B6470] font-semibold">System Online</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">FormSeva Gujarat v1.0.0</p>
        </div>
      </aside>

      {/* ─── MOBILE HORIZONTAL SCROLL NAV ─── */}
      <div className="md:hidden flex items-center gap-1.5 px-4 py-2 overflow-x-auto border-b border-slate-200 bg-white sticky top-16 z-30 scrollbar-none">
        {navItems.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap text-xs font-bold transition ${
                isActive
                  ? 'bg-[#18232D] text-white shadow-2xs'
                  : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-white/20 text-white font-bold">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </>
  );
};
