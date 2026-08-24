'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '../i18n/LanguageContext';
import { ShieldCheck, PhoneCall, Mail, MapPin, CheckCircle2, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  const { t, language } = useLanguage();

  return (
    <footer className="bg-gradient-to-b from-[#F8FAF9] via-[#F4F9F5] to-[#EBF5EE] text-[#18232D] pt-10 sm:pt-14 pb-8 sm:pb-10 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ─── DESKTOP & MOBILE RESPONSIVE GRID ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 pb-8 sm:pb-10 border-b border-slate-200/80">
          
          {/* Col 1 (Span 4): Brand Bio & Contact */}
          <div className="lg:col-span-4 space-y-3.5 sm:space-y-4 text-left">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white flex items-center justify-center p-1 shadow-2xs border border-slate-200 shrink-0">
                <img src="/icon.png" alt="FormSeva" className="w-full h-full object-contain" />
              </div>
              <div>
                <span className="font-black text-xl sm:text-2xl text-[#18232D] tracking-tight leading-none block">
                  Form<span className="text-[#159447]">Seva</span>
                </span>
                <p className="text-[9px] text-[#5B6470] font-bold tracking-widest uppercase mt-0.5">
                  FILL · SUBMIT · DONE
                </p>
              </div>
            </div>

            <p className="text-xs text-[#5B6470] leading-relaxed max-w-sm">
              {language === 'gu'
                ? 'અમે તમારા ફોર્મ સમજવા, ભરવા, ચકાસવા અને સબમિટ કરવાની સંપૂર્ણ પ્રક્રિયા સંભાળીને તમારો સમય બચાવીએ છીએ.'
                : language === 'hi'
                ? 'हम आपके फॉर्म को समझने, भरने, सत्यापित करने और जमा करने की पूरी प्रक्रिया संभालकर आपका समय बचाते हैं।'
                : 'We save your time by handling the process of learning, filling, verifying, and submitting your forms.'}
            </p>

            {/* Direct Contact Links */}
            <div className="space-y-2 text-xs text-[#5B6470]">
              <a
                href="tel:18002335500"
                className="flex items-center gap-2 text-[#18232D] font-bold hover:text-[#159447] transition"
              >
                <div className="w-6 h-6 rounded-full bg-emerald-100/70 text-[#159447] flex items-center justify-center shrink-0">
                  <PhoneCall className="w-3.5 h-3.5" />
                </div>
                <span>+91 1800-233-5500 (Toll-Free)</span>
              </a>

              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-emerald-100/70 text-[#159447] flex items-center justify-center shrink-0">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <span>support@formseva.gujarat.in</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-emerald-100/70 text-[#159447] flex items-center justify-center shrink-0">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <span>Gandhinagar, Gujarat 382010</span>
              </div>
            </div>
          </div>

          {/* Col 2 (Span 2.5): Essential Quick Links */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-[#18232D] font-bold text-xs sm:text-sm tracking-wider uppercase">
              {language === 'gu' ? 'ઝડપી લિંક્સ' : language === 'hi' ? 'त्वरित लिंक' : 'Quick Links'}
            </h3>
            <ul className="space-y-2 text-xs text-[#5B6470]">
              <li>
                <Link href="/" className="hover:text-[#159447] transition-colors py-0.5 block">
                  {language === 'gu' ? 'મુખ્ય પૃષ્ઠ' : 'Dashboard'}
                </Link>
              </li>
              <li>
                <Link href="/track" className="hover:text-[#159447] transition-colors py-0.5 block">
                  {language === 'gu' ? 'મારી અરજીઓ' : 'Track Application'}
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#159447] transition-colors py-0.5 block">
                  {language === 'gu' ? 'અમારા વિશે' : 'About Us'}
                </Link>
              </li>
              <li>
                <Link href="/about#feedback" className="hover:text-[#159447] transition-colors py-0.5 block">
                  {language === 'gu' ? 'પ્રતિસાદ' : 'Citizen Feedback'}
                </Link>
              </li>
              <li>
                <Link href="/operator" className="hover:text-[#159447] transition-colors py-0.5 block">
                  {language === 'gu' ? 'ઓપરેટર પોર્ટલ' : 'Operator Portal'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3 (Span 3): Top Gujarat Services */}
          <div className="lg:col-span-3 space-y-3">
            <h3 className="text-[#18232D] font-bold text-xs sm:text-sm tracking-wider uppercase">
              {language === 'gu' ? 'મુખ્ય સેવાઓ' : language === 'hi' ? 'प्रमुख सेवाएं' : 'Key Services'}
            </h3>
            <ul className="space-y-2 text-xs text-[#5B6470]">
              <li>
                <Link href="/forms/income_certificate" className="hover:text-[#159447] transition-colors flex items-center justify-between py-0.5">
                  <span>{language === 'gu' ? 'આવકનું પ્રમાણપત્ર' : 'Income Certificate'}</span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-bold">Govt</span>
                </Link>
              </li>
              <li>
                <Link href="/forms/ews_certificate" className="hover:text-[#159447] transition-colors flex items-center justify-between py-0.5">
                  <span>{language === 'gu' ? 'EWS પ્રમાણપત્ર' : 'EWS Certificate'}</span>
                  <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded font-bold">10%</span>
                </Link>
              </li>
              <li>
                <Link href="/forms/caste_ncl_certificate" className="hover:text-[#159447] transition-colors flex items-center justify-between py-0.5">
                  <span>{language === 'gu' ? 'નોન-ક્રીમીલેયર' : 'Non-Creamy Layer'}</span>
                  <span className="text-[10px] text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded font-bold">NCL</span>
                </Link>
              </li>
              <li>
                <Link href="/forms/land_records_7_12" className="hover:text-[#159447] transition-colors flex items-center justify-between py-0.5">
                  <span>{language === 'gu' ? '૭/૧૨ જમીન ઉતારા' : '7/12 AnyRoR Records'}</span>
                  <span className="text-[10px] text-cyan-700 bg-cyan-50 px-1.5 py-0.5 rounded font-bold">Revenue</span>
                </Link>
              </li>
              <li>
                <Link href="/forms/driving_licence_rto" className="hover:text-[#159447] transition-colors flex items-center justify-between py-0.5">
                  <span>{language === 'gu' ? 'ડ્રાઇવિંગ લાયસન્સ' : 'Driving Licence'}</span>
                  <span className="text-[10px] text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded font-bold">Sarathi</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4 (Span 3): Trust Badges */}
          <div className="lg:col-span-3 space-y-3">
            <h3 className="text-[#18232D] font-bold text-xs sm:text-sm tracking-wider uppercase">
              {language === 'gu' ? 'સુરક્ષા અને વિશ્વાસ' : language === 'hi' ? 'सुरक्षा व विश्वास' : 'Security & Trust'}
            </h3>
            
            <div className="space-y-2">
              <div className="bg-white rounded-xl p-2.5 sm:p-3 border border-emerald-200/80 shadow-2xs flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#159447] text-white flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-[#18232D] leading-tight">DPDP Act 2023</h4>
                  <p className="text-[10px] text-[#5B6470]">Verified Citizen Privacy</p>
                </div>
              </div>

              <div className="bg-white rounded-xl p-2.5 sm:p-3 border border-rose-200/80 shadow-2xs flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-rose-500 text-white flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-[#18232D] leading-tight">SSL 256-Bit Secured</h4>
                  <p className="text-[10px] text-[#5B6470]">Encrypted Data Filing</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* ─── BOTTOM COPYRIGHT & LEGAL BAR ─── */}
        <div className="pt-6 sm:pt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-[#5B6470] gap-3 sm:gap-4 text-center sm:text-left">
          <div className="text-[11px] sm:text-xs">
            © {new Date().getFullYear()} FormSeva Gujarat • Made with <Heart className="w-3 h-3 text-rose-500 inline fill-rose-500" /> for Gujarat citizens
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] text-[#5B6470]">
            <Link href="/about" className="hover:text-[#159447] transition-colors">Privacy Policy</Link>
            <span>•</span>
            <Link href="/about" className="hover:text-[#159447] transition-colors">Terms of Service</Link>
            <span>•</span>
            <Link href="/about" className="hover:text-[#159447] transition-colors">Refund Policy</Link>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-[#5B6470]">
            <span>Payments:</span>
            <span className="font-bold text-[#18232D] bg-white border border-slate-200 px-1.5 py-0.5 rounded text-[10px]">UPI</span>
            <span className="font-bold text-[#18232D] bg-white border border-slate-200 px-1.5 py-0.5 rounded text-[10px]">RuPay</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
