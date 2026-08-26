'use client';

import React from 'react';
import { ServiceDocument, RequiredDocItem } from '../lib/types';
import { useLanguage } from '../i18n/LanguageContext';
import { Upload, FileCheck, CheckCircle2, AlertCircle, FileText, Info, Building } from 'lucide-react';

interface Props {
  requiredDocs: (ServiceDocument | RequiredDocItem)[];
  uploadedFiles: Record<string, File | { name: string; size: number }>;
  onFileUpload: (docKey: string, file: File) => void;
}

export const DocumentUploader: React.FC<Props> = ({ requiredDocs, uploadedFiles, onFileUpload }) => {
  const { t, language } = useLanguage();

  const getDocKey = (doc: ServiceDocument | RequiredDocItem) => {
    return 'document_type_key' in doc ? doc.document_type_key : doc.key;
  };

  const getDocLabel = (doc: ServiceDocument | RequiredDocItem) => {
    if ('name_gu' in doc && doc.name_gu) {
      return language === 'gu' ? doc.name_gu : language === 'hi' ? doc.name_hi : doc.name_en;
    }
    if ('label_gu' in doc && doc.label_gu) {
      return language === 'gu' ? doc.label_gu : language === 'hi' ? doc.label_hi : doc.label_en;
    }
    return 'Document';
  };

  const getWhereToGet = (doc: ServiceDocument | RequiredDocItem) => {
    if ('where_to_get_gu' in doc) {
      return language === 'gu' ? doc.where_to_get_gu : language === 'hi' ? doc.where_to_get_hi : doc.where_to_get_en;
    }
    return null;
  };

  const getWhyNeeded = (doc: ServiceDocument | RequiredDocItem) => {
    if ('why_needed_gu' in doc) {
      return language === 'gu' ? doc.why_needed_gu : language === 'hi' ? doc.why_needed_hi : doc.why_needed_en;
    }
    return null;
  };

  const handleFileChange = (docKey: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        alert(
          language === 'gu'
            ? 'ફાઇલ સાઇઝ ૫ MB થી ઓછી હોવી જોઈએ.'
            : language === 'hi'
            ? 'फ़ाइल का आकार 5 MB से कम होना चाहिए।'
            : 'File size must be less than 5 MB.'
        );
        return;
      }
      onFileUpload(docKey, file);
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Guidelines Banner */}
      <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 text-xs sm:text-sm text-amber-900 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-bold">
            {language === 'gu'
              ? 'દસ્તાવેજ અપલોડ માર્ગદર્શિકા:'
              : language === 'hi'
              ? 'દસ્તાવેજ અપલોડ દિશા-નિર્દેશ:'
              : 'Document Upload Guidelines:'}
          </span>{' '}
          {language === 'gu'
            ? 'કૃપા કરીને અસલ દસ્તાવેજનો સ્પષ્ટ ફોટો અથવા PDF અપલોડ કરો (મહત્તમ સાઇઝ: ૫ MB). અસ્પષ્ટ દસ્તાવેજથી અરજી વિલંબિત થઈ શકે છે.'
            : language === 'hi'
            ? 'कृपया मूल दस्तावेज का स्पष्ट फोटो या PDF अपलोड करें (अधिकतम साइज: 5 MB)।'
            : 'Please upload clear original photo scans or PDF (Max 5 MB). Clear documents ensure fast approval.'}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:gap-4">
        {requiredDocs.map((doc) => {
          const docKey = getDocKey(doc);
          const isUploaded = !!uploadedFiles[docKey];
          const uploadedInfo = uploadedFiles[docKey];
          const isMandatory = 'required_level' in doc ? doc.required_level === 'mandatory' : ('required' in doc ? doc.required : true);
          const isConditional = 'required_level' in doc ? doc.required_level === 'conditional' : false;
          const whereToGet = getWhereToGet(doc);
          const whyNeeded = getWhyNeeded(doc);

          return (
            <div
              key={docKey}
              className={`p-4 sm:p-5 rounded-2xl border-2 transition-all space-y-3 ${
                isUploaded
                  ? 'border-emerald-300 bg-emerald-50/40'
                  : 'border-dashed border-slate-200 hover:border-[#159447]/60 bg-white'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isUploaded ? 'bg-emerald-100 text-[#159447]' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {isUploaded ? <FileCheck className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 break-words">
                        {getDocLabel(doc)}
                      </h4>
                      {isMandatory ? (
                        <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded-full">
                          {t.badgeMandatory}
                        </span>
                      ) : isConditional ? (
                        <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                          {t.badgeConditional}
                        </span>
                      ) : (
                        <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-full">
                          {t.badgeOptional}
                        </span>
                      )}
                    </div>
                    {isUploaded ? (
                      <p className="text-xs text-emerald-700 font-semibold mt-1 flex items-center gap-1 truncate">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">
                          {uploadedInfo.name} ({(uploadedInfo.size / (1024 * 1024)).toFixed(2)} MB)
                        </span>
                      </p>
                    ) : (
                      <p className="text-xs text-slate-500 mt-0.5">{t.uploadFilePrompt}</p>
                    )}
                  </div>
                </div>

                <div className="self-start sm:self-center shrink-0 w-full sm:w-auto">
                  <label className="cursor-pointer inline-flex items-center justify-center gap-2 w-full sm:w-auto min-h-[44px] px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-2xs hover:shadow transition-all">
                    <Upload className="w-4 h-4 text-[#159447]" />
                    <span>
                      {isUploaded
                        ? language === 'gu'
                          ? 'બદલો'
                          : language === 'hi'
                          ? 'बदलें'
                          : 'Change File'
                        : language === 'gu'
                        ? 'ફાઇલ પસંદ કરો'
                        : language === 'hi'
                        ? 'फ़ाइल चुनें'
                        : 'Choose File'}
                    </span>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange(docKey, e)}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Where to get Helper Box */}
              {(whereToGet || whyNeeded) && (
                <div className="pt-2 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] text-slate-600">
                  {whyNeeded && (
                    <div className="flex items-start gap-1.5">
                      <Info className="w-3.5 h-3.5 text-[#159447] shrink-0 mt-0.5" />
                      <span>{whyNeeded}</span>
                    </div>
                  )}
                  {whereToGet && (
                    <div className="flex items-start gap-1.5 text-emerald-800">
                      <Building className="w-3.5 h-3.5 text-[#159447] shrink-0 mt-0.5" />
                      <span>{whereToGet}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
