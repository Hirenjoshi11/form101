import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useLanguage } from '@/i18n/LanguageContext';
import { Clock, CheckCircle2, ChevronRight } from 'lucide-react';
import { FormIcon } from '@/components/FormIcon';
import { ApiService, mockForms } from '@/lib/api';
import { CertificateForm } from '@/lib/types';

export default function RatesPage() {
  const { language } = useLanguage();
  const [formsList, setFormsList] = useState<CertificateForm[]>(mockForms);
  const [loading, setLoading] = useState(true);

  const loadRates = async () => {
    try {
      const data = await ApiService.getForms();
      setFormsList(data);
    } catch (e) {
      setFormsList(mockForms);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRates();

    const handleUpdate = () => {
      loadRates();
    };

    window.addEventListener('formseva_data_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('formseva_data_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const getTitle = (r: CertificateForm) =>
    language === 'gu' ? r.title_gu : language === 'hi' ? r.title_hi : r.title_en;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Head>
        <title>Fee Rate Card — FormSeva Gujarat</title>
        <meta name="description" content="Transparent government and service fees for all Gujarat certificate types on FormSeva." />
      </Head>
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {language === 'gu' ? 'સરકારી અને સેવા દર પત્રક' : language === 'hi' ? 'शुल्क दर सूची' : 'Official Rates & Fees'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {language === 'gu'
              ? 'સંપૂર્ણ પારદર્શક ફી — સરકારી ફી + સહાયતા ફી — કોઈ છૂપા ચાર્જ નહીં.'
              : language === 'hi'
              ? 'पूर्ण पारदर्शी शुल्क — सरकारी शुल्क + सहायता शुल्क — कोई छुपा शुल्क नहीं।'
              : 'Transparent fees: Official Gujarat Govt fee + assisted filing fee — zero hidden charges.'}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider">
                  <th className="px-5 py-3">Certificate / Service</th>
                  <th className="px-4 py-3 text-right">Govt Fee</th>
                  <th className="px-4 py-3 text-right">Service Fee</th>
                  <th className="px-4 py-3 text-right font-black text-slate-900">Total</th>
                  <th className="px-4 py-3 text-center">Turnaround</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {formsList.filter(f => f.is_active).map((r) => (
                  <tr key={r.slug || r.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <FormIcon slug={r.slug} size="sm" />
                        <div>
                          <span className="font-bold text-slate-900 block text-xs sm:text-sm">{getTitle(r)}</span>
                          <span className="text-[11px] text-emerald-700 font-semibold">{r.department_name_en}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right text-slate-600 font-mono">₹{r.official_fee}</td>
                    <td className="px-4 py-3.5 text-right text-emerald-700 font-mono font-semibold">₹{r.service_fee}</td>
                    <td className="px-4 py-3.5 text-right font-black text-slate-900 font-mono text-sm">
                      ₹{r.official_fee + r.service_fee}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className="inline-flex items-center gap-1 text-slate-500 font-semibold">
                        <Clock className="w-3 h-3 text-amber-500" />
                        {r.turnaround_days}d
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        href={`/forms/${r.slug}`}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-[#159447] hover:bg-[#12803c] text-white text-[11px] font-bold shadow-2xs transition"
                      >
                        <span>Apply</span>
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-3.5 text-xs text-emerald-900 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#159447] shrink-0" />
          <span>
            {language === 'gu'
              ? 'સરકારી ફી ગુજરાત સરકારના સત્તાવાર પોર્ટલ મુજબ જ લેવામાં આવે છે.'
              : language === 'hi'
              ? 'सरकारी शुल्क गुजरात सरकार के अधिकृत नियमों के अनुसार है।'
              : 'Official government fees are matched directly with Digital Gujarat & AnyRoR notifications.'}
          </span>
        </div>
      </main>

      <Footer />
    </div>
  );
}
