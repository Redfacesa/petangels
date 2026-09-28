import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

type ToastValue = {
  notice: string | null;
  showToast: (message: string) => void;
};

const ToastContext = createContext<ToastValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [notice, setNotice] = useState<string | null>(null);

  const showToast = useCallback((message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(null), 4200);
  }, []);

  const value = useMemo(() => ({ notice, showToast }), [notice, showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {notice && (
        <div className="pointer-events-none fixed bottom-24 left-0 right-0 z-[60] flex justify-center px-4 md:bottom-8">
          <p className="pointer-events-auto rounded-full bg-pa-forest px-4 py-2 text-sm font-semibold text-white shadow-card">
            {notice}
          </p>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
