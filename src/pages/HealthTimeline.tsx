import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceArea,
} from 'recharts';
import { ArrowRight, FileText, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { HEALTH_TREND_HISTORY } from '../data/mockData';

type MetricKey = 'hemoglobin' | 'glucose' | 'hba1c' | 'cholesterol';

const METRIC_META: Record<
  MetricKey,
  {
    labelEn: string;
    labelHi: string;
    unit: string;
    refText: string;
    refLow: number;
    refHigh: number;
    domain: [number, number];
    prevVal: string;
    currVal: string;
  }
> = {
  hemoglobin: {
    labelEn: 'Hemoglobin',
    labelHi: 'हीमोग्लोबिन',
    unit: 'g/dL',
    refText: '13.0 – 17.0 g/dL (Male)',
    refLow: 13.0,
    refHigh: 17.0,
    domain: [10, 18],
    prevVal: '12.8 g/dL',
    currVal: '12.4 g/dL',
  },
  glucose: {
    labelEn: 'Fasting Blood Glucose',
    labelHi: 'खाली पेट ब्लड शुगर',
    unit: 'mg/dL',
    refText: '70 – 100 mg/dL',
    refLow: 70,
    refHigh: 100,
    domain: [60, 190],
    prevVal: '152 mg/dL',
    currVal: '136 mg/dL',
  },
  hba1c: {
    labelEn: 'HbA1c (3-Month Avg)',
    labelHi: 'HbA1c (3 महीने का औसत)',
    unit: '%',
    refText: '< 5.7% Normal (< 7.0% Target)',
    refLow: 4.0,
    refHigh: 5.7,
    domain: [4, 9],
    prevVal: '7.4%',
    currVal: '6.9%',
  },
  cholesterol: {
    labelEn: 'Total Cholesterol',
    labelHi: 'कुल कोलेस्ट्रॉल',
    unit: 'mg/dL',
    refText: '< 200 mg/dL',
    refLow: 120,
    refHigh: 200,
    domain: [120, 240],
    prevVal: '198 mg/dL',
    currVal: '184 mg/dL',
  },
};

export function HealthTimeline() {
  const { language, timeline, reports, setPatientPage } = useApp();
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>('hba1c');
  const [eventFilter, setEventFilter] = useState<string>('All');

  const meta = METRIC_META[selectedMetric];

  const bloodReports = reports.filter((r) => r.category === 'Blood Tests');
  const currentRep = bloodReports[0];
  const previousRep = bloodReports[1];

  const filteredEvents =
    eventFilter === 'All' ? timeline : timeline.filter((e) => e.type === eventFilter);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-slate-900">
          {language === 'hi' ? 'मेरा स्वास्थ्य इतिहास और रिपोर्ट तुलना' : 'My Health Timeline & Trends'}
        </h2>
        <p className="text-sm text-slate-600 mt-0.5">
          {language === 'hi'
            ? 'समय के साथ अपनी रिपोर्ट के मान और अस्पताल विजिट क्रम से देखें।'
            : 'Track chronological medical visits and compare lab report values across dates.'}
        </p>
      </div>

      {/* Health Parameter Trend Chart */}
      <section className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-display text-lg font-bold text-slate-900">
              {language === 'hi' ? 'प्रमुख जांच रुझान (Trends)' : 'Key Health Parameter Trends'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Reference range from lab report: {meta.refText}
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1 rounded-xl self-start">
            {(Object.keys(METRIC_META) as MetricKey[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedMetric(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors min-h-[36px] ${
                  selectedMetric === key ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                {language === 'hi' ? METRIC_META[key].labelHi : METRIC_META[key].labelEn}
              </button>
            ))}
          </div>
        </div>

        {/* Previous vs Current Summary Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-slate-100">
          <div>
            <p className="text-xs text-slate-500">Previous (14 Aug 2026)</p>
            <p className="font-mono text-lg font-semibold text-slate-700 tabular-nums mt-0.5">
              {meta.prevVal}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Current (18 Nov 2026)</p>
            <p className="font-mono text-lg font-bold text-teal-800 tabular-nums mt-0.5">
              {meta.currVal}
            </p>
          </div>
          <div className="col-span-2">
            <p className="text-xs text-slate-500">Listed Lab Reference Range</p>
            <p className="font-mono text-sm font-medium text-slate-800 mt-1">{meta.refText}</p>
          </div>
        </div>

        {/* Chart */}
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={HEALTH_TREND_HISTORY} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#475569' }} />
              <YAxis domain={meta.domain} tick={{ fontSize: 12, fill: '#475569' }} />
              <Tooltip
                contentStyle={{
                  borderRadius: '12px',
                  borderColor: '#CBD5E1',
                  fontSize: '13px',
                }}
              />
              <ReferenceArea
                y1={meta.refLow}
                y2={meta.refHigh}
                fill="#CCFBF1"
                fillOpacity={0.35}
              />
              <Line
                type="monotone"
                dataKey={selectedMetric}
                stroke="#0F766E"
                strokeWidth={3}
                dot={{ r: 5, fill: '#0F766E', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <p className="text-xs text-slate-500 flex items-center gap-1.5">
          <AlertCircle className="w-4 h-4 text-slate-400 shrink-0" />
          {language === 'hi'
            ? 'यह ग्राफ केवल आपकी पिछली रिपोर्ट के मान दिखाता है। किसी भी बदलाव पर डॉक्टर से चर्चा करें।'
            : 'Charts display historical values recorded in your reports for reference only and do not make diagnostic claims.'}
        </p>
      </section>

      {/* Side-by-Side Report Comparison */}
      {currentRep && previousRep && (
        <section className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="font-display text-lg font-bold text-slate-900">
              {language === 'hi'
                ? 'दो रिपोर्ट की तुलना (14 अगस्त बनाम 18 नवंबर 2026)'
                : 'Report Comparison: 14 Aug 2026 vs 18 Nov 2026'}
            </h3>
            <button
              type="button"
              onClick={() => setPatientPage('reports')}
              className="text-xs font-semibold text-teal-800 hover:underline inline-flex items-center gap-1 self-start"
            >
              Open Full Reports <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs text-slate-500">
                  <th className="py-2.5 pr-4 font-semibold">Test Parameter</th>
                  <th className="py-2.5 pr-4 font-semibold">Previous ({previousRep.date})</th>
                  <th className="py-2.5 pr-4 font-semibold">Current ({currentRep.date})</th>
                  <th className="py-2.5 font-semibold">Reference Range</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {previousRep.values.map((prevVal) => {
                  const currMatch = currentRep.values.find(
                    (c) => c.parameter === prevVal.parameter
                  );
                  return (
                    <tr key={prevVal.parameter}>
                      <td className="py-3 pr-4 font-semibold text-slate-900">
                        {prevVal.parameter}
                      </td>
                      <td className="py-3 pr-4 font-mono text-slate-600 tabular-nums">
                        {prevVal.value} {prevVal.unit}
                      </td>
                      <td className="py-3 pr-4 font-mono font-bold text-teal-800 tabular-nums">
                        {currMatch ? `${currMatch.value} ${currMatch.unit}` : '—'}
                      </td>
                      <td className="py-3 font-mono text-xs text-slate-500 tabular-nums">
                        {prevVal.referenceRange}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Chronological Medical Timeline */}
      <section className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="font-display text-lg font-bold text-slate-900">
            {language === 'hi' ? 'मेडिकल घटनाओं का क्रम' : 'Chronological Health Events'}
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {['All', 'Hospital Visit', 'Medical Report', 'Prescription', 'Laboratory Test', 'Discharge'].map(
              (f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setEventFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium min-h-[34px] ${
                    eventFilter === f
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {f}
                </button>
              )
            )}
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredEvents.map((ev) => (
            <div
              key={ev.id}
              className="py-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3"
            >
              <div className="space-y-1">
                <p className="text-xs text-slate-500">
                  <span className="font-mono font-medium text-slate-700">{ev.date}</span> · {ev.type}{' '}
                  · {ev.facility}
                </p>
                <h4 className="font-display text-base font-bold text-slate-900">
                  {language === 'hi' ? ev.titleHi : ev.titleEn}
                </h4>
                <p className="text-sm text-slate-600">
                  {language === 'hi' ? ev.summaryHi : ev.summaryEn}
                </p>
                <p className="text-xs text-slate-500">Clinician: {ev.clinician}</p>
              </div>
              {ev.linkedReportId && (
                <button
                  type="button"
                  onClick={() => setPatientPage('reports')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-teal-800 hover:bg-teal-50 self-start whitespace-nowrap min-h-[38px]"
                >
                  <FileText className="w-3.5 h-3.5" />
                  {language === 'hi' ? 'रिपोर्ट खोलें' : 'View Report'}
                </button>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
