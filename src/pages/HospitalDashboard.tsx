import React, { useState } from 'react';
import {
  LayoutDashboard,
  AlertCircle,
  Calendar,
  Users,
  Route,
  Building2,
  FlaskConical,
  BedDouble,
  BarChart3,
  Settings,
  User,
  LogOut,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  Menu,
  X,
  Stethoscope,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { useApp } from '../context/AppContext';
import {
  HOSPITAL_ANALYTICS_DATA,
  HOSPITAL_RESOURCES_SIMULATED,
} from '../data/mockData';
import {
  AppointmentStatus,
  HospitalPage,
  HospitalRole,
  StaffPatientRecord,
} from '../types/healthcare';
import { BrandMark } from '../components/BrandMark';

const ROLES: HospitalRole[] = [
  'Administrator',
  'Receptionist',
  'Doctor',
  'Nurse',
  'Laboratory Staff',
];

const WORKFLOW_STAGES: StaffPatientRecord['currentStage'][] = [
  'Registered',
  'Consultation',
  'Laboratory',
  'Report Pending',
  'Doctor Review',
  'Pharmacy',
  'Discharged',
  'Follow-up',
];

export function HospitalDashboard() {
  const {
    hospitalPage,
    setHospitalPage,
    hospitalRole,
    setHospitalRole,
    setPortalMode,
    setPatientPage,
    hospitals,
    doctors,
    appointments,
    emergencyAlerts,
    staffPatients,
    updateAppointmentStatus,
    updateEmergencyStage,
    syncStaffPatientStage,
    updateHospitalBookingWindow,
    loginDemoRole,
    logout,
    pushToast,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | AppointmentStatus>('All');

  // Configurable Early Booking Window form state (Sanjeevani Hospital)
  const primaryHospital = hospitals[0];
  const [winStart, setWinStart] = useState(primaryHospital.earlyBookingWindow.startHour);
  const [winEnd, setWinEnd] = useState(primaryHospital.earlyBookingWindow.endHour);
  const [opdStart, setOpdStart] = useState(primaryHospital.earlyBookingWindow.opdStartHour);

  const navItems: {
    id: HospitalPage;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
  }[] = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    {
      id: 'emergency',
      label: 'Emergency Alerts',
      icon: AlertCircle,
      badge: emergencyAlerts.filter((a) => a.stage !== 'Patient Arrived').length,
    },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'patients', label: 'Patients', icon: Users },
    { id: 'journeys', label: 'Patient Journeys', icon: Route },
    { id: 'departments', label: 'Departments', icon: Building2 },
    { id: 'laboratory', label: 'Laboratory', icon: FlaskConical },
    { id: 'resources', label: 'Resources', icon: BedDouble },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const todayAppointmentsCount = appointments.filter((a) => a.status !== 'Cancelled').length;
  const waitingCount = appointments.filter((a) => a.status === 'Waiting').length;
  const checkedInCount = appointments.filter(
    (a) => a.status === 'Checked In' || a.status === 'In Consultation'
  ).length;
  const pendingReportsCount = staffPatients.filter(
    (p) => p.currentStage === 'Laboratory' || p.currentStage === 'Report Pending'
  ).length;
  const activeEmergencyCount = emergencyAlerts.filter((e) => e.stage !== 'Patient Arrived').length;
  const delayedJourneysCount = staffPatients.filter((p) => p.delayed).length;

  const filteredAppointments = appointments.filter((a) => {
    const matchesSearch =
      !searchQuery.trim() ||
      a.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.tokenNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.doctorName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSaveBookingWindow = (e: React.FormEvent) => {
    e.preventDefault();
    updateHospitalBookingWindow(primaryHospital.id, winStart, winEnd, opdStart);
    pushToast('Early OPD booking window updated and synced to Patient Booking flow.');
  };

  return (
    <div className="min-h-screen bg-[#FAFBF9] flex flex-col lg:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white border-r border-slate-200 z-30">
        <div className="h-16 px-5 flex items-center border-b border-slate-200">
          <button type="button" onClick={() => setPortalMode('landing')}>
            <BrandMark label="Aarogya Staff" />
          </button>
        </div>

        {/* Role Switcher */}
        <div className="p-4 border-b border-slate-100 space-y-1.5">
          <label className="block text-xs font-medium text-slate-500">Active Staff Role</label>
          <select
            value={hospitalRole}
            onChange={(e) => {
              const r = e.target.value as HospitalRole;
              setHospitalRole(r);
              if (r === 'Laboratory Staff') setHospitalPage('laboratory');
              else if (r === 'Receptionist') setHospitalPage('appointments');
              else if (r === 'Nurse') setHospitalPage('emergency');
              else setHospitalPage('overview');
            }}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-sm font-semibold text-slate-900"
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <p className="text-xs text-slate-500 truncate">Sanjeevani Hospital · Lucknow</p>
        </div>

        {/* Sidebar Links */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto" aria-label="Hospital Staff Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = hospitalPage === item.id;
            const isEmergency = item.id === 'emergency';
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setHospitalPage(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors min-h-[42px] ${
                  active
                    ? isEmergency
                      ? 'bg-red-50 text-red-800 font-semibold'
                      : 'bg-teal-50 text-teal-800 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span className="flex items-center gap-3 truncate">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isEmergency
                        ? 'text-red-600'
                        : active
                        ? 'text-teal-700'
                        : 'text-slate-400'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="font-mono text-xs font-bold text-red-700">{item.badge}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Role Switch & Logout */}
        <div className="p-4 border-t border-slate-200 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => loginDemoRole('patient', 'dashboard')}
              className="flex items-center justify-center gap-1.5 px-2.5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold min-h-[40px]"
            >
              <User className="w-3.5 h-3.5 shrink-0" />
              Patient
            </button>
            <button
              type="button"
              onClick={() => loginDemoRole('doctor')}
              className="flex items-center justify-center gap-1.5 px-2.5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold min-h-[40px]"
            >
              <Stethoscope className="w-3.5 h-3.5 shrink-0" />
              Doctor
            </button>
          </div>
          <button
            type="button"
            onClick={() => logout()}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="sticky top-0 z-20 h-16 bg-white border-b border-slate-200 px-4 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 min-w-[40px] min-h-[40px] flex items-center justify-center"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <p className="text-xs text-slate-500 truncate">
                Sanjeevani Multi-Specialty Hospital / {hospitalRole}
              </p>
              <h1 className="font-display text-base sm:text-lg font-bold text-slate-900 capitalize truncate">
                {navItems.find((n) => n.id === hospitalPage)?.label}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {activeEmergencyCount > 0 && hospitalPage !== 'emergency' && (
              <button
                type="button"
                onClick={() => setHospitalPage('emergency')}
                className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold whitespace-nowrap min-h-[40px]"
              >
                {activeEmergencyCount} Active Emergency
              </button>
            )}
            <button
              type="button"
              onClick={() => setPortalMode('patient')}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold whitespace-nowrap min-h-[40px]"
            >
              <User className="w-4 h-4 text-teal-700" />
              Patient Portal
            </button>
          </div>
        </header>

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* 1. OVERVIEW */}
          {hospitalPage === 'overview' && (
            <div className="space-y-6">
              {/* 6 Operational KPI Strip */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
                {[
                  { label: "Today's Visits", val: todayAppointmentsCount, tone: 'text-slate-900' },
                  { label: 'Waiting Queue', val: waitingCount, tone: 'text-slate-900' },
                  { label: 'Checked In', val: checkedInCount, tone: 'text-teal-800' },
                  { label: 'Pending Reports', val: pendingReportsCount, tone: 'text-blue-800' },
                  { label: 'Emergency Alerts', val: activeEmergencyCount, tone: 'text-red-700' },
                  { label: 'Delayed Journeys', val: delayedJourneysCount, tone: 'text-amber-700' },
                ].map((kpi) => (
                  <div
                    key={kpi.label}
                    className="bg-white rounded-2xl border border-slate-200 p-4 space-y-1"
                  >
                    <p className="text-xs text-slate-500">{kpi.label}</p>
                    <p className={`font-mono text-2xl font-bold tabular-nums ${kpi.tone}`}>
                      {kpi.val}
                    </p>
                  </div>
                ))}
              </div>

              {/* Priority Emergency Alerts Preview */}
              <section className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    Incoming Emergency Coordination Alerts
                  </h2>
                  <button
                    type="button"
                    onClick={() => setHospitalPage('emergency')}
                    className="text-xs font-semibold text-red-700 hover:underline"
                  >
                    Open Emergency Desk
                  </button>
                </div>

                <div className="divide-y divide-slate-100">
                  {emergencyAlerts.map((emg) => (
                    <div
                      key={emg.id}
                      className="py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3"
                    >
                      <div className="space-y-0.5">
                        <p className="text-xs text-slate-500 font-mono">
                          {emg.createdAt} · ETA ~{emg.etaMins} mins · Stage:{' '}
                          <strong className="text-red-700">{emg.stage}</strong>
                        </p>
                        <p className="font-display font-bold text-slate-900">
                          {emg.patientName} ({emg.patientAge} yrs) — {emg.category}
                        </p>
                        <p className="text-xs text-slate-600">
                          {emg.locationText} · {emg.description}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setHospitalPage('emergency')}
                        className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold self-start md:self-center whitespace-nowrap min-h-[40px]"
                      >
                        Manage Readiness
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              {/* Delayed Patient Journeys Quick Action */}
              <section className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-lg font-bold text-slate-900">
                    Active Patient Journeys & Delays
                  </h2>
                  <button
                    type="button"
                    onClick={() => setHospitalPage('journeys')}
                    className="text-xs font-semibold text-teal-800 hover:underline"
                  >
                    Manage All Journeys
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-xs text-slate-500">
                        <th className="py-2.5 pr-4 font-semibold">Token</th>
                        <th className="py-2.5 pr-4 font-semibold">Patient</th>
                        <th className="py-2.5 pr-4 font-semibold">Department</th>
                        <th className="py-2.5 pr-4 font-semibold">Current Stage</th>
                        <th className="py-2.5 font-semibold text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {staffPatients.map((sp) => (
                        <tr key={sp.id}>
                          <td className="py-3 pr-4 font-mono font-semibold text-teal-800">
                            {sp.token}
                          </td>
                          <td className="py-3 pr-4 font-semibold text-slate-900">
                            {sp.name}
                            {sp.isPrimaryDemoPatient && (
                              <span className="ml-2 text-xs font-normal text-teal-700">
                                (Live Synced Demo Patient)
                              </span>
                            )}
                          </td>
                          <td className="py-3 pr-4 text-slate-600">{sp.department}</td>
                          <td className="py-3 pr-4 font-medium text-slate-800">
                            {sp.currentStage}
                          </td>
                          <td className="py-3 text-right">
                            <span
                              className={`text-xs font-semibold ${
                                sp.delayed ? 'text-amber-700' : 'text-emerald-700'
                              }`}
                            >
                              {sp.delayed ? 'Delayed' : 'On Track'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          )}

          {/* 2. EMERGENCY DASHBOARD */}
          {hospitalPage === 'emergency' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs sm:text-sm text-amber-950">
                <strong>Clinical Governance Notice:</strong> All triage and clinical prioritization
                decisions remain strictly under qualified medical staff. Status updates below
                immediately sync to the patient’s Emergency Coordination screen.
              </div>

              {emergencyAlerts.map((emg) => (
                <section
                  key={emg.id}
                  className="bg-white rounded-2xl border border-red-200 p-6 space-y-5"
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-4 border-b border-slate-100">
                    <div className="space-y-1">
                      <p className="text-xs font-mono text-red-700 font-semibold">
                        ALERT TIME: {emg.createdAt} · STAGE: {emg.stage.toUpperCase()}
                      </p>
                      <h3 className="font-display text-xl font-bold text-slate-900">
                        {emg.patientName} ({emg.patientAge} yrs) — {emg.category}
                      </h3>
                      <p className="text-sm text-slate-700">
                        <strong>Reported:</strong> {emg.description} · <strong>Symptoms:</strong>{' '}
                        {emg.symptoms}
                      </p>
                      <p className="text-xs text-slate-600">
                        <strong>Location:</strong> {emg.locationText} · <strong>Contact:</strong>{' '}
                        {emg.contactNumber}
                      </p>
                      {emg.sharedMedicalSummary && (
                        <p className="text-xs text-teal-800 font-medium pt-1">
                          Shared Medical Info — Allergies: {emg.allergies || 'None'} · Current Meds:{' '}
                          {emg.currentMeds || 'None'}
                        </p>
                      )}
                    </div>

                    <div className="text-left md:text-right shrink-0">
                      <p className="text-xs text-slate-500">Est. Arrival</p>
                      <p className="font-mono text-2xl font-bold text-slate-900 tabular-nums">
                        {emg.stage === 'Patient Arrived' ? 'ARRIVED' : `~${emg.etaMins} min`}
                      </p>
                    </div>
                  </div>

                  {/* Readiness Summary */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <div>
                      <p className="text-slate-500">Acknowledged By</p>
                      <p className="font-semibold text-slate-900 mt-0.5">
                        {emg.acknowledgedBy || 'Pending Acknowledgement'}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500">Receiving Team</p>
                      <p className="font-semibold text-slate-900 mt-0.5">
                        {emg.receivingTeam || 'Not Assigned Yet'}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500">Receiving Bay</p>
                      <p className="font-semibold text-slate-900 mt-0.5">
                        {emg.receivingBay || 'Not Prepared Yet'}
                      </p>
                    </div>
                  </div>

                  {/* Staff Coordination Actions */}
                  <div className="flex flex-wrap gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        updateEmergencyStage(emg.id, 'Hospital Acknowledged', {
                          acknowledgedBy: `${hospitalRole} (ER Desk)`,
                        });
                        pushToast(`Alert for ${emg.patientName} acknowledged.`);
                      }}
                      className="px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold min-h-[42px]"
                    >
                      1. Acknowledge Alert
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        updateEmergencyStage(emg.id, 'Preparation Started', {
                          acknowledgedBy: emg.acknowledgedBy || `${hospitalRole} (ER Desk)`,
                          receivingTeam: 'ER Team Alpha — Dr. Vivek Mishra & Nurse Anjali',
                          receivingBay: 'Emergency Bay 1 (ECG & Oxygen Ready)',
                          etaMins: 6,
                        });
                        pushToast(`Receiving team assigned & Bay 1 preparation started.`);
                      }}
                      className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold min-h-[42px]"
                    >
                      2. Assign Team & Start Preparation
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        updateEmergencyStage(emg.id, 'Patient En Route', { etaMins: 4 });
                        pushToast(`Marked ${emg.patientName} as En Route.`);
                      }}
                      className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold min-h-[42px]"
                    >
                      3. Confirm En Route
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        updateEmergencyStage(emg.id, 'Patient Arrived', { etaMins: 0 });
                        pushToast(`Patient arrival recorded for ${emg.patientName}.`);
                      }}
                      className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold min-h-[42px]"
                    >
                      4. Record Arrival
                    </button>
                  </div>
                </section>
              ))}
            </div>
          )}

          {/* 3. APPOINTMENT MANAGEMENT */}
          {hospitalPage === 'appointments' && (
            <section className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search token, patient, or doctor..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(['All', 'Booked', 'Checked In', 'Waiting', 'In Consultation', 'Completed'] as const).map(
                    (st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setStatusFilter(st)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium min-h-[36px] ${
                          statusFilter === st
                            ? 'bg-slate-900 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {st}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs text-slate-500">
                      <th className="py-2.5 pr-4 font-semibold">Token</th>
                      <th className="py-2.5 pr-4 font-semibold">Patient</th>
                      <th className="py-2.5 pr-4 font-semibold">Doctor / Dept</th>
                      <th className="py-2.5 pr-4 font-semibold">Date & Time</th>
                      <th className="py-2.5 pr-4 font-semibold">Status</th>
                      <th className="py-2.5 font-semibold text-right">Update Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredAppointments.map((apt) => (
                      <tr key={apt.id}>
                        <td className="py-3 pr-4 font-mono font-bold text-teal-800">
                          {apt.tokenNumber}
                        </td>
                        <td className="py-3 pr-4">
                          <div className="font-semibold text-slate-900">{apt.patientName}</div>
                          <div className="text-xs text-slate-500">{apt.patientPhone}</div>
                        </td>
                        <td className="py-3 pr-4">
                          <div className="font-medium text-slate-900">{apt.doctorName}</div>
                          <div className="text-xs text-slate-500">{apt.department}</div>
                        </td>
                        <td className="py-3 pr-4 font-mono text-xs text-slate-700 tabular-nums">
                          {apt.date} · {apt.time}
                        </td>
                        <td className="py-3 pr-4 text-xs font-semibold text-slate-800">
                          {apt.status}
                        </td>
                        <td className="py-3 text-right">
                          <select
                            value={apt.status}
                            onChange={(e) => {
                              const next = e.target.value as AppointmentStatus;
                              updateAppointmentStatus(apt.id, next);
                              pushToast(`Token ${apt.tokenNumber} moved to ${next}.`);
                            }}
                            className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-medium"
                          >
                            <option value="Booked">Booked</option>
                            <option value="Checked In">Checked In</option>
                            <option value="Waiting">Waiting</option>
                            <option value="In Consultation">In Consultation</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* 4. PATIENT JOURNEY MANAGEMENT (LIVE SYNCED WITH PATIENT PORTAL) */}
          {hospitalPage === 'journeys' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-200 text-xs sm:text-sm text-teal-950">
                Updating <strong>Ramesh Kumar Verma (Token #OPD-14)</strong> below immediately
                updates the Patient Portal’s “My Health Journey” timeline and delay notifications.
              </div>

              {staffPatients.map((sp) => (
                <section
                  key={sp.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <p className="text-xs text-slate-500 font-mono">
                        {sp.token} · {sp.department} · {sp.doctor}
                      </p>
                      <h3 className="font-display text-lg font-bold text-slate-900">
                        {sp.name} ({sp.age}/{sp.gender})
                      </h3>
                    </div>
                    <span
                      className={`text-xs font-semibold ${
                        sp.delayed ? 'text-amber-700' : 'text-emerald-700'
                      }`}
                    >
                      Stage: {sp.currentStage} {sp.delayed ? '· DELAYED' : '· On Track'}
                    </span>
                  </div>

                  {/* Stage Selector Buttons */}
                  <div className="flex flex-wrap gap-1.5">
                    {WORKFLOW_STAGES.map((stage) => {
                      const active = sp.currentStage === stage;
                      return (
                        <button
                          key={stage}
                          type="button"
                          onClick={() => {
                            syncStaffPatientStage(sp.id, stage, false);
                            pushToast(`${sp.name} moved to "${stage}".`);
                          }}
                          className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors min-h-[38px] ${
                            active
                              ? 'bg-teal-700 text-white'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {stage}
                        </button>
                      );
                    })}
                  </div>

                  {/* Toggle Delay Notice */}
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs text-slate-600">
                      {sp.delayed && sp.delayReason
                        ? `Active Delay Message: "${sp.delayReason}"`
                        : 'No delay flag active.'}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        const nextDelayed = !sp.delayed;
                        syncStaffPatientStage(
                          sp.id,
                          sp.currentStage,
                          nextDelayed,
                          nextDelayed
                            ? `Your ${sp.currentStage.toLowerCase()} step is taking ~20 mins longer due to high OPD volume. Please wait comfortably in the lounge or check with the desk.`
                            : undefined
                        );
                        pushToast(
                          nextDelayed
                            ? `Delay alert sent to ${sp.name}.`
                            : `Delay cleared for ${sp.name}.`,
                          nextDelayed ? 'warning' : 'success'
                        );
                      }}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold min-h-[38px] border ${
                        sp.delayed
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                          : 'border-amber-300 bg-amber-50 text-amber-900'
                      }`}
                    >
                      {sp.delayed ? 'Clear Delay Flag' : 'Mark Current Stage Delayed'}
                    </button>
                  </div>
                </section>
              ))}
            </div>
          )}

          {/* 5. PATIENTS DIRECTORY */}
          {hospitalPage === 'patients' && (
            <section className="bg-white rounded-2xl border border-slate-200 p-6 overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs text-slate-500">
                    <th className="py-2.5 pr-4 font-semibold">Patient</th>
                    <th className="py-2.5 pr-4 font-semibold">Phone</th>
                    <th className="py-2.5 pr-4 font-semibold">Token</th>
                    <th className="py-2.5 pr-4 font-semibold">Assigned Doctor</th>
                    <th className="py-2.5 font-semibold">Workflow Stage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {staffPatients.map((p) => (
                    <tr key={p.id}>
                      <td className="py-3 pr-4 font-semibold text-slate-900">
                        {p.name} ({p.age}/{p.gender})
                      </td>
                      <td className="py-3 pr-4 font-mono text-xs text-slate-600">{p.phone}</td>
                      <td className="py-3 pr-4 font-mono font-semibold text-teal-800">{p.token}</td>
                      <td className="py-3 pr-4 text-slate-700">{p.doctor}</td>
                      <td className="py-3 text-slate-800 font-medium">{p.currentStage}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          {/* 6. DEPARTMENTS */}
          {hospitalPage === 'departments' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {doctors.map((d) => (
                <div
                  key={d.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 space-y-2"
                >
                  <p className="text-xs font-semibold text-teal-800">{d.department}</p>
                  <h3 className="font-display text-base font-bold text-slate-900">{d.name}</h3>
                  <p className="text-xs text-slate-600">{d.specialization}</p>
                  <p className="text-xs text-slate-500 pt-1">
                    {d.consultationTimings} · {d.availableDays.join(', ')}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* 7. LABORATORY DESK */}
          {hospitalPage === 'laboratory' && (
            <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-lg font-bold text-slate-900">
                    Pathology & Diagnostics Queue
                  </h2>
                  <p className="text-xs text-slate-500">
                    Mark samples verified to automatically move the patient’s journey to Doctor
                    Review.
                  </p>
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {staffPatients
                  .filter(
                    (p) =>
                      p.currentStage === 'Laboratory' ||
                      p.currentStage === 'Report Pending' ||
                      p.isPrimaryDemoPatient
                  )
                  .map((p) => (
                    <div
                      key={p.id}
                      className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <p className="text-xs font-mono text-slate-500">
                          {p.token} · {p.department} · Stage: {p.currentStage}
                        </p>
                        <p className="font-display font-bold text-slate-900">{p.name}</p>
                        <p className="text-xs text-slate-600">
                          Tests: Fasting Blood Glucose, CBC · Ordered by {p.doctor}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          syncStaffPatientStage(p.id, 'Doctor Review', false);
                          pushToast(
                            `Lab report released for ${p.name}! Patient Journey moved to Doctor Review.`
                          );
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold min-h-[42px] self-start sm:self-center"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Release Report & Notify Patient
                      </button>
                    </div>
                  ))}
              </div>
            </section>
          )}

          {/* 8. RESOURCES (CLEARLY LABELED SIMULATED DATA) */}
          {hospitalPage === 'resources' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-700">
                <strong>Simulated Hospital Resource Data:</strong> Displayed figures represent
                prototype demonstration capacity and are not connected to a live hospital HIS/bed
                management feed.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {HOSPITAL_RESOURCES_SIMULATED.map((res) => {
                  const pct = Math.round((res.occupied / res.total) * 100);
                  return (
                    <div
                      key={res.id}
                      className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3"
                    >
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>{res.department}</span>
                        <span className="font-mono font-semibold text-slate-700">{pct}% Used</span>
                      </div>
                      <h3 className="font-display text-base font-bold text-slate-900">
                        {res.name}
                      </h3>
                      <p className="font-mono text-xl font-bold text-teal-800 tabular-nums">
                        {res.total - res.occupied}{' '}
                        <span className="text-xs font-normal text-slate-500">
                          available of {res.total} {res.unit}
                        </span>
                      </p>
                      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            pct > 85 ? 'bg-amber-500' : 'bg-teal-700'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 9. OPERATIONAL ANALYTICS */}
          {hospitalPage === 'analytics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <section className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
                  <div>
                    <h3 className="font-display text-base font-bold text-slate-900">
                      Hourly OPD Appointment Volume (Sample)
                    </h3>
                    <p className="text-xs text-slate-500">Peak intake between 10 AM – 12 PM</p>
                  </div>
                  <div className="h-60 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={HOSPITAL_ANALYTICS_DATA.appointmentVolume}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                        <XAxis dataKey="hour" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Bar dataKey="patients" fill="#0F766E" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </section>

                <section className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
                  <div>
                    <h3 className="font-display text-base font-bold text-slate-900">
                      Avg Waiting Time (mins) & Journey Delays by Dept
                    </h3>
                    <p className="text-xs text-slate-500">
                      Laboratory Desk currently shows highest wait (25 mins)
                    </p>
                  </div>
                  <div className="h-60 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={HOSPITAL_ANALYTICS_DATA.departmentWait}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                        <XAxis dataKey="dept" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Bar dataKey="avgWait" name="Avg Wait (min)" fill="#1D4ED8" radius={[6, 6, 0, 0]} />
                        <Bar dataKey="delayed" name="Delayed Cases" fill="#D97706" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </section>
              </div>

              <section className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
                <div>
                  <h3 className="font-display text-base font-bold text-slate-900">
                    Emergency Alert Acknowledgement Time (Seconds — Simulated Weekly Metric)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Average time from alert receipt to ER Desk staff acknowledgement
                  </p>
                </div>
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={HOSPITAL_ANALYTICS_DATA.emergencyResponse}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="ackSec"
                        name="Ack Time (sec)"
                        stroke="#DC2626"
                        strokeWidth={3}
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </section>
            </div>
          )}

          {/* 10. SETTINGS (CONFIGURABLE EARLY OPD BOOKING WINDOW) */}
          {hospitalPage === 'settings' && (
            <section className="bg-white rounded-2xl border border-slate-200 p-6 max-w-2xl space-y-5">
              <div>
                <h2 className="font-display text-lg font-bold text-slate-900">
                  Hospital Configurable Early OPD Booking Window
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  Configure morning token booking hours for {primaryHospital.name}. Changes update
                  the patient appointment flow immediately.
                </p>
              </div>

              <form onSubmit={handleSaveBookingWindow} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Booking Opens At
                    </label>
                    <input
                      type="text"
                      value={winStart}
                      onChange={(e) => setWinStart(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Early Window Closes
                    </label>
                    <input
                      type="text"
                      value={winEnd}
                      onChange={(e) => setWinEnd(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      OPD Consults Start
                    </label>
                    <input
                      type="text"
                      value={opdStart}
                      onChange={(e) => setOpdStart(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold min-h-[44px]"
                >
                  Save Booking Window Configuration
                </button>
              </form>
            </section>
          )}
        </main>
      </div>

      {/* Mobile Staff Navigation Drawer */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-slate-900/50 flex"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="w-72 bg-white h-full p-5 flex flex-col justify-between overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <BrandMark label="Aarogya Staff" />
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg text-slate-500 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <select
                value={hospitalRole}
                onChange={(e) => setHospitalRole(e.target.value as HospitalRole)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setHospitalPage(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                        hospitalPage === item.id
                          ? 'bg-teal-50 text-teal-800 font-semibold'
                          : 'text-slate-600'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            </div>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setPortalMode('patient');
              }}
              className="w-full py-2.5 rounded-xl bg-teal-700 text-white text-sm font-semibold"
            >
              Switch to Patient View
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
