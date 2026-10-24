"use client";

import React from "react";
import { AlertTriangle, Plus } from "lucide-react";
import { useTabs } from "@/components/TabsProvider";

interface FiscalYearWarningBannerProps {
  className?: string;
}

export const FiscalYearWarningBanner: React.FC<FiscalYearWarningBannerProps> = ({ className = "" }) => {
  const { addTab } = useTabs();

  const handleCreateFiscalYear = () => {
    if (addTab) {
      addTab('سال مالی جدید', 'general', <Plus className="w-4 h-4" />, 'NewFiscalYear');
    }
  };

  return (
    <div className={`p-3 bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-700/70 rounded-lg flex items-center justify-between gap-3 text-amber-800 dark:text-amber-200 text-xs shadow-sm shrink-0 z-20 ${className}`}>
      <div className="flex items-center gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 animate-bounce" />
        <div>
          <span className="font-bold text-sm block mb-0.5">هشدار دوره مالی</span>
          <span>سال مالی برای شرکت فعال تعریف نشده است. تا زمان تعریف سال مالی، ورود و ثبت اطلاعات در این فرم امکان‌پذیر نمی‌باشد.</span>
        </div>
      </div>
      <button
        type="button"
        onClick={handleCreateFiscalYear}
        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-600 text-white font-medium text-xs rounded-md shadow-sm transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
      >
        <Plus className="w-4 h-4" />
        <span>ایجاد سال مالی</span>
      </button>
    </div>
  );
};
