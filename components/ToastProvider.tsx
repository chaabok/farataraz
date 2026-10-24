'use client';

import React from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useToastStore, ToastType } from '../lib/stores/toastStore';

export function useToast() {
  const showToast = useToastStore((state) => state.showToast);
  return { showToast };
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const toasts = useToastStore((state) => state.toasts);
  const removeToast = useToastStore((state) => state.removeToast);

  const successToasts = toasts.filter((t) => t.type === 'success' || t.type === 'info' || t.type === 'warning');
  const errorToasts = toasts.filter((t) => t.type === 'error');

  return (
    <>
      {children}
      {/* Success/Info/Warning Toasts */}
      <div className="fixed top-4 left-4 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {successToasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
              className={`flex items-center gap-3 p-4 rounded-lg shadow-lg border pointer-events-auto backdrop-blur-sm shadow-black/5 ${
                toast.type === 'info' 
                  ? 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/40 dark:border-blue-800/60 dark:text-blue-300' 
                  : toast.type === 'warning'
                  ? 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/40 dark:border-amber-800/60 dark:text-amber-300'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/40 dark:border-emerald-800/60 dark:text-emerald-300'
              }`}
              dir="rtl"
            >
              <CheckCircle className="w-5 h-5 shrink-0" />
              <p className="flex-1 text-sm font-medium leading-relaxed">{toast.message}</p>
              <button
                onClick={() => removeToast(toast.id)}
                className={`p-1.5 rounded-md transition-colors shrink-0 ${
                  toast.type === 'info' ? 'hover:bg-blue-200/50 dark:hover:bg-blue-800/50' :
                  toast.type === 'warning' ? 'hover:bg-amber-200/50 dark:hover:bg-amber-800/50' :
                  'hover:bg-emerald-200/50 dark:hover:bg-emerald-800/50'
                }`}
                aria-label="بستن پیام"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Error Toasts - Centered */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
        <div className="flex flex-col gap-3 max-w-md w-full items-center">
          <AnimatePresence>
            {errorToasts.map((toast) => (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                className="flex items-start gap-4 p-5 rounded-xl shadow-2xl border pointer-events-auto bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/80 dark:border-rose-900 dark:text-rose-300 backdrop-blur-md shadow-black/10 w-full"
                dir="rtl"
              >
                <AlertCircle className="w-6 h-6 shrink-0 mt-0.5" />
                <div className="flex-1 flex flex-col gap-1">
                  <p className="text-base font-bold">خطا</p>
                  <p className="text-sm font-medium opacity-90 leading-relaxed">{toast.message}</p>
                </div>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="p-1.5 rounded-md transition-colors shrink-0 hover:bg-rose-200/50 dark:hover:bg-rose-900/50 -mt-1 -mr-1"
                  aria-label="بستن پیام"
                >
                  <X className="w-5 h-5" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
