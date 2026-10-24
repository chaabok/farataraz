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
export function Providers({ children }: { children: React.ReactNode }) {
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
