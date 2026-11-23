import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  SkipForward,
  Plus,
  Calendar,
  AlertCircle,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MedicineItem } from '../types/healthcare';

export function MedicinesTracker() {
  const {
    language,
    medicines,
    followUps,
    updateMedicineStatus,
    addMedicine,
    toggleFollowUpComplete,
    pushToast,
  } = useApp();

  const [addOpen, setAddOpen] = useState(false);
  const [medName, setMedName] = useState('');
  const [medDosage, setMedDosage] = useState('1 Tablet');
  const [medSlot, setMedSlot] = useState<'Morning' | 'Afternoon' | 'Night'>('Morning');
  const [medTime, setMedTime] = useState('08:30 AM');
  const [medInstructions, setMedInstructions] = useState('After meal with water');
  const [prescribedBy, setPrescribedBy] = useState('Dr. Meera Sharma');

  const takenCount = medicines.filter((m) => m.todayStatus === 'Taken').length;
  const slots: Array<{ key: 'Morning' | 'Afternoon' | 'Night'; labelEn: string; labelHi: string }> = [
    { key: 'Morning', labelEn: 'Morning Schedule', labelHi: 'सुबह की दवाइयां' },
    { key: 'Afternoon', labelEn: 'Afternoon Schedule', labelHi: 'दोपहर की दवाइयां' },
    { key: 'Night', labelEn: 'Night Schedule', labelHi: 'रात की दवाइयां' },
  ];

  const handleAddMedicine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!medName.trim()) return;
    addMedicine({
      name: medName.trim(),
      dosage: medDosage.trim() || '1 Tablet',
      scheduleSlot: medSlot,
      time: medTime,
      frequency: 'Daily (Per Prescription)',
      duration: 'As prescribed',
      instructionsEn: medInstructions.trim(),
      instructionsHi: medInstructions.trim(),
      prescribedBy: prescribedBy.trim() || 'Patient Entered (From Prescription)',
      prescribedDate: '22 Nov 2026',
    });
    setMedName('');
    setAddOpen(false);
    pushToast(
      language === 'hi' ? 'नई दवाई सूची में जुड़ गई है।' : 'Prescribed medicine added to schedule.'
    );
  };

  const statusTone = (status: MedicineItem['todayStatus']) => {
    if (status === 'Taken') return 'text-emerald-700';
    if (status === 'Skipped') return 'text-red-700';
    if (status === 'Remind Later') return 'text-amber-700';
    return 'text-slate-600';
  };

  return (
    <div className="space-y-6">
      {/* Header & Daily Progress */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs text-slate-500 tabular-nums">
            Today, 22 Nov 2026 · {takenCount} of {medicines.length} doses marked taken
          </p>
          <h2 className="font-display text-2xl font-bold text-slate-900 mt-0.5">
            {language === 'hi' ? 'मेरी दवाइयां और फॉलो-अप' : 'My Medicines & Follow-ups'}
          </h2>
        </div>

        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold min-h-[44px] self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          {language === 'hi' ? 'पर्चे से दवाई जोड़ें' : 'Add Prescribed Medicine'}
        </button>
      </div>

      {/* Prescription Safety Notice */}
      <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 flex items-start gap-3 text-xs sm:text-sm text-slate-700">
        <AlertCircle className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
        <p>
          {language === 'hi'
            ? 'यह सूची केवल डॉक्टर द्वारा लिखे पर्चे या आपके द्वारा दर्ज जानकारी पर आधारित है। बिना डॉक्टर की सलाह के खुराक न बदलें।'
            : 'All medicine schedules originate strictly from clinician-approved prescriptions or patient-entered records. Aarogya Care never recommends dosage changes.'}
        </p>
      </div>

      {/* Grouped Today's Medicine Schedule */}
      <div className="space-y-6">
        {slots.map((slot) => {
          const slotMeds = medicines.filter((m) => m.scheduleSlot === slot.key);
          if (slotMeds.length === 0) return null;

          return (
            <section key={slot.key} className="space-y-3">
              <h3 className="font-display text-base font-bold text-slate-900">
                {language === 'hi' ? slot.labelHi : slot.labelEn}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {slotMeds.map((med) => (
                  <div
                    key={med.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between gap-4"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono font-semibold text-teal-800">{med.time}</span>
                        <span className={`font-semibold ${statusTone(med.todayStatus)}`}>
                          {med.todayStatus}
                        </span>
                      </div>

                      <h4 className="font-display text-lg font-bold text-slate-900">{med.name}</h4>
                      <p className="text-sm font-medium text-slate-700">
                        {med.dosage} · {med.frequency} · {med.duration}
                      </p>
                      <p className="text-sm text-slate-600">
                        {language === 'hi' ? med.instructionsHi : med.instructionsEn}
                      </p>
                      <p className="text-xs text-slate-400 pt-1">
                        Prescribed by {med.prescribedBy} ({med.prescribedDate})
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          updateMedicineStatus(med.id, 'Taken');
                          pushToast(`${med.name} marked as Taken.`);
                        }}
                        className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold min-h-[42px] transition-colors ${
                          med.todayStatus === 'Taken'
                            ? 'bg-emerald-700 text-white'
                            : 'bg-teal-50 text-teal-800 hover:bg-teal-100'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        {language === 'hi' ? 'ली गई' : 'Taken'}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          updateMedicineStatus(med.id, 'Remind Later');
                          pushToast(`We will remind you about ${med.name} in 30 minutes.`, 'info');
                        }}
                        className={`inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-medium min-h-[42px] border ${
                          med.todayStatus === 'Remind Later'
                            ? 'border-amber-400 bg-amber-50 text-amber-900'
                            : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        {language === 'hi' ? 'बाद में' : 'Later'}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          updateMedicineStatus(med.id, 'Skipped');
                          pushToast(`${med.name} marked as Skipped.`, 'warning');
                        }}
                        className={`inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-medium min-h-[42px] border ${
                          med.todayStatus === 'Skipped'
                            ? 'border-red-300 bg-red-50 text-red-800'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <SkipForward className="w-3.5 h-3.5" />
                        {language === 'hi' ? 'छूटी' : 'Skipped'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {/* Follow-up Reminders */}
      <section className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-teal-700" />
          <h3 className="font-display text-lg font-bold text-slate-900">
            {language === 'hi' ? 'आगामी फॉलो-अप व जांच रिमाइंडर' : 'Follow-up & Lab Reminders'}
          </h3>
        </div>

        <div className="divide-y divide-slate-100">
          {followUps.map((fu) => (
            <div
              key={fu.id}
              className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className={fu.completed ? 'opacity-60 line-through' : ''}>
                <p className="text-xs text-slate-500">
                  {fu.type} · {fu.date}, {fu.time}
                </p>
                <p className="text-sm sm:text-base font-semibold text-slate-900">
                  {language === 'hi' ? fu.titleHi : fu.titleEn}
                </p>
                <p className="text-xs text-slate-600">{fu.location}</p>
              </div>
              <button
                type="button"
                onClick={() => toggleFollowUpComplete(fu.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold min-h-[40px] self-start sm:self-center whitespace-nowrap ${
                  fu.completed
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                }`}
              >
                {fu.completed
                  ? language === 'hi'
                    ? 'पूरा हुआ'
                    : 'Completed'
                  : language === 'hi'
                  ? 'पूरा चिह्नित करें'
                  : 'Mark Done'}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Add Medicine Modal */}
      {addOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4"
          onClick={() => setAddOpen(false)}
        >
          <form
            onSubmit={handleAddMedicine}
            className="bg-white w-full max-w-md rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-slate-900">
                {language === 'hi' ? 'पर्चे से दवाई जोड़ें' : 'Add Prescribed Medicine'}
              </h3>
              <button
                type="button"
                onClick={() => setAddOpen(false)}
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Medicine Name
                </label>
                <input
                  type="text"
                  required
                  value={medName}
                  onChange={(e) => setMedName(e.target.value)}
                  placeholder="e.g., Calcium + Vitamin D3"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Dosage</label>
                  <input
                    type="text"
                    value={medDosage}
                    onChange={(e) => setMedDosage(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Slot</label>
                  <select
                    value={medSlot}
                    onChange={(e) =>
                      setMedSlot(e.target.value as 'Morning' | 'Afternoon' | 'Night')
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm bg-white"
                  >
                    <option value="Morning">Morning</option>
                    <option value="Afternoon">Afternoon</option>
                    <option value="Night">Night</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Time</label>
                  <input
                    type="text"
                    value={medTime}
                    onChange={(e) => setMedTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Prescribed By
                  </label>
                  <input
                    type="text"
                    value={prescribedBy}
                    onChange={(e) => setPrescribedBy(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Instructions
                </label>
                <input
                  type="text"
                  value={medInstructions}
                  onChange={(e) => setMedInstructions(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold min-h-[44px]"
            >
              {language === 'hi' ? 'शेड्यूल में जोड़ें' : 'Save to Medicine Schedule'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
