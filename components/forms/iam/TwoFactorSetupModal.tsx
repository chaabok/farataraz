'use client';

import React, { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/utils';
import { X, QrCode, ShieldCheck, Check } from 'lucide-react';
import { useToast } from '@/components/ToastProvider';
import { createPortal } from 'react-dom';

interface TwoFactorSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TwoFactorSetupModal({ isOpen, onClose }: TwoFactorSetupModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [secret, setSecret] = useState('');
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { showToast } = useToast();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const generateQrCode = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await apiFetch('/api/auth/2fa/generate', {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        setQrCodeUrl(data.qrCodeDataUrl);
        setSecret(data.secret);
      } else {
        const err = await res.json();
        setError(err.message || 'خطا در دریافت اطلاعات 2FA');
      }
    } catch (err: any) {
      setError(err.message || 'خطا در ارتباط با سرور');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setToken('');
      setError('');
      generateQrCode();
    }
  }, [isOpen]);

  const handleVerifyToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError('لطفا کد تایید را وارد کنید');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const res = await apiFetch('/api/auth/2fa/enable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      
      if (res.ok) {
        setStep(2);
        showToast('ورود دو مرحله‌ای با موفقیت فعال شد.', 'success');
      } else {
        const err = await res.json();
        setError(err.message || 'کد تایید نامعتبر است');
      }
    } catch (err: any) {
      setError(err.message || 'خطا در ارتباط با سرور');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-500" />
            تنظیم ورود دو مرحله‌ای
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {step === 1 && (
            <div className="flex flex-col items-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-6">
                برای فعال‌سازی ورود دو مرحله‌ای، ابتدا اپلیکیشن احراز هویت (مانند Google Authenticator) را نصب کرده و کد QR زیر را اسکن کنید.
              </p>
              
              {isLoading && !qrCodeUrl ? (
                <div className="w-48 h-48 flex items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl mb-6">
                  <span className="text-gray-500 animate-pulse">در حال دریافت QRCode...</span>
                </div>
              ) : qrCodeUrl ? (
                <div className="p-2 bg-white rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col items-center gap-2">
                  <img src={qrCodeUrl} alt="2FA QR Code" className="w-48 h-48" />
                  <p className="text-xs text-center text-gray-500 max-w-[200px] break-all hidden">{secret}</p>
                </div>
              ) : (
                <div className="w-48 h-48 flex items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 mb-6 text-rose-500">
                  <QrCode className="opacity-50" size={48} />
                </div>
              )}

              {error && (
                <div className="w-full p-3 mb-4 text-sm text-rose-600 bg-rose-50 dark:bg-rose-900/30 rounded-lg border border-rose-100 dark:border-rose-800 text-center">
                  {error}
                </div>
              )}

              <form onSubmit={handleVerifyToken} className="w-full flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    کد تایید اپلیکیشن احراز هویت
                  </label>
                  <input
                    type="text"
                    value={token}
                    onChange={(e) => setToken(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="123456"
                    className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-indigo-500 text-center tracking-[0.5em] font-mono text-lg transition-all outline-none disabled:opacity-50"
                    maxLength={6}
                    disabled={isLoading || !qrCodeUrl}
                    autoComplete="off"
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={isLoading || token.length < 6}
                  className="w-full mt-2 flex items-center justify-center py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'در حال بررسی...' : 'بررسی و فعال‌سازی'}
                </button>
              </form>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col items-center py-6">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 flex items-center justify-center rounded-full mb-6">
                <Check className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">عملیات موفق</h4>
              <p className="text-center text-gray-600 dark:text-gray-400 mb-8 max-w-xs">
                ورود دو مرحله‌ای با موفقیت برای حساب کاربری شما فعال شد. از این پس در هنگام ورود نیاز به وارد کردن کد تایید خواهید داشت.
              </p>
              <button
                onClick={onClose}
                className="w-full py-3 px-4 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg font-medium transition-colors"
              >
                بستن پنجره
              </button>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
