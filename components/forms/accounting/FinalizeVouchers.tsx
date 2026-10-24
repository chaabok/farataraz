"use client";
import { useFormUsageCheck } from "@/hooks/useFormUsageCheck";
import React, { useState, useEffect, useRef } from 'react';
import { apiFetch, toEnglishDigits } from '@/lib/utils';
import { DateInput, NumberInput } from '@/components/inputs';
import { useTabs } from '@/components/TabsProvider';
import { useToast } from '@/components/ToastProvider';
import { useLanguage } from '@/components/Providers';
import { RefreshCw, Play, X, AlertOctagon, CheckCircle2, Calendar, Eye, RotateCcw } from 'lucide-react';
import moment from 'moment-jalaali';
import { eventBus, EVENTS } from '@/lib/events';

const LOCALES: Record<string, any> = {
  fa: {
    title: "دائمی کردن اسناد",
    fromDate: "از تاریخ",
    toDate: "تا تاریخ",
    fromVoucherNumber: "از شماره سند",
    toVoucherNumber: "تا شماره سند",
    start: "شروع",
    cancel: "انصراف",
    activeFiscalYear: "سال مالی فعال",
    from: "از",
    to: "تا",
    errorRequiredFields: "لطفا تمامی فیلدهای الزامی را پر کنید.",
    checking: "در حال عملیات...",
    success: "اسناد با موفقیت دائم شدند.",
    errorTitle: "خطا در فرآیند",
    dateRequired: "ورود تاریخ الزامی است",
    dateInvalid: "تاریخ نامعتبر است",
    viewNote: "مشاهده",
  },
};

export function FinalizeVouchers() {
  const { removeTab, addTab, activeTabId } = useTabs();
  const { showToast } = useToast();
  const { language } = useLanguage();
  const currentLocale = LOCALES[language] || LOCALES.fa;

  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [fromVoucherNumber, setFromVoucherNumber] = useState<number | null>(null);
  const [toVoucherNumber, setToVoucherNumber] = useState<number | null>(null);

  const [status, setStatus] = useState<'idle' | 'checking' | 'running' | 'success' | 'error'>('checking');
  const [errorMessage, setErrorMessage] = useState('');
  const [noteVoucherId, setNoteVoucherId] = useState<number | null>(null);
  const [noteVouchers, setNoteVouchers] = useState<Array<{ voucherId: number; voucherNumber: number; voucherDate: string }>>([]);

  const [targetFiscalYear, setTargetFiscalYear] = useState<any>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [mode, setMode] = useState<'finalize' | 'reverse'>('finalize');

  const fetchInitialValues = async (targetMode: 'finalize' | 'reverse') => {
    setStatus('checking');
    setErrorMessage('');
    setNoteVouchers([]);
    setNoteVoucherId(null);
    try {
      const activeFiscalYearId = typeof window !== 'undefined' ? localStorage.getItem('app-fiscal-year') : null;
      let fyDetails = targetFiscalYear;
      if (!fyDetails && activeFiscalYearId) {
        try {
          const fyRes = await apiFetch(`/api/common/fiscalyear/${activeFiscalYearId}`);
          if (fyRes.ok) {
            const fyData = await fyRes.json();
            fyDetails = fyData?.data || fyData;
            setTargetFiscalYear(fyDetails);
          }
        } catch (e) {
          console.error('Failed to fetch fiscal year details', e);
        }
      }

      const fiscalYearId = fyDetails?.fiscalYearID || activeFiscalYearId;
      const fyParam = fiscalYearId ? `?fiscalYearId=${fiscalYearId}` : '';
      
      const endpoint = targetMode === 'finalize' 
        ? `/api/accounting/vouchers/finalize-initial-values${fyParam}`
        : `/api/accounting/vouchers/reverse-finalize-initial-values${fyParam}`;

      const res = await apiFetch(endpoint);
      if (!res.ok) {
         throw new Error(targetMode === 'finalize' ? 'خطا در دریافت اطلاعات اولیه' : 'خطا در دریافت اطلاعات اسناد دائم');
      }
      const data = await res.json();
      
      if (targetMode === 'reverse' && !data.fromDate && !data.fromVoucherNumber) {
        throw new Error('هیچ سند دائمی در سال مالی فعال وجود ندارد.');
      }

      setFromDate(data.fromDate || '');
      setToDate(data.toDate || '');
      setFromVoucherNumber(data.fromVoucherNumber || (targetMode === 'finalize' ? 1 : null));
      setToVoucherNumber(data.toVoucherNumber || (targetMode === 'finalize' ? 1 : null));
      setStatus('idle');
    } catch (err: any) {
      setErrorMessage(err.message || 'خطا در بارگذاری');
      setStatus('error');
    }
  };

  const handleToggleMode = async () => {
    const nextMode = mode === 'finalize' ? 'reverse' : 'finalize';
    setMode(nextMode);
    await fetchInitialValues(nextMode);
  };

  useEffect(() => {
    fetchInitialValues('finalize');
  }, []);

  useEffect(() => {
    const handleDataChanged = async () => {
      if (status === 'error' && noteVouchers && noteVouchers.length > 0) {
        try {
          const checkedVouchers = await Promise.all(
            noteVouchers.map(async (v) => {
              try {
                const res = await apiFetch(`/api/accounting/vouchers/${v.voucherId}`);
                if (!res.ok) {
                  // If not found or deleted, it's considered resolved/no longer blocking
                  return { ...v, resolved: true };
                }
                const resJson = await res.json();
                const vData = resJson?.data || resJson;
                // If status is no longer 1 (Note), it is resolved
                if (vData && Number(vData.status) !== 1) {
                  return { ...v, resolved: true };
                }
              } catch (e) {
                console.error(`Failed to re-check voucher ${v.voucherId}:`, e);
              }
              return { ...v, resolved: false };
            })
          );

          const remaining = checkedVouchers.filter((v) => !v.resolved);
          if (remaining.length !== noteVouchers.length) {
            setNoteVouchers(remaining);
            if (remaining.length === 0) {
              setStatus('idle');
              setErrorMessage('');
            }
          }
        } catch (err) {
          console.error("Error during auto-recheck of vouchers:", err);
        }
      }
    };

    const unsubscribe = eventBus.on(EVENTS.DATA_CHANGED, handleDataChanged);
    return () => {
      unsubscribe();
    };
  }, [status, noteVouchers]);

  useEffect(() => {
    const updateVoucherRange = async () => {
      if (!fromDate || !toDate || status === 'checking') return;

      try {
        const activeFiscalYearId = typeof window !== 'undefined' ? localStorage.getItem('app-fiscal-year') : null;
        const fiscalYearId = targetFiscalYear?.fiscalYearID?.toString() || activeFiscalYearId;
        const fyParam = fiscalYearId ? `&fiscalYearId=${fiscalYearId}` : '';
        
        const res = await apiFetch(`/api/accounting/vouchers/number-range-by-date?fromDate=${encodeURIComponent(toEnglishDigits(fromDate))}&toDate=${encodeURIComponent(toEnglishDigits(toDate))}${fyParam}`);
        if (res.ok) {
          const result = await res.json();
          const data = result.data || result;
          
          if (mode === 'finalize') {
            if (data.toVoucherNumber !== null) setToVoucherNumber(data.toVoucherNumber);
          } else {
            if (data.fromVoucherNumber !== null) setToVoucherNumber(data.fromVoucherNumber);
          }
        }
      } catch (err) {
        console.error("Failed to fetch voucher range by date:", err);
      }
    };

    updateVoucherRange();
  }, [fromDate, toDate, targetFiscalYear]);

  const handleStart = async () => {
    if (!fromDate || !toDate || !fromVoucherNumber || !toVoucherNumber) {
      showToast(currentLocale.errorRequiredFields, 'error');
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setStatus('checking');
    setErrorMessage('');
    setNoteVoucherId(null);
    setNoteVouchers([]);

    try {
      const activeFiscalYearId = typeof window !== 'undefined' ? localStorage.getItem('app-fiscal-year') : null;
      const fiscalYearId = targetFiscalYear?.fiscalYearID?.toString() || activeFiscalYearId;
      
      const payload = {
        fromDate: toEnglishDigits(fromDate),
        toDate: toEnglishDigits(toDate),
        fromVoucherNumber,
        toVoucherNumber,
        fiscalYearId: fiscalYearId || undefined
      };

      const endpoint = mode === 'finalize' 
        ? '/api/accounting/vouchers/finalize' 
        : '/api/accounting/vouchers/reverse-finalize';

      const res = await apiFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      const data = await res.json();

      if (controller.signal.aborted) return;

      if (!res.ok || data.success === false) {
        setErrorMessage(data.error || 'خطا در عملیات');
        if (data.noteVouchers) {
          setNoteVouchers(data.noteVouchers);
        } else if (data.noteVoucherId) {
          setNoteVoucherId(data.noteVoucherId);
        }
        setStatus('error');
      } else {
        setStatus('success');
        eventBus.emit(EVENTS.DATA_CHANGED);
        showToast(
          mode === 'finalize' 
            ? currentLocale.success 
            : "اسناد با موفقیت به وضعیت قبل از دائم برگشت داده شدند.", 
          'success'
        );
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      setErrorMessage(err.message || 'خطای شبکه');
      setStatus('error');
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
    }
  };

  const handleCancel = () => {
    if (status !== 'idle') {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      setStatus('idle');
      setErrorMessage('');
      setNoteVouchers([]);
      setNoteVoucherId(null);
    } else {
      removeTab(activeTabId || 'FinalizeVouchers');
    }
  };

  const handleClose = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    removeTab(activeTabId || 'FinalizeVouchers');
  };

  const handleViewNote = () => {
     if (noteVoucherId) {
        addTab(`سند یادداشت`, 'accounting', null, 'Voucher', { id: noteVoucherId });
     }
  };

  const getFiscalYearRangeText = () => {
    if (!targetFiscalYear) return "...";
    const startJalali = moment(targetFiscalYear.startDate).format('jYYYY/jMM/jDD');
    const endJalali = moment(targetFiscalYear.endDate).format('jYYYY/jMM/jDD');
    return `${currentLocale.activeFiscalYear}: ${targetFiscalYear.title || ''} (${currentLocale.from} ${startJalali} ${currentLocale.to} ${endJalali})`;
  };

  const isRtl = ['fa', 'ar'].includes(language);

  return (
    <div className="flex-1 flex items-center justify-center p-6 bg-slate-50/20 dark:bg-gray-950/20 min-h-0 relative">
      <div 
        className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-lg border border-emerald-100 dark:border-emerald-900/30 shadow-[0_8px_30px_-4px_rgba(16,185,129,0.15)] overflow-hidden flex flex-col"
        style={{ direction: isRtl ? 'rtl' : 'ltr' }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 dark:from-emerald-700 dark:to-emerald-600 px-4 py-3 flex items-center justify-between text-white flex-shrink-0">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 opacity-90" />
            <h3 className="text-sm font-bold">
              {mode === 'finalize' ? currentLocale.title : "برگشت از دائم کردن اسناد"}
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <button 
              type="button" 
              onClick={handleClose}
              className="p-1 hover:bg-white/10 rounded transition-colors text-white/90 hover:text-white pointer-events-auto"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 flex-1 overflow-y-auto">
          {status === 'checking' && (
            <div className="flex flex-col items-center justify-center py-6 space-y-3">
              <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
              <p className="text-xs text-gray-550 dark:text-gray-400 text-center px-4 leading-relaxed">{currentLocale.checking}</p>
            </div>
          )}

          {status === 'error' && (
            <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 p-4 rounded-md flex flex-col gap-2.5 max-h-56 overflow-hidden">
              <div className="flex items-start gap-3 flex-shrink-0">
                <AlertOctagon className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-rose-700 dark:text-rose-400">{currentLocale.errorTitle}</h4>
                </div>
              </div>
              
              <div className="overflow-y-auto max-h-36 pr-1 space-y-2 scrollbar-thin scrollbar-thumb-rose-200 dark:scrollbar-thumb-rose-900/50">
                {noteVouchers && noteVouchers.length > 0 ? (
                  noteVouchers.map((v) => (
                    <div key={v.voucherId} className="flex items-center justify-between text-xs bg-white dark:bg-gray-800/50 border border-rose-100 dark:border-rose-950/40 p-2 rounded-md gap-2">
                      <span className="text-rose-700 dark:text-rose-300 leading-relaxed">
                        {`سند شماره ${v.voucherNumber} به تاریخ ${v.voucherDate} در وضعیت یادداشت می باشد.`}
                      </span>
                      <button 
                        type="button"
                        onClick={() => addTab(`سند یادداشت`, 'accounting', null, 'Voucher', { id: v.voucherId })}
                        className="flex items-center justify-center p-1.5 bg-rose-50 dark:bg-rose-900/50 border border-rose-200 dark:border-rose-800 rounded-md text-rose-600 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-800 transition-colors shrink-0"
                        title={currentLocale.viewNote}
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-rose-600 dark:text-rose-300 leading-relaxed whitespace-pre-line">
                    {errorMessage}
                    {errorMessage === 'در بازه تعیین شده، نیاز به شماره گذاری مجدد اسناد حسابداری می باشد' && (
                      <div className="flex justify-end mt-2">
                        <button 
                          type="button"
                          onClick={() => addTab('شماره گذاری مجدد', 'accounting', null, 'RenumberVouchers')}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-100 dark:bg-rose-900/50 border border-rose-300 dark:border-rose-800 rounded-md text-rose-700 dark:text-rose-300 hover:bg-rose-200 dark:hover:bg-rose-800 transition-colors text-[11px] font-medium cursor-pointer"
                        >
                          <RefreshCw className="w-3 h-3 text-rose-500" />
                          <span>نمایش فرم شماره گذاری مجدد</span>
                        </button>
                      </div>
                    )}
                    {noteVoucherId && (
                      <div className="flex justify-end mt-2">
                        <button 
                          type="button"
                          onClick={handleViewNote}
                          className="flex items-center justify-center p-1.5 bg-white dark:bg-rose-900 border border-rose-200 dark:border-rose-800 rounded-md text-rose-600 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-800 transition-colors shrink-0"
                          title={currentLocale.viewNote}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 p-4 rounded-md flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  {mode === 'finalize' ? currentLocale.success : "اسناد با موفقیت به وضعیت قبل از دائم برگشت داده شدند."}
                </h4>
              </div>
            </div>
          )}

          {/* Form fields shown during idle / success for contextual layout */}
          {(status === 'idle' || status === 'running' || status === 'success' || status === 'error') && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <DateInput
                  label={currentLocale.fromDate}
                  value={fromDate}
                  onChange={setFromDate}
                  required
                  disabled={true}
                  labelWidth="70px"
                />
                <DateInput
                  label={currentLocale.toDate}
                  value={toDate}
                  onChange={setToDate}
                  required
                  disabled={status === 'checking' || status === 'running'}
                  labelWidth="70px"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <NumberInput
                  label={currentLocale.fromVoucherNumber}
                  value={fromVoucherNumber ?? ''}
                  onChange={(val) => setFromVoucherNumber(val === '' ? null : Number(val))}
                  required
                  disabled={true}
                  labelWidth="70px"
                />
                <NumberInput
                  label={currentLocale.toVoucherNumber}
                  value={toVoucherNumber ?? ''}
                  onChange={(val) => setToVoucherNumber(val === '' ? null : Number(val))}
                  required
                  disabled={status === 'checking' || status === 'running'}
                  labelWidth="70px"
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Info Footer */}
        <div className="bg-emerald-50/30 dark:bg-emerald-950/10 px-6 py-2.5 border-t border-emerald-100 dark:border-emerald-900/20 text-[11px] text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 font-medium">
          <Calendar className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          <span>{getFiscalYearRangeText()}</span>
        </div>

        {/* Modal Action Bar */}
        <div className="bg-gray-50/50 dark:bg-gray-800/10 px-4 py-3 flex items-center justify-between border-t border-gray-100 dark:border-gray-800 flex-shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleMode}
              disabled={status === 'checking' || status === 'running'}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium transition-all duration-200 cursor-pointer ${
                mode === 'reverse'
                  ? 'bg-amber-600 hover:bg-amber-550 text-white shadow-sm border border-amber-400/40'
                  : 'border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
              title={mode === 'reverse' ? 'دائمی کردن اسناد' : 'برگشت از دائم'}
            >
              <RotateCcw className={`w-3.5 h-3.5 ${mode === 'reverse' ? 'rotate-180 transition-transform' : ''}`} />
              <span>{mode === 'reverse' ? 'دائمی کردن' : 'برگشت از دائم'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-1.5 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-[12px] font-medium transition-colors"
            >
              {currentLocale.cancel}
            </button>
            
            <button
              type="button"
              onClick={handleStart}
              disabled={status === 'checking' || status === 'running'}
              className="flex items-center gap-1 px-5 py-1.5 bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white rounded-md text-[12px] font-medium shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Play className="w-3 h-3 fill-current" />
              {currentLocale.start}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
