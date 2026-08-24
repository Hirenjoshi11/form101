import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ApiService, mockOperators } from '@/lib/api';
import { FormSubmission, Operator } from '@/lib/types';
import { useLanguage } from '@/i18n/LanguageContext';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { FormIcon } from '@/components/FormIcon';
import {
  ShieldCheck,
  FileText,
  CheckCircle2,
  Clock,
  Send,
  KeyRound,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  ArrowLeft,
  User,
  Check,
  X,
  Sparkles,
  Search,
  Eye,
  FileCheck2,
  Lock,
  PhoneCall,
  Mail,
  Building2,
  AlertTriangle,
  Copy,
  CheckCheck,
  ClipboardList,
  Upload,
  Download,
  Trash2
} from 'lucide-react';

export default function OperatorPage() {
  const { t, language } = useLanguage();
  const router = useRouter();

  // State
  const [operators, setOperators] = useState<Operator[]>(mockOperators);
  const [selectedOperatorId, setSelectedOperatorId] = useState<string>(mockOperators[0].id);
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null);
  const [loading, setLoading] = useState(true);

  // Copy tracking state
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // OTP Modal & Form states
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpPurposeEn, setOtpPurposeEn] = useState('Digital Gujarat Revenue Portal Login');
  const [otpPurposeGu, setOtpPurposeGu] = useState('ડિજિટલ ગુજરાત પોર્ટલ લોગિન માટે');
  const [otpSending, setOtpSending] = useState(false);

  // Status update states
  const [govtAppIdInput, setGovtAppIdInput] = useState('');
  const [operatorNotesInput, setOperatorNotesInput] = useState('');
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');
  const [certificatePdfUrl, setCertificatePdfUrl] = useState('');
  const [certificatePdfName, setCertificatePdfName] = useState('');
  const [pdfUploading, setPdfUploading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Quick Toast
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Copy to clipboard helper
  const copyToClipboard = (text: string, keyLabel: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(keyLabel);
    showToast(`Copied ${keyLabel}: "${text}"`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Copy all details formatted helper
  const copyAllFormValues = () => {
    if (!selectedSubmission) return;
    const lines: string[] = [
      `--- ${selectedSubmission.form_title_en} (${selectedSubmission.application_number}) ---`,
      `Applicant Name: ${selectedSubmission.user_name || 'N/A'}`,
      `Mobile Phone: ${selectedSubmission.user_phone || 'N/A'}`,
      `Application ID: ${selectedSubmission.application_number}`,
      `Total Fee Paid: ₹${selectedSubmission.total_fee}`,
      `\n[Form Values]`
    ];

    Object.entries(selectedSubmission.field_values || {}).forEach(([k, v]) => {
      lines.push(`${k.replace(/_/g, ' ').toUpperCase()}: ${v}`);
    });

    const fullText = lines.join('\n');
    navigator.clipboard.writeText(fullText);
    setCopiedKey('all_fields');
    showToast('Copied all application data to clipboard!');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const loadQueue = async () => {
    try {
      const [queue, ops] = await Promise.all([
        ApiService.getOperatorQueue(),
        ApiService.getOperators()
      ]);
      setSubmissions(queue);
      if (queue.length > 0 && !selectedSubmission) {
        setSelectedSubmission(queue[0]);
      }
      if (ops && ops.length > 0) {
        setOperators(ops);
        if (!ops.some(o => o.id === selectedOperatorId)) {
          setSelectedOperatorId(ops[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();

    const handleUpdate = () => {
      loadQueue();
    };

    window.addEventListener('formseva_data_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('formseva_data_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // Update selected submission local field values when selection changes
  useEffect(() => {
    if (selectedSubmission) {
      setGovtAppIdInput(selectedSubmission.govt_portal_application_id || '');
      setOperatorNotesInput(selectedSubmission.operator_notes || '');
      setRejectionReasonInput(selectedSubmission.rejection_reason || '');
      setCertificatePdfUrl(selectedSubmission.certificate_url || '');
      setCertificatePdfName(selectedSubmission.certificate_file_name || '');
    }
  }, [selectedSubmission?.id]);

  const currentOperator = operators.find(o => o.id === selectedOperatorId) || operators[0] || mockOperators[0];

  const handlePdfFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      showToast('Please upload a valid PDF file');
      return;
    }
    setPdfUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setCertificatePdfUrl(dataUrl);
      setCertificatePdfName(file.name);
      setPdfUploading(false);
      showToast(language === 'gu' ? `PDF જોડાયેલ: ${file.name}` : `PDF attached: ${file.name}`);
    };
    reader.onerror = () => {
      setPdfUploading(false);
      showToast('Failed to read PDF file');
    };
    reader.readAsDataURL(file);
  };

  // Operator actions
  const handleStartFiling = async () => {
    if (!selectedSubmission) return;
    setActionLoading(true);
    try {
      await ApiService.startFiling(selectedSubmission.id);
      const updated = { ...selectedSubmission, status: 'operator_filling' as const };
      setSelectedSubmission(updated);
      setSubmissions(prev => prev.map(s => (s.id === selectedSubmission.id ? updated : s)));
      showToast(language === 'gu' ? 'ફોર્મ ભરવાની પ્રક્રિયા શરૂ થઈ' : 'Started filing application');
    } finally {
      setActionLoading(false);
    }
  };

  const handleTriggerOtp = async () => {
    if (!selectedSubmission) return;
    setOtpSending(true);
    try {
      await ApiService.triggerOtp(selectedSubmission.id, otpPurposeGu, otpPurposeEn);
      const updated: FormSubmission = {
        ...selectedSubmission,
        status: 'awaiting_otp' as const,
        active_otp_request: {
          id: `otp-${Date.now()}`,
          submission_id: selectedSubmission.id,
          operator_id: selectedOperatorId,
          otp_sequence_number: 1,
          otp_purpose_gu: otpPurposeGu,
          otp_purpose_hi: 'पोर्टल लॉगिन हेतु',
          otp_purpose_en: otpPurposeEn,
          status: 'requested',
          requested_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 10 * 60000).toISOString()
        }
      };
      setSelectedSubmission(updated);
      setSubmissions(prev => prev.map(s => (s.id === selectedSubmission.id ? updated : s)));
      setShowOtpModal(false);
      showToast(language === 'gu' ? 'નાગરિકને OTP વિનંતી મોકલાઈ ગઈ' : 'OTP request sent to citizen');
    } finally {
      setOtpSending(false);
    }
  };

  const handleUpdateStatus = async (newStatus: FormSubmission['status']) => {
    if (!selectedSubmission) return;
    setActionLoading(true);
    try {
      await ApiService.updateSubmissionStatus(
        selectedSubmission.id,
        newStatus,
        govtAppIdInput,
        operatorNotesInput,
        rejectionReasonInput,
        certificatePdfUrl,
        certificatePdfName
      );
      const updated: FormSubmission = {
        ...selectedSubmission,
        status: newStatus,
        govt_portal_application_id: govtAppIdInput,
        operator_notes: operatorNotesInput,
        rejection_reason: rejectionReasonInput,
        certificate_url: certificatePdfUrl || selectedSubmission.certificate_url,
        certificate_file_name: certificatePdfName || selectedSubmission.certificate_file_name,
        completed_at: newStatus === 'approved' ? new Date().toISOString() : selectedSubmission.completed_at
      };
      setSelectedSubmission(updated);
      setSubmissions(prev => prev.map(s => (s.id === selectedSubmission.id ? updated : s)));
      showToast(language === 'gu' ? `અરજી સ્થિતિ અપડેટ થઈ: ${newStatus}` : `Status updated to ${newStatus}`);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusPill = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-emerald-50 text-[#159447] border-emerald-200';
      case 'operator_filling':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'submitted_to_govt_portal':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'awaiting_otp':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'rejected':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <>
      <Head>
        <title>
          {language === 'gu'
            ? 'ઓપરેટર વર્કબેન્ચ – FormSeva Gujarat'
            : 'Operator Workbench – FormSeva Gujarat'}
        </title>
        <meta name="description" content="Certified operator workspace with 1-click field copy and official Gujarat government filing sync" />
      </Head>

      <div className="min-h-screen bg-[#F7FAF8] text-[#18232D] flex flex-col">
        
        {/* Toast Alert */}
        {toast && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#18232D] text-white px-5 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-3 animate-slide-up text-sm font-semibold">
            <CheckCircle2 className="w-5 h-5 text-[#159447]" />
            <span>{toast}</span>
          </div>
        )}

        {/* ─── OPERATOR NAVBAR ─── */}
        <header className="bg-white border-b border-slate-200/80 sticky top-0 z-40 shadow-2xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16 sm:h-20">
              
              {/* Brand Emblem */}
              <div className="flex items-center gap-4">
                <Link href="/" className="flex items-center gap-3 group">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-xs border border-slate-200 p-1 group-hover:scale-105 transition-transform overflow-hidden">
                    <img src="/icon.png" alt="FormSeva" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <div className="font-black text-xl sm:text-2xl text-[#18232D] tracking-tight leading-none flex items-center gap-2">
                      <span>Form<span className="text-[#159447]">Seva</span></span>
                      <span className="text-[10px] uppercase font-bold tracking-wider bg-emerald-700 text-white px-2 py-0.5 rounded-md">
                        OPERATOR
                      </span>
                    </div>
                    <p className="text-[9px] text-[#5B6470] font-bold tracking-widest uppercase mt-0.5">
                      Certified Filing Workbench • 1-Click Copy Enabled
                    </p>
                  </div>
                </Link>
              </div>

              {/* Operator Switcher (Demo / Testing convenience) */}
              <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200 p-1.5 rounded-xl text-xs">
                <span className="text-[#5B6470] font-bold pl-2">Active Specialist:</span>
                <select
                  value={selectedOperatorId}
                  onChange={e => setSelectedOperatorId(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold text-[#18232D] focus:outline-none focus:ring-2 focus:ring-[#159447]/30"
                >
                  {operators.map(op => (
                    <option key={op.id} value={op.id}>
                      {op.full_name} ({op.district})
                    </option>
                  ))}
                </select>
              </div>

              {/* Right Controls */}
              <div className="flex items-center gap-3">
                <LanguageSwitcher />

                <Link
                  href="/admin"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-slate-300 text-xs font-semibold text-[#5B6470] hover:text-[#18232D] bg-white hover:bg-slate-50 transition"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#159447]" />
                  <span>Admin Console</span>
                </Link>

                <button
                  onClick={loadQueue}
                  className="p-2 rounded-xl border border-slate-200 text-[#5B6470] hover:text-[#159447] hover:bg-emerald-50 transition"
                  title="Refresh Queue"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#159447]' : ''}`} />
                </button>
              </div>

            </div>
          </div>
        </header>

        {/* ─── MAIN WORKSPACE ─── */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* ─── LEFT: APPLICATION QUEUE LIST (4 Cols) ─── */}
            <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h2 className="font-black text-base text-[#18232D]">Assigned Queue</h2>
                  <p className="text-xs text-[#5B6470]">
                    {submissions.length} applications in queue
                  </p>
                </div>
                <span className="text-xs font-bold text-[#159447] bg-[#EAF6EE] px-2.5 py-1 rounded-full">
                  {currentOperator.district}
                </span>
              </div>

              <div className="space-y-2.5 max-h-[calc(100vh-250px)] overflow-y-auto pr-1">
                {submissions.map(sub => {
                  const isSelected = selectedSubmission?.id === sub.id;
                  const pillClass = getStatusPill(sub.status);
                  return (
                    <div
                      key={sub.id}
                      onClick={() => setSelectedSubmission(sub)}
                      className={`p-3.5 rounded-xl border transition cursor-pointer text-left ${
                        isSelected
                          ? 'border-[#159447] bg-emerald-50/40 shadow-xs'
                          : 'border-slate-200/80 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-mono font-bold text-xs text-[#18232D]">
                          {sub.application_number}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${pillClass}`}>
                          {sub.status.replace(/_/g, ' ')}
                        </span>
                      </div>

                      <div className="font-extrabold text-sm text-[#18232D] mt-1.5">
                        {sub.form_title_en}
                      </div>

                      <div className="flex items-center justify-between text-xs text-[#5B6470] mt-2 pt-2 border-t border-slate-100">
                        <span>👤 {sub.user_name || 'Citizen User'}</span>
                        <span className="font-bold text-[#18232D]">₹{sub.total_fee}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ─── RIGHT: DETAILED FILING WORKSPACE (8 Cols) ─── */}
            <div className="lg:col-span-8 space-y-6">
              {selectedSubmission ? (
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6">
                  
                  {/* Top Bar of Selected Form */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <FormIcon slug={selectedSubmission.form_slug} size="md" />
                        <div>
                          <h1 className="font-black text-xl text-[#18232D] tracking-tight">
                            {selectedSubmission.form_title_en}
                          </h1>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-[#159447] font-semibold">{selectedSubmission.form_title_gu}</span>
                            <span className="text-slate-300">•</span>
                            <span className="font-mono text-xs font-bold text-slate-700">App: {selectedSubmission.application_number}</span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(selectedSubmission.application_number, 'App ID')}
                              className="text-[#159447] hover:text-[#12803c] p-0.5"
                              title="Copy Application Number"
                            >
                              {copiedKey === 'App ID' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${getStatusPill(selectedSubmission.status)}`}>
                        {selectedSubmission.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Citizen Contact Strip with Copy Buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-[#F8FAF9] rounded-xl border border-slate-200/70 text-xs">
                    <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-slate-200/70">
                      <div>
                        <span className="text-[#5B6470] block text-[10px] uppercase font-bold">Applicant Name:</span>
                        <span className="font-bold text-[#18232D] text-xs sm:text-sm">
                          {selectedSubmission.user_name || 'Citizen User'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(selectedSubmission.user_name || 'Citizen User', 'Applicant Name')}
                        className="p-1.5 rounded-md bg-emerald-50 text-[#159447] hover:bg-[#159447] hover:text-white transition"
                        title="Copy Name"
                      >
                        {copiedKey === 'Applicant Name' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-slate-200/70">
                      <div>
                        <span className="text-[#5B6470] block text-[10px] uppercase font-bold">Mobile Phone:</span>
                        <span className="font-bold text-[#18232D] text-xs sm:text-sm">
                          {selectedSubmission.user_phone || '+91 98980 12345'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(selectedSubmission.user_phone || '9898012345', 'Mobile Number')}
                        className="p-1.5 rounded-md bg-emerald-50 text-[#159447] hover:bg-[#159447] hover:text-white transition"
                        title="Copy Mobile"
                      >
                        {copiedKey === 'Mobile Number' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-slate-200/70">
                      <div>
                        <span className="text-[#5B6470] block text-[10px] uppercase font-bold">Fee Status:</span>
                        <span className="font-bold text-[#159447] text-xs sm:text-sm">
                          ₹{selectedSubmission.total_fee} (PAID)
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        Verified
                      </span>
                    </div>
                  </div>

                  {/* OTP Live Assistance Status Box */}
                  <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <KeyRound className="w-5 h-5 text-amber-600" />
                        <div>
                          <h3 className="font-bold text-sm text-[#18232D]">In-App Assisted OTP Protocol</h3>
                          <p className="text-[11px] text-[#5B6470]">
                            Request secure portal login OTP directly from citizen
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => setShowOtpModal(true)}
                        className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-2xs transition flex items-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Request Citizen OTP</span>
                      </button>
                    </div>

                    {selectedSubmission.active_otp_request && (
                      <div className="bg-white p-3 rounded-xl border border-amber-200 text-xs space-y-1">
                        <div className="flex justify-between font-bold text-amber-900">
                          <span>Status: {selectedSubmission.active_otp_request.status.toUpperCase()}</span>
                          <span className="font-mono text-[10px]">
                            Sent: {new Date(selectedSubmission.active_otp_request.requested_at).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-slate-600">
                          Purpose: {selectedSubmission.active_otp_request.otp_purpose_en}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* ─── CITIZEN SUBMITTED FIELD DETAILS WITH 1-CLICK COPY ON EVERY FIELD ─── */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-xs uppercase tracking-wider text-[#18232D]">
                          Citizen Submitted Field Values
                        </h3>
                        <p className="text-[11px] text-[#5B6470]">
                          Click "Copy" beside any field to paste directly into the official government portal
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={copyAllFormValues}
                        className="px-3 py-1.5 rounded-xl bg-[#18232D] hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
                      >
                        {copiedKey === 'all_fields' ? (
                          <>
                            <CheckCheck className="w-3.5 h-3.5 text-[#159447]" />
                            <span>All Copied!</span>
                          </>
                        ) : (
                          <>
                            <ClipboardList className="w-3.5 h-3.5" />
                            <span>Copy All Details</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Grid of Fields with Copy Buttons */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {Object.entries(selectedSubmission.field_values || {}).map(([k, v]) => {
                        const fieldLabel = k.replace(/_/g, ' ');
                        const isCopied = copiedKey === fieldLabel;
                        return (
                          <div
                            key={k}
                            className="p-3 bg-[#F8FAF9] rounded-xl border border-slate-200/80 flex items-center justify-between gap-3 shadow-2xs hover:border-[#159447] transition group"
                          >
                            <div className="overflow-hidden">
                              <span className="text-[#5B6470] text-[10px] font-bold uppercase tracking-wider block">
                                {fieldLabel}
                              </span>
                              <span className="font-mono font-bold text-[#18232D] text-xs sm:text-sm block mt-0.5 truncate">
                                {String(v)}
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => copyToClipboard(String(v), fieldLabel)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shrink-0 ${
                                isCopied
                                  ? 'bg-[#159447] text-white shadow-xs'
                                  : 'bg-white text-[#159447] border border-emerald-200/80 hover:bg-[#159447] hover:text-white shadow-2xs'
                              }`}
                              title={`Copy ${fieldLabel}`}
                            >
                              {isCopied ? (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Operator Controls & Government Portal Details */}
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-[#18232D]">
                      Official Portal Sync & Filing Progression:
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#18232D] mb-1">
                          Govt Portal Application Number
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. DG-REV-2026-99210 or NTA-2026-8812"
                          value={govtAppIdInput}
                          onChange={e => setGovtAppIdInput(e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#159447]/30"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#18232D] mb-1">
                          Operator Internal Filing Notes
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Aadhaar e-KYC verified, uploaded ration card"
                          value={operatorNotesInput}
                          onChange={e => setOperatorNotesInput(e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#159447]/30"
                        />
                      </div>
                    </div>

                    {/* Approved Certificate PDF Upload by Operator */}
                    <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-3.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-[#159447]" />
                          <label className="text-xs font-bold text-[#18232D]">
                            {language === 'gu' ? 'મંજૂર પ્રમાણપત્ર / રસીદ PDF અપલોડ કરો' : 'Upload Approved Certificate / Receipt (PDF)'}
                          </label>
                        </div>
                        {certificatePdfName && (
                          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-[#159447]" />
                            {language === 'gu' ? 'PDF જોડાયેલ છે' : 'PDF Attached'}
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-[#5B6470]">
                        {language === 'gu'
                          ? 'સરકારી પોર્ટલ પરથી ડાઉનલોડ કરેલ સત્તાવાર PDF પ્રમાણપત્ર અહીં અપલોડ કરો. નાગરિક તેને સીધું ડાઉનલોડ કરી શકશે.'
                          : 'Upload the official PDF issued by the government portal. The citizen will be able to download it directly from their tracking page.'}
                      </p>

                      {certificatePdfName ? (
                        <div className="flex items-center justify-between bg-white border border-emerald-300 rounded-lg p-2.5 text-xs">
                          <div className="flex items-center gap-2 truncate">
                            <FileCheck2 className="w-4 h-4 text-[#159447] shrink-0" />
                            <span className="font-semibold text-slate-800 truncate">{certificatePdfName}</span>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            {certificatePdfUrl && (
                              <a
                                href={certificatePdfUrl}
                                download={certificatePdfName}
                                className="p-1 text-slate-600 hover:text-slate-900"
                                title="Download PDF to check"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </a>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setCertificatePdfUrl('');
                                setCertificatePdfName('');
                              }}
                              className="p-1 text-red-500 hover:text-red-700"
                              title="Remove PDF"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="relative">
                          <input
                            type="file"
                            accept=".pdf,application/pdf"
                            onChange={handlePdfFileUpload}
                            disabled={pdfUploading}
                            className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 cursor-pointer"
                          />
                        </div>
                      )}
                    </div>

                    {/* Action Buttons Toolbar */}
                    <div className="flex flex-wrap items-center gap-2.5 pt-2">
                      <button
                        onClick={handleStartFiling}
                        disabled={actionLoading}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs disabled:opacity-50"
                      >
                        1. Start Filing
                      </button>

                      <button
                        onClick={() => handleUpdateStatus('submitted_to_govt_portal')}
                        disabled={actionLoading}
                        className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition shadow-xs disabled:opacity-50"
                      >
                        2. Mark Portal Submitted
                      </button>

                      <button
                        onClick={() => handleUpdateStatus('approved')}
                        disabled={actionLoading}
                        className="px-4 py-2 rounded-xl bg-[#159447] hover:bg-[#12803c] text-white text-xs font-bold transition shadow-xs disabled:opacity-50 flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>3. Mark Approved & Done</span>
                      </button>

                      <button
                        onClick={() => handleUpdateStatus('rejected')}
                        disabled={actionLoading}
                        className="px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold transition disabled:opacity-50"
                      >
                        Reject Form
                      </button>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-12 text-center text-[#5B6470]">
                  <FileText className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                  Select an application from the queue to start filing.
                </div>
              )}
            </div>

          </div>
        </main>

        {/* ─── MODAL: TRIGGER CITIZEN OTP ─── */}
        {showOtpModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 animate-scale-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-amber-600" />
                  <h3 className="font-extrabold text-base text-[#18232D]">Send OTP Prompt</h3>
                </div>
                <button onClick={() => setShowOtpModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-[#5B6470]">
                This will trigger an interactive OTP prompt on citizen's screen and SMS simulation.
              </p>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-[#18232D] mb-1">
                    Purpose in English
                  </label>
                  <input
                    type="text"
                    value={otpPurposeEn}
                    onChange={e => setOtpPurposeEn(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#18232D] mb-1">
                    Purpose in Gujarati
                  </label>
                  <input
                    type="text"
                    value={otpPurposeGu}
                    onChange={e => setOtpPurposeGu(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowOtpModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleTriggerOtp}
                  disabled={otpSending}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition disabled:opacity-50"
                >
                  {otpSending ? 'Sending...' : 'Send OTP Request'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
}
