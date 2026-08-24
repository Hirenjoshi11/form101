export type Language = 'gu' | 'hi' | 'en';

export interface Translations {
  appName: string;
  appTagline: string;
  navHome: string;
  navRates: string;
  navMyForms: string;
  navHelp: string;
  navAbout: string;
  navFeedback: string;
  navOperator: string;
  navAdmin: string;
  heroTitle: string;
  heroSubtitle: string;
  heroBadge: string;
  applyNow: string;
  viewRates: string;
  trackApplication: string;
  whyChooseUsTitle: string;
  comparisonCyberCafe: string;
  comparisonFormSeva: string;
  dpdpNotice: string;
  turnaroundDaysLabel: string;
  officialFeeLabel: string;
  serviceFeeLabel: string;
  totalFeeLabel: string;
  requiredDocumentsTitle: string;
  stepPersonal: string;
  stepAddress: string;
  stepSpecific: string;
  stepDocuments: string;
  stepPayment: string;
  stepReview: string;
  nextStep: string;
  previousStep: string;
  submitAndPay: string;
  uploadFilePrompt: string;
  fileSelected: string;
  otpModalTitle: string;
  otpModalSubtitle: string;
  otpInputPlaceholder: string;
  otpSubmitButton: string;
  otpAssistedNotice: string;
  otpCountdownText: string;
  statusSubmitted: string;
  statusInReview: string;
  statusOperatorFilling: string;
  statusAwaitingOtp: string;
  statusOtpReceived: string;
  statusSubmittedToGovt: string;
  statusApproved: string;
  statusRejected: string;
  downloadCertificate: string;
  operatorWorkbenchTitle: string;
  assignedToYou: string;
  startFilingBtn: string;
  requestOtpBtn: string;
  markCompletedBtn: string;
  govtAppIdLabel: string;
  adminTitle: string;
  totalApplications: string;
  activeOperators: string;
  totalRevenue: string;
  addOperator: string;
  manageForms: string;
  manageFields: string;
}

export const translations: Record<Language, Translations> = {
  gu: {
    appName: "ફોર્મ સેવા (Form_Seva)",
    appTagline: "ગુજરાત સરકાર પ્રમાણપત્ર સહાયતા પોર્ટલ",
    navHome: "હોમ",
    navRates: "સરકારી અને સેવા દર",
    navMyForms: "મારી અરજીઓ",
    navHelp: "મદદ અને માર્ગદર્શન",
    navAbout: "અમારા વિશે",
    navFeedback: "પ્રતિસાદ (Feedback)",
    navOperator: "ઓપરેટર લોગિન",
    navAdmin: "એડમિન કંટ્રોલ",
    heroTitle: "સાયબર કાફેની લાઈન વગર, ઘરે બેઠા મેળવો સરકારી પ્રમાણપત્ર",
    heroSubtitle: "આવકનો દાખલો, EWS, નોન-ક્રીમીલેયર, ૭/૧૨ અથવા ડ્રાઇવિંગ લાયસન્સ — અમારા નિષ્ણાત ઓપરેટર તમારા વતી સરકારી પોર્ટલ પર ફોર્મ ભરશે.",
    heroBadge: "૧૦૦% સુરક્ષિત અને ડિજિટલ ગુજરાત આધારિત",
    applyNow: "હમણાં જ અરજી કરો",
    viewRates: "દર પત્રક જુઓ",
    trackApplication: "અરજીનું સ્ટેટસ તપાસો",
    whyChooseUsTitle: "સાયબર કાફે vs ફોર્મ સેવા",
    comparisonCyberCafe: "સાયબર કાફે: લાંબી લાઈન, વારંવાર ધક્કા, દસ્તાવેજ ખોવાઈ જવાનું જોખમ, અસ્પષ્ટ ફી.",
    comparisonFormSeva: "ફોર્મ સેવા: ઘરે બેઠા ૧૦ મિનિટમાં અરજી, સમર્પિત ઓપરેટર, પારદર્શક સરકારી ફી, લાઈવ સ્ટેટસ અને વેરિફાઈડ સુરક્ષા.",
    dpdpNotice: "DPDP Act ૨૦૨૩ અંતર્ગત તમારો ડેટા સુરક્ષિત છે. કોઈ અનધિકૃત પરવાનગી કે SMS વાંચવામાં આવતા નથી.",
    turnaroundDaysLabel: "અંદાજિત સમય",
    officialFeeLabel: "સરકારી ફી",
    serviceFeeLabel: "સહાયતા સેવા શુલ્ક",
    totalFeeLabel: "કુલ ચૂકવવાપાત્ર રકમ",
    requiredDocumentsTitle: "જરૂરી દસ્તાવેજોની યાદી",
    stepPersonal: "૧. અંગત માહિતી",
    stepAddress: "૨. સરનામું",
    stepSpecific: "૩. દાખલા વિગતો",
    stepDocuments: "૪. દસ્તાવેજ અપલોડ",
    stepPayment: "૫. સુરક્ષિત પેમેન્ટ",
    stepReview: "૬. ચકાસણી",
    nextStep: "આગળ વધો",
    previousStep: "પાછળ જાઓ",
    submitAndPay: "સબમિટ કરો અને ફી ચૂકવો",
    uploadFilePrompt: "પીડીએફ અથવા ફોટો પસંદ કરો (મહત્તમ ૫ MB)",
    fileSelected: "ફાઇલ અપલોડ થઈ ગઈ છે",
    otpModalTitle: "ગુજરાત સરકાર પોર્ટલ OTP સહાયતા",
    otpModalSubtitle: "ઓપરેટર તમારા ફોર્મની સરકારી પોર્ટલ પર નોંધણી કરી રહ્યા છે. તમારા મોબાઈલ પર સરકારી SMS દ્વારા આવેલ OTP અહીં દાખલ કરો.",
    otpInputPlaceholder: "૬ અંકનો OTP દાખલ કરો",
    otpSubmitButton: "OTP સબમિટ કરો",
    otpAssistedNotice: "નોંધ: ફોર્મ સેવા આપમેળે SMS વાંચતું નથી. તમે જાતે જ સુરક્ષિત રીતે OTP ટાઈપ કરો છો.",
    otpCountdownText: "બાકી સમય: ૧૦ મિનિટ",
    statusSubmitted: "અરજી પ્રાપ્ત થઈ",
    statusInReview: "ચકાસણી હેઠળ",
    statusOperatorFilling: "ઓપરેટર ફોર્મ ભરી રહ્યા છે",
    statusAwaitingOtp: "OTP ની રાહ જોવાઈ રહી છે",
    statusOtpReceived: "OTP પ્રાપ્ત થયો - ફાઈલિંગ ચાલુ",
    statusSubmittedToGovt: "સરકારી પોર્ટલ પર જમા થયેલ",
    statusApproved: "પ્રમાણપત્ર મંજૂર (તૈયાર)",
    statusRejected: "અરજીમાં ક્ષતિ / સુધારો જરૂરી",
    downloadCertificate: "પ્રમાણપત્ર ડાઉનલોડ કરો (PDF)",
    operatorWorkbenchTitle: "ઓપરેટર વર્કબેન્ચ (અરજી નિવારણ કતાર)",
    assignedToYou: "તમને સોંપાયેલ અરજીઓ",
    startFilingBtn: "પોર્ટલ પર ફાઈલિંગ શરૂ કરો",
    requestOtpBtn: "નાગરિક પાસેથી OTP મંગાવો",
    markCompletedBtn: "અરજી મંજૂર / પૂર્ણ કરો",
    govtAppIdLabel: "ડિજિટલ ગુજરાત અરજી નંબર",
    adminTitle: "ગુજરાત ફોર્મ સેવા વહીવટી પેનલ",
    totalApplications: "કુલ આવેલ અરજીઓ",
    activeOperators: "કાર્યરત ઓપરેટર્સ",
    totalRevenue: "કુલ સરકારી અને સેવા આવક",
    addOperator: "નવા ઓપરેટર ઉમેરો",
    manageForms: "પ્રમાણપત્ર પ્રકાર સંચાલન",
    manageFields: "ડાયનેમિક ફીલ્ડ બિલ્ડર"
  },
  hi: {
    appName: "फॉर्म सेवा (Form_Seva)",
    appTagline: "गुजरात सरकार प्रमाण पत्र सहायक पोर्टल",
    navHome: "होम",
    navRates: "सरकारी व सेवा दर",
    navMyForms: "मेरे आवेदन",
    navHelp: "सहायता व अक्सर पूछे जाने वाले प्रश्न",
    navAbout: "हमारे बारे में",
    navFeedback: "प्रतिक्रिया (Feedback)",
    navOperator: "ऑपरेटर पोर्टल",
    navAdmin: "एडमिन कंट्रोल",
    heroTitle: "साइबर कैफे की कतारों से मुक्ति, घर बैठे पाएं सरकारी प्रमाण पत्र",
    heroSubtitle: "आय प्रमाण पत्र, ईडब्ल्यूएस, नॉन-क्रीमीलेयर, 7/12 नकल या ड्राइविंग लाइसेंस — हमारे विशेषज्ञ ऑपरेटर आपके लिए सरकारी पोर्टल पर आवेदन भरेंगे।",
    heroBadge: "100% सुरक्षित एवं डिजिटल गुजरात अनुरूप",
    applyNow: "अभी आवेदन करें",
    viewRates: "दर सूची देखें",
    trackApplication: "आवेदन की स्थिति देखें",
    whyChooseUsTitle: "साइबर कैफे बनाम फॉर्म सेवा",
    comparisonCyberCafe: "साइबर कैफे: लंबी लाइनें, बार-बार चक्कर, दस्तावेज खोने का खतरा, अस्पष्ट शुल्क।",
    comparisonFormSeva: "फॉर्म सेवा: घर बैठे 10 मिनट में आवेदन, समर्पित ऑपरेटर, पारदर्शी शुल्क, लाइव ट्रैकिंग व पूर्ण डेटा सुरक्षा।",
    dpdpNotice: "DPDP अधिनियम 2023 के तहत आपका डेटा सुरक्षित है। कोई अनावश्यक फोन अनुमति नहीं ली जाती।",
    turnaroundDaysLabel: "अनुमानित समय",
    officialFeeLabel: "सरकारी शुल्क",
    serviceFeeLabel: "सेवा शुल्क",
    totalFeeLabel: "कुल देय राशि",
    requiredDocumentsTitle: "आवश्यक दस्तावेजों की सूची",
    stepPersonal: "1. व्यक्तिगत विवरण",
    stepAddress: "2. आवासीय पता",
    stepSpecific: "3. प्रमाण पत्र विवरण",
    stepDocuments: "4. दस्तावेज अपलोड",
    stepPayment: "5. सुरक्षित भुगतान",
    stepReview: "6. समीक्षा",
    nextStep: "आगे बढ़ें",
    previousStep: "पीछे जाएं",
    submitAndPay: "जमा करें और भुगतान करें",
    uploadFilePrompt: "पीडीएफ या फोटो चुनें (अधिकतम 5 MB)",
    fileSelected: "फ़ाइल अपलोड हो गई",
    otpModalTitle: "गुजरात सरकार पोर्टल OTP सहायता",
    otpModalSubtitle: "ऑपरेटर आपके फॉर्म को सरकारी पोर्टल पर दर्ज कर रहे हैं। आपके मोबाइल पर आया सरकारी OTP यहाँ दर्ज करें।",
    otpInputPlaceholder: "6 अंकों का OTP दर्ज करें",
    otpSubmitButton: "OTP सबमिट करें",
    otpAssistedNotice: "ध्यान दें: फॉर्म सेवा एसएमएस नहीं पढ़ती, आप स्वयं सुरक्षित रूप से ओटीपी दर्ज करते हैं।",
    otpCountdownText: "शेष समय: 10 मिनट",
    statusSubmitted: "आवेदन प्राप्त",
    statusInReview: "समीक्षाधीन",
    statusOperatorFilling: "ऑपरेटर फॉर्म भर रहे हैं",
    statusAwaitingOtp: "OTP की प्रतीक्षा है",
    statusOtpReceived: "OTP प्राप्त - फाइलिंग जारी",
    statusSubmittedToGovt: "सरकारी पोर्टल पर प्रेषित",
    statusApproved: "प्रमाण पत्र स्वीकृत (तैयार)",
    statusRejected: "आवेदन में त्रुटि / संशोधन आवश्यक",
    downloadCertificate: "प्रमाण पत्र डाउनलोड करें (PDF)",
    operatorWorkbenchTitle: "ऑपरेटर वर्कबेंच (आवेदन कतार)",
    assignedToYou: "आपको सौंपे गए आवेदन",
    startFilingBtn: "पोर्टल पर फाइलिंग शुरू करें",
    requestOtpBtn: "नागरिक से OTP मांगें",
    markCompletedBtn: "आवेदन स्वीकृत / पूर्ण करें",
    govtAppIdLabel: "डिजिटल गुजरात संदर्भ सं.",
    adminTitle: "गुजरात फॉर्म सेवा प्रशासनिक पैनल",
    totalApplications: "कुल आवेदन",
    activeOperators: "सक्रिय ऑपरेटर",
    totalRevenue: "कुल राजस्व",
    addOperator: "नया ऑपरेटर जोड़ें",
    manageForms: "प्रमाण पत्र प्रबंधन",
    manageFields: "डायनामिक फील्ड बिल्डर"
  },
  en: {
    appName: "Form_Seva Gujarat",
    appTagline: "Gujarat Government Certificate Assisted-Filing Portal",
    navHome: "Home",
    navRates: "Rates & Fees",
    navMyForms: "My Filled Forms",
    navHelp: "Help & FAQ",
    navAbout: "About Us",
    navFeedback: "Feedback",
    navOperator: "Operator Portal",
    navAdmin: "Admin Console",
    heroTitle: "Skip the Cyber Café. Get Gujarat Govt Certificates from Home.",
    heroSubtitle: "Income, EWS, Non-Creamy Layer, 7/12 Land Records, or Driving Licence — verified human operators file your application on official Gujarat portals accurately and securely.",
    heroBadge: "100% Secure • Digital Gujarat e-Seva Assisted",
    applyNow: "Apply for Certificate",
    viewRates: "View Rate Card",
    trackApplication: "Track Application",
    whyChooseUsTitle: "Cyber Café vs Form_Seva",
    comparisonCyberCafe: "Cyber Café: Long queues, repeated physical visits, privacy risks with personal documents, arbitrary high fees.",
    comparisonFormSeva: "Form_Seva: 10-minute guided online submission, dedicated operator filing, transparent fees, real-time OTP relay & status tracking.",
    dpdpNotice: "Fully compliant with India DPDP Act 2023. Zero SMS or device storage scraping. Documents stored in encrypted vaults.",
    turnaroundDaysLabel: "Turnaround Time",
    officialFeeLabel: "Govt Official Fee",
    serviceFeeLabel: "Assisted Filing Fee",
    totalFeeLabel: "Total Amount Payable",
    requiredDocumentsTitle: "Required Documents Checklist",
    stepPersonal: "1. Personal Info",
    stepAddress: "2. Address Details",
    stepSpecific: "3. Certificate Specifics",
    stepDocuments: "4. Document Upload",
    stepPayment: "5. Secure Payment",
    stepReview: "6. Review",
    nextStep: "Continue",
    previousStep: "Back",
    submitAndPay: "Submit Application & Pay",
    uploadFilePrompt: "Choose PDF or Image (Max 5 MB)",
    fileSelected: "File uploaded successfully",
    otpModalTitle: "Government Portal In-App OTP Assistance",
    otpModalSubtitle: "Your dedicated operator is currently filing on the Digital Gujarat portal. Please enter the OTP sent by the government SMS to your phone.",
    otpInputPlaceholder: "Enter 6-digit OTP",
    otpSubmitButton: "Submit OTP to Operator",
    otpAssistedNotice: "Privacy Notice: Form_Seva does not request SMS/Call permissions. You manually enter the OTP here safely.",
    otpCountdownText: "Valid for: 10 minutes",
    statusSubmitted: "Application Submitted",
    statusInReview: "Under Review",
    statusOperatorFilling: "Operator Filing on Portal",
    statusAwaitingOtp: "Awaiting Citizen OTP",
    statusOtpReceived: "OTP Received - Filing in Progress",
    statusSubmittedToGovt: "Submitted to Govt Portal",
    statusApproved: "Certificate Approved & Ready",
    statusRejected: "Action Required / Query Raised",
    downloadCertificate: "Download Official Certificate (PDF)",
    operatorWorkbenchTitle: "Operator Workbench & Filing Queue",
    assignedToYou: "Assigned Applications",
    startFilingBtn: "Start Filing on Portal",
    requestOtpBtn: "Prompt Citizen for OTP",
    markCompletedBtn: "Mark Completed / Approved",
    govtAppIdLabel: "Digital Gujarat Reference ID",
    adminTitle: "Gujarat Form_Seva Administration",
    totalApplications: "Total Submissions",
    activeOperators: "Active Operators",
    totalRevenue: "Total Revenue (INR)",
    addOperator: "Add New Operator",
    manageForms: "Manage Certificate Forms",
    manageFields: "Dynamic Field Builder"
  }
};
