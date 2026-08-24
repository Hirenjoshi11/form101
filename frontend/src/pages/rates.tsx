import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useLanguage } from '@/i18n/LanguageContext';
import { IndianRupee, Clock, CheckCircle2 } from 'lucide-react';
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

  const getDocsSummary = (r: CertificateForm) => {
    if (r.required_docs_json && r.required_docs_json.length > 0) {
      return r.required_docs_json
        .map(d => (language === 'gu' ? d.label_gu : language === 'hi' ? d.label_hi : d.label_en))
        .join(', ');
    }
    return 'Aadhaar, Ration Card, Address Proof';
  };

  return (
    <>
      <Head>
        <title>
          {language === 'gu' ? 'સરકારી અને સેવા દર — Form_Seva Gujarat' :
           language === 'hi' ? 'सरकारी व सेवा दर — Form_Seva Gujarat' :
           'Rates & Fees — Form_Seva Gujarat'}
        </title>
        <meta name="description" content="Transparent government and service fees for all Gujarat certificate types on Form_Seva." />
      </Head>
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">
          {language === 'gu' ? 'સરકારી અને સહાયતા સેવા દર પત્રક' :
           language === 'hi' ? 'सरकारी व सेवा शुल्क सूची' :
           'Government & Service Rate Card'}
        </h1>
        <p className="text-slate-500 mb-8 max-w-2xl">
          {language === 'gu'
            ? 'ફોર્મ સેવા સંપૂર્ણ પારદર્શક ફી ઓફર કરે છે. સરકારી ફી (Gujarat Govt) + સહાયતા ફી — કોઈ છૂપા ચાર્જ નહીં.'
            : language === 'hi'
            ? 'Form_Seva पूरी तरह पारदर्शी शुल्क लेता है। सरकारी फीस + सहायता शुल्क — कोई छुपा शुल्क नहीं।'
            : 'Form_Seva offers fully transparent fees. Government fee (Gujarat Govt) + our assisted filing fee — zero hidden charges.'}
        </p>

        <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-govt-800 text-white">
                <th className="text-left px-5 py-3 font-semibold">
                  {language === 'gu' ? 'પ્રમાણપત્ર' : language === 'hi' ? 'प्रमाण पत्र' : 'Certificate'}
                </th>
                <th className="text-right px-5 py-3 font-semibold">
                  {language === 'gu' ? 'સ.ફી' : language === 'hi' ? 'सरकारी शुल्क' : 'Govt Fee'}
                </th>
                <th className="text-right px-5 py-3 font-semibold">
                  {language === 'gu' ? 'સેવા ફી' : language === 'hi' ? 'सेवा शुल्क' : 'Service Fee'}
                </th>
                <th className="text-right px-5 py-3 font-semibold">
                  {language === 'gu' ? 'કુલ' : language === 'hi' ? 'कुल' : 'Total'}
                </th>
                <th className="text-center px-5 py-3 font-semibold">
                  {language === 'gu' ? 'સમય' : language === 'hi' ? 'समय' : 'Days'}
                </th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {formsList.filter(f => f.is_active).map((r, idx) => (
                <tr key={r.slug || r.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'} hover:bg-govt-50 transition-colors border-t border-slate-100`}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <FormIcon slug={r.slug} size="sm" />
                      <div>
                        <p className="font-semibold text-slate-900">{getTitle(r)}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{getDocsSummary(r)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right font-mono text-slate-600">₹{r.official_fee}</td>
                  <td className="px-5 py-4 text-right font-mono text-saffron-700 font-semibold">₹{r.service_fee}</td>
                  <td className="px-5 py-4 text-right font-mono font-extrabold text-slate-900">₹{r.official_fee + r.service_fee}</td>
                  <td className="px-5 py-4 text-center">
                    <span className="flex items-center justify-center gap-1 text-amber-700 font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      {r.turnaround_days}d
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/forms/${r.slug}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-white bg-govt-700 hover:bg-govt-800 px-3.5 py-1.5 rounded-lg transition"
                    >
                      {language === 'gu' ? 'અરજી' : language === 'hi' ? 'अप्लाई' : 'Apply'}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 bg-govt-50 border border-govt-200 rounded-2xl p-4 flex items-start gap-2 text-sm text-govt-700 shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-govt-600 shrink-0 mt-0.5" />
          <span>
            {language === 'gu'
              ? 'ઉપરોક્ત ફીઓ ડ્રાફ્ટ ગણી – સ. ગ. ફી ગુજરાત સરકારના VO/DRA મૂલ્ય ઉપર આધારિત છે.'
              : language === 'hi'
              ? 'उपरोक्त शुल्क अनुमानित हैं। सरकारी शुल्क गुजरात सरकार की अधिसूचना पर निर्भर है।'
              : 'Fees above are indicative. Official government fees are per Gujarat Govt notified rates and may vary by district.'}
          </span>
        </div>
      </div>
      <Footer />
    </>
  );
}
