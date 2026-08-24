'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '../i18n/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ApiService } from '../lib/api';
import { ShieldCheck, UserCheck, Menu, X, LogIn, ArrowRight } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { t, language } = useLanguage();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    setCurrentUser(ApiService.getCurrentUser());
  }, [pathname]);

  const navLinks = [
    { href: '/', label: language === 'gu' ? 'HOME' : language === 'hi' ? 'HOME' : 'HOME' },
    { href: '/forms', label: language === 'gu' ? 'FORMS' : language === 'hi' ? 'FORMS' : 'FORMS' },
    { href: '/rates', label: language === 'gu' ? 'RATES' : language === 'hi' ? 'RATES' : 'RATES' },
    { href: '/track', label: language === 'gu' ? 'TRACK' : language === 'hi' ? 'TRACK' : 'TRACK' },
    { href: '/about', label: language === 'gu' ? 'ABOUT' : language === 'hi' ? 'ABOUT' : 'ABOUT' },
    { href: '/feedback', label: language === 'gu' ? 'FEEDBACK' : language === 'hi' ? 'FEEDBACK' : 'FEEDBACK' },
    { href: '/help', label: language === 'gu' ? 'HELP' : language === 'hi' ? 'HELP' : 'HELP' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
      {/* Top Gujarat Government / Digital India Header Strip */}
      <div className="bg-[#18232D] text-slate-200 text-[11px] py-1.5 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[#159447] animate-pulse"></span>
            <span className="font-medium text-slate-300">
              {language === 'gu'
                ? 'ગુજરાત સરકાર નાગરિક સેવા સહાયતા પોર્ટલ • ડિજિટલ ગુજરાત આધારિત'
                : language === 'hi'
                ? 'गुजरात सरकार नागरिक सेवा सहायता पोर्टल • डिजिटल गुजरात अनुरूप'
                : 'Government of Gujarat Citizen Services Assisted Portal • Digital Gujarat Assisted'}
            </span>
          </div>
          <div className="hidden md:flex items-center gap-4 text-slate-300">
            <Link href="/operator" className="hover:text-white transition-colors flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>{t.navOperator}</span>
            </Link>
            <span className="text-slate-600">|</span>
            <Link href="/admin" className="hover:text-white transition-colors flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>{t.navAdmin}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Nav (Poseidon Clean Minimalist Style) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          
          {/* Logo & Emblem */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white flex items-center justify-center shadow-xs border border-slate-200 p-1 group-hover:scale-105 transition-transform overflow-hidden">
              <img
                src="/icon.png"
                alt="FormSeva"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <span className="font-black text-2xl sm:text-3xl text-[#18232D] tracking-tight leading-none">
                Form<span className="text-[#159447]">Seva</span>
              </span>
              <p className="text-[9px] text-[#5B6470] font-bold tracking-widest uppercase hidden sm:block mt-0.5">
                FILL · SUBMIT · DONE
              </p>
            </div>
          </Link>

          {/* Center Navigation Links (Uppercase, Spaced, Subtle Hover) */}
          <nav className="hidden md:flex items-center gap-5 lg:gap-7">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-xs font-bold tracking-wider transition-colors ${
                    isActive
                      ? 'text-[#159447]'
                      : 'text-[#18232D] hover:text-[#159447]'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Actions: Language Switcher & Single Login Pill Button */}
          <div className="flex items-center gap-3">
            <LanguageSwitcher />

            {/* Single Clean Login / User Profile Pill Button */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/track"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-bold bg-[#EAF6EE] text-[#159447] border border-emerald-200 shadow-2xs hover:bg-emerald-100/60 transition-all"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span className="max-w-[120px] truncate">{currentUser.full_name || currentUser.email}</span>
                </Link>
                <button
                  onClick={() => {
                    ApiService.logout();
                    setCurrentUser(null);
                  }}
                  className="text-xs font-semibold text-[#5B6470] hover:text-red-600 px-2 py-1 transition"
                  title="Logout"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className={`inline-flex items-center justify-center gap-1.5 px-5 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-bold transition-all shadow-sm hover:shadow ${
                  pathname === '/login'
                    ? 'bg-[#12803c] text-white'
                    : 'bg-[#159447] hover:bg-[#12803c] text-white'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{language === 'gu' ? 'લોગિન' : language === 'hi' ? 'लॉगिन' : 'Login'}</span>
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 pt-3 pb-6 space-y-2 shadow-lg">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2.5 rounded-lg text-sm font-bold tracking-wide ${
                  isActive ? 'bg-emerald-50 text-[#159447]' : 'text-[#18232D] hover:bg-slate-50'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            {currentUser ? (
              <div className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-xl">
                <span className="text-xs font-bold text-[#18232D]">{currentUser.full_name || currentUser.email}</span>
                <button
                  onClick={() => {
                    ApiService.logout();
                    setCurrentUser(null);
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs font-bold text-red-600"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2.5 rounded-full text-sm font-bold text-white bg-[#159447] flex items-center justify-center gap-1.5"
              >
                <LogIn className="w-4 h-4" />
                <span>{language === 'gu' ? 'લોગિન' : language === 'hi' ? 'लॉगिन' : 'Login'}</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
