import React, { useMemo, useState } from 'react';
import {
  Search,
  MapPin,
  Clock,
  CheckCircle2,
  ArrowLeft,
  Calendar,
  UserCheck,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DEPARTMENTS } from '../data/mockData';
import { Appointment, Doctor, Hospital } from '../types/healthcare';

export function AppointmentBooking() {
  const {
    language,
    hospitals,
    doctors,
    appointments,
    patient,
    addAppointment,
    updateAppointmentStatus,
    rescheduleAppointment,
    pushToast,
    setPatientPage,
  } = useApp();

  const [viewTab, setViewTab] = useState<'book' | 'my-bookings'>('book');
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);

  const [hospitalSearch, setHospitalSearch] = useState('');
  const [selectedHospital, setSelectedHospital] = useState<Hospital>(hospitals[0]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('General Medicine');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor>(doctors[0]);
  const [selectedDate, setSelectedDate] = useState<string>('23 Nov 2026');
  const [selectedTime, setSelectedTime] = useState<string>('11:00 AM');
  const [isWaitlistSlot, setIsWaitlistSlot] = useState(false);
  const [recoveredSlots, setRecoveredSlots] = useState<string[]>([]);

  const [patientName, setPatientName] = useState(patient.name);
  const [patientAge, setPatientAge] = useState(String(patient.age));
  const [patientPhone, setPatientPhone] = useState(patient.phone);
  const [visitNotes, setVisitNotes] = useState('');
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);

  // Cancel / Reschedule confirmation state
  const [cancelConfirmId, setCancelConfirmId] = useState<string | null>(null);
  const [rescheduleId, setRescheduleId] = useState<string | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('25 Nov 2026');
  const [rescheduleTime, setRescheduleTime] = useState('11:30 AM');

  const filteredHospitals = useMemo(() => {
    const q = hospitalSearch.toLowerCase().trim();
    if (!q) return hospitals;
    return hospitals.filter(
      (h) =>
        h.name.toLowerCase().includes(q) ||
        h.address.toLowerCase().includes(q) ||
        h.departments.some((d) => d.toLowerCase().includes(q))
    );
  }, [hospitals, hospitalSearch]);

  const matchingDoctors = useMemo(() => {
    const exact = doctors.filter(
      (d) => d.hospitalId === selectedHospital.id && d.department === selectedDepartment
    );
    if (exact.length > 0) return exact;
    const byDept = doctors.filter((d) => d.department === selectedDepartment);
    return byDept.length > 0 ? byDept : doctors.slice(0, 3);
  }, [doctors, selectedHospital, selectedDepartment]);

  const patientBookings = appointments.filter(
    (a) => a.patientName === patient.name || a.patientName === patientName
  );

  const dates = [
    { label: '22 Nov 2026', sub: language === 'hi' ? 'आज' : 'Today' },
    { label: '23 Nov 2026', sub: language === 'hi' ? 'कल' : 'Tomorrow' },
    { label: '24 Nov 2026', sub: 'Tue' },
    { label: '25 Nov 2026', sub: 'Wed' },
  ];

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    const created = addAppointment({
      patientName: patientName.trim() || patient.name,
      patientAge: Number(patientAge) || patient.age,
      patientPhone: patientPhone.trim() || patient.phone,
      hospitalId: selectedHospital.id,
      hospitalName: selectedHospital.name,
      department: selectedDepartment,
      doctorId: selectedDoctor.id,
      doctorName: selectedDoctor.name,
      date: selectedDate,
      time: selectedTime,
      estimatedWaitMins: isWaitlistSlot ? 35 : selectedHospital.avgWaitMins,
      status: isWaitlistSlot ? 'Waitlisted' : 'Booked',
      type: 'In-Person',
      notes: visitNotes.trim() || 'OPD Consultation',
      instructionsEn: `Arrive 15 minutes before ${selectedTime}. Carry previous reports and show token at ${selectedHospital.name} registration desk.`,
      instructionsHi: `${selectedTime} से 15 मिनट पहले पहुंचें। पुरानी रिपोर्ट साथ लाएं और रजिस्ट्रेशन डेस्क पर टोकन दिखाएं।`,
    });
    setConfirmedAppointment(created);
    setStep(6);
    pushToast(
      language === 'hi'
        ? `अपॉइंटमेंट बुक हो गया! टोकन: ${created.tokenNumber}`
        : `Appointment confirmed! Token ${created.tokenNumber}`
    );
  };

  const simulateCancellationRecovery = (slotTime: string) => {
    const key = `${selectedDoctor.id}-${slotTime}`;
    setRecoveredSlots((prev) => [...prev, key]);
    setSelectedTime(slotTime);
    setIsWaitlistSlot(false);
    pushToast(
      language === 'hi'
        ? `रद्द किया गया ${slotTime} स्लॉट अब उपलब्ध हो गया है!`
        : `Cancellation recovery: ${slotTime} slot just opened up and is selected for you!`,
      'info'
    );
  };

  const stepLabels =
    language === 'hi'
      ? ['अस्पताल', 'विभाग', 'डॉक्टर', 'समय', 'विवरण', 'कन्फर्म']
      : ['Hospital', 'Department', 'Doctor', 'Date & Time', 'Details', 'Confirmed'];

  return (
    <div className="space-y-6">
      {/* Top Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900">
            {language === 'hi' ? 'स्मार्ट अपॉइंटमेंट बुकिंग' : 'Smart Appointment Booking'}
          </h2>
          <p className="text-sm text-slate-600 mt-0.5">
            {language === 'hi'
              ? 'आसान 6 चरणों में अस्पताल, डॉक्टर और टोकन बुक करें।'
              : 'Book nearby hospitals with live queue estimates, early OPD windows, and waitlist recovery.'}
          </p>
        </div>

        <div className="flex items-center bg-slate-100 rounded-xl p-1 self-start">
          <button
            type="button"
            onClick={() => setViewTab('book')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap min-h-[40px] ${
              viewTab === 'book' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            {language === 'hi' ? 'नई बुकिंग' : 'New Booking'}
          </button>
          <button
            type="button"
            onClick={() => setViewTab('my-bookings')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap min-h-[40px] ${
              viewTab === 'my-bookings' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            {language === 'hi'
              ? `मेरी बुकिंग (${patientBookings.length})`
              : `My Bookings (${patientBookings.length})`}
          </button>
        </div>
      </div>

      {viewTab === 'book' ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7 space-y-6">
          {/* Guided Step Indicator */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pb-5 border-b border-slate-100">
            {stepLabels.map((lbl, idx) => {
              const sNum = (idx + 1) as 1 | 2 | 3 | 4 | 5 | 6;
              const isActive = step === sNum;
              const isDone = step > sNum;
              return (
                <button
                  key={lbl}
                  type="button"
                  disabled={sNum > step || step === 6}
                  onClick={() => sNum < step && setStep(sNum)}
                  className={`text-left px-3 py-2 rounded-xl border text-xs font-medium transition-colors ${
                    isActive
                      ? 'border-teal-600 bg-teal-50 text-teal-900 font-semibold'
                      : isDone
                      ? 'border-slate-200 bg-slate-50 text-emerald-700'
                      : 'border-slate-100 text-slate-400 cursor-default'
                  }`}
                >
                  <span className="font-mono mr-1">0{sNum}.</span>
                  {lbl}
                </button>
              );
            })}
          </div>

          {/* STEP 1: Choose Hospital */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={hospitalSearch}
                  onChange={(e) => setHospitalSearch(e.target.value)}
                  placeholder={
                    language === 'hi'
                      ? 'अस्पताल का नाम, क्षेत्र या विभाग खोजें...'
                      : 'Search hospital name, area, or department (e.g. Cardiology)...'
                  }
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-teal-600 focus:outline-none text-sm"
                />
              </div>

              <div className="space-y-3">
                {filteredHospitals.map((h) => {
                  const active = selectedHospital.id === h.id;
                  return (
                    <button
                      key={h.id}
                      type="button"
                      onClick={() => {
                        setSelectedHospital(h);
                        setStep(2);
                      }}
                      className={`w-full text-left p-5 rounded-xl border transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        active
                          ? 'border-teal-600 bg-teal-50/40'
                          : 'border-slate-200 hover:border-teal-300 bg-white'
                      }`}
                    >
                      <div className="space-y-1">
                        <p className="text-xs text-slate-500 tabular-nums">
                          {h.distanceKm} km away · {h.currentWaitingCount} in queue · Avg wait ~
                          {h.avgWaitMins} mins
                        </p>
                        <h3 className="font-display text-lg font-bold text-slate-900">
                          {language === 'hi' ? h.nameHi : h.name}
                        </h3>
                        <p className="text-sm text-slate-600 flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                          {h.address}
                        </p>
                        <p className="text-xs text-teal-800 font-medium pt-1">
                          {language === 'hi'
                            ? h.earlyBookingWindow.labelHi
                            : h.earlyBookingWindow.labelEn}
                        </p>
                      </div>
                      <span className="px-4 py-2.5 rounded-xl bg-teal-700 text-white text-sm font-semibold whitespace-nowrap self-start sm:self-center">
                        {language === 'hi' ? 'चुनें' : 'Select Hospital'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: Choose Department */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500">{selectedHospital.name}</p>
                  <h3 className="font-display text-xl font-bold text-slate-900">
                    {language === 'hi' ? 'विभाग चुनें' : 'Choose Department'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {language === 'hi' ? 'अस्पताल बदलें' : 'Change Hospital'}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {DEPARTMENTS.map((dept) => {
                  const availableHere = selectedHospital.departments.includes(dept.id);
                  return (
                    <button
                      key={dept.id}
                      type="button"
                      onClick={() => {
                        setSelectedDepartment(dept.id);
                        setStep(3);
                      }}
                      className={`p-4 rounded-xl border text-left transition-colors min-h-[76px] flex flex-col justify-between ${
                        selectedDepartment === dept.id
                          ? 'border-teal-600 bg-teal-50/50'
                          : 'border-slate-200 hover:border-teal-300 bg-white'
                      }`}
                    >
                      <span className="font-display text-sm font-bold text-slate-900">
                        {language === 'hi' ? dept.nameHi : dept.nameEn}
                      </span>
                      <span className="text-xs text-slate-500 mt-1">
                        {availableHere
                          ? language === 'hi'
                            ? 'इस अस्पताल में उपलब्ध'
                            : 'Available today'
                          : language === 'hi'
                          ? 'नेटवर्क डॉक्टर देखें'
                          : 'View network specialists'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: Choose Doctor */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500">
                    {selectedHospital.name} · {selectedDepartment}
                  </p>
                  <h3 className="font-display text-xl font-bold text-slate-900">
                    {language === 'hi' ? 'डॉक्टर चुनें' : 'Choose Your Doctor'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {language === 'hi' ? 'पीछे' : 'Back'}
                </button>
              </div>

              <div className="space-y-3">
                {matchingDoctors.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-5 rounded-xl border border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-4">
                      <img
                        src={doc.avatar}
                        alt={doc.name}
                        referrerPolicy="no-referrer"
                        className="w-16 h-16 rounded-xl object-cover border border-slate-100 shrink-0"
                      />
                      <div className="space-y-1">
                        <p className="text-xs text-slate-500">
                          {doc.qualification} · {doc.experienceYears} yrs exp · ₹{doc.consultationFeeInr}
                        </p>
                        <h4 className="font-display text-lg font-bold text-slate-900">{doc.name}</h4>
                        <p className="text-sm text-slate-600">{doc.specialization}</p>
                        <p className="text-xs text-slate-500">
                          {doc.availableDays.join(', ')} · {doc.consultationTimings} · Next:{' '}
                          <span className="font-semibold text-teal-800">{doc.nextAvailable}</span>
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDoctor(doc);
                        const firstOpen = doc.slots.find((s) => s.available);
                        if (firstOpen) {
                          setSelectedTime(firstOpen.time);
                          setIsWaitlistSlot(false);
                        }
                        setStep(4);
                      }}
                      className="px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold whitespace-nowrap min-h-[44px]"
                    >
                      {language === 'hi' ? 'समय चुनें' : 'Select Doctor'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: Date & Time + Configurable Early Window + Waitlist & Cancellation Recovery */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500">
                    {selectedDoctor.name} · {selectedDoctor.department}
                  </p>
                  <h3 className="font-display text-xl font-bold text-slate-900">
                    {language === 'hi' ? 'तारीख और समय चुनें' : 'Select Date & Time Slot'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {language === 'hi' ? 'पीछे' : 'Back'}
                </button>
              </div>

              {/* Configurable Hospital Early Booking Window Info */}
              <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 flex items-start gap-3">
                <Clock className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
                <div className="text-sm text-blue-950">
                  <p className="font-semibold">
                    {language === 'hi'
                      ? 'अस्पताल अर्ली बुकिंग विंडो (कॉन्फ़िगर करने योग्य)'
                      : 'Hospital Early OPD Booking Window (Configurable by Hospital Admin)'}
                  </p>
                  <p className="text-xs text-blue-800 mt-0.5">
                    {language === 'hi'
                      ? selectedHospital.earlyBookingWindow.labelHi
                      : selectedHospital.earlyBookingWindow.labelEn}
                  </p>
                </div>
              </div>

              {/* Date Picker */}
              <div>
                <p className="text-xs font-semibold text-slate-600 mb-2">
                  {language === 'hi' ? 'तारीख चुनें' : 'Choose Date'}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {dates.map((d) => (
                    <button
                      key={d.label}
                      type="button"
                      onClick={() => setSelectedDate(d.label)}
                      className={`p-3 rounded-xl border text-left transition-colors min-h-[58px] ${
                        selectedDate === d.label
                          ? 'border-teal-600 bg-teal-50 text-teal-900 font-semibold'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="text-xs text-slate-500">{d.sub}</div>
                      <div className="text-sm font-mono">{d.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Slots + Waitlist + Cancellation Recovery */}
              <div>
                <p className="text-xs font-semibold text-slate-600 mb-2">
                  {language === 'hi' ? 'उपलब्ध समय और वेटिंग लिस्ट' : 'Available Slots & Waiting List'}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {selectedDoctor.slots.map((slot) => {
                    const isRecovered = recoveredSlots.includes(`${selectedDoctor.id}-${slot.time}`);
                    const isAvailable = slot.available || isRecovered;
                    const active = selectedTime === slot.time;
                    return (
                      <div
                        key={slot.time}
                        className={`p-3.5 rounded-xl border flex flex-col justify-between gap-2.5 ${
                          active
                            ? 'border-teal-600 bg-teal-50/60'
                            : isAvailable
                            ? 'border-slate-200 bg-white'
                            : 'border-amber-200 bg-amber-50/40'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-sm font-semibold text-slate-900">
                            {slot.time}
                          </span>
                          <span
                            className={`text-xs font-medium ${
                              isAvailable ? 'text-emerald-700' : 'text-amber-700'
                            }`}
                          >
                            {isRecovered
                              ? language === 'hi'
                                ? 'रद्द स्लॉट मिला!'
                                : 'Recovered Slot'
                              : isAvailable
                              ? language === 'hi'
                                ? 'उपलब्ध'
                                : 'Available'
                              : language === 'hi'
                              ? `वेटलिस्ट (${slot.waitlistCount || 1})`
                              : `Full · Waitlist (${slot.waitlistCount || 1})`}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedTime(slot.time);
                              setIsWaitlistSlot(!isAvailable);
                            }}
                            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold min-h-[38px] ${
                              active
                                ? 'bg-teal-700 text-white'
                                : isAvailable
                                ? 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                                : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                            }`}
                          >
                            {isAvailable
                              ? language === 'hi'
                                ? 'यह समय चुनें'
                                : 'Select Slot'
                              : language === 'hi'
                              ? 'वेटिंग लिस्ट में जुड़ें'
                              : 'Join Waitlist'}
                          </button>

                          {!isAvailable && (
                            <button
                              type="button"
                              onClick={() => simulateCancellationRecovery(slot.time)}
                              title="Simulate another patient cancelling this slot"
                              className="p-2 rounded-lg border border-amber-300 bg-white text-amber-800 hover:bg-amber-50 min-h-[38px]"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  {language === 'hi'
                    ? 'टिप: किसी भरे हुए स्लॉट पर रीफ्रेश आइकन दबाकर "कैंसिलेशन रिकवरी" डेमो देखें।'
                    : 'Demo tip: Tap the refresh icon on a full slot to simulate automatic cancellation recovery.'}
                </p>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setStep(5)}
                  className="px-6 py-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold min-h-[46px]"
                >
                  {language === 'hi' ? 'मरीज़ का विवरण भरें' : 'Continue to Patient Details'}
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: Patient Details */}
          {step === 5 && (
            <form onSubmit={handleConfirmBooking} className="space-y-5 max-w-2xl">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-xl font-bold text-slate-900">
                  {language === 'hi' ? 'मरीज़ की जानकारी जांचें' : 'Confirm Patient Details'}
                </h3>
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {language === 'hi' ? 'पीछे' : 'Back'}
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm space-y-1">
                <p className="font-semibold text-slate-900">
                  {selectedDoctor.name} · {selectedDepartment}
                </p>
                <p className="text-slate-600">
                  {selectedHospital.name} · {selectedDate} at {selectedTime}
                  {isWaitlistSlot ? ' (Waitlist Priority)' : ''}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    {language === 'hi' ? 'मरीज़ का पूरा नाम' : 'Patient Full Name'}
                  </label>
                  <input
                    type="text"
                    required
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-teal-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    {language === 'hi' ? 'उम्र (वर्ष)' : 'Age (Years)'}
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={115}
                    value={patientAge}
                    onChange={(e) => setPatientAge(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-teal-600 focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    {language === 'hi' ? 'मोबाइल नंबर (+91)' : 'Mobile Number (+91)'}
                  </label>
                  <input
                    type="tel"
                    required
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-teal-600 focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    {language === 'hi'
                      ? 'लक्षण या विजिट का कारण (वैकल्पिक)'
                      : 'Brief Symptoms or Reason for Visit (Optional)'}
                  </label>
                  <textarea
                    rows={2}
                    value={visitNotes}
                    onChange={(e) => setVisitNotes(e.target.value)}
                    placeholder={
                      language === 'hi'
                        ? 'जैसे: घुटने में दर्द या बीपी की नियमित जांच'
                        : 'e.g., Routine BP checkup or knee discomfort'
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-teal-600 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-semibold text-sm min-h-[48px]"
              >
                {isWaitlistSlot
                  ? language === 'hi'
                    ? 'वेटिंग लिस्ट में कन्फर्म करें'
                    : 'Confirm Waitlist Slot'
                  : language === 'hi'
                  ? 'अपॉइंटमेंट कन्फर्म करें'
                  : 'Confirm Appointment & Get Token'}
              </button>
            </form>
          )}

          {/* STEP 6: Booking Confirmation */}
          {step === 6 && confirmedAppointment && (
            <div className="max-w-2xl mx-auto py-2 space-y-6">
              <div className="flex items-start gap-3.5">
                <CheckCircle2 className="w-9 h-9 text-emerald-600 shrink-0" />
                <div>
                  <h3 className="font-display text-2xl font-bold text-slate-900">
                    {language === 'hi'
                      ? 'आपका अपॉइंटमेंट बुक हो गया है!'
                      : 'Appointment Confirmed'}
                  </h3>
                  <p className="text-sm text-slate-600 mt-0.5">
                    {language === 'hi'
                      ? 'अस्पताल स्टाफ डैशबोर्ड पर भी आपका टोकन तुरंत अपडेट हो गया है।'
                      : 'Your booking is synced with the hospital reception desk.'}
                  </p>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-[#FAFBF9] border border-slate-200 grid grid-cols-2 sm:grid-cols-3 gap-5">
                <div>
                  <p className="text-xs text-slate-500">Token Number</p>
                  <p className="font-mono text-2xl font-bold text-teal-800 mt-0.5">
                    {confirmedAppointment.tokenNumber}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Date & Time</p>
                  <p className="text-sm font-semibold text-slate-900 mt-1">
                    {confirmedAppointment.date} · {confirmedAppointment.time}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Estimated Wait</p>
                  <p className="font-mono text-sm font-semibold text-slate-900 mt-1">
                    ~{confirmedAppointment.estimatedWaitMins} mins
                  </p>
                </div>
                <div className="col-span-2 sm:col-span-3 pt-3 border-t border-slate-200 space-y-1">
                  <p className="text-sm font-bold text-slate-900">
                    {confirmedAppointment.doctorName} · {confirmedAppointment.department}
                  </p>
                  <p className="text-sm text-slate-600">{confirmedAppointment.hospitalName}</p>
                  <p className="text-xs text-teal-800 pt-1">
                    {language === 'hi'
                      ? confirmedAppointment.instructionsHi
                      : confirmedAppointment.instructionsEn}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setPatientPage('journey')}
                  className="px-5 py-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold min-h-[44px]"
                >
                  {language === 'hi' ? 'मेरा सफर देखें' : 'Track My Health Journey'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setViewTab('my-bookings');
                  }}
                  className="px-5 py-3 rounded-xl border border-slate-300 bg-white text-slate-800 text-sm font-medium min-h-[44px]"
                >
                  {language === 'hi' ? 'मेरी सभी बुकिंग देखें' : 'View My Bookings'}
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* MY BOOKINGS & QUEUE STATUS */
        <div className="space-y-4">
          {patientBookings.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-3">
              <Calendar className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="font-display font-bold text-slate-900">No appointments yet</p>
              <button
                type="button"
                onClick={() => setViewTab('book')}
                className="px-5 py-2.5 rounded-xl bg-teal-700 text-white text-sm font-semibold"
              >
                Book Your First Appointment
              </button>
            </div>
          ) : (
            patientBookings.map((apt) => (
              <div
                key={apt.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-xs text-slate-500">
                      {apt.date} · {apt.time} · {apt.type} ·{' '}
                      <span
                        className={`font-semibold ${
                          apt.status === 'Cancelled'
                            ? 'text-red-700'
                            : apt.status === 'Waitlisted'
                            ? 'text-amber-700'
                            : 'text-emerald-700'
                        }`}
                      >
                        {apt.status}
                      </span>
                    </div>
                    <h3 className="font-display text-lg font-bold text-slate-900">
                      {apt.doctorName} — {apt.department}
                    </h3>
                    <p className="text-sm text-slate-600">{apt.hospitalName}</p>
                    <p className="text-xs text-slate-500 pt-1">
                      {language === 'hi' ? apt.instructionsHi : apt.instructionsEn}
                    </p>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end gap-4 sm:gap-1 shrink-0">
                    <div className="text-left sm:text-right">
                      <p className="text-xs text-slate-500">Token</p>
                      <p className="font-mono text-xl font-bold text-teal-800">{apt.tokenNumber}</p>
                    </div>
                    {apt.status !== 'Cancelled' && apt.status !== 'Completed' && (
                      <p className="text-xs text-slate-600 tabular-nums">
                        Est. Wait: ~{apt.estimatedWaitMins} mins
                      </p>
                    )}
                  </div>
                </div>

                {apt.status !== 'Cancelled' && apt.status !== 'Completed' && (
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2.5">
                    {apt.status === 'Booked' && (
                      <button
                        type="button"
                        onClick={() => {
                          updateAppointmentStatus(apt.id, 'Checked In');
                          pushToast(
                            language === 'hi'
                              ? `टोकन ${apt.tokenNumber} चेक-इन हो गया!`
                              : `Checked in for Token ${apt.tokenNumber}!`
                          );
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold min-h-[40px]"
                      >
                        <UserCheck className="w-4 h-4" />
                        {language === 'hi' ? 'अस्पताल में चेक-इन करें' : 'Self Check-In'}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setRescheduleId(rescheduleId === apt.id ? null : apt.id)}
                      className="px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-medium min-h-[40px]"
                    >
                      {language === 'hi' ? 'समय बदलें' : 'Reschedule'}
                    </button>

                    <button
                      type="button"
                      onClick={() => setCancelConfirmId(apt.id)}
                      className="px-3.5 py-2 rounded-xl border border-red-200 text-red-700 hover:bg-red-50 text-xs font-medium min-h-[40px]"
                    >
                      {language === 'hi' ? 'रद्द करें' : 'Cancel'}
                    </button>
                  </div>
                )}

                {/* Inline Reschedule Controls */}
                {rescheduleId === apt.id && (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-end gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">New Date</label>
                      <select
                        value={rescheduleDate}
                        onChange={(e) => setRescheduleDate(e.target.value)}
                        className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm"
                      >
                        {dates.map((d) => (
                          <option key={d.label} value={d.label}>
                            {d.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">New Time</label>
                      <select
                        value={rescheduleTime}
                        onChange={(e) => setRescheduleTime(e.target.value)}
                        className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm"
                      >
                        <option value="10:30 AM">10:30 AM</option>
                        <option value="11:30 AM">11:30 AM</option>
                        <option value="12:15 PM">12:15 PM</option>
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        rescheduleAppointment(apt.id, rescheduleDate, rescheduleTime);
                        setRescheduleId(null);
                        pushToast('Appointment rescheduled successfully.');
                      }}
                      className="px-4 py-2 rounded-lg bg-teal-700 text-white text-xs font-semibold min-h-[38px]"
                    >
                      Save New Slot
                    </button>
                  </div>
                )}

                {/* Confirmation Before Cancel */}
                {cancelConfirmId === apt.id && (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <p className="text-xs sm:text-sm font-medium text-red-900 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {language === 'hi'
                        ? 'क्या आप वाकई यह अपॉइंटमेंट रद्द करना चाहते हैं?'
                        : 'Are you sure you want to cancel this appointment? Your slot will be offered to waitlisted patients.'}
                    </p>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          updateAppointmentStatus(apt.id, 'Cancelled');
                          setCancelConfirmId(null);
                          pushToast('Appointment cancelled.', 'warning');
                        }}
                        className="px-3.5 py-2 rounded-lg bg-red-600 text-white text-xs font-semibold"
                      >
                        Confirm Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => setCancelConfirmId(null)}
                        className="px-3.5 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 text-xs font-medium"
                      >
                        Keep Slot
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
