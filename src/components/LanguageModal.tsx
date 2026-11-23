import React from 'react';
import { X, Mic, Check, Globe } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SUPPORTED_LANGUAGES } from '../i18n/translations';

export function LanguageModal() {
  const {
    language,
    setLanguage,
    languageModalOpen,
    setLanguageModalOpen,
    setVoiceModalOpen,
    pushToast,
  } = useApp();

  if (!languageModalOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Select Language"
      onClick={() => setLanguageModalOpen(false)}
    >
      <div
        className="bg-white w-full max-w-lg rounded-2xl border border-slate-200 p-6 space-y-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Globe className="w-5 h-5 text-teal-700" />
            <div>
              <h2 className="font-display text-lg font-bold text-slate-900">
                Select Your Language
              </h2>
              <p className="text-xs text-slate-500">
                Choose from 6 Indian languages for menus, AI explanations & voice
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setLanguageModalOpen(false)}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 min-w-[40px] min-h-[40px] flex items-center justify-center"
            aria-label="Close language selector"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 6-Language Grid (Panel #13 inspired) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {SUPPORTED_LANGUAGES.map((lang) => {
            const active = language === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => {
                  setLanguage(lang.code);
                  setLanguageModalOpen(false);
                  pushToast(`Language switched to ${lang.nativeName} (${lang.englishName}).`, 'info');
                }}
                className={`p-4 rounded-xl border text-left transition-colors min-h-[82px] flex flex-col justify-between ${
                  active
                    ? 'border-teal-600 bg-teal-50/70 text-teal-950'
                    : 'border-slate-200 bg-white hover:border-teal-300 hover:bg-slate-50 text-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-display text-base font-bold">{lang.nativeName}</span>
                  {active && <Check className="w-4 h-4 text-teal-700 shrink-0" />}
                </div>
                <span className="text-xs text-slate-500">{lang.englishName}</span>
              </button>
            );
          })}
        </div>

        {/* Voice Input Shortcut */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
          <p className="text-xs text-slate-600">
            Prefer speaking instead of reading or typing?
          </p>
          <button
            type="button"
            onClick={() => {
              setLanguageModalOpen(false);
              setVoiceModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold min-h-[42px] whitespace-nowrap"
          >
            <Mic className="w-4 h-4" />
            Use Voice Input
          </button>
        </div>
      </div>
    </div>
  );
}
