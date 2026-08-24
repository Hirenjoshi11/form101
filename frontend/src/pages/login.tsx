import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ApiService, mockDemoUsers } from '@/lib/api';
import { useLanguage } from '@/i18n/LanguageContext';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import {
  Loader2, ArrowLeft, Mail, KeyRound, Eye, EyeOff,
  UserCheck, ShieldCheck, User, Sparkles
} from 'lucide-react';

export default function LoginPage() {
  const { language } = useLanguage();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email or mobile number');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await ApiService.login(email, password || 'password123', email.split('@')[0], '9999999999');
      router.push('/');
    } catch (e) {
      setError('Login failed — please check credentials');
    } finally {
      setLoading(false);
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

          {/* Quick 1-Click Role Switcher */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block text-center">
              1-Click Demo Login
            </span>
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

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-[10px] uppercase font-bold text-slate-400 absolute">
              or enter details
            </span>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleManualLogin} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Email or Mobile Number
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com / 98250..."
                  className="w-full min-h-[44px] pl-10 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#159447]/30"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Password
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full min-h-[44px] pl-10 pr-10 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#159447]/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-[44px] py-3 rounded-xl bg-[#159447] hover:bg-[#12803c] text-white text-xs sm:text-sm font-bold shadow-xs transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Sign In</span>
            </button>
          </form>

        </div>
      </main>

      <div className="py-4 text-center text-[11px] text-slate-400">
        © {new Date().getFullYear()} FormSeva Gujarat • Secure App Authentication
      </div>
    </div>
  );
}
