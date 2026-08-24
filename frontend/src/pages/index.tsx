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
  Sparkles, CheckCircle2, ShieldCheck, FileText, AlertCircle,
  Users, Edit3, PlayCircle
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
      </Head>

      <Navbar />

      {/* ─── HERO BANNER AT TOP ─── */}
      <section className="relative overflow-hidden bg-[#F8FAF9] pt-8 sm:pt-12 pb-12 sm:pb-16 border-b border-slate-200/80">
        {/* Subtle background glow effect */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-72 h-72 bg-emerald-50/50 rounded-full blur-2xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Two-Column Hero Grid (Left 50% / Right 50%) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center pt-2 sm:pt-4">
            
            {/* Left Column: FormSeva Branding, Headline, Description, and CTAs */}
            <div className="lg:col-span-6 space-y-6 text-left">
              {/* Logo & Tagline */}
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-white flex items-center justify-center p-1.5 shadow-xs border border-slate-200">
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
                <a
                  href="#services-catalog"
                  className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-[#159447] hover:bg-[#12803c] text-white font-bold text-base shadow-md hover:shadow-lg shadow-emerald-700/25 hover:scale-[1.02] transition-all"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>{language === 'gu' ? 'શરૂ કરો' : language === 'hi' ? 'शुरू करें' : 'Get Started'}</span>
                </a>

                <a
                  href="#services-catalog"
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-[#18232D] border border-slate-200 font-bold text-base shadow-xs hover:shadow transition-all"
                >
                  <PlayCircle className="w-5 h-5 text-[#159447]" />
                  <span>{language === 'gu' ? 'સેવાઓ જુઓ' : language === 'hi' ? 'सेवाएं देखें' : 'View Services'}</span>
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
          <div className="mt-12 sm:mt-14 bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200/80">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
              
              {/* Pillar 1 */}
              <a href="#services-catalog" className="pt-4 sm:pt-0 sm:px-4 first:pl-0 group block transition-all">
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
              </a>

              {/* Pillar 2 */}
              <a href="#services-catalog" className="pt-4 sm:pt-0 sm:px-4 group block transition-all">
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
              </a>

              {/* Pillar 3 */}
              <Link href="/about" className="pt-4 sm:pt-0 sm:px-4 group block transition-all">
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

          {/* ─── TRUST BADGE STRIP ─── */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#18232D] bg-white/90 border border-slate-200 px-5 py-2 rounded-full shadow-xs">
              <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#159447] text-white flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />
              </div>
              <span>
                {language === 'gu'
                  ? 'ગુજરાતભરના હજારો નાગરિકો દ્વારા વિશ્વસનીય • DPDP Act 2023 સુસંગત'
                  : language === 'hi'
                  ? 'गुजरात के हजारों नागरिकों द्वारा विश्वसनीय • DPDP Act 2023 अनुरूप'
                  : 'Trusted by Thousands of Citizens Across Gujarat • DPDP Act 2023 Compliant'}
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* ─── CITIZEN DASHBOARD & SERVICES CATALOG ─── */}
      <main id="services-catalog" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

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
        <div className="space-y-4">
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
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium text-slate-800 shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#159447]/30 transition"
              />
            </div>

            {/* Quick Stats Pill */}
            <div className="flex items-center gap-2 self-start sm:self-auto text-xs text-slate-500 font-semibold bg-white border border-slate-200/80 px-3.5 py-2 rounded-2xl shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#159447]" />
              <span>{forms.length} Certified Gujarat Services Live</span>
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
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
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

        {/* Services Grid (High Density App Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredForms.map((form) => (
            <div
              key={form.id || form.slug}
              className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-sm hover:border-[#159447]/40 transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3">
                {/* Header: Icon & Dept */}
                <div className="flex items-start justify-between gap-3">
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 group-hover:bg-emerald-50/50 group-hover:border-emerald-200/60 transition">
                    <FormIcon slug={form.slug} size="md" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                    {form.slug.replace(/_/g, ' ')}
                  </span>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="font-bold text-slate-900 text-base group-hover:text-[#159447] transition-colors leading-snug">
                    {getTitle(form)}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {getDesc(form)}
                  </p>
                </div>
              </div>

              {/* Bottom Meta & Action */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3 text-slate-500">
                  <span className="flex items-center gap-1 font-semibold text-slate-600">
                    <Clock className="w-3 h-3 text-amber-500" />
                    {form.turnaround_days} Days
                  </span>
                  <span className="font-bold text-slate-900 font-mono">
                    ₹{form.official_fee + form.service_fee}
                  </span>
                </div>

                <Link
                  href={`/forms/${form.slug}`}
                  className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-[#159447] hover:bg-[#12803c] text-white text-xs font-bold shadow-2xs transition"
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
