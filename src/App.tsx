/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense, lazy } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { LandingPage } from './pages/LandingPage';
import { PatientLayout } from './components/PatientLayout';
import { PatientDashboard } from './pages/PatientDashboard';
import { VoiceAssistant } from './components/VoiceAssistant';
import { LanguageModal } from './components/LanguageModal';
import { ToastContainer } from './components/ToastContainer';

// Route-level code splitting for faster initial load and snappy portal switching
const AuthPage = lazy(() =>
  import('./pages/AuthPage').then((m) => ({ default: m.AuthPage }))
);
const DoctorPortal = lazy(() =>
  import('./pages/DoctorPortal').then((m) => ({ default: m.DoctorPortal }))
);
const HospitalDashboard = lazy(() =>
  import('./pages/HospitalDashboard').then((m) => ({ default: m.HospitalDashboard }))
);
const AppointmentBooking = lazy(() =>
  import('./pages/AppointmentBooking').then((m) => ({ default: m.AppointmentBooking }))
);
const EmergencyFlow = lazy(() =>
  import('./pages/EmergencyFlow').then((m) => ({ default: m.EmergencyFlow }))
);
const HealthJourney = lazy(() =>
  import('./pages/HealthJourney').then((m) => ({ default: m.HealthJourney }))
);
const HospitalNavigation = lazy(() =>
  import('./pages/HospitalNavigation').then((m) => ({ default: m.HospitalNavigation }))
);
const MedicalReports = lazy(() =>
  import('./pages/MedicalReports').then((m) => ({ default: m.MedicalReports }))
);
const HealthTimeline = lazy(() =>
  import('./pages/HealthTimeline').then((m) => ({ default: m.HealthTimeline }))
);
const MedicinesTracker = lazy(() =>
  import('./pages/MedicinesTracker').then((m) => ({ default: m.MedicinesTracker }))
);
const OnlineConsult = lazy(() =>
  import('./pages/OnlineConsult').then((m) => ({ default: m.OnlineConsult }))
);
const FamilyCare = lazy(() =>
  import('./pages/FamilyCare').then((m) => ({ default: m.FamilyCare }))
);
const AiHealthAssistant = lazy(() =>
  import('./pages/AiHealthAssistant').then((m) => ({ default: m.AiHealthAssistant }))
);
const HealthRiskAssessment = lazy(() =>
  import('./pages/HealthRiskAssessment').then((m) => ({ default: m.HealthRiskAssessment }))
);
const SchemesBenefits = lazy(() =>
  import('./pages/SchemesBenefits').then((m) => ({ default: m.SchemesBenefits }))
);
const HealthTips = lazy(() =>
  import('./pages/HealthTips').then((m) => ({ default: m.HealthTips }))
);

function RouteSkeleton() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center p-8">
      <div className="w-full max-w-2xl space-y-4">
        <div className="h-7 w-48 rounded-lg bg-slate-200/80 animate-pulse" />
        <div className="h-32 w-full rounded-2xl bg-slate-200/60 animate-pulse" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-24 rounded-2xl bg-slate-200/60 animate-pulse" />
          <div className="h-24 rounded-2xl bg-slate-200/60 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

function AppRouter() {
  const { portalMode, patientPage } = useApp();

  const renderPatientPage = () => {
    switch (patientPage) {
      case 'dashboard':
        return <PatientDashboard />;
      case 'appointments':
        return <AppointmentBooking />;
      case 'emergency':
        return <EmergencyFlow />;
      case 'journey':
        return <HealthJourney />;
      case 'navigation':
        return <HospitalNavigation />;
      case 'reports':
        return <MedicalReports />;
      case 'timeline':
        return <HealthTimeline />;
      case 'medicines':
        return <MedicinesTracker />;
      case 'consult':
        return <OnlineConsult />;
      case 'family':
        return <FamilyCare />;
      case 'ai-assistant':
        return <AiHealthAssistant />;
      case 'risk-assessment':
        return <HealthRiskAssessment />;
      case 'schemes':
        return <SchemesBenefits />;
      case 'health-tips':
        return <HealthTips />;
      default:
        return <PatientDashboard />;
    }
  };

  return (
    <>
      <Suspense fallback={<RouteSkeleton />}>
        {portalMode === 'landing' && <LandingPage />}
        {portalMode === 'auth' && <AuthPage />}
        {portalMode === 'patient' && <PatientLayout>{renderPatientPage()}</PatientLayout>}
        {portalMode === 'doctor' && <DoctorPortal />}
        {portalMode === 'hospital' && <HospitalDashboard />}
      </Suspense>
      <LanguageModal />
      <VoiceAssistant />
      <ToastContainer />
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppRouter />
    </AppProvider>
  );
}
