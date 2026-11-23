import React, { useMemo, useState } from 'react';
import {
  HeartPulse,
  Activity,
  Thermometer,
  Droplets,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export function HealthRiskAssessment() {
  const { language, patient, setPatientPage } = useApp();

  // Editable Vitals & Screening Parameters (pre-populated from Ramesh Kumar Verma's sample vitals)
  const [heartRate, setHeartRate] = useState(72);
  const [spo2, setSpo2] = useState(98);
  const [tempF, setTempF] = useState(98.6);
  const [systolicBp, setSystolicBp] = useState(134);
  const [diastolicBp, setDiastolicBp] = useState(84);
  const [heightCm, setHeightCm] = useState(169);
  const [weightKg, setWeightKg] = useState(67);
  const [fastingGlucose, setFastingGlucose] = useState(136);
  const [hba1c, setHba1c] = useState(6.9);
  const [dailyWalkMins, setDailyWalkMins] = useState(25);

  const bmi = useMemo(() => {
    const hM = heightCm / 100;
    if (hM <= 0) return 0;
    return Number((weightKg / (hM * hM)).toFixed(1));
  }, [heightCm, weightKg]);

  const assessment = useMemo(() => {
    let score = 95;
    const factors: string[] = [];

    if (hba1c >= 7.5 || fastingGlucose >= 155) {
      score -= 22;
      factors.push('Blood sugar metrics elevated above target');
    } else if (hba1c >= 6.5 || fastingGlucose >= 126) {
      score -= 10;
      factors.push('Fasting glucose & HbA1c need routine monitoring');
    }

    if (systolicBp >= 145 || diastolicBp >= 95) {
      score -= 18;
      factors.push('Blood pressure above senior target range');
    } else if (systolicBp >= 135) {
      score -= 6;
      factors.push('Mildly borderline systolic BP');
    }

    if (bmi >= 27.5 || bmi < 18.5) {
      score -= 10;
      factors.push(`BMI (${bmi}) outside ideal adult range`);
    }

    if (spo2 < 95) {
      score -= 20;
      factors.push('Low SpO₂ reading — verify immediately with a clinician');
    }

    if (dailyWalkMins >= 25) {
      score = Math.min(98, score + 4);
    } else {
      score -= 6;
      factors.push('Daily physical activity below 25 mins');
    }

    const clamped = Math.max(35, Math.min(98, score));
    const level: 'Low Risk' | 'Moderate Attention' | 'Consult Doctor' =
      clamped >= 80 ? 'Low Risk' : clamped >= 62 ? 'Moderate Attention' : 'Consult Doctor';

    const suggestions = [
      dailyWalkMins < 30
        ? 'Aim for 25–30 minutes of comfortable morning or post-dinner walking.'
        : 'Great consistency with your daily walking habit—keep it up.',
      hba1c >= 6.5
        ? 'Prefer high-fiber dal, green vegetables, and smaller evening carb portions.'
        : 'Maintain balanced Indian home meals with steady meal timings.',
      'Continue your doctor-prescribed medications and carry this vitals log to your next OPD visit.',
    ];

    return { score: clamped, level, factors, suggestions };
  }, [hba1c, fastingGlucose, systolicBp, diastolicBp, bmi, spo2, dailyWalkMins]);

  const gaugeColor =
    assessment.level === 'Low Risk'
      ? '#0F766E'
      : assessment.level === 'Moderate Attention'
      ? '#D97706'
      : '#DC2626';

  const arcLength = 220;
  const dashOffset = arcLength - (arcLength * assessment.score) / 100;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs text-slate-500">
            Informational Preventive Wellness Screening · {patient.name} ({patient.age} yrs)
          </p>
          <h2 className="font-display text-2xl font-bold text-slate-900 mt-0.5">
            {language === 'hi'
              ? 'स्वास्थ्य जोखिम जांच और वाइटल्स'
              : 'Health Risk Assessment & Vitals'}
          </h2>
        </div>

        <button
          type="button"
          onClick={() => setPatientPage('appointments')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold min-h-[44px] self-start sm:self-auto"
        >
          Discuss with Doctor
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Mandatory Screening Disclaimer */}
      <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 flex items-start gap-3 text-xs sm:text-sm text-blue-950">
        <AlertCircle className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
        <p>
          This wellness overview helps visualize your recorded vitals and lifestyle habits. It is{' '}
          <strong>not</strong> a medical diagnosis or clinical prediction tool—always consult a
          qualified doctor for medical decisions.
        </p>
      </div>

      {/* Top 4 Crisp Vitals Cards (Inspired by Image #4) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Heart Rate',
            value: `${heartRate} bpm`,
            sub: 'Resting normal (60–100)',
            icon: HeartPulse,
            tone: 'text-red-600',
          },
          {
            label: 'SpO₂ Level',
            value: `${spo2}%`,
            sub: 'Oxygen saturation',
            icon: Droplets,
            tone: 'text-blue-700',
          },
          {
            label: 'Body Temp',
            value: `${tempF}°F`,
            sub: 'Normal range',
            icon: Thermometer,
            tone: 'text-amber-600',
          },
          {
            label: 'Blood Pressure',
            value: `${systolicBp}/${diastolicBp}`,
            sub: 'mmHg (Clinic reading)',
            icon: Activity,
            tone: 'text-teal-700',
          },
        ].map((v) => {
          const Icon = v.icon;
          return (
            <div
              key={v.label}
              className="bg-white rounded-2xl border border-slate-200 p-5 flex items-start justify-between gap-3"
            >
              <div>
                <p className="text-xs text-slate-500">{v.label}</p>
                <p className="font-mono text-2xl font-bold text-slate-900 tabular-nums mt-1">
                  {v.value}
                </p>
                <p className="text-xs text-slate-500 mt-1">{v.sub}</p>
              </div>
              <Icon className={`w-6 h-6 shrink-0 ${v.tone}`} />
            </div>
          );
        })}
      </div>

      {/* Main Split: Semicircular Wellness Gauge + Editable Vitals Inputs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Result Gauge Card */}
        <section className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-bold text-slate-900">
              Wellness Stability Summary
            </h3>
            <span className="text-xs font-mono text-slate-500">
              Age: {patient.age} · BMI: {bmi}
            </span>
          </div>

          <div className="flex flex-col items-center py-2">
            <svg viewBox="0 0 220 130" className="w-60 h-36">
              <path
                d="M 20 115 A 90 90 0 0 1 200 115"
                fill="none"
                stroke="#E2E8F0"
                strokeWidth="16"
                strokeLinecap="round"
              />
              <path
                d="M 20 115 A 90 90 0 0 1 200 115"
                fill="none"
                stroke={gaugeColor}
                strokeWidth="16"
                strokeLinecap="round"
                strokeDasharray={arcLength}
                strokeDashoffset={dashOffset}
                className="transition-all duration-500"
              />
              <text
                x="110"
                y="92"
                textAnchor="middle"
                className="font-mono font-bold"
                fontSize="30"
                fill="#0F172A"
              >
                {assessment.score}%
              </text>
              <text
                x="110"
                y="114"
                textAnchor="middle"
                fontSize="13"
                fontWeight="700"
                fill={gaugeColor}
              >
                {assessment.level}
              </text>
            </svg>
            <p className="text-sm text-slate-600 text-center max-w-md mt-1">
              Based on your entered vitals and recent lab values, your overall wellness tracking
              status is <strong>{assessment.level}</strong>.
            </p>
          </div>

          {/* Factors & Suggestions */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            {assessment.factors.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-slate-500">Areas to Discuss with Doctor</p>
                <ul className="space-y-1 text-sm text-slate-700">
                  {assessment.factors.map((f) => (
                    <li key={f}>• {f}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="p-4 rounded-xl bg-teal-50/60 border border-teal-200 space-y-2">
              <p className="text-xs font-bold text-teal-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                Practical Wellness Suggestions
              </p>
              <ul className="space-y-1.5 text-sm text-slate-800">
                {assessment.suggestions.map((s) => (
                  <li key={s}>• {s}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Interactive Vitals Adjuster */}
        <section className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
          <div>
            <h3 className="font-display text-lg font-bold text-slate-900">
              Update Your Latest Readings
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Adjust any value from your home BP monitor, oximeter, or lab report to update your
              summary immediately.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Heart Rate (bpm)', val: heartRate, set: setHeartRate, min: 45, max: 140, step: 1 },
              { label: 'SpO₂ (%)', val: spo2, set: setSpo2, min: 85, max: 100, step: 1 },
              { label: 'Systolic BP (mmHg)', val: systolicBp, set: setSystolicBp, min: 90, max: 200, step: 1 },
              { label: 'Diastolic BP (mmHg)', val: diastolicBp, set: setDiastolicBp, min: 55, max: 120, step: 1 },
              { label: 'Fasting Glucose (mg/dL)', val: fastingGlucose, set: setFastingGlucose, min: 65, max: 280, step: 1 },
              { label: 'HbA1c (%)', val: hba1c, set: setHba1c, min: 4.5, max: 11, step: 0.1 },
              { label: 'Weight (kg)', val: weightKg, set: setWeightKg, min: 35, max: 140, step: 1 },
              { label: 'Height (cm)', val: heightCm, set: setHeightCm, min: 130, max: 205, step: 1 },
              { label: 'Body Temp (°F)', val: tempF, set: setTempF, min: 96, max: 104, step: 0.1 },
              { label: 'Daily Walk (mins)', val: dailyWalkMins, set: setDailyWalkMins, min: 0, max: 90, step: 5 },
            ].map((field) => (
              <div key={field.label}>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {field.label}
                </label>
                <input
                  type="number"
                  value={field.val}
                  min={field.min}
                  max={field.max}
                  step={field.step}
                  onChange={(e) => field.set(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-sm tabular-nums focus:border-teal-600 focus:outline-none"
                />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
