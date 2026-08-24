import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useLanguage } from '@/i18n/LanguageContext';
import {
  FileText,
  ShieldCheck,
  Heart,
  BookOpen,
  GraduationCap,
  Sparkles,
  Users,
  CheckCircle2,
  ArrowRight,
  Laptop,
  Lightbulb,
  Compass,
  Building2,
  FileCheck,
  TrendingUp,
  Award,
  ChevronRight
} from 'lucide-react';

export default function AboutPage() {
  const { language } = useLanguage();

  return (
    <>
      <Head>
        <title>About Us — FormSeva Gujarat Citizen Services</title>
        <meta
          name="description"
          content="Learn about FormSeva, our citizen-first mission, and our 7% profit commitment to support village education across Gujarat."
        />
      </Head>

      <Navbar />

      <main className="bg-white min-h-screen">
        {/* ─── 1. HERO SECTION (Light, Clean, FormSeva Green Accents) ─── */}
        <section className="relative overflow-hidden bg-[#F8FAF9] pt-12 sm:pt-16 pb-16 sm:pb-20 border-b border-slate-100">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 left-10 w-72 h-72 bg-emerald-50/50 rounded-full blur-2xl pointer-events-none" />

          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-[#159447] text-xs font-bold uppercase tracking-wider mb-6 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#159447]" />
              <span>
                {language === 'gu'
                  ? 'ફોર્મ સેવા વિશે • નાગરિક સશક્તિકરણ'
                  : language === 'hi'
                  ? 'फॉर्म सेवा के बारे में • नागरिक सशक्तिकरण'
                  : 'About FormSeva • Citizen Empowerment'}
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl font-black text-[#18232D] tracking-tight leading-[1.2] max-w-4xl mx-auto">
              {language === 'gu' ? (
                <>
                  સરકારી ફોર્મ્સ દરેક નાગરિક માટે{' '}
                  <span className="text-[#159447] block sm:inline">સરળ અને સુલભ</span>
                </>
              ) : language === 'hi' ? (
                <>
                  सरकारी फॉर्म हर नागरिक के लिए{' '}
                  <span className="text-[#159447] block sm:inline">सरल व सुलभ</span>
                </>
              ) : (
                <>
                  Making Government Forms{' '}
                  <span className="text-[#159447]">Simple for Everyone</span>
                </>
              )}
            </h1>

            {/* Supporting Text */}
            <p className="mt-6 text-base sm:text-xl text-[#5B6470] max-w-3xl mx-auto leading-relaxed font-normal">
              {language === 'gu'
                ? 'FormSeva નાગરિકોને સરળ માર્ગદર્શન, પારદર્શક પ્રક્રિયા અને વિશ્વસનીય સહાય સાથે સરકારી ફોર્મ ભરવા, ચકાસવા અને સબમિટ કરવામાં સહાય કરે છે.'
                : language === 'hi'
                ? 'FormSeva नागरिकों को सरल मार्गदर्शन, पारदर्शी प्रक्रिया और विश्वसनीय सहायता के साथ सरकारी फॉर्म भरने, सत्यापित करने और जमा करने में मदद करता है।'
                : 'FormSeva helps citizens fill, verify and submit Government forms with simple guidance, transparent processes and reliable assistance.'}
            </p>

            {/* Subtle Highlights Bar */}
            <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto pt-4">
              {[
                {
                  label: language === 'gu' ? 'સરળ ઓનલાઇન અરજી' : language === 'hi' ? 'सरल ऑनलाइन आवेदन' : 'Guided Filing',
                  icon: FileText
                },
                {
                  label: language === 'gu' ? '૧૦૦% સચોટ માહિતી' : language === 'hi' ? '100% सटीक जानकारी' : 'Accuracy First',
                  icon: FileCheck
                },
                {
                  label: language === 'gu' ? 'સંપૂર્ણ ડેટા ગોપનીયતા' : language === 'hi' ? 'डेटा सुरक्षा' : 'Data Privacy',
                  icon: ShieldCheck
                },
                {
                  label: language === 'gu' ? '૭% શિક્ષણ યોગદાન' : language === 'hi' ? '7% शिक्षा योगदान' : '7% for Education',
                  icon: Heart
                }
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white/80 backdrop-blur-xs border border-slate-200/80 rounded-2xl p-3.5 flex items-center justify-center gap-2 shadow-2xs"
                >
                  <item.icon className="w-4 h-4 text-[#159447] shrink-0" />
                  <span className="text-xs font-bold text-[#18232D]">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── 2. ABOUT FORMSEVA SECTION ─── */}
        <section className="py-16 sm:py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
              
              {/* Left Column: Brand Story */}
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 text-xs font-bold text-[#159447] uppercase tracking-wider">
                  <Compass className="w-4 h-4 text-[#159447]" />
                  <span>{language === 'gu' ? 'અમારી ઓળખ' : language === 'hi' ? 'हमारी पहचान' : 'Who We Are'}</span>
                </div>

                <h2 className="text-2xl sm:text-4xl font-black text-[#18232D] tracking-tight">
                  {language === 'gu'
                    ? 'ફોર્મ સેવા વિશે (About FormSeva)'
                    : language === 'hi'
                    ? 'फॉर्म सेवा के बारे में'
                    : 'About FormSeva'}
                </h2>

                <div className="space-y-4 text-sm sm:text-base text-[#5B6470] leading-relaxed">
                  <p>
                    {language === 'gu' ? (
                      <strong className="text-[#18232D] font-semibold">
                        FormSeva એ સરકારી ફોર્મ્સ અને અરજી પ્રક્રિયાઓને સમજવા અને પૂર્ણ કરવામાં સરળ બનાવવા માટે રચાયેલ નાગરિક-કેન્દ્રિત ડિજિટલ સહાયતા પ્લેટફોર્મ છે.
                      </strong>
                    ) : language === 'hi' ? (
                      <strong className="text-[#18232D] font-semibold">
                        FormSeva एक नागरिक-केंद्रित डिजिटल सहायता मंच है जिसे सरकारी फॉर्म और आवेदन प्रक्रियाओं को समझने और पूरा करने में आसान बनाने के लिए डिज़ाइन किया गया है।
                      </strong>
                    ) : (
                      <strong className="text-[#18232D] font-semibold">
                        FormSeva is a citizen-focused digital assistance platform designed to make Government forms and application processes easier to understand and complete.
                      </strong>
                    )}
                  </p>

                  <p>
                    {language === 'gu'
                      ? 'અમારો ઉદ્દેશ્ય ગેરસમજ અને મૂંઝવણ ઘટાડવાનો છે, નાગરિકોનો કિંમતી સમય બચાવવાનો છે અને સ્પષ્ટ પગલું-દર-પગલું માર્ગદર્શન સાથે લોકોને કોઈપણ ભૂલ વિના સચોટ અરજીઓ પૂર્ણ કરવામાં મદદ કરવાનો છે.'
                      : language === 'hi'
                      ? 'हमारा उद्देश्य उलझन को कम करना, नागरिकों का बहुमूल्य समय बचाना और स्पष्ट चरण-दर-चरण मार्गदर्शन के साथ लोगों को त्रुटिरहित आवेदन पूरा करने में सहायता करना है।'
                      : 'Our goal is to reduce confusion, save citizens\' time and help people complete applications accurately with clear step-by-step guidance.'}
                  </p>

                  <p>
                    {language === 'gu'
                      ? 'અમે નાગરિકો અને જટિલ સરકારી દસ્તાવેજીકરણ વચ્ચેના અંતરને દૂર કરીએ છીએ જેથી દરેક સામાન્ય નાગરિક ઘરે બેઠા આત્મવિશ્વાસ સાથે પોતાના જરૂરી સરકારી દાખલાઓ અને પ્રમાણપત્રો માટે અરજી કરી શકે.'
                      : language === 'hi'
                      ? 'हम नागरिकों और जटिल सरकारी दस्तावेज़ीकरण के बीच की दूरी को कम करते हैं ताकि हर सामान्य नागरिक घर बैठे आत्मविश्वास के साथ आवेदन कर सके।'
                      : 'We bridge the gap between citizens and complex procedural workflows, enabling individuals across rural and urban Gujarat to access documentation seamlessly.'}
                  </p>
                </div>

                <div className="pt-2 flex flex-wrap gap-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#18232D] bg-[#F8FAF9] border border-slate-200 px-4 py-2 rounded-xl">
                    <CheckCircle2 className="w-4 h-4 text-[#159447]" />
                    <span>{language === 'gu' ? 'પારદર્શક પ્રક્રિયા' : language === 'hi' ? 'पारदर्शी प्रक्रिया' : 'Transparent Workflow'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-[#18232D] bg-[#F8FAF9] border border-slate-200 px-4 py-2 rounded-xl">
                    <CheckCircle2 className="w-4 h-4 text-[#159447]" />
                    <span>{language === 'gu' ? 'સમર્પિત સહાય' : language === 'hi' ? 'समर्पित सहायता' : 'Dedicated Human Filing'}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Visual Card */}
              <div className="lg:col-span-5">
                <div className="bg-gradient-to-br from-[#F0FDF4] via-[#F8FAF9] to-[#EFF6FF] border border-emerald-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-emerald-200 flex items-center justify-center p-2 shadow-xs">
                    <img src="/icon.png" alt="FormSeva Logo" className="w-full h-full object-contain" />
                  </div>

                  <div>
                    <h3 className="font-black text-xl text-[#18232D]">
                      {language === 'gu' ? 'વિશ્વાસ અને સચોટતા' : language === 'hi' ? 'विश्वास व सटीकता' : 'Trust & Accuracy'}
                    </h3>
                    <p className="text-xs text-[#5B6470] mt-1.5 leading-relaxed">
                      {language === 'gu'
                        ? 'પ્રત્યેક ફોર્મ અધિકૃત સરકારી નિયમો અનુસાર ભરવામાં આવે છે જેથી રિજેક્શનનું જોખમ શૂન્ય થઈ જાય.'
                        : language === 'hi'
                        ? 'प्रत्येक फॉर्म आधिकारिक नियमों के अनुरूप भरा जाता है ताकि अस्वीकृति का जोखिम न रहे।'
                        : 'Every application is handled according to official regulatory specifications to prevent rejection.'}
                    </p>
                  </div>

                  <div className="space-y-3 pt-2 divide-y divide-emerald-100/80">
                    <div className="flex items-center gap-3 pt-3 first:pt-0">
                      <div className="w-7 h-7 rounded-full bg-[#159447] text-white flex items-center justify-center text-xs font-bold shrink-0">
                        ✓
                      </div>
                      <span className="text-xs font-bold text-[#18232D]">
                        {language === 'gu' ? 'સરકારી પરિપત્રો આધારિત સત્યાપન' : language === 'hi' ? 'सरकारी नियमों पर आधारित' : 'Verified against Govt Resolutions'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 pt-3">
                      <div className="w-7 h-7 rounded-full bg-[#159447] text-white flex items-center justify-center text-xs font-bold shrink-0">
                        ✓
                      </div>
                      <span className="text-xs font-bold text-[#18232D]">
                        {language === 'gu' ? 'DPDP Act ૨૦૨૩ સુરક્ષિત દસ્તાવેજ' : language === 'hi' ? 'DPDP Act 2023 डेटा सुरक्षा' : 'Encrypted & DPDP Act 2023 Compliant'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 pt-3">
                      <div className="w-7 h-7 rounded-full bg-[#159447] text-white flex items-center justify-center text-xs font-bold shrink-0">
                        ✓
                      </div>
                      <span className="text-xs font-bold text-[#18232D]">
                        {language === 'gu' ? 'સામાજિક ઉત્તરદાયિત્વ પહેલ' : language === 'hi' ? 'सामाजिक उत्तरदायित्व पहल' : 'Direct Social Responsibility Pledge'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ─── 3. OUR MISSION SECTION ─── */}
        <section className="py-16 sm:py-20 bg-[#F8FAF9] border-y border-slate-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="text-center mb-12 sm:mb-16">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-[#159447] uppercase tracking-wider mb-2">
                <Lightbulb className="w-4 h-4 text-[#159447]" />
                <span>{language === 'gu' ? 'અમારો દ્રષ્ટિકોણ' : language === 'hi' ? 'हमारा दृष्टिकोण' : 'Our Mission'}</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-[#18232D] tracking-tight">
                {language === 'gu'
                  ? 'સરકારી સેવાઓ દરેક નાગરિક માટે સરળ, સુલભ અને સમજાય તેવી હોવી જોઈએ.'
                  : language === 'hi'
                  ? 'सरकारी सेवाएं हर नागरिक के लिए सरल, सुलभ और समझने योग्य होनी चाहिए।'
                  : 'Government services should be simple, accessible and understandable for everyone.'}
              </h2>
              <p className="text-sm sm:text-base text-[#5B6470] mt-3 max-w-2xl mx-auto">
                {language === 'gu'
                  ? 'અમારું લક્ષ્ય ડિજિટલ પ્રક્રિયાઓને માનવીય સહાય સાથે સરળ બનાવી નાગરિકોના જીવનને સહેલું બનાવવાનું છે.'
                  : language === 'hi'
                  ? 'हमारा लक्ष्य डिजिटल प्रक्रियाओं को सरल बनाकर नागरिकों के जीवन को सुगम बनाना है।'
                  : 'Empowering every citizen with transparent, hassle-free and assisted access to public services.'}
              </p>
            </div>

            {/* 4 Clean Icon Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: FileText,
                  title: language === 'gu' ? 'જટિલતાનું સરળીકરણ' : language === 'hi' ? 'प्रक्रिया का सरलीकरण' : 'Simplify Complex Filing',
                  desc:
                    language === 'gu'
                      ? 'લાંબી અને અટપટી સરકારી ફોર્મ ભરવાની પ્રક્રિયાઓને સરળ બનાવીએ છીએ.'
                      : language === 'hi'
                      ? 'लंबी और जटिल सरकारी फॉर्म भरने की प्रक्रियाओं को आसान बनाना।'
                      : 'Streamlining multi-stage and complicated form-filling workflows into clear steps.'
                },
                {
                  icon: FileCheck,
                  title: language === 'gu' ? 'જરૂરી માહિતીની સ્પષ્ટતા' : language === 'hi' ? 'आवश्यक जानकारी की स्पष्टता' : 'Understand Requirements',
                  desc:
                    language === 'gu'
                      ? 'કયા દસ્તાવેજો અને વિગતો જરૂરી છે તે નાગરિકોને સ્પષ્ટ રીતે સમજાવીએ છીએ.'
                      : language === 'hi'
                      ? 'नागरिकों को आवश्यक दस्तावेजों और जानकारी को समझने में मदद करना।'
                      : 'Helping citizens clearly understand required documentation and eligibility rules.'
                },
                {
                  icon: ShieldCheck,
                  title: language === 'gu' ? 'ભૂલોનું નિવારણ' : language === 'hi' ? 'त्रुटियों का निवारण' : 'Reduce Common Mistakes',
                  desc:
                    language === 'gu'
                      ? 'ચોક્કસ ચકાસણી દ્વારા સામાન્ય ભૂલો અને અરજી અસ્વીકાર થવાના જોખમને અટકાવીએ છીએ.'
                      : language === 'hi'
                      ? 'सटीक जांच द्वारा सामान्य गलतियों और आवेदन अस्वीकार होने से बचाना।'
                      : 'Preventing typographical errors and document mismatches before final submission.'
                },
                {
                  icon: Laptop,
                  title: language === 'gu' ? 'ડિજિટલ સર્વસમાવેશકતા' : language === 'hi' ? 'डिजिटल समावेशन' : 'Digital Inclusivity',
                  desc:
                    language === 'gu'
                      ? 'ટેક્નોલોજી સાથે ઓછી અનુકૂળતા ધરાવતા લોકો માટે સેવાઓ ઉપયોગી અને સરળ બનાવીએ છીએ.'
                      : language === 'hi'
                      ? 'तकनीक से कम परिचित लोगों के लिए डिजिटल सेवाओं को सहज बनाना।'
                      : 'Making digital services easy for people who are less comfortable with technology.'
                }
              ].map((card, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs hover:shadow-md hover:border-[#159447] transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#159447] border border-emerald-100 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-emerald-100 transition-all">
                      <card.icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-extrabold text-base text-[#18232D] group-hover:text-[#159447] transition-colors mb-2">
                      {card.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#5B6470] leading-relaxed">{card.desc}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* ─── 4. OUR SOCIAL RESPONSIBILITY (7% FOR EDUCATION) ─── */}
        <section className="py-16 sm:py-24 bg-white relative overflow-hidden">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Main Commitment Container */}
            <div className="bg-gradient-to-br from-[#F0FDF4] via-[#F8FAF9] to-[#EBF5EE] border-2 border-emerald-300 rounded-3xl p-8 sm:p-12 shadow-md relative overflow-hidden">
              
              {/* Decorative Accent */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-200/30 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10">
                {/* Header Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#159447] text-white text-xs font-bold uppercase tracking-wider mb-5 shadow-xs">
                  <GraduationCap className="w-4 h-4 text-white" />
                  <span>
                    {language === 'gu'
                      ? 'સામાજિક પ્રતિબદ્ધતા • ૭% નફો શિક્ષણ માટે'
                      : language === 'hi'
                      ? 'सामाजिक संकल्प • 7% लाभ शिक्षा के लिए'
                      : '7% for Education — Our Social Commitment'}
                  </span>
                </div>

                <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#18232D] tracking-tight leading-tight max-w-3xl">
                  {language === 'gu' ? (
                    <>
                      ગામડાંના વિદ્યાર્થીઓના ઉજ્જવળ ભવિષ્ય માટે{' '}
                      <span className="text-[#159447]">નફાનો ૭% હિસ્સો શિક્ષણ સહાયમાં</span>
                    </>
                  ) : language === 'hi' ? (
                    <>
                      ग्रामीण छात्रों के उज्ज्वल भविष्य हेतु{' '}
                      <span className="text-[#159447]">लाभ का 7% हिस्सा शिक्षा सहयोग में</span>
                    </>
                  ) : (
                    <>
                      7% for Education —{' '}
                      <span className="text-[#159447]">Our Social Commitment</span>
                    </>
                  )}
                </h2>

                {/* The Exact Business Commitment Blockquote */}
                <div className="my-6 p-5 sm:p-6 bg-white/90 rounded-2xl border-l-4 border-[#159447] shadow-xs">
                  <p className="text-base sm:text-lg font-bold text-[#18232D] leading-relaxed italic">
                    {language === 'gu'
                      ? '“અમે અમારા નફામાંથી ૭% શિક્ષણને ટેકો આપવા અને ગામડાંના વિદ્યાર્થીઓને શીખવાની સામગ્રી અને આવશ્યક શૈક્ષણિક સંસાધનો પૂરા પાડવા માટે સમર્પિત કરવા પ્રતિબદ્ધ છીએ.”'
                      : language === 'hi'
                      ? '“हम अपने लाभ का 7% शिक्षा को बढ़ावा देने और ग्रामीण क्षेत्रों के छात्रों को अध्ययन सामग्री व आवश्यक शैक्षणिक संसाधन उपलब्ध कराने हेतु समर्पित करने के लिए प्रतिबद्ध हैं।”'
                      : '“We are committed to using 7% of our profit to support education and provide learning materials and essential educational resources to students in villages.”'}
                  </p>
                </div>

                {/* Purpose Explanation */}
                <p className="text-sm sm:text-base text-[#5B6470] leading-relaxed max-w-4xl">
                  {language === 'gu'
                    ? 'અમે માનીએ છીએ કે જ્ઞાન મેળવવાનો અધિકાર વિદ્યાર્થી ક્યાં રહે છે તેના પર નિર્ભર ન હોવો જોઈએ. આ પહેલ દ્વારા, અમારો ઉદ્દેશ્ય ગામડાંના વિદ્યાર્થીઓને શૈક્ષણિક સામગ્રી, અભ્યાસ સંસાધનો અને જરૂરી સહાય મેળવવામાં મદદ કરવાનો છે જેથી તેઓ જ્ઞાન અને નવી તકો સાથે જોડાઈ શકે.'
                    : language === 'hi'
                    ? 'हमारा मानना है कि ज्ञान तक पहुंच इस बात पर निर्भर नहीं होनी चाहिए कि छात्र कहां रहता है। इस पहल के माध्यम से, हम ग्रामीण छात्रों को सीखने की सामग्री, संसाधन और आवश्यक सहायता से जोड़कर नए अवसरों के द्वार खोलना चाहते हैं।'
                    : 'We believe access to knowledge should not depend on where a student lives. Through this initiative, we aim to help village students access educational materials, learning resources and other needful support that can help them connect with knowledge and opportunities.'}
                </p>

                {/* ─── VISUAL STORY FLOW (FormSeva -> 7% Profit -> Education -> Opportunity) ─── */}
                <div className="mt-10 pt-8 border-t border-emerald-200/80">
                  <h4 className="text-xs font-extrabold uppercase tracking-widest text-[#18232D] text-center mb-6">
                    {language === 'gu'
                      ? 'અમારી પ્રક્રિયા પ્રવાહ • સામાજિક ઉત્તરદાયિત્વ'
                      : language === 'hi'
                      ? 'प्रक्रिया प्रवाह • सामाजिक उत्तरदायित्व'
                      : 'Business → Social Responsibility → Education → Opportunity'}
                  </h4>

                  {/* Flow Diagram for Mobile & Desktop */}
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-3 sm:gap-4 items-center">
                    {[
                      { step: '1', title: 'FormSeva', sub: language === 'gu' ? 'નાગરિક પ્લેટફોર્મ' : 'Citizen Platform', icon: Building2 },
                      { step: '2', title: '7% Profit', sub: language === 'gu' ? 'નફાનું સમર્પણ' : 'Dedicated Profit', icon: TrendingUp },
                      { step: '3', title: 'Education Support', sub: language === 'gu' ? 'શિક્ષણ સહાય' : 'Student Aid', icon: GraduationCap },
                      { step: '4', title: 'Learning Materials', sub: language === 'gu' ? 'પુસ્તકો / સામગ્રી' : 'Books & Tools', icon: BookOpen },
                      { step: '5', title: 'Village Students', sub: language === 'gu' ? 'ગામડાંના વિદ્યાર્થી' : 'Rural Learners', icon: Users },
                      { step: '6', title: 'Knowledge & Growth', sub: language === 'gu' ? 'નવી તકો અને પ્રગતિ' : 'Opportunities', icon: Lightbulb }
                    ].map((node, index) => (
                      <div key={index} className="relative flex flex-col items-center text-center p-3 sm:p-4 bg-white rounded-2xl border border-emerald-200/80 shadow-2xs">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#159447] flex items-center justify-center mb-2">
                          <node.icon className="w-5 h-5" />
                        </div>
                        <div className="text-xs font-black text-[#18232D] leading-snug">{node.title}</div>
                        <div className="text-[10px] text-[#5B6470] mt-0.5">{node.sub}</div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* ─── 4 INITIATIVE CARDS ─── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
              
              {/* Card 1: Learning Materials */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <h3 className="font-extrabold text-base text-[#18232D] mb-2">
                    {language === 'gu' ? 'શૈક્ષણિક સામગ્રી' : language === 'hi' ? 'अध्ययन सामग्री' : 'Learning Materials'}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#5B6470] leading-relaxed">
                    {language === 'gu'
                      ? 'જરૂરિયાતમંદ વિદ્યાર્થીઓને પુસ્તકો, નોટબુક્સ, સ્ટેશનરી અને અન્ય ઉપયોગી શૈક્ષણિક સામગ્રી પૂરી પાડવી.'
                      : language === 'hi'
                      ? 'ज़रूरतमंद छात्रों को किताबें, नोटबुक, स्टेशनरी और अन्य उपयोगी शिक्षण सामग्री प्रदान करना।'
                      : 'Providing books, notebooks, stationery and other useful educational materials to students who need them.'}
                  </p>
                </div>
              </div>

              {/* Card 2: Digital Learning */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="w-11 h-11 rounded-xl bg-emerald-50 text-[#159447] flex items-center justify-center mb-4">
                    <Laptop className="w-5 h-5" />
                  </div>
                  <h3 className="font-extrabold text-base text-[#18232D] mb-2">
                    {language === 'gu' ? 'ડિજિટલ શિક્ષણ' : language === 'hi' ? 'डिजिटल शिक्षण' : 'Digital Learning'}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#5B6470] leading-relaxed">
                    {language === 'gu'
                      ? 'શક્ય હોય ત્યાં વિદ્યાર્થીઓને ડિજિટલ લર્નિંગ સંસાધનો અને ટેક્નોલોજી સુધી પહોંચ મેળવવામાં સહાય કરવી.'
                      : language === 'hi'
                      ? 'जहां संभव हो वहां छात्रों को डिजिटल शिक्षण संसाधनों और तकनीक तक पहुंच बनाने में मदद करना।'
                      : 'Helping students gain access to digital learning resources and technology where possible.'}
                  </p>
                </div>
              </div>

              {/* Card 3: Knowledge Access */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                    <Lightbulb className="w-5 h-5" />
                  </div>
                  <h3 className="font-extrabold text-base text-[#18232D] mb-2">
                    {language === 'gu' ? 'જ્ઞાનની સુલભતા' : language === 'hi' ? 'ज्ञान तक पहुंच' : 'Knowledge Access'}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#5B6470] leading-relaxed">
                    {language === 'gu'
                      ? 'ગામડાંના વિદ્યાર્થીઓને શૈક્ષણિક સામગ્રી, માર્ગદર્શન અને શીખવાની નવી તકો સાથે જોડવા.'
                      : language === 'hi'
                      ? 'ग्रामीण छात्रों को उपयोगी शैक्षणिक सामग्री, मार्गदर्शन और सीखने के अवसरों से जोड़ना।'
                      : 'Connecting students in villages with educational content, guidance and learning opportunities.'}
                  </p>
                </div>
              </div>

              {/* Card 4: Supporting Potential */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
                    <Award className="w-5 h-5" />
                  </div>
                  <h3 className="font-extrabold text-base text-[#18232D] mb-2">
                    {language === 'gu' ? 'ક્ષમતા અને આત્મવિશ્વાસ' : language === 'hi' ? 'क्षमता व आत्मविश्वास' : 'Supporting Potential'}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#5B6470] leading-relaxed">
                    {language === 'gu'
                      ? 'વિદ્યાર્થીઓનો અભ્યાસ ચાલુ રાખવામાં અને તેમના ભવિષ્ય માટે આત્મવિશ્વાસ કેળવવામાં પ્રોત્સાહન આપવું.'
                      : language === 'hi'
                      ? 'छात्रों को निरंतर सीखते रहने और उनके भविष्य के लिए आत्मविश्वास बढ़ाने में मदद करना।'
                      : 'Helping students continue learning and build confidence for their future.'}
                  </p>
                </div>
              </div>

            </div>

            {/* ─── TRANSPARENCY & FUTURE REPORTING (Realistic & Honest) ─── */}
            <div className="mt-8 bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 text-[#159447]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-sm text-[#18232D]">
                  {language === 'gu' ? 'અમારી પારદર્શકતા નીતિ' : language === 'hi' ? 'हमारी पारदर्शिता नीति' : 'Our Transparency Commitment'}
                </h4>
                <p className="text-xs text-[#5B6470] mt-0.5 leading-relaxed">
                  {language === 'gu'
                    ? 'અમે આ પહેલ હેઠળ ફાળવવામાં આવેલી રકમ અને તેના દ્વારા સમર્થિત શૈક્ષણિક પ્રવૃત્તિઓનો પારદર્શક રેકોર્ડ જાળવવાનો ઇરાદો ધરાવીએ છીએ.'
                    : language === 'hi'
                    ? 'हम इस पहल के तहत आवंटित राशि और इसके माध्यम से समर्थित शैक्षणिक गतिविधियों का पारदर्शी रिकॉर्ड बनाए रखने के लिए प्रतिबद्ध हैं।'
                    : 'We intend to maintain transparent records of the amount allocated towards this initiative and the educational activities supported through it.'}
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* ─── 5. CALL TO ACTION (Need Help With a Government Form?) ─── */}
        <section className="py-16 sm:py-20 bg-[#F8FAF9] border-t border-slate-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mx-auto shadow-xs p-2">
              <img src="/icon.png" alt="FormSeva" className="w-full h-full object-contain" />
            </div>

            <h2 className="text-2xl sm:text-4xl font-black text-[#18232D] tracking-tight">
              {language === 'gu'
                ? 'સરકારી ફોર્મ ભરવામાં સહાયની જરૂર છે?'
                : language === 'hi'
                ? 'सरकारी फॉर्म भरने में सहायता चाहिए?'
                : 'Need Help With a Government Form?'}
            </h2>

            <p className="text-sm sm:text-base text-[#5B6470] max-w-xl mx-auto">
              {language === 'gu'
                ? 'FormSeva સાથે તમારી અરજી પ્રક્રિયાને અત્યંત સરળ, સચોટ અને ઝડપી બનાવો.'
                : language === 'hi'
                ? 'FormSeva के साथ अपनी आवेदन प्रक्रिया को बेहद सरल और त्वरित बनाएं।'
                : 'Let FormSeva make the application process simpler, transparent and stress-free.'}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link
                href="/forms"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#159447] hover:bg-[#12803c] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all"
              >
                <span>{language === 'gu' ? 'બધા ફોર્મ્સ જુઓ' : language === 'hi' ? 'सभी फॉर्म देखें' : 'Explore Forms'}</span>
                <ChevronRight className="w-4 h-4" />
              </Link>

              <Link
                href="/feedback"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-[#18232D] border border-slate-200 font-bold text-sm shadow-xs transition-all"
              >
                <span>{language === 'gu' ? 'પ્રતિસાદ આપો' : language === 'hi' ? 'प्रतिक्रिया दें' : 'Share Feedback'}</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
