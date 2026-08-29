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

  const handleFieldChange = (fieldKey: string, val: any) => {
    onChange(fieldKey, val);

    // Auto-calculate Total Annual Income for Income Certificate
    if (
      fieldKey === 'income_salary' ||
      fieldKey === 'income_agriculture' ||
      fieldKey === 'income_business' ||
      fieldKey === 'income_other'
    ) {
      const salary = parseFloat(fieldKey === 'income_salary' ? val : values.income_salary || '0') || 0;
      const agri = parseFloat(fieldKey === 'income_agriculture' ? val : values.income_agriculture || '0') || 0;
      const biz = parseFloat(fieldKey === 'income_business' ? val : values.income_business || '0') || 0;
      const other = parseFloat(fieldKey === 'income_other' ? val : values.income_other || '0') || 0;
      const total = salary + agri + biz + other;
      if (total > 0) {
        onChange('annual_income', total.toString());
      }
    }
  };

  const getOptions = (field: FormField) => {
    if (!field.options_json) return [];
    if (Array.isArray(field.options_json)) return field.options_json;
    if (typeof field.options_json === 'string') {
      try {
        const parsed = JSON.parse(field.options_json);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
      {fields.map((field) => {
        const value = values[field.field_key] !== undefined ? values[field.field_key] : '';
        const error = errors[field.field_key];
        const options = getOptions(field);
        const isFullWidth =
          field.field_type === 'textarea' ||
          field.field_key === 'residential_address' ||
          field.field_key === 'building_society' ||
          field.field_key === 'street_road' ||
          field.field_key === 'caste_subcaste' ||
          field.field_key === 'sebc_caste_name' ||
          field.field_key === 'candidate_name' ||
          field.field_key === 'applicant_name' ||
          field.field_key === 'income_purpose' ||
          field.field_key === 'rto_office' ||
          field.field_key === 'licence_type' ||
          field.field_key === 'record_type';

        return (
          <div
            key={field.id || field.field_key}
            className={`space-y-1.5 ${isFullWidth ? 'sm:col-span-2' : ''}`}
          >
            <label className="block text-xs sm:text-sm font-bold text-slate-800">
              {getLabel(field)}
              {field.is_required && <span className="text-rose-500 ml-1 font-black">*</span>}
            </label>

            {field.field_type === 'textarea' ? (
              <textarea
                value={value}
                onChange={(e) => handleFieldChange(field.field_key, e.target.value)}
                placeholder={getPlaceholder(field)}
                rows={3}
                className={`w-full min-h-[88px] px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#159447]/30 focus:border-[#159447] transition-all ${
                  error ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                }`}
              />
            ) : field.field_type === 'select' ? (
              <select
                value={value}
                onChange={(e) => handleFieldChange(field.field_key, e.target.value)}
                className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#159447]/30 focus:border-[#159447] transition-all ${
                  error ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                }`}
              >
                <option value="">
                  {language === 'gu' ? '-- પસંદ કરો --' : language === 'hi' ? '-- चुनें --' : '-- Select --'}
                </option>
                {options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {language === 'gu' ? opt.label_gu : language === 'hi' ? opt.label_hi : opt.label_en}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={field.field_type === 'number' ? 'number' : field.field_type === 'date' ? 'date' : 'text'}
                value={value}
                onChange={(e) => handleFieldChange(field.field_key, e.target.value)}
                placeholder={getPlaceholder(field)}
                className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#159447]/30 focus:border-[#159447] transition-all ${
                  error ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                }`}
              />
            )}

            {getHelpText(field) && (
              <p className="text-[11px] text-slate-500 leading-tight">{getHelpText(field)}</p>
            )}
            {error && <p className="text-xs font-semibold text-rose-600">{error}</p>}
          </div>
        );
      })}
    </div>
  );
};
