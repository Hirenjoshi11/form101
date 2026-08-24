import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { DynamicFormStep } from '@/components/DynamicFormStep';
import { DocumentUploader } from '@/components/DocumentUploader';
import { OtpModal } from '@/components/OtpModal';
import { useLanguage } from '@/i18n/LanguageContext';
import { ApiService } from '@/lib/api';
import { CertificateForm, OtpRequest } from '@/lib/types';
import {
  ShieldCheck, Clock, IndianRupee, FileText,
  CheckCircle2, ChevronRight, Loader2, AlertTriangle,
  XCircle, CheckCircle, Lightbulb, Sparkles, HelpCircle
} from 'lucide-react';

const STEPS = ['personal', 'address', 'specific', 'documents', 'review'] as const;
type Step = typeof STEPS[number];

export default function FormDetailPage() {
  const router = useRouter();
  const { slug } = router.query as { slug: string };
  const { t, language } = useLanguage();

  const [form, setForm] = useState<CertificateForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [step, setStep] = useState<Step>('personal');
  const [fieldValues, setFieldValues] = useState<Record<string, any>>({});
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, File>>({});

  const [submitting, setSubmitting] = useState(false);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [otpRequest, setOtpRequest] = useState<OtpRequest | null>(null);
  const [otpOpen, setOtpOpen] = useState(false);
  const [done, setDone] = useState(false);

  const loadForm = () => {
    if (!slug) return;
    ApiService.getFormDetail(slug)
      .then(setForm)
      .catch(() => setError('Form not found'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadForm();

    const handleUpdate = () => {
      loadForm();
    };

    window.addEventListener('formseva_data_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('formseva_data_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [slug]);

  const getTitle = (f: CertificateForm) =>
    language === 'gu' ? f.title_gu : language === 'hi' ? f.title_hi : f.title_en;

  const stepLabel: Record<Step, string> = {
    personal: t.stepPersonal,
    address: t.stepAddress,
    specific: t.stepSpecific,
    documents: t.stepDocuments,
    review: t.stepReview,
  };

  const currentStepIdx = STEPS.indexOf(step);

  const handleNext = () => {
    const nextIdx = currentStepIdx + 1;
    if (nextIdx < STEPS.length) setStep(STEPS[nextIdx]);
  };
  const handlePrev = () => {
    const prevIdx = currentStepIdx - 1;
    if (prevIdx >= 0) setStep(STEPS[prevIdx]);
  };

  const handleSubmit = async () => {
    if (!form) return;
    setSubmitting(true);
    try {
      const user = ApiService.getCurrentUser();
      if (!user) {
        await ApiService.login('citizen@formseva.in', 'citizen', 'Gujarat Citizen', '9999999999');
      }
      const result = await ApiService.createSubmission(form.slug, fieldValues);
      setSubmissionId(result.id);
      setDone(true);
    } catch (e) {
      alert('Submission failed, please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitOtp = async (code: string) => {
    if (!otpRequest) return;
    await ApiService.submitOtp(otpRequest.id, code);
    setOtpOpen(false);
  };

  if (loading) return (
    <>
      <Navbar />
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-govt-600 animate-spin" />
      </div>
    </>
  );

  if (error || !form) return (
    <>
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-center px-4">
        <AlertTriangle className="w-12 h-12 text-red-400" />
        <h1 className="text-2xl font-bold text-slate-800">Form Not Found</h1>
        <p className="text-slate-500">This certificate type may not be available yet.</p>
      </div>
    </>
  );

  return (
    <>
      <Head>
        <title>{getTitle(form)} — Form_Seva Gujarat</title>
        <meta name="description" content={`Apply for ${form.title_en} online through Form_Seva Gujarat.`} />
      </Head>
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumb + Title */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1 font-medium">
            <button onClick={() => router.push('/forms')} className="hover:text-govt-600 transition-colors">
              {language === 'gu' ? 'ઉપલબ્ધ સેવાઓ' : language === 'hi' ? 'सेवाएं' : 'Certificates'}
            </button>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-600">{getTitle(form)}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">{getTitle(form)}</h1>
          <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-500">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-500" />
              {form.turnaround_days} {language === 'gu' ? 'કાર્ય-દિવસ' : language === 'hi' ? 'कार्य-दिन' : 'working days'}
            </span>
            <span className="flex items-center gap-1.5">
              <IndianRupee className="w-4 h-4 text-govt-600" />
              {t.totalFeeLabel}: ₹{form.official_fee + form.service_fee}
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-govt-600" />
              DPDP Compliant
            </span>
          </div>
        </div>

        {done ? (
          <div className="bg-govt-50 border border-govt-200 rounded-2xl p-10 text-center space-y-4 animate-slideUp">
            <div className="w-16 h-16 rounded-full bg-govt-100 text-govt-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-extrabold text-govt-900">
              {language === 'gu' ? 'અરજી સફળતાપૂર્વક જમા થઈ!' : language === 'hi' ? 'आवेदन सफलतापूर्वक जमा हुआ!' : 'Application Submitted!'}
            </h2>
            <p className="text-sm text-govt-700">
              {language === 'gu'
                ? 'ઓપરેટર ૧-૨ કલાકમાં ફોર્મ ભરવાનું શરૂ કરશે.'
                : language === 'hi'
                ? 'ऑपरेटर 1-2 घंटे में फाइलिंग शुरू करेंगे।'
                : 'An operator will start filing within 1–2 hours.'}
            </p>
            {submissionId && (
              <p className="text-xs font-mono text-slate-500">Ref: {submissionId}</p>
            )}
            <button
              onClick={() => router.push('/track')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-govt-700 text-white font-bold hover:bg-govt-800 transition mt-2"
            >
              {t.trackApplication} <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            {/* ─── FACT VS MYTH BANNER (CITIZEN CLARITY) ─── */}
            {(form.fact_gu || form.fact_en) && (
              <div className="mb-8 rounded-2xl overflow-hidden border border-slate-200/80 bg-white shadow-sm">
                <div className="bg-gradient-to-r from-slate-900 via-[#18232D] to-slate-900 px-5 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                    <span className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      {language === 'gu' ? 'મહત્વપૂર્ણ માહિતી : સાચી હકીકત vs ગેરમાન્યતા' : language === 'hi' ? 'महत्वपूर्ण सूचना : सच बनाम भ्रांति' : 'Important Citizen Notice: Fact vs Myth'}
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-300 hidden sm:inline">
                    {language === 'gu' ? 'સરકારી પરિપત્ર આધારિત' : 'Official Govt Resolution'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                  {/* Common Myth */}
                  <div className="p-4 sm:p-5 bg-rose-50/40">
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                        <XCircle className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wider text-rose-600 mb-1">
                          {language === 'gu' ? 'સામાન્ય ગેરમાન્યતા (Myth)' : language === 'hi' ? 'सामान्य भ्रांति (Myth)' : 'Common Myth'}
                        </div>
                        <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                          {language === 'gu' ? form.myth_gu : form.myth_en || form.myth_gu}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Official Fact */}
                  <div className="p-4 sm:p-5 bg-emerald-50/40">
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-1">
                          {language === 'gu' ? 'અધિકૃત સાચી માહિતી (Official Fact)' : language === 'hi' ? 'आधिकारिक सच (Fact)' : 'Official Fact'}
                        </div>
                        <p className="text-xs sm:text-sm text-slate-900 font-bold leading-relaxed">
                          {language === 'gu' ? form.fact_gu : form.fact_en || form.fact_gu}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Progress Steps */}
            <div className="flex items-center gap-0 mb-8 overflow-x-auto pb-1">
              {STEPS.map((s, idx) => {
                const isCurrent = s === step;
                const isDone = idx < currentStepIdx;
                return (
                  <div key={s} className="flex items-center gap-0">
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                      isCurrent ? 'bg-govt-700 text-white shadow-md' :
                      isDone ? 'bg-govt-100 text-govt-700' :
                      'bg-slate-100 text-slate-400'
                    }`}>
                      {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : <span className="w-4 text-center">{idx + 1}</span>}
                      {stepLabel[s]}
                    </div>
                    {idx < STEPS.length - 1 && (
                      <div className={`h-px w-4 shrink-0 ${idx < currentStepIdx ? 'bg-govt-400' : 'bg-slate-200'}`} />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Step Content */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm animate-fadeIn">
              {step !== 'documents' && step !== 'review' && (
                <DynamicFormStep
                  fields={(form.fields || []).filter(f => f.step_section === step)}
                  values={fieldValues}
                  errors={{}}
                  onChange={(key, val) => setFieldValues(prev => ({ ...prev, [key]: val }))}
                />
              )}

              {step === 'documents' && (
                <DocumentUploader
                  requiredDocs={form.required_docs_json}
                  uploadedFiles={uploadedDocs}
                  onFileUpload={(key, file) => setUploadedDocs(prev => ({ ...prev, [key]: file }))}
                />
              )}

              {step === 'review' && (
                <div className="space-y-4">
                  <h2 className="text-lg font-bold text-slate-800">
                    {language === 'gu' ? 'ચકાસો અને જમા કરો' : language === 'hi' ? 'समीक्षा करें और जमा करें' : 'Review & Submit'}
                  </h2>
                  {Object.keys(fieldValues).length > 0 && (
                    <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-sm">
                      {Object.entries(fieldValues).map(([k, v]) => (
                        <div key={k} className="flex gap-2">
                          <span className="font-medium text-slate-600 capitalize w-36 shrink-0">{k.replace(/_/g, ' ')}</span>
                          <span className="text-slate-800">{String(v)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {Object.keys(uploadedDocs).length > 0 && (
                    <div className="bg-slate-50 rounded-xl p-4 text-sm">
                      <p className="font-medium text-slate-700 mb-2">{t.requiredDocumentsTitle}</p>
                      {Object.keys(uploadedDocs).map(k => (
                        <div key={k} className="flex items-center gap-2 text-govt-700">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{k} — {uploadedDocs[k].name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="bg-govt-50 border border-govt-200 rounded-xl p-4 text-sm flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-govt-600 mt-0.5 shrink-0" />
                    <span className="text-govt-800">{t.dpdpNotice}</span>
                  </div>
                  <div className="border-t border-slate-100 pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <span className="text-sm text-slate-500">{t.totalFeeLabel}</span>
                      <p className="text-2xl font-extrabold text-slate-900">₹{form.official_fee + form.service_fee}</p>
                      <p className="text-xs text-slate-400">
                        {t.officialFeeLabel}: ₹{form.official_fee} + {t.serviceFeeLabel}: ₹{form.service_fee}
                      </p>
                    </div>
                    <button
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl bg-govt-700 hover:bg-govt-800 text-white font-bold shadow-lg disabled:opacity-50 transition"
                    >
                      {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                      {t.submitAndPay}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex justify-between mt-6">
              <button
                onClick={handlePrev}
                disabled={currentStepIdx === 0}
                className="px-5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition"
              >
                {t.previousStep}
              </button>
              {step !== 'review' && (
                <button
                  onClick={handleNext}
                  className="px-5 py-2.5 rounded-xl bg-govt-700 hover:bg-govt-800 text-white text-sm font-bold shadow-sm transition"
                >
                  {t.nextStep}
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {otpRequest && (
        <OtpModal
          otpRequest={otpRequest}
          isOpen={otpOpen}
          onClose={() => setOtpOpen(false)}
          onSubmitOtp={handleSubmitOtp}
        />
      )}

      <Footer />
    </>
  );
}
