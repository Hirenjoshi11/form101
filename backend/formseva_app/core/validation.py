import re
import unicodedata
from datetime import datetime
from typing import Dict, Any, List

def verhoeff_checksum(aadhaar: str) -> bool:
    """Verhoeff algorithm for Aadhaar validation."""
    if len(aadhaar) != 12 or not aadhaar.isdigit():
        return False
        
    d = (
        (0, 1, 2, 3, 4, 5, 6, 7, 8, 9),
        (1, 2, 3, 4, 0, 6, 7, 8, 9, 5),
        (2, 3, 4, 0, 1, 7, 8, 9, 5, 6),
        (3, 4, 0, 1, 2, 8, 9, 5, 6, 7),
        (4, 0, 1, 2, 3, 9, 5, 6, 7, 8),
        (5, 9, 8, 7, 6, 0, 4, 3, 2, 1),
        (6, 5, 9, 8, 7, 1, 0, 4, 3, 2),
        (7, 6, 5, 9, 8, 2, 1, 0, 4, 3),
        (8, 7, 6, 5, 9, 3, 2, 1, 0, 4),
        (9, 8, 7, 6, 5, 4, 3, 2, 1, 0)
    )
    p = (
        (0, 1, 2, 3, 4, 5, 6, 7, 8, 9),
        (1, 5, 7, 6, 2, 8, 3, 0, 9, 4),
        (5, 8, 0, 3, 7, 9, 6, 1, 4, 2),
        (8, 9, 1, 6, 0, 4, 3, 5, 2, 7),
        (9, 4, 5, 3, 1, 2, 6, 8, 7, 0),
        (4, 2, 8, 6, 5, 7, 3, 9, 0, 1),
        (2, 7, 9, 3, 8, 0, 6, 4, 1, 5),
        (7, 0, 4, 6, 9, 1, 3, 2, 5, 8)
    )
    inv = (0, 4, 3, 2, 1, 5, 6, 7, 8, 9)
    
    c = 0
    reversed_aadhaar = aadhaar[::-1]
    
    for i, char in enumerate(reversed_aadhaar):
        c = d[c][p[i % 8][int(char)]]
        
    return c == 0

def has_html(text: str) -> bool:
    """Check if string contains HTML tags or angle brackets."""
    return bool(re.search(r'<[^>]*>|[<>]', text))

def has_control_chars(text: str) -> bool:
    """Check if string contains control characters."""
    return any(unicodedata.category(c) == 'Cc' for c in text if c not in ('\n', '\r', '\t'))

def normalize_text(text: str) -> str:
    """Trim and Unicode normalize (NFC)."""
    return unicodedata.normalize('NFC', str(text).strip())

class ValidationError(Exception):
    def __init__(self, field_key: str, message_gu: str, message_hi: str, message_en: str):
        self.field_key = field_key
        self.message_gu = message_gu
        self.message_hi = message_hi
        self.message_en = message_en
        super().__init__(self.message_en)

def validate_form_fields(
    payload_fields: Dict[str, Any], 
    form_def: Dict[str, Any], 
    form_fields: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Validates payload against form field definitions.
    Returns cleaned payload. Raises ValidationError on first failure, 
    or can be modified to return all errors.
    """
    cleaned_data = {}
    
    # 1. Whitelist Keys
    allowed_keys = {f['field_key']: f for f in form_fields}
    
    for key, raw_val in payload_fields.items():
        if key not in allowed_keys:
            raise ValidationError(
                key,
                f"ફિલ્ડ '{key}' આ ફોર્મનો ભાગ નથી.",
                f"फ़ील्ड '{key}' इस फ़ॉर्म का हिस्सा नहीं है।",
                f"Field '{key}' is not part of this form."
            )
            
    # 2. Check Required Fields & Validate Values
    for field_def in form_fields:
        key = field_def['field_key']
        is_req = field_def.get('is_required', False)
        
        if key not in payload_fields or payload_fields[key] is None or str(payload_fields[key]).strip() == "":
            if is_req:
                raise ValidationError(key, "આ ફિલ્ડ ફરજિયાત છે.", "यह फ़ील्ड अनिवार्य है।", "This field is required.")
            continue
            
        val = str(payload_fields[key])
        
        # UNIVERSAL RULES
        val = normalize_text(val)
        
        if has_control_chars(val):
            raise ValidationError(key, "અમાન્ય અક્ષરો મળ્યા.", "अमान्य वर्ण मिले।", "Control characters are not allowed.")
            
        if has_html(val):
            raise ValidationError(key, "HTML ટેગ્સ માન્ય નથી.", "HTML टैग की अनुमति नहीं है।", "HTML/Script tags are not allowed.")
            
        field_type = field_def.get('field_type', 'text')
        
        # MAX LENGTH CAPS BY TYPE
        if field_type == 'text' and len(val) > 200:
             raise ValidationError(key, "200 અક્ષરોથી વધુ માન્ય નથી.", "200 से अधिक वर्णों की अनुमति नहीं है।", "Cannot exceed 200 characters.")
        if field_type == 'textarea' and len(val) > 1000:
             raise ValidationError(key, "1000 અક્ષરોથી વધુ માન્ય નથી.", "1000 से अधिक वर्णों की अनुमति नहीं है।", "Cannot exceed 1000 characters.")
             
        # OPTIONS / SELECT VALIDATION
        if field_type in ['select', 'radio']:
            options = field_def.get('options_json', [])
            valid_values = [opt.get('value') for opt in options] if isinstance(options, list) else []
            if valid_values and val not in valid_values:
                 raise ValidationError(key, "પસંદ કરેલ વિકલ્પ અમાન્ય છે.", "चयनित विकल्प अमान्य है।", "Selected option is invalid.")
                 
        # REGEX VALIDATION
        val_regex = field_def.get('validation_regex')
        if val_regex:
            if not re.match(val_regex, val):
                raise ValidationError(key, "માહિતી યોગ્ય ફોર્મેટમાં નથી.", "डेटा सही प्रारूप में नहीं है।", "Invalid format.")
                
        # SPECIFIC VALIDATION METADATA
        val_meta = field_def.get('validation') or {}
        
        if field_type == 'number' or val_meta.get('is_decimal') or val_meta.get('is_integer'):
            try:
                num_val = float(val)
                if val_meta.get('is_integer') and not float(val).is_integer():
                    raise ValidationError(key, "ફક્ત પૂર્ણાંક સંખ્યા માન્ય છે.", "केवल पूर्णांक संख्या मान्य है।", "Only integer allowed.")
                    
                min_val = val_meta.get('min')
                max_val = val_meta.get('max')
                
                if min_val is not None and num_val < min_val:
                    raise ValidationError(key, f"કિંમત {min_val} થી ઓછી ન હોવી જોઈએ.", f"मूल्य {min_val} से कम नहीं होना चाहिए।", f"Minimum value is {min_val}.")
                if max_val is not None and num_val > max_val:
                    raise ValidationError(key, f"કિંમત {max_val} થી વધુ ન હોવી જોઈએ.", f"मूल्य {max_val} से अधिक नहीं होना चाहिए।", f"Maximum value is {max_val}.")
            except ValueError:
                raise ValidationError(key, "ફક્ત સંખ્યાઓ માન્ય છે.", "केवल संख्याएँ मान्य हैं।", "Only numbers allowed.")
                
        # AADHAAR
        if val_meta.get('class') == 'aadhaar':
            if len(val) != 12 or not val.isdigit() or not verhoeff_checksum(val) or len(set(val)) == 1:
                raise ValidationError(key, "અમાન્ય આધાર નંબર.", "अमान्य आधार नंबर।", "Invalid Aadhaar number.")
                
        # DOB / DATE
        if field_type == 'date' or val_meta.get('class') == 'dob':
            try:
                dt = datetime.strptime(val, "%Y-%m-%d")
                if val_meta.get('max_date') == 'today' and dt.date() > datetime.today().date():
                    raise ValidationError(key, "ભવિષ્યની તારીખ માન્ય નથી.", "भविष्य की तारीख मान्य नहीं है।", "Future date is not allowed.")
                if val_meta.get('min_year') and dt.year < val_meta.get('min_year'):
                    raise ValidationError(key, "અમાન્ય જન્મ તારીખ.", "अमान्य जन्म तिथि।", "Invalid Date of Birth.")
            except ValueError:
                # Fallback format checking
                try:
                    dt = datetime.strptime(val, "%d/%m/%Y")
                    val = dt.strftime("%Y-%m-%d") # Normalize format
                except ValueError:
                    raise ValidationError(key, "અમાન્ય તારીખ ફોર્મેટ.", "अमान्य तिथि प्रारूप।", "Invalid date format.")
                    
        # CROSS FIELD (Example EWS)
        if val_meta.get('max_ews'):
            if form_def.get('slug') == 'ews_certificate':
                try:
                    num_val = float(val)
                    if num_val > val_meta.get('max_ews'):
                        raise ValidationError(key, "EWS માટે આવક મર્યાદા કરતા વધારે છે.", "ईडब्ल्यूएस के लिए आय सीमा से अधिक है।", "Income exceeds EWS limits.")
                except ValueError:
                    pass

        cleaned_data[key] = val
        
    return cleaned_data
