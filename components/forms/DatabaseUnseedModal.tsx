'use client';
import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ToastProvider';
import { apiFetch } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';

export interface DatabaseUnseedModalProps {
  isOpen: boolean;
  onClose: (success: boolean) => void;
  businessStructureId: number;
}

const SEED_STEPS = [
  { id: 'geoLocations', label: 'محل های جغرافیایی (استان ها و شهرها)' },
  { id: 'currencies', label: 'ارز ها' },
  { id: 'banks', label: 'بانک ها' },
  { id: 'bankAccountTypes', label: 'انواع حساب بانکی' },
  { id: 'voucherTypes', label: 'انواع سند' },
  { id: 'detailedTypes', label: 'انواع تفصیلی' },
  { id: 'baseSettings', label: 'تنظیمات پایه' },
  { id: 'accounts', label: 'ساختار کدینگ حساب‌ها (سرشاخه)' },
  { id: 'warehouses', label: 'انبارها' },
];

export function DatabaseUnseedModal({ isOpen, onClose, businessStructureId }: DatabaseUnseedModalProps) {
  const { showToast } = useToast();
  const [stepStatuses, setStepStatuses] = useState<Record<string, 'pending' | 'loading' | 'success' | 'error'>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const startUnseeding = async () => {
    setIsRunning(true);
    setErrorMessage(null);
    let newStatuses: Record<string, 'pending' | 'loading' | 'success' | 'error'> = {};
    SEED_STEPS.forEach(step => (newStatuses[step.id] = 'pending'));
    setStepStatuses({ ...newStatuses });

    let hasError = false;

    // Run steps in reverse order might be better for constraints, but since we are just deleting default data,
    // order might not strictly matter if they are independent, but reversing them is safer if there are dependencies.
    // However, they are fairly independent in the UI. We'll use reverse order array.
    const stepsToRun = [...SEED_STEPS].reverse();

    for (let i = 0; i < stepsToRun.length; i++) {
        const step = stepsToRun[i];
        
        setStepStatuses(prev => ({ ...prev, [step.id]: 'loading' }));

        try {
            const res = await apiFetch(`/api/seed/${businessStructureId}/${step.id}`, { method: 'DELETE' });
            const data = await res.json();
            
            if (!res.ok || data.success === false) {
                // Return specific constraint violation message if present
                throw new Error(data.message || 'خطا در حذف اطلاعات');
            }
            
            setStepStatuses(prev => ({ ...prev, [step.id]: 'success' }));
        } catch (error: any) {
            console.error(`Error in unseed step ${step.id}:`, error);
            setStepStatuses(prev => ({ ...prev, [step.id]: 'error' }));
            setErrorMessage(error.message);
            hasError = true;
            break; // Stop running further steps on error
        }
    }

    if (!hasError) {
        // Proceed to delete the company itself
        try {
            setStepStatuses(prev => ({ ...prev, company: 'loading' }));
            const res = await apiFetch(`/api/business-structure/${businessStructureId}`, {
                method: 'DELETE'
            });
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.message || `Error deleting node (${res.status})`);
            }
            setStepStatuses(prev => ({ ...prev, company: 'success' }));
            setIsRunning(false);
            showToast('شرکت و اطلاعات پیش‌فرض آن با موفقیت حذف شد', 'success');
            onClose(true);
            return;
        } catch(err: any) {
            console.error('Delete company error:', err);
            setErrorMessage(err.message || 'خطا در حذف ساختار کسب و کار');
            setStepStatuses(prev => ({ ...prev, company: 'error' }));
            hasError = true;
        }
    }

    setIsRunning(false);

    if (hasError) {
        showToast('حذف اطلاعات با شکست مواجه شد', 'error');
    }
  };

  useEffect(() => {
    if (isOpen && !isRunning && Object.keys(stepStatuses).length === 0) {
      startUnseeding();
    }
  }, [isOpen, isRunning, stepStatuses]);

  const handleRetry = () => {
    if (!isRunning) {
      startUnseeding();
    }
  };

  const isCompleted = Object.values(stepStatuses).every(status => status === 'success') && !isRunning && Object.keys(stepStatuses).length > 0;
  const hasError = Object.values(stepStatuses).some(status => status === 'error');

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-[500px] bg-white dark:bg-slate-900 rounded-xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800" 
          dir="rtl"
        >
          <div className="p-6 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">حذف اطلاعات پایه شرکت</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">درحال حذف اطلاعات پیش‌فرض و شرکت مورد نظر...</p>
          </div>

          <div className="flex flex-col gap-3 p-6 max-h-[50vh] overflow-y-auto">
            {errorMessage && (
                <div className="p-3 mb-2 bg-red-50 text-red-600 rounded-lg border border-red-200 dark:bg-red-900/20 dark:border-red-800/30 text-sm flex gap-2 items-center">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span>{errorMessage}</span>
                </div>
            )}
            {[...SEED_STEPS].reverse().map((step) => {
              const status = stepStatuses[step.id] || 'pending';
              return (
                <div key={step.id} className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{step.label}</span>
                  <div className="flex items-center gap-2">
                    {status === 'pending' && <span className="text-xs text-slate-400">در انتظار</span>}
                    {status === 'loading' && <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />}
                    {status === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
                    {status === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
                  </div>
                </div>
              );
            })}
             <div className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">ساختار کسب و کار</span>
                <div className="flex items-center gap-2">
                {(!stepStatuses.company || stepStatuses.company === 'pending') && <span className="text-xs text-slate-400">در انتظار</span>}
                {stepStatuses.company === 'loading' && <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />}
                {stepStatuses.company === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
                {stepStatuses.company === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
                </div>
            </div>
          </div>

          <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
            <div className="flex items-center gap-2">
              {isCompleted && <span className="text-sm text-green-600 dark:text-green-400 font-medium flex items-center gap-1"><CheckCircle className="w-4 h-4"/> حذف با موفقیت انجام شد</span>}
            </div>
            <div className="flex items-center gap-3">
               {hasError && !isRunning && (
                 <button 
                   onClick={handleRetry} 
                   className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 rounded-lg transition-colors border border-blue-200 dark:border-blue-800"
                 >
                   تلاش مجدد
                 </button>
               )}
               <button 
                 onClick={() => onClose(isCompleted)} 
                 disabled={isRunning} 
                 className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                   isCompleted 
                     ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm' 
                     : 'bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200'
                 } ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
               >
                 بستن
               </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
