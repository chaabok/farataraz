'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { ActionButton } from '@/components/buttons/ActionButton';
import { apiFetch } from '@/lib/utils';

export default function ActivationModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check license status on mount
    const checkLicense = async () => {
      try {
        const res = await apiFetch('/api/license/status');
        if (res.ok) {
          const data = await res.json();
          if (data.needsActivation) {
            setIsOpen(true);
            setTimeLeft(Math.floor(data.timeLeft));
          }
        }
      } catch (err) {
        console.error('Failed to check license status', err);
      }
    };
    checkLicense();
  }, []);

  const handleTimeout = () => {
    // Timeout reached, log out and close
    apiFetch('/api/auth/logout', { method: 'POST' }).finally(() => {
      window.location.href = '/login';
    });
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen, timeLeft]);

  const submitCode = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await apiFetch('/api/license/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsOpen(false);
      } else {
        setError(data.message || 'کد فعال سازی نامعتبر است.');
      }
    } catch (err) {
       setError('خطا در ارتباط با سرور.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl max-w-md w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-800 animate-in fade-in zoom-in duration-300">
        <div className="flex flex-col items-center mb-6">
          <div className="h-16 w-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center">فعال‌سازی نرم‌افزار</h2>
          <p className="text-gray-600 dark:text-gray-400 text-center mt-2 text-sm">
            لطفاً برای ادامه کار، کد فعال‌سازی نرم‌افزار را وارد نمایید.
            در صورت عدم وارد کردن کد، برنامه تا لحظاتی دیگر بسته خواهد شد.
          </p>
        </div>

        <div className="bg-rose-50 dark:bg-rose-900/20 rounded-lg p-4 mb-6 flex items-center justify-between border border-rose-100 dark:border-rose-900/50">
           <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-medium text-sm">زمان باقیمانده:</span>
           </div>
           <span className="text-2xl font-bold text-rose-600 dark:text-rose-400 font-mono tracking-widest tabular-nums">
             00:{timeLeft.toString().padStart(2, '0')}
           </span>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              کد فعال‌سازی
            </label>
            <input 
              type="text" 
              value={code} 
              onChange={(e) => setCode(e.target.value)}
              placeholder="کد ۶ رقمی را وارد کنید"
              className="w-full text-center text-lg tracking-widest font-mono p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>
          
          {error && <p className="text-sm text-red-500 text-center">{error}</p>}

          <button 
            onClick={submitCode}
            disabled={loading || code.length < 3}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium p-3 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            {loading ? 'در حال بررسی...' : (
              <>
                تایید و فعال‌سازی
                <CheckCircle2 className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
