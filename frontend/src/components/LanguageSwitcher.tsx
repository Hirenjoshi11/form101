'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { Language } from '../i18n/translations';
import { Globe, ChevronDown, Check } from 'lucide-react';

export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const options: { code: Language; label: string; nativeName: string }[] = [
    { code: 'gu', label: 'ગુજરાતી', nativeName: 'Gujarati' },
    { code: 'en', label: 'English', nativeName: 'English' },
    { code: 'hi', label: 'हिन्दी', nativeName: 'Hindi' },
  ];

  const currentOption = options.find((opt) => opt.code === language) || options[0];

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Dropdown Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold shadow-2xs hover:shadow-xs transition-all focus:outline-none focus:ring-2 focus:ring-[#159447]/30"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <Globe className="w-3.5 h-3.5 text-[#159447] shrink-0" />
        <span>{currentOption.label}</span>
        <ChevronDown
          className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-slate-700' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-36 bg-white rounded-2xl shadow-lg border border-slate-200/90 py-1.5 z-50 animate-fadeIn">
          <div className="px-3 py-1 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
            Select Language
          </div>
          {options.map((opt) => {
            const isSelected = language === opt.code;
            return (
              <button
                key={opt.code}
                onClick={() => {
                  setLanguage(opt.code);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left transition-colors ${
                  isSelected
                    ? 'bg-emerald-50 text-[#159447] font-bold'
                    : 'text-slate-700 hover:bg-slate-50 font-medium'
                }`}
              >
                <div className="flex flex-col">
                  <span>{opt.label}</span>
                  <span className="text-[10px] text-slate-400 font-normal">{opt.nativeName}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-[#159447] shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
