import React from 'react';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Circle,
  MapPin,
  ArrowRight,
  Building2,
  FastForward,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { JourneyStep } from '../types/healthcare';

export function HealthJourney() {
  const {
    language,
    journeySteps,
    patient,
    setNavTargetRoom,
    setPatientPage,
    setPortalMode,
    setHospitalPage,
    updateJourneyStepStatus,
    pushToast,
  } = useApp();

  const currentStep =
    journeySteps.find((s) => s.status === 'Delayed' || s.status === 'In Progress') ||
    journeySteps.find((s) => s.status === 'Pending') ||
    journeySteps[journeySteps.length - 1];

  const completedCount = journeySteps.filter((s) => s.status === 'Completed').length;

  const advanceDemoStep = () => {
    const activeIdx = journeySteps.findIndex(
      (s) => s.status === 'Delayed' || s.status === 'In Progress' || s.status === 'Pending'
    );
    if (activeIdx === -1) {
      pushToast(
        language === 'hi' ? 'आपका पूरा विजिट सफर पूरा हो चुका है!' : 'All journey steps are completed!',
        'success'
      );
      return;
    }
    const target = journeySteps[activeIdx];
    updateJourneyStepStatus(target.id, 'Completed');
    const next = journeySteps[activeIdx + 1];
    if (next) {
      updateJourneyStepStatus(next.id, 'In Progress');
      pushToast(
        language === 'hi'
          ? `हॉस्पिटल अपडेट: "${target.titleHi}" पूरा हुआ → अगला चरण "${next.titleHi}"`
          : `Hospital updated: "${target.titleEn}" completed → Next: "${next.titleEn}"`
      );
    } else {
      pushToast(
        language === 'hi' ? 'विजिट सफलतापूर्वक पूरा हुआ!' : 'Visit journey completed!'
      );
    }
  };

  const renderStatusIcon = (status: JourneyStep['status']) => {
    if (status === 'Completed') return <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />;
    if (status === 'Delayed') return <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />;
    if (status === 'In Progress') return <Clock className="w-6 h-6 text-teal-700 shrink-0" />;
    return <Circle className="w-6 h-6 text-slate-300 shrink-0" />;
  };

  return (
    <div className="space-y-6">
      {/* Header & Progress */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-teal-800">
            Sanjeevani Multi-Specialty Hospital · Token #OPD-14 · {completedCount} of{' '}
            {journeySteps.length} steps completed
          </p>
          <h2 className="font-display text-2xl font-bold text-slate-900 mt-0.5">
            {language === 'hi' ? 'मेरा स्वास्थ्य सफर (Patient Journey)' : 'My Health Journey'}
          </h2>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={advanceDemoStep}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100 text-xs font-semibold min-h-[42px]"
          >
            <FastForward className="w-4 h-4" />
            {language === 'hi' ? 'डेमो: अगला अपडेट चलाएं' : 'Demo: Simulate Next Hospital Update'}
          </button>
          <button
            type="button"
            onClick={() => {
              setHospitalPage('journeys');
              setPortalMode('hospital');
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold min-h-[42px]"
          >
            <Building2 className="w-4 h-4" />
            {language === 'hi' ? 'स्टाफ से अपडेट करें' : 'Update via Staff Portal'}
          </button>
        </div>
      </div>

      {/* Prominent "What To Do Right Now" Action Card */}
      {currentStep && (
        <section
          className={`rounded-2xl border p-6 space-y-4 ${
            currentStep.status === 'Delayed'
              ? 'bg-amber-50/70 border-amber-300'
              : 'bg-teal-50/60 border-teal-300'
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="space-y-1.5">
              <p
                className={`text-xs font-bold ${
                  currentStep.status === 'Delayed' ? 'text-amber-800' : 'text-teal-800'
                }`}
              >
                {language === 'hi'
                  ? `अभी क्या करें · चरण ${currentStep.order} / ${journeySteps.length} (${currentStep.status})`
                  : `WHAT TO DO RIGHT NOW · STEP ${currentStep.order} OF ${journeySteps.length} (${currentStep.status})`}
              </p>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-slate-900">
                {language === 'hi' ? currentStep.titleHi : currentStep.titleEn}
              </h3>
              <p className="text-sm sm:text-base text-slate-800 leading-relaxed max-w-3xl">
                {language === 'hi'
                  ? currentStep.delayNoteHi || currentStep.instructionsHi
                  : currentStep.delayNoteEn || currentStep.instructionsEn}
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5 shrink-0">
              {currentStep.mapTargetId && (
                <button
                  type="button"
                  onClick={() => {
                    setNavTargetRoom(currentStep.mapTargetId || null);
                    setPatientPage('navigation');
                  }}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold min-h-[46px]"
                >
                  <MapPin className="w-4 h-4" />
                  {language === 'hi' ? 'यहाँ जाने का रास्ता देखें' : 'Show Hospital Directions'}
                </button>
              )}
              {currentStep.id === 'step-report-ready' && (
                <button
                  type="button"
                  onClick={() => setPatientPage('reports')}
                  className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-800 text-sm font-semibold min-h-[46px]"
                >
                  {language === 'hi' ? 'पुरानी रिपोर्ट्स देखें' : 'View Reports'}
                </button>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200/70 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs sm:text-sm text-slate-700">
            <span>
              <strong>{language === 'hi' ? 'स्थान:' : 'Location:'}</strong>{' '}
              {language === 'hi' ? currentStep.locationHi : currentStep.locationEn}
            </span>
            <span>
              <strong>{language === 'hi' ? 'अनुमानित समय:' : 'Expected Duration:'}</strong>{' '}
              {currentStep.expectedDuration}
            </span>
            <span>
              <strong>{language === 'hi' ? 'अगला कदम:' : 'Next Action:'}</strong>{' '}
              {language === 'hi' ? currentStep.nextActionHi : currentStep.nextActionEn}
            </span>
          </div>
        </section>
      )}

      {/* Full 9-Step Visual Journey Timeline */}
      <section className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">
        {journeySteps.map((step) => {
          const isHighlighted = step.status === 'In Progress' || step.status === 'Delayed';
          return (
            <div
              key={step.id}
              className={`p-5 sm:p-6 flex flex-col md:flex-row md:items-start justify-between gap-4 ${
                isHighlighted ? 'bg-slate-50/70' : ''
              }`}
            >
              <div className="flex items-start gap-4 flex-1">
                <div className="pt-0.5">{renderStatusIcon(step.status)}</div>
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="font-mono">Step 0{step.order}</span>
                    <span>·</span>
                    <span
                      className={`font-semibold ${
                        step.status === 'Completed'
                          ? 'text-emerald-700'
                          : step.status === 'Delayed'
                          ? 'text-amber-700'
                          : step.status === 'In Progress'
                          ? 'text-teal-700'
                          : 'text-slate-500'
                      }`}
                    >
                      {step.status}
                    </span>
                    <span>·</span>
                    <span>{language === 'hi' ? step.locationHi : step.locationEn}</span>
                    {step.completedAt && (
                      <>
                        <span>·</span>
                        <span className="font-mono">Done {step.completedAt}</span>
                      </>
                    )}
                  </div>

                  <h4 className="font-display text-base sm:text-lg font-bold text-slate-900">
                    {language === 'hi' ? step.titleHi : step.titleEn}
                  </h4>

                  <p className="text-sm text-slate-600 leading-relaxed">
                    {language === 'hi' ? step.instructionsHi : step.instructionsEn}
                  </p>

                  {step.status === 'Delayed' && (step.delayNoteEn || step.delayNoteHi) && (
                    <div className="mt-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs sm:text-sm text-amber-950">
                      {language === 'hi' ? step.delayNoteHi : step.delayNoteEn}
                    </div>
                  )}

                  <p className="text-xs text-slate-500 pt-1">
                    <strong>{language === 'hi' ? 'अगला कदम:' : 'Next:'}</strong>{' '}
                    {language === 'hi' ? step.nextActionHi : step.nextActionEn} · Est.{' '}
                    {step.expectedDuration}
                  </p>
                </div>
              </div>

              {step.mapTargetId && (
                <button
                  type="button"
                  onClick={() => {
                    setNavTargetRoom(step.mapTargetId || null);
                    setPatientPage('navigation');
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 whitespace-nowrap self-start min-h-[40px]"
                >
                  <MapPin className="w-3.5 h-3.5 text-teal-700" />
                  {language === 'hi' ? 'नक्शा देखें' : 'View on Map'}
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              )}
            </div>
          );
        })}
      </section>

      <p className="text-xs text-slate-500 text-center">
        {language === 'hi'
          ? `मरीज़: ${patient.nameHi} · यह टाइमलाइन अस्पताल स्टाफ के अपडेट के साथ तुरंत बदलती है।`
          : `Patient: ${patient.name} · Timeline automatically syncs when Hospital Staff update your visit status.`}
      </p>
    </div>
  );
}
