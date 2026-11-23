import React, { useState } from 'react';
import {
  CalendarPlus,
  AlertCircle,
  FileText,
  MapPin,
  Mic,
  Pill,
  Route,
  Users,
  ShieldCheck,
  ArrowRight,
  Building2,
  User,
  Stethoscope,
  CheckCircle2,
  Phone,
  X,
  Bot,
  Activity,
  Globe,
  Lightbulb,
  Video,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SUPPORTED_LANGUAGES, useT } from '../i18n/translations';
import { ASSETS } from '../data/mockData';
import { BrandMark } from '../components/BrandMark';
import { PatientPage } from '../types/healthcare';

export function LandingPage() {
  const {
    language,
    setLanguageModalOpen,
    setPortalMode,
    loginDemoRole,
    hospitals,
    doctors,
  } = useApp();
  const t = useT(language);
  const [selectedJourneyIndex, setSelectedJourneyIndex] = useState(0);
  const [footerModal, setFooterModal] = useState<string | null>(null);

  const activeLangMeta =
    SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  const openPatientView = (page: PatientPage = 'dashboard') => {
    loginDemoRole('patient', page);
  };

  const journeyPreviewSteps = [
    {
      num: '01',
      titleEn: 'Book & Receive Live OPD Token',
      titleHi: 'बुकिंग व लाइव टोकन प्राप्त करें',
      descEn:
        'Choose a hospital and doctor in 4 simple taps. Get your OPD token and early booking window timing before leaving home.',
      descHi:
        'घर बैठे अस्पताल और डॉक्टर चुनें। निकलने से पहले अपना ओपीडी टोकन और सही समय पाएं।',
    },
    {
      num: '02',
      titleEn: 'Navigate the Hospital Confidently',
      titleHi: 'अस्पताल के अंदर रास्ता जानें',
      descEn:
        'Scan a floor QR code or select your department to follow clear large-arrow directions to OPD rooms, labs, and pharmacy.',
      descHi:
        'क्यूआर कोड स्कैन करें या विभाग चुनें — बड़े तीरों के साथ कमरा, लैब और फार्मेसी का रास्ता देखें।',
    },
    {
      num: '03',
      titleEn: 'Track Live Visit Steps & Alerts',
      titleHi: 'हर चरण की लाइव जानकारी',
      descEn:
        'Always know whether your lab sample is processing, if there is a delay, and where to go next—without waiting in confusion.',
      descHi:
        'हमेशा जानें कि लैब रिपोर्ट तैयार हुई या समय लगेगा, और अगला कदम क्या है।',
    },
    {
      num: '04',
      titleEn: 'Understand Reports, Schemes & Medicines',
      titleHi: 'रिपोर्ट, योजनाएं और दवाइयां समझें',
      descEn:
        'Ask the AI Health Assistant with WHO/ICMR references, check Ayushman Bharat ₹5L eligibility, and stay on top of daily medicines.',
      descHi:
        'मेडिकल रिपोर्ट आसान भाषा में समझें, आयुष्मान भारत पात्रता जांचें और समय पर दवाई का रिमाइंडर पाएं।',
    },
  ];

  const capabilities = [
    {
      num: '01',
      icon: Bot,
      titleEn: 'AI Medical Assistant (RAG)',
      titleHi: 'AI मेडिकल सहायक (RAG)',
      descEn:
        'Ask symptom or care questions in 6 Indian languages and receive fast, low-latency answers grounded in WHO, ICMR & Mayo Clinic guidance.',
      descHi:
        '6 भारतीय भाषाओं में स्वास्थ्य सवाल पूछें और WHO/ICMR संदर्भित सरल जवाब पाएं।',
      action: () => openPatientView('ai-assistant'),
    },
    {
      num: '02',
      icon: Activity,
      titleEn: 'Health Risk Assessment & Vitals',
      titleHi: 'स्वास्थ्य जोखिम और वाइटल्स',
      descEn:
        'Monitor heart rate, SpO₂, blood pressure, BMI, and preventive wellness score with an interactive risk gauge.',
      descHi:
        'हृदय गति, SpO₂, ब्लड प्रेशर और स्वास्थ्य स्कोर को एक साफ डैशबोर्ड पर देखें।',
      action: () => openPatientView('risk-assessment'),
    },
    {
      num: '03',
      icon: ShieldCheck,
      titleEn: 'Government Schemes & Benefits',
      titleHi: 'सरकारी योजनाएं व लाभ',
      descEn:
        'Instant eligibility checker for Ayushman Bharat PM-JAY (₹5L & 70+ Vaya Vandana), ESIC, CGHS, LIC Insurance, and Jan Aushadhi.',
      descHi:
        'आयुष्मान भारत ₹5 लाख, 70+ वय वंदना, ESIC, CGHS और जन औषधि की पात्रता तुरंत जांचें।',
      action: () => openPatientView('schemes'),
    },
    {
      num: '04',
      icon: CalendarPlus,
      titleEn: 'Smart Appointment Booking',
      titleHi: 'आसान अपॉइंटमेंट बुकिंग',
      descEn:
        'Guided hospital, department, and doctor selection with early OPD windows, live tokens, and one-tap rescheduling.',
      descHi:
        'अस्पताल, विभाग और डॉक्टर चुनने का आसान तरीका, अर्ली बुकिंग विंडो और लाइव टोकन के साथ।',
      action: () => openPatientView('appointments'),
    },
    {
      num: '05',
      icon: AlertCircle,
      titleEn: 'Emergency SOS & Hospital Coordination',
      titleHi: 'इमरजेंसी SOS व अस्पताल समन्वय',
      descEn:
        'Fast low-typing emergency alert to share location, allergies, and track receiving hospital ER readiness.',
      descHi:
        'कम टाइपिंग के साथ तुरंत लोकेशन और मेडिकल जानकारी नजदीकी अस्पताल तक पहुंचाएं।',
      action: () => openPatientView('emergency'),
    },
    {
      num: '06',
      icon: FileText,
      titleEn: 'AI Medical Report Explainer',
      titleHi: 'AI मेडिकल रिपोर्ट सहायक',
      descEn:
        'Upload lab PDFs or prescription photos to view key biomarkers, plain-language explanations, and source line citations.',
      descHi:
        'रिपोर्ट या पर्चे की फोटो अपलोड करें और आसान भाषा में मुख्य जांच परिणाम समझें।',
      action: () => openPatientView('reports'),
    },
    {
      num: '07',
      icon: MapPin,
      titleEn: 'Indoor Hospital Navigation & QR',
      titleHi: 'अस्पताल में रास्ता मार्गदर्शन',
      descEn:
        'Floor-by-floor maps and QR code guidance designed for elderly patients and first-time hospital visitors.',
      descHi:
        'बुजुर्ग मरीजों के लिए मंजिल के अनुसार नक्शा और क्यूआर कोड आधारित रास्ता।',
      action: () => openPatientView('navigation'),
    },
    {
      num: '08',
      icon: Lightbulb,
      titleEn: 'Daily Health Tips & Medicines',
      titleHi: 'स्वास्थ्य सुझाव व दवाई रिमाइंडर',
      descEn:
        'Indian nutrition and preventive care guides paired with morning, afternoon, and night prescription reminders.',
      descHi:
        'भारतीय आहार सुझाव और सुबह, दोपहर व रात की दवाइयों के समय पर रिमाइंडर।',
      action: () => openPatientView('health-tips'),
    },
  ];

  return (
    <div className="min-h-screen bg-[#F6F9FC] text-slate-900">
      {/* Strict Clean 3-Zone Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
          <a
            href="#top"
            className="focus:outline-none"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <BrandMark label={t.brand} />
          </a>

          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
            <a
              href="#features"
              className="hover:text-teal-800 transition-colors whitespace-nowrap shrink-0"
            >
              {language === 'hi' ? 'सुविधाएं' : 'Features'}
            </a>
            <a
              href="#hospitals"
              className="hover:text-teal-800 transition-colors whitespace-nowrap shrink-0"
            >
              {t.nav.findHospital}
            </a>
            <button
              type="button"
              onClick={() => openPatientView('schemes')}
              className="hover:text-teal-800 transition-colors whitespace-nowrap shrink-0"
            >
              {t.nav.schemes}
            </button>
            <button
              type="button"
              onClick={() => openPatientView('emergency')}
              className="text-red-700 hover:text-red-800 font-semibold transition-colors whitespace-nowrap shrink-0"
            >
              {t.nav.emergencyHelp}
            </button>
          </nav>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setLanguageModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-800 min-h-[40px] whitespace-nowrap transition-colors"
            >
              <Globe className="w-4 h-4 text-teal-700 shrink-0" />
              <span>{activeLangMeta.nativeName}</span>
            </button>
            <button
              type="button"
              onClick={() => setPortalMode('auth')}
              className="px-4 py-2 text-sm font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-xl transition-colors whitespace-nowrap shrink-0 min-h-[40px]"
            >
              {t.nav.login}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="top" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-14 lg:pt-14 lg:pb-18">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
          <div className="lg:col-span-6 flex flex-col justify-center space-y-6">
            <p className="text-sm font-semibold text-teal-800">
              {t.tagline} · 6 Indian Languages
            </p>
            <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.12] text-balance">
              {t.hero.headline}
            </h1>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
              {t.hero.subtitle}
            </p>

            {/* 4-Pillar Highlight Row (Inspired by Showcase #2) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              {[
                { icon: Bot, label: language === 'hi' ? 'AI सहायक' : 'AI Assistant', page: 'ai-assistant' as PatientPage },
                { icon: Activity, label: language === 'hi' ? 'जोखिम जांच' : 'Risk Check', page: 'risk-assessment' as PatientPage },
                { icon: ShieldCheck, label: language === 'hi' ? 'आयुष्मान ₹5L' : 'Govt Schemes', page: 'schemes' as PatientPage },
                { icon: Video, label: language === 'hi' ? 'डॉक्टर कॉल' : 'Video Consult', page: 'consult' as PatientPage },
              ].map((pillar) => {
                const Icon = pillar.icon;
                return (
                  <button
                    key={pillar.page}
                    type="button"
                    onClick={() => openPatientView(pillar.page)}
                    className="p-3 rounded-xl bg-white border border-slate-200/90 hover:border-teal-300 text-left flex flex-col gap-1.5 transition-colors"
                  >
                    <Icon className="w-4 h-4 text-teal-700" />
                    <span className="text-xs font-semibold text-slate-800 leading-tight">
                      {pillar.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Primary & Emergency CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => setPortalMode('auth')}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-semibold text-base transition-colors min-h-[50px] whitespace-nowrap shadow-xs"
              >
                {t.hero.primaryCta}
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => openPatientView('emergency')}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-base transition-colors min-h-[50px] whitespace-nowrap"
              >
                <AlertCircle className="w-5 h-5" />
                {t.hero.emergencyCta}
              </button>
            </div>

            {/* Direct 1-Click Role Portals (Patient · Doctor · Hospital Admin) */}
            <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
              <span className="text-xs text-slate-500 font-medium">
                {language === 'hi' ? 'तुरंत डेमो खोलें:' : 'Quick Demo Portals:'}
              </span>
              <button
                type="button"
                onClick={() => loginDemoRole('patient', 'dashboard')}
                className="inline-flex items-center gap-1.5 font-semibold text-teal-800 hover:text-teal-950 transition-colors"
              >
                <User className="w-4 h-4" />
                {t.hero.patientDemoCta}
              </button>
              <button
                type="button"
                onClick={() => loginDemoRole('doctor')}
                className="inline-flex items-center gap-1.5 font-semibold text-blue-800 hover:text-blue-950 transition-colors"
              >
                <Stethoscope className="w-4 h-4" />
                {t.hero.doctorDemoCta}
              </button>
              <button
                type="button"
                onClick={() => loginDemoRole('hospital_admin')}
                className="inline-flex items-center gap-1.5 font-semibold text-slate-700 hover:text-slate-950 transition-colors"
              >
                <Building2 className="w-4 h-4" />
                {t.hero.hospitalDemoCta}
              </button>
            </div>
          </div>

          {/* Hero Visual Illustration */}
          <div className="lg:col-span-6 flex">
            <div className="w-full rounded-2xl overflow-hidden border border-slate-200 bg-white flex flex-col justify-between shadow-sm">
              <img
                src={ASSETS.heroIllustration}
                alt="Elderly Indian patient and daughter connected to doctor, hospital, laboratory report, and medicine schedule"
                referrerPolicy="no-referrer"
                fetchPriority="high"
                decoding="async"
                className="w-full h-full min-h-[280px] object-cover"
              />
            </div>
          </div>
        </div>

        {/* Clean Three-Step Strip */}
        <div className="mt-12 pt-9 border-t border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              step: '01.',
              titleEn: 'Sign in securely for your role.',
              titleHi: 'अपनी भूमिका के अनुसार सुरक्षित लॉगिन करें।',
              descEn:
                'Patients, Doctors, and Hospital Admins get dedicated role-based portals synced in real time.',
              descHi:
                'मरीज़, डॉक्टर और अस्पताल स्टाफ के लिए अलग सुरक्षित पोर्टल।',
            },
            {
              step: '02.',
              titleEn: 'Coordinate visits, reports & schemes.',
              titleHi: 'विजिट, रिपोर्ट और योजनाओं का प्रबंधन करें।',
              descEn:
                'Track hospital steps, ask the RAG AI assistant with WHO/ICMR citations, and verify Ayushman Bharat benefits.',
              descHi:
                'अस्पताल का हर चरण ट्रैक करें, AI सहायक से पूछें और आयुष्मान भारत लाभ जांचें।',
            },
            {
              step: '03.',
              titleEn: 'Stay connected with family & 6 languages.',
              titleHi: 'परिवार और 6 भारतीय भाषाओं के साथ जुड़े रहें।',
              descEn:
                'Switch between English, Hindi, Bengali, Marathi, Tamil, and Telugu with voice support and caregiver permissions.',
              descHi:
                'अंग्रेज़ी, हिंदी, बांग्ला, मराठी, तमिल और तेलुगु में वॉइस मदद और परिवार देखभाल।',
            },
          ].map((item) => (
            <div key={item.step} className="space-y-1.5">
              <p className="font-mono text-sm font-semibold text-teal-700">{item.step}</p>
              <h2 className="font-display text-lg font-bold text-slate-900">
                {language === 'hi' ? item.titleHi : item.titleEn}
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                {language === 'hi' ? item.descHi : item.descEn}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How Aarogya Care Helps You — Interactive Visual Journey */}
      <section className="bg-white border-y border-slate-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-10">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 text-balance">
              {language === 'hi'
                ? 'आरोग्य केयर आपकी कैसे मदद करता है'
                : 'How Aarogya Care Guides Every Step of Your Care'}
            </h2>
            <p className="mt-2 text-base text-slate-600">
              {language === 'hi'
                ? 'ताकि मरीज़ और परिवार हमेशा जानें—कहाँ जाना है, क्या करना है, अभी क्या हो रहा है, और आगे क्या होगा।'
                : 'Know where to go, what to do, what is happening, and what comes next throughout your hospital visit.'}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-5 space-y-2">
              {journeyPreviewSteps.map((st, idx) => {
                const active = selectedJourneyIndex === idx;
                return (
                  <button
                    key={st.num}
                    type="button"
                    onClick={() => setSelectedJourneyIndex(idx)}
                    className={`w-full text-left p-4 rounded-xl border transition-colors flex items-start gap-4 ${
                      active
                        ? 'bg-teal-50/70 border-teal-300 text-slate-900'
                        : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span
                      className={`font-mono text-sm font-semibold mt-0.5 ${
                        active ? 'text-teal-700' : 'text-slate-400'
                      }`}
                    >
                      {st.num}
                    </span>
                    <span className="font-display font-semibold text-base">
                      {language === 'hi' ? st.titleHi : st.titleEn}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="lg:col-span-7 bg-[#F6F9FC] border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-5">
              <div className="text-xs font-semibold text-teal-800">
                {language === 'hi' ? 'चरण' : 'Step'}{' '}
                {journeyPreviewSteps[selectedJourneyIndex].num} / 04
              </div>
              <h3 className="font-display text-2xl font-bold text-slate-900">
                {language === 'hi'
                  ? journeyPreviewSteps[selectedJourneyIndex].titleHi
                  : journeyPreviewSteps[selectedJourneyIndex].titleEn}
              </h3>
              <p className="text-base text-slate-600 leading-relaxed">
                {language === 'hi'
                  ? journeyPreviewSteps[selectedJourneyIndex].descHi
                  : journeyPreviewSteps[selectedJourneyIndex].descEn}
              </p>

              <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center gap-2 text-xs sm:text-sm text-slate-600">
                {[
                  language === 'hi' ? 'अपॉइंटमेंट' : 'Booked',
                  language === 'hi' ? 'चेक-इन' : 'Check-in',
                  language === 'hi' ? 'डॉक्टर परामर्श' : 'Consultation',
                  language === 'hi' ? 'लैब जांच' : 'Lab Tests',
                  language === 'hi' ? 'रिपोर्ट' : 'Report Ready',
                  language === 'hi' ? 'दवाई व फॉलो-अप' : 'Prescription & Follow-up',
                ].map((label, i, arr) => (
                  <React.Fragment key={label}>
                    <span
                      className={`font-medium ${
                        i <= selectedJourneyIndex + 1 ? 'text-teal-800' : 'text-slate-400'
                      }`}
                    >
                      {label}
                    </span>
                    {i < arr.length - 1 && (
                      <ArrowRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                    )}
                  </React.Fragment>
                ))}
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => openPatientView('journey')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold transition-colors min-h-[44px]"
                >
                  {language === 'hi' ? 'लाइव स्वास्थ्य सफर देखें' : 'Explore Live Patient Journey'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Complete Platform Capabilities */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-2xl mb-10">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
            {language === 'hi'
              ? 'भारतीय मरीज़ों और परिवारों के लिए संपूर्ण सुविधाएं'
              : 'Complete Healthcare Companion — All Features Built In'}
          </h2>
          <p className="mt-2 text-base text-slate-600">
            {language === 'hi'
              ? 'हर सुविधा बड़े अक्षरों, 6 भारतीय भाषाओं और कम स्टेप्स के साथ बनाई गई है।'
              : 'Click any service below to launch it directly inside Aarogya Care.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {capabilities.map((cap) => {
            const Icon = cap.icon;
            return (
              <button
                key={cap.num}
                type="button"
                onClick={cap.action}
                className="group text-left p-6 bg-white rounded-2xl border border-slate-200/90 hover:border-teal-300 transition-colors flex flex-col justify-between gap-4 shadow-xs"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-slate-400">{cap.num}.</span>
                    <Icon
                      className={`w-5 h-5 ${
                        cap.num === '05' ? 'text-red-600' : 'text-teal-700'
                      }`}
                    />
                  </div>
                  <h3 className="font-display text-base font-bold text-slate-900 group-hover:text-teal-800 transition-colors">
                    {language === 'hi' ? cap.titleHi : cap.titleEn}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {language === 'hi' ? cap.descHi : cap.descEn}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-teal-800">
                  {language === 'hi' ? 'खोलें' : 'Open feature'}
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Featured Sample Hospitals & Doctors */}
      <section id="hospitals" className="bg-white border-y border-slate-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
                {language === 'hi'
                  ? 'नजदीकी नेटवर्क अस्पताल (नमूना सूची)'
                  : 'Nearby Partner Hospitals & Doctors'}
              </h2>
              <p className="mt-1.5 text-sm text-slate-600">
                {language === 'hi'
                  ? 'लखनऊ क्षेत्र के नमूना अस्पताल · अर्ली ओपीडी बुकिंग और अनुमानित वेटिंग समय'
                  : 'Sample Lucknow healthcare network · Transparent OPD windows and estimated wait times'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => openPatientView('appointments')}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-800 hover:text-teal-950 whitespace-nowrap"
            >
              {language === 'hi' ? 'सभी अस्पताल देखें' : 'Search all hospitals'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <div className="lg:col-span-6 rounded-2xl border border-slate-200 overflow-hidden bg-[#F6F9FC] flex flex-col">
              <img
                src={ASSETS.hospitalCampus}
                alt="Sanjeevani Multi-Specialty Hospital entrance with accessible wheelchair ramp"
                referrerPolicy="no-referrer"
                loading="lazy"
                decoding="async"
                className="w-full h-56 object-cover"
              />
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="text-xs text-slate-500">
                    {hospitals[0].distanceKm} km away · Avg wait ~{hospitals[0].avgWaitMins} mins ·
                    Wheelchair accessible
                  </div>
                  <h3 className="font-display text-xl font-bold text-slate-900">
                    {language === 'hi' ? hospitals[0].nameHi : hospitals[0].name}
                  </h3>
                  <p className="text-sm text-slate-600">{hospitals[0].address}</p>
                  <p className="text-xs text-teal-800 font-medium pt-1">
                    {language === 'hi'
                      ? hospitals[0].earlyBookingWindow.labelHi
                      : hospitals[0].earlyBookingWindow.labelEn}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => openPatientView('appointments')}
                    className="px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold min-h-[42px]"
                  >
                    {t.nav.bookAppointment}
                  </button>
                  <button
                    type="button"
                    onClick={() => openPatientView('navigation')}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-sm font-medium min-h-[42px]"
                  >
                    {t.nav.hospitalMap}
                  </button>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 flex flex-col justify-between gap-4">
              {doctors.slice(0, 2).map((doc) => (
                <div
                  key={doc.id}
                  className="p-5 rounded-2xl border border-slate-200 bg-white flex flex-col sm:flex-row items-start sm:items-center gap-4"
                >
                  <img
                    src={doc.avatar}
                    alt={doc.name}
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    decoding="async"
                    className="w-20 h-20 rounded-xl object-cover shrink-0 border border-slate-100"
                  />
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="text-xs text-slate-500">
                      {doc.department} · {doc.experienceYears} yrs exp · ₹{doc.consultationFeeInr}
                    </div>
                    <h3 className="font-display text-lg font-bold text-slate-900">{doc.name}</h3>
                    <p className="text-sm text-slate-600">{doc.specialization}</p>
                    <p className="text-xs text-slate-500">
                      {doc.consultationTimings} · {doc.languages.join(', ')}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => openPatientView('appointments')}
                    className="px-4 py-2.5 rounded-xl border border-teal-700 text-teal-800 hover:bg-teal-50 text-sm font-semibold whitespace-nowrap min-h-[42px]"
                  >
                    {language === 'hi' ? 'स्लॉट चुनें' : 'Book Slot'}
                  </button>
                </div>
              ))}

              {/* Role Portals Banner (Doctor + Hospital Staff) */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-medium text-slate-500">
                    {language === 'hi' ? 'डॉक्टर व अस्पताल टीम के लिए' : 'For Doctors & Hospital Teams'}
                  </p>
                  <h3 className="font-display text-base font-bold text-slate-900 mt-0.5">
                    {language === 'hi'
                      ? 'डॉक्टर पोर्टल व हॉस्पिटल एडमिन आज़माएं'
                      : 'Write digital prescriptions, manage queues & ER alerts'}
                  </h3>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => loginDemoRole('doctor')}
                    className="px-3.5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold whitespace-nowrap min-h-[42px]"
                  >
                    {t.nav.doctorPortal}
                  </button>
                  <button
                    type="button"
                    onClick={() => loginDemoRole('hospital_admin')}
                    className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold whitespace-nowrap min-h-[42px]"
                  >
                    {t.nav.hospitalPortal}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust, Security & Role Access Commitments */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
          <div className="flex items-center gap-2.5 mb-6">
            <ShieldCheck className="w-6 h-6 text-teal-700" />
            <h2 className="font-display text-xl font-bold text-slate-900">
              {language === 'hi'
                ? 'सुरक्षित रोल-आधारित एक्सेस और मरीज़ सुरक्षा'
                : 'Role-Based Security, Privacy & Patient Safety'}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <h3 className="font-display text-base font-semibold text-slate-900">
                {language === 'hi'
                  ? 'मरीज़, डॉक्टर और एडमिन के लिए सुरक्षित लॉगिन'
                  : 'Protected Role-Based Access Control'}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {language === 'hi'
                  ? 'पासवर्ड सुरक्षित रूप से एन्क्रिप्ट किए जाते हैं और परिवार देखभाल की अनुमति आपके हाथ में है।'
                  : 'Passwords are salted and hashed on the server with separate Patient, Doctor, and Hospital Admin portals.'}
              </p>
            </div>
            <div className="space-y-1.5">
              <h3 className="font-display text-base font-semibold text-slate-900">
                {language === 'hi'
                  ? 'AI जानकारी समझाता है, डॉक्टर की जगह नहीं लेता'
                  : 'AI helps explain information, not replace doctors.'}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {language === 'hi'
                  ? 'AI जवाब और रिपोर्ट सारांश केवल समझने के लिए हैं। इलाज और दवाई के निर्णय हमेशा डॉक्टर के साथ लें।'
                  : 'AI health responses and report explanations cite trusted medical guidance and never replace clinical diagnosis.'}
              </p>
            </div>
            <div className="space-y-1.5">
              <h3 className="font-display text-base font-semibold text-slate-900">
                {language === 'hi'
                  ? 'आपातकाल में तुरंत 108 / 112 पर कॉल करें'
                  : 'Emergency assistance does not replace 108 / 112.'}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {language === 'hi'
                  ? 'जानलेवा आपात स्थिति में इस ऐप का इंतजार न करें—तुरंत स्थानीय इमरजेंसी एम्बुलेंस सेवा बुलाएं।'
                  : 'In any life-threatening emergency, contact local emergency services immediately without waiting for the app.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Clean Footer */}
      <footer className="bg-white border-t border-slate-200 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <BrandMark label={t.brand} />
            <p className="text-xs text-slate-500">
              {t.tagline} · {t.common.prototypeNote}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-600">
            {[
              { id: 'about', labelEn: 'About Us', labelHi: 'हमारे बारे में' },
              { id: 'contact', labelEn: 'Contact', labelHi: 'संपर्क करें' },
              { id: 'privacy', labelEn: 'Privacy', labelHi: 'गोपनीयता' },
              { id: 'terms', labelEn: 'Terms', labelHi: 'नियम व शर्तें' },
              { id: 'help', labelEn: 'Help', labelHi: 'सहायता' },
              { id: 'emergency-info', labelEn: 'Emergency Information', labelHi: 'इमरजेंसी जानकारी' },
            ].map((link) => (
              <button
                key={link.id}
                type="button"
                onClick={() => setFooterModal(link.id)}
                className="hover:text-teal-800 transition-colors"
              >
                {language === 'hi' ? link.labelHi : link.labelEn}
              </button>
            ))}
          </div>
        </div>
      </footer>

      {/* Footer Information Modal */}
      {footerModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4"
          onClick={() => setFooterModal(null)}
        >
          <div
            className="bg-white w-full max-w-md rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-slate-900 capitalize">
                {footerModal.replace('-', ' ')}
              </h3>
              <button
                type="button"
                onClick={() => setFooterModal(null)}
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="text-sm text-slate-600 leading-relaxed space-y-3">
              {footerModal === 'emergency-info' ? (
                <>
                  <p className="font-semibold text-red-700">{t.common.emergencyDisclaimer}</p>
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 space-y-1 text-red-900">
                    <p className="flex items-center gap-2 font-semibold">
                      <Phone className="w-4 h-4" /> National Ambulance Helpline: 108
                    </p>
                    <p className="flex items-center gap-2 font-semibold">
                      <Phone className="w-4 h-4" /> National Emergency Number: 112
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <p>
                    Aarogya Care is a patient-centric healthcare journey and hospital coordination
                    platform designed for Indian patients, elderly visitors, doctors, and family
                    caregivers.
                  </p>
                  <p className="flex items-start gap-2 text-xs text-slate-500">
                    <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                    All hospital listings, patient records, and readiness panels in this demo use
                    fictional sample Indian data for demonstration purposes.
                  </p>
                </>
              )}
            </div>
            <button
              type="button"
              onClick={() => setFooterModal(null)}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-sm font-medium"
            >
              {language === 'hi' ? 'बंद करें' : 'Close'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
