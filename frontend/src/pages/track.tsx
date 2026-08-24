import { useEffect, useState } from 'react';
import Head from 'next/head';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useLanguage } from '@/i18n/LanguageContext';
import { ApiService } from '@/lib/api';
import { FormSubmission } from '@/lib/types';
import { downloadCertificatePdf, downloadReceiptPdf } from '@/lib/certificatePdf';
import {
  Search,
  FileText,
  Clock,
  CheckCircle2,
  Loader2,
  Download,
  Award
} from 'lucide-react';

const STATUS_COLOR: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-500 border-slate-200',
  submitted: 'bg-blue-50 text-blue-700 border-blue-200',
  in_review: 'bg-amber-50 text-amber-700 border-amber-200',
  operator_filling: 'bg-purple-50 text-purple-700 border-purple-200',
  awaiting_otp: 'bg-orange-50 text-orange-700 border-orange-200',
  otp_received: 'bg-blue-50 text-blue-700 border-blue-200',
  submitted_to_govt_portal: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  approved: 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold',
  rejected: 'bg-red-50 text-red-700 border-red-200',
};

export default function TrackPage() {
  const { t, language } = useLanguage();
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'approved' | 'in_progress'>('all');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  useEffect(() => {
    const user = ApiService.getCurrentUser();
    if (!user) {
      // Auto-login as demo citizen
      ApiService.login('citizen@formseva.in', 'citizen', 'Gujarat Citizen', '9999999999')
        .then(() => ApiService.getMySubmissions())
        .then(setSubmissions)
        .finally(() => setLoading(false));
    } else {
      ApiService.getMySubmissions().then(setSubmissions).finally(() => setLoading(false));
    }

    const handleUpdate = () => {
      ApiService.getMySubmissions().then(setSubmissions);
    };
    window.addEventListener('formseva_data_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('formseva_data_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const getStatusLabel = (status: string) => {
    const map: Record<string, Record<string, string>> = {
      draft: { gu: 'ડ્રાફ્ટ', hi: 'ड्राफ्ट', en: 'Draft' },
      submitted: { gu: t.statusSubmitted, hi: t.statusSubmitted, en: t.statusSubmitted },
      in_review: { gu: t.statusInReview, hi: t.statusInReview, en: t.statusInReview },
      operator_filling: { gu: t.statusOperatorFilling, hi: t.statusOperatorFilling, en: t.statusOperatorFilling },
      awaiting_otp: { gu: t.statusAwaitingOtp, hi: t.statusAwaitingOtp, en: t.statusAwaitingOtp },
      submitted_to_govt_portal: { gu: 'સરકારી પોર્ટલ પર ફાઇલ થયેલ', hi: 'सरकारी पोर्टल पर दर्ज', en: 'Filed on Govt Portal' },
      approved: { gu: t.statusApproved, hi: t.statusApproved, en: t.statusApproved },
      rejected: { gu: t.statusRejected, hi: t.statusRejected, en: t.statusRejected },
    };
    return map[status]?.[language] ?? status;
  };

  const getTitle = (s: FormSubmission) =>
    language === 'gu' ? s.form_title_gu : language === 'hi' ? s.form_title_hi : s.form_title_en;

  const filtered = submissions.filter(s => {
    const matchesQuery =
      getTitle(s).toLowerCase().includes(query.toLowerCase()) ||
      s.application_number.toLowerCase().includes(query.toLowerCase()) ||
      (s.govt_portal_application_id && s.govt_portal_application_id.toLowerCase().includes(query.toLowerCase()));

    if (!matchesQuery) return false;

    if (activeTab === 'approved') return s.status === 'approved';
    if (activeTab === 'in_progress') return s.status !== 'approved' && s.status !== 'rejected';
    return true;
  });

  const handleDownloadCertificate = (sub: FormSubmission) => {
    // If operator uploaded a specific certificate file
    if (sub.certificate_url) {
      const link = document.createElement('a');
      link.href = sub.certificate_url;
      link.download = sub.certificate_file_name || `${sub.form_slug}_${sub.application_number}_certificate.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast(
        language === 'gu'
          ? 'પ્રમાણપત્ર PDF ડાઉનલોડ થઈ રહ્યું છે...'
          : language === 'hi'
          ? 'प्रमाण पत्र PDF डाउनलोड हो रहा है...'
          : 'Downloading Certificate PDF...'
      );
      return;
    }

    // Generate digitally signed official PDF
    showToast(
      language === 'gu'
        ? 'પ્રમાણપત્ર PDF જનરેટ થઈ રહ્યું છે...'
        : language === 'hi'
        ? 'प्रमाण पत्र PDF जनरेट हो रहा है...'
        : 'Generating Certificate PDF...'
    );
    downloadCertificatePdf(sub, language);
  };

  const handleDownloadReceipt = (sub: FormSubmission) => {
    showToast(
      language === 'gu'
        ? 'અરજી રસીદ PDF ડાઉનલોડ થઈ રહી છે...'
        : language === 'hi'
        ? 'आवेदन रसीद PDF डाउनलोड हो रही है...'
        : 'Downloading Application Receipt PDF...'
    );
    downloadReceiptPdf(sub, language);
  };

  const approvedCount = submissions.filter(s => s.status === 'approved' || Boolean(s.certificate_url)).length;

  return (
    <>
      <Head>
        <title>{t.trackApplication} — Form_Seva Gujarat</title>
      </Head>
      <Navbar />

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5">
          <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <span className="text-sm font-medium">{toastMsg}</span>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        {/* Page Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {t.navMyForms}
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              {language === 'gu'
                ? 'તમારી અરજીઓનું લાઈવ સ્ટેટસ અને મંજૂર પ્રમાણપત્ર ડાઉનલોડ કરો'
                : language === 'hi'
                ? 'अपने आवेदनों की लाइव स्थिति और स्वीकृत प्रमाण पत्र डाउनलोड करें'
                : 'Track your live applications and download approved government certificates'}
            </p>
          </div>

          {approvedCount > 0 && (
            <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3.5 py-1.5 rounded-xl text-xs font-semibold">
              <Award className="w-4 h-4 text-emerald-600" />
              <span>
                {approvedCount} {language === 'gu' ? 'પ્રમાણપત્ર તૈયાર છે' : language === 'hi' ? 'प्रमाण पत्र तैयार है' : 'Certificate Ready for PDF Download'}
              </span>
            </div>
          )}
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
          {/* Tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 self-start">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'all'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {language === 'gu' ? 'બધી અરજીઓ' : language === 'hi' ? 'सभी आवेदन' : 'All Forms'} ({submissions.length})
            </button>
            <button
              onClick={() => setActiveTab('approved')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'approved'
                  ? 'bg-white text-emerald-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-emerald-600" />
              {language === 'gu' ? 'મંજૂર / તૈયાર PDF' : language === 'hi' ? 'स्वीकृत / PDF' : 'Ready (PDF)'} ({approvedCount})
            </button>
            <button
              onClick={() => setActiveTab('in_progress')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'in_progress'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {language === 'gu' ? 'ચાલુ અરજીઓ' : language === 'hi' ? 'प्रक्रियाधीन' : 'In Progress'}
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={
                language === 'gu'
                  ? 'અરજી નંબર અથવા નામ શોધો...'
                  : language === 'hi'
                  ? 'आवेदन नंबर या नाम खोजें...'
                  : 'Search by app no. or name...'
              }
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-govt-300 outline-none text-xs bg-white"
            />
          </div>
        </div>

        {/* Content list */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200">
            <Loader2 className="w-8 h-8 animate-spin text-govt-600 mb-3" />
            <p className="text-xs text-slate-500">
              {language === 'gu' ? 'અરજીઓ લોડ થઈ રહી છે...' : language === 'hi' ? 'आवेदन लोड हो रहे हैं...' : 'Loading applications...'}
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white border border-slate-200 rounded-2xl">
            <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="text-base font-semibold text-slate-700">
              {language === 'gu' ? 'કોઈ અરજી મળી નથી' : language === 'hi' ? 'कोई आवेदन नहीं मिला' : 'No applications found'}
            </p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {query ? 'Try adjusting your search criteria.' : 'You have not submitted any certificate applications yet.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(sub => {
              const isApproved = sub.status === 'approved';
              const hasPdf = Boolean(
                sub.certificate_url ||
                isApproved ||
                sub.documents?.some(d => d.document_type_key === 'operator_certificate' || d.document_type_key === 'certificate')
              );

              return (
                <div
                  key={sub.id}
                  className={`bg-white border rounded-2xl p-5 sm:p-6 transition-all hover:shadow-md ${
                    isApproved
                      ? 'border-emerald-200 ring-1 ring-emerald-100'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    
                    {/* Left Side: Icon, Title, Status & Details */}
                    <div className="flex items-start gap-3.5 min-w-0 flex-1">
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                          isApproved
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-govt-100 text-govt-700'
                        }`}
                      >
                        {isApproved ? (
                          <Award className="w-6 h-6 text-emerald-700" />
                        ) : (
                          <FileText className="w-5 h-5" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        {/* Title and Status Badge */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-slate-900 text-base sm:text-lg">
                            {getTitle(sub)}
                          </p>
                          <span
                            className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                              STATUS_COLOR[sub.status] ?? 'bg-slate-100 text-slate-500 border-slate-200'
                            }`}
                          >
                            {getStatusLabel(sub.status)}
                          </span>
                        </div>

                        {/* Application ID & Govt Ref */}
                        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mt-1 flex-wrap">
                          <span>App ID: {sub.application_number}</span>
                          {sub.govt_portal_application_id && (
                            <>
                              <span>&bull;</span>
                              <span className="text-slate-600 font-semibold">Govt Ref: {sub.govt_portal_application_id}</span>
                            </>
                          )}
                        </div>

                        {/* Details Strip */}
                        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-amber-500" />
                            {new Date(sub.submitted_at).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>

                          <span>
                            Fee: <strong className="text-slate-800 font-semibold">₹{sub.total_fee}</strong> (
                            <span
                              className={
                                sub.payment_status === 'paid'
                                  ? 'text-emerald-700 font-bold'
                                  : 'text-amber-600 font-semibold'
                              }
                            >
                              {sub.payment_status.toUpperCase()}
                            </span>
                            )
                          </span>

                          {sub.assigned_operator_name && (
                            <span>
                              Operator: <strong className="text-slate-700">{sub.assigned_operator_name}</strong>
                            </span>
                          )}

                          <button
                            onClick={() => handleDownloadReceipt(sub)}
                            className="text-slate-600 hover:text-slate-900 font-medium underline flex items-center gap-1 cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5 text-slate-400" />
                            {language === 'gu' ? 'રસીદ (Receipt)' : language === 'hi' ? 'रसीद' : 'Receipt'}
                          </button>
                        </div>

                        {/* Operator Notes if any */}
                        {sub.operator_notes && (
                          <div className="mt-2.5 text-xs bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-slate-600">
                            <strong className="text-slate-700">
                              {language === 'gu' ? 'ઓપરેટર નોંધ:' : language === 'hi' ? 'ऑपरेटर टिप्पणी:' : 'Operator Note:'}
                            </strong>{' '}
                            {sub.operator_notes}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Middle of Right Side: Simple Download Button if PDF uploaded by operator / approved */}
                    {hasPdf && (
                      <div className="flex items-center justify-start md:justify-center self-start md:self-center shrink-0 pl-14 md:pl-0">
                        <button
                          onClick={() => handleDownloadCertificate(sub)}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs sm:text-sm font-bold transition shadow-sm hover:shadow active:scale-95 cursor-pointer"
                        >
                          <Download className="w-4 h-4" />
                          <span>{language === 'gu' ? 'ડાઉનલોડ કરો' : language === 'hi' ? 'डाउनलोड करें' : 'Download'}</span>
                        </button>
                      </div>
                    )}

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
