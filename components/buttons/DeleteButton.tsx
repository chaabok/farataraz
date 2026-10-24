"use client";

import React from "react";
import { ActionButton } from "./ActionButton";
import { useLanguage } from "@/components/Providers";
import { TrashCrossIcon } from "@/components/icons/TrashCrossIcon";

export function DeleteButton({ 
  onClick, 
  disabled, 
  hideLabel,
  tooltip,
  tooltipPosition = 'bottom'
}: { 
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void; 
  disabled?: boolean; 
  hideLabel?: boolean;
  tooltip?: string;
  tooltipPosition?: 'top' | 'bottom';
}) {
  const { t } = useLanguage();
  
  const CustomDeleteIcon = ({ className }: { className?: string }) => (
    <TrashCrossIcon className={className} style={{ width: '1.35rem', height: '1.35rem', margin: 0, padding: 0 }} />
  );

  return (
    <ActionButton 
      onClick={onClick} 
      disabled={disabled} 
      icon={CustomDeleteIcon} 
      variant="ghost" 
      tooltip={tooltip || t('delete_close' as any) || 'حذف و بستن'} 
      tooltipPosition={tooltipPosition}
      hideLabel={hideLabel}
      style={{ height: '30px', padding: hideLabel ? 0 : '0 10px' }}
      className="!bg-rose-600 !text-white hover:!bg-rose-700 dark:!bg-rose-700 dark:hover:!bg-rose-800 border-none rounded-md shadow-sm"
    >
      {t('delete_close' as any) || 'حذف و بستن'}
    </ActionButton>
  );
}
