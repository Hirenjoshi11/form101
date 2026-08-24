import React from 'react';
import { FormSubmission } from '@/lib/types';
import { useLanguage } from '@/i18n/LanguageContext';
import { downloadCertificatePdf, downloadReceiptPdf } from '@/lib/certificatePdf';
import {
  X,
  Download,
  Printer,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Building,
  QrCode,
  Sparkles,
  ExternalLink,
  Award
} from 'lucide-react';

interface CertificateModalProps {
  submission: FormSubmission | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  submission,
  isOpen,
  onClose,
}) => {
  const { language, t } = useLanguage();

  if (!isOpen || !submission) return null;

  const isApproved = submission.status === 'approved';
  const issueDate = submission.completed_at
    ? new Date(submission.completed_at).toLocaleDateString('en-IN')
    : new Date().toLocaleDateString('en-IN');
  const validUntil = new Date(new Date().setFullYear(new Date().getFullYear() + 3)).toLocaleDateString('en-IN');
  const certNumber = `GJ-CERT-${submission.application_number.replace('FS-', '')}-${new Date().getFullYear()}`;
  const govtRef = submission.govt_portal_application_id || `DG-GJ-881920`;

  const applicantName = submission.field_values?.applicant_name || submission.user_name || 'Rameshchandra B. Patel';
  const fatherName = submission.field_values?.father_husband_name || submission.field_values?.father_name || 'Kanjibhai Patel';
  const address =
    submission.field_values?.residential_address ||
    `${submission.field_values?.village_city || 'Vastral'}, ${submission.field_values?.taluka || 'Daskroi'}, ${submission.field_values?.district || 'Ahmedabad'}`;
  const district = submission.field_values?.district || 'Ahmedabad (અમદાવાદ)';
  const taluka = submission.field_values?.taluka || 'Daskroi (દસક્રોઈ)';
  const income = submission.field_values?.annual_income
    ? `₹ ${Number(submission.field_values.annual_income).toLocaleString('en-IN')}/-`
    : '₹ 1,20,000/-';

  const formTitle = submission.form_title_en || 'Gujarat Government Certificate';
  const formTitleGu = submission.form_title_gu || 'ગુજરાત સરકાર સત્તાવાર પ્રમાણપત્ર';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Top Action Header */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                {language === 'gu' ? 'સત્તાવાર ડિજિટલ પ્રમાણપત્ર પૂર્વાવલોકન' : language === 'hi' ? 'आधिकारिक डिजिटल प्रमाण पत्र पूर्वावलोकन' : 'Official Digital Certificate Preview'}
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500 text-white uppercase tracking-wider">
                  Verified
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">{certNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Certificate Display Area */}
        <div className="p-5 sm:p-7 max-h-[75vh] overflow-y-auto bg-slate-50">
          <div className="bg-white border-4 border-double border-blue-900 rounded-xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
            {/* Background Watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-5 rotate-[-25deg]">
              <span className="text-6xl font-black text-blue-950 uppercase tracking-widest">
                GOVT OF GUJARAT
              </span>
            </div>

            {/* Certificate Header */}
            <div className="flex items-center justify-between border-b-2 border-blue-900 pb-4 mb-5 gap-3">
              <div className="w-12 h-12 rounded-full border-2 border-red-700 bg-red-50 flex items-center justify-center text-red-700 shrink-0 font-bold text-xs">
                <Building className="w-6 h-6" />
              </div>
              <div className="text-center flex-1">
                <h4 className="text-base sm:text-lg font-bold text-red-700 leading-tight">
                  ગુજરાત સરકાર &bull; મહેસૂલ વિભાગ
                </h4>
                <h5 className="text-xs sm:text-sm font-extrabold text-blue-950 uppercase tracking-wide">
                  GOVERNMENT OF GUJARAT
                </h5>
                <p className="text-[11px] text-slate-600 font-medium mt-0.5">
                  Revenue Department &bull; Digital Gujarat Citizen Portal
                </p>
              </div>
              <div className="text-right shrink-0">
                <div className="border border-slate-300 rounded p-1.5 bg-slate-50 text-[9px] font-mono text-slate-600 text-center">
                  <div className="tracking-widest font-bold">|||| | ||||| | ||</div>
                  <span>{submission.application_number}</span>
                </div>
              </div>
            </div>

            {/* Certificate Badge Banner */}
            <div className="text-center mb-6">
              <div className="inline-block bg-gradient-to-r from-blue-900 to-blue-800 text-white px-6 py-2 rounded-lg shadow-md">
                <h2 className="text-base sm:text-lg font-bold uppercase tracking-wider">
                  {formTitle}
                </h2>
                <p className="text-xs text-blue-200">{formTitleGu}</p>
              </div>
            </div>

            {/* Meta Grid */}
            <div className="grid grid-cols-2 gap-2 bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs mb-5">
              <div>
                <span className="text-slate-500">Certificate No: </span>
                <span className="font-bold text-slate-900">{certNumber}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-500">Issue Date: </span>
                <span className="font-bold text-slate-900">{issueDate}</span>
              </div>
              <div>
                <span className="text-slate-500">Application No: </span>
                <span className="font-mono font-bold text-slate-900">{submission.application_number}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-500">Validity: </span>
                <span className="font-bold text-emerald-700">Valid until {validUntil}</span>
              </div>
            </div>

            {/* Certificate Statement */}
            <div className="text-xs sm:text-sm text-slate-700 leading-relaxed mb-4 text-justify">
              This is to officially certify that <strong className="text-slate-950 font-bold">{applicantName}</strong>, Son/Daughter/Spouse of <strong className="text-slate-950 font-bold">{fatherName}</strong>, residing at <strong className="text-slate-950 font-bold">{address}</strong>, Taluka <strong className="text-slate-950 font-bold">{taluka}</strong>, District <strong className="text-slate-950 font-bold">{district}</strong>, Gujarat, has fulfilled the eligibility criteria under the Digital Gujarat e-Governance and Revenue verification framework.
            </div>

            {/* Verified Details Table */}
            <div className="border border-slate-200 rounded-lg overflow-hidden mb-5 text-xs">
              <table className="w-full text-left border-collapse">
                <tbody>
                  <tr className="border-b border-slate-100">
                    <td className="p-2.5 bg-slate-100 font-semibold text-slate-700 w-1/3">Applicant Name</td>
                    <td className="p-2.5 font-bold text-slate-900">{applicantName}</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="p-2.5 bg-slate-100 font-semibold text-slate-700">Father / Husband Name</td>
                    <td className="p-2.5 text-slate-800">{fatherName}</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="p-2.5 bg-slate-100 font-semibold text-slate-700">Residential Address</td>
                    <td className="p-2.5 text-slate-800">{address}</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="p-2.5 bg-slate-100 font-semibold text-slate-700">Govt Portal Reference ID</td>
                    <td className="p-2.5 font-mono font-bold text-blue-900">{govtRef}</td>
                  </tr>
                  {submission.field_values?.annual_income && (
                    <tr className="border-b border-slate-100">
                      <td className="p-2.5 bg-slate-100 font-semibold text-slate-700">Verified Annual Income</td>
                      <td className="p-2.5 font-bold text-emerald-700">{income}</td>
                    </tr>
                  )}
                  {submission.field_values?.category && (
                    <tr className="border-b border-slate-100">
                      <td className="p-2.5 bg-slate-100 font-semibold text-slate-700">Category / Class</td>
                      <td className="p-2.5 font-bold text-slate-800 uppercase">{submission.field_values.category}</td>
                    </tr>
                  )}
                  <tr>
                    <td className="p-2.5 bg-slate-100 font-semibold text-slate-700">Assisting Operator</td>
                    <td className="p-2.5 text-slate-800">{submission.assigned_operator_name || 'Designated Operator (Digital Gujarat)'}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Bottom Security & Digital Seal Stamp */}
            <div className="flex items-center justify-between pt-4 border-t border-dashed border-slate-300 gap-4 flex-wrap">
              <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-lg p-2.5">
                <div className="w-14 h-14 bg-white border border-slate-300 rounded p-1 flex items-center justify-center text-slate-800">
                  <QrCode className="w-10 h-10 text-slate-900" />
                </div>
                <div className="text-[10px] text-slate-500 leading-snug">
                  <strong className="text-slate-800 block">QR Security Verified</strong>
                  Scanned via Digital Gujarat<br />e-Seva Registry
                </div>
              </div>

              <div className="border-2 border-emerald-600 bg-emerald-50 rounded-lg p-2.5 text-center min-w-[200px]">
                <div className="text-[10px] font-bold text-emerald-800 uppercase flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Digitally Signed
                </div>
                <div className="text-xs font-extrabold text-emerald-950 mt-0.5">
                  Competent Authority
                </div>
                <div className="text-[9px] text-emerald-700 leading-tight mt-0.5">
                  Mamlatdar / TDO Office<br />
                  Govt of Gujarat &bull; {issueDate}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-2 text-center text-[9px] text-slate-400 border-t border-slate-100">
              Form_Seva Gujarat Assisted-Filing Platform &bull; DPDP Act 2023 Compliant &bull; Valid under IT Act 2000 Section 65B
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-100 border-t border-slate-200 px-5 py-4 flex items-center justify-between gap-3 flex-wrap">
          <button
            onClick={() => downloadReceiptPdf(submission, language)}
            className="flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-300 hover:bg-slate-50 px-3.5 py-2 rounded-xl transition shadow-sm"
          >
            <FileText className="w-4 h-4 text-slate-500" />
            {language === 'gu' ? 'રસીદ ડાઉનલોડ કરો (Receipt)' : language === 'hi' ? 'रसीद डाउनलोड करें' : 'Download Receipt'}
          </button>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="text-xs font-semibold text-slate-600 hover:text-slate-800 px-4 py-2 rounded-xl transition"
            >
              {language === 'gu' ? 'બંધ કરો' : language === 'hi' ? 'बंद करें' : 'Close'}
            </button>
            <button
              onClick={() => downloadCertificatePdf(submission, language)}
              className="flex items-center gap-2 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-blue-700 to-blue-900 hover:from-blue-800 hover:to-blue-950 px-5 py-2.5 rounded-xl transition shadow-md hover:shadow-lg active:scale-95"
            >
              <Download className="w-4 h-4" />
              {language === 'gu' ? 'PDF ડાઉનલોડ કરો / પ્રિન્ટ' : language === 'hi' ? 'PDF डाउनलोड / प्रिंट' : 'Download PDF / Print'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
