"use client";

import React from "react";
import { ActionButton } from "./ActionButton";
import { useLanguage } from "@/components/Providers";

const RapInsertIcon = ({ className, style, ...props }: React.ComponentProps<"svg">) => (
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
    {/* Green plus badge */}
    <circle cx="17.5" cy="17.5" r="4.5" fill="#16a34a" stroke="#ffffff" strokeWidth="1" />
    <path d="M17.5 15v5M15 17.5h5" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export function RapInsertButton({
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
  const defaultLabel = "ثبت در دریافت و پرداخت";
  const defaultTooltip = "ثبت اطلاعات در نرم‌افزار دریافت و پرداخت بر اساس فرم جاری";

  return (
    <ActionButton
      onClick={onClick}
      disabled={disabled}
      icon={RapInsertIcon}
      variant="ghost"
      tooltip={tooltip || (t('rap_insert' as any) || defaultTooltip)}
      tooltipPosition={tooltipPosition}
      hideLabel={hideLabel}
      style={{ height: '30px', padding: hideLabel ? 0 : '0 10px' }}
      className={`!bg-[#0d9488] !text-white hover:!bg-[#0f766e] dark:!bg-[#0d9488] dark:hover:!bg-[#0f766e] border-none rounded-md shadow-sm ${className || ''}`}
    >
      {defaultLabel}
    </ActionButton>
  );
}
