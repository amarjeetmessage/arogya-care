import React from 'react';
import { CheckCircle2, AlertTriangle, Info, XCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function ToastContainer() {
  const { toasts } = useApp();
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-20 lg:bottom-6 right-4 z-50 flex flex-col gap-2 max-w-sm w-[calc(100vw-2rem)]"
      aria-live="polite"
    >
      {toasts.map((t) => {
        const icon =
          t.tone === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
          ) : t.tone === 'warning' ? (
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0" />
          ) : t.tone === 'error' ? (
            <XCircle className="w-5 h-5 text-red-700 shrink-0" />
          ) : (
            <Info className="w-5 h-5 text-teal-700 shrink-0" />
          );

        return (
          <div
            key={t.id}
            className="flex items-start gap-3 px-4 py-3 bg-white border border-slate-200 rounded-xl shadow-lg text-sm text-slate-800"
          >
            {icon}
            <p className="leading-snug">{t.text}</p>
          </div>
        );
      })}
    </div>
  );
}
