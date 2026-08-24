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
  Sparkles, ArrowLeft
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

  const handlePrefillDemo = () => {
    setFieldValues({
      full_name: 'Rameshchandra B. Patel',
      father_name: 'Bhagwandas Patel',
      gender: 'Male',
      dob: '1985-06-15',
      mobile: '9825044551',
      aadhaar_number: '982145519821',
      annual_income: '120000',
      district: 'Ahmedabad',
      taluka: 'Daskroi',
      village: 'Bopal',
      pincode: '380058',
      ration_card_no: '0712398214',
      purpose: 'Education Assistance / Scheme Benefit',
      category: 'SEBC / OBC',
      sub_caste: 'Patel / Prajapati',
      religion: 'Hindu',
      survey_number: '142/1',
      khata_number: '89',
      vehicle_class: 'LMV (Light Motor Vehicle)',
    });
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
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#159447] animate-spin" />
      </div>
    </div>
  );

  if (error || !form) return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-4">
        <AlertTriangle className="w-12 h-12 text-amber-500" />
        <h1 className="text-xl font-bold text-slate-800">Form Not Found</h1>
        <button
          onClick={() => router.push('/forms')}
          className="px-4 py-2 bg-[#159447] text-white text-xs font-bold rounded-xl"
        >
          Return to Services
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Head>
        <title>{getTitle(form)} — FormSeva Gujarat</title>
        <meta name="description" content={`Apply for ${form.title_en} online through FormSeva Gujarat.`} />
      </Head>
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        
        {/* Header Strip */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1">
              <button onClick={() => router.push('/forms')} className="hover:text-[#159447] transition">
                {language === 'gu' ? 'સેવાઓ' : language === 'hi' ? 'सेवाएं' : 'Services'}
              </button>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-slate-700">{getTitle(form)}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">{getTitle(form)}</h1>
            <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                {form.turnaround_days} {language === 'gu' ? 'દિવસ' : 'days'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <IndianRupee className="w-3.5 h-3.5 text-[#159447]" />
                Fee: ₹{form.official_fee + form.service_fee}
              </span>
            </div>
          </div>

          {!done && (
            <button
              onClick={handlePrefillDemo}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-bold transition shadow-2xs self-start sm:self-auto"
              title="Auto-fill with sample citizen data for instant testing"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>{language === 'gu' ? 'ડેમો ડેટા ભરો' : language === 'hi' ? 'डेमो डेटा भरें' : 'Pre-fill Demo Data'}</span>
            </button>
          )}
        </div>

        {done ? (
          <div className="bg-white border border-emerald-200 rounded-2xl p-8 sm:p-12 text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#159447] flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-slate-900">
              {language === 'gu' ? 'અરજી સફળતાપૂર્વક સબમિટ થઈ!' : language === 'hi' ? 'आवेदन सफलतापूर्वक जमा हुआ!' : 'Application Submitted Successfully!'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
              {language === 'gu'
                ? 'ઓપરેટર સરકારી પોર્ટલ પર ફોર્મ ભરવાનું શરૂ કરશે. સ્ટેટસ તપાસવા માટે ટ્રેક પેજ જુઓ.'
                : language === 'hi'
                ? 'ऑपरेटर सरकारी पोर्टल पर फाइलिंग शुरू करेंगे।'
                : 'A dedicated operator is assigned to file your application on official Gujarat portals.'}
            </p>
            {submissionId && (
              <div className="inline-block bg-slate-50 border border-slate-200 px-3 py-1 rounded-lg text-xs font-mono font-bold text-slate-700">
                Application ID: {submissionId}
              </div>
            )}
            <div className="pt-2">
              <button
                onClick={() => router.push('/track')}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#159447] hover:bg-[#12803c] text-white text-xs font-bold shadow-xs transition"
              >
                <span>{t.trackApplication}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Step Breadcrumb Indicator */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {STEPS.map((s, idx) => {
                const isCurrent = s === step;
                const isDone = idx < currentStepIdx;
                return (
                  <button
                    key={s}
                    onClick={() => {
                      if (idx <= currentStepIdx) setStep(s);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      isCurrent
                        ? 'bg-[#18232D] text-white shadow-xs'
                        : isDone
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-white border border-slate-200 text-slate-400'
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <span>{idx + 1}.</span>}
                    <span>{stepLabel[s]}</span>
                  </button>
                );
              })}
            </div>

            {/* Step Form Box */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-xs">
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
                <div className="space-y-5">
                  <h2 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3">
                    {language === 'gu' ? 'વિગતો ચકાસો અને ચૂકવણી કરો' : language === 'hi' ? 'विवरण जांचें और भुगतान करें' : 'Review Details & Payment'}
                  </h2>

                  {Object.keys(fieldValues).length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 rounded-xl p-4 text-xs">
                      {Object.entries(fieldValues).map(([k, v]) => (
                        <div key={k} className="flex flex-col">
                          <span className="font-semibold text-slate-500 capitalize">{k.replace(/_/g, ' ')}</span>
                          <span className="font-bold text-slate-900">{String(v)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No field data entered.</p>
                  )}

                  {Object.keys(uploadedDocs).length > 0 && (
                    <div className="bg-slate-50 rounded-xl p-4 text-xs space-y-1.5">
                      <span className="font-bold text-slate-700 block mb-1">Attached Documents:</span>
                      {Object.keys(uploadedDocs).map(k => (
                        <div key={k} className="flex items-center gap-1.5 text-emerald-800">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{k} ({uploadedDocs[k].name})</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Fee Breakdown & Pay Button */}
                  <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-xs text-emerald-800 font-medium block">{t.totalFeeLabel}</span>
                      <div className="text-2xl font-black text-slate-900">₹{form.official_fee + form.service_fee}</div>
                      <div className="text-[11px] text-slate-500">
                        Govt Fee: ₹{form.official_fee} + Assisted Service: ₹{form.service_fee}
                      </div>
                    </div>

                    <button
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#159447] hover:bg-[#12803c] text-white text-xs font-bold shadow-xs disabled:opacity-50 transition"
                    >
                      {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                      <span>{t.submitAndPay} (₹{form.official_fee + form.service_fee})</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Wizard Navigation Bar */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-5 mt-6">
                <button
                  onClick={handlePrev}
                  disabled={currentStepIdx === 0}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-30 transition"
                >
                  {t.previousStep}
                </button>

                {step !== 'review' && (
                  <button
                    onClick={handleNext}
                    className="inline-flex items-center gap-1 px-5 py-2 rounded-xl bg-[#159447] hover:bg-[#12803c] text-white text-xs font-bold shadow-xs transition"
                  >
                    <span>{t.nextStep}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </main>

      {otpRequest && (
        <OtpModal
          otpRequest={otpRequest}
          isOpen={otpOpen}
          onClose={() => setOtpOpen(false)}
          onSubmitOtp={handleSubmitOtp}
        />
      )}

      <Footer />
    </div>
  );
}
