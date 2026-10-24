"use client";

import React from "react";
import { ActionButton } from "./ActionButton";
import { useLanguage } from "@/components/Providers";

const VoucherInsertIcon = ({ className, style, ...props }: React.ComponentProps<"svg">) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    style={{ width: '1.35rem', height: '1.35rem', margin: 0, padding: 0, ...style }}
    {...props}
  >
    {/* File shape */}
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="#d1d5db" stroke="#111827" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M14 2v6h6" fill="#9ca3af" stroke="#111827" strokeWidth="1.5" strokeLinejoin="round" />
    {/* Green block arrow pointing to the right */}
    <path d="M11 14.5H16V12L21.5 15.5L16 19V16.5H11V14.5Z" fill="#16a34a" stroke="#111827" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const VoucherDeleteIcon = ({ className, style, ...props }: React.ComponentProps<"svg">) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    style={{ width: '1.35rem', height: '1.35rem', margin: 0, padding: 0, ...style }}
    {...props}
  >
    {/* Trash bin shape */}
    <path d="M3 6h18" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" fill="#6b7280" stroke="#111827" strokeWidth="1.5" strokeLinejoin="round"/>
    <path d="M10 11v6M14 11v6" stroke="#111827" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    {/* Red Cross */}
    <path d="M14 14l6 6m0-6l-6 6" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const VoucherViewIcon = ({ className, style, ...props }: React.ComponentProps<"svg">) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    style={{ width: '1.35rem', height: '1.35rem', margin: 0, padding: 0, ...style }}
    {...props}
  >
    {/* File shape */}
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="#d1d5db" stroke="#111827" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M14 2v6h6" fill="#9ca3af" stroke="#111827" strokeWidth="1.5" strokeLinejoin="round" />
    {/* Eye shape */}
    <path d="M6 15c0 0 3-4 6-4s6 4 6 4-3 4-6 4-6-4-6-4z" fill="#3b82f6" stroke="#111827" strokeWidth="1.5" strokeLinejoin="round" />
    <circle cx="12" cy="15" r="2" fill="#111827" />
  </svg>
);

const VoucherEditIcon = ({ className, style, ...props }: React.ComponentProps<"svg">) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    style={{ width: '1.35rem', height: '1.35rem', margin: 0, padding: 0, ...style }}
    {...props}
  >
    {/* File shape */}
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="#d1d5db" stroke="#111827" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M14 2v6h6" fill="#9ca3af" stroke="#111827" strokeWidth="1.5" strokeLinejoin="round" />
    {/* Pencil shape */}
    <path d="M17 11l-7 7-3 1 1-3 7-7a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83z" fill="#2563eb" stroke="#111827" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export type VoucherActionType = 'insert' | 'delete' | 'view' | 'edit';

export function VoucherActionButtons({
  action,
  onClick,
  disabled,
  hideLabel = true,
  tooltipPosition = 'bottom',
  className
}: {
  action: VoucherActionType;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  hideLabel?: boolean;
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}) {
  const { t } = useLanguage();

  const getProps = () => {
    switch(action) {
      case 'insert':
        return {
          icon: VoucherInsertIcon,
          tooltip: t('voucher_insert' as any) || 'صدور سند حسابداری',
          label: t('voucher_insert' as any) || 'صدور سند حسابداری',
          className: '!bg-[#2253a3] !text-white hover:!bg-[#1d4689] dark:!bg-[#2253a3] dark:hover:!bg-[#1d4689]'
        };
      case 'delete':
        return {
          icon: VoucherDeleteIcon,
          tooltip: t('voucher_delete' as any) || 'حذف سند',
          label: t('voucher_delete' as any) || 'حذف سند',
          className: '!bg-[#7d1021] !text-white hover:!bg-[#630c1a] dark:!bg-[#7d1021] dark:hover:!bg-[#630c1a]'
        };
      case 'view':
        return {
          icon: VoucherViewIcon,
          tooltip: t('voucher_view' as any) || 'مشاهده سند حسابداری',
          label: t('voucher_view' as any) || 'مشاهده سند حسابداری',
          className: '!bg-[#1198aa] !text-white hover:!bg-[#0e7f8e] dark:!bg-[#1198aa] dark:hover:!bg-[#0e7f8e]'
        };
      case 'edit':
        return {
          icon: VoucherEditIcon,
          tooltip: t('voucher_edit' as any) || 'ویرایش سند حسابداری',
          label: t('voucher_edit' as any) || 'ویرایش سند حسابداری',
          className: '!bg-[#0f8e53] !text-white hover:!bg-[#0b7041] dark:!bg-[#0f8e53] dark:hover:!bg-[#0b7041]'
        };
      default:
        return {
          icon: () => null,
          tooltip: '',
          label: '',
          className: ''
        };
    }
  }

  const props = getProps();

  return (
    <ActionButton
      onClick={onClick}
      disabled={disabled}
      icon={props.icon}
      variant="ghost"
      tooltip={props.tooltip}
      tooltipPosition={tooltipPosition}
      hideLabel={hideLabel}
      style={{ height: '30px', padding: hideLabel ? 0 : '0 10px' }}
      className={`${props.className} border-none rounded-md shadow-sm ${className || ''}`}
    >
      {props.label}
    </ActionButton>
  );
}

