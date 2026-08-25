'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useLanguage } from '../i18n/LanguageContext';
import { Language } from '../i18n/translations';
import { ApiService } from '../lib/api';
import { UserProfile } from '../lib/types';
import {
  ChevronDown,
  Plus,
  Minus,
  Phone,
  Mail,
  ShieldCheck,
  CheckCircle2,
  Globe,
  ExternalLink,
  Lock,
  Layers,
  Heart
} from 'lucide-react';

interface FooterLink {
  href: string;
  label_gu: string;
  label_hi: string;
  label_en: string;
  badge?: string;
  isExternal?: boolean;
}

interface FooterSection {
  id: string;
  title_gu: string;
  title_hi: string;
  title_en: string;
  links: FooterLink[];
}

export const Footer: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const user = ApiService.getCurrentUser();
    setCurrentUser(user);
  }, [router.asPath]);

  const userRole = currentUser?.role || 'guest';

  // Toggle individual accordion on mobile
  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Section configuration based on active role
  const getSections = (): FooterSection[] => {
    if (userRole === 'admin') {
      return [
        {
          id: 'admin_nav',
          title_gu: 'એડમિન કન્સોલ',
          title_hi: 'एडमिन कंसोल',
          title_en: 'Admin Console',
          links: [
            { href: '/admin?tab=overview', label_gu: 'ડેશબોર્ડ ઓવરવ્યૂ', label_hi: 'डैशबोर्ड ओवरव्यू', label_en: 'Dashboard Overview' },
            { href: '/admin/billing', label_gu: 'બિલિંગ અને આવક', label_hi: 'बिलिंग और राजस्व', label_en: 'Billing & Revenue', badge: 'PRO' },
            { href: '/admin?tab=submissions', label_gu: 'અરજીઓની યાદી', label_hi: 'आवेदन सूची', label_en: 'All Submissions' },
            { href: '/admin?tab=operators', label_gu: 'ઓપરેટર મેનેજમેન્ટ', label_hi: 'ऑपरेटर प्रबंधन', label_en: 'Operators' },
            { href: '/admin?tab=forms', label_gu: 'સેવાઓ અને દરો', label_hi: 'सेवाएं और दरें', label_en: 'Forms & Rates' },
          ],
        },
        {
          id: 'admin_governance',
          title_gu: 'ઓડિટ અને સપોર્ટ',
          title_hi: 'ऑडिट व सपोर्ट',
          title_en: 'Governance & Support',
          links: [
            { href: '/admin?tab=feedback', label_gu: 'નાગરિક પ્રતિસાદ', label_hi: 'नागरिक प्रतिक्रिया', label_en: 'Citizen Feedback' },
            { href: '/admin?tab=audit', label_gu: 'સુરક્ષા ઓડિટ લૉગ્સ', label_hi: 'सुरक्षा ऑडिट लॉग', label_en: 'Audit Logs' },
            { href: '/help', label_gu: 'સહાય કેન્દ્ર', label_hi: 'सहायता केंद्र', label_en: 'Help & FAQs' },
            { href: 'tel:18002335500', label_gu: '+91 1800-233-5500', label_hi: '+91 1800-233-5500', label_en: '+91 1800-233-5500', isExternal: true },
          ],
        },
        {
          id: 'legal',
          title_gu: 'કાનૂની અને નીતિઓ',
          title_hi: 'वैधानिक व नीतियां',
          title_en: 'Legal & Compliance',
          links: [
            { href: '/about', label_gu: 'ગોપનીયતા નીતિ (Privacy)', label_hi: 'गोपनीयता नीति', label_en: 'Privacy Policy' },
            { href: '/about', label_gu: 'નિયમો અને શરતો (Terms)', label_hi: 'नियम व शर्तें', label_en: 'Terms of Service' },
            { href: '/about', label_gu: 'DPDP એક્ટ ૨૦૨૩', label_hi: 'DPDP एक्ट 2023', label_en: 'DPDP Compliance' },
          ],
        },
      ];
    }

    if (userRole === 'operator') {
      return [
        {
          id: 'op_nav',
          title_gu: 'ઓપરેટર પોર્ટલ',
          title_hi: 'ऑपरेटर पोर्टल',
          title_en: 'Operator Portal',
          links: [
            { href: '/operator', label_gu: 'ઓપરેટર વર્કબેન્ચ', label_hi: 'ऑपरेटर वर्कबेंच', label_en: 'Assigned Applications' },
            { href: '/#services-catalog', label_gu: 'સેવાઓ અને દરો', label_hi: 'सेवाएं और शुल्क', label_en: 'Services & Rates' },
            { href: '/track', label_gu: 'અરજી સ્ટેટસ ટ્રેક', label_hi: 'आवेदन ट्रैक', label_en: 'Track Application' },
            { href: '/login', label_gu: 'એકાઉન્ટ સ્વિચ કરો', label_hi: 'अकाउंट बदलें', label_en: 'Switch Account' },
          ],
        },
        {
          id: 'op_support',
          title_gu: 'સહાય અને સંપર્ક',
          title_hi: 'सहायता व संपर्क',
          title_en: 'Support & Help',
          links: [
            { href: '/help', label_gu: 'ઓપરેટર માર્ગદર્શિકા', label_hi: 'ऑपरेटर गाइड', label_en: 'Operator Help' },
            { href: '/feedback', label_gu: 'પ્રતિસાદ આપો', label_hi: 'फीडबैक दें', label_en: 'Feedback & Suggestions' },
            { href: 'tel:18002335500', label_gu: '+91 1800-233-5500', label_hi: '+91 1800-233-5500', label_en: '+91 1800-233-5500', isExternal: true },
          ],
        },
        {
          id: 'legal',
          title_gu: 'સુરક્ષા અને કાનૂની',
          title_hi: 'सुरक्षा व वैधानिक',
          title_en: 'Legal & Security',
          links: [
            { href: '/about', label_gu: 'ગોપનીયતા નીતિ (Privacy)', label_hi: 'गोपनीयता नीति', label_en: 'Privacy Policy' },
            { href: '/about', label_gu: 'નિયમો અને શરતો (Terms)', label_hi: 'नियम व शर्तें', label_en: 'Terms of Service' },
            { href: '/about', label_gu: 'DPDP એક્ટ ૨૦૨૩', label_hi: 'DPDP एक्ट 2023', label_en: 'DPDP Compliance' },
          ],
        },
      ];
    }

    // Default for Citizen and Guest
    return [
      {
        id: 'quick_links',
        title_gu: 'ઝડપી લિંક્સ',
        title_hi: 'त्वरित लिंक',
        title_en: 'Quick Links',
        links: [
          { href: '/', label_gu: 'મુખ્ય પૃષ્ઠ (Home)', label_hi: 'होम', label_en: 'Home' },
          { href: '/#services-catalog', label_gu: 'સરકારી સેવાઓ', label_hi: 'सरकारी सेवाएं', label_en: 'All Services' },
          { href: '/track', label_gu: 'મારી અરજીઓ (Track)', label_hi: 'मेरी अर्जियां', label_en: 'Track Applications' },
          { href: '/about', label_gu: 'અમારા વિશે', label_hi: 'हमारे बारे में', label_en: 'About Us' },
          { href: '/feedback', label_gu: 'પ્રતિસાદ (Feedback)', label_hi: 'प्रतिक्रिया', label_en: 'Citizen Feedback' },
        ],
      },
      {
        id: 'support_links',
        title_gu: 'સહાય અને સંપર્ક',
        title_hi: 'सहायता व संपर्क',
        title_en: 'Support & Help',
        links: [
          { href: '/help', label_gu: 'મદદ અને FAQs', label_hi: 'सहायता व FAQs', label_en: 'Help & FAQs' },
          { href: 'tel:18002335500', label_gu: 'ટોલ-ફ્રી: ૧૮૦૦-૨૩૩-૫૫૦૦', label_hi: 'टोल-फ्री: 1800-233-5500', label_en: 'Toll-Free: 1800-233-5500', isExternal: true },
          { href: 'mailto:support@formseva.gujarat.in', label_gu: 'support@formseva.gujarat.in', label_hi: 'support@formseva.gujarat.in', label_en: 'support@formseva.gujarat.in', isExternal: true },
        ],
      },
      {
        id: 'legal_links',
        title_gu: 'કાનૂની અને સુરક્ષા',
        title_hi: 'वैधानिक व सुरक्षा',
        title_en: 'Legal & Trust',
        links: [
          { href: '/about', label_gu: 'ગોપનીયતા નીતિ (Privacy)', label_hi: 'गोपनीयता नीति', label_en: 'Privacy Policy' },
          { href: '/about', label_gu: 'નિયમો અને શરતો (Terms)', label_hi: 'नियम व शर्तें', label_en: 'Terms of Service' },
          { href: '/about', label_gu: 'DPDP એક્ટ ૨૦૨૩ સુરક્ષા', label_hi: 'DPDP एक्ट 2023 सुरक्षा', label_en: 'DPDP Compliance' },
        ],
      },
    ];
  };

  const sections = getSections();

  const getLabel = (item: { label_gu: string; label_hi: string; label_en: string }) => {
    if (language === 'gu') return item.label_gu;
    if (language === 'hi') return item.label_hi;
    return item.label_en;
  };

  const getTitle = (section: FooterSection) => {
    if (language === 'gu') return section.title_gu;
    if (language === 'hi') return section.title_hi;
    return section.title_en;
  };

  const tagline =
    language === 'gu'
      ? 'સરકારી સેવાઓ નાગરિકો માટે સરળ, ઝડપી અને સુવિધાજનક બનાવવી.'
      : language === 'hi'
      ? 'सरकारी सेवाओं को नागरिकों के लिए सरल, त्वरित और सुविधाजनक बनाना।'
      : 'Making Government services simpler, faster, and easier for citizens.';

  return (
    <footer
      className="bg-gradient-to-b from-[#F8FAF9] via-[#F4F9F5] to-[#EBF5EE] text-[#18232D] pt-8 sm:pt-10 pb-6 sm:pb-8 border-t border-slate-200/80"
      role="contentinfo"
      aria-label="FormSeva Footer"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ─── MAIN FOOTER CONTENT ─── */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 pb-6 sm:pb-8 border-b border-slate-200/80">
          
          {/* Brand & Description Column */}
          <div className="md:col-span-4 lg:col-span-4 space-y-3">
            {/* Logo */}
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#159447] rounded-xl"
              aria-label="FormSeva Home"
            >
              <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center p-1 shadow-2xs border border-slate-200 shrink-0 group-hover:scale-105 transition-transform">
                <img src="/icon.png" alt="FormSeva Logo" className="w-full h-full object-contain" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-xl text-[#18232D] tracking-tight leading-none">
                    Form<span className="text-[#159447]">Seva</span>
                  </span>
                  {userRole !== 'guest' && (
                    <span
                      className={`text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded ${
                        userRole === 'admin'
                          ? 'bg-slate-900 text-white'
                          : userRole === 'operator'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {userRole}
                    </span>
                  )}
                </div>
                <p className="text-[9px] text-[#5B6470] font-bold tracking-widest uppercase mt-0.5">
                  FILL · SUBMIT · DONE
                </p>
              </div>
            </Link>

            {/* Short Tagline Description */}
            <p className="text-xs text-[#5B6470] leading-relaxed max-w-sm">
              {tagline}
            </p>

            {/* Direct Contact Micro-Links */}
            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-[#5B6470]">
              <a
                href="tel:18002335500"
                className="inline-flex items-center gap-1.5 text-[#18232D] font-bold hover:text-[#159447] transition py-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#159447] rounded"
                aria-label="Call Toll-Free 1800-233-5500"
              >
                <Phone className="w-3.5 h-3.5 text-[#159447]" />
                <span>1800-233-5500</span>
              </a>
              <span className="text-slate-300">•</span>
              <a
                href="mailto:support@formseva.gujarat.in"
                className="inline-flex items-center gap-1.5 hover:text-[#159447] transition py-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#159447] rounded"
                aria-label="Email FormSeva Support"
              >
                <Mail className="w-3.5 h-3.5 text-[#159447]" />
                <span>support@formseva.gujarat.in</span>
              </a>
            </div>
          </div>

          {/* Navigation Links Columns (Desktop: Columns / Mobile: Accordion) */}
          <div className="md:col-span-8 lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
            {sections.map((section) => {
              const isOpen = Boolean(openSections[section.id]);
              return (
                <div
                  key={section.id}
                  className="border-b border-slate-200/70 sm:border-0 pb-3 sm:pb-0"
                >
                  {/* Mobile Accordion Header */}
                  <button
                    type="button"
                    onClick={() => toggleSection(section.id)}
                    className="w-full flex sm:hidden items-center justify-between min-h-[44px] py-2 text-left font-bold text-xs uppercase tracking-wider text-[#18232D] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#159447] rounded-lg"
                    aria-expanded={isOpen}
                    aria-controls={`footer-sec-${section.id}`}
                  >
                    <span>{getTitle(section)}</span>
                    <div className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[#5B6470]">
                      {isOpen ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                    </div>
                  </button>

                  {/* Desktop Static Header */}
                  <h3 className="hidden sm:block text-[#18232D] font-bold text-xs uppercase tracking-wider mb-3">
                    {getTitle(section)}
                  </h3>

                  {/* Links List */}
                  <div
                    id={`footer-sec-${section.id}`}
                    className={`${
                      isOpen ? 'block animate-fadeIn' : 'hidden'
                    } sm:block pt-1 sm:pt-0`}
                  >
                    <ul className="space-y-1.5 sm:space-y-2">
                      {section.links.map((link, idx) => (
                        <li key={idx}>
                          {link.isExternal ? (
                            <a
                              href={link.href}
                              className="min-h-[36px] sm:min-h-0 flex items-center gap-1.5 text-xs text-[#5B6470] hover:text-[#159447] font-medium py-1 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#159447] rounded"
                            >
                              <span>{getLabel(link)}</span>
                              <ExternalLink className="w-3 h-3 opacity-60" />
                            </a>
                          ) : (
                            <Link
                              href={link.href}
                              className="min-h-[36px] sm:min-h-0 flex items-center justify-between text-xs text-[#5B6470] hover:text-[#159447] font-medium py-1 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#159447] rounded"
                            >
                              <span>{getLabel(link)}</span>
                              {link.badge && (
                                <span className="text-[10px] text-emerald-800 bg-emerald-100 font-bold px-1.5 py-0.2 rounded">
                                  {link.badge}
                                </span>
                              )}
                            </Link>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* ─── LANGUAGE & TRUST BAR ─── */}
        <div className="py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs border-b border-slate-200/80">
          {/* Language Selector Pills */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#5B6470] font-semibold flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-[#159447]" />
              <span>Language:</span>
            </span>
            <div className="inline-flex bg-white p-0.5 rounded-xl border border-slate-200 shadow-2xs">
              {[
                { code: 'gu' as Language, label: 'ગુજરાતી' },
                { code: 'en' as Language, label: 'English' },
                { code: 'hi' as Language, label: 'हिन्दी' },
              ].map((opt) => (
                <button
                  key={opt.code}
                  type="button"
                  onClick={() => setLanguage(opt.code)}
                  className={`min-h-[32px] px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                    language === opt.code
                      ? 'bg-[#159447] text-white shadow-2xs'
                      : 'text-[#5B6470] hover:text-[#18232D] hover:bg-slate-50'
                  }`}
                  aria-label={`Switch language to ${opt.label}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Trust & Security Badges */}
          <div className="flex items-center gap-3 text-[11px] text-[#5B6470]">
            <div className="inline-flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#159447]" />
              <span className="font-semibold text-[#18232D]">DPDP Act 2023 Compliant</span>
            </div>
            <div className="inline-flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span className="font-semibold text-[#18232D]">256-Bit SSL Encrypted</span>
            </div>
          </div>
        </div>

        {/* ─── BOTTOM COPYRIGHT BAR ─── */}
        <div className="pt-4 flex flex-col sm:flex-row justify-between items-center text-[11px] text-[#5B6470] gap-2 text-center sm:text-left">
          <div>
            © {new Date().getFullYear()} FormSeva Gujarat • Digital Gujarat Assisted-Filing
          </div>
          <div className="flex items-center gap-3">
            <Link href="/about" className="hover:text-[#159447] transition-colors py-0.5">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link href="/about" className="hover:text-[#159447] transition-colors py-0.5">
              Terms of Service
            </Link>
            <span>•</span>
            <Link href="/help" className="hover:text-[#159447] transition-colors py-0.5">
              Help Center
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
};

// Also export as ResponsiveFooter for flexible usage
export const ResponsiveFooter = Footer;
export default Footer;
