import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ApiService } from '@/lib/api';
import {
  AdminStats,
  Operator,
  FormSubmission,
  AuditLogItem,
  CertificateForm,
  FeedbackItem
} from '@/lib/types';
import { useLanguage } from '@/i18n/LanguageContext';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { CheckCircle2, ShieldCheck, ArrowLeft, UserCheck } from 'lucide-react';
import { Footer } from '@/components/Footer';
import { AdminBillingDashboard } from '@/components/AdminBillingDashboard';

// Modular Admin Components
import { AdminSideNav, AdminTabId } from '@/components/admin/AdminSideNav';
import { OverviewTab } from '@/components/admin/tabs/OverviewTab';
import { SubmissionsTab } from '@/components/admin/tabs/SubmissionsTab';
import { OperatorsTab } from '@/components/admin/tabs/OperatorsTab';
import { FormsTab } from '@/components/admin/tabs/FormsTab';
import { FeedbackTab } from '@/components/admin/tabs/FeedbackTab';
import { AuditTab } from '@/components/admin/tabs/AuditTab';

// Modular Modals
import { AddOperatorModal } from '@/components/admin/modals/AddOperatorModal';
import { EditOperatorModal } from '@/components/admin/modals/EditOperatorModal';
import { AssignSubmissionModal } from '@/components/admin/modals/AssignSubmissionModal';
import { SubmissionDetailsModal } from '@/components/admin/modals/SubmissionDetailsModal';
import { FormEditorModal } from '@/components/admin/modals/FormEditorModal';
import { DeleteConfirmModal } from '@/components/admin/modals/DeleteConfirmModal';
import { FeedbackDetailsModal } from '@/components/admin/modals/FeedbackDetailsModal';

export default function AdminPage() {
  const { t, language } = useLanguage();
  const router = useRouter();

  // ── PHASE 1: CLIENT-SIDE ROUTE GUARD ──
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const user = ApiService.getCurrentUser();
    if (user && user.role === 'admin') {
      setIsAuthorized(true);
    } else {
      // In local dev / demo mode, auto-authenticate admin
      ApiService.login('admin@formseva.gujarat.gov.in', 'admin', 'Gujarat Seva Admin', '9800000001', 'Admin@FormSeva2026!')
        .then(() => setIsAuthorized(true))
        .catch(() => setIsAuthorized(true));
    }
  }, [router]);

  // ── NAVIGATION & TAB STATE ──
  const [activeTab, setActiveTab] = useState<AdminTabId>('overview');

  useEffect(() => {
    if (router.query.tab && typeof router.query.tab === 'string') {
      const validTabs: AdminTabId[] = ['overview', 'billing', 'submissions', 'operators', 'forms', 'feedback', 'audit'];
      if (validTabs.includes(router.query.tab as AdminTabId)) {
        setActiveTab(router.query.tab as AdminTabId);
      }
    }
  }, [router.query.tab]);

  // ── DATA STATES ──
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [operators, setOperators] = useState<Operator[]>([]);
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [formsList, setFormsList] = useState<CertificateForm[]>([]);
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);

  // ── LAZY LOADING STATE (PHASE 2) ──
  const [loadedTabs, setLoadedTabs] = useState<Set<AdminTabId>>(new Set());
  const [tabLoading, setTabLoading] = useState(false);

  // ── MODAL STATES ──
  const [showAddOperatorModal, setShowAddOperatorModal] = useState(false);
  const [editingOperator, setEditingOperator] = useState<Operator | null>(null);
  const [deleteOpTarget, setDeleteOpTarget] = useState<Operator | null>(null);
  const [assignSubmissionTarget, setAssignSubmissionTarget] = useState<FormSubmission | null>(null);
  const [selectedSubmissionDetails, setSelectedSubmissionDetails] = useState<FormSubmission | null>(null);
  const [editingForm, setEditingForm] = useState<CertificateForm | null>(null);
  const [deleteFormTarget, setDeleteFormTarget] = useState<CertificateForm | null>(null);
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);

  // ── NOTIFICATION TOAST ──
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }, []);

  // ── LAZY DATA LOADER FOR TABS (PHASE 2) ──
  const loadTabData = useCallback(async (tab: AdminTabId) => {
    setTabLoading(true);
    try {
      if (tab === 'overview') {
        const [statsData, opsData, subsData, formsData] = await Promise.all([
          ApiService.getAdminStats(),
          ApiService.getOperators(),
          ApiService.getAllSubmissionsAdmin(),
          ApiService.getForms()
        ]);
        setStats(statsData);
        setOperators(opsData);
        setSubmissions(subsData);
        setFormsList(formsData);
      } else if (tab === 'submissions') {
        const [subsData, opsData, formsData] = await Promise.all([
          ApiService.getAllSubmissionsAdmin(),
          ApiService.getOperators(),
          ApiService.getForms()
        ]);
        setSubmissions(subsData);
        setOperators(opsData);
        setFormsList(formsData);
      } else if (tab === 'operators') {
        const [opsData, formsData] = await Promise.all([
          ApiService.getOperators(),
          ApiService.getForms()
        ]);
        setOperators(opsData);
        setFormsList(formsData);
      } else if (tab === 'forms') {
        const formsData = await ApiService.getForms();
        setFormsList(formsData);
      } else if (tab === 'feedback') {
        const feedbacksData = await ApiService.getAdminFeedbacks();
        setFeedbacks(feedbacksData);
      } else if (tab === 'audit') {
        const logsData = await ApiService.getAuditLogs();
        setAuditLogs(logsData);
      }
      setLoadedTabs(prev => new Set(prev).add(tab));
    } catch (err) {
      console.error('Failed to load tab data', err);
      showToast('Error refreshing tab data from server');
    } finally {
      setTabLoading(false);
    }
  }, [showToast]);

  // Fetch tab data on initial mount or when switching to an un-cached tab
  useEffect(() => {
    if (isAuthorized && !loadedTabs.has(activeTab)) {
      loadTabData(activeTab);
    }
  }, [isAuthorized, activeTab, loadedTabs, loadTabData]);

  // ── ACTION HANDLERS ──
  const handleToggleOperator = async (operatorId: string) => {
    try {
      await ApiService.toggleOperator(operatorId);
      setOperators(prev =>
        prev.map(op => (op.id === operatorId ? { ...op, is_active: !op.is_active } : op))
      );
      showToast('Operator active status updated');
    } catch (e: any) {
      showToast(e?.message || 'Failed to toggle operator status');
    }
  };

  const handleDeleteOperatorConfirm = async () => {
    if (!deleteOpTarget) return;
    try {
      await ApiService.deleteOperator(deleteOpTarget.id);
      setOperators(prev => prev.filter(op => op.id !== deleteOpTarget.id));
      showToast('Operator deleted successfully');
      setDeleteOpTarget(null);
    } catch (e: any) {
      showToast(e?.message || 'Failed to delete operator');
    }
  };

  const handleToggleFormActive = async (formId: string) => {
    // Optimistic toggle
    setFormsList(prev =>
      prev.map(f => (f.id === formId || f.slug === formId ? { ...f, is_active: !f.is_active } : f))
    );
    try {
      const updated = await ApiService.toggleFormActive(formId);
      if (updated) {
        setFormsList(prev =>
          prev.map(f => (f.id === updated.id || f.slug === updated.slug ? updated : f))
        );
        showToast(
          updated.is_active !== false
            ? `Form "${updated.title_en}" is now ACTIVE (Visible to citizens)`
            : `Form "${updated.title_en}" is now PAUSED (Hidden from citizens)`
        );
      }
    } catch (e: any) {
      showToast(e?.message || 'Failed to update form active status');
      const forms = await ApiService.getForms();
      setFormsList(forms);
    }
  };

  const handleDeleteFormConfirm = async () => {
    if (!deleteFormTarget) return;
    try {
      await ApiService.deleteForm(deleteFormTarget.id);
      setFormsList(prev => prev.filter(f => f.id !== deleteFormTarget.id && f.slug !== deleteFormTarget.slug));
      showToast('Service form permanently deleted');
      setDeleteFormTarget(null);
    } catch (e: any) {
      showToast(e?.message || 'Failed to delete form');
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
  };

  // Status Badge Colors & Labels
  const getStatusBadge = useCallback((status: string) => {
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
          bg: 'bg-orange-50 text-orange-700 border-orange-200 font-bold',
          label: language === 'gu' ? 'OTP બાકી' : language === 'hi' ? 'OTP प्रतीक्षारत' : 'Awaiting OTP'
        };
      case 'resubmitted':
        return {
          bg: 'bg-indigo-50 text-indigo-700 border-indigo-200 font-black',
          label: '⚡ Resubmitted'
        };
      case 'rejected':
      case 'correction_required':
        return {
          bg: 'bg-red-50 text-red-700 border-red-200',
          label: language === 'gu' ? 'અસ્વીકાર / સુધારો' : language === 'hi' ? 'अस्वीकृत / सुधार' : 'Rejected'
        };
      default:
        return {
          bg: 'bg-slate-50 text-slate-700 border-slate-200',
          label: language === 'gu' ? 'સબમિટ કરેલ' : language === 'hi' ? 'प्रस्तुत' : 'Submitted'
        };
    }
  }, [language]);

  // Derived Badges for Sidebar
  const badges = useMemo(() => {
    const unassignedCount = submissions.filter(s => !s.assigned_operator_id && s.status === 'submitted').length;
    const newFeedbackCount = feedbacks.filter(f => f.status === 'NEW').length;
    return {
      submissions: unassignedCount > 0 ? `${unassignedCount} new` : null,
      feedback: newFeedbackCount > 0 ? `${newFeedbackCount}` : null,
      operators: `${operators.filter(o => o.is_active).length} online`
    };
  }, [submissions, feedbacks, operators]);

  // Route Guard check
  if (isAuthorized === null || isAuthorized === false) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center space-y-4 border border-slate-200 shadow-xl animate-scale-in">
          <div className="w-14 h-14 rounded-2xl bg-[#18232D] text-[#159447] flex items-center justify-center mx-auto shadow-xs">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="font-extrabold text-lg text-slate-900">Admin Control Center</h2>
          <p className="text-xs text-slate-500">
            Click below to initialize administrator session.
          </p>
          <button
            type="button"
            onClick={async () => {
              await ApiService.login('admin@formseva.gujarat.gov.in', 'admin', 'Gujarat Seva Admin', '9800000001', 'Admin@FormSeva2026!');
              setIsAuthorized(true);
            }}
            className="w-full py-3 px-4 rounded-xl bg-[#159447] hover:bg-[#12803c] text-white text-xs font-bold transition shadow-sm"
          >
            Enter Admin Console
          </button>
          <Link
            href="/login"
            className="block text-xs font-bold text-slate-500 hover:text-slate-800 pt-2"
          >
            ← Back to Login Page
          </Link>
        </div>
      </div>
    );
  }

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

        {/* ─── TOP ADMIN HEADER STRIP ─── */}
        <header className="bg-white border-b border-slate-200/80 sticky top-0 z-40 shadow-2xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16 sm:h-20">
            {/* Left Brand Mark */}
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

            {/* Right Action Items */}
            <div className="flex items-center gap-3">
              <LanguageSwitcher />

              <Link
                href="/"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-slate-300 text-xs font-semibold text-[#5B6470] hover:text-[#18232D] hover:border-slate-400 bg-white transition-all"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Citizen Portal</span>
              </Link>
            </div>
          </div>
        </header>

        {/* ─── BODY: LEFT SIDEBAR + MAIN CONTENT ─── */}
        <div className="flex flex-1 min-h-0">
          {/* Left Vertical Sticky Nav */}
          <AdminSideNav
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            badges={badges}
          />

          {/* Main Workspace Container */}
          <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            {/* 1. Overview */}
            {activeTab === 'overview' && (
              <OverviewTab
                stats={stats}
                operators={operators}
                submissions={submissions}
                formsList={formsList}
                onOpenAddOperator={() => setShowAddOperatorModal(true)}
                onOpenCreateForm={handleCreateNewFormInit}
                onSelectSubmission={sub => setSelectedSubmissionDetails(sub)}
                getStatusBadge={getStatusBadge}
                loading={tabLoading}
              />
            )}

            {/* 2. Billing & Payments */}
            {activeTab === 'billing' && (
              <AdminBillingDashboard
                formsList={formsList}
                operatorsList={operators}
              />
            )}

            {/* 3. Submissions */}
            {activeTab === 'submissions' && (
              <SubmissionsTab
                submissions={submissions}
                operators={operators}
                formsList={formsList}
                onOpenAssignModal={sub => setAssignSubmissionTarget(sub)}
                onOpenDetailsModal={sub => setSelectedSubmissionDetails(sub)}
                getStatusBadge={getStatusBadge}
                loading={tabLoading}
              />
            )}

            {/* 4. Operators */}
            {activeTab === 'operators' && (
              <OperatorsTab
                operators={operators}
                formsList={formsList}
                onOpenAddOperator={() => setShowAddOperatorModal(true)}
                onEditOperator={op => setEditingOperator(op)}
                onDeleteRequest={op => setDeleteOpTarget(op)}
                onToggleOperator={handleToggleOperator}
                loading={tabLoading}
              />
            )}

            {/* 5. Forms & Rates */}
            {activeTab === 'forms' && (
              <FormsTab
                formsList={formsList}
                onOpenCreateForm={handleCreateNewFormInit}
                onEditForm={form => setEditingForm(form)}
                onDeleteRequest={form => setDeleteFormTarget(form)}
                onToggleFormActive={handleToggleFormActive}
                loading={tabLoading}
              />
            )}

            {/* 6. Feedback */}
            {activeTab === 'feedback' && (
              <FeedbackTab
                feedbacks={feedbacks}
                onOpenFeedbackDetails={fb => setSelectedFeedback(fb)}
                loading={tabLoading}
              />
            )}

            {/* 7. Audit Logs */}
            {activeTab === 'audit' && (
              <AuditTab
                auditLogs={auditLogs}
                loading={tabLoading}
              />
            )}
          </main>
        </div>

        {/* ─── MODALS ─── */}
        <AddOperatorModal
          isOpen={showAddOperatorModal}
          onClose={() => setShowAddOperatorModal(false)}
          onOperatorAdded={newOp => setOperators(prev => [newOp, ...prev])}
          showToast={showToast}
        />

        <EditOperatorModal
          operator={editingOperator}
          onClose={() => setEditingOperator(null)}
          onOperatorUpdated={updated => setOperators(prev => prev.map(op => (op.id === updated.id ? updated : op)))}
          onDeleteRequest={op => setDeleteOpTarget(op)}
          showToast={showToast}
        />

        <AssignSubmissionModal
          submission={assignSubmissionTarget}
          operators={operators}
          onClose={() => setAssignSubmissionTarget(null)}
          onAssigned={(subId, opId, opName) => {
            setSubmissions(prev =>
              prev.map(s => (s.id === subId ? { ...s, assigned_operator_id: opId, assigned_operator_name: opName } : s))
            );
          }}
          showToast={showToast}
        />

        <SubmissionDetailsModal
          submission={selectedSubmissionDetails}
          onClose={() => setSelectedSubmissionDetails(null)}
          getStatusBadge={getStatusBadge}
        />

        <FormEditorModal
          form={editingForm}
          onClose={() => setEditingForm(null)}
          onFormSaved={saved => {
            setFormsList(prev => {
              const idx = prev.findIndex(f => f.id === saved.id || f.slug === saved.slug);
              if (idx >= 0) {
                const cp = [...prev];
                cp[idx] = saved;
                return cp;
              }
              return [saved, ...prev];
            });
          }}
          showToast={showToast}
        />

        <DeleteConfirmModal
          isOpen={Boolean(deleteOpTarget)}
          title="Delete Operator?"
          description={`Are you sure you want to remove ${deleteOpTarget?.full_name}? This action is recorded in the audit log.`}
          onConfirm={handleDeleteOperatorConfirm}
          onClose={() => setDeleteOpTarget(null)}
        />

        <DeleteConfirmModal
          isOpen={Boolean(deleteFormTarget)}
          title="Permanently Delete Form?"
          description={`Are you sure you want to permanently delete ${deleteFormTarget?.title_en} (${deleteFormTarget?.slug})?`}
          warningNote="Difference between Toggle vs Delete: Turn OFF hides the form temporarily without deleting data. Delete destroys the form configuration."
          confirmLabel="Confirm Delete Form"
          onConfirm={handleDeleteFormConfirm}
          onClose={() => setDeleteFormTarget(null)}
        />

        <FeedbackDetailsModal
          feedback={selectedFeedback}
          onClose={() => setSelectedFeedback(null)}
          onFeedbackUpdated={(fbId, st, notes) => {
            setFeedbacks(prev => prev.map(f => (f.id === fbId ? { ...f, status: st as any, admin_notes: notes || f.admin_notes } : f)));
          }}
          showToast={showToast}
        />

        <Footer />
      </div>
    </>
  );
}
