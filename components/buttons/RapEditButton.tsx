"use client";

import React from "react";
import { ActionButton } from "./ActionButton";
import { useLanguage } from "@/components/Providers";

const RapEditIcon = ({ className, style, ...props }: React.ComponentProps<"svg">) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    style={{ width: '1.35rem', height: '1.35rem', margin: 0, padding: 0, ...style }}
    {...props}
  >
    {/* Receipt / Document / Cash base */}
    <rect x="3" y="3" width="13" height="17" rx="1.5" fill="#e0f2fe" stroke="#0369a1" strokeWidth="1.2" />
    <path d="M6 7h7M6 10h5" stroke="#0284c7" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M6 14h3" stroke="#0284c7" strokeWidth="1.2" strokeLinecap="round" />
    {/* Coins / Money emblem */}
    <circle cx="12" cy="14" r="2.5" fill="#facc15" stroke="#a16207" strokeWidth="0.8" />
    {/* Pencil edit badge */}
    <circle cx="17.5" cy="17.5" r="4.5" fill="#0284c7" stroke="#ffffff" strokeWidth="1" />
    <path d="M19 14.5l-3 3-1 1.5 1.5-1 3-3a1 1 0 0 0-0.5-1.5z" fill="#ffffff" />
  </svg>
);

export function RapEditButton({
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
  const defaultLabel = "ویرایش در دریافت و پرداخت";
  const defaultTooltip = "ویرایش اطلاعات ثبت‌شده در نرم‌افزار دریافت و پرداخت";

  return (
    <ActionButton
      onClick={onClick}
      disabled={disabled}
      icon={RapEditIcon}
      variant="ghost"
      tooltip={tooltip || (t('rap_edit' as any) || defaultTooltip)}
      tooltipPosition={tooltipPosition}
      hideLabel={hideLabel}
      style={{ height: '30px', padding: hideLabel ? 0 : '0 10px' }}
      className={`!bg-[#2563eb] !text-white hover:!bg-[#1d4ed8] dark:!bg-[#2563eb] dark:hover:!bg-[#1d4ed8] border-none rounded-md shadow-sm ${className || ''}`}
    >
      {defaultLabel}
    </ActionButton>
  );
}
