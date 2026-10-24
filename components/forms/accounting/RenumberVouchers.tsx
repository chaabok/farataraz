"use client";

import React, { useState, useEffect } from 'react';
import { apiFetch, toEnglishDigits } from '@/lib/utils';
import { DateInput, Checkbox } from '@/components/inputs';
import { useTabs } from '@/components/TabsProvider';
import { useToast } from '@/components/ToastProvider';
import { useLanguage } from '@/components/Providers';
import { RefreshCw, Play, X, AlertOctagon, CheckCircle2, Calendar } from 'lucide-react';
import moment from 'moment-jalaali';

export default function RenumberVouchers() {
  const { activeTabId, removeTab } = useTabs();
  const { showToast } = useToast();
  const { language, t } = useLanguage();

  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [targetFiscalYear, setTargetFiscalYear] = useState<any>(null);

  const [renumberVoucher, setRenumberVoucher] = useState(true);
  const [renumberReference, setRenumberReference] = useState(false);

  // Statuses: 'idle' | 'checking' | 'running_voucher' | 'running_ref' | 'success' | 'error'
  const [status, setStatus] = useState<'idle' | 'checking' | 'running_voucher' | 'running_ref' | 'success' | 'error'>('idle');
  
  const [voucherProgress, setVoucherProgress] = useState(0);
  const [refProgress, setRefProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch active fiscal year dynamically on load to set pre-filled dates
  useEffect(() => {
    const activeFiscalYearId = typeof window !== 'undefined' ? localStorage.getItem('app-fiscal-year') : null;
    if (activeFiscalYearId) {
      apiFetch(`/api/common/fiscalyear/${activeFiscalYearId}`)
        .then(res => {
          if (res.ok) return res.json();
          throw new Error('Failed to fetch fiscal year details');
        })
        .then(data => {
          const detail = data?.data || data;
          if (detail && detail.startDate && detail.endDate) {
            setTargetFiscalYear(detail);
            
            // Format starting and ending dates in Jalaali
            const startJalali = moment(detail.startDate).locale('en').format('jYYYY/jMM/jDD');
            const endJalali = moment(detail.endDate).locale('en').format('jYYYY/jMM/jDD');
            
            setFromDate(startJalali);
            setToDate(endJalali);
          } else {
            // Default fallback
            const currentYear = moment().locale('en').format('jYYYY');
            setFromDate(`${currentYear}/01/01`);
            setToDate(`${currentYear}/12/29`);
          }
        })
        .catch(() => {
          const currentYear = moment().locale('en').format('jYYYY');
          setFromDate(`${currentYear}/01/01`);
          setToDate(`${currentYear}/12/29`);
        });
    } else {
      const currentYear = moment().locale('en').format('jYYYY');
      setFromDate(`${currentYear}/01/01`);
      setToDate(`${currentYear}/12/29`);
    }
  }, []);

  const handleCancel = () => {
    if (activeTabId) {
      removeTab(activeTabId);
    }
  };

  const handleStart = async () => {
    if (!fromDate || !toDate) {
      showToast(t('renumberVouchers.errorRequiredDates'), 'error');
      return;
    }

    if (!renumberVoucher && !renumberReference) {
      showToast(t('renumberVouchers.errorSelectOne'), 'error');
      return;
    }

    // Date constraint validation against currently active fiscal year
    if (targetFiscalYear) {
      const startConstraint = moment(targetFiscalYear.startDate).startOf('day');
      const endConstraint = moment(targetFiscalYear.endDate).endOf('day');

      const currentFromMoment = moment(toEnglishDigits(fromDate), 'jYYYY/jMM/jDD');
      const currentToMoment = moment(toEnglishDigits(toDate), 'jYYYY/jMM/jDD');

      if (!currentFromMoment.isValid() || !currentToMoment.isValid()) {
        showToast(t('renumberVouchers.dateInvalid'), 'error');
        return;
      }

      if (
        currentFromMoment.isBefore(startConstraint, 'day') || 
        currentFromMoment.isAfter(endConstraint, 'day') ||
        currentToMoment.isBefore(startConstraint, 'day') || 
        currentToMoment.isAfter(endConstraint, 'day')
      ) {
        const startJalali = moment(targetFiscalYear.startDate).format('jYYYY/jMM/jDD');
        const endJalali = moment(targetFiscalYear.endDate).format('jYYYY/jMM/jDD');
        const rangeErrorMsg = t('renumberVouchers.errorOutOfRange')
          .replace('{start}', startJalali)
          .replace('{end}', endJalali);

        showToast(rangeErrorMsg, 'error');
        setErrorMessage(rangeErrorMsg);
        setStatus('error');
        return;
      }
    }

    try {
      setStatus('checking');
      setVoucherProgress(0);
      setRefProgress(0);
      setErrorMessage('');

      // Send the request to perform the actual database transaction
      const response = await apiFetch('/api/accounting/vouchers/renumber', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fromDate,
          toDate,
          renumberVoucher,
          renumberReference
        })
      });

      const result = await response.json();

      if (!response.ok || result.success === false) {
        setStatus('error');
        let errMsg = result.error || 'خطا در انجام عملیات شماره گذاری مجدد';
        
        // Localize backend permanent document error specifically if triggered
        if (errMsg.includes('اسناد دائم وجود دارد')) {
          errMsg = t('renumberVouchers.backendPermanentError');
        }
        
        setErrorMessage(errMsg);
        showToast(errMsg, 'error');
        return;
      }

      // If database updates succeed, we start the visual progress bar animation
      simulateProgress();
    } catch (e: any) {
      console.error(e);
      setStatus('error');
      const err = e.message || 'Error occurred';
      setErrorMessage(err);
      showToast(err, 'error');
    }
  };

  const simulateProgress = () => {
    if (renumberVoucher) {
      setStatus('running_voucher');
      let currentProgress = 0;
      const interval = setInterval(() => {
        currentProgress += 10;
        setVoucherProgress(currentProgress);
        if (currentProgress >= 100) {
          clearInterval(interval);
          if (renumberReference) {
            // Move to Reference spacing
            simulateRefProgress();
          } else {
            setStatus('success');
            showToast(t('renumberVouchers.successVoucher'), 'success');
          }
        }
      }, 70);
    } else if (renumberReference) {
      simulateRefProgress();
    }
  };

  const simulateRefProgress = () => {
    setStatus('running_ref');
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 10;
      setRefProgress(currentProgress);
      if (currentProgress >= 100) {
        clearInterval(interval);
        setStatus('success');
        if (renumberVoucher && renumberReference) {
          showToast(t('renumberVouchers.successBoth'), 'success');
        } else {
          showToast(t('renumberVouchers.successRef'), 'success');
        }
      }
    }, 70);
  };

  // Human friendly display of active fiscal year start and end bounds
  const getFiscalYearRangeText = () => {
    if (!targetFiscalYear) return "...";
    const startJalali = moment(targetFiscalYear.startDate).format('jYYYY/jMM/jDD');
    const endJalali = moment(targetFiscalYear.endDate).format('jYYYY/jMM/jDD');
    return `${t('renumberVouchers.activeFiscalYear')}: ${targetFiscalYear.title || ''} (${t('renumberVouchers.from')} ${startJalali} ${t('renumberVouchers.to')} ${endJalali})`;
  };

  const isRtl = ['fa', 'ar'].includes(language);

  return (
    <div className="flex-1 flex items-center justify-center p-6 bg-slate-50/20 dark:bg-gray-950/20 min-h-0 relative">
      <div 
        className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-lg border border-emerald-100 dark:border-emerald-900/30 shadow-[0_8px_30px_-4px_rgba(16,185,129,0.15)] overflow-hidden flex flex-col"
        style={{ direction: isRtl ? 'rtl' : 'ltr' }}
      >
        {/* Header (Inspired by SimpleForm Style) */}
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 dark:from-emerald-700 dark:to-emerald-600 px-4 py-3 flex items-center justify-between text-white flex-shrink-0">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 opacity-90 animate-spin-slow" />
            <h3 className="text-sm font-bold">{t('renumberVouchers.title')}</h3>
          </div>
          <button 
            type="button" 
            onClick={handleCancel}
            className="p-1 hover:bg-white/10 rounded transition-colors text-white/90 hover:text-white pointer-events-auto"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 flex-1 overflow-y-auto">
          {status === 'checking' && (
            <div className="flex flex-col items-center justify-center py-6 space-y-3">
              <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
              <p className="text-xs text-gray-550 dark:text-gray-400 text-center px-4 leading-relaxed">{t('renumberVouchers.checking')}</p>
            </div>
          )}

          {status === 'error' && (
            <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 p-4 rounded-md flex items-start gap-3">
              <AlertOctagon className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-rose-700 dark:text-rose-400">{t('renumberVouchers.errorTitle')}</h4>
                <p className="text-xs text-rose-600 dark:text-rose-300 leading-relaxed">{errorMessage}</p>
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 p-4 rounded-md flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  {renumberVoucher && renumberReference
                    ? t('renumberVouchers.successBoth')
                    : renumberVoucher
                    ? t('renumberVouchers.successVoucher')
                    : t('renumberVouchers.successRef')}
                </h4>
              </div>
            </div>
          )}

          {/* Form fields shown during idle / success for contextual layout */}
          {(status === 'idle' || status === 'running_voucher' || status === 'running_ref' || status === 'success') && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <DateInput
                  label={t('renumberVouchers.fromDate')}
                  value={fromDate}
                  onChange={setFromDate}
                  required
                  disabled={status !== 'idle'}
                  labelWidth="70px"
                />
                <DateInput
                  label={t('renumberVouchers.toDate')}
                  value={toDate}
                  onChange={setToDate}
                  required
                  disabled={status !== 'idle'}
                  labelWidth="70px"
                />
              </div>

              <div className="pt-2 border-t border-gray-100 dark:border-gray-800 space-y-3">
                <Checkbox
                  text={t('renumberVouchers.voucherNumber')}
                  checked={renumberVoucher}
                  onChange={setRenumberVoucher}
                  disabled={status !== 'idle'}
                />

                <Checkbox
                  text={t('renumberVouchers.referenceNumber')}
                  checked={renumberReference}
                  onChange={setRenumberReference}
                  disabled={status !== 'idle'}
                />
              </div>
            </div>
          )}

          {/* Progress Indicators */}
          {(status === 'running_voucher' || status === 'running_ref' || status === 'success') && (
            <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800 animate-in fade-in duration-200">
              {renumberVoucher && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[11px] font-medium">
                    <span className="text-gray-650 dark:text-gray-400">{t('renumberVouchers.runningVoucher')}</span>
                    <span className="text-emerald-600 dark:text-emerald-400">{voucherProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 rounded-full transition-all duration-75"
                      style={{ width: `${voucherProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {renumberReference && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[11px] font-medium">
                    <span className="text-gray-650 dark:text-gray-400">{t('renumberVouchers.runningRef')}</span>
                    <span className="text-emerald-600 dark:text-emerald-400">{refProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 rounded-full transition-all duration-75"
                      style={{ width: `${refProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Info Footer displaying currently active selected fiscal year bounds */}
        <div className="bg-emerald-50/30 dark:bg-emerald-950/10 px-6 py-2.5 border-t border-emerald-100 dark:border-emerald-900/20 text-[11px] text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 font-medium">
          <Calendar className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          <span>{getFiscalYearRangeText()}</span>
        </div>

        {/* Modal Action Bar (Inspired by SimpleForm buttons) */}
        <div className="bg-gray-50/50 dark:bg-gray-800/10 px-4 py-3 flex items-center justify-end gap-2 border-t border-gray-100 dark:border-gray-800 flex-shrink-0">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-1.5 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-[12px] font-medium transition-colors"
          >
            {t('renumberVouchers.cancel')}
          </button>
          
          <button
            type="button"
            onClick={handleStart}
            disabled={status === 'checking' || status === 'running_voucher' || status === 'running_ref'}
            className="flex items-center gap-1 px-5 py-1.5 bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white rounded-md text-[12px] font-medium shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <Play className="w-3 h-3 fill-current" />
            {t('renumberVouchers.start')}
          </button>
        </div>
      </div>
    </div>
  );
}
