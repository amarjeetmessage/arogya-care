import React, { useEffect, useRef, useState } from 'react';
import {
  Home,
  CalendarPlus,
  Route,
  FileText,
  Clock,
  MapPin,
  Pill,
  Video,
  Users,
  AlertCircle,
  Mic,
  Building2,
  Stethoscope,
  LogOut,
  Menu,
  X,
  RotateCcw,
  Bot,
  Activity,
  ShieldCheck,
  Lightbulb,
  Bell,
  Globe,
  CheckCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SUPPORTED_LANGUAGES, useT } from '../i18n/translations';
import { AppNotification, PatientPage } from '../types/healthcare';
import { BrandMark } from './BrandMark';

interface PatientLayoutProps {
  children: React.ReactNode;
}

export function PatientLayout({ children }: PatientLayoutProps) {
  const {
    language,
    setLanguageModalOpen,
    largeText,
    setLargeText,
    patientPage,
    setPatientPage,
    setPortalMode,
    setVoiceModalOpen,
    patient,
    authUser,
    loginDemoRole,
    logout,
    activePatientEmergencyId,
    resetDemoState,
    notifications,
    unreadNotificationCount,
    markNotificationRead,
    markAllNotificationsRead,
  } = useApp();
  const t = useT(language);
  const [moreDrawerOpen, setMoreDrawerOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!notifOpen) return;
    const handleOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [notifOpen]);

  const activeLangMeta =
    SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  const primarySidebarItems: {
    id: PatientPage;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { id: 'dashboard', label: t.nav.home, icon: Home },
    { id: 'appointments', label: t.nav.bookAppointment, icon: CalendarPlus },
    { id: 'ai-assistant', label: t.nav.aiAssistant, icon: Bot },
    { id: 'risk-assessment', label: t.nav.riskAssessment, icon: Activity },
    { id: 'journey', label: t.nav.myJourney, icon: Route },
    { id: 'reports', label: t.nav.reports, icon: FileText },
    { id: 'medicines', label: t.nav.medicines, icon: Pill },
    { id: 'consult', label: t.nav.consultDoctor, icon: Video },
    { id: 'schemes', label: t.nav.schemes, icon: ShieldCheck },
    { id: 'health-tips', label: t.nav.healthTips, icon: Lightbulb },
    { id: 'navigation', label: t.nav.hospitalMap, icon: MapPin },
    { id: 'timeline', label: t.nav.timeline, icon: Clock },
    { id: 'family', label: t.nav.familyCare, icon: Users },
  ];

  const pageTitleMap: Record<PatientPage, string> = {
    dashboard: language === 'hi' ? 'मरीज डैशबोर्ड' : 'Patient Dashboard',
    appointments: t.nav.bookAppointment,
    journey: t.nav.myJourney,
    reports: language === 'hi' ? 'मेरी मेडिकल रिपोर्ट्स' : 'My Health Records',
    timeline: t.nav.timeline,
    navigation: t.nav.hospitalMap,
    medicines: t.nav.medicines,
    consult: t.nav.consultDoctor,
    family: t.nav.familyCare,
    emergency: t.nav.emergencyHelp,
    'ai-assistant': t.nav.aiAssistant,
    'risk-assessment': t.nav.riskAssessment,
    schemes: t.nav.schemes,
    'health-tips': t.nav.healthTips,
  };

  const notifIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'medicine':
        return <Pill className="w-4 h-4 text-teal-700" />;
      case 'appointment':
        return <CalendarPlus className="w-4 h-4 text-blue-700" />;
      case 'emergency':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'report':
        return <FileText className="w-4 h-4 text-indigo-700" />;
      default:
        return <Lightbulb className="w-4 h-4 text-amber-600" />;
    }
  };

  const handleNotificationClick = (item: AppNotification) => {
    markNotificationRead(item.id);
    if (item.targetPage) {
      setPatientPage(item.targetPage);
    }
    setNotifOpen(false);
  };

  const displayName =
    authUser && authUser.role === 'patient' && !authUser.isDemo
      ? authUser.fullName
      : language === 'hi'
      ? patient.nameHi
      : patient.name;

  return (
    <div className="min-h-screen bg-[#F6F9FC] flex flex-col lg:flex-row">
      {/* Desktop Left Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white border-r border-slate-200/90 z-30">
        <div className="h-16 px-5 flex items-center border-b border-slate-200/80">
          <button
            type="button"
            onClick={() => setPortalMode('landing')}
            className="text-left focus:outline-none"
          >
            <BrandMark label={t.brand} />
          </button>
        </div>

        {/* Emergency Prominent Action inside Sidebar */}
        <div className="p-3.5 border-b border-slate-100">
          <button
            type="button"
            onClick={() => setPatientPage('emergency')}
            className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-sm transition-colors min-h-[44px] ${
              patientPage === 'emergency'
                ? 'bg-red-700 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white shadow-xs'
            }`}
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="whitespace-nowrap">
              {t.nav.emergencyHelp}
              {activePatientEmergencyId ? ' (Active)' : ''}
            </span>
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto" aria-label="Patient Navigation">
          {primarySidebarItems.map((item) => {
            const Icon = item.icon;
            const active = patientPage === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setPatientPage(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors min-h-[42px] ${
                  active
                    ? 'bg-teal-50 text-teal-800 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-teal-700' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom Profile & Role Switch */}
        <div className="p-3.5 border-t border-slate-200/80 space-y-2">
          <div className="px-2">
            <p className="text-sm font-semibold text-slate-900 truncate">{displayName}</p>
            <p className="text-xs text-slate-500 tabular-nums truncate">
              {patient.age} yrs · {patient.bloodGroup} · {authUser?.isDemo ? 'Demo' : 'Verified'}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => loginDemoRole('doctor')}
              className="flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-xs font-medium text-teal-800 bg-teal-50 hover:bg-teal-100 transition-colors min-h-[38px]"
            >
              <Stethoscope className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{language === 'hi' ? 'डॉक्टर' : 'Doctor'}</span>
            </button>
            <button
              type="button"
              onClick={() => loginDemoRole('hospital_admin')}
              className="flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors min-h-[38px]"
            >
              <Building2 className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{language === 'hi' ? 'अस्पताल' : 'Admin'}</span>
            </button>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={resetDemoState}
              className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 min-h-[36px]"
            >
              <RotateCcw className="w-3.5 h-3.5 shrink-0" />
              <span className="whitespace-nowrap">{t.common.resetDemo}</span>
            </button>
            <button
              type="button"
              onClick={() => logout()}
              className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 min-h-[36px]"
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" />
              <span className="whitespace-nowrap">{language === 'hi' ? 'लॉगआउट' : 'Logout'}</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Column */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Top Utility Header */}
        <header className="sticky top-0 z-20 h-14 lg:h-16 bg-white/95 backdrop-blur-sm border-b border-slate-200/80 px-4 lg:px-8 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setPortalMode('landing')}
              className="lg:hidden shrink-0"
              aria-label="Go to homepage"
            >
              <BrandMark compact />
            </button>
            <h1 className="font-display text-base lg:text-lg font-bold text-slate-900 truncate">
              {pageTitleMap[patientPage]}
            </h1>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Voice Assistant Trigger */}
            <button
              type="button"
              onClick={() => setVoiceModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-teal-50 text-teal-800 hover:bg-teal-100 text-xs sm:text-sm font-medium min-h-[40px] whitespace-nowrap transition-colors"
            >
              <Mic className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">{t.nav.voiceHelper}</span>
            </button>

            {/* Elderly Large Text Toggle */}
            <button
              type="button"
              onClick={() => setLargeText(!largeText)}
              title={t.common.largeText}
              className={`px-2.5 py-2 rounded-xl text-xs font-semibold border min-h-[40px] min-w-[40px] transition-colors whitespace-nowrap ${
                largeText
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              A+
            </button>

            {/* 6-Language Picker Trigger */}
            <button
              type="button"
              onClick={() => setLanguageModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-800 min-h-[40px] whitespace-nowrap transition-colors"
              aria-label="Select Language"
            >
              <Globe className="w-4 h-4 text-teal-700 shrink-0" />
              <span>{activeLangMeta.nativeName}</span>
            </button>

            {/* Patient Notifications Bell Popover */}
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => setNotifOpen((prev) => !prev)}
                className="relative p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 min-h-[40px] min-w-[40px] flex items-center justify-center transition-colors"
                aria-label="Notifications"
                aria-expanded={notifOpen}
              >
                <Bell className="w-4 h-4" />
                {unreadNotificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center tabular-nums">
                    {unreadNotificationCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-slate-200 shadow-xl z-40 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between gap-2">
                    <h2 className="font-display text-sm font-bold text-slate-900">
                      {language === 'hi' ? 'सूचनाएं (Notifications)' : 'Notifications'}
                    </h2>
                    {unreadNotificationCount > 0 && (
                      <button
                        type="button"
                        onClick={markAllNotificationsRead}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-900"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        {language === 'hi' ? 'सभी पढ़ा मानें' : 'Mark all as read'}
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <p className="p-6 text-center text-xs text-slate-500">
                        {language === 'hi' ? 'कोई नई सूचना नहीं है।' : 'No notifications right now.'}
                      </p>
                    ) : (
                      notifications.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleNotificationClick(item)}
                          className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors flex items-start gap-3 ${
                            !item.read ? 'bg-teal-50/40' : 'bg-white'
                          }`}
                        >
                          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                            {notifIcon(item.type)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-xs font-bold text-slate-900 truncate">
                                {item.title}
                              </p>
                              <span className="text-[11px] text-slate-400 shrink-0 tabular-nums">
                                {item.timeAgo}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 mt-0.5 leading-snug">
                              {item.body}
                            </p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Viewport Content */}
        <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-28 lg:pb-10">
          {children}
        </main>
      </div>

      {/* Mobile Floating Emergency Action */}
      {patientPage !== 'emergency' && (
        <button
          type="button"
          onClick={() => setPatientPage('emergency')}
          className="lg:hidden fixed right-4 bottom-20 z-30 flex items-center gap-2 px-4 py-3 rounded-full bg-red-600 hover:bg-red-700 text-white font-semibold text-sm shadow-lg shadow-red-900/20 min-h-[48px]"
        >
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{t.nav.emergencyHelp}</span>
        </button>
      )}

      {/* Mobile Bottom Navigation */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-30 h-16 bg-white/95 backdrop-blur-md border-t border-slate-200 grid grid-cols-5 items-center px-1"
        aria-label="Mobile Navigation"
      >
        {[
          { id: 'dashboard' as const, label: t.nav.home, icon: Home },
          { id: 'appointments' as const, label: language === 'hi' ? 'बुकिंग' : 'Visits', icon: CalendarPlus },
          { id: 'ai-assistant' as const, label: language === 'hi' ? 'AI मदद' : 'AI Help', icon: Bot },
          { id: 'reports' as const, label: language === 'hi' ? 'रिकॉर्ड्स' : 'Records', icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = patientPage === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setPatientPage(tab.id);
                setMoreDrawerOpen(false);
              }}
              className={`flex flex-col items-center justify-center h-full min-h-[44px] ${
                active ? 'text-teal-700 font-semibold' : 'text-slate-500'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[11px] mt-0.5 truncate max-w-[68px]">{tab.label}</span>
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => setMoreDrawerOpen(true)}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] ${
            moreDrawerOpen ? 'text-teal-700 font-semibold' : 'text-slate-500'
          }`}
        >
          <Menu className="w-5 h-5" />
          <span className="text-[11px] mt-0.5 truncate">{t.nav.more}</span>
        </button>
      </nav>

      {/* Mobile More & Profile Sheet */}
      {moreDrawerOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-slate-900/50 flex items-end"
          onClick={() => setMoreDrawerOpen(false)}
        >
          <div
            className="w-full bg-white rounded-t-3xl p-6 space-y-4 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-display font-bold text-slate-900">{displayName}</p>
                <p className="text-xs text-slate-500">
                  {patient.phone} · {patient.city}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMoreDrawerOpen(false)}
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {[
                { id: 'risk-assessment' as PatientPage, label: t.nav.riskAssessment, icon: Activity },
                { id: 'schemes' as PatientPage, label: t.nav.schemes, icon: ShieldCheck },
                { id: 'health-tips' as PatientPage, label: t.nav.healthTips, icon: Lightbulb },
                { id: 'journey' as PatientPage, label: t.nav.myJourney, icon: Route },
                { id: 'navigation' as PatientPage, label: t.nav.hospitalMap, icon: MapPin },
                { id: 'medicines' as PatientPage, label: t.nav.medicines, icon: Pill },
                { id: 'timeline' as PatientPage, label: t.nav.timeline, icon: Clock },
                { id: 'consult' as PatientPage, label: t.nav.consultDoctor, icon: Video },
                { id: 'family' as PatientPage, label: t.nav.familyCare, icon: Users },
                { id: 'emergency' as PatientPage, label: t.nav.emergencyHelp, icon: AlertCircle },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setPatientPage(item.id);
                      setMoreDrawerOpen(false);
                    }}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border text-left text-sm font-medium min-h-[48px] ${
                      item.id === 'emergency'
                        ? 'border-red-200 bg-red-50 text-red-700'
                        : 'border-slate-200 bg-slate-50/70 text-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-200 flex flex-col gap-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setMoreDrawerOpen(false);
                    loginDemoRole('doctor');
                  }}
                  className="py-2.5 px-3 rounded-xl bg-teal-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 min-h-[44px]"
                >
                  <Stethoscope className="w-4 h-4" />
                  {t.nav.doctorPortal}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMoreDrawerOpen(false);
                    loginDemoRole('hospital_admin');
                  }}
                  className="py-2.5 px-3 rounded-xl bg-slate-900 text-white text-xs font-semibold flex items-center justify-center gap-1.5 min-h-[44px]"
                >
                  <Building2 className="w-4 h-4" />
                  {t.nav.hospitalPortal}
                </button>
              </div>
              <button
                type="button"
                onClick={() => {
                  setMoreDrawerOpen(false);
                  logout();
                }}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                {language === 'hi' ? 'लॉगआउट करें' : 'Sign Out'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
