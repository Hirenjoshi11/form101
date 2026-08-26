'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useLanguage } from '../i18n/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ApiService } from '../lib/api';
import {
  ShieldCheck, UserCheck, Menu, X, LogIn, Activity,
  Layers, Sparkles, MessageSquare, Info, Phone, Mail,
  LogOut, ChevronRight, User, ExternalLink, FileText
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { t, language } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentUser(ApiService.getCurrentUser());
  }, [pathname]);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const navLinks = [
    {
      href: '/',
      label: language === 'gu' ? 'મુખ્ય પૃષ્ઠ' : language === 'hi' ? 'डैशबोर्ड' : 'Dashboard',
      icon: Layers
    },
    {
      href: '/documents',
      label: language === 'gu' ? 'જરૂરી દસ્તાવેજો' : language === 'hi' ? 'आवश्यक दस्तावेज' : 'Documents',
      icon: FileText
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
      label: language === 'gu' ? 'પ્રતિસાદ' : language === 'hi' ? 'પ્રતિસાદ' : 'Feedback',
      icon: MessageSquare
    },
  ];

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const handleLogout = () => {
    ApiService.logout();
    setCurrentUser(null);
    setProfileDropdownOpen(false);
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
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
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Workbench Quick Switcher (Desktop) */}
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

            {/* Language Dropdown Menu */}
            <LanguageSwitcher />

            {/* User Profile Round Avatar / Login Button */}
            {currentUser ? (
              <div className="relative" ref={profileRef}>
                {/* Round Profile Avatar Button */}
                <button
                  type="button"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="relative flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-tr from-[#159447] via-emerald-600 to-teal-600 text-white font-black text-xs shadow-sm hover:shadow-md hover:scale-105 border-2 border-white ring-2 ring-emerald-600/30 transition-all focus:outline-none"
                  aria-label="User Profile and Navigation"
                  title="My Profile & Navigation"
                >
                  <span>{getInitials(currentUser.full_name || currentUser.email)}</span>
                  {/* Green online dot */}
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-white rounded-full" />
                </button>

                {/* Profile & Navigation Dropdown Menu Card */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-xl border border-slate-200/90 overflow-hidden z-50 animate-fadeIn divide-y divide-slate-100">
                    
                    {/* User Profile Card Header */}
                    <div className="p-4 bg-gradient-to-br from-slate-50 to-emerald-50/40">
                      <div className="flex items-start gap-3">
                        <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#159447] to-teal-600 text-white flex items-center justify-center font-black text-sm shadow-xs shrink-0">
                          {getInitials(currentUser.full_name || currentUser.email)}
                        </div>
                        <div className="flex-1 min-w-0 space-y-0.5">
                          <div className="flex items-center justify-between gap-1">
                            <h4 className="font-extrabold text-sm text-slate-900 truncate">
                              {currentUser.full_name || 'Gujarat Citizen'}
                            </h4>
                            <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-emerald-100 text-[#159447] shrink-0">
                              {currentUser.role || 'Citizen'}
                            </span>
                          </div>
                          
                          {/* Mobile Phone Display */}
                          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold pt-0.5">
                            <Phone className="w-3.5 h-3.5 text-[#159447] shrink-0" />
                            <span>{currentUser.phone || '+91 98250 44551'}</span>
                          </div>

                          {/* Email Display */}
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 truncate">
                            <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{currentUser.email || 'citizen@formseva.in'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Navigation Files & Routes List */}
                    <div className="p-2 space-y-0.5">
                      <div className="px-3 py-1 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                        Navigation &amp; Portals
                      </div>

                      <Link
                        href="/"
                        onClick={() => setProfileDropdownOpen(false)}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition ${
                          pathname === '/' ? 'bg-emerald-50 text-[#159447]' : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Layers className="w-4 h-4 text-[#159447]" />
                          <span>Dashboard</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                      </Link>

                      <Link
                        href="/track"
                        onClick={() => setProfileDropdownOpen(false)}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition ${
                          pathname === '/track' ? 'bg-emerald-50 text-[#159447]' : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Activity className="w-4 h-4 text-[#159447]" />
                          <span>Track Applications &amp; OTP</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                      </Link>

                      <Link
                        href="/about"
                        onClick={() => setProfileDropdownOpen(false)}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition ${
                          pathname === '/about' ? 'bg-emerald-50 text-[#159447]' : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Info className="w-4 h-4 text-[#159447]" />
                          <span>About Us &amp; 7% Pledge</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                      </Link>

                      <Link
                        href="/feedback"
                        onClick={() => setProfileDropdownOpen(false)}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition ${
                          pathname === '/feedback' ? 'bg-emerald-50 text-[#159447]' : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <MessageSquare className="w-4 h-4 text-[#159447]" />
                          <span>Citizen Feedback</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                      </Link>

                      {/* Workbenches */}
                      <div className="pt-1 mt-1 border-t border-slate-100 grid grid-cols-2 gap-1.5">
                        <Link
                          href="/operator"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-xl text-xs font-bold transition"
                        >
                          <UserCheck className="w-3.5 h-3.5 text-amber-700" />
                          <span>Operator</span>
                        </Link>
                        <Link
                          href="/admin"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 rounded-xl text-xs font-bold transition"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
                          <span>Admin</span>
                        </Link>
                      </div>
                    </div>

                    {/* Bottom Sign Out Action */}
                    <div className="p-2 bg-slate-50">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out / Switch Account</span>
                      </button>
                    </div>

                  </div>
                )}
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

            {/* Mobile Hamburger Menu Button */}
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

      {/* Mobile Drawer (When hamburger is clicked) */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-3 space-y-1.5 shadow-lg animate-fadeIn">
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
