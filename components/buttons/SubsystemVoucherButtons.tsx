"use client";

import React from "react";
import { ActionButton } from "./ActionButton";
import { useLanguage } from "@/components/Providers";

/* -------------------------------------------------------------------------- */
/*                               SVG ICONS                                    */
/* -------------------------------------------------------------------------- */

/**
 * 1- صدور سند حسابداری از زیرسیستم (Issue Subsystem Voucher)
 * Designed for subsystem documents (like warehouse receipts/issues) converting into an accounting voucher.
 * Features: Accounting voucher sheet with ledger rows, 3D subsystem goods/box icon, and dynamic issuance arrow.
 */
export const SubsystemVoucherIssueIcon = ({
  className,
  style,
  ...props
}: React.ComponentProps<"svg">) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    style={{ width: "1.35rem", height: "1.35rem", margin: 0, padding: 0, ...style }}
    {...props}
  >
    {/* Accounting Voucher Sheet */}
    <path
      d="M3.5 3.5C3.5 2.67 4.17 2 5 2H12.5L17.5 7V20.5C17.5 21.33 16.83 22 16 22H5C4.17 22 3.5 21.33 3.5 20.5V3.5Z"
      fill="#f8fafc"
      stroke="#1e293b"
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
    {/* Folded Corner */}
    <path
      d="M12.5 2V7H17.5"
      fill="#cbd5e1"
      stroke="#1e293b"
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
    {/* Ledger lines */}
    <path d="M6 7H10" stroke="#475569" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M6 10.5H14.5" stroke="#94a3b8" strokeWidth="1.1" strokeLinecap="round" />
    <path d="M6 13.5H11.5" stroke="#94a3b8" strokeWidth="1.1" strokeLinecap="round" />

    {/* Subsystem / Warehouse Box (Isometric Cube) */}
    <path
      d="M14.5 12.8L18 11L21.5 12.8L18 14.6L14.5 12.8Z"
      fill="#f59e0b"
      stroke="#78350f"
      strokeWidth="0.8"
      strokeLinejoin="round"
    />
    <path
      d="M14.5 12.8V16.8L18 18.6V14.6L14.5 12.8Z"
      fill="#d97706"
      stroke="#78350f"
      strokeWidth="0.8"
      strokeLinejoin="round"
    />
    <path
      d="M18 14.6V18.6L21.5 16.8V12.8L18 14.6Z"
      fill="#b45309"
      stroke="#78350f"
      strokeWidth="0.8"
      strokeLinejoin="round"
    />

    {/* Issuance Green Action Badge with Forward Arrow */}
    <circle cx="7.5" cy="18" r="4.2" fill="#16a34a" stroke="#ffffff" strokeWidth="1.2" />
    <path
      d="M5.8 18H9.2M7.8 16.2L9.6 18L7.8 19.8"
      stroke="#ffffff"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * 2- مشاهده سند حسابداری (View Subsystem Voucher)
 * Features: Accounting voucher sheet with ledger columns, subsystem tag, and an optical inspection eye/lens.
 */
export const SubsystemVoucherViewIcon = ({
  className,
  style,
  ...props
}: React.ComponentProps<"svg">) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    style={{ width: "1.35rem", height: "1.35rem", margin: 0, padding: 0, ...style }}
    {...props}
  >
    {/* Accounting Voucher Sheet */}
    <path
      d="M3.5 3.5C3.5 2.67 4.17 2 5 2H12.5L17.5 7V20.5C17.5 21.33 16.83 22 16 22H5C4.17 22 3.5 21.33 3.5 20.5V3.5Z"
      fill="#f8fafc"
      stroke="#1e293b"
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
    {/* Folded Corner */}
    <path
      d="M12.5 2V7H17.5"
      fill="#cbd5e1"
      stroke="#1e293b"
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
    {/* Ledger lines */}
    <path d="M6 7H10" stroke="#475569" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M6 10.5H14.5" stroke="#94a3b8" strokeWidth="1.1" strokeLinecap="round" />
    <path d="M6 13.5H11" stroke="#94a3b8" strokeWidth="1.1" strokeLinecap="round" />
    <path d="M6 16.5H10" stroke="#94a3b8" strokeWidth="1.1" strokeLinecap="round" />

    {/* Subsystem Reference Tag */}
    <rect x="13.2" y="9.8" width="3.8" height="3.2" rx="0.6" fill="#fef3c7" stroke="#d97706" strokeWidth="0.8" />
    <path d="M14.5 11.4H15.8" stroke="#b45309" strokeWidth="0.8" strokeLinecap="round" />

    {/* View Lens Badge in Sky Blue */}
    <circle cx="16" cy="16.8" r="4.8" fill="#0284c7" stroke="#ffffff" strokeWidth="1.2" />
    {/* Eye inside badge */}
    <path
      d="M13 16.8C13 16.8 14.2 14.8 16 14.8C17.8 14.8 19 16.8 19 16.8C19 16.8 17.8 18.8 16 18.8C14.2 18.8 13 16.8 13 16.8Z"
      fill="#ffffff"
    />
    <circle cx="16" cy="16.8" r="1.3" fill="#0369a1" />
  </svg>
);

/**
 * 3- ویرایش سند حسابداری (Edit Subsystem Voucher)
 * Features: Accounting voucher sheet with ledger lines and a precision emerald/teal editing pencil badge.
 */
export const SubsystemVoucherEditIcon = ({
  className,
  style,
  ...props
}: React.ComponentProps<"svg">) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    style={{ width: "1.35rem", height: "1.35rem", margin: 0, padding: 0, ...style }}
    {...props}
  >
    {/* Accounting Voucher Sheet */}
    <path
      d="M3.5 3.5C3.5 2.67 4.17 2 5 2H12.5L17.5 7V20.5C17.5 21.33 16.83 22 16 22H5C4.17 22 3.5 21.33 3.5 20.5V3.5Z"
      fill="#f8fafc"
      stroke="#1e293b"
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
    {/* Folded Corner */}
    <path
      d="M12.5 2V7H17.5"
      fill="#cbd5e1"
      stroke="#1e293b"
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
    {/* Ledger lines */}
    <path d="M6 7H10" stroke="#475569" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M6 10.5H14.5" stroke="#94a3b8" strokeWidth="1.1" strokeLinecap="round" />
    <path d="M6 13.5H11" stroke="#94a3b8" strokeWidth="1.1" strokeLinecap="round" />
    <path d="M6 16.5H9.5" stroke="#94a3b8" strokeWidth="1.1" strokeLinecap="round" />

    {/* Edit Badge in Emerald Green */}
    <circle cx="16" cy="16.8" r="4.8" fill="#059669" stroke="#ffffff" strokeWidth="1.2" />
    {/* Pencil inside badge */}
    <path
      d="M17.8 14.2C18.1 13.9 18.1 13.4 17.8 13.1C17.5 12.8 17 12.8 16.7 13.1L13.8 16.1L13.5 17.8L15.2 17.5L17.8 14.2Z"
      fill="#ffffff"
    />
    <path d="M16.1 13.8L17.3 15" stroke="#059669" strokeWidth="0.6" strokeLinecap="round" />
  </svg>
);

/**
 * 4- حذف سند حسابداری (Delete Subsystem Voucher)
 * Features: Accounting voucher sheet tinted with subtle red warning and a bold crimson delete cross badge.
 */
export const SubsystemVoucherDeleteIcon = ({
  className,
  style,
  ...props
}: React.ComponentProps<"svg">) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    style={{ width: "1.35rem", height: "1.35rem", margin: 0, padding: 0, ...style }}
    {...props}
  >
    {/* Accounting Voucher Sheet with soft red tint */}
    <path
      d="M3.5 3.5C3.5 2.67 4.17 2 5 2H12.5L17.5 7V20.5C17.5 21.33 16.83 22 16 22H5C4.17 22 3.5 21.33 3.5 20.5V3.5Z"
      fill="#fef2f2"
      stroke="#b91c1c"
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
    {/* Folded Corner */}
    <path
      d="M12.5 2V7H17.5"
      fill="#fecaca"
      stroke="#b91c1c"
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
    {/* Ledger lines in soft red */}
    <path d="M6 7H10" stroke="#dc2626" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M6 10.5H13" stroke="#f87171" strokeWidth="1.1" strokeLinecap="round" />
    <path d="M6 13.5H11" stroke="#f87171" strokeWidth="1.1" strokeLinecap="round" />

    {/* Delete Cross Badge in Crimson Red */}
    <circle cx="16" cy="16.8" r="4.8" fill="#dc2626" stroke="#ffffff" strokeWidth="1.2" />
    {/* Cross X inside badge */}
    <path
      d="M14.3 15.1L17.7 18.5M17.7 15.1L14.3 18.5"
      stroke="#ffffff"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

/* -------------------------------------------------------------------------- */
/*                               TYPES & CONFIGS                              */
/* -------------------------------------------------------------------------- */

export type SubsystemVoucherActionType = "issue" | "view" | "edit" | "delete";

export interface SubsystemVoucherActionConfig {
  icon: React.ElementType;
  label: string;
  tooltip: string;
  className: string;
}

export function getSubsystemVoucherActionConfig(
  action: SubsystemVoucherActionType,
  t?: (key: any) => string
): SubsystemVoucherActionConfig {
  switch (action) {
    case "issue":
      return {
        icon: SubsystemVoucherIssueIcon,
        label: t?.("voucher_insert" as any) || "صدور سند حسابداری",
        tooltip: "صدور سند حسابداری از زیرسیستم",
        className:
          "!bg-[#1e40af] !text-white hover:!bg-[#1d4ed8] dark:!bg-[#1e40af] dark:hover:!bg-[#1d4ed8]",
      };
    case "view":
      return {
        icon: SubsystemVoucherViewIcon,
        label: t?.("voucher_view" as any) || "مشاهده سند حسابداری",
        tooltip: "مشاهده سند حسابداری مرتبط",
        className:
          "!bg-[#0284c7] !text-white hover:!bg-[#0369a1] dark:!bg-[#0284c7] dark:hover:!bg-[#0369a1]",
      };
    case "edit":
      return {
        icon: SubsystemVoucherEditIcon,
        label: t?.("voucher_edit" as any) || "ویرایش سند حسابداری",
        tooltip: "ویرایش سند حسابداری مرتبط",
        className:
          "!bg-[#059669] !text-white hover:!bg-[#047857] dark:!bg-[#059669] dark:hover:!bg-[#047857]",
      };
    case "delete":
      return {
        icon: SubsystemVoucherDeleteIcon,
        label: t?.("voucher_delete" as any) || "حذف سند حسابداری",
        tooltip: "حذف سند حسابداری مرتبط",
        className:
          "!bg-[#be123c] !text-white hover:!bg-[#9f1239] dark:!bg-[#be123c] dark:hover:!bg-[#9f1239]",
      };
    default:
      return {
        icon: () => null,
        label: "",
        tooltip: "",
        className: "",
      };
  }
}

/* -------------------------------------------------------------------------- */
/*                       INDIVIDUAL ACTION BUTTONS                            */
/* -------------------------------------------------------------------------- */

interface BaseButtonProps {
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  hideLabel?: boolean;
  tooltip?: string;
  tooltipPosition?: "top" | "bottom" | "left" | "right";
  className?: string;
}

export function SubsystemVoucherIssueButton({
  onClick,
  disabled,
  hideLabel = true,
  tooltip,
  tooltipPosition = "bottom",
  className,
}: BaseButtonProps) {
  const { t } = useLanguage();
  const config = getSubsystemVoucherActionConfig("issue", t);

  return (
    <ActionButton
      onClick={onClick}
      disabled={disabled}
      icon={config.icon}
      variant="ghost"
      tooltip={tooltip || config.tooltip}
      tooltipPosition={tooltipPosition}
      hideLabel={hideLabel}
      style={{ height: "30px", padding: hideLabel ? 0 : "0 10px" }}
      className={`${config.className} border-none rounded-md shadow-sm ${className || ""}`}
    >
      {config.label}
    </ActionButton>
  );
}

export function SubsystemVoucherViewButton({
  onClick,
  disabled,
  hideLabel = true,
  tooltip,
  tooltipPosition = "bottom",
  className,
}: BaseButtonProps) {
  const { t } = useLanguage();
  const config = getSubsystemVoucherActionConfig("view", t);

  return (
    <ActionButton
      onClick={onClick}
      disabled={disabled}
      icon={config.icon}
      variant="ghost"
      tooltip={tooltip || config.tooltip}
      tooltipPosition={tooltipPosition}
      hideLabel={hideLabel}
      style={{ height: "30px", padding: hideLabel ? 0 : "0 10px" }}
      className={`${config.className} border-none rounded-md shadow-sm ${className || ""}`}
    >
      {config.label}
    </ActionButton>
  );
}

export function SubsystemVoucherEditButton({
  onClick,
  disabled,
  hideLabel = true,
  tooltip,
  tooltipPosition = "bottom",
  className,
}: BaseButtonProps) {
  const { t } = useLanguage();
  const config = getSubsystemVoucherActionConfig("edit", t);

  return (
    <ActionButton
      onClick={onClick}
      disabled={disabled}
      icon={config.icon}
      variant="ghost"
      tooltip={tooltip || config.tooltip}
      tooltipPosition={tooltipPosition}
      hideLabel={hideLabel}
      style={{ height: "30px", padding: hideLabel ? 0 : "0 10px" }}
      className={`${config.className} border-none rounded-md shadow-sm ${className || ""}`}
    >
      {config.label}
    </ActionButton>
  );
}

export function SubsystemVoucherDeleteButton({
  onClick,
  disabled,
  hideLabel = true,
  tooltip,
  tooltipPosition = "bottom",
  className,
}: BaseButtonProps) {
  const { t } = useLanguage();
  const config = getSubsystemVoucherActionConfig("delete", t);

  return (
    <ActionButton
      onClick={onClick}
      disabled={disabled}
      icon={config.icon}
      variant="ghost"
      tooltip={tooltip || config.tooltip}
      tooltipPosition={tooltipPosition}
      hideLabel={hideLabel}
      style={{ height: "30px", padding: hideLabel ? 0 : "0 10px" }}
      className={`${config.className} border-none rounded-md shadow-sm ${className || ""}`}
    >
      {config.label}
    </ActionButton>
  );
}

/* -------------------------------------------------------------------------- */
/*                       MAIN COMBINED COMPONENT                              */
/* -------------------------------------------------------------------------- */

export interface SubsystemVoucherButtonsProps {
  // Usage Mode 1: Unified 4-button toolbar
  onIssue?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onView?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onEdit?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onDelete?: (e: React.MouseEvent<HTMLButtonElement>) => void;

  disabledIssue?: boolean;
  disabledView?: boolean;
  disabledEdit?: boolean;
  disabledDelete?: boolean;

  hideIssue?: boolean;
  hideView?: boolean;
  hideEdit?: boolean;
  hideDelete?: boolean;

  // Usage Mode 2: Single action button mode (compatible with VoucherActionButtons)
  action?: SubsystemVoucherActionType;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;

  // Shared display settings
  hideLabel?: boolean;
  tooltipPosition?: "top" | "bottom" | "left" | "right";
  className?: string;
}

/**
 * کامپوننت صدور سند حسابداری از زیرسیستم‌ها (همانند انبار)
 * شامل ۴ آیکون و دکمه اختصاصی:
 * ۱- صدور سند حسابداری
 * ۲- مشاهده سند حسابداری
 * ۳- ویرایش سند حسابداری
 * ۴- حذف سند حسابداری
 */
export function SubsystemVoucherButtons({
  // Mode 1 props
  onIssue,
  onView,
  onEdit,
  onDelete,
  disabledIssue,
  disabledView,
  disabledEdit,
  disabledDelete,
  hideIssue = false,
  hideView = false,
  hideEdit = false,
  hideDelete = false,

  // Mode 2 props
  action,
  onClick,
  disabled,

  // Shared props
  hideLabel = true,
  tooltipPosition = "bottom",
  className,
}: SubsystemVoucherButtonsProps) {
  const { t } = useLanguage();

  // If used as a single action button (e.g. <SubsystemVoucherButtons action="issue" onClick={...} />)
  if (action) {
    const config = getSubsystemVoucherActionConfig(action, t);
    return (
      <ActionButton
        onClick={onClick}
        disabled={disabled}
        icon={config.icon}
        variant="ghost"
        tooltip={config.tooltip}
        tooltipPosition={tooltipPosition}
        hideLabel={hideLabel}
        style={{ height: "30px", padding: hideLabel ? 0 : "0 10px" }}
        className={`${config.className} border-none rounded-md shadow-sm ${className || ""}`}
      >
        {config.label}
      </ActionButton>
    );
  }

  // Default mode: Renders the group of 4 icons/buttons side-by-side
  return (
    <div
      className={`inline-flex items-center gap-1.5 ${className || ""}`}
      dir="rtl"
    >
      {!hideIssue && (
        <SubsystemVoucherIssueButton
          onClick={onIssue}
          disabled={disabledIssue}
          hideLabel={hideLabel}
          tooltipPosition={tooltipPosition}
        />
      )}

      {!hideView && (
        <SubsystemVoucherViewButton
          onClick={onView}
          disabled={disabledView}
          hideLabel={hideLabel}
          tooltipPosition={tooltipPosition}
        />
      )}

      {!hideEdit && (
        <SubsystemVoucherEditButton
          onClick={onEdit}
          disabled={disabledEdit}
          hideLabel={hideLabel}
          tooltipPosition={tooltipPosition}
        />
      )}

      {!hideDelete && (
        <SubsystemVoucherDeleteButton
          onClick={onDelete}
          disabled={disabledDelete}
          hideLabel={hideLabel}
          tooltipPosition={tooltipPosition}
        />
      )}
    </div>
  );
}

export default SubsystemVoucherButtons;
