"use client";

import React from "react";
import { Edit } from "lucide-react";
import { ActionButton } from "@/components/buttons/ActionButton";
import { useLanguage } from "@/components/Providers";

export function EditButton({ 
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
      icon={Edit} 
      variant="outline" 
      tooltip={t('edit_tooltip' as any)} 
      tooltipPosition={tooltipPosition}
      hideLabel={hideLabel}
      className="text-amber-500 dark:text-amber-400 border-amber-200 dark:border-amber-900/50 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-md"
    >
      {t('edit' as any)}
    </ActionButton>
  );
}
