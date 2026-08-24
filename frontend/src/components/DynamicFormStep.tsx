'use client';

import React from 'react';
import { FormField } from '../lib/types';
import { useLanguage } from '../i18n/LanguageContext';

interface Props {
  fields: FormField[];
  values: Record<string, any>;
  errors: Record<string, string>;
  onChange: (fieldKey: string, value: any) => void;
}

export const DynamicFormStep: React.FC<Props> = ({ fields, values, errors, onChange }) => {
  const { language } = useLanguage();

  const getLabel = (field: FormField) => {
    if (language === 'gu') return field.label_gu;
    if (language === 'hi') return field.label_hi;
    return field.label_en;
  };

  const getPlaceholder = (field: FormField) => {
    if (language === 'gu') return field.placeholder_gu || '';
    if (language === 'hi') return field.placeholder_hi || '';
    return field.placeholder_en || '';
  };

  const getHelpText = (field: FormField) => {
    if (language === 'gu') return field.help_text_gu;
    if (language === 'hi') return field.help_text_hi;
    return field.help_text_en;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {fields.map((field) => {
        const value = values[field.field_key] || '';
        const error = errors[field.field_key];
        const isFullWidth = field.field_type === 'textarea' || field.step_section === 'address';

        return (
          <div
            key={field.id || field.field_key}
            className={`space-y-1.5 ${isFullWidth ? 'md:col-span-2' : ''}`}
          >
            <label className="block text-sm font-bold text-slate-800">
              {getLabel(field)}
              {field.is_required && <span className="text-red-500 ml-1 font-extrabold">*</span>}
            </label>

            {field.field_type === 'textarea' ? (
              <textarea
                value={value}
                onChange={(e) => onChange(field.field_key, e.target.value)}
                placeholder={getPlaceholder(field)}
                rows={3}
                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-800 bg-white focus:ring-2 focus:ring-govt-600 focus:border-govt-600 transition-all ${
                  error ? 'border-red-400 bg-red-50/20' : 'border-slate-300'
                }`}
              />
            ) : field.field_type === 'select' ? (
              <select
                value={value}
                onChange={(e) => onChange(field.field_key, e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-800 bg-white focus:ring-2 focus:ring-govt-600 focus:border-govt-600 transition-all ${
                  error ? 'border-red-400 bg-red-50/20' : 'border-slate-300'
                }`}
              >
                <option value="">
                  {language === 'gu' ? '-- પસંદ કરો --' : language === 'hi' ? '-- चुनें --' : '-- Select --'}
                </option>
                {field.options_json?.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {language === 'gu' ? opt.label_gu : language === 'hi' ? opt.label_hi : opt.label_en}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={field.field_type === 'number' ? 'number' : field.field_type === 'date' ? 'date' : 'text'}
                value={value}
                onChange={(e) => onChange(field.field_key, e.target.value)}
                placeholder={getPlaceholder(field)}
                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-800 bg-white focus:ring-2 focus:ring-govt-600 focus:border-govt-600 transition-all ${
                  error ? 'border-red-400 bg-red-50/20' : 'border-slate-300'
                }`}
              />
            )}

            {getHelpText(field) && (
              <p className="text-xs text-slate-500">{getHelpText(field)}</p>
            )}
            {error && <p className="text-xs font-semibold text-red-600">{error}</p>}
          </div>
        );
      })}
    </div>
  );
};
