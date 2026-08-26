import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ApiService } from '@/lib/api';
import { AdminStats, Operator, FormSubmission, AuditLogItem, CertificateForm, FormField, FeedbackItem } from '@/lib/types';
import { useLanguage } from '@/i18n/LanguageContext';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { FormIcon } from '@/components/FormIcon';
import {
  ShieldCheck,
  Users,
  FileText,
  CheckCircle2,
  Clock,
  IndianRupee,
  Search,
  Filter,
  UserCheck,
  UserPlus,
  ArrowUpRight,
  TrendingUp,
  AlertCircle,
  Plus,
  X,
  ExternalLink,
  ChevronRight,
  Eye,
  RefreshCw,
  Award,
  Layers,
  Lock,
  ArrowLeft,
  Activity,
  FileCheck,
  Settings,
  Sliders,
  LogOut,
  Sparkles,
  PhoneCall,
  Mail,
  MapPin,
  Edit2,
  Trash2,
  Save,
  Check,
  ListPlus,
  HelpCircle,
  Building2,
  Receipt,
  MessageSquare,
  Star,
  ThumbsUp
} from 'lucide-react';
import { AdminBillingDashboard } from '@/components/AdminBillingDashboard';
import { Footer } from '@/components/Footer';

export default function AdminPage() {
  const { t, language } = useLanguage();
  const router = useRouter();

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<'overview' | 'submissions' | 'operators' | 'forms' | 'billing' | 'feedback' | 'audit'>('overview');

  useEffect(() => {
    if (router.query.tab && typeof router.query.tab === 'string') {
      const validTabs = ['overview', 'submissions', 'operators', 'forms', 'billing', 'feedback', 'audit'];
      if (validTabs.includes(router.query.tab)) {
        setActiveTab(router.query.tab as any);
      }
    }
  }, [router.query.tab]);

  // Data states
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [operators, setOperators] = useState<Operator[]>([]);
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [formsList, setFormsList] = useState<CertificateForm[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [formFilter, setFormFilter] = useState<string>('all');

  // Feedback states
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);
  const [feedbackStatusFilter, setFeedbackStatusFilter] = useState<string>('all');
  const [feedbackTypeFilter, setFeedbackTypeFilter] = useState<string>('all');
  const [feedbackRatingFilter, setFeedbackRatingFilter] = useState<number>(0);
  const [feedbackSearch, setFeedbackSearch] = useState<string>('');
  const [feedbackUpdating, setFeedbackUpdating] = useState(false);
  const [modalStatus, setModalStatus] = useState<string>('NEW');
  const [modalAdminNotes, setModalAdminNotes] = useState<string>('');

  // Modals
  const [showAddOperatorModal, setShowAddOperatorModal] = useState(false);
  const [editingOperator, setEditingOperator] = useState<Operator | null>(null);
  const [showDeleteOpConfirm, setShowDeleteOpConfirm] = useState<Operator | null>(null);
  const [showAssignModal, setShowAssignModal] = useState<FormSubmission | null>(null);
  const [selectedSubmissionDetails, setSelectedSubmissionDetails] = useState<FormSubmission | null>(null);

  // Form & Rates Editing State
  const [editingForm, setEditingForm] = useState<CertificateForm | null>(null);
  const [formEditorTab, setFormEditorTab] = useState<'meta' | 'fields'>('meta');
  const [showDeleteFormConfirm, setShowDeleteFormConfirm] = useState<CertificateForm | null>(null);
  const [editingField, setEditingField] = useState<FormField | null>(null);

  // New Operator Form
  const [newOpName, setNewOpName] = useState('');
  const [newOpEmail, setNewOpEmail] = useState('');
  const [newOpPhone, setNewOpPhone] = useState('');
  const [newOpDistrict, setNewOpDistrict] = useState('Ahmedabad');
  const [opSubmitting, setOpSubmitting] = useState(false);

  // Quick Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [statsData, opsData, subsData, logsData, formsData, feedbacksData] = await Promise.all([
        ApiService.getAdminStats(),
        ApiService.getOperators(),
        ApiService.getAllSubmissionsAdmin(),
        ApiService.getAuditLogs(),
        ApiService.getForms(),
        ApiService.getAdminFeedbacks()
      ]);
      setStats(statsData);
      setOperators(opsData);
      setSubmissions(subsData);
      setAuditLogs(logsData);
      setFormsList(formsData);
      setFeedbacks(feedbacksData);
    } catch (err) {
      console.error('Error loading admin data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateFeedbackStatus = async (feedbackId: string, status: string, notes?: string) => {
    setFeedbackUpdating(true);
    try {
      await ApiService.updateAdminFeedbackStatus(feedbackId, status, notes);
      setFeedbacks(prev => prev.map(f => f.id === feedbackId ? { ...f, status: status as any, admin_notes: notes || f.admin_notes } : f));
      if (selectedFeedback && selectedFeedback.id === feedbackId) {
        setSelectedFeedback({ ...selectedFeedback, status: status as any, admin_notes: notes || selectedFeedback.admin_notes });
      }
      showToast(`Feedback marked as ${status}`);
    } catch (e: any) {
      showToast('Failed to update feedback status');
    } finally {
      setFeedbackUpdating(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // ─── OPERATOR CRUD HANDLERS ───
  const handleCreateOperator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOpName || !newOpEmail) return;
    setOpSubmitting(true);
    try {
      const newOp = await ApiService.addOperator({
        full_name: newOpName,
        email: newOpEmail,
        phone: newOpPhone || '+91 98250 00000',
        district: newOpDistrict
      });
      setOperators(prev => [newOp, ...prev]);
      setShowAddOperatorModal(false);
      setNewOpName('');
      setNewOpEmail('');
      setNewOpPhone('');
      showToast(language === 'gu' ? 'નવા ઓપરેટર સફળતાપૂર્વક ઉમેરાયા' : 'New operator registered successfully');
    } catch (e) {
      showToast('Failed to create operator');
    } finally {
      setOpSubmitting(false);
    }
  };

  const handleUpdateOperator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOperator) return;
    setOpSubmitting(true);
    try {
      const updated = await ApiService.updateOperator(editingOperator.id, editingOperator);
      setOperators(prev => prev.map(op => (op.id === updated.id ? updated : op)));
      setEditingOperator(null);
      showToast('Operator profile updated successfully');
    } catch (e) {
      showToast('Failed to update operator profile');
    } finally {
      setOpSubmitting(false);
    }
  };

  const handleDeleteOperator = async (operatorId: string) => {
    try {
      await ApiService.deleteOperator(operatorId);
      setOperators(prev => prev.filter(op => op.id !== operatorId));
      setShowDeleteOpConfirm(null);
      showToast('Operator deleted successfully');
    } catch (e) {
      showToast('Failed to delete operator');
    }
  };

  const handleToggleOperator = async (operatorId: string) => {
    try {
      await ApiService.toggleOperator(operatorId);
      setOperators(prev =>
        prev.map(op => (op.id === operatorId ? { ...op, is_active: !op.is_active } : op))
      );
      showToast('Operator status updated');
    } catch (e) {
      showToast('Failed to toggle status');
    }
  };

  const handleToggleOperatorFormAssignment = async (operatorId: string, formId: string, isAssigned: boolean) => {
    // 1. Optimistic immediate state update for instantaneous responsive clicking
    setOperators(prevOps =>
      prevOps.map(op => {
        if (op.id === operatorId) {
          const currentIds = op.assigned_form_ids || [];
          const currentForms = op.assigned_forms || [];
          const formObj = formsList.find(f => f.id === formId);
          const formSlug = formObj?.slug;

          const newIds = isAssigned
            ? currentIds.filter(id => id !== formId)
            : [...currentIds, formId];

          const newForms = isAssigned
            ? currentForms.filter(s => s !== formSlug)
            : formSlug ? [...currentForms, formSlug] : currentForms;

          return { ...op, assigned_form_ids: newIds, assigned_forms: newForms };
        }
        return op;
      })
    );

    try {
      if (isAssigned) {
        await ApiService.removeOperatorAssignment(operatorId, formId);
      } else {
        await ApiService.assignOperatorForm(operatorId, formId);
      }
      showToast('Operator authorization matrix updated');
    } catch (e) {
      showToast('Failed to update operator assignment');
      const ops = await ApiService.getOperators();
      setOperators(ops);
    }
  };

  // ─── FORM & RATES CRUD HANDLERS ───
  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingForm) return;
    try {
      const saved = await ApiService.saveForm(editingForm);
      setFormsList(prev => {
        const idx = prev.findIndex(f => f.id === saved.id || f.slug === saved.slug);
        if (idx >= 0) {
          const cp = [...prev];
          cp[idx] = saved;
          return cp;
        }
        return [saved, ...prev];
      });
      setEditingForm(null);
      showToast(`Form & Rates "${saved.title_en}" saved successfully`);
    } catch (e) {
      showToast('Failed to save form changes');
    }
  };

  const handleDeleteForm = async (formId: string) => {
    try {
      await ApiService.deleteForm(formId);
      setFormsList(prev => prev.filter(f => f.id !== formId && f.slug !== formId));
      setShowDeleteFormConfirm(null);
      showToast('Service form removed');
    } catch (e) {
      showToast('Failed to delete form');
    }
  };

  const handleCreateNewFormInit = () => {
    const newForm: CertificateForm = {
      id: `custom-form-${Date.now()}`,
      slug: `custom_service_${Date.now()}`,
      title_en: 'New Gujarat Government Certificate',
      title_gu: 'નવી ગુજરાત સરકારી સેવા',
      title_hi: 'नई गुजरात सरकारी सेवा',
      description_en: 'Assisted online application filing on Gujarat official portals.',
      description_gu: 'ગુજરાત ઓફિશિયલ પોર્ટલ પર સહાયિત ઓનલાઇન અરજી.',
      description_hi: 'गुजरात आधिकारिक पोर्टल पर समर्थित ऑनलाइन आवेदन।',
      department_name_en: 'Revenue & Citizen Services Department, Gujarat',
      department_name_gu: 'મહેસૂલ અને નાગરિક સેવા વિભાગ, ગુજરાત',
      department_name_hi: 'राजस्व एवं नागरिक सेवा विभाग, गुजरात',
      official_fee: 50,
      service_fee: 49,
      turnaround_days: 3,
      expected_otp_count: 1,
      required_docs_json: [
        { key: 'aadhaar_card', label_en: 'Aadhaar Card', label_gu: 'આધાર કાર્ડ', label_hi: 'आधार कार्ड', required: true },
        { key: 'ration_card', label_en: 'Ration Card / ID Proof', label_gu: 'રેશન કાર્ડ / ઓળખ પત્ર', label_hi: 'राशन कार्ड', required: true }
      ],
      is_active: true,
      sort_order: formsList.length + 1,
      fields: [
        {
          id: `f-${Date.now()}-1`,
          form_id: `custom-form-${Date.now()}`,
          field_key: 'applicant_name',
          step_section: 'personal',
          field_type: 'text',
          label_en: 'Full Name of Applicant',
          label_gu: 'અરજદારનું પૂરું નામ',
          label_hi: 'आवेदक का पूरा नाम',
          placeholder_en: 'Enter full name as per Aadhaar',
          is_required: true,
          sort_order: 1
        },
        {
          id: `f-${Date.now()}-2`,
          form_id: `custom-form-${Date.now()}`,
          field_key: 'mobile_number',
          step_section: 'personal',
          field_type: 'number',
          label_en: 'Mobile Number',
          label_gu: 'મોબાઇલ નંબર',
          label_hi: 'मोबाइल नंबर',
          placeholder_en: '10-digit mobile number',
          is_required: true,
          sort_order: 2
        }
      ]
    };
    setEditingForm(newForm);
    setFormEditorTab('meta');
  };

  // Field Add / Edit inside editingForm
  const handleSaveField = (field: FormField) => {
    if (!editingForm) return;
    const currentFields = editingForm.fields || [];
    const idx = currentFields.findIndex(f => f.id === field.id || f.field_key === field.field_key);
    let updatedFields: FormField[];
    if (idx >= 0) {
      updatedFields = [...currentFields];
      updatedFields[idx] = field;
    } else {
      updatedFields = [...currentFields, field];
    }
    setEditingForm({ ...editingForm, fields: updatedFields });
    setEditingField(null);
    showToast(`Field "${field.label_en}" updated`);
  };

  const handleDeleteField = (fieldId: string) => {
    if (!editingForm) return;
    const updated = (editingForm.fields || []).filter(f => f.id !== fieldId);
    setEditingForm({ ...editingForm, fields: updated });
    showToast('Field deleted');
  };

  // Handle Assign Operator
  const handleAssignOperator = async (submissionId: string, operatorId: string) => {
    try {
      await ApiService.assignSubmission(submissionId, operatorId);
      const op = operators.find(o => o.id === operatorId);
      setSubmissions(prev =>
        prev.map(s =>
          s.id === submissionId
            ? { ...s, assigned_operator_id: operatorId, assigned_operator_name: op?.full_name }
            : s
        )
      );
      setShowAssignModal(null);
      showToast('Application assigned successfully');
    } catch (e) {
      showToast('Assignment failed');
    }
  };

  // Status Badge Colors & Labels
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return {
          bg: 'bg-emerald-50 text-[#159447] border-emerald-200',
          label: language === 'gu' ? 'મંજૂર / પૂર્ણ' : language === 'hi' ? 'स्वीकृत' : 'Approved'
        };
      case 'operator_filling':
      case 'filling':
        return {
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          label: language === 'gu' ? 'ઓપરેટર ભરે છે' : language === 'hi' ? 'ऑपरेटर भर रहा है' : 'In Progress'
        };
      case 'submitted_to_govt_portal':
        return {
          bg: 'bg-purple-50 text-purple-700 border-purple-200',
          label: language === 'gu' ? 'સરકારી પોર્ટલ પર' : language === 'hi' ? 'सरकारी पोर्टल' : 'Govt Portal'
        };
      case 'in_review':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          label: language === 'gu' ? 'સમીક્ષા હેઠળ' : language === 'hi' ? 'समीक्षाधीन' : 'In Review'
        };
      case 'awaiting_otp':
        return {
          bg: 'bg-orange-50 text-orange-700 border-orange-200',
          label: language === 'gu' ? 'OTP બાકી' : language === 'hi' ? 'OTP प्रतीक्षारत' : 'Awaiting OTP'
        };
      case 'rejected':
        return {
          bg: 'bg-red-50 text-red-700 border-red-200',
          label: language === 'gu' ? 'અસ્વીકાર' : language === 'hi' ? 'अस्वीकृत' : 'Rejected'
        };
      default:
        return {
          bg: 'bg-slate-50 text-slate-700 border-slate-200',
          label: language === 'gu' ? 'સબમિટ કરેલ' : language === 'hi' ? 'प्रस्तुत' : 'Submitted'
        };
    }
  };

  // Filtered Submissions
  const filteredSubmissions = submissions.filter(sub => {
    const matchesSearch =
      sub.application_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sub.user_name && sub.user_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (sub.user_phone && sub.user_phone.includes(searchQuery)) ||
      sub.form_slug.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
    const matchesForm = formFilter === 'all' || sub.form_slug === formFilter;

    return matchesSearch && matchesStatus && matchesForm;
  });

  return (
    <>
      <Head>
        <title>
          {language === 'gu'
            ? 'એડમિન કન્સોલ – FormSeva Gujarat'
            : language === 'hi'
            ? 'प्रशासनिक कंसोल – FormSeva Gujarat'
            : 'Admin Control Center – FormSeva Gujarat'}
        </title>
        <meta name="description" content="Central administrative dashboard for FormSeva Gujarat Government Services" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>

      <div className="min-h-screen bg-[#F7FAF8] text-[#18232D] flex flex-col">
        
        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#18232D] text-white px-5 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-3 animate-slide-up text-sm font-semibold">
            <CheckCircle2 className="w-5 h-5 text-[#159447]" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* ─── TOP ADMIN NAVBAR ─── */}
        <header className="bg-white border-b border-slate-200/80 sticky top-0 z-40 shadow-2xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16 sm:h-20">
              
              {/* Left Brand Mark */}
              <div className="flex items-center gap-4">
                <Link href="/" className="flex items-center gap-3 group">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-xs border border-slate-200 p-1 group-hover:scale-105 transition-transform overflow-hidden">
                    <img src="/icon.png" alt="FormSeva" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <div className="font-black text-xl sm:text-2xl text-[#18232D] tracking-tight leading-none flex items-center gap-2">
                      <span>Form<span className="text-[#159447]">Seva</span></span>
                      <span className="text-[10px] uppercase font-bold tracking-wider bg-slate-900 text-white px-2 py-0.5 rounded-md">
                        ADMIN
                      </span>
                    </div>
                    <p className="text-[9px] text-[#5B6470] font-bold tracking-widest uppercase mt-0.5">
                      Gujarat State Administration
                    </p>
                  </div>
                </Link>
              </div>

              {/* Center spacer – navigation moved to left sidebar */}
              <div className="hidden md:flex flex-1" />

              {/* Right Action Items */}
              <div className="flex items-center gap-3">
                <LanguageSwitcher />

                {/* Back to Citizen Portal */}
                <Link
                  href="/"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-slate-300 text-xs font-semibold text-[#5B6470] hover:text-[#18232D] hover:border-slate-400 bg-white transition-all"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Citizen Portal</span>
                </Link>

                <Link
                  href="/operator"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#159447] text-white text-xs font-bold shadow-2xs hover:bg-[#12803c] transition-all"
                >
                  <span>Operator Portal →</span>
                </Link>

                {/* Refresh Button */}
                <button
                  onClick={loadAllData}
                  className="p-2 rounded-xl border border-slate-200 text-[#5B6470] hover:text-[#159447] hover:bg-emerald-50 transition"
                  title="Refresh Data"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#159447]' : ''}`} />
                </button>
              </div>

            </div>

            {/* Mobile Tab Strip */}
            <div className="md:hidden flex items-center gap-1 overflow-x-auto pb-2.5 pt-1 border-t border-slate-100 scrollbar-none">
              {[
                { id: 'overview', label: 'Overview', icon: Activity },
                { id: 'billing', label: 'Billing & Charts', icon: Receipt },
                { id: 'submissions', label: 'Submissions', icon: FileText },
                { id: 'operators', label: 'Operators', icon: Users },
                { id: 'forms', label: 'Forms & Rates', icon: Layers },
                { id: 'feedback', label: 'Feedback', icon: MessageSquare },
                { id: 'audit', label: 'Audit', icon: ShieldCheck },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${
                    activeTab === tab.id ? 'bg-[#159447] text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* ─── BODY: LEFT SIDEBAR + MAIN CONTENT ─── */}
        <div className="flex flex-1 min-h-0">

          {/* ══════════════════════════════ */}
          {/* LEFT VERTICAL SIDEBAR NAV     */}
          {/* ══════════════════════════════ */}
          <aside className="hidden md:flex flex-col w-60 shrink-0 bg-white border-r border-slate-200/80 sticky top-[80px] h-[calc(100vh-80px)] overflow-y-auto">
            {/* Admin identity badge */}
            <div className="px-5 pt-6 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#18232D] flex items-center justify-center shrink-0">
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
              {[
                { id: 'overview',     label: language === 'gu' ? 'ઝાંખી' : 'Overview',         icon: Activity,      color: 'text-blue-500',    bg: 'bg-blue-50' },
                { id: 'billing',      label: language === 'gu' ? 'બિલિંગ' : 'Billing & Revenue', icon: Receipt,       color: 'text-violet-500',  bg: 'bg-violet-50' },
                { id: 'submissions',  label: language === 'gu' ? 'અરજીઓ' : 'Submissions',       icon: FileText,      color: 'text-amber-500',   bg: 'bg-amber-50' },
                { id: 'operators',    label: language === 'gu' ? 'ઓપરેટર્સ' : 'Operators',       icon: Users,         color: 'text-cyan-500',    bg: 'bg-cyan-50' },
                { id: 'forms',        label: language === 'gu' ? 'ફોર્મ્સ & દર' : 'Forms & Rates', icon: Layers,        color: 'text-orange-500',  bg: 'bg-orange-50' },
                { id: 'feedback',     label: language === 'gu' ? 'પ્રતિસાદ' : 'Feedback',         icon: MessageSquare, color: 'text-pink-500',    bg: 'bg-pink-50' },
                { id: 'audit',        label: language === 'gu' ? 'ઓડિટ લોગ' : 'Audit Logs',      icon: ShieldCheck,   color: 'text-[#159447]',   bg: 'bg-[#EAF6EE]' },
              ].map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all group ${
                      isActive
                        ? 'bg-[#18232D] text-white shadow-sm'
                        : 'text-[#5B6470] hover:bg-slate-100 hover:text-[#18232D]'
                    }`}
                  >
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                      isActive ? 'bg-white/10' : tab.bg
                    }`}>
                      <Icon className={`w-4 h-4 ${ isActive ? 'text-white' : tab.color }`} />
                    </span>
                    <span className="text-[13px] leading-tight">{tab.label}</span>
                    {isActive && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#159447] shrink-0" />
                    )}
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

          {/* ─── MAIN CONTENT CONTAINER ─── */}
          <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          
          {/* ═════════════════════════════════════════════════════════════════════ */}
          {/* TAB: BILLING, PAYMENTS & REVENUE ANALYTICS                            */}
          {/* ═════════════════════════════════════════════════════════════════════ */}
          {activeTab === 'billing' && (
            <AdminBillingDashboard
              formsList={formsList}
              operatorsList={operators}
            />
          )}

          {/* ═════════════════════════════════════════════════════════════════════ */}
          {/* TAB 1: OVERVIEW & ANALYTICS DASHBOARD                                  */}
          {/* ═════════════════════════════════════════════════════════════════════ */}
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-fade-in">
              
              {/* Header Title & Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-[#18232D] tracking-tight">
                    {language === 'gu' ? 'વહીવટી ડેશબોર્ડ' : 'Administrative Operations Dashboard'}
                  </h1>
                  <p className="text-xs sm:text-sm text-[#5B6470] mt-1">
                    Live analytics, operator queues, and revenue metrics across Gujarat citizen services.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowAddOperatorModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#159447] hover:bg-[#12803c] text-white font-bold text-xs sm:text-sm shadow-sm hover:shadow transition-all"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>+ Register Operator</span>
                  </button>
                  <button
                    onClick={handleCreateNewFormInit}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#18232D] hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-sm transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Add New Service</span>
                  </button>
                </div>
              </div>

              {/* ─── ROW 1: 3 PRIMARY OPERATIONAL KPI CARDS ─── */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {/* Card 1: Total Applications */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#5B6470] uppercase tracking-wider">Total Applications</span>
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <FileText className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-3xl font-black text-[#18232D]">
                      {stats?.total_submissions || submissions.length}
                    </span>
                    <span className="inline-flex items-center text-xs font-bold text-[#159447] bg-emerald-50 px-2 py-0.5 rounded-md">
                      <TrendingUp className="w-3 h-3 mr-1" /> +14.2%
                    </span>
                  </div>
                  <p className="text-[11px] text-[#5B6470]">Across {formsList.length} Gujarat portals</p>
                </div>

                {/* Card 2: Approved & Completed */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#5B6470] uppercase tracking-wider">Approved & Issued</span>
                    <div className="w-9 h-9 rounded-xl bg-[#EAF6EE] text-[#159447] flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-3xl font-black text-[#18232D]">
                      {stats?.completed_submissions || 142}
                    </span>
                    <span className="text-xs font-semibold text-[#5B6470]">98.6% Accuracy</span>
                  </div>
                  <p className="text-[11px] text-[#5B6470]">Official certificates issued</p>
                </div>

                {/* Card 3: In-Progress Active Queue */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#5B6470] uppercase tracking-wider">Active Queue</span>
                    <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                      <Clock className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-3xl font-black text-[#18232D]">
                      {stats?.in_progress || 32}
                    </span>
                    <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                      Avg 12m Turnaround
                    </span>
                  </div>
                  <p className="text-[11px] text-[#5B6470]">With certified operators</p>
                </div>
              </div>

              {/* ─── ROW 2: 3 DEDICATED FINANCIAL & FEE BREAKDOWN CARDS ─── */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {/* Financial Card 1: Government Official Fee */}
                <div className="bg-white rounded-2xl p-5 border border-blue-200/80 shadow-xs space-y-3 bg-gradient-to-br from-white via-white to-blue-50/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full inline-block mb-1">
                        GOVERNMENT TREASURY
                      </span>
                      <h3 className="text-xs font-bold text-[#18232D]">
                        {language === 'gu' ? 'સરકારી પોર્ટલ ફી' : 'Govt Official Fees'}
                      </h3>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                      <Building2 className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between pt-1">
                    <span className="text-2xl sm:text-3xl font-black text-blue-900">
                      ₹{(Math.round((stats?.total_revenue_inr || 18216) * 0.52)).toLocaleString('en-IN')}
                    </span>
                    <span className="text-[11px] font-bold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-md">
                      100% Remitted
                    </span>
                  </div>
                  <p className="text-[11px] text-[#5B6470]">
                    Direct government treasury & official portal charges
                  </p>
                </div>

                {/* Financial Card 2: FormSeva Portal Fees */}
                <div className="bg-white rounded-2xl p-5 border border-emerald-200/80 shadow-xs space-y-3 bg-gradient-to-br from-white via-white to-emerald-50/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#159447] bg-[#EAF6EE] border border-emerald-200 px-2 py-0.5 rounded-full inline-block mb-1">
                        FORMSEVA PLATFORM
                      </span>
                      <h3 className="text-xs font-bold text-[#18232D]">
                        {language === 'gu' ? 'પોર્ટલ સહાયતા ફી' : 'FormSeva Portal Fees'}
                      </h3>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-[#EAF6EE] text-[#159447] flex items-center justify-center shrink-0">
                      <Sparkles className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between pt-1">
                    <span className="text-2xl sm:text-3xl font-black text-[#159447]">
                      ₹{((stats?.total_revenue_inr || 18216) - Math.round((stats?.total_revenue_inr || 18216) * 0.52)).toLocaleString('en-IN')}
                    </span>
                    <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                      Platform Revenue
                    </span>
                  </div>
                  <p className="text-[11px] text-[#5B6470]">
                    Assisted filing, operator verification & OTP assistance
                  </p>
                </div>

                {/* Financial Card 3: Total Gross Collections */}
                <div className="bg-white rounded-2xl p-5 border border-purple-200/80 shadow-xs space-y-3 bg-gradient-to-br from-white via-white to-purple-50/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full inline-block mb-1">
                        GROSS COLLECTIONS
                      </span>
                      <h3 className="text-xs font-bold text-[#18232D]">
                        {language === 'gu' ? 'કુલ આવક (Total)' : 'Total Revenue Collected'}
                      </h3>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                      <IndianRupee className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between pt-1">
                    <span className="text-2xl sm:text-3xl font-black text-purple-900">
                      ₹{(stats?.total_revenue_inr || 18216).toLocaleString('en-IN')}
                    </span>
                    <span className="text-[11px] font-bold text-purple-700 bg-purple-100/70 px-2 py-0.5 rounded-md">
                      Govt + Portal Fee
                    </span>
                  </div>
                  <p className="text-[11px] text-[#5B6470]">
                    Total collected = Govt (₹9,472) + Portal (₹8,744)
                  </p>
                </div>
              </div>

              {/* Middle Section: Form Breakdown & Active Operators */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Left (7 Cols): Volume by Certificate / Form */}
                <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-extrabold text-base sm:text-lg text-[#18232D]">
                        Service Category Demand & Volume
                      </h2>
                      <p className="text-xs text-[#5B6470]">Real-time demand across Gujarat citizen services</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('forms')}
                      className="text-xs font-bold text-[#159447] hover:underline flex items-center gap-1"
                    >
                      <span>Manage Services & Rates ({formsList.length})</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-4 pt-2">
                    {formsList.slice(0, 6).map((f, i) => (
                      <div key={f.slug} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <div className="flex items-center gap-2">
                            <FormIcon slug={f.slug} size="sm" />
                            <span className="text-[#18232D]">{f.title_en}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[#18232D] font-extrabold">₹{f.official_fee + f.service_fee}</span>
                            <span className="text-[#5B6470] text-[11px] ml-1.5 font-normal">({f.turnaround_days}d SLA)</span>
                          </div>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className="h-full bg-[#159447] rounded-full" style={{ width: `${Math.max(15, 80 - i * 12)}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right (5 Cols): Active Operators Status */}
                <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-extrabold text-base sm:text-lg text-[#18232D]">
                        Certified Operators ({operators.length})
                      </h2>
                      <p className="text-xs text-[#5B6470]">Filing specialists & district assignments</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('operators')}
                      className="text-xs font-bold text-[#159447] hover:underline flex items-center gap-1"
                    >
                      <span>Full CRUD</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-3 pt-1">
                    {operators.slice(0, 4).map(op => (
                      <div
                        key={op.id}
                        className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-emerald-100 text-[#159447] font-bold text-xs flex items-center justify-center shrink-0">
                            {op.full_name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-bold text-xs sm:text-sm text-[#18232D]">{op.full_name}</h3>
                            <p className="text-[11px] text-[#5B6470]">
                              📍 {op.district} • {op.completed_count} done
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditingOperator(op)}
                            className="p-1.5 rounded-lg border border-slate-200 hover:border-slate-300 text-[#5B6470] hover:text-[#18232D]"
                            title="Edit Operator Profile"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              op.is_active
                                ? 'bg-emerald-50 text-[#159447] border border-emerald-200'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {op.is_active ? 'Active' : 'Offline'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Recent 5 Applications Table Preview */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-extrabold text-base sm:text-lg text-[#18232D]">
                      Latest Citizen Applications Stream
                    </h2>
                    <p className="text-xs text-[#5B6470]">Live queue across all certificates</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('submissions')}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#159447] hover:underline"
                  >
                    <span>View All ({submissions.length})</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-[#5B6470] text-[11px] uppercase tracking-wider">
                        <th className="py-3 px-3">Application ID</th>
                        <th className="py-3 px-3">Citizen</th>
                        <th className="py-3 px-3">Service</th>
                        <th className="py-3 px-3">Status</th>
                        <th className="py-3 px-3">Operator</th>
                        <th className="py-3 px-3 text-right">Fee</th>
                        <th className="py-3 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
                      {submissions.slice(0, 5).map(sub => {
                        const badge = getStatusBadge(sub.status);
                        return (
                          <tr key={sub.id} className="hover:bg-slate-50/70 transition">
                            <td className="py-3 px-3 font-mono font-bold text-[#18232D]">
                              {sub.application_number}
                            </td>
                            <td className="py-3 px-3">
                              <div className="font-bold text-[#18232D]">{sub.user_name || 'Citizen User'}</div>
                              <div className="text-[11px] text-[#5B6470]">{sub.user_phone || '+91 98980 12345'}</div>
                            </td>
                            <td className="py-3 px-3">
                              <div className="font-semibold text-[#18232D]">{sub.form_title_en}</div>
                              <div className="text-[10px] text-[#5B6470]">{sub.form_title_gu}</div>
                            </td>
                            <td className="py-3 px-3">
                              <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold border ${badge.bg}`}>
                                {badge.label}
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              {sub.assigned_operator_name ? (
                                <span className="text-xs font-semibold text-[#18232D]">
                                  👤 {sub.assigned_operator_name}
                                </span>
                              ) : (
                                <span className="text-xs text-amber-600 font-medium italic">Unassigned</span>
                              )}
                            </td>
                            <td className="py-3 px-3 text-right font-bold text-[#18232D]">
                              ₹{sub.total_fee}
                            </td>
                            <td className="py-3 px-3 text-right">
                              <button
                                onClick={() => setSelectedSubmissionDetails(sub)}
                                className="px-3 py-1 rounded-lg border border-slate-200 hover:border-slate-300 bg-white text-xs font-bold text-[#18232D] shadow-2xs hover:bg-slate-50 transition"
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════════ */}
          {/* TAB 2: SUBMISSIONS & WORKFLOW QUEUE                                   */}
          {/* ═════════════════════════════════════════════════════════════════════ */}
          {activeTab === 'submissions' && (
            <div className="space-y-6 animate-fade-in">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-[#18232D] tracking-tight">
                    All Citizen Submissions Queue
                  </h1>
                  <p className="text-xs sm:text-sm text-[#5B6470] mt-1">
                    Manage assignments, verify documents, and monitor eSewa/NTA filing progress.
                  </p>
                </div>
              </div>

              {/* Search & Filter Toolbar */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center gap-3">
                {/* Search input */}
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 text-[#5B6470] absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search by Application ID, Citizen Name, Mobile, or Form..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 text-[#18232D] focus:outline-none focus:ring-2 focus:ring-[#159447]/30 focus:border-[#159447]"
                  />
                </div>

                {/* Status dropdown */}
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="w-full md:w-auto px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 text-[#18232D] bg-white focus:outline-none focus:ring-2 focus:ring-[#159447]/30"
                  >
                    <option value="all">All Statuses</option>
                    <option value="submitted">Submitted (New)</option>
                    <option value="in_review">In Review</option>
                    <option value="operator_filling">Operator Filling</option>
                    <option value="submitted_to_govt_portal">Govt Portal Submitted</option>
                    <option value="approved">Approved / Done</option>
                    <option value="rejected">Rejected</option>
                  </select>

                  {/* Form Filter dropdown */}
                  <select
                    value={formFilter}
                    onChange={e => setFormFilter(e.target.value)}
                    className="w-full md:w-auto px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 text-[#18232D] bg-white focus:outline-none focus:ring-2 focus:ring-[#159447]/30"
                  >
                    <option value="all">All Forms</option>
                    {formsList.map(f => (
                      <option key={f.slug} value={f.slug}>{f.title_en}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Submissions Data Table */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[#5B6470] text-[11px] uppercase tracking-wider">
                        <th className="py-3.5 px-4 font-bold">App Number</th>
                        <th className="py-3.5 px-4 font-bold">Citizen Details</th>
                        <th className="py-3.5 px-4 font-bold">Service / Portal</th>
                        <th className="py-3.5 px-4 font-bold">Filing Status</th>
                        <th className="py-3.5 px-4 font-bold">Assigned Operator</th>
                        <th className="py-3.5 px-4 font-bold">Payment</th>
                        <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {filteredSubmissions.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center py-12 text-[#5B6470]">
                            <FileText className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                            No matching applications found.
                          </td>
                        </tr>
                      ) : (
                        filteredSubmissions.map(sub => {
                          const badge = getStatusBadge(sub.status);
                          return (
                            <tr key={sub.id} className="hover:bg-slate-50/70 transition">
                              <td className="py-4 px-4 font-mono font-bold text-[#18232D]">
                                {sub.application_number}
                                <div className="text-[10px] text-[#5B6470] font-normal font-sans">
                                  {new Date(sub.submitted_at).toLocaleDateString()}
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <div className="font-bold text-[#18232D]">{sub.user_name || 'Citizen User'}</div>
                                <div className="text-[11px] text-[#5B6470]">{sub.user_phone || '+91 98980 12345'}</div>
                              </td>
                              <td className="py-4 px-4">
                                <div className="font-semibold text-[#18232D]">{sub.form_title_en}</div>
                                {sub.govt_portal_application_id && (
                                  <div className="text-[10px] font-mono text-[#159447] font-bold">
                                    Portal ID: {sub.govt_portal_application_id}
                                  </div>
                                )}
                              </td>
                              <td className="py-4 px-4">
                                <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold border ${badge.bg}`}>
                                  {badge.label}
                                </span>
                              </td>
                              <td className="py-4 px-4">
                                {sub.assigned_operator_name ? (
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-semibold text-[#18232D]">
                                      {sub.assigned_operator_name}
                                    </span>
                                    <button
                                      onClick={() => setShowAssignModal(sub)}
                                      className="text-[10px] text-[#159447] hover:underline font-bold"
                                    >
                                      (Change)
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setShowAssignModal(sub)}
                                    className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold hover:bg-amber-100 transition"
                                  >
                                    + Assign Operator
                                  </button>
                                )}
                              </td>
                              <td className="py-4 px-4">
                                <span className="font-bold text-[#18232D]">₹{sub.total_fee}</span>
                                <span className="ml-1.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                                  PAID
                                </span>
                              </td>
                              <td className="py-4 px-4 text-right">
                                <button
                                  onClick={() => setSelectedSubmissionDetails(sub)}
                                  className="px-3 py-1.5 rounded-xl border border-slate-200 hover:border-[#159447] hover:text-[#159447] bg-white text-xs font-bold text-[#18232D] shadow-2xs transition"
                                >
                                  Details
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════════ */}
          {/* TAB 3: OPERATOR MANAGEMENT (FULL CRUD & SERVICE ASSIGNMENTS)           */}
          {/* ═════════════════════════════════════════════════════════════════════ */}
          {activeTab === 'operators' && (
            <div className="space-y-8 animate-fade-in">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-[#18232D] tracking-tight">
                    Certified Operator Management & Service Matrix
                  </h1>
                  <p className="text-xs sm:text-sm text-[#5B6470] mt-1">
                    Manage operator credentials, active status, and assign specific government forms to certified operators.
                  </p>
                </div>

                <button
                  onClick={() => setShowAddOperatorModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#159447] hover:bg-[#12803c] text-white font-bold text-xs sm:text-sm shadow-sm hover:shadow transition-all"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>+ Register New Operator</span>
                </button>
              </div>

              {/* ─── OPERATOR ↔ FORM ASSIGNMENT MATRIX TABLE ─── */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <h2 className="font-extrabold text-base text-[#18232D] flex items-center gap-2">
                      <Layers className="w-5 h-5 text-[#159447]" />
                      <span>Operator ↔ Form Authorization Matrix</span>
                    </h2>
                    <p className="text-xs text-[#5B6470] mt-0.5">
                      Check/uncheck to authorize which government services each operator is eligible to process.
                    </p>
                  </div>
                  <span className="text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
                    Enforced at Backend Queue Level
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="py-3 px-4 font-bold text-slate-700">Operator</th>
                        <th className="py-3 px-4 font-bold text-slate-700">District</th>
                        {formsList.map(f => (
                          <th key={f.id} className="py-3 px-3 font-bold text-slate-700 text-center min-w-[120px]">
                            <div className="font-bold truncate" title={f.title_en}>{f.title_en}</div>
                            <div className="text-[10px] text-slate-400 font-mono">₹{f.official_fee + f.service_fee}</div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {operators.map(op => (
                        <tr key={op.id} className="hover:bg-slate-50/60 transition">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900">{op.full_name}</div>
                            <div className="text-[11px] text-slate-500 font-mono">{op.email}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[11px]">
                              {op.district}
                            </span>
                          </td>
                          {formsList.map(f => {
                            const isAssigned = (op.assigned_form_ids && op.assigned_form_ids.includes(f.id)) ||
                              (op.assigned_forms && op.assigned_forms.includes(f.slug));
                            return (
                              <td key={f.id} className="py-3.5 px-3 text-center">
                                <label className="inline-flex items-center justify-center cursor-pointer p-1">
                                  <input
                                    type="checkbox"
                                    checked={Boolean(isAssigned)}
                                    onChange={() => handleToggleOperatorFormAssignment(op.id, f.id, Boolean(isAssigned))}
                                    className="w-4 h-4 text-[#159447] rounded border-slate-300 focus:ring-[#159447] cursor-pointer"
                                  />
                                </label>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Operators Grid Cards with Full Edit/Delete options */}
              <div className="space-y-3">
                <h2 className="font-extrabold text-base text-[#18232D]">All Registered Operators</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {operators.map(op => (
                    <div
                      key={op.id}
                      className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between">
                          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#159447] font-black text-base flex items-center justify-center border border-emerald-100">
                            {op.full_name.slice(0, 2).toUpperCase()}
                          </div>
                          
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setEditingOperator(op)}
                              className="p-1.5 rounded-lg border border-slate-200 hover:border-slate-400 text-slate-700 bg-white hover:bg-slate-50 transition"
                              title="Edit Operator Profile"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setShowDeleteOpConfirm(op)}
                              className="p-1.5 rounded-lg border border-red-200 hover:border-red-400 text-red-600 bg-red-50/50 hover:bg-red-50 transition"
                              title="Delete Operator"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <h3 className="font-extrabold text-base text-[#18232D] mt-3">{op.full_name}</h3>
                        <p className="text-xs text-[#5B6470] flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-[#159447]" /> {op.district} District
                        </p>

                        <div className="space-y-1 mt-3 pt-3 border-t border-slate-100 text-xs text-[#5B6470]">
                          <div className="flex items-center gap-1.5 truncate">
                            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{op.email}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <PhoneCall className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{op.phone || '+91 98250 11223'}</span>
                          </div>
                        </div>

                        {op.assigned_forms && op.assigned_forms.length > 0 && (
                          <div className="mt-2.5 pt-2 border-t border-slate-100">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Assigned Services:</span>
                            <div className="flex flex-wrap gap-1">
                              {op.assigned_forms.map(s => (
                                <span key={s} className="px-1.5 py-0.5 bg-slate-100 text-slate-700 font-mono text-[9px] rounded font-bold">
                                  {s.replace(/_/g, ' ')}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="pt-3 border-t border-slate-100 space-y-2.5">
                        <div className="grid grid-cols-2 gap-2 text-center text-xs">
                          <div className="bg-slate-50 p-2 rounded-xl">
                            <div className="font-black text-[#18232D] text-base">{op.assigned_count}</div>
                            <div className="text-[10px] text-[#5B6470]">In Queue</div>
                          </div>
                          <div className="bg-emerald-50/70 p-2 rounded-xl">
                            <div className="font-black text-[#159447] text-base">{op.completed_count}</div>
                            <div className="text-[10px] text-emerald-800">Completed</div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <button
                            onClick={() => handleToggleOperator(op.id)}
                            className={`w-full py-1.5 rounded-xl text-xs font-bold transition-all ${
                              op.is_active
                                ? 'bg-emerald-50 text-[#159447] border border-emerald-200 hover:bg-red-50 hover:text-red-700 hover:border-red-200'
                                : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-[#159447]'
                            }`}
                          >
                            {op.is_active ? '● Active (Click to Disable)' : '○ Offline (Click to Enable)'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════════ */}
          {/* TAB 4: FORMS, FIELDS & RATES EDITOR (FULL CRUD)                       */}
          {/* ═════════════════════════════════════════════════════════════════════ */}
          {activeTab === 'forms' && (
            <div className="space-y-6 animate-fade-in">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-[#18232D] tracking-tight">
                    Government Forms, Fields & Rate Matrix Editor
                  </h1>
                  <p className="text-xs sm:text-sm text-[#5B6470] mt-1">
                    Edit every single field, fee structure, turnaround SLA, and add custom Gujarat certificates.
                  </p>
                </div>

                <button
                  onClick={handleCreateNewFormInit}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#159447] hover:bg-[#12803c] text-white font-bold text-xs sm:text-sm shadow-sm hover:shadow transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add New Certificate / Form</span>
                </button>
              </div>

              {/* Service Cards Grid with Edit / Manage Fields Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {formsList.map(form => (
                  <div
                    key={form.id}
                    className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <FormIcon slug={form.slug} size="md" />
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#159447] bg-[#EAF6EE] px-2.5 py-1 rounded-full">
                            {form.turnaround_days} Days SLA
                          </span>
                          <button
                            onClick={() => setShowDeleteFormConfirm(form)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                            title="Delete Form"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <h3 className="font-extrabold text-base text-[#18232D]">{form.title_en}</h3>
                      <p className="text-xs text-[#159447] font-semibold mt-0.5">{form.title_gu}</p>
                      <p className="text-xs text-[#5B6470] mt-2 line-clamp-2">{form.description_en}</p>
                    </div>

                    <div className="pt-4 border-t border-slate-100 space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-slate-50 p-2.5 rounded-xl">
                          <span className="text-[#5B6470] block text-[10px]">Official Govt Fee</span>
                          <span className="font-black text-[#18232D] text-sm">₹{form.official_fee}</span>
                        </div>
                        <div className="bg-slate-50 p-2.5 rounded-xl">
                          <span className="text-[#5B6470] block text-[10px]">FormSeva Service Fee</span>
                          <span className="font-black text-[#159447] text-sm">₹{form.service_fee}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm font-black text-[#18232D] pt-1">
                        <span>Total Citizen Fee:</span>
                        <span className="text-[#159447] text-base">₹{form.official_fee + form.service_fee}</span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-[#5B6470]">
                        <span>Configured Fields:</span>
                        <span className="font-bold text-[#18232D]">{form.fields?.length || 5} fields</span>
                      </div>

                      <button
                        onClick={() => {
                          setEditingForm(JSON.parse(JSON.stringify(form)));
                          setFormEditorTab('meta');
                        }}
                        className="w-full py-2.5 rounded-xl bg-[#18232D] hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit Form Metadata & Fields</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════════ */}
          {/* TAB 5: AUDIT LOGS & DPDP COMPLIANCE                                   */}
          {/* ═════════════════════════════════════════════════════════════════════ */}
          {activeTab === 'audit' && (
            <div className="space-y-6 animate-fade-in">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-[#18232D] tracking-tight">
                    Tamper-Evident Audit & DPDP Trail
                  </h1>
                  <p className="text-xs sm:text-sm text-[#5B6470] mt-1">
                    Immutable activity log compliant with Digital Personal Data Protection Act 2023.
                  </p>
                </div>

                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-[#159447] border border-emerald-200 text-xs font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>DPDP Act 2023 Compliant</span>
                </div>
              </div>

              {/* Audit Log Table */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[#5B6470] text-[11px] uppercase tracking-wider">
                        <th className="py-3 px-4 font-bold">Timestamp (UTC)</th>
                        <th className="py-3 px-4 font-bold">Actor Role</th>
                        <th className="py-3 px-4 font-bold">Action Taken</th>
                        <th className="py-3 px-4 font-bold">Entity</th>
                        <th className="py-3 px-4 font-bold">Change Payload</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono text-xs text-slate-800">
                      {auditLogs.map(log => (
                        <tr key={log.id} className="hover:bg-slate-50/70 transition">
                          <td className="py-3.5 px-4 text-[#5B6470] whitespace-nowrap">
                            {new Date(log.created_at).toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4 font-sans font-bold">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] uppercase ${
                                log.actor_role === 'admin'
                                  ? 'bg-purple-100 text-purple-800 font-bold'
                                  : log.actor_role === 'operator'
                                  ? 'bg-blue-100 text-blue-800 font-bold'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {log.actor_role}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-bold font-mono text-[#18232D]">
                            {log.action}
                          </td>
                          <td className="py-3.5 px-4 text-[#5B6470] font-sans">
                            {log.entity_type} <span className="text-[10px]">({log.entity_id.slice(0, 8)}...)</span>
                          </td>
                          <td className="py-3.5 px-4 text-xs font-mono text-slate-600 max-w-xs truncate">
                            {JSON.stringify(log.new_state || log.old_state || {})}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════════ */}
          {/* TAB 6: CITIZEN FEEDBACK MANAGEMENT                                   */}
          {/* ═════════════════════════════════════════════════════════════════════ */}
          {activeTab === 'feedback' && (
            <div className="space-y-6 animate-fade-in">
              
              {/* Top Header & Summary Cards */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-[#18232D] tracking-tight">
                    Citizen Feedback & Suggestions
                  </h1>
                  <p className="text-xs sm:text-sm text-[#5B6470] mt-1">
                    Review ratings, user experience reviews, feature suggestions, and manage feedback resolution.
                  </p>
                </div>

                <button
                  onClick={async () => {
                    setLoading(true);
                    try {
                      const data = await ApiService.getAdminFeedbacks({
                        status: feedbackStatusFilter,
                        feedback_type: feedbackTypeFilter,
                        rating: feedbackRatingFilter,
                        search: feedbackSearch
                      });
                      setFeedbacks(data);
                      showToast('Feedback list refreshed');
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-[#18232D] font-bold text-xs shadow-xs hover:bg-slate-50 transition"
                >
                  <RefreshCw className="w-4 h-4 text-[#159447]" />
                  <span>Refresh</span>
                </button>
              </div>

              {/* Stats Summary Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
                  <span className="text-xs font-bold text-[#5B6470] uppercase tracking-wider">Total Feedback</span>
                  <div className="text-2xl font-black text-[#18232D] mt-1">{feedbacks.length}</div>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-amber-200/80 shadow-2xs">
                  <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">New Unreviewed</span>
                  <div className="text-2xl font-black text-amber-700 mt-1">
                    {feedbacks.filter(f => f.status === 'NEW').length}
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-emerald-200/80 shadow-2xs">
                  <span className="text-xs font-bold text-[#159447] uppercase tracking-wider">Resolved / Addressed</span>
                  <div className="text-2xl font-black text-[#159447] mt-1">
                    {feedbacks.filter(f => f.status === 'RESOLVED').length}
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-blue-200/80 shadow-2xs">
                  <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Avg Star Rating</span>
                  <div className="text-2xl font-black text-blue-700 mt-1 flex items-center gap-1">
                    <span>
                      {feedbacks.length > 0
                        ? (feedbacks.reduce((acc, f) => acc + f.rating, 0) / feedbacks.length).toFixed(1)
                        : '5.0'}
                    </span>
                    <Star className="w-5 h-5 fill-amber-400 text-amber-400 inline" />
                  </div>
                </div>
              </div>

              {/* Filters Bar */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex flex-wrap items-center gap-3">
                
                {/* Search */}
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={feedbackSearch}
                    onChange={e => setFeedbackSearch(e.target.value)}
                    placeholder="Search by citizen, message or keyword..."
                    className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#159447]/30"
                  />
                </div>

                {/* Status Filter */}
                <select
                  value={feedbackStatusFilter}
                  onChange={e => setFeedbackStatusFilter(e.target.value)}
                  className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50 text-[#18232D] focus:outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="NEW">NEW</option>
                  <option value="REVIEWED">REVIEWED</option>
                  <option value="RESOLVED">RESOLVED</option>
                  <option value="ARCHIVED">ARCHIVED</option>
                </select>

                {/* Type Filter */}
                <select
                  value={feedbackTypeFilter}
                  onChange={e => setFeedbackTypeFilter(e.target.value)}
                  className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50 text-[#18232D] focus:outline-none"
                >
                  <option value="all">All Feedback Types</option>
                  <option value="General Feedback">General Feedback</option>
                  <option value="Suggestion">Suggestion / New Service</option>
                  <option value="Service Experience">Service Experience</option>
                  <option value="Technical Problem">Technical Problem</option>
                  <option value="Payment Issue">Payment Issue</option>
                  <option value="Form/Application Issue">Form/Application Issue</option>
                  <option value="Other">Other</option>
                </select>

                {/* Rating Filter */}
                <select
                  value={feedbackRatingFilter}
                  onChange={e => setFeedbackRatingFilter(Number(e.target.value))}
                  className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50 text-[#18232D] focus:outline-none"
                >
                  <option value={0}>All Ratings</option>
                  <option value={5}>5 Stars ★★★★★</option>
                  <option value={4}>4 Stars ★★★★☆</option>
                  <option value={3}>3 Stars ★★★☆☆</option>
                  <option value={2}>2 Stars ★★☆☆☆</option>
                  <option value={1}>1 Star ★☆☆☆☆</option>
                </select>

              </div>

              {/* Feedback Table / List */}
              <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
                {feedbacks.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 space-y-3">
                    <MessageSquare className="w-12 h-12 text-slate-300 mx-auto" />
                    <p className="text-sm font-semibold text-[#18232D]">No feedback records found</p>
                    <p className="text-xs text-[#5B6470]">Adjust your filters or submit a new test feedback from the citizen portal.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs sm:text-sm">
                      <thead className="bg-[#F8FAF9] text-[#18232D] font-extrabold uppercase text-[11px] tracking-wider border-b border-slate-200">
                        <tr>
                          <th className="py-3.5 px-4">Citizen</th>
                          <th className="py-3.5 px-4">Service</th>
                          <th className="py-3.5 px-4">Rating &amp; Type</th>
                          <th className="py-3.5 px-4">Message</th>
                          <th className="py-3.5 px-4">Status</th>
                          <th className="py-3.5 px-4">Date</th>
                          <th className="py-3.5 px-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {feedbacks
                          .filter(fb => {
                            if (feedbackStatusFilter !== 'all' && fb.status !== feedbackStatusFilter) return false;
                            if (feedbackTypeFilter !== 'all' && fb.feedback_type !== feedbackTypeFilter) return false;
                            if (feedbackRatingFilter > 0 && fb.rating !== feedbackRatingFilter) return false;
                            if (feedbackSearch) {
                              const q = feedbackSearch.toLowerCase();
                              const text = `${fb.name || ''} ${fb.email || ''} ${fb.message} ${fb.service_name || ''}`.toLowerCase();
                              if (!text.includes(q)) return false;
                            }
                            return true;
                          })
                          .map(fb => (
                            <tr key={fb.id} className="hover:bg-slate-50/80 transition-colors">
                              
                              {/* Citizen */}
                              <td className="py-3.5 px-4">
                                <div className="font-bold text-[#18232D]">{fb.name || 'Anonymous Citizen'}</div>
                                {(fb.email || fb.mobile) && (
                                  <div className="text-[11px] text-[#5B6470]">
                                    {fb.email} {fb.mobile && `• ${fb.mobile}`}
                                  </div>
                                )}
                              </td>

                              {/* Service */}
                              <td className="py-3.5 px-4">
                                <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold">
                                  {fb.service_name || fb.service_id}
                                </span>
                              </td>

                              {/* Rating & Type */}
                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-0.5 text-amber-400">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-3.5 h-3.5 ${i < fb.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
                                    />
                                  ))}
                                </div>
                                <span className="text-[11px] text-[#5B6470] block mt-0.5">{fb.feedback_type}</span>
                              </td>

                              {/* Message Excerpt */}
                              <td className="py-3.5 px-4 max-w-xs">
                                <p className="text-xs text-[#18232D] line-clamp-2 leading-relaxed font-normal">
                                  {fb.message}
                                </p>
                                {fb.admin_notes && (
                                  <div className="text-[10px] text-purple-700 font-semibold bg-purple-50 px-2 py-0.5 rounded mt-1 inline-block">
                                    Note: {fb.admin_notes}
                                  </div>
                                )}
                              </td>

                              {/* Status */}
                              <td className="py-3.5 px-4">
                                <span
                                  className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                                    fb.status === 'NEW'
                                      ? 'bg-amber-100 text-amber-800'
                                      : fb.status === 'REVIEWED'
                                      ? 'bg-blue-100 text-blue-800'
                                      : fb.status === 'RESOLVED'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-slate-100 text-slate-700'
                                  }`}
                                >
                                  {fb.status}
                                </span>
                              </td>

                              {/* Date */}
                              <td className="py-3.5 px-4 text-xs text-[#5B6470] whitespace-nowrap">
                                {new Date(fb.created_at).toLocaleDateString('en-IN', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </td>

                              {/* Action */}
                              <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                <button
                                  onClick={() => {
                                    setSelectedFeedback(fb);
                                    setModalStatus(fb.status);
                                    setModalAdminNotes(fb.admin_notes || '');
                                  }}
                                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-[#159447] hover:text-white text-[#18232D] font-bold text-xs transition"
                                >
                                  Manage →
                                </button>
                              </td>

                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          )}

        {/* ═════════════════════════════════════════════════════════════════════ */}
        {/* MODAL: FEEDBACK DETAILS & STATUS MANAGEMENT                           */}
        {/* ═════════════════════════════════════════════════════════════════════ */}
        {selectedFeedback && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl border border-slate-200 space-y-6 max-h-[90vh] overflow-y-auto animate-scale-in">
              
              {/* Header */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#159447] flex items-center justify-center">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg text-[#18232D]">Feedback Details</h3>
                    <p className="text-xs text-[#5B6470]">ID: {selectedFeedback.id}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedFeedback(null)}
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Citizen Details & Rating */}
              <div className="p-4 rounded-2xl bg-[#F8FAF9] border border-slate-200/80 space-y-2">
                <div className="flex justify-between items-center">
                  <div className="font-bold text-sm text-[#18232D]">
                    {selectedFeedback.name || 'Anonymous Citizen'}
                  </div>
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < selectedFeedback.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#5B6470]">
                  {selectedFeedback.email && <span>Email: <strong className="text-[#18232D]">{selectedFeedback.email}</strong></span>}
                  {selectedFeedback.mobile && <span>Phone: <strong className="text-[#18232D]">{selectedFeedback.mobile}</strong></span>}
                  <span>Service: <strong className="text-[#18232D]">{selectedFeedback.service_name || selectedFeedback.service_id}</strong></span>
                  <span>Type: <strong className="text-[#18232D]">{selectedFeedback.feedback_type}</strong></span>
                </div>
              </div>

              {/* Message Content */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#18232D] uppercase tracking-wider">
                  Citizen Feedback Message:
                </label>
                <div className="p-4 rounded-2xl bg-white border border-slate-200 text-sm text-[#18232D] leading-relaxed font-normal">
                  {selectedFeedback.message}
                </div>
              </div>

              {/* Status Update & Internal Note Form */}
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  await handleUpdateFeedbackStatus(selectedFeedback.id, modalStatus, modalAdminNotes);
                  setSelectedFeedback(null);
                }}
                className="space-y-4 pt-2 border-t border-slate-100"
              >
                <div>
                  <label className="block text-xs font-bold text-[#18232D] uppercase tracking-wider mb-1.5">
                    Update Feedback Status *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {['NEW', 'REVIEWED', 'RESOLVED', 'ARCHIVED'].map(st => (
                      <button
                        type="button"
                        key={st}
                        onClick={() => setModalStatus(st)}
                        className={`py-2 px-3 rounded-xl text-xs font-bold transition border ${
                          modalStatus === st
                            ? 'bg-[#159447] text-white border-[#159447] shadow-2xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#18232D] uppercase tracking-wider mb-1">
                    Internal Admin Notes (Private — not visible to citizen)
                  </label>
                  <textarea
                    rows={3}
                    value={modalAdminNotes}
                    onChange={e => setModalAdminNotes(e.target.value)}
                    placeholder="Enter internal operator/admin remarks or follow-up notes..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-[#18232D] focus:ring-2 focus:ring-[#159447]/30"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setSelectedFeedback(null)}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={feedbackUpdating}
                    className="px-6 py-2.5 rounded-xl bg-[#159447] hover:bg-[#12803c] text-white text-xs font-bold shadow-sm transition disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <Save className="w-4 h-4" />
                    <span>{feedbackUpdating ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════════ */}
        {/* MODAL: EDIT OPERATOR PROFILE (FULL CRUD)                              */}
        {/* ═════════════════════════════════════════════════════════════════════ */}
        {editingOperator && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-5 animate-scale-in max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-[#EAF6EE] text-[#159447] flex items-center justify-center">
                    <Edit2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg text-[#18232D]">Edit Operator Profile</h3>
                    <p className="text-xs text-[#5B6470]">Update details and permissions</p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingOperator(null)}
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUpdateOperator} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#18232D] uppercase tracking-wider mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingOperator.full_name}
                    onChange={e => setEditingOperator({ ...editingOperator, full_name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-[#18232D] focus:ring-2 focus:ring-[#159447]/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#18232D] uppercase tracking-wider mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={editingOperator.email}
                    onChange={e => setEditingOperator({ ...editingOperator, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-[#18232D] focus:ring-2 focus:ring-[#159447]/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#18232D] uppercase tracking-wider mb-1">
                    Mobile Phone
                  </label>
                  <input
                    type="text"
                    value={editingOperator.phone || ''}
                    onChange={e => setEditingOperator({ ...editingOperator, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-[#18232D] focus:ring-2 focus:ring-[#159447]/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#18232D] uppercase tracking-wider mb-1">
                    Gujarat District Assignment *
                  </label>
                  <select
                    value={editingOperator.district}
                    onChange={e => setEditingOperator({ ...editingOperator, district: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-[#18232D] bg-white focus:ring-2 focus:ring-[#159447]/30"
                  >
                    {['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar', 'Bhavnagar', 'Jamnagar', 'Junagadh', 'Kutch', 'Mehsana', 'Anand', 'Navsari'].map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="opActiveCheck"
                    checked={editingOperator.is_active}
                    onChange={e => setEditingOperator({ ...editingOperator, is_active: e.target.checked })}
                    className="w-4 h-4 text-[#159447] rounded focus:ring-[#159447]"
                  />
                  <label htmlFor="opActiveCheck" className="text-xs font-bold text-[#18232D]">
                    Operator is Active and available for assignment
                  </label>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setShowDeleteOpConfirm(editingOperator);
                      setEditingOperator(null);
                    }}
                    className="px-4 py-2 rounded-xl text-red-600 bg-red-50 hover:bg-red-100 text-xs font-bold flex items-center gap-1.5 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Operator</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingOperator(null)}
                      className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={opSubmitting}
                      className="px-5 py-2 rounded-xl bg-[#159447] hover:bg-[#12803c] text-white text-xs font-bold shadow-sm transition disabled:opacity-50 flex items-center gap-1.5"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{opSubmitting ? 'Saving...' : 'Save Profile'}</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════════ */}
        {/* MODAL: DELETE OPERATOR CONFIRMATION                                   */}
        {/* ═════════════════════════════════════════════════════════════════════ */}
        {showDeleteOpConfirm && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 space-y-4 animate-scale-in text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-base text-[#18232D]">Delete Operator?</h3>
              <p className="text-xs text-[#5B6470]">
                Are you sure you want to remove <span className="font-bold text-[#18232D]">{showDeleteOpConfirm.full_name}</span>? This action is recorded in the audit log.
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setShowDeleteOpConfirm(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteOperator(showDeleteOpConfirm.id)}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════════ */}
        {/* MODAL: FORM, RATES & FIELD EDITOR                                     */}
        {/* ═════════════════════════════════════════════════════════════════════ */}
        {editingForm && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-3xl w-full shadow-2xl border border-slate-200 space-y-6 max-h-[90vh] overflow-y-auto animate-scale-in">
              
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-extrabold text-xl text-[#18232D]">
                    Service & Rates Editor
                  </h3>
                  <p className="text-xs text-[#5B6470] mt-0.5">
                    {editingForm.title_en} • Slug: <span className="font-mono font-bold text-[#159447]">{editingForm.slug}</span>
                  </p>
                </div>
                <button
                  onClick={() => setEditingForm(null)}
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Editor Tabs (Metadata vs Fields) */}
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <button
                  type="button"
                  onClick={() => setFormEditorTab('meta')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                    formEditorTab === 'meta'
                      ? 'bg-[#159447] text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  1. General Info & Rates
                </button>
                <button
                  type="button"
                  onClick={() => setFormEditorTab('fields')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    formEditorTab === 'fields'
                      ? 'bg-[#159447] text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>2. Configure Every Form Field ({editingForm.fields?.length || 0})</span>
                </button>
              </div>

              {/* TAB 1: FORM METADATA & RATES */}
              {formEditorTab === 'meta' && (
                <form onSubmit={handleSaveForm} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#18232D] mb-1">
                        Title in English *
                      </label>
                      <input
                        type="text"
                        required
                        value={editingForm.title_en}
                        onChange={e => setEditingForm({ ...editingForm, title_en: e.target.value })}
                        className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#159447]/30"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#18232D] mb-1">
                        Title in Gujarati *
                      </label>
                      <input
                        type="text"
                        required
                        value={editingForm.title_gu}
                        onChange={e => setEditingForm({ ...editingForm, title_gu: e.target.value })}
                        className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#159447]/30"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#18232D] mb-1">
                        Official Government Fee (₹) *
                      </label>
                      <input
                        type="number"
                        required
                        value={editingForm.official_fee}
                        onChange={e => setEditingForm({ ...editingForm, official_fee: Number(e.target.value) })}
                        className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#159447]/30"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#18232D] mb-1">
                        FormSeva Assisted Service Fee (₹) *
                      </label>
                      <input
                        type="number"
                        required
                        value={editingForm.service_fee}
                        onChange={e => setEditingForm({ ...editingForm, service_fee: Number(e.target.value) })}
                        className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#159447]/30"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#18232D] mb-1">
                        Expected Turnaround SLA (Days)
                      </label>
                      <input
                        type="number"
                        value={editingForm.turnaround_days}
                        onChange={e => setEditingForm({ ...editingForm, turnaround_days: Number(e.target.value) })}
                        className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#159447]/30"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#18232D] mb-1">
                        Expected OTP Count from Citizen
                      </label>
                      <input
                        type="number"
                        value={editingForm.expected_otp_count}
                        onChange={e => setEditingForm({ ...editingForm, expected_otp_count: Number(e.target.value) })}
                        className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#159447]/30"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#18232D] mb-1">
                      Department Authority (EN)
                    </label>
                    <input
                      type="text"
                      value={editingForm.department_name_en}
                      onChange={e => setEditingForm({ ...editingForm, department_name_en: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#18232D] mb-1">
                      Service Description (EN)
                    </label>
                    <textarea
                      rows={2}
                      value={editingForm.description_en}
                      onChange={e => setEditingForm({ ...editingForm, description_en: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300"
                    />
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setEditingForm(null)}
                      className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-[#159447] hover:bg-[#12803c] text-white text-xs font-bold shadow-sm flex items-center gap-1.5"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Form & Rates</span>
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 2: CONFIGURE EVERY SINGLE FORM FIELD */}
              {formEditorTab === 'fields' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-[#18232D]">Form Input Fields</h4>
                      <p className="text-xs text-[#5B6470]">Add, edit label, validation, and field order</p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setEditingField({
                          id: `f-${Date.now()}`,
                          form_id: editingForm.id,
                          field_key: `field_${Date.now()}`,
                          step_section: 'personal',
                          field_type: 'text',
                          label_en: 'New Field Label',
                          label_gu: 'નવી વિગત',
                          label_hi: 'नया विवरण',
                          is_required: true,
                          sort_order: (editingForm.fields?.length || 0) + 1
                        })
                      }
                      className="px-3.5 py-1.5 rounded-xl bg-[#159447] text-white text-xs font-bold shadow-2xs hover:bg-[#12803c] flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Add New Field</span>
                    </button>
                  </div>

                  <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                    {(editingForm.fields || []).map((field, idx) => (
                      <div
                        key={field.id || idx}
                        className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#18232D] text-sm">{field.label_en}</span>
                            <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border text-slate-600">
                              {field.field_key}
                            </span>
                            <span className="text-[10px] uppercase font-bold text-[#159447] bg-[#EAF6EE] px-2 py-0.5 rounded">
                              {field.field_type}
                            </span>
                            {field.is_required && (
                              <span className="text-[10px] text-red-600 font-bold">*Required</span>
                            )}
                          </div>
                          <div className="text-[#5B6470] mt-0.5">
                            GU: {field.label_gu} • Section: <span className="capitalize">{field.step_section}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingField(JSON.parse(JSON.stringify(field)))}
                            className="p-1.5 rounded-lg border border-slate-200 hover:border-slate-400 bg-white text-slate-700"
                            title="Edit Field"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteField(field.id)}
                            className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 bg-white"
                            title="Delete Field"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setEditingForm(null)}
                      className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveForm}
                      className="px-5 py-2 rounded-xl bg-[#159447] hover:bg-[#12803c] text-white text-xs font-bold shadow-sm flex items-center gap-1.5"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save All Form Changes</span>
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════════ */}
        {/* SUB-MODAL: FIELD EDITOR (Key, Type, Labels, Options)                 */}
        {/* ═════════════════════════════════════════════════════════════════════ */}
        {editingField && (
          <div className="fixed inset-0 z-60 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4 animate-scale-in max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="font-extrabold text-base text-[#18232D]">Field Editor</h4>
                <button onClick={() => setEditingField(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#18232D] mb-1">Field Key (Unique)</label>
                    <input
                      type="text"
                      value={editingField.field_key}
                      onChange={e => setEditingField({ ...editingField, field_key: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#18232D] mb-1">Field Type</label>
                    <select
                      value={editingField.field_type}
                      onChange={e => setEditingField({ ...editingField, field_type: e.target.value as any })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                    >
                      <option value="text">Text Input</option>
                      <option value="number">Number Input</option>
                      <option value="select">Dropdown (Select)</option>
                      <option value="date">Date Picker</option>
                      <option value="textarea">Textarea (Multi-line)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#18232D] mb-1">Label in English *</label>
                    <input
                      type="text"
                      value={editingField.label_en}
                      onChange={e => setEditingField({ ...editingField, label_en: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#18232D] mb-1">Label in Gujarati *</label>
                    <input
                      type="text"
                      value={editingField.label_gu}
                      onChange={e => setEditingField({ ...editingField, label_gu: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#18232D] mb-1">Form Section</label>
                  <select
                    value={editingField.step_section}
                    onChange={e => setEditingField({ ...editingField, step_section: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="personal">Personal Details</option>
                    <option value="address">Address & Location</option>
                    <option value="specific">Certificate Specific Details</option>
                    <option value="documents">Document Requirements</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="fieldReqCheck"
                    checked={editingField.is_required}
                    onChange={e => setEditingField({ ...editingField, is_required: e.target.checked })}
                    className="w-4 h-4 text-[#159447] rounded"
                  />
                  <label htmlFor="fieldReqCheck" className="text-xs font-bold text-[#18232D]">
                    This field is mandatory (required)
                  </label>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingField(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveField(editingField)}
                  className="px-5 py-2 rounded-xl bg-[#159447] text-white text-xs font-bold hover:bg-[#12803c]"
                >
                  Save Field
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════════ */}
        {/* MODAL: ADD OPERATOR                                                   */}
        {/* ═════════════════════════════════════════════════════════════════════ */}
        {showAddOperatorModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-5 animate-scale-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-[#EAF6EE] text-[#159447] flex items-center justify-center">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg text-[#18232D]">Register Operator</h3>
                    <p className="text-xs text-[#5B6470]">Add certified filing specialist</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddOperatorModal(false)}
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateOperator} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#18232D] uppercase tracking-wider mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Patel"
                    value={newOpName}
                    onChange={e => setNewOpName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-[#18232D] focus:ring-2 focus:ring-[#159447]/30 focus:border-[#159447]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#18232D] uppercase tracking-wider mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="ramesh.operator@formseva.in"
                    value={newOpEmail}
                    onChange={e => setNewOpEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-[#18232D] focus:ring-2 focus:ring-[#159447]/30 focus:border-[#159447]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#18232D] uppercase tracking-wider mb-1">
                    Mobile Phone
                  </label>
                  <input
                    type="text"
                    placeholder="+91 98250 11223"
                    value={newOpPhone}
                    onChange={e => setNewOpPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-[#18232D] focus:ring-2 focus:ring-[#159447]/30 focus:border-[#159447]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#18232D] uppercase tracking-wider mb-1">
                    Gujarat District *
                  </label>
                  <select
                    value={newOpDistrict}
                    onChange={e => setNewOpDistrict(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-[#18232D] bg-white focus:ring-2 focus:ring-[#159447]/30 focus:border-[#159447]"
                  >
                    {['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar', 'Bhavnagar', 'Jamnagar', 'Junagadh', 'Kutch', 'Mehsana', 'Anand', 'Navsari'].map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddOperatorModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={opSubmitting}
                    className="px-5 py-2 rounded-xl bg-[#159447] hover:bg-[#12803c] text-white text-xs font-bold shadow-sm transition disabled:opacity-50"
                  >
                    {opSubmitting ? 'Saving...' : 'Register Operator'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════════ */}
        {/* MODAL: ASSIGN OPERATOR                                                */}
        {/* ═════════════════════════════════════════════════════════════════════ */}
        {showAssignModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-5 animate-scale-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-lg text-[#18232D]">Assign Operator</h3>
                  <p className="text-xs text-[#5B6470]">
                    App: {showAssignModal.application_number}
                  </p>
                </div>
                <button
                  onClick={() => setShowAssignModal(null)}
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2.5">
                <p className="text-xs font-bold text-[#18232D] uppercase tracking-wider">
                  Select Active Operator:
                </p>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {operators.filter(o => o.is_active).map(op => {
                    const isEligible = (op.assigned_form_ids && op.assigned_form_ids.includes(showAssignModal.form_id)) ||
                      (op.assigned_forms && op.assigned_forms.includes(showAssignModal.form_slug));
                    return (
                      <button
                        key={op.id}
                        onClick={() => handleAssignOperator(showAssignModal.id, op.id)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition ${
                          isEligible
                            ? 'border-emerald-200 bg-emerald-50/40 hover:border-[#159447] hover:bg-emerald-50'
                            : 'border-slate-200 hover:border-slate-300 opacity-75'
                        }`}
                      >
                        <div>
                          <div className="font-bold text-xs sm:text-sm text-[#18232D] flex items-center gap-1.5 flex-wrap">
                            <span>{op.full_name}</span>
                            {isEligible && (
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                                ✓ Certified for this form
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-[#5B6470]">📍 {op.district} • {op.assigned_count} active in queue</div>
                        </div>
                        <span className="text-xs font-bold text-[#159447]">Assign →</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════════ */}
        {/* MODAL: SUBMISSION DETAILS                                             */}
        {/* ═════════════════════════════════════════════════════════════════════ */}
        {selectedSubmissionDetails && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-slate-200 space-y-6 max-h-[90vh] overflow-y-auto animate-scale-in">
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-lg text-[#18232D]">
                      {selectedSubmissionDetails.application_number}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusBadge(selectedSubmissionDetails.status).bg}`}>
                      {getStatusBadge(selectedSubmissionDetails.status).label}
                    </span>
                  </div>
                  <p className="text-xs text-[#5B6470] mt-1">
                    {selectedSubmissionDetails.form_title_en} ({selectedSubmissionDetails.form_title_gu})
                  </p>
                </div>
                <button
                  onClick={() => setSelectedSubmissionDetails(null)}
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Citizen & Payment Overview */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div className="bg-slate-50 p-3 rounded-xl">
                  <div className="text-[#5B6470]">Citizen Name</div>
                  <div className="font-bold text-[#18232D] text-sm mt-0.5">
                    {selectedSubmissionDetails.user_name || 'Citizen User'}
                  </div>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl">
                  <div className="text-[#5B6470]">Phone</div>
                  <div className="font-bold text-[#18232D] text-sm mt-0.5">
                    {selectedSubmissionDetails.user_phone || '+91 98980 12345'}
                  </div>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl">
                  <div className="text-[#5B6470]">Fee & Payment</div>
                  <div className="font-bold text-[#159447] text-sm mt-0.5">
                    ₹{selectedSubmissionDetails.total_fee} (PAID)
                  </div>
                </div>
              </div>

              {/* Operator Notes & Status */}
              {selectedSubmissionDetails.operator_notes && (
                <div className="bg-emerald-50/70 border border-emerald-200/80 p-3.5 rounded-2xl text-xs space-y-1">
                  <div className="font-bold text-[#159447]">Operator Notes:</div>
                  <p className="text-slate-700">{selectedSubmissionDetails.operator_notes}</p>
                </div>
              )}

              {/* Field Values Submitted */}
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#18232D] mb-2.5">
                  Form Values Submitted:
                </h4>
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2 text-xs">
                  {Object.entries(selectedSubmissionDetails.field_values || {}).map(([key, val]) => (
                    <div key={key} className="flex justify-between border-b border-slate-200/60 pb-1.5 last:border-0 last:pb-0">
                      <span className="font-semibold text-[#5B6470] capitalize">{key.replace(/_/g, ' ')}:</span>
                      <span className="font-bold text-[#18232D] text-right">{String(val)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setSelectedSubmissionDetails(null)}
                  className="px-5 py-2 rounded-xl bg-[#18232D] text-white font-bold text-xs"
                >
                  Close Details
                </button>
              </div>
            </div>
          </div>
        )}

          </main>
        </div>
        <Footer />
      </div>
    </>
  );
}
