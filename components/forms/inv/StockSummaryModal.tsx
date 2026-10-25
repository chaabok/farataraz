"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { apiFetch } from "@/lib/utils";
import { Package, Warehouse, Building2, Boxes, RefreshCw, X, Tag, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useLanguage } from "@/lib/stores/languageStore";
import { formatLocalizedNumber } from "@/lib/digitLocale";

interface StockSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemId?: number | null;
  itemName?: string;
  itemCode?: number | string;
  warehouseId?: number | null;
  warehouseName?: string;
  excludeVoucherId?: number | string | null;
}

export interface LastMovementItem {
  title: string;
  date?: string;
  quantity?: number | string;
  price?: number | string;
  priceLabel?: string;
}

export function StockSummaryBox({
  itemId,
  warehouseId,
  mainUnitName,
  data: initialData,
  lastMovements,
  className = "",
  pendingQuantity = 0,
  documentType = "receipt",
  excludeVoucherId,
  partyId,
  documentDate,
  refreshKey,
  onRefresh,
}: {
  itemId?: number | null;
  warehouseId?: number | null;
  mainUnitName?: string;
  data?: any;
  lastMovements?: LastMovementItem[];
  className?: string;
  pendingQuantity?: number;
  documentType?: "receipt" | "issue" | "temporary_receipt" | "return_temporary_receipt" | "purchase_invoice" | "neutral";
  excludeVoucherId?: number | string | null;
  partyId?: number | string | null;
  documentDate?: string | null;
  refreshKey?: number | string;
  onRefresh?: () => void;
}) {
  const [data, setData] = useState<any>(initialData || null);
  const [loading, setLoading] = useState<boolean>(false);
  // Task 83: اعداد با ارقام بومی زبان کاربر (فارسی) و فونت یکسان نرم‌افزار نمایش داده می‌شوند
  const { language } = useLanguage();

  const fetchStockSummary = async () => {
    if (!itemId) {
      setData(null);
      return;
    }
    setLoading(true);
    try {
      let url = `/api/inv/items/${itemId}/stock-summary`;
      const queryParams: string[] = [];
      const parsedWhId = warehouseId ? Number(warehouseId) : 0;
      if (parsedWhId > 0) {
        queryParams.push(`warehouseId=${parsedWhId}`);
      }
      const parsedExVoucherId = excludeVoucherId ? Number(excludeVoucherId) : 0;
      if (parsedExVoucherId > 0) {
        queryParams.push(`excludeVoucherId=${parsedExVoucherId}`);
      }
      if (partyId) {
        queryParams.push(`partyId=${encodeURIComponent(String(partyId))}`);
      }
      if (documentDate && String(documentDate).trim()) {
        queryParams.push(`currentDate=${encodeURIComponent(String(documentDate).trim())}`);
      }
      if (documentType && documentType !== "neutral") {
        queryParams.push(`docType=${encodeURIComponent(documentType)}`);
      }
      if (queryParams.length > 0) {
        url += `?${queryParams.join("&")}`;
      }
      const res = await apiFetch(url);
      const resData = res && typeof res.json === "function" ? await res.json() : res;
      setData(resData);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Error fetching stock summary box data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialData) {
      setData(initialData);
      return;
    }
    fetchStockSummary();
  }, [itemId, warehouseId, excludeVoucherId, partyId, documentDate, documentType, refreshKey, initialData]);

  const formatQty = (val: number | string | undefined | null): string => {
    if (val === undefined || val === null || val === "" || isNaN(Number(val))) return formatLocalizedNumber(0, language);
    // حداکثر ۴ رقم اعشار (مطابق رفتار قبلی) و سپس بومی‌سازی ارقام/جداکننده‌ها
    const rounded = Math.round(Number(val) * 10000) / 10000;
    return formatLocalizedNumber(rounded, language);
  };

  const formatPrice = (val: number | string | undefined | null): string => {
    if (val === undefined || val === null || val === "" || isNaN(Number(val))) return formatLocalizedNumber(0, language);
    return formatLocalizedNumber(Math.round(Number(val)), language);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4 gap-2 text-xs text-slate-500">
        <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
        <span>در حال استعلام ایجکسی خلاصه گردش...</span>
      </div>
    );
  }

  const effectiveMainUnitName = data?.mainUnit?.unitName || mainUnitName || "واحد";

  const isIssue = documentType === "issue";
  const pending = Number(pendingQuantity || 0);
  const sign = isIssue ? -1 : 1;
  const changeQty = pending * sign;

  const dbWarehouseStock = Number(data?.mainUnit?.warehouseStock ?? 0);
  const dbCompanyStock = Number(data?.mainUnit?.companyStock ?? 0);

  const projectedWarehouseStock = dbWarehouseStock + changeQty;
  const projectedCompanyStock = dbCompanyStock + changeQty;

  const subUnitName = data?.subUnit?.unitName || "";
  const dbSubWarehouseStock = Number(data?.subUnit?.warehouseStock ?? 0);
  const dbSubCompanyStock = Number(data?.subUnit?.companyStock ?? 0);
  const subRatio = Number(data?.subUnit?.mainToSubRatio || 1);
  const subChangeQty = pending * subRatio * sign;
  const projectedSubWarehouseStock = dbSubWarehouseStock + subChangeQty;
  const projectedSubCompanyStock = dbSubCompanyStock + subChangeQty;

  return (
    <div className={`flex flex-col gap-1 text-xs ${className}`}>
      {/* Header with AJAX Refresh Button */}
      <div className="flex items-center justify-between pb-0.5 border-b border-slate-100 dark:border-slate-800">
        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
          <Boxes className="w-3 h-3 text-indigo-500" />
          موجودی و گردش لحظه‌ای
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            fetchStockSummary();
          }}
          disabled={loading || !itemId}
          title="استعلام مجدد موجودی از سرور (AJAX Refresh)"
          className="p-0.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors disabled:opacity-30"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin text-indigo-600" : ""}`} />
        </button>
      </div>

      {/* Row 1: DB Warehouse Base Stock */}
      <div className="flex items-center justify-between py-0.5 px-1 rounded-sm bg-slate-50/50 dark:bg-slate-800/40">
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center text-[9px] font-bold shrink-0">
            ۱
          </span>
          <span className="font-medium text-slate-600 dark:text-slate-400 text-[10px]">
            موجودی قبلی (در دیتابیس):
          </span>
        </div>
        <div className="dir-ltr text-left">
          <span className="font-semibold text-slate-800 dark:text-slate-200 text-[10px]">
            {formatQty(dbWarehouseStock)}
          </span>
          <span className="text-[9px] text-slate-500 mr-1">
            {effectiveMainUnitName}
          </span>
        </div>
      </div>

      {/* Row 2: Live Pending Change from current form (if non-zero) */}
      {pending !== 0 && (
        <div className="flex items-center justify-between py-0.5 px-1 rounded-sm bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40">
          <div className="flex items-center gap-1.5">
            <span className={`w-3.5 h-3.5 rounded-full ${isIssue ? "bg-amber-500 text-white" : "bg-emerald-600 text-white"} flex items-center justify-center text-[9px] font-bold shrink-0`}>
              {isIssue ? "-" : "+"}
            </span>
            <span className="font-medium text-indigo-900 dark:text-indigo-200 text-[10px]">
              تغییرات این سند:
            </span>
          </div>
          <div className="dir-ltr text-left">
            <span className={`font-bold text-[10px] ${isIssue ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}`}>
              {isIssue ? "-" : "+"}{formatQty(pending)}
            </span>
            <span className="text-[9px] text-indigo-700 dark:text-indigo-300 mr-1">
              {effectiveMainUnitName}
            </span>
          </div>
        </div>
      )}

      {/* Row 3: Projected Warehouse Stock after this document */}
      <div className="flex items-center justify-between py-0.5 px-1 rounded-sm bg-blue-50/80 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-900/60">
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px] font-bold shrink-0">
            {pending !== 0 ? "۲" : "۱"}
          </span>
          <span className="font-bold text-blue-950 dark:text-blue-100 text-[10px]">
            {pending !== 0 ? "موجودی انبار (پس از سند):" : "موجودی به واحد اصلی:"}
          </span>
        </div>
        <div className="dir-ltr text-left">
          <span className="font-extrabold text-blue-700 dark:text-blue-300 text-[11px]">
            {formatQty(projectedWarehouseStock)}
          </span>
          <span className="text-[9px] text-blue-600 dark:text-blue-400 mr-1">
            {effectiveMainUnitName}
          </span>
        </div>
      </div>

      {/* SubUnit Warehouse Stock if available */}
      {data?.subUnit && (
        <div className="flex items-center justify-between py-0.5 px-1 rounded-sm">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-indigo-100 dark:bg-indigo-900/70 text-indigo-700 dark:text-indigo-300 flex items-center justify-center text-[9px] font-bold shrink-0">
              فرعی
            </span>
            <span className="font-medium text-slate-800 dark:text-slate-200 text-[10px]">
              موجودی واحد فرعی {pending !== 0 ? "(پس از سند)" : ""}:
            </span>
          </div>
          <div className="dir-ltr text-left">
            <span className="font-bold text-slate-900 dark:text-slate-100 text-[10px]">
              {formatQty(projectedSubWarehouseStock)}
            </span>
            <span className="text-[9px] text-slate-500 dark:text-slate-400 mr-1">
              {subUnitName}
            </span>
          </div>
        </div>
      )}

      {/* Row 4: Company Stock */}
      <div className="flex items-center justify-between py-0.5 px-1 rounded-sm">
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-full bg-emerald-100 dark:bg-emerald-900/70 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-[9px] font-bold shrink-0">
            {data?.subUnit ? "۳" : "۲"}
          </span>
          <span className="font-medium text-slate-800 dark:text-slate-200 text-[10px]">
            موجودی سطح شرکت {pending !== 0 ? "(پس از سند)" : ""}:
          </span>
        </div>
        <div className="dir-ltr text-left">
          <span className="font-bold text-slate-900 dark:text-slate-100 text-[10px]">
            {formatQty(projectedCompanyStock)}
          </span>
          <span className="text-[9px] text-slate-500 dark:text-slate-400 mr-1">
            {effectiveMainUnitName}
          </span>
        </div>
      </div>

      {/* SubUnit Company Stock if available */}
      {data?.subUnit && (
        <div className="flex items-center justify-between py-0.5 px-1 rounded-sm">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-teal-100 dark:bg-teal-900/70 text-teal-700 dark:text-teal-300 flex items-center justify-center text-[9px] font-bold shrink-0">
              ۴
            </span>
            <span className="font-medium text-slate-800 dark:text-slate-200 text-[10px]">
              موجودی فرعی در سطح شرکت:
            </span>
          </div>
          <div className="dir-ltr text-left">
            <span className="font-bold text-slate-900 dark:text-slate-100 text-[10px]">
              {formatQty(projectedSubCompanyStock)}
            </span>
            <span className="text-[9px] text-slate-500 dark:text-slate-400 mr-1">
              {subUnitName}
            </span>
          </div>
        </div>
      )}

      {/* Last Movements Section */}
      {(() => {
        const effectiveLastMovements: LastMovementItem[] =
          (lastMovements && lastMovements.length > 0) ? lastMovements : (data?.lastMovements || []);
        if (!effectiveLastMovements || effectiveLastMovements.length === 0) return null;

        return (
          <div className="mt-1 pt-1 border-t border-slate-200 dark:border-slate-700/80">
            <table className="w-full text-xs text-right border-collapse">
              <thead className="sticky top-0 bg-slate-50 dark:bg-slate-900 z-10 shadow-2xs">
                <tr className="bg-slate-100/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-[10px]">
                  <th className="p-1 text-right">عنوان</th>
                  <th className="p-1 text-center w-16">تاریخ</th>
                  <th className="p-1 text-center w-12">مقدار</th>
                  <th className="p-1 text-left w-20">{effectiveLastMovements[0]?.priceLabel || "مبلغ"}</th>
                </tr>
              </thead>
              <tbody>
                {effectiveLastMovements.map((mov, idx) => (
                  <tr key={idx} className="border-b border-slate-100 dark:border-slate-800/80 hover:bg-slate-50/60 dark:hover:bg-slate-800/60">
                    <td className="p-1 font-medium text-slate-800 dark:text-slate-200 text-[10px]">{mov.title}</td>
                    <td className="p-1 text-center text-slate-500 dark:text-slate-400 text-[10px]">{mov.date || "-"}</td>
                    <td className="p-1 text-center text-slate-700 dark:text-slate-300 text-[10px] tabular-nums">{formatQty(mov.quantity)}</td>
                    <td className="p-1 text-left font-semibold text-slate-800 dark:text-slate-200 dir-ltr text-[10px] tabular-nums">
                      {formatPrice(mov.price)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })()}
    </div>
  );
}

export function StockSummaryModal({
  isOpen,
  onClose,
  itemId,
  itemName: propItemName,
  itemCode: propItemCode,
  warehouseId,
  warehouseName: propWarehouseName,
  excludeVoucherId,
}: StockSummaryModalProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"summary" | "tracking" | "warehouses">("summary");
  // Task 83: اعداد مودال خلاصه گردش هم با ارقام بومی زبان کاربر نمایش داده می‌شوند
  const { language } = useLanguage();

  const fetchSummary = async () => {
    if (!itemId) return;
    setLoading(true);
    setError(null);
    try {
      let url = `/api/inv/items/${itemId}/stock-summary`;
      const queryParams: string[] = [];
      const parsedWhId = warehouseId ? Number(warehouseId) : 0;
      if (parsedWhId > 0) {
        queryParams.push(`warehouseId=${parsedWhId}`);
      }
      const parsedExVoucherId = excludeVoucherId ? Number(excludeVoucherId) : 0;
      if (parsedExVoucherId > 0) {
        queryParams.push(`excludeVoucherId=${parsedExVoucherId}`);
      }
      if (queryParams.length > 0) {
        url += `?${queryParams.join("&")}`;
      }
      const res = await apiFetch(url);
      const resData = res && typeof res.json === "function" ? await res.json() : res;
      setData(resData);
    } catch (err: any) {
      console.error("Error fetching stock summary:", err);
      setError("خطا در دریافت اطلاعات موجودی لحظه‌ای کالا.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && itemId) {
      fetchSummary();
    } else if (!isOpen) {
      setData(null);
      setError(null);
    }
  }, [isOpen, itemId, warehouseId, excludeVoucherId]);

  if (!isOpen) return null;

  const formatQty = (val: number | string | undefined | null): string => {
    if (val === undefined || val === null || val === "" || isNaN(Number(val))) return formatLocalizedNumber(0, language);
    const rounded = Math.round(Number(val) * 10000) / 10000;
    return formatLocalizedNumber(rounded, language);
  };

  const displayName = data?.itemName || propItemName || "کالای انتخاب‌شده";
  const displayCode = data?.itemCode || propItemCode || "";
  const displayWhName = data?.warehouseName || propWarehouseName || (warehouseId ? `انبار شماره ${warehouseId}` : "تمام انبارها");

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-xl">
        <DialogHeader className="p-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-lg">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <span>خلاصه گردش و موجودی لحظه‌ای کالا</span>
                {displayCode && (
                  <span className="text-xs bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded">
                    کد: {isNaN(Number(displayCode)) ? displayCode : formatLocalizedNumber(displayCode, language)}
                  </span>
                )}
              </DialogTitle>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {displayName} {warehouseId ? ` | انبار: ${displayWhName}` : " | کل شرکت"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchSummary}
              disabled={loading}
              className="p-1.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors"
              title="به‌روزرسانی موجودی"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </DialogHeader>

        <div className="p-4 flex-1 overflow-y-auto space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
              <span className="text-xs text-slate-500 font-medium">در حال محاسبه موجودی لحظه‌ای کالا...</span>
            </div>
          ) : error ? (
            <div className="p-4 bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 rounded-lg border border-rose-200 text-xs text-center">
              {error}
            </div>
          ) : data ? (
            <>
              {/* 4-Row Stock Turnover Summary Box */}
              <div className="flex flex-col gap-2.5 bg-slate-50/80 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2 mb-1">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                    <Boxes className="w-4 h-4 text-blue-600" />
                    <span>خلاصه گردش و موجودی لحظه‌ای کالا</span>
                  </span>
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    {displayWhName}
                  </span>
                </div>

                {/* 1st Row: موجودی به واحد اصلی (در سطح انبار) */}
                <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 border border-blue-100 dark:border-blue-900/40 rounded-lg shadow-2xs">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 flex items-center justify-center text-xs font-bold shrink-0">
                      ۱
                    </span>
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                        موجودی به واحد اصلی
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        سطح انبار ({displayWhName})
                      </span>
                    </div>
                  </div>
                  <div className="dir-ltr text-left">
                    <span className="text-sm font-extrabold text-blue-900 dark:text-blue-200">
                      {formatQty(data.mainUnit?.warehouseStock)}
                    </span>
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400 mr-1.5">
                      {data.mainUnit?.unitName || "واحد"}
                    </span>
                  </div>
                </div>

                {/* 2nd Row: موجودی واحد فرعی (در سطح انبار) - Only if subUnit is defined */}
                {data.subUnit && (
                  <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 border border-indigo-100 dark:border-indigo-900/40 rounded-lg shadow-2xs">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center text-xs font-bold shrink-0">
                        ۲
                      </span>
                      <div>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                          موجودی واحد فرعی
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          سطح انبار ({displayWhName})
                        </span>
                      </div>
                    </div>
                    <div className="dir-ltr text-left">
                      <span className="text-sm font-extrabold text-indigo-900 dark:text-indigo-200">
                        {formatQty(data.subUnit?.warehouseStock)}
                      </span>
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-400 mr-1.5">
                        {data.subUnit?.unitName}
                      </span>
                    </div>
                  </div>
                )}

                {/* 3rd Row: موجودی واحد اصلی در سطح شرکت */}
                <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 border border-emerald-100 dark:border-emerald-900/40 rounded-lg shadow-2xs">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-xs font-bold shrink-0">
                      {data.subUnit ? "۳" : "۲"}
                    </span>
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                        موجودی واحد اصلی در سطح شرکت
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        سطح کل شرکت (تمام انبارها)
                      </span>
                    </div>
                  </div>
                  <div className="dir-ltr text-left">
                    <span className="text-sm font-extrabold text-emerald-900 dark:text-emerald-200">
                      {formatQty(data.mainUnit?.companyStock)}
                    </span>
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400 mr-1.5">
                      {data.mainUnit?.unitName || "واحد"}
                    </span>
                  </div>
                </div>

                {/* 4th Row: موجودی واحد فرعی در سطح شرکت - Only if subUnit is defined */}
                {data.subUnit && (
                  <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 border border-teal-100 dark:border-teal-900/40 rounded-lg shadow-2xs">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 flex items-center justify-center text-xs font-bold shrink-0">
                        ۴
                      </span>
                      <div>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                          موجودی واحد فرعی در سطح شرکت
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          سطح کل شرکت (تمام انبارها)
                        </span>
                      </div>
                    </div>
                    <div className="dir-ltr text-left">
                      <span className="text-sm font-extrabold text-teal-900 dark:text-teal-200">
                        {formatQty(data.subUnit?.companyStock)}
                      </span>
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-400 mr-1.5">
                        {data.subUnit?.unitName}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation Tabs */}
              <div className="flex border-b border-slate-200 dark:border-slate-700 gap-1 mt-2">
                <button
                  onClick={() => setActiveTab("summary")}
                  className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-1.5 border-b-2 -mb-px ${
                    activeTab === "summary"
                      ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400 bg-slate-50 dark:bg-slate-800/50"
                      : "border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                  }`}
                >
                  <Boxes className="w-3.5 h-3.5" />
                  <span>خلاصه موجودی واحدها</span>
                </button>

                <button
                  onClick={() => setActiveTab("tracking")}
                  className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-1.5 border-b-2 -mb-px ${
                    activeTab === "tracking"
                      ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400 bg-slate-50 dark:bg-slate-800/50"
                      : "border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                  }`}
                >
                  <Tag className="w-3.5 h-3.5" />
                  <span>
                    عوامل ردیابی ({data.trackingFactors?.length || 0})
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab("warehouses")}
                  className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-1.5 border-b-2 -mb-px ${
                    activeTab === "warehouses"
                      ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400 bg-slate-50 dark:bg-slate-800/50"
                      : "border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                  }`}
                >
                  <Warehouse className="w-3.5 h-3.5" />
                  <span>
                    تفکیک انبارها ({data.warehousesSummary?.length || 0})
                  </span>
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === "summary" && (
                <div className="space-y-3 pt-2">
                  <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-200 dark:border-slate-700 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                    <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">
                      نحوه محاسبه موجودی لحظه‌ای:
                    </p>
                    <p>
                      موجودی در هر سطح برابر است با مجموع مقادیر ثبت‌شده در{" "}
                      <strong className="text-emerald-700 dark:text-emerald-400">رسیدهای انبار (افزاینده)</strong>{" "}
                      منهای مجموع مقادیر ثبت‌شده در{" "}
                      <strong className="text-rose-700 dark:text-rose-400">حواله‌های انبار (کاهنده)</strong>.
                    </p>
                  </div>

                  {data.subUnit && (
                    <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 rounded-lg text-xs flex items-center justify-between">
                      <span className="text-indigo-800 dark:text-indigo-300 font-medium">
                        ضریب تبدیل واحد اصلی ({data.mainUnit?.unitName}) به واحد فرعی ({data.subUnit?.unitName}):
                      </span>
                      <span className="font-extrabold text-indigo-900 dark:text-indigo-200 dir-ltr tabular-nums">
                        {formatLocalizedNumber(1, language)} {data.mainUnit?.unitName} = {formatLocalizedNumber(data.subUnit?.ratio, language)} {data.subUnit?.unitName}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Levels 3 & 6 - Tracking Factors */}
              {activeTab === "tracking" && (
                <div className="space-y-3 pt-1">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    جدول زیر موجودی لحظه‌ای کالا را به تفکیک جزئیات هر نوع عامل ردیابی (سری ساخت، تاریخ انقضا و ...) در سطح انبار انتخابی (سطح ۳) و کل شرکت (سطح ۶) نمایش می‌دهد:
                  </p>

                  {data.trackingFactors && data.trackingFactors.length > 0 ? (
                    <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                      <table className="w-full text-xs text-right">
                        <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                          <tr>
                            <th className="p-2.5">نام عامل ردیابی</th>
                            <th className="p-2.5">مقدار / مشخصه / بازه</th>
                            <th className="p-2.5 text-left dir-ltr">۳. موجودی در انبار</th>
                            <th className="p-2.5 text-left dir-ltr">۶. موجودی در کل شرکت</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {data.trackingFactors.map((tf: any, idx: number) => (
                            <tr
                              key={idx}
                              className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                            >
                              <td className="p-2.5 font-medium text-slate-800 dark:text-slate-200">
                                {tf.trackingFactorName}
                              </td>
                              <td className="p-2.5 text-slate-600 dark:text-slate-400">
                                {tf.factorValue || (tf.startValue ? `از ${formatLocalizedNumber(tf.startValue, language)} تا ${formatLocalizedNumber(tf.endValue, language)}` : "-")}
                              </td>
                              <td className="p-2.5 text-left dir-ltr font-bold text-blue-700 dark:text-blue-300">
                                {formatQty(tf.warehouseStock)} {data.mainUnit?.unitName}
                              </td>
                              <td className="p-2.5 text-left dir-ltr font-bold text-emerald-700 dark:text-emerald-300">
                                {formatQty(tf.companyStock)} {data.mainUnit?.unitName}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/30 rounded-lg border border-dashed border-slate-200 dark:border-slate-700">
                      هیچ عامل ردیابی خاصی برای این کالا ثبت نگردیده است.
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Warehouses Breakdown */}
              {activeTab === "warehouses" && (
                <div className="space-y-3 pt-1">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    تفکیک موجودی لحظه‌ای کالا در تمامی انبارهای فعال شرکت:
                  </p>

                  {data.warehousesSummary && data.warehousesSummary.length > 0 ? (
                    <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                      <table className="w-full text-xs text-right">
                        <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                          <tr>
                            <th className="p-2.5">نام انبار</th>
                            <th className="p-2.5 text-left dir-ltr">موجودی واحد اصلی</th>
                            {data.subUnit && <th className="p-2.5 text-left dir-ltr">موجودی واحد فرعی</th>}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {data.warehousesSummary.map((wh: any) => {
                            const isCurrentWh = warehouseId && Number(wh.warehouseId) === Number(warehouseId);
                            return (
                              <tr
                                key={wh.warehouseId}
                                className={`transition-colors ${
                                  isCurrentWh
                                    ? "bg-blue-50/80 dark:bg-blue-950/40 font-semibold"
                                    : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                }`}
                              >
                                <td className="p-2.5 text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                  <Warehouse className="w-3.5 h-3.5 text-slate-400" />
                                  <span>{wh.warehouseName}</span>
                                  {isCurrentWh && (
                                    <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.2 rounded">
                                      انبار جاری
                                    </span>
                                  )}
                                </td>
                                <td className="p-2.5 text-left dir-ltr font-extrabold text-slate-800 dark:text-slate-200">
                                  {formatQty(wh.mainStock)} {data.mainUnit?.unitName}
                                </td>
                                {data.subUnit && (
                                  <td className="p-2.5 text-left dir-ltr font-bold text-slate-600 dark:text-slate-400">
                                    {formatQty(wh.subStock)} {data.subUnit?.unitName}
                                  </td>
                                )}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/30 rounded-lg border border-dashed border-slate-200 dark:border-slate-700">
                      هیچ گردش انباری برای این کالا ثبت نشده است.
                    </div>
                  )}
                </div>
              )}
            </>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
