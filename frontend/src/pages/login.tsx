import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ApiService, mockDemoUsers } from '@/lib/api';
import { useLanguage } from '@/i18n/LanguageContext';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import {
  Loader2, ArrowLeft, Mail, KeyRound, Eye, EyeOff,
  UserCheck, ShieldCheck, User, Sparkles, Phone, CheckCircle2
} from 'lucide-react';

export default function LoginPage() {
  const { language } = useLanguage();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  // Mobile prompt modal for Google OAuth when phone is missing
  const [showPhonePrompt, setShowPhonePrompt] = useState(false);
  const [pendingGoogleUser, setPendingGoogleUser] = useState<{ email: string; name: string } | null>(null);
  const [phoneNumberInput, setPhoneNumberInput] = useState('');

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email or mobile number');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await ApiService.login(email, password || 'password123', email.split('@')[0], '9825044551');
      router.push('/track');
    } catch (e) {
      setError('Login failed — please check credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError('');
    try {
      // Direct Google OAuth flow simulation / endpoint integration
      const googleProfile = {
        token: `google_oauth_${Date.now()}`,
        email: 'citizen.gujarat@gmail.com',
        name: 'Rameshchandra B. Patel'
      };
      
      const user = await ApiService.googleLogin(googleProfile.token, googleProfile.email, googleProfile.name, '9825044551');
      router.push('/track');
    } catch (e) {
      setError('Google Sign-In failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleQuickDemoLogin = async (type: 'citizen' | 'operator' | 'admin') => {
    setLoading(true);
    setError('');
    try {
      if (type === 'citizen') {
        await ApiService.login('citizen@formseva.in', 'citizen', 'Rameshchandra B. Patel', '9825044551');
        router.push('/track');
      } else if (type === 'operator') {
        await ApiService.login('operator@formseva.in', 'operator', 'Vicky (Operator Ahmedabad)', '9825011223');
        router.push('/operator');
      } else if (type === 'admin') {
        await ApiService.login('admin@formseva.gujarat.gov.in', 'admin', 'Gujarat Seva Admin', '9800000001');
        router.push('/admin');
      }
    } catch (e) {
      setError('Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50">
      <Head>
        <title>Login — FormSeva Gujarat</title>
      </Head>

      {/* Top Header */}
      <header className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to App</span>
        </Link>
        <LanguageSwitcher />
      </header>

      {/* Main Login Card */}
      <main className="w-full max-w-md mx-auto px-4 py-8">
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          
          {/* Logo & Heading */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 p-1.5 mx-auto shadow-2xs">
              <img src="/icon.png" alt="FormSeva" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-xl font-black text-slate-900">
              Form<span className="text-[#159447]">Seva</span> Login
            </h1>
            <p className="text-xs text-slate-500">
              Access your Gujarat certificate filings &amp; status
            </p>
          </div>

          {/* Direct Continue with Google Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs sm:text-sm font-bold shadow-xs transition disabled:opacity-50"
          >
            {googleLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.94 0 12s.45 3.84 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
            )}
            <span>{language === 'gu' ? 'Google સાથે ચાલુ રાખો' : 'Continue with Google'}</span>
          </button>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-[10px] uppercase font-bold text-slate-400 absolute">
              or quick demo roles
            </span>
          </div>

          {/* Quick 1-Click Role Switcher */}
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('citizen')}
                className="flex flex-col items-center justify-center p-3 min-h-[64px] rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold transition shadow-2xs"
              >
                <User className="w-4 h-4 mb-1 text-emerald-700" />
                <span>Citizen</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('operator')}
                className="flex flex-col items-center justify-center p-3 min-h-[64px] rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-bold transition shadow-2xs"
              >
                <UserCheck className="w-4 h-4 mb-1 text-amber-700" />
                <span>Operator</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('admin')}
                className="flex flex-col items-center justify-center p-3 min-h-[64px] rounded-2xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 text-xs font-bold transition shadow-2xs"
              >
                <ShieldCheck className="w-4 h-4 mb-1 text-blue-700" />
                <span>Admin</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
              {error}
            </div>
          )}

          {/* Manual Email / Phone login */}
          <form onSubmit={handleManualLogin} className="space-y-3.5 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email or Mobile Number
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="e.g. 9825044551 or citizen@gmail.com"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#159447]/30"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Password (Optional for Citizen)
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-9 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#159447]/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-[#18232D] hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Sign In</span>
            </button>
          </form>

        </div>
      </main>

      <footer className="text-center py-4 text-xs text-slate-400">
        © {new Date().getFullYear()} FormSeva Gujarat • Digital Gujarat Assisted Portal
      </footer>
    </div>
  );
}
