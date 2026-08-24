'use client';

import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { Language } from '../i18n/translations';
import { Globe } from 'lucide-react';

export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  const options: { code: Language; label: string; subLabel: string }[] = [
    { code: 'gu', label: 'ગુજરાતી', subLabel: 'Gujarati' },
    { code: 'hi', label: 'हिन्दी', subLabel: 'Hindi' },
    { code: 'en', label: 'English', subLabel: 'English' },
  ];

  return (
    <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg p-1 shadow-sm">
      <Globe className="w-4 h-4 text-govt-700 ml-1.5 hidden sm:inline" />
      <div className="flex gap-1">
        {options.map((opt) => (
          <button
            key={opt.code}
            onClick={() => setLanguage(opt.code)}
            className={`px-2.5 py-1 text-xs sm:text-sm font-medium rounded-md transition-all ${
              language === opt.code
                ? 'bg-blue-600 text-white shadow-sm font-semibold'
                : 'text-slate-700 hover:bg-slate-200/70'
            }`}
            title={opt.subLabel}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
};
