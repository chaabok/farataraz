'use client';
import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ToastProvider';
import { apiFetch } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';

export interface DatabaseSeedModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessStructureId: number;
}

const SEED_STEPS = [
  { id: 'geoLocations', label: 'محل های جغرافیایی (استان ها و شهرها)' },
  { id: 'currencies', label: 'ارز ها' },
  { id: 'banks', label: 'بانک ها' },
  { id: 'bankAccountTypes', label: 'انواع حساب بانکی' },
  { id: 'accountingSettings', label: 'تنظیمات عملیات حسابداری' },
  { id: 'voucherTypes', label: 'انواع سند' },
  { id: 'detailedTypes', label: 'انواع تفصیلی' },
  { id: 'baseSettings', label: 'تنظیمات پایه' },
  { id: 'accounts', label: 'ساختار کدینگ حساب‌ها (سرشاخه)' },
  { id: 'warehouses', label: 'انبارها' },
];

export function DatabaseSeedModal({ isOpen, onClose, businessStructureId }: DatabaseSeedModalProps) {
  const { showToast } = useToast();
  const [stepStatuses, setStepStatuses] = useState<Record<string, 'pending' | 'loading' | 'success' | 'error'>>({});
  const [isRunning, setIsRunning] = useState(false);

  const startSeeding = async () => {
    setIsRunning(true);
    let newStatuses: Record<string, 'pending' | 'loading' | 'success' | 'error'> = {};
    SEED_STEPS.forEach(step => (newStatuses[step.id] = 'pending'));
    setStepStatuses({ ...newStatuses });

    let hasError = false;

    for (let i = 0; i < SEED_STEPS.length; i++) {
        const step = SEED_STEPS[i];
        
        setStepStatuses(prev => ({ ...prev, [step.id]: 'loading' }));

        try {
            const res = await apiFetch(`/api/seed/${businessStructureId}/${step.id}`, { method: 'POST' });
            const data = await res.json();
            
            if (!res.ok || data.success === false) {
                throw new Error(data.message || 'خطا در ایجاد اطلاعات');
            }
            
            setStepStatuses(prev => ({ ...prev, [step.id]: 'success' }));
        } catch (error: any) {
            console.error(`Error in seed step ${step.id}:`, error);
            setStepStatuses(prev => ({ ...prev, [step.id]: 'error' }));
            hasError = true;
            break; // Stop running further steps on error
        }
    }

    setIsRunning(false);

    if (!hasError) {
        showToast('اطلاعات پیش فرض کسب و کار ایجاد شد', 'success');
    } else {
        showToast('ایجاد اطلاعات با شکست مواجه شد', 'error');
    }
  };

  useEffect(() => {
    if (isOpen && !isRunning && Object.keys(stepStatuses).length === 0) {
      startSeeding();
    }
  }, [isOpen]);

  const handleRetry = () => {
    if (!isRunning) {
      startSeeding();
    }
  };

  const isCompleted = Object.values(stepStatuses).every(status => status === 'success') && !isRunning && Object.keys(stepStatuses).length > 0;
  const hasError = Object.values(stepStatuses).some(status => status === 'error');

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-[500px] bg-white dark:bg-slate-900 rounded-xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800" 
          dir="rtl"
        >
          <div className="p-6 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">ساخت اطلاعات پایه</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">درحال ایجاد اطلاعات پیش‌فرض برای شرکت جدید...</p>
          </div>

          <div className="flex flex-col gap-3 p-6 max-h-[50vh] overflow-y-auto">
            {SEED_STEPS.map((step) => {
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
          </div>

          <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
            <div className="flex items-center gap-2">
              {isCompleted && <span className="text-sm text-green-600 dark:text-green-400 font-medium flex items-center gap-1"><CheckCircle className="w-4 h-4"/> اطلاعات با موفقیت ساخته شد</span>}
            </div>
            <div className="flex items-center gap-3">
               {hasError && !isRunning && (
                 <button 
                   onClick={handleRetry} 
                   className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 rounded-lg transition-colors border border-blue-200 dark:border-blue-800"
                 >
                   دریافت مجدد
                 </button>
               )}
               <button 
                 onClick={onClose} 
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
