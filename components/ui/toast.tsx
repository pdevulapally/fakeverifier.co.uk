'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

type ToastVariant = 'success' | 'error' | 'info' | 'warning';

export type ToastItem = {
  id: number;
  message: string;
  variant?: ToastVariant;
  durationMs?: number;
};

type ToastContextValue = {
  show: (message: string, options?: { variant?: ToastVariant; durationMs?: number }) => void;
  success: (message: string, durationMs?: number) => void;
  error: (message: string, durationMs?: number) => void;
  info: (message: string, durationMs?: number) => void;
  warning: (message: string, durationMs?: number) => void;
  dismiss: (id: number) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(1);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (message: string, options?: { variant?: ToastVariant; durationMs?: number }) => {
      const id = idRef.current++;
      const variant = options?.variant || 'info';
      const durationMs = options?.durationMs ?? 3500;
      setToasts((prev) => [...prev, { id, message, variant, durationMs }]);
      if (durationMs > 0) {
        window.setTimeout(() => dismiss(id), durationMs);
      }
    },
    [dismiss]
  );

  const success = useCallback((message: string, durationMs?: number) => show(message, { variant: 'success', durationMs }), [show]);
  const error = useCallback((message: string, durationMs?: number) => show(message, { variant: 'error', durationMs }), [show]);
  const info = useCallback((message: string, durationMs?: number) => show(message, { variant: 'info', durationMs }), [show]);
  const warning = useCallback((message: string, durationMs?: number) => show(message, { variant: 'warning', durationMs }), [show]);

  const value = useMemo<ToastContextValue>(() => ({ show, success, error, info, warning, dismiss }), [show, success, error, info, warning, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}

export function ToastViewport({ toasts, onDismiss }: { toasts: ToastItem[]; onDismiss: (id: number) => void }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-[1000] flex flex-col items-end gap-2 p-4">
      <div className="ml-auto flex w-full max-w-sm flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={[
              'pointer-events-auto rounded-lg border p-3 shadow-lg transition-all',
              'bg-white',
              t.variant === 'success' ? 'border-green-200' : '',
              t.variant === 'error' ? 'border-red-200' : '',
              t.variant === 'info' ? 'border-blue-200' : '',
              t.variant === 'warning' ? 'border-yellow-200' : '',
            ].join(' ')}
            style={{ backdropFilter: 'saturate(1.2) blur(4px)' }}
          >
            <div className="flex items-start gap-3">
              <div
                className={[
                  'mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full',
                  t.variant === 'success' ? 'bg-green-500' : '',
                  t.variant === 'error' ? 'bg-red-500' : '',
                  t.variant === 'info' ? 'bg-blue-500' : '',
                  t.variant === 'warning' ? 'bg-yellow-500' : '',
                ].join(' ')}
              />
              <div className="min-w-0 flex-1 text-sm text-gray-900">{t.message}</div>
              <button
                onClick={() => onDismiss(t.id)}
                className="ml-2 inline-flex h-6 w-6 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


