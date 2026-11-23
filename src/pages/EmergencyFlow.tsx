import React, { useState } from 'react';
import {
  AlertCircle,
  Phone,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Building2,
  Clock,
  Navigation,
  FileCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useT } from '../i18n/translations';
import { EmergencyStage } from '../types/healthcare';

const EMERGENCY_CATEGORIES = [
  { id: 'Chest Pain / Cardiac', labelEn: 'Chest Pain / Heart', labelHi: 'सीने में दर्द / हृदय' },
  { id: 'Breathing Difficulty', labelEn: 'Breathing Difficulty', labelHi: 'सांस लेने में तकलीफ' },
  { id: 'Accident & Injury', labelEn: 'Accident / Severe Injury', labelHi: 'दुर्घटना / गंभीर चोट' },
  { id: 'Stroke / Weakness', labelEn: 'Sudden Weakness / Slurred Speech', labelHi: 'अचानक कमजोरी / चक्कर' },
  { id: 'High Fever / Fainting', labelEn: 'High Fever / Unconscious', labelHi: 'तेज बुखार / बेहोशी' },
  { id: 'Other Emergency', labelEn: 'Other Urgent Need', labelHi: 'अन्य आपात स्थिति' },
];

const EMERGENCY_STAGES: EmergencyStage[] = [
  'Alert Sent',
  'Hospital Notified',
  'Hospital Acknowledged',
  'Preparation Started',
  'Patient En Route',
  'Patient Arrived',
];

export function EmergencyFlow() {
  const {
    language,
    patient,
    hospitals,
    emergencyAlerts,
    activePatientEmergencyId,
    createEmergencyAlert,
    updateEmergencyStage,
    clearActivePatientEmergency,
    setPortalMode,
    setHospitalPage,
    pushToast,
  } = useApp();
  const t = useT(language);

  const activeAlert = emergencyAlerts.find((a) => a.id === activePatientEmergencyId) || null;

  const [category, setCategory] = useState(EMERGENCY_CATEGORIES[0].id);
  const [description, setDescription] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [patientName, setPatientName] = useState(patient.name);
  const [patientAge, setPatientAge] = useState(String(patient.age));
  const [contactPhone, setContactPhone] = useState(patient.phone);
  const [locationText, setLocationText] = useState('');
  const [coordinates, setCoordinates] = useState<string | undefined>(undefined);
  const [shareRecords, setShareRecords] = useState(true);
  const [selectedHospitalId, setSelectedHospitalId] = useState(hospitals[0].id);

  const handleShareLocation = () => {
    setLocationText('Sector 14, Indiranagar, Lucknow (Near Polytechnic Chauraha)');
    setCoordinates('26.8789° N, 80.9921° E');
    pushToast(
      language === 'hi'
        ? 'वर्तमान लोकेशन (डेमो) जुड़ गई है।'
        : 'Current location shared (Prototype simulated coordinates).',
      'info'
    );
  };

  const handleSendEmergencyAlert = (e: React.FormEvent) => {
    e.preventDefault();
    const chosenHospital = hospitals.find((h) => h.id === selectedHospitalId) || hospitals[0];
    createEmergencyAlert({
      patientName: patientName.trim() || patient.name,
      patientAge: Number(patientAge) || patient.age,
      contactNumber: contactPhone.trim() || patient.phone,
      category,
      description: description.trim() || `${category} reported via Emergency Help`,
      symptoms: symptoms.trim() || 'Requested immediate receiving preparation',
      locationText: locationText.trim() || 'Indiranagar, Lucknow (Manual entry)',
      coordinates,
      sharedMedicalSummary: shareRecords,
      allergies: shareRecords ? patient.allergies.join(', ') : undefined,
      currentMeds: shareRecords ? 'Telmisartan 40mg, Metformin 500mg SR' : undefined,
      hospitalId: chosenHospital.id,
      hospitalName: chosenHospital.name,
    });
    pushToast(
      language === 'hi'
        ? `${chosenHospital.nameHi} को इमरजेंसी अलर्ट भेज दिया गया है।`
        : `Emergency coordination alert sent to ${chosenHospital.name}.`,
      'warning'
    );
  };

  const currentStageIndex = activeAlert ? EMERGENCY_STAGES.indexOf(activeAlert.stage) : -1;

  return (
    <div className="space-y-6">
      {/* Mandatory Life-Threatening Emergency Disclaimer Banner */}
      <div className="rounded-2xl bg-red-600 text-white p-5 sm:p-6 space-y-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h2 className="font-display text-lg sm:text-xl font-bold">
              {language === 'hi' ? 'इमरजेंसी सहायता (आपातकालीन समन्वय)' : 'Emergency Assistance'}
            </h2>
            <p className="text-sm sm:text-base text-red-50 leading-relaxed font-medium">
              {t.common.emergencyDisclaimer}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <a
            href="tel:108"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-red-700 font-bold text-sm hover:bg-red-50 min-h-[46px]"
          >
            <Phone className="w-4 h-4" />
            {language === 'hi' ? '108 एम्बुलेंस कॉल करें' : 'Call 108 (Ambulance)'}
          </a>
          <a
            href="tel:112"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-red-700 border border-red-400 text-white font-semibold text-sm hover:bg-red-800 min-h-[46px]"
          >
            <Phone className="w-4 h-4" />
            {language === 'hi' ? '112 इमरजेंसी हेल्पलाइन' : 'Call 112 (Emergency)'}
          </a>
        </div>
      </div>

      {/* Prototype Simulation Honesty Notice */}
      <div className="px-4 py-3 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-700 flex items-center justify-between gap-3 flex-wrap">
        <span>
          {language === 'hi'
            ? 'प्रोटोटाइप सिमुलेशन: यह स्क्रीन अस्पताल के साथ समन्वय डेमो दिखाती है। यह वास्तविक लाइव एम्बुलेंस डिस्पैच या बेड बुकिंग नहीं है।'
            : 'Simulated Prototype Workflow: Demonstrates patient-to-hospital emergency coordination. Does not dispatch real ambulances or verify live hospital beds.'}
        </span>
      </div>

      {!activeAlert ? (
        /* FAST MINIMAL-TYPING EMERGENCY COORDINATION FORM */
        <form onSubmit={handleSendEmergencyAlert} className="space-y-6">
          {/* Step 1: What happened? (Large visual category buttons) */}
          <section className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-4">
            <h3 className="font-display text-lg font-bold text-slate-900">
              {language === 'hi' ? '1. क्या हुआ है? (एक विकल्प चुनें)' : '1. What happened? (Tap a category)'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {EMERGENCY_CATEGORIES.map((cat) => {
                const selected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`p-4 rounded-xl border text-left font-semibold text-sm min-h-[56px] transition-colors ${
                      selected
                        ? 'border-red-600 bg-red-50 text-red-900'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    {language === 'hi' ? cat.labelHi : cat.labelEn}
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {language === 'hi' ? 'संक्षिप्त विवरण (वैकल्पिक)' : 'Short note on what happened (Optional)'}
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={
                    language === 'hi'
                      ? 'जैसे: अचानक सीने में जकड़न और पसीना'
                      : 'e.g., Sudden chest tightness while resting'
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-red-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {language === 'hi' ? 'प्रमुख लक्षण (वैकल्पिक)' : 'Visible Symptoms (Optional)'}
                </label>
                <input
                  type="text"
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder={
                    language === 'hi' ? 'जैसे: चक्कर आना, सांस फूलना' : 'e.g., Sweating, dizziness'
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-red-600 focus:outline-none"
                />
              </div>
            </div>
          </section>

          {/* Step 2: Location & Patient Info */}
          <section className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-4">
            <h3 className="font-display text-lg font-bold text-slate-900">
              {language === 'hi' ? '2. लोकेशन और मरीज़ की जानकारी' : '2. Location & Patient Contact'}
            </h3>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleShareLocation}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold min-h-[48px] whitespace-nowrap"
              >
                <Navigation className="w-4 h-4" />
                {language === 'hi' ? 'वर्तमान लोकेशन साझा करें' : 'Share Current Location'}
              </button>
              <input
                type="text"
                required
                value={locationText}
                onChange={(e) => setLocationText(e.target.value)}
                placeholder={
                  language === 'hi'
                    ? 'या अपना पता / लैंडमार्क यहाँ लिखें...'
                    : 'Or enter current street / landmark manually...'
                }
                className="flex-1 px-4 py-3 rounded-xl border border-slate-300 text-sm focus:border-teal-600 focus:outline-none"
              />
            </div>
            {coordinates && (
              <p className="text-xs text-teal-800 font-mono">
                Location captured (Simulated): {coordinates}
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === 'hi' ? 'मरीज़ का नाम' : 'Patient Name'}
                </label>
                <input
                  type="text"
                  required
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === 'hi' ? 'उम्र' : 'Age'}
                </label>
                <input
                  type="number"
                  value={patientAge}
                  onChange={(e) => setPatientAge(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === 'hi' ? 'संपर्क नंबर' : 'Contact Number'}
                </label>
                <input
                  type="tel"
                  required
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                />
              </div>
            </div>

            <label className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={shareRecords}
                onChange={(e) => setShareRecords(e.target.checked)}
                className="mt-1 w-4 h-4 accent-teal-700"
              />
              <div className="text-sm">
                <span className="font-semibold text-slate-900">
                  {language === 'hi'
                    ? 'अस्पताल के साथ ज़रूरी मेडिकल जानकारी साझा करें'
                    : 'Share relevant medical records with receiving hospital'}
                </span>
                <p className="text-xs text-slate-600 mt-0.5">
                  Blood Group: {patient.bloodGroup} · Allergies: {patient.allergies.join(', ')} ·
                  Conditions: {patient.chronicConditions.join(', ')}
                </p>
              </div>
            </label>
          </section>

          {/* Step 3: Select Receiving Hospital */}
          <section className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-4">
            <h3 className="font-display text-lg font-bold text-slate-900">
              {language === 'hi'
                ? '3. नजदीकी अस्पताल चुनें'
                : '3. Select Nearby Receiving Hospital'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {hospitals.map((h) => {
                const selected = selectedHospitalId === h.id;
                return (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => setSelectedHospitalId(h.id)}
                    className={`p-4 rounded-xl border text-left space-y-1.5 transition-colors ${
                      selected
                        ? 'border-red-600 bg-red-50/50'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <p className="text-xs font-mono text-slate-500">
                      {h.distanceKm} km · 24x7 Emergency Unit
                    </p>
                    <p className="font-display font-bold text-slate-900 text-sm">
                      {language === 'hi' ? h.nameHi : h.name}
                    </p>
                    <p className="text-xs text-slate-600">{h.address}</p>
                    <p className="text-xs font-medium text-red-700 pt-1">
                      ER Desk: {h.emergencyPhone}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
              <p className="text-xs text-slate-500">
                {language === 'hi'
                  ? 'अस्पताल का योग्य मेडिकल स्टाफ सभी क्लिनिकल प्राथमिकता तय करता है।'
                  : 'All clinical triage and prioritization remains strictly under qualified hospital medical staff.'}
              </p>
              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-base min-h-[52px]"
              >
                {language === 'hi'
                  ? 'अस्पताल को इमरजेंसी अलर्ट भेजें'
                  : 'Send Emergency Coordination Alert'}
              </button>
            </div>
          </section>
        </form>
      ) : (
        /* LIVE EMERGENCY STATUS & HOSPITAL READINESS PANEL */
        <div className="space-y-6">
          <section className="bg-white rounded-2xl border border-red-200 p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
              <div>
                <p className="text-xs font-semibold text-red-700">
                  {language === 'hi'
                    ? `सक्रिय इमरजेंसी समन्वय · समय ${activeAlert.createdAt}`
                    : `Active Emergency Alert · Sent at ${activeAlert.createdAt}`}
                </p>
                <h3 className="font-display text-2xl font-bold text-slate-900 mt-0.5">
                  {activeAlert.hospitalName}
                </h3>
                <p className="text-sm text-slate-600 mt-0.5">
                  {activeAlert.category} · {activeAlert.patientName} ({activeAlert.patientAge} yrs)
                </p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-xs text-slate-500">
                  {language === 'hi' ? 'अनुमानित पहुँच समय' : 'Estimated Arrival'}
                </p>
                <p className="font-mono text-2xl font-bold text-slate-900 tabular-nums">
                  {activeAlert.stage === 'Patient Arrived' ? 'Arrived' : `~${activeAlert.etaMins} mins`}
                </p>
              </div>
            </div>

            {/* 6-Stage Emergency Progress Tracker */}
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-3">
                {language === 'hi' ? 'इमरजेंसी स्थिति' : 'Emergency Alert Status'}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                {EMERGENCY_STAGES.map((st, idx) => {
                  const completed = idx <= currentStageIndex;
                  const current = idx === currentStageIndex;
                  return (
                    <div
                      key={st}
                      className={`p-3 rounded-xl border text-xs ${
                        current
                          ? 'border-red-600 bg-red-50 text-red-900 font-bold'
                          : completed
                          ? 'border-emerald-200 bg-emerald-50/60 text-emerald-900 font-semibold'
                          : 'border-slate-200 bg-slate-50 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono">0{idx + 1}</span>
                        {completed && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
                      </div>
                      <p className="leading-snug">{st}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Simulated Hospital Readiness Panel */}
            <div className="rounded-xl bg-[#FAFBF9] border border-slate-200 p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-teal-700" />
                  {language === 'hi'
                    ? 'अस्पताल तैयारी पैनल (सिमुलेटेड डेमो)'
                    : 'Hospital Readiness Panel (Simulated Prototype)'}
                </h4>
                <span className="text-xs text-slate-500">
                  Synced live with Hospital Staff Portal
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="text-xs text-slate-500">Alert Received</p>
                  <p className="font-semibold text-emerald-700">Yes · {activeAlert.createdAt}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-500">Staff Notified</p>
                  <p className="font-semibold text-slate-900">
                    {activeAlert.acknowledgedBy || 'ER Reception Desk Alerted'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-500">Receiving Team</p>
                  <p className="font-semibold text-slate-900">
                    {activeAlert.receivingTeam || 'Awaiting ER Staff Assignment'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-500">Receiving Area</p>
                  <p className="font-semibold text-slate-900">
                    {activeAlert.receivingBay || 'Pending Preparation'}
                  </p>
                </div>
              </div>

              {activeAlert.sharedMedicalSummary && (
                <div className="pt-3 border-t border-slate-200 flex items-center gap-2 text-xs text-slate-700">
                  <FileCheck className="w-4 h-4 text-teal-700 shrink-0" />
                  <span>
                    Medical Summary Shared — Allergies: <strong>{activeAlert.allergies}</strong> ·
                    Meds: {activeAlert.currentMeds}
                  </span>
                </div>
              )}
            </div>

            {/* Patient Actions + Demo Switch to Staff Portal */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex flex-wrap gap-2.5">
                {activeAlert.stage !== 'Patient En Route' &&
                  activeAlert.stage !== 'Patient Arrived' && (
                    <button
                      type="button"
                      onClick={() => {
                        updateEmergencyStage(activeAlert.id, 'Patient En Route', { etaMins: 7 });
                        pushToast('Status updated: Patient En Route to Hospital.', 'info');
                      }}
                      className="px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold min-h-[44px]"
                    >
                      {language === 'hi' ? 'हम रास्ते में हैं (En Route)' : 'Mark: We Are En Route'}
                    </button>
                  )}

                {activeAlert.stage !== 'Patient Arrived' && (
                  <button
                    type="button"
                    onClick={() => {
                      updateEmergencyStage(activeAlert.id, 'Patient Arrived', { etaMins: 0 });
                      pushToast('Arrival recorded at Emergency Entrance.', 'success');
                    }}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 text-sm font-semibold min-h-[44px]"
                  >
                    {language === 'hi' ? 'अस्पताल पहुंच गए' : 'Mark: Arrived at Hospital'}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setHospitalPage('emergency');
                    setPortalMode('hospital');
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold min-h-[44px]"
                >
                  <Building2 className="w-4 h-4" />
                  {language === 'hi'
                    ? 'डेमो: हॉस्पिटल स्टाफ से अलर्ट स्वीकार करें'
                    : 'Demo: Acknowledge as Hospital Staff'}
                </button>
              </div>

              <button
                type="button"
                onClick={clearActivePatientEmergency}
                className="text-xs font-medium text-slate-500 hover:text-slate-900 underline"
              >
                {language === 'hi' ? 'नया अलर्ट शुरू करें' : 'Close / Start New Demo Alert'}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
