import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ApiService, mockDemoUsers } from '@/lib/api';
import { useLanguage } from '@/i18n/LanguageContext';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import {
  Loader2,
  AlertCircle,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  FileText,
  ArrowLeft,
  Mail,
  KeyRound,
  Eye,
  EyeOff,
  Sparkles
} from 'lucide-react';

export default function LoginPage() {
  const { t, language } = useLanguage();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  const getPlaceholder = (en: string, gu: string, hi: string) => {
    return language === 'gu' ? gu : language === 'hi' ? hi : en;
  };

  // Direct 1-Click Google / Gmail Sign In
  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError('');
    try {
      await new Promise(res => setTimeout(res, 500));
      const googleUserEmail = 'citizen.user@gmail.com';
      await ApiService.login(
        googleUserEmail,
        'google-oauth-token',
        'Citizen User (Google)',
        '9876543210'
      );
      router.push('/');
    } catch (err) {
      setError(
        language === 'gu'
          ? 'Google લોગિન નિષ્ફળ ગયું'
          : language === 'hi'
          ? 'Google लॉगिन विफल रहा'
          : 'Google sign-in failed. Please try again.'
      );
    } finally {
      setGoogleLoading(false);
    }
  };

  // Manual Email & Password Sign In
  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError(
        language === 'gu'
          ? 'કૃપા કરીને ઇમેઇલ અથવા મોબાઇલ નંબર દાખલ કરો'
          : language === 'hi'
          ? 'कृपया ईमेल या मोबाइल नंबर दर्ज करें'
          : 'Please enter your email or mobile number'
      );
      return;
    }
    setLoading(true);
    setError('');
    try {
      await ApiService.login(email, password || 'password123', email.split('@')[0], '9999999999');
      router.push('/');
    } catch (e) {
      setError(
        language === 'gu'
          ? 'લોગિન નિષ્ફળ ગયું — કૃપા કરીને વિગતો તપાસો'
          : language === 'hi'
          ? 'लॉगिन विफल रहा — कृपया विवरण जांचें'
          : 'Login failed — please check your credentials'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>
          {getPlaceholder(
            'Citizen Login – FormSeva Gujarat',
            'નાગરિક લોગિન – FormSeva Gujarat',
            'नागरिक लॉगिन – FormSeva Gujarat'
          )}
        </title>
        <meta
          name="description"
          content="Fast and secure citizen login to FormSeva Gujarat government certificate portal"
        />
      </Head>

      {/* Viewport Locked Page: Zero Scrollbar on Desktop */}
      <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-[#F7FAF8] flex flex-col justify-between">
        
        {/* Top Header Bar */}
        <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between shrink-0">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[#5B6470] hover:text-[#159447] transition-colors text-xs sm:text-sm font-semibold group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>{getPlaceholder('Back to Home', 'હોમ પેજ પર પાછા જાઓ', 'होम पर वापस')}</span>
          </Link>

          <div className="flex items-center gap-3">
            <LanguageSwitcher />
          </div>
        </header>

        {/* Main Content Area (Vertically Centered) */}
        <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex items-center py-2 sm:py-4">
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
            
            {/* ─── LEFT SIDE: BRAND & TRUST PANEL (~50% width) ─── */}
            <div className="lg:col-span-6 space-y-4 lg:space-y-5 pr-0 lg:pr-4 text-left">
              
              {/* FormSeva Logo & Tagline */}
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center p-1.5 shadow-2xs border border-slate-200 shrink-0">
                  <img
                    src="/icon.png"
                    alt="FormSeva"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <div className="font-black text-2xl sm:text-3xl text-[#18232D] tracking-tight leading-none">
                    Form<span className="text-[#159447]">Seva</span>
                  </div>
                  <div className="text-[9px] sm:text-[10px] font-bold text-[#5B6470] tracking-widest uppercase mt-0.5">
                    — FILL · SUBMIT · DONE —
                  </div>
                </div>
              </div>

              {/* Main Headline & Subtitle */}
              <div className="space-y-1.5">
                <h1 className="text-2xl sm:text-3xl lg:text-[32px] font-black text-[#18232D] leading-tight tracking-tight">
                  {language === 'gu' ? (
                    <>
                      સરકારી ફોર્મ્સ,{' '}
                      <span className="text-[#159447]">હવે સરળ અને સુલભ.</span>
                    </>
                  ) : language === 'hi' ? (
                    <>
                      सरकारी फॉर्म,{' '}
                      <span className="text-[#159447]">अब सरल और सुलभ।</span>
                    </>
                  ) : (
                    <>
                      Government Forms,{' '}
                      <span className="text-[#159447]">Made Simple.</span>
                    </>
                  )}
                </h1>
                <p className="text-xs sm:text-sm text-[#5B6470] leading-relaxed max-w-lg">
                  {language === 'gu'
                    ? 'તમારા ગુજરાત સરકારના ફોર્મ ઝડપથી, સચોટ અને સુરક્ષિત રીતે ભરવા સંપૂર્ણ સહાય મેળવો.'
                    : language === 'hi'
                    ? 'अपने गुजरात सरकार के फॉर्म तेजी से, सटीक और सुरक्षित रूप से भरने में पूरी सहायता प्राप्त करें।'
                    : 'Get assistance with filling, verifying and submitting your Gujarat Government forms — quickly & securely.'}
                </p>
              </div>

              {/* 3 Compact Value Benefit Cards */}
              <div className="space-y-2.5">
                {/* Benefit 1 */}
                <div className="flex items-center gap-3 bg-white/80 backdrop-blur-xs p-2.5 sm:p-3 rounded-xl border border-slate-200/70 shadow-2xs">
                  <div className="w-8 h-8 rounded-lg bg-[#EAF6EE] text-[#159447] flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs sm:text-sm text-[#18232D] leading-tight">
                      {language === 'gu' ? 'સરળ માર્ગદર્શિત પ્રક્રિયા' : language === 'hi' ? 'सरल निर्देशित प्रक्रिया' : 'Simple Guided Process'}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-[#5B6470] mt-0.5 leading-snug">
                      {language === 'gu'
                        ? 'સ્ટેપ-બાય-સ્ટેપ સહાયતા સાથે તમારા સરકારી ફોર્મ ભરો.'
                        : language === 'hi'
                        ? 'चरण-दर-चरण सहायता के साथ अपने सरकारी फॉर्म भरें।'
                        : 'Fill your government forms with step-by-step assistance.'}
                    </p>
                  </div>
                </div>

                {/* Benefit 2 */}
                <div className="flex items-center gap-3 bg-white/80 backdrop-blur-xs p-2.5 sm:p-3 rounded-xl border border-slate-200/70 shadow-2xs">
                  <div className="w-8 h-8 rounded-lg bg-[#EAF6EE] text-[#159447] flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs sm:text-sm text-[#18232D] leading-tight">
                      {language === 'gu' ? 'સુરક્ષિત અને વિશ્વસનીય' : language === 'hi' ? 'सुरक्षित व विश्वसनीय' : 'Secure & Reliable'}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-[#5B6470] mt-0.5 leading-snug">
                      {language === 'gu'
                        ? 'DPDP Act 2023 મુજબ તમારી માહિતી સંપૂર્ણ સુરક્ષિત રહે છે.'
                        : language === 'hi'
                        ? 'DPDP Act 2023 के तहत आपकी जानकारी पूरी तरह सुरक्षित रहती है।'
                        : 'Your application information is handled securely with DPDP Act 2023.'}
                    </p>
                  </div>
                </div>

                {/* Benefit 3 */}
                <div className="flex items-center gap-3 bg-white/80 backdrop-blur-xs p-2.5 sm:p-3 rounded-xl border border-slate-200/70 shadow-2xs">
                  <div className="w-8 h-8 rounded-lg bg-[#EAF6EE] text-[#159447] flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs sm:text-sm text-[#18232D] leading-tight">
                      {language === 'gu' ? 'અરજી ટ્રૅક અને ડાઉનલોડ' : language === 'hi' ? 'आवेदन ट्रैक व डाउनलोड' : 'Track Your Application'}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-[#5B6470] mt-0.5 leading-snug">
                      {language === 'gu'
                        ? 'સબમિટ કરેલી અરજીઓ સરળતાથી ટ્રૅક કરો અને દસ્તાવેજો ડાઉનલોડ કરો.'
                        : language === 'hi'
                        ? 'जमा किए गए आवेदनों को आसानी से ट्रैक करें और दस्तावेज़ डाउनलोड करें।'
                        : 'Easily track submitted applications and download official documents.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Trust Badge Strip */}
              <div className="pt-1 flex items-center gap-2 text-xs font-semibold text-[#5B6470]">
                <div className="w-4 h-4 rounded-full bg-[#159447] text-white flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3 h-3 text-white" />
                </div>
                <span>
                  {language === 'gu'
                    ? 'ડિજિટલ ગુજરાત સહાયિત પોર્ટલ • DPDP Act 2023 સુસંગત'
                    : language === 'hi'
                    ? 'डिजिटल गुजरात समर्थित पोर्टल • DPDP Act 2023 अनुरूप'
                    : 'Digital Gujarat Assisted Portal • DPDP Act 2023 Compliant'}
                </span>
              </div>

            </div>

            {/* ─── RIGHT SIDE: CLEAN WHITE LOGIN CARD (~45% width) ─── */}
            <div className="lg:col-span-6 flex justify-center lg:justify-end">
              <div className="w-full max-w-[420px] bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-xs border border-slate-200/80 space-y-4">
                
                {/* Header */}
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#159447] bg-[#EAF6EE] border border-emerald-200/80 px-2.5 py-0.5 rounded-full inline-block mb-1.5">
                    {getPlaceholder('CITIZEN ACCESS', 'નાગરિક પોર્ટલ', 'नागरिक पोर्टल')}
                  </span>
                  
                  <h2 className="text-xl sm:text-2xl font-black text-[#18232D] tracking-tight">
                    {getPlaceholder('Welcome to FormSeva', 'FormSeva માં સ્વાગત છે', 'FormSeva में स्वागत है')}
                  </h2>
                  
                  <p className="text-xs text-[#5B6470] mt-1 leading-snug">
                    {getPlaceholder(
                      'Sign in to track forms, upload documents, and download certificates.',
                      'તમારી અરજીઓ ટ્રૅક કરવા અને પ્રમાણપત્ર ડાઉનલોડ કરવા લોગિન કરો.',
                      'अपने आवेदन ट्रैक करने और प्रमाण पत्र डाउनलोड करने हेतु लॉगिन करें।'
                    )}
                  </p>
                </div>

                {/* Error Alert Box */}
                {error && (
                  <div className="flex items-center gap-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg p-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>{error}</span>
                  </div>
                )}

                {/* 1-Click Google / Gmail Button */}
                <div>
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={googleLoading || loading}
                    className="w-full flex items-center justify-center gap-2.5 py-2.5 px-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-[#18232D] font-bold text-xs sm:text-sm shadow-2xs hover:border-slate-400 transition-all disabled:opacity-60 group"
                  >
                    {googleLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-[#159447]" />
                    ) : (
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                    )}
                    <span>
                      {getPlaceholder(
                        'Continue with Google',
                        'Google દ્વારા આગળ વધો',
                        'Google से आगे बढ़ें'
                      )}
                    </span>
                  </button>
                </div>

                {/* Minimal Divider */}
                <div className="relative flex items-center justify-center my-1">
                  <div className="border-t border-slate-200 w-full" />
                  <span className="bg-white px-2.5 text-[10px] uppercase text-[#5B6470] font-bold tracking-wider absolute">
                    {getPlaceholder('OR WITH EMAIL', 'અથવા ઇમેઇલ', 'या ईमेल')}
                  </span>
                </div>

                {/* Manual Login Form */}
                <form onSubmit={handleManualLogin} className="space-y-3">
                  {/* Email / Mobile Field */}
                  <div>
                    <label htmlFor="email" className="block text-[11px] font-bold text-[#18232D] uppercase tracking-wider mb-1">
                      {getPlaceholder('Email / Mobile Number', 'ઇમેલ / મોબાઇલ નંબર', 'ईमेल / मोबाइल नंबर')}
                    </label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-[#5B6470] absolute left-3 top-3 pointer-events-none" />
                      <input
                        id="email"
                        type="text"
                        required
                        placeholder="name@example.com / 9876543210"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-[#18232D] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#159447]/30 focus:border-[#159447] transition bg-white"
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label htmlFor="password" className="block text-[11px] font-bold text-[#18232D] uppercase tracking-wider">
                        {getPlaceholder('Password', 'પાસવર્ડ', 'पासवर्ड')}
                      </label>
                      <span className="text-[11px] font-semibold text-[#159447] hover:underline cursor-pointer">
                        {getPlaceholder('Forgot?', 'ભૂલી ગયા?', 'भूल गए?')}
                      </span>
                    </div>
                    <div className="relative">
                      <KeyRound className="w-3.5 h-3.5 text-[#5B6470] absolute left-3 top-3 pointer-events-none" />
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full pl-9 pr-9 py-2 rounded-xl border border-slate-300 text-[#18232D] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#159447]/30 focus:border-[#159447] transition bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-[#5B6470] hover:text-[#18232D] focus:outline-none"
                        aria-label="Toggle password visibility"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Primary Sign In Button */}
                  <button
                    type="submit"
                    disabled={loading || googleLoading}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#159447] hover:bg-[#12803c] text-white font-bold py-2.5 text-xs sm:text-sm transition shadow-sm hover:shadow hover:scale-[1.01] disabled:opacity-60 mt-1"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>{getPlaceholder('Sign In', 'સાઇન ઇન', 'साइन इन')}</span>
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                {/* Quick Tip Box */}
                <div className="bg-[#EAF6EE] border border-emerald-200/80 rounded-xl p-3 text-xs text-[#18232D] flex items-start gap-2.5">
                  <span className="font-bold text-[#159447] shrink-0 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    {language === 'gu' ? 'ઝડપી ટીપ:' : language === 'hi' ? 'त्वरित टिप:' : 'Quick Tip:'}
                  </span>
                  <span className="text-[#5B6470]">
                    {getPlaceholder(
                      'Use Google login or click any Demo Citizen profile below for 1-click access.',
                      'પાસવર્ડ વગર ઝડપી એક્સેસ માટે નીચેના કોઈપણ ડેમો નાગરિક પ્રોફાઇલ પર ક્લિક કરો.',
                      'पासवर्ड के बिना त्वरित एक्सेस के लिए नीचे किसी भी डेमो नागरिक प्रोफाइल पर क्लिक करें।'
                    )}
                  </span>
                </div>

                {/* ─── 1-CLICK DEMO CITIZEN PROFILES TRAY ─── */}
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-[#5B6470] tracking-wider">
                      {language === 'gu' ? 'ડેમો નાગરિક પ્રોફાઇલ (૧-ક્લિક લોગિન)' : '1-Click Demo Citizen Profiles:'}
                    </span>
                    <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                      5 Profiles
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                    {mockDemoUsers.map(u => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => {
                          setEmail(u.email);
                          setPassword('demo1234');
                        }}
                        className="p-1.5 rounded-lg border border-slate-200 hover:border-[#159447] bg-[#F8FAF9] hover:bg-emerald-50/60 transition text-left group"
                        title={`Select ${u.full_name} (${u.district})`}
                      >
                        <div className="font-bold text-[11px] text-[#18232D] group-hover:text-[#159447] truncate">
                          {language === 'gu' ? u.full_name_gu : u.full_name}
                        </div>
                        <div className="text-[9px] text-[#5B6470] truncate">
                          {u.district} • {u.occupation.split('(')[0]}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Help & Support Footer */}
                <p className="text-center text-xs text-[#5B6470] pt-1">
                  {getPlaceholder(
                    'Need help? Citizen Helpline: 1800-233-5500 (Mon-Sat, 9 AM - 6 PM)',
                    'સહાયની જરૂર છે? નાગરિક હેલ્પલાઇન: 1800-233-5500 (સોમ-શનિ, સવારે ૯ થી સાંજે ૬)',
                    'सहायता चाहिए? नागरिक हेल्पलाइन: 1800-233-5500 (सोम-शनि, 9 AM - 6 PM)'
                  )}
                </p>

              </div>
            </div>

          </div>
        </main>

        {/* Minimal Footer Strip */}
        <footer className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-xs text-[#5B6470] border-t border-slate-200/60">
          © 2026 FormSeva Gujarat. All rights reserved. Compliant with Digital Personal Data Protection Act 2023.
        </footer>

      </div>
    </>
  );
}
