"use client";

import React from "react";
import { ActionButton } from "./ActionButton";
import { useLanguage } from "@/components/Providers";
import { TrashNewIcon } from "@/components/icons/TrashNewIcon";

export function DeleteAndNewButton({ 
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
  
  const CustomDeleteNewIcon = ({ className }: { className?: string }) => (
    <TrashNewIcon className={className} style={{ width: '1.35rem', height: '1.35rem', margin: 0, padding: 0 }} />
  );

  return (
    <ActionButton 
      onClick={onClick} 
      disabled={disabled} 
      icon={CustomDeleteNewIcon} 
      variant="ghost" 
      tooltip={tooltip || t('delete_and_new' as any) || 'حذف و جدید'} 
      tooltipPosition={tooltipPosition}
      hideLabel={hideLabel}
      style={{ height: '30px', padding: hideLabel ? 0 : '0 10px' }}
      className="!bg-rose-600 !text-white hover:!bg-rose-700 dark:!bg-rose-700 dark:hover:!bg-rose-800 border-none rounded-md shadow-sm"
    >
      {t('delete_and_new' as any) || 'حذف و جدید'}
    </ActionButton>
  );
}

