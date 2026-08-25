'use client';

import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useLanguage } from '@/i18n/LanguageContext';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Heart,
  GraduationCap,
  BookOpen,
  Laptop,
  Lightbulb,
  Users,
  Clock,
  AlertCircle,
  FileCheck,
  Layers,
  FileText,
  Building2,
  Award,
  Target,
  Smile,
  Briefcase,
  User,
  UserCheck,
  Check,
  X,
  Compass,
  ArrowDown,
  BookMarked,
  Shield,
  HelpCircle
} from 'lucide-react';

export default function AboutPage() {
  const { language } = useLanguage();

  // Helper for localized text
  const t = (gu: string, hi: string, en: string) => {
    if (language === 'gu') return gu;
    if (language === 'hi') return hi;
    return en;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAF9] text-[#18232D] font-sans antialiased">
      <Head>
        <title>
          {t(
            'અમારા વિશે અને ૭% શિક્ષણ સંકલ્પ — FormSeva Gujarat',
            'हमारे बारे में और 7% शिक्षा संकल्प — FormSeva Gujarat',
            'About Us & 7% Education Pledge — FormSeva Gujarat'
          )}
        </title>
        <meta
          name="description"
          content={t(
            'FormSeva વિશે જાણો: ગુજરાતના નાગરિકો માટે સરકારી સેવાઓ સરળ બનાવવાનું પ્લેટફોર્મ અને બાળકોના શિક્ષણ માટે ૭% નફાનો સંકલ્પ.',
            'FormSeva के बारे में जानें: सरकारी फॉर्म्स को आसान बनाने का मंच और बच्चों की शिक्षा के लिए 7% मुनाफे का संकल्प।',
            'Learn about FormSeva: A citizen-focused platform simplifying government certificate filings, backed by our 7% profit pledge for children’s education.'
          )}
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <Navbar />

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12 sm:space-y-16">
        
        {/* ─── SECTION 1: ABOUT US HERO ─── */}
        <section className="bg-white rounded-3xl p-6 sm:p-10 lg:p-12 border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-5 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-[#159447] text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t('અમારા વિશે • FORMSEVA', 'हमारे बारे में • FORMSEVA', 'ABOUT FORMSEVA')}</span>
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#18232D] tracking-tight leading-tight">
                {t(
                  'દરેક નાગરિક માટે સરકારી સેવાઓ સરળ બનાવવી',
                  'हर नागरिक के लिए सरकारी सेवाओं को सरल बनाना',
                  'Making Government Services Simpler for Everyone'
                )}
              </h1>

              <p className="text-sm sm:text-base text-[#5B6470] leading-relaxed font-normal">
                {t(
                  'FormSeva એ નાગરિક-કેન્દ્રિત પ્લેટફોર્મ છે જે લોકોને સંપૂર્ણ આત્મવિશ્વાસ અને સુવિધા સાથે સરકારી ફોર્મ અને અરજીઓ સમજવા, તૈયાર કરવા, ચકાસવા અને પૂર્ણ કરવામાં મદદ કરે છે.',
                  'FormSeva एक नागरिक-केंद्रित मंच है जो लोगों को आत्मविश्वास और सुविधा के साथ सरकारी फॉर्म और आवेदन समझने, तैयार करने, सत्यापित करने और पूरा करने में मदद करता है।',
                  'FormSeva is a citizen-focused platform that helps people understand, prepare, verify and complete Government forms and applications with greater confidence and convenience.'
                )}
              </p>

              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <Link
                  href="/#services-catalog"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#159447] hover:bg-[#12803c] text-white text-sm font-bold shadow-xs hover:shadow-md transition-all group"
                >
                  <span>{t('સેવાઓ જુઓ', 'सेवाएं देखें', 'Explore Forms')}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <a
                  href="#how-we-work"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[#18232D] text-sm font-bold transition-all"
                >
                  <span>{t('પ્રક્રિયા કેવી રીતે કામ કરે છે', 'प्रक्रिया कैसे काम करती है', 'How It Works')}</span>
                </a>
              </div>
            </div>

            {/* Right Hero Illustration / Visual Component */}
            <div className="lg:col-span-5 bg-gradient-to-br from-[#F4F9F5] via-emerald-50/50 to-[#EBF5EE] p-6 sm:p-7 rounded-2xl border border-emerald-200/70 shadow-2xs">
              <div className="text-xs font-bold text-[#159447] uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>{t('સરળ સહાયક ફાઇલિંગ પ્રક્રિયા', 'सरल सहायक फाइलिंग प्रक्रिया', 'Verified Assisted Filing Flow')}</span>
              </div>

              <div className="space-y-2.5">
                {[
                  { step: '1', title: t('નાગરિક વિગતો પસંદ કરે છે', 'नागरिक विवरण चुनते हैं', 'Citizen Selects Service'), desc: t('સરકારી પ્રમાણપત્ર અને જરૂરી વિગતો', 'सरकारी प्रमाणपत्र व आवश्यक विवरण', 'Official Certificate & details') },
                  { step: '2', title: t('દસ્તાવેજ માર્ગદર્શન', 'दस्तावेज़ मार्गदर्शन', 'Document Vault & Guidance'), desc: t('આધાર, રેશનકાર્ડ, આવક પુરાવા ચકાસણી', 'आधार, राशन कार्ड, आय प्रमाण पत्र', 'Aadhaar, Ration card verified') },
                  { step: '3', title: t('ઓપરેટર ચોક્કસાઈ ચકાસણી', 'ऑपरेटर सटीकता जांच', 'Operator Accuracy Verification'), desc: t('ભૂલ-મુક્ત ડેટા એન્ટ્રી', 'त्रुटिहीन डेटा प्रविष्टि', 'Error-free data preparation') },
                  { step: '4', title: t('સુરક્ષિત સબમિશન', 'सुरक्षित सबमिशन', 'Official Portal Submission'), desc: t('Digital Gujarat / AnyRoR પોર્ટલ પર સબમિટ', 'Digital Gujarat / AnyRoR पर सबमिट', 'Submitted to government system') },
                  { step: '5', title: t('પ્રમાણપત્ર પૂર્ણ અને ડાઉનલોડ', 'प्रमाणपत्र पूर्ण व डाउनलोड', 'Approved & Downloadable'), desc: t('તૈયાર પ્રમાણપત્ર અને રસીદ પ્રાપ્ત કરો', 'तैयार प्रमाणपत्र और रसीद प्राप्त करें', 'Instant download & SMS notification') },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200/70 shadow-2xs">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 text-[#159447] font-black text-xs flex items-center justify-center shrink-0">
                      {item.step}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-xs text-[#18232D] truncate">{item.title}</div>
                      <div className="text-[11px] text-[#5B6470] truncate">{item.desc}</div>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-[#159447] shrink-0" />
                  </div>
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* ─── SECTION 2: WHO WE ARE ─── */}
        <section className="space-y-4">
          <div className="max-w-3xl space-y-3">
            <span className="text-xs font-bold text-[#159447] uppercase tracking-wider">
              {t('અમારી ઓળખ', 'हमारी पहचान', 'About Us')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#18232D]">
              {t('અમે કોણ છીએ?', 'हम कौन हैं?', 'Who We Are')}
            </h2>
          </div>

          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4 text-sm sm:text-base text-[#5B6470] leading-relaxed">
            <p>
              {t(
                'FormSeva ની રચના સામાન્ય નાગરિકો માટે સરકારી ફોર્મ ભરવાની પ્રક્રિયાને અત્યંત સરળ બનાવવા માટે કરવામાં આવી છે.',
                'FormSeva का निर्माण आम नागरिकों के लिए सरकारी फॉर्म भरने की प्रक्रिया को अत्यंत सरल बनाने के लिए किया गया है।',
                'FormSeva is built to make the process of completing Government forms easier for everyday citizens.'
              )}
            </p>
            <p>
              {t(
                'સરકારી પોર્ટલ અને અરજીઓ ઘણીવાર સમજવામાં અઘરી હોય છે, ખાસ કરીને જ્યારે વપરાશકર્તાઓને કઈ માહિતી દાખલ કરવી, કયા દસ્તાવેજો જોડવા અથવા પ્રક્રિયાને યોગ્ય રીતે કેવી રીતે પૂર્ણ કરવી તે અંગે અસમંજસ હોય.',
                'सरकारी पोर्टल और आवेदन कई बार समझने में जटिल होते हैं, विशेष रूप से जब उपयोगकर्ताओं को यह स्पष्ट नहीं होता कि कौन सी जानकारी दर्ज करनी है, कौन से दस्तावेज़ आवश्यक हैं, या प्रक्रिया को सही तरीके से कैसे पूरा करना है।',
                'Government portals and applications can sometimes be difficult to understand, especially when users are unsure about which information to enter, which documents are required, or how to complete the process correctly.'
              )}
            </p>
            <p>
              {t(
                'અમારો ઉદ્દેશ્ય સ્પષ્ટ માર્ગદર્શન, સચોટ સહાય અને અરજી પ્રક્રિયાને સરળતાથી સંચાલિત કરવાની સુવિધાજનક વ્યવસ્થા પૂરી પાડીને તે અનુભવને તદ્દન સરળ બનાવવાનો છે.',
                'हमारा उद्देश्य स्पष्ट मार्गदर्शन, सटीक सहायता और आवेदन प्रक्रिया को आसानी से प्रबंधित करने की सुविधाजनक व्यवस्था प्रदान करके उस अनुभव को सरल बनाना है।',
                'We aim to simplify that experience by providing guided assistance, clear information and a convenient way to manage the application process.'
              )}
            </p>
          </div>
        </section>

        {/* ─── SECTION 3: THE PROBLEM WE WANT TO SOLVE ─── */}
        <section className="space-y-6">
          <div className="max-w-3xl space-y-2">
            <span className="text-xs font-bold text-[#159447] uppercase tracking-wider">
              {t('શા માટે FormSeva?', 'FormSeva क्यों?', 'The Challenge')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#18232D]">
              {t('અમે FormSeva શા માટે બનાવ્યું?', 'हमने FormSeva क्यों बनाया?', 'Why We Built FormSeva')}
            </h2>
            <p className="text-xs sm:text-sm text-[#5B6470]">
              {t(
                'અમારું લક્ષ્ય: સરકારી અરજી પ્રક્રિયાને વધુ સરળ, સ્પષ્ટ અને સુલભ બનાવવું.',
                'हमारा लक्ष्य: सरकारी आवेदन प्रक्रिया को अधिक सरल, स्पष्ट और सुलभ बनाना।',
                'Our goal: Make the process easier, clearer and more accessible for all citizens.'
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {[
              {
                icon: Layers,
                title: t('જટિલ પ્રક્રિયાઓ', 'जटिल प्रक्रियाएं', 'Complex Processes'),
                desc: t('સરકારી અરજીઓમાં બહુવિધ પગલાં અને અજાણી શરતો સામેલ હોઈ શકે છે.', 'सरकारी आवेदनों में कई चरण और अपरिचित शर्तें शामिल हो सकती हैं।', 'Government applications can involve multiple steps and unfamiliar requirements.')
              },
              {
                icon: Clock,
                title: t('સમય માંગી લેતા ફોર્મ', 'समय लेने वाले फॉर्म', 'Time-Consuming Forms'),
                desc: t('ફોર્મ સમજવામાં, ભરવામાં અને ચકાસવામાં કિંમતી સમય વેડફાય છે.', 'फॉर्म समझने, भरने और जांचने में मूल्यवान समय लग सकता है।', 'Understanding, filling and checking forms can take valuable time.')
              },
              {
                icon: FileText,
                title: t('દસ્તાવેજો અંગે અસમંજસ', 'दस्तावेज़ों में भ्रम', 'Documentation Confusion'),
                desc: t('કયા દસ્તાવેજો, ફોર્મેટ અને માહિતી જરૂરી છે તે અંગે વપરાશકર્તાઓ અચોક્કસ હોય છે.', 'उपयोगकर्ता आवश्यक दस्तावेज़ों, प्रारूपों और जानकारी को लेकर असमंजस में होते हैं।', 'Users may be unsure about the documents, formats and information required.')
              },
              {
                icon: Laptop,
                title: t('ડિજિટલ પડકારો', 'डिजिटल चुनौतियां', 'Digital Challenges'),
                desc: t('બધા નાગરિકો બહુવિધ ઓનલાઇન પોર્ટલ પર સરખી રીતે સરળતાથી કામ કરી શકતા નથી.', 'सभी नागरिक विभिन्न ऑनलाइन पोर्टलों पर समान रूप से सहज नहीं होते।', 'Not everyone is equally comfortable navigating multiple online portals.')
              }
            ].map((card, idx) => (
              <div key={idx} className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 text-[#159447] flex items-center justify-center">
                  <card.icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm sm:text-base text-[#18232D]">{card.title}</h3>
                <p className="text-xs text-[#5B6470] leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── SECTION 4: WHAT WE DO ─── */}
        <section className="space-y-6">
          <div className="max-w-3xl space-y-2">
            <span className="text-xs font-bold text-[#159447] uppercase tracking-wider">
              {t('અમારી સેવાઓ', 'हमारी सेवाएं', 'Our Capabilities')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#18232D]">
              {t('FormSeva શું કરે છે?', 'FormSeva क्या करता है?', 'What FormSeva Does')}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {[
              {
                icon: FileCheck,
                title: t('ફોર્મ સહાયતા', 'फॉर्म सहायता', 'Form Assistance'),
                desc: t('નાગરિકોને સરકારી ફોર્મ સરળતાથી સમજવા અને પૂર્ણ કરવામાં મદદ કરીએ છીએ.', 'नागरिकों को सरकारी फॉर्म आसानी से समझने और भरने में मदद करते हैं।', 'Help users understand and complete Government forms accurately.')
              },
              {
                icon: BookOpen,
                title: t('દસ્તાવેજ માર્ગદર્શન', 'दस्तावेज़ मार्गदर्शन', 'Document Guidance'),
                desc: t('અરજીઓ માટે જરૂરી ચોક્કસ દસ્તાવેજો અને માહિતી સમજવામાં મદદ કરીએ છીએ.', 'आवेदनों के लिए आवश्यक सटीक दस्तावेज़ों और जानकारी को समझने में मदद करते हैं।', 'Help users understand the documents and information needed for applications.')
              },
              {
                icon: UserCheck,
                title: t('અરજી સપોર્ટ', 'आवेदन सहायता', 'Application Support'),
                desc: t('સંપૂર્ણ અરજી પ્રક્રિયા દરમિયાન નાગરિકને સતત સહાય પૂરી પાડીએ છીએ.', 'पूरी आवेदन प्रक्रिया के दौरान नागरिक को निरंतर सहायता प्रदान करते हैं।', 'Provide assistance throughout the application filing process.')
              },
              {
                icon: Sparkles,
                title: t('સુવિધાજનક પહોંચ', 'सुविधाजनक पहुंच', 'Convenient Access'),
                desc: t('ઉપયોગી નાગરિક સેવાઓને એક જ સરળ અને સરળ અનુભવમાં લાવીએ છીએ.', 'उपयोगी नागरिक सेवाओं को एक ही सरल और सहज अनुभव में लाते हैं।', 'Bring useful citizen services into a simpler and easier experience.')
              }
            ].map((card, idx) => (
              <div key={idx} className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-[#159447] flex items-center justify-center">
                  <card.icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm sm:text-base text-[#18232D]">{card.title}</h3>
                <p className="text-xs text-[#5B6470] leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── SECTION 5: HOW WE WORK ─── */}
        <section id="how-we-work" className="space-y-6">
          <div className="max-w-3xl space-y-2">
            <span className="text-xs font-bold text-[#159447] uppercase tracking-wider">
              {t('કાર્ય પદ્ધતિ', 'कार्यप्रणाली', 'Simple Workflow')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#18232D]">
              {t('સરળ પ્રક્રિયા. ઓછી ઝંઝટ.', 'सरल प्रक्रिया। कम झंझट।', 'Simple Process. Less Hassle.')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
            {[
              {
                step: '01',
                title: t('સેવા પસંદ કરો', 'सेवा चुनें', 'Choose a Service'),
                desc: t('આવક, EWS, જાતિ, ૭/૧૨ અથવા અન્ય પ્રમાણપત્ર પસંદ કરો.', 'आय, EWS, जाति, 7/12 या अन्य प्रमाण पत्र चुनें।', 'Select the required Gujarat Government certificate or scheme.')
              },
              {
                step: '02',
                title: t('માહિતી અને દસ્તાવેજ આપો', 'विवरण व दस्तावेज़ दें', 'Provide Info & Docs'),
                desc: t('સરળ પ્રશ્નોના જવાબ આપો અને દસ્તાવેજો સુરક્ષિત રીતે અપલોડ કરો.', 'सरल प्रश्नों के उत्तर दें और दस्तावेज़ सुरक्षित रूप से अपलोड करें।', 'Answer guided questions and securely upload identity documents.')
              },
              {
                step: '03',
                title: t('અમે ફોર્મ તૈયાર અને સબમિટ કરીએ છીએ', 'हम फॉर्म तैयार कर सबमिट करते हैं', 'We Help Prepare & Submit'),
                desc: t('ચોક્કસાઈ ચકાસણી કરીને પોર્ટલ પર સમયસર સબમિટ કરીએ છીએ.', 'सटीकता की जांच कर पोर्टल पर समय पर सबमिट करते हैं।', 'Verified operators format data and submit to official portals.')
              },
              {
                step: '04',
                title: t('ટ્રેક કરો અને પ્રમાણપત્ર મેળવો', 'ट्रैक करें और प्राप्त करें', 'Track & Receive'),
                desc: t('સ્ટેટસ ટ્રેક કરો અને મંજૂર પ્રમાણપત્ર સીધું ડાઉનલોડ કરો.', 'स्थिति ट्रैक करें और स्वीकृत प्रमाणपत्र सीधे डाउनलोड करें।', 'Track live status and download your approved official certificate.')
              }
            ].map((item, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3 relative">
                <div className="text-2xl font-black text-[#159447] tracking-tight">
                  {item.step}
                </div>
                <h3 className="font-bold text-sm sm:text-base text-[#18232D]">{item.title}</h3>
                <p className="text-xs text-[#5B6470] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── SECTION 6: OUR VALUES ─── */}
        <section className="space-y-6">
          <div className="max-w-3xl space-y-2">
            <span className="text-xs font-bold text-[#159447] uppercase tracking-wider">
              {t('અમારા મૂલ્યો', 'हमारे मूल्य', 'Core Values')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#18232D]">
              {t('અમારો વિશ્વાસ અને સિદ્ધાંતો', 'हमारा विश्वास और सिद्धांत', 'What We Believe')}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {[
              {
                icon: Smile,
                title: t('સરળતા', 'सरलता', 'Simplicity'),
                desc: t('અમારો વિશ્વાસ છે કે સરકારી સેવાઓ સમજવામાં અને વાપરવામાં સરળ હોવી જોઈએ.', 'हमारा मानना ​​है कि सरकारी सेवाएं समझने और उपयोग में आसान होनी चाहिए।', 'We believe Government services should be easier to understand.')
              },
              {
                icon: ShieldCheck,
                title: t('પારદર્શિતા', 'पारदर्शिता', 'Transparency'),
                desc: t('અમે પ્રક્રિયાઓ, સરકારી શુલ્ક અને જરૂરિયાતો સ્પષ્ટ રીતે જણાવવા કટિબદ્ધ છીએ.', 'हम प्रक्रियाओं, सरकारी शुल्क और आवश्यकताओं को स्पष्ट रूप से साझा करते हैं।', 'We aim to communicate processes, charges and requirements clearly.')
              },
              {
                icon: Award,
                title: t('વિશ્વસનીયતા', 'विश्वसनीयता', 'Reliability'),
                desc: t('અમે ચોક્કસાઈ અને અરજીઓના જવાબદાર સંચાલન પર સંપૂર્ણ ધ્યાન કેન્દ્રિત કરીએ છીએ.', 'हम सटीकता और आवेदनों के जिम्मेदार संचालन पर पूरा ध्यान केंद्रित करते हैं।', 'We focus on accuracy and responsible handling of applications.')
              },
              {
                icon: Users,
                title: t('સુલભતા', 'सुलभता', 'Accessibility'),
                desc: t('અમે ડિજિટલ સેવાઓ વધુ નાગરિકો માટે ઉપયોગમાં સરળ બનાવવા માંગીએ છીએ.', 'हम डिजिटल सेवाओं को अधिक नागरिकों के लिए सुलभ बनाना चाहते हैं।', 'We want digital services to be easier to use for more people.')
              }
            ].map((card, idx) => (
              <div key={idx} className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 text-[#159447] flex items-center justify-center">
                  <card.icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm sm:text-base text-[#18232D]">{card.title}</h3>
                <p className="text-xs text-[#5B6470] leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── SECTION 7 & 8: VISION & MISSION ─── */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Vision Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[#159447] text-xs font-bold uppercase tracking-wider">
                <Compass className="w-3.5 h-3.5" />
                <span>{t('અમારી દ્રષ્ટિ', 'हमारी दृष्टि', 'Our Vision')}</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-[#18232D]">
                {t(
                  'દરેક નાગરિક માટે જરૂરી સરકારી સેવાઓ સરળ અને સુવિધાજનક બનાવવી.',
                  'प्रत्येक नागरिक के लिए आवश्यक सरकारी सेवाओं को सरल और सुविधाजनक बनाना।',
                  'To make access to essential Government services simpler, more understandable and more convenient for every citizen.'
                )}
              </h3>
              <p className="text-xs sm:text-sm text-[#5B6470] leading-relaxed">
                {t(
                  'અમે એક એવું વિશ્વસનીય પ્લેટફોર્મ બનાવવા માંગીએ છીએ જ્યાં લોકોને જટિલ ડિજિટલ પ્રક્રિયાઓથી પરેશાન થયા વિના જરૂરી માર્ગદર્શન મળી શકે.',
                  'हम एक ऐसा विश्वसनीय मंच बनाना चाहते हैं जहां लोगों को जटिल डिजिटल प्रक्रियाओं से परेशान हुए बिना आवश्यक मार्गदर्शन मिल सके।',
                  'We want to build a trusted platform where people can get the guidance they need without feeling overwhelmed by complicated digital processes.'
                )}
              </p>
            </div>
          </div>

          {/* Mission Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[#159447] text-xs font-bold uppercase tracking-wider">
              <Target className="w-3.5 h-3.5" />
              <span>{t('અમારું મિશન', 'हमारा मिशन', 'Our Mission')}</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-[#18232D]">
              {t(
                'સરકારી સેવા સમજવાથી લઈને અરજી પૂર્ણ કરવા સુધીની સફરને સરળ બનાવવી, નાગરિકોનો સમય બચાવવો અને ભૂલો અટકાવવી.',
                'सरकारी सेवा समझने से लेकर आवेदन पूरा करने तक की यात्रा को सरल बनाना, नागरिकों का समय बचाना और गलतियों को रोकना।',
                'Our mission is to simplify the journey from understanding a Government service to completing the required application, while saving citizens time and reducing avoidable errors.'
              )}
            </h3>
            <div className="space-y-2 pt-2 border-t border-slate-100">
              {[
                t('માહિતીને સમજવામાં અત્યંત સરળ બનાવવી', 'जानकारी को समझने में अत्यंत सरल बनाना', 'Make information easier to understand'),
                t('અરજી પ્રક્રિયાઓમાં જટિલતા ઘટાડવી', 'आवेदन प्रक्रियाओं में जटिलता को कम करना', 'Reduce complexity in application processes'),
                t('નાગરિકોને કાગળકામની ઝંઝટમાંથી મુક્તિ આપવી', 'नागरिकों को कागजी कार्रवाई से समय बचाना', 'Help citizens spend less time dealing with paperwork')
              ].map((pt, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-xs text-[#5B6470]">
                  <CheckCircle2 className="w-4 h-4 text-[#159447] shrink-0" />
                  <span>{pt}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── SECTION 9: OUR SOCIAL COMMITMENT (7% PROFIT PLEDGE) ─── */}
        <section className="bg-gradient-to-br from-[#EAF6EE] via-[#F4F9F5] to-[#E5F3EA] rounded-3xl p-6 sm:p-10 lg:p-12 border-2 border-emerald-300 shadow-sm space-y-8 relative overflow-hidden">
          
          {/* Header */}
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#159447] text-white text-xs font-black uppercase tracking-wider shadow-2xs">
              <Heart className="w-3.5 h-3.5 fill-white" />
              <span>{t('અમારો સામાજિક સંકલ્પ', 'हमारा सामाजिक संकल्प', 'OUR SOCIAL COMMITMENT')}</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black text-[#18232D] tracking-tight">
              7% Profit Pledge — {t('શિક્ષણ પહેલ', 'शिक्षा पहल', 'Education Initiative')}
            </h2>

            <p className="text-base sm:text-xl font-black text-[#159447]">
              {t(
                'અમારા નફાનો ૭% બાળકોના શિક્ષણ અને ઉજ્જવળ ભવિષ્ય માટે.',
                'हमारे मुनाफे का 7% बच्चों की शिक्षा और उज्ज्वल भविष्य के लिए।',
                '7% of our profit is dedicated to children’s education and learning opportunities.'
              )}
            </p>

            <p className="text-xs sm:text-sm text-[#5B6470] leading-relaxed">
              {t(
                'અમારો દૃઢ વિશ્વાસ છે કે જ્ઞાન અને શિક્ષણની પહોંચ બાળક ક્યાં રહે છે તેના પર નિર્ભર ન હોવી જોઈએ. જેમ જેમ FormSeva આગળ વધે છે, તેમ તેમ અમે ઇચ્છીએ છીએ કે અમારી સફળતા વ્યવસાયથી આગળ વધીને સમાજમાં સકારાત્મક પરિવર્તન લાવે.',
                'हमारा दृढ़ विश्वास है कि ज्ञान और शिक्षा तक पहुंच इस बात पर निर्भर नहीं होनी चाहिए कि बच्चा कहां रहता है। जैसे-जैसे FormSeva आगे बढ़ता है, हम चाहते हैं कि हमारी सफलता व्यापार से आगे बढ़कर सकारात्मक प्रभाव पैदा करे।',
                'We believe that access to knowledge should not depend on where a child lives or what opportunities are available around them. As FormSeva grows, we want our success to create a positive impact beyond our business.'
              )}
            </p>
          </div>

          {/* 4 Education Support Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                icon: BookOpen,
                title: t('શિક્ષણ સામગ્રી', 'शिक्षण सामग्री', 'Learning Materials'),
                desc: t('બાળકોને પુસ્તકો, નોટબુક્સ અને સ્ટેશનરી જેવી ઉપયોગી શિક્ષણ સામગ્રી પહોંચાડવી.', 'बच्चों को किताबें, नोटबुक और स्टेशनरी जैसी उपयोगी सामग्री उपलब्ध कराना।', 'Support children with useful educational materials such as books, notebooks and stationery.')
              },
              {
                icon: BookMarked,
                title: t('શૈક્ષણિક સંસાધનો', 'शैक्षणिक संसाधन', 'Educational Resources'),
                desc: t('ઉપયોગી શિક્ષણ સામગ્રી અને શૈક્ષણિક માર્ગદર્શનની સરળ પહોંચ પૂરી પાડવી.', 'उपयोगी शिक्षण संसाधनों और मार्गदर्शन तक पहुंच प्रदान करने में मदद करना।', 'Help provide access to useful learning resources and educational content.')
              },
              {
                icon: Laptop,
                title: t('ડિજિટલ શિક્ષણ', 'डिजिटल शिक्षा', 'Digital Learning'),
                desc: t('જ્યાં શક્ય હોય ત્યાં ડિજિટલ શિક્ષણ સાધનો અને કમ્પ્યુટર સાક્ષરતાને ટેકો આપવો.', 'जहां संभव हो, डिजिटल शिक्षण उपकरणों और कंप्यूटर साक्षरता का समर्थन करना।', 'Where possible, support access to digital learning tools and resources.')
              },
              {
                icon: Lightbulb,
                title: t('શિક્ષણ દ્વારા તક', 'शिक्षा से अवसर', 'Opportunity Through Education'),
                desc: t('બાળકોને આત્મવિશ્વાસ, જ્ઞાન અને ભવિષ્યની નવી તકો સાથે જોડવામાં મદદ કરવી.', 'बच्चों को आत्मविश्वास, ज्ञान और भविष्य के नए अवसरों से जोड़ना।', 'Help children connect with knowledge, confidence and future opportunities.')
              }
            ].map((item, idx) => (
              <div key={idx} className="bg-white p-5 rounded-2xl border border-emerald-200/80 shadow-2xs space-y-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-[#159447] flex items-center justify-center">
                  <item.icon className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-xs sm:text-sm text-[#18232D]">{item.title}</h3>
                <p className="text-xs text-[#5B6470] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Flow Visual */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-emerald-200/80 shadow-2xs space-y-3">
            <span className="text-[11px] font-bold text-[#159447] uppercase tracking-wider block">
              {t('સામાજિક સંકલ્પ પ્રવાહ', 'सामाजिक संकल्प प्रवाह', 'PLEDGE IMPACT FLOW')}
            </span>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-bold text-[#18232D]">
              <span className="bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">FormSeva</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#159447]" />
              <span className="bg-emerald-100 text-[#159447] px-3 py-1.5 rounded-xl border border-emerald-300">7% of Profit</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#159447]" />
              <span className="bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">{t('શિક્ષણ સહાય', 'शिक्षा सहायता', 'Education Support')}</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#159447]" />
              <span className="bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">{t('શિક્ષણ સામગ્રી', 'शिक्षण सामग्री', 'Learning Materials')}</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#159447]" />
              <span className="bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">{t('બાળકો અને વિદ્યાર્થીઓ', 'बच्चे व छात्र', 'Children & Students')}</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#159447]" />
              <span className="bg-emerald-600 text-white px-3 py-1.5 rounded-xl">{t('જ્ઞાન અને ઉજ્જવળ ભવિષ્ય', 'ज्ञान और उज्ज्वल भविष्य', 'Knowledge & Opportunities')}</span>
            </div>
          </div>

          {/* Transparency Commitment Statement */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white/80 border border-emerald-200/90 text-xs text-[#5B6470] space-y-1">
            <h4 className="font-bold text-[#18232D] text-xs sm:text-sm flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#159447]" />
              <span>{t('પારદર્શિતા માટેની અમારી કટિબદ્ધતા', 'पारदर्शिता के प्रति हमारी प्रतिबद्धता', 'Our Commitment to Transparency')}</span>
            </h4>
            <p className="leading-relaxed">
              {t(
                'જેમ જેમ આ પહેલ આગળ વધશે, તેમ તેમ અમે આ ૭% સંકલ્પ દ્વારા કરાયેલ યોગદાન અને તેના દ્વારા સમર્થિત શૈક્ષણિક પહેલોના સ્પષ્ટ અને પારદર્શક રેકોર્ડ જાળવવાનો લક્ષ્યાંક રાખીએ છીએ.',
                'जैसे-जैसे यह पहल आगे बढ़ेगी, हम इस 7% संकल्प के माध्यम से किए गए योगदान और समर्थित शैक्षणिक पहलों का पारदर्शी रिकॉर्ड बनाए रखने का लक्ष्य रखते हैं।',
                'As this initiative grows, we aim to maintain clear records of the contribution made through this 7% commitment and the educational initiatives it supports.'
              )}
            </p>
          </div>

        </section>

        {/* ─── SECTION 10: WHO WE SERVE ─── */}
        <section className="space-y-6">
          <div className="max-w-3xl space-y-2">
            <span className="text-xs font-bold text-[#159447] uppercase tracking-wider">
              {t('નાગરિક સેવા', 'नागरिक सेवा', 'Target Audience')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#18232D]">
              {t('નાગરિકો માટે બનાવેલ પ્લેટફોર્મ', 'नागरिकों के लिए बनाया गया मंच', 'Built for Citizens')}
            </h2>
            <p className="text-xs sm:text-sm text-[#5B6470]">
              {t(
                'અમારો ધ્યેય વિવિધ પૃષ્ઠભૂમિ અને ડિજિટલ અનુભવ ધરાવતા તમામ લોકો માટે સરકારી સેવાઓ સરળ બનાવવાનો છે.',
                'हमारा लक्ष्य विभिन्न पृष्ठभूमि और डिजिटल अनुभव वाले सभी लोगों के लिए सरकारी सेवाओं को आसान बनाना है।',
                'Our goal is to make digital Government services easier to access for people from different backgrounds and levels of digital experience.'
              )}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {[
              { icon: GraduationCap, label: t('વિદ્યાર્થીઓ', 'छात्र', 'Students') },
              { icon: Users, label: t('પરિવારો', 'परिवार', 'Families') },
              { icon: Sparkles, label: t('ખેડૂતો', 'किसान', 'Farmers') },
              { icon: Briefcase, label: t('નોકરિયાતો', 'कर्मचारी', 'Professionals') },
              { icon: Heart, label: t('વરિષ્ઠ નાગરિકો', 'वरिष्ठ नागरिक', 'Senior Citizens') },
              { icon: Building2, label: t('નાના વેપારીઓ', 'छोटे व्यवसायी', 'Small Businesses') }
            ].map((p, idx) => (
              <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col items-center justify-center text-center space-y-2 hover:border-[#159447]/40 transition">
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 text-[#159447] flex items-center justify-center">
                  <p.icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-[#18232D]">{p.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ─── SECTION 11: OUR APPROACH (COMPARISON) ─── */}
        <section className="space-y-6">
          <div className="max-w-3xl space-y-2">
            <span className="text-xs font-bold text-[#159447] uppercase tracking-wider">
              {t('અમારો અભિગમ', 'हमारा दृष्टिकोण', 'Our Method')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#18232D]">
              {t('ફોર્મ ભરવાની ઉત્તમ અને સુરક્ષિત રીત', 'फॉर्म भरने का बेहतर और सुरक्षित तरीका', 'A Better Way to Handle Forms')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            
            {/* Traditional Cyber Cafe Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <div className="w-7 h-7 rounded-lg bg-red-100 text-red-600 flex items-center justify-center font-bold text-xs">
                  <X className="w-4 h-4" />
                </div>
                <h3 className="font-black text-sm sm:text-base text-slate-800">
                  {t('પરંપરાગત સાયબર કાફે અનુભવ', 'पारंपरिक साइबर कैफे अनुभव', 'Traditional Experience')}
                </h3>
              </div>

              <ul className="space-y-3 text-xs sm:text-sm text-[#5B6470]">
                {[
                  t('લાંબી કતારો અને બિનજરૂરી સમયનો બગાડ', 'लंबी कतारें और समय की बर्बादी', 'Multiple visits, long queues, and wasted hours'),
                  t('અસમંજસભરી અને અસ્પષ્ટ જરૂરિયાતો', 'भ्रमित और अस्पष्ट आवश्यकताएं', 'Confusing requirements & missing documents'),
                  t('ડેટા એન્ટ્રીમાં વારંવાર થતી ભૂલો', 'डेटा प्रविष्टि में बार-बार गलतियां', 'Frequent manual data entry errors'),
                  t('દસ્તાવેજો અને સ્ટેટસનું કોઈ ટ્રેકિંગ નહીં', 'दस्तावेज़ों की स्थिति की कोई ट्रैकिंग नहीं', 'Uncertainty about progress and approval status')
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <X className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* FormSeva Approach Card */}
            <div className="bg-gradient-to-br from-emerald-50/70 to-white rounded-3xl p-6 sm:p-8 border-2 border-emerald-300 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-emerald-100">
                <div className="w-7 h-7 rounded-lg bg-[#159447] text-white flex items-center justify-center font-bold text-xs">
                  <Check className="w-4 h-4" />
                </div>
                <h3 className="font-black text-sm sm:text-base text-[#18232D]">
                  {t('FormSeva સહાયક અભિગમ', 'FormSeva सहायक दृष्टिकोण', 'FormSeva Approach')}
                </h3>
              </div>

              <ul className="space-y-3 text-xs sm:text-sm text-[#18232D] font-medium">
                {[
                  t('ઘેરબેઠાં સ્પષ્ટ માર્ગદર્શન અને સરળ પ્રક્રિયા', 'घर बैठे स्पष्ट मार्गदर्शन और सरल प्रक्रिया', 'Clear guidance from home with a structured process'),
                  t('ચકાસાયેલ દસ્તાવેજ માર્ગદર્શન અને સચોટ માહિતી', 'सत्यापित दस्तावेज़ मार्गदर्शन और सटीक जानकारी', 'Verified document checklists and requirement rules'),
                  t('પ્રમાણિત ઓપરેટર દ્વારા ભૂલ-મુક્ત ફાઇલિંગ', 'प्रमाणित ऑपरेटर द्वारा त्रुटिहीन फाइलिंग', 'Error-free preparation by certified operators'),
                  t('રીઅલ-ટાઇમ અરજી ટ્રેકિંગ અને સીધું ડાઉનલોડ', 'रियल-टाइम आवेदन ट्रैकिंग और सीधा डाउनलोड', 'Live application tracking and instant certificate download')
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#159447] shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </section>

        {/* ─── SECTION 12: FUTURE VISION ─── */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 lg:p-10 border border-slate-200/80 shadow-xs space-y-6">
          <div className="max-w-3xl space-y-2">
            <span className="text-xs font-bold text-[#159447] uppercase tracking-wider">
              {t('આગળની દિશા', 'आगे की दिशा', 'Looking Forward')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#18232D]">
              {t('અમે ક્યાં જઈ રહ્યા છીએ?', 'हम कहां जा रहे हैं?', 'Where We’re Going')}
            </h2>
            <p className="text-xs sm:text-sm text-[#5B6470] leading-relaxed">
              {t(
                'અમે એક દીર્ઘકાલીન દ્રષ્ટિ સાથે FormSeva નું નિર્માણ કરી રહ્યા છીએ: આવશ્યક નાગરિક સેવાઓની વ્યાપક શ્રેણી માટે વિશ્વસનીય ડિજિટલ સહાયક પ્લેટફોર્મ બનવું.',
                'हम एक दीर्घकालिक दृष्टि के साथ FormSeva का निर्माण कर रहे हैं: आवश्यक नागरिक सेवाओं की व्यापक श्रृंखला के लिए एक विश्वसनीय डिजिटल सहायक मंच बनना।',
                'We are building FormSeva with a long-term vision: to become a trusted digital assistance platform for a wider range of essential citizen services.'
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            {[
              { title: t('વધુ સરકારી સેવાઓ', 'अधिक सरकारी सेवाएं', 'More Services'), desc: t('નવી યોજનાઓ અને પ્રમાણપત્રોનો સતત ઉમેરો', 'नई योजनाओं व प्रमाणपत्रों का विस्तार', 'Expanding catalog to include more public schemes') },
              { title: t('ઉત્તમ ડિજિટલ સહાય', 'बेहतर डिजिटल सहायता', 'Better Assistance'), desc: t('સ્માર્ટ ફોર્મ ભરાવવાની અદ્યતન ટેકનોલોજી', 'स्मार्ट फॉर्म भरने की उन्नत तकनीक', 'Smarter form-filling technologies') },
              { title: t('સરળ અરજી ટ્રેકિંગ', 'सहज आवेदन ट्रैकिंग', 'Easier Tracking'), desc: t('SMS અને WhatsApp અપડેટ્સ', 'SMS व WhatsApp लाइव अपडेट्स', 'Automated notifications & SMS alerts') },
              { title: t('દસ્તાવેજ વ્યવસ્થાપન', 'दस्तावेज़ प्रबंधन', 'Document Storage'), desc: t('સુરક્ષિત દસ્તાવેજ વૉલ્ટ', 'सुरक्षित दस्तावेज़ वॉल्ट', 'Safe citizen document storage vault') },
              { title: t('સહાયક સંસાધનો', 'सहायक संसाधन', 'Helpful Resources'), desc: t('સરળ ભાષામાં નાગરિક માર્ગદર્શિકા', 'सरल भाषा में नागरिक गाइड', 'Plain-language guides and videos') }
            ].map((card, idx) => (
              <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70 space-y-1.5">
                <div className="text-xs font-bold text-[#18232D]">{card.title}</div>
                <div className="text-[11px] text-[#5B6470] leading-relaxed">{card.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── SECTION 13: FINAL CTA (NO FEEDBACK FORM) ─── */}
        <section className="bg-gradient-to-br from-[#18232D] to-[#253646] text-white rounded-3xl p-8 sm:p-12 text-center space-y-5 shadow-md">
          <div className="max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
              {t(
                'સરકારી ફોર્મ ભરવામાં મદદ જોઈએ છે?',
                'सरकारी फॉर्म भरने में सहायता चाहिए?',
                'Need Help With a Government Form?'
              )}
            </h2>
            <p className="text-sm sm:text-base text-slate-300">
              {t(
                'તમારો કિંમતી સમય બચાવો અને FormSeva ને પ્રક્રિયા સરળ બનાવવા દો.',
                'अपना कीमती समय बचाएं और FormSeva को प्रक्रिया को आसान बनाने दें।',
                'Save your time and let FormSeva help simplify the process.'
              )}
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/#services-catalog"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-[#159447] hover:bg-[#12803c] text-white text-sm sm:text-base font-bold shadow-md hover:shadow-lg transition-all group"
            >
              <span>{t('સરકારી સેવાઓ જુઓ', 'सरकारी सेवाएं देखें', 'Explore Forms')}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
