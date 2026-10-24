"use client";

import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Key, Scale, ArrowLeft } from "lucide-react";
import { toEnglishDigits, apiFetch } from "@/lib/utils";
import { NumberInput } from "./NumberInput";

export interface SubUnitItem {
  ItemSubUnitID?: number;
  SubUnitRef?: number;
  SubUnitName: string;
  MainToSubRatio: number; // ضریب تبدیل
  IsVariableRatio?: boolean | number; // 1 or true for variable ratio, 2 or false for fixed ratio
  TolerancePercent?: number; // درصد تلرانس
  ConversionFactor?: number;
  ratio?: number;
}

export interface SubUnitModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemId?: number | string;
  itemCode?: string | number;
  itemTitle?: string;
  primaryUnitName?: string; // واحد اصلی (مثلا: عدد)
  subUnits: SubUnitItem[];
  selectedSubUnitId?: number | string;
  initialSubQuantity?: number | string;
  initialMainQuantity?: number | string;
  onConfirm: (result: {
    subUnit: SubUnitItem;
    subQuantity: number;
    mainQuantity: number;
    fixedMainQuantity: number;
    ratioUsed: number;
    isVariable: boolean;
  }) => void;
  onSelectPrimaryUnit?: (result?: {
    fixedMainQuantity: number;
    subQuantity: number;
    ratioUsed: number;
    primaryUnitName: string;
  }) => void;
  isReadonly?: boolean;
}

export function SubUnitModal({
  isOpen,
  onClose,
  itemId,
  itemCode = "-",
  itemTitle = "-",
  primaryUnitName = "عدد",
  subUnits = [],
  selectedSubUnitId,
  initialSubQuantity = 1,
  initialMainQuantity,
  onConfirm,
  onSelectPrimaryUnit,
  isReadonly = false,
}: SubUnitModalProps) {
  const [mounted, setMounted] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [subQtyInput, setSubQtyInput] = useState<string>("1");
  const [variableMainQtyInput, setVariableMainQtyInput] = useState<string>("");
  const [fetchedSubUnits, setFetchedSubUnits] = useState<SubUnitItem[] | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Query item sub-units directly from DB API if itemId is provided
  useEffect(() => {
    if (isOpen && itemId && Number(itemId) > 0) {
      apiFetch(`/api/inv/items/${itemId}/sub-units`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            const mapped: SubUnitItem[] = data.map((su: any, idx: number) => {
              const r = su.MainToSubRatio !== undefined && su.MainToSubRatio !== null
                ? su.MainToSubRatio
                : su.ConversionFactor !== undefined && su.ConversionFactor !== null
                ? su.ConversionFactor
                : su.ratio;
              return {
                ItemSubUnitID: Number(su.ItemSubUnitID || su.SubUnitRef || (idx + 1)),
                SubUnitRef: Number(su.SubUnitRef || su.ItemSubUnitID || (idx + 1)),
                SubUnitName: su.SubUnitName || su.MeasurementUnitName || su.title || "فرعی",
                MainToSubRatio: Number(r) !== undefined && !isNaN(Number(r)) ? Number(r) : 1,
                IsVariableRatio: su.IsVariableRatio === 1 || su.IsVariableRatio === true || su.IsVariableRatio === "1" || String(su.IsVariableRatio).toLowerCase() === "true",
                TolerancePercent: Number(su.TolerancePercent || 0),
              };
            });
            setFetchedSubUnits(mapped);
          } else {
            setFetchedSubUnits(null);
          }
        })
        .catch(() => setFetchedSubUnits(null));
    } else {
      setFetchedSubUnits(null);
    }
  }, [isOpen, itemId]);

  // Merge & normalize active sub units
  const activeSubUnits = useMemo(() => {
    const rawList = (fetchedSubUnits && fetchedSubUnits.length > 0) ? fetchedSubUnits : subUnits;
    return rawList.map((su: any, idx: number) => {
      const r = su.MainToSubRatio !== undefined && su.MainToSubRatio !== null
        ? su.MainToSubRatio
        : su.ConversionFactor !== undefined && su.ConversionFactor !== null
        ? su.ConversionFactor
        : su.ratio;
      return {
        ...su,
        ItemSubUnitID: Number(su.ItemSubUnitID || su.SubUnitRef || (idx + 1)),
        SubUnitRef: Number(su.SubUnitRef || su.ItemSubUnitID || (idx + 1)),
        SubUnitName: su.SubUnitName || su.MeasurementUnitName || su.title || "فرعی",
        MainToSubRatio: Number(r) !== undefined && !isNaN(Number(r)) ? Number(r) : 1,
        IsVariableRatio: su.IsVariableRatio === 1 || su.IsVariableRatio === true || su.IsVariableRatio === "1" || String(su.IsVariableRatio).toLowerCase() === "true",
        TolerancePercent: Number(su.TolerancePercent || 0),
      };
    });
  }, [fetchedSubUnits, subUnits]);

  // Sync initial state when modal opens
  useEffect(() => {
    if (isOpen && activeSubUnits.length > 0) {
      // Find selected index
      let targetIdx = 0;
      if (selectedSubUnitId !== undefined && selectedSubUnitId !== null) {
        const found = activeSubUnits.findIndex(
          (u) =>
            u.ItemSubUnitID === Number(selectedSubUnitId) ||
            u.SubUnitRef === Number(selectedSubUnitId) ||
            u.SubUnitName === String(selectedSubUnitId)
        );
        if (found !== -1) targetIdx = found;
      }
      setSelectedIndex(targetIdx);

      // Initial sub quantity
      const initSub =
        initialSubQuantity !== undefined && initialSubQuantity !== null && initialSubQuantity !== ""
          ? String(initialSubQuantity)
          : "1";
      setSubQtyInput(initSub);

      // Initial main quantity
      const currentUnit = activeSubUnits[targetIdx];
      const ratio = currentUnit ? Number(currentUnit.MainToSubRatio || 1) : 1;
      const parsedSub = parseFloat(toEnglishDigits(initSub).replace(/,/g, "")) || 0;

      if (initialMainQuantity !== undefined && initialMainQuantity !== null && initialMainQuantity !== "") {
        setVariableMainQtyInput(String(initialMainQuantity));
      } else {
        setVariableMainQtyInput(String(parsedSub * ratio));
      }
    }
  }, [isOpen, selectedSubUnitId, initialSubQuantity, initialMainQuantity, activeSubUnits]);

  const selectedUnit = useMemo(() => {
    if (activeSubUnits.length === 0) return null;
    return activeSubUnits[selectedIndex] || activeSubUnits[0];
  }, [activeSubUnits, selectedIndex]);

  const isVariableRatio = useMemo(() => {
    if (!selectedUnit) return false;
    const v = selectedUnit.IsVariableRatio;
    return v === true || v === 1 || String(v) === "1" || String(v).toLowerCase() === "true";
  }, [selectedUnit]);

  // Calculations
  const currentRatio = useMemo(() => {
    if (!selectedUnit) return 1;
    const r = selectedUnit.MainToSubRatio !== undefined && selectedUnit.MainToSubRatio !== null
      ? selectedUnit.MainToSubRatio
      : selectedUnit.ConversionFactor !== undefined && selectedUnit.ConversionFactor !== null
      ? selectedUnit.ConversionFactor
      : selectedUnit.ratio;
    return Number(r) || 1;
  }, [selectedUnit]);

  const parsedSubQty = useMemo(() => {
    const clean = toEnglishDigits(subQtyInput).replace(/,/g, "");
    const num = parseFloat(clean);
    return isNaN(num) ? 0 : num;
  }, [subQtyInput]);

  // Fixed conversion result: Main Quantity = Sub Quantity * Ratio
  const fixedMainQty = useMemo(() => {
    return parsedSubQty * currentRatio;
  }, [parsedSubQty, currentRatio]);

  // Active main quantity to be submitted
  const effectiveMainQty = useMemo(() => {
    if (isVariableRatio) {
      const clean = toEnglishDigits(variableMainQtyInput).replace(/,/g, "");
      const num = parseFloat(clean);
      return isNaN(num) ? fixedMainQty : num;
    }
    return fixedMainQty;
  }, [isVariableRatio, variableMainQtyInput, fixedMainQty]);

  const handleSelectUnitRow = (idx: number) => {
    if (isReadonly) return;
    setSelectedIndex(idx);
    const targetUnit = activeSubUnits[idx];
    const ratio = targetUnit ? Number(targetUnit.MainToSubRatio || 1) : 1;
    setVariableMainQtyInput(String(parsedSubQty * ratio));
  };

  const handleSubQtyChange = (val: string) => {
    const clean = toEnglishDigits(val).replace(/[^0-9.]/g, "");
    setSubQtyInput(clean);

    // Update variable main qty automatically if sub qty changes
    const numSub = parseFloat(clean) || 0;
    setVariableMainQtyInput(String(numSub * currentRatio));
  };

  const handleVariableMainQtyChange = (val: string) => {
    const clean = toEnglishDigits(val).replace(/[^0-9.]/g, "");
    setVariableMainQtyInput(clean);
  };

  const handleConfirmSubmit = () => {
    if (!selectedUnit) return;
    onConfirm({
      subUnit: selectedUnit,
      subQuantity: parsedSubQty,
      mainQuantity: effectiveMainQty,
      fixedMainQuantity: fixedMainQty,
      ratioUsed: currentRatio,
      isVariable: isVariableRatio,
    });
    onClose();
  };

  const handleSelectPrimaryUnitClick = () => {
    if (onSelectPrimaryUnit) {
      onSelectPrimaryUnit({
        fixedMainQuantity: fixedMainQty,
        subQuantity: parsedSubQty,
        ratioUsed: currentRatio,
        primaryUnitName,
      });
    } else {
      // Default fallback: confirm with fixedMainQty and primary unit
      onConfirm({
        subUnit: {
          SubUnitName: primaryUnitName,
          MainToSubRatio: 1,
          IsVariableRatio: false,
          TolerancePercent: 0,
        },
        subQuantity: fixedMainQty,
        mainQuantity: fixedMainQty,
        fixedMainQuantity: fixedMainQty,
        ratioUsed: 1,
        isVariable: false,
      });
    }
    onClose();
  };

  if (!mounted) return null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[9999] pointer-events-auto flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs dir-rtl select-none"
          onClick={(e) => e.stopPropagation()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl border border-slate-300 dark:border-slate-700 w-full max-w-lg flex flex-col overflow-hidden pointer-events-auto text-right text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Title Bar */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-100 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-700">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm flex items-center gap-2">
                <Scale className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                واحدهای سنجش فرعی
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Top Item Summary Box */}
            <div className="p-3 bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700/80 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-200">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-500 dark:text-slate-400">کد کالا:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100 font-mono text-sm">{itemCode}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-500 dark:text-slate-400">واحد اصلی:</span>
                  <span className="font-bold text-blue-700 dark:text-blue-400 text-sm">{primaryUnitName}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-200">
                <span className="font-semibold text-slate-500 dark:text-slate-400">عنوان کالا:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{itemTitle}</span>
              </div>
            </div>

            {/* Sub-Units Data Grid Table */}
            <div className="p-3">
              <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center justify-between">
                <span>لیست واحدهای فرعی تعریف‌شده برای کالا:</span>
                <span className="text-[10px] text-slate-400">برای انتخاب، روی سطر کلیک کنید</span>
              </div>
              <div className="border border-slate-300 dark:border-slate-700 rounded overflow-hidden max-h-48 overflow-y-auto bg-white dark:bg-slate-900">
                <table className="w-full text-right border-collapse text-xs">
                  <thead className="sticky top-0 bg-slate-200/90 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold border-b border-slate-300 dark:border-slate-700">
                    <tr>
                      <th className="w-8 p-1.5 text-center"></th>
                      <th className="p-2 border-r border-slate-300 dark:border-slate-700">واحد سنجش فرعی</th>
                      <th className="p-2 border-r border-slate-300 dark:border-slate-700 text-center">ضریب تبدیل</th>
                      <th className="p-2 border-r border-slate-300 dark:border-slate-700 text-center">درصد تلرانس</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeSubUnits.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-4 text-center text-slate-400 text-xs">
                          هیچ واحد فرعی برای این کالا تعریف نشده است.
                        </td>
                      </tr>
                    ) : (
                      activeSubUnits.map((unit, idx) => {
                        const isSelected = selectedIndex === idx;
                        return (
                          <tr
                            key={unit.ItemSubUnitID || unit.SubUnitRef || idx}
                            onClick={() => handleSelectUnitRow(idx)}
                            className={`cursor-pointer transition-colors border-b border-slate-200 dark:border-slate-800 ${
                              isSelected
                                ? "bg-blue-600 text-white dark:bg-blue-700 font-medium"
                                : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200"
                            }`}
                          >
                            <td className="p-1.5 text-center">
                              {isSelected && <ArrowLeft className="w-3.5 h-3.5 inline-block text-amber-300" />}
                            </td>
                            <td className="p-2 border-r border-slate-200/40 dark:border-slate-700/50 font-bold">
                              {unit.SubUnitName}
                            </td>
                            <td className="p-2 border-r border-slate-200/40 dark:border-slate-700/50 text-center dir-ltr font-mono">
                              {Number(unit.MainToSubRatio || 1).toLocaleString("fa-IR")}
                            </td>
                            <td className="p-2 border-r border-slate-200/40 dark:border-slate-700/50 text-center dir-ltr font-mono">
                              {Number(unit.TolerancePercent || 0).toLocaleString("fa-IR")}%
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Calculations & Sub Quantity Input Area */}
            <div className="mx-3 mb-3 p-3 bg-slate-100 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700 rounded-md space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-1.5">
                <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                  مقدار بر مبنای <span className="text-blue-600 dark:text-blue-400">{primaryUnitName}</span>
                </span>
                {selectedUnit && (
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    نوع ضریب: {isVariableRatio ? "متغیر" : "ثابت"}
                  </span>
                )}
              </div>

              {/* Input for Sub Quantity */}
              <div className="w-full">
                <NumberInput
                  id="subUnitQuantityInput"
                  label={selectedUnit?.SubUnitName || "واحد فرعی"}
                  value={subQtyInput}
                  onChange={handleSubQtyChange}
                  disabled={isReadonly}
                  labelWidth="80px"
                  className="text-center font-mono h-7 text-xs bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:border-blue-500"
                />
              </div>

              {/* Conversion Values Display/Inputs */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                {/* Fixed Ratio Calculated Display */}
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                    با ضریب تبدیل ثابت
                  </span>
                  <div className="h-7 px-2 flex items-center justify-center font-mono text-xs font-bold bg-slate-200/70 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-slate-800 dark:text-slate-200 dir-ltr">
                    {fixedMainQty.toLocaleString("fa-IR", { maximumFractionDigits: 4 })}
                  </div>
                </div>

                {/* Variable Ratio Input */}
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                    با ضریب تبدیل متغیر
                  </span>
                  <input
                    type="text"
                    value={variableMainQtyInput}
                    onChange={(e) => handleVariableMainQtyChange(e.target.value)}
                    disabled={isReadonly || !isVariableRatio}
                    placeholder={fixedMainQty.toString()}
                    className={`h-7 px-2 font-mono text-center text-xs border rounded transition-colors dir-ltr ${
                      isVariableRatio
                        ? "bg-white dark:bg-slate-800 border-blue-400 focus:ring-1 focus:ring-blue-500 text-blue-700 dark:text-blue-300 font-bold"
                        : "bg-slate-200/50 dark:bg-slate-800/40 border-slate-300 dark:border-slate-700 text-slate-400 cursor-not-allowed"
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-between p-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/80 gap-2">
              <button
                type="button"
                onClick={handleSelectPrimaryUnitClick}
                disabled={isReadonly}
                className="px-3 py-1.5 text-xs font-medium text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 rounded-md hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Key className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                انتخاب واحد سنجش اصلی
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <X className="w-3.5 h-3.5 text-red-500" />
                  انصراف
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSubmit}
                  disabled={isReadonly || !selectedUnit}
                  className="px-4 py-1.5 text-xs font-medium text-white bg-green-600 dark:bg-green-700 hover:bg-green-700 dark:hover:bg-green-600 border border-green-600 dark:border-green-700 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs disabled:opacity-50"
                >
                  <Check className="w-4 h-4 text-white" />
                  تأیید
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
