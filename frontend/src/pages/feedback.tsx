import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useLanguage } from '@/i18n/LanguageContext';
import { ApiService } from '@/lib/api';
import { CertificateForm } from '@/lib/types';
import {
  MessageSquare,
  Star,
  CheckCircle2,
  Send,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building2,
  HelpCircle,
  AlertCircle,
  ThumbsUp,
  RefreshCw,
  Home,
  FileText
} from 'lucide-react';

const FEEDBACK_TYPES = [
  { value: 'General Feedback', label_gu: 'સામાન્ય પ્રતિસાદ', label_hi: 'सामान्य प्रतिक्रिया', label_en: 'General Feedback' },
  { value: 'Suggestion', label_gu: 'નવા સુધારા માટે સૂચન', label_hi: 'सुझाव / नई सेवा', label_en: 'Suggestion / New Service' },
  { value: 'Service Experience', label_gu: 'સેવાનો અનુભવ', label_hi: 'सेवा का अनुभव', label_en: 'Service Experience' },
  { value: 'Technical Problem', label_gu: 'ટેકનિકલ સમસ્યા', label_hi: 'तकनीकी समस्या', label_en: 'Technical Problem' },
  { value: 'Payment Issue', label_gu: 'પેમેન્ટ / ફી સંબંધિત પ્રશ્ન', label_hi: 'भुगतान समस्या', label_en: 'Payment Issue' },
  { value: 'Form/Application Issue', label_gu: 'ફોર્મ / અરજી સંબંધિત પ્રશ્ન', label_hi: 'फॉर्म संबंधी समस्या', label_en: 'Form/Application Issue' },
  { value: 'Other', label_gu: 'અન્ય વિગત', label_hi: 'अन्य', label_en: 'Other' },
];

export default function FeedbackPage() {
  const { language } = useLanguage();
  const [forms, setForms] = useState<CertificateForm[]>([]);
  const [loadingForms, setLoadingForms] = useState(true);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [serviceId, setServiceId] = useState('general');
  const [feedbackType, setFeedbackType] = useState('General Feedback');
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [message, setMessage] = useState('');

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Load services for dropdown
    ApiService.getForms()
      .then((data) => setForms(data))
      .catch(() => setForms([]))
      .finally(() => setLoadingForms(false));

    // Autofill logged in citizen if available
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
      setErrorMessage(
        language === 'gu'
          ? 'કૃપા કરીને ઓછામાં ઓછા ૫ અક્ષરોનો પ્રતિસાદ સંદેશ દાખલ કરો.'
          : language === 'hi'
          ? 'कृपया कम से कम 5 अक्षरों का संदेश दर्ज करें।'
          : 'Please enter a feedback message with at least 5 characters.'
      );
      return;
    }

    if (rating < 1 || rating > 5) {
      setErrorMessage('Please select a rating between 1 and 5 stars.');
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
      setErrorMessage(err.message || 'Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setMessage('');
    setRating(5);
    setFeedbackType('General Feedback');
    setSubmitted(false);
    setErrorMessage(null);
  };

  return (
    <>
      <Head>
        <title>Feedback & Suggestions — FormSeva Gujarat</title>
        <meta
          name="description"
          content="Share your experience and suggestions with FormSeva. Your feedback helps us improve government form assistance for citizens."
        />
      </Head>

      <Navbar />

      <main className="bg-[#F8FAF9] min-h-screen py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {submitted ? (
            /* ─── SUCCESS STATE ─── */
            <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-md text-center space-y-6 max-w-2xl mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-[#159447] flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-black text-[#18232D]">
                  {language === 'gu'
                    ? 'તમારા પ્રતિસાદ બદલ આભાર!'
                    : language === 'hi'
                    ? 'आपकी प्रतिक्रिया के लिए धन्यवाद!'
                    : 'Thank You for Your Feedback!'}
                </h2>
                <p className="text-sm sm:text-base text-[#5B6470] max-w-md mx-auto leading-relaxed">
                  {language === 'gu'
                    ? 'તમારો પ્રતિસાદ સફળતાપૂર્વક સબમિટ થયો છે. અમે તમારા કિંમતી સમયની કદર કરીએ છીએ અને તમારા સૂચનોનો ઉપયોગ ફોર્મ સેવાને બહેતર બનાવવા માટે કરીશું.'
                    : language === 'hi'
                    ? 'आपकी प्रतिक्रिया सफलतापूर्वक दर्ज कर ली गई है। हम आपके समय की सराहना करते हैं और आपकी सलाह का उपयोग फॉर्म सेवा को बेहतर बनाने के लिए करेंगे।'
                    : 'Your feedback has been successfully submitted. We appreciate your time and will use your suggestions to improve FormSeva.'}
                </p>
              </div>

              <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-[#18232D] border border-slate-200 font-bold text-sm shadow-xs transition-all"
                >
                  <Home className="w-4 h-4" />
                  <span>{language === 'gu' ? 'મુખ્ય પૃષ્ઠ' : language === 'hi' ? 'मुख्य पृष्ठ' : 'Back to Home'}</span>
                </Link>

                <Link
                  href="/forms"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#159447] hover:bg-[#12803c] text-white font-bold text-sm shadow-sm transition-all"
                >
                  <FileText className="w-4 h-4" />
                  <span>{language === 'gu' ? 'ફોર્મ્સ જુઓ' : language === 'hi' ? 'फॉर्म देखें' : 'Explore Forms'}</span>
                </Link>

                <button
                  onClick={resetForm}
                  className="inline-flex items-center gap-1.5 text-xs text-[#5B6470] hover:text-[#159447] font-semibold transition-colors mt-2 w-full justify-center"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{language === 'gu' ? 'બીજો પ્રતિસાદ આપો' : language === 'hi' ? 'अन्य प्रतिक्रिया दें' : 'Submit Another Feedback'}</span>
                </button>
              </div>
            </div>
          ) : (
            /* ─── FEEDBACK FORM ─── */
            <div className="space-y-8">
              
              {/* Hero / Heading */}
              <div className="text-center space-y-3">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-[#159447] text-xs font-bold uppercase tracking-wider">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{language === 'gu' ? 'નાગરિક પ્રતિસાદ' : language === 'hi' ? 'नागरिक प्रतिक्रिया' : 'Citizen Feedback'}</span>
                </div>

                <h1 className="text-3xl sm:text-4xl font-black text-[#18232D] tracking-tight">
                  {language === 'gu'
                    ? 'અમે તમારા પ્રતિસાદની કદર કરીએ છીએ'
                    : language === 'hi'
                    ? 'हम आपकी प्रतिक्रिया को महत्व देते हैं'
                    : 'We Value Your Feedback'}
                </h1>

                <p className="text-sm sm:text-base text-[#5B6470] max-w-xl mx-auto">
                  {language === 'gu'
                    ? 'તમારો અનુભવ અને સૂચનો અમને FormSeva ને વધુ સરળ અને દરેક નાગરિક માટે ઉપયોગી બનાવવામાં મદદ કરે છે.'
                    : language === 'hi'
                    ? 'आपकी प्रतिक्रिया हमें FormSeva को बेहतर बनाने और सरकारी फॉर्म सहायता को हर किसी के लिए सरल बनाने में मदद करती है।'
                    : 'Your feedback helps us improve FormSeva and make Government form assistance simpler for everyone.'}
                </p>
              </div>

              {/* Main Card */}
              <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6">
                
                {errorMessage && (
                  <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-medium flex items-center gap-2.5">
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  {/* Rating Stars (1–5) */}
                  <div className="p-5 rounded-2xl bg-[#F8FAF9] border border-slate-200/80 text-center space-y-3">
                    <label className="block text-sm font-extrabold text-[#18232D]">
                      {language === 'gu'
                        ? 'તમે તમારા અનુભવને કેટલું રેટિંગ આપશો?'
                        : language === 'hi'
                        ? 'आप अपने अनुभव को कितना रेटिंग देंगे?'
                        : 'How would you rate your experience?'}
                    </label>

                    <div className="flex items-center justify-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const active = (hoverRating || rating) >= star;
                        return (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="p-1.5 focus:outline-none transition-transform hover:scale-125"
                            aria-label={`${star} star`}
                          >
                            <Star
                              className={`w-8 h-8 sm:w-10 sm:h-10 transition-colors ${
                                active
                                  ? 'fill-amber-400 text-amber-400 drop-shadow-xs'
                                  : 'text-slate-300 hover:text-amber-200'
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>

                    <div className="text-xs font-bold text-[#159447]">
                      {rating === 5 && (language === 'gu' ? '★★★★★ ઉત્કૃષ્ટ (Excellent)' : '★★★★★ Excellent')}
                      {rating === 4 && (language === 'gu' ? '★★★★☆ ખૂબ સરસ (Very Good)' : '★★★★☆ Very Good')}
                      {rating === 3 && (language === 'gu' ? '★★★☆☆ સારું (Good)' : '★★★☆☆ Good')}
                      {rating === 2 && (language === 'gu' ? '★★☆☆☆ સુધારાની જરૂર (Needs Improvement)' : '★★☆☆☆ Needs Improvement')}
                      {rating === 1 && (language === 'gu' ? '★☆☆☆☆ અસંતોષકારક (Poor)' : '★☆☆☆☆ Poor')}
                    </div>
                  </div>

                  {/* Dropdowns Row: Application/Service & Feedback Type */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    
                    {/* Application / Service */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-[#18232D] uppercase tracking-wider">
                        {language === 'gu' ? 'અરજી / સરકારી સેવા' : language === 'hi' ? 'आवेदन / सेवा' : 'Application / Service'}
                      </label>
                      <select
                        value={serviceId}
                        onChange={(e) => setServiceId(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-[#18232D] focus:outline-none focus:ring-2 focus:ring-[#159447]/30 focus:border-[#159447]"
                      >
                        <option value="general">
                          {language === 'gu' ? '★ સામાન્ય પ્રતિસાદ (General Feedback)' : '★ General Platform Feedback'}
                        </option>
                        {forms.map((f) => (
                          <option key={f.slug} value={f.slug}>
                            {language === 'gu' ? f.title_gu : language === 'hi' ? f.title_hi : f.title_en}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Feedback Type */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-[#18232D] uppercase tracking-wider">
                        {language === 'gu' ? 'પ્રતિસાદ પ્રકાર' : language === 'hi' ? 'प्रतिक्रिया प्रकार' : 'Feedback Category'}
                      </label>
                      <select
                        value={feedbackType}
                        onChange={(e) => setFeedbackType(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-[#18232D] focus:outline-none focus:ring-2 focus:ring-[#159447]/30 focus:border-[#159447]"
                      >
                        {FEEDBACK_TYPES.map((t) => (
                          <option key={t.value} value={t.value}>
                            {language === 'gu' ? t.label_gu : language === 'hi' ? t.label_hi : t.label_en}
                          </option>
                        ))}
                      </select>
                    </div>

                  </div>

                  {/* Message Textarea */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="block text-xs font-bold text-[#18232D] uppercase tracking-wider">
                        {language === 'gu' ? 'તમારો પ્રતિસાદ / સંદેશ *' : language === 'hi' ? 'आपका संदेश / सुझाव *' : 'Your Message / Experience *'}
                      </label>
                      <span className="text-[11px] text-[#5B6470]">
                        {message.length}/3000
                      </span>
                    </div>
                    <textarea
                      required
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      maxLength={3000}
                      placeholder={
                        language === 'gu'
                          ? 'તમારા અનુભવ અથવા સુધારા માટેના સૂચન વિશે વિગતવાર લખો...'
                          : language === 'hi'
                          ? 'अपने अनुभव या नए सुझाव के बारे में विस्तार से लिखें...'
                          : 'Tell us about your experience or suggestion in detail...'
                      }
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-[#18232D] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#159447]/30 focus:border-[#159447] leading-relaxed"
                    />
                  </div>

                  {/* Optional Citizen Information */}
                  <div className="pt-2 border-t border-slate-100 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#18232D] uppercase tracking-wider">
                        {language === 'gu' ? 'સંપર્ક માહિતી (વૈકલ્પિક)' : language === 'hi' ? 'संपर्क जानकारी (वैकल्पिक)' : 'Contact Details (Optional)'}
                      </span>
                      <span className="text-[11px] text-[#5B6470]">
                        {language === 'gu' ? 'જરૂર પડ્યે ફોલોઅપ માટે' : 'For follow-up if needed'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder={language === 'gu' ? 'તમારું નામ (વૈકલ્પિક)' : 'Your Name (Optional)'}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-[#18232D] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#159447]/30"
                        />
                      </div>

                      <div>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder={language === 'gu' ? 'ઈમેલ (વૈકલ્પિક)' : 'Email (Optional)'}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-[#18232D] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#159447]/30"
                        />
                      </div>

                      <div>
                        <input
                          type="tel"
                          value={mobile}
                          onChange={(e) => setMobile(e.target.value)}
                          placeholder={language === 'gu' ? 'મોબાઈલ નંબર (વૈકલ્પિક)' : 'Mobile (Optional)'}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-[#18232D] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#159447]/30"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-[#159447] hover:bg-[#12803c] text-white font-bold text-sm shadow-md hover:shadow-lg shadow-emerald-700/20 hover:scale-[1.01] transition-all disabled:opacity-50"
                    >
                      {submitting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>{language === 'gu' ? 'સબમિટ થઈ રહ્યું છે...' : 'Submitting...'}</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>{language === 'gu' ? 'પ્રતિસાદ સબમિટ કરો' : language === 'hi' ? 'प्रतिक्रिया भेजें' : 'Submit Feedback'}</span>
                        </>
                      )}
                    </button>
                  </div>

                </form>

              </div>

              {/* Privacy Note */}
              <div className="flex items-center justify-center gap-2 text-xs text-[#5B6470]">
                <ShieldCheck className="w-4 h-4 text-[#159447]" />
                <span>
                  {language === 'gu'
                    ? 'તમારો પ્રતિસાદ સુરક્ષિત રીતે સંગ્રહિત થાય છે અને સેવાની ગુણવત્તા સુધારવા માટે વપરાય છે.'
                    : 'Your feedback is securely recorded and used solely to enhance service quality.'}
                </span>
              </div>

            </div>
          )}

        </div>
      </main>

      <Footer />
    </>
  );
}
