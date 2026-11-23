import React, { useState } from 'react';
import {
  CalendarPlus,
  AlertCircle,
  FileText,
  Video,
  Route,
  Pill,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Mic,
  ShieldAlert,
  Bot,
  Activity,
  ShieldCheck,
  Lightbulb,
  Heart,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useT } from '../i18n/translations';
import { JourneyStep } from '../types/healthcare';

export function PatientDashboard() {
  const {
    language,
    patient,
    authUser,
    appointments,
    journeySteps,
    medicines,
    followUps,
    reports,
    setPatientPage,
    setVoiceModalOpen,
    setNavTargetRoom,
    updateMedicineStatus,
    pushToast,
  } = useApp();
  const t = useT(language);

  const primaryAppointment =
    appointments.find(
      (a) => a.status !== 'Cancelled' && a.status !== 'Completed'
    ) || appointments[0];

  const activeJourneyStep =
    journeySteps.find((s) => s.status === 'Delayed' || s.status === 'In Progress') ||
    journeySteps[0];

  const [selectedStep, setSelectedStep] = useState<JourneyStep>(activeJourneyStep);

  const pendingMedicines = medicines.filter((m) => m.todayStatus === 'Pending');
  const nextFollowUp = followUps.find((f) => !f.completed);
  const latestReport = reports[0];

  const firstName =
    authUser && authUser.role === 'patient' && !authUser.isDemo
      ? authUser.fullName.split(' ')[0]
      : language === 'hi'
      ? `${patient.nameHi.split(' ')[0]} जी`
      : `${patient.name.split(' ')[0]} ji`;

  const quickActions = [
    {
      id: 'ai-assistant',
      label: t.nav.aiAssistant,
      sub: language === 'hi' ? 'WHO/ICMR संदर्भित जवाब' : 'Cited symptom & care Q&A',
      icon: Bot,
      tone: 'blue',
      onClick: () => setPatientPage('ai-assistant'),
    },
    {
      id: 'book',
      label: t.nav.bookAppointment,
      sub: language === 'hi' ? 'डॉक्टर व लाइव टोकन' : 'Find doctor & OPD token',
      icon: CalendarPlus,
      tone: 'teal',
      onClick: () => setPatientPage('appointments'),
    },
    {
      id: 'reports',
      label: t.nav.reports,
      sub: language === 'hi' ? 'रिपोर्ट सरल भाषा में' : 'AI plain explanation',
      icon: FileText,
      tone: 'blue',
      onClick: () => setPatientPage('reports'),
    },
    {
      id: 'schemes',
      label: t.nav.schemes,
      sub: language === 'hi' ? 'आयुष्मान ₹5L, ESIC, CGHS' : 'Ayushman ₹5L, ESIC & more',
      icon: ShieldCheck,
      tone: 'teal',
      onClick: () => setPatientPage('schemes'),
    },
    {
      id: 'consult',
      label: t.nav.consultDoctor,
      sub: language === 'hi' ? 'ऑनलाइन वीडियो परामर्श' : 'Video consultation',
      icon: Video,
      tone: 'blue',
      onClick: () => setPatientPage('consult'),
    },
    {
      id: 'medicines',
      label: t.nav.medicines,
      sub:
        language === 'hi'
          ? `${pendingMedicines.length} खुराक बाकी हैं`
          : `${pendingMedicines.length} doses left today`,
      icon: Pill,
      tone: 'teal',
      onClick: () => setPatientPage('medicines'),
    },
  ];

  const statusTextColor = (status: JourneyStep['status']) => {
    if (status === 'Completed') return 'text-emerald-700';
    if (status === 'Delayed') return 'text-amber-700';
    if (status === 'In Progress') return 'text-teal-700';
    return 'text-slate-500';
  };

  return (
    <div className="space-y-7">
      {/* Greeting & Voice Prompt */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
            {t.dashboard.namaste}, {firstName}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-1">
            {language === 'hi'
              ? 'आज 22 नवंबर 2026 · आपकी सेहत के लिए आज के ज़रूरी काम नीचे दिए गए हैं।'
              : 'Sunday, 22 Nov 2026 · Take care of your health today with everything organized in one place.'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setVoiceModalOpen(true)}
          className="inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl bg-white border border-teal-300 text-teal-800 hover:bg-teal-50 text-sm font-semibold min-h-[46px] self-start sm:self-auto shadow-xs"
        >
          <Mic className="w-4 h-4 text-teal-700" />
          <span>{language === 'hi' ? 'बोलकर पूछें (6 भाषाएं)' : 'Ask by Voice (6 Languages)'}</span>
        </button>
      </div>

      {/* Top 3 Showcase Summary Tiles (Next Appointment · Medicines Due · Emergency SOS) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Tile 1: Next Appointment */}
        <button
          type="button"
          onClick={() => setPatientPage('appointments')}
          className="text-left p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-teal-300 transition-colors flex flex-col justify-between gap-3 shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-700">
              {language === 'hi' ? 'अगली अपॉइंटमेंट' : 'Next Appointment'}
            </span>
            <CalendarPlus className="w-5 h-5 text-blue-600" />
          </div>
          {primaryAppointment ? (
            <div>
              <p className="font-display text-lg font-bold text-slate-900">
                {primaryAppointment.date}, {primaryAppointment.time}
              </p>
              <p className="text-xs text-slate-600 mt-0.5 truncate">
                {primaryAppointment.doctorName} · Token{' '}
                <span className="font-mono font-semibold text-teal-800">
                  {primaryAppointment.tokenNumber}
                </span>
              </p>
            </div>
          ) : (
            <p className="text-sm text-slate-500">No upcoming visits</p>
          )}
        </button>

        {/* Tile 2: Medicines Due */}
        <button
          type="button"
          onClick={() => setPatientPage('medicines')}
          className="text-left p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-amber-300 transition-colors flex flex-col justify-between gap-3 shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700">
              {language === 'hi' ? 'आज की दवाइयां बाकी' : 'Medicines Due'}
            </span>
            <Pill className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="font-display text-lg font-bold text-slate-900 tabular-nums">
              {pendingMedicines.length}{' '}
              {language === 'hi' ? 'खुराक आज बाकी' : 'Pending Today'}
            </p>
            <p className="text-xs text-slate-600 mt-0.5 truncate">
              {pendingMedicines[0]
                ? `${language === 'hi' ? 'अगली:' : 'Next:'} ${pendingMedicines[0].name} at ${pendingMedicines[0].time}`
                : language === 'hi'
                ? 'आज की सभी दवाइयां ले ली गई हैं'
                : 'All scheduled doses marked taken'}
            </p>
          </div>
        </button>

        {/* Tile 3: Emergency SOS */}
        <button
          type="button"
          onClick={() => setPatientPage('emergency')}
          className="text-left p-5 rounded-2xl bg-red-600 hover:bg-red-700 text-white transition-colors flex flex-col justify-between gap-3 shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-red-100">
              {language === 'hi' ? 'आपातकालीन सहायता' : 'Emergency SOS'}
            </span>
            <AlertCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-display text-lg font-bold">
              {language === 'hi' ? 'तुरंत अस्पताल अलर्ट भेजें' : 'Instant Hospital Alert'}
            </p>
            <p className="text-xs text-red-100 mt-0.5">
              {language === 'hi'
                ? 'लोकेशन व एलर्जी भेजें · 108 / 112 कॉल करें'
                : 'Share live location & allergies · Or dial 108 / 112'}
            </p>
          </div>
        </button>
      </div>

      {/* Health Score + Sparkline & Live Hospital Status Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Health Overview & Score Card (Panel #3) */}
        <section className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 p-6 flex flex-col justify-between gap-4 shadow-xs">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-xs font-semibold text-teal-800">
                {language === 'hi' ? 'स्वास्थ्य स्कोर व वाइटल्स' : 'Health Overview'}
              </p>
              <div className="flex items-baseline gap-2.5 mt-1">
                <span className="font-display text-3xl font-extrabold text-slate-900 tabular-nums">
                  92%
                </span>
                <span className="text-xs font-semibold text-emerald-700">
                  {language === 'hi' ? 'अच्छा · कम जोखिम' : 'Good · Low Risk'}
                </span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0">
              <Heart className="w-5 h-5 text-emerald-600" />
            </div>
          </div>

          {/* Crisp SVG Trend Sparkline */}
          <div className="pt-1">
            <svg viewBox="0 0 280 64" className="w-full h-16 overflow-visible" aria-hidden="true">
              <defs>
                <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0F766E" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#0F766E" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M 4 50 L 48 44 L 94 46 L 140 34 L 186 28 L 232 20 L 276 12 L 276 62 L 4 62 Z"
                fill="url(#scoreGrad)"
              />
              <path
                d="M 4 50 L 48 44 L 94 46 L 140 34 L 186 28 L 232 20 L 276 12"
                fill="none"
                stroke="#0F766E"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="276" cy="12" r="4" fill="#0F766E" />
            </svg>
            <div className="flex items-center justify-between text-xs text-slate-500 tabular-nums pt-1 border-t border-slate-100">
              <span>72 bpm</span>
              <span>98% SpO₂</span>
              <span>134/84 BP</span>
              <span>HbA1c 6.9%</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setPatientPage('risk-assessment')}
            className="w-full py-2.5 px-4 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-semibold flex items-center justify-center gap-2 min-h-[42px] transition-colors"
          >
            <Activity className="w-4 h-4" />
            {language === 'hi'
              ? 'स्वास्थ्य जोखिम और वाइटल्स जांचें'
              : 'Open Health Risk Assessment'}
          </button>
        </section>

        {/* Active Hospital Visit Overview */}
        {primaryAppointment && (
          <section
            aria-label={t.dashboard.todayOverview}
            className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 p-6 flex flex-col justify-between gap-5 shadow-xs"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-teal-800">
                  {t.dashboard.todayOverview} · {primaryAppointment.date}
                </p>
                <h3 className="font-display text-xl font-bold text-slate-900">
                  {primaryAppointment.doctorName}
                </h3>
                <p className="text-sm text-slate-600">
                  {primaryAppointment.department} · {primaryAppointment.hospitalName}
                </p>
              </div>

              <div className="flex items-center gap-5 shrink-0">
                <div>
                  <p className="text-xs text-slate-500">{t.dashboard.token}</p>
                  <p className="font-mono text-xl font-bold text-teal-800 tabular-nums">
                    {primaryAppointment.tokenNumber}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">{t.dashboard.estWait}</p>
                  <p className="font-mono text-lg font-semibold text-slate-900 tabular-nums">
                    ~{primaryAppointment.estimatedWaitMins} {t.dashboard.mins}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              {activeJourneyStep.status === 'Delayed' ? (
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              ) : (
                <Clock className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {language === 'hi'
                    ? `अभी की स्थिति: ${activeJourneyStep.titleHi}`
                    : `Current Step: ${activeJourneyStep.titleEn}`}
                </p>
                <p className="text-sm text-slate-600 mt-0.5">
                  {language === 'hi'
                    ? activeJourneyStep.delayNoteHi || activeJourneyStep.nextActionHi
                    : activeJourneyStep.delayNoteEn || activeJourneyStep.nextActionEn}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() => setPatientPage('journey')}
                className="px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold min-h-[42px] whitespace-nowrap"
              >
                {t.dashboard.viewJourney}
              </button>
              <button
                type="button"
                onClick={() => {
                  setNavTargetRoom(activeJourneyStep.mapTargetId || 'laboratory');
                  setPatientPage('navigation');
                }}
                className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-sm font-medium min-h-[42px] inline-flex items-center gap-1.5 whitespace-nowrap"
              >
                <MapPin className="w-4 h-4 text-teal-700" />
                {t.dashboard.getDirections}
              </button>
            </div>
          </section>
        )}
      </div>

      {/* Quick Actions Grid */}
      <section aria-label={t.dashboard.quickActions} className="space-y-3">
        <h3 className="font-display text-lg font-bold text-slate-900">
          {t.dashboard.quickActions}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5">
          {quickActions.map((qa) => {
            const Icon = qa.icon;
            return (
              <button
                key={qa.id}
                type="button"
                onClick={qa.onClick}
                className="text-left p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-teal-300 hover:bg-teal-50/30 transition-colors min-h-[92px] flex flex-col justify-between gap-2 shadow-xs"
              >
                <Icon
                  className={`w-6 h-6 ${qa.tone === 'blue' ? 'text-blue-700' : 'text-teal-700'}`}
                />
                <div>
                  <p className="font-display text-sm sm:text-base font-bold text-slate-900">
                    {qa.label}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">{qa.sub}</p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Interactive My Health Journey Progress Strip */}
      <section className="bg-white rounded-2xl border border-slate-200/90 p-6 space-y-5 shadow-xs">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="font-display text-lg font-bold text-slate-900">
              {t.dashboard.myHealthJourney}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              {language === 'hi'
                ? 'किसी भी चरण पर टैप करके उसकी जानकारी देखें'
                : 'Tap any step below to view room location and instructions'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setPatientPage('journey')}
            className="text-sm font-semibold text-teal-800 hover:text-teal-950 inline-flex items-center gap-1 whitespace-nowrap"
          >
            {language === 'hi' ? 'सभी 9 चरण' : 'All 9 Steps'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {journeySteps.slice(0, 6).map((step) => {
            const isSelected = selectedStep.id === step.id;
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => setSelectedStep(step)}
                className={`p-3 rounded-xl border text-left transition-colors min-h-[82px] flex flex-col justify-between ${
                  isSelected
                    ? 'border-teal-600 bg-teal-50/70'
                    : 'border-slate-200 bg-[#F6F9FC] hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-slate-400">0{step.order}</span>
                  <span className={`font-semibold ${statusTextColor(step.status)}`}>
                    {step.status}
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-slate-900 leading-snug mt-1">
                  {language === 'hi' ? step.titleHi : step.titleEn}
                </p>
              </button>
            );
          })}
        </div>

        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs text-slate-500">
              {language === 'hi' ? selectedStep.locationHi : selectedStep.locationEn} ·{' '}
              {selectedStep.expectedDuration}
              {selectedStep.completedAt ? ` · ${selectedStep.completedAt}` : ''}
            </p>
            <p className="text-sm font-medium text-slate-800">
              {language === 'hi'
                ? selectedStep.delayNoteHi || selectedStep.instructionsHi
                : selectedStep.delayNoteEn || selectedStep.instructionsEn}
            </p>
          </div>
          {selectedStep.mapTargetId && (
            <button
              type="button"
              onClick={() => {
                setNavTargetRoom(selectedStep.mapTargetId || null);
                setPatientPage('navigation');
              }}
              className="px-3.5 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-800 hover:bg-slate-50 whitespace-nowrap self-start sm:self-auto min-h-[40px]"
            >
              {language === 'hi' ? 'इस जगह का रास्ता देखें' : 'Directions to This Area'}
            </button>
          )}
        </div>
      </section>

      {/* Two-Column Lower Section: Today's Schedule (Panel #10) & Health Records Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Today's Schedule */}
        <section className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg font-bold text-slate-900">
                {t.dashboard.upcomingTasks}
              </h3>
              <p className="text-xs text-slate-500">Sun, 22 Nov 2026</p>
            </div>
            <button
              type="button"
              onClick={() => setPatientPage('medicines')}
              className="text-xs font-semibold text-teal-800 hover:underline"
            >
              {language === 'hi' ? 'सभी रिमाइंडर' : 'Manage All'}
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {/* Medicines due today */}
            {pendingMedicines.slice(0, 2).map((med) => (
              <div
                key={med.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <p className="text-xs text-slate-500">
                    {language === 'hi' ? 'दवाई रिमाइंडर' : 'Medicine Reminder'} · {med.time}
                  </p>
                  <p className="text-sm font-semibold text-slate-900">
                    {med.name} ({med.dosage})
                  </p>
                  <p className="text-xs text-slate-600">
                    {language === 'hi' ? med.instructionsHi : med.instructionsEn}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    updateMedicineStatus(med.id, 'Taken');
                    pushToast(
                      language === 'hi'
                        ? `${med.name} ली गई के रूप में दर्ज हुई।`
                        : `Marked ${med.name} as Taken.`
                    );
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-teal-50 text-teal-800 hover:bg-teal-100 text-xs font-semibold whitespace-nowrap self-start sm:self-auto min-h-[40px]"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {language === 'hi' ? 'दवाई ले ली' : 'Mark Taken'}
                </button>
              </div>
            ))}

            {/* Follow-up */}
            {nextFollowUp && (
              <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-slate-500">
                    {nextFollowUp.type} · {nextFollowUp.date}, {nextFollowUp.time}
                  </p>
                  <p className="text-sm font-semibold text-slate-900">
                    {language === 'hi' ? nextFollowUp.titleHi : nextFollowUp.titleEn}
                  </p>
                  <p className="text-xs text-slate-600">{nextFollowUp.location}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setPatientPage('journey')}
                  className="text-xs font-semibold text-teal-800 hover:underline whitespace-nowrap self-start sm:self-auto"
                >
                  {language === 'hi' ? 'विवरण देखें' : 'View Details'}
                </button>
              </div>
            )}

            {/* Today's Health Tip (Panel #10 & #14) */}
            <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-500">
                    {language === 'hi' ? 'आज का स्वास्थ्य सुझाव' : "Today's Health Tip"}
                  </p>
                  <p className="text-sm font-semibold text-slate-900">
                    {language === 'hi'
                      ? 'ताज़े फल खाएं और खाने के बाद 20 मिनट टहलें।'
                      : 'Eat fresh seasonal fruits & walk 20 minutes after meals.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPatientPage('health-tips')}
                className="text-xs font-semibold text-teal-800 hover:underline whitespace-nowrap self-start sm:self-auto"
              >
                {language === 'hi' ? 'सभी सुझाव' : 'More Tips'}
              </button>
            </div>
          </div>
        </section>

        {/* Health Records Summary */}
        <section className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 p-6 flex flex-col justify-between space-y-5 shadow-xs">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-slate-900">
                {t.dashboard.healthSummary}
              </h3>
              <button
                type="button"
                onClick={() => setPatientPage('timeline')}
                className="text-xs font-semibold text-teal-800 hover:underline"
              >
                {t.nav.timeline}
              </button>
            </div>

            <div className="space-y-3.5 text-sm">
              <div className="pb-3 border-b border-slate-100">
                <p className="text-xs text-slate-500">{t.dashboard.latestReport}</p>
                <p className="font-semibold text-slate-900 mt-0.5">{latestReport.title}</p>
                <p className="text-xs text-slate-600 mt-0.5">
                  {latestReport.date} · Hb 12.4 g/dL · HbA1c 6.9%
                </p>
              </div>

              <div className="pb-3 border-b border-slate-100">
                <p className="text-xs text-slate-500">{t.dashboard.lastConsultation}</p>
                <p className="font-semibold text-slate-900 mt-0.5">
                  Dr. Rajesh Nair · Cardiology
                </p>
                <p className="text-xs text-slate-600 mt-0.5">10 Nov 2026 · BP 134/84 mmHg</p>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 flex items-start gap-2.5">
                <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-amber-900">{t.dashboard.allergies}</p>
                  <p className="text-sm font-medium text-amber-950 mt-0.5">
                    {patient.allergies.join(', ')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setPatientPage('family')}
              className="py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 min-h-[42px]"
            >
              {language === 'hi' ? 'परिवार देखभाल' : 'Family Profile'}
            </button>
            <button
              type="button"
              onClick={() => setPatientPage('schemes')}
              className="py-2.5 px-3 rounded-xl border border-teal-200 bg-teal-50/60 hover:bg-teal-50 text-xs font-semibold text-teal-800 min-h-[42px]"
            >
              {language === 'hi' ? 'आयुष्मान ₹5L' : 'Ayushman ₹5L'}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
