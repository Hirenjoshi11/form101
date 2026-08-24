'use client';

import React, { useState, useEffect } from 'react';
import { OtpRequest } from '../lib/types';
import { useLanguage } from '../i18n/LanguageContext';
import { ShieldCheck, Lock, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        {/* Header Strip */}
        <div className="bg-gradient-to-r from-govt-800 to-govt-700 p-5 text-white flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center border border-white/20">
            <Lock className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <h3 className="font-bold text-lg leading-snug">{t.otpModalTitle}</h3>
            <p className="text-xs text-govt-100">{getPurpose()}</p>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {success ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-govt-100 text-govt-700 flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-slate-800">
                {language === 'gu' ? 'OTP સફળતાપૂર્વક મોકલાયો!' : language === 'hi' ? 'OTP सफलतापूर्वक भेजा गया!' : 'OTP Sent Successfully!'}
              </h4>
              <p className="text-sm text-slate-500">
                {language === 'gu'
                  ? 'ઓપરેટર સરકારી પોર્ટલ પર ફોર્મ જમા કરી રહ્યા છે.'
                  : language === 'hi'
                  ? 'ऑपरेटर पोर्टल पर आपका फॉर्म जमा कर रहे हैं।'
                  : 'Operator is now completing your submission on the portal.'}
              </p>
            </div>
          ) : (
            <>
              <p className="text-sm text-slate-700 leading-relaxed">{t.otpModalSubtitle}</p>

              {/* DPDP Privacy Badge */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-slate-600">
                <ShieldCheck className="w-4 h-4 text-govt-600 shrink-0 mt-0.5" />
                <span>{t.otpAssistedNotice}</span>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      {language === 'gu' ? 'મોબાઇલ પર આવેલ OTP' : language === 'hi' ? 'प्राप्त OTP' : 'Govt SMS OTP'}
                    </label>
                    <span className="text-xs text-amber-700 font-semibold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
                    </span>
                  </div>
                  <input
                    type="text"
                    maxLength={8}
                    autoFocus
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••••"
                    className="w-full text-center text-3xl font-mono tracking-widest py-3 px-4 rounded-xl border-2 border-govt-600 focus:ring-4 focus:ring-govt-100 outline-none text-slate-900"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-2.5 px-4 text-sm font-semibold rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    {language === 'gu' ? 'પછી દાખલ કરો' : language === 'hi' ? 'बाद में' : 'Later'}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || code.length < 4}
                    className="flex-1 py-2.5 px-4 text-sm font-bold rounded-xl bg-govt-700 hover:bg-govt-800 text-white shadow-md disabled:opacity-50 transition-all flex items-center justify-center gap-2"
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
