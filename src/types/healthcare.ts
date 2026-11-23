export type Language = 'en' | 'hi' | 'bn' | 'mr' | 'ta' | 'te';

export type UserRole = 'patient' | 'doctor' | 'hospital_admin';

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  isDemo?: boolean;
}

export type PortalMode = 'landing' | 'auth' | 'patient' | 'doctor' | 'hospital';

export type PatientPage =
  | 'dashboard'
  | 'appointments'
  | 'journey'
  | 'reports'
  | 'timeline'
  | 'navigation'
  | 'medicines'
  | 'consult'
  | 'family'
  | 'emergency'
  | 'ai-assistant'
  | 'risk-assessment'
  | 'schemes'
  | 'health-tips';

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  timeAgo: string;
  type: 'medicine' | 'appointment' | 'report' | 'tip' | 'emergency';
  read: boolean;
  targetPage: PatientPage;
}

export type HospitalRole =
  | 'Administrator'
  | 'Receptionist'
  | 'Doctor'
  | 'Nurse'
  | 'Laboratory Staff';

export type HospitalPage =
  | 'overview'
  | 'emergency'
  | 'appointments'
  | 'patients'
  | 'journeys'
  | 'departments'
  | 'laboratory'
  | 'resources'
  | 'analytics'
  | 'settings';

export type JourneyStatus = 'Completed' | 'In Progress' | 'Pending' | 'Delayed';

export interface JourneyStep {
  id: string;
  order: number;
  titleEn: string;
  titleHi: string;
  status: JourneyStatus;
  locationEn: string;
  locationHi: string;
  floor: string;
  instructionsEn: string;
  instructionsHi: string;
  expectedDuration: string;
  nextActionEn: string;
  nextActionHi: string;
  completedAt?: string;
  delayNoteEn?: string;
  delayNoteHi?: string;
  mapTargetId?: string;
}

export interface Hospital {
  id: string;
  name: string;
  nameHi: string;
  city: string;
  address: string;
  distanceKm: number;
  phone: string;
  emergencyPhone: string;
  image: string;
  departments: string[];
  earlyBookingWindow: {
    enabled: boolean;
    startHour: string;
    endHour: string;
    opdStartHour: string;
    labelEn: string;
    labelHi: string;
  };
  currentWaitingCount: number;
  avgWaitMins: number;
  hasEmergencyUnit: boolean;
  wheelchairAccessible: boolean;
}

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  department: string;
  hospitalId: string;
  hospitalName: string;
  qualification: string;
  experienceYears: number;
  languages: string[];
  availableDays: string[];
  consultationTimings: string;
  consultationFeeInr: number;
  avatar: string;
  nextAvailable: string;
  onlineAvailable: boolean;
  slots: {
    time: string;
    available: boolean;
    waitlistCount?: number;
  }[];
}

export type AppointmentStatus =
  | 'Booked'
  | 'Checked In'
  | 'Waiting'
  | 'In Consultation'
  | 'Completed'
  | 'Cancelled'
  | 'Waitlisted';

export interface Appointment {
  id: string;
  patientName: string;
  patientAge: number;
  patientPhone: string;
  hospitalId: string;
  hospitalName: string;
  department: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  tokenNumber: string;
  estimatedWaitMins: number;
  status: AppointmentStatus;
  type: 'In-Person' | 'Online Video';
  notes?: string;
  instructionsEn: string;
  instructionsHi: string;
}

export type EmergencyStage =
  | 'Alert Sent'
  | 'Hospital Notified'
  | 'Hospital Acknowledged'
  | 'Preparation Started'
  | 'Patient En Route'
  | 'Patient Arrived';

export interface EmergencyAlert {
  id: string;
  patientName: string;
  patientAge: number;
  contactNumber: string;
  category: string;
  description: string;
  symptoms: string;
  locationText: string;
  coordinates?: string;
  sharedMedicalSummary: boolean;
  allergies?: string;
  currentMeds?: string;
  hospitalId: string;
  hospitalName: string;
  createdAt: string;
  stage: EmergencyStage;
  etaMins: number;
  receivingTeam?: string;
  receivingBay?: string;
  staffNotified: boolean;
  acknowledgedBy?: string;
}

export type ReportCategory =
  | 'Blood Tests'
  | 'Prescriptions'
  | 'Radiology'
  | 'Discharge Summaries'
  | 'Consultations'
  | 'Other';

export interface ReportValue {
  parameter: string;
  value: string;
  numericValue?: number;
  unit: string;
  referenceRange: string;
  status: 'Normal' | 'Attention' | 'High' | 'Low';
  sourceLine: string;
}

export interface MedicalReport {
  id: string;
  title: string;
  category: ReportCategory;
  date: string;
  isoDate: string;
  hospital: string;
  doctor: string;
  summaryEn: string;
  summaryHi: string;
  simpleExplanationEn: string;
  simpleExplanationHi: string;
  rawLines: { lineId: string; text: string }[];
  values: ReportValue[];
  previewImageUrl?: string;
  isUploaded?: boolean;
}

export interface MedicineItem {
  id: string;
  name: string;
  dosage: string;
  scheduleSlot: 'Morning' | 'Afternoon' | 'Night';
  time: string;
  frequency: string;
  duration: string;
  instructionsEn: string;
  instructionsHi: string;
  prescribedBy: string;
  prescribedDate: string;
  todayStatus: 'Pending' | 'Taken' | 'Skipped' | 'Remind Later';
}

export interface FollowUpReminder {
  id: string;
  titleEn: string;
  titleHi: string;
  type: 'Doctor Visit' | 'Lab Test' | 'Report Review' | 'Repeat Visit';
  date: string;
  time: string;
  location: string;
  completed: boolean;
}

export interface CaregiverMember {
  id: string;
  name: string;
  relation: string;
  phone: string;
  permissions: {
    appointments: boolean;
    medicines: boolean;
    reports: boolean;
    navigation: boolean;
    emergency: boolean;
  };
}

export interface TimelineEvent {
  id: string;
  date: string;
  isoDate: string;
  type:
    | 'Hospital Visit'
    | 'Diagnosis'
    | 'Medical Report'
    | 'Prescription'
    | 'Laboratory Test'
    | 'Consultation'
    | 'Discharge'
    | 'Follow-up';
  titleEn: string;
  titleHi: string;
  facility: string;
  clinician: string;
  summaryEn: string;
  summaryHi: string;
  linkedReportId?: string;
}

export interface PatientProfile {
  id: string;
  name: string;
  nameHi: string;
  age: number;
  gender: string;
  phone: string;
  city: string;
  abhaId: string;
  bloodGroup: string;
  allergies: string[];
  chronicConditions: string[];
  emergencyContactName: string;
  emergencyContactPhone: string;
}

export interface StaffPatientRecord {
  id: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  token: string;
  department: string;
  doctor: string;
  currentStage:
    | 'Registered'
    | 'Consultation'
    | 'Laboratory'
    | 'Report Pending'
    | 'Doctor Review'
    | 'Pharmacy'
    | 'Discharged'
    | 'Follow-up';
  delayed: boolean;
  delayReason?: string;
  isPrimaryDemoPatient?: boolean;
}
