"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { TabCellRow, TabCellConfig, TabCellColumn } from "@/components/forms/TabCellRow";
import { DateInput } from "@/components/inputs/DateInput";
import { CancelButton } from "@/components/buttons/CancelButton";
import { SaveButton } from "@/components/buttons/SaveButton";
import { Layers, Plus } from "lucide-react";
import { useToast } from "@/components/ToastProvider";
import { toEnglishDigits, apiFetch } from "@/lib/utils";
import { SingleSelectDropDown, SingleSelectColumn } from "@/components/inputs/SingleSelectDropDown";

export interface TrackingFactorItem {
  TrackingFactorID: number;
  TrackingFactorCode?: number;
  TrackingFactorName: string;
  TrackingFactorName2?: string | null;
  TrackingFactorType: number; // 1: integer, 2: decimal, 3: boolean, 4: date, 5: time, 6: string, 7: color, 8: range
  IsConstantValue?: boolean;
  DisplayPriority?: number;
  StartValue?: string | null;
  EndValue?: string | null;
  constantValues?: Array<{
    ConstantValueID: number;
    ValueTitle: string;
    ValueCode?: string;
  }>;
}

interface TrackingFactorModalProps {
  hasBase?: boolean;
  isOpen: boolean;
  onClose: () => void;
  itemName: string;
  itemCode?: string;
  trackingFactors: TrackingFactorItem[];
  initialValues?: any;
  initialQuantity?: number | string;
  originalQuantity?: number | string;
  receivedQuantity?: number | string;
  remainingQuantity?: number | string;
  onSave: (values: any, totalQty?: any) => void;
  isReadonly?: boolean;
  isWarehouseIssue?: boolean;
  itemRef?: number | string | null;
  warehouseRef?: number | string | null;
  formName?: string;
  documentId?: number | string | null;
  documentDate?: string | null;
}

interface RegisteredOptionItem {
  id: string | number;
  value: string;
  title: string;
  stock: number;
  lastDocDate: string;
  receiptNumber?: string;
  receiptDate?: string;
  quantity?: number;
  allValues?: any;
}

interface TrackingFactorCellWithDropdownProps {
  value: string;
  onChange: (val: string, selectedOptObj?: RegisteredOptionItem) => void;
  registeredOptions: RegisteredOptionItem[];
  placeholder?: string;
  disabled?: boolean;
  factorName: string;
  factorType?: number;
  showDropdownButton?: boolean;
  formName?: string;
  isWarehouseIssue?: boolean;
}

function TrackingFactorCellWithDropdown({
  value,
  onChange,
  registeredOptions,
  placeholder = "وارد یا انتخاب کنید...",
  disabled = false,
  factorName,
  factorType = 1,
  showDropdownButton = true,
  formName,
  isWarehouseIssue = false,
}: TrackingFactorCellWithDropdownProps) {
  const singleSelectColumns: SingleSelectColumn[] = useMemo(() => [
    {
      key: "value",
      label: "عنوان عامل ردیابی",
      width: 150,
      sortable: true,
    },
    {
      key: "stock",
      label: "موجودی",
      width: 100,
      sortable: true,
      renderItem: (item: any) => {
        const s = item.stock;
        if (s === undefined || s === null || s === "") return "-";
        const num = Number(s);
        if (isNaN(num)) return String(s);
        if (num <= 0) return "۰";
        return num.toLocaleString("fa-IR");
      },
    },
    {
      key: "lastDocDate",
      label: `تاریخ آخرین ${formName || (isWarehouseIssue ? "حواله انبار" : "رسید انبار")}`,
      width: 150,
      sortable: true,
      renderItem: (item: any) => item.lastDocDate || "-",
    },
  ], [formName, isWarehouseIssue]);

  const fType = Number(factorType || 1);

  const renderInputControl = () => {
    switch (fType) {
      case 1: // عدد ساده (Simple Integer)
        return (
          <input
            type="text"
            value={value || ""}
            onChange={(e) => {
              const clean = toEnglishDigits(e.target.value).replace(/\D/g, "");
              onChange(clean);
            }}
            disabled={disabled}
            placeholder={placeholder || "0"}
            className="w-full h-6 px-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded outline-none focus:border-blue-500 text-right dir-ltr font-mono"
          />
        );

      case 2: // عدد اعشاری (Decimal)
        return (
          <input
            type="text"
            value={value || ""}
            onChange={(e) => {
              const clean = toEnglishDigits(e.target.value).replace(/[^0-9.]/g, "");
              const parts = clean.split(".");
              const formatted = parts.length > 2 ? parts[0] + "." + parts.slice(1).join("") : clean;
              onChange(formatted);
            }}
            disabled={disabled}
            placeholder={placeholder || "0"}
            className="w-full h-6 px-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded outline-none focus:border-blue-500 text-right dir-ltr font-mono"
          />
        );

      case 3: // بولیین (Boolean)
        return (
          <select
            value={
              value === "true" || value === "1" || value === "بله"
                ? "true"
                : value === "false" || value === "0" || value === "خیر"
                ? "false"
                : ""
            }
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className="w-full h-6 px-1 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded outline-none text-right dir-rtl"
          >
            <option value="">انتخاب کنید...</option>
            <option value="true">بله</option>
            <option value="false">خیر</option>
          </select>
        );

      case 4: // تاریخ (Date)
        return (
          <div className="flex-1 min-w-0">
            <DateInput
              noWrapper
              value={value || ""}
              onChange={(val) => onChange(val || "")}
              disabled={disabled}
              className="w-full h-6 text-xs"
              checkFiscalYear={false}
              placeholder={placeholder || "YYYY/MM/DD"}
              outputFormat="dateString"
            />
          </div>
        );

      case 5: // ساعت (Time)
        return (
          <input
            type="time"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className="w-full h-6 px-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded outline-none focus:border-blue-500 text-center dir-ltr"
          />
        );

      case 7: // رنگ (Color)
        return (
          <div className="flex items-center gap-1 w-full">
            <input
              type="text"
              value={value || ""}
              onChange={(e) => onChange(e.target.value)}
              disabled={disabled}
              placeholder="#000000"
              className="w-full h-6 px-1 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded outline-none text-left dir-ltr font-mono"
            />
            <input
              type="color"
              value={value && /^#[0-9A-F]{6}$/i.test(value) ? value : "#3b82f6"}
              onChange={(e) => onChange(e.target.value)}
              disabled={disabled}
              className="w-5 h-5 rounded border cursor-pointer shrink-0"
            />
          </div>
        );

      case 6: // حرفی (Text)
      default:
        return (
          <input
            type="text"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            placeholder={placeholder}
            className="w-full h-6 px-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded outline-none focus:border-blue-500 text-right dir-rtl"
          />
        );
    }
  };

  const showPlusButton = showDropdownButton || registeredOptions.length > 0;

  return (
    <div className="relative w-full h-full p-0.5 flex items-center gap-1">
      <div className="flex-1 min-w-0">
        {renderInputControl()}
      </div>
      {showPlusButton && (
        <div className="shrink-0 flex items-center">
          <SingleSelectDropDown
            columns={singleSelectColumns}
            data={registeredOptions}
            valueKey="value"
            displayKey="value"
            onSelect={(selectedItem) => {
              if (selectedItem) {
                onChange(selectedItem.value, selectedItem);
              }
            }}
            disabled={disabled}
            noWrapper
            className="w-6 h-6"
            placeholder=""
            notFoundMessage="هیچ عامل ردیابی ثبت شده‌ای یافت نشد."
            trigger={(toggle, isOpen) => (
              <button
                type="button"
                title={`انتخاب ${factorName}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggle();
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                disabled={disabled}
                className={`p-1 flex items-center justify-center rounded border border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:border-blue-700 dark:text-blue-300 shrink-0 h-6 w-6 transition-colors ${
                  isOpen ? "ring-2 ring-blue-500 bg-blue-100 dark:bg-blue-900" : ""
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            )}
          />
        </div>
      )}
    </div>
  );
}

export function TrackingFactorModal({
  isOpen,
  onClose,
  itemName,
  itemCode,
  trackingFactors,
  initialValues,
  initialQuantity,
  originalQuantity,
  receivedQuantity,
  remainingQuantity,
  onSave,
  isReadonly = false,
  isWarehouseIssue = true,
  itemRef,
  warehouseRef,
  hasBase = false,
  formName,
  documentId,
  documentDate,
}: TrackingFactorModalProps) {
  const { showToast } = useToast();
  const [gridRows, setGridRows] = useState<any[]>([]);
  const [registeredReceiptTfs, setRegisteredReceiptTfs] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen && (itemRef || itemCode)) {
      const params = new URLSearchParams();
      if (itemRef) params.set("itemRef", String(itemRef));
      if (itemCode) params.set("itemCode", String(itemCode));
      if (warehouseRef) params.set("warehouseRef", String(warehouseRef));
      const url = `/api/inv/warehouse-receipts/registered-tracking-factors?${params.toString()}`;
      apiFetch(url)
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => {
          const list = Array.isArray(data) ? data : [];
          if (list.length === 0 && warehouseRef) {
            const fallbackParams = new URLSearchParams();
            if (itemRef) fallbackParams.set("itemRef", String(itemRef));
            if (itemCode) fallbackParams.set("itemCode", String(itemCode));
            return apiFetch(`/api/inv/warehouse-receipts/registered-tracking-factors?${fallbackParams.toString()}`)
              .then((r) => (r.ok ? r.json() : []))
              .then((fallbackData) => {
                setRegisteredReceiptTfs(Array.isArray(fallbackData) ? fallbackData : []);
              });
          }
          setRegisteredReceiptTfs(list);
        })
        .catch((err) => {
          console.error("Error fetching registered receipt tracking factors:", err);
          setRegisteredReceiptTfs([]);
        });
    }
  }, [isOpen, itemRef, itemCode, warehouseRef]);

  // Calculate total quantity from all rows in gridRows
  const totalQuantity = useMemo(() => {
    return gridRows.reduce((sum, row) => {
      const val = row?.Quantity;
      if (val === null || val === undefined || val === "") return sum;
      const num = parseFloat(String(val).replace(/,/g, ""));
      return isNaN(num) ? sum : sum + num;
    }, 0);
  }, [gridRows]);

  const formattedTotalQuantity = useMemo(() => {
    if (gridRows.length === 0) return "0";
    return Number.isInteger(totalQuantity)
      ? totalQuantity.toLocaleString("fa-IR")
      : totalQuantity.toLocaleString("fa-IR", { maximumFractionDigits: 4 });
  }, [totalQuantity, gridRows]);

  // Lock quantities when modal opens so saving/editing inside modal never mutates footer quantities
  const [lockedQty, setLockedQty] = useState<{
    original: number | string | null;
    received: number | string | null;
    remaining: number | string | null;
  }>({ original: null, received: null, remaining: null });

  useEffect(() => {
    if (isOpen) {
      const orig = originalQuantity !== undefined && originalQuantity !== null && originalQuantity !== "" ? originalQuantity : null;
      const rec = receivedQuantity !== undefined && receivedQuantity !== null && receivedQuantity !== "" ? receivedQuantity : null;
      const rem = remainingQuantity !== undefined && remainingQuantity !== null && remainingQuantity !== "" ? remainingQuantity : null;
      setLockedQty({
        original: orig,
        received: rec,
        remaining: rem,
      });
    }
  }, [isOpen]);

  const activeOrigQty = lockedQty.original ?? originalQuantity;
  const activeRecQty = lockedQty.received ?? receivedQuantity;
  const activeRemQty = lockedQty.remaining ?? remainingQuantity;

  const effectiveOriginalQty = useMemo(() => {
    if (activeOrigQty !== undefined && activeOrigQty !== null && activeOrigQty !== "") {
      const orig = parseFloat(String(activeOrigQty).replace(/,/g, ""));
      if (!isNaN(orig)) return orig;
    }
    if (activeRemQty !== undefined && activeRemQty !== null && activeRemQty !== "") {
      const rem = parseFloat(String(activeRemQty).replace(/,/g, ""));
      const rec = activeRecQty !== undefined && activeRecQty !== null && activeRecQty !== "" ? parseFloat(String(activeRecQty).replace(/,/g, "")) : 0;
      return !isNaN(rem) ? rem + (isNaN(rec) ? 0 : rec) : null;
    }
    return null;
  }, [activeOrigQty, activeRemQty, activeRecQty]);

  const effectiveReceivedQty = useMemo(() => {
    if (activeRecQty !== undefined && activeRecQty !== null && activeRecQty !== "") {
      const rec = parseFloat(String(activeRecQty).replace(/,/g, ""));
      if (!isNaN(rec)) return rec;
    }
    if (effectiveOriginalQty !== null && activeRemQty !== undefined && activeRemQty !== null && activeRemQty !== "") {
      const orig = parseFloat(String(effectiveOriginalQty).replace(/,/g, ""));
      const rem = parseFloat(String(activeRemQty).replace(/,/g, ""));
      if (!isNaN(orig) && !isNaN(rem)) {
        return Math.max(0, orig - rem);
      }
    }
    return 0;
  }, [activeRecQty, effectiveOriginalQty, activeRemQty]);

  const effectiveRemainingQty = useMemo(() => {
    if (activeRemQty !== undefined && activeRemQty !== null && activeRemQty !== "") {
      const rem = parseFloat(String(activeRemQty).replace(/,/g, ""));
      if (!isNaN(rem)) return rem;
    }
    if (initialQuantity !== undefined && initialQuantity !== null && initialQuantity !== "") {
      const init = parseFloat(String(initialQuantity).replace(/,/g, ""));
      if (!isNaN(init)) return init;
    }
    return null;
  }, [activeRemQty, initialQuantity]);

  const formattedOriginalQty = useMemo(() => {
    if (effectiveOriginalQty === null || effectiveOriginalQty === undefined || effectiveOriginalQty === "") return null;
    const num = parseFloat(String(effectiveOriginalQty).replace(/,/g, ""));
    return isNaN(num) ? null : (Number.isInteger(num) ? num.toLocaleString("fa-IR") : num.toLocaleString("fa-IR", { maximumFractionDigits: 4 }));
  }, [effectiveOriginalQty]);

  const formattedReceivedQty = useMemo(() => {
    if (effectiveReceivedQty === null || effectiveReceivedQty === undefined || effectiveReceivedQty === "") return null;
    const num = parseFloat(String(effectiveReceivedQty).replace(/,/g, ""));
    return isNaN(num) ? null : (Number.isInteger(num) ? num.toLocaleString("fa-IR") : num.toLocaleString("fa-IR", { maximumFractionDigits: 4 }));
  }, [effectiveReceivedQty]);

  const formattedRemainingQty = useMemo(() => {
    if (effectiveRemainingQty === null || effectiveRemainingQty === undefined || effectiveRemainingQty === "") return null;
    const num = parseFloat(String(effectiveRemainingQty).replace(/,/g, ""));
    return isNaN(num) ? null : (Number.isInteger(num) ? num.toLocaleString("fa-IR") : num.toLocaleString("fa-IR", { maximumFractionDigits: 4 }));
  }, [effectiveRemainingQty]);

  // Sort tracking factors by DisplayPriority ascending
  const sortedFactors = useMemo(
    () =>
      [...trackingFactors].sort(
        (a, b) => (a.DisplayPriority || 1) - (b.DisplayPriority || 1)
      ),
    [trackingFactors]
  );

  const [baseRangesMap, setBaseRangesMap] = useState<Record<string, { start: string; end: string }>>({});

  const validateRangeViaAjax = async (
    userStart: string,
    userEnd: string,
    baseStart: string,
    baseEnd: string,
    factorName?: string
  ) => {
    try {
      const response = await apiFetch("/api/inv/tracking-factors/validate-range", {
        method: "POST",
        body: JSON.stringify({
          userStart,
          userEnd,
          baseStart,
          baseEnd,
          factorName,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        return data;
      }
    } catch (err) {
      console.error("AJAX range validation error:", err);
    }

    const normalize = (val?: string) => {
      if (!val) return "";
      return String(val)
        .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 1776))
        .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 1632))
        .replace(/,/g, "")
        .trim();
    };

    const uStart = normalize(userStart);
    const uEnd = normalize(userEnd);
    const bStart = normalize(baseStart);
    const bEnd = normalize(baseEnd);
    const fName = factorName ? ` (${factorName})` : "";

    if (bStart && bEnd && /^\d+$/.test(bStart) && /^\d+$/.test(bEnd)) {
      const bStartNum = BigInt(bStart);
      const bEndNum = BigInt(bEnd);

      if (uStart && /^\d+$/.test(uStart)) {
        const uStartNum = BigInt(uStart);
        if (uStartNum < bStartNum || uStartNum > bEndNum) {
          return {
            valid: false,
            message: `مقدار "از سریال" (${userStart})${fName} خارج از بازه فرم مبنا (${baseStart} تا ${baseEnd}) است.`,
          };
        }
      }

      if (uEnd && /^\d+$/.test(uEnd)) {
        const uEndNum = BigInt(uEnd);
        if (uEndNum > bEndNum || uEndNum < bStartNum) {
          return {
            valid: false,
            message: `مقدار "تا سریال" (${userEnd})${fName} خارج از بازه فرم مبنا (${baseStart} تا ${baseEnd}) است.`,
          };
        }
      }
    }

    return { valid: true, message: "بازه معتبر است." };
  };

  const extractRangeFromRow = (row: any, factorKey: string) => {
    if (!row || typeof row !== "object") return null;

    const startKey = `${factorKey}_Start`;
    const endKey = `${factorKey}_End`;

    let sVal = row[startKey] !== undefined && row[startKey] !== null ? String(row[startKey]) : "";
    let eVal = row[endKey] !== undefined && row[endKey] !== null ? String(row[endKey]) : "";

    if (!sVal && !eVal && row[factorKey] !== undefined && row[factorKey] !== null) {
      const val = row[factorKey];
      if (typeof val === "object" && val !== null) {
        sVal = (val.Start || val.start || val.from || "")?.toString() || "";
        eVal = (val.End || val.end || val.to || "")?.toString() || "";
      } else if (typeof val === "string" && val.includes("-")) {
        const parts = val.split("-");
        sVal = parts[0]?.trim() || "";
        eVal = parts[1]?.trim() || "";
      } else if (val !== undefined && val !== null && String(val).trim() !== "") {
        sVal = String(val).trim();
        eVal = String(val).trim();
      }
    }

    const cleanStart = toEnglishDigits(sVal).trim();
    const cleanEnd = toEnglishDigits(eVal).trim();

    if (cleanStart && cleanEnd && /^\d+$/.test(cleanStart) && /^\d+$/.test(cleanEnd)) {
      return {
        start: BigInt(cleanStart),
        end: BigInt(cleanEnd),
        startStr: cleanStart,
        endStr: cleanEnd,
      };
    }
    return null;
  };

  const getRegisteredRangesForFactor = (factorKey: string) => {
    const list: Array<{
      start: bigint;
      end: bigint;
      startStr: string;
      endStr: string;
      receiptNumber?: string;
      detailId?: number | string;
    }> = [];

    registeredReceiptTfs.forEach((item) => {
      const tfVals = item.trackingFactorValues;
      if (!tfVals) return;
      const valRows = Array.isArray(tfVals) ? tfVals : [tfVals];

      valRows.forEach((vRow) => {
        const rng = extractRangeFromRow(vRow, factorKey);
        if (rng) {
          list.push({
            ...rng,
            receiptNumber: item.receiptNumber ? String(item.receiptNumber) : "",
            detailId: item.detailId,
          });
        }
      });
    });

    return list;
  };

  useEffect(() => {
    if (isOpen && hasBase) {
      const rangeFactors = sortedFactors.filter((tf) => tf.TrackingFactorType === 8);
      if (rangeFactors.length > 0) {
        const map: Record<string, { start: string; end: string }> = {};
        const initRows = Array.isArray(initialValues) ? initialValues : (initialValues ? [initialValues] : []);
        const initRow = initRows[0] || {};

        rangeFactors.forEach((tf) => {
          const factorKey = String(tf.TrackingFactorID);
          let sVal = initRow[`${factorKey}_Start`]?.toString() || "";
          let eVal = initRow[`${factorKey}_End`]?.toString() || "";

          if (!sVal && !eVal && initRow[factorKey]) {
            const bVal = initRow[factorKey];
            if (typeof bVal === "object" && bVal !== null) {
              sVal = (bVal.Start || bVal.start || bVal.from || "")?.toString() || "";
              eVal = (bVal.End || bVal.end || bVal.to || "")?.toString() || "";
            } else if (typeof bVal === "string" && bVal.includes("-")) {
              const parts = bVal.split("-");
              sVal = parts[0]?.trim() || "";
              eVal = parts[1]?.trim() || "";
            } else {
              sVal = String(bVal);
            }
          }

          map[factorKey] = {
            start: toEnglishDigits(sVal).trim(),
            end: toEnglishDigits(eVal).trim(),
          };
        });
        setBaseRangesMap(map);
      }
    }
  }, [isOpen, hasBase, sortedFactors, initialValues]);

  useEffect(() => {
    if (isOpen) {
      const processRow = (r: any) => {
        const row = { ...r };
        sortedFactors.forEach((tf) => {
          if (tf.TrackingFactorType === 8) {
            const factorKey = String(tf.TrackingFactorID);
            const startKey = `${factorKey}_Start`;
            const endKey = `${factorKey}_End`;

            if (row[startKey] === undefined && row[endKey] === undefined) {
              const baseVal = row[factorKey];
              if (baseVal && typeof baseVal === "object") {
                row[startKey] = baseVal.Start || baseVal.start || baseVal.from || "";
                row[endKey] = baseVal.End || baseVal.end || baseVal.to || "";
              } else if (typeof baseVal === "string" && baseVal.includes("-")) {
                const parts = baseVal.split("-");
                row[startKey] = parts[0]?.trim() || "";
                row[endKey] = parts[1]?.trim() || "";
              } else if (baseVal !== undefined && baseVal !== null) {
                row[startKey] = String(baseVal);
                row[endKey] = "";
              }
            }

            const cleanStart = toEnglishDigits(row[startKey] || "").trim();
            const cleanEnd = toEnglishDigits(row[endKey] || "").trim();
            const qtyVal = row.Quantity !== undefined && row.Quantity !== null && row.Quantity !== "" ? row.Quantity : (initialQuantity || 1);
            const qtyNum = parseFloat(toEnglishDigits(qtyVal).replace(/,/g, ""));

            if (cleanStart && cleanEnd && /^\d+$/.test(cleanStart) && /^\d+$/.test(cleanEnd)) {
              const startNum = parseInt(cleanStart, 10);
              const endNum = parseInt(cleanEnd, 10);
              if (endNum >= startNum) {
                row.Quantity = endNum - startNum + 1;
              }
            } else if (cleanStart && !cleanEnd && !isNaN(qtyNum) && qtyNum > 0 && /^\d+$/.test(cleanStart)) {
              const startNum = parseInt(cleanStart, 10);
              const calcEndNum = startNum + qtyNum - 1;
              row[endKey] = String(calcEndNum).padStart(cleanStart.length, "0");
            }
          }
        });
        return row;
      };

      const targetQty = remainingQuantity !== undefined && remainingQuantity !== null && remainingQuantity !== ""
        ? remainingQuantity
        : (initialQuantity !== undefined && initialQuantity !== null && initialQuantity !== "" ? initialQuantity : 1);

      const defaultQty = targetQty;

      // Helper to parse initialValues whether it is an array of raw DB factor objects or grid row objects
      const parseInitialValuesToRows = (initVals: any) => {
        if (!initVals) return [{ _id: Date.now().toString(), Quantity: defaultQty }];
        const list = Array.isArray(initVals) ? initVals : [initVals];
        if (list.length === 0) return [{ _id: Date.now().toString(), Quantity: defaultQty }];

        // Check if list consists of raw factor items from DB (e.g. [{ TrackingFactorRef: 5, FactorValue: "ABC" }])
        const isRawFactorList = list.every(
          (item) => item && typeof item === "object" && (item.TrackingFactorRef || item.TrackingFactorID)
        );

        if (isRawFactorList) {
          const combinedRow: any = { _id: Date.now().toString(), Quantity: defaultQty };
          list.forEach((item) => {
            const tfRef = String(item.TrackingFactorRef || item.TrackingFactorID);
            const val = item.FactorValue ?? item.factorValue ?? item.value ?? item.Value ?? "";
            if (item.CountedQuantity || item.quantity || item.Quantity) {
              combinedRow.Quantity = item.CountedQuantity || item.quantity || item.Quantity;
            }

            const tfDef = sortedFactors.find((f) => String(f.TrackingFactorID) === tfRef);
            if (tfDef && tfDef.TrackingFactorType === 8) {
              if (typeof val === "string" && val.includes("-")) {
                const parts = val.split("-");
                combinedRow[`${tfRef}_Start`] = parts[0]?.trim() || "";
                combinedRow[`${tfRef}_End`] = parts[1]?.trim() || "";
              } else {
                combinedRow[`${tfRef}_Start`] = String(val).trim();
                combinedRow[`${tfRef}_End`] = "";
              }
            } else {
              combinedRow[tfRef] = String(val).trim();
            }
          });
          return [combinedRow];
        }

        // Otherwise list is already an array of grid row objects
        return list.map((r, idx) => {
          const row = { ...r };
          if (row.Quantity === undefined || row.Quantity === null || row.Quantity === "") {
            row.Quantity = defaultQty;
          }
          if (!row._id && !row.id) {
            row._id = `${Date.now()}_${idx}`;
          }
          return row;
        });
      };

      const parsedRows = parseInitialValuesToRows(initialValues);
      setGridRows(parsedRows.map((r) => processRow(r)));
    }
  }, [isOpen, initialValues, initialQuantity, originalQuantity, remainingQuantity, sortedFactors]);

  const columns: TabCellColumn[] = useMemo(() => {
    const currentFormTitle = formName || (isWarehouseIssue ? "حواله انبار" : "رسید انبار");
    const targetNature = isWarehouseIssue || currentFormTitle === "حواله انبار" ? 2 : 1;

    const buildFactorOptions = (targetKey: string, tfItem: TrackingFactorItem): RegisteredOptionItem[] => {
      const extractVal = (vRow: any): string => {
        if (!vRow || typeof vRow !== "object") return "";

        const tfIdNum = Number(tfItem.TrackingFactorID);
        const tfName = (tfItem.TrackingFactorName || "").trim();

        // If vRow is an object with TrackingFactorRef or TrackingFactorID (e.g. { TrackingFactorRef: 5, FactorValue: "ABC" })
        const rowTfRef = vRow.TrackingFactorRef ?? vRow.TrackingFactorID ?? vRow.trackingFactorRef ?? vRow.trackingFactorId;
        if (rowTfRef !== undefined && rowTfRef !== null && Number(rowTfRef) === tfIdNum) {
          const val = vRow.FactorValue ?? vRow.factorValue ?? vRow.value ?? vRow.Value;
          if (val !== undefined && val !== null) return String(val).trim();
        }

        if (targetKey.endsWith("_Start")) {
          const baseK = targetKey.replace("_Start", "");
          const v = vRow[targetKey] ?? vRow[`${tfIdNum}_Start`] ?? vRow[`${tfName}_Start`] ?? vRow[baseK]?.Start ?? vRow.StartValue ?? vRow.startValue;
          return v !== undefined && v !== null ? String(v).trim() : "";
        }
        if (targetKey.endsWith("_End")) {
          const baseK = targetKey.replace("_End", "");
          const v = vRow[targetKey] ?? vRow[`${tfIdNum}_End`] ?? vRow[`${tfName}_End`] ?? vRow[baseK]?.End ?? vRow.EndValue ?? vRow.endValue;
          return v !== undefined && v !== null ? String(v).trim() : "";
        }

        // Direct key lookup by TrackingFactorID string or TrackingFactorName
        const directVal = vRow[targetKey] ?? vRow[String(tfIdNum)] ?? (tfName ? vRow[tfName] : undefined);
        if (directVal !== undefined && directVal !== null) {
          if (typeof directVal === "object" && directVal !== null) {
            return String(directVal.value || directVal.FactorValue || directVal.Value || "").trim();
          }
          return String(directVal).trim();
        }

        return "";
      };

      const groups = new Map<string, {
        valStr: string;
        receipts: Array<{ voucherId?: number; voucherNumber: string; dateJalali: string; quantity: number }>;
        issues: Array<{ voucherId?: number; voucherNumber: string; dateJalali: string; quantity: number }>;
        latestCompanionRow: any;
      }>();

      registeredReceiptTfs.forEach((item) => {
        const tfVals = item.trackingFactorValues;
        if (!tfVals) return;
        const valRows = Array.isArray(tfVals) ? tfVals : [tfVals];
        const vNature = Number(item.nature || 1);
        const vId = item.voucherId ? Number(item.voucherId) : undefined;
        const vNum = String(item.voucherNumber || item.receiptNumber || "");
        const vDate = String(item.voucherDateJalali || item.receiptDate || "");

        valRows.forEach((vRow) => {
          const valStr = extractVal(vRow);
          if (!valStr) return;

          if (!groups.has(valStr)) {
            groups.set(valStr, {
              valStr,
              receipts: [],
              issues: [],
              latestCompanionRow: vRow,
            });
          }

          const g = groups.get(valStr)!;
          const rowQty = Number(vRow.Quantity || item.quantity || 1);
          const entry = {
            voucherId: vId,
            voucherNumber: vNum,
            dateJalali: vDate,
            quantity: rowQty,
          };

          if (vNature === 2) {
            g.issues.push(entry);
          } else {
            g.receipts.push(entry);
          }
          g.latestCompanionRow = vRow;
        });
      });

      const options: RegisteredOptionItem[] = [];

      groups.forEach((g) => {
        const totalReceived = g.receipts.reduce((sum, r) => sum + (Number(r.quantity) || 0), 0);
        const totalIssued = g.issues.reduce((sum, i) => sum + (Number(i.quantity) || 0), 0);
        const netStock = totalReceived - totalIssued;
        const stock = netStock > 0 ? netStock : 0;

        const isStocktaking = formName === "StocktakingForm" || currentFormTitle === "شمارش انبارگردانی";
        const targetDocs = isStocktaking
          ? [...g.receipts, ...g.issues]
          : (targetNature === 2 ? g.issues : g.receipts);

        const priorDocs = targetDocs.filter((d) => {
          if (documentId) {
            const curId = Number(documentId);
            if (d.voucherId !== undefined && d.voucherId === curId) return false;
            if (documentDate && d.dateJalali) {
              if (d.dateJalali < documentDate) return true;
              if (d.dateJalali > documentDate) return false;
              if (d.voucherId !== undefined && curId !== undefined) {
                return d.voucherId < curId;
              }
              return false;
            }
            if (d.voucherId !== undefined && curId !== undefined) {
              return d.voucherId < curId;
            }
          }
          return true;
        });

        priorDocs.sort((a, b) => {
          if (a.dateJalali && b.dateJalali && a.dateJalali !== b.dateJalali) {
            return b.dateJalali.localeCompare(a.dateJalali);
          }
          return (b.voucherId || 0) - (a.voucherId || 0);
        });

        const latestPrior = priorDocs[0] || targetDocs[0];
        const lastDocDate = latestPrior?.dateJalali || "";
        const lastDocNumber = latestPrior?.voucherNumber || "";

        options.push({
          id: `${targetKey}_${g.valStr}`,
          value: g.valStr,
          title: g.valStr,
          stock,
          lastDocDate,
          receiptNumber: lastDocNumber,
          receiptDate: lastDocDate,
          quantity: stock > 0 ? stock : totalReceived || 1,
          allValues: g.latestCompanionRow,
        });
      });

      return options;
    };

    const factorCols: TabCellColumn[] = sortedFactors.flatMap((tf) => {
      const factorKey = String(tf.TrackingFactorID);
      const headerName = tf.TrackingFactorName;
      const isFactorDisabled = isReadonly || Boolean(hasBase && tf.TrackingFactorType !== 8);

      const handleCellSelection = (
        rowIndex: number,
        val: string,
        selectedOptObj?: RegisteredOptionItem,
        colKeyOverride?: string
      ) => {
        setGridRows((prevRows) => {
          const updated = [...prevRows];
          const curRow = { ...(updated[rowIndex] || {}) };
          const keyToSet = colKeyOverride || factorKey;
          curRow[keyToSet] = val;

          // In Warehouse Issue (isWarehouseIssue === true), selecting an item from dropdown auto-fills companion tracking factors.
          // In Warehouse Receipt (isWarehouseIssue === false), selecting an item from dropdown MUST ONLY set the selected factor column and NOT populate other tracking factor columns.
          if (isWarehouseIssue && selectedOptObj && selectedOptObj.allValues) {
            Object.keys(selectedOptObj.allValues).forEach((k) => {
              if (k !== "Quantity" && k !== "quantity") {
                curRow[k] = selectedOptObj.allValues[k];
              }
            });
            if (selectedOptObj.stock && (!curRow.Quantity || curRow.Quantity === 1)) {
              curRow.Quantity = selectedOptObj.stock;
            } else if (selectedOptObj.quantity && (!curRow.Quantity || curRow.Quantity === 1)) {
              curRow.Quantity = selectedOptObj.quantity;
            }
          }

          updated[rowIndex] = curRow;
          return updated;
        });
      };

      // 1. If IsConstantValue is true and has constant values list
      if (
        tf.IsConstantValue &&
        Array.isArray(tf.constantValues) &&
        tf.constantValues.length > 0
      ) {
        return [
          {
            key: factorKey,
            header: headerName,
            type: "custom",
            width: "160px",
            render: (row, rowIndex, onChange, cellVal) => (
              <select
                disabled={isFactorDisabled}
                value={cellVal || ""}
                onChange={(e) => onChange(e.target.value)}
                className="w-full h-8 px-2 text-xs border border-slate-300 rounded bg-white dark:bg-slate-800 disabled:bg-slate-100 disabled:opacity-60"
              >
                <option value="">انتخاب کنید...</option>
                {tf.constantValues?.map((cv: any) => (
                  <option key={cv.ConstantValueID || cv.ValueTitle} value={cv.ValueTitle}>
                    {cv.ValueTitle}
                  </option>
                ))}
              </select>
            ),
          },
        ];
      }

      // 2. Render factor inputs using type-aware TrackingFactorCellWithDropdown
      if (tf.TrackingFactorType === 8) {
        const startHeader = (tf.StartValue && tf.StartValue.trim()) ? tf.StartValue.trim() : "از سریال";
        const endHeader = (tf.EndValue && tf.EndValue.trim()) ? tf.EndValue.trim() : "تا سریال";
        const startOptions = buildFactorOptions(`${factorKey}_Start`, tf);
        const endOptions = buildFactorOptions(`${factorKey}_End`, tf);

        return [
          {
            key: `${factorKey}_Start`,
            header: startHeader,
            parentHeader: headerName,
            type: "custom",
            width: "150px",
            render: (row, rowIndex, onChange, cellVal) => (
              <TrackingFactorCellWithDropdown
                value={cellVal || ""}
                onChange={(newVal, optObj) => {
                  onChange(newVal);
                  if (optObj) handleCellSelection(rowIndex, newVal, optObj, `${factorKey}_Start`);
                }}
                registeredOptions={startOptions}
                disabled={isReadonly}
                factorName={startHeader}
                factorType={1} // Integer digits only
                formName={formName}
                isWarehouseIssue={isWarehouseIssue}
                showDropdownButton={!hasBase}
              />
            ),
          },
          {
            key: `${factorKey}_End`,
            header: endHeader,
            parentHeader: headerName,
            type: "custom",
            width: "150px",
            render: (row, rowIndex, onChange, cellVal) => (
              <TrackingFactorCellWithDropdown
                value={cellVal || ""}
                onChange={(newVal, optObj) => {
                  onChange(newVal);
                  if (optObj) handleCellSelection(rowIndex, newVal, optObj, `${factorKey}_End`);
                }}
                registeredOptions={endOptions}
                disabled={isReadonly}
                factorName={endHeader}
                factorType={1} // Integer digits only
                formName={formName}
                isWarehouseIssue={isWarehouseIssue}
                showDropdownButton={!hasBase}
              />
            ),
          },
        ];
      }

      const factorOptions = buildFactorOptions(factorKey, tf);

      return [
        {
          key: factorKey,
          header: headerName,
          type: "custom",
          width: tf.TrackingFactorType === 4 ? "170px" : tf.TrackingFactorType === 6 ? "180px" : "150px",
          render: (row, rowIndex, onChange, cellVal) => (
            <TrackingFactorCellWithDropdown
              value={cellVal || ""}
              onChange={(newVal, optObj) => {
                onChange(newVal);
                if (optObj) handleCellSelection(rowIndex, newVal, optObj);
              }}
              registeredOptions={factorOptions}
              disabled={isFactorDisabled}
              factorName={headerName}
              factorType={tf.TrackingFactorType}
              formName={formName}
              isWarehouseIssue={isWarehouseIssue}
              showDropdownButton={!hasBase}
            />
          ),
        },
      ];
    });

    return [
      {
        key: "Quantity",
        header: "تعداد / مقدار",
        type: "number",
        width: "120px",
        defaultValue: 1,
      },
      ...factorCols,
    ];
  }, [sortedFactors, isReadonly, isWarehouseIssue, registeredReceiptTfs, hasBase]);

  const tabsConfig: TabCellConfig[] = useMemo(
    () => [
      {
        id: "tf_factors",
        label: "اطلاعات عوامل ردیابی",
        columns,
      },
    ],
    [columns]
  );

  const handleGridRowsChange = (val: any) => {
    let rows: any[] = [];
    if (Array.isArray(val)) {
      rows = val;
    } else if (val && typeof val === "object" && val.tf_factors) {
      rows = val.tf_factors;
    }

    const rangeFactors = sortedFactors.filter((tf) => tf.TrackingFactorType === 8);

    if (rangeFactors.length > 0) {
      rows = rows.map((r, rowIndex) => {
        const row = { ...r };
        const prevRow = gridRows[rowIndex] || {};

        rangeFactors.forEach((tf) => {
          const factorKey = String(tf.TrackingFactorID);
          const startKey = `${factorKey}_Start`;
          const endKey = `${factorKey}_End`;

          const prevQty = prevRow.Quantity;
          const newQty = row.Quantity;
          const prevStart = prevRow[startKey];
          const newStart = row[startKey];
          const prevEnd = prevRow[endKey];
          const newEnd = row[endKey];

          const qtyChanged = String(newQty ?? "") !== String(prevQty ?? "");
          const startChanged = String(newStart ?? "") !== String(prevStart ?? "");
          const endChanged = String(newEnd ?? "") !== String(prevEnd ?? "");

          const cleanStart = toEnglishDigits(newStart || "").trim();
          const cleanEnd = toEnglishDigits(newEnd || "").trim();
          const qtyNum = parseFloat(
            toEnglishDigits(newQty !== undefined && newQty !== null ? String(newQty) : "").replace(/,/g, "")
          );

          const startHeader = tf.StartValue?.trim() || "از سریال";
          const endHeader = tf.EndValue?.trim() || "تا سریال";

          const isStartValid = /^\d+$/.test(cleanStart);
          const isEndValid = /^\d+$/.test(cleanEnd);

          if (endChanged) {
            // User specifically edited "تا سریال" (End) -> Calculate Quantity
            if (cleanStart && cleanEnd && isStartValid && isEndValid) {
              try {
                const sBig = BigInt(cleanStart);
                const eBig = BigInt(cleanEnd);

                if (eBig < sBig) {
                  showToast(
                    `مقدار ستون ${endHeader} (${cleanEnd}) نمی‌تواند از ستون ${startHeader} (${cleanStart}) کمتر باشد.`,
                    "warning"
                  );
                } else {
                  row.Quantity = Number(eBig - sBig + BigInt(1));
                }
              } catch (e) {}
            }
          } else if (qtyChanged || startChanged) {
            // User edited Quantity or "از سریال" (Start) -> Calculate "تا سریال" (End)
            if (cleanStart && isStartValid && !isNaN(qtyNum) && qtyNum > 0) {
              try {
                const sBig = BigInt(cleanStart);
                const qBig = BigInt(Math.floor(qtyNum));
                const calcEnd = sBig + qBig - BigInt(1);
                row[endKey] = calcEnd.toString().padStart(cleanStart.length, "0");
              } catch (e) {}
            } else if (cleanStart && cleanEnd && isStartValid && isEndValid) {
              try {
                const sBig = BigInt(cleanStart);
                const eBig = BigInt(cleanEnd);
                if (eBig >= sBig) {
                  row.Quantity = Number(eBig - sBig + BigInt(1));
                }
              } catch (e) {}
            }
          } else {
            // Unchanged or other columns changed -> sync based on what is filled
            if (cleanStart && cleanEnd && isStartValid && isEndValid) {
              try {
                const sBig = BigInt(cleanStart);
                const eBig = BigInt(cleanEnd);
                if (eBig >= sBig) {
                  row.Quantity = Number(eBig - sBig + BigInt(1));
                }
              } catch (e) {}
            } else if (cleanStart && !cleanEnd && isStartValid && !isNaN(qtyNum) && qtyNum > 0) {
              try {
                const sBig = BigInt(cleanStart);
                const qBig = BigInt(Math.floor(qtyNum));
                const calcEnd = sBig + qBig - BigInt(1);
                row[endKey] = calcEnd.toString().padStart(cleanStart.length, "0");
              } catch (e) {}
            }
          }

          if (hasBase) {
            const base = baseRangesMap[factorKey];
            if (base && (base.start || base.end)) {
              if (cleanStart || cleanEnd) {
                validateRangeViaAjax(cleanStart, cleanEnd, base.start, base.end, tf.TrackingFactorName).then((res) => {
                  if (!res.valid) {
                    showToast(res.message, "warning");
                  }
                });
              }
            }
          }
        });

        return row;
      });
    }

    setGridRows(rows);
  };

  const handleConfirm = async () => {
    const rangeFactors = sortedFactors.filter((tf) => tf.TrackingFactorType === 8);

    for (let rowIndex = 0; rowIndex < gridRows.length; rowIndex++) {
      const row = gridRows[rowIndex];

      for (const tf of rangeFactors) {
        const factorKey = String(tf.TrackingFactorID);
        const startKey = `${factorKey}_Start`;
        const endKey = `${factorKey}_End`;

        const startHeader = tf.StartValue?.trim() || "از سریال";
        const endHeader = tf.EndValue?.trim() || "تا سریال";

        const cleanStart = toEnglishDigits(row[startKey] || "").trim();
        const cleanEnd = toEnglishDigits(row[endKey] || "").trim();
        const qtyNum = parseFloat(
          toEnglishDigits(row.Quantity !== undefined && row.Quantity !== null ? row.Quantity : "").replace(/,/g, "")
        );

        if (cleanStart && cleanEnd && /^\d+$/.test(cleanStart) && /^\d+$/.test(cleanEnd)) {
          const uStartNum = BigInt(cleanStart);
          const uEndNum = BigInt(cleanEnd);

          if (uEndNum < uStartNum) {
            showToast(
              `در ردیف ${rowIndex + 1}، مقدار ستون ${endHeader} (${cleanEnd}) نمی‌تواند از ستون ${startHeader} (${cleanStart}) کمتر باشد.`,
              "error"
            );
            return;
          }

          if (!isNaN(qtyNum) && qtyNum > 0 && uEndNum - uStartNum + BigInt(1) !== BigInt(qtyNum)) {
            showToast(
              `در ردیف ${rowIndex + 1}، مقدار ستون ${endHeader} (${cleanEnd}) با تعداد (${qtyNum}) و ستون ${startHeader} (${cleanStart}) تناقض دارد.`,
              "error"
            );
            return;
          }

          if (hasBase) {
            const regRanges = getRegisteredRangesForFactor(factorKey);
            for (const reg of regRanges) {
              if (uStartNum <= reg.end && uEndNum >= reg.start) {
                showToast(
                  `در ردیف ${rowIndex + 1}، بازه سری ${cleanStart} تا ${cleanEnd} برای "${tf.TrackingFactorName}" قبلاً در اسناد ثبت شده (${reg.receiptNumber ? `شماره ${reg.receiptNumber}` : "فرم‌های قبلی"}) ثبت گردیده و امکان ثبت مجدد آن وجود ندارد.`,
                  "error"
                );
                return;
              }
            }
          }

          for (let otherIdx = 0; otherIdx < gridRows.length; otherIdx++) {
            if (otherIdx === rowIndex) continue;
            const otherRng = extractRangeFromRow(gridRows[otherIdx], factorKey);
            if (otherRng) {
              if (uStartNum <= otherRng.end && uEndNum >= otherRng.start) {
                showToast(
                  `در ردیف ${rowIndex + 1}، بازه سری ${cleanStart} تا ${cleanEnd} برای "${tf.TrackingFactorName}" با بازه ردیف ${otherIdx + 1} (${otherRng.startStr} تا ${otherRng.endStr}) تداخل دارد.`,
                  "error"
                );
                return;
              }
            }
          }

          if (hasBase) {
            const base = baseRangesMap[factorKey];
            if (base && (base.start || base.end)) {
              const res = await validateRangeViaAjax(
                cleanStart,
                cleanEnd,
                base.start,
                base.end,
                tf.TrackingFactorName
              );
              if (!res.valid) {
                showToast(`در ردیف ${rowIndex + 1}: ${res.message}`, "error");
                return;
              }
            }
          }
        } else if (cleanStart && !cleanEnd) {
          showToast(`در ردیف ${rowIndex + 1}، لطفاً مقدار ستون ${endHeader} را وارد کنید.`, "error");
          return;
        }
      }

      // Validate that tracking factor values in Warehouse Issue match registered receipt tracking factors if receipts exist
      if (isWarehouseIssue && registeredReceiptTfs.length > 0) {
        let hasAnyFactorValue = false;
        let isMatchedWithReceipt = false;

        sortedFactors.forEach((tf) => {
          const factorKey = String(tf.TrackingFactorID);
          if (row[factorKey] || row[`${factorKey}_Start`]) {
            hasAnyFactorValue = true;
          }
        });

        if (hasAnyFactorValue) {
          registeredReceiptTfs.forEach((recItem) => {
            const tfVals = recItem.trackingFactorValues;
            if (!tfVals) return;
            const valRows = Array.isArray(tfVals) ? tfVals : [tfVals];

            valRows.forEach((vRow) => {
              let matchCount = 0;
              let checkedCount = 0;

              sortedFactors.forEach((tf) => {
                const factorKey = String(tf.TrackingFactorID);
                const userVal = row[factorKey] || row[`${factorKey}_Start`];
                const recVal = vRow[factorKey] || vRow.factorValue || vRow.FactorValue || vRow.value;

                if (userVal) {
                  checkedCount++;
                  if (recVal && String(recVal).trim() === String(userVal).trim()) {
                    matchCount++;
                  }
                }
              });

              if (checkedCount > 0 && matchCount === checkedCount) {
                isMatchedWithReceipt = true;
              }
            });
          });

          if (!isMatchedWithReceipt) {
            showToast(
              `اطلاعات عامل ردیابی وارد شده در ردیف ${rowIndex + 1} با هیچ‌یک از رسیدهای انبار ثبت‌شده مطابقت ندارد. لطفاً از پلاس کنار ستون‌ها برای انتخاب از رسیدها استفاده کنید.`,
              "warning"
            );
          }
        }
      }
    }

    if (hasBase && effectiveRemainingQty !== null && effectiveRemainingQty !== undefined) {
      const remNum = typeof effectiveRemainingQty === "number" ? effectiveRemainingQty : parseFloat(String(effectiveRemainingQty).replace(/,/g, ""));
      if (!isNaN(remNum) && remNum >= 0 && totalQuantity > remNum) {
        showToast(
          `جمع تعداد ثبت شده (${totalQuantity.toLocaleString("fa-IR")}) نمی‌تواند از مانده قابل رسید سند مبنا (${remNum.toLocaleString("fa-IR")}) بیشتر باشد.`,
          "error"
        );
        return;
      }
    }

    const processedRows = gridRows.map((r) => {
      const row = { ...r };
      sortedFactors.forEach((tf) => {
        if (tf.TrackingFactorType === 8) {
          const factorKey = String(tf.TrackingFactorID);
          const startKey = `${factorKey}_Start`;
          const endKey = `${factorKey}_End`;
          if (row[startKey] !== undefined || row[endKey] !== undefined) {
            row[factorKey] = {
              Start: row[startKey] || "",
              End: row[endKey] || "",
            };
          }
        }
      });
      return row;
    });
    const totalQty = processedRows.reduce((sum, r) => sum + (Number(r.Quantity) || 0), 0);
    onSave(processedRows, totalQty);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        className="max-w-5xl w-[95vw] h-[64vh] max-h-[64vh] flex flex-col p-0 gap-0 overflow-hidden text-right rtl"
        onPointerDownOutside={(e) => {
          const target = e.target as HTMLElement;
          if (target && (target.closest('.fixed.z-\\[99999\\]') || target.closest('[data-radix-portal]') || target.closest('[data-portal]'))) {
            e.preventDefault();
          }
        }}
        onInteractOutside={(e) => {
          const target = e.target as HTMLElement;
          if (target && (target.closest('.fixed.z-\\[99999\\]') || target.closest('[data-radix-portal]') || target.closest('[data-portal]'))) {
            e.preventDefault();
          }
        }}
      >
        {/* Header */}
        <DialogHeader className="p-3 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex flex-row items-center justify-between text-right shrink-0">
          <DialogTitle className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>
              ثبت / انتخاب اطلاعات عوامل ردیابی
              {itemCode ? ` (${itemCode})` : ""} : {itemName}
            </span>
          </DialogTitle>
        </DialogHeader>

        {/* Content Body */}
        <div className="flex-1 min-h-0 w-full overflow-hidden flex flex-col p-2 bg-slate-50 dark:bg-slate-900">
          {sortedFactors.length === 0 ? (
            <div className="text-center text-sm text-slate-500 py-12">
              هیچ عامل ردیابی برای این کالا تعریف نشده است.
            </div>
          ) : (
            <TabCellRow
              tabs={tabsConfig}
              value={gridRows}
              onChange={handleGridRowsChange}
              isReadonly={isReadonly}
              hideHeader={true}
              footerLeftActions={
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-100 bg-slate-200/90 dark:bg-slate-700/90 px-3 py-1 rounded border border-slate-300 dark:border-slate-600 shadow-xs">
                  <span>جمع تعداد:</span>
                  <span className="font-mono text-blue-700 dark:text-blue-300 font-extrabold text-sm">
                    {formattedTotalQuantity}
                  </span>
                </div>
              }
            />
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="p-3 bg-slate-100 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex flex-row items-center justify-between gap-2 text-right shrink-0">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200 flex-wrap">
            {hasBase && formattedOriginalQty !== null && (
              <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-2 py-1 rounded shadow-2xs">
                <span className="text-slate-600 dark:text-slate-400">مقدار اولیه سند مبنا:</span>
                <span className="font-mono text-xs font-extrabold text-slate-800 dark:text-slate-100 dir-ltr">
                  {formattedOriginalQty}
                </span>
              </div>
            )}
            {hasBase && formattedReceivedQty !== null && (
              <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-2 py-1 rounded shadow-2xs">
                <span className="text-slate-600 dark:text-slate-400">مقدار عمل شده تاکنون:</span>
                <span className="font-mono text-xs font-extrabold text-amber-600 dark:text-amber-400 dir-ltr">
                  {formattedReceivedQty}
                </span>
              </div>
            )}
            {hasBase && formattedRemainingQty !== null && (
              <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-2 py-1 rounded shadow-2xs">
                <span className="text-slate-600 dark:text-slate-400">مانده قابل عمل:</span>
                <span className="font-mono text-xs font-extrabold text-emerald-600 dark:text-emerald-400 dir-ltr">
                  {formattedRemainingQty}
                </span>
              </div>
            )}
            <div className="flex items-center gap-1 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 px-2 py-1 rounded shadow-2xs">
              <span className="text-blue-900 dark:text-blue-300">جمع تعداد کل:</span>
              <span className="font-mono text-xs font-extrabold text-blue-700 dark:text-blue-300 dir-ltr">
                {formattedTotalQuantity}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <SaveButton
              onClick={handleConfirm}
              disabled={isReadonly || sortedFactors.length === 0}
              label="تایید و ثبت"
            />
            <CancelButton onClick={onClose} label="انصراف" />
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
