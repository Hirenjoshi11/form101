import { FormField } from './types';

// Mirroring the backend verhoeff_checksum
export function verhoeffChecksum(aadhaar: string): boolean {
  if (aadhaar.length !== 12 || !/^\d+$/.test(aadhaar)) return false;

  const d = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
    [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
    [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
    [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
    [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
    [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
    [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
    [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
    [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
  ];
  const p = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
    [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
    [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
    [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
    [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
    [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
    [7, 0, 4, 6, 9, 1, 3, 2, 5, 8]
  ];

  let c = 0;
  const reversedAadhaar = aadhaar.split('').reverse();

  for (let i = 0; i < reversedAadhaar.length; i++) {
    c = d[c][p[i % 8][parseInt(reversedAadhaar[i], 10)]];
  }
  return c === 0;
}

export function validateField(field: FormField, value: any, lang: string): string | null {
  const isReq = field.is_required;
  const valStr = value !== undefined && value !== null ? String(value).trim() : '';

  if (!valStr) {
    if (isReq) return lang === 'gu' ? 'આ ફિલ્ડ ફરજિયાત છે.' : lang === 'hi' ? 'यह फ़ील्ड अनिवार्य है।' : 'This field is required.';
    return null;
  }

  // HTML / Control check (simple version)
  if (/<[^>]*>|[<>]/.test(valStr)) {
    return lang === 'gu' ? 'HTML ટેગ્સ માન્ય નથી.' : lang === 'hi' ? 'HTML टैग की अनुमति नहीं है।' : 'HTML/Script tags are not allowed.';
  }

  // Length caps
  if (field.field_type === 'text' && valStr.length > 200) {
    return lang === 'gu' ? '200 અક્ષરોથી વધુ માન્ય નથી.' : lang === 'hi' ? '200 से अधिक वर्णों की अनुमति नहीं है।' : 'Cannot exceed 200 characters.';
  }
  if (field.field_type === 'textarea' && valStr.length > 1000) {
    return lang === 'gu' ? '1000 અક્ષરોથી વધુ માન્ય નથી.' : lang === 'hi' ? '1000 से अधिक वर्णों की अनुमति नहीं है।' : 'Cannot exceed 1000 characters.';
  }

  // Regex
  if (field.validation_regex) {
    const re = new RegExp(field.validation_regex);
    if (!re.test(valStr)) {
      return lang === 'gu' ? 'માહિતી યોગ્ય ફોર્મેટમાં નથી.' : lang === 'hi' ? 'डेटा सही प्रारूप में नहीं है।' : 'Invalid format.';
    }
  }

  // Specific validation metadata
  const meta = field.validation || {};

  if (field.field_type === 'number' || meta.is_decimal || meta.is_integer) {
    const num = Number(valStr);
    if (isNaN(num)) {
      return lang === 'gu' ? 'ફક્ત સંખ્યાઓ માન્ય છે.' : lang === 'hi' ? 'केवल संख्याएँ मान्य हैं।' : 'Only numbers allowed.';
    }
    if (meta.is_integer && !Number.isInteger(num)) {
      return lang === 'gu' ? 'ફક્ત પૂર્ણાંક સંખ્યા માન્ય છે.' : lang === 'hi' ? 'केवल पूर्णांक संख्या मान्य है।' : 'Only integer allowed.';
    }
    if (meta.min !== undefined && num < meta.min) {
      return lang === 'gu' ? `કિંમત ${meta.min} થી ઓછી ન હોવી જોઈએ.` : lang === 'hi' ? `मूल्य ${meta.min} से कम नहीं होना चाहिए।` : `Minimum value is ${meta.min}.`;
    }
    if (meta.max !== undefined && num > meta.max) {
      return lang === 'gu' ? `કિંમત ${meta.max} થી વધુ ન હોવી જોઈએ.` : lang === 'hi' ? `मूल्य ${meta.max} से अधिक नहीं होना चाहिए।` : `Maximum value is ${meta.max}.`;
    }
  }

  if (meta.class === 'aadhaar') {
    if (valStr.length !== 12 || !/^\d+$/.test(valStr) || !verhoeffChecksum(valStr) || new Set(valStr).size === 1) {
      return lang === 'gu' ? 'અમાન્ય આધાર નંબર.' : lang === 'hi' ? 'अमान्य आधार नंबर।' : 'Invalid Aadhaar number.';
    }
  }

  if (field.field_type === 'date' || meta.class === 'dob') {
    const dt = new Date(valStr);
    if (isNaN(dt.getTime())) {
      return lang === 'gu' ? 'અમાન્ય તારીખ ફોર્મેટ.' : lang === 'hi' ? 'अमान्य तिथि प्रारूप।' : 'Invalid date format.';
    }
    if (meta.max_date === 'today' && dt > new Date()) {
      return lang === 'gu' ? 'ભવિષ્યની તારીખ માન્ય નથી.' : lang === 'hi' ? 'भविष्य की तारीख मान्य नहीं है।' : 'Future date is not allowed.';
    }
    if (meta.min_year && dt.getFullYear() < meta.min_year) {
      return lang === 'gu' ? 'અમાન્ય જન્મ તારીખ.' : lang === 'hi' ? 'अमान्य जन्म तिथि।' : 'Invalid Date of Birth.';
    }
  }

  return null;
}
