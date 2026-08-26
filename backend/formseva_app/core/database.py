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
        self.service_steps: Dict[str, Dict[str, Any]] = {}
        self.form_fields: Dict[str, Dict[str, Any]] = {}
        self.service_documents: Dict[str, Dict[str, Any]] = {}
        self.rto_offices: Dict[str, Dict[str, Any]] = {}
        self.geography_districts: Dict[str, Dict[str, Any]] = {}
        self.form_versions: Dict[str, Dict[str, Any]] = {}
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

        # 2. 4 Seed Operators
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

        # 4. Master Gujarat Geography (33 Districts + Talukas Hierarchy)
        gujarat_geo = {
            "Ahmedabad": {
                "name_en": "Ahmedabad", "name_gu": "અમદાવાદ", "name_hi": "अहमदाबाद",
                "talukas": ["Ahmedabad City", "Daskroi", "Sanand", "Bavla", "Dholka", "Dhandhuka", "Viramgam", "Mandal", "Detroj-Rampura"]
            },
            "Surat": {
                "name_en": "Surat", "name_gu": "સુરત", "name_hi": "सूरत",
                "talukas": ["Surat City", "Choryasi", "Olpad", "Kamrej", "Bardoli", "Mahuva", "Mandvi", "Mangrol", "Umarpada", "Palsana"]
            },
            "Vadodara": {
                "name_en": "Vadodara", "name_gu": "વડોદરા", "name_hi": "वडोदरा",
                "talukas": ["Vadodara City", "Vadodara Rural", "Padra", "Karjan", "Sinor", "Dabhoi", "Waghodia", "Savli", "Desar"]
            },
            "Rajkot": {
                "name_en": "Rajkot", "name_gu": "રાજકોટ", "name_hi": "राजकोट",
                "talukas": ["Rajkot City", "Rajkot Rural", "Gondal", "Jetpur", "Dhoraji", "Upleta", "Jasdan", "Vinchhiya", "Kotda Sangani", "Lodhika", "Paddhari"]
            },
            "Bhavnagar": {
                "name_en": "Bhavnagar", "name_gu": "ભાવનગર", "name_hi": "भावनगर",
                "talukas": ["Bhavnagar", "Sihor", "Gariadhar", "Palitana", "Talaja", "Mahuva", "Jesar", "Vallabhipur", "Umrala", "Ghogha"]
            },
            "Gandhinagar": {
                "name_en": "Gandhinagar", "name_gu": "ગાંધીનગર", "name_hi": "गांधीनगर",
                "talukas": ["Gandhinagar", "Kalol", "Dehgam", "Mansa"]
            },
            "Anand": {
                "name_en": "Anand", "name_gu": "આણંદ", "name_hi": "आणंद",
                "talukas": ["Anand", "Petlad", "Borsad", "Khambhat", "Tarapur", "Sojitra", "Umreth", "Anklav"]
            },
            "Mehsana": {
                "name_en": "Mehsana", "name_gu": "મહેસાણા", "name_hi": "मेहसाणा",
                "talukas": ["Mehsana", "Kadi", "Visnagar", "Vadnagar", "Kheralu", "Satlasana", "Unjha", "Becharaji", "Jotana", "Gojariya"]
            },
            "Banaskantha": {
                "name_en": "Banaskantha", "name_gu": "બનાસકાંઠા", "name_hi": "बनासकांठा",
                "talukas": ["Palanpur", "Deesa", "Dhanera", "Tharad", "Vav", "Danta", "Vadgam", "Amirgadh", "Dantiwada", "Bhabhar", "Deodar", "Lakhani", "Suigam"]
            },
            "Kutch": {
                "name_en": "Kutch", "name_gu": "કચ્છ", "name_hi": "कच्छ",
                "talukas": ["Bhuj", "Anjar", "Gandhidham", "Mandvi", "Mundra", "Nakhatrana", "Abdasa", "Lakhpat", "Rapar", "Bhachau"]
            },
            "Jamnagar": {
                "name_en": "Jamnagar", "name_gu": "જામનગર", "name_hi": "जामनगर",
                "talukas": ["Jamnagar", "Dhrol", "Jodiya", "Kalavad", "Lalpur", "Jamjodhpur"]
            },
            "Junagadh": {
                "name_en": "Junagadh", "name_gu": "જૂનાગઢ", "name_hi": "जूनागढ़",
                "talukas": ["Junagadh City", "Junagadh Rural", "Keshod", "Mangrol", "Manavadar", "Malia Hatina", "Bhesan", "Visavadar", "Mendarda", "Vanthali"]
            },
            "Kheda": {
                "name_en": "Kheda", "name_gu": "ખેડા", "name_hi": "खेड़ा",
                "talukas": ["Nadiad", "Kheda", "Kapadvanj", "Mahudha", "Matar", "Thasra", "Kathlal", "Galteshwar", "Vaso"]
            },
            "Panchmahal": {
                "name_en": "Panchmahal", "name_gu": "પંચમહાલ", "name_hi": "पंचमहल",
                "talukas": ["Godhra", "Halol", "Kalol", "Shehra", "Morwa Hadaf", "Ghoghamba", "Jambughoda"]
            },
            "Bharuch": {
                "name_en": "Bharuch", "name_gu": "ભરૂચ", "name_hi": "भरूच",
                "talukas": ["Bharuch", "Ankleshwar", "Jambusar", "Amod", "Vagra", "Hansot", "Jhagadia", "Netrang"]
            },
            "Valsad": {
                "name_en": "Valsad", "name_gu": "વલસાડ", "name_hi": "वलसाड",
                "talukas": ["Valsad", "Pardi", "Vapi", "Dharampur", "Kaprada", "Umbergaon"]
            },
            "Navsari": {
                "name_en": "Navsari", "name_gu": "નવસારી", "name_hi": "नवसारी",
                "talukas": ["Navsari", "Jalalpore", "Gandevi", "Chikhli", "Vansda", "Khergam"]
            },
            "Sabarkantha": {
                "name_en": "Sabarkantha", "name_gu": "સાબરકાંઠા", "name_hi": "साबरकांठा",
                "talukas": ["Himatnagar", "Idar", "Prantij", "Talod", "Khedbrahma", "Vadali", "Poshina", "Vijaynagar"]
            },
            "Patan": {
                "name_en": "Patan", "name_gu": "પાટણ", "name_hi": "पाटन",
                "talukas": ["Patan", "Sidhpur", "Chanasma", "Harij", "Sami", "Radhanpur", "Santalpur", "Shankheshwar", "Saraswati"]
            },
            "Amreli": {
                "name_en": "Amreli", "name_gu": "અમરેલી", "name_hi": "अमरेली",
                "talukas": ["Amreli", "Bagasara", "Dhari", "Kunkavav Vadia", "Lathi", "Lilia", "Rajula", "Savarkundla", "Khambha", "Jafrabad"]
            },
            "Surendranagar": {
                "name_en": "Surendranagar", "name_gu": "સુરેન્દ્રનગર", "name_hi": "सुरेंद्रनगर",
                "talukas": ["Wadhwan", "Limbdi", "Chotila", "Dhrangadhra", "Dasada", "Lakhtar", "Sayla", "Muli", "Thangadh", "Chuda"]
            },
            "Morbi": {
                "name_en": "Morbi", "name_gu": "મોરબી", "name_hi": "मोरबी",
                "talukas": ["Morbi", "Wankaner", "Halvad", "Maliya Miyana", "Tankara"]
            },
            "Gir Somnath": {
                "name_en": "Gir Somnath", "name_gu": "ગીર સોમનાથ", "name_hi": "गिर सोमनाथ",
                "talukas": ["Veraval", "Patan-Veraval", "Talala", "Kodinar", "Una", "Sutrapada", "Gir Gadhada"]
            },
            "Dahod": {
                "name_en": "Dahod", "name_gu": "દાહોદ", "name_hi": "दाहोद",
                "talukas": ["Dahod", "Limkheda", "Zalod", "Devgadh Baria", "Garbada", "Dhanpur", "Fatepura", "Sanjeli", "Singvad"]
            },
            "Porbandar": {
                "name_en": "Porbandar", "name_gu": "પોરબંદર", "name_hi": "पोरबंदर",
                "talukas": ["Porbandar", "Ranavav", "Kutiyana"]
            },
            "Devbhumi Dwarka": {
                "name_en": "Devbhumi Dwarka", "name_gu": "દેવભૂમિ દ્વારકા", "name_hi": "देवभूमि द्वारका",
                "talukas": ["Khambhalia", "Dwarka", "Kalyanpur", "Bhanvad"]
            },
            "Botad": {
                "name_en": "Botad", "name_gu": "બોટાદ", "name_hi": "बोटाद",
                "talukas": ["Botad", "Gadhada", "Barwala", "Ranpur"]
            },
            "Aravalli": {
                "name_en": "Aravalli", "name_gu": "અરવલ્લી", "name_hi": "अरवल्ली",
                "talukas": ["Modasa", "Malpur", "Bayad", "Dhansura", "Bhiloda", "Meghraj"]
            },
            "Mahisagar": {
                "name_en": "Mahisagar", "name_gu": "મહીસાગર", "name_hi": "महिसागर",
                "talukas": ["Lunawada", "Santrampur", "Kadana", "Khanpur", "Balasinor", "Virpur"]
            },
            "Chhota Udepur": {
                "name_en": "Chhota Udepur", "name_gu": "છોટાઉદેપુર", "name_hi": "छोटा उदयपुर",
                "talukas": ["Chhota Udepur", "Jetpur Pavi", "Kawant", "Bodeli", "Sankheda", "Naswadi"]
            },
            "Tapi": {
                "name_en": "Tapi", "name_gu": "તાપી", "name_hi": "तापी",
                "talukas": ["Vyara", "Songadh", "Valod", "Nizar", "Uchchhal", "Dolvan", "Kukarmunda"]
            },
            "Narmada": {
                "name_en": "Narmada", "name_gu": "નર્મદા", "name_hi": "नर्मदा",
                "talukas": ["Rajpipla", "Nandod", "Dediyapada", "Tilakwada", "Sagbara", "Garudeshwar"]
            },
            "Dang": {
                "name_en": "Dang", "name_gu": "ડાંગ", "name_hi": "डांग",
                "talukas": ["Ahwa", "Waghai", "Subir"]
            }
        }
        self.geography_districts = gujarat_geo

        # 5. Gujarat Transport Department Master RTO / ARTO Offices (GJ-01 to GJ-39)
        rto_list = [
            {"id": "rto_gj01", "rto_code": "GJ-01", "district": "Ahmedabad", "office_name_en": "Ahmedabad West (Subhash Bridge)", "office_name_gu": "અમદાવાદ પશ્ચિમ (સુભાષબ્રિજ)", "office_name_hi": "अहमदाबाद पश्चिम (सुभाषब्रिज)", "address": "Subhash Bridge, Ashram Road, Ahmedabad - 380027", "supported_services": ["learner", "permanent", "renewal", "duplicate", "class_addition", "address_change"]},
            {"id": "rto_gj27", "rto_code": "GJ-27", "district": "Ahmedabad", "office_name_en": "Ahmedabad East (Vastral)", "office_name_gu": "અમદાવાદ પૂર્વ (વસ્ત્રાલ)", "office_name_hi": "अहमदाबाद पूर्व (वस्त्राल)", "address": "RTO East, Near Vastral Ring Road, Ahmedabad - 382418", "supported_services": ["learner", "permanent", "renewal", "duplicate", "class_addition", "address_change"]},
            {"id": "rto_gj38", "rto_code": "GJ-38", "district": "Ahmedabad", "office_name_en": "Ahmedabad Rural (Bavla)", "office_name_gu": "અમદાવાદ ગ્રામ્ય (બાવળા)", "office_name_hi": "अहमदाबाद ग्रामीण (बावला)", "address": "ARTO Office, Highway Road, Bavla - 382220", "supported_services": ["learner", "permanent", "renewal", "duplicate"]},
            {"id": "rto_gj02", "rto_code": "GJ-02", "district": "Mehsana", "office_name_en": "Mehsana RTO", "office_name_gu": "મહેસાણા RTO", "office_name_hi": "मेहसाणा आरटीओ", "address": "Nagori Dairy Road, Mehsana - 384002", "supported_services": ["learner", "permanent", "renewal", "duplicate", "class_addition"]},
            {"id": "rto_gj03", "rto_code": "GJ-03", "district": "Rajkot", "office_name_en": "Rajkot RTO", "office_name_gu": "રાજકોટ RTO", "office_name_hi": "राजकोट आरटीओ", "address": "Near Kotecha Chowk, University Road, Rajkot - 360005", "supported_services": ["learner", "permanent", "renewal", "duplicate", "class_addition"]},
            {"id": "rto_gj04", "rto_code": "GJ-04", "district": "Bhavnagar", "office_name_en": "Bhavnagar RTO", "office_name_gu": "ભાવનગર RTO", "office_name_hi": "भावनगर आरटीओ", "address": "Ruvapari Road, Bhavnagar - 364001", "supported_services": ["learner", "permanent", "renewal", "duplicate", "class_addition"]},
            {"id": "rto_gj05", "rto_code": "GJ-05", "district": "Surat", "office_name_en": "Surat City (Pal / Adajan)", "office_name_gu": "સુરત શહેર (પાલ / અડાજણ)", "office_name_hi": "सूरत शहर (पाल)", "address": "Near Nanpura / Pal RTO, Surat - 395009", "supported_services": ["learner", "permanent", "renewal", "duplicate", "class_addition", "address_change"]},
            {"id": "rto_gj19", "rto_code": "GJ-19", "district": "Surat", "office_name_en": "Surat Rural (Bardoli ARTO)", "office_name_gu": "સુરત ગ્રામ્ય (બારડોલી)", "office_name_hi": "सूरत ग्रामीण (बारडोली)", "address": "Sardar Patel Complex, Bardoli - 394601", "supported_services": ["learner", "permanent", "renewal", "duplicate"]},
            {"id": "rto_gj06", "rto_code": "GJ-06", "district": "Vadodara", "office_name_en": "Vadodara RTO (Darbar Chowk)", "office_name_gu": "વડોદરા RTO", "office_name_hi": "वडोदरा आरटीओ", "address": "Golden Chowkdi / Darbar Road, Vadodara - 390001", "supported_services": ["learner", "permanent", "renewal", "duplicate", "class_addition"]},
            {"id": "rto_gj07", "rto_code": "GJ-07", "district": "Kheda", "office_name_en": "Nadiad / Kheda RTO", "office_name_gu": "નડિયાદ / ખેડા RTO", "office_name_hi": "नडियाद आरटीओ", "address": "Dabhan Road, Nadiad - 387001", "supported_services": ["learner", "permanent", "renewal", "duplicate"]},
            {"id": "rto_gj08", "rto_code": "GJ-08", "district": "Banaskantha", "office_name_en": "Palanpur RTO", "office_name_gu": "પાલનપુર RTO", "office_name_hi": "पालनपुर आरटीओ", "address": "Abu Road, Palanpur - 385001", "supported_services": ["learner", "permanent", "renewal", "duplicate", "class_addition"]},
            {"id": "rto_gj39", "rto_code": "GJ-39", "district": "Banaskantha", "office_name_en": "Tharad / Vav-Tharad ARTO", "office_name_gu": "થરાદ / વાવ-થરાદ ARTO", "office_name_hi": "थराद / वाव-थराद आरटीओ", "address": "Highway Road, Tharad, Banaskantha - 385565", "supported_services": ["learner", "permanent", "renewal", "duplicate"]},
            {"id": "rto_gj09", "rto_code": "GJ-09", "district": "Sabarkantha", "office_name_en": "Himatnagar RTO", "office_name_gu": "હિંમતનગર RTO", "office_name_hi": "हिम्मतनगर आरटीओ", "address": "Motipura, Himatnagar - 383001", "supported_services": ["learner", "permanent", "renewal", "duplicate"]},
            {"id": "rto_gj10", "rto_code": "GJ-10", "district": "Jamnagar", "office_name_en": "Jamnagar RTO", "office_name_gu": "જામનગર RTO", "office_name_hi": "जामनगर आरटीओ", "address": "Lalpur Bypass Road, Jamnagar - 361004", "supported_services": ["learner", "permanent", "renewal", "duplicate"]},
            {"id": "rto_gj11", "rto_code": "GJ-11", "district": "Junagadh", "office_name_en": "Junagadh RTO", "office_name_gu": "જૂનાગઢ RTO", "office_name_hi": "जूनागढ़ आरटीओ", "address": "Bhavnath Taleti Road, Junagadh - 362001", "supported_services": ["learner", "permanent", "renewal", "duplicate"]},
            {"id": "rto_gj12", "rto_code": "GJ-12", "district": "Kutch", "office_name_en": "Bhuj / Kutch RTO", "office_name_gu": "ભુજ / કચ્છ RTO", "office_name_hi": "भुज / कच्छ आरटीओ", "address": "Mirzapar Road, Bhuj-Kutch - 370001", "supported_services": ["learner", "permanent", "renewal", "duplicate"]},
            {"id": "rto_gj13", "rto_code": "GJ-13", "district": "Surendranagar", "office_name_en": "Surendranagar RTO", "office_name_gu": "સુરેન્દ્રનગર RTO", "office_name_hi": "सुरेंद्रनगर आरटीओ", "address": "Wadhwan City Road, Surendranagar - 363030", "supported_services": ["learner", "permanent", "renewal", "duplicate"]},
            {"id": "rto_gj14", "rto_code": "GJ-14", "district": "Amreli", "office_name_en": "Amreli RTO", "office_name_gu": "અમરેલી RTO", "office_name_hi": "अमरेली आरटीओ", "address": "Lathi Road, Amreli - 365601", "supported_services": ["learner", "permanent", "renewal", "duplicate"]},
            {"id": "rto_gj15", "rto_code": "GJ-15", "district": "Valsad", "office_name_en": "Valsad RTO", "office_name_gu": "વલસાડ RTO", "office_name_hi": "वलसाड आरटीओ", "address": "Tithal Road, Valsad - 396001", "supported_services": ["learner", "permanent", "renewal", "duplicate"]},
            {"id": "rto_gj16", "rto_code": "GJ-16", "district": "Bharuch", "office_name_en": "Bharuch RTO", "office_name_gu": "ભરૂચ RTO", "office_name_hi": "भरूच आरटीओ", "address": "Zadeshwar Road, Bharuch - 392011", "supported_services": ["learner", "permanent", "renewal", "duplicate"]},
            {"id": "rto_gj17", "rto_code": "GJ-17", "district": "Panchmahal", "office_name_en": "Godhra RTO", "office_name_gu": "ગોધરા RTO", "office_name_hi": "गोधरा आरटीओ", "address": "Vavdi Road, Godhra - 389001", "supported_services": ["learner", "permanent", "renewal", "duplicate"]},
            {"id": "rto_gj18", "rto_code": "GJ-18", "district": "Gandhinagar", "office_name_en": "Gandhinagar RTO", "office_name_gu": "ગાંધીનગર RTO", "office_name_hi": "गांधीनगर आरटीओ", "address": "Sector-28, GIDC, Gandhinagar - 382028", "supported_services": ["learner", "permanent", "renewal", "duplicate", "class_addition"]},
            {"id": "rto_gj20", "rto_code": "GJ-20", "district": "Dahod", "office_name_en": "Dahod RTO", "office_name_gu": "દાહોદ RTO", "office_name_hi": "दाहोद आरटीओ", "address": "Jhalod Road, Dahod - 389151", "supported_services": ["learner", "permanent", "renewal", "duplicate"]},
            {"id": "rto_gj21", "rto_code": "GJ-21", "district": "Navsari", "office_name_en": "Navsari RTO", "office_name_gu": "નવસારી RTO", "office_name_hi": "नवसारी आरटीओ", "address": "Vansda Road, Navsari - 396445", "supported_services": ["learner", "permanent", "renewal", "duplicate"]},
            {"id": "rto_gj22", "rto_code": "GJ-22", "district": "Narmada", "office_name_en": "Rajpipla ARTO", "office_name_gu": "રાજપીપળા ARTO", "office_name_hi": "राजपीपला आरटीओ", "address": "Near Collector Office, Rajpipla - 393145", "supported_services": ["learner", "permanent", "renewal", "duplicate"]},
            {"id": "rto_gj23", "rto_code": "GJ-23", "district": "Anand", "office_name_en": "Anand RTO", "office_name_gu": "આણંદ RTO", "office_name_hi": "आणंद आरटीओ", "address": "V.V. Nagar Road, Anand - 388001", "supported_services": ["learner", "permanent", "renewal", "duplicate", "class_addition"]},
            {"id": "rto_gj24", "rto_code": "GJ-24", "district": "Patan", "office_name_en": "Patan RTO", "office_name_gu": "પાટણ RTO", "office_name_hi": "पाटन आरटीओ", "address": "Chanasma Highway, Patan - 384265", "supported_services": ["learner", "permanent", "renewal", "duplicate"]},
            {"id": "rto_gj25", "rto_code": "GJ-25", "district": "Porbandar", "office_name_en": "Porbandar RTO", "office_name_gu": "પોરબંદર RTO", "office_name_hi": "पोरबंदर आरटीओ", "address": "Vanana Road, Porbandar - 360575", "supported_services": ["learner", "permanent", "renewal", "duplicate"]},
            {"id": "rto_gj26", "rto_code": "GJ-26", "district": "Tapi", "office_name_en": "Vyara ARTO", "office_name_gu": "વ્યારા ARTO", "office_name_hi": "व्यरा आरटीओ", "address": "Station Road, Vyara - 394650", "supported_services": ["learner", "permanent", "renewal", "duplicate"]},
            {"id": "rto_gj30", "rto_code": "GJ-30", "district": "Dang", "office_name_en": "Ahwa Dang ARTO", "office_name_gu": "આહવા ડાંગ ARTO", "office_name_hi": "आहवा डांग आरटीओ", "address": "Court Road, Ahwa - 394710", "supported_services": ["learner", "permanent", "renewal", "duplicate"]},
            {"id": "rto_gj31", "rto_code": "GJ-31", "district": "Aravalli", "office_name_en": "Modasa ARTO", "office_name_gu": "મોડાસા ARTO", "office_name_hi": "मोडासा आरटीओ", "address": "Malpur Road, Modasa - 383315", "supported_services": ["learner", "permanent", "renewal", "duplicate"]},
            {"id": "rto_gj32", "rto_code": "GJ-32", "district": "Gir Somnath", "office_name_en": "Veraval ARTO", "office_name_gu": "વેરાવળ ARTO", "office_name_hi": "वेरावल आरटीओ", "address": "Somnath Highway, Veraval - 362265", "supported_services": ["learner", "permanent", "renewal", "duplicate"]},
            {"id": "rto_gj33", "rto_code": "GJ-33", "district": "Botad", "office_name_en": "Botad ARTO", "office_name_gu": "બોટાદ ARTO", "office_name_hi": "बोटाद आरटीओ", "address": "Gadhada Road, Botad - 364710", "supported_services": ["learner", "permanent", "renewal", "duplicate"]},
            {"id": "rto_gj34", "rto_code": "GJ-34", "district": "Chhota Udepur", "office_name_en": "Chhota Udepur ARTO", "office_name_gu": "છોટાઉદેપુર ARTO", "office_name_hi": "छोटा उदयपुर आरटीओ", "address": "Station Road, Chhota Udepur - 391165", "supported_services": ["learner", "permanent", "renewal", "duplicate"]},
            {"id": "rto_gj35", "rto_code": "GJ-35", "district": "Mahisagar", "office_name_en": "Lunawada ARTO", "office_name_gu": "લુણાવાડા ARTO", "office_name_hi": "लूनावाड़ा आरटीओ", "address": "Modasa Highway, Lunawada - 389230", "supported_services": ["learner", "permanent", "renewal", "duplicate"]},
            {"id": "rto_gj36", "rto_code": "GJ-36", "district": "Morbi", "office_name_en": "Morbi ARTO", "office_name_gu": "મોરબી ARTO", "office_name_hi": "मोरबी आरटीओ", "address": "Trajpar Road, Morbi - 363641", "supported_services": ["learner", "permanent", "renewal", "duplicate"]},
            {"id": "rto_gj37", "rto_code": "GJ-37", "district": "Devbhumi Dwarka", "office_name_en": "Khambhalia ARTO", "office_name_gu": "ખંભાળિયા ARTO", "office_name_hi": "खंभालिया आरटीओ", "address": "Reliance Road, Khambhalia - 361305", "supported_services": ["learner", "permanent", "renewal", "duplicate"]}
        ]
        for rto in rto_list:
            self.rto_offices[rto["id"]] = {
                **rto,
                "is_active": True,
                "created_at": datetime.now(timezone.utc)
            }

        # 6. Master Forms Definition (6 Core Configured Services)
        # Consistent FormSeva Service Charges:
        # Income Certificate: ₹70.00 (Official Fee: ₹20.00)
        # EWS Certificate: ₹100.00 (Official Fee: ₹50.00)
        # NCL / SEBC Certificate: ₹70.00 (Official Fee: ₹20.00)
        # 7/12 & 8-A Land Records: ₹65.00 (Official Fee: ₹15.00)
        # Driving / Learner Licence: ₹1000.00 (Official Fee: ₹150.00)
        # NEET UG Medical Entrance: ₹1900.00 (Official Fee: ₹1700.00)
        forms_data = [
            {
                "id": "f0000000-0000-0000-0000-000000000001",
                "slug": "income_certificate",
                "title_gu": "આવકનું પ્રમાણપત્ર",
                "title_hi": "आय प्रमाण पत्र",
                "title_en": "Income Certificate",
                "description_gu": "મામલતદાર / તાલુકા વિકાસ અધિકારી દ્વારા ૩ વર્ષ માન્યતા ધરાવતું વાર્ષિક આવક પ્રમાણપત્ર.",
                "description_hi": "मामलतदार / तालुका विकास अधिकारी द्वारा 3 वर्ष की वैधता वाला वार्षिक आय प्रमाण पत्र।",
                "description_en": "Official Annual Income Certificate with 3-year validity issued by Revenue Department / Mamlatdar Office.",
                "department_name_gu": "મહેસૂલ વિભાગ, ગુજરાત સરકાર (Digital Gujarat)",
                "department_name_hi": "राजस्व विभाग, गुजरात सरकार (Digital Gujarat)",
                "department_name_en": "Revenue Department, Govt of Gujarat (Digital Gujarat)",
                "official_fee": 20.00,
                "service_fee": 70.00,
                "turnaround_days": 2,
                "expected_otp_count": 1,
                "version": "DG-REV-2026-V1.0",
                "myth_en": "Income Certificate in Gujarat is valid for only 1 year and must be renewed every financial year.",
                "myth_gu": "આવકનો દાખલો માત્ર ૧ વર્ષ માટે જ માન્ય રહે છે અને દર વર્ષે ફરીથી કઢાવવો પડે છે.",
                "fact_en": "Under Gujarat Revenue Department Resolution, Income Certificates are valid for 3 Financial Years (until 31st March of the 3rd year) unless family income changes drastically.",
                "fact_gu": "ગુજરાત મહેસૂલ વિભાગના ઠરાવ મુજબ આવકનું પ્રમાણપત્ર સળંગ ૩ નાણાકીય વર્ષ (ત્રીજા વર્ષની ૩૧મી માર્ચ) સુધી સંપૂર્ણ માન્ય રહે છે.",
                "is_active": True,
                "sort_order": 1
            },
            {
                "id": "f0000000-0000-0000-0000-000000000002",
                "slug": "ews_certificate",
                "title_gu": "EWS (આર્થિક રીતે નબળા વર્ગ) પ્રમાણપત્ર",
                "title_hi": "ईडब्ल्यूएस (आर्थिक रूप से कमजोर वर्ग) प्रमाण पत्र",
                "title_en": "Economically Weaker Section (EWS) Certificate",
                "description_gu": "શિક્ષણ અને સરકારી નોકરીઓમાં ૧૦% અનામત માટે બિન-અનામત વર્ગનું EWS આવક અને મિલકત પ્રમાણપત્ર.",
                "description_hi": "शिक्षा और सरकारी नौकरियों में 10% आरक्षण हेतु सामान्य वर्ग का ईडब्ल्यूएस प्रमाण पत्र।",
                "description_en": "10% reservation certificate for General/Open category citizens under Gujarat Government criteria (≤ ₹8 Lakhs income & property criteria).",
                "department_name_gu": "સામાજિક ન્યાય અને અધિકારિતા વિભાગ, ગુજરાત સરકાર",
                "department_name_hi": "सामाजिक न्याय एवं अधिकारिता विभाग, गुजरात सरकार",
                "department_name_en": "Social Justice & Empowerment Department, Govt of Gujarat",
                "official_fee": 50.00,
                "service_fee": 100.00,
                "turnaround_days": 2,
                "expected_otp_count": 2,
                "version": "GJ-SJE-EWS-2026-V1.0",
                "myth_en": "EWS quota certificate is available to all backward classes including SC, ST, and SEBC/OBC.",
                "myth_gu": "EWS ૧૦% અનામત પ્રમાણપત્ર SC, ST અને OBC સહિત તમામ પછાત વર્ગના લોકો પણ મેળવી શકે છે.",
                "fact_en": "EWS is strictly reserved for General / Open category candidates whose family income is below ₹8 Lakh per annum and who are not covered under SC/ST/SEBC quotas.",
                "fact_gu": "EWS અનામત ફક્ત એવા બિન-અનામત (General/Open) વર્ગ માટે જ છે જેઓ SC, ST કે SEBC/OBC ક્વોટામાં આવતા નથી અને વાર્ષિક આવક ૮ લાખથી ઓછી છે.",
                "is_active": True,
                "sort_order": 2
            },
            {
                "id": "f0000000-0000-0000-0000-000000000003",
                "slug": "caste_ncl_certificate",
                "title_gu": "નોન-ક્રીમીલેયર (NCL) / SEBC દાખલો",
                "title_hi": "नॉन-क्रीमीलेयर (एनसीएल) / ओबीसी प्रमाण पत्र",
                "title_en": "Non-Creamy Layer (NCL) / SEBC Certificate",
                "description_gu": "SEBC / OBC કેટેગરીના લાભાર્થીઓ માટે ૩ નાણાકીય વર્ષ માન્યતા ધરાવતું પેરન્ટ્સ ૩-વર્ષ આવક આધારિત નોન-ક્રીમીલેયર પ્રમાણપત્ર.",
                "description_hi": "ओबीसी/एसईबीसी वर्ग के लिए 3 वर्ष की वैधता वाला नॉन-क्रीमीलेयर प्रमाण पत्र।",
                "description_en": "3-year validity Non-Creamy Layer certificate for SEBC / OBC category benefits based on parents' 3-year income history.",
                "department_name_gu": "સામાજિક ન્યાય અને અધિકારિતા વિભાગ (વિકસતી જાતિ કલ્યાણ)",
                "department_name_hi": "सामाजिक न्याय एवं अधिकारिता विभाग, गुजरात",
                "department_name_en": "Social Justice & Empowerment Department (DDCW Gujarat)",
                "official_fee": 20.00,
                "service_fee": 70.00,
                "turnaround_days": 2,
                "expected_otp_count": 1,
                "version": "GJ-SJE-NCL-2026-V1.0",
                "myth_en": "OBC Caste Certificate and Non-Creamy Layer (NCL) Certificate are the same document and NCL never expires.",
                "myth_gu": "જાતિનો દાખલો (Caste Certificate) અને નોન-ક્રીમીલેયર (NCL) બંને એક જ છે અને NCL ક્યારેય એક્સપાયર થતો નથી.",
                "fact_en": "Caste certificate proves your social identity with lifetime validity, whereas NCL Certificate certifies income eligibility under creamy layer ceiling and is valid for 3 Financial Years.",
                "fact_gu": "જાતિનું પ્રમાણપત્ર આજીવન માન્ય હોય છે, જ્યારે નોન-ક્રીમીલેયર (NCL) આવક મર્યાદા દર્શાવે છે અને તે ૩ નાણાકીય વર્ષ માટે જ માન્ય રહે છે.",
                "is_active": True,
                "sort_order": 3
            },
            {
                "id": "f0000000-0000-0000-0000-000000000004",
                "slug": "land_records_7_12",
                "title_gu": "૭/૧૨ અને ૮-અ જમીન રેકોર્ડ નકલ (AnyRoR)",
                "title_hi": "7/12 एवं 8-अ भूमि रिकॉर्ड नकल (AnyRoR)",
                "title_en": "7/12 & 8-A Land Record Extracts (AnyRoR)",
                "description_gu": "ગુજરાતના કોઈપણ મહેસૂલી ગામના અધિકૃત ડિજિટલ સહીવાળા ૭/૧૨, ૮-અ અને હક્ક પત્રક ૬ ઉતારા.",
                "description_hi": "गुजरात के किसी भी गांव के डिजिटल हस्ताक्षरित 7/12, 8-ए नकल।",
                "description_en": "Digitally signed official certified land records 7/12, 8-A & VF-6 from AnyRoR Gujarat with official QR validation.",
                "department_name_gu": "મહેસૂલ વિભાગ - જમીન દફતર અને ઇ-ધરા (AnyRoR)",
                "department_name_hi": "राजस्व विभाग - भूमि अभिलेख (AnyRoR)",
                "department_name_en": "Revenue Dept - Land Records & E-Dhara (AnyRoR Gujarat)",
                "official_fee": 15.00,
                "service_fee": 65.00,
                "turnaround_days": 1,
                "expected_otp_count": 1,
                "version": "ANYROR-GJ-2026-V1.0",
                "myth_en": "Online AnyRoR 7/12 copies cannot be accepted by banks for KCC or loan mortgages without manual Talati physical stamp.",
                "myth_gu": "ઓનલાઇન ડાઉનલોડ કરેલી AnyRoR ૭/૧૨ નકલ પર તલાટીનો સિક્કો ન હોય તો બેંક લોન માટે માન્ય ગણાતી નથી.",
                "fact_en": "Digitally signed AnyRoR 7/12 records with Gujarat Govt QR code and barcode watermark have 100% legal validity under Sec 65B of Indian Evidence Act across all banks, registries, and courts.",
                "fact_gu": "ક્યુઆર કોડ અને ડિજિટલ સહીવાળી AnyRoR ૭/૧૨ નકલ તમામ રાષ્ટ્રીયકૃત બેંકો, દસ્તાવેજ રજીસ્ટ્રાર અને કોર્ટમાં કાયદેસર ૧૦૦% માન્ય ગણાય છે.",
                "is_active": True,
                "sort_order": 4
            },
            {
                "id": "f0000000-0000-0000-0000-000000000005",
                "slug": "driving_licence_rto",
                "title_gu": "ડ્રાઇવિંગ / લર્નિંગ લાયસન્સ સહાયતા (RTO સારથી)",
                "title_hi": "ड्राइविंग / लर्निंग लाइसेंस सहायता (RTO सारथी)",
                "title_en": "Driving / Learner Licence Assistance (Sarathi RTO)",
                "description_gu": "લર્નિંગ લાયસન્સ (ફેસલેસ હોમ ટેસ્ટ), નવું DL સ્લોટ બુકિંગ, કેટેગરી ઉમેરો, રીન્યુઅલ અને ડુપ્લીકેટ લાયસન્સ સહાયતા.",
                "description_hi": "लर्निंग लाइसेंस (फेसलेस ऑनलाइन टेस्ट), स्थायी डीएल स्लॉट बुकिंग एवं नवीनीकरण सहायता।",
                "description_en": "End-to-end Sarathi Parivahan portal filing, contactless LL test setup, vehicle class addition, and DL appointment booking.",
                "department_name_gu": "વાહન વ્યવહાર કમિશનર કચેરી, ગુજરાત સરકાર (Sarathi 4.0)",
                "department_name_hi": "परिवहन आयुक्त कार्यालय, गुजरात સરકાર (Sarathi 4.0)",
                "department_name_en": "Transport Department, Govt of Gujarat (Sarathi Parivahan)",
                "official_fee": 150.00,
                "service_fee": 1000.00,
                "turnaround_days": 2,
                "expected_otp_count": 2,
                "version": "SARATHI-GJ-2026-V1.0",
                "myth_en": "You must physically visit the RTO office and wait in long queues for hours just to take the Learner Licence test.",
                "myth_gu": "લર્નિંગ લાયસન્સની પરીક્ષા આપવા માટે ફરજિયાત RTO કચેરીએ જઈને આખો દિવસ લાઈનમાં ઊભા રહેવું પડે છે.",
                "fact_en": "Under Gujarat's Contactless Faceless RTO (Sarathi 4.0), you can take the online LL computer theory test from home via Aadhaar facial recognition and download your LL immediately upon passing.",
                "fact_gu": "ગુજરાત પરિવહન વિભાગની ફેસલેસ RTO પહેલ હેઠળ તમે ઘરે બેઠા મોબાઈલ/લેપટોપ પરથી આધાર ફેસ ઓથેન્ટિકેશનથી ઓનલાઇન LL પરીક્ષા આપીને તુરંત લાયસન્સ ડાઉનલોડ કરી શકો છો.",
                "is_active": True,
                "sort_order": 5
            },
            {
                "id": "f0000000-0000-0000-0000-000000000006",
                "slug": "neet_exam",
                "title_gu": "NEET UG મેડિકલ પ્રવેશ પરીક્ષા ૨૦૨૬",
                "title_hi": "नीट यूजी मेडिकल प्रवेश परीक्षा 2026",
                "title_en": "NEET UG Medical Entrance Exam Registration",
                "description_gu": "NTA NEET UG 2026 મેડિકલ અને ડેન્ટલ પ્રવેશ પરીક્ષાનું સચોટ ઓનલાઈન ફોર્મ ફાઈલિંગ, ફોટો-સહી ચકાસણી અને સેન્ટર સિલેક્શન.",
                "description_hi": "NTA नीट यूजी 2026 ऑनलाइन परीक्षा पंजीकरण, दस्तावेज सत्यापन एवं परीक्षा केंद्र चयन।",
                "description_en": "NTA NEET UG National Medical Entrance Registration — Class 10/12 academic validation, category verification, document resizing, and bilingual examination centre preference.",
                "department_name_gu": "નેશનલ ટેસ્ટિંગ એજન્સી (NTA) / કેન્દ્રીય આરોગ્ય મંત્રાલય",
                "department_name_hi": "राष्ट्रीय परीक्षा एजेंसी (NTA)",
                "department_name_en": "National Testing Agency (NTA, Govt of India)",
                "official_fee": 1700.00,
                "service_fee": 1900.00,
                "turnaround_days": 2,
                "expected_otp_count": 2,
                "version": "NEET-UG-2026-NTA-V1.0",
                "exam_year": 2026,
                "bulletin_version": "NTA-NEET-UG-2026-IB-REV1",
                "myth_en": "If a candidate chooses Gujarati medium for NEET UG, the question booklet will only be in Gujarati and English questions will not be available.",
                "myth_gu": "જો NEET પરીક્ષામાં ગુજરાતી માધ્યમ પસંદ કરીએ તો પ્રશ્નપત્ર ફક્ત ગુજરાતીમાં જ આવશે અને અંગ્રેજી ભાષાંતર જોવા નહીં મળે.",
                "fact_en": "If Gujarati medium is selected, NTA provides a Bilingual Question Booklet with every question printed in both Gujarati and English side-by-side on the same page.",
                "fact_gu": "જો તમે ગુજરાતી માધ્યમ પસંદ કરો છો તો NTA દ્વારા આપવામાં આવતી પ્રશ્નપુસ્તિકામાં દરેક પ્રશ્ન ગુજરાતી અને અંગ્રેજી બંને ભાષામાં સામસામે છપાયેલો હોય છે.",
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

        # Seed Operator <-> Form Authorization Assignments (Dedicated 1:1 Specialization)
        initial_assignments = [
            # Vicky (Ahmedabad) -> Income Certificate & EWS Certificate
            {"op_id": "b0000000-0000-0000-0000-000000000001", "form_id": "f0000000-0000-0000-0000-000000000001"},
            {"op_id": "b0000000-0000-0000-0000-000000000001", "form_id": "f0000000-0000-0000-0000-000000000002"},

            # Nikhil (Vadodara) -> 7/12 & 8-A Land Record Extracts (AnyRoR)
            {"op_id": "b0000000-0000-0000-0000-000000000002", "form_id": "f0000000-0000-0000-0000-000000000004"},

            # Dhulo (Surat) -> Non-Creamy Layer (NCL) / SEBC & NEET UG Registration
            {"op_id": "b0000000-0000-0000-0000-000000000003", "form_id": "f0000000-0000-0000-0000-000000000003"},
            {"op_id": "b0000000-0000-0000-0000-000000000003", "form_id": "f0000000-0000-0000-0000-000000000006"},

            # Loy (Rajkot) -> Driving / Learner Licence Assistance (Sarathi RTO)
            {"op_id": "b0000000-0000-0000-0000-000000000004", "form_id": "f0000000-0000-0000-0000-000000000005"},
        ]
        for a in initial_assignments:
            aid = str(uuid.uuid4())
            self.operator_form_assignments[aid] = {
                "id": aid,
                "operator_id": a["op_id"],
                "form_id": a["form_id"],
                "is_active": True,
                "assigned_at": datetime.now(timezone.utc),
                "assigned_by": admin_id
            }

        # 7. Form Steps (Structured Multi-Step Definitions per Service)
        steps_config = [
            # Form 1: Income Certificate
            {"form_id": "f0000000-0000-0000-0000-000000000001", "step_key": "applicant", "step_number": 1, "title_en": "Applicant Info", "title_gu": "અરજદારની માહિતી", "title_hi": "आवेदक विवरण"},
            {"form_id": "f0000000-0000-0000-0000-000000000001", "step_key": "address", "step_number": 2, "title_en": "Residential Address", "title_gu": "રહેઠાણનું સરનામું", "title_hi": "आवासीय पता"},
            {"form_id": "f0000000-0000-0000-0000-000000000001", "step_key": "family_income", "step_number": 3, "title_en": "Family & Income Sources", "title_gu": "કુટુંબ અને આવકના સ્ત્રોત", "title_hi": "परिवार एवं आय विवरण"},
            {"form_id": "f0000000-0000-0000-0000-000000000001", "step_key": "documents", "step_number": 4, "title_en": "Document Vault", "title_gu": "દસ્તાવેજ અપલોડ", "title_hi": "दस्तावेज अपलोड"},
            {"form_id": "f0000000-0000-0000-0000-000000000001", "step_key": "review", "step_number": 5, "title_en": "Review & Submit", "title_gu": "ચકાસણી અને પેમેન્ટ", "title_hi": "समीक्षा एवं भुगतान"},

            # Form 2: EWS Certificate
            {"form_id": "f0000000-0000-0000-0000-000000000002", "step_key": "applicant", "step_number": 1, "title_en": "Applicant & Caste", "title_gu": "અરજદાર અને જ્ઞાતિ", "title_hi": "आवेदक एवं जाति"},
            {"form_id": "f0000000-0000-0000-0000-000000000002", "step_key": "address", "step_number": 2, "title_en": "Address Details", "title_gu": "સરનામું", "title_hi": "आवासीय पता"},
            {"form_id": "f0000000-0000-0000-0000-000000000002", "step_key": "family_income", "step_number": 3, "title_en": "Gross Family Income", "title_gu": "કુટુંબની કુલ વાર્ષિક આવક", "title_hi": "पारिवारिक कुल आय"},
            {"form_id": "f0000000-0000-0000-0000-000000000002", "step_key": "property_assets", "step_number": 4, "title_en": "Property & Asset Limits", "title_gu": "મિલકત અને જમીન ચકાસણી", "title_hi": "संपत्ति एवं भूमि विवरण"},
            {"form_id": "f0000000-0000-0000-0000-000000000002", "step_key": "documents", "step_number": 5, "title_en": "Required Evidence", "title_gu": "દસ્તાવેજ અપલોડ", "title_hi": "दस्तावेज प्रमाण"},
            {"form_id": "f0000000-0000-0000-0000-000000000002", "step_key": "review", "step_number": 6, "title_en": "Review & Submit", "title_gu": "ચકાસણી અને પેમેન્ટ", "title_hi": "समीक्षा एवं भुगतान"},

            # Form 3: NCL / SEBC Certificate
            {"form_id": "f0000000-0000-0000-0000-000000000003", "step_key": "applicant", "step_number": 1, "title_en": "Applicant & SEBC Caste", "title_gu": "અરજદાર અને SEBC જ્ઞાતિ", "title_hi": "आवेदक एवं ओबीसी जाति"},
            {"form_id": "f0000000-0000-0000-0000-000000000003", "step_key": "address", "step_number": 2, "title_en": "Address & Parents", "title_gu": "સરનામું અને માતા-પિતા વિગત", "title_hi": "पता एवं अभिभावक"},
            {"form_id": "f0000000-0000-0000-0000-000000000003", "step_key": "three_year_income", "step_number": 3, "title_en": "3-Year Income History", "title_gu": "૩ વર્ષની આવકનો ઇતિહાસ", "title_hi": "3 वर्षों का आय इतिहास"},
            {"form_id": "f0000000-0000-0000-0000-000000000003", "step_key": "documents", "step_number": 4, "title_en": "Mandatory Proofs", "title_gu": "જરૂરી પુરાવા અપલોડ", "title_hi": "दस्तावेज अपलोड"},
            {"form_id": "f0000000-0000-0000-0000-000000000003", "step_key": "review", "step_number": 5, "title_en": "Review & Submit", "title_gu": "ચકાસણી અને પેમેન્ટ", "title_hi": "समीक्षा एवं भुगतान"},

            # Form 4: 7/12 & 8-A Land Records
            {"form_id": "f0000000-0000-0000-0000-000000000004", "step_key": "applicant", "step_number": 1, "title_en": "Applicant Contact", "title_gu": "અરજદાર સંપર્ક વિગત", "title_hi": "आवेदक संपर्क"},
            {"form_id": "f0000000-0000-0000-0000-000000000004", "step_key": "land_location", "step_number": 2, "title_en": "Land Location & Survey", "title_gu": "જમીન સ્થળ અને સર્વે નંબર", "title_hi": "भूमि स्थान एवं सर्वे संख्या"},
            {"form_id": "f0000000-0000-0000-0000-000000000004", "step_key": "documents", "step_number": 3, "title_en": "Supporting Reference", "title_gu": "ઓળખ / સંદર્ભ પુરાવો", "title_hi": "पहचान प्रमाण"},
            {"form_id": "f0000000-0000-0000-0000-000000000004", "step_key": "review", "step_number": 4, "title_en": "Review & Download", "title_gu": "ચકાસણી અને ઓર્ડર", "title_hi": "समीक्षा एवं भुगतान"},

            # Form 5: Driving / Learner Licence Assistance (Sarathi RTO)
            {"form_id": "f0000000-0000-0000-0000-000000000005", "step_key": "applicant", "step_number": 1, "title_en": "Personal & Education", "title_gu": "અંગત માહિતી અને લાયકાત", "title_hi": "व्यक्तिगत एवं शैक्षणिक"},
            {"form_id": "f0000000-0000-0000-0000-000000000005", "step_key": "address", "step_number": 2, "title_en": "Address Details", "title_gu": "સરનામું", "title_hi": "आवासीय पता"},
            {"form_id": "f0000000-0000-0000-0000-000000000005", "step_key": "licence_service", "step_number": 3, "title_en": "Licence Type & Vehicle Class", "title_gu": "લાયસન્સ પ્રકાર અને વાહન ક્લાસ", "title_hi": "लाइसेंस एवं वाहन श्रेणी"},
            {"form_id": "f0000000-0000-0000-0000-000000000005", "step_key": "rto_selection", "step_number": 4, "title_en": "RTO Office Selection", "title_gu": "નજીકની RTO કચેરી પસંદગી", "title_hi": "आरटीओ कार्यालय चयन"},
            {"form_id": "f0000000-0000-0000-0000-000000000005", "step_key": "documents", "step_number": 5, "title_en": "Photo & Signature Scan", "title_gu": "ફોટો, સહી અને ઉંમર પુરાવો", "title_hi": "फोटो, हस्ताक्षर एवं प्रमाण"},
            {"form_id": "f0000000-0000-0000-0000-000000000005", "step_key": "review", "step_number": 6, "title_en": "Review & Slot Booking", "title_gu": "ચકાસણી અને પેમેન્ટ", "title_hi": "समीक्षा एवं भुगतान"},

            # Form 6: NEET UG Medical Entrance Exam 2026
            {"form_id": "f0000000-0000-0000-0000-000000000006", "step_key": "candidate", "step_number": 1, "title_en": "Candidate & Identity", "title_gu": "ઉમેદવાર અને ઓળખ વિગત", "title_hi": "उम्मीदवार एवं पहचान"},
            {"form_id": "f0000000-0000-0000-0000-000000000006", "step_key": "address", "step_number": 2, "title_en": "Address & Contact", "title_gu": "કાયમી સરનામું અને સંપર્ક", "title_hi": "पता एवं संपर्क"},
            {"form_id": "f0000000-0000-0000-0000-000000000006", "step_key": "academic", "step_number": 3, "title_en": "Class 10 & 12 Academic", "title_gu": "ધોરણ ૧૦ અને ૧૨ શૈક્ષણિક વિગતો", "title_hi": "10वीं एवं 12वीं शैक्षणिक विवरण"},
            {"form_id": "f0000000-0000-0000-0000-000000000006", "step_key": "exam_details", "step_number": 4, "title_en": "Exam Medium & City Choices", "title_gu": "પરીક્ષા માધ્યમ અને શહેર પસંદગી", "title_hi": "परीक्षा माध्यम एवं केंद्र"},
            {"form_id": "f0000000-0000-0000-0000-000000000006", "step_key": "documents", "step_number": 5, "title_en": "NTA Photo & Biometrics", "title_gu": "ફોટો, સહી અને આંગળીઓની છાપ", "title_hi": "फोटो, हस्ताक्षर एवं बायोमेट्रिक्स"},
            {"form_id": "f0000000-0000-0000-0000-000000000006", "step_key": "review", "step_number": 6, "title_en": "Final Verification & Submit", "title_gu": "અંતિમ ચકાસણી અને પેમેન્ટ", "title_hi": "समीक्षा एवं भुगतान"}
        ]
        for step in steps_config:
            step_id = str(uuid.uuid4())
            self.service_steps[step_id] = {"id": step_id, **step, "created_at": datetime.now(timezone.utc)}

        # 8. Document Requirements Engine (Matrix with Mandatory, Conditional, and Supporting rules)
        service_docs_data = [
            # Form 1: Income Certificate
            {
                "form_id": "f0000000-0000-0000-0000-000000000001",
                "document_type_key": "aadhaar_card",
                "name_en": "Aadhaar Card (Applicant / Head of Family)",
                "name_gu": "અરજદારનું આધાર કાર્ડ",
                "name_hi": "आधार कार्ड (आवेदक)",
                "required_level": "mandatory",
                "accepted_formats": ["PDF", "JPG", "PNG"],
                "max_size_mb": 5,
                "why_needed_en": "Mandatory identity and biometric KYC proof across Gujarat digital revenue portal.",
                "why_needed_gu": "ગુજરાત મહેસૂલ પોર્ટલ પર ઓળખ અને e-KYC ચકાસણી માટે ફરજિયાત.",
                "why_needed_hi": "डिजिटल पहचान एवं ई-केवाईसी हेतु अनिवार्य।",
                "where_to_get_en": "Download digital e-Aadhaar from UIDAI Portal (eaadhaar.uidai.gov.in) or scan physical card.",
                "where_to_get_gu": "UIDAI પોર્ટલ પરથી ઓનલાઇન અથવા આધાર કેન્દ્ર / અસલ કાર્ડ સ્કેન.",
                "where_to_get_hi": "यूआईडीएआई पोर्टल अथवा मूल आधार कार्ड।",
                "source_authority_en": "Unique Identification Authority of India (UIDAI)",
                "source_authority_gu": "યુઆઈડીએઆઈ (UIDAI) ભારત સરકાર",
                "source_authority_hi": "यूआईडीएआई भारत सरकार",
                "sort_order": 1
            },
            {
                "form_id": "f0000000-0000-0000-0000-000000000001",
                "document_type_key": "ration_card",
                "name_en": "Ration Card (All Family Members Page)",
                "name_gu": "રેશન કાર્ડ (તમામ સભ્યોના નામવાળું પાનું)",
                "name_hi": "राशन कार्ड (पारिवारिक विवरण)",
                "required_level": "mandatory",
                "accepted_formats": ["PDF", "JPG", "PNG"],
                "max_size_mb": 5,
                "why_needed_en": "Verifies family tree composition to establish total combined family income.",
                "why_needed_gu": "કુટુંબના તમામ સભ્યોની ગણતરી અને સંયુક્ત વાર્ષિક આવક સ્થાપિત કરવા માટે.",
                "why_needed_hi": "परिवार के सदस्यों एवं कुल पारिवारिक आय सत्यापन हेतु।",
                "where_to_get_en": "Physical ration card booklet issued by Food & Civil Supplies Department Gujarat / Digital Gujarat barcoded copy.",
                "where_to_get_gu": "અન્ન અને નાગરિક પુરવઠા વિભાગ ગુજરાત દ્વારા જારી રેશન કાર્ડ.",
                "where_to_get_hi": "खाद्य एवं नागरिक आपूर्ति विभाग द्वारा प्रदत्त राशन कार्ड।",
                "source_authority_en": "Food & Civil Supplies Dept, Govt of Gujarat",
                "source_authority_gu": "અન્ન અને નાગરિક પુરવઠા વિભાગ, ગુજરાત",
                "source_authority_hi": "नागरिक आपूर्ति विभाग गुजरात",
                "sort_order": 2
            },
            {
                "form_id": "f0000000-0000-0000-0000-000000000001",
                "document_type_key": "income_proof",
                "name_en": "Income Proof (Talati Report / Salary Slip / Form 16 / ITR)",
                "name_gu": "આવકનો સત્તાવાર પુરાવો (તલાટી પંચનામું / પગાર સ્લિપ / ફોર્મ-૧૬ / ITR)",
                "name_hi": "आय प्रमाण (तलाटी रिपोर्ट / वेतन पर्ची / आईटीआर)",
                "required_level": "mandatory",
                "accepted_formats": ["PDF", "JPG", "PNG"],
                "max_size_mb": 5,
                "why_needed_en": "Official documentary justification of applicant's declared annual financial income.",
                "why_needed_gu": "અરજદાર દ્વારા દર્શાવેલ વાર્ષિક આવકની કાયદેસર ખરાઈ માટે.",
                "why_needed_hi": "वार्षिक आय के प्रमाणिक सत्यापन हेतु।",
                "where_to_get_en": "Village Talati Mantri (Rural) / Employer Salary Certificate / IT Department ITR acknowledgement (Urban).",
                "where_to_get_gu": "ગામના તલાટી કમ મંત્રીનો દાખલો (ગ્રામ્ય) અથવા નોકરીની પગાર સ્લિપ / ITR રિટર્ન (શહેરી).",
                "where_to_get_hi": "तलाटी कार्यालय अथवा नियोक्ता वेतन प्रमाण पत्र / आईटीआर।",
                "source_authority_en": "Revenue Talati / Income Tax Dept / Employer",
                "source_authority_gu": "મહેસૂલ તલાટી / ઇન્કમ ટેક્સ વિભાગ / એમ્પ્લોયર",
                "source_authority_hi": "राजस्व तलाटी / आयकर विभाग",
                "sort_order": 3
            },
            {
                "form_id": "f0000000-0000-0000-0000-000000000001",
                "document_type_key": "electricity_bill",
                "name_en": "Electricity Bill / Property Tax Receipt (Residence Proof)",
                "name_gu": "લાઈટ બિલ / મકાન વેરા પાવતી (રહેઠાણ પુરાવો)",
                "name_hi": "बिजली बिल / गृह कर रसीद",
                "required_level": "mandatory",
                "accepted_formats": ["PDF", "JPG", "PNG"],
                "max_size_mb": 5,
                "why_needed_en": "Confirms applicant's local jurisdictional address under the Mamlatdar office.",
                "why_needed_gu": "સંબંધિત મામલતદાર કચેરીના અધિકાર ક્ષેત્રમાં રહેઠાણની પુષ્ટિ કરવા.",
                "why_needed_hi": "स्थानीय क्षेत्राधिकार एवं निवास स्थान प्रमाण।",
                "where_to_get_en": "Latest DISCOM bill (UGVCL / DGVCL / MGVCL / PGVCL / Torrent Power) or Municipal Tax receipt.",
                "where_to_get_gu": "વીજળી બિલ (UGVCL/DGVCL/MGVCL/PGVCL/ટોરેન્ટ પાવર) અથવા નગરપાલિકા/મહાનગરપાલિકા વેરા બિલ.",
                "where_to_get_hi": "विद्युत वितरण कंपनी अथवा नगरपालिका टैक्स रसीद।",
                "source_authority_en": "Gujarat DISCOM / Municipal Corporation",
                "source_authority_gu": "વીજ વિતરણ કંપની / મહાનગરપાલિકા",
                "source_authority_hi": "विद्युत कंपनी / नगर निगम",
                "sort_order": 4
            },

            # Form 2: EWS Certificate
            {
                "form_id": "f0000000-0000-0000-0000-000000000002",
                "document_type_key": "aadhaar_card",
                "name_en": "Applicant & Parents Aadhaar Card",
                "name_gu": "અરજદાર અને માતા-પિતાનું આધાર કાર્ડ",
                "name_hi": "आधार कार्ड (आवेदक एवं अभिभावक)",
                "required_level": "mandatory",
                "accepted_formats": ["PDF", "JPG", "PNG"],
                "max_size_mb": 5,
                "why_needed_en": "Identity and family linkage verification for General EWS category.",
                "why_needed_gu": "બિન-અનામત વર્ગના લાભાર્થીઓની ઓળખ અને કુટુંબ લિંકિંગ માટે.",
                "why_needed_hi": "पहचान एवं सामान्य वर्ग सत्यापन हेतु।",
                "where_to_get_en": "UIDAI Portal / Physical Card.",
                "where_to_get_gu": "UIDAI પોર્ટલ / અસલ આધાર કાર્ડ.",
                "where_to_get_hi": "यूआईडीएआई पोर्टल।",
                "source_authority_en": "UIDAI", "source_authority_gu": "UIDAI", "source_authority_hi": "UIDAI",
                "sort_order": 1
            },
            {
                "form_id": "f0000000-0000-0000-0000-000000000002",
                "document_type_key": "school_lc",
                "name_en": "School Leaving Certificate / Birth Certificate (Proof of General Caste)",
                "name_gu": "શાળા L.C. / જન્મ દાખલો (બિન-અનામત જ્ઞાતિ પુરાવો)",
                "name_hi": "स्कूल एलसी / जन्म प्रमाण पत्र",
                "required_level": "mandatory",
                "accepted_formats": ["PDF", "JPG", "PNG"],
                "max_size_mb": 5,
                "why_needed_en": "Proves applicant belongs to General / Open category and is not covered under SC/ST/SEBC quotas.",
                "why_needed_gu": "અરજદાર SC/ST/OBC અનામત હેઠળ ન આવતા બિન-અનામત જ્ઞાતિના છે તે સાબિત કરવા.",
                "why_needed_hi": "सामान्य वर्ग से संबंधित होने का प्रमाण।",
                "where_to_get_en": "School / College attended by the applicant.",
                "where_to_get_gu": "અરજદારે અભ્યાસ કરેલ પ્રાથમિક/માધ્યમિક શાળા.",
                "where_to_get_hi": "आवेदक का विद्यालय / कॉलेज।",
                "source_authority_en": "Educational Institute / Registrar of Births",
                "source_authority_gu": "શૈક્ષણિક સંસ્થા / જન્મ-મરણ રજીસ્ટ્રાર",
                "source_authority_hi": "शिक्षण संस्थान",
                "sort_order": 2
            },
            {
                "form_id": "f0000000-0000-0000-0000-000000000002",
                "document_type_key": "family_income_proof",
                "name_en": "Total Family Income Certificate (Below ₹8 Lakhs)",
                "name_gu": "કુટુંબની કુલ વાર્ષિક આવકનો પુરાવો (રૂ. ૮ લાખથી ઓછી)",
                "name_hi": "पारिवारिक आय प्रमाण (< 8 लाख)",
                "required_level": "mandatory",
                "accepted_formats": ["PDF", "JPG", "PNG"],
                "max_size_mb": 5,
                "why_needed_en": "Proves the gross family income from all sources is below the ₹8 Lakhs threshold.",
                "why_needed_gu": "તમામ સ્ત્રોતોમાંથી કુટુંબની વાર્ષિક આવક ૮ લાખથી ઓછી હોવાનું સાબિત કરવા.",
                "why_needed_hi": "8 लाख रुपये से कम आय सीमा प्रमाण।",
                "where_to_get_en": "Talati Income Certificate / Form 16 / ITR Copies of all earning members.",
                "where_to_get_gu": "તલાટી આવક દાખલો / ફોર્મ-૧૬ / ITR રિટર્ન.",
                "where_to_get_hi": "तलाटी कार्यालय / फॉर्म 16 / आईटीआर।",
                "source_authority_en": "Revenue Department / Income Tax Dept",
                "source_authority_gu": "મહેસૂલ વિભાગ / ઇન્કમ ટેક્સ",
                "source_authority_hi": "राजस्व विभाग",
                "sort_order": 3
            },
            {
                "form_id": "f0000000-0000-0000-0000-000000000002",
                "document_type_key": "property_proof",
                "name_en": "Property / Land Documents (7/12 Land Records or House Tax / Index Copy)",
                "name_gu": "મકાન / જમીનના દસ્તાવેજ (૭/૧૨ નકલ અથવા મકાન વેરા પાવતી)",
                "name_hi": "मकान / भूमि दस्तावेज",
                "required_level": "conditional",
                "condition_rule": {"field": "agricultural_land_acres", "op": "gt", "value": 0},
                "accepted_formats": ["PDF", "JPG", "PNG"],
                "max_size_mb": 5,
                "why_needed_en": "Confirms land holding is under 5 acres and residential flat is under 1,000 sq ft as per EWS guidelines.",
                "why_needed_gu": "EWS નિયમ મુજબ ૫ એકરથી ઓછી જમીન અને ૧૦૦૦ ચો.ફૂટથી નાનું મકાન હોવાની ખાતરી કરવા.",
                "why_needed_hi": "भूमि एवं आवासीय सीमा सत्यापन हेतु।",
                "where_to_get_en": "AnyRoR Gujarat portal / Village Talati / City Civic Center.",
                "where_to_get_gu": "AnyRoR પોર્ટલ / ઇ-ધરા કેન્દ્ર / મહાનગરપાલિકા વેરા રસીદ.",
                "where_to_get_hi": "भूमि अभिलेख कार्यालय / नगर पालिका।",
                "source_authority_en": "Revenue Dept / Municipal Corporation",
                "source_authority_gu": "મહેસૂલ વિભાગ / મહાનગરપાલિકા",
                "source_authority_hi": "राजस्व विभाग",
                "sort_order": 4
            },
            {
                "form_id": "f0000000-0000-0000-0000-000000000002",
                "document_type_key": "pedigree_affidavit",
                "name_en": "Pedigree (Pedhinamu) / Family Self-Declaration Affidavit",
                "name_gu": "વારસાઈ પેઢીનામું / EWS સોગંદનામું (સ્વ-ઘોષણાપત્ર)",
                "name_hi": "वंशावली (पेढीनामु) / शपथ पत्र",
                "required_level": "supporting",
                "accepted_formats": ["PDF", "JPG", "PNG"],
                "max_size_mb": 5,
                "why_needed_en": "Legal declaration certifying the applicant and family members own no disqualifying assets.",
                "why_needed_gu": "કુટુંબ પાસે મર્યાદાથી વધુ મિલકત કે આવક નથી તેનું કાયદેસર સોગંદનામું.",
                "why_needed_hi": "पारिवारिक संपत्ति शपथ पत्र।",
                "where_to_get_en": "Talati Mantri / Notary Advocate / Digital Gujarat Self-Declaration Form.",
                "where_to_get_gu": "તલાટી કમ મંત્રી પંચનામું અથવા નોટરી સોગંદનામું.",
                "where_to_get_hi": "तलाटी कार्यालय / नोटरी अधिवक्ता।",
                "source_authority_en": "Talati / Notary Public",
                "source_authority_gu": "તલાટી / પબ્લિક નોટરી",
                "source_authority_hi": "तलाटी / नोटरी",
                "sort_order": 5
            },

            # Form 3: NCL / SEBC Certificate
            {
                "form_id": "f0000000-0000-0000-0000-000000000003",
                "document_type_key": "applicant_lc",
                "name_en": "Applicant School LC (Showing SEBC / OBC Caste)",
                "name_gu": "અરજદારની શાળા L.C. (SEBC/OBC જ્ઞાતિ દર્શાવતી)",
                "name_hi": "आवेदक का स्कूल एलसी (जाति सहित)",
                "required_level": "mandatory",
                "accepted_formats": ["PDF", "JPG", "PNG"],
                "max_size_mb": 5,
                "why_needed_en": "Establishes applicant's primary caste identification under Gujarat SEBC list.",
                "why_needed_gu": "ગુજરાત સરકારની SEBC યાદી મુજબ અરજદારની જ્ઞાતિ સાબિત કરવા.",
                "why_needed_hi": "ओबीसी/एसईबीसी जाति प्रमाण।",
                "where_to_get_en": "School / Institute where applicant completed education.",
                "where_to_get_gu": "અરજદારે અભ્યાસ કરેલ શાળા.",
                "where_to_get_hi": "शिक्षण संस्थान।",
                "source_authority_en": "Educational Institute", "source_authority_gu": "શૈક્ષણિક સંસ્થા", "source_authority_hi": "शिक्षण संस्थान",
                "sort_order": 1
            },
            {
                "form_id": "f0000000-0000-0000-0000-000000000003",
                "document_type_key": "father_lc",
                "name_en": "Father's School LC (Mandatory for Lineage Verification)",
                "name_gu": "પિતાશ્રીની શાળા L.C. / જન્મ દાખલો (પરંપરાગત જ્ઞાતિ પુરાવો)",
                "name_hi": "पिता का स्कूल एलसी / जन्म प्रमाण",
                "required_level": "mandatory",
                "accepted_formats": ["PDF", "JPG", "PNG"],
                "max_size_mb": 5,
                "why_needed_en": "Government rule mandates father's school record to eliminate discrepancies in caste classification.",
                "why_needed_gu": "સરકારી નિયમ મુજબ પિતાશ્રીની જ્ઞાતિ પુષ્ટિ માટે પિતાની શાળા LC ફરજિયાત છે.",
                "why_needed_hi": "पैतृक जाति सत्यापन हेतु अनिवार्य।",
                "where_to_get_en": "School attended by the applicant's father.",
                "where_to_get_gu": "પિતાશ્રીની પ્રાથમિક અથવા માધ્યમિક શાળા.",
                "where_to_get_hi": "पिता का स्कूल रिकॉर्ड।",
                "source_authority_en": "Educational Institute / District Education Office",
                "source_authority_gu": "શૈક્ષણિક સંસ્થા / જિલ્લા શિક્ષણ અધિકારી",
                "source_authority_hi": "शिक्षा विभाग",
                "sort_order": 2
            },
            {
                "form_id": "f0000000-0000-0000-0000-000000000003",
                "document_type_key": "caste_certificate",
                "name_en": "Original SEBC Caste Certificate Copy",
                "name_gu": "મૂળ SEBC જાતિ પ્રમાણપત્ર નકલ (મામલતદાર જારી)",
                "name_hi": "मूल जाति प्रमाण पत्र",
                "required_level": "mandatory",
                "accepted_formats": ["PDF", "JPG", "PNG"],
                "max_size_mb": 5,
                "why_needed_en": "Non-Creamy Layer is issued on the basis of a previously issued valid SEBC certificate.",
                "why_needed_gu": "નોન-ક્રીમીલેયર દાખલો માત્ર પૂર્વ-જારી SEBC જાતિ પ્રમાણપત્રના આધારે જ મળે છે.",
                "why_needed_hi": "मूल जाति प्रमाण पत्र जिसके आधार पर एनसीएल जारी होगा।",
                "where_to_get_en": "Previously issued certificate by Mamlatdar / Social Welfare Officer.",
                "where_to_get_gu": "પહેલાં મેળવેલ મામલતદાર/સમાજ કલ્યાણ અધિકારીનો જાતિ દાખલો.",
                "where_to_get_hi": "मामलतदार कार्यालय।",
                "source_authority_en": "Social Justice Department / Mamlatdar Office",
                "source_authority_gu": "સામાજિક ન્યાય વિભાગ / મામલતદાર કચેરી",
                "source_authority_hi": "राजस्व विभाग",
                "sort_order": 3
            },
            {
                "form_id": "f0000000-0000-0000-0000-000000000003",
                "document_type_key": "income_proof_3years",
                "name_en": "Parents' Last 3 Years Income Proof (FY 2023-24, 2024-25, 2025-26)",
                "name_gu": "માતા-પિતાની છેલ્લા ૩ વર્ષની વાર્ષિક આવકના પુરાવા (ITR / તલાટી પંચનામું / ફોર્મ-૧૬)",
                "name_hi": "अभिभावक के पिछले 3 वर्षों का आय प्रमाण",
                "required_level": "mandatory",
                "accepted_formats": ["PDF", "JPG", "PNG"],
                "max_size_mb": 5,
                "why_needed_en": "Official Gujarat NCL rules require parents' 3 consecutive years income to test creamy layer exclusion.",
                "why_needed_gu": "ગુજરાત NCL નિયમ મુજબ ક્રીમીલેયર સીલિંગ ચકાસવા છેલ્લા સતત ૩ વર્ષની આવક ફરજિયાત છે.",
                "why_needed_hi": "क्रीमीलेयर सीमा परीक्षण हेतु 3 वर्षों की निरंतर आय।",
                "where_to_get_en": "Income Tax ITR Acknowledgements / Employer Form 16 / Revenue Talati Panchnama.",
                "where_to_get_gu": "છેલ્લા ૩ વર્ષના ITR રિટર્ન / ફોર્મ-૧૬ / તલાટી પંચનામું.",
                "where_to_get_hi": "आयकर रिटर्न / फॉर्म 16 / तलाटी रिपोर्ट।",
                "source_authority_en": "Income Tax Dept / Revenue Talati",
                "source_authority_gu": "ઇન્કમ ટેક્સ / મહેસૂલ તલાટી",
                "source_authority_hi": "आयकर / राजस्व",
                "sort_order": 4
            },

            # Form 4: 7/12 & 8-A Land Records
            {
                "form_id": "f0000000-0000-0000-0000-000000000004",
                "document_type_key": "applicant_id",
                "name_en": "Applicant Photo Identity Card (Aadhaar / Voter ID / PAN)",
                "name_gu": "અરજદારનું ફોટો ઓળખપત્ર (આધાર કાર્ડ / ચૂંટણી કાર્ડ)",
                "name_hi": "आवेदक फोटो पहचान पत्र",
                "required_level": "mandatory",
                "accepted_formats": ["PDF", "JPG", "PNG"],
                "max_size_mb": 5,
                "why_needed_en": "Applicant identity verification for record delivery and DPDP compliance.",
                "why_needed_gu": "રેકોર્ડ ડિલિવરી અને સુરક્ષા નિયમો માટે અરજદારની ઓળખ ચકાસણી.",
                "why_needed_hi": "पहचान एवं वितरण सत्यापन हेतु।",
                "where_to_get_en": "UIDAI / Election Commission / Income Tax Dept.",
                "where_to_get_gu": "અસલ આધાર કાર્ડ / ચૂંટણી કાર્ડ.",
                "where_to_get_hi": "मूल पहचान पत्र।",
                "source_authority_en": "Govt of India / UIDAI",
                "source_authority_gu": "ભારત સરકાર / UIDAI",
                "source_authority_hi": "भारत सरकार",
                "sort_order": 1
            },
            {
                "form_id": "f0000000-0000-0000-0000-000000000004",
                "document_type_key": "old_receipt_or_reference",
                "name_en": "Old Land Tax Receipt / Previous 7/12 Copy (If Available)",
                "name_gu": "જૂની મહેસૂલ પાવતી / અગાઉનો ૭/૧૨ નો ઉતારો (જો ઉપલબ્ધ હોય તો)",
                "name_hi": "पुरानी रसीद / 7-12 नकल",
                "required_level": "optional",
                "accepted_formats": ["PDF", "JPG", "PNG"],
                "max_size_mb": 5,
                "why_needed_en": "Assists operator in quick survey/block number matching in case of village re-surveys.",
                "why_needed_gu": "ગામના રી-સર્વે દરમિયાન સર્વે/બ્લોક નંબરની ઝડપી મેળવણી માટે મદદરૂપ થાય છે.",
                "why_needed_hi": "सर्वे संख्या मिलान में सहायक।",
                "where_to_get_en": "Landholder personal records.",
                "where_to_get_gu": "ખાતેદારના અંગત દસ્તાવેજો / જૂની પાવતી.",
                "where_to_get_hi": "खातेदार का निजी रिकॉर्ड।",
                "source_authority_en": "Landholder", "source_authority_gu": "ખાતેદાર", "source_authority_hi": "खातेदार",
                "sort_order": 2
            },

            # Form 5: Driving / Learner Licence Assistance (Sarathi RTO)
            {
                "form_id": "f0000000-0000-0000-0000-000000000005",
                "document_type_key": "aadhaar_card_mobile_linked",
                "name_en": "Aadhaar Card (Must be Linked with Active Mobile Number)",
                "name_gu": "આધાર કાર્ડ (ચાલુ મોબાઈલ નંબર સાથે લિંક હોવું અનિવાર્ય)",
                "name_hi": "आधार कार्ड (मोबाइल लिंक)",
                "required_level": "mandatory",
                "accepted_formats": ["PDF", "JPG", "PNG"],
                "max_size_mb": 5,
                "why_needed_en": "Required for Parivahan Sarathi 4.0 online facial authentication to take LL test from home.",
                "why_needed_gu": "સારથી પોર્ટલ પર ઘરે બેઠા ઓનલાઇન લર્નિંગ લાયસન્સ ટેસ્ટ આપવા માટે આધાર ફેસ વેરિફિકેશન જરૂરી છે.",
                "why_needed_hi": "सारथी पोर्टल पर ऑनलाइन फेशियल टेस्ट हेतु।",
                "where_to_get_en": "UIDAI e-Aadhaar with OTP-enabled registered mobile.",
                "where_to_get_gu": "UIDAI પોર્ટલ / આધાર કેન્દ્ર પર મોબાઈલ લિંક થયેલ આધાર કાર્ડ.",
                "where_to_get_hi": "यूआईडीएआई पोर्टल।",
                "source_authority_en": "UIDAI", "source_authority_gu": "UIDAI", "source_authority_hi": "UIDAI",
                "sort_order": 1
            },
            {
                "form_id": "f0000000-0000-0000-0000-000000000005",
                "document_type_key": "age_proof_lc",
                "name_en": "Age & Education Proof (School LC / 10th Marksheet / Birth Certificate)",
                "name_gu": "ઉંમર અને શિક્ષણ પુરાવો (શાળા L.C. / ૧૦મી માર્કશીટ / જન્મ પ્રમાણપત્ર)",
                "name_hi": "आयु एवं शिक्षा प्रमाण (10वीं मार्कशीट / स्कूल एलसी)",
                "required_level": "mandatory",
                "accepted_formats": ["PDF", "JPG", "PNG"],
                "max_size_mb": 5,
                "why_needed_en": "RTO verifies minimum age (18+ for LMV/MCWG, 16+ for Gearless) and educational eligibility.",
                "why_needed_gu": "RTO નિયમ મુજબ લાયસન્સ માટે લઘુત્તમ ઉંમર અને શૈક્ષણિક લાયકાત ચકાસવા માટે.",
                "why_needed_hi": "न्यूनतम आयु एवं शैक्षणिक योग्यता सत्यापन।",
                "where_to_get_en": "School Leaving Certificate or Gujarat SSC Board Marksheet.",
                "where_to_get_gu": "શાળા છોડ્યાનું પ્રમાણપત્ર અથવા GSEB/CBSE ૧૦મી બોર્ડ માર્કશીટ.",
                "where_to_get_hi": "स्कूल अथवा शिक्षा बोर्ड मार्कशीट।",
                "source_authority_en": "Educational Board / School",
                "source_authority_gu": "શિક્ષણ બોર્ડ / શાળા",
                "source_authority_hi": "शिक्षा बोर्ड",
                "sort_order": 2
            },
            {
                "form_id": "f0000000-0000-0000-0000-000000000005",
                "document_type_key": "signature_scan",
                "name_en": "Clear Applicant Signature Scan (On Plain White Paper with Black/Blue Ink)",
                "name_gu": "સફેદ કાગળ પર સ્પષ્ટ સહીનો ફોટો (બ્લેક અથવા બ્લુ પેનથી)",
                "name_hi": "हस्ताक्षर (सादे सफेद कागज पर)",
                "required_level": "mandatory",
                "accepted_formats": ["JPG", "PNG"],
                "max_size_mb": 2,
                "why_needed_en": "Embedded directly onto your Smart Card Driving Licence printed by Gujarat RTO.",
                "why_needed_gu": "ગુજરાત RTO દ્વારા જારી થતાં સ્માર્ટ કાર્ડ ડ્રાઇવિંગ લાયસન્સ પર પ્રિન્ટ કરવા માટે.",
                "why_needed_hi": "स्मार्ट कार्ड लाइसेंस पर मुद्रण हेतु।",
                "where_to_get_en": "Sign on plain white A4 paper without lines and take a clean photo.",
                "where_to_get_gu": "કોરા સફેદ કાગળ પર સહી કરીને સ્પષ્ટ ફોટો પાડો.",
                "where_to_get_hi": "सादे सफेद कागज पर हस्ताक्षर।",
                "source_authority_en": "Applicant", "source_authority_gu": "અરજદાર", "source_authority_hi": "आवेदक",
                "sort_order": 3
            },
            {
                "form_id": "f0000000-0000-0000-0000-000000000005",
                "document_type_key": "form_1a_medical",
                "name_en": "Form 1-A Medical Fitness Certificate (By Registered Medical Practitioner)",
                "name_gu": "ફોર્મ ૧-એ મેડિકલ ફિટનેસ સર્ટિફિકેટ (૪૦ વર્ષથી વધુ ઉંમર અથવા કોમર્શિયલ વાહન માટે)",
                "name_hi": "फॉर्म 1-ए मेडिकल फिटनेस प्रमाण पत्र",
                "required_level": "conditional",
                "condition_rule": {"field": "applicant_age", "op": "gte", "value": 40},
                "accepted_formats": ["PDF", "JPG", "PNG"],
                "max_size_mb": 5,
                "why_needed_en": "Statutory requirement under Central Motor Vehicle Rules for applicants aged 40+ or transport licences.",
                "why_needed_gu": "મોટર વ્હીકલ નિયમો મુજબ ૪૦ વર્ષથી વધુ ઉંમરના અરજદારો માટે મેડિકલ સર્ટિફિકેટ જરૂરી છે.",
                "why_needed_hi": "40 वर्ष से अधिक आयु अथवा व्यावसायिक वाहन हेतु।",
                "where_to_get_en": "Any Registered MBBS Medical Practitioner / Govt Hospital Doctor.",
                "where_to_get_gu": "કોઈપણ માન્ય MBBS ડોક્ટર અથવા સરકારી હોસ્પિટલ.",
                "where_to_get_hi": "पंजीकृत चिकित्सक / सरकारी अस्पताल।",
                "source_authority_en": "Registered Medical Practitioner (MBBS)",
                "source_authority_gu": "માન્ય તબીબી અધિકારી (MBBS)",
                "source_authority_hi": "पंजीकृत चिकित्सक",
                "sort_order": 4
            },

            # Form 6: NEET UG Medical Entrance Exam Registration
            {
                "form_id": "f0000000-0000-0000-0000-000000000006",
                "document_type_key": "passport_photo",
                "name_en": "Recent Passport Size Photograph (White Background, 80% Face Coverage, Ears Visible)",
                "name_gu": "તાજેતરનો પાસપોર્ટ ફોટો (સફેદ બેકગ્રાઉન્ડ, ૮૦% ચહેરો સ્પષ્ટ, બંને કાન દેખાવા જરૂરી)",
                "name_hi": "पासपोर्ट फोटो (सफेद पृष्ठभूमि, 80% चेहरा)",
                "required_level": "mandatory",
                "accepted_formats": ["JPG", "JPEG"],
                "max_size_mb": 2,
                "why_needed_en": "Strictly required by NTA for Admit Card printing and AI facial verification at exam centers.",
                "why_needed_gu": "NTA દ્વારા એડમિટ કાર્ડ પ્રિન્ટિંગ અને પરીક્ષા કેન્દ્ર પર AI ફેસ વેરિફિકેશન માટે ફરજિયાત.",
                "why_needed_hi": "एनटीए प्रवेश पत्र एवं परीक्षा केंद्र सत्यापन हेतु।",
                "where_to_get_en": "Photo Studio (Ask for NTA NEET Specification: White Background, name & date printed at bottom).",
                "where_to_get_gu": "ફોટો સ્ટુડિયો (NTA NEET સ્પેસિફિકેશન: સફેદ બેકગ્રાઉન્ડ, નીચે નામ અને તારીખ).",
                "where_to_get_hi": "फोटो स्टूडियो।",
                "source_authority_en": "National Testing Agency (NTA)",
                "source_authority_gu": "નેશનલ ટેસ્ટિંગ એજન્સી (NTA)",
                "source_authority_hi": "एनटीए",
                "sort_order": 1
            },
            {
                "form_id": "f0000000-0000-0000-0000-000000000006",
                "document_type_key": "signature_photo",
                "name_en": "Candidate Signature (Black Ink on Plain White Paper, Running Hand, Not Capital)",
                "name_gu": "ઉમેદવારની સહી (સફેદ કાગળ પર કાળી શાહીથી, રનિંગ હેન્ડમાં - કેપિટલ અક્ષરોમાં નહીં)",
                "name_hi": "उम्मीदवार के हस्ताक्षर (काली स्याही)",
                "required_level": "mandatory",
                "accepted_formats": ["JPG", "JPEG"],
                "max_size_mb": 2,
                "why_needed_en": "Verified against attendance sheet during NEET examination hall entry.",
                "why_needed_gu": "NEET પરીક્ષા હોલમાં હાજરી પત્રક સાથે મેચિંગ કરવા માટે.",
                "why_needed_hi": "परीक्षा कक्ष उपस्थिति पत्रक मिलान हेतु।",
                "where_to_get_en": "Sign on clean white paper with black ballpoint pen.",
                "where_to_get_gu": "કાળી બોલપેનથી સફેદ કાગળ પર સહી કરો.",
                "where_to_get_hi": "सादे सफेद कागज पर हस्ताक्षर।",
                "source_authority_en": "Candidate", "source_authority_gu": "ઉમેદવાર", "source_authority_hi": "उम्मीदवार",
                "sort_order": 2
            },
            {
                "form_id": "f0000000-0000-0000-0000-000000000006",
                "document_type_key": "thumb_fingers_impression",
                "name_en": "Left and Right Hand Fingers and Thumb Impressions (Horizontal on White Paper)",
                "name_gu": "ડાબા અને જમણા બંને હાથની તમામ આંગળીઓ અને અંગૂઠાની છાપ (વાદળી શાહીથી સફેદ કાગળ પર)",
                "name_hi": "दोनों हाथों की उंगलियों एवं अंगूठे के निशान",
                "required_level": "mandatory",
                "accepted_formats": ["JPG", "JPEG", "PDF"],
                "max_size_mb": 2,
                "why_needed_en": "NTA mandatory biometrics standard to prevent impersonation in NEET medical entrance.",
                "why_needed_gu": "મેડિકલ પ્રવેશ પરીક્ષામાં ગેરરીતિ અટકાવવા NTA દ્વારા ફરજિયાત બાયોમેટ્રિક્સ સ્ટાન્ડર્ડ.",
                "why_needed_hi": "बायोमेट्रिक सत्यापन हेतु अनिवार्य।",
                "where_to_get_en": "Use blue stamp pad to imprint all 10 fingers/thumbs horizontally on white paper.",
                "where_to_get_gu": "બ્લુ સ્ટેમ્પ પેડથી ૧૦ આંગળીઓ/અંગૂઠાની છાપ સફેદ કાગળ પર લો.",
                "where_to_get_hi": "स्टैंप पैड द्वारा सादे कागज पर छाप।",
                "source_authority_en": "Candidate / NTA Guidelines",
                "source_authority_gu": "ઉમેદવાર / NTA ગાઈડલાઈન",
                "source_authority_hi": "एनटीए निर्देश",
                "sort_order": 3
            },
            {
                "form_id": "f0000000-0000-0000-0000-000000000006",
                "document_type_key": "class_10_certificate",
                "name_en": "Class 10 Passing Certificate / Marksheet (For Candidate Name & DOB Proof)",
                "name_gu": "ધોરણ ૧૦ પાસિંગ સર્ટિફિકેટ / માર્કશીટ (ઉમેદવારનું નામ અને જન્મતારીખ પ્રમાણિક કરવા)",
                "name_hi": "10वीं उत्तीर्ण प्रमाण पत्र / अंकपत्र",
                "required_level": "mandatory",
                "accepted_formats": ["PDF", "JPG"],
                "max_size_mb": 5,
                "why_needed_en": "NTA considers Class 10 certificate as the ultimate legal baseline for Name, Father's Name and DOB.",
                "why_needed_gu": "NTA દ્વારા ઉમેદવારનું નામ, પિતાનું નામ અને જન્મ તારીખની સચોટ ચકાસણી માટે.",
                "why_needed_hi": "नाम एवं जन्म तिथि प्रमाण हेतु।",
                "where_to_get_en": "GSEB / CBSE / ICSE Education Board Certificate or DigiLocker verified copy.",
                "where_to_get_gu": "શિક્ષણ બોર્ડ (GSEB/CBSE) પ્રમાણપત્ર અથવા DigiLocker વેરિફાઈડ નકલ.",
                "where_to_get_hi": "शिक्षा बोर्ड अथवा डिजिलॉकर।",
                "source_authority_en": "Secondary Education Board",
                "source_authority_gu": "માધ્યમિક શિક્ષણ બોર્ડ",
                "source_authority_hi": "माध्यमिक शिक्षा बोर्ड",
                "sort_order": 4
            },
            {
                "form_id": "f0000000-0000-0000-0000-000000000006",
                "document_type_key": "category_certificate_nta",
                "name_en": "Category Certificate (SC / ST / OBC-NCL Central List / Gen-EWS as per NTA format)",
                "name_gu": "કેટેગરી પ્રમાણપત્ર (SC / ST / કેન્દ્રીય OBC-NCL / Gen-EWS - NTA ફોર્મેટ મુજબ)",
                "name_hi": "आरक्षण श्रेणी प्रमाण पत्र (SC/ST/OBC-NCL/EWS)",
                "required_level": "conditional",
                "condition_rule": {"field": "category", "op": "in", "values": ["gen_ews", "obc_ncl", "sc", "st"]},
                "accepted_formats": ["PDF"],
                "max_size_mb": 5,
                "why_needed_en": "Mandatory for claiming All India Quota (AIQ) 15% and central university reserved seats in MBBS/BDS.",
                "why_needed_gu": "MBBS/BDS માં અખિલ ભારતીય ૧૫% ક્વોટા અને કેન્દ્રીય યુનિવર્સિટી અનામત બેઠકો મેળવવા માટે.",
                "why_needed_hi": "अखिल भारतीय कोटा आरक्षण लाभ हेतु।",
                "where_to_get_en": "Competent Revenue Authority / Mamlatdar / Sub-Divisional Magistrate.",
                "where_to_get_gu": "મામલતદાર / SDM કચેરી દ્વારા જારી કેન્દ્રીય યાદી મુજબનું પ્રમાણપત્ર.",
                "where_to_get_hi": "सक्षम राजस्व अधिकारी।",
                "source_authority_en": "Competent Revenue Authority",
                "source_authority_gu": "સક્ષમ મહેસૂલી સત્તાધિકારી",
                "source_authority_hi": "सक्षम राजस्व अधिकारी",
                "sort_order": 5
            }
        ]

        for doc in service_docs_data:
            doc_id = str(uuid.uuid4())
            self.service_documents[doc_id] = {
                "id": doc_id,
                **doc,
                "is_active": True,
                "created_at": datetime.now(timezone.utc)
            }

        # 9. Form Fields Definitions for all 6 Services
        # Form 1: Income Certificate Fields
        form_1_id = "f0000000-0000-0000-0000-000000000001"
        income_fields = [
            {"field_key": "applicant_name", "step_section": "applicant", "field_type": "text", "label_gu": "અરજદારનું પૂરું નામ", "label_hi": "आवेदक का पूरा नाम", "label_en": "Full Name of Applicant", "placeholder_gu": "જેમ આધાર કાર્ડમાં છે તેમ", "placeholder_hi": "जैसा आधार कार्ड में है", "placeholder_en": "As per Aadhaar card", "is_required": True, "sort_order": 1},
            {"field_key": "father_husband_name", "step_section": "applicant", "field_type": "text", "label_gu": "પિતા / પતિનું નામ", "label_hi": "पिता / पति का नाम", "label_en": "Father / Husband Name", "placeholder_gu": "પિતા અથવા પતિનું નામ", "placeholder_hi": "पिता / पति का नाम", "placeholder_en": "Father or husband name", "is_required": True, "sort_order": 2},
            {"field_key": "mother_name", "step_section": "applicant", "field_type": "text", "label_gu": "માતાનું નામ", "label_hi": "माता का नाम", "label_en": "Mother's Name", "placeholder_gu": "માતાનું પૂરું નામ", "placeholder_hi": "माता का नाम", "placeholder_en": "Mother's full name", "is_required": True, "sort_order": 3},
            {"field_key": "gender", "step_section": "applicant", "field_type": "select", "label_gu": "જાતિ / લિંગ", "label_hi": "लिंग", "label_en": "Gender", "options_json": [{"value": "male", "label_gu": "પુરુષ", "label_hi": "पुरुष", "label_en": "Male"}, {"value": "female", "label_gu": "સ્ત્રી", "label_hi": "महिला", "label_en": "Female"}, {"value": "other", "label_gu": "અન્ય", "label_hi": "अन्य", "label_en": "Other"}], "is_required": True, "sort_order": 4},
            {"field_key": "dob", "step_section": "applicant", "field_type": "date", "label_gu": "જન્મ તારીખ", "label_hi": "जन्म तिथि", "label_en": "Date of Birth", "is_required": True, "sort_order": 5},
            {"field_key": "mobile_number", "step_section": "applicant", "field_type": "number", "label_gu": "મોબાઈલ નંબર", "label_hi": "मोबाइल नंबर", "label_en": "Mobile Number", "placeholder_gu": "10 અંકનો મોબાઈલ નંબર", "placeholder_hi": "10 अंकों का मोबाइल", "placeholder_en": "10-digit mobile number", "is_required": True, "sort_order": 6},
            {"field_key": "aadhaar_number", "step_section": "applicant", "field_type": "number", "label_gu": "આધાર કાર્ડ નંબર", "label_hi": "आधार कार्ड नंबर", "label_en": "Aadhaar Card Number", "placeholder_gu": "12 અંકનો આધાર નંબર", "placeholder_hi": "12 अंकों का आधार", "placeholder_en": "12-digit Aadhaar number", "is_required": True, "sort_order": 7},
            {"field_key": "caste_category", "step_section": "applicant", "field_type": "select", "label_gu": "સામાજિક કેટેગરી", "label_hi": "सामाजिक श्रेणी", "label_en": "Social Category", "options_json": [{"value": "general", "label_gu": "જનરલ (General)", "label_hi": "सामान्य", "label_en": "General"}, {"value": "sebc", "label_gu": "SEBC / OBC (ઓબીસી)", "label_hi": "ओबीसी", "label_en": "SEBC / OBC"}, {"value": "sc", "label_gu": "SC (અનુસૂચિત જાતિ)", "label_hi": "एससी", "label_en": "Scheduled Caste (SC)"}, {"value": "st", "label_gu": "ST (અનુસૂચિત જનજાતિ)", "label_hi": "एसटी", "label_en": "Scheduled Tribe (ST)"}, {"value": "ews", "label_gu": "EWS (બિન-અનામત નબળા વર્ગ)", "label_hi": "ईडब्ल्यूएस", "label_en": "EWS"}], "is_required": True, "sort_order": 8},

            # Address Section
            {"field_key": "house_flat", "step_section": "address", "field_type": "text", "label_gu": "મકાન / ફ્લેટ / બ્લોક નં.", "label_hi": "मकान / फ्लैट संख्या", "label_en": "House / Flat / Block No.", "placeholder_gu": "દા.ત. B-402", "placeholder_hi": "उदा. B-402", "placeholder_en": "e.g. B-402", "is_required": True, "sort_order": 9},
            {"field_key": "building_society", "step_section": "address", "field_type": "text", "label_gu": "સોસાયટી / એપાર્ટમેન્ટનું નામ", "label_hi": "सोसायटी / भवन का नाम", "label_en": "Building / Society Name", "placeholder_gu": "દા.ત. રાધે શ્યામ રેસીડેન્સી", "placeholder_hi": "सोसायटी का नाम", "placeholder_en": "e.g. Radhe Shyam Residency", "is_required": True, "sort_order": 10},
            {"field_key": "street_road", "step_section": "address", "field_type": "text", "label_gu": "શેરી / રોડ / લેન્ડમાર્ક", "label_hi": "सड़क / मार्ग / लैंडमार्क", "label_en": "Street / Road / Landmark", "placeholder_gu": "દા.ત. એસ.પી. રિંગ રોડ પાસે", "placeholder_hi": "सड़क / लैंडमार्क", "placeholder_en": "e.g. Near SP Ring Road", "is_required": True, "sort_order": 11},
            {"field_key": "district", "step_section": "address", "field_type": "select", "label_gu": "જિલ્લો", "label_hi": "जिला", "label_en": "District", "options_json": [{"value": k, "label_gu": v["name_gu"], "label_hi": v["name_hi"], "label_en": v["name_en"]} for k, v in gujarat_geo.items()], "is_required": True, "sort_order": 12},
            {"field_key": "taluka", "step_section": "address", "field_type": "text", "label_gu": "તાલુકો", "label_hi": "तालुका", "label_en": "Taluka / Tehsil", "placeholder_gu": "તાલુકાનું નામ લખો", "placeholder_hi": "तालुका का नाम", "placeholder_en": "Taluka name", "is_required": True, "sort_order": 13},
            {"field_key": "village_city", "step_section": "address", "field_type": "text", "label_gu": "ગામ / શહેર", "label_hi": "गांव / शहर", "label_en": "Village / City", "placeholder_gu": "ગામ અથવા શહેરનું નામ", "placeholder_hi": "गांव या शहर", "placeholder_en": "Village or City", "is_required": True, "sort_order": 14},
            {"field_key": "pincode", "step_section": "address", "field_type": "number", "label_gu": "પીનકોડ", "label_hi": "पिनकोड", "label_en": "Pincode (6 digits)", "placeholder_gu": "6 અંકનો પીનકોડ", "placeholder_hi": "6 अंकों का पिनकोड", "placeholder_en": "6-digit pincode", "is_required": True, "sort_order": 15},
            {"field_key": "residence_years", "step_section": "address", "field_type": "number", "label_gu": "ગુજરાતમાં કેટલા વર્ષથી વસવાટ કરો છો?", "label_hi": "गुजरात में कितने वर्षों से निवास?", "label_en": "Years of Residence in Gujarat", "placeholder_gu": "દા.ત. 15", "placeholder_hi": "उदा. 15", "placeholder_en": "e.g. 15", "is_required": True, "sort_order": 16},

            # Family & Income Sources Section
            {"field_key": "occupation_primary", "step_section": "family_income", "field_type": "select", "label_gu": "મુખ્ય વ્યવસાય", "label_hi": "मुख्य व्यवसाय", "label_en": "Primary Occupation / Profession", "options_json": [{"value": "agriculture", "label_gu": "ખેતી / પશુપાલન", "label_hi": "कृषि / पशुपालन", "label_en": "Agriculture / Farming"}, {"value": "labor", "label_gu": "મજૂરી કામ / છૂટક કામ", "label_hi": "मजदूरी / दैनिक वेतन", "label_en": "Daily Wage / Labor"}, {"value": "private_job", "label_gu": "ખાનગી નોકરી", "label_hi": "निजी नौकरी", "label_en": "Private Employment"}, {"value": "gov_job", "label_gu": "સરકારી નોકરી", "label_hi": "सरकारी नौकरी", "label_en": "Government Employee"}, {"value": "business", "label_gu": "વેપાર / નાનો ધંધો", "label_hi": "व्यापार / लघु उद्योग", "label_en": "Small Business / Trade"}, {"value": "pension", "label_gu": "પેન્શનર", "label_hi": "पेंशनभोगी", "label_en": "Pensioner"}, {"value": "other", "label_gu": "અન્ય", "label_hi": "अन्य", "label_en": "Other"}], "is_required": True, "sort_order": 17},
            {"field_key": "income_salary", "step_section": "family_income", "field_type": "number", "label_gu": "પગારમાંથી વાર્ષિક આવક (રૂ.)", "label_hi": "वेतन से वार्षिक आय (रु.)", "label_en": "Annual Income from Salary (INR)", "placeholder_gu": "0 જો ન હોય તો", "placeholder_hi": "0 यदि नहीं है", "placeholder_en": "0 if none", "is_required": False, "sort_order": 18},
            {"field_key": "income_agriculture", "step_section": "family_income", "field_type": "number", "label_gu": "ખેતી / પશુપાલનમાંથી વાર્ષિક આવક (રૂ.)", "label_hi": "कृषि से वार्षिक आय (रु.)", "label_en": "Annual Income from Agriculture (INR)", "placeholder_gu": "0 જો ન હોય તો", "placeholder_hi": "0 यदि नहीं है", "placeholder_en": "0 if none", "is_required": False, "sort_order": 19},
            {"field_key": "income_business", "step_section": "family_income", "field_type": "number", "label_gu": "વેપાર / ધંધામાંથી વાર્ષિક આવક (રૂ.)", "label_hi": "व्यापार से वार्षिक आय (रु.)", "label_en": "Annual Income from Business (INR)", "placeholder_gu": "0 જો ન હોય તો", "placeholder_hi": "0 यदि नहीं है", "placeholder_en": "0 if none", "is_required": False, "sort_order": 20},
            {"field_key": "income_other", "step_section": "family_income", "field_type": "number", "label_gu": "મજૂરી / પેન્શન / અન્ય સ્ત્રોતમાંથી આવક (રૂ.)", "label_hi": "मजदूरी / अन्य आय (रु.)", "label_en": "Income from Labor / Pension / Other (INR)", "placeholder_gu": "0 જો ન હોય તો", "placeholder_hi": "0 यदि नहीं है", "placeholder_en": "0 if none", "is_required": False, "sort_order": 21},
            {"field_key": "annual_income", "step_section": "family_income", "field_type": "number", "label_gu": "કુલ વાર્ષિક આવક (રૂપિયામાં)", "label_hi": "कुल वार्षिक आय (रुपये में)", "label_en": "Total Annual Family Income (INR)", "placeholder_gu": "દા.ત. 120000", "placeholder_hi": "उदा. 120000", "placeholder_en": "e.g. 120000", "is_required": True, "sort_order": 22},
            {"field_key": "financial_year", "step_section": "family_income", "field_type": "select", "label_gu": "નાણાકીય વર્ષ", "label_hi": "वित्तीय वर्ष", "label_en": "Financial Year", "options_json": [{"value": "2025-2026", "label_gu": "૨૦૨૫-૨૦૨૬ (ચાલુ વર્ષ)", "label_hi": "2025-2026 (चालू वर्ष)", "label_en": "2025-2026 (Current FY)"}, {"value": "2024-2025", "label_gu": "૨૦૨૪-૨૦૨૫", "label_hi": "2024-2025", "label_en": "2024-2025"}], "is_required": True, "sort_order": 23},
            {"field_key": "income_purpose", "step_section": "family_income", "field_type": "select", "label_gu": "દાખલાનો હેતુ (ક્યાં રજૂ કરવાનો છે)", "label_hi": "प्रमाण पत्र का उद्देश्य", "label_en": "Purpose of Certificate", "options_json": [{"value": "scholarship", "label_gu": "શાળા / કોલેજ સ્કોલરશીપ માટે", "label_hi": "छात्रवृत्ति हेतु", "label_en": "School / College Scholarship"}, {"value": "rte_admission", "label_gu": "RTE શાળા પ્રવેશ માટે", "label_hi": "आरटीई प्रवेश हेतु", "label_en": "RTE School Admission"}, {"value": "ayushman_card", "label_gu": "આયુષ્માન ભારત કાર્ડ", "label_hi": "आयुष्मान भारत कार्ड हेतु", "label_en": "Ayushman Bharat / Health Scheme"}, {"value": "fee_waiver", "label_gu": "કોલેજ ફી માફી યોજના", "label_hi": "कॉलेज शुल्क माफी", "label_en": "College Tuition Fee Waiver (MYSY)"}, {"value": "general_use", "label_gu": "સામાન્ય સરકારી કામકાજ", "label_hi": "सामान्य उपयोग", "label_en": "General Government Purpose"}], "is_required": True, "sort_order": 24},
            {"field_key": "family_member_count", "step_section": "family_income", "field_type": "number", "label_gu": "કુટુંબના કુલ સભ્યોની સંખ્યા", "label_hi": "परिवार के कुल सदस्यों की संख्या", "label_en": "Total Family Members Count", "placeholder_gu": "દા.ત. 4", "placeholder_hi": "उदा. 4", "placeholder_en": "e.g. 4", "is_required": True, "sort_order": 25},
            {"field_key": "ration_card_no", "step_section": "family_income", "field_type": "text", "label_gu": "રેશન કાર્ડ નંબર", "label_hi": "राशन कार्ड नंबर", "label_en": "Ration Card Number", "placeholder_gu": "રેશન કાર્ડ નંબર લખો", "placeholder_hi": "राशन कार्ड संख्या", "placeholder_en": "Ration Card Number", "is_required": True, "sort_order": 26}
        ]
        for field in income_fields:
            field_id = str(uuid.uuid4())
            self.form_fields[field_id] = {"id": field_id, "form_id": form_1_id, **field, "created_at": datetime.now(timezone.utc), "updated_at": datetime.now(timezone.utc)}

        # Form 2: EWS Certificate Fields
        form_2_id = "f0000000-0000-0000-0000-000000000002"
        ews_fields = [
            {"field_key": "applicant_name", "step_section": "applicant", "field_type": "text", "label_gu": "અરજદારનું પૂરું નામ", "label_hi": "आवेदक का पूरा नाम", "label_en": "Applicant Full Name", "placeholder_gu": "આધાર મુજબ નામ", "placeholder_hi": "आधार अनुसार नाम", "placeholder_en": "Name as per Aadhaar", "is_required": True, "sort_order": 1},
            {"field_key": "father_husband_name", "step_section": "applicant", "field_type": "text", "label_gu": "પિતા / પતિનું નામ", "label_hi": "पिता / पति का नाम", "label_en": "Father / Husband Name", "is_required": True, "sort_order": 2},
            {"field_key": "mother_name", "step_section": "applicant", "field_type": "text", "label_gu": "માતાનું નામ", "label_hi": "माता का नाम", "label_en": "Mother's Name", "is_required": True, "sort_order": 3},
            {"field_key": "gender", "step_section": "applicant", "field_type": "select", "label_gu": "લિંગ / જાતિ", "label_hi": "लिंग", "label_en": "Gender", "options_json": [{"value": "male", "label_gu": "પુરુષ", "label_hi": "पुरुष", "label_en": "Male"}, {"value": "female", "label_gu": "સ્ત્રી", "label_hi": "महिला", "label_en": "Female"}, {"value": "other", "label_gu": "અન્ય", "label_hi": "अन्य", "label_en": "Other"}], "is_required": True, "sort_order": 4},
            {"field_key": "dob", "step_section": "applicant", "field_type": "date", "label_gu": "જન્મ તારીખ", "label_hi": "जन्म तिथि", "label_en": "Date of Birth", "is_required": True, "sort_order": 5},
            {"field_key": "mobile_number", "step_section": "applicant", "field_type": "number", "label_gu": "મોબાઈલ નંબર", "label_hi": "मोबाइल नंबर", "label_en": "Mobile Number", "placeholder_gu": "10 અંકનો મોબાઈલ નંબર", "placeholder_hi": "10 अंकों का मोबाइल", "placeholder_en": "10-digit mobile number", "is_required": True, "sort_order": 6},
            {"field_key": "aadhaar_number", "step_section": "applicant", "field_type": "number", "label_gu": "આધાર કાર્ડ નંબર", "label_hi": "आधार कार्ड नंबर", "label_en": "Aadhaar Card Number", "is_required": True, "sort_order": 7},
            {"field_key": "caste_subcaste", "step_section": "applicant", "field_type": "text", "label_gu": "જ્ઞાતિ અને પેટા-જ્ઞાતિ (બિન-અનામત / General Open)", "label_hi": "जाति एवं उप-जाति (सामान्य)", "label_en": "Caste & Sub-Caste (General Open Category)", "placeholder_gu": "દા.ત. પાટીદાર, બ્રાહ્મણ, રાજપૂત, જૈન, લોહાણા", "placeholder_hi": "उदा. पाटीदार, ब्राह्मण, राजपूत", "placeholder_en": "e.g. Patidar, Brahmin, Rajput, Jain, Lohana", "is_required": True, "sort_order": 8},
            {"field_key": "religion", "step_section": "applicant", "field_type": "select", "label_gu": "ધર્મ", "label_hi": "धर्म", "label_en": "Religion", "options_json": [{"value": "hindu", "label_gu": "હિન્દુ", "label_hi": "हिन्दू", "label_en": "Hindu"}, {"value": "jain", "label_gu": "જૈન", "label_hi": "जैन", "label_en": "Jain"}, {"value": "muslim", "label_gu": "મુસ્લિમ", "label_hi": "मुस्लिम", "label_en": "Muslim"}, {"value": "christian", "label_gu": "ખ્રિસ્તી", "label_hi": "ईसाई", "label_en": "Christian"}, {"value": "sikh", "label_gu": "શીખ", "label_hi": "सिख", "label_en": "Sikh"}, {"value": "other", "label_gu": "અન્ય", "label_hi": "अन्य", "label_en": "Other"}], "is_required": True, "sort_order": 9},

            # Address Section
            {"field_key": "house_flat", "step_section": "address", "field_type": "text", "label_gu": "મકાન / ફ્લેટ નં.", "label_hi": "मकान / फ्लैट संख्या", "label_en": "House / Flat No.", "is_required": True, "sort_order": 10},
            {"field_key": "building_society", "step_section": "address", "field_type": "text", "label_gu": "સોસાયટી / એપાર્ટમેન્ટ", "label_hi": "सोसायटी / भवन", "label_en": "Society / Apartment", "is_required": True, "sort_order": 11},
            {"field_key": "district", "step_section": "address", "field_type": "select", "label_gu": "જિલ્લો", "label_hi": "जिला", "label_en": "District", "options_json": [{"value": k, "label_gu": v["name_gu"], "label_hi": v["name_hi"], "label_en": v["name_en"]} for k, v in gujarat_geo.items()], "is_required": True, "sort_order": 12},
            {"field_key": "taluka", "step_section": "address", "field_type": "text", "label_gu": "તાલુકો", "label_hi": "तालुका", "label_en": "Taluka", "is_required": True, "sort_order": 13},
            {"field_key": "village_city", "step_section": "address", "field_type": "text", "label_gu": "ગામ / શહેર", "label_hi": "गांव / शहर", "label_en": "Village / City", "is_required": True, "sort_order": 14},
            {"field_key": "pincode", "step_section": "address", "field_type": "number", "label_gu": "પીનકોડ", "label_hi": "पिनकोड", "label_en": "Pincode", "is_required": True, "sort_order": 15},

            # Gross Income Section
            {"field_key": "family_gross_income", "step_section": "family_income", "field_type": "number", "label_gu": "કુટુંબની કુલ વાર્ષિક આવક (રૂ. ૮ લાખથી ઓછી હોવી જરૂરી)", "label_hi": "पारिवारिक कुल वार्षिक आय (< 8 लाख)", "label_en": "Family Gross Annual Income (Must be ≤ ₹8 Lakhs INR)", "placeholder_gu": "દા.ત. 350000", "placeholder_hi": "उदा. 350000", "placeholder_en": "e.g. 350000", "is_required": True, "sort_order": 16},
            {"field_key": "income_sources_summary", "step_section": "family_income", "field_type": "text", "label_gu": "આવકના મુખ્ય સ્ત્રોત (પગાર/ખેતી/વેપાર)", "label_hi": "आय के मुख्य स्रोत", "label_en": "Primary Income Sources Breakdown", "placeholder_gu": "દા.ત. ખાનગી નોકરી + ખેતી", "placeholder_hi": "उदा. वेतन + कृषि", "placeholder_en": "e.g. Salary + Farming", "is_required": True, "sort_order": 17},

            # Property & Asset Limit Assessment Section
            {"field_key": "owns_agricultural_land", "step_section": "property_assets", "field_type": "select", "label_gu": "કુટુંબ ખેતીની જમીન ધરાવે છે?", "label_hi": "क्या परिवार कृषि भूमि धारक है?", "label_en": "Does family own agricultural land?", "options_json": [{"value": "no", "label_gu": "ના (જમીન નથી)", "label_hi": "नहीं", "label_en": "No (No Agricultural Land)"}, {"value": "yes", "label_gu": "હા (૫ એકરથી ઓછી જમીન છે)", "label_hi": "हाँ (5 एकड़ से कम)", "label_en": "Yes (Land is below 5 Acres)"}], "is_required": True, "sort_order": 18},
            {"field_key": "agricultural_land_acres", "step_section": "property_assets", "field_type": "number", "label_gu": "ખેતીની જમીનનું ક્ષેત્રફળ (એકરમાં - મર્યાદા ૫ એકર)", "label_hi": "कृषि भूमि (एकड़ में - अधिकतम 5 एकड़)", "label_en": "Total Agricultural Land (In Acres - Limit: < 5 Acres)", "placeholder_gu": "0 જો ન હોય તો", "placeholder_hi": "0 यदि नहीं है", "placeholder_en": "Enter 0 if none", "is_required": False, "sort_order": 19},
            {"field_key": "residential_flat_sqft", "step_section": "property_assets", "field_type": "number", "label_gu": "રહેણાંક ફ્લેટનું ક્ષેત્રફળ (ચોરસ ફૂટમાં - મર્યાદા ૧૦૦૦ ચો.ફૂટ)", "label_hi": "आवासीय फ्लैट क्षेत्रफल (वर्ग फुट - अधिकतम 1000)", "label_en": "Residential Flat Area (Sq Ft - Limit: < 1000 Sq Ft)", "placeholder_gu": "0 જો ન હોય તો", "placeholder_hi": "0 यदि नहीं है", "placeholder_en": "Enter 0 if none", "is_required": False, "sort_order": 20},
            {"field_key": "residential_plot_sqyards", "step_section": "property_assets", "field_type": "number", "label_gu": "રહેણાંક પ્લોટ ક્ષેત્રફળ (ચોરસ વાર - નગરપાલિકામાં ૧૦૦ ચો.વાર / બહાર ૨૦૦ ચો.વાર)", "label_hi": "आवासीय भूखंड (वर्ग गज)", "label_en": "Residential Plot Area (In Sq Yards - Limit: < 100/200 Sq Yards)", "placeholder_gu": "0 જો ન હોય તો", "placeholder_hi": "0 यदि नहीं है", "placeholder_en": "Enter 0 if none", "is_required": False, "sort_order": 21},
            {"field_key": "ews_purpose", "step_section": "property_assets", "field_type": "select", "label_gu": "EWS પ્રમાણપત્રનો હેતુ", "label_hi": "प्रमाण पत्र का प्रयोजन", "label_en": "Purpose of EWS Certificate", "options_json": [{"value": "state_admission", "label_gu": "ગુજરાત રાજ્ય ઉચ્ચ શિક્ષણ પ્રવેશ (૧૦% ક્વોટા)", "label_hi": "राज्य उच्च शिक्षा प्रवेश", "label_en": "Gujarat State Higher Education Admission"}, {"value": "state_job", "label_gu": "ગુજરાત સરકારી ભરતી (GPSC / ગૌણ સેવા)", "label_hi": "राज्य सरकारी नौकरी", "label_en": "Gujarat Govt Recruitment"}, {"value": "central_admission_job", "label_gu": "કેન્દ્ર સરકાર / NEET / JEE / UPSC ક્વોટા", "label_hi": "केंद्र सरकार / NEET / UPSC", "label_en": "Central Govt / NEET / JEE / UPSC"}], "is_required": True, "sort_order": 22}
        ]
        for field in ews_fields:
            field_id = str(uuid.uuid4())
            self.form_fields[field_id] = {"id": field_id, "form_id": form_2_id, **field, "created_at": datetime.now(timezone.utc), "updated_at": datetime.now(timezone.utc)}

        # Form 3: NCL / SEBC Certificate Fields
        form_3_id = "f0000000-0000-0000-0000-000000000003"
        ncl_fields = [
            {"field_key": "applicant_name", "step_section": "applicant", "field_type": "text", "label_gu": "અરજદારનું પૂરું નામ", "label_hi": "आवेदक का पूरा नाम", "label_en": "Applicant Full Name", "is_required": True, "sort_order": 1},
            {"field_key": "father_name", "step_section": "applicant", "field_type": "text", "label_gu": "પિતાનું નામ", "label_hi": "पिता का नाम", "label_en": "Father's Full Name", "is_required": True, "sort_order": 2},
            {"field_key": "mother_name", "step_section": "applicant", "field_type": "text", "label_gu": "માતાનું નામ", "label_hi": "माता का नाम", "label_en": "Mother's Name", "is_required": True, "sort_order": 3},
            {"field_key": "gender", "step_section": "applicant", "field_type": "select", "label_gu": "લિંગ", "label_hi": "लिंग", "label_en": "Gender", "options_json": [{"value": "male", "label_gu": "પુરુષ", "label_hi": "पुरुष", "label_en": "Male"}, {"value": "female", "label_gu": "સ્ત્રી", "label_hi": "महिला", "label_en": "Female"}], "is_required": True, "sort_order": 4},
            {"field_key": "dob", "step_section": "applicant", "field_type": "date", "label_gu": "જન્મ તારીખ", "label_hi": "जन्म तिथि", "label_en": "Date of Birth", "is_required": True, "sort_order": 5},
            {"field_key": "mobile_number", "step_section": "applicant", "field_type": "number", "label_gu": "મોબાઈલ નંબર", "label_hi": "मोबाइल नंबर", "label_en": "Mobile Number", "is_required": True, "sort_order": 6},
            {"field_key": "aadhaar_number", "step_section": "applicant", "field_type": "number", "label_gu": "આધાર કાર્ડ નંબર", "label_hi": "आधार कार्ड नंबर", "label_en": "Aadhaar Card Number", "is_required": True, "sort_order": 7},
            {"field_key": "sebc_caste_name", "step_section": "applicant", "field_type": "text", "label_gu": "SEBC / OBC જ્ઞાતિનું નામ (સરકારી ગેઝેટ મુજબ)", "label_hi": "ओबीसी / एसईबीसी जाति का नाम", "label_en": "SEBC / OBC Caste Name (As per Gujarat Govt Gazette)", "placeholder_gu": "દા.ત. પ્રજાપતિ, દરજી, પંચાલ/લુહાર, મોઢ ઘાંચી, ઠાકોર, કોળી, આહીર/ભરવાડ", "placeholder_hi": "उदा. प्रजापति, दरजी, लुहार", "placeholder_en": "e.g. Prajapati, Darji, Panchal/Luhar, Modh Ghanchi, Thakor, Koli", "is_required": True, "sort_order": 8},
            {"field_key": "caste_certificate_no", "step_section": "applicant", "field_type": "text", "label_gu": "મૂળ SEBC જાતિ પ્રમાણપત્ર નંબર", "label_hi": "मूल जाति प्रमाण पत्र संख्या", "label_en": "Original SEBC Caste Certificate Number", "placeholder_gu": "દા.ત. SEBC/2021/89412", "placeholder_hi": "उदा. SEBC/2021/89412", "placeholder_en": "e.g. SEBC/2021/89412", "is_required": True, "sort_order": 9},
            {"field_key": "caste_cert_issue_date", "step_section": "applicant", "field_type": "date", "label_gu": "જાતિ પ્રમાણપત્ર મળ્યાની તારીખ", "label_hi": "जाति प्रमाण पत्र जारी तिथि", "label_en": "Caste Certificate Issue Date", "is_required": True, "sort_order": 10},
            {"field_key": "caste_cert_issuing_office", "step_section": "applicant", "field_type": "text", "label_gu": "પ્રમાણપત્ર આપનાર કચેરી", "label_hi": "जारीकर्ता कार्यालय", "label_en": "Issuing Authority / Mamlatdar Office", "placeholder_gu": "દા.ત. મામલતદાર કચેરી દસ્ક્રોઈ", "placeholder_hi": "मामलतदार कार्यालय", "placeholder_en": "e.g. Mamlatdar Office Daskroi", "is_required": True, "sort_order": 11},

            # Address & Parents Section
            {"field_key": "district", "step_section": "address", "field_type": "select", "label_gu": "જિલ્લો", "label_hi": "जिला", "label_en": "District", "options_json": [{"value": k, "label_gu": v["name_gu"], "label_hi": v["name_hi"], "label_en": v["name_en"]} for k, v in gujarat_geo.items()], "is_required": True, "sort_order": 12},
            {"field_key": "taluka", "step_section": "address", "field_type": "text", "label_gu": "તાલુકો", "label_hi": "तालुका", "label_en": "Taluka", "is_required": True, "sort_order": 13},
            {"field_key": "village_city", "step_section": "address", "field_type": "text", "label_gu": "ગામ / શહેર", "label_hi": "गांव / शहर", "label_en": "Village / City", "is_required": True, "sort_order": 14},
            {"field_key": "residential_address", "step_section": "address", "field_type": "textarea", "label_gu": "રહેઠાણનું સરનામું", "label_hi": "आवासीय पता", "label_en": "Residential Address", "is_required": True, "sort_order": 15},
            {"field_key": "pincode", "step_section": "address", "field_type": "number", "label_gu": "પીનકોડ", "label_hi": "पिनकोड", "label_en": "Pincode", "is_required": True, "sort_order": 16},
            {"field_key": "parents_govt_designation", "step_section": "address", "field_type": "select", "label_gu": "માતા-પિતાનો સરકારી હોદ્દો (ક્રીમીલેયર ક્લાસિફિકેશન)", "label_hi": "माता-पिता का सरकारी पद", "label_en": "Parents Government Employment Status", "options_json": [{"value": "none", "label_gu": "બિન-સરકારી / ખેતી / મજૂરી / ખાનગી નોકરી / વેપાર", "label_hi": "गैर-सरकारी / निजी / कृषि", "label_en": "Non-Government / Private / Business / Agriculture"}, {"value": "class_4", "label_gu": "વર્ગ-૪ / પટાવાળા / ડ્રાઈવર / સહાયક", "label_hi": "वर्ग-4 कर्मचारी", "label_en": "Class-IV Employee"}, {"value": "class_3", "label_gu": "વર્ગ-૩ / ક્લાર્ક / શિક્ષક / તલાટી", "label_hi": "वर्ग-3 कर्मचारी", "label_en": "Class-III Employee"}, {"value": "class_1_2", "label_gu": "વર્ગ-૧ અથવા વર્ગ-૨ ગેઝેટેડ અધિકારી (IAS/GAS/PI વગેરે)", "label_hi": "वर्ग-1 या 2 अधिकारी", "label_en": "Class-I / Class-II Gazetted Officer"}], "is_required": True, "sort_order": 17},

            # 3-Year Income History Section (Gujarat Official Mandate)
            {"field_key": "income_year_1", "step_section": "three_year_income", "field_type": "number", "label_gu": "નાણાકીય વર્ષ ૨૦૨૩-૨૪ ની વાર્ષિક આવક (રૂ.)", "label_hi": "वर्ष 2023-24 की आय (रु.)", "label_en": "Year 1 Income (FY 2023-24 in INR)", "placeholder_gu": "દા.ત. 110000", "placeholder_hi": "उदा. 110000", "placeholder_en": "e.g. 110000", "is_required": True, "sort_order": 18},
            {"field_key": "income_year_2", "step_section": "three_year_income", "field_type": "number", "label_gu": "નાણાકીય વર્ષ ૨૦૨૪-૨૫ ની વાર્ષિક આવક (રૂ.)", "label_hi": "वर्ष 2024-25 की आय (रु.)", "label_en": "Year 2 Income (FY 2024-25 in INR)", "placeholder_gu": "દા.ત. 115000", "placeholder_hi": "उदा. 115000", "placeholder_en": "e.g. 115000", "is_required": True, "sort_order": 19},
            {"field_key": "income_year_3", "step_section": "three_year_income", "field_type": "number", "label_gu": "નાણાકીય વર્ષ ૨૦૨૫-૨૬ ની વાર્ષિક આવક (રૂ.)", "label_hi": "वर्ष 2025-26 की आय (रु.)", "label_en": "Year 3 Income (FY 2025-26 in INR)", "placeholder_gu": "દા.ત. 120000", "placeholder_hi": "उदा. 120000", "placeholder_en": "e.g. 120000", "is_required": True, "sort_order": 20},
            {"field_key": "income_evidence_type", "step_section": "three_year_income", "field_type": "select", "label_gu": "આવક પુરાવાનો પ્રકાર", "label_hi": "आय प्रमाण का प्रकार", "label_en": "Income Proof Document Type", "options_json": [{"value": "talati_certificate", "label_gu": "તલાટી પંચનામું / આવક દાખલો", "label_hi": "तलाटी रिपोर्ट", "label_en": "Talati Panchnama / Certificate"}, {"value": "itr_acknowledgement", "label_gu": "ઇન્કમ ટેક્સ રિટર્ન (ITR V Acknowledgement)", "label_hi": "आईटीआर पावती", "label_en": "ITR Acknowledgement Copies"}, {"value": "salary_form16", "label_gu": "નોકરીદાતા ફોર્મ-૧૬ / પગાર પ્રમાણપત્ર", "label_hi": "फॉर्म 16 / वेतन प्रमाण", "label_en": "Form 16 / Salary Certificate"}], "is_required": True, "sort_order": 21}
        ]
        for field in ncl_fields:
            field_id = str(uuid.uuid4())
            self.form_fields[field_id] = {"id": field_id, "form_id": form_3_id, **field, "created_at": datetime.now(timezone.utc), "updated_at": datetime.now(timezone.utc)}

        # Form 4: 7/12 & 8-A Land Records Fields
        form_4_id = "f0000000-0000-0000-0000-000000000004"
        land_fields = [
            {"field_key": "applicant_name", "step_section": "applicant", "field_type": "text", "label_gu": "અરજદાર / ખાતેદારનું પૂરું નામ", "label_hi": "आवेदक / खातेदार का नाम", "label_en": "Applicant / Landowner Full Name", "is_required": True, "sort_order": 1},
            {"field_key": "mobile_number", "step_section": "applicant", "field_type": "number", "label_gu": "મોબાઈલ નંબર (PDF ડાઉનલોડ લિંક માટે)", "label_hi": "मोबाइल नंबर (पीडीएफ हेतु)", "label_en": "Mobile Number for PDF Delivery", "is_required": True, "sort_order": 2},
            {"field_key": "email_address", "step_section": "applicant", "field_type": "text", "label_gu": "ઇમેઇલ એડ્રેસ (ડિજિટલ કોપી મોકલવા)", "label_hi": "ईमेल पता", "label_en": "Email Address for Digital Copy", "is_required": False, "sort_order": 3},
            {"field_key": "applicant_relation", "step_section": "applicant", "field_type": "select", "label_gu": "જમીન સાથે અરજદારનો સંબંધ", "label_hi": "भूमि से आवेदक का संबंध", "label_en": "Applicant Relationship to Land", "options_json": [{"value": "owner", "label_gu": "મુખ્ય ખાતેદાર / માલિક (Landowner)", "label_hi": "खातेदार / स्वामी", "label_en": "Registered Landowner / Khatedar"}, {"value": "co_owner", "label_gu": "સહ-ખાતેદાર / કુટુંબીજન (Co-owner)", "label_hi": "सह-खातेदार", "label_en": "Co-owner / Family Member"}, {"value": "legal_heir", "label_gu": "વારસદાર (Legal Heir)", "label_hi": "वारिस", "label_en": "Legal Heir / Successor"}, {"value": "authorized_person", "label_gu": "અધિકૃત વ્યક્તિ / વકીલ (Authorized Person)", "label_hi": "अधिकृत व्यक्ति", "label_en": "Authorized Representative / Power of Attorney"}, {"value": "general_public", "label_gu": "સામાન્ય ચકાસણી / કાનૂની હેતુ (Public Search)", "label_hi": "सामान्य सार्वजनिक जांच", "label_en": "General Public / Due Diligence"}], "is_required": True, "sort_order": 4},

            # Land Location Cascading Section
            {"field_key": "district", "step_section": "land_location", "field_type": "select", "label_gu": "મહેસૂલી જિલ્લો", "label_hi": "राजस्व जिला", "label_en": "Revenue District", "options_json": [{"value": k, "label_gu": v["name_gu"], "label_hi": v["name_hi"], "label_en": v["name_en"]} for k, v in gujarat_geo.items()], "is_required": True, "sort_order": 5},
            {"field_key": "taluka", "step_section": "land_location", "field_type": "text", "label_gu": "તાલુકો", "label_hi": "तालुका", "label_en": "Taluka", "placeholder_gu": "તાલુકાનું નામ લખો", "placeholder_hi": "तालुका का नाम", "placeholder_en": "Enter Taluka Name", "is_required": True, "sort_order": 6},
            {"field_key": "village_name", "step_section": "land_location", "field_type": "text", "label_gu": "મહેસૂલી ગામનું નામ", "label_hi": "गांव का नाम", "label_en": "Revenue Village Name", "placeholder_gu": "ગામનું નામ લખો", "placeholder_hi": "गांव का नाम", "placeholder_en": "Enter Village Name", "is_required": True, "sort_order": 7},
            {"field_key": "record_type", "step_section": "land_location", "field_type": "select", "label_gu": "જમીન રેકોર્ડનો પ્રકાર", "label_hi": "भूमि रिकॉर्ड का प्रकार", "label_en": "Land Record Extract Type", "options_json": [{"value": "7_12", "label_gu": "૭/૧૨ (ગામ નમૂનો નં. ૭ અને ૧૨ - હક્ક અને પાક વિગત)", "label_hi": "7/12 नकल", "label_en": "7/12 RoR & Crop Details"}, {"value": "8A", "label_gu": "૮-અ (ખાતેદારની ખાતાવહી)", "label_hi": "8-अ नकल", "label_en": "8-A Khatedar Khata Copy"}, {"value": "7_12_8A", "label_gu": "૭/૧૨ + ૮-અ (સંયુક્ત નકલ)", "label_hi": "7/12 + 8-अ संयुक्त नकल", "label_en": "7/12 + 8-A Combined Extracts"}, {"value": "VF6", "label_gu": "ગામ નમૂનો નં. ૬ (હક્ક પત્રક ફેરફાર નોંધ)", "label_hi": "हक पत्रक 6", "label_en": "VF-6 Hakku Patrak Mutation Entry"}], "is_required": True, "sort_order": 8},
            {"field_key": "survey_number", "step_section": "land_location", "field_type": "text", "label_gu": "સર્વે નંબર / બ્લોક નંબર", "label_hi": "सर्वे नंबर / ब्लॉक नंबर", "label_en": "Survey Number / Block Number", "placeholder_gu": "દા.ત. 142/1 અથવા 88", "placeholder_hi": "उदा. 142/1", "placeholder_en": "e.g. 142/1 or 88", "is_required": True, "sort_order": 9},
            {"field_key": "khata_number", "step_section": "land_location", "field_type": "text", "label_gu": "ખાતા નંબર (જો ખબર હોય તો)", "label_hi": "खाता संख्या (वैकल्पिक)", "label_en": "Khata Number (If known)", "placeholder_gu": "દા.ત. 89", "placeholder_hi": "उदा. 89", "placeholder_en": "e.g. 89", "is_required": False, "sort_order": 10},
            {"field_key": "mutation_entry_no", "step_section": "land_location", "field_type": "text", "label_gu": "નોંધ નંબર (હક્ક પત્રક ૬ માટે)", "label_hi": "प्रविष्टि संख्या", "label_en": "Mutation Entry No (If VF-6)", "placeholder_gu": "જો હક્ક પત્રક ૬ જોઈતું હોય તો", "placeholder_hi": "प्रविष्टि संख्या", "placeholder_en": "Required only if requesting VF-6", "is_required": False, "sort_order": 11}
        ]
        for field in land_fields:
            field_id = str(uuid.uuid4())
            self.form_fields[field_id] = {"id": field_id, "form_id": form_4_id, **field, "created_at": datetime.now(timezone.utc), "updated_at": datetime.now(timezone.utc)}

        # Form 5: Driving Licence Fields
        form_5_id = "f0000000-0000-0000-0000-000000000005"
        dl_fields = [
            {"field_key": "applicant_name", "step_section": "applicant", "field_type": "text", "label_gu": "અરજદારનું પૂરું નામ (શાળા LC મુજબ)", "label_hi": "आवेदक का पूरा नाम (एलसी अनुसार)", "label_en": "Applicant Full Name (As per School LC / 10th)", "is_required": True, "sort_order": 1},
            {"field_key": "father_husband_name", "step_section": "applicant", "field_type": "text", "label_gu": "પિતા / વાલી / પતિનું નામ", "label_hi": "पिता / अभिभावक का नाम", "label_en": "Father / Guardian / Husband Name", "is_required": True, "sort_order": 2},
            {"field_key": "gender", "step_section": "applicant", "field_type": "select", "label_gu": "લિંગ", "label_hi": "लिंग", "label_en": "Gender", "options_json": [{"value": "male", "label_gu": "પુરુષ", "label_hi": "पुरुष", "label_en": "Male"}, {"value": "female", "label_gu": "સ્ત્રી", "label_hi": "महिला", "label_en": "Female"}], "is_required": True, "sort_order": 3},
            {"field_key": "dob", "step_section": "applicant", "field_type": "date", "label_gu": "જન્મ તારીખ (૧૮ વર્ષ પૂર્ણ હોવા જરૂરી)", "label_hi": "जन्म तिथि", "label_en": "Date of Birth (18+ for LMV/MCWG)", "is_required": True, "sort_order": 4},
            {"field_key": "blood_group", "step_section": "applicant", "field_type": "select", "label_gu": "બ્લડ ગ્રુપ (રક્ત જૂથ)", "label_hi": "रक्त समूह", "label_en": "Blood Group", "options_json": [{"value": "A+", "label_gu": "A+", "label_hi": "A+", "label_en": "A+"}, {"value": "A-", "label_gu": "A-", "label_hi": "A-", "label_en": "A-"}, {"value": "B+", "label_gu": "B+", "label_hi": "B+", "label_en": "B+"}, {"value": "B-", "label_gu": "B-", "label_hi": "B-", "label_en": "B-"}, {"value": "O+", "label_gu": "O+", "label_hi": "O+", "label_en": "O+"}, {"value": "O-", "label_gu": "O-", "label_hi": "O-", "label_en": "O-"}, {"value": "AB+", "label_gu": "AB+", "label_hi": "AB+", "label_en": "AB+"}, {"value": "AB-", "label_gu": "AB-", "label_hi": "AB-", "label_en": "AB-"}, {"value": "unknown", "label_gu": "ખબર નથી", "label_hi": "अज्ञात", "label_en": "Unknown"}], "is_required": True, "sort_order": 5},
            {"field_key": "educational_qualification", "step_section": "applicant", "field_type": "select", "label_gu": "શૈક્ષણિક લાયકાત", "label_hi": "शैक्षणिक योग्यता", "label_en": "Educational Qualification", "options_json": [{"value": "8th_pass", "label_gu": "ધોરણ ૮ પાસ", "label_hi": "8वीं पास", "label_en": "8th Standard Pass"}, {"value": "10th_pass", "label_gu": "ધોરણ ૧૦ (SSC) પાસ", "label_hi": "10वीं (SSC) पास", "label_en": "10th Standard / SSC Pass"}, {"value": "12th_pass", "label_gu": "ધોરણ ૧૨ (HSC) પાસ", "label_hi": "12वीं (HSC) पास", "label_en": "12th Standard / HSC Pass"}, {"value": "graduate", "label_gu": "સ્નાતક / ગ્રેજ્યુએટ અથવા તેથી વધુ", "label_hi": "स्नातक / उससे अधिक", "label_en": "Graduate or Higher"}], "is_required": True, "sort_order": 6},
            {"field_key": "aadhaar_number", "step_section": "applicant", "field_type": "number", "label_gu": "આધાર કાર્ડ નંબર (ઓનલાઇન ફેસલેસ ટેસ્ટ લિંકિંગ)", "label_hi": "आधार कार्ड नंबर", "label_en": "Aadhaar Number (For Online Facial Test)", "is_required": True, "sort_order": 7},
            {"field_key": "mobile_number", "step_section": "applicant", "field_type": "number", "label_gu": "મોબાઈલ નંબર (સારથી SMS એલર્ટ માટે)", "label_hi": "मोबाइल नंबर", "label_en": "Mobile Number (For Sarathi SMS)", "is_required": True, "sort_order": 8},

            # Address Section
            {"field_key": "district", "step_section": "address", "field_type": "select", "label_gu": "જિલ્લો", "label_hi": "जिला", "label_en": "District", "options_json": [{"value": k, "label_gu": v["name_gu"], "label_hi": v["name_hi"], "label_en": v["name_en"]} for k, v in gujarat_geo.items()], "is_required": True, "sort_order": 9},
            {"field_key": "taluka", "step_section": "address", "field_type": "text", "label_gu": "તાલુકો", "label_hi": "तालुका", "label_en": "Taluka", "is_required": True, "sort_order": 10},
            {"field_key": "village_city", "step_section": "address", "field_type": "text", "label_gu": "ગામ / શહેર", "label_hi": "गांव / शहर", "label_en": "Village / City", "is_required": True, "sort_order": 11},
            {"field_key": "residential_address", "step_section": "address", "field_type": "textarea", "label_gu": "રહેઠાણનું સંપૂર્ણ સરનામું", "label_hi": "पूरा पता", "label_en": "Full Residential Address", "is_required": True, "sort_order": 12},
            {"field_key": "pincode", "step_section": "address", "field_type": "number", "label_gu": "પીનકોડ", "label_hi": "पिनकोड", "label_en": "Pincode", "is_required": True, "sort_order": 13},

            # Licence Service & Vehicle Class
            {"field_key": "licence_type", "step_section": "licence_service", "field_type": "select", "label_gu": "કઈ લાયસન્સ સેવા જોઈએ છે?", "label_hi": "लाइसेंस सेवा प्रकार", "label_en": "What Licence Service Do You Need?", "options_json": [{"value": "learner", "label_gu": "નવું લર્નિંગ લાયસન્સ (LLR - ઘરે બેઠા ફેસલેસ ઓનલાઇન ટેસ્ટ)", "label_hi": "नया लर्निंग लाइसेंस (ऑनलाइन टेस्ट)", "label_en": "New Learner Licence (LLR - Contactless Home Test)"}, {"value": "permanent", "label_gu": "કાયમી ડ્રાઇવિંગ લાયસન્સ (DL ટેસ્ટ સ્લોટ બુકિંગ)", "label_hi": "स्थायी ड्राइविंग लाइसेंस (डीएल)", "label_en": "New Permanent Driving Licence (DL Slot Booking)"}, {"value": "class_addition", "label_gu": "વાહન કેટેગરી ઉમેરો (દા.ત. બાઇકમાંથી કાર ઉમેરો)", "label_hi": "वाहन श्रेणी जोड़ें (Endorsement)", "label_en": "Addition of Class of Vehicle (Endorsement)"}, {"value": "renewal", "label_gu": "લાયસન્સ રીન્યુઅલ (Renewal of Expired DL)", "label_hi": "लाइसेंस नवीनीकरण", "label_en": "Licence Renewal (Expired DL)"}, {"value": "duplicate", "label_gu": "ડુપ્લીકેટ લાયસન્સ (ખોવાઈ ગયેલ/તૂટી ગયેલ લાયસન્સ)", "label_hi": "डुप्लीकेट लाइसेंस", "label_en": "Duplicate Driving Licence"}], "is_required": True, "sort_order": 14},
            {"field_key": "vehicle_class", "step_section": "licence_service", "field_type": "select", "label_gu": "વાહન ક્લાસ / કેટેગરી", "label_hi": "वाहन श्रेणी", "label_en": "Vehicle Class Category", "options_json": [{"value": "MCWG", "label_gu": "મોટર સાયકલ ગિયરવાળી (MCWG - બાઇક / ટુ-વ્હીલર)", "label_hi": "दोपहिया गियर सहित (MCWG)", "label_en": "Motorcycle with Gear (MCWG - Two Wheeler)"}, {"value": "LMV", "label_gu": "લાઇટ મોટર વ્હીકલ (LMV - કાર / ફોર-વ્હીલર)", "label_hi": "हल्का मोटर वाहन (LMV - कार)", "label_en": "Light Motor Vehicle (LMV - Car)"}, {"value": "MCWG_LMV", "label_gu": "બાઇક + કાર બંને (MCWG + LMV સંયુક્ત)", "label_hi": "दोपहिया + कार दोनों", "label_en": "Both Two-Wheeler + Car (MCWG + LMV)"}, {"value": "MCWOG", "label_gu": "ગિયર વગરનું સ્કૂટર (MCWOG - એક્ટિવા/જ્યુપિટર)", "label_hi": "स्कूटर बिना गियर", "label_en": "Motorcycle without Gear (Scooter)"}], "is_required": True, "sort_order": 15},
            {"field_key": "existing_licence_number", "step_section": "licence_service", "field_type": "text", "label_gu": "હાલનો લાયસન્સ / LLR નંબર (જો કાયમી DL અથવા રીન્યુઅલ હોય તો)", "label_hi": "मौजूदा लाइसेंस संख्या", "label_en": "Existing LL / DL Number (If applying for Permanent/Renewal/Duplicate)", "placeholder_gu": "દા.ત. GJ01/0012345/2025", "placeholder_hi": "उदा. GJ01/0012345/2025", "placeholder_en": "e.g. GJ01/0012345/2025", "is_required": False, "sort_order": 16},

            # RTO Selection Section
            {"field_key": "rto_office", "step_section": "rto_selection", "field_type": "select", "label_gu": "નજીકની ગુજરાત RTO / ARTO કચેરી પસંદ કરો", "label_hi": "आरटीओ कार्यालय चुनें", "label_en": "Select Nearest Gujarat RTO / ARTO Office", "options_json": [{"value": r["rto_code"], "label_gu": f"{r['rto_code']} : {r['office_name_gu']}", "label_hi": f"{r['rto_code']} : {r['office_name_hi']}", "label_en": f"{r['rto_code']} : {r['office_name_en']}"} for r in rto_list], "is_required": True, "sort_order": 17}
        ]
        for field in dl_fields:
            field_id = str(uuid.uuid4())
            self.form_fields[field_id] = {"id": field_id, "form_id": form_5_id, **field, "created_at": datetime.now(timezone.utc), "updated_at": datetime.now(timezone.utc)}

        # Form 6: NEET UG 2026 Registration Fields
        form_6_id = "f0000000-0000-0000-0000-000000000006"
        neet_fields = [
            {"field_key": "candidate_name", "step_section": "candidate", "field_type": "text", "label_gu": "ઉમેદવારનું પૂરું નામ (૧૦મા ધોરણની માર્કશીટ મુજબ અક્ષરશઃ)", "label_hi": "उम्मीदवार का पूरा नाम (10वीं अनुसार)", "label_en": "Candidate Full Name (Exact match with Class 10 Certificate)", "placeholder_gu": "ધોરણ ૧૦ સર્ટિફિકેટ મુજબ નામ", "placeholder_hi": "10वीं अनुसार नाम", "placeholder_en": "Name as per Class 10 certificate", "is_required": True, "sort_order": 1},
            {"field_key": "father_name", "step_section": "candidate", "field_type": "text", "label_gu": "પિતાનું નામ", "label_hi": "पिता का नाम", "label_en": "Father's Full Name", "is_required": True, "sort_order": 2},
            {"field_key": "mother_name", "step_section": "candidate", "field_type": "text", "label_gu": "માતાનું નામ", "label_hi": "माता का नाम", "label_en": "Mother's Name", "is_required": True, "sort_order": 3},
            {"field_key": "dob", "step_section": "candidate", "field_type": "date", "label_gu": "જન્મ તારીખ", "label_hi": "जन्म तिथि", "label_en": "Date of Birth", "is_required": True, "sort_order": 4},
            {"field_key": "gender", "step_section": "candidate", "field_type": "select", "label_gu": "લિંગ", "label_hi": "लिंग", "label_en": "Gender", "options_json": [{"value": "male", "label_gu": "પુરુષ", "label_hi": "पुरुष", "label_en": "Male"}, {"value": "female", "label_gu": "સ્ત્રી", "label_hi": "महिला", "label_en": "Female"}, {"value": "third_gender", "label_gu": "અન્ય", "label_hi": "अन्य", "label_en": "Third Gender"}], "is_required": True, "sort_order": 5},
            {"field_key": "nationality", "step_section": "candidate", "field_type": "select", "label_gu": "રાષ્ટ્રીયતા", "label_hi": "राष्ट्रीयता", "label_en": "Nationality", "options_json": [{"value": "indian", "label_gu": "ભારતીય (Indian)", "label_hi": "भारतीय", "label_en": "Indian"}, {"value": "nri", "label_gu": "NRI", "label_hi": "एनआरआई", "label_en": "NRI"}, {"value": "oci", "label_gu": "OCI", "label_hi": "ओसीआई", "label_en": "OCI"}], "is_required": True, "sort_order": 6},
            {"field_key": "identity_type", "step_section": "candidate", "field_type": "select", "label_gu": "ઓળખપત્રનો પ્રકાર (NTA અધિકૃત)", "label_hi": "पहचान पत्र का प्रकार", "label_en": "Identity Document Type (NTA Approved)", "options_json": [{"value": "aadhaar", "label_gu": "આધાર કાર્ડ (Aadhaar Number)", "label_hi": "आधार कार्ड", "label_en": "Aadhaar Card"}, {"value": "passport", "label_gu": "પાસપોર્ટ (Passport)", "label_hi": "पासपोर्ट", "label_en": "Passport"}, {"value": "class_12_admit_card", "label_gu": "ધોરણ ૧૨ બોર્ડ એડમિટ કાર્ડ (ફોટો સાથે)", "label_hi": "12वीं बोर्ड प्रवेश पत्र", "label_en": "Class 12 Board Admit Card with Photo"}, {"value": "election_card", "label_gu": "ચૂંટણી કાર્ડ (Voter ID)", "label_hi": "मतदाता पहचान पत्र", "label_en": "Voter ID Card"}], "is_required": True, "sort_order": 7},
            {"field_key": "identity_number", "step_section": "candidate", "field_type": "text", "label_gu": "ઓળખપત્ર નંબર (આધાર / પાસપોર્ટ નંબર)", "label_hi": "पहचान संख्या", "label_en": "Identity Number", "placeholder_gu": "દા.ત. 12 અંકનો આધાર નંબર", "placeholder_hi": "पहचान संख्या", "placeholder_en": "Enter identity document number", "is_required": True, "sort_order": 8},
            {"field_key": "category", "step_section": "candidate", "field_type": "select", "label_gu": "સામાજિક કેટેગરી (NTA અખિલ ભારતીય)", "label_hi": "आरक्षण श्रेणी", "label_en": "Social Category (NTA All India)", "options_json": [{"value": "general", "label_gu": "General (સામાન્ય)", "label_hi": "General", "label_en": "General (UR)"}, {"value": "gen_ews", "label_gu": "General-EWS (કેન્દ્રીય ૧૦% ક્વોટા)", "label_hi": "General-EWS", "label_en": "General-EWS (Central List)"}, {"value": "obc_ncl", "label_gu": "OBC-NCL (કેન્દ્રીય નોન-ક્રીમીલેયર યાદી મુજબ)", "label_hi": "OBC-NCL", "label_en": "OBC-NCL (Central List)"}, {"value": "sc", "label_gu": "SC (અનુસૂચિત જાતિ)", "label_hi": "SC", "label_en": "Scheduled Caste (SC)"}, {"value": "st", "label_gu": "ST (અનુસૂચિત જનજાતિ)", "label_hi": "ST", "label_en": "Scheduled Tribe (ST)"}], "is_required": True, "sort_order": 9},
            {"field_key": "pwd_status", "step_section": "candidate", "field_type": "select", "label_gu": "દિવ્યાંગ ઉમેદવાર (PwBD - UDID કાર્ડ ધારક)?", "label_hi": "दिव्यांग स्थिति (PwBD)", "label_en": "Person with Benchmark Disability (PwBD)?", "options_json": [{"value": "no", "label_gu": "ના (No)", "label_hi": "नहीं", "label_en": "No"}, {"value": "yes", "label_gu": "હા (Yes - 40%+ Disability)", "label_hi": "हाँ (दिव्यांग)", "label_en": "Yes (40%+ Benchmark Disability)"}], "is_required": True, "sort_order": 10},

            # Address Section
            {"field_key": "mobile_number", "step_section": "address", "field_type": "number", "label_gu": "મોબાઈલ નંબર (NTA SMS એલર્ટ માટે)", "label_hi": "मोबाइल नंबर", "label_en": "Mobile Number for NTA SMS Alerts", "is_required": True, "sort_order": 11},
            {"field_key": "email_address", "step_section": "address", "field_type": "text", "label_gu": "ઇમેઇલ એડ્રેસ (એડમિટ કાર્ડ અને પરિણામ માટે)", "label_hi": "ईमेल पता", "label_en": "Email Address for Admit Card & Scorecard", "is_required": True, "sort_order": 12},
            {"field_key": "district", "step_section": "address", "field_type": "select", "label_gu": "જિલ્લો (ગુજરાત)", "label_hi": "जिला", "label_en": "District", "options_json": [{"value": k, "label_gu": v["name_gu"], "label_hi": v["name_hi"], "label_en": v["name_en"]} for k, v in gujarat_geo.items()], "is_required": True, "sort_order": 13},
            {"field_key": "residential_address", "step_section": "address", "field_type": "textarea", "label_gu": "કાયમી સરનામું (ઘર નં., સોસાયટી, ગામ/શહેર)", "label_hi": "स्थायी पता", "label_en": "Permanent Residential Address", "is_required": True, "sort_order": 14},
            {"field_key": "pincode", "step_section": "address", "field_type": "number", "label_gu": "પીનકોડ", "label_hi": "पिनकोड", "label_en": "Pincode", "is_required": True, "sort_order": 15},

            # Academic Qualification Section
            {"field_key": "class_10_board", "step_section": "academic", "field_type": "select", "label_gu": "ધોરણ ૧૦ બોર્ડ", "label_hi": "10वीं बोर्ड", "label_en": "Class 10 Board", "options_json": [{"value": "GSEB", "label_gu": "GSEB (ગુજરાત માધ્યમિક બોર્ડ)", "label_hi": "GSEB (गुजरात बोर्ड)", "label_en": "GSEB (Gujarat Secondary Board)"}, {"value": "CBSE", "label_gu": "CBSE (સેન્ટ્રલ બોર્ડ)", "label_hi": "CBSE (केंद्रीय बोर्ड)", "label_en": "CBSE (Central Board)"}, {"value": "ICSE", "label_gu": "ICSE / Other National Board", "label_hi": "ICSE", "label_en": "ICSE / Other Board"}], "is_required": True, "sort_order": 16},
            {"field_key": "class_10_year", "step_section": "academic", "field_type": "number", "label_gu": "ધોરણ ૧૦ પાસ કર્યાનું વર્ષ", "label_hi": "10वीं उत्तीर्ण वर्ष", "label_en": "Class 10 Passing Year", "placeholder_gu": "દા.ત. 2024", "placeholder_hi": "उदा. 2024", "placeholder_en": "e.g. 2024", "is_required": True, "sort_order": 17},
            {"field_key": "class_10_percentage", "step_section": "academic", "field_type": "number", "label_gu": "ધોરણ ૧૦ ટકાવારી / CGPA", "label_hi": "10वीं प्रतिशत / CGPA", "label_en": "Class 10 Percentage / CGPA", "placeholder_gu": "દા.ત. 85.5", "placeholder_hi": "उदा. 85.5", "placeholder_en": "e.g. 85.5", "is_required": True, "sort_order": 18},
            {"field_key": "class_12_status", "step_section": "academic", "field_type": "select", "label_gu": "ધોરણ ૧૨ સાયન્સ સ્થિતિ (Physics, Chemistry, Biology)", "label_hi": "12वीं विज्ञान स्थिति", "label_en": "Class 12th Science Status (PCB)", "options_json": [{"value": "appearing", "label_gu": "૨૦૨૬ માં પરીક્ષા આપી રહ્યા છે (Appearing 2026)", "label_hi": "2026 में परीक्षा दे रहे हैं", "label_en": "Appearing in Board Exams 2026 (Code 01)"}, {"value": "passed", "label_gu": "પાછલા વર્ષોમાં પાસ થયેલ (Passed in 2025 or Earlier)", "label_hi": "उत्तीर्ण (Passed)", "label_en": "Passed in 2025 or Earlier (Code 02)"}], "is_required": True, "sort_order": 19},
            {"field_key": "class_12_board", "step_section": "academic", "field_type": "select", "label_gu": "ધોરણ ૧૨ બોર્ડ", "label_hi": "12वीं बोर्ड", "label_en": "Class 12 Board", "options_json": [{"value": "GSEB", "label_gu": "GSEB (ગુજરાત ઉચ્ચતર માધ્યમિક બોર્ડ)", "label_hi": "GSEB", "label_en": "GSEB (Gujarat Higher Secondary)"}, {"value": "CBSE", "label_gu": "CBSE (સેન્ટ્રલ બોર્ડ)", "label_hi": "CBSE", "label_en": "CBSE"}, {"value": "OTHER", "label_gu": "અન્ય રાજ્ય બોર્ડ", "label_hi": "अन्य", "label_en": "Other State Board"}], "is_required": True, "sort_order": 20},

            # Exam Details & City Choices
            {"field_key": "question_paper_medium", "step_section": "exam_details", "field_type": "select", "label_gu": "પ્રશ્નપત્રનું માધ્યમ (ભાષા પસંદગી)", "label_hi": "प्रश्न पत्र का माध्यम", "label_en": "Question Paper Medium (Language)", "options_json": [{"value": "Gujarati", "label_gu": "ગુજરાતી અને અંગ્રેજી (દ્વિભાષી બુકલેટ - Bilingual)", "label_hi": "गुजराती एवं अंग्रेजी", "label_en": "Gujarati & English (Bilingual Booklet)"}, {"value": "English", "label_gu": "English (અંગ્રેજી)", "label_hi": "English", "label_en": "English"}, {"value": "Hindi", "label_gu": "Hindi અને English (દ્વિભાષી બુકલેટ)", "label_hi": "Hindi एवं English", "label_en": "Hindi & English (Bilingual Booklet)"}], "is_required": True, "sort_order": 21},
            {"field_key": "exam_city_1", "step_section": "exam_details", "field_type": "select", "label_gu": "પ્રથમ પસંદગીનું પરીક્ષા શહેર (ગુજરાત)", "label_hi": "प्रथम परीक्षा शहर विकल्प", "label_en": "1st Choice Examination City (Gujarat)", "options_json": [{"value": "Ahmedabad", "label_gu": "અમદાવાદ / ગાંધીનગર (GJ01)", "label_hi": "अहमदाबाद", "label_en": "Ahmedabad / Gandhinagar"}, {"value": "Surat", "label_gu": "સુરત (GJ02)", "label_hi": "सूरत", "label_en": "Surat"}, {"value": "Vadodara", "label_gu": "વડોદરા (GJ03)", "label_hi": "वडोदरा", "label_en": "Vadodara"}, {"value": "Rajkot", "label_gu": "રાજકોટ (GJ04)", "label_hi": "राजकोट", "label_en": "Rajkot"}, {"value": "Bhavnagar", "label_gu": "ભાવનગર (GJ05)", "label_hi": "भावनगर", "label_en": "Bhavnagar"}, {"value": "Anand", "label_gu": "આણંદ / વલ્લભ વિદ્યાનગર", "label_hi": "आणंद", "label_en": "Anand / Vallabh Vidyanagar"}, {"value": "Mehsana", "label_gu": "મહેસાણા", "label_hi": "मेहसाणा", "label_en": "Mehsana"}, {"value": "Bhuj", "label_gu": "ભુજ (કચ્છ)", "label_hi": "भुज", "label_en": "Bhuj (Kutch)"}, {"value": "Patan", "label_gu": "પાટણ", "label_hi": "पाटन", "label_en": "Patan"}, {"value": "Valsad", "label_gu": "વલસાડ / વાપી", "label_hi": "वलसाड", "label_en": "Valsad / Vapi"}], "is_required": True, "sort_order": 22},
            {"field_key": "exam_city_2", "step_section": "exam_details", "field_type": "select", "label_gu": "દ્વિતીય પસંદગીનું પરીક્ષા શહેર", "label_hi": "द्वितीय परीक्षा शहर विकल्प", "label_en": "2nd Choice Examination City", "options_json": [{"value": "Gandhinagar", "label_gu": "ગાંધીનગર", "label_hi": "गांधीनगर", "label_en": "Gandhinagar"}, {"value": "Vadodara", "label_gu": "વડોદરા", "label_hi": "वडोदरा", "label_en": "Vadodara"}, {"value": "Ahmedabad", "label_gu": "અમદાવાદ", "label_hi": "अहमदाबाद", "label_en": "Ahmedabad"}, {"value": "Surat", "label_gu": "સુરત", "label_hi": "सूरत", "label_en": "Surat"}, {"value": "Rajkot", "label_gu": "રાજકોટ", "label_hi": "राजकोट", "label_en": "Rajkot"}, {"value": "Anand", "label_gu": "આણંદ", "label_hi": "आणंद", "label_en": "Anand"}], "is_required": True, "sort_order": 23}
        ]
        for field in neet_fields:
            field_id = str(uuid.uuid4())
            self.form_fields[field_id] = {"id": field_id, "form_id": form_6_id, **field, "created_at": datetime.now(timezone.utc), "updated_at": datetime.now(timezone.utc)}

        # 10. Seed Operator ↔ Form Assignments
        op_assignments_data = [
            {"operator_id": "b0000000-0000-0000-0000-000000000001", "form_id": form_5_id}, # Vicky -> Driving Licence
            {"operator_id": "b0000000-0000-0000-0000-000000000001", "form_id": form_6_id}, # Vicky -> NEET Exam
            {"operator_id": "b0000000-0000-0000-0000-000000000001", "form_id": form_1_id}, # Vicky -> Income Certificate
            {"operator_id": "b0000000-0000-0000-0000-000000000002", "form_id": form_1_id}, # Nikhil -> Income Certificate
            {"operator_id": "b0000000-0000-0000-0000-000000000002", "form_id": form_2_id}, # Nikhil -> EWS Certificate
            {"operator_id": "b0000000-0000-0000-0000-000000000003", "form_id": form_4_id}, # DHulo -> 7/12 Land Records
            {"operator_id": "b0000000-0000-0000-0000-000000000003", "form_id": form_3_id}, # DHulo -> NCL Certificate
            {"operator_id": "b0000000-0000-0000-0000-000000000004", "form_id": form_5_id}, # Loy -> Driving Licence
            {"operator_id": "b0000000-0000-0000-0000-000000000004", "form_id": form_4_id}, # Loy -> 7/12 Land Records
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

        # 11. Seed Demo Submission 1: Income Certificate (₹70 FormSeva Fee + ₹20 Govt Fee)
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
            "service_fee": 70.00,
            "total_fee": 90.00,
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
            "amount_inr": 90.00,
            "govt_fee": 20.00,
            "portal_fee": 70.00,
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
            "mother_name": "Savitaben Patel",
            "gender": "male",
            "dob": "1985-06-15",
            "mobile_number": "9825044551",
            "aadhaar_number": "982145519821",
            "caste_category": "sebc",
            "house_flat": "B-402",
            "building_society": "Radhe Shyam Residency",
            "street_road": "Near SP Ring Road",
            "district": "Ahmedabad",
            "taluka": "Daskroi",
            "village_city": "Vastral",
            "pincode": "382418",
            "residence_years": "25",
            "occupation_primary": "labor",
            "annual_income": "120000",
            "financial_year": "2025-2026",
            "income_purpose": "scholarship",
            "family_member_count": "4",
            "ration_card_no": "0712398214"
        }

        doc_1_id = str(uuid.uuid4())
        self.submission_documents[doc_1_id] = {
            "id": doc_1_id,
            "submission_id": sub_1_id,
            "document_type_key": "aadhaar_card",
            "file_name": "Ramesh_Patel_Aadhaar.pdf",
            "file_size_bytes": 1024 * 420,
            "mime_type": "application/pdf",
            "storage_path": f"submissions/{sub_1_id}/aadhaar_card_Ramesh_Patel_Aadhaar.pdf",
            "is_verified": True,
            "created_at": datetime(2026, 8, 23, 10, 15, tzinfo=timezone.utc)
        }

        doc_2_id = str(uuid.uuid4())
        self.submission_documents[doc_2_id] = {
            "id": doc_2_id,
            "submission_id": sub_1_id,
            "document_type_key": "ration_card",
            "file_name": "Ration_Card_Family.pdf",
            "file_size_bytes": 1024 * 610,
            "mime_type": "application/pdf",
            "storage_path": f"submissions/{sub_1_id}/ration_card_Ration_Card_Family.pdf",
            "is_verified": True,
            "created_at": datetime(2026, 8, 23, 10, 15, tzinfo=timezone.utc)
        }

        # 12. Seed Demo Submission 2: Driving Licence (₹1000 FormSeva Fee + ₹150 Govt Fee)
        sub_2_id = "s0000000-0000-0000-0000-000000000002"
        self.submissions[sub_2_id] = {
            "id": sub_2_id,
            "application_number": "FS-2026-GJ-4421",
            "user_id": citizen_id,
            "user_phone": "+91 98250 44551",
            "form_id": form_5_id,
            "assigned_operator_id": "b0000000-0000-0000-0000-000000000001",
            "status": "awaiting_otp",
            "govt_portal_application_id": "SAR-GJ-2026-77821",
            "govt_portal_url": "https://parivahan.gov.in",
            "rejection_reason": None,
            "operator_notes": "Sarathi Aadhaar facial authentication triggered. Awaiting OTP.",
            "official_fee": 150.00,
            "service_fee": 850.00,
            "total_fee": 1000.00,
            "payment_status": "paid",
            "submitted_at": datetime(2026, 8, 24, 14, 20, tzinfo=timezone.utc),
            "resubmitted_at": None,
            "operator_started_at": datetime(2026, 8, 24, 14, 35, tzinfo=timezone.utc),
            "govt_submitted_at": None,
            "completed_at": None,
            "created_at": datetime(2026, 8, 24, 14, 20, tzinfo=timezone.utc),
            "updated_at": datetime(2026, 8, 24, 14, 35, tzinfo=timezone.utc)
        }

        self.payments["p0000000-0000-0000-0000-000000000002"] = {
            "id": "p0000000-0000-0000-0000-000000000002",
            "invoice_no": "INV-2026-08-4421",
            "submission_id": sub_2_id,
            "user_id": citizen_id,
            "form_id": form_5_id,
            "form_slug": "driving_licence_rto",
            "amount_inr": 1000.00,
            "govt_fee": 150.00,
            "portal_fee": 850.00,
            "currency": "inr",
            "status": "succeeded",
            "payment_method": "upi",
            "payment_reference": "UPI/623488991200/PhonePe",
            "created_at": datetime(2026, 8, 24, 14, 20, tzinfo=timezone.utc),
            "updated_at": datetime(2026, 8, 24, 14, 21, tzinfo=timezone.utc)
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
            "licence_type": "learner",
            "vehicle_class": "MCWG_LMV",
            "rto_office": "GJ-27"
        }

        otp_id = str(uuid.uuid4())
        self.otp_requests[otp_id] = {
            "id": otp_id,
            "submission_id": sub_2_id,
            "operator_id": "b0000000-0000-0000-0000-000000000001",
            "otp_sequence_number": 1,
            "otp_purpose_gu": "પરિવહન સારથી પોર્ટલ ફેસલેસ લર્નિંગ લાયસન્સ ઓથેન્ટિકેશન માટે",
            "otp_purpose_hi": "परिवहन सारथी पोर्टल लर्निंग लाइसेंस हेतु",
            "otp_purpose_en": "For Sarathi Parivahan Faceless LL Facial Authentication",
            "status": "requested",
            "requested_at": datetime(2026, 8, 24, 14, 35, tzinfo=timezone.utc),
            "submitted_at": None,
            "expires_at": datetime(2026, 8, 24, 14, 45, tzinfo=timezone.utc),
            "created_at": datetime(2026, 8, 24, 14, 35, tzinfo=timezone.utc)
        }

        # 13. Audit logs seed
        self.audit_logs.append({
            "id": str(uuid.uuid4()),
            "actor_id": admin_id,
            "actor_role": "admin",
            "action": "SYSTEM_BOOTSTRAP_MASTER_SERVICES",
            "entity_type": "system",
            "entity_id": "formseva_v2_services",
            "new_state": {"forms_count": 6, "rto_count": len(rto_list), "geo_districts": len(gujarat_geo)},
            "created_at": datetime.now(timezone.utc)
        })

db = DatabaseStore()
