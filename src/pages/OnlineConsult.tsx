import React, { useEffect, useState } from 'react';
import {
  Video,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  FileText,
  CheckCircle2,
  CalendarPlus,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Doctor } from '../types/healthcare';

export function OnlineConsult() {
  const { language, doctors, patient, addAppointment, pushToast, setPatientPage } = useApp();

  const onlineDoctors = doctors.filter((d) => d.onlineAvailable);
  const [activeCallDoctor, setActiveCallDoctor] = useState<Doctor | null>(null);
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [sharedReport, setSharedReport] = useState(false);
  const [callSeconds, setCallSeconds] = useState(0);
  const [postCallPrescription, setPostCallPrescription] = useState<Doctor | null>(null);

  useEffect(() => {
    if (!activeCallDoctor) {
      setCallSeconds(0);
      return;
    }
    const timer = setInterval(() => setCallSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, [activeCallDoctor]);

  const formatDuration = (sec: number) => {
    const m = String(Math.floor(sec / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleBookFollowUp = (doc: Doctor) => {
    const apt = addAppointment({
      patientName: patient.name,
      patientAge: patient.age,
      patientPhone: patient.phone,
      hospitalId: doc.hospitalId,
      hospitalName: doc.hospitalName,
      department: doc.department,
      doctorId: doc.id,
      doctorName: doc.name,
      date: '06 Dec 2026',
      time: '11:00 AM',
      estimatedWaitMins: 10,
      status: 'Booked',
      type: 'Online Video',
      notes: 'Follow-up after online video consultation',
      instructionsEn: 'Join video room 5 minutes before 11:00 AM from Consult Doctor.',
      instructionsHi: '11:00 बजे से 5 मिनट पहले वीडियो परामर्श कक्ष से जुड़ें।',
    });
    pushToast(`Follow-up booked with ${doc.name} (${apt.tokenNumber}).`);
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs text-slate-500">
          {language === 'hi'
            ? 'सिमुलेटेड वीडियो परामर्श प्रोटोटाइप · वास्तविक लाइव टेलीमेडिसिन कॉल नहीं'
            : 'Simulated Video Consultation Prototype · Demonstrates telemedicine UI & post-visit prescription'}
        </p>
        <h2 className="font-display text-2xl font-bold text-slate-900 mt-0.5">
          {language === 'hi' ? 'डॉक्टर से ऑनलाइन परामर्श' : 'Consult a Doctor Online'}
        </h2>
      </div>

      {/* SIMULATED VIDEO CALL INTERFACE */}
      {activeCallDoctor && (
        <section className="rounded-2xl border border-slate-300 bg-slate-900 text-white overflow-hidden">
          <div className="px-5 py-3.5 bg-slate-950/70 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span>
              Simulated Video Call · <strong>{activeCallDoctor.name}</strong> (
              {activeCallDoctor.department})
            </span>
            <span className="font-mono tabular-nums text-teal-300">
              {formatDuration(callSeconds)}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-5 items-stretch">
            {/* Doctor Frame */}
            <div className="md:col-span-8 relative rounded-xl overflow-hidden bg-slate-800 min-h-[280px] flex items-center justify-center">
              <img
                src={activeCallDoctor.avatar}
                alt={activeCallDoctor.name}
                referrerPolicy="no-referrer"
                className="w-full h-80 object-cover object-top"
              />
              <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                <p className="font-display font-bold text-base">{activeCallDoctor.name}</p>
                <p className="text-xs text-slate-200">
                  {activeCallDoctor.qualification} · Speaking in Hindi / English
                </p>
              </div>
            </div>

            {/* Patient Self Frame & Live Shared Context */}
            <div className="md:col-span-4 flex flex-col justify-between gap-4">
              <div className="rounded-xl bg-slate-800 border border-slate-700 p-4 space-y-2">
                <p className="text-xs text-slate-400">Your Camera (Prototype Preview)</p>
                <div className="h-28 rounded-lg bg-slate-950/60 flex items-center justify-center text-xs text-slate-300">
                  {cameraOff
                    ? 'Camera Paused'
                    : `${patient.name} · ${muted ? 'Mic Muted' : 'Audio Active'}`}
                </div>
              </div>

              <div className="rounded-xl bg-slate-800/80 border border-slate-700 p-4 space-y-2.5 text-xs">
                <p className="font-semibold text-teal-300">Shared Patient Context</p>
                <p className="text-slate-300">
                  Allergies: {patient.allergies.join(', ')} · Blood Group: {patient.bloodGroup}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSharedReport(true);
                    pushToast('18 Nov 2026 CBC & HbA1c report shared in consultation room.', 'info');
                  }}
                  className={`w-full py-2 px-3 rounded-lg font-semibold transition-colors ${
                    sharedReport
                      ? 'bg-emerald-700 text-white'
                      : 'bg-teal-700 hover:bg-teal-600 text-white'
                  }`}
                >
                  {sharedReport ? '18 Nov Report Shared' : 'Share Latest Blood Report'}
                </button>
              </div>
            </div>
          </div>

          {/* Call Controls */}
          <div className="px-5 py-4 bg-slate-950/80 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setMuted(!muted)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold min-h-[44px] ${
                muted ? 'bg-amber-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-white'
              }`}
            >
              {muted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              {muted ? 'Unmute' : 'Mute'}
            </button>
            <button
              type="button"
              onClick={() => setCameraOff(!cameraOff)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold min-h-[44px] ${
                cameraOff ? 'bg-amber-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-white'
              }`}
            >
              {cameraOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
              {cameraOff ? 'Start Video' : 'Stop Video'}
            </button>
            <button
              type="button"
              onClick={() => {
                setPostCallPrescription(activeCallDoctor);
                setActiveCallDoctor(null);
                setSharedReport(false);
                pushToast('Consultation completed. Digital summary generated.');
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold min-h-[44px]"
            >
              <PhoneOff className="w-4 h-4" />
              End Call & View Prescription
            </button>
          </div>
        </section>
      )}

      {/* POST-CONSULTATION PRESCRIPTION & FOLLOW-UP */}
      {postCallPrescription && (
        <section className="bg-white rounded-2xl border border-teal-300 p-6 space-y-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-teal-800">
                Post-Consultation Summary (Simulated Demo)
              </p>
              <h3 className="font-display text-lg font-bold text-slate-900">
                Digital Prescription — {postCallPrescription.name}
              </h3>
              <p className="text-xs text-slate-500">
                22 Nov 2026 · {postCallPrescription.department} · {postCallPrescription.hospitalName}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#FAFBF9] border border-slate-200 text-sm text-slate-700 space-y-1.5">
            <p>
              <strong>Clinician Notes:</strong> Reviewed 18 Nov CBC & HbA1c (6.9%). Continue current
              prescribed morning BP & diabetes medicines and iron-B12 capsule after lunch.
            </p>
            <p>
              <strong>Recommended Follow-up:</strong> Re-check Hemoglobin & Fasting Glucose in 2
              weeks.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => handleBookFollowUp(postCallPrescription)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold min-h-[44px]"
            >
              <CalendarPlus className="w-4 h-4" />
              Book 2-Week Follow-Up
            </button>
            <button
              type="button"
              onClick={() => setPatientPage('medicines')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-sm font-medium min-h-[44px]"
            >
              <FileText className="w-4 h-4" />
              View Medicine Schedule
            </button>
          </div>
        </section>
      )}

      {/* BROWSE DOCTORS AVAILABLE ONLINE */}
      <section className="space-y-4">
        <h3 className="font-display text-lg font-bold text-slate-900">
          {language === 'hi' ? 'ऑनलाइन उपलब्ध डॉक्टर' : 'Available Doctors for Video Consultation'}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {onlineDoctors.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <img
                  src={doc.avatar}
                  alt={doc.name}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-100"
                />
                <div className="space-y-1">
                  <p className="text-xs text-slate-500">
                    {doc.department} · ₹{doc.consultationFeeInr} · {doc.languages.join(', ')}
                  </p>
                  <h4 className="font-display text-base font-bold text-slate-900">{doc.name}</h4>
                  <p className="text-sm text-slate-600">{doc.specialization}</p>
                  <p className="text-xs text-teal-800 font-medium">
                    Next slot: {doc.nextAvailable}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setActiveCallDoctor(doc);
                    setPostCallPrescription(null);
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs sm:text-sm font-semibold min-h-[42px]"
                >
                  <Video className="w-4 h-4" />
                  {language === 'hi' ? 'डेमो वीडियो कॉल शुरू करें' : 'Start Demo Video Call'}
                </button>
                <button
                  type="button"
                  onClick={() => handleBookFollowUp(doc)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs sm:text-sm font-medium min-h-[42px]"
                >
                  {language === 'hi' ? 'बुक करें' : 'Book Slot'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
