'use client';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useLanguage } from '@/i18n/LanguageContext';
import { ApiService } from '@/lib/api';
import { CertificateForm } from '@/lib/types';
import { FormIcon } from '@/components/FormIcon';
import { Clock, IndianRupee, ChevronRight } from 'lucide-react';

export default function FormsPage() {
  const { t, language } = useLanguage();
  const [forms, setForms] = useState<CertificateForm[]>([]);
  const [loading, setLoading] = useState(true);

  const loadForms = () => {
    ApiService.getForms().then(setForms).finally(() => setLoading(false));
  };

  useEffect(() => {
    loadForms();

    const handleUpdate = () => {
      loadForms();
    };

    window.addEventListener('formseva_data_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('formseva_data_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const getTitle = (f: CertificateForm) =>
    language === 'gu' ? f.title_gu : language === 'hi' ? f.title_hi : f.title_en;
  const getDesc = (f: CertificateForm) =>
    language === 'gu' ? f.description_gu : language === 'hi' ? f.description_hi : f.description_en;
  const getDept = (f: CertificateForm) =>
    language === 'gu' ? f.department_name_gu : language === 'hi' ? f.department_name_hi : f.department_name_en;

  return (
    <>
      <Head>
        <title>All Certificates — Form_Seva Gujarat</title>
        <meta name="description" content="Browse all available Gujarat government certificates and apply online." />
      </Head>
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">
            {language === 'gu' ? 'ઉપલબ્ધ સેવાઓ' : language === 'hi' ? 'उपलब्ध सेवाएं' : 'Available Certificates'}
          </h1>
          <p className="text-slate-500">
            {language === 'gu'
              ? 'ઘરે બેઠા ઓનલાઈન ભરો — ઓપરેટર સરકારી પોર્ટલ પર ફઈ'
              : language === 'hi'
              ? 'घर से ऑनलाइन भरें — ऑपरेटर सरकारी पोर्टल पर फाइल करेंगे'
              : 'Apply from home — operators file on official Govt portals'}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-56 bg-slate-100 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {forms.filter(f => f.is_active).map((form) => (
              <Link
                key={form.id}
                href={`/forms/${form.slug}`}
                className="group relative bg-white border border-slate-200 hover:border-govt-400 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-br from-govt-50 to-transparent rounded-2xl pointer-events-none" />
                <div className="flex items-start justify-between mb-4">
                  <FormIcon slug={form.slug} size="md" />
                  <div className="text-right">
                    <div className="text-xs text-slate-400">{t.totalFeeLabel}</div>
                    <div className="text-xl font-extrabold text-slate-900">
                      ₹{form.official_fee + form.service_fee}
                    </div>
                  </div>
                </div>

                <h2 className="font-bold text-lg text-slate-900 mb-1">{getTitle(form)}</h2>
                <p className="text-xs text-govt-700 font-semibold mb-2">{getDept(form)}</p>
                <p className="text-sm text-slate-500 line-clamp-2 mb-4">{getDesc(form)}</p>

                <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      {form.turnaround_days} {language === 'gu' ? 'દિ' : language === 'hi' ? 'दिन' : 'days'}
                    </span>
                    <span className="flex items-center gap-1">
                      <IndianRupee className="w-3.5 h-3.5 text-govt-600" />
                      {language === 'gu' ? 'ફી' : language === 'hi' ? 'फीस' : 'Fees'}: ₹{form.official_fee}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-govt-700 flex items-center gap-1 group-hover:gap-2 transition-all">
                    {t.applyNow} <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </>
  );
}
