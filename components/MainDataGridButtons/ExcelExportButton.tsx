"use client";

import React from "react";
import { FileSpreadsheet } from "lucide-react";
import { ActionButton } from "@/components/buttons/ActionButton";
import { useLanguage } from "@/components/Providers";

export function ExcelExportButton({ 
  onClick, 
  disabled, 
  hideLabel, 
  tooltipPosition = 'top',
  className
}: { 
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void; 
  disabled?: boolean; 
  hideLabel?: boolean;
  tooltipPosition?: 'top' | 'bottom';
  className?: string;
}) {
  const { t } = useLanguage();
  return (
    <ActionButton 
      onClick={onClick} 
      disabled={disabled} 
      icon={FileSpreadsheet} 
      variant="outline" 
      tooltip={t('excel_export_tooltip' as any)} 
      tooltipPosition={tooltipPosition}
      hideLabel={hideLabel}
      className={`text-emerald-600 dark:text-emerald-400 border-emerald-100 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 ${className || ''}`}
    >
      {t('excel_export' as any)}
    </ActionButton>
  );
}
