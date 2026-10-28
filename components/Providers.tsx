'use client';

import { ThemeProvider } from 'next-themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import { safeStringify } from '../lib/utils';
import { useAuthStore } from '../lib/stores/authStore';
import { useCompanyStore } from '../lib/stores/companyStore';
import { useLicenseStore } from '../lib/stores/licenseStore';
import { useShallow } from 'zustand/react/shallow';
import { useLanguage, initializeLanguageDOM } from '../lib/stores/languageStore';

export { useLanguage };

import { TabsProvider } from './TabsProvider';
import { ToastProvider } from './ToastProvider';
import { ConfirmProvider } from './ConfirmProvider';
import { HelpProvider } from './HelpProvider';

export function useLicense() {
  const modules = useLicenseStore(useShallow(state => state.modules));
  const hasModule = useLicenseStore(useShallow(state => state.hasModule));
  return { modules, hasModule };
}

export interface CompanyInfo {
  businessStructureId: number;
  title: string;
  title_en: string;
  logoUrl: string | null;
  businessStructure: number;
  parentRef?: number | string | null;
}

export function useCompany() {
  const currentCompany = useCompanyStore(useShallow((state) => state.currentCompany));
  const setCurrentCompany = useCompanyStore(useShallow((state) => state.setCurrentCompany));
  const currentBranch = useCompanyStore(useShallow((state) => state.currentBranch));
  const setCurrentBranch = useCompanyStore(useShallow((state) => state.setCurrentBranch));
  const currentRep = useCompanyStore(useShallow((state) => state.currentRep));
  const setCurrentRep = useCompanyStore(useShallow((state) => state.setCurrentRep));

  return {
    currentCompany,
    setCurrentCompany,
    currentBranch,
    setCurrentBranch,
    currentRep,
    setCurrentRep
  };
}

export function useAuth() {
  const currentUser = useAuthStore(useShallow((state) => state.currentUser));
  const setCurrentUser = useAuthStore(useShallow((state) => state.setCurrentUser));

  return { currentUser, setCurrentUser };
}


import { apiFetch } from '@/lib/utils';

// ---------------------------------------------------------------------------
// ChunkLoadError auto-recovery (self-healing)
// ---------------------------------------------------------------------------
// When a lazily loaded code-split chunk fails to load (e.g. the dev server was
// restarted and the old chunk URLs are gone, or a new deploy changed chunk
// hashes), the browser keeps referencing stale chunks and every lazy tab
// (e.g. تنظیمات پایه) crashes with "Runtime ChunkLoadError".
// A single automatic reload re-syncs the browser with the current build.
// A sessionStorage guard prevents infinite reload loops.
function useChunkErrorAutoRecovery() {
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const RELOAD_KEY = 'parsa:chunk-error-reload-at';
    const COOLDOWN_MS = 15_000;

    const isChunkError = (msg: string) =>
      /Loading chunk .* failed|ChunkLoadError|Failed to fetch dynamically imported module/i.test(msg || '');

    const tryReload = (reason: string) => {
      try {
        // Task 118: اگر صفحه بازیابی Boot Guard نمایش داده شده، دیگر رفرش نکن
        // (رفرش مجدد صفحه بازیابی را می‌بندد و کاربر را در حلقه می‌ماند)
        if (document.getElementById('parsa-boot-recovery')) return;
        const last = Number(window.sessionStorage.getItem(RELOAD_KEY) || 0);
        if (Date.now() - last < COOLDOWN_MS) return; // already retried recently → stop loop
        window.sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
        console.warn(`[ChunkRecovery] Auto-reloading page after chunk load failure (${reason})`);
        window.location.reload();
      } catch {
        /* sessionStorage unavailable — nothing we can do */
      }
    };

    // 1) Script/resource load failures (capture phase): <script src=/_next/static/chunks/...>
    const onResourceError = (e: Event) => {
      const target = e.target as HTMLScriptElement | null;
      const src = target && target.tagName === 'SCRIPT' ? target.src || '' : '';
      if (src && /_next\/static\/chunks\//.test(src)) {
        tryReload(src.split('/').pop() || 'script chunk');
      }
    };

    // 2) Uncaught ChunkLoadError thrown by webpack require / next dynamic
    const onError = (e: ErrorEvent) => {
      const msg = e.message || '';
      if (isChunkError(msg)) tryReload(msg.split('\n')[0].slice(0, 120));
    };

    // 3) Dynamic import() promise rejections (next/dynamic lazy tabs)
    const onUnhandledRejection = (e: PromiseRejectionEvent) => {
      const reason: unknown = e?.reason;
      const msg = typeof reason === 'string' ? reason : ((reason as Error)?.message ?? '');
      if (isChunkError(msg)) {
        e.preventDefault?.();
        tryReload(msg.split('\n')[0].slice(0, 120));
      }
    };

    window.addEventListener('error', onResourceError, true);
    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onUnhandledRejection);
    return () => {
      window.removeEventListener('error', onResourceError, true);
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onUnhandledRejection);
    };
  }, []);
}

export function Providers({ children }: { children: React.ReactNode }) {
  // Auto-recover when a code-split chunk fails to load (stale browser ↔ new build)
  useChunkErrorAutoRecovery();

  // One QueryClient per browser session (created lazily on first client render,
  // never re-created on re-renders / HMR of this component).
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  useEffect(() => {
    // Task 118: برنامه با موفقیت مونت شد → شمارنده تلاش ریکاوری Boot Guard صفر می‌شود
    try {
      sessionStorage.setItem('parsa:boot-reload', '0');
    } catch {
      /* sessionStorage unavailable */
    }

    apiFetch('/api/license/status')
      .then(res => res.json())
      .then(data => {
         if (data.modules) {
           useLicenseStore.getState().setModules(data.modules);
         }
      })
      .catch(console.error);
    
    // Initialize Stores
    useAuthStore.getState().initialize();
    initializeLanguageDOM();
  }, []);

  // Prevent browser zooming
  useEffect(() => {
    const preventBrowserZoom = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
      }
    };

    const preventBrowserKeyZoom = (e: KeyboardEvent) => {
      // Prevent Ctrl + '+', '-', '0'
      if (e.ctrlKey && (e.key === '=' || e.key === '-' || e.key === '+' || e.key === '0' || e.code === 'NumpadAdd' || e.code === 'NumpadSubtract')) {
        e.preventDefault();
      }
    };

    document.addEventListener('wheel', preventBrowserZoom, { passive: false });
    document.addEventListener('keydown', preventBrowserKeyZoom, { passive: false });

    return () => {
      document.removeEventListener('wheel', preventBrowserZoom);
      document.removeEventListener('keydown', preventBrowserKeyZoom);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider 
        attribute="class" 
        defaultTheme="system" 
        themes={['light', 'dark', 'spring', 'summer', 'autumn', 'winter']} 
        enableSystem 
        disableTransitionOnChange
      >
        <ConfirmProvider>
          <HelpProvider>
            <ToastProvider>
              <TabsProvider>
                {children}
              </TabsProvider>
            </ToastProvider>
          </HelpProvider>
        </ConfirmProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
