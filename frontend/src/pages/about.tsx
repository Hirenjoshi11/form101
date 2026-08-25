'use client';

import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useLanguage } from '@/i18n/LanguageContext';
import {
  Sparkles,
  Compass,
  Target,
  Heart,
  BookOpen,
  GraduationCap,
  School,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Users
} from 'lucide-react';

export default function AboutPage() {
  const { language } = useLanguage();

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
            'FormSeva વિશે જાણો: નાગરિકો માટે સરકારી સેવાઓ સરળ બનાવવાનો અમારો પ્રયાસ અને બાળકોના શિક્ષણ માટે ૭% નફાનો સંકલ્પ.',
            'FormSeva के बारे में जानें: नागरिकों के लिए सरकारी सेवाओं को आसान बनाने का हमारा प्रयास और बच्चों की शिक्षा के लिए 7% मुनाफे का संकल्प।',
            'Learn about FormSeva: Simplifying government applications for citizens and our 7% profit commitment for children’s education.'
          )}
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <Navbar />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 sm:space-y-10">
        
        {/* ─── SECTION 1: ABOUT FORMSEVA ─── */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 lg:p-10 border border-slate-200/80 shadow-xs space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-[#159447] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('અમારા વિશે • FORMSEVA', 'हमारे बारे में • FORMSEVA', 'ABOUT FORMSEVA')}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#18232D] tracking-tight">
            {t('FormSeva વિશે', 'FormSeva के बारे में', 'About FormSeva')}
          </h1>

          <p className="text-sm sm:text-base text-[#5B6470] leading-relaxed">
            {t(
              'FormSeva એ નાગરિક-કેન્દ્રિત પ્લેટફોર્મ છે જે લોકોને સરકારી ફોર્મ અને અરજીઓ સરળતાથી સમજવા, તૈયાર કરવા અને પૂર્ણ કરવામાં મદદ કરે છે. અમે સમગ્ર પ્રક્રિયાને સરળ બનાવીએ છીએ જેથી નાગરિકો સમય બચાવી શકે અને આત્મવિશ્વાસ સાથે જરૂરી અરજીઓ પૂર્ણ કરી શકે.',
              'FormSeva एक नागरिक-केंद्रित मंच है जो लोगों को सरकारी फॉर्म और आवेदन आसानी से समझने, तैयार करने और पूरा करने में मदद करता है। हम इस प्रक्रिया को सरल बनाते हैं ताकि उपयोगकर्ता समय बचा सकें और आत्मविश्वास के साथ महत्वपूर्ण आवेदन पूरे कर सकें।',
              'FormSeva is a citizen-focused platform that helps people understand, prepare and complete Government forms and applications more easily. We simplify the process so users can save time and complete important applications with greater confidence.'
            )}
          </p>
        </section>

        {/* ─── SECTION 2: WHO WE ARE & WHY WE BUILT THIS SERVICE ─── */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 lg:p-10 border border-slate-200/80 shadow-xs space-y-6">
          {/* Who We Are */}
          <div className="space-y-2.5">
            <h2 className="text-lg sm:text-xl font-bold text-[#18232D]">
              {t('અમે કોણ છીએ', 'हम कौन हैं', 'Who We Are')}
            </h2>
            <p className="text-sm text-[#5B6470] leading-relaxed">
              {t(
                'અમે સામાન્ય નાગરિકો માટે સરકારી સેવાઓનો ઉપયોગ વધુ સરળ બનાવવા FormSeva નું નિર્માણ કરી રહ્યા છીએ.',
                'हम आम नागरिकों के लिए सरकारी सेवाओं को आसान और सुलभ बनाने के लिए FormSeva का निर्माण कर रहे हैं।',
                'We are building FormSeva to make Government services easier to navigate for everyday citizens.'
              )}
            </p>
          </div>

          <div className="border-t border-slate-100" />

          {/* Why We Built This Service */}
          <div className="space-y-2.5">
            <h2 className="text-lg sm:text-xl font-bold text-[#18232D]">
              {t('અમે આ સેવા શા માટે બનાવી', 'हमने यह सेवा क्यों बनाई', 'Why We Built This Service')}
            </h2>
            <p className="text-sm text-[#5B6470] leading-relaxed">
              {t(
                'સરકારી ફોર્મ અને ઓનલાઈન અરજી પ્રક્રિયાઓ ઘણીવાર ગૂંચવણભરી, સમય માંગી લે તેવી અને સમજવામાં અઘરી હોય છે. અમે આ અનુભવને સરળ બનાવવા, બિનજરૂરી મહેનત ઘટાડવા અને લોકોને તેમની અરજીઓ વધુ સરળતાથી પૂર્ણ કરવામાં મદદ કરવા FormSeva બનાવ્યું છે.',
                'सरकारी फॉर्म और ऑनलाइन आवेदन प्रक्रियाएं भ्रमित करने वाली, समय लेने वाली और समझने में कठिन हो सकती हैं। हमने उस अनुभव को सरल बनाने, अनावश्यक प्रयास को कम करने और लोगों को अपने आवेदन आसानी से पूरा करने में मदद करने के लिए FormSeva का निर्माण किया है।',
                'Government forms and online application processes can be confusing, time-consuming and difficult to understand. We built FormSeva to simplify that experience, reduce unnecessary effort and help people complete their applications more easily.'
              )}
            </p>
          </div>
        </section>

        {/* ─── SECTION 3: VISION & MISSION ─── */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {/* Vision */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-[#159447] flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-[#18232D]">
              {t('અમારી દ્રષ્ટિ', 'हमारी दृष्टि', 'Our Vision')}
            </h2>
            <p className="text-sm text-[#5B6470] leading-relaxed">
              {t(
                'દરેક નાગરિક માટે જરૂરી સરકારી સેવાઓની પહોંચ વધુ સરળ, સ્પષ્ટ અને સુવિધાજનક બનાવવી.',
                'प्रत्येक नागरिक के लिए आवश्यक सरकारी सेवाओं तक पहुंच को सरल, स्पष्ट और सुविधाजनक बनाना।',
                'To make access to essential Government services simpler, clearer and more convenient for every citizen.'
              )}
            </p>
          </div>

          {/* Mission */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-[#159447] flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-[#18232D]">
              {t('અમારું મિશન', 'हमारा मिशन', 'Our Mission')}
            </h2>
            <p className="text-sm text-[#5B6470] leading-relaxed">
              {t(
                'સરકારી અરજીઓ સમજવા, તૈયાર કરવા, ચકાસવા અને સબમિટ કરવાની પ્રક્રિયાને સરળ બનાવીને નાગરિકોનો કિંમતી સમય બચાવવો.',
                'सरकारी आवेदनों को समझने, तैयार करने, सत्यापित करने और जमा करने की प्रक्रिया को सरल बनाकर नागरिकों का समय बचाना।',
                'To save citizens time by simplifying the process of understanding, preparing, verifying and submitting Government applications.'
              )}
            </p>
          </div>
        </section>

        {/* ─── SECTION 4: OUR SOCIAL COMMITMENT — 7% FOR EDUCATION ─── */}
        <section className="bg-gradient-to-br from-[#EAF6EE] via-[#F4F9F5] to-[#E5F3EA] rounded-3xl p-6 sm:p-10 border-2 border-emerald-300 shadow-xs space-y-6">
          
          <div className="space-y-2.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#159447] text-white text-xs font-black uppercase tracking-wider shadow-2xs">
              <Heart className="w-3.5 h-3.5 fill-white" />
              <span>{t('અમારો સામાજિક સંકલ્પ', 'हमारा सामाजिक संकल्प', 'OUR SOCIAL COMMITMENT')}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-[#18232D] tracking-tight">
              {t('શિક્ષણ માટે ૭%', 'शिक्षा के लिए 7%', '7% for Education')}
            </h2>

            <p className="text-base sm:text-lg font-black text-[#159447]">
              {t(
                'અમારા નફાનો ૭% બાળકોના શિક્ષણ અને ઉજ્જવળ ભવિષ્ય માટે.',
                'हमारे मुनाफे का 7% बच्चों की शिक्षा और उज्ज्वल भविष्य के लिए।',
                '7% of our profit for children’s education and a brighter future.'
              )}
            </p>

            <p className="text-sm text-[#5B6470] leading-relaxed pt-1">
              {t(
                'અમે અમારા નફાના ૭% નો ઉપયોગ બાળકોના શિક્ષણને ટેકો આપવા અને જરૂરિયાતમંદ બાળકોને ઉપયોગી શિક્ષણ સામગ્રી અને શૈક્ષણિક સંસાધનો પહોંચાડવા માટે કટિબદ્ધ છીએ.',
                'हम अपने मुनाफे का 7% बच्चों की शिक्षा का समर्थन करने और जरूरतमंद बच्चों को उपयोगी शिक्षण सामग्री और शैक्षणिक संसाधन उपलब्ध कराने के लिए उपयोग करने के लिए प्रतिबद्ध हैं।',
                "We are committed to using 7% of our profit to support children's education and provide useful learning materials and educational resources to children who need them."
              )}
            </p>

            <p className="text-xs sm:text-sm text-[#18232D] font-semibold">
              {t(
                'અમારો વિશ્વાસ છે કે દરેક બાળકને શીખવાની, આગળ વધવાની અને જ્ઞાન સાથે જોડાવાની તક મળવી જ જોઈએ.',
                'हमारा मानना ​​है कि हर बच्चे को सीखने, बढ़ने और ज्ञान से जुड़ने का अवसर मिलना चाहिए।',
                'We believe that every child deserves the opportunity to learn, grow and connect with knowledge.'
              )}
            </p>
          </div>

          {/* Flow Visual */}
          <div className="bg-white p-5 rounded-2xl border border-emerald-200/80 shadow-2xs">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-bold text-[#18232D]">
              <span className="bg-emerald-100 text-[#159447] px-3 py-1.5 rounded-xl border border-emerald-300">
                7% OF PROFIT
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-[#159447]" />
              <span className="bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                {t('શિક્ષણ', 'शिक्षा', 'EDUCATION')}
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-[#159447]" />
              <span className="bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                {t('શિક્ષણ સામગ્રી', 'शिक्षण सामग्री', 'LEARNING MATERIALS')}
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-[#159447]" />
              <span className="bg-[#159447] text-white px-3 py-1.5 rounded-xl">
                {t('બાળકો અને વિદ્યાર્થીઓ', 'बच्चे व छात्र', 'CHILDREN & STUDENTS')}
              </span>
            </div>
          </div>

        </section>

      </main>

      <Footer />
    </div>
  );
}
