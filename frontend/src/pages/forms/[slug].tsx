import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { DynamicFormStep } from '@/components/DynamicFormStep';
import { DocumentUploader } from '@/components/DocumentUploader';
import { OtpModal } from '@/components/OtpModal';
import { useLanguage, Language } from '@/i18n/LanguageContext';
import { ApiService, mockForms } from '@/lib/api';
import { CertificateForm, FormSubmission, OtpRequest, ServiceStep, ServiceDocument, FormField } from '@/lib/types';
import {
  ShieldCheck, Clock, IndianRupee, FileText,
  CheckCircle2, ChevronRight, Loader2, AlertTriangle,
  Sparkles, ArrowLeft, RefreshCw, AlertCircle, Phone,
  Edit3, Check, HelpCircle, Building
} from 'lucide-react';

export default function FormDetailPage() {
  const router = useRouter();
  const { slug, resubmit } = router.query as { slug: string; resubmit?: string };
  const { t, language } = useLanguage();

  const [form, setForm] = useState<CertificateForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [activeStepKey, setActiveStepKey] = useState<string>('applicant');
  const [fieldValues, setFieldValues] = useState<Record<string, any>>({});
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, File>>({});

  const [resubmissionTarget, setResubmissionTarget] = useState<FormSubmission | null>(null);
  const [resubmissionNote, setResubmissionNote] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [otpRequest, setOtpRequest] = useState<OtpRequest | null>(null);
  const [otpOpen, setOtpOpen] = useState(false);
  const [done, setDone] = useState(false);

  // Pre-fill citizen phone if available in session
  useEffect(() => {
    const user = ApiService.getCurrentUser();
    if (user?.phone && !fieldValues.mobile_number) {
      setFieldValues(prev => ({
        ...prev,
        mobile_number: user.phone.replace(/[^0-9]/g, '').slice(-10),
      }));
    }
  }, []);

  const loadForm = async () => {
    if (!slug) return;
    try {
      const f = await ApiService.getFormDetail(slug);
      setForm(f);
      
      // Default to first step
      if (f.steps && f.steps.length > 0) {
        setActiveStepKey(f.steps[0].step_key);
      } else {
        setActiveStepKey('applicant');
      }

      // If resubmission mode is active, fetch previous submission data
      if (resubmit) {
        try {
          const prevSub = await ApiService.getSubmissionDetail(resubmit);
          if (prevSub) {
            setResubmissionTarget(prevSub);
            if (prevSub.field_values) {
              setFieldValues(prevSub.field_values);
            }
          }
        } catch (e) {
          console.warn('Could not load resubmission target:', e);
        }
      }
    } catch (err) {
      setError('Form not found');
    } finally {
      setLoading(false);
    }
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
  }, [slug, resubmit]);

  // Derive configured steps
  const stepsList: { key: string; label: string; desc?: string }[] = useMemo(() => {
    if (form?.steps && form.steps.length > 0) {
      return form.steps.map(s => ({
        key: s.step_key,
        label: language === 'gu' ? s.title_gu : language === 'hi' ? s.title_hi : s.title_en,
        desc: language === 'gu' ? s.description_gu : language === 'hi' ? s.description_hi : s.description_en
      }));
    }

    const currentSlug = form?.slug || slug;
    if (currentSlug === 'income_certificate') {
      return [
        { key: 'applicant', label: language === 'gu' ? 'અરજદારની માહિતી' : language === 'hi' ? 'આવેદક વિવરણ' : 'Applicant Info' },
        { key: 'address', label: language === 'gu' ? 'રહેઠાણનું સરનામું' : language === 'hi' ? 'આવાસીય પતા' : 'Residential Address' },
        { key: 'family_income', label: language === 'gu' ? 'કુટુંબ અને આવકના સ્ત્રોત' : language === 'hi' ? 'પરિવાર એવં આય' : 'Family & Income Sources' },
        { key: 'documents', label: language === 'gu' ? 'દસ્તાવેજ અપલોડ' : language === 'hi' ? 'દસ્તાવેજ અપલોડ' : 'Document Vault' },
        { key: 'review', label: language === 'gu' ? 'ચકાસણી અને પેમેન્ટ' : language === 'hi' ? 'સમીક્ષા એવં ભુગતાન' : 'Review & Submit' }
      ];
    }
    if (currentSlug === 'ews_certificate') {
      return [
        { key: 'applicant', label: language === 'gu' ? 'અરજદાર અને જ્ઞાતિ' : language === 'hi' ? 'આવેદક એવં જાતિ' : 'Applicant & Caste' },
        { key: 'address', label: language === 'gu' ? 'સરનામું' : language === 'hi' ? 'આવાસીય પતા' : 'Address Details' },
        { key: 'family_income', label: language === 'gu' ? 'કુટુંબની કુલ વાર્ષિક આવક' : language === 'hi' ? 'પારિવારિક કુલ આય' : 'Gross Family Income' },
        { key: 'property_assets', label: language === 'gu' ? 'મિલકત અને જમીન ચકાસણી' : language === 'hi' ? 'સંપત્તિ વિવરણ' : 'Property & Asset Limits' },
        { key: 'documents', label: language === 'gu' ? 'દસ્તાવેજ અપલોડ' : language === 'hi' ? 'દસ્તાવેજ અપલોડ' : 'Required Evidence' },
        { key: 'review', label: language === 'gu' ? 'ચકાસણી અને પેમેન્ટ' : language === 'hi' ? 'સમીક્ષા એવં ભુગતાન' : 'Review & Submit' }
      ];
    }
    if (currentSlug === 'caste_ncl_certificate') {
      return [
        { key: 'applicant', label: language === 'gu' ? 'અરજદાર અને SEBC જ્ઞાતિ' : language === 'hi' ? 'આવેદક એવં જાતિ' : 'Applicant & SEBC Caste' },
        { key: 'address', label: language === 'gu' ? 'સરનામું અને માતા-પિતા વિગત' : language === 'hi' ? 'પતા એવં અભિભાવક' : 'Address & Parents' },
        { key: 'three_year_income', label: language === 'gu' ? '૩ વર્ષની આવકનો ઇતિહાસ' : language === 'hi' ? '3 વર્ષ કી આય' : '3-Year Income History' },
        { key: 'documents', label: language === 'gu' ? 'જરૂરી પુરાવા અપલોડ' : language === 'hi' ? 'દસ્તાવેજ અપલોડ' : 'Mandatory Proofs' },
        { key: 'review', label: language === 'gu' ? 'ચકાસણી અને પેમેન્ટ' : language === 'hi' ? 'સમીક્ષા એવં ભુગતાન' : 'Review & Submit' }
      ];
    }
    if (currentSlug === 'land_records_7_12') {
      return [
        { key: 'applicant', label: language === 'gu' ? 'અરજદાર સંપર્ક વિગત' : language === 'hi' ? 'આવેદક સંપર્ક' : 'Applicant Contact' },
        { key: 'land_location', label: language === 'gu' ? 'જમીન સ્થળ અને સર્વે નંબર' : language === 'hi' ? 'ભૂમિ સ્થાન એવં સર્વે' : 'Land Location & Survey' },
        { key: 'documents', label: language === 'gu' ? 'ઓળખ / સંદર્ભ પુરાવો' : language === 'hi' ? 'પહચાન પ્રમાણ' : 'Supporting Reference' },
        { key: 'review', label: language === 'gu' ? 'ચકાસણી અને ઓર્ડર' : language === 'hi' ? 'સમીક્ષા એવં ભુગતાન' : 'Review & Download' }
      ];
    }
    if (currentSlug === 'driving_licence_rto') {
      return [
        { key: 'applicant', label: language === 'gu' ? 'અંગત માહિતી અને લાયકાત' : language === 'hi' ? 'વ્યક્તિગત એવં શૈક્ષણિક' : 'Personal & Education' },
        { key: 'address', label: language === 'gu' ? 'સરનામું' : language === 'hi' ? 'આવાસીય પતા' : 'Address Details' },
        { key: 'licence_service', label: language === 'gu' ? 'લાયસન્સ પ્રકાર અને વાહન ક્લાસ' : language === 'hi' ? 'લાઇસન્સ એવં વાહન શ્રેણી' : 'Licence Type & Vehicle Class' },
        { key: 'rto_selection', label: language === 'gu' ? 'નજીકની RTO કચેરી પસંદગી' : language === 'hi' ? 'આરટીઓ કાર્યાલય ચયન' : 'RTO Office Selection' },
        { key: 'documents', label: language === 'gu' ? 'ફોટો અને સહી અપલોડ' : language === 'hi' ? 'ફોટો એવં હસ્તાક્ષર' : 'Photo & Signature Scan' },
        { key: 'review', label: language === 'gu' ? 'ચકાસણી અને પેમેન્ટ' : language === 'hi' ? 'સમીક્ષા એવં ભુગતાન' : 'Review & Slot Booking' }
      ];
    }
    if (currentSlug === 'neet_exam') {
      return [
        { key: 'candidate', label: language === 'gu' ? 'ઉમેદવાર અને ઓળખ વિગત' : language === 'hi' ? 'ઉમ્મીદવાર એવં પહચાન' : 'Candidate & Identity' },
        { key: 'address', label: language === 'gu' ? 'કાયમી સરનામું અને સંપર્ક' : language === 'hi' ? 'પતા એવં સંપર્ક' : 'Address & Contact' },
        { key: 'academic', label: language === 'gu' ? 'ધોરણ ૧૦ અને ૧૨ શૈક્ષણિક વિગતો' : language === 'hi' ? 'શૈક્ષણિક વિવરણ' : 'Class 10 & 12 Academic' },
        { key: 'exam_details', label: language === 'gu' ? 'પરીક્ષા માધ્યમ અને કેન્દ્ર' : language === 'hi' ? 'પરીક્ષા માધ્યમ એવં કેન્દ્ર' : 'Exam Medium & City Choices' },
        { key: 'documents', label: language === 'gu' ? 'ફોટો, સહી અને ફિંગરપ્રિન્ટ' : language === 'hi' ? 'દસ્તાવેજ અપલોડ' : 'NTA Photo & Biometrics' },
        { key: 'review', label: language === 'gu' ? 'અંતિમ ચકાસણી અને પેમેન્ટ' : language === 'hi' ? 'સમીક્ષા એવં ભુગતાન' : 'Final Verification & Submit' }
      ];
    }

    // Fallback default
    return [
      { key: 'applicant', label: language === 'gu' ? 'અરજદાર વિગત' : language === 'hi' ? 'આવેદક વિવરણ' : 'Applicant Details' },
      { key: 'address', label: language === 'gu' ? 'સરનામું' : language === 'hi' ? 'આવાસીય પતા' : 'Address' },
      { key: 'documents', label: language === 'gu' ? 'દસ્તાવેજો' : language === 'hi' ? 'દસ્તાવેજ' : 'Documents' },
      { key: 'review', label: language === 'gu' ? 'ચકાસણી અને ફી' : language === 'hi' ? 'સમીક્ષા એવં શુલ્ક' : 'Review & Pay' }
    ];
  }, [form, slug, language]);

  const currentStepIdx = useMemo(() => {
    const idx = stepsList.findIndex(s => s.key === activeStepKey);
    return idx >= 0 ? idx : 0;
  }, [stepsList, activeStepKey]);

  // Filter required documents based on condition_rules
  const visibleDocuments = useMemo(() => {
    if (!form?.service_documents || form.service_documents.length === 0) {
      return form?.required_docs_json || [];
    }

    return form.service_documents.filter(doc => {
      if (doc.required_level === 'mandatory') return true;
      if (!doc.condition_rule) return true;

      // Condition rule evaluation
      const { field, equals, not_equals, greater_than } = doc.condition_rule;
      if (field && equals !== undefined) {
        return fieldValues[field] === equals;
      }
      if (field && not_equals !== undefined) {
        return fieldValues[field] && fieldValues[field] !== not_equals;
      }
      if (field && greater_than !== undefined) {
        const val = parseFloat(fieldValues[field] || '0');
        return val > greater_than;
      }
      return true;
    });
  }, [form, fieldValues]);

  const getTitle = (f: CertificateForm) =>
    language === 'gu' ? f.title_gu : language === 'hi' ? f.title_hi : f.title_en;

  const handleNext = () => {
    // Validate mobile number if field exists on current step
    const currentFields = getFieldsForStep(activeStepKey);
    const hasMobileField = currentFields.some(f => 
      f.field_key === 'mobile_number' || f.field_key === 'mobile' || f.field_key === 'phone'
    );

    if (hasMobileField) {
      const phone = fieldValues.mobile_number || fieldValues.mobile || fieldValues.phone;
      if (!phone || String(phone).replace(/[^0-9]/g, '').length < 10) {
        alert(
          language === 'gu'
            ? 'કૃપા કરીને માન્ય ૧૦-અંકનો મોબાઈલ નંબર દાખલ કરો.'
            : language === 'hi'
            ? 'कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें।'
            : 'Please enter a valid 10-digit mobile number.'
        );
        return;
      }
    }

    const nextIdx = currentStepIdx + 1;
    if (nextIdx < stepsList.length) {
      setActiveStepKey(stepsList[nextIdx].key);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    const prevIdx = currentStepIdx - 1;
    if (prevIdx >= 0) {
      setActiveStepKey(stepsList[prevIdx].key);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrefillDemo = () => {
    setFieldValues({
      applicant_name: 'Rameshchandra B. Patel',
      father_husband_name: 'Bhagwandas Patel',
      father_name: 'Bhagwandas Patel',
      mother_name: 'Savitaben Patel',
      candidate_name: 'Rameshchandra B. Patel',
      gender: 'male',
      dob: '1988-06-15',
      mobile_number: '9825044551',
      aadhaar_number: '982145519821',
      identity_type: 'aadhaar',
      identity_number: '982145519821',
      
      // Structured address
      house_flat_no: 'B-402',
      building_society: 'Radhe Shyam Residency',
      street_road: 'Near Sardar Patel Ring Road',
      area_locality: 'Vastral',
      village_city: 'Vastral',
      village_name: 'Vastral',
      taluka: 'Daskroi',
      district: 'Ahmedabad',
      state: 'Gujarat',
      pincode: '382418',
      residence_years: '25',
      ration_card_no: '0712398214',
      
      // Income details
      income_purpose: 'higher_education',
      income_salary: '180000',
      income_agriculture: '60000',
      income_business: '0',
      income_other: '0',
      annual_income: '240000',
      family_gross_income: '240000',
      has_income_tax_return: 'no',
      
      // EWS / Assets
      agricultural_land_acres: '0',
      residential_flat_sqft: '850',
      residential_plot_sqyards: '0',
      
      // NCL / SEBC
      caste_category: 'sebc',
      caste_subcaste: 'Patidar / Kadva Patel',
      religion: 'hindu',
      sebc_caste_name: 'Prajapati',
      caste_certificate_no: 'SEBC/2021/89412',
      caste_cert_issue_date: '2021-05-10',
      caste_cert_issuing_office: 'Mamlatdar Office Daskroi',
      income_fy_2023_24: '220000',
      income_fy_2024_25: '235000',
      income_fy_2025_26: '240000',
      parents_govt_designation: 'none',
      
      // Land
      record_type: '7_12',
      survey_number: '142/1',
      khata_number: '89',
      
      // RTO
      licence_service_type: 'new_learner',
      licence_type: 'learner',
      vehicle_class: 'MCWG_LMV',
      educational_qualification: '10th_pass',
      blood_group: 'B+',
      rto_office: 'GJ-27',
      
      // NEET
      nationality: 'indian',
      category: 'gen_ews',
      pwd_status: 'no',
      email_address: 'ramesh.patel@gmail.com',
      class_10_board: 'GSEB',
      class_10_percentage: '82.5',
      class_10_passing_year: '2023',
      class_12_status: 'passed',
      class_12_board: 'GSEB',
      class_12_percentage: '78.4',
      question_paper_medium: 'Gujarati',
      exam_city_1: 'Ahmedabad',
      exam_city_2: 'Gandhinagar'
    });
  };

  const handleSubmit = async () => {
    if (!form) return;
    setSubmitting(true);
    try {
      const user = ApiService.getCurrentUser();
      if (!user) {
        const phone = fieldValues.mobile_number || '9825044551';
        await ApiService.login('citizen@formseva.in', 'citizen', fieldValues.applicant_name || fieldValues.candidate_name || 'Gujarat Citizen', String(phone));
      }

      if (resubmissionTarget) {
        const result = await ApiService.resubmitSubmission(resubmissionTarget.id, fieldValues, resubmissionNote);
        setSubmissionId(result.id);
        setDone(true);
      } else {
        const result = await ApiService.createSubmission(form.slug, fieldValues);
        setSubmissionId(result.id);
        setDone(true);
      }
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
          onClick={() => router.push('/#services-catalog')}
          className="px-4 py-2 bg-[#159447] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#12803c] transition"
        >
          Return to Services
        </button>
      </div>
    </div>
  );

  if (form.is_active === false) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Head>
          <title>{getTitle(form)} — Service Temporarily Paused</title>
        </Head>
        <Navbar />
        <main className="flex-1 max-w-xl mx-auto px-4 py-16 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-5 shadow-xs">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-[#18232D]">
            {language === 'gu'
              ? 'આ સેવા હાલમાં નાગરિકો માટે બંધ છે'
              : language === 'hi'
              ? 'यह सेवा वर्तमान में नागरिकों के लिए बंद है'
              : 'This Service is Currently Paused'}
          </h1>
          <p className="text-sm text-[#5B6470] mt-2 max-w-md">
            {language === 'gu'
              ? `${form.title_gu} માટે નવી અરજીઓ એડમિનિસ્ટ્રેટર દ્વારા કામચલાઉ ધોરણે સ્થગિત કરવામાં આવી છે.`
              : language === 'hi'
              ? `${form.title_hi} हेतु नए आवेदन अस्थायी रूप से व्यवस्थापक द्वारा रोके गए हैं।`
              : `New applications for "${form.title_en}" have been temporarily paused by administrator.`}
          </p>
          <div className="mt-6 flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => router.push('/#services-catalog')}
              className="px-5 py-2.5 rounded-xl bg-[#159447] text-white font-bold text-xs shadow-sm hover:bg-[#12803c] transition"
            >
              {language === 'gu' ? '← ઉપલબ્ધ સેવાઓ જુઓ' : language === 'hi' ? '← उपलब्ध सेवाएं देखें' : '← View Available Services'}
            </button>
            <button
              onClick={() => router.push('/track')}
              className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs shadow-2xs hover:bg-slate-50 transition"
            >
              {language === 'gu' ? 'હાલની અરજી ટ્રેક કરો' : language === 'hi' ? 'आवेदन ट्रैक करें' : 'Track Existing Application'}
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const totalFee = form.official_fee + form.service_fee;

  const getFieldsForStep = (stepKey: string): FormField[] => {
    const defaultMock = mockForms.find(m => m.slug === slug || m.id === form?.id);
    const allFields = (form?.fields && form.fields.length > 0) ? form.fields : (defaultMock?.fields || []);

    if (!allFields || allFields.length === 0) return [];

    // 1. Direct match with step_section
    const directMatches = allFields.filter(f => f.step_section === stepKey);
    if (directMatches.length > 0) return directMatches;

    // 2. Legacy/Alias Fallback support
    if (stepKey === 'applicant' || stepKey === 'candidate') {
      const aliasMatches = allFields.filter(f => f.step_section === 'personal' || f.step_section === 'applicant' || f.step_section === 'candidate');
      if (aliasMatches.length > 0) return aliasMatches;
    }
    if (stepKey === 'address') {
      const addrMatches = allFields.filter(f => f.step_section === 'address');
      if (addrMatches.length > 0) return addrMatches;
    }
    if (['family_income', 'three_year_income', 'property_assets', 'land_location', 'licence_service', 'rto_selection', 'academic', 'exam_details'].includes(stepKey)) {
      const legacyMatches = allFields.filter(f => f.step_section === stepKey || f.step_section === 'specific');
      if (legacyMatches.length > 0) return legacyMatches;
    }

    // 3. Fallback for the first step if no match was found:
    if (currentStepIdx === 0) {
      const firstMatches = allFields.filter(f => f.step_section === 'applicant' || f.step_section === 'candidate' || f.step_section === 'personal');
      if (firstMatches.length > 0) return firstMatches;
      return allFields;
    }

    return directMatches;
  };

  const currentStepFields = getFieldsForStep(activeStepKey);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Head>
        <title>{getTitle(form)} — FormSeva Gujarat</title>
        <meta name="description" content={`Apply for ${form.title_en} online through FormSeva Gujarat.`} />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-5 sm:py-8 space-y-5 sm:space-y-6">
        
        {/* Resubmission Mode Alert Banner */}
        {resubmissionTarget && (
          <div className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-4 sm:p-5 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-200 text-amber-900 shrink-0 mt-0.5">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div className="space-y-1 text-xs sm:text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-black text-amber-950 uppercase tracking-wide">
                    {language === 'gu' ? 'સુધારો અને ફરી સબમિશન મોડ' : language === 'hi' ? 'संशोधन एवं पुनः प्रस्तुतीकरण' : 'Correction & Resubmission Mode'}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-amber-300 text-amber-950 font-mono font-bold text-[11px]">
                    {resubmissionTarget.application_number}
                  </span>
                </div>
                {resubmissionTarget.rejection_reason && (
                  <p className="text-amber-900 bg-amber-100/80 p-2.5 rounded-xl border border-amber-300 font-medium">
                    <strong className="font-bold">{language === 'gu' ? 'ઓપરેટર દ્વારા જણાવેલ ક્ષતિ: ' : 'Operator Query: '}</strong>
                    {resubmissionTarget.rejection_reason}
                  </p>
                )}
                <p className="text-amber-800 text-xs">
                  {language === 'gu'
                    ? 'તમારી ભૂલ સુધારીને નીચે આપેલ બટન પર ક્લિક કરો. આ માટે કોઈ વધારાનો શુલ્ક લેવામાં આવશે નહીં.'
                    : 'Edit your details below and click Resubmit. No extra fee is charged.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Header Strip */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1">
              <Link href="/#services-catalog" className="hover:text-[#159447] transition">
                {language === 'gu' ? 'સેવાઓ' : language === 'hi' ? 'सेवाएं' : 'Services'}
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-slate-700">{getTitle(form)}</span>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">{getTitle(form)}</h1>
              {form.exam_year && (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
                  {form.exam_year} Edition
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                {form.turnaround_days} {language === 'gu' ? 'દિવસ' : 'Days'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <IndianRupee className="w-3.5 h-3.5 text-[#159447]" />
                FormSeva Fee: <strong>₹{form.service_fee}</strong>
                {form.official_fee > 0 && ` + Govt Fee: ₹${form.official_fee}`}
              </span>
            </div>
          </div>

          {!done && (
            <button
              onClick={handlePrefillDemo}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-bold transition shadow-2xs self-start sm:self-auto"
              title="Auto-fill with sample citizen data for instant testing"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>{language === 'gu' ? 'ડેમો ડેટા ભરો' : language === 'hi' ? 'डेमो डेटा भरें' : 'Pre-fill Demo Data'}</span>
            </button>
          )}
        </div>

        {done ? (
          <div className="bg-white border border-emerald-200 rounded-3xl p-8 sm:p-12 text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#159447] flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-slate-900">
              {resubmissionTarget
                ? (language === 'gu' ? 'અરજી સફળતાપૂર્વક ફરીથી સબમિટ થઈ!' : 'Application Resubmitted Successfully!')
                : (language === 'gu' ? 'અરજી સફળતાપૂર્વક સબમિટ થઈ!' : 'Application Submitted Successfully!')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
              {language === 'gu'
                ? 'ઓપરેટર સરકારી પોર્ટલ પર ફોર્મ ભરવાનું શરૂ કરશે. સ્ટેટસ તપાસવા માટે ટ્રેક પેજ જુઓ.'
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
            {/* ─── SINGLE CLEAN STEP PROGRESS INDICATOR (NO DUPLICATE NUMBERS) ─── */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {stepsList.map((s, idx) => {
                const isCurrent = s.key === activeStepKey;
                const isDone = idx < currentStepIdx;
                const stepNum = idx + 1;
                return (
                  <button
                    key={s.key}
                    onClick={() => {
                      if (idx <= currentStepIdx) setActiveStepKey(s.key);
                    }}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                      isCurrent
                        ? 'bg-[#18232D] text-white shadow-xs'
                        : isDone
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100/60'
                        : 'bg-white border border-slate-200 text-slate-400'
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-black shrink-0 ${
                      isCurrent
                        ? 'bg-[#159447] text-white'
                        : isDone
                        ? 'bg-emerald-200 text-emerald-900'
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      {isDone ? '✓' : stepNum}
                    </span>
                    <span>{s.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Step Form Box */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-8 shadow-xs">
              
              {/* Dynamic Field Step */}
              {activeStepKey !== 'documents' && activeStepKey !== 'review' && (
                <div className="space-y-4">
                  <div className="border-b border-slate-100 pb-3">
                    <h2 className="text-base font-black text-slate-900">
                      {stepsList[currentStepIdx]?.label}
                    </h2>
                    {stepsList[currentStepIdx]?.desc && (
                      <p className="text-xs text-slate-500 mt-0.5">
                        {stepsList[currentStepIdx].desc}
                      </p>
                    )}
                  </div>
                  
                  <DynamicFormStep
                    fields={currentStepFields}
                    values={fieldValues}
                    errors={{}}
                    onChange={(key, val) => setFieldValues(prev => ({ ...prev, [key]: val }))}
                  />
                </div>
              )}

              {/* Documents Step */}
              {activeStepKey === 'documents' && (
                <div className="space-y-4">
                  <div className="border-b border-slate-100 pb-3">
                    <h2 className="text-base font-black text-slate-900">
                      {language === 'gu' ? 'જરૂરી દસ્તાવેજો અપલોડ કરો' : language === 'hi' ? 'आवश्यक दस्तावेज अपलोड करें' : 'Upload Required Documents'}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {language === 'gu' ? 'તમારા દાખલ કરેલ વિગતો મુજબ જરૂરી દસ્તાવેજ અપલોડ કરો.' : 'Upload clear scanned copies or photos as per your application specifics.'}
                    </p>
                  </div>
                  <DocumentUploader
                    requiredDocs={visibleDocuments}
                    uploadedFiles={uploadedDocs}
                    onFileUpload={(key, file) => setUploadedDocs(prev => ({ ...prev, [key]: file }))}
                  />
                </div>
              )}

              {/* Review Step */}
              {activeStepKey === 'review' && (
                <div className="space-y-6">
                  <div className="border-b border-slate-100 pb-3">
                    <h2 className="text-base font-black text-slate-900">
                      {language === 'gu' ? 'વિગતો ચકાસો અને સબમિટ કરો' : language === 'hi' ? 'विवरण जांचें और जमा करें' : 'Review Details & Submit'}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {language === 'gu' ? 'કૃપા કરીને સબમિટ કરતા પહેલા તમામ વિગતોની ચકાસણી કરો.' : 'Please verify all entered details before payment.'}
                    </p>
                  </div>

                  {resubmissionTarget && (
                    <div className="space-y-2 bg-amber-50 p-4 rounded-2xl border border-amber-200">
                      <label className="block text-xs font-bold text-amber-950">
                        {language === 'gu' ? 'સુધારા અંગે ઓપરેટર માટે નોંધ (વૈકલ્પિક):' : 'Note for Operator regarding corrections (Optional):'}
                      </label>
                      <input
                        type="text"
                        value={resubmissionNote}
                        onChange={e => setResubmissionNote(e.target.value)}
                        placeholder="e.g. Corrected applicant name spelling as per Aadhaar Card"
                        className="w-full px-3.5 py-2 bg-white rounded-xl border border-amber-300 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>
                  )}

                  {/* Section summaries with Edit jumps */}
                  {stepsList.filter(s => s.key !== 'review' && s.key !== 'documents').map((s) => {
                    const sFields = getFieldsForStep(s.key);
                    const filledFields = sFields.filter(f => fieldValues[f.field_key] !== undefined && fieldValues[f.field_key] !== '');
                    if (filledFields.length === 0) return null;

                    return (
                      <div key={s.key} className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200/80 space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                          <h3 className="text-xs font-black uppercase tracking-wide text-slate-700">
                            {s.label}
                          </h3>
                          <button
                            type="button"
                            onClick={() => setActiveStepKey(s.key)}
                            className="inline-flex items-center gap-1 text-xs font-bold text-[#159447] hover:underline"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>{language === 'gu' ? 'સુધારો' : language === 'hi' ? 'संशोधित करें' : 'Edit'}</span>
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          {filledFields.map((f) => (
                            <div key={f.field_key} className="flex flex-col break-words">
                              <span className="font-semibold text-slate-500">
                                {language === 'gu' ? f.label_gu : language === 'hi' ? f.label_hi : f.label_en}
                              </span>
                              <span className="font-bold text-slate-900 break-words mt-0.5">
                                {String(fieldValues[f.field_key])}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}

                  {/* Uploaded Documents Review */}
                  <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200/80 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                      <h3 className="text-xs font-black uppercase tracking-wide text-slate-700">
                        {language === 'gu' ? 'જોડાયેલ દસ્તાવેજો' : language === 'hi' ? 'संलग्न दस्तावेज' : 'Attached Documents'}
                      </h3>
                      <button
                        type="button"
                        onClick={() => setActiveStepKey('documents')}
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#159447] hover:underline"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>{language === 'gu' ? 'સુધારો' : language === 'hi' ? 'संशोधित करें' : 'Edit'}</span>
                      </button>
                    </div>
                    {Object.keys(uploadedDocs).length > 0 ? (
                      <div className="space-y-1.5 text-xs">
                        {Object.keys(uploadedDocs).map(k => (
                          <div key={k} className="flex items-center gap-1.5 text-emerald-800 break-words">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#159447] shrink-0" />
                            <span className="font-semibold">{k}: {uploadedDocs[k].name}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No files attached yet.</p>
                    )}
                  </div>

                  {/* Fee Breakdown & Submit/Pay Button */}
                  <div className="bg-emerald-50/70 border border-emerald-200 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-xs text-emerald-800 font-bold block">{t.totalFeeLabel}</span>
                      <div className="text-2xl sm:text-3xl font-black text-slate-900">
                        {resubmissionTarget ? '₹0 (Paid)' : `₹${totalFee}`}
                      </div>
                      <div className="text-[11px] text-slate-600 mt-0.5">
                        {resubmissionTarget
                          ? 'Resubmission is free of charge (previously paid)'
                          : `FormSeva Assisted Fee: ₹${form.service_fee}${form.official_fee > 0 ? ` + Govt Official Fee: ₹${form.official_fee}` : ''}`}
                      </div>
                    </div>

                    <button
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 min-h-[48px] px-7 py-3.5 rounded-2xl bg-[#159447] hover:bg-[#12803c] text-white text-xs sm:text-sm font-black shadow-md hover:shadow-lg disabled:opacity-50 transition"
                    >
                      {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                      <span>
                        {resubmissionTarget
                          ? (language === 'gu' ? 'સુધારેલી અરજી ફરીથી મોકલો' : 'Resubmit Corrected Application')
                          : `${t.submitAndPay} (₹${totalFee})`}
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* Wizard Navigation Bar */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-5 mt-6">
                <button
                  onClick={handlePrev}
                  disabled={currentStepIdx === 0}
                  className="min-h-[44px] px-5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-30 transition"
                >
                  {t.previousStep}
                </button>

                {activeStepKey !== 'review' && (
                  <button
                    onClick={handleNext}
                    className="inline-flex items-center gap-1.5 min-h-[44px] px-6 py-2.5 rounded-xl bg-[#159447] hover:bg-[#12803c] text-white text-xs sm:text-sm font-bold shadow-xs transition"
                  >
                    <span>{t.nextStep}</span>
                    <ChevronRight className="w-4 h-4" />
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
