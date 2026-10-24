"use client";

import React, { useState } from "react";
import { ActionButton } from "./ActionButton";
import { useLanguage } from "@/components/Providers";
import { useToast } from "@/components/ToastProvider";
import { useTabs } from "@/components/TabsProvider";
import { StocktakingSurplusModal } from "@/components/forms/inv/StocktakingSurplusModal";
import { StocktakingShortageModal } from "@/components/forms/inv/StocktakingShortageModal";

/* -------------------------------------------------------------------------- */
/*                               SVG ICONS                                    */
/* -------------------------------------------------------------------------- */

/**
 * 1- آیکون صدور سند اضافات انبارگردانی (Issue Stocktaking Surplus Receipt)
 */
export const StocktakingSurplusVoucherIcon = ({
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
    {/* سند انبارداری / برگه */}
    <path
      d="M3.5 3.5C3.5 2.67 4.17 2 5 2H12.5L17.5 7V20.5C17.5 21.33 16.83 22 16 22H5C4.17 22 3.5 21.33 3.5 20.5V3.5Z"
      fill="#f8fafc"
      stroke="#1e293b"
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
    {/* گوشه تاخورده */}
    <path
      d="M12.5 2V7H17.5"
      fill="#cbd5e1"
      stroke="#1e293b"
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
    {/* خطوط سند */}
    <path d="M6 7H10" stroke="#475569" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M6 10.5H13" stroke="#94a3b8" strokeWidth="1.1" strokeLinecap="round" />
    <path d="M6 13.5H10" stroke="#94a3b8" strokeWidth="1.1" strokeLinecap="round" />

    {/* باکس انبار / کالا (ایزومتریک) */}
    <path
      d="M14.5 12.8L18 11L21.5 12.8L18 14.6L14.5 12.8Z"
      fill="#10b981"
      stroke="#065f46"
      strokeWidth="0.8"
      strokeLinejoin="round"
    />
    <path
      d="M14.5 12.8V16.8L18 18.6V14.6L14.5 12.8Z"
      fill="#059669"
      stroke="#065f46"
      strokeWidth="0.8"
      strokeLinejoin="round"
    />
    <path
      d="M18 14.6V18.6L21.5 16.8V12.8L18 14.6Z"
      fill="#047857"
      stroke="#065f46"
      strokeWidth="0.8"
      strokeLinejoin="round"
    />

    {/* نشان دایره‌ای سبز با علامت مثبت (+) بابت اضافات */}
    <circle cx="7.5" cy="18" r="4.2" fill="#16a34a" stroke="#ffffff" strokeWidth="1.2" />
    <path
      d="M5.5 18H9.5M7.5 16V20"
      stroke="#ffffff"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * 2- آیکون صدور سند کسری انبارگردانی (Issue Stocktaking Shortage Issue)
 */
export const StocktakingShortageVoucherIcon = ({
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
    {/* سند انبارداری / برگه */}
    <path
      d="M3.5 3.5C3.5 2.67 4.17 2 5 2H12.5L17.5 7V20.5C17.5 21.33 16.83 22 16 22H5C4.17 22 3.5 21.33 3.5 20.5V3.5Z"
      fill="#f8fafc"
      stroke="#1e293b"
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
    {/* گوشه تاخورده */}
    <path
      d="M12.5 2V7H17.5"
      fill="#cbd5e1"
      stroke="#1e293b"
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
    {/* خطوط سند */}
    <path d="M6 7H10" stroke="#475569" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M6 10.5H13" stroke="#94a3b8" strokeWidth="1.1" strokeLinecap="round" />
    <path d="M6 13.5H10" stroke="#94a3b8" strokeWidth="1.1" strokeLinecap="round" />

    {/* باکس انبار / کالا (ایزومتریک با تم سرخ) */}
    <path
      d="M14.5 12.8L18 11L21.5 12.8L18 14.6L14.5 12.8Z"
      fill="#ef4444"
      stroke="#991b1b"
      strokeWidth="0.8"
      strokeLinejoin="round"
    />
    <path
      d="M14.5 12.8V16.8L18 18.6V14.6L14.5 12.8Z"
      fill="#dc2626"
      stroke="#991b1b"
      strokeWidth="0.8"
      strokeLinejoin="round"
    />
    <path
      d="M18 14.6V18.6L21.5 16.8V12.8L18 14.6Z"
      fill="#b91c1c"
      stroke="#991b1b"
      strokeWidth="0.8"
      strokeLinejoin="round"
    />

    {/* نشان دایره‌ای قرمز با علامت منفی (-) بابت کسری */}
    <circle cx="7.5" cy="18" r="4.2" fill="#dc2626" stroke="#ffffff" strokeWidth="1.2" />
    <path
      d="M5.5 18H9.5"
      stroke="#ffffff"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/* -------------------------------------------------------------------------- */
/*                               BUTTON COMPONENTS                            */
/* -------------------------------------------------------------------------- */

export interface StocktakingDiscrepancyButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  hideLabel?: boolean;
  className?: string;
  tooltip?: string;
}

/**
 * دکمه صدور سند اضافات انبارگردانی
 */
export function StocktakingSurplusVoucherButton({
  onClick,
  disabled = false,
  hideLabel = true,
  className = "",
  tooltip,
}: StocktakingDiscrepancyButtonProps) {
  const { t } = useLanguage();
  const label = t("issueStocktakingSurplusVoucher" as any) || "صدور سند اضافات انبارگردانی";

  return (
    <ActionButton
      onClick={onClick}
      disabled={disabled}
      hideLabel={hideLabel}
      tooltip={tooltip || label}
      icon={StocktakingSurplusVoucherIcon}
      className={className}
    >
      {label}
    </ActionButton>
  );
}

/**
 * دکمه صدور سند کسری انبارگردانی
 */
export function StocktakingShortageVoucherButton({
  onClick,
  disabled = false,
  hideLabel = true,
  className = "",
  tooltip,
}: StocktakingDiscrepancyButtonProps) {
  const { t } = useLanguage();
  const label = t("issueStocktakingShortageVoucher" as any) || "صدور سند کسری انبارگردانی";

  return (
    <ActionButton
      onClick={onClick}
      disabled={disabled}
      hideLabel={hideLabel}
      tooltip={tooltip || label}
      icon={StocktakingShortageVoucherIcon}
      className={className}
    >
      {label}
    </ActionButton>
  );
}

export interface StocktakingDiscrepancyButtonsProps {
  stocktakingCountId?: number | string | null;
  tagHeaderId?: number | string | null;
  warehouseId?: number | string | null;
  isConfirmed?: boolean;
  isSaved?: boolean;
  countRound?: number | string | null;
  totalCountTimes?: number | string | null;
  hasFinalCountRegistered?: boolean;
  onIssueSurplus?: () => void;
  onIssueShortage?: () => void;
  className?: string;
}

/**
 * کامپوننت جامع آیکون‌های صدور سند کسری و اضافات انبارگردانی در اکشن بار
 */
export function StocktakingDiscrepancyButtons({
  stocktakingCountId,
  tagHeaderId,
  warehouseId,
  isConfirmed = false,
  isSaved = false,
  countRound = 1,
  totalCountTimes = 1,
  hasFinalCountRegistered,
  onIssueSurplus,
  onIssueShortage,
  className = "",
}: StocktakingDiscrepancyButtonsProps) {
  const { showToast } = useToast();
  const { addTab } = useTabs();
  const [internalSurplusModalOpen, setInternalSurplusModalOpen] = useState(false);
  const [internalShortageModalOpen, setInternalShortageModalOpen] = useState(false);

  const finalRound = Number(totalCountTimes || 1);
  const currentRound = Number(countRound || 1);
  const isPeriodSelected = Boolean(tagHeaderId);

  // Active ONLY when a stocktaking period (tagHeaderId) is selected AND its final count is registered
  const isFinalCountActive = isPeriodSelected && (
    hasFinalCountRegistered !== undefined
      ? hasFinalCountRegistered
      : (isSaved && currentRound >= finalRound)
  );

  const handleSurplus = () => {
    if (!isPeriodSelected) {
      showToast("لطفاً ابتدا دوره انبارگردانی را انتخاب نمایید.", "warning");
      return;
    }

    if (!isFinalCountActive) {
      showToast("صدور سند اضافات انبارگردانی تنها پس از انتخاب دوره انبارگردانی و ثبت شمارش نهایی امکان‌پذیر است.", "warning");
      return;
    }

    if (onIssueSurplus) {
      onIssueSurplus();
      return;
    }

    setInternalSurplusModalOpen(true);
  };

  const handleShortage = () => {
    if (!isPeriodSelected) {
      showToast("لطفاً ابتدا دوره انبارگردانی را انتخاب نمایید.", "warning");
      return;
    }

    if (!isFinalCountActive) {
      showToast("صدور سند کسری انبارگردانی تنها پس از انتخاب دوره انبارگردانی و ثبت شمارش نهایی امکان‌پذیر است.", "warning");
      return;
    }

    if (onIssueShortage) {
      onIssueShortage();
      return;
    }

    setInternalShortageModalOpen(true);
  };

  const tooltipSurplus = !isPeriodSelected
    ? "صدور سند اضافات انبارگردانی (ابتدا دوره انبارگردانی را انتخاب کنید)"
    : !isFinalCountActive
    ? "صدور سند اضافات انبارگردانی (تنها با انتخاب دوره‌ای که شمارش نهایی آن ثبت شده فعال می‌شود)"
    : "صدور سند اضافات انبارگردانی (رسید مازاد شمارش)";

  const tooltipShortage = !isPeriodSelected
    ? "صدور سند کسری انبارگردانی (ابتدا دوره انبارگردانی را انتخاب کنید)"
    : !isFinalCountActive
    ? "صدور سند کسری انبارگردانی (تنها با انتخاب دوره‌ای که شمارش نهایی آن ثبت شده فعال می‌شود)"
    : "صدور سند کسری انبارگردانی (حواله کسری شمارش)";

  return (
    <>
      <div className={`flex items-center gap-1.5 ${className}`}>
        <StocktakingSurplusVoucherButton
          onClick={handleSurplus}
          disabled={!isFinalCountActive}
          tooltip={tooltipSurplus}
          hideLabel
        />
        <StocktakingShortageVoucherButton
          onClick={handleShortage}
          disabled={!isFinalCountActive}
          tooltip={tooltipShortage}
          hideLabel
        />
      </div>

      {internalSurplusModalOpen && (
        <StocktakingSurplusModal
          isOpen={internalSurplusModalOpen}
          onClose={() => setInternalSurplusModalOpen(false)}
          stocktakingCountId={stocktakingCountId}
          tagHeaderId={tagHeaderId}
          warehouseId={warehouseId}
          onSuccess={(createdReceiptId) => {
            setInternalSurplusModalOpen(false);
            if (createdReceiptId) {
              addTab({
                id: `WarehouseReceipt-${createdReceiptId}`,
                title: `رسید انبار (${createdReceiptId})`,
                groupId: "warehouse_group",
                componentName: "WarehouseReceiptForm",
                props: { id: createdReceiptId },
                closable: true,
              });
            }
          }}
        />
      )}

      {internalShortageModalOpen && (
        <StocktakingShortageModal
          isOpen={internalShortageModalOpen}
          onClose={() => setInternalShortageModalOpen(false)}
          stocktakingCountId={stocktakingCountId}
          tagHeaderId={tagHeaderId}
          warehouseId={warehouseId}
          onSuccess={(createdIssueId) => {
            setInternalShortageModalOpen(false);
            if (createdIssueId) {
              addTab({
                id: `WarehouseIssue-${createdIssueId}`,
                title: `حواله انبار (${createdIssueId})`,
                groupId: "warehouse_group",
                componentName: "WarehouseIssueForm",
                props: { id: createdIssueId },
                closable: true,
              });
            }
          }}
        />
      )}
    </>
  );
}
