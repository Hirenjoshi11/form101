import uuid
from datetime import datetime, timezone
from typing import Dict, List, Any, Optional

# In-Memory Database Store for Instant Local Execution & Testing, with Supabase Structure
class DatabaseStore:
    def __init__(self):
        self.admins: Dict[str, Dict[str, Any]] = {}
        self.operators: Dict[str, Dict[str, Any]] = {}
        self.operator_form_assignments: Dict[str, Dict[str, Any]] = {}
        self.users: Dict[str, Dict[str, Any]] = {}
        self.forms: Dict[str, Dict[str, Any]] = {}
        self.form_fields: Dict[str, Dict[str, Any]] = {}
        self.submissions: Dict[str, Dict[str, Any]] = {}
        self.submission_field_values: Dict[str, Dict[str, Any]] = {}
        self.submission_documents: Dict[str, Dict[str, Any]] = {}
        self.otp_requests: Dict[str, Dict[str, Any]] = {}
        self.payments: Dict[str, Dict[str, Any]] = {}
        self.notifications: Dict[str, Dict[str, Any]] = {}
        self.feedbacks: Dict[str, Dict[str, Any]] = {}
        self.audit_logs: List[Dict[str, Any]] = []
        
        self.seed_data()

    def seed_data(self):
        # 1. Admin
        admin_id = "a0000000-0000-0000-0000-000000000001"
        self.admins[admin_id] = {
            "id": admin_id,
            "full_name": "Gujarat Seva Admin",
            "email": "admin@formseva.gujarat.gov.in",
            "role": "super_admin",
            "is_active": True,
            "created_at": datetime.now(timezone.utc)
        }

        # 2. 4 Seed Operators (Vicky, Nikhil, DHulo, Loy)
        operators_data = [
            {"id": "b0000000-0000-0000-0000-000000000001", "full_name": "Vicky", "email": "vicky.operator@formseva.in", "phone": "+91 98250 11223", "district": "Ahmedabad", "assigned_count": 12, "completed_count": 110},
            {"id": "b0000000-0000-0000-0000-000000000002", "full_name": "Nikhil", "email": "nikhil.operator@formseva.in", "phone": "+91 98251 22334", "district": "Vadodara", "assigned_count": 8, "completed_count": 94},
            {"id": "b0000000-0000-0000-0000-000000000003", "full_name": "DHulo", "email": "dhulo.operator@formseva.in", "phone": "+91 98252 33445", "district": "Surat", "assigned_count": 15, "completed_count": 142},
            {"id": "b0000000-0000-0000-0000-000000000004", "full_name": "Loy", "email": "loy.operator@formseva.in", "phone": "+91 98253 44556", "district": "Rajkot", "assigned_count": 5, "completed_count": 87},
        ]
        for op in operators_data:
            self.operators[op["id"]] = {
                **op,
                "created_by_admin_id": admin_id,
                "is_active": True,
                "created_at": datetime.now(timezone.utc)
            }

        # 3. 5 Demo Citizen User Profiles
        demo_users_data = [
            {"id": "c0000000-0000-0000-0000-000000000001", "full_name": "Rameshchandra B. Patel", "email": "ramesh.patel@gmail.com", "phone": "+91 98250 44551", "preferred_language": "gu", "aadhaar_last_four": "4551", "role": "citizen"},
            {"id": "c0000000-0000-0000-0000-000000000002", "full_name": "Priyaben Hiteshbhai Shah", "email": "priya.shah.med@gmail.com", "phone": "+91 98791 88234", "preferred_language": "gu", "aadhaar_last_four": "8234", "role": "citizen"},
            {"id": "c0000000-0000-0000-0000-000000000003", "full_name": "Rajeshbhai Devjibhai Rathod", "email": "rajesh.rathod.surat@gmail.com", "phone": "+91 97234 11980", "preferred_language": "gu", "aadhaar_last_four": "1980", "role": "citizen"},
            {"id": "c0000000-0000-0000-0000-000000000004", "full_name": "Hansaben Bharatbhai Makwana", "email": "hansa.makwana.rajkot@gmail.com", "phone": "+91 99090 77612", "preferred_language": "gu", "aadhaar_last_four": "7612", "role": "citizen"},
            {"id": "c0000000-0000-0000-0000-000000000005", "full_name": "Aniket Mansukhbhai Chaudhary", "email": "aniket.chaudhary.mehsana@gmail.com", "phone": "+91 94280 33499", "preferred_language": "gu", "aadhaar_last_four": "3499", "role": "citizen"},
        ]
        for usr in demo_users_data:
            self.users[usr["id"]] = {
                **usr,
                "created_at": datetime.now(timezone.utc)
            }
        citizen_id = demo_users_data[0]["id"]

        # 4. 6 Official Gujarat Certificate & Exam Forms
        forms_data = [
            {
                "id": "f0000000-0000-0000-0000-000000000001",
                "slug": "income_certificate",
                "title_gu": "આવકનું પ્રમાણપત્ર",
                "title_hi": "आय प्रमाण पत्र",
                "title_en": "Income Certificate",
                "description_gu": "મામલતદાર / તાલુકા વિકાસ અધિકારી દ્વારા વાર્ષિક આવકનું માન્ય પ્રમાણપત્ર.",
                "description_hi": "मामलतदार / तालुका विकास अधिकारी द्वारा वार्षिक आय का अधिकृत प्रमाण पत्र।",
                "description_en": "Official Annual Income Certificate issued by Revenue Dept / Mamlatdar Office.",
                "department_name_gu": "મહેસૂલ વિભાગ, ગુજરાત સરકાર",
                "department_name_hi": "राजस्व विभाग, गुजरात सरकार",
                "department_name_en": "Revenue Department, Govt of Gujarat",
                "official_fee": 20.00,
                "service_fee": 99.00,
                "turnaround_days": 2,
                "expected_otp_count": 1,
                "myth_en": "Income Certificate in Gujarat is valid for only 1 year and must be renewed every financial year.",
                "myth_gu": "આવકનો દાખલો માત્ર ૧ વર્ષ માટે જ માન્ય રહે છે અને દર વર્ષે ફરીથી કઢાવવો પડે છે.",
                "fact_en": "Under Gujarat Revenue Department Resolution, Income Certificates are valid for 3 Financial Years (until 31st March of the 3rd year) unless family income changes drastically.",
                "fact_gu": "ગુજરાત મહેસૂલ વિભાગના ઠરાવ મુજબ આવકનું પ્રમાણપત્ર સળંગ ૩ નાણાકીય વર્ષ (ત્રીજા વર્ષની ૩૧મી માર્ચ) સુધી સંપૂર્ણ માન્ય રહે છે.",
                "required_docs_json": [
                    {"key": "aadhaar_card", "label_gu": "આધાર કાર્ડ", "label_hi": "आधार कार्ड", "label_en": "Aadhaar Card", "required": True},
                    {"key": "ration_card", "label_gu": "રેશન કાર્ડ", "label_hi": "राशन कार्ड", "label_en": "Ration Card", "required": True},
                    {"key": "income_proof", "label_gu": "આવકનો પુરાવો (તલાટી દાખલો / પગાર સ્લિપ / ITR)", "label_hi": "आय का प्रमाण (तलाटी रिपोर्ट / सैलरी स्लिप / ITR)", "label_en": "Income Proof (Talati Certificate / Salary Slip / ITR)", "required": True},
                    {"key": "electricity_bill", "label_gu": "લાઈટ બિલ / વેરા બિલ", "label_hi": "बिजली बिल / टैक्स रसीद", "label_en": "Electricity Bill / Property Tax Receipt", "required": True}
                ],
                "is_active": True,
                "sort_order": 1
            },
            {
                "id": "f0000000-0000-0000-0000-000000000002",
                "slug": "ews_certificate",
                "title_gu": "EWS (આર્થિક રીતે નબળા વર્ગ) પ્રમાણપત્ર",
                "title_hi": "ईडब्ल्यूएस (आर्थिक रूप से कमजोर वर्ग) प्रमाण पत्र",
                "title_en": "Economically Weaker Section (EWS) Certificate",
                "description_gu": "શિક્ષણ અને સરકારી નોકરીઓમાં ૧૦% અનામત માટે બિન-અનામત વર્ગનું EWS પ્રમાણપત્ર.",
                "description_hi": "शिक्षा और सरकारी नौकरियों में 10% आरक्षण हेतु सामान्य वर्ग का ईडब्ल्यूएस प्रमाण पत्र।",
                "description_en": "10% reservation certificate for general category citizens in education & jobs.",
                "department_name_gu": "સામાજિક ન્યાય અને અધિકારિતા વિભાગ",
                "department_name_hi": "सामाजिक न्याय एवं अधिकारिता विभाग",
                "department_name_en": "Social Justice & Empowerment Department",
                "official_fee": 50.00,
                "service_fee": 99.00,
                "turnaround_days": 2,
                "expected_otp_count": 2,
                "myth_en": "EWS quota certificate is available to all backward classes including SC, ST, and SEBC/OBC.",
                "myth_gu": "EWS ૧૦% અનામત પ્રમાણપત્ર SC, ST અને OBC સહિત તમામ પછાત વર્ગના લોકો પણ મેળવી શકે છે.",
                "fact_en": "EWS is strictly reserved for General / Open category candidates whose family income is below ₹8 Lakh per annum and who are not covered under SC/ST/SEBC quotas.",
                "fact_gu": "EWS અનામત ફક્ત એવા બિન-અનામત (General/Open) વર્ગ માટે જ છે જેઓ SC, ST કે SEBC/OBC ક્વોટામાં આવતા નથી અને વાર્ષિક આવક ૮ લાખથી ઓછી છે.",
                "required_docs_json": [
                    {"key": "aadhaar_card", "label_gu": "આધાર કાર્ડ", "label_hi": "आधार कार्ड", "label_en": "Aadhaar Card", "required": True},
                    {"key": "school_lc", "label_gu": "શાળા L.C. / જન્મ દાખલો", "label_hi": "स्कूल एलसी / जन्म प्रमाण", "label_en": "School LC / Birth Certificate", "required": True},
                    {"key": "income_proof", "label_gu": "કુટુંબની કુલ વાર્ષિક આવકનો પુરાવો (< ૮ લાખ)", "label_hi": "पारिवारिक आय प्रमाण (< 8 लाख)", "label_en": "Family Annual Income Proof (< 8 Lakhs)", "required": True},
                    {"key": "property_proof", "label_gu": "મકાન / જમીનના દસ્તાવેજ (૭/૧૨ અથવા વેરા બિલ)", "label_hi": "मकान / भूमि दस्तावेज", "label_en": "Property / Land Documents (7/12 or House Tax)", "required": True},
                    {"key": "caste_pedigree", "label_gu": "પેઢીનામું / સોગંદનામું", "label_hi": "वंशावली / जाति शपथ पत्र", "label_en": "Pedigree (Pedhinamu) / Affidavit", "required": True}
                ],
                "is_active": True,
                "sort_order": 2
            },
            {
                "id": "f0000000-0000-0000-0000-000000000003",
                "slug": "caste_ncl_certificate",
                "title_gu": "નોન-ક્રીમીલેયર (NCL) / SEBC દાખલો",
                "title_hi": "नॉन-क्रीमीलेयर (एनसीएल) / ओबीसी प्रमाण पत्र",
                "title_en": "Non-Creamy Layer (NCL) / SEBC Certificate",
                "description_gu": "SEBC / OBC કેટેગરીના લાભાર્થીઓ માટે ૩ વર્ષ માન્યતા ધરાવતું નોન-ક્રીમીલેયર પ્રમાણપત્ર.",
                "description_hi": "ओबीसी/एसईबीसी वर्ग के लिए 3 वर्ष की वैधता वाला नॉन-क्रीमीलेयर प्रमाण पत्र।",
                "description_en": "3-year validity Non-Creamy Layer certificate for SEBC / OBC category benefits.",
                "department_name_gu": "સામાજિક ન્યાય અને અધિકારિતા વિભાગ",
                "department_name_hi": "सामाजिक न्याय एवं अधिकारिता विभाग",
                "department_name_en": "Social Justice & Empowerment Department",
                "official_fee": 20.00,
                "service_fee": 89.00,
                "turnaround_days": 2,
                "expected_otp_count": 1,
                "myth_en": "OBC Caste Certificate and Non-Creamy Layer (NCL) Certificate are the same document and NCL never expires.",
                "myth_gu": "જાતિનો દાખલો (Caste Certificate) અને નોન-ક્રીમીલેયર (NCL) બંને એક જ છે અને NCL ક્યારેય એક્સપાયર થતો નથી.",
                "fact_en": "Caste certificate proves your social identity with lifetime validity, whereas NCL Certificate certifies income eligibility under creamy layer ceiling and is valid for 3 Financial Years.",
                "fact_gu": "જાતિનું પ્રમાણપત્ર આજીવન માન્ય હોય છે, જ્યારે નોન-ક્રીમીલેયર (NCL) આવક મર્યાદા દર્શાવે છે અને તે ૩ નાણાકીય વર્ષ માટે જ માન્ય રહે છે.",
                "required_docs_json": [
                    {"key": "applicant_lc", "label_gu": "અરજદારની શાળા L.C.", "label_hi": "आवेदक का स्कूल एलसी", "label_en": "Applicant School LC", "required": True},
                    {"key": "father_lc", "label_gu": "પિતાશ્રીની શાળા L.C.", "label_hi": "पिता का स्कूल एलसी", "label_en": "Father School LC", "required": True},
                    {"key": "caste_cert", "label_gu": "મૂળ SEBC જાતિ પ્રમાણપત્ર નકલ", "label_hi": "मूल जाति प्रमाण पत्र", "label_en": "Original SEBC Caste Certificate Copy", "required": True},
                    {"key": "aadhaar_card", "label_gu": "આધાર કાર્ડ", "label_hi": "आधार कार्ड", "label_en": "Aadhaar Card", "required": True},
                    {"key": "income_proof_3yrs", "label_gu": "છેલ્લા ૩ વર્ષની આવકના પુરાવા (ITR / તલાટી પંચનામું)", "label_hi": "3 वर्षों का आय प्रमाण", "label_en": "Last 3 Years Income Proof (ITR / Talati)", "required": True}
                ],
                "is_active": True,
                "sort_order": 3
            },
            {
                "id": "f0000000-0000-0000-0000-000000000004",
                "slug": "land_records_7_12",
                "title_gu": "૭/૧૨ અને ૮-અ જમીન રેકોર્ડ નકલ (AnyRoR)",
                "title_hi": "7/12 एवं 8-अ भूमि रिकॉर्ड नकल (AnyRoR)",
                "title_en": "7/12 & 8-A Land Record Extracts (AnyRoR)",
                "description_gu": "ગુજરાતના કોઈપણ ગામના અધિકૃત ડિજિટલ સહીવાળા ૭/૧૨, ૮-અ અને હક્ક પત્રક ૬ ઉતારા.",
                "description_hi": "गुजरात के किसी भी गांव के डिजिटल हस्ताक्षरित 7/12, 8-ए नकल।",
                "description_en": "Digitally signed official certified land records 7/12, 8-A & VF-6 from AnyRoR Gujarat.",
                "department_name_gu": "મહેસૂલ વિભાગ - જમીન દફતર",
                "department_name_hi": "राजस्व विभाग - भूमि अभिलेख",
                "department_name_en": "Revenue Dept - Land Records (AnyRoR)",
                "official_fee": 15.00,
                "service_fee": 50.00,
                "turnaround_days": 1,
                "expected_otp_count": 1,
                "myth_en": "Online AnyRoR 7/12 copies cannot be accepted by banks for KCC or loan mortgages without manual Talati physical stamp.",
                "myth_gu": "ઓનલાઇન ડાઉનલોડ કરેલી AnyRoR ૭/૧૨ નકલ પર તલાટીનો સિક્કો ન હોય તો બેંક લોન માટે માન્ય ગણાતી નથી.",
                "fact_en": "Digitally signed AnyRoR 7/12 records with Gujarat Govt QR code and barcode watermark have 100% legal validity under Sec 65B of Indian Evidence Act across all banks, registries, and courts.",
                "fact_gu": "ક્યુઆર કોડ અને ડિજિટલ સહીવાળી AnyRoR ૭/૧૨ નકલ તમામ રાષ્ટ્રીયકૃત બેંકો, દસ્તાવેજ રજીસ્ટ્રાર અને કોર્ટમાં કાયદેસર ૧૦૦% માન્ય ગણાય છે.",
                "required_docs_json": [
                    {"key": "applicant_id", "label_gu": "અરજદારનું ઓળખપત્ર (આધાર કાર્ડ)", "label_hi": "पहचान पत्र (आधार)", "label_en": "Applicant Photo ID (Aadhaar)", "required": True},
                    {"key": "old_survey_copy", "label_gu": "જૂની પાવતી / નોંધ (જો ઉપલબ્ધ હોય તો)", "label_hi": "पुरानी रसीद", "label_en": "Survey / Block Slip / Old Receipt (Optional)", "required": False}
                ],
                "is_active": True,
                "sort_order": 4
            },
            {
                "id": "f0000000-0000-0000-0000-000000000005",
                "slug": "driving_licence_rto",
                "title_gu": "ડ્રાઇવિંગ / લર્નિંગ લાયસન્સ સહાયતા (RTO સારથી)",
                "title_hi": "ड्राइविंग / लर्निंग लाइसेंस सहायता (RTO सारथी)",
                "title_en": "Driving / Learner Licence Assistance (Sarathi RTO)",
                "description_gu": "લર્નિંગ લાયસન્સ સ્લોટ બુકિંગ, ફોર્મ ફાઈલિંગ અને કાયમી લાયસન્સ સંપૂર્ણ સહાયતા.",
                "description_hi": "लर्निंग लाइसेंस स्लॉट बुकिंग, फॉर्म फाइलिंग एवं सहायता।",
                "description_en": "End-to-end Sarathi Parivahan portal filing, slot appointment, and document verification.",
                "department_name_gu": "વાહન વ્યવહાર કમિશનર કચેરી (RTO)",
                "department_name_hi": "परिवहन आयुक्त कार्यालय (RTO)",
                "department_name_en": "Transport Department (RTO Gujarat)",
                "official_fee": 150.00,
                "service_fee": 850.00,
                "turnaround_days": 2,
                "expected_otp_count": 2,
                "myth_en": "You must physically visit the RTO office and wait in long queues for hours just to take the Learner Licence test.",
                "myth_gu": "લર્નિંગ લાયસન્સની પરીક્ષા આપવા માટે ફરજિયાત RTO કચેરીએ જઈને આખો દિવસ લાઈનમાં ઊભા રહેવું પડે છે.",
                "fact_en": "Under Gujarat's Contactless Faceless RTO (Sarathi 4.0), you can take the online LL computer theory test from home via Aadhaar facial recognition and download your LL immediately upon passing.",
                "fact_gu": "ગુજરાત પરિવહન વિભાગની ફેસલેસ RTO પહેલ હેઠળ તમે ઘરે બેઠા મોબાઈલ/લેપટોપ પરથી આધાર ફેસ ઓથેન્ટિકેશનથી ઓનલાઇન LL પરીક્ષા આપીને તુરંત લાયસન્સ ડાઉનલોડ કરી શકો છો.",
                "required_docs_json": [
                    {"key": "aadhaar_card", "label_gu": "આધાર કાર્ડ (મોબાઈલ લિંક હોવું જરૂરી)", "label_hi": "आधार कार्ड (मोबाइल लिंक)", "label_en": "Aadhaar Card (Mobile Linked)", "required": True},
                    {"key": "age_proof_lc", "label_gu": "શાળા L.C. / જન્મ દાખલો / ૧૦મી માર્કશીટ", "label_hi": "स्कूल एलसी / जन्म प्रमाण", "label_en": "School LC / Birth Certificate / 10th Marksheet", "required": True},
                    {"key": "signature_scan", "label_gu": "સફેદ કાગળ પર સ્પષ્ટ સહીનો ફોટો", "label_hi": "सफेद कागज पर हस्ताक्षर", "label_en": "Signature Scan on Plain White Paper", "required": True}
                ],
                "is_active": True,
                "sort_order": 5
            },
            {
                "id": "f0000000-0000-0000-0000-000000000006",
                "slug": "neet_exam",
                "title_gu": "NEET UG મેડિકલ પ્રવેશ પરીક્ષા ૨૦૨૬",
                "title_hi": "नीट यूजी मेडिकल प्रवेश परीक्षा 2026",
                "title_en": "NEET UG Medical Entrance Exam 2026",
                "description_gu": "NTA NEET UG 2026 પરીક્ષા ઓનલાઇન રજીસ્ટ્રેશન, ફોટો સ્કેન અને કેન્દ્ર પસંદગી સહાયતા.",
                "description_hi": "NTA नीट यूजी 2026 ऑनलाइन परीक्षा पंजीकरण एवं फॉर्म सहायता।",
                "description_en": "NTA NEET UG 2026 online registration, document resizing, and exam city selection.",
                "department_name_gu": "નેશનલ ટેસ્ટિંગ એજન્સી (NTA) / આરોગ્ય મંત્રાલય",
                "department_name_hi": "राष्ट्रीय परीक्षा एजेंसी (NTA)",
                "department_name_en": "National Testing Agency (NTA)",
                "official_fee": 1700.00,
                "service_fee": 300.00,
                "turnaround_days": 2,
                "expected_otp_count": 2,
                "myth_en": "If a candidate chooses Gujarati medium for NEET UG, the question booklet will only be in Gujarati and English questions will not be available.",
                "myth_gu": "જો NEET પરીક્ષામાં ગુજરાતી માધ્યમ પસંદ કરીએ તો પ્રશ્નપત્ર ફક્ત ગુજરાતીમાં જ આવશે અને અંગ્રેજી ભાષાંતર જોવા નહીં મળે.",
                "fact_en": "If Gujarati medium is selected, NTA provides a Bilingual Question Booklet with every question printed in both Gujarati and English side-by-side on the same page.",
                "fact_gu": "જો તમે ગુજરાતી માધ્યમ પસંદ કરો છો તો NTA દ્વારા આપવામાં આવતી પ્રશ્નપુસ્તિકામાં દરેક પ્રશ્ન ગુજરાતી અને અંગ્રેજી બંને ભાષામાં સામસામે છપાયેલો હોય છે.",
                "required_docs_json": [
                    {"key": "passport_photo", "label_gu": "પાસપોર્ટ ફોટો (સફેદ બેકગ્રાઉન્ડ, ૮૦% ચહેરો)", "label_hi": "पासपोर्ट फोटो", "label_en": "Passport Photo (White BG, 80% face)", "required": True},
                    {"key": "signature_photo", "label_gu": "સફેદ કાગળ પર સહીનો ફોટો", "label_hi": "हस्ताक्षर", "label_en": "Signature Photo on White Paper", "required": True},
                    {"key": "thumb_impression", "label_gu": "ડાબા અને જમણા હાથના અંગૂઠા અને આંગળીઓની છાપ", "label_hi": "अंगूठे का निशान", "label_en": "Left & Right Hand Fingers and Thumb Impression", "required": True},
                    {"key": "class_10_marksheet", "label_gu": "ધોરણ ૧૦ માર્કશીટ / પ્રમાણપત્ર", "label_hi": "10वीं मार्कशीट", "label_en": "Class 10 Marksheet / Passing Certificate", "required": True}
                ],
                "is_active": True,
                "sort_order": 6
            }
        ]

        for form in forms_data:
            self.forms[form["id"]] = {
                **form,
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            }

        # 5. Form Fields for Form 1: Income Certificate (Digital Gujarat)
        form_1_id = "f0000000-0000-0000-0000-000000000001"
        income_fields = [
            {"field_key": "applicant_name", "step_section": "personal", "field_type": "text", "label_gu": "અરજદારનું પૂરું નામ", "label_hi": "आवेदक का पूरा नाम", "label_en": "Full Name of Applicant", "placeholder_gu": "જેમ આધાર કાર્ડમાં છે તેમ", "placeholder_hi": "जैसा आधार कार्ड में है", "placeholder_en": "As per Aadhaar card", "is_required": True, "sort_order": 1},
            {"field_key": "father_husband_name", "step_section": "personal", "field_type": "text", "label_gu": "પિતા / પતિનું નામ", "label_hi": "पिता / पति का नाम", "label_en": "Father / Husband Name", "placeholder_gu": "પિતા અથવા પતિનું નામ", "placeholder_hi": "पिता / पति का नाम", "placeholder_en": "Father or husband name", "is_required": True, "sort_order": 2},
            {"field_key": "gender", "step_section": "personal", "field_type": "select", "label_gu": "જાતિ / લિંગ", "label_hi": "लिंग", "label_en": "Gender", "options_json": [{"value": "male", "label_gu": "પુરુષ", "label_hi": "पुरुष", "label_en": "Male"}, {"value": "female", "label_gu": "સ્ત્રી", "label_hi": "महिला", "label_en": "Female"}, {"value": "other", "label_gu": "અન્ય", "label_hi": "अन्य", "label_en": "Other"}], "is_required": True, "sort_order": 3},
            {"field_key": "dob", "step_section": "personal", "field_type": "date", "label_gu": "જન્મ તારીખ", "label_hi": "जन्म तिथि", "label_en": "Date of Birth", "is_required": True, "sort_order": 4},
            {"field_key": "mobile_number", "step_section": "personal", "field_type": "number", "label_gu": "મોબાઈલ નંબર", "label_hi": "मोबाइल नंबर", "label_en": "Mobile Number", "placeholder_gu": "10 અંકનો મોબાઈલ નંબર", "placeholder_hi": "10 अंकों का मोबाइल", "placeholder_en": "10-digit mobile number", "is_required": True, "sort_order": 5},
            {"field_key": "aadhaar_number", "step_section": "personal", "field_type": "number", "label_gu": "આધાર કાર્ડ નંબર", "label_hi": "आधार कार्ड नंबर", "label_en": "Aadhaar Card Number", "placeholder_gu": "12 અંકનો આધાર નંબર", "placeholder_hi": "12 अंकों का आधार", "placeholder_en": "12-digit Aadhaar number", "is_required": True, "sort_order": 6},
            {"field_key": "caste_category", "step_section": "personal", "field_type": "select", "label_gu": "સામાજિક કેટેગરી", "label_hi": "सामाजिक श्रेणी", "label_en": "Social Category", "options_json": [{"value": "general", "label_gu": "જનરલ (General)", "label_hi": "सामान्य", "label_en": "General"}, {"value": "sebc", "label_gu": "SEBC / OBC (ઓબીસી)", "label_hi": "ओबीसी", "label_en": "SEBC / OBC"}, {"value": "sc", "label_gu": "SC (અનુસૂચિત જાતિ)", "label_hi": "एससी", "label_en": "Scheduled Caste (SC)"}, {"value": "st", "label_gu": "ST (અનુસૂચિત જનજાતિ)", "label_hi": "एसटी", "label_en": "Scheduled Tribe (ST)"}, {"value": "ews", "label_gu": "EWS (બિન-અનામત નબળા વર્ગ)", "label_hi": "ईडब्ल्यूएस", "label_en": "EWS"}], "is_required": True, "sort_order": 7},
            {"field_key": "district", "step_section": "address", "field_type": "select", "label_gu": "જિલ્લો", "label_hi": "जिला", "label_en": "District", "options_json": [{"value": "Ahmedabad", "label_gu": "અમદાવાદ", "label_hi": "अहमदाबाद", "label_en": "Ahmedabad"}, {"value": "Surat", "label_gu": "સુરત", "label_hi": "सूरत", "label_en": "Surat"}, {"value": "Vadodara", "label_gu": "વડોદરા", "label_hi": "वडोदरा", "label_en": "Vadodara"}, {"value": "Rajkot", "label_gu": "રાજકોટ", "label_hi": "राजकोट", "label_en": "Rajkot"}, {"value": "Bhavnagar", "label_gu": "ભાવનગર", "label_hi": "भावनगर", "label_en": "Bhavnagar"}, {"value": "Jamnagar", "label_gu": "જામનગર", "label_hi": "जामनगर", "label_en": "Jamnagar"}, {"value": "Gandhinagar", "label_gu": "ગાંધીનગર", "label_hi": "गांधीनगर", "label_en": "Gandhinagar"}, {"value": "Junagadh", "label_gu": "જૂનાગઢ", "label_hi": "जूनागढ़", "label_en": "Junagadh"}, {"value": "Anand", "label_gu": "આણંદ", "label_hi": "आणंद", "label_en": "Anand"}, {"value": "Mehsana", "label_gu": "મહેસાણા", "label_hi": "मेहसाणा", "label_en": "Mehsana"}], "is_required": True, "sort_order": 8},
            {"field_key": "taluka", "step_section": "address", "field_type": "text", "label_gu": "તાલુકો", "label_hi": "तालुका", "label_en": "Taluka / Tehsil", "placeholder_gu": "તાલુકાનું નામ", "placeholder_hi": "तालुका का नाम", "placeholder_en": "Taluka name", "is_required": True, "sort_order": 9},
            {"field_key": "village_city", "step_section": "address", "field_type": "text", "label_gu": "ગામ / શહેર", "label_hi": "गांव / शहर", "label_en": "Village / City", "placeholder_gu": "ગામ અથવા શહેરનું નામ", "placeholder_hi": "गांव या शहर", "placeholder_en": "Village or City", "is_required": True, "sort_order": 10},
            {"field_key": "residential_address", "step_section": "address", "field_type": "textarea", "label_gu": "રહેઠાણનું સરનામું (ઘર નં., સોસાયટી/શેરી)", "label_hi": "आवासीय पता", "label_en": "Full Residential Address", "placeholder_gu": "સંપૂર્ણ સરનામું", "placeholder_hi": "पूरा पता", "placeholder_en": "Complete house/street address", "is_required": True, "sort_order": 11},
            {"field_key": "pincode", "step_section": "address", "field_type": "number", "label_gu": "પીનકોડ", "label_hi": "पिनकोड", "label_en": "Pincode (6 digits)", "placeholder_gu": "6 અંકનો પીનકોડ", "placeholder_hi": "6 अंकों का पिनकोड", "placeholder_en": "6-digit pincode", "is_required": True, "sort_order": 12},
            {"field_key": "residence_years", "step_section": "address", "field_type": "number", "label_gu": "ગુજરાતમાં કેટલા વર્ષથી વસવાટ કરો છો?", "label_hi": "गुजरात में कितने वर्षों से निवास?", "label_en": "Years of Residence in Gujarat", "placeholder_gu": "દા.ત. 15", "placeholder_hi": "उदा. 15", "placeholder_en": "e.g. 15", "is_required": True, "sort_order": 13},
            {"field_key": "occupation", "step_section": "specific", "field_type": "select", "label_gu": "વ્યવસાય / કામધંધો", "label_hi": "व्यवसाय", "label_en": "Occupation / Profession", "options_json": [{"value": "agriculture", "label_gu": "ખેતી / પશુપાલન", "label_hi": "कृषि / पशुपालन", "label_en": "Agriculture / Farming"}, {"value": "labor", "label_gu": "મજૂરી કામ / છૂટક કામ", "label_hi": "मजदूरी / दैनिक वेतन", "label_en": "Daily Wage / Labor"}, {"value": "private_job", "label_gu": "ખાનગી નોકરી", "label_hi": "निजी नौकरी", "label_en": "Private Employment"}, {"value": "gov_job", "label_gu": "સરકારી નોકરી", "label_hi": "सरकारी नौकरी", "label_en": "Government Employee"}, {"value": "business", "label_gu": "વેપાર / નાનો ધંધો", "label_hi": "व्यापार / लघु उद्योग", "label_en": "Small Business / Trade"}, {"value": "other", "label_gu": "અન્ય", "label_hi": "अन्य", "label_en": "Other"}], "is_required": True, "sort_order": 14},
            {"field_key": "annual_income", "step_section": "specific", "field_type": "number", "label_gu": "કુલ વાર્ષિક આવક (રૂપિયામાં)", "label_hi": "कुल वार्षिक आय (रुपये में)", "label_en": "Total Annual Family Income (INR)", "placeholder_gu": "દા.ત. 120000", "placeholder_hi": "उदा. 120000", "placeholder_en": "e.g. 120000", "is_required": True, "sort_order": 15},
            {"field_key": "income_purpose", "step_section": "specific", "field_type": "select", "label_gu": "દાખલાનો હેતુ (ક્યાં રજૂ કરવાનો છે)", "label_hi": "प्रमाण पत्र का उद्देश्य", "label_en": "Purpose of Certificate", "options_json": [{"value": "scholarship", "label_gu": "શાળા / કોલેજ સ્કોલરશીપ માટે", "label_hi": "छात्रवृत्ति हेतु", "label_en": "School / College Scholarship"}, {"value": "rte_admission", "label_gu": "RTE શાળા પ્રવેશ માટે", "label_hi": "आरटीई प्रवेश हेतु", "label_en": "RTE School Admission"}, {"value": "ayushman_card", "label_gu": "આયુષ્માન ભારત કાર્ડ", "label_hi": "आयुष्मान भारत कार्ड हेतु", "label_en": "Ayushman Bharat / Health Scheme"}, {"value": "general_use", "label_gu": "સામાન્ય સરકારી કામકાજ", "label_hi": "सामान्य उपयोग", "label_en": "General Government Purpose"}], "is_required": True, "sort_order": 16},
            {"field_key": "family_member_count", "step_section": "specific", "field_type": "number", "label_gu": "કુટુંબના કુલ સભ્યોની સંખ્યા", "label_hi": "परिवार के कुल सदस्यों की संख्या", "label_en": "Total Family Members Count", "placeholder_gu": "દા.ત. 4", "placeholder_hi": "उदा. 4", "placeholder_en": "e.g. 4", "is_required": True, "sort_order": 17},
            {"field_key": "ration_card_no", "step_section": "specific", "field_type": "text", "label_gu": "રેશન કાર્ડ નંબર", "label_hi": "राशन कार्ड नंबर", "label_en": "Ration Card Number", "placeholder_gu": "રેશન કાર્ડ નંબર લખો", "placeholder_hi": "राशन कार्ड संख्या", "placeholder_en": "Ration Card Number", "is_required": True, "sort_order": 18}
        ]
        for field in income_fields:
            field_id = str(uuid.uuid4())
            self.form_fields[field_id] = {"id": field_id, "form_id": form_1_id, **field, "created_at": datetime.now(timezone.utc), "updated_at": datetime.now(timezone.utc)}

        # 6. Form Fields for Form 2: EWS Certificate
        form_2_id = "f0000000-0000-0000-0000-000000000002"
        ews_fields = [
            {"field_key": "applicant_name", "step_section": "personal", "field_type": "text", "label_gu": "અરજદારનું પૂરું નામ", "label_hi": "आवेदक का पूरा नाम", "label_en": "Applicant Full Name", "placeholder_gu": "આધાર મુજબ નામ", "placeholder_hi": "आधार अनुसार नाम", "placeholder_en": "Name as per Aadhaar", "is_required": True, "sort_order": 1},
            {"field_key": "father_husband_name", "step_section": "personal", "field_type": "text", "label_gu": "પિતા / પતિનું નામ", "label_hi": "पिता / पति का नाम", "label_en": "Father / Husband Name", "is_required": True, "sort_order": 2},
            {"field_key": "gender", "step_section": "personal", "field_type": "select", "label_gu": "લિંગ / જાતિ", "label_hi": "लिंग", "label_en": "Gender", "options_json": [{"value": "male", "label_gu": "પુરુષ", "label_hi": "पुरुष", "label_en": "Male"}, {"value": "female", "label_gu": "સ્ત્રી", "label_hi": "महिला", "label_en": "Female"}, {"value": "other", "label_gu": "અન્ય", "label_hi": "अन्य", "label_en": "Other"}], "is_required": True, "sort_order": 3},
            {"field_key": "dob", "step_section": "personal", "field_type": "date", "label_gu": "જન્મ તારીખ", "label_hi": "जन्म तिथि", "label_en": "Date of Birth", "is_required": True, "sort_order": 4},
            {"field_key": "mobile_number", "step_section": "personal", "field_type": "number", "label_gu": "મોબાઈલ નંબર", "label_hi": "मोबाइल नंबर", "label_en": "Mobile Number", "placeholder_gu": "10 અંકનો મોબાઈલ નંબર", "placeholder_hi": "10 अंकों का मोबाइल", "placeholder_en": "10-digit mobile number", "is_required": True, "sort_order": 5},
            {"field_key": "aadhaar_number", "step_section": "personal", "field_type": "number", "label_gu": "આધાર કાર્ડ નંબર", "label_hi": "आधार कार्ड नंबर", "label_en": "Aadhaar Card Number", "is_required": True, "sort_order": 6},
            {"field_key": "caste_subcaste", "step_section": "personal", "field_type": "text", "label_gu": "જ્ઞાતિ અને પેટા-જ્ઞાતિ (બિન-અનામત / Open)", "label_hi": "जाति एवं उप-जाति (सामान्य)", "label_en": "Caste & Sub-Caste (General Category)", "placeholder_gu": "દા.ત. પાટીદાર, બ્રાહ્મણ, રાજપૂત, જૈન", "placeholder_hi": "उदा. पाटीदार, ब्राह्मण, राजपूत", "placeholder_en": "e.g. Patel, Brahmin, Rajput, Jain", "is_required": True, "sort_order": 7},
            {"field_key": "religion", "step_section": "personal", "field_type": "select", "label_gu": "ધર્મ", "label_hi": "धर्म", "label_en": "Religion", "options_json": [{"value": "hindu", "label_gu": "હિન્દુ", "label_hi": "हिन्दू", "label_en": "Hindu"}, {"value": "jain", "label_gu": "જૈન", "label_hi": "जैन", "label_en": "Jain"}, {"value": "muslim", "label_gu": "મુસ્લિમ", "label_hi": "मुस्लिम", "label_en": "Muslim"}, {"value": "christian", "label_gu": "ખ્રિસ્તી", "label_hi": "ईसाई", "label_en": "Christian"}, {"value": "sikh", "label_gu": "શીખ", "label_hi": "सिख", "label_en": "Sikh"}, {"value": "other", "label_gu": "અન્ય", "label_hi": "अन्य", "label_en": "Other"}], "is_required": True, "sort_order": 8},
            {"field_key": "district", "step_section": "address", "field_type": "text", "label_gu": "જિલ્લો", "label_hi": "जिला", "label_en": "District", "is_required": True, "sort_order": 9},
            {"field_key": "taluka", "step_section": "address", "field_type": "text", "label_gu": "તાલુકો", "label_hi": "तालुका", "label_en": "Taluka", "is_required": True, "sort_order": 10},
            {"field_key": "village_city", "step_section": "address", "field_type": "text", "label_gu": "ગામ / શહેર", "label_hi": "गांव / शहर", "label_en": "Village / City", "is_required": True, "sort_order": 11},
            {"field_key": "residential_address", "step_section": "address", "field_type": "textarea", "label_gu": "રહેઠાણનું સંપૂર્ણ સરનામું", "label_hi": "आवासीय पता", "label_en": "Full Residential Address", "is_required": True, "sort_order": 12},
            {"field_key": "pincode", "step_section": "address", "field_type": "number", "label_gu": "પીનકોડ", "label_hi": "पिनकोड", "label_en": "Pincode", "is_required": True, "sort_order": 13},
            {"field_key": "family_gross_income", "step_section": "specific", "field_type": "number", "label_gu": "કુટુંબની કુલ વાર્ષિક આવક (૮ લાખથી ઓછી)", "label_hi": "पारिवारिक कुल वार्षिक आय (< 8 लाख)", "label_en": "Family Gross Annual Income (Below 8 Lakhs INR)", "placeholder_gu": "દા.ત. 350000", "placeholder_hi": "उदा. 350000", "placeholder_en": "e.g. 350000", "is_required": True, "sort_order": 14},
            {"field_key": "agricultural_land_acres", "step_section": "specific", "field_type": "number", "label_gu": "ખેતીની જમીન (એકરમાં - મર્યાદા ૫ એકરથી ઓછી)", "label_hi": "कृषि भूमि (एकड़ में - 5 एकड़ से कम)", "label_en": "Agricultural Land (Acres - Max 5 Acres)", "placeholder_gu": "જો ન હોય તો 0 લખો", "placeholder_hi": "नहीं है तो 0 लिखें", "placeholder_en": "Enter 0 if none", "is_required": True, "sort_order": 15},
            {"field_key": "residential_flat_sqft", "step_section": "specific", "field_type": "number", "label_gu": "રહેણાંક ફ્લેટનું ક્ષેત્રફળ (ચોરસ ફૂટમાં - મર્યાદા ૧૦૦૦ ચો.ફૂટ)", "label_hi": "आवासीय फ्लैट क्षेत्रफल (वर्ग फुट)", "label_en": "Residential Flat Area (Sq Ft - Max 1000 Sq Ft)", "placeholder_gu": "જો ન હોય તો 0 લખો", "placeholder_hi": "0 लिखें", "placeholder_en": "Enter 0 if none", "is_required": False, "sort_order": 16},
            {"field_key": "ews_purpose", "step_section": "specific", "field_type": "select", "label_gu": "EWS પ્રમાણપત્રનો હેતુ", "label_hi": "प्रमाण पत्र का प्रयोजन", "label_en": "Purpose of EWS Certificate", "options_json": [{"value": "state_admission", "label_gu": "ગુજરાત રાજ્ય ઉચ્ચ શિક્ષણ પ્રવેશ (૧૦% ક્વોટા)", "label_hi": "राज्य उच्च शिक्षा प्रवेश", "label_en": "Gujarat State Higher Education Admission"}, {"value": "state_job", "label_gu": "ગુજરાત સરકારી ભરતી (GPSC / ગૌણ સેવા)", "label_hi": "राज्य सरकारी नौकरी", "label_en": "Gujarat Govt Recruitment"}, {"value": "central_admission_job", "label_gu": "કેન્દ્ર સરકાર / NEET / JEE / UPSC ક્વોટા", "label_hi": "केंद्र सरकार / NEET / UPSC", "label_en": "Central Govt / NEET / JEE / UPSC"}], "is_required": True, "sort_order": 17}
        ]
        for field in ews_fields:
            field_id = str(uuid.uuid4())
            self.form_fields[field_id] = {"id": field_id, "form_id": form_2_id, **field, "created_at": datetime.now(timezone.utc), "updated_at": datetime.now(timezone.utc)}

        # 7. Form Fields for Form 3: Non-Creamy Layer (NCL) / SEBC
        form_3_id = "f0000000-0000-0000-0000-000000000003"
        ncl_fields = [
            {"field_key": "applicant_name", "step_section": "personal", "field_type": "text", "label_gu": "અરજદારનું પૂરું નામ", "label_hi": "आवेदक का पूरा नाम", "label_en": "Applicant Full Name", "is_required": True, "sort_order": 1},
            {"field_key": "father_name", "step_section": "personal", "field_type": "text", "label_gu": "પિતાનું નામ", "label_hi": "पिता का नाम", "label_en": "Father's Full Name", "is_required": True, "sort_order": 2},
            {"field_key": "mother_name", "step_section": "personal", "field_type": "text", "label_gu": "માતાનું નામ", "label_hi": "माता का नाम", "label_en": "Mother's Name", "is_required": True, "sort_order": 3},
            {"field_key": "gender", "step_section": "personal", "field_type": "select", "label_gu": "લિંગ", "label_hi": "लिंग", "label_en": "Gender", "options_json": [{"value": "male", "label_gu": "પુરુષ", "label_hi": "पुरुष", "label_en": "Male"}, {"value": "female", "label_gu": "સ્ત્રી", "label_hi": "महिला", "label_en": "Female"}], "is_required": True, "sort_order": 4},
            {"field_key": "dob", "step_section": "personal", "field_type": "date", "label_gu": "જન્મ તારીખ", "label_hi": "जन्म तिथि", "label_en": "Date of Birth", "is_required": True, "sort_order": 5},
            {"field_key": "mobile_number", "step_section": "personal", "field_type": "number", "label_gu": "મોબાઈલ નંબર", "label_hi": "मोबाइल नंबर", "label_en": "Mobile Number", "is_required": True, "sort_order": 6},
            {"field_key": "aadhaar_number", "step_section": "personal", "field_type": "number", "label_gu": "આધાર કાર્ડ નંબર", "label_hi": "आधार कार्ड नंबर", "label_en": "Aadhaar Card Number", "is_required": True, "sort_order": 7},
            {"field_key": "sebc_caste_name", "step_section": "personal", "field_type": "text", "label_gu": "SEBC / OBC જ્ઞાતિનું નામ (સરકારી યાદી મુજબ)", "label_hi": "ओबीसी / एसईबीसी जाति का नाम", "label_en": "SEBC / OBC Caste Name (As per Gujarat Govt list)", "placeholder_gu": "દા.ત. પ્રજાપતિ, દરજી, લુહાર, મોઢ ઘાંચી, ઠાકોર, કોળી", "placeholder_hi": "उदा. प्रजापति, दरजी, लुहार", "placeholder_en": "e.g. Prajapati, Darji, Luhar, Thakor, Koli", "is_required": True, "sort_order": 8},
            {"field_key": "district", "step_section": "address", "field_type": "text", "label_gu": "જિલ્લો", "label_hi": "जिला", "label_en": "District", "is_required": True, "sort_order": 9},
            {"field_key": "taluka", "step_section": "address", "field_type": "text", "label_gu": "તાલુકો", "label_hi": "तालुका", "label_en": "Taluka", "is_required": True, "sort_order": 10},
            {"field_key": "village_city", "step_section": "address", "field_type": "text", "label_gu": "ગામ / શહેર", "label_hi": "गांव / शहर", "label_en": "Village / City", "is_required": True, "sort_order": 11},
            {"field_key": "residential_address", "step_section": "address", "field_type": "textarea", "label_gu": "રહેઠાણનું સરનામું", "label_hi": "आवासीय पता", "label_en": "Residential Address", "is_required": True, "sort_order": 12},
            {"field_key": "pincode", "step_section": "address", "field_type": "number", "label_gu": "પીનકોડ", "label_hi": "पिनकोड", "label_en": "Pincode", "is_required": True, "sort_order": 13},
            {"field_key": "caste_certificate_no", "step_section": "specific", "field_type": "text", "label_gu": "મૂળ SEBC જાતિ પ્રમાણપત્ર નંબર", "label_hi": "मूल जाति प्रमाण पत्र संख्या", "label_en": "Original SEBC Caste Certificate Number", "placeholder_gu": "દા.ત. SEBC/2020/12345", "placeholder_hi": "उदा. SEBC/2020/12345", "placeholder_en": "e.g. SEBC/2020/12345", "is_required": True, "sort_order": 14},
            {"field_key": "caste_cert_issue_date", "step_section": "specific", "field_type": "date", "label_gu": "જાતિ પ્રમાણપત્ર મળ્યાની તારીખ", "label_hi": "जाति प्रमाण पत्र जारी तिथि", "label_en": "Caste Certificate Issue Date", "is_required": True, "sort_order": 15},
            {"field_key": "caste_cert_issuing_office", "step_section": "specific", "field_type": "text", "label_gu": "પ્રમાણપત્ર આપનાર કચેરી", "label_hi": "जारीकर्ता कार्यालय", "label_en": "Issuing Authority / Mamlatdar Office", "placeholder_gu": "દા.ત. મામલતદાર કચેરી દસ્ક્રોઈ", "placeholder_hi": "मामलतदार कार्यालय", "placeholder_en": "e.g. Mamlatdar Office Daskroi", "is_required": True, "sort_order": 16},
            {"field_key": "income_year_1", "step_section": "specific", "field_type": "number", "label_gu": "વર્ષ ૧ ની વાર્ષિક આવક (FY 2023-24)", "label_hi": "वर्ष 1 की आय (2023-24)", "label_en": "Year 1 Income (FY 2023-24 in INR)", "is_required": True, "sort_order": 17},
            {"field_key": "income_year_2", "step_section": "specific", "field_type": "number", "label_gu": "વર્ષ ૨ ની વાર્ષિક આવક (FY 2024-25)", "label_hi": "वर्ष 2 की आय (2024-25)", "label_en": "Year 2 Income (FY 2024-25 in INR)", "is_required": True, "sort_order": 18},
            {"field_key": "income_year_3", "step_section": "specific", "field_type": "number", "label_gu": "વર્ષ ૩ ની વાર્ષિક આવક (FY 2025-26)", "label_hi": "वर्ष 3 की आय (2025-26)", "label_en": "Year 3 Income (FY 2025-26 in INR)", "is_required": True, "sort_order": 19},
            {"field_key": "parents_govt_designation", "step_section": "specific", "field_type": "select", "label_gu": "માતા-પિતાનો સરકારી હોદ્દો (જો હોય તો)", "label_hi": "माता-पिता का सरकारी पद", "label_en": "Parents Government Employment Status", "options_json": [{"value": "none", "label_gu": "બિન-સરકારી / ખેતી / મજૂરી / વેપાર", "label_hi": "गैर-सरकारी / निजी", "label_en": "Non-Government / Private / Business"}, {"value": "class_4", "label_gu": "વર્ગ-૪ / પટાવાળા / ડ્રાઈવર", "label_hi": "वर्ग-4 कर्मचारी", "label_en": "Class-IV Employee"}, {"value": "class_3", "label_gu": "વર્ગ-૩ / ક્લાર્ક / શિક્ષક", "label_hi": "वर्ग-3 कर्मचारी", "label_en": "Class-III Employee"}, {"value": "class_1_2", "label_gu": "વર્ગ-૧ અથવા વર્ગ-૨ ગેઝેટેડ અધિકારી", "label_hi": "वर्ग-1 या 2 अधिकारी", "label_en": "Class-I / Class-II Gazetted Officer"}], "is_required": True, "sort_order": 20}
        ]
        for field in ncl_fields:
            field_id = str(uuid.uuid4())
            self.form_fields[field_id] = {"id": field_id, "form_id": form_3_id, **field, "created_at": datetime.now(timezone.utc), "updated_at": datetime.now(timezone.utc)}

        # 8. Form Fields for Form 4: 7/12 & 8-A AnyRoR Land Records
        form_4_id = "f0000000-0000-0000-0000-000000000004"
        land_fields = [
            {"field_key": "applicant_name", "step_section": "personal", "field_type": "text", "label_gu": "અરજદાર / ખાતેદારનું પૂરું નામ", "label_hi": "आवेदक / खातेदार का नाम", "label_en": "Applicant / Landowner Full Name", "is_required": True, "sort_order": 1},
            {"field_key": "mobile_number", "step_section": "personal", "field_type": "number", "label_gu": "મોબાઈલ નંબર (PDF ડાઉનલોડ લિંક માટે)", "label_hi": "मोबाइल नंबर (पीडीएफ हेतु)", "label_en": "Mobile Number for PDF Delivery", "is_required": True, "sort_order": 2},
            {"field_key": "district", "step_section": "address", "field_type": "select", "label_gu": "મહેસૂલી જિલ્લો", "label_hi": "राजस्व जिला", "label_en": "Revenue District", "options_json": [{"value": "Ahmedabad", "label_gu": "અમદાવાદ", "label_hi": "अहमदाबाद", "label_en": "Ahmedabad"}, {"value": "Surat", "label_gu": "સુરત", "label_hi": "सूरत", "label_en": "Surat"}, {"value": "Vadodara", "label_gu": "વડોદરા", "label_hi": "वडोदरा", "label_en": "Vadodara"}, {"value": "Rajkot", "label_gu": "રાજકોટ", "label_hi": "राजकोट", "label_en": "Rajkot"}, {"value": "Bhavnagar", "label_gu": "ભાવનગર", "label_hi": "भावनगर", "label_en": "Bhavnagar"}, {"value": "Gandhinagar", "label_gu": "ગાંધીનગર", "label_hi": "गांधीनगर", "label_en": "Gandhinagar"}, {"value": "Anand", "label_gu": "આણંદ", "label_hi": "आणंद", "label_en": "Anand"}, {"value": "Mehsana", "label_gu": "મહેસાણા", "label_hi": "मेहसाणा", "label_en": "Mehsana"}, {"value": "Kutch", "label_gu": "કચ્છ", "label_hi": "कच्छ", "label_en": "Kutch"}], "is_required": True, "sort_order": 3},
            {"field_key": "taluka", "step_section": "address", "field_type": "text", "label_gu": "તાલુકો", "label_hi": "तालुका", "label_en": "Taluka", "is_required": True, "sort_order": 4},
            {"field_key": "village_name", "step_section": "address", "field_type": "text", "label_gu": "મહેસૂલી ગામનું નામ", "label_hi": "गांव का नाम", "label_en": "Revenue Village Name", "is_required": True, "sort_order": 5},
            {"field_key": "record_type", "step_section": "specific", "field_type": "select", "label_gu": "જમીન રેકોર્ડનો પ્રકાર", "label_hi": "भूमि रिकॉर्ड का प्रकार", "label_en": "Land Record Extract Type", "options_json": [{"value": "7_12", "label_gu": "૭/૧૨ (ગામ નમૂનો નં. ૭ અને ૧૨ - હક્ક અને પાક વિગત)", "label_hi": "7/12 नकल", "label_en": "7/12 RoR & Crop Details"}, {"value": "8A", "label_gu": "૮-અ (ખાતેદારની ખાતાવહી)", "label_hi": "8-अ नकल", "label_en": "8-A Khatedar Khata Copy"}, {"value": "VF6", "label_gu": "ગામ નમૂનો નં. ૬ (હક્ક પત્રક ફેરફાર નોંધ)", "label_hi": "हक पत्रक 6", "label_en": "VF-6 Hakku Patrak Mutation Entry"}], "is_required": True, "sort_order": 6},
            {"field_key": "survey_number", "step_section": "specific", "field_type": "text", "label_gu": "સર્વે નંબર / બ્લોક નંબર", "label_hi": "सर्वे नंबर / ब्लॉक नंबर", "label_en": "Survey Number / Block Number", "placeholder_gu": "દા.ત. 142/1 અથવા 88", "placeholder_hi": "उदा. 142/1", "placeholder_en": "e.g. 142/1 or 88", "is_required": True, "sort_order": 7},
            {"field_key": "khata_number", "step_section": "specific", "field_type": "text", "label_gu": "ખાતા નંબર (જો ખબર હોય તો)", "label_hi": "खाता संख्या (वैकल्पिक)", "label_en": "Khata Number (If known)", "placeholder_gu": "દા.ત. 89", "placeholder_hi": "उदा. 89", "placeholder_en": "e.g. 89", "is_required": False, "sort_order": 8},
            {"field_key": "mutation_entry_no", "step_section": "specific", "field_type": "text", "label_gu": "નોંધ નંબર (હક્ક પત્રક ૬ માટે)", "label_hi": "प्रविष्टि संख्या", "label_en": "Mutation Entry No (If VF-6)", "placeholder_gu": "જો હક્ક પત્રક ૬ જોઈતું હોય તો", "placeholder_hi": "प्रविष्टि संख्या", "placeholder_en": "Required only if requesting VF-6", "is_required": False, "sort_order": 9}
        ]
        for field in land_fields:
            field_id = str(uuid.uuid4())
            self.form_fields[field_id] = {"id": field_id, "form_id": form_4_id, **field, "created_at": datetime.now(timezone.utc), "updated_at": datetime.now(timezone.utc)}

        # 9. Form Fields for Form 5: Driving Licence (RTO Sarathi Parivahan)
        form_5_id = "f0000000-0000-0000-0000-000000000005"
        dl_fields = [
            {"field_key": "applicant_name", "step_section": "personal", "field_type": "text", "label_gu": "અરજદારનું પૂરું નામ (શાળા LC મુજબ)", "label_hi": "आवेदक का पूरा नाम (एलसी अनुसार)", "label_en": "Applicant Full Name (As per School LC / 10th)", "is_required": True, "sort_order": 1},
            {"field_key": "father_husband_name", "step_section": "personal", "field_type": "text", "label_gu": "પિતા / વાલીનું નામ", "label_hi": "पिता / अभिभावक का नाम", "label_en": "Father / Guardian Name", "is_required": True, "sort_order": 2},
            {"field_key": "gender", "step_section": "personal", "field_type": "select", "label_gu": "લિંગ", "label_hi": "लिंग", "label_en": "Gender", "options_json": [{"value": "male", "label_gu": "પુરુષ", "label_hi": "पुरुष", "label_en": "Male"}, {"value": "female", "label_gu": "સ્ત્રી", "label_hi": "महिला", "label_en": "Female"}], "is_required": True, "sort_order": 3},
            {"field_key": "dob", "step_section": "personal", "field_type": "date", "label_gu": "જન્મ તારીખ (૧૮ વર્ષ પૂર્ણ હોવા જરૂરી)", "label_hi": "जन्म तिथि", "label_en": "Date of Birth (18+ for LMV)", "is_required": True, "sort_order": 4},
            {"field_key": "blood_group", "step_section": "personal", "field_type": "select", "label_gu": "બ્લડ ગ્રુપ (રક્ત જૂથ)", "label_hi": "रक्त समूह", "label_en": "Blood Group", "options_json": [{"value": "A+", "label_gu": "A+", "label_hi": "A+", "label_en": "A+"}, {"value": "A-", "label_gu": "A-", "label_hi": "A-", "label_en": "A-"}, {"value": "B+", "label_gu": "B+", "label_hi": "B+", "label_en": "B+"}, {"value": "B-", "label_gu": "B-", "label_hi": "B-", "label_en": "B-"}, {"value": "O+", "label_gu": "O+", "label_hi": "O+", "label_en": "O+"}, {"value": "O-", "label_gu": "O-", "label_hi": "O-", "label_en": "O-"}, {"value": "AB+", "label_gu": "AB+", "label_hi": "AB+", "label_en": "AB+"}, {"value": "AB-", "label_gu": "AB-", "label_hi": "AB-", "label_en": "AB-"}, {"value": "unknown", "label_gu": "ખબર નથી", "label_hi": "अज्ञात", "label_en": "Unknown"}], "is_required": True, "sort_order": 5},
            {"field_key": "educational_qualification", "step_section": "personal", "field_type": "select", "label_gu": "શૈક્ષણિક લાયકાત", "label_hi": "शैक्षणिक योग्यता", "label_en": "Educational Qualification", "options_json": [{"value": "8th_pass", "label_gu": "ધોરણ ૮ પાસ", "label_hi": "8वीं पास", "label_en": "8th Standard Pass"}, {"value": "10th_pass", "label_gu": "ધોરણ ૧૦ (SSC) પાસ", "label_hi": "10वीं (SSC) पास", "label_en": "10th Standard / SSC Pass"}, {"value": "12th_pass", "label_gu": "ધોરણ ૧૨ (HSC) પાસ", "label_hi": "12वीं (HSC) पास", "label_en": "12th Standard / HSC Pass"}, {"value": "graduate", "label_gu": "સ્નાતક / ગ્રેજ્યુએટ અથવા તેથી વધુ", "label_hi": "स्नातक / उससे अधिक", "label_en": "Graduate or Higher"}], "is_required": True, "sort_order": 6},
            {"field_key": "aadhaar_number", "step_section": "personal", "field_type": "number", "label_gu": "આધાર કાર્ડ નંબર (ઓનલાઇન ટેસ્ટ લિંકિંગ)", "label_hi": "आधार कार्ड नंबर", "label_en": "Aadhaar Number (For Online Facial Test)", "is_required": True, "sort_order": 7},
            {"field_key": "mobile_number", "step_section": "personal", "field_type": "number", "label_gu": "મોબાઈલ નંબર (સારથી SMS એલર્ટ માટે)", "label_hi": "मोबाइल नंबर", "label_en": "Mobile Number (For Sarathi SMS)", "is_required": True, "sort_order": 8},
            {"field_key": "district", "step_section": "address", "field_type": "text", "label_gu": "જિલ્લો", "label_hi": "जिला", "label_en": "District", "is_required": True, "sort_order": 9},
            {"field_key": "taluka", "step_section": "address", "field_type": "text", "label_gu": "તાલુકો", "label_hi": "तालुका", "label_en": "Taluka", "is_required": True, "sort_order": 10},
            {"field_key": "village_city", "step_section": "address", "field_type": "text", "label_gu": "ગામ / શહેર", "label_hi": "गांव / शहर", "label_en": "Village / City", "is_required": True, "sort_order": 11},
            {"field_key": "residential_address", "step_section": "address", "field_type": "textarea", "label_gu": "રહેઠાણનું સંપૂર્ણ સરનામું", "label_hi": "पूरा पता", "label_en": "Full Residential Address", "is_required": True, "sort_order": 12},
            {"field_key": "pincode", "step_section": "address", "field_type": "number", "label_gu": "પીનકોડ", "label_hi": "पिनकोड", "label_en": "Pincode", "is_required": True, "sort_order": 13},
            {"field_key": "rto_office", "step_section": "address", "field_type": "select", "label_gu": "નજીકની RTO કચેરી પસંદ કરો", "label_hi": "आरटीओ कार्यालय चुनें", "label_en": "Nearest Gujarat RTO Office", "options_json": [{"value": "GJ-01", "label_gu": "GJ-01 : અમદાવાદ (સુભાષબ્રિજ)", "label_hi": "GJ-01 : अहमदाबाद (सुभाषब्रिज)", "label_en": "GJ-01 : Ahmedabad (Subhash Bridge)"}, {"value": "GJ-27", "label_gu": "GJ-27 : અમદાવાદ પૂર્વ (વસ્ત્રાલ)", "label_hi": "GJ-27 : अहमदाबाद पूर्व (वस्त्राल)", "label_en": "GJ-27 : Ahmedabad East (Vastral)"}, {"value": "GJ-05", "label_gu": "GJ-05 : સુરત (પાલ / ચોકબજાર)", "label_hi": "GJ-05 : सूरत", "label_en": "GJ-05 : Surat"}, {"value": "GJ-06", "label_gu": "GJ-06 : વડોદરા", "label_hi": "GJ-06 : वडोदरा", "label_en": "GJ-06 : Vadodara"}, {"value": "GJ-03", "label_gu": "GJ-03 : રાજકોટ", "label_hi": "GJ-03 : राजकोट", "label_en": "GJ-03 : Rajkot"}, {"value": "GJ-18", "label_gu": "GJ-18 : ગાંધીનગર", "label_hi": "GJ-18 : गांधीनगर", "label_en": "GJ-18 : Gandhinagar"}, {"value": "GJ-02", "label_gu": "GJ-02 : મહેસાણા", "label_hi": "GJ-02 : मेहसाणा", "label_en": "GJ-02 : Mehsana"}, {"value": "GJ-04", "label_gu": "GJ-04 : ભાવનગર", "label_hi": "GJ-04 : भावनगर", "label_en": "GJ-04 : Bhavnagar"}], "is_required": True, "sort_order": 14},
            {"field_key": "licence_type", "step_section": "specific", "field_type": "select", "label_gu": "લાયસન્સ પ્રકાર", "label_hi": "लाइसेंस प्रकार", "label_en": "Licence Application Type", "options_json": [{"value": "learner", "label_gu": "નવું લર્નિંગ લાયસન્સ (LLR - ઘરે બેઠા ઓનલાઇન ટેસ્ટ)", "label_hi": "नया लर्निंग लाइसेंस", "label_en": "New Learner Licence (LLR)"}, {"value": "permanent", "label_gu": "કાયમી ડ્રાઇવિંગ લાયસન્સ (DL સ્લોટ બુકિંગ)", "label_hi": "स्थायी ड्राइविंग लाइसेंस", "label_en": "Permanent Driving Licence (DL)"}, {"value": "renewal", "label_gu": "લાયસન્સ રીન્યુઅલ / ડુપ્લીકેટ લાયસન્સ", "label_hi": "लाइसेंस नवीनीकरण", "label_en": "Licence Renewal / Duplicate DL"}], "is_required": True, "sort_order": 15},
            {"field_key": "vehicle_class", "step_section": "specific", "field_type": "select", "label_gu": "વાહન કેટેગરી", "label_hi": "वाहन श्रेणी", "label_en": "Vehicle Class", "options_json": [{"value": "MCWG", "label_gu": "મોટર સાયકલ ગિયરવાળી (MCWG - બાઇક)", "label_hi": "दोपहिया गियर सहित (MCWG)", "label_en": "Motorcycle with Gear (MCWG - Two Wheeler)"}, {"value": "LMV", "label_gu": "લાઇટ મોટર વ્હીકલ (LMV - કાર)", "label_hi": "हल्का मोटर वाहन (LMV - कार)", "label_en": "Light Motor Vehicle (LMV - Car)"}, {"value": "MCWG_LMV", "label_gu": "બાઇક + કાર બંને (MCWG + LMV)", "label_hi": "दोपहिया + कार दोनों", "label_en": "Both Two-Wheeler + Car (MCWG + LMV)"}], "is_required": True, "sort_order": 16},
            {"field_key": "existing_ll_number", "step_section": "specific", "field_type": "text", "label_gu": "હાલનો લર્નિંગ લાયસન્સ નંબર (જો કાયમી DL માટે અરજી કરતા હોવ તો)", "label_hi": "लर्निंग लाइसेंस संख्या (स्थायी डीएल हेतु)", "label_en": "Existing Learner Licence Number (If applying for Permanent DL)", "placeholder_gu": "દા.ત. GJ01/0012345/2026", "placeholder_hi": "उदा. GJ01/0012345/2026", "placeholder_en": "e.g. GJ01/0012345/2026", "is_required": False, "sort_order": 17}
        ]
        for field in dl_fields:
            field_id = str(uuid.uuid4())
            self.form_fields[field_id] = {"id": field_id, "form_id": form_5_id, **field, "created_at": datetime.now(timezone.utc), "updated_at": datetime.now(timezone.utc)}

        # 10. Form Fields for Form 6: NEET UG 2026 Exam Registration
        form_6_id = "f0000000-0000-0000-0000-000000000006"
        neet_fields = [
            {"field_key": "candidate_name", "step_section": "personal", "field_type": "text", "label_gu": "ઉમેદવારનું પૂરું નામ (૧૦મા ધોરણની માર્કશીટ મુજબ)", "label_hi": "उम्मीदवार का पूरा नाम (10वीं अनुसार)", "label_en": "Candidate Full Name (Exact match with Class 10 Certificate)", "placeholder_gu": "ધોરણ ૧૦ સર્ટિફિકેટ મુજબ નામ", "placeholder_hi": "10वीं अनुसार नाम", "placeholder_en": "Name as per Class 10 certificate", "is_required": True, "sort_order": 1},
            {"field_key": "father_name", "step_section": "personal", "field_type": "text", "label_gu": "પિતાનું નામ", "label_hi": "पिता का नाम", "label_en": "Father's Full Name", "is_required": True, "sort_order": 2},
            {"field_key": "mother_name", "step_section": "personal", "field_type": "text", "label_gu": "માતાનું નામ", "label_hi": "माता का नाम", "label_en": "Mother's Name", "is_required": True, "sort_order": 3},
            {"field_key": "dob", "step_section": "personal", "field_type": "date", "label_gu": "જન્મ તારીખ", "label_hi": "जन्म तिथि", "label_en": "Date of Birth", "is_required": True, "sort_order": 4},
            {"field_key": "gender", "step_section": "personal", "field_type": "select", "label_gu": "લિંગ", "label_hi": "लिंग", "label_en": "Gender", "options_json": [{"value": "male", "label_gu": "પુરુષ", "label_hi": "पुरुष", "label_en": "Male"}, {"value": "female", "label_gu": "સ્ત્રી", "label_hi": "महिला", "label_en": "Female"}, {"value": "third_gender", "label_gu": "અન્ય", "label_hi": "अन्य", "label_en": "Third Gender"}], "is_required": True, "sort_order": 5},
            {"field_key": "nationality", "step_section": "personal", "field_type": "select", "label_gu": "રાષ્ટ્રીયતા", "label_hi": "राष्ट्रीयता", "label_en": "Nationality", "options_json": [{"value": "indian", "label_gu": "ભારતીય (Indian)", "label_hi": "भारतीय", "label_en": "Indian"}, {"value": "nri", "label_gu": "NRI", "label_hi": "एनआरआई", "label_en": "NRI"}, {"value": "oci", "label_gu": "OCI", "label_hi": "ओसीआई", "label_en": "OCI"}], "is_required": True, "sort_order": 6},
            {"field_key": "category", "step_section": "personal", "field_type": "select", "label_gu": "સામાજિક કેટેગરી", "label_hi": "श्रेणी / वर्ग", "label_en": "Category", "options_json": [{"value": "general", "label_gu": "General (સામાન્ય)", "label_hi": "General", "label_en": "General (UR)"}, {"value": "gen_ews", "label_gu": "General-EWS (૧૦% અનામત)", "label_hi": "General-EWS", "label_en": "General-EWS"}, {"value": "obc_ncl", "label_gu": "OBC-NCL (ઓબીસી નોન-ક્રીમીલેયર - Central List)", "label_hi": "OBC-NCL", "label_en": "OBC-NCL (Central List)"}, {"value": "sc", "label_gu": "SC (અનુસૂચિત જાતિ)", "label_hi": "SC", "label_en": "Scheduled Caste (SC)"}, {"value": "st", "label_gu": "ST (અનુસૂચિત જનજાતિ)", "label_hi": "ST", "label_en": "Scheduled Tribe (ST)"}], "is_required": True, "sort_order": 7},
            {"field_key": "pwd_status", "step_section": "personal", "field_type": "select", "label_gu": "દિવ્યાંગ ઉમેદવાર (PwD)?", "label_hi": "दिव्यांग स्थिति (PwD)", "label_en": "Person with Benchmark Disability (PwD)?", "options_json": [{"value": "no", "label_gu": "ના (No)", "label_hi": "नहीं", "label_en": "No"}, {"value": "yes", "label_gu": "હા (Yes)", "label_hi": "हाँ", "label_en": "Yes"}], "is_required": True, "sort_order": 8},
            {"field_key": "aadhaar_number", "step_section": "personal", "field_type": "number", "label_gu": "આધાર કાર્ડ નંબર", "label_hi": "आधार कार्ड नंबर", "label_en": "Aadhaar Card Number", "is_required": True, "sort_order": 9},
            {"field_key": "mobile_number", "step_section": "personal", "field_type": "number", "label_gu": "મોબાઈલ નંબર (NTA SMS એલર્ટ માટે)", "label_hi": "मोबाइल नंबर", "label_en": "Mobile Number for NTA SMS Alerts", "is_required": True, "sort_order": 10},
            {"field_key": "email_address", "step_section": "personal", "field_type": "text", "label_gu": "ઇમેઇલ એડ્રેસ (એડમિટ કાર્ડ ડિલિવરી માટે)", "label_hi": "ईमेल पता", "label_en": "Email Address for Admit Card", "is_required": True, "sort_order": 11},
            {"field_key": "district", "step_section": "address", "field_type": "text", "label_gu": "જિલ્લો", "label_hi": "जिला", "label_en": "District", "is_required": True, "sort_order": 12},
            {"field_key": "residential_address", "step_section": "address", "field_type": "textarea", "label_gu": "કાયમી સરનામું", "label_hi": "स्थायी पता", "label_en": "Permanent Residential Address", "is_required": True, "sort_order": 13},
            {"field_key": "pincode", "step_section": "address", "field_type": "number", "label_gu": "પીનકોડ", "label_hi": "पिनकोड", "label_en": "Pincode", "is_required": True, "sort_order": 14},
            {"field_key": "class_10_board", "step_section": "specific", "field_type": "select", "label_gu": "ધોરણ ૧૦ બોર્ડ", "label_hi": "10वीं बोर्ड", "label_en": "Class 10 Board", "options_json": [{"value": "GSEB", "label_gu": "GSEB (ગુજરાત બોર્ડ)", "label_hi": "GSEB (गुजरात बोर्ड)", "label_en": "GSEB (Gujarat Board)"}, {"value": "CBSE", "label_gu": "CBSE (સેન્ટ્રલ બોર્ડ)", "label_hi": "CBSE", "label_en": "CBSE"}, {"value": "ICSE", "label_gu": "ICSE / Other", "label_hi": "ICSE", "label_en": "ICSE / Other"}], "is_required": True, "sort_order": 15},
            {"field_key": "class_10_percentage", "step_section": "specific", "field_type": "number", "label_gu": "ધોરણ ૧૦ ટકાવારી / CGPA", "label_hi": "10वीं प्रतिशत / CGPA", "label_en": "Class 10 Percentage / CGPA", "placeholder_gu": "દા.ત. 85.5", "placeholder_hi": "उदा. 85.5", "placeholder_en": "e.g. 85.5", "is_required": True, "sort_order": 16},
            {"field_key": "class_12_status", "step_section": "specific", "field_type": "select", "label_gu": "ધોરણ ૧૨ સાયન્સ સ્થિતિ (PCB)", "label_hi": "12वीं विज्ञान स्थिति", "label_en": "Class 12th Science Status (PCB)", "options_json": [{"value": "appearing", "label_gu": "૨૦૨૬ માં પરીક્ષા આપી રહ્યા છે (Appearing 2026)", "label_hi": "2026 में परीक्षा दे रहे हैं", "label_en": "Appearing in 2026"}, {"value": "passed", "label_gu": "પાછલા વર્ષોમાં પાસ થયેલ (Passed)", "label_hi": "उत्तीर्ण (Passed)", "label_en": "Passed in 2025 or Earlier"}], "is_required": True, "sort_order": 17},
            {"field_key": "question_paper_medium", "step_section": "specific", "field_type": "select", "label_gu": "પ્રશ્નપત્રનું માધ્યમ (ભાષા)", "label_hi": "प्रश्न पत्र का माध्यम", "label_en": "Question Paper Medium", "options_json": [{"value": "Gujarati", "label_gu": "ગુજરાતી અને અંગ્રેજી (દ્વિભાષી બુકલેટ)", "label_hi": "गुजराती एवं अंग्रेजी", "label_en": "Gujarati & English (Bilingual)"}, {"value": "English", "label_gu": "English (અંગ્રેજી)", "label_hi": "English", "label_en": "English"}, {"value": "Hindi", "label_gu": "Hindi અને English (દ્વિભાષી બુકલેટ)", "label_hi": "Hindi एवं English", "label_en": "Hindi & English (Bilingual)"}], "is_required": True, "sort_order": 18},
            {"field_key": "exam_city_1", "step_section": "specific", "field_type": "select", "label_gu": "પ્રથમ પસંદગીનું પરીક્ષા શહેર (ગુજરાત)", "label_hi": "प्रथम परीक्षा शहर विकल्प", "label_en": "1st Choice Exam City (Gujarat)", "options_json": [{"value": "Ahmedabad", "label_gu": "અમદાવાદ / ગાંધીનગર (GJ01)", "label_hi": "अहमदाबाद", "label_en": "Ahmedabad / Gandhinagar"}, {"value": "Surat", "label_gu": "સુરત (GJ02)", "label_hi": "सूरत", "label_en": "Surat"}, {"value": "Vadodara", "label_gu": "વડોદરા (GJ03)", "label_hi": "वडोदरा", "label_en": "Vadodara"}, {"value": "Rajkot", "label_gu": "રાજકોટ (GJ04)", "label_hi": "राजकोट", "label_en": "Rajkot"}, {"value": "Bhavnagar", "label_gu": "ભાવનગર (GJ05)", "label_hi": "भावनगर", "label_en": "Bhavnagar"}, {"value": "Anand", "label_gu": "આણંદ / વલ્લભ વિદ્યાનગર", "label_hi": "आणंद", "label_en": "Anand"}, {"value": "Mehsana", "label_gu": "મહેસાણા", "label_hi": "मेहसाणा", "label_en": "Mehsana"}, {"value": "Bhuj", "label_gu": "ભુજ (કચ્છ)", "label_hi": "भुज", "label_en": "Bhuj (Kutch)"}], "is_required": True, "sort_order": 19},
            {"field_key": "exam_city_2", "step_section": "specific", "field_type": "select", "label_gu": "દ્વિતીય પસંદગીનું પરીક્ષા શહેર", "label_hi": "द्वितीय परीक्षा शहर विकल्प", "label_en": "2nd Choice Exam City", "options_json": [{"value": "Gandhinagar", "label_gu": "ગાંધીનગર", "label_hi": "गांधीनगर", "label_en": "Gandhinagar"}, {"value": "Vadodara", "label_gu": "વડોદરા", "label_hi": "वडोदरा", "label_en": "Vadodara"}, {"value": "Ahmedabad", "label_gu": "અમદાવાદ", "label_hi": "अहमदाबाद", "label_en": "Ahmedabad"}, {"value": "Surat", "label_gu": "સુરત", "label_hi": "सूरत", "label_en": "Surat"}, {"value": "Rajkot", "label_gu": "રાજકોટ", "label_hi": "राजकोट", "label_en": "Rajkot"}], "is_required": True, "sort_order": 20}
        ]
        for field in neet_fields:
            field_id = str(uuid.uuid4())
            self.form_fields[field_id] = {"id": field_id, "form_id": form_6_id, **field, "created_at": datetime.now(timezone.utc), "updated_at": datetime.now(timezone.utc)}

        # 11. Seed Operator ↔ Form Assignments (Per-Form Eligibility Matrix)
        # Vicky: Driving Licence, NEET Exam, Income Certificate
        # Nikhil: Income Certificate, EWS Certificate
        # DHulo: Land Records, NCL Certificate
        # Loy: Driving Licence, Land Records
        op_assignments_data = [
            # Vicky
            {"operator_id": "b0000000-0000-0000-0000-000000000001", "form_id": form_5_id}, # Driving Licence
            {"operator_id": "b0000000-0000-0000-0000-000000000001", "form_id": form_6_id}, # NEET Exam
            {"operator_id": "b0000000-0000-0000-0000-000000000001", "form_id": form_1_id}, # Income Certificate
            # Nikhil
            {"operator_id": "b0000000-0000-0000-0000-000000000002", "form_id": form_1_id}, # Income Certificate
            {"operator_id": "b0000000-0000-0000-0000-000000000002", "form_id": form_2_id}, # EWS Certificate
            # DHulo
            {"operator_id": "b0000000-0000-0000-0000-000000000003", "form_id": form_4_id}, # 7/12 Land Records
            {"operator_id": "b0000000-0000-0000-0000-000000000003", "form_id": form_3_id}, # NCL Certificate
            # Loy
            {"operator_id": "b0000000-0000-0000-0000-000000000004", "form_id": form_5_id}, # Driving Licence
            {"operator_id": "b0000000-0000-0000-0000-000000000004", "form_id": form_4_id}, # 7/12 Land Records
        ]

        for assign in op_assignments_data:
            assign_id = str(uuid.uuid4())
            self.operator_form_assignments[assign_id] = {
                "id": assign_id,
                "operator_id": assign["operator_id"],
                "form_id": assign["form_id"],
                "is_active": True,
                "assigned_at": datetime.now(timezone.utc),
                "assigned_by": admin_id
            }

        # 12. Seed Demo Submission 1: Income Certificate (Citizen 1 -> Operator Vicky)
        sub_1_id = "s0000000-0000-0000-0000-000000000001"
        self.submissions[sub_1_id] = {
            "id": sub_1_id,
            "application_number": "FS-2026-GJ-9812",
            "user_id": citizen_id,
            "user_phone": "+91 98250 44551",
            "form_id": form_1_id,
            "assigned_operator_id": "b0000000-0000-0000-0000-000000000001",
            "status": "operator_filling",
            "govt_portal_application_id": "DG-REV-2026-88192",
            "govt_portal_url": "https://digitalgujarat.gov.in",
            "rejection_reason": None,
            "operator_notes": "Aadhaar e-KYC verified. Filing on Digital Gujarat revenue portal.",
            "official_fee": 20.00,
            "service_fee": 99.00,
            "total_fee": 119.00,
            "payment_status": "paid",
            "submitted_at": datetime(2026, 8, 23, 10, 15, tzinfo=timezone.utc),
            "resubmitted_at": None,
            "operator_started_at": datetime(2026, 8, 23, 10, 30, tzinfo=timezone.utc),
            "govt_submitted_at": None,
            "completed_at": None,
            "created_at": datetime(2026, 8, 23, 10, 15, tzinfo=timezone.utc),
            "updated_at": datetime(2026, 8, 23, 10, 30, tzinfo=timezone.utc)
        }

        self.payments["p0000000-0000-0000-0000-000000000001"] = {
            "id": "p0000000-0000-0000-0000-000000000001",
            "invoice_no": "INV-2026-08-9812",
            "submission_id": sub_1_id,
            "user_id": citizen_id,
            "form_id": form_1_id,
            "form_slug": "income_certificate",
            "amount_inr": 119.00,
            "govt_fee": 20.00,
            "portal_fee": 99.00,
            "currency": "inr",
            "status": "succeeded",
            "payment_method": "upi",
            "payment_reference": "UPI/623488102911/GPay",
            "created_at": datetime(2026, 8, 23, 10, 15, tzinfo=timezone.utc),
            "updated_at": datetime(2026, 8, 23, 10, 16, tzinfo=timezone.utc)
        }

        self.submission_field_values[sub_1_id] = {
            "applicant_name": "Rameshchandra B. Patel",
            "father_husband_name": "Bhagwandas Patel",
            "gender": "male",
            "dob": "1985-06-15",
            "mobile_number": "9825044551",
            "aadhaar_number": "982145519821",
            "caste_category": "sebc",
            "district": "Ahmedabad",
            "taluka": "Daskroi",
            "village_city": "Vastral",
            "residential_address": "B-402, Radhe Shyam Residency, SP Ring Road, Vastral",
            "pincode": "382418",
            "residence_years": "25",
            "occupation": "labor",
            "annual_income": "120000",
            "income_purpose": "scholarship",
            "family_member_count": "4",
            "ration_card_no": "0712398214"
        }

        doc_1_id = str(uuid.uuid4())
        self.submission_documents[doc_1_id] = {
            "id": doc_1_id,
            "submission_id": sub_1_id,
            "document_type_key": "aadhaar_card",
            "file_name": "aadhaar_rameshbhai.pdf",
            "file_size_bytes": 1048576,
            "mime_type": "application/pdf",
            "storage_path": f"documents/{sub_1_id}/aadhaar_rameshbhai.pdf",
            "is_verified": True,
            "created_at": datetime(2026, 8, 23, 10, 15, tzinfo=timezone.utc)
        }

        # 13. Seed Demo Submission 2: Driving Licence (Authoritative ₹1000 Fee)
        sub_2_id = "s0000000-0000-0000-0000-000000000002"
        self.submissions[sub_2_id] = {
            "id": sub_2_id,
            "application_number": "FS-2026-GJ-5501",
            "user_id": citizen_id,
            "user_phone": "+91 98250 44551",
            "form_id": form_5_id,
            "assigned_operator_id": "b0000000-0000-0000-0000-000000000001", # Vicky
            "status": "submitted",
            "govt_portal_application_id": None,
            "govt_portal_url": "https://parivahan.gov.in/sarathiservice",
            "rejection_reason": None,
            "operator_notes": "Awaiting Sarathi Parivahan LL portal filing.",
            "official_fee": 150.00,
            "service_fee": 850.00,
            "total_fee": 1000.00,
            "payment_status": "paid",
            "submitted_at": datetime(2026, 8, 24, 11, 0, tzinfo=timezone.utc),
            "resubmitted_at": None,
            "operator_started_at": None,
            "govt_submitted_at": None,
            "completed_at": None,
            "created_at": datetime(2026, 8, 24, 11, 0, tzinfo=timezone.utc),
            "updated_at": datetime(2026, 8, 24, 11, 5, tzinfo=timezone.utc)
        }

        self.payments["p0000000-0000-0000-0000-000000000002"] = {
            "id": "p0000000-0000-0000-0000-000000000002",
            "invoice_no": "INV-2026-08-5501",
            "submission_id": sub_2_id,
            "user_id": citizen_id,
            "form_id": form_5_id,
            "form_slug": "driving_licence_rto",
            "amount_inr": 1000.00,
            "govt_fee": 150.00,
            "portal_fee": 850.00,
            "currency": "inr",
            "status": "succeeded",
            "payment_method": "card",
            "payment_reference": "CARD/4242XXXXXXXX4242",
            "created_at": datetime(2026, 8, 24, 11, 0, tzinfo=timezone.utc),
            "updated_at": datetime(2026, 8, 24, 11, 5, tzinfo=timezone.utc)
        }

        self.submission_field_values[sub_2_id] = {
            "applicant_name": "Rameshchandra B. Patel",
            "father_husband_name": "Bhagwandas Patel",
            "gender": "male",
            "dob": "1985-06-15",
            "blood_group": "B+",
            "educational_qualification": "10th_pass",
            "aadhaar_number": "982145519821",
            "mobile_number": "9825044551",
            "district": "Ahmedabad",
            "taluka": "Daskroi",
            "village_city": "Vastral",
            "residential_address": "B-402, Radhe Shyam Residency, Vastral",
            "pincode": "382418",
            "rto_office": "GJ-27",
            "licence_type": "learner",
            "vehicle_class": "MCWG_LMV"
        }

        # 14. Seed Demo Submission 3: Rejected / Needs Correction (For Verification)
        sub_3_id = "s0000000-0000-0000-0000-000000000003"
        self.submissions[sub_3_id] = {
            "id": sub_3_id,
            "application_number": "FS-2026-GJ-3104",
            "user_id": citizen_id,
            "user_phone": "+91 98250 44551",
            "form_id": form_2_id,
            "assigned_operator_id": "b0000000-0000-0000-0000-000000000002", # Nikhil
            "status": "rejected",
            "govt_portal_application_id": None,
            "govt_portal_url": "https://digitalgujarat.gov.in",
            "rejection_reason": "Name mismatch: Name on Aadhaar card does not match School LC document. Please correct the applicant full name and re-upload clear School LC copy.",
            "operator_notes": "Mamlatdar scrutiny returned name mismatch error.",
            "official_fee": 50.00,
            "service_fee": 99.00,
            "total_fee": 149.00,
            "payment_status": "paid",
            "submitted_at": datetime(2026, 8, 21, 9, 30, tzinfo=timezone.utc),
            "resubmitted_at": None,
            "operator_started_at": datetime(2026, 8, 21, 10, 0, tzinfo=timezone.utc),
            "govt_submitted_at": None,
            "completed_at": datetime(2026, 8, 22, 11, 0, tzinfo=timezone.utc),
            "created_at": datetime(2026, 8, 21, 9, 30, tzinfo=timezone.utc),
            "updated_at": datetime(2026, 8, 22, 11, 0, tzinfo=timezone.utc)
        }

        self.payments["p0000000-0000-0000-0000-000000000003"] = {
            "id": "p0000000-0000-0000-0000-000000000003",
            "invoice_no": "INV-2026-08-3104",
            "submission_id": sub_3_id,
            "user_id": citizen_id,
            "form_id": form_2_id,
            "form_slug": "ews_certificate",
            "amount_inr": 149.00,
            "govt_fee": 50.00,
            "portal_fee": 99.00,
            "currency": "inr",
            "status": "succeeded",
            "payment_method": "upi",
            "payment_reference": "UPI/719288102944/Paytm",
            "created_at": datetime(2026, 8, 21, 9, 30, tzinfo=timezone.utc),
            "updated_at": datetime(2026, 8, 21, 9, 35, tzinfo=timezone.utc)
        }

        self.submission_field_values[sub_3_id] = {
            "applicant_name": "Ramesh Patel",
            "father_husband_name": "Bhagwandas Patel",
            "gender": "male",
            "dob": "1985-06-15",
            "mobile_number": "9825044551",
            "aadhaar_number": "982145519821",
            "caste_subcaste": "Patidar / Kadva Patel",
            "religion": "hindu",
            "district": "Ahmedabad",
            "taluka": "Daskroi",
            "village_city": "Vastral",
            "residential_address": "B-402, Radhe Shyam Residency, Vastral",
            "pincode": "382418",
            "family_gross_income": "320000",
            "agricultural_land_acres": "0",
            "residential_flat_sqft": "850",
            "ews_purpose": "state_admission"
        }

        # Seed Historical 2026 Database Submissions and Payments Dataset
        self.seed_historical_payments(forms_data, operators_data, demo_users_data)

    def seed_historical_payments(self, forms_data, operators_data, demo_users_data):
        import random
        rng = random.Random(42)
        
        forms_by_slug = {f["slug"]: f for f in forms_data}
        op_ids = [op["id"] for op in operators_data]
        user_ids = [u["id"] for u in demo_users_data]

        payment_methods = ["upi", "upi", "upi", "card", "card", "netbanking", "qr"]
        statuses = ["succeeded", "succeeded", "succeeded", "succeeded", "succeeded", "succeeded", "succeeded", "pending", "failed", "refunded"]

        form_slugs_weighted = [
            "income_certificate", "income_certificate", "income_certificate", "income_certificate",
            "land_records_7_12", "land_records_7_12", "land_records_7_12",
            "caste_ncl_certificate", "caste_ncl_certificate",
            "ews_certificate", "ews_certificate",
            "driving_licence_rto",
            "neet_exam", "neet_exam"
        ]

        inv_counter = 9100
        for day in range(1, 24):
            day_txns_count = rng.randint(8, 14)
            for idx in range(day_txns_count):
                inv_counter += 1
                f_slug = rng.choice(form_slugs_weighted)
                f_info = forms_by_slug[f_slug]
                u_id = rng.choice(user_ids)
                op_id = rng.choice(op_ids)
                method = rng.choice(payment_methods)
                status = rng.choice(statuses) if idx % 8 == 0 else "succeeded"

                hour = rng.randint(8, 20)
                minute = rng.randint(0, 59)
                created_dt = datetime(2026, 8, day, hour, minute, tzinfo=timezone.utc)

                sub_id = str(uuid.uuid4())
                app_no = f"FS-2026-GJ-{rng.randint(1000, 9999)}"
                govt_fee = float(f_info["official_fee"])
                portal_fee = float(f_info["service_fee"])
                total_fee = govt_fee + portal_fee

                u_obj = self.users.get(u_id, {})
                u_phone = u_obj.get("phone", "+91 98250 11223")

                self.submissions[sub_id] = {
                    "id": sub_id,
                    "application_number": app_no,
                    "user_id": u_id,
                    "user_phone": u_phone,
                    "form_id": f_info["id"],
                    "assigned_operator_id": op_id,
                    "status": "approved" if status == "succeeded" else "submitted",
                    "govt_portal_application_id": f"DG-GJ-{rng.randint(10000, 99999)}",
                    "govt_portal_url": "https://digitalgujarat.gov.in",
                    "rejection_reason": None,
                    "operator_notes": "Assisted filing verified and processed.",
                    "official_fee": govt_fee,
                    "service_fee": portal_fee,
                    "total_fee": total_fee,
                    "payment_status": "paid" if status == "succeeded" else status,
                    "submitted_at": created_dt,
                    "resubmitted_at": None,
                    "operator_started_at": created_dt,
                    "govt_submitted_at": created_dt,
                    "completed_at": created_dt,
                    "created_at": created_dt,
                    "updated_at": created_dt
                }

                pmt_id = str(uuid.uuid4())
                self.payments[pmt_id] = {
                    "id": pmt_id,
                    "invoice_no": f"INV-2026-08-{inv_counter}",
                    "submission_id": sub_id,
                    "user_id": u_id,
                    "form_id": f_info["id"],
                    "form_slug": f_slug,
                    "amount_inr": total_fee,
                    "govt_fee": govt_fee,
                    "portal_fee": portal_fee,
                    "currency": "inr",
                    "status": status,
                    "payment_method": method,
                    "payment_reference": f"{method.upper()}/{rng.randint(100000000000, 999999999999)}",
                    "created_at": created_dt,
                    "updated_at": created_dt
                }

db = DatabaseStore()
