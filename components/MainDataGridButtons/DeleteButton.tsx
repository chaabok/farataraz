"use client";

import React from "react";
import { TrashCrossIcon } from "@/components/icons/TrashCrossIcon";
import { ActionButton } from "@/components/buttons/ActionButton";
import { useLanguage } from "@/components/Providers";

export function DeleteButton({ 
  onClick, 
  disabled, 
  hideLabel,
  tooltip,
  tooltipPosition = 'top'
}: { 
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void; 
  disabled?: boolean; 
  hideLabel?: boolean;
  tooltip?: string;
  tooltipPosition?: 'top' | 'bottom';
}) {
  const { t } = useLanguage();
  return (
    <ActionButton 
      onClick={onClick} 
      disabled={disabled} 
      icon={TrashCrossIcon} 
      variant="outline" 
      tooltip={tooltip || t('delete_tooltip' as any)} 
      tooltipPosition={tooltipPosition}
      hideLabel={hideLabel}
      className="text-rose-500 dark:text-rose-400 border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-md"
    >
      {t('delete' as any)}
    </ActionButton>
  );
}
