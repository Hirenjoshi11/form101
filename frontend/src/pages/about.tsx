import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useLanguage } from '@/i18n/LanguageContext';
import { ApiService } from '@/lib/api';
import { CertificateForm } from '@/lib/types';
import {
  FileText, ShieldCheck, Heart, Users, CheckCircle2,
  Lock, Sparkles, Building2, MessageSquare, Star, Send, Loader2,
  GraduationCap, BookOpen, Award
} from 'lucide-react';

const FEEDBACK_TYPES = [
  { value: 'General Feedback', label_gu: 'સામાન્ય પ્રતિસાદ', label_hi: 'सामान्य प्रतिक्रिया', label_en: 'General Feedback' },
  { value: 'Suggestion', label_gu: 'નવા સુધારા માટે સૂચન', label_hi: 'सुझाव / नई सेवा', label_en: 'Suggestion / New Service' },
  { value: 'Service Experience', label_gu: 'સેવાનો અનુભવ', label_hi: 'सेवा का अनुभव', label_en: 'Service Experience' },
  { value: 'Technical Problem', label_gu: 'ટેકનિકલ સમસ્યા', label_hi: 'तकनीकी समस्या', label_en: 'Technical Problem' },
  { value: 'Other', label_gu: 'અન્ય', label_hi: 'अन्य', label_en: 'Other' },
];

export default function AboutPage() {
  const { language } = useLanguage();
  const [forms, setForms] = useState<CertificateForm[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [serviceId, setServiceId] = useState('general');
  const [feedbackType, setFeedbackType] = useState('General Feedback');
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [message, setMessage] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    ApiService.getForms().then(setForms).catch(() => setForms([]));
    const user = ApiService.getCurrentUser();
    if (user) {
      if (user.full_name) setName(user.full_name);
      if (user.email) setEmail(user.email);
      if (user.phone) setMobile(user.phone);
    }
  }, []);

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!message || message.trim().length < 5) {
      setErrorMessage('Please enter at least 5 characters in feedback.');
      return;
    }

    setSubmitting(true);
    try {
      await ApiService.submitFeedback({
        name: name.trim() || undefined,
        email: email.trim() || undefined,
        mobile: mobile.trim() || undefined,
        service_id: serviceId,
        feedback_type: feedbackType,
        rating,
        message: message.trim()
      });
      setSubmitted(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit feedback.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Head>
        <title>About Us &amp; 7% Education Pledge — FormSeva Gujarat</title>
        <meta
          name="description"
          content="Learn about FormSeva Gujarat, our 7% profit education pledge for children, and submit citizen feedback."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>

      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
        
        {/* ─── ABOUT US SECTION ─── */}
        <section className="space-y-4 sm:space-y-6">
          {/* Header Hero */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-slate-200/80 shadow-xs space-y-2.5 sm:space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[#159447] text-[11px] sm:text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Gujarat Citizen Empowerment</span>
            </div>
            <h1 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
              About Form<span className="text-[#159447]">Seva</span> Gujarat
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl font-medium">
              We save your time by handling the process of learning, filling, verifying, and submitting your forms on Digital Gujarat, AnyRoR, and national government portals.
            </p>
          </div>

          {/* ─── 7% PROFIT EDUCATION PLEDGE SPOTLIGHT ─── */}
          <div className="bg-gradient-to-br from-rose-50 via-pink-50 to-amber-50 rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-rose-200/80 shadow-xs relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-md shadow-rose-500/20 shrink-0">
                <GraduationCap className="w-8 h-8" />
              </div>
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider bg-rose-600 text-white px-2.5 py-0.5 rounded-full">
                    Our Social Commitment
                  </span>
                  <span className="text-xs font-bold text-rose-800">
                    7% Profit Pledge
                  </span>
                </div>
                <h2 className="text-base sm:text-xl font-black text-slate-900 leading-snug">
                  {language === 'gu' ? (
                    'અમારા નફાના ૭% બાળકોના શિક્ષણ અને ઉજ્જવળ શિક્ષિત ભવિષ્ય માટે ઉપયોગમાં લેવાશે.'
                  ) : language === 'hi' ? (
                    'हमारे मुनाफे का 7% बच्चों की शिक्षा और एक बेहतर शिक्षित भविष्य के लिए उपयोग किया जाएगा।'
                  ) : (
                    '7% of our profit will be used in education of children, for a better educated future.'
                  )}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {language === 'gu'
                    ? 'દર વખતે જ્યારે તમે FormSeva નો ઉપયોગ કરો છો, ત્યારે તમે ગુજરાતના ગ્રામીણ અને વંચિત બાળકોના ડિજિટલ શિક્ષણ, પુસ્તકો અને શિષ્યવૃત્તિમાં સીધું યોગદાન આપો છો.'
                    : language === 'hi'
                    ? 'हर बार जब आप FormSeva का उपयोग करते हैं, तो आप ग्रामीण गुजरात के बच्चों की डिजिटल शिक्षा और बेहतर भविष्य में योगदान करते हैं।'
                    : 'Every time you file through FormSeva, you directly support rural digital literacy, school books, and scholarships for children across Gujarat.'}
                </p>
              </div>
            </div>
          </div>

          {/* 3 Core Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-1.5 sm:space-y-2">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-100 text-[#159447] flex items-center justify-center font-bold">
                <FileText className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-xs sm:text-sm text-slate-900">Assisted Filing</h3>
              <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed">
                Zero cyber café queues. Certified operators ensure accurate data entry and instant submission.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-1.5 sm:space-y-2">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-100 text-[#159447] flex items-center justify-center font-bold">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-xs sm:text-sm text-slate-900">DPDP Act 2023</h3>
              <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed">
                No automated background SMS snooping. OTPs are securely and manually entered by citizens.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-1.5 sm:space-y-2">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-100 text-[#159447] flex items-center justify-center font-bold">
                <Heart className="w-4 h-4 text-rose-500" />
              </div>
              <h3 className="font-bold text-xs sm:text-sm text-slate-900">Education Support</h3>
              <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed">
                7% platform profit earmarked for rural school digital labs and educational development.
              </p>
            </div>
          </div>

          {/* Supported Portals */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-xs space-y-2.5 sm:space-y-3">
            <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Supported Gujarat Government Systems
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-start gap-2.5">
                <Building2 className="w-4 h-4 text-slate-600 mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold text-slate-900 block">Digital Gujarat Portal</span>
                  <span className="text-[11px] sm:text-xs text-slate-500">Income, Caste, EWS, Non-Creamy Layer, Character Certificates</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-start gap-2.5">
                <Building2 className="w-4 h-4 text-slate-600 mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold text-slate-900 block">AnyRoR &amp; Revenue Dept</span>
                  <span className="text-[11px] sm:text-xs text-slate-500">7/12 Land Records, 8-A Khata Extracts, e-Dhara services</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── AT THE BELOW: CITIZEN FEEDBACK & SUGGESTIONS ─── */}
        <section id="feedback" className="pt-2">
          {submitted ? (
            <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-emerald-200 shadow-xs text-center space-y-3 sm:space-y-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-emerald-100 text-[#159447] flex items-center justify-center mx-auto shadow-2xs">
                <CheckCircle2 className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900">
                {language === 'gu' ? 'તમારા પ્રતિસાદ બદલ આભાર!' : 'Thank You for Your Feedback!'}
              </h2>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Your feedback has been saved and shared with the administration team.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setMessage('');
                }}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
              >
                Submit another response
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-slate-200/90 shadow-xs space-y-4 sm:space-y-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-[#159447]" />
                  <h2 className="text-lg sm:text-xl font-black text-slate-900">
                    {language === 'gu' ? 'નાગરિક પ્રતિસાદ અને સૂચનો' : 'Citizen Feedback & Suggestions'}
                  </h2>
                </div>
                <p className="text-xs text-slate-500">
                  Share your experience, rate our services, or suggest new government certificate workflows
                </p>
              </div>

              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleSubmitFeedback} className="space-y-3.5 sm:space-y-4">
                {/* Star Rating */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Your Rating
                  </label>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 transition hover:scale-110"
                      >
                        <Star
                          className={`w-6 h-6 sm:w-7 sm:h-7 ${
                            (hoverRating || rating) >= star
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-200'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-slate-600 ml-1.5">
                      {rating} / 5 Stars
                    </span>
                  </div>
                </div>

                {/* Category & Service */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Feedback Category
                    </label>
                    <select
                      value={feedbackType}
                      onChange={(e) => setFeedbackType(e.target.value)}
                      className="w-full min-h-[44px] px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#159447]/30"
                    >
                      {FEEDBACK_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {language === 'gu' ? t.label_gu : t.label_en}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Related Service
                    </label>
                    <select
                      value={serviceId}
                      onChange={(e) => setServiceId(e.target.value)}
                      className="w-full min-h-[44px] px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#159447]/30"
                    >
                      <option value="general">General (All Services)</option>
                      {forms.map((f) => (
                        <option key={f.slug} value={f.slug}>
                          {f.title_en}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Your Feedback / Suggestions
                  </label>
                  <textarea
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us about your experience or suggest improvements..."
                    className="w-full min-h-[88px] px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#159447]/30 resize-none"
                    required
                  />
                </div>

                {/* Optional Contact */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your Name"
                      className="w-full min-h-[44px] px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#159447]/30"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Mobile / Email (Optional)
                    </label>
                    <input
                      type="text"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="+91..."
                      className="w-full min-h-[44px] px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#159447]/30"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full min-h-[44px] py-3 rounded-xl bg-[#159447] hover:bg-[#12803c] text-white text-xs sm:text-sm font-bold shadow-xs transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <Send className="w-4 h-4" />
                  <span>Submit Feedback</span>
                </button>
              </form>
            </div>
          )}
        </section>

      </main>

      <Footer />
    </div>
  );
}
