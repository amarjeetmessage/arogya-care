import React, { useState } from 'react';
import {
  Users,
  ShieldCheck,
  Eye,
  Plus,
  Calendar,
  Pill,
  FileText,
  MapPin,
  AlertCircle,
  Lock,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CaregiverMember } from '../types/healthcare';

export function FamilyCare() {
  const {
    language,
    patient,
    caregivers,
    appointments,
    medicines,
    reports,
    updateCaregiverPermission,
    addCaregiver,
    setPatientPage,
    pushToast,
  } = useApp();

  const [previewCaregiverId, setPreviewCaregiverId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRelation, setNewRelation] = useState('');
  const [newPhone, setNewPhone] = useState('');

  const previewMember = caregivers.find((c) => c.id === previewCaregiverId) || null;

  const permissionItems: {
    key: keyof CaregiverMember['permissions'];
    labelEn: string;
    labelHi: string;
  }[] = [
    { key: 'appointments', labelEn: 'Appointments & Check-in', labelHi: 'अपॉइंटमेंट और चेक-इन' },
    { key: 'medicines', labelEn: 'Medicine Reminders', labelHi: 'दवाई रिमाइंडर' },
    { key: 'reports', labelEn: 'Medical Reports & History', labelHi: 'मेडिकल रिपोर्ट्स' },
    { key: 'navigation', labelEn: 'Hospital Navigation', labelHi: 'अस्पताल का रास्ता' },
    { key: 'emergency', labelEn: 'Emergency Alerts & Contact', labelHi: 'इमरजेंसी संपर्क' },
  ];

  const handleAddCaregiver = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) return;
    addCaregiver({
      name: newName.trim(),
      relation: newRelation.trim() || 'Family Member',
      phone: newPhone.trim(),
      permissions: {
        appointments: true,
        medicines: true,
        reports: false,
        navigation: true,
        emergency: true,
      },
    });
    setNewName('');
    setNewRelation('');
    setNewPhone('');
    setShowAddForm(false);
    pushToast('Authorized caregiver added with privacy permissions.');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900">
            {language === 'hi' ? 'परिवार देखभाल मोड (Family Care)' : 'Family Care & Caregiver Mode'}
          </h2>
          <p className="text-sm text-slate-600 mt-0.5">
            {language === 'hi'
              ? 'परिवार के अधिकृत सदस्य केवल वही जानकारी देख सकते हैं जिसकी आपने अनुमति दी है।'
              : 'Authorize family members to help coordinate care while controlling exact privacy permissions.'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold min-h-[44px] self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          {language === 'hi' ? 'परिवार सदस्य जोड़ें' : 'Add Family Caregiver'}
        </button>
      </div>

      {/* Add Family Member Form */}
      {showAddForm && (
        <form
          onSubmit={handleAddCaregiver}
          className="bg-white rounded-2xl border border-teal-200 p-5 space-y-4"
        >
          <h3 className="font-display text-base font-bold text-slate-900">
            Authorize a New Family Member
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              required
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Full Name (e.g., Sunita Verma)"
              className="px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
            />
            <input
              type="text"
              required
              value={newRelation}
              onChange={(e) => setNewRelation(e.target.value)}
              placeholder="Relation (e.g., Spouse, Son)"
              className="px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
            />
            <input
              type="tel"
              required
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              placeholder="+91 98XXX XXXXX"
              className="px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-teal-700 text-white text-sm font-semibold min-h-[42px]"
            >
              Authorize Caregiver
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-sm font-medium min-h-[42px]"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Caregiver Privacy Permission Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {caregivers.map((cg) => (
          <section
            key={cg.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-5"
          >
            <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <p className="text-xs text-slate-500">{cg.relation}</p>
                <h3 className="font-display text-lg font-bold text-slate-900">{cg.name}</h3>
                <p className="text-xs font-mono text-slate-600 mt-0.5">{cg.phone}</p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setPreviewCaregiverId(previewCaregiverId === cg.id ? null : cg.id)
                }
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold min-h-[40px] whitespace-nowrap ${
                  previewCaregiverId === cg.id
                    ? 'bg-slate-900 text-white'
                    : 'bg-teal-50 text-teal-800 hover:bg-teal-100'
                }`}
              >
                <Eye className="w-4 h-4" />
                {previewCaregiverId === cg.id ? 'Close Preview' : 'Preview Caregiver View'}
              </button>
            </div>

            <div className="space-y-2.5">
              <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-teal-700" />
                {language === 'hi' ? 'गोपनीयता अनुमतियाँ (Privacy Permissions)' : 'Authorized Privacy Permissions'}
              </p>

              {permissionItems.map((perm) => {
                const enabled = cg.permissions[perm.key];
                return (
                  <label
                    key={perm.key}
                    className="flex items-center justify-between py-2 px-3 rounded-xl bg-[#FAFBF9] border border-slate-100 cursor-pointer"
                  >
                    <span className="text-sm text-slate-800">
                      {language === 'hi' ? perm.labelHi : perm.labelEn}
                    </span>
                    <input
                      type="checkbox"
                      checked={enabled}
                      onChange={(e) => {
                        updateCaregiverPermission(cg.id, perm.key, e.target.checked);
                        pushToast(
                          `${cg.name}'s access to ${perm.labelEn} ${
                            e.target.checked ? 'enabled' : 'revoked'
                          }.`,
                          'info'
                        );
                      }}
                      className="w-5 h-5 accent-teal-700 cursor-pointer"
                    />
                  </label>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {/* Interactive Caregiver Dashboard Preview (Enforces Authorized Permissions Strictly) */}
      {previewMember && (
        <section className="bg-white rounded-2xl border-2 border-teal-600 p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
            <div>
              <p className="text-xs font-bold text-teal-800">
                CAREGIVER DASHBOARD VIEW · SIGNED IN AS {previewMember.name.toUpperCase()}
              </p>
              <h3 className="font-display text-xl font-bold text-slate-900 mt-0.5">
                Helping Manage Care for {patient.name} ({patient.age} yrs)
              </h3>
            </div>
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Users className="w-4 h-4" />
              Shows only patient-authorized items
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Appointments permission */}
            <div className="p-4 rounded-xl border border-slate-200 bg-[#FAFBF9] space-y-2">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <Calendar className="w-4 h-4 text-teal-700" />
                Appointments
              </div>
              {previewMember.permissions.appointments ? (
                <div className="text-xs text-slate-700 space-y-1">
                  <p className="font-semibold">
                    {appointments[0]?.doctorName} · Token {appointments[0]?.tokenNumber}
                  </p>
                  <p>
                    {appointments[0]?.date}, {appointments[0]?.time} ({appointments[0]?.status})
                  </p>
                  <button
                    type="button"
                    onClick={() => setPatientPage('appointments')}
                    className="text-teal-800 font-semibold hover:underline pt-1"
                  >
                    Manage Appointment
                  </button>
                </div>
              ) : (
                <p className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" /> Not authorized by patient
                </p>
              )}
            </div>

            {/* Medicines permission */}
            <div className="p-4 rounded-xl border border-slate-200 bg-[#FAFBF9] space-y-2">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <Pill className="w-4 h-4 text-teal-700" />
                Medicines Today
              </div>
              {previewMember.permissions.medicines ? (
                <div className="text-xs text-slate-700 space-y-1">
                  <p>
                    {medicines.filter((m) => m.todayStatus === 'Taken').length} of{' '}
                    {medicines.length} doses taken today.
                  </p>
                  <p className="text-slate-500">
                    Next: {medicines.find((m) => m.todayStatus === 'Pending')?.name || 'All done'}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" /> Not authorized by patient
                </p>
              )}
            </div>

            {/* Reports permission */}
            <div className="p-4 rounded-xl border border-slate-200 bg-[#FAFBF9] space-y-2">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <FileText className="w-4 h-4 text-teal-700" />
                Medical Reports
              </div>
              {previewMember.permissions.reports ? (
                <div className="text-xs text-slate-700 space-y-1">
                  <p className="font-semibold">{reports[0]?.title}</p>
                  <p className="text-slate-500">{reports[0]?.date} · Accessible</p>
                </div>
              ) : (
                <p className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" /> Private — Not authorized by patient
                </p>
              )}
            </div>

            {/* Navigation & Emergency */}
            <div className="p-4 rounded-xl border border-slate-200 bg-[#FAFBF9] space-y-2">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <MapPin className="w-4 h-4 text-teal-700" />
                Hospital Navigation
              </div>
              {previewMember.permissions.navigation ? (
                <button
                  type="button"
                  onClick={() => setPatientPage('navigation')}
                  className="text-xs font-semibold text-teal-800 hover:underline"
                >
                  Open Sanjeevani Floor Directions
                </button>
              ) : (
                <p className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" /> Not authorized
                </p>
              )}
            </div>

            <div className="p-4 rounded-xl border border-red-200 bg-red-50/40 space-y-2">
              <div className="flex items-center gap-2 text-sm font-bold text-red-800">
                <AlertCircle className="w-4 h-4 text-red-600" />
                Emergency Contact
              </div>
              {previewMember.permissions.emergency ? (
                <button
                  type="button"
                  onClick={() => setPatientPage('emergency')}
                  className="text-xs font-semibold text-red-700 hover:underline"
                >
                  Trigger Emergency Coordination for {patient.name.split(' ')[0]}
                </button>
              ) : (
                <p className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" /> Not authorized
                </p>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
