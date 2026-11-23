import React, { useEffect, useRef, useState } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  X,
  ArrowRight,
  Send,
  AlertCircle,
  Globe,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SUPPORTED_LANGUAGES } from '../i18n/translations';
import { PatientPage } from '../types/healthcare';

interface VoiceResult {
  transcript: string;
  reply: string;
  navigateTo: PatientPage | 'none';
  actionLabel: string;
  source: 'ai' | 'local-demo';
}

const SAMPLE_COMMANDS = [
  {
    hi: 'मेरी अपॉइंटमेंट कब है?',
    en: 'When is my appointment?',
    hinglish: 'Meri appointment kab hai?',
  },
  {
    hi: 'आयुष्मान भारत योजना की जांच करें।',
    en: 'Check Ayushman Bharat scheme benefits.',
    hinglish: 'Ayushman Bharat scheme check karo.',
  },
  {
    hi: 'मेरी रिपोर्ट समझाओ।',
    en: 'Explain my latest medical report.',
    hinglish: 'Meri report samjhao.',
  },
  {
    hi: 'मेरी दवा का टाइम क्या है?',
    en: 'What is my next medicine time?',
    hinglish: 'Meri dawa ka time kya hai?',
  },
  {
    hi: 'मुझे अस्पताल का रास्ता बताओ।',
    en: 'Show me directions inside the hospital.',
    hinglish: 'Mujhe hospital ka rasta batao.',
  },
];

export function VoiceAssistant() {
  const {
    voiceModalOpen,
    setVoiceModalOpen,
    language,
    setLanguageModalOpen,
    appointments,
    journeySteps,
    medicines,
    reports,
    patient,
    setPatientPage,
    setPortalMode,
  } = useApp();

  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [result, setResult] = useState<VoiceResult | null>(null);
  const recognitionRef = useRef<any>(null);

  const activeLangMeta =
    SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setSpeaking(false);
  };

  useEffect(() => {
    const SpeechRec =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setSpeechSupported(Boolean(SpeechRec));
  }, []);

  useEffect(() => {
    if (!voiceModalOpen) {
      stopSpeaking();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
      setListening(false);
    }
  }, [voiceModalOpen]);

  if (!voiceModalOpen) return null;

  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = activeLangMeta.speechLocale;
    utter.rate = 0.94;
    utter.onstart = () => setSpeaking(true);
    utter.onend = () => setSpeaking(false);
    utter.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utter);
  };

  const computeLocalFallback = (q: string): VoiceResult => {
    const lower = q.toLowerCase();
    const nextApt = appointments.find(
      (a) => a.status !== 'Cancelled' && a.status !== 'Completed'
    );
    const activeStep =
      journeySteps.find((s) => s.status === 'Delayed' || s.status === 'In Progress') ||
      journeySteps[0];
    const nextMed = medicines.find((m) => m.todayStatus === 'Pending') || medicines[0];
    const latestRep = reports[0];

    if (lower.includes('emergency') || lower.includes('इमरजेंसी') || lower.includes('ambulance')) {
      return {
        transcript: q,
        reply:
          language === 'hi'
            ? 'यदि गंभीर आपात स्थिति है, तो तुरंत 108 या 112 पर कॉल करें। मैं इमरजेंसी मदद स्क्रीन खोल रहा हूँ।'
            : 'If this is a life-threatening emergency, call 108 or 112 immediately. You can also open Emergency Help below.',
        navigateTo: 'emergency',
        actionLabel: language === 'hi' ? 'इमरजेंसी मदद खोलें' : 'Open Emergency Help',
        source: 'local-demo',
      };
    }

    if (
      lower.includes('ayushman') ||
      lower.includes('scheme') ||
      lower.includes('योजना') ||
      lower.includes('esic') ||
      lower.includes('cghs')
    ) {
      return {
        transcript: q,
        reply:
          language === 'hi'
            ? 'आयुष्मान भारत PM-JAY के तहत पात्र परिवारों को ₹5 लाख तक का निःशुल्क इलाज मिलता है। 70+ वरिष्ठ नागरिकों के लिए वय वंदना कार्ड उपलब्ध है।'
            : 'Ayushman Bharat PM-JAY offers up to ₹5 Lakh cashless hospital coverage per year, plus Vaya Vandana coverage for citizens aged 70+. Open Schemes & Benefits to check eligibility.',
        navigateTo: 'schemes',
        actionLabel: language === 'hi' ? 'सरकारी योजनाएं देखें' : 'Open Schemes & Benefits',
        source: 'local-demo',
      };
    }

    if (lower.includes('risk') || lower.includes('bp') || lower.includes('vitals') || lower.includes('sugar')) {
      return {
        transcript: q,
        reply:
          language === 'hi'
            ? 'आपका ताज़ा स्वास्थ्य स्कोर 92% (कम जोखिम) है। हृदय गति 72 bpm और SpO₂ 98% है।'
            : 'Your current Health Score is 92% (Low Risk), with Heart Rate 72 bpm and SpO₂ 98%. Open Risk Assessment for details.',
        navigateTo: 'risk-assessment',
        actionLabel: language === 'hi' ? 'जोखिम जांच खोलें' : 'Open Risk Assessment',
        source: 'local-demo',
      };
    }

    if (lower.includes('tip') || lower.includes('diet') || lower.includes('सुझाव') || lower.includes('food')) {
      return {
        transcript: q,
        reply:
          language === 'hi'
            ? 'आज का सुझाव: खाने के बाद 20 मिनट टहलें और दिनभर पर्याप्त पानी पिएं।'
            : 'Today’s tip: Walk 20 minutes after meals and include fresh seasonal fruits in your diet.',
        navigateTo: 'health-tips',
        actionLabel: language === 'hi' ? 'स्वास्थ्य सुझाव खोलें' : 'Open Health Tips',
        source: 'local-demo',
      };
    }

    if (lower.includes('fever') || lower.includes('headache') || lower.includes('बुखार') || lower.includes('symptom')) {
      return {
        transcript: q,
        reply:
          language === 'hi'
            ? 'लक्षणों के बारे में WHO और ICMR संदर्भित मार्गदर्शन के लिए AI हेल्थ सहायक खोलें।'
            : 'Open our AI Medical Assistant for WHO and ICMR referenced home-care guidance and red-flag checks.',
        navigateTo: 'ai-assistant',
        actionLabel: language === 'hi' ? 'AI हेल्थ सहायक खोलें' : 'Open AI Assistant',
        source: 'local-demo',
      };
    }

    if (lower.includes('appointment') || lower.includes('अपॉइंटमेंट') || lower.includes('kab')) {
      return {
        transcript: q,
        reply: nextApt
          ? language === 'hi'
            ? `आपकी अगली अपॉइंटमेंट ${nextApt.date} को ${nextApt.time} बजे ${nextApt.doctorName} के साथ है। आपका टोकन नंबर ${nextApt.tokenNumber} है।`
            : `Your next appointment is on ${nextApt.date} at ${nextApt.time} with ${nextApt.doctorName} at ${nextApt.hospitalName}. Your token number is ${nextApt.tokenNumber}.`
          : language === 'hi'
          ? 'अभी कोई अपॉइंटमेंट बुक नहीं है। आप नई अपॉइंटमेंट बुक कर सकते हैं।'
          : 'You have no upcoming appointments right now. You can book a new appointment.',
        navigateTo: 'appointments',
        actionLabel: language === 'hi' ? 'अपॉइंटमेंट देखें' : 'View Appointments',
        source: 'local-demo',
      };
    }

    if (
      lower.includes('rasta') ||
      lower.includes('direction') ||
      lower.includes('रास्ता') ||
      lower.includes('map') ||
      lower.includes('where') ||
      lower.includes('कहाँ')
    ) {
      return {
        transcript: q,
        reply:
          language === 'hi'
            ? `अभी आपका अगला चरण "${activeStep.titleHi}" है जो ${activeStep.locationHi} पर है। अस्पताल के अंदर का आसान नक्शा खोलें।`
            : `Your current step is "${activeStep.titleEn}" at ${activeStep.locationEn}. Open the Hospital Map for step-by-step directions.`,
        navigateTo: 'navigation',
        actionLabel: language === 'hi' ? 'अस्पताल का नक्शा खोलें' : 'Open Hospital Map',
        source: 'local-demo',
      };
    }

    if (lower.includes('report') || lower.includes('रिपोर्ट') || lower.includes('samjhao')) {
      return {
        transcript: q,
        reply:
          language === 'hi'
            ? `आपकी ताज़ा रिपोर्ट (${latestRep.date}) में हीमोग्लोबिन 12.4 और HbA1c 6.9% है, जो पहले से बेहतर है। पूरा विवरण देखने के लिए रिपोर्ट्स खोलें।`
            : `In your latest report from ${latestRep.date}, Hemoglobin is 12.4 g/dL and HbA1c improved to 6.9%. Open Health Records for the full explanation.`,
        navigateTo: 'reports',
        actionLabel: language === 'hi' ? 'मेरी रिपोर्ट्स खोलें' : 'Open Health Records',
        source: 'local-demo',
      };
    }

    if (lower.includes('dawa') || lower.includes('दवा') || lower.includes('medicine') || lower.includes('tablet')) {
      return {
        transcript: q,
        reply: nextMed
          ? language === 'hi'
            ? `आपकी अगली दवा ${nextMed.name} (${nextMed.dosage}) ${nextMed.time} पर लेनी है। ${nextMed.instructionsHi}`
            : `Your next scheduled medicine is ${nextMed.name} (${nextMed.dosage}) at ${nextMed.time}. ${nextMed.instructionsEn}`
          : language === 'hi'
          ? 'आज की सभी दवाइयां ली जा चुकी हैं।'
          : 'All scheduled medicines for today are updated.',
        navigateTo: 'medicines',
        actionLabel: language === 'hi' ? 'मेरी दवाइयां देखें' : 'Open My Medicines',
        source: 'local-demo',
      };
    }

    if (lower.includes('doctor') || lower.includes('डॉक्टर') || lower.includes('baat') || lower.includes('talk')) {
      return {
        transcript: q,
        reply:
          language === 'hi'
            ? 'आप डॉ. मीरा शर्मा या डॉ. राजेश नैयर के साथ ऑनलाइन वीडियो परामर्श बुक कर सकते हैं।'
            : 'You can start or book an online consultation with Dr. Meera Sharma or Dr. Rajesh Nair.',
        navigateTo: 'consult',
        actionLabel: language === 'hi' ? 'डॉक्टर से परामर्श करें' : 'Open Consult Doctor',
        source: 'local-demo',
      };
    }

    return {
      transcript: q,
      reply:
        language === 'hi'
          ? `नमस्ते ${patient.nameHi.split(' ')[0]} जी! अभी आपका स्वास्थ्य सफर "${activeStep.titleHi}" चरण पर है। आप अपॉइंटमेंट, रिपोर्ट, आयुष्मान योजना या दवाइयों के बारे में पूछ सकते हैं।`
          : `Namaste ${patient.name.split(' ')[0]} ji! Your hospital visit is currently at "${activeStep.titleEn}". You can ask about appointments, directions, schemes, reports, or medicines.`,
      navigateTo: 'journey',
      actionLabel: language === 'hi' ? 'मेरा सफर देखें' : 'View My Health Journey',
      source: 'local-demo',
    };
  };

  const handleQuery = async (queryText: string) => {
    const trimmed = queryText.trim();
    if (!trimmed) return;
    setLoading(true);
    setInputQuery(trimmed);

    const nextApt = appointments[0];
    const activeStep =
      journeySteps.find((s) => s.status === 'Delayed' || s.status === 'In Progress') ||
      journeySteps[0];
    const pendingMeds = medicines
      .filter((m) => m.todayStatus === 'Pending')
      .map((m) => `${m.name} at ${m.time}`);

    try {
      const resp = await fetch('/api/ai/voice-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: trimmed,
          language,
          patientContext: {
            name: patient.name,
            nextAppointment: nextApt
              ? `${nextApt.date} at ${nextApt.time} with ${nextApt.doctorName}, Token ${nextApt.tokenNumber}, Status: ${nextApt.status}`
              : 'None',
            currentJourneyStep: `${activeStep.titleEn} (${activeStep.status}) at ${activeStep.locationEn}`,
            pendingMedicinesToday: pendingMeds,
            latestReportSummary: reports[0]?.summaryEn,
          },
        }),
      });

      if (resp.ok) {
        const data = await resp.json();
        const validPages: Array<PatientPage | 'none'> = [
          'dashboard',
          'appointments',
          'journey',
          'navigation',
          'reports',
          'medicines',
          'consult',
          'emergency',
          'family',
          'timeline',
          'ai-assistant',
          'risk-assessment',
          'schemes',
          'health-tips',
          'none',
        ];
        const nav: PatientPage | 'none' = validPages.includes(data.navigateTo)
          ? data.navigateTo
          : 'none';
        const voiceRes: VoiceResult = {
          transcript: trimmed,
          reply: data.reply,
          navigateTo: nav,
          actionLabel:
            data.actionLabel || (language === 'hi' ? 'स्क्रीन खोलें' : 'Go to Page'),
          source: 'ai',
        };
        setResult(voiceRes);
        speakText(voiceRes.reply);
        setLoading(false);
        return;
      }
    } catch {
      // fall back cleanly to local deterministic assistant
    }

    const fallback = computeLocalFallback(trimmed);
    setResult(fallback);
    speakText(fallback.reply);
    setLoading(false);
  };

  const toggleMic = () => {
    if (listening) {
      try {
        recognitionRef.current?.stop();
      } catch {
        // ignore
      }
      setListening(false);
      return;
    }

    const SpeechRec =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRec) {
      setListening(true);
      setTimeout(() => {
        setListening(false);
        const demoPhrase =
          language === 'hi' ? 'मेरी अपॉइंटमेंट कब है?' : 'Meri appointment kab hai?';
        handleQuery(demoPhrase);
      }, 1200);
      return;
    }

    const recognition = new SpeechRec();
    recognition.lang = activeLangMeta.speechLocale;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    recognition.onstart = () => setListening(true);
    recognition.onresult = (event: any) => {
      const spoken = event.results?.[0]?.[0]?.transcript || '';
      setListening(false);
      if (spoken) handleQuery(spoken);
    };
    recognition.onerror = () => {
      setListening(false);
    };
    recognition.onend = () => {
      setListening(false);
    };
    recognition.start();
  };

  const handleNavigate = (dest: PatientPage) => {
    setPortalMode('patient');
    setPatientPage(dest);
    setVoiceModalOpen(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-xs p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={language === 'hi' ? 'वॉइस सहायक' : 'Voice Assistant'}
    >
      <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl border border-slate-200 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900">
              {language === 'hi' ? 'आवाज़ से मदद (Voice Helper)' : 'Aarogya Voice Helper'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {speechSupported
                ? `${activeLangMeta.nativeName} (${activeLangMeta.speechLocale}) · Speak or tap a command`
                : `${activeLangMeta.nativeName} · Tap or type a command below`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setLanguageModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-800"
            >
              <Globe className="w-3.5 h-3.5 text-teal-700" />
              <span>{activeLangMeta.nativeName}</span>
            </button>
            <button
              type="button"
              onClick={() => setVoiceModalOpen(false)}
              className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 min-w-[40px] min-h-[40px] flex items-center justify-center"
              aria-label="Close voice assistant"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Mic Trigger */}
          <div className="flex flex-col items-center text-center py-2">
            <button
              type="button"
              onClick={toggleMic}
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-md ${
                listening
                  ? 'bg-red-600 text-white ring-8 ring-red-100'
                  : 'bg-teal-700 hover:bg-teal-800 text-white'
              }`}
              aria-label={listening ? 'Stop listening' : 'Start speaking'}
            >
              {listening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
            </button>
            <p className="mt-3 text-sm font-medium text-slate-800">
              {listening
                ? language === 'hi'
                  ? 'सुन रहे हैं... कृपया बोलिए'
                  : 'Listening... Please speak clearly'
                : loading
                ? language === 'hi'
                  ? 'जानकारी खोजी जा रही है...'
                  : 'Understanding your request...'
                : language === 'hi'
                ? 'बोलने के लिए माइक बटन दबाएं'
                : `Tap the microphone and speak in ${activeLangMeta.englishName}`}
            </p>
          </div>

          {/* Manual Type Fallback */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleQuery(inputQuery);
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder={
                language === 'hi'
                  ? 'यहाँ लिखें, जैसे: मेरी अपॉइंटमेंट कब है?'
                  : 'Or type here, e.g., Check Ayushman Bharat scheme'
              }
              className="flex-1 px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-teal-600 focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading || !inputQuery.trim()}
              className="px-4 py-2.5 bg-teal-700 text-white rounded-xl text-sm font-medium hover:bg-teal-800 disabled:opacity-50 min-h-[44px] inline-flex items-center gap-1.5 whitespace-nowrap"
            >
              <Send className="w-4 h-4" />
              {language === 'hi' ? 'पूछें' : 'Ask'}
            </button>
          </form>

          {/* Response Card */}
          {result && (
            <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-200 space-y-3">
              <div className="text-xs text-slate-500">
                {language === 'hi' ? 'आपने पूछा:' : 'You asked:'}{' '}
                <span className="font-medium text-slate-800">“{result.transcript}”</span>
              </div>
              <p className="text-base text-slate-900 leading-relaxed font-medium">
                {result.reply}
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => (speaking ? stopSpeaking() : speakText(result.reply))}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-800 hover:bg-slate-50 min-h-[40px]"
                >
                  {speaking ? (
                    <>
                      <VolumeX className="w-4 h-4 text-teal-700" />
                      {language === 'hi' ? 'आवाज़ रोकें' : 'Stop Audio'}
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-4 h-4 text-teal-700" />
                      {language === 'hi' ? 'सुनें (Play Audio)' : 'Play Response'}
                    </>
                  )}
                </button>
                {result.navigateTo !== 'none' && (
                  <button
                    type="button"
                    onClick={() => handleNavigate(result.navigateTo as PatientPage)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-700 text-white text-xs font-medium hover:bg-teal-800 min-h-[40px]"
                  >
                    {result.actionLabel}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Quick Tap Sample Voice Commands */}
          <div>
            <p className="text-xs font-medium text-slate-500 mb-2.5">
              {language === 'hi'
                ? 'आसान उदाहरण (टैप करके आज़माएं):'
                : 'Try a sample command:'}
            </p>
            <div className="grid grid-cols-1 gap-2">
              {SAMPLE_COMMANDS.map((cmd, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleQuery(language === 'hi' ? cmd.hi : cmd.hinglish)}
                  className="text-left px-3.5 py-2.5 rounded-xl border border-slate-200 hover:border-teal-400 hover:bg-teal-50/40 transition-colors flex items-center justify-between gap-2 min-h-[44px]"
                >
                  <div>
                    <div className="text-sm font-medium text-slate-900">
                      {language === 'hi' ? cmd.hi : cmd.hinglish}
                    </div>
                    <div className="text-xs text-slate-500">
                      {language === 'hi' ? cmd.en : cmd.hi}
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-start gap-2 text-xs text-slate-500 pt-1 border-t border-slate-100">
            <AlertCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <p>
              {language === 'hi'
                ? 'वॉइस सहायक केवल आपकी जानकारी और नेविगेशन में मदद के लिए है। मेडिकल सलाह के लिए डॉक्टर से बात करें।'
                : 'Voice assistant helps with navigation and reading your records. It does not provide medical diagnosis.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
