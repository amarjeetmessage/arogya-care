import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  FileText,
  IndianRupee,
  Building2,
  Pill,
  Search,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface SchemeItem {
  id: string;
  nameEn: string;
  nameHi: string;
  coverage: string;
  category: string;
  summaryEn: string;
  summaryHi: string;
  documents: string[];
  helpline: string;
  eligibilityTags: string[];
}

const INDIAN_SCHEMES: SchemeItem[] = [
  {
    id: 'ayushman-pmjay',
    nameEn: 'Ayushman Bharat — PM-JAY & Vaya Vandana',
    nameHi: 'आयुष्मान भारत — पीएम-जेएवाई व वय वंदना कार्ड',
    coverage: '₹5,00,000 / family / year',
    category: 'Central Government Scheme',
    summaryEn:
      'Cashless secondary and tertiary hospitalization at empanelled public & private hospitals across India. Senior citizens aged 70+ are eligible regardless of income under Ayushman Vaya Vandana.',
    summaryHi:
      'देशभर के सूचीबद्ध अस्पतालों में प्रति परिवार प्रति वर्ष ₹5,00,000 तक का कैशलेस इलाज। 70 वर्ष से अधिक उम्र के सभी वरिष्ठ नागरिक आय की सीमा के बिना पात्र हैं।',
    documents: ['Aadhaar Card', 'Ration Card / Family ID', 'ABHA Health ID (optional)'],
    helpline: '14555',
    eligibilityTags: ['low-income', 'senior-70', 'all-states'],
  },
  {
    id: 'esic',
    nameEn: 'ESI Benefits (Employees’ State Insurance)',
    nameHi: 'ईएसआई (कर्मचारी राज्य बीमा) लाभ',
    coverage: 'Full Medical + Cash Sickness Benefit',
    category: 'Salaried Employees',
    summaryEn:
      'Comprehensive medical care for insured workers and dependent family members at ESIC dispensaries and tie-up hospitals.',
    summaryHi:
      'बीमित कर्मचारियों और उनके आश्रित परिवार के लिए ईएसआई अस्पतालों में संपूर्ण चिकित्सा सुविधा।',
    documents: ['ESIC e-Pehchan Card', 'Aadhaar Card', 'Employer Verification'],
    helpline: '1800-11-2526',
    eligibilityTags: ['salaried-esi'],
  },
  {
    id: 'cghs',
    nameEn: 'CGHS / State Government Health Scheme',
    nameHi: 'सीजीएचएस / सरकारी कर्मचारी स्वास्थ्य योजना',
    coverage: 'OPD, Medicines & Cashless Hospitalization',
    category: 'Govt. Employees & Pensioners',
    summaryEn:
      'Cashless inpatient care, diagnostic tests, and wellness center OPD coverage for central/state government employees and retired pensioners.',
    summaryHi:
      'केंद्र व राज्य सरकार के कर्मचारियों तथा पेंशनभोगियों के लिए कैशलेस अस्पताल, जांच और दवाई सुविधा।',
    documents: ['CGHS / State Health Card', 'Pension Payment Order (if retired)', 'Aadhaar Card'],
    helpline: '1800-208-8900',
    eligibilityTags: ['govt-employee'],
  },
  {
    id: 'lic-insurance',
    nameEn: 'LIC & Health Insurance Cashless Support',
    nameHi: 'एलआईसी व हेल्थ इंश्योरेंस कैशलेस सहायता',
    coverage: 'As per active Policy Sum Insured',
    category: 'Insurance Support',
    summaryEn:
      'Pre-authorization checklist, TPA desk coordination, and discharge document bundle preparation for faster cashless claims.',
    summaryHi:
      'टीपीए डेस्क और कैशलेस क्लेम के लिए जरूरी दस्तावेजों की पहले से तैयारी और सहायता।',
    documents: ['Policy Document / e-Card', 'Photo ID (Aadhaar/PAN)', 'Doctor Admission Advice'],
    helpline: 'TPA Helpdesk at Hospital',
    eligibilityTags: ['insured'],
  },
  {
    id: 'janaushadhi',
    nameEn: 'Pradhan Mantri Bhartiya Janaushadhi Pariyojana',
    nameHi: 'प्रधानमंत्री जन औषधि केंद्र (सस्ती दवाइयां)',
    coverage: '50% – 80% Lower Medicine Cost',
    category: 'Open to All Citizens',
    summaryEn:
      'Quality-tested generic medicines available to every Indian citizen at significantly lower prices across 10,000+ Jan Aushadhi Kendras.',
    summaryHi:
      'सभी नागरिकों के लिए 50% से 80% कम कीमत पर गुणवत्ता-जांची जेनेरिक दवाइयां।',
    documents: ['Doctor Prescription (No special card required)'],
    helpline: '1800-180-8080',
    eligibilityTags: ['everyone'],
  },
];

export function SchemesBenefits() {
  const { language, patient, pushToast } = useApp();

  const [age, setAge] = useState(patient.age);
  const [employment, setEmployment] = useState<'retired-private' | 'salaried-esi' | 'govt-employee' | 'self-employed'>('retired-private');
  const [incomeBracket, setIncomeBracket] = useState<'under-5l' | 'above-5l'>('under-5l');
  const [hasPrivateInsurance, setHasPrivateInsurance] = useState(true);
  const [checkedSchemeId, setCheckedSchemeId] = useState<string | null>(null);

  const isEligible = (scheme: SchemeItem): boolean => {
    if (scheme.id === 'janaushadhi') return true;
    if (scheme.id === 'ayushman-pmjay') return age >= 70 || incomeBracket === 'under-5l';
    if (scheme.id === 'esic') return employment === 'salaried-esi';
    if (scheme.id === 'cghs') return employment === 'govt-employee';
    if (scheme.id === 'lic-insurance') return hasPrivateInsurance;
    return false;
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs text-slate-500">
          Informational Eligibility Guide · Verify final enrollment on official government portals
          (beneficiary.nha.gov.in)
        </p>
        <h2 className="font-display text-2xl font-bold text-slate-900 mt-0.5">
          {language === 'hi'
            ? 'सरकारी स्वास्थ्य योजनाएं व लाभ'
            : 'Government Schemes & Health Benefits'}
        </h2>
      </div>

      {/* Quick Eligibility Checker */}
      <section className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Search className="w-5 h-5 text-teal-700" />
          <h3 className="font-display text-lg font-bold text-slate-900">
            {language === 'hi' ? 'तुरंत पात्रता जांचें' : 'Quick Eligibility Checker'}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Patient Age (Years)
            </label>
            <input
              type="number"
              min={1}
              max={110}
              value={age}
              onChange={(e) => setAge(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono"
            />
            {age >= 70 && (
              <p className="text-xs text-emerald-700 font-medium mt-1">
                Eligible for Senior Citizen 70+ Ayushman Vaya Vandana
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Employment / Status
            </label>
            <select
              value={employment}
              onChange={(e) => setEmployment(e.target.value as typeof employment)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm"
            >
              <option value="retired-private">Senior / Retired (Private)</option>
              <option value="salaried-esi">Salaried (ESI Covered)</option>
              <option value="govt-employee">Govt. Employee / Pensioner</option>
              <option value="self-employed">Self-Employed / Agriculture</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Annual Family Income
            </label>
            <select
              value={incomeBracket}
              onChange={(e) => setIncomeBracket(e.target.value as typeof incomeBracket)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm"
            >
              <option value="under-5l">Below ₹5,00,000 / Priority Ration Card</option>
              <option value="above-5l">Above ₹5,00,000</option>
            </select>
          </div>

          <div className="flex items-end">
            <label className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer min-h-[42px]">
              <input
                type="checkbox"
                checked={hasPrivateInsurance}
                onChange={(e) => setHasPrivateInsurance(e.target.checked)}
                className="w-4 h-4 accent-teal-700"
              />
              <span className="text-xs font-semibold text-slate-800">
                Have LIC / Private Policy
              </span>
            </label>
          </div>
        </div>
      </section>

      {/* Schemes Grid */}
      <div className="space-y-4">
        {INDIAN_SCHEMES.map((scheme) => {
          const likelyEligible = isEligible(scheme);
          const expanded = checkedSchemeId === scheme.id;
          return (
            <section
              key={scheme.id}
              className={`bg-white rounded-2xl border p-5 sm:p-6 space-y-4 transition-colors ${
                likelyEligible ? 'border-teal-300' : 'border-slate-200'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span>{scheme.category}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono font-semibold text-teal-800">{scheme.coverage}</span>
                    <span aria-hidden="true">·</span>
                    <span
                      className={`font-semibold ${
                        likelyEligible ? 'text-emerald-700' : 'text-slate-500'
                      }`}
                    >
                      {likelyEligible ? 'Likely Eligible' : 'Check Official Criteria'}
                    </span>
                  </div>

                  <h3 className="font-display text-lg sm:text-xl font-bold text-slate-900">
                    {language === 'hi' ? scheme.nameHi : scheme.nameEn}
                  </h3>

                  <p className="text-sm text-slate-600 leading-relaxed">
                    {language === 'hi' ? scheme.summaryHi : scheme.summaryEn}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setCheckedSchemeId(expanded ? null : scheme.id);
                    if (!expanded) {
                      pushToast(`Opened checklist for ${scheme.nameEn}.`, 'info');
                    }
                  }}
                  className="px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold whitespace-nowrap self-start min-h-[44px]"
                >
                  {expanded
                    ? language === 'hi'
                      ? 'विवरण छिपाएं'
                      : 'Hide Checklist'
                    : language === 'hi'
                    ? 'पात्रता व दस्तावेज़ देखें'
                    : 'Check & Documents'}
                </button>
              </div>

              {expanded && (
                <div className="pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm bg-[#FAFBF9] rounded-xl p-4">
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-teal-700" />
                      Required Documents
                    </p>
                    <ul className="space-y-1 text-xs text-slate-800">
                      {scheme.documents.map((doc) => (
                        <li key={doc} className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          {doc}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-teal-700" />
                      How to Use at Hospital
                    </p>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      Show your Aadhaar & ABHA ID ({patient.abhaId}) at Sanjeevani Hospital’s
                      Ayushman Mitra / TPA Desk near Ground Floor Registration.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-teal-700" />
                      Official Helpline
                    </p>
                    <p className="font-mono text-base font-bold text-slate-900">{scheme.helpline}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <IndianRupee className="w-3.5 h-3.5" /> Zero fee for government verification
                    </p>
                  </div>
                </div>
              )}
            </section>
          );
        })}
      </div>

      {/* Jan Aushadhi Reminder Note */}
      <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-200 flex items-start gap-3 text-xs sm:text-sm text-teal-950">
        <Pill className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
        <p>
          <strong>Tip for ongoing prescriptions:</strong> Ask your doctor if generic equivalents
          from a nearby Jan Aushadhi Kendra are suitable for your monthly refills.
        </p>
      </div>
    </div>
  );
}
