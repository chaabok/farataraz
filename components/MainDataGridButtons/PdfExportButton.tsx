"use client";

import React from "react";
import { FileText } from "lucide-react";
import { ActionButton } from "@/components/buttons/ActionButton";
import { useLanguage } from "@/components/Providers";

export function PdfExportButton({ 
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
      icon={FileText} 
      variant="outline" 
      tooltip={t('pdf_export_tooltip' as any)} 
      tooltipPosition={tooltipPosition}
      hideLabel={hideLabel}
      className={`text-rose-600 dark:text-rose-400 border-rose-100 hover:bg-rose-50 dark:hover:bg-rose-900/20 ${className || ''}`}
    >
      {t('pdf_export' as any)}
    </ActionButton>
  );
}
