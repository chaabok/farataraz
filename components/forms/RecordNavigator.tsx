"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  ChevronRight,
  ChevronLeft,
  ChevronsRight,
  ChevronsLeft,
  Loader2,
} from "lucide-react";
import { ActionButton } from "../buttons/ActionButton";
import { useLanguage } from "../Providers";
import { apiFetch, cn } from "@/lib/utils";

export interface RecordNavigatorProps {
  /** Optional custom form name used for button tooltips (e.g. "رسید انبار") */
  formName?: string;
  /** Form title fallback if formName is not passed (e.g. "رسید انبار جدید") */
  title?: string;
  /** API endpoint to fetch record list (e.g. "/api/inv/warehouse-receipts?nature=1") */
  listApiUrl?: string;
  /** Direct data array if available in parent */
  data?: any[];
  /** Current active record values */
  values?: Record<string, any>;
  /** Explicit current record ID if known */
  currentRecordId?: number | string | null;
  /** Callback when user navigates to a record (passes the selected record item) */
  onSelect?: (item: any) => void;
  /** Optional custom navigate callback */
  onNavigate?: (direction: "first" | "prev" | "next" | "last", targetItem: any) => void;
  /** Disable all buttons (e.g. while submitting) */
  disabled?: boolean;
  /** Optional className */
  className?: string;
  /** HTML id */
  id?: string;
}

/**
 * Helper to safely extract a primary key / ID from an arbitrary record object
 */
export function extractRecordId(item: any): string | number | null {
  if (!item || typeof item !== "object") return null;
  if (item.id !== undefined && item.id !== null && item.id !== "") return item.id;

  // Check known ID fields or fields ending with "ID" (case-insensitive)
  const keys = Object.keys(item);
  for (const k of keys) {
    if (k.toLowerCase().endsWith("id")) {
      const val = item[k];
      if (val !== undefined && val !== null && val !== "") {
        return val;
      }
    }
  }
  return null;
}

/**
 * Clean up title to extract clean form name for tooltips
 */
export function resolveFormName(formName?: string, title?: string): string {
  if (formName && formName.trim()) return formName.trim();
  if (!title || !title.trim()) return "فرم";

  let cleaned = title.trim();
  // Remove common Iranian ERP prefixes/suffixes (جدید، ویرایش، ثبت، تعریف، فرم)
  cleaned = cleaned.replace(/^(ویرایش|ثبت|تعریف|فرم)\s+/, "");
  cleaned = cleaned.replace(/\s+(جدید|ویرایش)$/, "");
  cleaned = cleaned.trim();
  return cleaned || "فرم";
}

export function RecordNavigator({
  formName,
  title,
  listApiUrl,
  data,
  values,
  currentRecordId,
  onSelect,
  onNavigate,
  disabled = false,
  className,
  id = "record-navigator",
}: RecordNavigatorProps) {
  const { direction } = useLanguage();
  const isRtl = direction !== "ltr";

  const [fetchedRecords, setFetchedRecords] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Fetch list when listApiUrl is provided
  const fetchRecords = useCallback(async () => {
    if (!listApiUrl) return;
    try {
      setIsLoading(true);
      const res = await apiFetch(listApiUrl);
      if (res.ok) {
        const json = await res.json();
        const records = Array.isArray(json)
          ? json
          : json?.data || json?.items || json?.list || json?.records || [];
        if (Array.isArray(records)) {
          setFetchedRecords(records);
        }
      }
    } catch (err) {
      console.error("Error fetching records for RecordNavigator:", err);
    } finally {
      setIsLoading(false);
    }
  }, [listApiUrl]);

  useEffect(() => {
    if (listApiUrl) {
      fetchRecords();
    }
  }, [fetchRecords, listApiUrl]);

  // Use direct data prop if provided, else use fetched records
  const rawRecords = useMemo(() => {
    if (data && Array.isArray(data)) return data;
    return fetchedRecords;
  }, [data, fetchedRecords]);

  // Sort records chronologically ascending (first registered -> last registered)
  const sortedRecords = useMemo(() => {
    if (!rawRecords || rawRecords.length === 0) return [];

    return [...rawRecords].sort((a, b) => {
      // 1. Try document number / code if numeric
      const numA = Number(
        a.ReceiptNumber ||
          a.voucherNumber ||
          a.documentNumber ||
          a.DocumentNumber ||
          a.code ||
          a.Code
      );
      const numB = Number(
        b.ReceiptNumber ||
          b.voucherNumber ||
          b.documentNumber ||
          b.DocumentNumber ||
          b.code ||
          b.Code
      );
      if (!isNaN(numA) && !isNaN(numB) && numA > 0 && numB > 0 && numA !== numB) {
        return numA - numB;
      }

      // 2. Try Primary Key ID numeric
      const idA = Number(extractRecordId(a));
      const idB = Number(extractRecordId(b));
      if (!isNaN(idA) && !isNaN(idB) && idA > 0 && idB > 0 && idA !== idB) {
        return idA - idB;
      }

      // 3. Fallback to RowNo
      if (a.RowNo !== undefined && b.RowNo !== undefined) {
        return Number(a.RowNo) - Number(b.RowNo);
      }

      return 0;
    });
  }, [rawRecords]);

  // Determine current active record ID and index in sorted list
  const activeRecordId = useMemo(() => {
    if (currentRecordId !== undefined && currentRecordId !== null && currentRecordId !== "") {
      return currentRecordId;
    }
    if (values) {
      return extractRecordId(values);
    }
    return null;
  }, [currentRecordId, values]);

  const activeDocNumber = useMemo(() => {
    return (
      values?.ReceiptNumber ||
      values?.voucherNumber ||
      values?.documentNumber ||
      values?.DocumentNumber ||
      values?.code ||
      values?.Code
    );
  }, [values]);

  const currentIndex = useMemo(() => {
    if (!sortedRecords || sortedRecords.length === 0) return -1;

    // First try matching by ID
    if (activeRecordId !== null && activeRecordId !== undefined) {
      const idx = sortedRecords.findIndex(
        (item) => String(extractRecordId(item)) === String(activeRecordId)
      );
      if (idx !== -1) return idx;
    }

    // Fallback: match by document number
    if (activeDocNumber !== null && activeDocNumber !== undefined && activeDocNumber !== "") {
      const idx = sortedRecords.findIndex((item) => {
        const itemNum =
          item.ReceiptNumber ||
          item.voucherNumber ||
          item.documentNumber ||
          item.DocumentNumber ||
          item.code ||
          item.Code;
        return itemNum !== undefined && String(itemNum) === String(activeDocNumber);
      });
      if (idx !== -1) return idx;
    }

    return -1;
  }, [sortedRecords, activeRecordId, activeDocNumber]);

  // Calculate enabled / disabled states
  const totalRecords = sortedRecords.length;
  const isExistingRecord = currentIndex !== -1;

  // When on an existing record:
  // - Previous disabled if on first record (currentIndex === 0)
  // - First disabled if on first record
  // - Next disabled if on last record (currentIndex === totalRecords - 1)
  // - Last disabled if on last record
  // When on a new unsaved record (currentIndex === -1):
  // - Previous goes to the latest saved record (if records exist)
  // - First goes to the earliest saved record (if records exist)
  // - Next is disabled (there is no record after unsaved)
  // - Last goes to the latest saved record (if records exist)
  const canGoFirst = !disabled && totalRecords > 0 && (!isExistingRecord || currentIndex > 0);
  const canGoPrev = !disabled && totalRecords > 0 && (!isExistingRecord || currentIndex > 0);
  const canGoNext = !disabled && totalRecords > 0 && isExistingRecord && currentIndex < totalRecords - 1;
  const canGoLast = !disabled && totalRecords > 0 && (!isExistingRecord || currentIndex < totalRecords - 1);

  // Tooltip labels according to user's exact specification:
  // 1. [نام فرم]+قبلی
  // 2. اولین + [نام فرم]
  // 3. [نام فرم]+بعدی
  // 4. آخرین + [نام فرم]
  const cleanFormName = resolveFormName(formName, title);
  const firstTooltip = `اولین ${cleanFormName}`;
  const prevTooltip = `${cleanFormName} قبلی`;
  const nextTooltip = `${cleanFormName} بعدی`;
  const lastTooltip = `آخرین ${cleanFormName}`;

  // Navigation handlers
  const handleGoFirst = () => {
    if (!canGoFirst || totalRecords === 0) return;
    const target = sortedRecords[0];
    if (target) {
      onNavigate?.("first", target);
      onSelect?.(target);
    }
  };

  const handleGoPrev = () => {
    if (!canGoPrev || totalRecords === 0) return;
    const targetIndex = isExistingRecord && currentIndex > 0 ? currentIndex - 1 : totalRecords - 1;
    const target = sortedRecords[targetIndex];
    if (target) {
      onNavigate?.("prev", target);
      onSelect?.(target);
    }
  };

  const handleGoNext = () => {
    if (!canGoNext || totalRecords === 0) return;
    if (currentIndex >= 0 && currentIndex < totalRecords - 1) {
      const target = sortedRecords[currentIndex + 1];
      if (target) {
        onNavigate?.("next", target);
        onSelect?.(target);
      }
    }
  };

  const handleGoLast = () => {
    if (!canGoLast || totalRecords === 0) return;
    const target = sortedRecords[totalRecords - 1];
    if (target) {
      onNavigate?.("last", target);
      onSelect?.(target);
    }
  };

  // Directional icons:
  // In RTL:
  // First (اولین) -> points Right (ChevronsRight)
  // Previous (قبلی) -> points Right (ChevronRight)
  // Next (بعدی) -> points Left (ChevronLeft)
  // Last (آخرین) -> points Left (ChevronsLeft)
  const FirstIcon = isRtl ? ChevronsRight : ChevronsLeft;
  const PrevIcon = isRtl ? ChevronRight : ChevronLeft;
  const NextIcon = isRtl ? ChevronLeft : ChevronRight;
  const LastIcon = isRtl ? ChevronsLeft : ChevronsRight;

  return (
    <div
      id={id}
      className={cn(
        "record-navigator flex flex-nowrap items-center gap-1 shrink-0",
        className
      )}
      role="group"
      aria-label="پیمایش رکوردهای فرم"
    >
      {/* 1. اولین رکورد (First) */}
      <ActionButton
        id={`${id}-btn-first`}
        icon={isLoading ? Loader2 : FirstIcon}
        variant="secondary"
        hideLabel={true}
        tooltip={firstTooltip}
        tooltipPosition="bottom"
        disabled={!canGoFirst || isLoading}
        onClick={handleGoFirst}
        className={cn(
          "h-[30px] w-[30px] p-0 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-400 transition-all",
          isLoading && "animate-spin"
        )}
      />

      {/* 2. رکورد قبلی (Previous) */}
      <ActionButton
        id={`${id}-btn-prev`}
        icon={isLoading ? Loader2 : PrevIcon}
        variant="secondary"
        hideLabel={true}
        tooltip={prevTooltip}
        tooltipPosition="bottom"
        disabled={!canGoPrev || isLoading}
        onClick={handleGoPrev}
        className={cn(
          "h-[30px] w-[30px] p-0 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-400 transition-all",
          isLoading && "animate-spin"
        )}
      />

      {/* 3. رکورد بعدی (Next) */}
      <ActionButton
        id={`${id}-btn-next`}
        icon={isLoading ? Loader2 : NextIcon}
        variant="secondary"
        hideLabel={true}
        tooltip={nextTooltip}
        tooltipPosition="bottom"
        disabled={!canGoNext || isLoading}
        onClick={handleGoNext}
        className={cn(
          "h-[30px] w-[30px] p-0 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-400 transition-all",
          isLoading && "animate-spin"
        )}
      />

      {/* 4. آخرین رکورد (Last) */}
      <ActionButton
        id={`${id}-btn-last`}
        icon={isLoading ? Loader2 : LastIcon}
        variant="secondary"
        hideLabel={true}
        tooltip={lastTooltip}
        tooltipPosition="bottom"
        disabled={!canGoLast || isLoading}
        onClick={handleGoLast}
        className={cn(
          "h-[30px] w-[30px] p-0 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-400 transition-all",
          isLoading && "animate-spin"
        )}
      />
    </div>
  );
}

export default RecordNavigator;
