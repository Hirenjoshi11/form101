import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useLanguage } from '@/i18n/LanguageContext';
import { ApiService } from '@/lib/api';
import { CertificateForm } from '@/lib/types';
import {
  MessageSquare, Star, CheckCircle2, Send, Loader2, Sparkles
} from 'lucide-react';

const FEEDBACK_TYPES = [
  { value: 'General Feedback', label_gu: 'સામાન્ય પ્રતિસાદ', label_hi: 'सामान्य प्रतिक्रिया', label_en: 'General Feedback' },
  { value: 'Suggestion', label_gu: 'નવા સુધારા માટે સૂચન', label_hi: 'सुझाव / नई सेवा', label_en: 'Suggestion / New Service' },
  { value: 'Service Experience', label_gu: 'સેવાનો અનુભવ', label_hi: 'सेवा का अनुभव', label_en: 'Service Experience' },
  { value: 'Technical Problem', label_gu: 'ટેકનિકલ સમસ્યા', label_hi: 'तकनीकी समस्या', label_en: 'Technical Problem' },
  { value: 'Other', label_gu: 'અન્ય', label_hi: 'अन्य', label_en: 'Other' },
];

export default function FeedbackPage() {
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

  const handleSubmit = async (e: React.FormEvent) => {
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
        <title>Citizen Feedback — FormSeva Gujarat</title>
      </Head>
      <Navbar />

      <main className="flex-1 max-w-xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {submitted ? (
          <div className="bg-white rounded-3xl p-8 border border-emerald-200 shadow-sm text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-[#159447] flex items-center justify-center mx-auto shadow-2xs">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-black text-slate-900">
              {language === 'gu' ? 'તમારા પ્રતિસાદ બદલ આભાર!' : 'Thank You for Your Feedback!'}
            </h2>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Your feedback has been recorded in the platform administration ledger.
            </p>
            <div className="pt-2">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#159447] hover:bg-[#12803c] text-white text-xs font-bold shadow-xs transition"
              >
                Return to Dashboard
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <MessageSquare className="w-5 h-5 text-[#159447]" />
                <h1 className="text-xl font-black text-slate-900">
                  {language === 'gu' ? 'નાગરિક પ્રતિસાદ અને સૂચનો' : 'Citizen Feedback & Rating'}
                </h1>
              </div>
              <p className="text-xs text-slate-500">
                Help us improve Gujarat citizen assisted services
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Star Rating */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Rating
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 text-2xl transition hover:scale-110"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          (hoverRating || rating) >= star
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-200'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-600 ml-2">
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
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#159447]/30"
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
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#159447]/30"
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

              {/* Feedback Message */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Your Feedback / Suggestions
                </label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us about your filing experience or suggest improvements..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#159447]/30 resize-none"
                  required
                />
              </div>

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
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#159447]/30"
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
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#159447]/30"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 rounded-xl bg-[#159447] hover:bg-[#12803c] text-white text-xs font-bold shadow-xs transition flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <Send className="w-3.5 h-3.5" />
                <span>Submit Feedback</span>
              </button>
            </form>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
