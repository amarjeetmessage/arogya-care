import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  AppNotification,
  Appointment,
  AppointmentStatus,
  AuthUser,
  CaregiverMember,
  Doctor,
  EmergencyAlert,
  EmergencyStage,
  FollowUpReminder,
  Hospital,
  HospitalPage,
  HospitalRole,
  JourneyStatus,
  JourneyStep,
  Language,
  MedicalReport,
  MedicineItem,
  PatientPage,
  PatientProfile,
  PortalMode,
  StaffPatientRecord,
  TimelineEvent,
  UserRole,
} from '../types/healthcare';
import {
  DEMO_PATIENT,
  INITIAL_APPOINTMENTS,
  INITIAL_CAREGIVERS,
  INITIAL_DOCTORS,
  INITIAL_EMERGENCY_ALERTS,
  INITIAL_FOLLOWUPS,
  INITIAL_HOSPITALS,
  INITIAL_JOURNEY_STEPS,
  INITIAL_MEDICINES,
  INITIAL_REPORTS,
  INITIAL_STAFF_PATIENTS,
  INITIAL_TIMELINE,
} from '../data/mockData';

interface ToastMessage {
  id: string;
  text: string;
  tone: 'success' | 'info' | 'warning' | 'error';
}

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'Medicine Reminder',
    body: 'Take Vitamin B12 + Iron Capsule at 01:30 PM after lunch.',
    timeAgo: '2m ago',
    type: 'medicine',
    read: false,
    targetPage: 'medicines',
  },
  {
    id: 'notif-2',
    title: 'Appointment Confirmed',
    body: 'Dr. Meera Sharma · Token #OPD-14 at Sanjeevani Hospital (10:30 AM).',
    timeAgo: '14m ago',
    type: 'appointment',
    read: false,
    targetPage: 'appointments',
  },
  {
    id: 'notif-3',
    title: 'Lab Report Update',
    body: 'Your 18 Nov CBC & HbA1c report explanation is ready to read in English & Hindi.',
    timeAgo: '45m ago',
    type: 'report',
    read: false,
    targetPage: 'reports',
  },
  {
    id: 'notif-4',
    title: 'Daily Health Tip',
    body: 'A 20-minute post-meal walk helps steady afternoon blood sugar levels.',
    timeAgo: '1h ago',
    type: 'tip',
    read: true,
    targetPage: 'health-tips',
  },
];

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  languageModalOpen: boolean;
  setLanguageModalOpen: (open: boolean) => void;
  largeText: boolean;
  setLargeText: (val: boolean) => void;
  portalMode: PortalMode;
  setPortalMode: (mode: PortalMode) => void;
  patientPage: PatientPage;
  setPatientPage: (page: PatientPage) => void;
  hospitalPage: HospitalPage;
  setHospitalPage: (page: HospitalPage) => void;
  hospitalRole: HospitalRole;
  setHospitalRole: (role: HospitalRole) => void;
  voiceModalOpen: boolean;
  setVoiceModalOpen: (open: boolean) => void;
  navTargetRoom: string | null;
  setNavTargetRoom: (roomId: string | null) => void;

  // Auth (In-memory Bearer session — never stored in localStorage)
  authUser: AuthUser | null;
  authToken: string | null;
  loginWithCredentials: (
    email: string,
    password: string,
    role?: UserRole
  ) => Promise<{ ok: boolean; error?: string }>;
  registerAccount: (
    fullName: string,
    email: string,
    password: string,
    role: 'patient' | 'doctor'
  ) => Promise<{ ok: boolean; error?: string }>;
  claimAdminPasscode: (
    fullName: string,
    email: string,
    password: string
  ) => Promise<{ ok: boolean; error?: string }>;
  loginDemoRole: (role: UserRole, targetPatientPage?: PatientPage) => Promise<void>;
  logout: () => Promise<void>;

  // Notifications
  notifications: AppNotification[];
  unreadNotificationCount: number;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  // Domain Data
  patient: PatientProfile;
  hospitals: Hospital[];
  doctors: Doctor[];
  appointments: Appointment[];
  journeySteps: JourneyStep[];
  reports: MedicalReport[];
  medicines: MedicineItem[];
  followUps: FollowUpReminder[];
  caregivers: CaregiverMember[];
  timeline: TimelineEvent[];
  emergencyAlerts: EmergencyAlert[];
  activePatientEmergencyId: string | null;
  staffPatients: StaffPatientRecord[];

  // Actions
  addAppointment: (apt: Omit<Appointment, 'id' | 'tokenNumber'>) => Appointment;
  updateAppointmentStatus: (id: string, status: AppointmentStatus) => void;
  rescheduleAppointment: (id: string, newDate: string, newTime: string) => void;
  updateHospitalBookingWindow: (
    hospitalId: string,
    startHour: string,
    endHour: string,
    opdStartHour: string
  ) => void;
  createEmergencyAlert: (
    payload: Omit<
      EmergencyAlert,
      'id' | 'createdAt' | 'stage' | 'etaMins' | 'staffNotified'
    >
  ) => EmergencyAlert;
  updateEmergencyStage: (
    alertId: string,
    stage: EmergencyStage,
    meta?: {
      receivingTeam?: string;
      receivingBay?: string;
      acknowledgedBy?: string;
      etaMins?: number;
    }
  ) => void;
  clearActivePatientEmergency: () => void;
  addReport: (report: MedicalReport) => void;
  updateMedicineStatus: (
    id: string,
    status: 'Pending' | 'Taken' | 'Skipped' | 'Remind Later'
  ) => void;
  addMedicine: (med: Omit<MedicineItem, 'id' | 'todayStatus'>) => void;
  toggleFollowUpComplete: (id: string) => void;
  updateCaregiverPermission: (
    caregiverId: string,
    key: keyof CaregiverMember['permissions'],
    value: boolean
  ) => void;
  addCaregiver: (member: Omit<CaregiverMember, 'id'>) => void;
  updateJourneyStepStatus: (
    stepId: string,
    status: JourneyStatus,
    delayNoteEn?: string,
    delayNoteHi?: string
  ) => void;
  syncStaffPatientStage: (
    patientId: string,
    stage: StaffPatientRecord['currentStage'],
    delayed: boolean,
    delayReason?: string
  ) => void;
  resetDemoState: () => void;

  // Toasts
  toasts: ToastMessage[];
  pushToast: (text: string, tone?: ToastMessage['tone']) => void;
}

const AppContext = createContext<AppContextType | null>(null);

const STAGE_TO_JOURNEY_ORDER: Record<StaffPatientRecord['currentStage'], number> = {
  Registered: 2,
  Consultation: 3,
  Laboratory: 4,
  'Report Pending': 5,
  'Doctor Review': 6,
  Pharmacy: 7,
  Discharged: 8,
  'Follow-up': 9,
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');
  const [languageModalOpen, setLanguageModalOpen] = useState(false);
  const [largeText, setLargeText] = useState<boolean>(false);
  const [portalMode, setPortalMode] = useState<PortalMode>('landing');
  const [patientPage, setPatientPage] = useState<PatientPage>('dashboard');
  const [hospitalPage, setHospitalPage] = useState<HospitalPage>('overview');
  const [hospitalRole, setHospitalRole] = useState<HospitalRole>('Administrator');
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);
  const [navTargetRoom, setNavTargetRoom] = useState<string | null>(null);

  // Auth held strictly in React state memory
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);

  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);

  const [hospitals, setHospitals] = useState<Hospital[]>(INITIAL_HOSPITALS);
  const [doctors] = useState<Doctor[]>(INITIAL_DOCTORS);
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [journeySteps, setJourneySteps] = useState<JourneyStep[]>(INITIAL_JOURNEY_STEPS);
  const [reports, setReports] = useState<MedicalReport[]>(INITIAL_REPORTS);
  const [medicines, setMedicines] = useState<MedicineItem[]>(INITIAL_MEDICINES);
  const [followUps, setFollowUps] = useState<FollowUpReminder[]>(INITIAL_FOLLOWUPS);
  const [caregivers, setCaregivers] = useState<CaregiverMember[]>(INITIAL_CAREGIVERS);
  const [timeline, setTimeline] = useState<TimelineEvent[]>(INITIAL_TIMELINE);
  const [emergencyAlerts, setEmergencyAlerts] = useState<EmergencyAlert[]>(INITIAL_EMERGENCY_ALERTS);
  const [activePatientEmergencyId, setActivePatientEmergencyId] = useState<string | null>(null);
  const [staffPatients, setStaffPatients] = useState<StaffPatientRecord[]>(INITIAL_STAFF_PATIENTS);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const patient = useMemo<PatientProfile>(() => {
    if (authUser && authUser.role === 'patient' && !authUser.isDemo) {
      return {
        ...DEMO_PATIENT,
        name: authUser.fullName,
        nameHi: authUser.fullName,
      };
    }
    return DEMO_PATIENT;
  }, [authUser]);

  useEffect(() => {
    const root = document.documentElement;
    if (largeText) root.classList.add('text-large');
    else root.classList.remove('text-large');
  }, [largeText]);

  const pushToast = useCallback((text: string, tone: ToastMessage['tone'] = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev.slice(-2), { id, text, tone }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  }, []);

  const routeForRole = useCallback(
    (role: UserRole, targetPatientPage?: PatientPage) => {
      if (role === 'doctor') {
        setPortalMode('doctor');
      } else if (role === 'hospital_admin') {
        setPortalMode('hospital');
      } else {
        if (targetPatientPage) setPatientPage(targetPatientPage);
        setPortalMode('patient');
      }
    },
    []
  );

  const loginWithCredentials = useCallback(
    async (email: string, password: string, role?: UserRole) => {
      try {
        const resp = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, role }),
        });
        const data = await resp.json();
        if (!resp.ok) {
          return { ok: false, error: data.error || 'Login failed.' };
        }
        setAuthToken(data.token);
        setAuthUser(data.user);
        routeForRole(data.user.role);
        pushToast(`Welcome back, ${data.user.fullName}!`);
        return { ok: true };
      } catch {
        return { ok: false, error: 'Network error while signing in.' };
      }
    },
    [pushToast, routeForRole]
  );

  const registerAccount = useCallback(
    async (
      fullName: string,
      email: string,
      password: string,
      role: 'patient' | 'doctor'
    ) => {
      try {
        const resp = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fullName, email, password, role }),
        });
        const data = await resp.json();
        if (!resp.ok) {
          return { ok: false, error: data.error || 'Registration failed.' };
        }
        setAuthToken(data.token);
        setAuthUser(data.user);
        routeForRole(data.user.role);
        pushToast(`Account created! Welcome to Aarogya Care, ${data.user.fullName}.`);
        return { ok: true };
      } catch {
        return { ok: false, error: 'Network error while creating account.' };
      }
    },
    [pushToast, routeForRole]
  );

  const claimAdminPasscode = useCallback(
    async (fullName: string, email: string, password: string) => {
      try {
        const resp = await fetch('/api/auth/admin-claim', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fullName, email, password }),
        });
        const data = await resp.json();
        if (!resp.ok) {
          return { ok: false, error: data.error || 'Could not set admin password.' };
        }
        setAuthToken(data.token);
        setAuthUser(data.user);
        routeForRole('hospital_admin');
        pushToast('Hospital Admin access configured & signed in.');
        return { ok: true };
      } catch {
        return { ok: false, error: 'Network error while configuring admin account.' };
      }
    },
    [pushToast, routeForRole]
  );

  const loginDemoRole = useCallback(
    async (role: UserRole, targetPatientPage?: PatientPage) => {
      try {
        const resp = await fetch('/api/auth/demo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role }),
        });
        if (resp.ok) {
          const data = await resp.json();
          setAuthToken(data.token);
          setAuthUser(data.user);
        }
      } catch {
        // fallback local demo identity if server temporarily unavailable
        setAuthUser({
          id: role === 'doctor' ? 'doc-meera' : role === 'hospital_admin' ? 'staff-admin-01' : 'pat-ramesh-01',
          fullName:
            role === 'doctor'
              ? 'Dr. Meera Sharma'
              : role === 'hospital_admin'
              ? 'Rajiv Menon (Hospital Admin)'
              : 'Ramesh Kumar Verma',
          email: `${role}@aarogyacare.demo`,
          role,
          isDemo: true,
        });
      }
      routeForRole(role, targetPatientPage);
    },
    [routeForRole]
  );

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    setAuthToken(null);
    setAuthUser(null);
    setPortalMode('landing');
    pushToast('Signed out safely.', 'info');
  }, [pushToast]);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const unreadNotificationCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const addAppointment = useCallback(
    (apt: Omit<Appointment, 'id' | 'tokenNumber'>): Appointment => {
      const deptCode = apt.department.slice(0, 3).toUpperCase();
      const tokenNum = `${deptCode}-${Math.floor(15 + Math.random() * 40)}`;
      const newApt: Appointment = {
        ...apt,
        id: `apt-${Date.now()}`,
        tokenNumber: tokenNum,
      };
      setAppointments((prev) => [newApt, ...prev]);
      setTimeline((prev) => [
        {
          id: `tl-${Date.now()}`,
          date: newApt.date,
          isoDate: new Date().toISOString().slice(0, 10),
          type: 'Hospital Visit',
          titleEn: `Appointment ${newApt.status} — ${newApt.department} (${newApt.tokenNumber})`,
          titleHi: `अपॉइंटमेंट बुक — ${newApt.department} (${newApt.tokenNumber})`,
          facility: newApt.hospitalName,
          clinician: newApt.doctorName,
          summaryEn: `${newApt.type} slot at ${newApt.time}. ${newApt.notes || ''}`,
          summaryHi: `${newApt.time} पर स्लॉट बुक किया गया।`,
        },
        ...prev,
      ]);
      setNotifications((prev) => [
        {
          id: `notif-${Date.now()}`,
          title: 'Appointment Confirmed',
          body: `${newApt.doctorName} · Token #${newApt.tokenNumber} on ${newApt.date} at ${newApt.time}`,
          timeAgo: 'Just now',
          type: 'appointment',
          read: false,
          targetPage: 'appointments',
        },
        ...prev,
      ]);
      return newApt;
    },
    []
  );

  const updateAppointmentStatus = useCallback((id: string, status: AppointmentStatus) => {
    setAppointments((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              status,
              estimatedWaitMins:
                status === 'Completed' || status === 'Cancelled' || status === 'In Consultation'
                  ? 0
                  : a.estimatedWaitMins,
            }
          : a
      )
    );
  }, []);

  const rescheduleAppointment = useCallback((id: string, newDate: string, newTime: string) => {
    setAppointments((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, date: newDate, time: newTime, status: 'Booked' } : a
      )
    );
  }, []);

  const updateHospitalBookingWindow = useCallback(
    (hospitalId: string, startHour: string, endHour: string, opdStartHour: string) => {
      setHospitals((prev) =>
        prev.map((h) =>
          h.id === hospitalId
            ? {
                ...h,
                earlyBookingWindow: {
                  ...h.earlyBookingWindow,
                  startHour,
                  endHour,
                  opdStartHour,
                  labelEn: `Early OPD booking open ${startHour} – ${endHour} for consultations starting ${opdStartHour}`,
                  labelHi: `सुबह ${startHour} से ${endHour} तक अर्ली बुकिंग (ओपीडी ${opdStartHour} से)`,
                },
              }
            : h
        )
      );
    },
    []
  );

  const createEmergencyAlert = useCallback(
    (
      payload: Omit<EmergencyAlert, 'id' | 'createdAt' | 'stage' | 'etaMins' | 'staffNotified'>
    ): EmergencyAlert => {
      const nowTime = new Date().toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
      const newAlert: EmergencyAlert = {
        ...payload,
        id: `emg-${Date.now()}`,
        createdAt: nowTime,
        stage: 'Hospital Notified',
        etaMins: 11,
        staffNotified: true,
      };
      setEmergencyAlerts((prev) => [newAlert, ...prev]);
      setActivePatientEmergencyId(newAlert.id);
      setNotifications((prev) => [
        {
          id: `notif-emg-${Date.now()}`,
          title: 'Emergency Alert Sent',
          body: `${newAlert.hospitalName} ER Desk notified at ${nowTime}.`,
          timeAgo: 'Just now',
          type: 'emergency',
          read: false,
          targetPage: 'emergency',
        },
        ...prev,
      ]);
      return newAlert;
    },
    []
  );

  const updateEmergencyStage = useCallback(
    (
      alertId: string,
      stage: EmergencyStage,
      meta?: {
        receivingTeam?: string;
        receivingBay?: string;
        acknowledgedBy?: string;
        etaMins?: number;
      }
    ) => {
      setEmergencyAlerts((prev) =>
        prev.map((a) =>
          a.id === alertId
            ? {
                ...a,
                stage,
                receivingTeam: meta?.receivingTeam ?? a.receivingTeam,
                receivingBay: meta?.receivingBay ?? a.receivingBay,
                acknowledgedBy: meta?.acknowledgedBy ?? a.acknowledgedBy,
                etaMins:
                  meta?.etaMins !== undefined
                    ? meta.etaMins
                    : stage === 'Patient Arrived'
                    ? 0
                    : a.etaMins,
              }
            : a
        )
      );
    },
    []
  );

  const clearActivePatientEmergency = useCallback(() => {
    setActivePatientEmergencyId(null);
  }, []);

  const addReport = useCallback((report: MedicalReport) => {
    setReports((prev) => [report, ...prev]);
    setTimeline((prev) => [
      {
        id: `tl-rep-${Date.now()}`,
        date: report.date,
        isoDate: report.isoDate,
        type: 'Medical Report',
        titleEn: report.title,
        titleHi: report.title,
        facility: report.hospital,
        clinician: report.doctor,
        summaryEn: report.summaryEn,
        summaryHi: report.summaryHi,
        linkedReportId: report.id,
      },
      ...prev,
    ]);
  }, []);

  const updateMedicineStatus = useCallback(
    (id: string, status: 'Pending' | 'Taken' | 'Skipped' | 'Remind Later') => {
      setMedicines((prev) => prev.map((m) => (m.id === id ? { ...m, todayStatus: status } : m)));
    },
    []
  );

  const addMedicine = useCallback((med: Omit<MedicineItem, 'id' | 'todayStatus'>) => {
    setMedicines((prev) => [
      ...prev,
      {
        ...med,
        id: `med-${Date.now()}`,
        todayStatus: 'Pending',
      },
    ]);
    setNotifications((prev) => [
      {
        id: `notif-med-${Date.now()}`,
        title: 'New Prescription Added',
        body: `${med.name} (${med.dosage}) scheduled for ${med.time}.`,
        timeAgo: 'Just now',
        type: 'medicine',
        read: false,
        targetPage: 'medicines',
      },
      ...prev,
    ]);
  }, []);

  const toggleFollowUpComplete = useCallback((id: string) => {
    setFollowUps((prev) =>
      prev.map((f) => (f.id === id ? { ...f, completed: !f.completed } : f))
    );
  }, []);

  const updateCaregiverPermission = useCallback(
    (caregiverId: string, key: keyof CaregiverMember['permissions'], value: boolean) => {
      setCaregivers((prev) =>
        prev.map((c) =>
          c.id === caregiverId
            ? { ...c, permissions: { ...c.permissions, [key]: value } }
            : c
        )
      );
    },
    []
  );

  const addCaregiver = useCallback((member: Omit<CaregiverMember, 'id'>) => {
    setCaregivers((prev) => [...prev, { ...member, id: `cg-${Date.now()}` }]);
  }, []);

  const updateJourneyStepStatus = useCallback(
    (stepId: string, status: JourneyStatus, delayNoteEn?: string, delayNoteHi?: string) => {
      const nowTime = new Date().toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
      setJourneySteps((prev) =>
        prev.map((s) =>
          s.id === stepId
            ? {
                ...s,
                status,
                completedAt: status === 'Completed' ? nowTime : s.completedAt,
                delayNoteEn: status === 'Delayed' ? delayNoteEn ?? s.delayNoteEn : undefined,
                delayNoteHi: status === 'Delayed' ? delayNoteHi ?? s.delayNoteHi : undefined,
              }
            : s
        )
      );
    },
    []
  );

  const syncStaffPatientStage = useCallback(
    (
      patientId: string,
      stage: StaffPatientRecord['currentStage'],
      delayed: boolean,
      delayReason?: string
    ) => {
      setStaffPatients((prev) =>
        prev.map((p) =>
          p.id === patientId ? { ...p, currentStage: stage, delayed, delayReason } : p
        )
      );

      if (patientId === DEMO_PATIENT.id) {
        const targetOrder = STAGE_TO_JOURNEY_ORDER[stage];
        const nowTime = new Date().toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        });
        setJourneySteps((prev) =>
          prev.map((step) => {
            if (step.order < targetOrder) {
              return {
                ...step,
                status: 'Completed',
                completedAt: step.completedAt || nowTime,
                delayNoteEn: undefined,
                delayNoteHi: undefined,
              };
            }
            if (step.order === targetOrder) {
              return {
                ...step,
                status: delayed ? 'Delayed' : 'In Progress',
                delayNoteEn: delayed
                  ? delayReason ||
                    'This stage is taking longer than usual. Please continue waiting or ask the desk.'
                  : undefined,
                delayNoteHi: delayed
                  ? delayReason ||
                    'इस चरण में थोड़ा अतिरिक्त समय लग रहा है। कृपया वेटिंग एरिया में बैठें या डेस्क पर जानकारी लें।'
                  : undefined,
              };
            }
            return {
              ...step,
              status: 'Pending',
              delayNoteEn: undefined,
              delayNoteHi: undefined,
            };
          })
        );
      }
    },
    []
  );

  const resetDemoState = useCallback(() => {
    setHospitals(INITIAL_HOSPITALS);
    setAppointments(INITIAL_APPOINTMENTS);
    setJourneySteps(INITIAL_JOURNEY_STEPS);
    setReports(INITIAL_REPORTS);
    setMedicines(INITIAL_MEDICINES);
    setFollowUps(INITIAL_FOLLOWUPS);
    setCaregivers(INITIAL_CAREGIVERS);
    setTimeline(INITIAL_TIMELINE);
    setEmergencyAlerts(INITIAL_EMERGENCY_ALERTS);
    setActivePatientEmergencyId(null);
    setStaffPatients(INITIAL_STAFF_PATIENTS);
    setNotifications(INITIAL_NOTIFICATIONS);
    pushToast('Demo data reset to initial state.', 'info');
  }, [pushToast]);

  const value = useMemo<AppContextType>(
    () => ({
      language,
      setLanguage,
      languageModalOpen,
      setLanguageModalOpen,
      largeText,
      setLargeText,
      portalMode,
      setPortalMode,
      patientPage,
      setPatientPage,
      hospitalPage,
      setHospitalPage,
      hospitalRole,
      setHospitalRole,
      voiceModalOpen,
      setVoiceModalOpen,
      navTargetRoom,
      setNavTargetRoom,
      authUser,
      authToken,
      loginWithCredentials,
      registerAccount,
      claimAdminPasscode,
      loginDemoRole,
      logout,
      notifications,
      unreadNotificationCount,
      markNotificationRead,
      markAllNotificationsRead,
      patient,
      hospitals,
      doctors,
      appointments,
      journeySteps,
      reports,
      medicines,
      followUps,
      caregivers,
      timeline,
      emergencyAlerts,
      activePatientEmergencyId,
      staffPatients,
      addAppointment,
      updateAppointmentStatus,
      rescheduleAppointment,
      updateHospitalBookingWindow,
      createEmergencyAlert,
      updateEmergencyStage,
      clearActivePatientEmergency,
      addReport,
      updateMedicineStatus,
      addMedicine,
      toggleFollowUpComplete,
      updateCaregiverPermission,
      addCaregiver,
      updateJourneyStepStatus,
      syncStaffPatientStage,
      resetDemoState,
      toasts,
      pushToast,
    }),
    [
      language,
      languageModalOpen,
      largeText,
      portalMode,
      patientPage,
      hospitalPage,
      hospitalRole,
      voiceModalOpen,
      navTargetRoom,
      authUser,
      authToken,
      loginWithCredentials,
      registerAccount,
      claimAdminPasscode,
      loginDemoRole,
      logout,
      notifications,
      unreadNotificationCount,
      markNotificationRead,
      markAllNotificationsRead,
      patient,
      hospitals,
      doctors,
      appointments,
      journeySteps,
      reports,
      medicines,
      followUps,
      caregivers,
      timeline,
      emergencyAlerts,
      activePatientEmergencyId,
      staffPatients,
      addAppointment,
      updateAppointmentStatus,
      rescheduleAppointment,
      updateHospitalBookingWindow,
      createEmergencyAlert,
      updateEmergencyStage,
      clearActivePatientEmergency,
      addReport,
      updateMedicineStatus,
      addMedicine,
      toggleFollowUpComplete,
      updateCaregiverPermission,
      addCaregiver,
      updateJourneyStepStatus,
      syncStaffPatientStage,
      resetDemoState,
      toasts,
      pushToast,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
