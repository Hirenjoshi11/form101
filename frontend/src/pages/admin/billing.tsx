import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ApiService } from '@/lib/api';
import { CertificateForm, Operator } from '@/lib/types';
import { useLanguage } from '@/i18n/LanguageContext';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { AdminBillingDashboard } from '@/components/AdminBillingDashboard';
import { Footer } from '@/components/Footer';
import {
  ShieldCheck,
  Receipt,
  ArrowLeft,
  RefreshCw,
  Activity,
  FileText,
  Users,
  Layers
} from 'lucide-react';

export default function AdminBillingPage() {
  const { language } = useLanguage();
  const router = useRouter();

  const [formsList, setFormsList] = useState<CertificateForm[]>([]);
  const [operators, setOperators] = useState<Operator[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [formsData, opsData] = await Promise.all([
        ApiService.getForms(),
        ApiService.getOperators()
      ]);
      setFormsList(formsData);
      setOperators(opsData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener('formseva_data_updated', loadData);
    return () => window.removeEventListener('formseva_data_updated', loadData);
  }, []);

  return (
    <div className="min-h-screen bg-[#F7F9FB] flex flex-col font-sans">
      <Head>
        <title>
          {language === 'gu'
            ? 'બિલિંગ અને આવક એનાલિટિક્સ – FormSeva Admin'
            : 'Billing & Payment Analytics – FormSeva Admin'}
        </title>
      </Head>

      {/* Top Admin Header */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-40 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            {/* Left Brand */}
            <div className="flex items-center gap-4">
              <Link href="/admin" className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-xs border border-slate-200 p-1 group-hover:scale-105 transition-transform overflow-hidden">
                  <img src="/icon.png" alt="FormSeva" className="w-full h-full object-contain" />
                </div>
                <div>
                  <div className="font-black text-xl sm:text-2xl text-[#18232D] tracking-tight leading-none flex items-center gap-2">
                    <span>Form<span className="text-[#159447]">Seva</span></span>
                    <span className="text-[10px] uppercase font-bold tracking-wider bg-slate-900 text-white px-2 py-0.5 rounded-md">
                      BILLING
                    </span>
                  </div>
                  <p className="text-[9px] text-[#5B6470] font-bold tracking-widest uppercase mt-0.5">
                    Gujarat Revenue & Payments Console
                  </p>
                </div>
              </Link>
            </div>

            {/* Quick Navigation Tabs */}
            <nav className="hidden md:flex items-center gap-1 sm:gap-2">
              <Link
                href="/admin?tab=overview"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold text-[#5B6470] hover:text-[#18232D] hover:bg-slate-100/70 transition"
              >
                <Activity className="w-4 h-4 text-[#5B6470]" />
                <span>Overview</span>
              </Link>
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold bg-[#EAF6EE] text-[#159447] border border-emerald-200/80 shadow-2xs">
                <Receipt className="w-4 h-4 text-[#159447]" />
                <span>Billing & Payments</span>
              </div>
              <Link
                href="/admin?tab=submissions"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold text-[#5B6470] hover:text-[#18232D] hover:bg-slate-100/70 transition"
              >
                <FileText className="w-4 h-4 text-[#5B6470]" />
                <span>Submissions</span>
              </Link>
              <Link
                href="/admin?tab=operators"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold text-[#5B6470] hover:text-[#18232D] hover:bg-slate-100/70 transition"
              >
                <Users className="w-4 h-4 text-[#5B6470]" />
                <span>Operators</span>
              </Link>
              <Link
                href="/admin?tab=forms"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold text-[#5B6470] hover:text-[#18232D] hover:bg-slate-100/70 transition"
              >
                <Layers className="w-4 h-4 text-[#5B6470]" />
                <span>Forms & Rates</span>
              </Link>
            </nav>

            {/* Right Action Items */}
            <div className="flex items-center gap-3">
              <LanguageSwitcher />

              <Link
                href="/admin"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-slate-300 text-xs font-semibold text-[#5B6470] hover:text-[#18232D] hover:border-slate-400 bg-white transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Admin Main</span>
              </Link>

              <button
                onClick={loadData}
                className="p-2 rounded-xl border border-slate-200 text-[#5B6470] hover:text-[#159447] hover:bg-emerald-50 transition"
                title="Refresh Billing Data"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#159447]' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Billing Dashboard Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        <AdminBillingDashboard
          formsList={formsList}
          operatorsList={operators}
        />
      </main>

      <Footer />
    </div>
  );
}
