'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '../i18n/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ApiService } from '../lib/api';
import {
  ShieldCheck, UserCheck, Menu, X, LogIn, Activity,
  CreditCard, Layers, Sparkles, MessageSquare, Info
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { t, language } = useLanguage();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    setCurrentUser(ApiService.getCurrentUser());
  }, [pathname]);

  const navLinks = [
    {
      href: '/',
      label: language === 'gu' ? 'મુખ્ય પૃષ્ઠ' : language === 'hi' ? 'ડેશબોર્ડ' : 'Dashboard',
      icon: Layers
    },
    {
      href: '/track',
      label: language === 'gu' ? 'મારી અરજીઓ' : language === 'hi' ? 'आवेदन ट्रैक' : 'Track',
      icon: Activity
    },
    {
      href: '/about',
      label: language === 'gu' ? 'અમારા વિશે' : language === 'hi' ? 'हमारे बारे में' : 'About Us',
      icon: Info
    },
    {
      href: '/feedback',
      label: language === 'gu' ? 'પ્રતિસાદ' : language === 'hi' ? 'प्रतिक्रिया' : 'Feedback',
      icon: MessageSquare
    },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo & App Name */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center border border-slate-200 p-1 shadow-xs group-hover:scale-105 transition-transform overflow-hidden">
                <img
                  src="/icon.png"
                  alt="FormSeva"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-xl text-[#18232D] tracking-tight leading-none">
                  Form<span className="text-[#159447]">Seva</span>
                </span>
                <span className="text-[9px] font-bold text-emerald-700 tracking-wider uppercase">
                  Gujarat App
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Tabs */}
            <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/50">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || (link.href !== '/' && pathname?.startsWith(link.href));
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-white text-[#159447] shadow-xs'
                        : 'text-slate-600 hover:text-[#18232D] hover:bg-white/50'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2.5">
            {/* Quick Workbench Switcher */}
            <div className="hidden lg:flex items-center gap-1.5 mr-1 border-r border-slate-200 pr-3">
              <Link
                href="/operator"
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  pathname === '/operator' ? 'bg-amber-50 text-amber-700 font-bold' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
                title="Operator Workbench"
              >
                <UserCheck className="w-3.5 h-3.5 text-amber-600" />
                <span>Operator</span>
              </Link>
              <Link
                href="/admin"
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  pathname === '/admin' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
                title="Admin Dashboard"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>Admin</span>
              </Link>
            </div>

            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* User Profile / Login Pill */}
            {currentUser ? (
              <div className="flex items-center gap-1.5">
                <Link
                  href="/track"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-[#159447] border border-emerald-200 shadow-2xs hover:bg-emerald-100/70 transition-all"
                >
                  <UserCheck className="w-3.5 h-3.5 shrink-0" />
                  <span className="max-w-[100px] truncate">{currentUser.full_name || currentUser.email}</span>
                </Link>
                <button
                  onClick={() => {
                    ApiService.logout();
                    setCurrentUser(null);
                  }}
                  className="text-xs font-semibold text-slate-400 hover:text-red-600 px-2 py-1 transition"
                  title="Logout"
                >
                  Exit
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold bg-[#159447] hover:bg-[#12803c] text-white shadow-xs transition-all"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{language === 'gu' ? 'લોગિન' : language === 'hi' ? 'लॉगिन' : 'Login'}</span>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-3 space-y-1.5 shadow-lg">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/' && pathname?.startsWith(link.href));
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold ${
                  isActive ? 'bg-emerald-50 text-[#159447]' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}
          
          <div className="pt-2 mt-2 border-t border-slate-100 grid grid-cols-2 gap-2">
            <Link
              href="/operator"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-1 px-3 py-2 bg-amber-50 rounded-xl text-xs font-bold text-amber-800"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Operator</span>
            </Link>
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-1 px-3 py-2 bg-blue-50 rounded-xl text-xs font-bold text-blue-800"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
