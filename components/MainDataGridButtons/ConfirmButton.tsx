"use client";

import React from "react";
import { Check } from "lucide-react";
import { ActionButton } from "@/components/buttons/ActionButton";
import { useLanguage } from "@/components/Providers";

export function ConfirmButton({ 
  onClick, 
  disabled, 
  hideLabel, 
  tooltipPosition = 'top' 
}: { 
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void; 
  disabled?: boolean; 
  hideLabel?: boolean;
  tooltipPosition?: 'top' | 'bottom';
}) {
  const { t } = useLanguage();
  
  return (
    <ActionButton 
      onClick={onClick} 
      disabled={disabled} 
      icon={Check} 
      variant="ghost" 
      tooltip={t('confirm' as any)} 
      tooltipPosition={tooltipPosition}
      hideLabel={hideLabel}
      className="text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md shadow-none"
    >
      {t('confirm' as any)}
    </ActionButton>
  );
}
