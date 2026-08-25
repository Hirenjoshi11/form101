import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useLanguage } from '@/i18n/LanguageContext';
import { ApiService } from '@/lib/api';
import { FormSubmission, OtpRequest } from '@/lib/types';
import { downloadCertificatePdf, downloadReceiptPdf } from '@/lib/certificatePdf';
import { OtpModal } from '@/components/OtpModal';
import {
  Search, FileText, Clock, CheckCircle2, Loader2,
  Download, Award, KeyRound, AlertCircle, RefreshCw,
  AlertTriangle, ArrowRight, RotateCcw
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
  resubmitted: 'bg-indigo-50 text-indigo-800 border-indigo-300 font-black',
  rejected: 'bg-red-50 text-red-700 border-red-200',
  correction_required: 'bg-red-50 text-red-700 border-red-200',
};

export default function TrackPage() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'approved' | 'action_needed' | 'in_progress'>('all');
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
      ApiService.login('citizen@formseva.in', 'citizen', 'Gujarat Citizen', '9825044551')
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
      resubmitted: { gu: 'ફરીથી સબમિટ થયેલ (ચકાસણી હેઠળ)', hi: 'पुनः प्रस्तुत (समीक्षा जारी)', en: 'Resubmitted (In Review)' },
      rejected: { gu: 'અરજીમાં ક્ષતિ / સુધારો જરૂરી', hi: 'संशोधन आवश्यक', en: 'Correction Required' },
      correction_required: { gu: 'અરજીમાં સુધારો જરૂરી', hi: 'संशोधन आवश्यक', en: 'Correction Required' },
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
    if (activeTab === 'action_needed') return s.status === 'rejected' || s.status === 'correction_required' || s.status === 'awaiting_otp';
    if (activeTab === 'in_progress') return s.status !== 'approved' && s.status !== 'rejected' && s.status !== 'correction_required';
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
  const actionNeededCount = submissions.filter(s => s.status === 'rejected' || s.status === 'correction_required' || s.status === 'awaiting_otp').length;

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
                ? 'લાઈવ સ્ટેટસ જુઓ, ક્ષતિ સુધારીને ફરી સબમિટ કરો અને તૈયાર પ્રમાણપત્ર ડાઉનલોડ કરો'
                : 'Track live status, fix queries with 1-click resubmission, and download certificates'}
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
          <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-xl border border-slate-300/40 overflow-x-auto scrollbar-none self-start max-w-full">
            <button
              onClick={() => setActiveTab('all')}
              className={`min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${
                activeTab === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({submissions.length})
            </button>

            {actionNeededCount > 0 && (
              <button
                onClick={() => setActiveTab('action_needed')}
                className={`min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                  activeTab === 'action_needed'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'text-red-700 bg-red-50 hover:bg-red-100'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>Action Needed ({actionNeededCount})</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('in_progress')}
              className={`min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${
                activeTab === 'in_progress'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              In Progress
            </button>
            <button
              onClick={() => setActiveTab('approved')}
              className={`min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition flex items-center gap-1 ${
                activeTab === 'approved'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Approved ({approvedCount})</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 max-w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search by app ID or name..."
              className="w-full min-h-[40px] pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#159447]/30 text-xs bg-white"
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
          <div className="space-y-4">
            {filtered.map(sub => {
              const isApproved = sub.status === 'approved';
              const isAwaitingOtp = sub.status === 'awaiting_otp';
              const isRejected = sub.status === 'rejected' || sub.status === 'correction_required';
              const isResubmitted = sub.status === 'resubmitted';
              const hasPdf = Boolean(
                sub.certificate_url ||
                isApproved ||
                sub.documents?.some(d => d.document_type_key === 'operator_certificate' || d.document_type_key === 'certificate')
              );

              return (
                <div
                  key={sub.id}
                  className={`bg-white border rounded-2xl p-5 transition-all shadow-2xs space-y-4 ${
                    isRejected
                      ? 'border-red-300 ring-2 ring-red-100 bg-red-50/10'
                      : isAwaitingOtp
                      ? 'border-orange-300 ring-2 ring-orange-200 bg-orange-50/20'
                      : isResubmitted
                      ? 'border-indigo-300 bg-indigo-50/10'
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

                  {/* ─── CORRECTION REQUIRED BANNER & 1-CLICK RESUBMIT BUTTON ─── */}
                  {isRejected && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
                      <div className="flex items-start gap-2.5">
                        <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <h4 className="text-xs font-bold text-red-950 uppercase tracking-wide">
                            {language === 'gu' ? 'ઓપરેટર દ્વારા સુધારો માંગવામાં આવ્યો છે:' : 'Correction Query Raised by Operator:'}
                          </h4>
                          <p className="text-xs text-red-900 font-medium">
                            {sub.rejection_reason || 'Some details or uploaded documents require correction.'}
                          </p>
                          <p className="text-[11px] text-red-700">
                            {language === 'gu'
                              ? 'તમે તમારી અગાઉ ભરેલી માહિતી સીધી જોઈ શકો છો અને માત્ર ક્ષતિ સુધારીને સબમિટ કરી શકો છો. કોઈ વધારાનો શુલ્ક લાગશે નહીં.'
                              : 'You can review your previously entered data, fix the specific error, and resubmit without paying again.'}
                          </p>
                        </div>
                      </div>

                      <div className="pt-1 flex justify-end">
                        <Link
                          href={`/forms/${sub.form_slug}?resubmit=${sub.id}`}
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs transition"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>
                            {language === 'gu' ? 'અરજી સુધારો અને ફરી સબમિટ કરો' : language === 'hi' ? 'आवेदन सुधारें और पुनः प्रस्तुत करें' : 'Correct & Resubmit Application'}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* Resubmitted indicator */}
                  {isResubmitted && (
                    <div className="bg-indigo-50/80 border border-indigo-200 rounded-xl p-3 text-xs text-indigo-900 flex items-center justify-between">
                      <span className="font-medium">
                        {language === 'gu'
                          ? 'તમારી સુધારેલી અરજી ઓપરેટરને મોકલી દેવામાં આવી છે. ટૂંક સમયમાં સરકારી પોર્ટલ પર ફાઇલ થશે.'
                          : 'Your corrected application has been received by the operator for review and portal filing.'}
                      </span>
                      <span className="font-bold text-indigo-700 bg-white px-2 py-0.5 rounded-md border border-indigo-200 text-[11px]">
                        Pending Review
                      </span>
                    </div>
                  )}

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
