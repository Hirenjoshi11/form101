import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useLanguage } from '@/i18n/LanguageContext';
import { ApiService } from '@/lib/api';
import { CertificateForm, ServiceDocument } from '@/lib/types';
import { FormIcon } from '@/components/FormIcon';
import {
  FileText, CheckCircle2, AlertCircle, HelpCircle,
  Download, ArrowRight, ShieldCheck, Check,
  Info, ExternalLink, Sparkles, Building, ChevronRight,
  Clock, IndianRupee, Layers, FileCheck2
} from 'lucide-react';

export default function DocumentsRequirementsPage() {
  const { t, language } = useLanguage();
  const router = useRouter();
  const { service } = router.query as { service?: string };

  const [forms, setForms] = useState<CertificateForm[]>([]);
  const [selectedForm, setSelectedForm] = useState<CertificateForm | null>(null);
  const [documents, setDocuments] = useState<ServiceDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAllForms = async () => {
      try {
        const data = await ApiService.getForms();
        setForms(data);
        if (data.length > 0) {
          const initial = service ? data.find(f => f.slug === service || f.id === service) || data[0] : data[0];
          setSelectedForm(initial);
          if (initial.service_documents && initial.service_documents.length > 0) {
            setDocuments(initial.service_documents);
          } else {
            const docs = await ApiService.getFormDocuments(initial.slug);
            setDocuments(docs);
          }
        }
      } catch (e) {
        console.error('Failed to load documents data', e);
      } finally {
        setLoading(false);
      }
    };
    loadAllForms();
  }, [service]);

  const handleSelectService = async (form: CertificateForm) => {
    setSelectedForm(form);
    if (form.service_documents && form.service_documents.length > 0) {
      setDocuments(form.service_documents);
    } else {
      try {
        const docs = await ApiService.getFormDocuments(form.slug);
        setDocuments(docs);
      } catch (e) {
        setDocuments([]);
      }
    }
  };

  const getTitle = (f: CertificateForm) =>
    language === 'gu' ? f.title_gu : language === 'hi' ? f.title_hi : f.title_en;

  const getDocName = (doc: ServiceDocument) =>
    language === 'gu' ? doc.name_gu : language === 'hi' ? doc.name_hi : doc.name_en;

  const getWhyNeeded = (doc: ServiceDocument) =>
    language === 'gu' ? doc.why_needed_gu : language === 'hi' ? doc.why_needed_hi : doc.why_needed_en;

  const getWhereToGet = (doc: ServiceDocument) =>
    language === 'gu' ? doc.where_to_get_gu : language === 'hi' ? doc.where_to_get_hi : doc.where_to_get_en;

  const getAuthority = (doc: ServiceDocument) =>
    language === 'gu' ? doc.source_authority_gu : language === 'hi' ? doc.source_authority_hi : doc.source_authority_en;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Head>
        <title>
          {language === 'gu'
            ? 'જરૂરી દસ્તાવેજો અને માર્ગદર્શિકા — FormSeva Gujarat'
            : language === 'hi'
            ? 'आवश्यक दस्तावेज एवं दिशा-निर्देश — FormSeva'
            : 'Documents & Requirements Checklist — FormSeva Gujarat'}
        </title>
        <meta
          name="description"
          content="Comprehensive official checklist of documents required for Gujarat government certificates, AnyRoR land records, Sarathi RTO licences, and NEET UG 2026."
        />
      </Head>

      <Navbar />

      {/* ─── HERO HEADER ─── */}
      <section className="relative bg-gradient-to-b from-[#F8FAF9] via-[#F3F8F5] to-slate-50 pt-8 pb-10 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-3 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100/80 border border-emerald-300/60 rounded-full text-xs font-bold text-emerald-800">
              <Sparkles className="w-3.5 h-3.5 text-[#159447]" />
              <span>
                {language === 'gu' ? '૧૦૦% સત્તાવાર સરકારી માપદંડ' : language === 'hi' ? '100% आधिकारिक सरकारी मानक' : '100% Official Authority Standards'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-[#18232D] tracking-tight">
              {t.documentsHeroTitle}
            </h1>
            <p className="text-sm sm:text-base text-slate-600 font-medium">
              {t.documentsHeroSubtitle}
            </p>
          </div>
        </div>
      </section>

      {/* ─── MAIN CONTENT ─── */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Service Selector Tabs */}
        <div className="mb-8">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">
            {language === 'gu' ? 'સેવા પસંદ કરો' : language === 'hi' ? 'सेवा का चयन करें' : 'Select a Service'}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {forms.map((f) => {
              const isSelected = selectedForm?.id === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => handleSelectService(f)}
                  className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2.5 min-h-[96px] ${
                    isSelected
                      ? 'border-[#159447] bg-white ring-2 ring-[#159447]/20 shadow-md scale-[1.02]'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <FormIcon slug={f.slug} className="w-6 h-6" />
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-[#159447]" />
                    )}
                  </div>
                  <span className={`text-xs font-bold leading-snug line-clamp-2 ${
                    isSelected ? 'text-[#159447]' : 'text-slate-800'
                  }`}>
                    {getTitle(f)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {selectedForm && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left 2 Columns: Documents Requirement Matrix */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Active Service Banner */}
              <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                    <FormIcon slug={selectedForm.slug} className="w-6 h-6 text-[#159447]" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-black text-[#18232D]">
                      {getTitle(selectedForm)}
                    </h2>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      {language === 'gu' ? selectedForm.department_name_gu : language === 'hi' ? selectedForm.department_name_hi : selectedForm.department_name_en}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs font-bold text-slate-700">
                      <span className="inline-flex items-center gap-1 text-emerald-700">
                        <IndianRupee className="w-3.5 h-3.5" />
                        FormSeva Fee: ₹{selectedForm.service_fee}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="inline-flex items-center gap-1 text-slate-600">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        {selectedForm.turnaround_days} Days
                      </span>
                    </div>
                  </div>
                </div>

                <Link
                  href={`/forms/${selectedForm.slug}`}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#159447] text-white text-xs font-black hover:bg-[#12803c] transition-all shadow-md hover:shadow-lg self-start sm:self-auto shrink-0"
                >
                  <span>{language === 'gu' ? 'અરજી શરૂ કરો' : language === 'hi' ? 'आवेदन शुरू करें' : 'Apply Now'}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Documents List Header */}
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                  <FileCheck2 className="w-5 h-5 text-[#159447]" />
                  <span>{t.requiredDocumentsTitle}</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {documents.length}
                  </span>
                </h3>
              </div>

              {/* Document Cards */}
              <div className="space-y-4">
                {documents.map((doc, idx) => {
                  const isMandatory = doc.required_level === 'mandatory';
                  const isConditional = doc.required_level === 'conditional';

                  return (
                    <div
                      key={doc.id || doc.document_type_key || idx}
                      className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:border-[#159447]/50 transition-all space-y-3.5"
                    >
                      {/* Top Row: Title & Badge */}
                      <div className="flex flex-wrap items-start justify-between gap-2.5">
                        <div className="flex items-start gap-3 min-w-0">
                          <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <div>
                            <h4 className="text-sm sm:text-base font-bold text-slate-900">
                              {getDocName(doc)}
                            </h4>
                            {getAuthority(doc) && (
                              <p className="text-[11px] text-slate-400 font-medium">
                                Authority: {getAuthority(doc)}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Badge */}
                        {isMandatory ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            {t.badgeMandatory}
                          </span>
                        ) : isConditional ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            {t.badgeConditional}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                            {t.badgeOptional}
                          </span>
                        )}
                      </div>

                      {/* Detail Boxes: Why Needed & Where to Get */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                        {getWhyNeeded(doc) && (
                          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs text-slate-700 space-y-1">
                            <span className="font-bold text-slate-900 block flex items-center gap-1">
                              <Info className="w-3.5 h-3.5 text-[#159447]" />
                              {t.whyMayNeedIt}
                            </span>
                            <p className="text-slate-600 leading-relaxed font-normal">
                              {getWhyNeeded(doc)}
                            </p>
                          </div>
                        )}

                        {getWhereToGet(doc) && (
                          <div className="bg-emerald-50/40 rounded-xl p-3 border border-emerald-100/60 text-xs text-emerald-950 space-y-1">
                            <span className="font-bold text-[#159447] block flex items-center gap-1">
                              <Building className="w-3.5 h-3.5 text-[#159447]" />
                              {t.whereCanIGetIt}
                            </span>
                            <p className="text-emerald-900/80 leading-relaxed font-normal">
                              {getWhereToGet(doc)}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Meta Footer: Formats & Size */}
                      <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                        <span className="font-medium">
                          {t.acceptedFormatsLabel}:{' '}
                          <strong className="text-slate-800">
                            {doc.accepted_formats?.join(', ') || 'PDF, JPG, PNG'}
                          </strong>
                        </span>
                        <span>•</span>
                        <span className="font-medium">
                          {t.maxFileSizeLabel}:{' '}
                          <strong className="text-slate-800">{doc.max_size_mb || 5} MB</strong>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>

            {/* Right Column: Preparation Checklist & Official Disclaimer */}
            <div className="space-y-6">
              
              {/* Checklist Card */}
              <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#159447]" />
                  <span>{t.beforeYouStartTitle}</span>
                </h3>

                <ul className="space-y-3 text-xs text-slate-700">
                  <li className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-[#159447] flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span>
                      {language === 'gu'
                        ? 'ચાલુ મોબાઈલ નંબર હાથવગો રાખો (સરકારી SMS OTP માટે).'
                        : language === 'hi'
                        ? 'सक्रिय मोबाइल नंबर पास रखें (सरकारी SMS OTP हेतु)।'
                        : 'Active mobile phone ready for Government SMS OTP verification.'}
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-[#159447] flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span>
                      {language === 'gu'
                        ? 'અસલ દસ્તાવેજોના સ્પષ્ટ અને સુવાચ્ય ફોટા અથવા PDF સ્કેન.'
                        : language === 'hi'
                        ? 'मूल दस्तावेजों के स्पष्ट और पठनीय फोटो अथवा PDF।'
                        : 'Clear, readable digital scans/photos of original documents.'}
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-[#159447] flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span>
                      {language === 'gu'
                        ? 'આધાર કાર્ડ અને શાળા LC માં નામના સ્પેલિંગ અને જન્મતારીખની ચોકસાઈ.'
                        : language === 'hi'
                        ? 'आधार कार्ड एवं स्कूल रिकॉर्ड में नाम व जन्म तिथि की सटीकता।'
                        : 'Verify name spellings and DOB match across Aadhaar & School LC.'}
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-[#159447] flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span>
                      {language === 'gu'
                        ? 'છેલ્લા ૩ વર્ષની આવકના તમામ સાધનિક પુરાવા (NCL / EWS માટે).'
                        : language === 'hi'
                        ? 'पिछले 3 वर्षों के सभी आय प्रमाण (NCL / EWS हेतु)।'
                        : 'All 3-year income proofs and family ration card (NCL/EWS).'}
                    </span>
                  </li>
                </ul>

                <div className="pt-2">
                  <Link
                    href={`/forms/${selectedForm.slug}`}
                    className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#159447] text-white text-xs font-black hover:bg-[#12803c] transition-all shadow-md"
                  >
                    <span>{language === 'gu' ? 'અરજી શરૂ કરો' : language === 'hi' ? 'आवेदन शुरू करें' : 'Start Application'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Statutory Disclaimer Card */}
              <div className="bg-amber-50/70 border border-amber-200 rounded-3xl p-5 text-xs text-amber-950 space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-900">
                  <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>
                    {language === 'gu' ? 'મહત્વપૂર્ણ સરકારી ડિસ્ક્લેમર' : language === 'hi' ? 'महत्वपूर्ण सरकारी अस्वीकरण' : 'Important Statutory Disclaimer'}
                  </span>
                </div>
                <p className="text-[11px] leading-relaxed text-amber-900/80">
                  {t.statutoryDisclaimer}
                </p>
              </div>

            </div>

          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
