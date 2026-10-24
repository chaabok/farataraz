"use client";

import React from "react";
import { Check, AlertCircle, AlertTriangle, Calculator, X, CheckCircle2, ShoppingCart, Scale, PackageOpen } from "lucide-react";

function formatCurrency(val: number | string | null | undefined): string {
  if (val === null || val === undefined || val === "") return "0";
  const num = typeof val === "string" ? parseFloat(val.replace(/,/g, "")) : val;
  if (isNaN(num)) return "0";
  return num.toLocaleString("fa-IR");
}

export interface PricedItemResult {
  rowNo: number;
  itemRef: number;
  itemCode: string;
  itemName: string;
  oldUnitPrice: number;
  newUnitPrice: number;
  isPriced: boolean;
  statusMessage: string;
  effectiveDate?: string;
  receiptDate?: string;
  sourceDocumentNumber?: string;
}

export interface WarehouseReceiptPricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (results: PricedItemResult[]) => void;
  methodTitle: string;
  methodType: "standardRate" | "lastPurchase" | "lastConsumption";
  results: PricedItemResult[];
  isLoading?: boolean;
}

export const WarehouseReceiptPricingModal: React.FC<WarehouseReceiptPricingModalProps> = ({
  isOpen,
  onClose,
  onApply,
  methodTitle,
  methodType,
  results,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  const pricedCount = results.filter((r) => r.isPriced).length;
  const unpricedCount = results.filter((r) => !r.isPriced).length;
  const totalCount = results.length;

  const getMethodIcon = () => {
    switch (methodType) {
      case "standardRate":
        return <Scale className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      case "lastPurchase":
        return <ShoppingCart className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
      case "lastConsumption":
        return <PackageOpen className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
      default:
        return <Calculator className="w-5 h-5 text-teal-600 dark:text-teal-400" />;
    }
  };

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
      dir="rtl"
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden text-slate-800 dark:text-slate-100 animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-100 dark:bg-teal-950/70 border border-teal-200 dark:border-teal-800 flex items-center justify-center shadow-xs">
              {getMethodIcon()}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                فرآیند قیمت‌گذاری رسید انبار بر اساس {methodTitle}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                بررسی ریالی شدن اقلام رسید، کنترل تاریخ و درج فی مصوب در جدول اقلام
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Stats Bar */}
        <div className="px-6 py-3 bg-slate-100/70 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4">
            <span className="font-semibold text-slate-600 dark:text-slate-300">
              کل اقلام رسید: <b className="text-slate-900 dark:text-white">{totalCount}</b>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              قیمت‌گذاری شده (ریالی): <b>{pricedCount}</b>
            </span>
            {unpricedCount > 0 && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-medium">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                قیمت‌گذاری نشده: <b>{unpricedCount}</b>
              </span>
            )}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {pricedCount === totalCount && totalCount > 0 ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                تمامی اقلام با موفقیت ریالی شدند
              </span>
            ) : unpricedCount > 0 ? (
              <span className="text-amber-600 dark:text-amber-400">
                اقلام فاقد قیمت با هشدار در جدول مشخص شده‌اند
              </span>
            ) : null}
          </div>
        </div>

        {/* Modal Table Body */}
        <div className="p-6 overflow-y-auto flex-1 min-h-[260px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-500">
              <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm font-medium">در حال محاسبه و واکشی قیمت‌ها...</span>
            </div>
          ) : results.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-2">
              <AlertCircle className="w-8 h-8 text-slate-400" />
              <span>هیچ قلم کالایی در رسید انبار یافت نشد</span>
            </div>
          ) : (
            <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-2xs">
              <table className="w-full text-right border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 select-none">
                    <th className="py-2.5 px-3 font-bold w-12 text-center">ردیف</th>
                    <th className="py-2.5 px-3 font-bold w-28">کد کالا</th>
                    <th className="py-2.5 px-3 font-bold">نام و شرح کالا</th>
                    <th className="py-2.5 px-3 font-bold w-28 text-left dir-ltr">فی قبلی (ریال)</th>
                    <th className="py-2.5 px-3 font-bold w-32 text-left dir-ltr">فی جدید (ریال)</th>
                    <th className="py-2.5 px-3 font-bold">وضعیت و توضیحات</th>
                    <th className="py-2.5 px-3 font-bold w-16 text-center">وضعیت</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {results.map((row, idx) => (
                    <tr
                      key={idx}
                      className={
                        row.isPriced
                          ? "hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition-colors"
                          : "bg-red-50/30 dark:bg-red-950/10 hover:bg-red-50/50 dark:hover:bg-red-950/20 transition-colors"
                      }
                    >
                      {/* 1. Row No */}
                      <td className="py-2.5 px-3 text-center text-slate-600 dark:text-slate-400 font-medium">
                        {row.rowNo || idx + 1}
                      </td>

                      {/* 2. Item Code */}
                      <td className="py-2.5 px-3 font-mono font-semibold text-slate-800 dark:text-slate-200">
                        {row.itemCode || "-"}
                      </td>

                      {/* 3. Item Name */}
                      <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-slate-100">
                        {row.itemName || "-"}
                      </td>

                      {/* 4. Old Unit Price */}
                      <td className="py-2.5 px-3 text-left dir-ltr font-mono text-slate-500 dark:text-slate-400">
                        {formatCurrency(row.oldUnitPrice)}
                      </td>

                      {/* 5. New Unit Price */}
                      <td className="py-2.5 px-3 text-left dir-ltr font-mono font-bold">
                        {row.isPriced ? (
                          <span className="text-emerald-700 dark:text-emerald-400">
                            {formatCurrency(row.newUnitPrice)}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      {/* 6. Status Message */}
                      <td className="py-2.5 px-3 text-xs">
                        {row.isPriced ? (
                          <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                            {row.statusMessage}
                          </span>
                        ) : (
                          <span className="text-amber-700 dark:text-amber-400 flex items-center gap-1 font-medium">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                            {row.statusMessage}
                          </span>
                        )}
                      </td>

                      {/* 7. Status Checkmark on the Left of the item (rightmost column in RTL) */}
                      <td className="py-2.5 px-3 text-center">
                        {row.isPriced ? (
                          <div
                            title="ریالی شد"
                            className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 shadow-2xs border border-emerald-300 dark:border-emerald-700"
                          >
                            <Check className="w-4 h-4 stroke-[2.5]" />
                          </div>
                        ) : (
                          <div
                            title="ریالی نشد"
                            className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 border border-slate-300 dark:border-slate-700"
                          >
                            <X className="w-3.5 h-3.5 stroke-[2]" />
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {unpricedCount > 0 && pricedCount > 0 ? (
              <span>تنها اقلام تیک‌خورده (ریالی شده) در رسید انبار اعمال خواهند شد.</span>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              انصراف
            </button>
            <button
              type="button"
              disabled={pricedCount === 0 || isLoading}
              onClick={() => onApply(results)}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg text-white shadow-md transition-all ${
                pricedCount === 0 || isLoading
                  ? "bg-slate-400 dark:bg-slate-700 cursor-not-allowed opacity-60"
                  : "bg-teal-600 hover:bg-teal-700 active:scale-95"
              }`}
            >
              <Check className="w-4 h-4" />
              <span>اعمال قیمت‌ها بر روی رسید انبار ({pricedCount} کالا)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
