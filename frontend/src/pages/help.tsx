import Head from 'next/head';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useLanguage } from '@/i18n/LanguageContext';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

const FAQ_DATA = [
  {
    q_gu: 'ફોર્મ સેવા શું છે?',
    q_hi: 'Form Seva क्या है?',
    q_en: 'What is Form_Seva?',
    a_gu: 'ફોર્મ સેવા એ ગુજરાત સરકારના પ્રમાણપત્રો માટે ઓનલાઈન સહાયતા સેવા છે. ઓપરેટર તમારી વતી સરકારી પોર્ટલ પર ભૂલ-રહિત ફોર્મ ભરે છે.',
    a_hi: 'Form_Seva गुजरात सरकार के प्रमाण पत्रों के लिए ऑनलाइन सहायक सेवा है। ऑपरेटर आपकी ओर से सरकारी पोर्टल पर फॉर्म भरते हैं।',
    a_en: 'Form_Seva is an online assisted-filing service for Gujarat government certificates. Trained operators fill official government portal forms on your behalf.',
  },
  {
    q_gu: 'OTP ક્યાંથી આવશે?',
    q_hi: 'OTP कहाँ से आएगा?',
    q_en: 'Where does the OTP come from?',
    a_gu: 'OTP ગુજરાત સરકારના DigitalGujarat / NIC SMS સિસ્ટમ દ્વારા સીધા તમારા નોંધાયેલ મોબાઈલ નંબર પર આવે છે.',
    a_hi: 'OTP गुजरात सरकार के DigitalGujarat/NIC SMS प्रणाली द्वारा सीधे आपके पंजीकृत मोबाइल नंबर पर आता है।',
    a_en: 'The OTP is sent directly to your registered mobile number by the Gujarat Government DigitalGujarat / NIC SMS system — not by Form_Seva.',
  },
  {
    q_gu: 'મારો ડેટા સુરક્ષિત છે?',
    q_hi: 'क्या मेरा डेटा सुरक्षित है?',
    q_en: 'Is my data safe?',
    a_gu: 'હા. ફોર્મ સેવા DPDP Act 2023 અંતર્ગત ડેટા હેન્ડ કરે છે. SMS/Call permissions ક્યારેય માગવામાં આવતી નથી. તમે OTP ટાઈપ જ આપો છો.',
    a_hi: 'हाँ। Form_Seva DPDP Act 2023 के तहत डेटा संभालती है। SMS/Call अनुमति कभी नहीं माँगी जाती। आप केवल OTP टाइप करते हैं।',
    a_en: 'Yes. Form_Seva handles data under DPDP Act 2023. We never request SMS/Call permissions. You manually type the OTP — we never read your SMS.',
  },
  {
    q_gu: 'ફી પ્રક્રિયા ક્યારે?',
    q_hi: 'शुल्क कब?',
    q_en: 'When do I pay?',
    a_gu: 'ફોર્મ ભર્યા પછી — સ્ટેપ ૬ (Review) પછી UPI/Card/Net Banking દ્વારા ઓનલાઈન ચૂકવણી.',
    a_hi: 'फॉर्म भरने के बाद — चरण 6 (समीक्षा) के बाद UPI/Card/Net Banking द्वारा ऑनलाइन भुगतान।',
    a_en: 'After completing all form steps — you pay online via UPI / Card / Net Banking at Step 6 (Review & Pay).',
  },
  {
    q_gu: 'અરજી ટ્રૅક કેવી રીતે?',
    q_hi: 'आवेदन कैसे ट्रैक करें?',
    q_en: 'How to track my application?',
    a_gu: '"મારી અરજીઓ" (Track) પૃષ્ઠ પર — SMS/WhatsApp notification + real-time status.',
    a_hi: '"मेरे आवेदन" (Track) पेज पर — SMS/WhatsApp अधिसूचना + real-time स्थिति।',
    a_en: 'Go to "My Applications" (Track) — real-time status + SMS/WhatsApp notifications when approved.',
  },
];

export default function HelpPage() {
  const { language } = useLanguage();
  const [open, setOpen] = useState<number | null>(0);

  const getQ = (f: typeof FAQ_DATA[0]) => language === 'gu' ? f.q_gu : language === 'hi' ? f.q_hi : f.q_en;
  const getA = (f: typeof FAQ_DATA[0]) => language === 'gu' ? f.a_gu : language === 'hi' ? f.a_hi : f.a_en;

  return (
    <>
      <Head>
        <title>Help & FAQ — Form_Seva Gujarat</title>
        <meta name="description" content="Frequently asked questions about Form_Seva Gujarat certificate assisted-filing service." />
      </Head>
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center gap-3 mb-8">
          <HelpCircle className="w-8 h-8 text-govt-700" />
          <h1 className="text-3xl font-extrabold text-slate-900">
            {language === 'gu' ? 'મદદ અને સામાન્ય પ્રશ્નો' : language === 'hi' ? 'सहायता व सामान्य प्रश्न' : 'Help & Frequently Asked Questions'}
          </h1>
        </div>

        <div className="space-y-3">
          {FAQ_DATA.map((faq, idx) => (
            <div key={idx} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <button
                onClick={() => setOpen(open === idx ? null : idx)}
                className="w-full flex items-center justify-between px-5 py-4 text-left gap-3"
              >
                <span className="font-semibold text-slate-900 text-sm sm:text-base">{getQ(faq)}</span>
                {open === idx
                  ? <ChevronUp className="w-4 h-4 text-govt-600 shrink-0" />
                  : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
              </button>
              {open === idx && (
                <div className="px-5 pb-5 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                  {getA(faq)}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 bg-slate-50 border border-slate-200 rounded-2xl p-6 text-sm text-slate-600">
          <p className="font-semibold text-slate-800 mb-2">
            {language === 'gu' ? 'વધુ સहाय' : language === 'hi' ? 'और सहायता' : 'Still need help?'}
          </p>
          <p>
            {language === 'gu'
              ? 'support@formseva.in પર ઈ-મેઈલ કરો અથવા WhatsApp: +91-9999-000-001'
              : language === 'hi'
              ? 'support@formseva.in पर ईमेल करें या WhatsApp: +91-9999-000-001'
              : 'Email us at support@formseva.in or WhatsApp: +91-9999-000-001'}
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
}
