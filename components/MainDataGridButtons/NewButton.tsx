"use client";

import React from "react";
import { ActionButton } from "@/components/buttons/ActionButton";
import { useLanguage } from "@/components/Providers";

const NewFileIcon = ({ className, ...props }: React.ComponentProps<"svg">) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    {...props}
  >
    <path d="M6 3h8l5 5v13H6V3z" fill="#fff" stroke="#475569" strokeWidth="1" strokeLinejoin="round"/>
    <path d="M14 3v5h5" fill="#f1f5f9" stroke="#475569" strokeWidth="1" strokeLinejoin="round"/>
    <path d="M13 16h6M16 13v6" stroke="#4ade80" strokeWidth="3" strokeLinecap="round"/>
  </svg>
);

export function NewButton({ 
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
      icon={NewFileIcon} 
      variant="primary" 
      tooltip={t('new_tooltip' as any)} 
      tooltipPosition={tooltipPosition}
      hideLabel={hideLabel}
    >
      {(t('new' as any) as string) || 'جدید'}
    </ActionButton>
  );
}
