import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useLanguage } from '@/i18n/LanguageContext';
import { ApiService } from '@/lib/api';
import { CertificateForm, FormSubmission } from '@/lib/types';
import { FormIcon } from '@/components/FormIcon';
import {
  Search, Clock, ChevronRight, Activity, ArrowRight,
  Sparkles, CheckCircle2, ShieldCheck, FileText,
  Users, Edit3, PlayCircle, Award, Check
} from 'lucide-react';

export default function HomePage() {
  const { t, language } = useLanguage();
  const [forms, setForms] = useState<CertificateForm[]>([]);
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentUser, setCurrentUser] = useState<any>(null);

  const loadData = async () => {
    try {
      const user = ApiService.getCurrentUser();
      setCurrentUser(user);
      const formsData = await ApiService.getForms();
      setForms(formsData);

      if (user) {
        const subsData = await ApiService.getMySubmissions();
        setSubmissions(subsData);
      }
    } catch (e) {
      console.error('Error loading dashboard data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleUpdate = () => {
      loadData();
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

  // Active submission requiring attention (or latest in progress)
  const activeSubmission = submissions.find(
    s => s.status !== 'approved' && s.status !== 'rejected'
  ) || (submissions.length > 0 ? submissions[0] : null);

  // Categories extraction
  const categories = [
    { id: 'all', label_gu: 'બધા (All)', label_hi: 'सभी (All)', label_en: 'All Services' },
    { id: 'revenue', label_gu: 'મહેસૂલ અને પ્રમાણપત્રો', label_hi: 'राजस्व व प्रमाण पत्र', label_en: 'Revenue & Certificates' },
    { id: 'land', label_gu: 'જમીન / ૭-૧૨', label_hi: 'भूमि / 7-12', label_en: 'Land Records' },
    { id: 'education', label_gu: 'પરીક્ષા / એડમિશન', label_hi: 'परीक्षा / प्रवेश', label_en: 'Exams & Admissions' },
    { id: 'transport', label_gu: 'વાહન વ્યવહાર', label_hi: 'परिवहन सेवा', label_en: 'Transport' },
  ];

  const filteredForms = forms.filter(f => {
    if (!f.is_active) return false;
    const title = getTitle(f).toLowerCase();
    const dept = getDept(f).toLowerCase();
    const slug = f.slug.toLowerCase();
    const matchesSearch = title.includes(searchQuery.toLowerCase()) ||
                          dept.includes(searchQuery.toLowerCase()) ||
                          slug.includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'revenue') return f.slug.includes('certificate') || f.slug.includes('creamy') || f.slug.includes('income');
    if (selectedCategory === 'land') return f.slug.includes('land') || f.slug.includes('7-12');
    if (selectedCategory === 'education') return f.slug.includes('neet') || f.slug.includes('exam');
    if (selectedCategory === 'transport') return f.slug.includes('licence') || f.slug.includes('driving');
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Head>
        <title>FormSeva Gujarat — Government Certificate Assisted-Filing Portal</title>
        <meta
          name="description"
          content="Apply for Gujarat government certificates (Income, EWS, 7/12, Non-Creamy Layer, Driving Licence) online with certified operator assistance."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>

      <Navbar />

      {/* ─── HERO BANNER (PURE COLOR GRAPHIC) ─── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#F8FAF9] via-[#F3F8F5] to-slate-50 pt-6 sm:pt-10 pb-8 sm:pb-12 border-b border-slate-200/80">
        {/* Subtle background decorative glows */}
        <div className="absolute top-0 right-0 w-80 sm:w-96 h-80 sm:h-96 bg-emerald-100/50 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-4 left-4 w-60 sm:w-72 h-60 sm:h-72 bg-emerald-50/60 rounded-full blur-2xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
            
            {/* Left Column: Headline & Action */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-6 text-left">
              {/* Brand Tagline Pill */}
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white flex items-center justify-center p-1 shadow-2xs border border-slate-200 shrink-0">
                  <img src="/icon.png" alt="FormSeva" className="w-full h-full object-contain" />
                </div>
                <div>
                  <div className="font-black text-xl sm:text-2xl text-[#18232D] tracking-tight leading-none">
                    Form<span className="text-[#159447]">Seva</span>
                  </div>
                  <div className="text-[9px] sm:text-[10px] font-bold text-[#5B6470] tracking-widest uppercase mt-0.5">
                    — FILL · SUBMIT · DONE —
                  </div>
                </div>
              </div>

              {/* Main Headline */}
              <h1 className="text-2xl sm:text-4xl lg:text-[44px] font-black text-[#18232D] leading-[1.2] tracking-tight">
                {language === 'gu' ? (
                  <>
                    તમારા સરકારી ફોર્મ્સ,
                    <span className="text-[#159447] block mt-1">હવે સરળ અને ઝંઝટ-મુક્ત</span>
                  </>
                ) : language === 'hi' ? (
                  <>
                    आपके सरकारी फॉर्म,
                    <span className="text-[#159447] block mt-1">अब सरल और झंझट-मुक्त</span>
                  </>
                ) : (
                  <>
                    Your Government Forms,
                    <span className="text-[#159447] block mt-1">Now Simple &amp; Hassle-Free</span>
                  </>
                )}
              </h1>

              {/* Subheading */}
              <p className="text-xs sm:text-base text-[#5B6470] leading-relaxed max-w-xl">
                {language === 'gu'
                  ? 'અમે સરકારી પોર્ટલ પર તમારા ફોર્મ સચોટ, સુરક્ષિત અને ઝડપથી ભરવામાં સંપૂર્ણ સહાય કરીએ છીએ.'
                  : language === 'hi'
                  ? 'हम सरकारी पोर्टल पर आपके फॉर्म सटीक, सुरक्षित और आसानी से भरने में पूरी सहायता करते हैं।'
                  : 'We help you fill, verify and submit your Government portal forms accurately and with ease.'}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <a
                  href="#services-catalog"
                  className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-[#159447] hover:bg-[#12803c] text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg shadow-emerald-700/20 hover:scale-[1.02] transition-all"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>{language === 'gu' ? 'શરૂ કરો' : language === 'hi' ? 'શરૂ કરેં' : 'Get Started'}</span>
                </a>

                <a
                  href="#services-catalog"
                  className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-white hover:bg-slate-50 text-[#18232D] border border-slate-200 font-bold text-xs sm:text-sm shadow-2xs hover:shadow transition-all"
                >
                  <PlayCircle className="w-4 h-4 text-[#159447]" />
                  <span>{language === 'gu' ? 'સેવાઓ જુઓ' : language === 'hi' ? 'सेवाएं देखें' : 'View Services'}</span>
                </a>
              </div>
            </div>

            {/* Right Column: Modern CSS Graphic Art */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="w-full max-w-sm sm:max-w-md bg-gradient-to-br from-emerald-500 via-[#159447] to-teal-700 rounded-3xl p-5 sm:p-6 text-white shadow-xl shadow-emerald-900/10 relative overflow-hidden">
                {/* Background artistic pattern rings */}
                <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-white/10 blur-xl pointer-events-none" />
                <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-emerald-400/20 blur-lg pointer-events-none" />

                {/* Inner Graphic Card */}
                <div className="relative space-y-4">
                  {/* Top Seal Badge */}
                  <div className="flex items-center justify-between">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold border border-white/30">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-200" />
                      <span>Gujarat Seva Certified</span>
                    </div>
                    <div className="w-8 h-8 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20">
                      <Award className="w-4 h-4 text-amber-300" />
                    </div>
                  </div>

                  {/* Certificate graphic card mockup */}
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-semibold text-emerald-100">
                      <span>Online Assisted Portal</span>
                      <span className="font-mono text-[11px] bg-white/20 px-2 py-0.5 rounded">DPDP 2023</span>
                    </div>
                    
                    <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                      <div className="w-4/5 h-full bg-amber-400 rounded-full" />
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                      <div className="flex items-center gap-1.5 text-white font-medium">
                        <Check className="w-3.5 h-3.5 text-emerald-300" />
                        <span>Fast &amp; Accurate</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-white font-medium">
                        <Check className="w-3.5 h-3.5 text-emerald-300" />
                        <span>Direct OTP Sync</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-white font-medium">
                        <Check className="w-3.5 h-3.5 text-emerald-300" />
                        <span>Revenue &amp; Land</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-white font-medium">
                        <Check className="w-3.5 h-3.5 text-emerald-300" />
                        <span>100% Secure</span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Stats Strip */}
                  <div className="flex items-center justify-between text-xs font-bold pt-1 text-emerald-100">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      Digital Gujarat &amp; AnyRoR
                    </span>
                    <span className="bg-white text-[#159447] text-[10px] px-2.5 py-0.5 rounded-full font-black">
                      ACTIVE
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── CITIZEN DASHBOARD & SERVICES CATALOG ─── */}
      <main id="services-catalog" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">

        {/* Live Active Application Banner (if user has an ongoing filing) */}
        {activeSubmission && (
          <div className="bg-white border border-emerald-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#159447] flex items-center justify-center shrink-0">
                <Activity className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    Active Application
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-700">
                    {activeSubmission.application_number}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm mt-0.5">
                  {activeSubmission.form_title_en}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              <span className="text-xs font-semibold text-slate-500 capitalize">
                Status: <strong className="text-slate-800">{activeSubmission.status.replace(/_/g, ' ')}</strong>
              </span>
              <Link
                href="/track"
                className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-[#159447] hover:bg-[#12803c] text-white text-xs font-bold shadow-xs transition"
              >
                <span>Track &amp; OTP</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* Search Bar & Category Filter Strip */}
        <div className="space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1 max-w-lg">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  language === 'gu'
                    ? 'પ્રમાણપત્ર અથવા સેવા શોધો (આવક, EWS, ૭/૧૨, જાતિ)...'
                    : 'Search certificates & services (Income, EWS, 7/12, NCL)...'
                }
                className="w-full pl-10 pr-4 py-2 sm:py-2.5 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium text-slate-800 shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#159447]/30 transition"
              />
            </div>

            {/* Quick Stats Pill */}
            <div className="flex items-center gap-2 self-start sm:self-auto text-xs text-slate-500 font-semibold bg-white border border-slate-200/80 px-3 py-1.5 sm:py-2 rounded-2xl shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#159447]" />
              <span>{forms.length} Gujarat Services Live</span>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              const label = language === 'gu' ? cat.label_gu : language === 'hi' ? cat.label_hi : cat.label_en;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-[#159447] text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Services Grid (Mobile & Desktop Responsive) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filteredForms.map((form) => (
            <div
              key={form.id || form.slug}
              className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-sm hover:border-[#159447]/40 transition-all flex flex-col justify-between group"
            >
              <div className="space-y-2.5 sm:space-y-3">
                {/* Header: Icon & Dept */}
                <div className="flex items-start justify-between gap-3">
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 group-hover:bg-emerald-50/50 group-hover:border-emerald-200/60 transition shrink-0">
                    <FormIcon slug={form.slug} size="md" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100 truncate max-w-[150px]">
                    {form.slug.replace(/_/g, ' ')}
                  </span>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-[#159447] transition-colors leading-snug">
                    {getTitle(form)}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {getDesc(form)}
                  </p>
                </div>
              </div>

              {/* Bottom Meta & Action */}
              <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5 sm:gap-3 text-slate-500">
                  <span className="flex items-center gap-1 font-semibold text-slate-600">
                    <Clock className="w-3 h-3 text-amber-500" />
                    {form.turnaround_days}d
                  </span>
                  <span className="font-bold text-slate-900 font-mono">
                    ₹{form.official_fee + form.service_fee}
                  </span>
                </div>

                <Link
                  href={`/forms/${form.slug}`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#159447] hover:bg-[#12803c] text-white text-xs font-bold shadow-2xs transition"
                >
                  <span>Apply</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {filteredForms.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400 text-xs">
            No services found matching "{searchQuery}".
          </div>
        )}

      </main>

      {/* ─── SITE FOOTER ─── */}
      <Footer />
    </div>
  );
}
