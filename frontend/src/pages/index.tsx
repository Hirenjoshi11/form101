import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useLanguage } from '@/i18n/LanguageContext';
import { ApiService } from '@/lib/api';
import { CertificateForm } from '@/lib/types';
import { FormIcon } from '@/components/FormIcon';
import {
  FileText, ShieldCheck, Clock, IndianRupee,
  ArrowRight, CheckCircle2, Star, Users, Award,
  Zap, Lock, Smartphone, ChevronRight, Edit3, PlayCircle,
  XCircle, CheckCircle, Sparkles, HelpCircle
} from 'lucide-react';

const STATUS_STEPS = [
  { key: 'submitted',   color: 'bg-blue-500' },
  { key: 'in_review',   color: 'bg-yellow-500' },
  { key: 'filling',     color: 'bg-purple-500' },
  { key: 'govt_portal', color: 'bg-teal-500' },
  { key: 'approved',    color: 'bg-govt-100' },
];

export default function HomePage() {
  const { t, language } = useLanguage();
  const [forms, setForms] = useState<CertificateForm[]>([]);
  const [loading, setLoading] = useState(true);

  const loadForms = () => {
    ApiService.getForms()
      .then(setForms)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadForms();

    const handleUpdate = () => {
      loadForms();
    };

    window.addEventListener('formseva_data_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('formseva_data_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const getTitle = (f: CertificateForm) =>
    language === 'gu' ? f.title_gu : language === 'hi' ? f.title_hi : f.title_en;
  const getDesc = (f: CertificateForm) =>
    language === 'gu' ? f.description_gu : language === 'hi' ? f.description_hi : f.description_en;
  const getDept = (f: CertificateForm) =>
    language === 'gu' ? f.department_name_gu : language === 'hi' ? f.department_name_hi : f.department_name_en;

  return (
    <>
      <Head>
        <title>FormSeva — Gujarat Government Certificate Assisted-Filing Portal</title>
        <meta name="description" content="Apply for Gujarat government certificates (Income, EWS, 7/12, Non-Creamy Layer, Driving Licence) online from home. Expert operators file on your behalf on official portals." />
      </Head>

      <Navbar />

      {/* ─── NEW CLEAN LIGHT HERO SECTION (REFERENCE DESIGN) ─── */}
      <section className="relative overflow-hidden bg-[#F8FAF9] pt-8 sm:pt-12 pb-16 sm:pb-20 border-b border-slate-100">
        {/* Subtle background glow effect */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-72 h-72 bg-emerald-50/50 rounded-full blur-2xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Two-Column Hero Grid (Left 45% / Right 55%) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center pt-2 sm:pt-4">
            
            {/* Left Column: FormSeva Branding, Headline, Description, and CTAs */}
            <div className="lg:col-span-6 space-y-6 text-left">
              {/* Logo & Tagline */}
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-white flex items-center justify-center p-1.5 shadow-sm border border-slate-200">
                  <img src="/icon.png" alt="FormSeva" className="w-full h-full object-contain" />
                </div>
                <div>
                  <div className="font-black text-2xl sm:text-3xl text-[#18232D] tracking-tight flex items-center leading-none">
                    Form<span className="text-[#159447]">Seva</span>
                  </div>
                  <div className="text-[10px] sm:text-xs font-bold text-[#5B6470] tracking-widest uppercase mt-1">
                    — FILL · SUBMIT · DONE —
                  </div>
                </div>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#18232D] leading-[1.15] tracking-tight">
                {language === 'gu' ? (
                  <>
                    તમારા સરકારી ફોર્મ્સ,
                    <span className="text-[#159447] block mt-1.5">હવે સરળ અને ઝંઝટ-મુક્ત</span>
                  </>
                ) : language === 'hi' ? (
                  <>
                    आपके सरकारी फॉर्म,
                    <span className="text-[#159447] block mt-1.5">अब सरल और झंझट-मुक्त</span>
                  </>
                ) : (
                  <>
                    Your Government Forms,
                    <span className="text-[#159447] block mt-1.5">Now Simple &amp; Hassle-Free</span>
                  </>
                )}
              </h1>

              {/* Subheading Description */}
              <p className="text-base sm:text-lg text-[#5B6470] leading-relaxed max-w-xl">
                {language === 'gu'
                  ? 'અમે સરકારી પોર્ટલ પર તમારા ફોર્મ સચોટ, સુરક્ષિત અને ઝડપથી ભરવામાં સંપૂર્ણ સહાય કરીએ છીએ.'
                  : language === 'hi'
                  ? 'हम सरकारी पोर्टल पर आपके फॉर्म सटीक, सुरक्षित और आसानी से भरने में पूरी सहायता करते हैं।'
                  : 'We help you fill, verify and submit your Government portal forms accurately and with ease.'}
              </p>

              {/* Two CTA Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/forms"
                  className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-[#159447] hover:bg-[#12803c] text-white font-bold text-base shadow-md hover:shadow-lg shadow-emerald-700/25 hover:scale-[1.02] transition-all"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>{language === 'gu' ? 'શરૂ કરો' : language === 'hi' ? 'શરૂ કરો' : 'Get Started'}</span>
                </Link>

                <a
                  href="#how-it-works"
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-[#18232D] border border-slate-200 font-bold text-base shadow-sm hover:shadow transition-all"
                >
                  <PlayCircle className="w-5 h-5 text-[#159447]" />
                  <span>{language === 'gu' ? 'કેવી રીતે કામ કરે છે' : language === 'hi' ? 'यह कैसे काम करता है' : 'How It Works'}</span>
                </a>
              </div>
            </div>

            {/* Right Column: Hero Visual Illustration */}
            <div className="lg:col-span-6 flex justify-center lg:justify-end">
              <div className="relative w-full max-w-[520px]">
                <div className="relative select-none">
                  <img
                    src="/hero-illustration.png"
                    alt="FormSeva - Government Form Clipboard & Citizen Assistance"
                    className="w-full h-auto object-contain drop-shadow-xl"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* ─── FEATURE STRIP ─── */}
          <div className="mt-14 sm:mt-16 bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
              
              {/* Pillar 1 */}
              <Link href="/forms" className="pt-4 sm:pt-0 sm:px-4 first:pl-0 group block transition-all">
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#159447] border border-emerald-100 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-emerald-100 transition-all">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-[#18232D] group-hover:text-[#159447] transition-colors">
                      {language === 'gu' ? 'બહુવિધ પ્રમાણપત્રો' : language === 'hi' ? 'विविध प्रमाण पत्र' : 'Multiple Forms'}
                    </h3>
                    <p className="text-xs text-[#5B6470] mt-1 leading-snug">
                      {language === 'gu'
                        ? 'બધા મુખ્ય સરકારી પ્રમાણપત્રો અને પરીક્ષા ફોર્મ એક જ જગ્યાએ.'
                        : language === 'hi'
                        ? 'सभी प्रमुख सरकारी फॉर्म व परीक्षा पंजीकरण एक ही स्थान पर।'
                        : 'All major Government forms in one place.'}
                    </p>
                  </div>
                </div>
              </Link>

              {/* Pillar 2 */}
              <Link href="/forms" className="pt-4 sm:pt-0 sm:px-4 group block transition-all">
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#159447] border border-emerald-100 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-emerald-100 transition-all">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-[#18232D] group-hover:text-[#159447] transition-colors">
                      {language === 'gu' ? 'નિષ્ણાત સહાયતા' : language === 'hi' ? 'विशेषज्ञ सहायता' : 'Expert Assistance'}
                    </h3>
                    <p className="text-xs text-[#5B6470] mt-1 leading-snug">
                      {language === 'gu'
                        ? 'અમે તમને ફોર્મ સાચું ભરવા સ્ટેપ-બાય-સ્ટેપ માર્ગદર્શન આપીએ છીએ.'
                        : language === 'hi'
                        ? 'हम फॉर्म सही भरने में हर कदम पर सहायता करते हैं।'
                        : 'We guide you step by step to fill forms correctly.'}
                    </p>
                  </div>
                </div>
              </Link>

              {/* Pillar 3 */}
              <Link href="/help" className="pt-4 sm:pt-0 sm:px-4 group block transition-all">
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#159447] border border-emerald-100 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-emerald-100 transition-all">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-[#18232D] group-hover:text-[#159447] transition-colors">
                      {language === 'gu' ? 'સુરક્ષિત અને વિશ્વસનીય' : language === 'hi' ? 'सुरक्षित व विश्वसनीय' : 'Secure & Reliable'}
                    </h3>
                    <p className="text-xs text-[#5B6470] mt-1 leading-snug">
                      {language === 'gu'
                        ? 'DPDP Act 2023 મુજબ સંપૂર્ણ ડેટા સુરક્ષા અને ગોપનીયતા.'
                        : language === 'hi'
                        ? 'आपका डेटा पूर्ण सुरक्षा और गोपनीयता के साथ सुरक्षित है।'
                        : 'Your data is safe with end-to-end security.'}
                    </p>
                  </div>
                </div>
              </Link>

              {/* Pillar 4 */}
              <Link href="/track" className="pt-4 sm:pt-0 sm:px-4 group block transition-all">
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#159447] border border-emerald-100 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-emerald-100 transition-all">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-[#18232D] group-hover:text-[#159447] transition-colors">
                      {language === 'gu' ? 'ટ્રૅક અને ડાઉનલોડ' : language === 'hi' ? 'ट्रैक व डाउनलोड' : 'Track & Download'}
                    </h3>
                    <p className="text-xs text-[#5B6470] mt-1 leading-snug">
                      {language === 'gu'
                        ? 'સ્ટેટસ તપાસો અને રસીદ/પ્રમાણપત્ર તરત ડાઉનલોડ કરો.'
                        : language === 'hi'
                        ? 'स्थिति ट्रैक करें और रसीद तुरंत डाउनलोड करें।'
                        : 'Track status and download receipts instantly.'}
                    </p>
                  </div>
                </div>
              </Link>

            </div>
          </div>

          {/* ─── TRUST SECTION ─── */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-[#18232D] bg-white/80 border border-slate-200 px-5 py-2 rounded-full shadow-xs">
              <div className="w-5 h-5 rounded-full bg-[#159447] text-white flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
              </div>
              <span>
                {language === 'gu'
                  ? 'ગુજરાતભરના હજારો નાગરિકો દ્વારા વિશ્વસનીય • DPDP Act 2023 સુસંગત'
                  : language === 'hi'
                  ? 'गुजरात के हजारों नागरिकों द्वारा विश्वसनीय • DPDP Act 2023 अनुरूप'
                  : 'Trusted by Thousands of Citizens Across Gujarat'}
              </span>
            </div>
          </div>

        </div>

        {/* ─── SOFT CURVED WAVE BOTTOM TRANSITION ─── */}
        <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none pointer-events-none">
          <svg
            className="relative block w-full h-6 sm:h-10 text-white"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path
              d="M0,0 C150,90 350,-40 500,60 C650,160 900,10 1200,40 L1200,120 L0,120 Z"
              fill="currentColor"
            />
          </svg>
        </div>
      </section>

      {/* ─── CERTIFICATE CARDS ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-3">
            {language === 'gu' ? 'ઉપલબ્ધ સેવાઓ' : language === 'hi' ? 'उपलब्ध सेवाएं' : 'Available Certificates'}
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto">
            {language === 'gu'
              ? 'ઘરે બેઠા ઓનલાઈન ભરો — ઓપરેટર સરકારી પોર્ટલ પર ફોર્મ ફાઈલ કરશે'
              : language === 'hi'
              ? 'घर से ऑनलाइन भरें — ऑपरेटर सरकारी पोर्टल पर आपका फॉर्म भरेंगे'
              : 'Apply from home — dedicated operators file on official Govt portals'}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-52 bg-slate-100 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {forms.map((form) => (
              <Link
                key={form.id}
                href={`/forms/${form.slug}`}
                className="group relative bg-white border border-slate-200 hover:border-[#159447] rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between"
              >
                {/* Background Decorative Gradient (Placed behind all content with z-0) */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-50/60 to-transparent rounded-2xl pointer-events-none z-0" />
                
                {/* Foreground Card Content (Elevated with relative z-10) */}
                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <FormIcon slug={form.slug} size="md" />
                      <div className="text-right">
                        <div className="text-xl font-black text-[#18232D]">₹{form.official_fee + form.service_fee}</div>
                      </div>
                    </div>

                    <h3 className="font-bold text-lg text-slate-900 mb-1 leading-snug">{getTitle(form)}</h3>
                    <p className="text-xs text-[#159447] font-semibold mb-2">{getDept(form)}</p>
                    <p className="text-sm text-slate-500 line-clamp-2 mb-4">{getDesc(form)}</p>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-auto">
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      <span>{form.turnaround_days} {language === 'gu' ? 'દિવસ' : language === 'hi' ? 'दिन' : 'days'}</span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-[#159447] group-hover:gap-2 transition-all">
                      {t.applyNow} <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ─── CYBER CAFÉ VS FORMSEVA COMPARISON TABLE (MATCHING EXACT DESIGN) ─── */}
      <section className="bg-white py-16 sm:py-20 border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl font-black text-[#18232D] tracking-tight">
              {language === 'gu'
                ? 'સાયબર કાફે VS ફોર્મ સેવા'
                : language === 'hi'
                ? 'साइबर कैफे VS फॉर्म सेवा'
                : 'Cyber Café VS FormSeva'}
            </h2>
            <p className="text-sm sm:text-base text-[#5B6470] mt-2 max-w-2xl mx-auto font-medium">
              {language === 'gu' ? (
                <>
                  સરકારી ફોર્મ ભરવાની મુશ્કેલીને હવે કહો અલવિદા —{' '}
                  <span className="text-[#159447] font-bold">FormSeva</span> સાથે બધું સરળ!
                </>
              ) : language === 'hi' ? (
                <>
                  सरकारी फॉर्म भरने की परेशानी को कहें अलविदा —{' '}
                  <span className="text-[#159447] font-bold">FormSeva</span> के साथ सब आसान!
                </>
              ) : (
                <>
                  Say goodbye to government form filing hassles — Everything is easy with{' '}
                  <span className="text-[#159447] font-bold">FormSeva</span>!
                </>
              )}
            </p>
          </div>

          {/* Side-by-Side Comparison Container */}
          <div className="grid grid-cols-1 lg:grid-cols-11 gap-6 items-center max-w-5xl mx-auto">
            
            {/* ─── LEFT: CYBER CAFÉ CARD (5 Cols) ─── */}
            <div className="lg:col-span-5 bg-gradient-to-br from-[#FFF5F5] via-[#FFF8F8] to-[#FFF5F5] border border-red-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
              
              {/* Left Header */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-100/90 flex items-center justify-center text-2xl shadow-2xs">
                  😥
                </div>
                <h3 className="font-black text-xl sm:text-2xl text-[#DC2626] tracking-tight">
                  {language === 'gu' ? 'સાયબર કાફે' : language === 'hi' ? 'साइबर कैफे' : 'Cyber Café'}
                </h3>
              </div>

              {/* Left Pain Points List */}
              <div className="space-y-4 pt-1 divide-y divide-red-100/80">
                {/* Point 1: Clock / Time waste */}
                <div className="flex items-center gap-3.5 pt-3 first:pt-0">
                  <div className="w-8 h-8 rounded-full bg-rose-100/80 text-rose-600 flex items-center justify-center shrink-0 shadow-2xs">
                    <Clock className="w-4 h-4 text-rose-600" />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-[#18232D] leading-snug">
                    {language === 'gu'
                      ? 'સરકારી ફોર્મ ભરવામાં જટિલતા અને સમયનો ઘણો વ્યય'
                      : language === 'hi'
                      ? 'सरकारी फॉर्म भरने में जटिलता और समय की भारी बर्बादी'
                      : 'Complex government filing and massive waste of time'}
                  </span>
                </div>

                {/* Point 2: Missing docs / refilling */}
                <div className="flex items-center gap-3.5 pt-4">
                  <div className="w-8 h-8 rounded-full bg-rose-100/80 text-rose-600 flex items-center justify-center shrink-0 shadow-2xs">
                    <FileText className="w-4 h-4 text-rose-600" />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-[#18232D] leading-snug">
                    {language === 'gu'
                      ? 'અધૂરી માહિતીથી ફોર્મ ફરીથી ભરવાની જરૂર'
                      : language === 'hi'
                      ? 'अधूरी जानकारी के कारण फॉर्म दोबारा भरने की मजबूरी'
                      : 'Need to refill forms due to missing or incorrect info'}
                  </span>
                </div>

                {/* Point 3: Confusion */}
                <div className="flex items-center gap-3.5 pt-4">
                  <div className="w-8 h-8 rounded-full bg-rose-100/80 text-rose-600 flex items-center justify-center shrink-0 shadow-2xs">
                    <span className="font-black text-rose-600 text-sm">?</span>
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-[#18232D] leading-snug">
                    {language === 'gu'
                      ? 'કઈ રીતે ભરવું તેની મૂંઝવણ'
                      : language === 'hi'
                      ? 'कैसे भरें इसकी उलझन और भ्रम'
                      : 'Confusion on how to fill required fields'}
                  </span>
                </div>

                {/* Point 4: Deadline Stress */}
                <div className="flex items-center gap-3.5 pt-4">
                  <div className="w-8 h-8 rounded-full bg-rose-100/80 text-rose-600 flex items-center justify-center shrink-0 shadow-2xs">
                    <span className="font-black text-rose-600 text-sm">✕</span>
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-[#18232D] leading-snug">
                    {language === 'gu'
                      ? 'અંતિમ તારીખ નજીક આવે ત્યારે તણાવ'
                      : language === 'hi'
                      ? 'अंतिम तिथि नजदीक आने पर भारी तनाव'
                      : 'High stress when application deadlines approach'}
                  </span>
                </div>
              </div>

            </div>

            {/* ─── CENTER: TRANSITION ARROW (1 Col) ─── */}
            <div className="lg:col-span-1 flex justify-center items-center py-2 lg:py-0">
              <div className="w-10 h-10 rounded-full bg-[#EAF6EE] text-[#159447] border border-emerald-200 flex items-center justify-center shadow-xs">
                <ArrowRight className="w-5 h-5 text-[#159447]" />
              </div>
            </div>

            {/* ─── RIGHT: FORMSEVA CARD (5 Cols) ─── */}
            <div className="lg:col-span-5 bg-gradient-to-br from-[#F0FDF4] via-[#F8FAF9] to-[#EFF6FF] border border-emerald-300/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              
              {/* Right Header */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-emerald-200 p-1 flex items-center justify-center shadow-2xs overflow-hidden">
                  <img src="/icon.png" alt="FormSeva" className="w-full h-full object-contain" />
                </div>
                <h3 className="font-black text-xl sm:text-2xl text-[#159447] tracking-tight">
                  FormSeva
                </h3>
              </div>

              {/* Right Benefits List */}
              <div className="space-y-4 pt-1 divide-y divide-emerald-100/80">
                {/* Benefit 1 */}
                <div className="flex items-center gap-3.5 pt-3 first:pt-0">
                  <div className="w-8 h-8 rounded-full bg-[#159447] text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-[#18232D] leading-snug">
                    {language === 'gu'
                      ? 'સરળ અને માર્ગદર્શિત પગલું-દર-પગલું પ્રક્રિયા'
                      : language === 'hi'
                      ? 'सरल और निर्देशित चरण-दर-चरण प्रक्रिया'
                      : 'Simple and guided step-by-step process'}
                  </span>
                </div>

                {/* Benefit 2 */}
                <div className="flex items-center gap-3.5 pt-4">
                  <div className="w-8 h-8 rounded-full bg-[#159447] text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-[#18232D] leading-snug">
                    {language === 'gu'
                      ? 'અચૂક અને વિશ્વસનીય માહિતી સાથે ફોર્મ ભરવામાં સહાય'
                      : language === 'hi'
                      ? 'सटीक और विश्वसनीय जानकारी के साथ फॉर्म भरने में सहायता'
                      : 'Assistance in filling forms with accurate & reliable information'}
                  </span>
                </div>

                {/* Benefit 3 */}
                <div className="flex items-center gap-3.5 pt-4">
                  <div className="w-8 h-8 rounded-full bg-[#159447] text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-[#18232D] leading-snug">
                    {language === 'gu'
                      ? 'કોઈપણ ફોર્મ માટે સ્પષ્ટ માર્ગદર્શન'
                      : language === 'hi'
                      ? 'किसी भी फॉर्म के लिए स्पष्ट मार्गदर्शन'
                      : 'Clear guidance for any government form'}
                  </span>
                </div>

                {/* Benefit 4 */}
                <div className="flex items-center gap-3.5 pt-4">
                  <div className="w-8 h-8 rounded-full bg-[#159447] text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-[#18232D] leading-snug">
                    {language === 'gu'
                      ? 'ઝડપી, સરળ અને તણાવમુક્ત અનુભવ'
                      : language === 'hi'
                      ? 'तेज, आसान और तनावमुक्त अनुभव'
                      : 'Fast, easy and stress-free experience'}
                  </span>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ─── FACTS VS MYTHS (CITIZEN AWARENESS & ACCURACY) ─── */}
      <section className="bg-slate-50/70 py-16 sm:py-20 border-t border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100/80 border border-amber-200 text-amber-900 text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              {language === 'gu' ? 'નાગરિક જાગૃતિ માર્ગદર્શિકા' : language === 'hi' ? 'नागरिक जागरूकता गाइड' : 'Citizen Awareness Guide'}
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-[#18232D] tracking-tight">
              {language === 'gu'
                ? 'સાચી હકીકત VS સામાન્ય ગેરમાન્યતાઓ'
                : language === 'hi'
                ? 'सरकारी सच VS सामान्य भ्रांतियां'
                : 'Official Facts VS Common Myths'}
            </h2>
            <p className="text-sm sm:text-base text-[#5B6470] mt-2 max-w-2xl mx-auto font-medium">
              {language === 'gu'
                ? 'ગુજરાત સરકારના સત્તાવાર પરિપત્રો અને નિયમો આધારિત સાચી માહિતી — અફવાઓથી બચો અને સાચો લાભ મેળવો.'
                : language === 'hi'
                ? 'गुजरात सरकार के आधिकारिक नियमों पर आधारित सही जानकारी — भ्रांतियों से बचें।'
                : 'Verified information based on official Gujarat Government regulations — stay informed.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {forms.map((f) => (
              <div
                key={f.slug}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col overflow-hidden group"
              >
                {/* Header */}
                <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-slate-50/50 to-white flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-govt-50 text-govt-700 flex items-center justify-center font-bold text-sm shrink-0">
                      <FormIcon slug={f.slug} className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 line-clamp-1">{getTitle(f)}</h3>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{getDept(f)}</p>
                    </div>
                  </div>
                  <Link
                    href={`/forms/${f.slug}`}
                    className="text-xs font-bold text-govt-700 hover:text-govt-800 flex items-center gap-0.5 shrink-0"
                  >
                    {language === 'gu' ? 'ફોર્મ' : 'Apply'} <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* Myth Card */}
                <div className="p-5 bg-rose-50/40 border-b border-slate-100 flex-1">
                  <div className="flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                      <XCircle className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-rose-600 block mb-1">
                        {language === 'gu' ? 'ગેરમાન્યતા (Myth)' : 'Common Myth'}
                      </span>
                      <p className="text-xs text-slate-700 font-medium leading-relaxed">
                        {language === 'gu' ? f.myth_gu : f.myth_en || f.myth_gu}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Fact Card */}
                <div className="p-5 bg-emerald-50/40 flex-1">
                  <div className="flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 block mb-1">
                        {language === 'gu' ? 'અધિકૃત સાચી હકીકત (Official Fact)' : 'Official Fact'}
                      </span>
                      <p className="text-xs text-slate-900 font-bold leading-relaxed">
                        {language === 'gu' ? f.fact_gu : f.fact_en || f.fact_gu}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 scroll-mt-20">
        <h2 className="text-3xl font-extrabold text-center text-slate-900 mb-12">
          {language === 'gu' ? 'ફક્ત ૩ સ્ટેપ — ઘરે બેઠા' : language === 'hi' ? 'सिर्फ 3 स्टेप — घर से' : 'How It Works — 3 Easy Steps'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              step: '01',
              icon: FileText,
              title: language === 'gu' ? 'ફોર્મ ભરો' : language === 'hi' ? 'फॉर्म भरें' : 'Fill the Form',
              desc: language === 'gu'
                ? 'ઓનલાઈન ગાઈડ ફ્લો — માત્ર ૧૦ મિનિટ — ગુજરાતી, હિન્દી અથવા English માં'
                : language === 'hi'
                ? 'ऑनलाइन गाइडेड फॉर्म — सिर्फ 10 मिनट — हिंदी/Gujarati/English में'
                : 'Online guided form — just 10 minutes — in Gujarati, Hindi or English',
            },
            {
              step: '02',
              icon: Users,
              title: language === 'gu' ? 'ઓપરેટર ફાઈલ કરે' : language === 'hi' ? 'ऑपरेटर फाइल करता है' : 'Operator Files',
              desc: language === 'gu'
                ? 'સ્ક્રીન-ટ્રેઈન્ડ ઓપરેટર ડિજિટલ ગુજરાત / eSewa પોર્ટલ પર ભૂલ-રહિત ફોર્મ ભરે'
                : language === 'hi'
                ? 'प्रशिक्षित ऑपरेटर Digital Gujarat/eSewa पोर्टल पर सटीक फॉर्म भरते हैं'
                : 'Trained operator fills your form accurately on Digital Gujarat / eSewa portal',
            },
            {
              step: '03',
              icon: Award,
              title: language === 'gu' ? 'પ્રમાણપત્ર ડાઉનલોડ' : language === 'hi' ? 'પ્રમાણ પત્ર ડાઉનલોડ' : 'Download Certificate',
              desc: language === 'gu'
                ? 'અરજી મંજૂર થાય ત્યારે SMS/WhatsApp નોટિફિકેશન — ડાઉનલોડ PDF'
                : language === 'hi'
                ? 'स्वीकृति पर SMS/WhatsApp सूचना — PDF डाउनलोड करें'
                : 'Get notified via SMS/WhatsApp on approval — download official PDF',
            },
          ].map(({ step, icon: Icon, title, desc }) => (
            <div key={step} className="relative group">
              <div className="absolute -top-2 -left-2 text-7xl font-black text-slate-100 select-none leading-none group-hover:text-blue-100 transition-colors">
                {step}
              </div>
              <div className="relative bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all">
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 mb-2">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── DPDP NOTICE ─── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-govt-50 border border-govt-200 rounded-2xl p-6 flex gap-4 shadow-sm">
          <ShieldCheck className="w-8 h-8 text-govt-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-govt-900 mb-1">
              {language === 'gu' ? 'ડેટા સુરક્ષા (DPDP Act 2023)' : language === 'hi' ? 'डेटा सुरक्षा (DPDP Act 2023)' : 'Privacy & Data Security (DPDP Act 2023)'}
            </h3>
            <p className="text-sm text-govt-800 leading-relaxed">{t.dpdpNotice}</p>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
