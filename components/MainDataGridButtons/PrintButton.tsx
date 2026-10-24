"use client";

import React from "react";
import { Printer } from "lucide-react";
import { ActionButton } from "@/components/buttons/ActionButton";
import { useLanguage } from "@/components/Providers";

export function PrintButton({ 
  onClick, 
  disabled, 
  hideLabel,
  tooltipPosition = 'top'
}: { 
  onClick?: () => void; 
  disabled?: boolean; 
  hideLabel?: boolean;
  tooltipPosition?: 'top' | 'bottom';
}) {
  const { t } = useLanguage();
  return (
    <ActionButton 
      onClick={onClick} 
      disabled={disabled} 
      icon={Printer} 
      variant="outline" 
      tooltip={t('print_tooltip' as any)} 
      tooltipPosition={tooltipPosition}
      hideLabel={hideLabel}
    >
      {(t('print' as any) as string) || 'چاپ'}
    </ActionButton>
  );
}
