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

const SavePlusIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} style={{ width: '1.35rem', height: '1.35rem', margin: 0, padding: 0 }}>
    <SaveBase />
    <path d="M13 13h8v9h-8z" fill="#fff" stroke="#475569" strokeWidth="1" strokeLinejoin="round"/>
    <path d="M18 13l3 3h-3v-3z" fill="#cbd5e1" stroke="#475569" strokeWidth="1" strokeLinejoin="round"/>
  </svg>
);

export function SaveNewButton({ onClick, disabled, hideLabel }: { onClick?: () => void; disabled?: boolean; hideLabel?: boolean }) {
  const { t } = useLanguage();
  return (
    <ActionButton 
      onClick={onClick} 
      disabled={disabled} 
      icon={SavePlusIcon} 
      variant="success" 
      tooltip={t('save_new' as any) || 'ذخیره جدید'} 
      hideLabel={hideLabel}
      style={{ height: '30px', padding: hideLabel ? 0 : '0 10px' }}
    >
      {t('save_new' as any) || 'ذخیره جدید'}
    </ActionButton>
  );
}
