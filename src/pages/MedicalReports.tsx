import React, { useRef, useState } from 'react';
import {
  Upload,
  Camera,
  FileText,
  Send,
  AlertCircle,
  BookOpen,
  Sparkles,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useT } from '../i18n/translations';
import { MedicalReport, ReportCategory } from '../types/healthcare';

const CATEGORIES: Array<'All' | ReportCategory> = [
  'All',
  'Blood Tests',
  'Prescriptions',
  'Radiology',
  'Discharge Summaries',
  'Consultations',
  'Other',
];

interface ChatTurn {
  id: string;
  role: 'user' | 'assistant' | 'error';
  text: string;
  citations?: { lineId: string; quote: string }[];
  doctorQuestions?: string[];
  isUnsupported?: boolean;
}

export function MedicalReports() {
  const { language, reports, addReport, pushToast } = useApp();
  const t = useT(language);

  const [category, setCategory] = useState<'All' | ReportCategory>('All');
  const [selectedReportId, setSelectedReportId] = useState<string>(reports[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'explanation' | 'values' | 'original' | 'ask'>(
    'explanation'
  );
  const [highlightedLineId, setHighlightedLineId] = useState<string | null>(null);

  // Upload state
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Q&A state per report
  const [questionInput, setQuestionInput] = useState('');
  const [asking, setAsking] = useState(false);
  const [chatHistory, setChatHistory] = useState<Record<string, ChatTurn[]>>({});

  const filteredReports =
    category === 'All' ? reports : reports.filter((r) => r.category === category);

  const selectedReport =
    reports.find((r) => r.id === selectedReportId) || filteredReports[0] || reports[0];

  const previousComparableReport =
    selectedReport?.category === 'Blood Tests'
      ? reports.find((r) => r.id !== selectedReport.id && r.category === 'Blood Tests') || null
      : null;

  const quickQuestions = [
    language === 'hi' ? 'इस रिपोर्ट का आसान मतलब क्या है?' : 'What does this report mean?',
    language === 'hi' ? 'इसे सरल हिंदी में समझाएं।' : 'Explain this in simple Hindi.',
    language === 'hi' ? 'मेरा हीमोग्लोबिन स्तर क्या था?' : 'What was my hemoglobin level?',
    language === 'hi'
      ? 'इस रिपोर्ट की मेरी पिछली रिपोर्ट से तुलना करें।'
      : 'Compare this report with my previous report.',
    language === 'hi' ? 'मुझे अपने डॉक्टर से क्या पूछना चाहिए?' : 'What should I ask my doctor?',
  ];

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    try {
      const reader = new FileReader();
      const dataUrl: string = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error('Could not read file'));
        reader.readAsDataURL(file);
      });

      const base64Data = dataUrl.includes(',') ? dataUrl.split(',')[1] : undefined;
      const mimeType = file.type || 'image/jpeg';

      let createdReport: MedicalReport | null = null;

      try {
        const resp = await fetch('/api/ai/analyze-report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: file.name,
            mimeType,
            base64Data,
            language,
          }),
        });

        if (resp.ok) {
          const parsed = await resp.json();
          const validCats: ReportCategory[] = [
            'Blood Tests',
            'Prescriptions',
            'Radiology',
            'Discharge Summaries',
            'Consultations',
            'Other',
          ];
          const cat: ReportCategory = validCats.includes(parsed.category)
            ? parsed.category
            : 'Other';
          createdReport = {
            id: `rep-upload-${Date.now()}`,
            title: parsed.title || file.name.replace(/\.[^.]+$/, ''),
            category: cat,
            date: '22 Nov 2026',
            isoDate: '2026-11-22',
            hospital: parsed.hospital || 'Uploaded by Patient',
            doctor: parsed.doctor || 'Pending Clinician Review',
            summaryEn: parsed.summaryEn,
            summaryHi: parsed.summaryHi,
            simpleExplanationEn: parsed.simpleExplanationEn,
            simpleExplanationHi: parsed.simpleExplanationHi,
            rawLines:
              Array.isArray(parsed.rawLines) && parsed.rawLines.length > 0
                ? parsed.rawLines
                : [{ lineId: 'L1', text: `Uploaded document: ${file.name}` }],
            values: Array.isArray(parsed.values) ? parsed.values : [],
            previewImageUrl: mimeType.startsWith('image/') ? dataUrl : undefined,
            isUploaded: true,
          };
        } else {
          const errData = await resp.json().catch(() => ({}));
          pushToast(
            errData.error ||
              'Document saved locally. Configure Gemini API key in Secrets for automatic OCR extraction.',
            'warning'
          );
        }
      } catch {
        pushToast('Document uploaded locally to your records.', 'info');
      }

      if (!createdReport) {
        createdReport = {
          id: `rep-upload-${Date.now()}`,
          title: file.name.replace(/\.[^.]+$/, ''),
          category: 'Other',
          date: '22 Nov 2026',
          isoDate: '2026-11-22',
          hospital: 'Uploaded by Patient',
          doctor: 'Pending Doctor Review',
          summaryEn: `Uploaded document "${file.name}" saved in your medical records.`,
          summaryHi: `दस्तावेज़ "${file.name}" आपके मेडिकल रिकॉर्ड में सुरक्षित हो गया है।`,
          simpleExplanationEn:
            'Your document has been stored safely. Open "Ask About Your Report" or share it during your upcoming consultation.',
          simpleExplanationHi:
            'आपकी फाइल सुरक्षित हो गई है। आप इसे अगली विजिट में डॉक्टर को दिखा सकते हैं।',
          rawLines: [
            { lineId: 'L1', text: `Uploaded File: ${file.name} (${Math.round(file.size / 1024)} KB)` },
            { lineId: 'L2', text: 'Status: Saved to Aarogya Care Patient Health Records (Prototype)' },
          ],
          values: [],
          previewImageUrl: mimeType.startsWith('image/') ? dataUrl : undefined,
          isUploaded: true,
        };
      }

      addReport(createdReport);
      setSelectedReportId(createdReport.id);
      setActiveTab('explanation');
      pushToast(
        language === 'hi'
          ? 'रिपोर्ट सफलतापूर्वक अपलोड हो गई!'
          : 'Medical report uploaded and added to your records!'
      );
    } finally {
      setUploading(false);
    }
  };

  const handleAskQuestion = async (qText: string) => {
    const trimmed = qText.trim();
    if (!trimmed || !selectedReport) return;

    const reportId = selectedReport.id;
    const userTurn: ChatTurn = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: trimmed,
    };

    setChatHistory((prev) => ({
      ...prev,
      [reportId]: [...(prev[reportId] || []), userTurn],
    }));
    setQuestionInput('');
    setAsking(true);

    try {
      const targetLang =
        trimmed.toLowerCase().includes('hindi') || /[\u0900-\u097F]/.test(trimmed)
          ? 'hi'
          : language;

      const resp = await fetch('/api/ai/report-qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: trimmed,
          language: targetLang,
          report: {
            title: selectedReport.title,
            date: selectedReport.date,
            hospital: selectedReport.hospital,
            rawLines: selectedReport.rawLines,
            values: selectedReport.values,
          },
          previousReport: previousComparableReport
            ? {
                title: previousComparableReport.title,
                date: previousComparableReport.date,
                values: previousComparableReport.values,
              }
            : null,
        }),
      });

      const data = await resp.json();
      if (!resp.ok) {
        setChatHistory((prev) => ({
          ...prev,
          [reportId]: [
            ...(prev[reportId] || []),
            {
              id: `err-${Date.now()}`,
              role: 'error',
              text:
                data.error ||
                'AI Assistant could not respond right now. Please check Settings > Secrets for your Gemini API key.',
            },
          ],
        }));
        return;
      }

      const aiTurn: ChatTurn = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        text: data.answer,
        citations: data.citations || [],
        doctorQuestions: data.doctorQuestions || [],
        isUnsupported: Boolean(data.isUnsupported),
      };

      setChatHistory((prev) => ({
        ...prev,
        [reportId]: [...(prev[reportId] || []), aiTurn],
      }));
    } catch {
      setChatHistory((prev) => ({
        ...prev,
        [reportId]: [
          ...(prev[reportId] || []),
          {
            id: `err-${Date.now()}`,
            role: 'error',
            text: 'Network error while reaching the AI Medical Report service. Please try again.',
          },
        ],
      }));
    } finally {
      setAsking(false);
    }
  };

  const jumpToCitation = (lineId: string) => {
    setHighlightedLineId(lineId);
    setActiveTab('original');
  };

  const currentChat = selectedReport ? chatHistory[selectedReport.id] || [] : [];

  return (
    <div className="space-y-6">
      {/* Mandatory Medical AI Disclaimer */}
      <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 flex items-start gap-3 text-xs sm:text-sm text-blue-950">
        <AlertCircle className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
        <p>{t.common.aiDisclaimer}</p>
      </div>

      {/* Upload Area (Drag & Drop + Camera Capture on Mobile) */}
      <section
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const f = e.dataTransfer.files?.[0];
          if (f) handleFileUpload(f);
        }}
        className={`rounded-2xl border-2 border-dashed p-5 sm:p-6 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
          dragOver ? 'border-teal-600 bg-teal-50/60' : 'border-slate-300 bg-white'
        }`}
      >
        <div className="space-y-1">
          <h2 className="font-display text-lg font-bold text-slate-900">
            {language === 'hi'
              ? 'नई रिपोर्ट या दवाई का पर्चा अपलोड करें'
              : 'Upload Medical Report or Prescription'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            {language === 'hi'
              ? 'PDF फाइल चुनें, यहाँ ड्रैग करें, या मोबाइल कैमरे से फोटो खींचें।'
              : 'Drag and drop a PDF/image report here, or capture a photo of your prescription.'}
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5 shrink-0">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFileUpload(f);
              e.target.value = '';
            }}
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFileUpload(f);
              e.target.value = '';
            }}
          />

          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold min-h-[44px] disabled:opacity-60"
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            {uploading
              ? language === 'hi'
                ? 'विश्लेषण हो रहा है...'
                : 'Analyzing...'
              : language === 'hi'
              ? 'फाइल चुनें (PDF/फोटो)'
              : 'Upload PDF / Image'}
          </button>

          <button
            type="button"
            disabled={uploading}
            onClick={() => cameraInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-sm font-medium min-h-[44px]"
          >
            <Camera className="w-4 h-4 text-teal-700" />
            {language === 'hi' ? 'कैमरे से फोटो लें' : 'Take Photo'}
          </button>
        </div>
      </section>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-colors min-h-[40px] ${
              category === cat
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Main Split: Report List + Detailed AI Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Report List */}
        <div className="lg:col-span-4 space-y-2.5">
          {filteredReports.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center text-sm text-slate-500">
              No reports in this category yet. Upload one above.
            </div>
          ) : (
            filteredReports.map((rep) => {
              const active = selectedReport?.id === rep.id;
              return (
                <button
                  key={rep.id}
                  type="button"
                  onClick={() => {
                    setSelectedReportId(rep.id);
                    setHighlightedLineId(null);
                  }}
                  className={`w-full text-left p-4 rounded-2xl border transition-colors space-y-1 ${
                    active
                      ? 'border-teal-600 bg-teal-50/50'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <p className="text-xs text-slate-500">
                    {rep.category} · {rep.date}
                  </p>
                  <h3 className="font-display text-sm sm:text-base font-bold text-slate-900 leading-snug">
                    {rep.title}
                  </h3>
                  <p className="text-xs text-slate-600 truncate">{rep.hospital}</p>
                </button>
              );
            })
          )}
        </div>

        {/* Right: Report Inspector & AI Assistant */}
        {selectedReport && (
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 overflow-hidden">
            {/* Report Header */}
            <div className="p-5 sm:p-6 border-b border-slate-200 space-y-3">
              <div className="text-xs text-slate-500">
                {selectedReport.category} · {selectedReport.date} · {selectedReport.hospital}
              </div>
              <h3 className="font-display text-xl font-bold text-slate-900">
                {selectedReport.title}
              </h3>
              <p className="text-xs text-slate-600">{selectedReport.doctor}</p>

              {/* View Mode Segmented Controls */}
              <div className="flex flex-wrap gap-1.5 pt-2">
                {[
                  {
                    id: 'explanation' as const,
                    labelEn: 'Simple Explanation',
                    labelHi: 'सरल व्याख्या',
                  },
                  {
                    id: 'values' as const,
                    labelEn: `Important Values (${selectedReport.values.length})`,
                    labelHi: `मुख्य जांच मान (${selectedReport.values.length})`,
                  },
                  {
                    id: 'original' as const,
                    labelEn: 'Original Report',
                    labelHi: 'मूल रिपोर्ट',
                  },
                  {
                    id: 'ask' as const,
                    labelEn: 'Ask About Your Report',
                    labelHi: 'रिपोर्ट के बारे में पूछें (AI)',
                  },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors min-h-[40px] ${
                      activeTab === tab.id
                        ? 'bg-teal-700 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {language === 'hi' ? tab.labelHi : tab.labelEn}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-5 sm:p-6">
              {/* TAB 1: SIMPLE EXPLANATION & SUMMARY */}
              {activeTab === 'explanation' && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h4 className="font-display text-base font-bold text-slate-900">
                      {language === 'hi' ? 'आसान भाषा में मतलब' : 'Simple Explanation'}
                    </h4>
                    <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
                      {language === 'hi'
                        ? selectedReport.simpleExplanationHi
                        : selectedReport.simpleExplanationEn}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#FAFBF9] border border-slate-200 space-y-2">
                    <h4 className="font-display text-sm font-bold text-slate-900">
                      {language === 'hi' ? 'रिपोर्ट सारांश' : 'Report Summary'}
                    </h4>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {language === 'hi' ? selectedReport.summaryHi : selectedReport.summaryEn}
                    </p>
                  </div>

                  {selectedReport.values.length > 0 && (
                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      <button
                        type="button"
                        onClick={() => setActiveTab('values')}
                        className="px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-800 hover:bg-slate-50 min-h-[42px]"
                      >
                        {language === 'hi' ? 'सभी टेस्ट वैल्यू देखें' : 'Inspect Extracted Values'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('ask')}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold min-h-[42px]"
                      >
                        <Sparkles className="w-4 h-4" />
                        {language === 'hi' ? 'AI से सवाल पूछें' : 'Ask AI About This Report'}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: EXTRACTED IMPORTANT VALUES */}
              {activeTab === 'values' && (
                <div className="space-y-4">
                  {selectedReport.values.length === 0 ? (
                    <p className="text-sm text-slate-600">
                      This document does not contain structured numeric lab values. Check the Original Report or Simple Explanation tabs.
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-sm">
                        <thead>
                          <tr className="border-b border-slate-200 text-xs text-slate-500">
                            <th className="py-2.5 pr-4 font-semibold">Parameter</th>
                            <th className="py-2.5 pr-4 font-semibold">Result</th>
                            <th className="py-2.5 pr-4 font-semibold">Reference Range</th>
                            <th className="py-2.5 pr-4 font-semibold">Status</th>
                            <th className="py-2.5 font-semibold text-right">Source</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {selectedReport.values.map((v) => (
                            <tr key={v.parameter} className="hover:bg-slate-50/70">
                              <td className="py-3 pr-4 font-semibold text-slate-900">
                                {v.parameter}
                              </td>
                              <td className="py-3 pr-4 font-mono font-semibold text-slate-900 tabular-nums">
                                {v.value} <span className="text-xs font-normal text-slate-500">{v.unit}</span>
                              </td>
                              <td className="py-3 pr-4 font-mono text-xs text-slate-600 tabular-nums">
                                {v.referenceRange}
                              </td>
                              <td className="py-3 pr-4">
                                <span
                                  className={`text-xs font-semibold ${
                                    v.status === 'Normal'
                                      ? 'text-emerald-700'
                                      : v.status === 'Attention'
                                      ? 'text-amber-700'
                                      : 'text-red-700'
                                  }`}
                                >
                                  {v.status}
                                </span>
                              </td>
                              <td className="py-3 text-right">
                                <button
                                  type="button"
                                  onClick={() => jumpToCitation(v.sourceLine)}
                                  className="font-mono text-xs text-teal-800 hover:underline font-semibold"
                                >
                                  [{v.sourceLine}]
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: ORIGINAL REPORT PREVIEW WITH SOURCE LINES */}
              {activeTab === 'original' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700">
                      <FileText className="w-4 h-4 text-teal-700" />
                      Original Document Transcript (Line Referenced)
                    </span>
                    {highlightedLineId && (
                      <span className="text-teal-800 font-semibold">
                        Highlighting Source [{highlightedLineId}]
                      </span>
                    )}
                  </div>

                  {selectedReport.previewImageUrl && (
                    <img
                      src={selectedReport.previewImageUrl}
                      alt={selectedReport.title}
                      referrerPolicy="no-referrer"
                      className="max-h-72 rounded-xl border border-slate-200 object-contain bg-slate-50"
                    />
                  )}

                  <div className="rounded-xl border border-slate-200 bg-[#FAFBF9] p-4 font-mono text-xs sm:text-sm space-y-1.5 overflow-x-auto">
                    {selectedReport.rawLines.map((line) => {
                      const isHit = highlightedLineId === line.lineId;
                      return (
                        <div
                          key={line.lineId}
                          className={`px-2.5 py-1.5 rounded-lg flex items-start gap-3 transition-colors ${
                            isHit
                              ? 'bg-teal-100 text-teal-950 font-semibold'
                              : 'text-slate-700'
                          }`}
                        >
                          <span className="text-slate-400 shrink-0 select-none">
                            [{line.lineId}]
                          </span>
                          <span className="leading-relaxed">{line.text}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 4: ASK ABOUT YOUR REPORT (GROUNDED AI ASSISTANT) */}
              {activeTab === 'ask' && (
                <div className="space-y-5">
                  <div>
                    <p className="text-xs font-semibold text-slate-600 mb-2">
                      {language === 'hi'
                        ? 'सुझाए गए प्रश्न (टैप करें):'
                        : 'Suggested questions about this report:'}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {quickQuestions.map((q) => (
                        <button
                          key={q}
                          type="button"
                          disabled={asking}
                          onClick={() => handleAskQuestion(q)}
                          className="px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:border-teal-400 hover:bg-teal-50/50 text-xs sm:text-sm text-slate-800 text-left transition-colors min-h-[40px]"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Conversation Feed */}
                  <div className="space-y-3 min-h-[160px] max-h-[420px] overflow-y-auto pr-1">
                    {currentChat.length === 0 ? (
                      <div className="p-5 rounded-xl bg-[#FAFBF9] border border-slate-200 text-sm text-slate-600 space-y-1">
                        <p className="font-semibold text-slate-800">
                          {language === 'hi'
                            ? 'अपनी रिपोर्ट के बारे में कोई भी सवाल पूछें'
                            : 'Ask anything written in this report'}
                        </p>
                        <p className="text-xs text-slate-500">
                          {language === 'hi'
                            ? 'उत्तर सीधे आपकी मूल रिपोर्ट की लाइनों के संदर्भ के साथ दिए जाएंगे।'
                            : 'Responses cite exact line numbers from your original document and never invent diagnoses.'}
                        </p>
                      </div>
                    ) : (
                      currentChat.map((turn) => (
                        <div
                          key={turn.id}
                          className={`p-4 rounded-xl text-sm space-y-3 ${
                            turn.role === 'user'
                              ? 'bg-slate-900 text-white ml-8'
                              : turn.role === 'error'
                              ? 'bg-red-50 border border-red-200 text-red-900'
                              : 'bg-teal-50/50 border border-teal-200 text-slate-900 mr-4'
                          }`}
                        >
                          <p className="leading-relaxed whitespace-pre-line">{turn.text}</p>

                          {/* Clickable Source References */}
                          {turn.citations && turn.citations.length > 0 && (
                            <div className="pt-2 border-t border-teal-200/70 space-y-1.5">
                              <p className="text-xs font-semibold text-teal-900 flex items-center gap-1.5">
                                <BookOpen className="w-3.5 h-3.5" />
                                Source References from Original Report:
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {turn.citations.map((cit, i) => (
                                  <button
                                    key={`${cit.lineId}-${i}`}
                                    type="button"
                                    onClick={() => jumpToCitation(cit.lineId)}
                                    className="text-left px-2.5 py-1.5 rounded-lg bg-white border border-teal-300 text-xs text-teal-900 hover:bg-teal-100"
                                  >
                                    <span className="font-mono font-bold mr-1">[{cit.lineId}]</span>
                                    <span className="line-clamp-1">{cit.quote}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Suggested Doctor Questions */}
                          {turn.doctorQuestions && turn.doctorQuestions.length > 0 && (
                            <div className="pt-2 border-t border-teal-200/70 space-y-1">
                              <p className="text-xs font-semibold text-slate-700">
                                {language === 'hi'
                                  ? 'डॉक्टर से पूछने योग्य प्रश्न:'
                                  : 'Helpful questions to ask your doctor:'}
                              </p>
                              <ul className="space-y-1 text-xs text-slate-700">
                                {turn.doctorQuestions.map((dq, i) => (
                                  <li key={i} className="flex items-start gap-1.5">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-700 shrink-0 mt-0.5" />
                                    <span>{dq}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))
                    )}

                    {asking && (
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2.5 text-sm text-slate-600">
                        <Loader2 className="w-4 h-4 animate-spin text-teal-700" />
                        {language === 'hi'
                          ? 'रिपोर्ट पढ़कर सरल उत्तर तैयार किया जा रहा है...'
                          : 'Reading report lines and preparing a grounded explanation...'}
                      </div>
                    )}
                  </div>

                  {/* Input Form */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleAskQuestion(questionInput);
                    }}
                    className="flex gap-2 pt-2 border-t border-slate-100"
                  >
                    <input
                      type="text"
                      value={questionInput}
                      onChange={(e) => setQuestionInput(e.target.value)}
                      placeholder={
                        language === 'hi'
                          ? 'रिपोर्ट के बारे में अपना सवाल लिखें...'
                          : 'Ask a question about this report...'
                      }
                      className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-teal-600 focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={asking || !questionInput.trim()}
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold disabled:opacity-50 min-h-[44px]"
                    >
                      <Send className="w-4 h-4" />
                      {language === 'hi' ? 'पूछें' : 'Ask'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
