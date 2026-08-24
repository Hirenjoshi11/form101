'use client';

import React, { useState } from 'react';
import { RequiredDocItem } from '../lib/types';
import { useLanguage } from '../i18n/LanguageContext';
import { Upload, FileCheck, CheckCircle2, AlertCircle, FileText } from 'lucide-react';

interface Props {
  requiredDocs: RequiredDocItem[];
  uploadedFiles: Record<string, File | { name: string; size: number }>;
  onFileUpload: (docKey: string, file: File) => void;
}

export const DocumentUploader: React.FC<Props> = ({ requiredDocs, uploadedFiles, onFileUpload }) => {
  const { t, language } = useLanguage();
  const [dragActive, setDragActive] = useState<string | null>(null);

  const getDocLabel = (doc: RequiredDocItem) => {
    if (language === 'gu') return doc.label_gu;
    if (language === 'hi') return doc.label_hi;
    return doc.label_en;
  };

  const handleFileChange = (docKey: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileUpload(docKey, e.target.files[0]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs sm:text-sm text-amber-900 flex items-start gap-2.5">
        <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">
            {language === 'gu'
              ? 'દસ્તાવેજ અપલોડ માર્ગદર્શિકા:'
              : language === 'hi'
              ? 'दस्तावेज अपलोड दिशा-निर्देश:'
              : 'Document Upload Guidelines:'}
          </span>{' '}
          {language === 'gu'
            ? 'કૃપા કરીને અસલ દસ્તાવેજનો સ્પષ્ટ ફોટો અથવા PDF અપલોડ કરો (મહત્તમ સાઇઝ: ૫ MB). અસ્પષ્ટ દસ્તાવેજથી અરજી વિલંબિત થઈ શકે છે.'
            : language === 'hi'
            ? 'कृपया मूल दस्तावेज का स्पष्ट फोटो या PDF अपलोड करें (अधिकतम साइज: 5 MB)।'
            : 'Please upload clear original photo scans or PDF (Max 5 MB). Blurry documents may delay govt verification.'}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {requiredDocs.map((doc) => {
          const isUploaded = !!uploadedFiles[doc.key];
          const uploadedInfo = uploadedFiles[doc.key];

          return (
            <div
              key={doc.key}
              className={`p-4 rounded-xl border-2 transition-all ${
                isUploaded
                  ? 'border-govt-300 bg-govt-50/50'
                  : 'border-dashed border-slate-300 hover:border-govt-500 bg-white'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                      isUploaded ? 'bg-govt-100 text-govt-700' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {isUploaded ? <FileCheck className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-800">{getDocLabel(doc)}</h4>
                      {doc.required ? (
                        <span className="text-[10px] bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded">
                          {language === 'gu' ? 'ફરજિયાત' : language === 'hi' ? 'अनिवार्य' : 'Mandatory'}
                        </span>
                      ) : (
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                          {language === 'gu' ? 'મરજિયાત' : language === 'hi' ? 'વૈકલ્પિક' : 'Optional'}
                        </span>
                      )}
                    </div>
                    {isUploaded ? (
                      <p className="text-xs text-govt-700 font-medium mt-1 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {uploadedInfo.name} ({(uploadedInfo.size / (1024 * 1024)).toFixed(2)} MB)
                      </p>
                    ) : (
                      <p className="text-xs text-slate-500 mt-1">{t.uploadFilePrompt}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="cursor-pointer inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 shadow-sm transition-all">
                    <Upload className="w-3.5 h-3.5 text-govt-700" />
                    <span>
                      {isUploaded
                        ? language === 'gu'
                          ? 'બદલો'
                          : language === 'hi'
                          ? 'बदलें'
                          : 'Change'
                        : language === 'gu'
                        ? 'ફાઇલ પસંદ કરો'
                        : language === 'hi'
                        ? 'फ़ाइल चुनें'
                        : 'Choose File'}
                    </span>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange(doc.key, e)}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
