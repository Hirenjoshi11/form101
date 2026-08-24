'use client';

import React, { useState, useEffect } from 'react';
import { OtpRequest } from '../lib/types';
import { useLanguage } from '../i18n/LanguageContext';
import { ShieldCheck, Lock, AlertTriangle, CheckCircle2, Clock, X } from 'lucide-react';

interface Props {
  otpRequest: OtpRequest;
  isOpen: boolean;
  onClose: () => void;
  onSubmitOtp: (otpCode: string) => Promise<void>;
}

export const OtpModal: React.FC<Props> = ({ otpRequest, isOpen, onClose, onSubmitOtp }) => {
  const { t, language } = useLanguage();
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 mins in seconds

  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim().length < 4) return;
    setIsSubmitting(true);
    try {
      await onSubmitOtp(code.trim());
      setSuccess(true);
      setTimeout(() => {
        setIsSubmitting(false);
        setSuccess(false);
        onClose();
      }, 1800);
    } catch (err) {
      setIsSubmitting(false);
    }
  };

  const getPurpose = () => {
    if (language === 'gu') return otpRequest.otp_purpose_gu;
    if (language === 'hi') return otpRequest.otp_purpose_hi;
    return otpRequest.otp_purpose_en;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 max-h-[90vh] flex flex-col animate-slide-up">
        
        {/* Header Strip */}
        <div className="bg-gradient-to-r from-[#18232D] via-slate-800 to-[#159447] p-4 sm:p-5 text-white flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center border border-white/20 shrink-0">
              <Lock className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg leading-snug">{t.otpModalTitle}</h3>
              <p className="text-xs text-emerald-100/90">{getPurpose()}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
            aria-label="Close Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto">
          {success ? (
            <div className="py-6 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-[#159447] flex items-center justify-center mx-auto animate-bounce shadow-xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-slate-800">
                {language === 'gu' ? 'OTP સફળતાપૂર્વક મોકલાયો!' : language === 'hi' ? 'OTP सफलतापूर्वक भेजा गया!' : 'OTP Sent Successfully!'}
              </h4>
              <p className="text-xs sm:text-sm text-slate-500 max-w-xs mx-auto">
                {language === 'gu'
                  ? 'ઓપરેટર સરકારી પોર્ટલ પર ફોર્મ જમા કરી રહ્યા છે.'
                  : language === 'hi'
                  ? 'ऑपरेटर पोर्टल पर आपका फॉर्म जमा कर रहे हैं।'
                  : 'Operator is now completing your submission on the portal.'}
              </p>
            </div>
          ) : (
            <>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">{t.otpModalSubtitle}</p>

              {/* DPDP Privacy Badge */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 flex items-start gap-2.5 text-xs text-slate-600">
                <ShieldCheck className="w-4 h-4 text-[#159447] shrink-0 mt-0.5" />
                <span className="leading-relaxed">{t.otpAssistedNotice}</span>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      {language === 'gu' ? 'મોબાઇલ પર આવેલ OTP' : language === 'hi' ? 'प्राप्त OTP' : 'Govt SMS OTP'}
                    </label>
                    <span className="text-xs text-amber-700 font-semibold flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      <Clock className="w-3.5 h-3.5" />
                      {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
                    </span>
                  </div>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={8}
                    autoFocus
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••••"
                    className="w-full text-center text-2xl sm:text-3xl font-mono tracking-widest py-3 px-4 rounded-2xl border-2 border-[#159447] focus:ring-4 focus:ring-emerald-100 outline-none text-slate-900 bg-white"
                  />
                </div>

                <div className="flex flex-col-reverse sm:flex-row gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full sm:w-1/2 min-h-[44px] py-2.5 px-4 text-xs sm:text-sm font-bold rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    {language === 'gu' ? 'પછી દાખલ કરો' : language === 'hi' ? 'बाद में' : 'Later'}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || code.length < 4}
                    className="w-full sm:w-1/2 min-h-[44px] py-2.5 px-4 text-xs sm:text-sm font-bold rounded-xl bg-[#159447] hover:bg-[#12803c] text-white shadow-md disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : null}
                    <span>{t.otpSubmitButton}</span>
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
