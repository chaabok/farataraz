"use client";

import { useState, useEffect } from "react";
import { useCompany } from "@/components/Providers";
import { apiFetch } from "@/lib/utils";

export function useFiscalYearCheck(hasDateField: boolean) {
  const { currentCompany } = useCompany();
  const [hasFiscalYear, setHasFiscalYear] = useState<boolean>(true);
  const [loadingFY, setLoadingFY] = useState<boolean>(false);

  useEffect(() => {
    if (!hasDateField) {
      setHasFiscalYear(true);
      return;
    }

    let isMounted = true;

    const verifyFiscalYear = async () => {
      if (typeof window === 'undefined') return;

      try {
        setLoadingFY(true);
        const res = await apiFetch('/api/common/fiscalyear');
        if (res.ok) {
          const data = await res.json();
          const items = Array.isArray(data) ? data : (data?.items || []);
          if (items && items.length > 0) {
            const savedFy = localStorage.getItem('app-fiscal-year');
            const exists = savedFy && items.some((fy: any) => String(fy.fiscalYearID || fy.id) === String(savedFy));
            if (exists) {
              if (isMounted) setHasFiscalYear(true);
            } else {
              const active = items.find((fy: any) => fy.isActive) || items[0];
              const targetId = String(active.fiscalYearID || active.id || '');
              if (targetId) {
                localStorage.setItem('app-fiscal-year', targetId);
                if (isMounted) setHasFiscalYear(true);
              } else {
                if (isMounted) setHasFiscalYear(false);
              }
            }
          } else {
            localStorage.removeItem('app-fiscal-year');
            if (isMounted) setHasFiscalYear(false);
          }
        } else {
          if (isMounted) setHasFiscalYear(false);
        }
      } catch (e) {
        if (isMounted) setHasFiscalYear(false);
      } finally {
        if (isMounted) setLoadingFY(false);
      }
    };

    verifyFiscalYear();

    const handleStorage = () => {
      verifyFiscalYear();
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('fiscalYearUpdated', verifyFiscalYear);

    return () => {
      isMounted = false;
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('fiscalYearUpdated', verifyFiscalYear);
    };
  }, [currentCompany?.businessStructureId, (currentCompany as any)?.id, (currentCompany as any)?.companyId, hasDateField]);

  const isFormDisabledDueToFiscalYear = hasDateField && !hasFiscalYear && !loadingFY;

  return {
    hasFiscalYear,
    loadingFY,
    isFormDisabledDueToFiscalYear
  };
}
