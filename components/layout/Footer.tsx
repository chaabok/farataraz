'use client';

import { useLanguage, useCompany } from '@/components/Providers';
import { Hash, Calendar, Clock, ChevronDown, Plus, Key, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';
import { useEffect, useState, useCallback, useRef } from 'react';
import { apiFetch } from '@/lib/utils';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useTabs } from '@/components/TabsProvider';
import { eventBus, EVENTS } from '@/lib/events';
import { ParsaLauncherIcon } from './ParsaLauncherIcon';
import { ParsaStartMenu } from './ParsaStartMenu';

export function Footer() {
  const { t, language } = useLanguage();
  const { currentCompany, currentBranch } = useCompany();
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [lockNumber, setLockNumber] = useState<string | null>(null);
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
  
  const [fiscalYears, setFiscalYears] = useState<any[]>([]);
  const [activeFiscalYear, setActiveFiscalYear] = useState('');
  const [showNoFiscalYearDialog, setShowNoFiscalYearDialog] = useState(false);
  const fiscalLoadSeqRef = useRef(0);
  
  const { addTab } = useTabs();

  useEffect(() => {
    setCurrentTime(new Date());
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    apiFetch('/api/license/machine-id')
      .then(res => {
        if (!res.ok) {
          return { machineId: null };
        }
        return res.json();
      })
      .then(data => {
        if (data && data.machineId) setLockNumber(data.machineId);
      })
      .catch(err => {
        // Silently ignore if license/machine-id fetch fails
      });

    return () => clearInterval(interval);
  }, []);

  const loadFiscalYears = useCallback((preferredId?: string | number) => {
    if (!currentCompany) {
      setFiscalYears([]);
      setShowNoFiscalYearDialog(false);
      return;
    }

    const seq = ++fiscalLoadSeqRef.current;

    const applyData = (data: any) => {
      const items = Array.isArray(data) ? data : (data?.items || []);
      if (items.length === 0) {
        setFiscalYears([]);
        setShowNoFiscalYearDialog(true);
        setActiveFiscalYear('');
        localStorage.removeItem('app-fiscal-year');
        window.dispatchEvent(new Event('storage'));
      } else {
        setFiscalYears(items);
        setShowNoFiscalYearDialog(false);

        const savedFiscalYear = localStorage.getItem('app-fiscal-year');
        const hasSaved = savedFiscalYear && items.some((fy: any) => String(fy.fiscalYearID || fy.id) === String(savedFiscalYear));

        let targetId = '';
        if (preferredId && items.some((fy: any) => String(fy.fiscalYearID || fy.id) === String(preferredId))) {
          targetId = String(preferredId);
        } else if (hasSaved) {
          targetId = String(savedFiscalYear);
        } else {
          // If no fiscal year was previously defined/selected, select newly created or active/first
          const active = items.find((fy: any) => fy.isActive) || items[0];
          targetId = String(active.fiscalYearID || active.id || '');
        }

        setActiveFiscalYear(targetId);
        if (targetId) {
          localStorage.setItem('app-fiscal-year', targetId);
        } else {
          localStorage.removeItem('app-fiscal-year');
        }
        window.dispatchEvent(new Event('storage'));
      }
    };

    // بک‌اند ممکن است موقتاً در حال ری‌استارت باشد؛ با فاصله دوباره تلاش می‌کنیم
    // (خطاهای گذرا نباید اورلی خطای کنسول/Next را فعال کنند — فقط warn)
    const delays = [0, 2500, 6000, 12000, 20000];
    const attempt = (idx: number) => {
      if (seq !== fiscalLoadSeqRef.current) return; // درخواست جدیدتری آمده است
      apiFetch('/api/common/fiscalyear')
        .then(async res => {
          if (res.status === 503) return { _isRestarting: true };
          if (!res.ok) {
            const text = await res.text().catch(() => "");
            throw new Error(`Failed to fetch fiscal years: ${res.status} ${res.statusText}. ${text.slice(0, 100)}`);
          }
          return res.json();
        })
        .then(data => {
          if (seq !== fiscalLoadSeqRef.current) return;
          if (data && data._isRestarting) return; // Silent skip
          applyData(data);
        })
        .catch(err => {
          if (seq !== fiscalLoadSeqRef.current) return;
          if (window.location.pathname.startsWith('/login')) return;
          if (idx + 1 < delays.length) {
            console.warn(`Fiscal years fetch failed (attempt ${idx + 1}/${delays.length}), retrying...`, (err as any)?.message || err);
            setTimeout(() => attempt(idx + 1), delays[idx + 1]);
          } else {
            console.warn('Fiscal years temporarily unavailable; will refresh on next data change.', (err as any)?.message || err);
          }
        });
    };
    attempt(0);
  }, [currentCompany, currentCompany?.businessStructureId]);

  useEffect(() => {
    loadFiscalYears();

    const unsub = eventBus.on(EVENTS.DATA_CHANGED, (payload) => {
      if (payload?.entity === 'FiscalYear') {
        loadFiscalYears(payload?.id);
      }
    });

    const handleCustomEvent = (e: any) => {
      loadFiscalYears(e?.detail?.newFiscalYearId);
    };
    window.addEventListener('fiscalYearUpdated', handleCustomEvent);

    return () => {
      unsub();
      window.removeEventListener('fiscalYearUpdated', handleCustomEvent);
    };
  }, [currentCompany, currentCompany?.businessStructureId, currentBranch?.businessStructureId, loadFiscalYears]);

  // Format date and time according to the current locale
  const formatDate = (date: Date) => {
    try {
      const localeMap: Record<string, string> = {
        'fa': 'fa-IR',
        'en': 'en-US',
        'ar': 'ar-SA',
        'zh': 'zh-CN'
      };
      
      return new Intl.DateTimeFormat(localeMap[language] || 'en-US', {
        dateStyle: 'long',
      }).format(date);
    } catch {
      return '';
    }
  };

  const formatTime = (date: Date) => {
    try {
      const localeMap: Record<string, string> = {
        'fa': 'fa-IR',
        'en': 'en-US',
        'ar': 'ar-SA',
        'zh': 'zh-CN'
      };
      
      return new Intl.DateTimeFormat(localeMap[language] || 'en-US', {
        timeStyle: 'medium',
      }).format(date);
    } catch {
      return '';
    }
  };

  return (
    <footer className="relative z-40 flex h-[38px] w-full flex-shrink-0 items-center justify-between border-t border-slate-200/80 bg-slate-900/90 px-3 text-xs text-slate-300 shadow-[0_-4px_20px_rgba(0,0,0,0.15)] backdrop-blur-xl transition-all dark:border-slate-800/80 dark:bg-slate-950/95 dark:text-slate-300 dark:shadow-[0_-4px_20px_rgba(0,0,0,0.4)]" dir="ltr">
      
      {/* Windows 11 Style Start Menu Popup */}
      <ParsaStartMenu
        isOpen={isStartMenuOpen}
        onClose={() => setIsStartMenuOpen(false)}
        lockNumber={lockNumber}
      />

      {showNoFiscalYearDialog && (
        <ConfirmDialog
          isOpen={showNoFiscalYearDialog}
          title="هشدار دوره مالی"
          message="سال مالی وجود ندارد. آیا مایلید سال مالی جدید را تعریف کنید؟"
          confirmText="بلی"
          cancelText="خیر"
          onConfirm={() => {
            setShowNoFiscalYearDialog(false);
            addTab('سال مالی جدید', 'general', <Plus className="w-4 h-4" />, 'NewFiscalYear');
          }}
          onCancel={() => setShowNoFiscalYearDialog(false)}
        />
      )}

      {/* Top Gradient Accent Border */}
      <div className="absolute left-0 right-0 top-0 h-[1px] bg-gradient-to-r from-blue-500/40 via-cyan-400/30 to-indigo-500/40 opacity-80" />

      {/* Physical Left Side: Parsa ERP Start Launcher Icon */}
      <div className="flex items-center gap-3">
        {/* Custom Parsa ERP Launcher Button */}
        <ParsaLauncherIcon
          isOpen={isStartMenuOpen}
          onClick={() => setIsStartMenuOpen(!isStartMenuOpen)}
        />
      </div>

      {/* Physical Right Side: Fiscal Year, Time & Date, License, Version */}
      <div className="flex items-center gap-4 dir-rtl">
        {/* Fiscal Year Selector */}
        <div className="relative flex items-center rounded-lg border border-slate-700/60 bg-slate-800/70 px-2.5 py-1 text-slate-200 hover:bg-slate-800 transition-colors group">
          <span className="me-1 text-[11px] text-slate-400 whitespace-nowrap">{t('fiscal_year')}:</span>
          <select 
            className="appearance-none bg-transparent font-bold outline-none text-[11px] text-slate-100 cursor-pointer pr-4 pl-1"
            value={activeFiscalYear}
            onChange={(e) => {
              const val = e.target.value;
              setActiveFiscalYear(val);
              localStorage.setItem('app-fiscal-year', val);
              window.dispatchEvent(new Event('storage'));
            }}
          >
            {fiscalYears.length > 0 ? fiscalYears.map((fy: any) => (
              <option key={fy.fiscalYearID || fy.id} value={fy.fiscalYearID || fy.id} className="bg-slate-900 text-slate-100">{fy.title}</option>
            )) : <option key="no-fy" value="" className="bg-slate-900">---</option>}
          </select>
          <ChevronDown className="absolute left-1.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
        </div>

        {/* Date & Time */}
        {currentTime && (
          <div className="hidden sm:flex items-center gap-3 text-[11px] text-slate-300">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-blue-400" />
              <span>{formatDate(currentTime)}</span>
            </div>
            <div className="flex items-center gap-1.5 font-mono">
              <Clock className="h-3.5 w-3.5 text-cyan-400" />
              <span>{formatTime(currentTime)}</span>
            </div>
          </div>
        )}

        {/* Lock Number / Machine ID */}
        {lockNumber && (
          <div className="hidden md:flex items-center gap-1 text-[11px]" title="شماره قفل سخت‌افزاری مشتری">
            <Key className="h-3 w-3 text-amber-400 opacity-80" />
            <span className="font-mono font-semibold text-slate-400">{lockNumber}</span>
          </div>
        )}

        {/* App Version */}
        <div className="flex items-center gap-1 text-[11px] text-slate-400">
          <Hash className="h-3 w-3 opacity-60" />
          <span className="font-semibold">v1.0.0</span>
        </div>
      </div>
      
    </footer>
  );
}

