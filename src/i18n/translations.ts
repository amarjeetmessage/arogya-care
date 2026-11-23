import { Language } from '../types/healthcare';

export interface LanguageMeta {
  code: Language;
  nativeName: string;
  englishName: string;
  speechLocale: string;
  region: string;
}

export const SUPPORTED_LANGUAGES: LanguageMeta[] = [
  { code: 'en', nativeName: 'English', englishName: 'English', speechLocale: 'en-IN', region: 'All India' },
  { code: 'hi', nativeName: 'हिंदी', englishName: 'Hindi', speechLocale: 'hi-IN', region: 'North & Central India' },
  { code: 'bn', nativeName: 'বাংলা', englishName: 'Bengali', speechLocale: 'bn-IN', region: 'West Bengal & East' },
  { code: 'mr', nativeName: 'मराठी', englishName: 'Marathi', speechLocale: 'mr-IN', region: 'Maharashtra' },
  { code: 'ta', nativeName: 'தமிழ்', englishName: 'Tamil', speechLocale: 'ta-IN', region: 'Tamil Nadu' },
  { code: 'te', nativeName: 'తెలుగు', englishName: 'Telugu', speechLocale: 'te-IN', region: 'AP & Telangana' },
];

const EN = {
  brand: 'Aarogya Care',
  tagline: 'Your Health, Our Priority.',
  nav: {
    home: 'Home',
    findHospital: 'Find Hospital',
    bookAppointment: 'Book Appointment',
    emergencyHelp: 'Emergency Help',
    myJourney: 'My Journey',
    reports: 'Health Records',
    timeline: 'Health Timeline',
    hospitalMap: 'Hospital Map',
    medicines: 'My Medicines',
    consultDoctor: 'Consult Doctor',
    familyCare: 'Family Profile',
    aiAssistant: 'AI Assistant',
    riskAssessment: 'Risk Assessment',
    schemes: 'Schemes & Benefits',
    healthTips: 'Health Tips',
    login: 'Login / Register',
    patientPortal: 'Patient Portal',
    doctorPortal: 'Doctor Portal',
    hospitalPortal: 'Hospital Admin',
    voiceHelper: 'Voice Helper',
    more: 'More',
  },
  hero: {
    headline: 'Smarter Healthcare. A Healthier Tomorrow.',
    subtitle:
      'Book appointments, understand medical reports, check government schemes, navigate hospitals, and stay connected with your family’s care—all in one place.',
    primaryCta: 'Get Started',
    emergencyCta: 'Emergency SOS',
    patientDemoCta: 'Patient Portal',
    doctorDemoCta: 'Doctor Portal',
    hospitalDemoCta: 'Hospital Admin',
  },
  dashboard: {
    namaste: 'Namaste',
    todayOverview: "Today's Health Overview",
    quickActions: 'Quick Actions',
    myHealthJourney: 'My Health Journey',
    upcomingTasks: "Today's Schedule",
    healthSummary: 'Health Records Summary',
    token: 'Token',
    estWait: 'Est. Wait',
    mins: 'mins',
    viewJourney: 'View Full Journey',
    getDirections: 'Hospital Directions',
    allergies: 'Recorded Allergies',
    lastConsultation: 'Last Consultation',
    latestReport: 'Latest Report',
    activeMeds: 'Active Medicines',
  },
  common: {
    english: 'English',
    hindi: 'हिंदी',
    largeText: 'Large Text',
    back: 'Back',
    next: 'Continue',
    confirm: 'Confirm',
    cancel: 'Cancel',
    save: 'Save',
    resetDemo: 'Reset Demo',
    prototypeNote: 'Smart Healthcare Prototype with sample Indian healthcare records',
    aiDisclaimer:
      'AI-generated explanations are for informational purposes and are not a diagnosis. Please consult your doctor for medical decisions.',
    emergencyDisclaimer:
      'If this is a life-threatening emergency, contact local emergency services (108 / 112) immediately. Do not wait for this app.',
  },
};

type TranslationShape = typeof EN;

const HI: TranslationShape = {
  brand: 'आरोग्य केयर',
  tagline: 'आपकी सेहत, हमारी प्राथमिकता।',
  nav: {
    home: 'होम',
    findHospital: 'अस्पताल खोजें',
    bookAppointment: 'अपॉइंटमेंट बुक करें',
    emergencyHelp: 'इमरजेंसी मदद',
    myJourney: 'मेरा सफर',
    reports: 'हेल्थ रिकॉर्ड्स',
    timeline: 'स्वास्थ्य इतिहास',
    hospitalMap: 'अस्पताल नक्शा',
    medicines: 'मेरी दवाइयां',
    consultDoctor: 'डॉक्टर से परामर्श',
    familyCare: 'परिवार प्रोफाइल',
    aiAssistant: 'AI हेल्थ सहायक',
    riskAssessment: 'स्वास्थ्य जोखिम जांच',
    schemes: 'सरकारी योजनाएं',
    healthTips: 'स्वास्थ्य सुझाव',
    login: 'लॉगिन / रजिस्टर',
    patientPortal: 'मरीज पोर्टल',
    doctorPortal: 'डॉक्टर पोर्टल',
    hospitalPortal: 'अस्पताल एडमिन',
    voiceHelper: 'बोलकर पूछें',
    more: 'और देखें',
  },
  hero: {
    headline: 'स्मार्ट स्वास्थ्य सेवा। एक स्वस्थ कल।',
    subtitle:
      'अपॉइंटमेंट बुक करें, मेडिकल रिपोर्ट आसान भाषा में समझें, सरकारी योजनाओं की पात्रता जांचें और अस्पताल के अंदर रास्ता जानें।',
    primaryCta: 'शुरू करें',
    emergencyCta: 'इमरजेंसी SOS',
    patientDemoCta: 'मरीज पोर्टल',
    doctorDemoCta: 'डॉक्टर पोर्टल',
    hospitalDemoCta: 'अस्पताल एडमिन',
  },
  dashboard: {
    namaste: 'नमस्ते',
    todayOverview: 'आज की स्वास्थ्य जानकारी',
    quickActions: 'तुरंत सेवाएं',
    myHealthJourney: 'मेरा अस्पताल सफर',
    upcomingTasks: 'आज का शेड्यूल',
    healthSummary: 'स्वास्थ्य रिकॉर्ड सारांश',
    token: 'टोकन',
    estWait: 'अनुमानित समय',
    mins: 'मिनट',
    viewJourney: 'पूरा सफर देखें',
    getDirections: 'अस्पताल रास्ता',
    allergies: 'दर्ज एलर्जी',
    lastConsultation: 'पिछला परामर्श',
    latestReport: 'ताज़ा रिपोर्ट',
    activeMeds: 'चल रही दवाइयां',
  },
  common: {
    english: 'English',
    hindi: 'हिंदी',
    largeText: 'बड़े अक्षर',
    back: 'पीछे',
    next: 'आगे बढ़ें',
    confirm: 'कन्फर्म करें',
    cancel: 'रद्द करें',
    save: 'सेव करें',
    resetDemo: 'रीसेट करें',
    prototypeNote: 'नमूना भारतीय स्वास्थ्य डेटा के साथ स्मार्ट हेल्थकेयर प्रोटोटाइप',
    aiDisclaimer:
      'AI द्वारा दी गई जानकारी केवल समझने के लिए है, यह मेडिकल निदान नहीं है। कृपया इलाज के लिए डॉक्टर से सलाह लें।',
    emergencyDisclaimer:
      'यदि यह जानलेवा आपात स्थिति है, तो तुरंत स्थानीय इमरजेंसी सेवा (108 / 112) पर कॉल करें। इस ऐप का इंतजार न करें।',
  },
};

const BN: TranslationShape = {
  ...EN,
  brand: 'আরোগ্য কেয়ার',
  tagline: 'আপনার স্বাস্থ্য, আমাদের অগ্রাধিকার।',
  nav: {
    ...EN.nav,
    home: 'হোম',
    bookAppointment: 'অ্যাপয়েন্টমেন্ট',
    emergencyHelp: 'জরুরি সাহায্য',
    myJourney: 'আমার যাত্রা',
    reports: 'মেডিকেল রিপোর্ট',
    medicines: 'আমার ওষুধ',
    aiAssistant: 'AI সহায়ক',
    schemes: 'সরকারি প্রকল্প',
    healthTips: 'স্বাস্থ্য টিপস',
    login: 'লগইন / রেজিস্টার',
    voiceHelper: 'ভয়েস সাহায্য',
  },
  hero: {
    ...EN.hero,
    headline: 'স্মার্ট স্বাস্থ্যসেবা। একটি সুস্থ আগামী।',
    primaryCta: 'শুরু করুন',
    emergencyCta: 'জরুরি SOS',
  },
  dashboard: {
    ...EN.dashboard,
    namaste: 'নমস্কার',
    todayOverview: 'আজকের স্বাস্থ্য সারসংক্ষেপ',
    quickActions: 'দ্রুত পরিষেবা',
  },
};

const MR: TranslationShape = {
  ...EN,
  brand: 'आरोग्य केअर',
  tagline: 'तुमचे आरोग्य, आमचे प्राधान्य.',
  nav: {
    ...EN.nav,
    home: 'होम',
    bookAppointment: 'अपॉइंटमेंट बुक करा',
    emergencyHelp: 'तातडीची मदत',
    myJourney: 'माझा प्रवास',
    reports: 'मेडिकल रिपोर्ट्स',
    medicines: 'माझी औषधे',
    aiAssistant: 'AI आरोग्य सहाय्यक',
    schemes: 'सरकारी योजना',
    healthTips: 'आरोग्य टिप्स',
    login: 'लॉगिन / नोंदणी',
    voiceHelper: 'बोलून विचारा',
  },
  hero: {
    ...EN.hero,
    headline: 'स्मार्ट आरोग्यसेवा. निरोगी उद्यासाठी.',
    primaryCta: 'सुरू करा',
    emergencyCta: 'तातडीची SOS',
  },
  dashboard: {
    ...EN.dashboard,
    namaste: 'नमस्कार',
    todayOverview: 'आजची आरोग्य माहिती',
    quickActions: 'त्वरित सेवा',
  },
};

const TA: TranslationShape = {
  ...EN,
  brand: 'ஆரோக்ய கேர்',
  tagline: 'உங்கள் நலம், எங்கள் முன்னுரிமை.',
  nav: {
    ...EN.nav,
    home: 'முகப்பு',
    bookAppointment: 'முன்பதிவு',
    emergencyHelp: 'அவசர உதவி',
    myJourney: 'எனது பயணம்',
    reports: 'மருத்துவ அறிக்கை',
    medicines: 'எனது மருந்துகள்',
    aiAssistant: 'AI உதவியாளர்',
    schemes: 'அரசு திட்டங்கள்',
    healthTips: 'நலக் குறிப்புகள்',
    login: 'உள்நுழைக',
    voiceHelper: 'குரல் உதவி',
  },
  hero: {
    ...EN.hero,
    headline: 'ஸ்மார்ட் மருத்துவ சேவை. ஆரோக்கியமான நாளை.',
    primaryCta: 'தொடங்குக',
    emergencyCta: 'அவசர SOS',
  },
  dashboard: {
    ...EN.dashboard,
    namaste: 'வணக்கம்',
    todayOverview: 'இன்றைய உடல்நல சுருக்கம்',
    quickActions: 'விரைவு சேவைகள்',
  },
};

const TE: TranslationShape = {
  ...EN,
  brand: 'ఆరోగ్య కేర్',
  tagline: 'మీ ఆరోగ్యం, మా ప్రాధాన్యత.',
  nav: {
    ...EN.nav,
    home: 'హోమ్',
    bookAppointment: 'అపాయింట్‌మెంట్',
    emergencyHelp: 'అత్యవసర సహాయం',
    myJourney: 'నా ప్రయాణం',
    reports: 'మెడికల్ రిపోర్ట్స్',
    medicines: 'నా మందులు',
    aiAssistant: 'AI సహాయకుడు',
    schemes: 'ప్రభుత్వ పథకాలు',
    healthTips: 'ఆరోగ్య చిట్కాలు',
    login: 'లాగిన్ / రిజిస్టర్',
    voiceHelper: 'వాయిస్ సహాయం',
  },
  hero: {
    ...EN.hero,
    headline: 'స్మార్ట్ ఆరోగ్య సంరక్షణ. ఆరోగ్యకరమైన రేపు.',
    primaryCta: 'ప్రారంభించండి',
    emergencyCta: 'అత్యవసర SOS',
  },
  dashboard: {
    ...EN.dashboard,
    namaste: 'నమస్కారం',
    todayOverview: 'నేటి ఆరోగ్య వివరాలు',
    quickActions: 'త్వరిత సేవలు',
  },
};

export const TRANSLATIONS: Record<Language, TranslationShape> = {
  en: EN,
  hi: HI,
  bn: BN,
  mr: MR,
  ta: TA,
  te: TE,
};

export function useT(lang: Language) {
  return TRANSLATIONS[lang] || EN;
}
