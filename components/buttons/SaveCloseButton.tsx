"use client";

import React from "react";
import { ActionButton } from "./ActionButton";
import { useLanguage } from "@/components/Providers";

const SaveBase = () => (
  <>
    <path d="M4 4h13l4 4v12H4V4z" fill="#5c6dc0" stroke="#1e265c" strokeWidth="1" strokeLinejoin="round"/>
    <rect x="7" y="4" width="10" height="6" fill="#cbd5e1" stroke="#1e265c" strokeWidth="1" strokeLinejoin="round"/>
    <rect x="5" y="13" width="14" height="7" fill="#fff" stroke="#1e265c" strokeWidth="1" strokeLinejoin="round"/>
    <rect x="14" y="5" width="2" height="4" fill="#64748b"/>
  </>
);

const SaveCloseIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} style={{ width: '1.35rem', height: '1.35rem', margin: 0, padding: 0 }}>
    <SaveBase />
    <rect x="13" y="13" width="9" height="9" rx="1.5" fill="#a45645" stroke="#1a1412" strokeWidth="1.5" strokeLinejoin="round"/>
    <path d="M15.5 15.5l4 4M19.5 15.5l-4 4" stroke="#1a1412" strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
);

export function SaveCloseButton({ onClick, disabled, hideLabel }: { onClick?: () => void; disabled?: boolean; hideLabel?: boolean }) {
  const { t } = useLanguage();
  return (
    <ActionButton 
      onClick={onClick} 
      disabled={disabled} 
      icon={SaveCloseIcon} 
      variant="info" 
      tooltip={t('save_close' as any) || 'ذخیره و بستن'} 
      hideLabel={hideLabel}
      style={{ height: '30px', padding: hideLabel ? 0 : '0 10px' }}
    >
      {t('save_close' as any) || 'ذخیره و بستن'}
    </ActionButton>
  );
}
