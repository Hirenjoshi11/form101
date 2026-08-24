import { useEffect, useState } from 'react';
import Head from 'next/head';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useLanguage } from '@/i18n/LanguageContext';
import { ApiService } from '@/lib/api';
import { FormSubmission, OtpRequest } from '@/lib/types';
import { downloadCertificatePdf, downloadReceiptPdf } from '@/lib/certificatePdf';
import { OtpModal } from '@/components/OtpModal';
import {
  Search, FileText, Clock, CheckCircle2, Loader2,
  Download, Award, KeyRound, AlertCircle, RefreshCw
} from 'lucide-react';

const STATUS_COLOR: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-500 border-slate-200',
  submitted: 'bg-blue-50 text-blue-700 border-blue-200',
  in_review: 'bg-amber-50 text-amber-700 border-amber-200',
  operator_filling: 'bg-purple-50 text-purple-700 border-purple-200',
  awaiting_otp: 'bg-orange-100 text-orange-800 border-orange-300 font-bold animate-pulse',
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

  // OTP handling
  const [activeOtpModal, setActiveOtpModal] = useState<OtpRequest | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const loadSubmissions = () => {
    const user = ApiService.getCurrentUser();
    if (!user) {
      ApiService.login('citizen@formseva.in', 'citizen', 'Gujarat Citizen', '9999999999')
        .then(() => ApiService.getMySubmissions())
        .then(setSubmissions)
        .finally(() => setLoading(false));
    } else {
      ApiService.getMySubmissions().then(setSubmissions).finally(() => setLoading(false));
    }
  };

  useEffect(() => {
    loadSubmissions();

    const handleUpdate = () => {
      loadSubmissions();
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
      awaiting_otp: { gu: 'OTP ની રાહ છે (Awaiting OTP)', hi: 'OTP प्रतीक्षित', en: 'Awaiting OTP' },
      otp_received: { gu: 'OTP મળેલ છે', hi: 'OTP प्राप्त', en: 'OTP Submitted' },
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
    if (sub.certificate_url) {
      const link = document.createElement('a');
      link.href = sub.certificate_url;
      link.download = sub.certificate_file_name || `${sub.form_slug}_${sub.application_number}_certificate.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Downloading Certificate PDF...');
      return;
    }
    showToast('Generating Certificate PDF...');
    downloadCertificatePdf(sub, language);
  };

  const handleDownloadReceipt = (sub: FormSubmission) => {
    showToast('Downloading Application Receipt...');
    downloadReceiptPdf(sub, language);
  };

  const handleOpenOtp = (sub: FormSubmission) => {
    setActiveOtpModal({
      id: `otp_${sub.id}`,
      submission_id: sub.id,
      operator_id: sub.assigned_operator_id || 'operator_1',
      otp_sequence_number: 1,
      otp_purpose_en: 'Digital Gujarat Portal Assisted Verification',
      otp_purpose_gu: 'ડિજિટલ ગુજરાત પોર્ટલ ચકાસણી માટે OTP',
      otp_purpose_hi: 'डिजिटल गुजरात पोर्टल सत्यापन हेतु OTP',
      status: 'requested',
      requested_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 10 * 60000).toISOString(),
    });
  };

  const handleSubmitOtp = async (code: string) => {
    if (!activeOtpModal) return;
    try {
      await ApiService.submitOtp(activeOtpModal.id, code);
      showToast('OTP Submitted successfully to Operator!');
      setActiveOtpModal(null);
      loadSubmissions();
    } catch (e) {
      alert('Error submitting OTP');
    }
  };

  const approvedCount = submissions.filter(s => s.status === 'approved' || Boolean(s.certificate_url)).length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Head>
        <title>{t.trackApplication} — FormSeva Gujarat</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>
      <Navbar />

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl border border-slate-700 flex items-center gap-2.5 text-xs font-semibold animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        
        {/* Page Header */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {language === 'gu' ? 'મારી અરજીઓ અને ટ્રેકિંગ' : language === 'hi' ? 'मेरे आवेदन व ट्रैकिंग' : 'My Applications & Status'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              {language === 'gu'
                ? 'લાઈવ સ્ટેટસ જુઓ, ઓપરેટરને OTP આપો અને પ્રમાણપત્ર ડાઉનલોડ કરો'
                : language === 'hi'
                ? 'लाइव स्थिति देखें, ऑपरेटर को OTP दें और प्रमाण पत्र डाउनलोड करें'
                : 'Track your live applications and download approved government certificates'}
            </p>
          </div>

          <button
            onClick={loadSubmissions}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Segmented Control Tabs */}
          <div className="flex items-center bg-slate-200/70 p-1 rounded-xl border border-slate-300/40 self-start">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({submissions.length})
            </button>
            <button
              onClick={() => setActiveTab('in_progress')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'in_progress'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              In Progress
            </button>
            <button
              onClick={() => setActiveTab('approved')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                activeTab === 'approved'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-emerald-600" />
              <span>Ready / Approved ({approvedCount})</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search by app ID or name..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#159447]/30 text-xs bg-white"
            />
          </div>
        </div>

        {/* Submissions List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-slate-200">
            <Loader2 className="w-7 h-7 animate-spin text-[#159447] mb-2" />
            <p className="text-xs text-slate-400">Loading applications...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-14 px-4 bg-white border border-slate-200 rounded-2xl space-y-2">
            <FileText className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-sm font-bold text-slate-700">No applications found</p>
            <p className="text-xs text-slate-400">
              {query ? 'No match for search term.' : 'You have not submitted any certificate applications yet.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {filtered.map(sub => {
              const isApproved = sub.status === 'approved';
              const isAwaitingOtp = sub.status === 'awaiting_otp';
              const hasPdf = Boolean(
                sub.certificate_url ||
                isApproved ||
                sub.documents?.some(d => d.document_type_key === 'operator_certificate' || d.document_type_key === 'certificate')
              );

              return (
                <div
                  key={sub.id}
                  className={`bg-white border rounded-2xl p-5 transition-all shadow-2xs ${
                    isAwaitingOtp
                      ? 'border-orange-300 ring-2 ring-orange-200 bg-orange-50/20'
                      : isApproved
                      ? 'border-emerald-200'
                      : 'border-slate-200/90'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    
                    <div className="min-w-0 flex-1 space-y-2">
                      {/* Title & Status */}
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="font-black text-base text-slate-900">
                          {getTitle(sub)}
                        </span>
                        <span
                          className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                            STATUS_COLOR[sub.status] ?? 'bg-slate-100 text-slate-500 border-slate-200'
                          }`}
                        >
                          {getStatusLabel(sub.status)}
                        </span>
                      </div>

                      {/* App ID & Dates */}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 font-medium">
                        <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                          {sub.application_number}
                        </span>
                        {sub.govt_portal_application_id && (
                          <span className="text-slate-700">
                            Govt Ref: <strong>{sub.govt_portal_application_id}</strong>
                          </span>
                        )}
                        <span>•</span>
                        <span>{new Date(sub.submitted_at).toLocaleDateString('en-IN')}</span>
                        <span>•</span>
                        <span>Fee: <strong>₹{sub.total_fee}</strong> ({sub.payment_status})</span>
                      </div>

                      {/* Operator Note if available */}
                      {sub.operator_notes && (
                        <div className="text-xs bg-slate-50 border border-slate-100 rounded-lg p-2 text-slate-600">
                          <strong>Note:</strong> {sub.operator_notes}
                        </div>
                      )}
                    </div>

                    {/* Right Side Actions */}
                    <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                      {isAwaitingOtp && (
                        <button
                          onClick={() => handleOpenOtp(sub)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-xs animate-bounce"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                          <span>{language === 'gu' ? 'OTP દાખલ કરો' : 'Submit OTP'}</span>
                        </button>
                      )}

                      {hasPdf && (
                        <button
                          onClick={() => handleDownloadCertificate(sub)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#159447] hover:bg-[#12803c] text-white text-xs font-bold shadow-xs transition"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>PDF</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleDownloadReceipt(sub)}
                        className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold"
                        title="Download Receipt"
                      >
                        <FileText className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {activeOtpModal && (
        <OtpModal
          otpRequest={activeOtpModal}
          isOpen={Boolean(activeOtpModal)}
          onClose={() => setActiveOtpModal(null)}
          onSubmitOtp={handleSubmitOtp}
        />
      )}

      <Footer />
    </div>
  );
}
