-- =============================================================================
-- Form_Seva: Seed Data
-- 1 Super Admin, 4 Operators, 5 Gujarat Government Certificate Types & Dynamic Fields
-- =============================================================================

-- Seed Admin
INSERT INTO public.admins (id, full_name, email, role, is_active)
VALUES 
    ('a0000000-0000-0000-0000-000000000001', 'Gujarat Seva Admin', 'admin@formseva.gujarat.gov.in', 'super_admin', TRUE)
ON CONFLICT (email) DO NOTHING;

-- Seed 6 Operators
INSERT INTO public.operators (id, created_by_admin_id, full_name, email, phone, district, assigned_count, completed_count, is_active)
VALUES 
    ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Vicky', 'vicky.operator@formseva.in', '+91 98250 11223', 'Ahmedabad', 12, 110, TRUE),
    ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Nikhil', 'nikhil.operator@formseva.in', '+91 98251 22334', 'Vadodara', 8, 94, TRUE),
    ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'DHulo', 'dhulo.operator@formseva.in', '+91 98252 33445', 'Surat', 15, 142, TRUE),
    ('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'Loy', 'loy.operator@formseva.in', '+91 98253 44556', 'Rajkot', 5, 87, TRUE),
    ('b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'Adi', 'adi.operator@formseva.in', '+91 98250 55110', 'Ahmedabad', 0, 0, TRUE),
    ('b0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'Ishan', 'ishan.operator@formseva.in', '+91 98250 55220', 'Ahmedabad', 0, 0, TRUE)
ON CONFLICT (email) DO NOTHING;

-- Seed 1 Sample Citizen User for testing
INSERT INTO public.users (id, full_name, email, phone, preferred_language, aadhaar_last_four)
VALUES 
    ('c0000000-0000-0000-0000-000000000001', 'Rameshbhai K. Prajapati', 'citizen.demo@formseva.in', '+91 98980 12345', 'gu', '4321')
ON CONFLICT (email) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 6 Launch Certificate & Entrance Exam Forms
-- -----------------------------------------------------------------------------

-- 1. Income Certificate (આવકનું પ્રમાણપત્ર)
INSERT INTO public.forms (
    id, slug, title_gu, title_hi, title_en,
    description_gu, description_hi, description_en,
    department_name_gu, department_name_hi, department_name_en,
    official_fee, service_fee, turnaround_days, expected_otp_count,
    required_docs_json, is_active, sort_order
) VALUES (
    'f0000000-0000-0000-0000-000000000001',
    'income_certificate',
    'આવકનું પ્રમાણપત્ર',
    'आय प्रमाण पत्र',
    'Income Certificate',
    'મામલતદાર / તાલુકા વિકાસ અધિકારી દ્વારા વાર્ષિક આવકનું માન્ય પ્રમાણપત્ર.',
    'मामलतदार / तालुका विकास अधिकारी द्वारा वार्षिक आय का अधिकृत प्रमाण पत्र।',
    'Official Annual Income Certificate issued by Revenue Dept / Mamlatdar Office.',
    'મહેસૂલ વિભાગ, ગુજરાત સરકાર',
    'राजस्व विभाग, गुजरात सरकार',
    'Revenue Department, Govt of Gujarat',
    20.00, 50.00, 2, 1,
    '[
        {"key": "aadhaar_card", "label_gu": "આધાર કાર્ડ", "label_hi": "आधार कार्ड", "label_en": "Aadhaar Card", "required": true},
        {"key": "ration_card", "label_gu": "રેશન કાર્ડ", "label_hi": "राशन कार्ड", "label_en": "Ration Card", "required": true},
        {"key": "income_proof", "label_gu": "આવકનો પુરાવો (તલાટી દાખલો / પગાર સ્લિપ / ITR)", "label_hi": "आय का प्रमाण (तलाटी रिपोर्ट / सैलरी स्लिप / ITR)", "label_en": "Income Proof (Talati Certificate / Salary Slip / ITR)", "required": true},
        {"key": "electricity_bill", "label_gu": "લાઈટ બિલ / વેરા બિલ", "label_hi": "बिजली बिल / टैक्स रसीद", "label_en": "Electricity Bill / Property Tax Receipt", "required": true}
    ]'::jsonb,
    TRUE, 1
) ON CONFLICT (slug) DO NOTHING;

-- 2. EWS Certificate (આર્થિક રીતે નબળા વર્ગનું પ્રમાણપત્ર)
INSERT INTO public.forms (
    id, slug, title_gu, title_hi, title_en,
    description_gu, description_hi, description_en,
    department_name_gu, department_name_hi, department_name_en,
    official_fee, service_fee, turnaround_days, expected_otp_count,
    required_docs_json, is_active, sort_order
) VALUES (
    'f0000000-0000-0000-0000-000000000002',
    'ews_certificate',
    'EWS (આર્થિક રીતે નબળા વર્ગ) પ્રમાણપત્ર',
    'ईडब्ल्यूएस (आर्थिक रूप से कमजोर वर्ग) प्रमाण पत्र',
    'Economically Weaker Section (EWS) Certificate',
    'શિક્ષણ અને સરકારી નોકરીઓમાં ૧૦% અનામત માટે બિન-અનામત વર્ગનું EWS પ્રમાણપત્ર.',
    'शिक्षा और सरकारी नौकरियों में 10% आरक्षण हेतु सामान्य वर्ग का ईडब्ल्यूएस प्रमाण पत्र।',
    '10% reservation certificate for general category citizens in education & jobs.',
    'સામાજિક ન્યાય અને અધિકારિતા વિભાગ',
    'सामाजिक न्याय एवं अधिकारिता विभाग',
    'Social Justice & Empowerment Department',
    50.00, 50.00, 2, 2,
    '[
        {"key": "aadhaar_card", "label_gu": "આધાર કાર્ડ", "label_hi": "आधार कार्ड", "label_en": "Aadhaar Card", "required": true},
        {"key": "income_proof", "label_gu": "કુટુંબની કુલ વાર્ષિક આવકનો પુરાવો (રૂ. ૮ લાખથી ઓછી)", "label_hi": "पारिवारिक आय प्रमाण (8 लाख से कम)", "label_en": "Family Annual Income Proof (< 8 Lakhs)", "required": true},
        {"key": "property_proof", "label_gu": "મકાન / જમીનના દસ્તાવેજ / આકારણી રજીસ્ટર", "label_hi": "मकान / भूमि दस्तावेज", "label_en": "Property / Land Documents", "required": true},
        {"key": "caste_pedigree", "label_gu": "પેઢીનામું / જાતિ અંગેનું સોગંદનામું", "label_hi": "वंशावली / जाति शपथ पत्र", "label_en": "Pedigree (Pedhinamu) / Caste Affidavit", "required": true}
    ]'::jsonb,
    TRUE, 2
) ON CONFLICT (slug) DO NOTHING;

-- 3. Caste / Non-Creamy Layer Certificate (બિન-અનામત / જાતિ પ્રમાણપત્ર)
INSERT INTO public.forms (
    id, slug, title_gu, title_hi, title_en,
    description_gu, description_hi, description_en,
    department_name_gu, department_name_hi, department_name_en,
    official_fee, service_fee, turnaround_days, expected_otp_count,
    required_docs_json, is_active, sort_order
) VALUES (
    'f0000000-0000-0000-0000-000000000003',
    'caste_ncl_certificate',
    'નોન-ક્રીમીલેયર (NCL) / સામાજિક પછાત વર્ગ દાખલો',
    'नॉन-क्रीमीलेयर (एनसीएल) / सामाजिक रूप से पिछड़ा वर्ग प्रमाण पत्र',
    'Non-Creamy Layer (NCL) / SEBC Certificate',
    'SEBC / OBC કેટેગરીના લાભાર્થીઓ માટે ૩ વર્ષ માન્યતા ધરાવતું નોન-ક્રીમીલેયર પ્રમાણપત્ર.',
    'ओबीसी/एसईबीसी वर्ग के लिए 3 वर्ष की वैधता वाला नॉन-क्रीमीलेयर प्रमाण पत्र।',
    '3-year validity Non-Creamy Layer certificate for SEBC / OBC category benefits.',
    'સામાજિક ન્યાય અને અધિકારિતા વિભાગ',
    'सामाजिक न्याय एवं अधिकारिता विभाग',
    'Social Justice & Empowerment Department',
    20.00, 89.00, 2, 1,
    '[
        {"key": "applicant_lc", "label_gu": "અરજદારની શાળા છોડ્યાનું પ્રમાણપત્ર (L.C.)", "label_hi": "आवेदक का स्कूल लिविंग सर्टिफिकेट", "label_en": "Applicant School Leaving Certificate (LC)", "required": true},
        {"key": "father_lc", "label_gu": "પિતાશ્રીની શાળા છોડ્યાનું પ્રમાણપત્ર (L.C.)", "label_hi": "पिता का स्कूल लिविंग सर्टिफिकेट", "label_en": "Father School Leaving Certificate (LC)", "required": true},
        {"key": "aadhaar_card", "label_gu": "આધાર કાર્ડ", "label_hi": "आधार कार्ड", "label_en": "Aadhaar Card", "required": true},
        {"key": "income_proof_3yrs", "label_gu": "છેલ્લા ૩ વર્ષની આવકના પુરાવા", "label_hi": "पिछले 3 वर्षों का आय प्रमाण", "label_en": "Last 3 Years Income Proof", "required": true}
    ]'::jsonb,
    TRUE, 3
) ON CONFLICT (slug) DO NOTHING;

-- 4. 7/12 & 8-A Land Records (૭/૧૨ અને ૮-અ જમીન ઉતારા)
INSERT INTO public.forms (
    id, slug, title_gu, title_hi, title_en,
    description_gu, description_hi, description_en,
    department_name_gu, department_name_hi, department_name_en,
    official_fee, service_fee, turnaround_days, expected_otp_count,
    required_docs_json, is_active, sort_order
) VALUES (
    'f0000000-0000-0000-0000-000000000004',
    'land_records_7_12',
    '૭/૧૨ અને ૮-અ જમીન રેકોર્ડ નકલ (AnyRoR)',
    '7/12 एवं 8-अ भूमि रिकॉर्ड नकल (AnyRoR)',
    '7/12 & 8-A Land Record Extracts (AnyRoR Gujarat)',
    'ગુજરાતના કોઈપણ ગામના અધિકૃત ડિજિટલ સહીવાળા ૭/૧૨, ૮-અ અને નોંધના ઉતારા.',
    'गुजरात के किसी भी गांव के डिजिटल हस्ताक्षरित 7/12, 8-ए एवं हक्क पत्रक नकल।',
    'Digitally signed official certified land records 7/12, 8-A from AnyRoR Gujarat.',
    'મહેસૂલ વિભાગ - જમીન દફતર',
    'राजस्व विभाग - भूमि अभिलेख',
    'Revenue Dept - Land Records (AnyRoR)',
    15.00, 50.00, 1, 1,
    '[
        {"key": "old_survey_copy", "label_gu": "જૂની પાવતી / સર્વે નંબરની વિગત", "label_hi": "पुराना सर्वे नंबर / रसीद", "label_en": "Survey / Block Number Slip", "required": false},
        {"key": "applicant_id", "label_gu": "અરજદારનું ઓળખપત્ર (આધાર કાર્ડ)", "label_hi": "पहचान पत्र (आधार)", "label_en": "Applicant Photo ID (Aadhaar)", "required": true}
    ]'::jsonb,
    TRUE, 4
) ON CONFLICT (slug) DO NOTHING;

-- 5. Driving Licence Assistance (ડ્રાઇવિંગ લાયસન્સ - RTO Gujarat)
INSERT INTO public.forms (
    id, slug, title_gu, title_hi, title_en,
    description_gu, description_hi, description_en,
    department_name_gu, department_name_hi, department_name_en,
    official_fee, service_fee, turnaround_days, expected_otp_count,
    required_docs_json, is_active, sort_order
) VALUES (
    'f0000000-0000-0000-0000-000000000005',
    'driving_licence_rto',
    'ડ્રાઇવિંગ / લર્નિંગ લાયસન્સ સહાયતા (RTO સારથી)',
    'ड्राइविंग / लर्निंग लाइसेंस सहायता (RTO सारथी)',
    'Driving / Learner Licence Assistance (Sarathi RTO)',
    'લર્નિંગ લાયસન્સ સ્લોટ બુકિંગ, ફોર્મ ફાઈલિંગ અને કાયમી લાયસન્સ સહાયતા.',
    'लर्निंग लाइसेंस स्लॉट बुकिंग, फॉर्म फाइलिंग एवं परमानेंट लाइसेंस सहायता।',
    'End-to-end Sarathi Parivahan portal filing, slot appointment, and document verification.',
    'વાહન વ્યવહાર કમિશનર કચેરી (RTO)',
    'परिवहन आयुक्त कार्यालय (RTO)',
    'Transport Department (RTO Gujarat)',
    150.00, 100.00, 2, 2,
    '[
        {"key": "aadhaar_card", "label_gu": "આધાર કાર્ડ (મોબાઈલ લિંક હોવું જરૂરી)", "label_hi": "आधार कार्ड (मोबाइल लिंक अनिवार्य)", "label_en": "Aadhaar Card (Mobile Linked)", "required": true},
        {"key": "age_proof_lc", "label_gu": "શાળા છોડ્યાનું પ્રમાણપત્ર / જન્મ દાખલો", "label_hi": "स्कूल लीविंग / जन्म प्रमाण पत्र", "label_en": "School LC / Birth Certificate (Age Proof)", "required": true},
        {"key": "blood_group_report", "label_gu": "બ્લડ ગ્રુપ રિપોર્ટ", "label_hi": "ब्लड ग्रुप रिपोर्ट", "label_en": "Blood Group Report", "required": false},
        {"key": "signature_scan", "label_gu": "સફેદ કાગળ પર સહીનો ફોટો", "label_hi": "सफेद कागज पर हस्ताक्षर", "label_en": "Signature Scan on Plain White Paper", "required": true}
    ]'::jsonb,
    TRUE, 5
) ON CONFLICT (slug) DO NOTHING;

-- 6. NEET UG Medical Entrance Exam (NEET UG પ્રવેશ પરીક્ષા ૨૦૨૬)
INSERT INTO public.forms (
    id, slug, title_gu, title_hi, title_en,
    description_gu, description_hi, description_en,
    department_name_gu, department_name_hi, department_name_en,
    official_fee, service_fee, turnaround_days, expected_otp_count,
    required_docs_json, is_active, sort_order
) VALUES (
    'f0000000-0000-0000-0000-000000000006',
    'neet_exam',
    'NEET UG મેડિકલ પ્રવેશ પરીક્ષા ૨૦૨૬',
    'नीट यूजी मेडिकल प्रवेश परीक्षा 2026',
    'NEET UG Medical Entrance Exam 2026',
    'NTA NEET UG 2026 પરીક્ષા ઓનલાઇન રજીસ્ટ્રેશન, ફોટો સ્કેન અને કેન્દ્ર પસંદગી સહાયતા.',
    'NTA नीट यूजी 2026 ऑनलाइन परीक्षा पंजीकरण एवं फॉर्म सहायता।',
    'NTA NEET UG 2026 online registration, document resizing, and exam city selection.',
    'નેશનલ ટેસ્ટિંગ એજન્સી (NTA) / આરોગ્ય મંત્રાલય',
    'राष्ट्रीय परीक्षा एजेंसी (NTA)',
    'National Testing Agency (NTA)',
    1700.00, 150.00, 2, 2,
    '[
        {"key": "passport_photo", "label_gu": "પાસપોર્ટ ફોટો (સફેદ બેકગ્રાઉન્ડ)", "label_hi": "पासपोर्ट फोटो", "label_en": "Passport Photo (White BG)", "required": true},
        {"key": "signature_photo", "label_gu": "સહીનો ફોટો", "label_hi": "हस्ताक्षर", "label_en": "Signature Photo", "required": true},
        {"key": "thumb_impression", "label_gu": "ડાબા અને જમણા અંગૂઠાની છાપ", "label_hi": "अंगूठे का निशान", "label_en": "Thumb Impression", "required": true},
        {"key": "class_10_marksheet", "label_gu": "ધોરણ ૧૦ માર્કશીટ / પ્રમાણપત્ર", "label_hi": "10वीं मार्कशीट", "label_en": "Class 10 Marksheet", "required": true}
    ]'::jsonb,
    TRUE, 6
) ON CONFLICT (slug) DO NOTHING;

-- -----------------------------------------------------------------------------
-- Dynamic Fields for Form 1: Income Certificate (આવકનું પ્રમાણપત્ર)
-- -----------------------------------------------------------------------------

-- Personal Step
INSERT INTO public.form_fields (form_id, field_key, step_section, field_type, label_gu, label_hi, label_en, placeholder_gu, placeholder_hi, placeholder_en, is_required, sort_order)
VALUES 
('f0000000-0000-0000-0000-000000000001', 'applicant_name', 'personal', 'text', 'અરજદારનું પૂરું નામ', 'आवेदक का पूरा नाम', 'Full Name of Applicant', 'જેમ આધાર કાર્ડમાં છે તેમ', 'जैसा आधार कार्ड में है', 'As per Aadhaar card', true, 1),
('f0000000-0000-0000-0000-000000000001', 'father_husband_name', 'personal', 'text', 'પિતા / પતિનું નામ', 'पिता / पति का नाम', 'Father / Husband Name', 'પૂરું નામ દાખલ કરો', 'पूरा नाम दर्ज करें', 'Enter full name', true, 2),
('f0000000-0000-0000-0000-000000000001', 'gender', 'personal', 'select', 'જાતિ / લિંગ', 'लिंग', 'Gender', 'પસંદ કરો', 'चुनें', 'Select', true, 3),
('f0000000-0000-0000-0000-000000000001', 'dob', 'personal', 'date', 'જન્મ તારીખ', 'जन्म तिथि', 'Date of Birth', 'DD/MM/YYYY', 'DD/MM/YYYY', 'DD/MM/YYYY', true, 4),
('f0000000-0000-0000-0000-000000000001', 'mobile_number', 'personal', 'number', 'મોબાઈલ નંબર', 'मोबाइल नंबर', 'Mobile Number (10 digits)', '10 અંકનો મોબાઈલ નંબર', '10 अंकों का मोबाइल', '10-digit mobile number', true, 5),
('f0000000-0000-0000-0000-000000000001', 'aadhaar_number', 'personal', 'number', 'આધાર કાર્ડ નંબર', 'आधार कार्ड नंबर', 'Aadhaar Card Number', '12 અંકનો આધાર નંબર', '12 अंकों का आधार', '12-digit Aadhaar number', true, 6);

-- Set options for Gender
UPDATE public.form_fields SET options_json = '[
    {"value": "male", "label_gu": "પુરુષ", "label_hi": "पुरुष", "label_en": "Male"},
    {"value": "female", "label_gu": "સ્ત્રી", "label_hi": "महिला", "label_en": "Female"},
    {"value": "other", "label_gu": "અન્ય", "label_hi": "अन्य", "label_en": "Other"}
]'::jsonb WHERE form_id = 'f0000000-0000-0000-0000-000000000001' AND field_key = 'gender';

-- Address Step
INSERT INTO public.form_fields (form_id, field_key, step_section, field_type, label_gu, label_hi, label_en, placeholder_gu, placeholder_hi, placeholder_en, is_required, sort_order)
VALUES 
('f0000000-0000-0000-0000-000000000001', 'district', 'address', 'select', 'જિલ્લો', 'जिला', 'District', 'જિલ્લો પસંદ કરો', 'जिला चुनें', 'Select District', true, 7),
('f0000000-0000-0000-0000-000000000001', 'taluka', 'address', 'text', 'તાલુકો', 'तालुका', 'Taluka / Sub-district', 'તાલુકાનું નામ', 'तालुका का नाम', 'Taluka name', true, 8),
('f0000000-0000-0000-0000-000000000001', 'village_city', 'address', 'text', 'ગામ / શહેર', 'गांव / शहर', 'Village / City', 'ગામ અથવા શહેરનું નામ', 'गांव या शहर', 'Village or City', true, 9),
('f0000000-0000-0000-0000-000000000001', 'residential_address', 'address', 'textarea', 'રહેઠાણનું સરનામું (ઘર નં., સોસાયટી/શેરી)', 'आवासीय पता', 'Full Residential Address', 'સંપૂર્ણ સરનામું', 'पूरा पता', 'Complete house/street address', true, 10),
('f0000000-0000-0000-0000-000000000001', 'pincode', 'address', 'number', 'પીનકોડ', 'पिनकोड', 'Pincode (6 digits)', '6 અંકનો પીનકોડ', '6 अंकों का पिनकोड', '6-digit pincode', true, 11);

-- Set Gujarat Districts
UPDATE public.form_fields SET options_json = '[
    {"value": "Ahmedabad", "label_gu": "અમદાવાદ", "label_hi": "अहमदाबाद", "label_en": "Ahmedabad"},
    {"value": "Surat", "label_gu": "સુરત", "label_hi": "सूरत", "label_en": "Surat"},
    {"value": "Vadodara", "label_gu": "વડોદરા", "label_hi": "वडोदरा", "label_en": "Vadodara"},
    {"value": "Rajkot", "label_gu": "રાજકોટ", "label_hi": "राजकोट", "label_en": "Rajkot"},
    {"value": "Bhavnagar", "label_gu": "ભાવનગર", "label_hi": "भावनगर", "label_en": "Bhavnagar"},
    {"value": "Jamnagar", "label_gu": "જામનગર", "label_hi": "जामनगर", "label_en": "Jamnagar"},
    {"value": "Gandhinagar", "label_gu": "ગાંધીનગર", "label_hi": "गांधीनगर", "label_en": "Gandhinagar"},
    {"value": "Junagadh", "label_gu": "જૂનાગઢ", "label_hi": "जूनागढ़", "label_en": "Junagadh"},
    {"value": "Anand", "label_gu": "આણંદ", "label_hi": "आणंद", "label_en": "Anand"},
    {"value": "Kheda", "label_gu": "ખેડા (નડિયાદ)", "label_hi": "खेड़ा", "label_en": "Kheda"},
    {"value": "Mehsana", "label_gu": "મહેસાણા", "label_hi": "मेहसाणा", "label_en": "Mehsana"},
    {"value": "Patan", "label_gu": "પાટણ", "label_hi": "पाटन", "label_en": "Patan"},
    {"value": "Banaskantha", "label_gu": "બનાસકાંઠા (પાલનપુર)", "label_hi": "बनासकांठा", "label_en": "Banaskantha"},
    {"value": "Sabarkantha", "label_gu": "સાબરકાંઠા (હિંમતનગર)", "label_hi": "साबरकांठा", "label_en": "Sabarkantha"},
    {"value": "Kutch", "label_gu": "કચ્છ (ભુજ)", "label_hi": "कच्छ", "label_en": "Kutch"},
    {"value": "Bharuch", "label_gu": "ભરૂચ", "label_hi": "भरूच", "label_en": "Bharuch"},
    {"value": "Navsari", "label_gu": "નવસારી", "label_hi": "नवसारी", "label_en": "Navsari"},
    {"value": "Valsad", "label_gu": "વલસાડ", "label_hi": "वलसाड", "label_en": "Valsad"},
    {"value": "Amreli", "label_gu": "અમરેલી", "label_hi": "अमरेली", "label_en": "Amreli"},
    {"value": "Morbi", "label_gu": "મોરબી", "label_hi": "मोरबी", "label_en": "Morbi"},
    {"value": "Surendranagar", "label_gu": "સુરેન્દ્રનગર", "label_hi": "सुरेंद्रनगर", "label_en": "Surendranagar"}
]'::jsonb WHERE form_id = 'f0000000-0000-0000-0000-000000000001' AND field_key = 'district';

-- Specific Step (Income Details)
INSERT INTO public.form_fields (form_id, field_key, step_section, field_type, label_gu, label_hi, label_en, placeholder_gu, placeholder_hi, placeholder_en, is_required, sort_order)
VALUES 
('f0000000-0000-0000-0000-000000000001', 'occupation', 'specific', 'select', 'વ્યવસાય / કામધંધો', 'व्यवसाय', 'Occupation / Profession', 'પસંદ કરો', 'चुनें', 'Select Occupation', true, 12),
('f0000000-0000-0000-0000-000000000001', 'annual_income', 'specific', 'number', 'કુલ વાર્ષિક આવક (રૂપિયામાં)', 'कुल वार्षिक आय (रुपये में)', 'Total Annual Income (in INR)', 'દા.ત. 120000', 'उदा. 120000', 'e.g. 120000', true, 13),
('f0000000-0000-0000-0000-000000000001', 'income_purpose', 'specific', 'select', 'દાખલાનો હેતુ (ક્યાં રજૂ કરવાનો છે)', 'प्रमाण पत्र का उद्देश्य', 'Purpose of Certificate', 'પસંદ કરો', 'चुनें', 'Select Purpose', true, 14),
('f0000000-0000-0000-0000-000000000001', 'family_member_count', 'specific', 'number', 'કુટુંબના કુલ સભ્યોની સંખ્યા', 'परिवार के कुल सदस्यों की संख्या', 'Total Family Members Count', 'દા.ત. 4', 'उदा. 4', 'e.g. 4', true, 15);

-- Set options for Occupation & Purpose
UPDATE public.form_fields SET options_json = '[
    {"value": "agriculture", "label_gu": "ખેતી / પશુપાલન", "label_hi": "कृषि / पशुपालन", "label_en": "Agriculture / Farming"},
    {"value": "labor", "label_gu": "મજૂરી કામ / છૂટક કામ", "label_hi": "मजदूरी / दैनिक वेतन", "label_en": "Daily Wage / Labor"},
    {"value": "private_job", "label_gu": "ખાનગી નોકરી", "label_hi": "निजी नौकरी", "label_en": "Private Employment"},
    {"value": "gov_job", "label_gu": "સરકારી નોકરી", "label_hi": "सरकारी नौकरी", "label_en": "Government Employee"},
    {"value": "business", "label_gu": "વેપાર / નાનો ધંધો", "label_hi": "व्यापार / लघु उद्योग", "label_en": "Small Business / Trade"},
    {"value": "other", "label_gu": "અન્ય", "label_hi": "अन्य", "label_en": "Other"}
]'::jsonb WHERE form_id = 'f0000000-0000-0000-0000-000000000001' AND field_key = 'occupation';

UPDATE public.form_fields SET options_json = '[
    {"value": "scholarship", "label_gu": "શાળા / કોલેજ સ્કોલરશીપ માટે", "label_hi": "छात्रवृत्ति हेतु", "label_en": "School / College Scholarship"},
    {"value": "rte_admission", "label_gu": "RTE (શિક્ષણ અધિકાર) પ્રવેશ માટે", "label_hi": "आरटीई प्रवेश हेतु", "label_en": "RTE School Admission"},
    {"value": "ayushman_card", "label_gu": "આયુષ્માન ભારત કાર્ડ / માં વાત્સલ્ય યોજના", "label_hi": "आयुष्मान भारत कार्ड हेतु", "label_en": "Ayushman Bharat / Health Scheme"},
    {"value": "ration_subsidy", "label_gu": "રેશન કાર્ડ / સરકારી સબસિડી માટે", "label_hi": "राशन सब्सिडी हेतु", "label_en": "Ration / Food Subsidy"},
    {"value": "housing_scheme", "label_gu": "પ્રધાનમંત્રી આવાસ યોજના (PMAY)", "label_hi": "आवास योजना हेतु", "label_en": "PM Awas Yojana (Housing)"},
    {"value": "general_use", "label_gu": "સામાન્ય સરકારી કામકાજ માટે", "label_hi": "सामान्य उपयोग", "label_en": "General Government Purpose"}
]'::jsonb WHERE form_id = 'f0000000-0000-0000-0000-000000000001' AND field_key = 'income_purpose';

-- Seed dynamic fields for other 4 forms as well so all 5 forms are completely driven dynamically
-- EWS Fields
INSERT INTO public.form_fields (form_id, field_key, step_section, field_type, label_gu, label_hi, label_en, placeholder_gu, placeholder_hi, placeholder_en, is_required, sort_order)
VALUES 
('f0000000-0000-0000-0000-000000000002', 'applicant_name', 'personal', 'text', 'અરજદારનું પૂરું નામ', 'आवेदक का पूरा नाम', 'Full Name of Applicant', 'આધાર કાર્ડ મુજબ', 'आधार अनुसार', 'As per Aadhaar', true, 1),
('f0000000-0000-0000-0000-000000000002', 'caste_subcaste', 'personal', 'text', 'જ્ઞાતિ અને પેટા-જ્ઞાતિ (બિન-અનામત)', 'जाति एवं उप-जाति', 'Caste and Sub-Caste (General Category)', 'દા.ત. પાટીદાર, બ્રહ્મભટ્ટ, રાજપૂત', 'उदा. राजपूत, पाटीदार', 'e.g. Patidar, Brahmin, Rajput', true, 2),
('f0000000-0000-0000-0000-000000000002', 'district', 'address', 'text', 'જિલ્લો', 'जिला', 'District', 'અમદાવાદ / સુરત...', 'जिला नाम', 'District Name', true, 3),
('f0000000-0000-0000-0000-000000000002', 'family_gross_income', 'specific', 'number', 'કુટુંબની કુલ વાર્ષિક આવક (રૂ.)', 'परिवार की कुल वार्षिक आय', 'Family Gross Annual Income (INR)', '૮ લાખથી ઓછી હોવી જોઈએ', '8 लाख से कम', 'Must be under 8,00,000 INR', true, 4),
('f0000000-0000-0000-0000-000000000002', 'agricultural_land_acres', 'specific', 'number', 'ખેતીની જમીન (એકરમાં - જો હોય તો)', 'कृषि भूमि (एकड़ में)', 'Agricultural Land (Acres, if any)', '0 જો ન હોય તો', '0 यदि नहीं है', '0 if none', false, 5),
('f0000000-0000-0000-0000-000000000002', 'residential_plot_sqft', 'specific', 'number', 'રહેણાંક પ્લોટ / મકાન વિસ્તાર (ચોરસ ફૂટ)', 'आवासीय प्लॉट क्षेत्रफल (वर्ग फुट)', 'Residential Plot Area (Sq. Ft)', 'દા.ત. 900', 'उदा. 900', 'e.g. 900', false, 6);

-- Caste/NCL Fields
INSERT INTO public.form_fields (form_id, field_key, step_section, field_type, label_gu, label_hi, label_en, placeholder_gu, placeholder_hi, placeholder_en, is_required, sort_order)
VALUES 
('f0000000-0000-0000-0000-000000000003', 'applicant_name', 'personal', 'text', 'અરજદારનું નામ', 'आवेदक का नाम', 'Applicant Name', 'શાળા L.C. મુજબ', 'स्कूल एलसी अनुसार', 'As per School LC', true, 1),
('f0000000-0000-0000-0000-000000000003', 'sebc_caste_name', 'personal', 'text', 'SEBC / OBC જ્ઞાતિનું નામ', 'ओबीसी / एसईबीसी जाति', 'SEBC / OBC Caste Name', 'દા.ત. પ્રજાપતિ, દરજી, સુથાર', 'उदा. प्रजापति, सोनी', 'e.g. Prajapati, Suthar, Panchal', true, 2),
('f0000000-0000-0000-0000-000000000003', 'district', 'address', 'text', 'જિલ્લો', 'जिला', 'District', 'જિલ્લો', 'जिला', 'District', true, 3),
('f0000000-0000-0000-0000-000000000003', 'avg_income_3years', 'specific', 'number', 'છેલ્લા ૩ વર્ષની સરેરાશ વાર્ષિક આવક (રૂ.)', '3 वर्ष की औसत वार्षिक आय', '3-Year Average Annual Income (INR)', 'દા.ત. 180000', 'उदा. 180000', 'e.g. 180000', true, 4);

-- 7/12 Land Records Fields
INSERT INTO public.form_fields (form_id, field_key, step_section, field_type, label_gu, label_hi, label_en, placeholder_gu, placeholder_hi, placeholder_en, is_required, sort_order)
VALUES 
('f0000000-0000-0000-0000-000000000004', 'district', 'address', 'text', 'જિલ્લો', 'जिला', 'District', 'જિલ્લાનું નામ', 'जिला', 'District name', true, 1),
('f0000000-0000-0000-0000-000000000004', 'taluka', 'address', 'text', 'તાલુકો', 'तालुका', 'Taluka', 'તાલુકાનું નામ', 'तालुका', 'Taluka name', true, 2),
('f0000000-0000-0000-0000-000000000004', 'village_name', 'address', 'text', 'ગામનું નામ', 'गांव का नाम', 'Village Name', 'ગામનું પૂરું નામ', 'गांव का नाम', 'Village name', true, 3),
('f0000000-0000-0000-0000-000000000004', 'survey_number', 'specific', 'text', 'સર્વે નંબર / બ્લોક નંબર', 'सर्वे नंबर / ब्लॉक नंबर', 'Survey Number / Block Number', 'દા.ત. 142/2 અથવા 56', 'उदा. 142/2', 'e.g. 142/2 or 56', true, 4),
('f0000000-0000-0000-0000-000000000004', 'khata_number', 'specific', 'text', 'ખાતા નંબર (જો ખબર હોય તો)', 'खाता संख्या (यदि ज्ञात हो)', 'Khata Number (Optional)', 'ખાતા નંબર', 'खाता संख्या', 'Khata number', false, 5);

-- Driving Licence Fields
INSERT INTO public.form_fields (form_id, field_key, step_section, field_type, label_gu, label_hi, label_en, placeholder_gu, placeholder_hi, placeholder_en, is_required, sort_order)
VALUES 
('f0000000-0000-0000-0000-000000000005', 'licence_type', 'personal', 'select', 'લાયસન્સ પ્રકાર', 'लाइसेंस प्रकार', 'Licence Type', 'પસંદ કરો', 'चुनें', 'Select', true, 1),
('f0000000-0000-0000-0000-000000000005', 'vehicle_class', 'personal', 'select', 'વાહન કેટેગરી (Vehicle Class)', 'वाहन श्रेणी', 'Vehicle Class', 'પસંદ કરો', 'चुनें', 'Select Class', true, 2),
('f0000000-0000-0000-0000-000000000005', 'rto_office', 'address', 'select', 'નજીકની RTO કચેરી', 'निकटतम आरटीओ कार्यालय', 'Nearest RTO Office', 'પસંદ કરો', 'चुनें', 'Select RTO', true, 3),
('f0000000-0000-0000-0000-000000000005', 'blood_group', 'specific', 'select', 'બ્લડ ગ્રુપ', 'ब्लड ग्रुप', 'Blood Group', 'પસંદ કરો', 'चुनें', 'Select', true, 4),
('f0000000-0000-0000-0000-000000000005', 'qualification', 'specific', 'select', 'શૈક્ષણિક લાયકાત', 'शैक्षणिक योग्यता', 'Educational Qualification', 'પસંદ કરો', 'चुनें', 'Select', true, 5);

UPDATE public.form_fields SET options_json = '[
    {"value": "learner", "label_gu": "નવું લર્નિંગ લાયસન્સ (LLR)", "label_hi": "नया लर्निंग लाइसेंस", "label_en": "New Learner Licence (LLR)"},
    {"value": "permanent", "label_gu": "કાયમી ડ્રાઇવિંગ લાયસન્સ (DL)", "label_hi": "स्थायी ड्राइविंग लाइसेंस", "label_en": "Permanent Driving Licence (DL)"},
    {"value": "renewal", "label_gu": "લાયસન્સ રીન્યુઅલ", "label_hi": "लाइसेंस नवीनीकरण", "label_en": "Licence Renewal"}
]'::jsonb WHERE form_id = 'f0000000-0000-0000-0000-000000000005' AND field_key = 'licence_type';

UPDATE public.form_fields SET options_json = '[
    {"value": "MCWG", "label_gu": "ટૂ-વ્હીલર (MCWG - ગિયર વાળી મોટરસાયકલ)", "label_hi": "दोपहिया (MCWG)", "label_en": "Two Wheeler (MCWG - Motorcycle with Gear)"},
    {"value": "LMV", "label_gu": "ફોર-વ્હીલર (LMV - કાર/જીપ)", "label_hi": "चार पहिया (LMV)", "label_en": "Four Wheeler (LMV - Light Motor Vehicle)"},
    {"value": "MCWG_LMV", "label_gu": "ટૂ-વ્હીલર + ફોર-વ્હીલર બંને (MCWG + LMV)", "label_hi": "दोपहिया + चार पहिया दोनों", "label_en": "Both Two Wheeler + Four Wheeler (MCWG + LMV)"}
]'::jsonb WHERE form_id = 'f0000000-0000-0000-0000-000000000005' AND field_key = 'vehicle_class';

UPDATE public.form_fields SET options_json = '[
    {"value": "GJ-01", "label_gu": "GJ-01 : અમદાવાદ (સુભાષબ્રિજ)", "label_hi": "GJ-01 : अहमदाबाद (सुभाष ब्रिज)", "label_en": "GJ-01 : Ahmedabad (Subhashbridge)"},
    {"value": "GJ-27", "label_gu": "GJ-27 : અમદાવાદ પૂર્વ (વસ્ત્રાલ)", "label_hi": "GJ-27 : अहमदाबाद पूर्व (वस्त्राल)", "label_en": "GJ-27 : Ahmedabad East (Vastral)"},
    {"value": "GJ-02", "label_gu": "GJ-02 : મહેસાણા", "label_hi": "GJ-02 : मेहसाणा", "label_en": "GJ-02 : Mehsana"},
    {"value": "GJ-03", "label_gu": "GJ-03 : રાજકોટ", "label_hi": "GJ-03 : राजकोट", "label_en": "GJ-03 : Rajkot"},
    {"value": "GJ-05", "label_gu": "GJ-05 : સુરત", "label_hi": "GJ-05 : सूरत", "label_en": "GJ-05 : Surat"},
    {"value": "GJ-06", "label_gu": "GJ-06 : વડોદરા", "label_hi": "GJ-06 : वडोदरा", "label_en": "GJ-06 : Vadodara"},
    {"value": "GJ-18", "label_gu": "GJ-18 : ગાંધીનગર", "label_hi": "GJ-18 : गांधीनगर", "label_en": "GJ-18 : Gandhinagar"}
]'::jsonb WHERE form_id = 'f0000000-0000-0000-0000-000000000005' AND field_key = 'rto_office';

UPDATE public.form_fields SET options_json = '[
    {"value": "A+", "label_gu": "A+", "label_hi": "A+", "label_en": "A+"},
    {"value": "A-", "label_gu": "A-", "label_hi": "A-", "label_en": "A-"},
    {"value": "B+", "label_gu": "B+", "label_hi": "B+", "label_en": "B+"},
    {"value": "B-", "label_gu": "B-", "label_hi": "B-", "label_en": "B-"},
    {"value": "O+", "label_gu": "O+", "label_hi": "O+", "label_en": "O+"},
    {"value": "O-", "label_gu": "O-", "label_hi": "O-", "label_en": "O-"},
    {"value": "AB+", "label_gu": "AB+", "label_hi": "AB+", "label_en": "AB+"},
    {"value": "AB-", "label_gu": "AB-", "label_hi": "AB-", "label_en": "AB-"}
]'::jsonb WHERE form_id = 'f0000000-0000-0000-0000-000000000005' AND field_key = 'blood_group';

UPDATE public.form_fields SET options_json = '[
    {"value": "10th", "label_gu": "૧૦ પાસ (SSC)", "label_hi": "10वीं पास (SSC)", "label_en": "10th Pass (SSC)"},
    {"value": "12th", "label_gu": "૧૨ પાસ (HSC)", "label_hi": "12वीं पास (HSC)", "label_en": "12th Pass (HSC)"},
    {"value": "graduate", "label_gu": "સ્નાતક / ગ્રેજ્યુએટ", "label_hi": "स्नातक / ग्रेजुएट", "label_en": "Graduate"},
    {"value": "post_graduate", "label_gu": "અનુસ્નાતક", "label_hi": "पोस्ट ग्रेजुएट", "label_en": "Post Graduate"},
    {"value": "below_8th", "label_gu": "૮ ધોરણથી ઓછું / અન્ય", "label_hi": "8वीं से कम / अन्य", "label_en": "Below 8th / Other"}
]'::jsonb WHERE form_id = 'f0000000-0000-0000-0000-000000000005' AND field_key = 'qualification';

-- 6. NEET UG Entrance Exam Fields
INSERT INTO public.form_fields (form_id, field_key, step_section, field_type, label_gu, label_hi, label_en, placeholder_gu, placeholder_hi, placeholder_en, is_required, sort_order)
VALUES 
('f0000000-0000-0000-0000-000000000006', 'candidate_name', 'personal', 'text', 'ઉમેદવારનું પૂરું નામ (૧૦મા ધોરણ મુજબ)', 'उम्मीदवार का नाम (10वीं अनुसार)', 'Candidate Full Name (As per 10th)', 'ધોરણ ૧૦ માર્કશીટ મુજબ નામ', '10वीं मार्कशीट अनुसार नाम', 'Name as per Class 10 certificate', true, 1),
('f0000000-0000-0000-0000-000000000006', 'father_name', 'personal', 'text', 'પિતાનું નામ', 'पिता का नाम', 'Father''s Name', 'પિતાનું નામ', 'पिता का नाम', 'Father''s Name', true, 2),
('f0000000-0000-0000-0000-000000000006', 'mother_name', 'personal', 'text', 'માતાનું નામ', 'माता का नाम', 'Mother''s Name', 'માતાનું નામ', 'माता का नाम', 'Mother''s Name', true, 3),
('f0000000-0000-0000-0000-000000000006', 'category', 'personal', 'select', 'કેટેગરી (સામાજિક વર્ગ)', 'श्रेणी / वर्ग', 'Category', 'પસંદ કરો', 'चुनें', 'Select Category', true, 4),
('f0000000-0000-0000-0000-000000000006', 'exam_city_1', 'specific', 'select', 'પ્રથમ પસંદગીનું પરીક્ષા શહેર', 'प्रथम परीक्षा शहर विकल्प', '1st Choice Exam City (Gujarat)', 'પસંદ કરો', 'चुनें', 'Select City', true, 5),
('f0000000-0000-0000-0000-000000000006', 'question_paper_medium', 'specific', 'select', 'પ્રશ્નપત્રનું માધ્યમ (ભાષા)', 'प्रश्न पत्र का माध्यम', 'Question Paper Medium', 'પસંદ કરો', 'चुनें', 'Select Medium', true, 6);

UPDATE public.form_fields SET options_json = '[
    {"value": "general", "label_gu": "General (સામાન્ય)", "label_hi": "General", "label_en": "General (UR)"},
    {"value": "gen_ews", "label_gu": "General-EWS (૧૦% અનામત)", "label_hi": "General-EWS", "label_en": "General-EWS"},
    {"value": "obc_ncl", "label_gu": "OBC-NCL (ઓબીસી નોન-ક્રીમીલેયર)", "label_hi": "OBC-NCL", "label_en": "OBC-NCL (Central List)"},
    {"value": "sc", "label_gu": "SC (અનુસૂચિત જાતિ)", "label_hi": "SC", "label_en": "Scheduled Caste (SC)"},
    {"value": "st", "label_gu": "ST (અનુસૂચિત જનજાતિ)", "label_hi": "ST", "label_en": "Scheduled Tribe (ST)"}
]'::jsonb WHERE form_id = 'f0000000-0000-0000-0000-000000000006' AND field_key = 'category';

UPDATE public.form_fields SET options_json = '[
    {"value": "Ahmedabad", "label_gu": "અમદાવાદ (GJ01)", "label_hi": "अहमदाबाद", "label_en": "Ahmedabad / Gandhinagar"},
    {"value": "Surat", "label_gu": "સુરત (GJ02)", "label_hi": "सूरत", "label_en": "Surat"},
    {"value": "Vadodara", "label_gu": "વડોદરા (GJ03)", "label_hi": "वडोदरा", "label_en": "Vadodara"},
    {"value": "Rajkot", "label_gu": "રાજકોટ (GJ04)", "label_hi": "राजकोट", "label_en": "Rajkot"},
    {"value": "Bhavnagar", "label_gu": "ભાવનગર (GJ05)", "label_hi": "भावनगर", "label_en": "Bhavnagar"}
]'::jsonb WHERE form_id = 'f0000000-0000-0000-0000-000000000006' AND field_key = 'exam_city_1';

UPDATE public.form_fields SET options_json = '[
    {"value": "Gujarati", "label_gu": "ગુજરાતી અને અંગ્રેજી (દ્વિભાષી)", "label_hi": "गुजराती एवं अंग्रेजी", "label_en": "Gujarati & English (Bilingual)"},
    {"value": "English", "label_gu": "English (અંગ્રેજી)", "label_hi": "English", "label_en": "English"},
    {"value": "Hindi", "label_gu": "Hindi અને English", "label_hi": "Hindi एवं English", "label_en": "Hindi & English (Bilingual)"}
]'::jsonb WHERE form_id = 'f0000000-0000-0000-0000-000000000006' AND field_key = 'question_paper_medium';

-- Update Form Fields Validation Rules
UPDATE public.form_fields SET validation_regex = '^[a-zA-Z\u0A80-\u0AFF\u0900-\u097F\s\.\'\-]{2,100}$', validation = '{"min_length": 2, "max_length": 100, "class": "name"}'::jsonb WHERE field_key = 'applicant_name';
UPDATE public.form_fields SET validation_regex = '^[a-zA-Z\u0A80-\u0AFF\u0900-\u097F\s\.\'\-]{2,100}$', validation = '{"min_length": 2, "max_length": 100, "class": "name"}'::jsonb WHERE field_key = 'candidate_name';
UPDATE public.form_fields SET validation_regex = '^[a-zA-Z\u0A80-\u0AFF\u0900-\u097F\s\.\'\-]{2,100}$', validation = '{"min_length": 2, "max_length": 100, "class": "name"}'::jsonb WHERE field_key = 'father_name';
UPDATE public.form_fields SET validation_regex = '^[a-zA-Z\u0A80-\u0AFF\u0900-\u097F\s\.\'\-]{2,100}$', validation = '{"min_length": 2, "max_length": 100, "class": "name"}'::jsonb WHERE field_key = 'mother_name';
UPDATE public.form_fields SET validation_regex = '^[a-zA-Z\u0A80-\u0AFF\u0900-\u097F\s\.\'\-]{2,100}$', validation = '{"min_length": 2, "max_length": 100, "class": "name"}'::jsonb WHERE field_key = 'father_husband_name';
UPDATE public.form_fields SET validation_regex = '^[a-zA-Z\u0A80-\u0AFF\u0900-\u097F\s\.\'\-]{2,100}$', validation = '{"min_length": 2, "max_length": 100, "class": "name"}'::jsonb WHERE field_key = 'relation_name';
UPDATE public.form_fields SET validation_regex = '^[a-zA-Z\u0A80-\u0AFF\u0900-\u097F\s\.\'\-]{2,100}$', validation = '{"min_length": 2, "max_length": 100, "class": "name"}'::jsonb WHERE field_key = 'sebc_caste_name';
UPDATE public.form_fields SET validation_regex = '^[a-zA-Z\u0A80-\u0AFF\u0900-\u097F\s\.\'\-]{2,100}$', validation = '{"min_length": 2, "max_length": 100, "class": "name"}'::jsonb WHERE field_key = 'caste_subcaste';
UPDATE public.form_fields SET validation_regex = '^[6-9]\d{9}$', validation = '{"class": "mobile"}'::jsonb WHERE field_key = 'mobile_number';
UPDATE public.form_fields SET validation_regex = '^[6-9]\d{9}$', validation = '{"class": "mobile"}'::jsonb WHERE field_key = 'emergency_mobile';
UPDATE public.form_fields SET validation_regex = '^\d{12}$', validation = '{"class": "aadhaar"}'::jsonb WHERE field_key = 'aadhaar_number';
UPDATE public.form_fields SET validation_regex = '^[1-9]\d{5}$', validation = '{"class": "pincode"}'::jsonb WHERE field_key = 'pincode';
UPDATE public.form_fields SET validation_regex = '^[a-zA-Z0-9\u0A80-\u0AFF\u0900-\u097F\s\.,\-\/]{2,1000}$', validation = '{"min_length": 2, "max_length": 1000, "class": "address"}'::jsonb WHERE field_key = 'residential_address';
UPDATE public.form_fields SET validation_regex = '^[a-zA-Z0-9\u0A80-\u0AFF\u0900-\u097F\s\.,\-\/]{2,1000}$', validation = '{"min_length": 2, "max_length": 1000, "class": "address"}'::jsonb WHERE field_key = 'full_address';
UPDATE public.form_fields SET validation_regex = '^[a-zA-Z0-9\u0A80-\u0AFF\u0900-\u097F\s\.,\-\/]{2,200}$', validation = '{"min_length": 2, "max_length": 200, "class": "address"}'::jsonb WHERE field_key = 'flat_house_street';
UPDATE public.form_fields SET validation_regex = '^[a-zA-Z0-9\u0A80-\u0AFF\u0900-\u097F\s\.,\-\/]{2,200}$', validation = '{"min_length": 2, "max_length": 200, "class": "address"}'::jsonb WHERE field_key = 'house_flat';
UPDATE public.form_fields SET validation_regex = '^[a-zA-Z0-9\u0A80-\u0AFF\u0900-\u097F\s\.,\-\/]{2,200}$', validation = '{"min_length": 2, "max_length": 200, "class": "address"}'::jsonb WHERE field_key = 'building_society';
UPDATE public.form_fields SET validation_regex = '^[a-zA-Z0-9\u0A80-\u0AFF\u0900-\u097F\s\.,\-\/]{2,200}$', validation = '{"min_length": 2, "max_length": 200, "class": "address"}'::jsonb WHERE field_key = 'street_road';
UPDATE public.form_fields SET validation_regex = '^[a-zA-Z0-9\u0A80-\u0AFF\u0900-\u097F\s\.,\-\/]{2,200}$', validation = '{"min_length": 2, "max_length": 200, "class": "address"}'::jsonb WHERE field_key = 'village_name';
UPDATE public.form_fields SET validation_regex = '^[a-zA-Z0-9\u0A80-\u0AFF\u0900-\u097F\s\.,\-\/]{2,200}$', validation = '{"min_length": 2, "max_length": 200, "class": "address"}'::jsonb WHERE field_key = 'village_city';
UPDATE public.form_fields SET validation_regex = '^[a-zA-Z0-9\u0A80-\u0AFF\u0900-\u097F\s\.,\-\/]{2,200}$', validation = '{"min_length": 2, "max_length": 200, "class": "address"}'::jsonb WHERE field_key = 'district';
UPDATE public.form_fields SET validation_regex = '^[a-zA-Z0-9\u0A80-\u0AFF\u0900-\u097F\s\.,\-\/]{2,200}$', validation = '{"min_length": 2, "max_length": 200, "class": "address"}'::jsonb WHERE field_key = 'taluka';
UPDATE public.form_fields SET validation_regex = '^\d+(\.\d{1,2})?$', validation = '{"min": 0, "max": 100000000, "is_decimal": true, "class": "money"}'::jsonb WHERE field_key = 'annual_income';
UPDATE public.form_fields SET validation_regex = '^\d+(\.\d{1,2})?$', validation = '{"min": 0, "max": 100000000, "is_decimal": true, "class": "money", "max_ews": 800000}'::jsonb WHERE field_key = 'family_gross_income';
UPDATE public.form_fields SET validation_regex = '^\d+(\.\d{1,2})?$', validation = '{"min": 0, "max": 100000000, "is_decimal": true, "class": "money"}'::jsonb WHERE field_key = 'income_salary';
UPDATE public.form_fields SET validation_regex = '^\d+(\.\d{1,2})?$', validation = '{"min": 0, "max": 100000000, "is_decimal": true, "class": "money"}'::jsonb WHERE field_key = 'income_business';
UPDATE public.form_fields SET validation_regex = '^\d+(\.\d{1,2})?$', validation = '{"min": 0, "max": 100000000, "is_decimal": true, "class": "money"}'::jsonb WHERE field_key = 'income_agriculture';
UPDATE public.form_fields SET validation_regex = '^\d+(\.\d{1,2})?$', validation = '{"min": 0, "max": 100000000, "is_decimal": true, "class": "money"}'::jsonb WHERE field_key = 'income_other';
UPDATE public.form_fields SET validation_regex = '^\d+(\.\d{1,2})?$', validation = '{"min": 0, "max": 100000000, "is_decimal": true, "class": "money"}'::jsonb WHERE field_key = 'avg_income_3years';
UPDATE public.form_fields SET validation_regex = '^\d+$', validation = '{"min": 1, "max": 30, "is_integer": true}'::jsonb WHERE field_key = 'earning_members_count';
UPDATE public.form_fields SET validation_regex = '^\d+$', validation = '{"min": 1, "max": 30, "is_integer": true}'::jsonb WHERE field_key = 'family_member_count';
UPDATE public.form_fields SET validation_regex = '^\d+(\.\d{1,2})?$', validation = '{"min": 0, "max": 999999, "is_decimal": true}'::jsonb WHERE field_key = 'agricultural_land_acres';
UPDATE public.form_fields SET validation_regex = '^\d+(\.\d{1,2})?$', validation = '{"min": 0, "max": 999999, "is_decimal": true}'::jsonb WHERE field_key = 'residential_flat_sqft';
UPDATE public.form_fields SET validation_regex = '^\d+(\.\d{1,2})?$', validation = '{"min": 0, "max": 999999, "is_decimal": true}'::jsonb WHERE field_key = 'residential_plot_sqyards';
UPDATE public.form_fields SET validation_regex = '^\d+(\.\d{1,2})?$', validation = '{"min": 0, "max": 999999, "is_decimal": true}'::jsonb WHERE field_key = 'residential_plot_sqft';
UPDATE public.form_fields SET validation_regex = NULL, validation = '{"class": "dob", "max_date": "today", "min_year": 1900}'::jsonb WHERE field_key = 'dob';
UPDATE public.form_fields SET validation_regex = '^[a-zA-Z0-9\+\-\/\s]{3,30}$', validation = '{"min_length": 3, "max_length": 30, "class": "id_number"}'::jsonb WHERE field_key = 'survey_number';
UPDATE public.form_fields SET validation_regex = '^[a-zA-Z0-9\+\-\/\s]{3,30}$', validation = '{"min_length": 3, "max_length": 30, "class": "id_number"}'::jsonb WHERE field_key = 'khata_number';
UPDATE public.form_fields SET validation_regex = NULL, validation = '{"class": "enum"}'::jsonb WHERE field_key = 'gender';
UPDATE public.form_fields SET validation_regex = NULL, validation = '{"class": "enum"}'::jsonb WHERE field_key = 'occupation';
UPDATE public.form_fields SET validation_regex = NULL, validation = '{"class": "enum"}'::jsonb WHERE field_key = 'income_purpose';
UPDATE public.form_fields SET validation_regex = NULL, validation = '{"class": "enum"}'::jsonb WHERE field_key = 'category';
UPDATE public.form_fields SET validation_regex = NULL, validation = '{"class": "enum"}'::jsonb WHERE field_key = 'exam_city_1';
UPDATE public.form_fields SET validation_regex = NULL, validation = '{"class": "enum"}'::jsonb WHERE field_key = 'question_paper_medium';
UPDATE public.form_fields SET validation_regex = NULL, validation = '{"class": "enum"}'::jsonb WHERE field_key = 'licence_type';
UPDATE public.form_fields SET validation_regex = NULL, validation = '{"class": "enum"}'::jsonb WHERE field_key = 'vehicle_class';
UPDATE public.form_fields SET validation_regex = NULL, validation = '{"class": "enum"}'::jsonb WHERE field_key = 'rto_office';
UPDATE public.form_fields SET validation_regex = NULL, validation = '{"class": "enum"}'::jsonb WHERE field_key = 'blood_group';
UPDATE public.form_fields SET validation_regex = NULL, validation = '{"class": "enum"}'::jsonb WHERE field_key = 'qualification';


-- -----------------------------------------------------------------------------
-- Seed Operator Form Assignments
-- -----------------------------------------------------------------------------
INSERT INTO public.operator_form_assignments (id, operator_id, form_id, is_active, assigned_by)
VALUES 
    ('6849e60e-0984-4fec-8461-88c918099487', 'b0000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', TRUE, 'a0000000-0000-0000-0000-000000000001'),
    ('65ac6ba5-71a4-4742-b2db-5e8bd823e510', 'b0000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000002', TRUE, 'a0000000-0000-0000-0000-000000000001'),
    ('e1e3094c-d78a-4910-9237-ca079f0a025f', 'b0000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000004', TRUE, 'a0000000-0000-0000-0000-000000000001'),
    ('e2b504b8-338b-4a79-868f-6332c99cb2b5', 'b0000000-0000-0000-0000-000000000003', 'f0000000-0000-0000-0000-000000000003', TRUE, 'a0000000-0000-0000-0000-000000000001'),
    ('dda5f2ef-12fe-4d59-9721-6c0bdc9e8dc7', 'b0000000-0000-0000-0000-000000000003', 'f0000000-0000-0000-0000-000000000006', TRUE, 'a0000000-0000-0000-0000-000000000001'),
    ('4b168356-8621-49dc-bac4-f577b9b8d380', 'b0000000-0000-0000-0000-000000000004', 'f0000000-0000-0000-0000-000000000005', TRUE, 'a0000000-0000-0000-0000-000000000001'),
    ('06f37b21-ffae-44f9-8e72-358624771862', 'b0000000-0000-0000-0000-000000000005', 'f0000000-0000-0000-0000-000000000004', TRUE, 'a0000000-0000-0000-0000-000000000001'),
    ('f8746317-486d-46b0-abbe-470fe0e7689a', 'b0000000-0000-0000-0000-000000000005', 'f0000000-0000-0000-0000-000000000001', TRUE, 'a0000000-0000-0000-0000-000000000001'),
    ('c32bde91-4e50-44f3-9e63-26313e6ab552', 'b0000000-0000-0000-0000-000000000005', 'f0000000-0000-0000-0000-000000000002', TRUE, 'a0000000-0000-0000-0000-000000000001'),
    ('794168b4-398d-4ab9-a4a6-8ce669387f5e', 'b0000000-0000-0000-0000-000000000006', 'f0000000-0000-0000-0000-000000000003', TRUE, 'a0000000-0000-0000-0000-000000000001'),
    ('f0bc3fcd-5ca0-44e5-ac4b-78bca55e8087', 'b0000000-0000-0000-0000-000000000006', 'f0000000-0000-0000-0000-000000000005', TRUE, 'a0000000-0000-0000-0000-000000000001'),
    ('255f2fd6-f21f-45ce-9ac5-c8459378939c', 'b0000000-0000-0000-0000-000000000006', 'f0000000-0000-0000-0000-000000000006', TRUE, 'a0000000-0000-0000-0000-000000000001')
ON CONFLICT (operator_id, form_id) DO NOTHING;
