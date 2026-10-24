"use client";

import React from "react";
import { HelpCircle } from "lucide-react";
import { ActionButton } from "./ActionButton";
import { useLanguage } from "@/components/Providers";

export function HelpButton({ 
  onClick, 
  disabled, 
  hideLabel,
  className,
  variant = 'outline'
}: { 
  onClick?: () => void; 
  disabled?: boolean; 
  hideLabel?: boolean;
  className?: string;
  variant?: 'primary' | 'secondary' | 'success' | 'info' | 'outline' | 'ghost' | 'indigo';
}) {
  const { t } = useLanguage();
  return (
    <ActionButton 
      onClick={onClick} 
      disabled={disabled} 
      icon={HelpCircle} 
      variant={variant} 
      className={className}
      tooltip={t('help_tooltip' as any) || 'راهنما'} 
      hideLabel={hideLabel}
    >
      {t('help_tooltip' as any) || 'راهنما'}
    </ActionButton>
  );
}
