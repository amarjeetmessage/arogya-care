import React, { useState } from 'react';
import {
  Bot,
  Send,
  ThumbsUp,
  ThumbsDown,
  BookOpen,
  AlertCircle,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useT } from '../i18n/translations';

interface AssistantTurn {
  id: string;
  role: 'user' | 'assistant' | 'error';
  text?: string;
  intro?: string;
  bullets?: string[];
  sources?: string[];
  whenToSeeDoctor?: string;
  urgentWarning?: boolean;
  latencyMs?: number;
  cached?: boolean;
  feedback?: 'up' | 'down' | null;
}

const SAMPLE_PROMPTS = [
  'What to do for mild fever and headache?',
  'Simple Indian diet tips to keep HbA1c under control',
  'When should an elderly person check blood pressure at home?',
  'मुझे हल्का बुखार और थकान है, क्या ध्यान रखूँ?',
];

export function AiHealthAssistant() {
  const { language, patient, reports, setPatientPage } = useApp();
  const t = useT(language);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [turns, setTurns] = useState<AssistantTurn[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      intro:
        language === 'hi'
          ? `नमस्ते ${patient.nameHi.split(' ')[0]} जी! मैं आपका आरोग्य केयर AI स्वास्थ्य सहायक हूँ।`
          : `Namaste ${patient.name.split(' ')[0]} ji! I can explain symptoms, preventive care, Indian diet guidance, and help prepare questions for your doctor.`,
      bullets: [
        'Ask general health, nutrition, or recovery questions in 6 Indian languages.',
        'Every answer includes trusted public reference sources (WHO, ICMR, Mayo Clinic).',
        'Responses use your recorded allergies and health summary for better clarity—never as a diagnosis.',
      ],
      sources: ['WHO Guidelines', 'ICMR Dietary Guidelines', 'MoHFW India'],
      whenToSeeDoctor: 'For persistent symptoms, chest pain, or medication changes, always consult your doctor.',
      urgentWarning: false,
      feedback: null,
    },
  ]);

  const askAssistant = async (q: string) => {
    const trimmed = q.trim();
    if (!trimmed || loading) return;

    const userMsg: AssistantTurn = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: trimmed,
    };
    setTurns((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const start = performance.now();
    try {
      const resp = await fetch('/api/ai/health-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: trimmed,
          language,
          patientContext: {
            age: patient.age,
            conditions: patient.chronicConditions,
            allergies: patient.allergies,
            latestReportSummary: reports[0]?.summaryEn,
          },
        }),
      });
      const elapsed = Math.round(performance.now() - start);
      const data = await resp.json();

      if (!resp.ok) {
        setTurns((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: 'error',
            text:
              data.error ||
              'Unable to reach AI Health Assistant right now. Check your Gemini API key in Settings > Secrets.',
          },
        ]);
        return;
      }

      setTurns((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          intro: data.intro,
          bullets: data.bullets || [],
          sources: data.sources || ['WHO Guidelines'],
          whenToSeeDoctor: data.whenToSeeDoctor,
          urgentWarning: Boolean(data.urgentWarning),
          latencyMs: elapsed,
          cached: Boolean(data.cached),
          feedback: null,
        },
      ]);
    } catch {
      setTurns((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'error',
          text: 'Network error while connecting to the AI Health Assistant. Please try again.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const setTurnFeedback = (id: string, vote: 'up' | 'down') => {
    setTurns((prev) => prev.map((turn) => (turn.id === id ? { ...turn, feedback: vote } : turn)));
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-teal-700 text-white flex items-center justify-center shrink-0">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-slate-900">
              {language === 'hi' ? 'AI हेल्थ सहायक (RAG)' : 'AI Medical Assistant'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Fast, reference-backed wellness & patient guidance · Grounded in trusted public guidelines
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setPatientPage('reports')}
          className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-800 self-start sm:self-auto min-h-[40px]"
        >
          Analyze a Lab Report Instead
        </button>
      </div>

      {/* Safety Disclaimer */}
      <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 flex items-start gap-2.5 text-xs text-blue-950">
        <AlertCircle className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
        <p>{t.common.aiDisclaimer}</p>
      </div>

      {/* Main Conversational Panel */}
      <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Suggested Quick Prompts */}
        <div className="p-4 border-b border-slate-100 bg-[#FAFBF9] flex flex-wrap gap-2">
          {SAMPLE_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              disabled={loading}
              onClick={() => askAssistant(prompt)}
              className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-teal-400 hover:bg-teal-50/40 text-xs sm:text-sm text-slate-800 text-left transition-colors min-h-[38px]"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Chat Messages */}
        <div className="p-5 sm:p-6 space-y-5 min-h-[340px] max-h-[520px] overflow-y-auto">
          {turns.map((turn) => {
            if (turn.role === 'user') {
              return (
                <div key={turn.id} className="flex justify-end">
                  <div className="max-w-lg px-4 py-3 rounded-2xl rounded-tr-sm bg-teal-700 text-white text-sm sm:text-base leading-relaxed">
                    {turn.text}
                  </div>
                </div>
              );
            }

            if (turn.role === 'error') {
              return (
                <div
                  key={turn.id}
                  className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-900"
                >
                  {turn.text}
                </div>
              );
            }

            return (
              <div key={turn.id} className="max-w-2xl space-y-3">
                <div className="p-5 rounded-2xl rounded-tl-sm bg-[#F8FAFC] border border-slate-200 space-y-3.5">
                  {turn.urgentWarning && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-center justify-between gap-3 text-xs text-red-900">
                      <span className="flex items-center gap-2 font-semibold">
                        <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                        Red-flag symptom detected — Call 108 / 112 immediately if severe.
                      </span>
                      <button
                        type="button"
                        onClick={() => setPatientPage('emergency')}
                        className="px-3 py-1.5 rounded-lg bg-red-600 text-white font-semibold whitespace-nowrap"
                      >
                        Emergency SOS
                      </button>
                    </div>
                  )}

                  {turn.intro && (
                    <p className="text-sm sm:text-base font-medium text-slate-900 leading-relaxed">
                      {turn.intro}
                    </p>
                  )}

                  {turn.bullets && turn.bullets.length > 0 && (
                    <ul className="space-y-2 text-sm text-slate-700">
                      {turn.bullets.map((b, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{b}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {turn.whenToSeeDoctor && (
                    <p className="text-xs sm:text-sm text-slate-600 pt-1">
                      <strong>Doctor guidance:</strong> {turn.whenToSeeDoctor}
                    </p>
                  )}

                  {/* Grounded Sources & Feedback Row */}
                  <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <BookOpen className="w-3.5 h-3.5 text-teal-700" />
                      <span className="font-semibold text-slate-700">Sources:</span>
                      {(turn.sources || []).map((src, idx) => (
                        <React.Fragment key={src}>
                          <span>{src}</span>
                          {idx < (turn.sources?.length || 0) - 1 && <span aria-hidden="true">·</span>}
                        </React.Fragment>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      {turn.latencyMs !== undefined && (
                        <span className="font-mono text-[11px] text-slate-400">
                          {turn.cached ? 'Cached' : 'Fast'} · {turn.latencyMs}ms
                        </span>
                      )}
                      <span className="text-slate-400">Helpful?</span>
                      <button
                        type="button"
                        onClick={() => setTurnFeedback(turn.id, 'up')}
                        className={`p-1.5 rounded-lg transition-colors ${
                          turn.feedback === 'up'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'hover:bg-slate-200 text-slate-500'
                        }`}
                        aria-label="Helpful"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setTurnFeedback(turn.id, 'down')}
                        className={`p-1.5 rounded-lg transition-colors ${
                          turn.feedback === 'down'
                            ? 'bg-red-100 text-red-700'
                            : 'hover:bg-slate-200 text-slate-500'
                        }`}
                        aria-label="Not helpful"
                      >
                        <ThumbsDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="inline-flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-600">
              <Loader2 className="w-4 h-4 animate-spin text-teal-700" />
              Preparing grounded health guidance...
            </div>
          )}
        </div>

        {/* Input Composer */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            askAssistant(input);
          }}
          className="p-4 border-t border-slate-200 bg-white flex gap-2.5"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              language === 'hi'
                ? 'स्वास्थ्य, खानपान या लक्षण के बारे में पूछें...'
                : 'Ask anything about symptoms, diet, recovery, or doctor preparation...'
            }
            className="flex-1 px-4 py-3 rounded-xl border border-slate-300 text-sm focus:border-teal-600 focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold disabled:opacity-50 min-h-[46px] whitespace-nowrap"
          >
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">Ask AI</span>
            <Send className="w-4 h-4 sm:hidden" />
          </button>
        </form>
      </section>
    </div>
  );
}
