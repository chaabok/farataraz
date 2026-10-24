"use client";

import React from "react";
import { ActionButton } from "./ActionButton";
import { useLanguage } from "@/components/Providers";

const RapDeleteIcon = ({ className, style, ...props }: React.ComponentProps<"svg">) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    style={{ width: '1.35rem', height: '1.35rem', margin: 0, padding: 0, ...style }}
    {...props}
  >
    {/* Receipt / Document / Cash base */}
    <rect x="3" y="3" width="13" height="17" rx="1.5" fill="#fee2e2" stroke="#b91c1c" strokeWidth="1.2" />
    <path d="M6 7h7M6 10h5" stroke="#dc2626" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M6 14h3" stroke="#dc2626" strokeWidth="1.2" strokeLinecap="round" />
    {/* Coins / Money emblem */}
    <circle cx="12" cy="14" r="2.5" fill="#facc15" stroke="#a16207" strokeWidth="0.8" />
    {/* Red cross delete badge */}
    <circle cx="17.5" cy="17.5" r="4.5" fill="#dc2626" stroke="#ffffff" strokeWidth="1" />
    <path d="M15.5 15.5l4 4M19.5 15.5l-4 4" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export function RapDeleteButton({
  onClick,
  disabled,
  hideLabel = true,
  tooltip,
  tooltipPosition = 'bottom',
  className,
}: {
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  hideLabel?: boolean;
  tooltip?: string;
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}) {
  const { t } = useLanguage();
  const defaultLabel = "حذف از دریافت و پرداخت";
  const defaultTooltip = "حذف اطلاعات ثبت‌شده از نرم‌افزار دریافت و پرداخت";

  return (
    <ActionButton
      onClick={onClick}
      disabled={disabled}
      icon={RapDeleteIcon}
      variant="ghost"
      tooltip={tooltip || (t('rap_delete' as any) || defaultTooltip)}
      tooltipPosition={tooltipPosition}
      hideLabel={hideLabel}
      style={{ height: '30px', padding: hideLabel ? 0 : '0 10px' }}
      className={`!bg-[#be123c] !text-white hover:!bg-[#9f1239] dark:!bg-[#be123c] dark:hover:!bg-[#9f1239] border-none rounded-md shadow-sm ${className || ''}`}
    >
      {defaultLabel}
    </ActionButton>
  );
}
