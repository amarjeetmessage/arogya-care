import React, { useState } from 'react';
import {
  LayoutDashboard,
  Calendar,
  FileText,
  Pill,
  User,
  LogOut,
  CheckCircle2,
  Building2,
  Plus,
  Send,
  Stethoscope,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ASSETS } from '../data/mockData';
import { BrandMark } from '../components/BrandMark';

export function DoctorPortal() {
  const {
    authUser,
    appointments,
    reports,
    patient,
    staffPatients,
    updateAppointmentStatus,
    addMedicine,
    syncStaffPatientStage,
    setPortalMode,
    logout,
    pushToast,
  } = useApp();

  const [tab, setTab] = useState<'dashboard' | 'appointments' | 'records' | 'prescribe'>('dashboard');
  const [selectedPatientName, setSelectedPatientName] = useState(patient.name);

  // Quick Digital Prescription Writer (syncs straight into patient's My Medicines!)
  const [rxName, setRxName] = useState('');
  const [rxDosage, setRxDosage] = useState('1 Tablet');
  const [rxSlot, setRxSlot] = useState<'Morning' | 'Afternoon' | 'Night'>('Morning');
  const [rxTime, setRxTime] = useState('08:30 AM');
  const [rxInstructions, setRxInstructions] = useState('Take after breakfast with plain water.');

  const doctorName =
    authUser && authUser.role === 'doctor' ? authUser.fullName : 'Dr. Meera Sharma';

  const doctorAppointments = appointments.filter((a) => a.status !== 'Cancelled');
  const pendingReportsCount = reports.length;
  const completedTodayCount = appointments.filter((a) => a.status === 'Completed').length + 8;

  const handleIssuePrescription = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rxName.trim()) return;
    addMedicine({
      name: rxName.trim(),
      dosage: rxDosage.trim(),
      scheduleSlot: rxSlot,
      time: rxTime,
      frequency: 'Daily',
      duration: '30 Days',
      instructionsEn: rxInstructions.trim(),
      instructionsHi: rxInstructions.trim(),
      prescribedBy: doctorName,
      prescribedDate: '22 Nov 2026',
    });
    syncStaffPatientStage(patient.id, 'Pharmacy', false);
    setRxName('');
    pushToast(
      `Prescription sent to ${selectedPatientName}'s Aarogya Care app & Journey moved to Pharmacy.`
    );
  };

  return (
    <div className="min-h-screen bg-[#F6F9FC] flex flex-col lg:flex-row">
      {/* Left Sidebar (Panel #16 Doctor Portal inspiration) */}
      <aside className="lg:w-64 bg-white border-b lg:border-b-0 lg:border-r border-slate-200 lg:fixed lg:inset-y-0 flex flex-col justify-between z-20">
        <div>
          <div className="h-16 px-5 flex items-center border-b border-slate-200">
            <button type="button" onClick={() => setPortalMode('landing')}>
              <BrandMark label="Doctor Portal" />
            </button>
          </div>

          <div className="p-4 border-b border-slate-100 flex items-center gap-3">
            <img
              src={ASSETS.doctorMeera}
              alt={doctorName}
              referrerPolicy="no-referrer"
              className="w-11 h-11 rounded-xl object-cover border border-slate-200"
            />
            <div className="min-w-0">
              <p className="font-display text-sm font-bold text-slate-900 truncate">{doctorName}</p>
              <p className="text-xs text-slate-500 truncate">General Medicine · Room 102</p>
            </div>
          </div>

          <nav className="p-3 flex lg:flex-col gap-1 overflow-x-auto">
            {[
              { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
              { id: 'appointments' as const, label: 'Appointments', icon: Calendar },
              { id: 'records' as const, label: 'Patient Records', icon: FileText },
              { id: 'prescribe' as const, label: 'Write Prescription', icon: Pill },
            ].map((item) => {
              const Icon = item.icon;
              const active = tab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id)}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap min-h-[42px] ${
                    active
                      ? 'bg-teal-50 text-teal-800 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="hidden lg:block p-4 border-t border-slate-200 space-y-2">
          <button
            type="button"
            onClick={() => setPortalMode('patient')}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-teal-700 text-white text-xs font-semibold min-h-[40px]"
          >
            <User className="w-4 h-4" />
            Switch to Patient View
          </button>
          <button
            type="button"
            onClick={() => setPortalMode('hospital')}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-50"
          >
            <Building2 className="w-4 h-4" />
            Hospital Admin Panel
          </button>
          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs text-slate-500 hover:bg-slate-100"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:pl-64 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold text-slate-900">
              Welcome, {doctorName}
            </h1>
            <p className="text-sm text-slate-600">
              Sanjeevani Multi-Specialty Hospital · OPD Room 102 · Sunday, 22 Nov 2026
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setTab('prescribe')}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold min-h-[42px]"
            >
              <Plus className="w-4 h-4" />
              New Prescription
            </button>
          </div>
        </div>

        {/* 3 Top Doctor Portal KPI Cards (Panel #16) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500">Today’s Patients</p>
              <p className="font-mono text-3xl font-bold text-slate-900 tabular-nums mt-1">
                {doctorAppointments.length + 8}
              </p>
            </div>
            <Stethoscope className="w-7 h-7 text-teal-700" />
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500">Pending Reports to Review</p>
              <p className="font-mono text-3xl font-bold text-amber-700 tabular-nums mt-1">
                {pendingReportsCount}
              </p>
            </div>
            <FileText className="w-7 h-7 text-amber-600" />
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500">Consultations Done</p>
              <p className="font-mono text-3xl font-bold text-emerald-700 tabular-nums mt-1">
                {completedTodayCount}
              </p>
            </div>
            <CheckCircle2 className="w-7 h-7 text-emerald-600" />
          </div>
        </div>

        {/* DASHBOARD / APPOINTMENTS QUEUE */}
        {(tab === 'dashboard' || tab === 'appointments') && (
          <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <h2 className="font-display text-lg font-bold text-slate-900">
              Recent & Upcoming Patients
            </h2>
            <div className="divide-y divide-slate-100">
              {doctorAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <p className="text-xs font-mono text-slate-500">
                      Token {apt.tokenNumber} · {apt.time} · {apt.status}
                    </p>
                    <p className="font-display font-bold text-slate-900">
                      {apt.patientName} ({apt.patientAge} yrs)
                    </p>
                    <p className="text-xs text-slate-600">{apt.notes || apt.department}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPatientName(apt.patientName);
                        setTab('records');
                      }}
                      className="px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 hover:bg-slate-50 min-h-[38px]"
                    >
                      View Record
                    </button>
                    {apt.status !== 'Completed' && (
                      <button
                        type="button"
                        onClick={() => {
                          updateAppointmentStatus(apt.id, 'Completed');
                          pushToast(`Marked ${apt.patientName} consultation completed.`);
                        }}
                        className="px-3.5 py-2 rounded-xl bg-teal-700 text-white text-xs font-semibold hover:bg-teal-800 min-h-[38px]"
                      >
                        Complete Visit
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* PATIENT RECORDS VIEW */}
        {tab === 'records' && (
          <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <p className="text-xs text-slate-500">Active Patient Chart</p>
                <h2 className="font-display text-xl font-bold text-slate-900">
                  {selectedPatientName} ({patient.age} yrs · {patient.bloodGroup})
                </h2>
                <p className="text-xs text-amber-800 font-medium mt-0.5">
                  Allergies: {patient.allergies.join(', ')} · Conditions:{' '}
                  {patient.chronicConditions.join(', ')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  syncStaffPatientStage(patient.id, 'Doctor Review', false);
                  pushToast('Patient notified: Doctor is reviewing your lab report now.');
                }}
                className="px-4 py-2 rounded-xl bg-teal-50 text-teal-800 border border-teal-200 text-xs font-semibold min-h-[40px]"
              >
                Mark Journey: Doctor Review Active
              </button>
            </div>

            <div className="space-y-3">
              {reports.slice(0, 3).map((rep) => (
                <div
                  key={rep.id}
                  className="p-4 rounded-xl bg-[#FAFBF9] border border-slate-200 space-y-1.5"
                >
                  <p className="text-xs text-slate-500">
                    {rep.category} · {rep.date} · {rep.hospital}
                  </p>
                  <p className="font-display font-bold text-slate-900">{rep.title}</p>
                  <p className="text-sm text-slate-700">{rep.summaryEn}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* DIGITAL PRESCRIPTION WRITER (LIVE SYNCED WITH PATIENT MEDICINES) */}
        {tab === 'prescribe' && (
          <form
            onSubmit={handleIssuePrescription}
            className="bg-white rounded-2xl border border-slate-200 p-6 max-w-2xl space-y-4"
          >
            <div>
              <h2 className="font-display text-lg font-bold text-slate-900">
                Issue Digital Prescription to Patient App
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Patient: {selectedPatientName} · Appears immediately in the patient’s “My Medicines”
                schedule and Notifications.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Medicine Name & Strength
                </label>
                <input
                  type="text"
                  required
                  value={rxName}
                  onChange={(e) => setRxName(e.target.value)}
                  placeholder="e.g., Tab. Folic Acid 5 mg"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Dosage</label>
                <input
                  type="text"
                  value={rxDosage}
                  onChange={(e) => setRxDosage(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Time of Day
                </label>
                <select
                  value={rxSlot}
                  onChange={(e) => setRxSlot(e.target.value as 'Morning' | 'Afternoon' | 'Night')}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm"
                >
                  <option value="Morning">Morning</option>
                  <option value="Afternoon">Afternoon</option>
                  <option value="Night">Night</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reminder Time
                </label>
                <input
                  type="text"
                  value={rxTime}
                  onChange={(e) => setRxTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Instructions
                </label>
                <input
                  type="text"
                  value={rxInstructions}
                  onChange={(e) => setRxInstructions(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold min-h-[46px]"
            >
              <Send className="w-4 h-4" />
              Send Prescription & Notify Patient
            </button>
          </form>
        )}

        {/* Active Hospital Patients Quick Reference */}
        <p className="text-xs text-slate-400">
          Synced with Sanjeevani Hospital Queue ({staffPatients.length} active OPD patients today)
        </p>
      </main>
    </div>
  );
}
