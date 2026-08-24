'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '../i18n/LanguageContext';
import { ShieldCheck, PhoneCall, Mail, MapPin, CheckCircle2, Lock, ArrowRight, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  const { t, language } = useLanguage();

  return (
    <footer className="bg-gradient-to-b from-[#F8FAF9] via-[#F4F9F5] to-[#EBF5EE] text-[#18232D] pt-16 pb-10 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-slate-200/80">
          
          {/* Col 1 (Span 4): Brand Bio, Contact & Socials */}
          <div className="lg:col-span-4 space-y-5">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center p-1 shadow-xs border border-slate-200">
                <img src="/icon.png" alt="FormSeva" className="w-full h-full object-contain" />
              </div>
              <div>
                <span className="font-black text-2xl text-[#18232D] tracking-tight leading-none">
                  Form<span className="text-[#159447]">Seva</span>
                </span>
                <p className="text-[9px] text-[#5B6470] font-bold tracking-widest uppercase mt-0.5">
                  FILL · SUBMIT · DONE
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#5B6470] leading-relaxed max-w-sm">
              {language === 'gu'
                ? 'ગુજરાતના નાગરિકો માટે સત્તાવાર સરકારી પ્રમાણપત્ર અને પરીક્ષા સહાયતા પોર્ટલ. સાયબર કાફેના ધક્કા વગર ૧૦૦% સચોટ અને સુરક્ષિત સેવા.'
                : language === 'hi'
                ? 'गुजरात के नागरिकों हेतु अधिकृत प्रमाण पत्र एवं राष्ट्रीय परीक्षा सहायता पोर्टल। बिना साइबर कैफे की कतारों के सुरक्षित व त्वरित सेवा।'
                : 'Your trusted citizen-services & national exam filing companion in Gujarat. We help you create error-free submissions with certified operators and end-to-end data privacy.'}
            </p>

            {/* Contact Details with Green Icons */}
            <div className="space-y-2.5 text-xs sm:text-sm text-[#18232D]">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-emerald-100/70 text-[#159447] flex items-center justify-center shrink-0">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <span className="text-[#5B6470]">123 Sachivalaya Marg, Gandhinagar, Gujarat 382010</span>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-emerald-100/70 text-[#159447] flex items-center justify-center shrink-0">
                  <PhoneCall className="w-3.5 h-3.5" />
                </div>
                <span className="font-semibold text-[#18232D]">+91 1800-233-5500 (Toll Free Helpline)</span>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-emerald-100/70 text-[#159447] flex items-center justify-center shrink-0">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <span className="text-[#5B6470]">support@formseva.gujarat.in</span>
              </div>
            </div>

            {/* Follow / Social */}
            <div className="pt-1">
              <p className="text-xs font-bold text-[#18232D] uppercase tracking-wider mb-2.5">
                {language === 'gu' ? 'અમારી સાથે જોડાઓ' : language === 'hi' ? 'हमसे जुड़ें' : 'Follow Our Journey'}
              </p>
              <div className="flex items-center gap-2">
                {[
                  { name: 'Twitter', icon: '𝕏', bg: 'bg-rose-50 text-rose-600 hover:bg-rose-100' },
                  { name: 'WhatsApp', icon: '💬', bg: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' },
                  { name: 'Telegram', icon: '✈️', bg: 'bg-sky-50 text-sky-600 hover:bg-sky-100' },
                  { name: 'LinkedIn', icon: '💼', bg: 'bg-blue-50 text-blue-600 hover:bg-blue-100' },
                ].map((s) => (
                  <button
                    key={s.name}
                    className={`w-8 h-8 rounded-full ${s.bg} flex items-center justify-center text-xs transition-transform hover:scale-110 shadow-2xs`}
                    title={s.name}
                  >
                    {s.icon}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Col 2 (Span 2.5): Quick Links */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-[#18232D] font-bold text-sm tracking-wider uppercase">
              {language === 'gu' ? 'ઝડપી લિંક્સ' : language === 'hi' ? 'त्वरित लिंक' : 'Quick Links'}
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm text-[#5B6470]">
              <li>
                <Link href="/about" className="hover:text-[#159447] transition-colors">
                  {language === 'gu' ? 'અમારા વિશે (About Us)' : language === 'hi' ? 'हमारे बारे में (About Us)' : 'About FormSeva'}
                </Link>
              </li>
              <li>
                <Link href="/forms" className="hover:text-[#159447] transition-colors">
                  {language === 'gu' ? 'બધા ફોર્મ્સ' : language === 'hi' ? 'सभी फॉर्म' : 'All Forms & Portal'}
                </Link>
              </li>
              <li>
                <Link href="/rates" className="hover:text-[#159447] transition-colors">
                  {language === 'gu' ? 'દર પત્રક (Rates)' : language === 'hi' ? 'दर सूची (Rates)' : 'Fee Rate Card'}
                </Link>
              </li>
              <li>
                <Link href="/track" className="hover:text-[#159447] transition-colors">
                  {language === 'gu' ? 'સ્ટેટસ તપાસો' : language === 'hi' ? 'स्थिति जांचें' : 'Track Application'}
                </Link>
              </li>
              <li>
                <Link href="/feedback" className="hover:text-[#159447] transition-colors">
                  {language === 'gu' ? 'પ્રતિસાદ (Feedback)' : language === 'hi' ? 'प्रतिक्रिया (Feedback)' : 'Citizen Feedback'}
                </Link>
              </li>
              <li>
                <Link href="/operator" className="hover:text-[#159447] transition-colors">
                  {language === 'gu' ? 'ઓપરેટર પોર્ટલ' : language === 'hi' ? 'ऑपरेटर पोर्टल' : 'Operator Portal'}
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-[#159447] transition-colors">
                  {language === 'gu' ? 'એડમિન કન્સોલ' : language === 'hi' ? 'व्यवस्थापक कंसोल' : 'Admin Console'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3 (Span 3): Top Government Services */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="text-[#18232D] font-bold text-sm tracking-wider uppercase">
              {language === 'gu' ? 'મુખ્ય સેવાઓ' : language === 'hi' ? 'प्रमुख सेवाएं' : 'Key Services'}
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm text-[#5B6470]">
              <li>
                <Link href="/forms/income_certificate" className="hover:text-[#159447] transition-colors flex items-center justify-between">
                  <span>{language === 'gu' ? 'આવકનું પ્રમાણપત્ર' : language === 'hi' ? 'आय प्रमाण पत्र' : 'Income Certificate'}</span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">eSewa</span>
                </Link>
              </li>
              <li>
                <Link href="/forms/ews_certificate" className="hover:text-[#159447] transition-colors flex items-center justify-between">
                  <span>{language === 'gu' ? 'EWS પ્રમાણપત્ર (10%)' : language === 'hi' ? 'ईडब्ल्यूएस प्रमाण पत्र' : 'EWS 10% Quota'}</span>
                  <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">Gujarat</span>
                </Link>
              </li>
              <li>
                <Link href="/forms/caste_ncl_certificate" className="hover:text-[#159447] transition-colors flex items-center justify-between">
                  <span>{language === 'gu' ? 'નોન-ક્રીમીલેયર દાખલો' : language === 'hi' ? 'नॉन-क्रीमीलेयर' : 'Non-Creamy Layer (NCL)'}</span>
                  <span className="text-[10px] text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">SEBC</span>
                </Link>
              </li>
              <li>
                <Link href="/forms/land_records_7_12" className="hover:text-[#159447] transition-colors flex items-center justify-between">
                  <span>{language === 'gu' ? '૭/૧૨ અને ૮-અ જમીન ઉતારા' : language === 'hi' ? '7/12 नकल' : '7/12 AnyRoR Records'}</span>
                  <span className="text-[10px] text-cyan-700 bg-cyan-50 px-1.5 py-0.5 rounded">Revenue</span>
                </Link>
              </li>
              <li>
                <Link href="/forms/driving_licence_rto" className="hover:text-[#159447] transition-colors flex items-center justify-between">
                  <span>{language === 'gu' ? 'ડ્રાઇવિંગ / લર્નિંગ લાયસન્સ' : language === 'hi' ? 'ड्राइविंग लाइसेंस' : 'Driving Licence (RTO)'}</span>
                  <span className="text-[10px] text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded">Sarathi</span>
                </Link>
              </li>
              <li>
                <Link href="/forms/neet_exam" className="hover:text-[#159447] font-semibold text-[#159447] transition-colors flex items-center justify-between">
                  <span>★ {language === 'gu' ? 'NEET UG પરીક્ષા રજીસ્ટ્રેશન' : language === 'hi' ? 'नीट यूजी परीक्षा' : 'NEET UG Exam 2026'}</span>
                  <span className="text-[10px] text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded">Live</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4 (Span 2.5): Support & Trust Cards */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="text-[#18232D] font-bold text-sm tracking-wider uppercase">
              {language === 'gu' ? 'સહાય અને સુરક્ષા' : language === 'hi' ? 'सहायता व सुरक्षा' : 'Support & Trust'}
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-[#5B6470]">
              <li>
                <Link href="/help" className="hover:text-[#159447] transition-colors">
                  {language === 'gu' ? 'હેલ્પ સેન્ટર & FAQ' : language === 'hi' ? 'हेल्प सेंटर' : 'Help Center & FAQ'}
                </Link>
              </li>
              <li>
                <Link href="/feedback" className="hover:text-[#159447] transition-colors">
                  {language === 'gu' ? 'પ્રતિસાદ આપો' : language === 'hi' ? 'प्रतिक्रिया दें' : 'Give Feedback'}
                </Link>
              </li>
              <li>
                <Link href="/help#dpdp" className="hover:text-[#159447] transition-colors">
                  {language === 'gu' ? 'ડેટા સુરક્ષા નીતિ' : language === 'hi' ? 'डेटा सुरक्षा नीति' : 'DPDP Act 2023 Compliance'}
                </Link>
              </li>
              <li>
                <Link href="/help#refund" className="hover:text-[#159447] transition-colors">
                  {language === 'gu' ? 'રિફંડ અને રદ કરવાની નીતિ' : language === 'hi' ? 'रिफंड नीति' : 'Refund & Cancellation'}
                </Link>
              </li>
            </ul>

            {/* Two Trust Verification Cards (Matching Reference Footer) */}
            <div className="space-y-2.5 pt-2">
              {/* Card 1: DPDP / Certified */}
              <div className="bg-white rounded-xl p-3 border border-emerald-200/80 shadow-xs flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#159447] text-white flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-[#18232D] leading-tight">DPDP Certified</h4>
                  <p className="text-[10px] text-[#5B6470]">Verified Citizen Privacy</p>
                </div>
              </div>

              {/* Card 2: SSL Secured */}
              <div className="bg-white rounded-xl p-3 border border-rose-200/80 shadow-xs flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-rose-500 text-white flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-[#18232D] leading-tight">SSL 256-Bit Secured</h4>
                  <p className="text-[10px] text-[#5B6470]">Safe &amp; Encrypted Filing</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-[#5B6470] gap-4">
          <div>
            © 2026 FormSeva Gujarat. All rights reserved. Made with <Heart className="w-3.5 h-3.5 text-rose-500 inline fill-rose-500" /> for citizens of Gujarat.
          </div>

          {/* Policy Links */}
          <div className="flex flex-wrap items-center gap-4 text-[#5B6470]">
            <Link href="/help#privacy" className="hover:text-[#159447] transition-colors">Privacy Policy</Link>
            <span>•</span>
            <Link href="/help#terms" className="hover:text-[#159447] transition-colors">Terms of Service</Link>
            <span>•</span>
            <Link href="/help#dpdp" className="hover:text-[#159447] transition-colors">DPDP Policy</Link>
            <span>•</span>
            <Link href="/rates" className="hover:text-[#159447] transition-colors">Refund Policy</Link>
          </div>

          {/* Payment Methods Pill */}
          <div className="flex items-center gap-2 text-[11px] text-[#5B6470]">
            <span>Supported:</span>
            <span className="font-bold text-[#18232D] bg-white border border-slate-200 px-2 py-0.5 rounded text-[10px]">UPI</span>
            <span className="font-bold text-[#18232D] bg-white border border-slate-200 px-2 py-0.5 rounded text-[10px]">RuPay</span>
            <span className="font-bold text-[#18232D] bg-white border border-slate-200 px-2 py-0.5 rounded text-[10px]">NetBanking</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
