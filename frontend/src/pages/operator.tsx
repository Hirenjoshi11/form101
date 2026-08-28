import React, { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ApiService, mockOperators } from '@/lib/api';
import { FormSubmission, Operator, CertificateForm } from '@/lib/types';
import { useLanguage } from '@/i18n/LanguageContext';
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
  Phone,
  Mail,
  Building2,
  AlertTriangle,
  Copy,
  CheckCheck,
  ClipboardList,
  Upload,
  Download,
  Trash2,
  Filter,
  Layers,
  Activity,
  TrendingUp,
  Inbox,
  FileClock,
  CheckSquare,
  History,
  BadgeCheck,
  MapPin,
  Calendar,
  ArrowUpDown,
  Zap,
  SlidersHorizontal,
  UserCheck
} from 'lucide-react';

const STANDARD_REJECTION_REASONS = [
  "Name mismatch: Applicant name in application does not match uploaded Aadhaar/School LC.",
  "Document blur / unreadable: Uploaded certificate/document photo is blurred or illegible.",
  "Missing required document: Please upload clear copy of Father School LC / 3-Year Income Proof.",
  "Land record mismatch: Survey number or Block number does not match AnyRoR revenue records for this village.",
  "RTO Sarathi error: Mobile number is not linked to Aadhaar for contactless online Learner Licence test.",
  "Income ceiling exceeded: Family gross annual income exceeds the scheme eligibility limit.",
  "Other / Custom query (Please specify below)"
];

type OperatorTabId = 
  | 'dashboard'
  | 'queue'
  | 'active_filing'
  | 'otp_center'
  | 'corrections'
  | 'completed'
  | 'services'
  | 'profile';

export default function OperatorPage() {
  const { t, language } = useLanguage();
  const router = useRouter();

  // ── State ──
  const [operators, setOperators] = useState<Operator[]>(mockOperators);
  const [selectedOperatorId, setSelectedOperatorId] = useState<string>(mockOperators[0].id);
  const [assignedForms, setAssignedForms] = useState<CertificateForm[]>([]);
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null);
  const [loading, setLoading] = useState(true);

  // Left-Nav Active Tab
  const [activeTab, setActiveTab] = useState<OperatorTabId>('dashboard');

  // Sub-filters inside "My Queue"
  const [statusFilter, setStatusFilter] = useState<'all' | 'submitted' | 'resubmitted' | 'operator_filling' | 'awaiting_otp' | 'approved' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'sla'>('oldest');
  const [assignmentScope, setAssignmentScope] = useState<'all' | 'assigned_to_me' | 'service_pool'>('all');

  // Copy tracking state
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // OTP Modal & Form states
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpPurposeEn, setOtpPurposeEn] = useState('Digital Gujarat Revenue Portal Login');
  const [otpPurposeGu, setOtpPurposeGu] = useState('ડિજિટલ ગુજરાત પોર્ટલ લોગિન માટે');
  const [otpSending, setOtpSending] = useState(false);

  // Rejection Modal
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [selectedRejectionTemplate, setSelectedRejectionTemplate] = useState(STANDARD_REJECTION_REASONS[0]);
  const [customRejectionExplanation, setCustomRejectionExplanation] = useState('');

  // Status update states
  const [govtAppIdInput, setGovtAppIdInput] = useState('');
  const [operatorNotesInput, setOperatorNotesInput] = useState('');
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
  const copyAllFormValues = (subToCopy: FormSubmission | null) => {
    const target = subToCopy || selectedSubmission;
    if (!target) return;
    const lines: string[] = [
      `--- ${target.form_title_en} (${target.application_number}) ---`,
      `Applicant Name: ${target.user_name || 'N/A'}`,
      `Mobile Phone: ${target.user_phone || 'N/A'}`,
      `Application ID: ${target.application_number}`,
      `Total Fee: ₹${target.total_fee}`,
      `\n[Form Values]`
    ];

    Object.entries(target.field_values || {}).forEach(([k, v]) => {
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
      const [queue, ops, forms] = await Promise.all([
        ApiService.getOperatorQueue(),
        ApiService.getOperators(),
        ApiService.getOperatorAssignedForms()
      ]);
      setSubmissions(queue);
      setAssignedForms(forms);
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

    const pollInterval = setInterval(() => {
      loadQueue();
    }, 10000); // 10 second polling for instant queue

    window.addEventListener('formseva_data_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      clearInterval(pollInterval);
      window.removeEventListener('formseva_data_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [selectedOperatorId]);

  const currentOperator = useMemo(() => {
    return operators.find(o => o.id === selectedOperatorId) || operators[0];
  }, [operators, selectedOperatorId]);

  // ── STRICT SECURITY FILTER: Show ONLY submissions relevant to the currently logged in / selected operator ──
  const operatorRelevantSubmissions = useMemo(() => {
    if (!currentOperator) return [];
    const assignedIds = currentOperator.assigned_form_ids || [];
    const assignedSlugs = currentOperator.assigned_forms || [];

    if (assignedIds.length === 0 && assignedSlugs.length === 0) {
      return [];
    }

    return submissions.filter(sub => {
      // 1. Directly assigned to this operator
      if (sub.assigned_operator_id && sub.assigned_operator_id === currentOperator.id) return true;
      // 2. Unassigned item in authorized form pool
      const matchesId = sub.form_id && assignedIds.includes(sub.form_id);
      const matchesSlug = sub.form_slug && (assignedSlugs.includes(sub.form_slug) || assignedIds.includes(sub.form_slug));
      return matchesId || matchesSlug;
    });
  }, [submissions, currentOperator]);

  // SLA Calculation Helper
  const getSlaInfo = (sub: FormSubmission) => {
    const form = assignedForms.find(f => f.slug === sub.form_slug || f.id === sub.form_id);
    const turnaroundDays = form?.turnaround_days || 3;
    const submitTime = new Date(sub.submitted_at).getTime();
    const dueTime = submitTime + turnaroundDays * 24 * 60 * 60 * 1000;
    const now = Date.now();
    const diffMs = dueTime - now;
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));
    const isOverdue = diffMs < 0;
    const isCompleted = sub.status === 'approved' || sub.status === 'rejected';

    return {
      turnaroundDays,
      dueTime,
      dueDate: new Date(dueTime),
      diffHours,
      isOverdue: !isCompleted && isOverdue,
      overdueDays: Math.abs(Math.floor(diffHours / 24)),
      dueInDays: Math.max(0, Math.ceil(diffHours / 24)),
      isCompleted
    };
  };

  // ── Derived KPI Metrics for THIS Operator ──
  const metrics = useMemo(() => {
    const all = operatorRelevantSubmissions;
    const assignedToMe = all.filter(s => s.assigned_operator_id === currentOperator?.id);
    const pool = all.filter(s => !s.assigned_operator_id || s.assigned_operator_id !== currentOperator?.id);
    
    const inProgress = all.filter(s => s.status === 'operator_filling');
    const awaitingOtp = all.filter(s => s.status === 'awaiting_otp');
    const otpReceived = all.filter(s => s.status === 'otp_received');
    const activeFiling = all.filter(s => ['operator_filling', 'awaiting_otp', 'otp_received'].includes(s.status));
    
    const corrections = all.filter(s => s.status === 'resubmitted' || s.status === 'correction_required');
    const approved = all.filter(s => s.status === 'approved');
    const rejected = all.filter(s => s.status === 'rejected');
    const completed = [...approved, ...rejected];
    
    const overdueList = all.filter(s => getSlaInfo(s).isOverdue);

    const totalCount = all.length;
    const completionRate = totalCount > 0 ? Math.round((approved.length / totalCount) * 100) : 100;

    // Per-service breakdown in queue
    const serviceCounts: Record<string, { title: string; count: number; slug: string }> = {};
    all.forEach(sub => {
      const key = sub.form_slug || 'other';
      if (!serviceCounts[key]) {
        serviceCounts[key] = {
          title: sub.form_title_en || key.replace(/_/g, ' '),
          count: 0,
          slug: key
        };
      }
      serviceCounts[key].count += 1;
    });

    return {
      total: all.length,
      assignedToMeCount: assignedToMe.length,
      poolCount: pool.length,
      inProgressCount: inProgress.length,
      awaitingOtpCount: awaitingOtp.length,
      otpReceivedCount: otpReceived.length,
      activeFilingCount: activeFiling.length,
      correctionsCount: corrections.length,
      approvedCount: approved.length,
      rejectedCount: rejected.length,
      completedCount: completed.length,
      overdueCount: overdueList.length,
      completionRate,
      serviceCounts: Object.values(serviceCounts),
      overdueList
    };
  }, [operatorRelevantSubmissions, currentOperator, assignedForms]);

  // ── Filtered & Sorted Submissions for Queue Tab ──
  const queueSubmissions = useMemo(() => {
    let list = [...operatorRelevantSubmissions];

    // Filter by Scope (Assigned vs Pool)
    if (assignmentScope === 'assigned_to_me') {
      list = list.filter(s => s.assigned_operator_id === currentOperator?.id);
    } else if (assignmentScope === 'service_pool') {
      list = list.filter(s => !s.assigned_operator_id || s.assigned_operator_id !== currentOperator?.id);
    }

    // Filter by Status Tab
    if (statusFilter !== 'all') {
      if (statusFilter === 'rejected') {
        list = list.filter(s => s.status === 'rejected' || s.status === 'correction_required');
      } else {
        list = list.filter(s => s.status === statusFilter);
      }
    }

    // Search Query (App No, Citizen Name, Mobile)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(s => 
        (s.application_number && s.application_number.toLowerCase().includes(q)) ||
        (s.user_name && s.user_name.toLowerCase().includes(q)) ||
        (s.user_phone && s.user_phone.toLowerCase().includes(q)) ||
        (s.form_title_en && s.form_title_en.toLowerCase().includes(q))
      );
    }

    // Sort Order
    if (sortOrder === 'newest') {
      list.sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime());
    } else if (sortOrder === 'oldest') {
      list.sort((a, b) => new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime());
    } else if (sortOrder === 'sla') {
      list.sort((a, b) => {
        const slaA = getSlaInfo(a);
        const slaB = getSlaInfo(b);
        return slaA.dueTime - slaB.dueTime;
      });
    }

    return list;
  }, [operatorRelevantSubmissions, assignmentScope, statusFilter, searchQuery, sortOrder, currentOperator, assignedForms]);

  // Synchronize selected submission
  useEffect(() => {
    if (operatorRelevantSubmissions.length > 0) {
      if (!selectedSubmission || !operatorRelevantSubmissions.some(s => s.id === selectedSubmission.id)) {
        // Prefer active filing item, or first item
        const activeItem = operatorRelevantSubmissions.find(s => ['operator_filling', 'awaiting_otp', 'otp_received'].includes(s.status));
        setSelectedSubmission(activeItem || operatorRelevantSubmissions[0]);
      }
    } else {
      setSelectedSubmission(null);
    }
  }, [operatorRelevantSubmissions]);

  // ── Actions ──
  const handleStartFiling = async (subToStart?: FormSubmission) => {
    const target = subToStart || selectedSubmission;
    if (!target) return;
    setActionLoading(true);
    try {
      await ApiService.startFiling(target.id);
      const updated: FormSubmission = {
        ...target,
        status: 'operator_filling',
        assigned_operator_id: selectedOperatorId,
        assigned_operator_name: currentOperator?.full_name,
        operator_started_at: new Date().toISOString()
      };
      setSelectedSubmission(updated);
      setSubmissions(prev => prev.map(s => (s.id === target.id ? updated : s)));
      showToast(language === 'gu' ? 'ફોર્મ ભરવાનું શરૂ થયું' : 'Filing started successfully');
      setActiveTab('active_filing');
    } catch (e: any) {
      showToast(e?.message || 'Failed to start filing');
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
          otp_sequence_number: (selectedSubmission.active_otp_request?.otp_sequence_number || 0) + 1,
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
      showToast(language === 'gu' ? 'નાગરિકને OTP વિનંતી મોકલાઈ ગઈ' : 'OTP prompt sent to citizen');
    } catch (e: any) {
      showToast(e?.message || 'Failed to trigger OTP');
    } finally {
      setOtpSending(false);
    }
  };

  const handleUpdateStatus = async (newStatus: FormSubmission['status'], customRejection?: string) => {
    if (!selectedSubmission) return;
    setActionLoading(true);
    try {
      const finalRejection = customRejection !== undefined ? customRejection : selectedSubmission.rejection_reason;
      await ApiService.updateSubmissionStatus(
        selectedSubmission.id,
        newStatus,
        govtAppIdInput || selectedSubmission.govt_portal_application_id,
        operatorNotesInput || selectedSubmission.operator_notes,
        finalRejection,
        certificatePdfUrl || selectedSubmission.certificate_url,
        certificatePdfName || selectedSubmission.certificate_file_name
      );
      const updated: FormSubmission = {
        ...selectedSubmission,
        status: newStatus,
        govt_portal_application_id: govtAppIdInput || selectedSubmission.govt_portal_application_id,
        operator_notes: operatorNotesInput || selectedSubmission.operator_notes,
        rejection_reason: finalRejection,
        certificate_url: certificatePdfUrl || selectedSubmission.certificate_url,
        certificate_file_name: certificatePdfName || selectedSubmission.certificate_file_name,
        completed_at: (newStatus === 'approved' || newStatus === 'rejected') ? new Date().toISOString() : selectedSubmission.completed_at
      };
      setSelectedSubmission(updated);
      setSubmissions(prev => prev.map(s => (s.id === selectedSubmission.id ? updated : s)));
      showToast(language === 'gu' ? `અરજી સ્થિતિ અપડેટ થઈ: ${newStatus}` : `Status updated to ${newStatus}`);
    } catch (e: any) {
      showToast(e?.message || 'Status update failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmRejection = async () => {
    const finalReason = selectedRejectionTemplate.includes("Other")
      ? (customRejectionExplanation || "Details verification failed. Please review documents and resubmit.")
      : (customRejectionExplanation ? `${selectedRejectionTemplate} Notes: ${customRejectionExplanation}` : selectedRejectionTemplate);
    
    await handleUpdateStatus('rejected', finalReason);
    setShowRejectionModal(false);
    setCustomRejectionExplanation('');
  };

  const handlePdfFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPdfUploading(true);
    try {
      const blobUrl = URL.createObjectURL(file);
      setCertificatePdfUrl(blobUrl);
      setCertificatePdfName(file.name);
      showToast(`Attached ${file.name}`);
    } finally {
      setPdfUploading(false);
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
        return 'bg-orange-50 text-orange-700 border-orange-200 font-bold';
      case 'otp_received':
        return 'bg-amber-50 text-amber-800 border-amber-300 font-black';
      case 'resubmitted':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200 font-black';
      case 'rejected':
      case 'correction_required':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  // Nav Items Definition with actionable badge counts
  const navItems = [
    {
      id: 'dashboard',
      label: language === 'gu' ? 'મારું ડેશબોર્ડ' : 'My Dashboard',
      icon: Activity,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      badge: metrics.overdueCount > 0 ? `${metrics.overdueCount} Overdue` : null,
      badgeColor: 'bg-red-50 text-red-700 border border-red-200'
    },
    {
      id: 'queue',
      label: language === 'gu' ? 'મારી કતાર (Queue)' : 'My Queue',
      icon: Inbox,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      badge: metrics.total > 0 ? `${metrics.total}` : null,
      badgeColor: 'bg-slate-100 text-slate-700'
    },
    {
      id: 'active_filing',
      label: language === 'gu' ? 'ચાલુ ફાઇલિંગ' : 'Active Filing',
      icon: FileClock,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      badge: metrics.activeFilingCount > 0 ? `${metrics.activeFilingCount}` : null,
      badgeColor: 'bg-indigo-100 text-indigo-800 font-bold'
    },
    {
      id: 'otp_center',
      label: language === 'gu' ? 'OTP કેન્દ્ર' : 'OTP Center',
      icon: KeyRound,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      badge: metrics.awaitingOtpCount > 0 ? `${metrics.awaitingOtpCount} Pending` : null,
      badgeColor: 'bg-amber-100 text-amber-800 font-bold animate-pulse'
    },
    {
      id: 'corrections',
      label: language === 'gu' ? 'સુધારા & રી-સબમિશન' : 'Corrections',
      icon: AlertTriangle,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
      badge: metrics.correctionsCount > 0 ? `${metrics.correctionsCount}` : null,
      badgeColor: 'bg-rose-100 text-rose-800'
    },
    {
      id: 'completed',
      label: language === 'gu' ? 'પૂર્ણ થયેલ આર્કાઇવ' : 'Completed / History',
      icon: History,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      badge: `${metrics.completedCount}`,
      badgeColor: 'bg-purple-50 text-purple-700'
    },
    {
      id: 'services',
      label: language === 'gu' ? 'મારી અધિકૃત સેવાઓ' : 'My Services',
      icon: Layers,
      color: 'text-cyan-600',
      bg: 'bg-cyan-50',
      badge: `${currentOperator?.assigned_forms?.length || assignedForms.length}`,
      badgeColor: 'bg-cyan-50 text-cyan-700'
    },
    {
      id: 'profile',
      label: language === 'gu' ? 'મારું પ્રોફાઇલ' : 'My Profile',
      icon: User,
      color: 'text-slate-600',
      bg: 'bg-slate-50',
      badge: null,
      badgeColor: ''
    }
  ];

  return (
    <>
      <Head>
        <title>
          {language === 'gu'
            ? 'ઓપરેટર વર્કબેન્ચ – FormSeva Gujarat'
            : 'Operator Workbench – FormSeva Gujarat'}
        </title>
        <meta name="description" content="Certified operator workspace with 1-click field copy and official Gujarat government filing sync" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>

      <div className="min-h-screen bg-[#F8FAF9] text-[#18232D] flex flex-col justify-between">
        <Navbar />

        {/* Toast Alert */}
        {toast && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#18232D] text-white px-4 py-2.5 rounded-xl shadow-xl border border-slate-700 flex items-center gap-2.5 text-xs font-semibold animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-[#159447]" />
            <span>{toast}</span>
          </div>
        )}

        {/* ─── WORKBENCH SUB-HEADER STRIP ─── */}
        <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-2xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#18232D] flex items-center justify-center text-[#159447] shrink-0 shadow-2xs">
                <BadgeCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-sm font-black text-[#18232D]">Operator Workbench</h1>
                  <span className="text-[10px] font-extrabold text-[#159447] bg-[#EAF6EE] px-2 py-0.5 rounded-md border border-emerald-200">
                    Certified Assisted Filing
                  </span>
                </div>
                <p className="text-[11px] text-[#5B6470]">
                  Gujarat Citizen Assistance • District: <strong className="text-[#18232D]">{currentOperator?.district || 'Ahmedabad'}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 self-start sm:self-auto">
              <div className="flex items-center gap-1.5 bg-slate-100/90 border border-slate-200 rounded-xl px-2.5 py-1">
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-xs font-bold text-slate-800">{currentOperator?.full_name}</span>
                <span className="text-[10px] text-slate-400">({currentOperator?.district})</span>
              </div>

              {/* Operator Switcher (for demonstration/multi-operator desk) */}
              <select
                value={selectedOperatorId}
                onChange={e => setSelectedOperatorId(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-2.5 py-1 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#159447]/30 shadow-2xs"
                title="Switch Operator Desk"
              >
                {operators.map(op => (
                  <option key={op.id} value={op.id}>
                    {op.full_name} ({op.district})
                  </option>
                ))}
              </select>

              <button
                onClick={loadQueue}
                className="p-1.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 shadow-2xs transition"
                title="Refresh Queue"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#159447]' : ''}`} />
              </button>
            </div>
          </div>

          {/* Mobile Horizontal-Scroll Nav Tabs */}
          <div className="md:hidden flex items-center gap-1.5 px-4 py-2 overflow-x-auto border-t border-slate-100 bg-slate-50/70 scrollbar-none text-xs">
            {navItems.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as OperatorTabId)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap font-bold text-xs transition ${
                    isActive
                      ? 'bg-[#18232D] text-white shadow-2xs'
                      : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-100'
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
        </header>

        {/* ─── BODY: LEFT SIDEBAR + MAIN CONTENT ─── */}
        <div className="flex flex-1 min-h-0 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 gap-6 items-start">
          
          {/* ══════════════════════════════════════════════════════════════ */}
          {/* LEFT VERTICAL SIDEBAR NAV (Sticky like Admin)                 */}
          {/* ══════════════════════════════════════════════════════════════ */}
          <aside className="hidden md:flex flex-col w-60 shrink-0 bg-white rounded-2xl border border-slate-200/80 sticky top-[80px] shadow-xs overflow-hidden">
            {/* Operator mini-card */}
            <div className="px-4 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#18232D] flex items-center justify-center text-white font-black text-sm shrink-0 shadow-xs">
                  {currentOperator?.full_name?.charAt(0) || 'O'}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-black text-[#18232D] truncate">{currentOperator?.full_name}</p>
                  <p className="text-[10px] text-[#159447] font-bold truncate">Certified Operator</p>
                  <p className="text-[10px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
                    <MapPin className="w-2.5 h-2.5" />
                    <span>{currentOperator?.district}, Gujarat</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Nav items */}
            <nav className="p-2.5 space-y-1">
              <p className="px-2.5 pt-1 pb-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Operator Menu
              </p>
              {navItems.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as OperatorTabId)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-[#18232D] text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                        isActive ? 'bg-white/10 text-white' : `${tab.bg} ${tab.color}`
                      }`}>
                        <Icon className="w-3.5 h-3.5" />
                      </span>
                      <span className="truncate">{tab.label}</span>
                    </div>

                    {tab.badge && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ml-2 ${
                        isActive ? 'bg-white/20 text-white' : tab.badgeColor
                      }`}>
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Bottom Quick Help Card */}
            <div className="p-3 m-2.5 mt-auto rounded-xl bg-[#EAF6EE] border border-emerald-200/80 text-left">
              <div className="flex items-center gap-1.5 text-xs font-black text-[#159447]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Operator Quick Guide</span>
              </div>
              <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                Use 1-Click Copy on all applicant fields to rapidly complete Digital Gujarat & RTO Sarathi forms.
              </p>
            </div>
          </aside>

          {/* ══════════════════════════════════════════════════════════════ */}
          {/* MAIN CONTENT WORKSPACE (Driven by activeTab)                  */}
          {/* ══════════════════════════════════════════════════════════════ */}
          <main className="flex-1 min-w-0 space-y-6">

            {/* ───────────────────────────────────────────────────────────── */}
            {/* 1. MY DASHBOARD (Overview & Personal KPIs)                    */}
            {/* ───────────────────────────────────────────────────────────── */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6 animate-fadeIn">
                {/* Operator Welcome Strip */}
                <div className="bg-gradient-to-r from-[#18232D] to-slate-800 text-white rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold text-[#159447] uppercase tracking-wider bg-white/10 px-2.5 py-1 rounded-full inline-block mb-2">
                      Today's Workload Dashboard
                    </span>
                    <h2 className="text-xl font-black text-white">
                      Namaste, {currentOperator?.full_name} 🙏
                    </h2>
                    <p className="text-xs text-slate-300 mt-1">
                      You have <strong className="text-emerald-400">{metrics.activeFilingCount}</strong> active applications in progress and <strong className="text-amber-400">{metrics.awaitingOtpCount}</strong> awaiting citizen OTP verification.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveTab('active_filing')}
                      className="px-4 py-2 rounded-xl bg-[#159447] hover:bg-[#12803c] text-white text-xs font-extrabold shadow-sm transition flex items-center gap-1.5"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Resume Active Filing</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('queue')}
                      className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition"
                    >
                      View Full Queue
                    </button>
                  </div>
                </div>

                {/* KPI Metrics Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {[
                    { label: 'Assigned to Me', count: metrics.assignedToMeCount, icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'In Service Pool', count: metrics.poolCount, icon: Inbox, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'In Progress', count: metrics.inProgressCount, icon: FileClock, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                    { label: 'Awaiting OTP', count: metrics.awaitingOtpCount, icon: KeyRound, color: 'text-amber-600', bg: 'bg-amber-50' },
                    { label: 'Corrections', count: metrics.correctionsCount, icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50' },
                    { label: 'Completed', count: metrics.completedCount, icon: CheckCircle2, color: 'text-purple-600', bg: 'bg-purple-50' },
                  ].map((card, idx) => {
                    const Icon = card.icon;
                    return (
                      <div key={idx} className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <span className={`w-8 h-8 rounded-xl ${card.bg} ${card.color} flex items-center justify-center`}>
                            <Icon className="w-4 h-4" />
                          </span>
                          <span className="text-xl font-black text-[#18232D]">{card.count}</span>
                        </div>
                        <p className="text-[11px] font-bold text-slate-500 mt-2 truncate">{card.label}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Needs Attention / SLA Strip */}
                {metrics.overdueCount > 0 && (
                  <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-rose-800">
                        <AlertCircle className="w-5 h-5" />
                        <h3 className="font-extrabold text-sm">Action Needed: {metrics.overdueCount} Overdue Application(s)</h3>
                      </div>
                      <span className="text-[11px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                        Exceeding SLA Turnaround
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {metrics.overdueList.map(sub => (
                        <div key={sub.id} className="bg-white p-3 rounded-xl border border-rose-200 flex items-center justify-between">
                          <div>
                            <span className="font-mono font-bold text-slate-900">{sub.application_number}</span>
                            <p className="text-[11px] text-slate-500 truncate">{sub.form_title_en} • {sub.user_name}</p>
                          </div>
                          <button
                            onClick={() => {
                              setSelectedSubmission(sub);
                              setActiveTab('active_filing');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-bold text-[11px] hover:bg-rose-700"
                          >
                            Process Now
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2-Column: Per-Service Breakdown & Recent Queue */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Left: Per-Service Breakdown (5 Cols) */}
                  <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-5 space-y-4 shadow-2xs">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-[#159447]" />
                        <h3 className="font-black text-sm text-[#18232D]">My Queue by Certificate</h3>
                      </div>
                      <span className="text-xs font-bold text-slate-500">{metrics.total} Total</span>
                    </div>

                    <div className="space-y-2.5">
                      {metrics.serviceCounts.map((srv, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition border border-slate-200/70">
                          <div className="flex items-center gap-2 min-w-0">
                            <FormIcon slug={srv.slug} size="sm" />
                            <span className="text-xs font-bold text-slate-800 truncate">{srv.title}</span>
                          </div>
                          <span className="text-xs font-black text-[#159447] bg-[#EAF6EE] px-2.5 py-0.5 rounded-full">
                            {srv.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right: Quick Action Priority List (7 Cols) */}
                  <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-5 space-y-4 shadow-2xs">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-amber-500" />
                        <h3 className="font-black text-sm text-[#18232D]">High Priority Next in Queue</h3>
                      </div>
                      <button
                        onClick={() => setActiveTab('queue')}
                        className="text-xs font-bold text-[#159447] hover:underline"
                      >
                        View All →
                      </button>
                    </div>

                    <div className="space-y-2">
                      {queueSubmissions.slice(0, 5).map(sub => {
                        const sla = getSlaInfo(sub);
                        return (
                          <div
                            key={sub.id}
                            className="p-3 rounded-xl border border-slate-200/80 hover:border-[#159447] bg-white flex items-center justify-between gap-3 transition cursor-pointer"
                            onClick={() => {
                              setSelectedSubmission(sub);
                              setActiveTab('active_filing');
                            }}
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-bold text-slate-900">{sub.application_number}</span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusPill(sub.status)}`}>
                                  {sub.status.replace(/_/g, ' ')}
                                </span>
                              </div>
                              <p className="text-xs font-extrabold text-slate-800 truncate mt-0.5">{sub.form_title_en}</p>
                              <p className="text-[11px] text-slate-500">Citizen: {sub.user_name || 'Applicant'}</p>
                            </div>

                            <div className="text-right shrink-0">
                              {sla.isOverdue ? (
                                <span className="text-[10px] font-extrabold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md block">
                                  🔴 Overdue
                                </span>
                              ) : (
                                <span className="text-[10px] font-semibold text-slate-500 block">
                                  Due in {sla.dueInDays}d
                                </span>
                              )}
                              <span className="text-xs font-extrabold text-[#159447] block mt-1">₹{sub.total_fee}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* ───────────────────────────────────────────────────────────── */}
            {/* 2. MY QUEUE (Work List with Search, Filters, SLA Countdown)   */}
            {/* ───────────────────────────────────────────────────────────── */}
            {activeTab === 'queue' && (
              <div className="space-y-4 animate-fadeIn">
                {/* Filter Toolbar */}
                <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-3">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    {/* Search Input */}
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search by App ID, Citizen Name, Mobile, or Service..."
                        className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-[#159447]/30"
                      />
                    </div>

                    {/* Scope & Sort */}
                    <div className="flex items-center gap-2">
                      <select
                        value={assignmentScope}
                        onChange={e => setAssignmentScope(e.target.value as any)}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700"
                      >
                        <option value="all">All Available ({operatorRelevantSubmissions.length})</option>
                        <option value="assigned_to_me">Assigned to Me ({metrics.assignedToMeCount})</option>
                        <option value="service_pool">Service Pool ({metrics.poolCount})</option>
                      </select>

                      <select
                        value={sortOrder}
                        onChange={e => setSortOrder(e.target.value as any)}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700"
                      >
                        <option value="oldest">Sort: Oldest First (Priority)</option>
                        <option value="sla">Sort: SLA Deadline</option>
                        <option value="newest">Sort: Newest First</option>
                      </select>
                    </div>
                  </div>

                  {/* Status Chips */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
                    {[
                      { id: 'all', label: 'All', count: metrics.total },
                      { id: 'submitted', label: 'Submitted', count: operatorRelevantSubmissions.filter(s => s.status === 'submitted').length },
                      { id: 'resubmitted', label: '⚡ Resubmitted', count: metrics.correctionsCount },
                      { id: 'operator_filling', label: 'In Progress', count: metrics.inProgressCount },
                      { id: 'awaiting_otp', label: 'Awaiting OTP', count: metrics.awaitingOtpCount },
                      { id: 'approved', label: 'Approved', count: metrics.approvedCount },
                      { id: 'rejected', label: 'Rejected', count: metrics.rejectedCount },
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setStatusFilter(tab.id as any)}
                        className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                          statusFilter === tab.id
                            ? 'bg-[#18232D] text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        <span>{tab.label}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                          statusFilter === tab.id ? 'bg-white/20 text-white' : 'bg-white text-slate-700'
                        }`}>
                          {tab.count}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Queue Cards List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {queueSubmissions.length === 0 ? (
                    <div className="col-span-full bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-200/80">
                      <Inbox className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                      No applications match your current filters.
                    </div>
                  ) : (
                    queueSubmissions.map(sub => {
                      const sla = getSlaInfo(sub);
                      const isAssignedToMe = sub.assigned_operator_id === currentOperator?.id;
                      return (
                        <div
                          key={sub.id}
                          className="bg-white rounded-2xl border border-slate-200/80 hover:border-[#159447] p-4.5 shadow-2xs flex flex-col justify-between space-y-3 transition group text-left"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-mono text-xs font-bold text-[#18232D]">
                                {sub.application_number}
                              </span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusPill(sub.status)}`}>
                                {sub.status.replace(/_/g, ' ')}
                              </span>
                            </div>

                            <div className="mt-2 flex items-center gap-2">
                              <FormIcon slug={sub.form_slug} size="sm" />
                              <h4 className="font-extrabold text-sm text-slate-900 truncate">
                                {sub.form_title_en}
                              </h4>
                            </div>

                            <div className="mt-3 p-2.5 rounded-xl bg-slate-50 text-xs space-y-1 text-slate-600">
                              <div className="flex justify-between">
                                <span className="text-slate-400">Applicant:</span>
                                <span className="font-bold text-slate-800">{sub.user_name || 'Citizen'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Mobile:</span>
                                <span className="font-mono font-bold text-slate-700">{sub.user_phone || '+91 XXXXXX'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Assignment:</span>
                                <span className={`font-bold ${isAssignedToMe ? 'text-[#159447]' : 'text-blue-600'}`}>
                                  {isAssignedToMe ? '📌 Assigned to Me' : '🌐 Service Pool'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                            <div>
                              {sla.isOverdue ? (
                                <span className="text-[10px] font-black text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
                                  🔴 Overdue ({sla.overdueDays}d)
                                </span>
                              ) : (
                                <span className="text-[10px] font-semibold text-slate-500">
                                  SLA: Due in {sla.dueInDays} days
                                </span>
                              )}
                            </div>

                            <button
                              onClick={() => {
                                setSelectedSubmission(sub);
                                setActiveTab('active_filing');
                              }}
                              className="px-3 py-1.5 rounded-xl bg-[#18232D] hover:bg-[#159447] text-white font-bold text-xs transition flex items-center gap-1 shadow-2xs"
                            >
                              <span>Process</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* ───────────────────────────────────────────────────────────── */}
            {/* 3. ACTIVE FILING (Focused Deep Workbench & 1-Click Copy)      */}
            {/* ───────────────────────────────────────────────────────────── */}
            {activeTab === 'active_filing' && (
              <div className="space-y-6 animate-fadeIn">
                {selectedSubmission ? (
                  <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6">
                    
                    {/* Top Bar of Selected Form */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                      <div className="flex items-center gap-3">
                        <FormIcon slug={selectedSubmission.form_slug} size="md" />
                        <div>
                          <h2 className="font-black text-xl text-[#18232D] tracking-tight">
                            {selectedSubmission.form_title_en}
                          </h2>
                          <div className="flex items-center gap-2 mt-0.5 text-xs">
                            <span className="text-[#159447] font-semibold">{selectedSubmission.form_title_gu}</span>
                            <span className="text-slate-300">•</span>
                            <span className="font-mono font-bold text-slate-700">App ID: {selectedSubmission.application_number}</span>
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

                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${getStatusPill(selectedSubmission.status)}`}>
                          {selectedSubmission.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>

                    {/* Resubmission Alert if status is resubmitted */}
                    {selectedSubmission.status === 'resubmitted' && (
                      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3.5 text-xs text-indigo-900 font-medium">
                        <strong>⚡ Citizen Corrected Application:</strong> Please review the updated field values and resume portal filing.
                        {selectedSubmission.operator_notes && (
                          <div className="mt-1 font-mono text-[11px] text-indigo-800 bg-white/70 p-2 rounded-lg">
                            {selectedSubmission.operator_notes}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Citizen Contact Strip with Copy and Call Buttons */}
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
                          <span className="text-[#5B6470] block text-[10px] uppercase font-bold">Citizen Mobile:</span>
                          <span className="font-bold text-[#18232D] text-xs sm:text-sm font-mono">
                            {selectedSubmission.user_phone || '+91 98250 44551'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <a
                            href={`tel:${(selectedSubmission.user_phone || '9825044551').replace(/[^0-9]/g, '')}`}
                            className="p-1.5 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white transition"
                            title="Call Citizen"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(selectedSubmission.user_phone || '9825044551', 'Mobile Number')}
                            className="p-1.5 rounded-md bg-emerald-50 text-[#159447] hover:bg-[#159447] hover:text-white transition"
                            title="Copy Mobile"
                          >
                            {copiedKey === 'Mobile Number' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-slate-200/70">
                        <div>
                          <span className="text-[#5B6470] block text-[10px] uppercase font-bold">Total Assistance Fee:</span>
                          <span className="font-bold text-[#159447] text-xs sm:text-sm">
                            ₹{selectedSubmission.total_fee}
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
                            <h3 className="font-bold text-sm text-[#18232D]">In-App Assisted OTP Relay</h3>
                            <p className="text-[11px] text-[#5B6470]">
                              Request secure login / e-KYC OTP directly from citizen
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

                    {/* ─── CITIZEN SUBMITTED FIELD DETAILS WITH 1-CLICK COPY ─── */}
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
                          onClick={() => copyAllFormValues(selectedSubmission)}
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
                          onClick={() => handleStartFiling(selectedSubmission)}
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
                          onClick={() => setShowRejectionModal(true)}
                          disabled={actionLoading}
                          className="px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold transition disabled:opacity-50 flex items-center gap-1.5"
                        >
                          <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                          <span>Request Correction / Reject</span>
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
            )}

            {/* ───────────────────────────────────────────────────────────── */}
            {/* 4. OTP CENTER (Assisted Verification Relay)                   */}
            {/* ───────────────────────────────────────────────────────────── */}
            {activeTab === 'otp_center' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <KeyRound className="w-5 h-5 text-amber-600" />
                      <div>
                        <h3 className="font-black text-sm text-[#18232D]">In-App Assisted OTP Center</h3>
                        <p className="text-xs text-slate-500">Live citizen SMS verification for Digital Gujarat & Sarathi portals</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
                      {metrics.awaitingOtpCount} Pending Verification
                    </span>
                  </div>

                  <div className="divide-y divide-slate-100 mt-4">
                    {operatorRelevantSubmissions.filter(s => s.active_otp_request || s.status === 'awaiting_otp').length === 0 ? (
                      <div className="py-8 text-center text-xs text-slate-400">
                        No active OTP requests at this moment.
                      </div>
                    ) : (
                      operatorRelevantSubmissions
                        .filter(s => s.active_otp_request || s.status === 'awaiting_otp')
                        .map(sub => (
                          <div key={sub.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-bold text-slate-900">{sub.application_number}</span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusPill(sub.status)}`}>
                                  {sub.status.replace(/_/g, ' ')}
                                </span>
                              </div>
                              <p className="text-xs font-extrabold text-slate-800 mt-0.5">{sub.form_title_en}</p>
                              <p className="text-[11px] text-slate-500">
                                Citizen: {sub.user_name} • Purpose: {sub.active_otp_request?.otp_purpose_en || 'Portal Login'}
                              </p>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setSelectedSubmission(sub);
                                  setShowOtpModal(true);
                                }}
                                className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1 shadow-2xs"
                              >
                                <Send className="w-3.5 h-3.5" />
                                <span>Prompt OTP Again</span>
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedSubmission(sub);
                                  setActiveTab('active_filing');
                                }}
                                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs"
                              >
                                Open File
                              </button>
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ───────────────────────────────────────────────────────────── */}
            {/* 5. CORRECTIONS & RESUBMISSIONS                                */}
            {/* ───────────────────────────────────────────────────────────── */}
            {activeTab === 'corrections' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2 text-rose-600">
                      <AlertTriangle className="w-5 h-5" />
                      <div>
                        <h3 className="font-black text-sm text-[#18232D]">Corrections & Resubmissions Desk</h3>
                        <p className="text-xs text-slate-500">Applications sent back for citizen edits and corrected submissions</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-indigo-800 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full">
                      {metrics.correctionsCount} Applications
                    </span>
                  </div>

                  <div className="divide-y divide-slate-100 mt-4">
                    {operatorRelevantSubmissions.filter(s => ['resubmitted', 'correction_required', 'rejected'].includes(s.status)).length === 0 ? (
                      <div className="py-8 text-center text-xs text-slate-400">
                        No pending corrections or rejected applications in your queue.
                      </div>
                    ) : (
                      operatorRelevantSubmissions
                        .filter(s => ['resubmitted', 'correction_required', 'rejected'].includes(s.status))
                        .map(sub => (
                          <div key={sub.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-bold text-slate-900">{sub.application_number}</span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusPill(sub.status)}`}>
                                  {sub.status.replace(/_/g, ' ')}
                                </span>
                              </div>
                              <p className="text-xs font-black text-slate-800">{sub.form_title_en}</p>
                              {sub.rejection_reason && (
                                <p className="text-xs text-rose-700 bg-rose-50 p-2 rounded-lg border border-rose-100 font-medium">
                                  <strong>Reason Sent to Citizen:</strong> {sub.rejection_reason}
                                </p>
                              )}
                              {sub.operator_notes && (
                                <p className="text-xs text-indigo-800 bg-indigo-50 p-2 rounded-lg border border-indigo-100 font-medium">
                                  <strong>Latest Note:</strong> {sub.operator_notes}
                                </p>
                              )}
                            </div>

                            <button
                              onClick={() => {
                                setSelectedSubmission(sub);
                                setActiveTab('active_filing');
                              }}
                              className="px-4 py-2 rounded-xl bg-[#18232D] hover:bg-[#159447] text-white font-bold text-xs transition shrink-0"
                            >
                              Review & Resume Filing
                            </button>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ───────────────────────────────────────────────────────────── */}
            {/* 6. COMPLETED / ARCHIVE                                        */}
            {/* ───────────────────────────────────────────────────────────── */}
            {activeTab === 'completed' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2 text-purple-600">
                      <History className="w-5 h-5" />
                      <div>
                        <h3 className="font-black text-sm text-[#18232D]">Completed Applications Archive</h3>
                        <p className="text-xs text-slate-500">Read-only record of approved and closed filings</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-purple-800 bg-purple-50 border border-purple-200 px-3 py-1 rounded-full">
                      {metrics.completedCount} Total Closed
                    </span>
                  </div>

                  <div className="divide-y divide-slate-100 mt-4">
                    {operatorRelevantSubmissions.filter(s => ['approved', 'rejected'].includes(s.status)).length === 0 ? (
                      <div className="py-8 text-center text-xs text-slate-400">
                        No completed applications archived yet.
                      </div>
                    ) : (
                      operatorRelevantSubmissions
                        .filter(s => ['approved', 'rejected'].includes(s.status))
                        .map(sub => (
                          <div key={sub.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-bold text-slate-900">{sub.application_number}</span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusPill(sub.status)}`}>
                                  {sub.status.toUpperCase()}
                                </span>
                              </div>
                              <p className="text-xs font-black text-slate-800 mt-0.5">{sub.form_title_en}</p>
                              <p className="text-[11px] text-slate-500">
                                Citizen: {sub.user_name} • Closed on {sub.completed_at ? new Date(sub.completed_at).toLocaleDateString() : 'Recent'}
                              </p>
                              {sub.govt_portal_application_id && (
                                <p className="text-[11px] font-mono text-emerald-800 font-bold">
                                  Govt Application ID: {sub.govt_portal_application_id}
                                </p>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              {sub.certificate_url && (
                                <a
                                  href={sub.certificate_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3 py-1.5 rounded-xl bg-emerald-50 text-[#159447] border border-emerald-200 font-bold text-xs hover:bg-[#159447] hover:text-white transition flex items-center gap-1"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  <span>Download Certificate</span>
                                </a>
                              )}
                              <button
                                onClick={() => {
                                  setSelectedSubmission(sub);
                                  setActiveTab('active_filing');
                                }}
                                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs"
                              >
                                View Details
                              </button>
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ───────────────────────────────────────────────────────────── */}
            {/* 7. MY SERVICES (Authorized Forms & Rules)                     */}
            {/* ───────────────────────────────────────────────────────────── */}
            {activeTab === 'services' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2 text-cyan-600">
                      <Layers className="w-5 h-5" />
                      <div>
                        <h3 className="font-black text-sm text-[#18232D]">My Authorized Government Services</h3>
                        <p className="text-xs text-slate-500">Read-only list of certificate forms you are officially certified to file</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-cyan-800 bg-cyan-50 border border-cyan-200 px-3 py-1 rounded-full">
                      {assignedForms.length} Active Services
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {assignedForms.map(form => (
                      <div key={form.id} className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-[#159447] transition space-y-3">
                        <div className="flex items-center gap-2.5">
                          <FormIcon slug={form.slug} size="md" />
                          <div className="min-w-0">
                            <h4 className="font-black text-sm text-slate-900 truncate">{form.title_en}</h4>
                            <p className="text-xs text-[#159447] font-semibold">{form.title_gu}</p>
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 line-clamp-2">
                          {form.description_en}
                        </p>

                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/70 text-xs">
                          <div>
                            <span className="text-slate-400 block text-[10px]">Turnaround SLA:</span>
                            <span className="font-bold text-slate-800">{form.turnaround_days || 3} Working Days</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">Assistance Fee:</span>
                            <span className="font-bold text-[#159447]">₹{form.service_fee || 70} (+₹{form.official_fee || 20} Govt)</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ───────────────────────────────────────────────────────────── */}
            {/* 8. MY PROFILE & PERFORMANCE                                   */}
            {/* ───────────────────────────────────────────────────────────── */}
            {activeTab === 'profile' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Left: Operator ID Card (5 Cols) */}
                  <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-5 text-center">
                    <div className="w-20 h-20 rounded-2xl bg-[#18232D] text-[#159447] font-black text-3xl mx-auto flex items-center justify-center shadow-sm">
                      {currentOperator?.full_name?.charAt(0) || 'O'}
                    </div>

                    <div>
                      <h3 className="font-black text-lg text-slate-900">{currentOperator?.full_name}</h3>
                      <p className="text-xs font-bold text-[#159447] mt-0.5">Certified Citizen Filing Operator</p>
                      <p className="text-xs text-slate-500 font-mono mt-1">ID: {currentOperator?.id}</p>
                    </div>

                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70 text-left text-xs space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Assigned District:</span>
                        <span className="font-bold text-slate-800">{currentOperator?.district}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Contact Email:</span>
                        <span className="font-mono font-bold text-slate-800">{currentOperator?.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Contact Mobile:</span>
                        <span className="font-mono font-bold text-slate-800">{currentOperator?.phone || '+91 98254 55667'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Role & Security:</span>
                        <span className="font-bold text-[#159447] bg-[#EAF6EE] px-2 py-0.5 rounded-md">Server-Verified (Read-Only)</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Performance Analytics (7 Cols) */}
                  <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-5">
                    <div className="border-b border-slate-100 pb-3">
                      <h3 className="font-black text-sm text-[#18232D] flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-[#159447]" />
                        <span>Filing Quality & SLA Performance</span>
                      </h3>
                      <p className="text-xs text-slate-500">Computed strictly from verified applications in your workspace</p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div className="p-4 rounded-xl bg-[#EAF6EE] border border-emerald-200/70">
                        <span className="text-[10px] uppercase font-bold text-emerald-800">Completion Rate</span>
                        <p className="text-2xl font-black text-[#159447] mt-1">{metrics.completionRate}%</p>
                      </div>
                      <div className="p-4 rounded-xl bg-blue-50 border border-blue-200/70">
                        <span className="text-[10px] uppercase font-bold text-blue-800">Total Processed</span>
                        <p className="text-2xl font-black text-blue-700 mt-1">{metrics.total}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-purple-50 border border-purple-200/70">
                        <span className="text-[10px] uppercase font-bold text-purple-800">Approved Filings</span>
                        <p className="text-2xl font-black text-purple-700 mt-1">{metrics.approvedCount}</p>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2 text-slate-600">
                      <h4 className="font-bold text-slate-900">Security & Compliance Notice</h4>
                      <p>
                        Operator accounts are governed by Gujarat DPDP Act 2023 guidelines. Role escalation and service authorizations are strictly managed by system administrators.
                      </p>
                    </div>
                  </div>

                </div>
              </div>
            )}

          </main>
        </div>

        {/* ─── MODAL: REJECT / CORRECTION REQUEST MODAL ─── */}
        {showRejectionModal && selectedSubmission && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4 animate-scale-in">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-red-100 text-red-700">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900">Request Correction / Reject</h3>
                    <p className="text-xs text-slate-500 font-mono">App: {selectedSubmission.application_number}</p>
                  </div>
                </div>
                <button onClick={() => setShowRejectionModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-600">
                The citizen will see this reason on their tracking page and will be able to correct and resubmit without extra fee.
              </p>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1">
                    Select Rejection Reason:
                  </label>
                  <select
                    value={selectedRejectionTemplate}
                    onChange={e => setSelectedRejectionTemplate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-medium bg-slate-50"
                  >
                    {STANDARD_REJECTION_REASONS.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1">
                    Additional Explanation / Instructions for Citizen:
                  </label>
                  <textarea
                    rows={3}
                    value={customRejectionExplanation}
                    onChange={e => setCustomRejectionExplanation(e.target.value)}
                    placeholder="e.g. Please re-upload clear School LC copy showing applicant date of birth and father name clearly."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRejectionModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmRejection}
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition disabled:opacity-50 shadow-xs"
                >
                  Confirm Rejection & Notify Citizen
                </button>
              </div>
            </div>
          </div>
        )}

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

        <Footer />
      </div>
    </>
  );
}
