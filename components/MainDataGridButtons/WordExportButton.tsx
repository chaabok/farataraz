"use client";

import React from "react";
import { FileText } from "lucide-react";
import { ActionButton } from "@/components/buttons/ActionButton";
import { useLanguage } from "@/components/Providers";

export function WordExportButton({ 
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
      tooltip={t('word_export_tooltip' as any)} 
      tooltipPosition={tooltipPosition}
      hideLabel={hideLabel}
      className={`text-blue-600 dark:text-blue-400 border-blue-100 hover:bg-blue-50 dark:hover:bg-blue-900/20 ${className || ''}`}
    >
      {t('word_export' as any)}
    </ActionButton>
  );
}
