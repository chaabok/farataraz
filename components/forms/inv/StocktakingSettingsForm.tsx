"use client";

import React, { useState, useEffect, useMemo } from "react";
import { SimpleFormTwoRowTabbed } from "../SimpleFormTwoRowTabbed";
import { FieldConfig } from "../SimpleFormTwoRow";
import { TabCellRow, TabCellConfig } from "../TabCellRow";
import { useToast } from "@/components/ToastProvider";
import { useFormUsageCheck } from "@/hooks/useFormUsageCheck";
import { Settings, Building2, Filter } from "lucide-react";
import { NumberInput } from "@/components/inputs/NumberInput";
import { TextInput } from "@/components/inputs/TextInput";
import { apiFetch } from "@/lib/utils";

export interface WarehouseItem {
  id: number | string;
  code: string | number;
  title: string;
  type: string;
  selected: boolean;
}

export interface StocktakingSettingsFormProps {
  id?: string;
  tabId?: string;
  isReadonly?: boolean;
  onSuccess?: () => void;
}

export default function StocktakingSettingsForm({
  id,
  tabId,
  isReadonly = false,
  onSuccess,
}: StocktakingSettingsFormProps) {
  const { showToast } = useToast();
  const { isUsed } = useFormUsageCheck(id, "StocktakingSettings");

  // Form State
  const [values, setValues] = useState<Record<string, any>>({
    MethodName: "",
    CountTimes: "1", // "1", "2", "3"
    CountWithTrackingFactors: false,

    // Count 1
    Count1MinQty: 0,
    Count1MinRial: 0,
    Count1MinTurnover: 0,

    // Count 2
    Count2ListType: "all_first", // "all_first" | "discrepancy_first_inv"
    Count2DiscrepancyPercent: 0,

    // Count 3
    Count3CombineType: "OR", // "OR" | "AND"
    Count3DiscrepancyPercent: 0,
    Count3Discrepancy1And2: false,
    Count3Discrepancy1AndInv: false,
    Count3Discrepancy2AndInv: false,
  });

  // Warehouses State
  const [warehouses, setWarehouses] = useState<WarehouseItem[]>([]);

  // Filters for warehouse grid
  const [warehouseFilters, setWarehouseFilters] = useState({
    code: "",
    title: "",
    type: "",
  });

  // Fetch real warehouses and existing setting ONLY if explicit id prop is provided
  useEffect(() => {
    async function loadData() {
      try {
        const whRes = await apiFetch("/api/inv/warehouses").catch(() => null);

        let whData: any[] = [];
        if (whRes && whRes.ok) {
          try {
            const parsed = await whRes.json();
            if (Array.isArray(parsed)) whData = parsed;
            else if (parsed && Array.isArray(parsed.items)) whData = parsed.items;
          } catch (e) {}
        }

        const selectedWhIds = new Set<number>();

        const settingRes = await apiFetch("/api/inv/stocktaking-settings").catch(() => null);
        let settingData: any = null;
        if (settingRes && settingRes.ok) {
          try {
            settingData = await settingRes.json();
          } catch (e) {}
        }

        const list = Array.isArray(settingData) ? settingData : (settingData ? [settingData] : []);
        const activeSetting = id
          ? list.find((s: any) => String(s.StocktakingSettingID || s.id) === String(id))
          : list[0];

        if (activeSetting) {
          setValues((prev) => ({
            ...prev,
            StocktakingSettingID: activeSetting.StocktakingSettingID || activeSetting.id,
            MethodName: activeSetting.MethodName || "",
            CountTimes: String(activeSetting.CountTimes || 1),
            CountWithTrackingFactors: Boolean(activeSetting.CountWithTrackingFactors),
            Count1MinQty: Number(activeSetting.Count1MinQty || 0),
            Count1MinRial: Number(activeSetting.Count1MinRial || 0),
            Count1MinTurnover: Number(activeSetting.Count1MinTurnover || 0),
            Count2ListType: activeSetting.Count2ListType || "all_first",
            Count2DiscrepancyPercent: Number(activeSetting.Count2DiscrepancyPercent || 0),
            Count3CombineType: activeSetting.Count3CombineType || "OR",
            Count3DiscrepancyPercent: Number(activeSetting.Count3DiscrepancyPercent || 0),
            Count3Discrepancy1And2: Boolean(activeSetting.Count3Discrepancy1And2),
            Count3Discrepancy1AndInv: Boolean(activeSetting.Count3Discrepancy1AndInv),
            Count3Discrepancy2AndInv: Boolean(activeSetting.Count3Discrepancy2AndInv),
          }));

          if (Array.isArray(activeSetting.warehouses)) {
            activeSetting.warehouses.forEach((w: any) => selectedWhIds.add(Number(w.WarehouseRef)));
          }
        }

        if (Array.isArray(whData) && whData.length > 0) {
          const mapped = whData
            .map((w: any) => {
              const wId = Number(w.WarehouseID || w.id);
              if (!wId || isNaN(wId) || wId <= 0) return null;
              return {
                id: wId,
                code: String(w.WarehouseCode || w.Code || w.code || wId),
                title: String(w.WarehouseTitle || w.WarehouseName || w.Title || w.title || `انبار ${wId}`),
                type: w.IsActive !== false ? "فعال" : "غیرفعال",
                selected: selectedWhIds.has(wId),
              };
            })
            .filter((w): w is WarehouseItem => w !== null);
          setWarehouses(mapped);
        } else {
          setWarehouses([]);
        }
      } catch (err) {
        // Fallback to defaults
      }
    }
    loadData();
  }, [id]);

  const handleChange = (name: string, value: any) => {
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Toggle single warehouse selection
  const handleToggleWarehouse = (id: number | string) => {
    if (isReadonly || isUsed) return;
    setWarehouses((prev) =>
      prev.map((w) => (w.id === id ? { ...w, selected: !w.selected } : w))
    );
  };

  // Select all warehouses
  const handleSelectAllWarehouses = () => {
    if (isReadonly || isUsed) return;
    setWarehouses((prev) => prev.map((w) => ({ ...w, selected: true })));
  };

  // Deselect all warehouses
  const handleDeselectAllWarehouses = () => {
    if (isReadonly || isUsed) return;
    setWarehouses((prev) => prev.map((w) => ({ ...w, selected: false })));
  };

  // Count of selected warehouses
  const selectedCount = useMemo(() => {
    return warehouses.filter((w) => w.selected).length;
  }, [warehouses]);

  // Filtered warehouses list
  const filteredWarehouses = useMemo(() => {
    return warehouses.filter((w) => {
      const matchCode =
        !warehouseFilters.code ||
        String(w.code).toLowerCase().includes(warehouseFilters.code.toLowerCase());
      const matchTitle =
        !warehouseFilters.title ||
        w.title.toLowerCase().includes(warehouseFilters.title.toLowerCase());
      const matchType =
        !warehouseFilters.type ||
        w.type.toLowerCase().includes(warehouseFilters.type.toLowerCase());
      return matchCode && matchTitle && matchType;
    });
  }, [warehouses, warehouseFilters]);

  const handleSave = async () => {
    try {
      if (!values.MethodName || !values.MethodName.trim()) {
        showToast("لطفاً عنوان روش انبارگردانی را وارد نمایید.", "error");
        return;
      }
      const selectedWarehouseIds = warehouses.filter((w) => w.selected).map((w) => Number(w.id));
      if (selectedWarehouseIds.length === 0) {
        showToast("انتخاب حداقل یک انبار برای روش انبارگردانی الزامی است.", "error");
        return;
      }
      const payload = {
        ...values,
        CountTimes: Number(values.CountTimes),
        warehouseIds: selectedWarehouseIds,
      };
      const isEdit = Boolean(values.StocktakingSettingID && Number(values.StocktakingSettingID) > 0);
      const url = isEdit
        ? `/api/inv/stocktaking-settings/${values.StocktakingSettingID}`
        : `/api/inv/stocktaking-settings`;
      const method = isEdit ? "PUT" : "POST";

      const res = await apiFetch(url, {
        method,
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const savedData = await res.json();
        const savedId = savedData?.StocktakingSettingID || savedData?.id;
        if (savedId) {
          setValues((prev) => ({ ...prev, StocktakingSettingID: Number(savedId) }));
        }
        showToast("تنظیمات انبارگردانی با موفقیت ذخیره شد.", "success");
        if (onSuccess) onSuccess();
      } else {
        const err = await res.json().catch(() => null);
        showToast(err?.message || "خطا در ذخیره تنظیمات انبارگردانی", "error");
      }
    } catch (err: any) {
      showToast(err?.message || "خطا در ذخیره تنظیمات انبارگردانی", "error");
    }
  };

  const handleSaveNew = () => {
    handleSave();
    handleNew();
  };

  const handleSaveClose = () => {
    handleSave();
  };

  const handleNew = () => {
    setValues({
      StocktakingSettingID: undefined,
      MethodName: "روش انبارگردانی",
      CountTimes: "1",
      CountWithTrackingFactors: false,
      Count1MinQty: 0,
      Count1MinRial: 0,
      Count1MinTurnover: 0,
      Count2ListType: "all_first",
      Count2DiscrepancyPercent: 0,
      Count3CombineType: "OR",
      Count3DiscrepancyPercent: 0,
      Count3Discrepancy1And2: false,
      Count3Discrepancy1AndInv: false,
      Count3Discrepancy2AndInv: false,
    });
    setWarehouses((prev) => prev.map((w) => ({ ...w, selected: false })));
  };

  const handleDelete = async () => {
    if (!values.StocktakingSettingID) {
      handleNew();
      return;
    }
    try {
      const res = await apiFetch(`/api/inv/stocktaking-settings/${values.StocktakingSettingID}`, {
        method: "DELETE",
      });
      if (res.ok) {
        showToast("تنظیمات انبارگردانی با موفقیت حذف شد.", "success");
        handleNew();
        if (onSuccess) onSuccess();
      } else {
        const err = await res.json().catch(() => null);
        showToast(err?.message || "خطا در حذف تنظیمات انبارگردانی", "error");
      }
    } catch (err: any) {
      showToast(err?.message || "خطا در حذف تنظیمات انبارگردانی", "error");
    }
  };

  // Active state flags for count groups
  const isCount2Active = values.CountTimes === "2" || values.CountTimes === "3";
  const isCount3Active = values.CountTimes === "3";

  // Form Fields Definition
  const fields: FieldConfig[] = [
    {
      name: "TopRowSettings",
      type: "custom",
      colSpan: 2,
      noWrapper: true,
      customComponent: (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full pb-2 items-center">
          {/* Column 1 (Right): روش انبارگردانی (هم‌تراز با لیست کالاهای شمارش اول) */}
          <div className="w-full">
            <TextInput
              id="MethodName"
              name="MethodName"
              label="روش :"
              value={values.MethodName}
              onChange={(val) => handleChange("MethodName", val)}
              disabled={isReadonly || isUsed}
              required={true}
              labelWidth="50px"
              className="text-xs"
              placeholder="روش انبارگردانی"
            />
          </div>

          {/* Column 2 (Middle): دفعات شمارش */}
          <div className="flex items-center gap-3 text-xs select-none">
            <span className="font-medium text-slate-300 dark:text-slate-300 shrink-0">
              دفعات شمارش :
            </span>
            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="CountTimes"
                  value="1"
                  checked={values.CountTimes === "1"}
                  onChange={(e) => handleChange("CountTimes", e.target.value)}
                  disabled={isReadonly || isUsed}
                  className="w-3.5 h-3.5 text-blue-600 bg-slate-800 border-slate-600 focus:ring-blue-500"
                />
                <span className="text-slate-300 dark:text-slate-300">یک</span>
              </label>
              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="CountTimes"
                  value="2"
                  checked={values.CountTimes === "2"}
                  onChange={(e) => handleChange("CountTimes", e.target.value)}
                  disabled={isReadonly || isUsed}
                  className="w-3.5 h-3.5 text-blue-600 bg-slate-800 border-slate-600 focus:ring-blue-500"
                />
                <span className="text-slate-300 dark:text-slate-300">دو</span>
              </label>
              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="CountTimes"
                  value="3"
                  checked={values.CountTimes === "3"}
                  onChange={(e) => handleChange("CountTimes", e.target.value)}
                  disabled={isReadonly || isUsed}
                  className="w-3.5 h-3.5 text-blue-600 bg-slate-800 border-slate-600 focus:ring-blue-500"
                />
                <span className="text-slate-300 dark:text-slate-300">سه</span>
              </label>
            </div>
          </div>

          {/* Column 3 (Left): شمارش برای کالا با عاملهای ردیابی دارای گردش (در ردیف اول سمت چپ دفعات شمارش) */}
          <div className="flex items-center gap-2 py-1 select-none">
            <label className="inline-flex items-center gap-2 cursor-pointer text-xs">
              <input
                type="checkbox"
                id="CountWithTrackingFactors"
                name="CountWithTrackingFactors"
                checked={!!values.CountWithTrackingFactors}
                onChange={(e) =>
                  handleChange("CountWithTrackingFactors", e.target.checked)
                }
                disabled={isReadonly || isUsed}
                className="w-4 h-4 rounded border-slate-600 text-blue-600 bg-slate-800 focus:ring-blue-500"
              />
              <span className="text-slate-200 dark:text-slate-200 font-medium">
                شمارش برای کالا با عاملهای ردیابی دارای گردش
              </span>
            </label>
          </div>
        </div>
      ),
    },
    {
      name: "ThreeCountBoxes",
      type: "custom",
      colSpan: 2,
      noWrapper: true,
      customComponent: (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full pt-1 pb-2">
          {/* Box 1 (Right): لیست کالاهای شمارش اول */}
          <div className="relative rounded-lg border border-slate-700/80 dark:border-slate-700/80 p-3 bg-slate-900/30 dark:bg-slate-900/30 flex flex-col gap-2.5">
            <div className="text-[12px] font-semibold text-slate-200 dark:text-slate-200 border-b border-slate-700/60 pb-1.5 mb-0.5 text-center md:text-right">
              لیست کالاهای شمارش اول
            </div>
            <div className="flex flex-col gap-2">
              <NumberInput
                id="Count1MinQty"
                name="Count1MinQty"
                label="حداقل موجودی تعدادی :"
                value={values.Count1MinQty}
                onChange={(val) => handleChange("Count1MinQty", val)}
                disabled={isReadonly || isUsed}
                thousandsSeparator={true}
                min={0}
                labelWidth="130px"
                className="text-xs"
              />
              <NumberInput
                id="Count1MinRial"
                name="Count1MinRial"
                label="حداقل موجودی ریالی :"
                value={values.Count1MinRial}
                onChange={(val) => handleChange("Count1MinRial", val)}
                disabled={isReadonly || isUsed}
                thousandsSeparator={true}
                min={0}
                labelWidth="130px"
                className="text-xs"
              />
              <NumberInput
                id="Count1MinTurnover"
                name="Count1MinTurnover"
                label="حداقل گردش موجودی :"
                value={values.Count1MinTurnover}
                onChange={(val) => handleChange("Count1MinTurnover", val)}
                disabled={isReadonly || isUsed}
                thousandsSeparator={true}
                min={0}
                labelWidth="130px"
                className="text-xs"
              />
            </div>
          </div>

          {/* Box 2 (Middle): لیست کالاهای شمارش دوم */}
          <div
            className={`relative rounded-lg border border-slate-700/80 dark:border-slate-700/80 p-3 bg-slate-900/30 dark:bg-slate-900/30 flex flex-col gap-2.5 transition-opacity ${
              !isCount2Active ? "opacity-40 pointer-events-none select-none" : ""
            }`}
          >
            <div className="text-[12px] font-semibold text-slate-200 dark:text-slate-200 border-b border-slate-700/60 pb-1.5 mb-0.5 text-center md:text-right">
              لیست کالاهای شمارش دوم
            </div>
            <div className="flex flex-col gap-2 text-xs">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="Count2ListType"
                  value="all_first"
                  checked={values.Count2ListType === "all_first"}
                  onChange={(e) =>
                    handleChange("Count2ListType", e.target.value)
                  }
                  disabled={!isCount2Active || isReadonly || isUsed}
                  className="w-3.5 h-3.5 text-blue-600 bg-slate-800 border-slate-600 focus:ring-blue-500"
                />
                <span className="text-slate-300 dark:text-slate-300">
                  کلیه کالاهای شمارش اول
                </span>
              </label>

              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="Count2ListType"
                  value="discrepancy_first_inv"
                  checked={values.Count2ListType === "discrepancy_first_inv"}
                  onChange={(e) =>
                    handleChange("Count2ListType", e.target.value)
                  }
                  disabled={!isCount2Active || isReadonly || isUsed}
                  className="w-3.5 h-3.5 text-blue-600 bg-slate-800 border-slate-600 focus:ring-blue-500"
                />
                <span className="text-slate-300 dark:text-slate-300">
                  کالاهای مغایرت دار شمارش اول و موجودی
                </span>
              </label>

              <div className="pt-2">
                <NumberInput
                  id="Count2DiscrepancyPercent"
                  name="Count2DiscrepancyPercent"
                  label="درصد مغایرت:"
                  value={values.Count2DiscrepancyPercent}
                  onChange={(val) =>
                    handleChange("Count2DiscrepancyPercent", val)
                  }
                  disabled={!isCount2Active || isReadonly || isUsed}
                  min={0}
                  max={100}
                  labelWidth="90px"
                  className="text-xs"
                />
              </div>
            </div>
          </div>

          {/* Box 3 (Left): لیست کالاهای شمارش سوم */}
          <div
            className={`relative rounded-lg border border-slate-700/80 dark:border-slate-700/80 p-3 bg-slate-900/30 dark:bg-slate-900/30 flex flex-col gap-2 transition-opacity ${
              !isCount3Active ? "opacity-40 pointer-events-none select-none" : ""
            }`}
          >
            <div className="text-[12px] font-semibold text-slate-200 dark:text-slate-200 border-b border-slate-700/60 pb-1.5 mb-0.5 text-center md:text-right">
              لیست کالاهای شمارش سوم
            </div>

            <div className="flex flex-col gap-2 text-xs">
              <div className="flex items-center gap-3 py-0.5">
                <span className="font-medium text-slate-300 dark:text-slate-300">
                  نوع ترکیب:
                </span>
                <label className="inline-flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="Count3CombineType"
                    value="OR"
                    checked={values.Count3CombineType === "OR"}
                    onChange={(e) =>
                      handleChange("Count3CombineType", e.target.value)
                    }
                    disabled={!isCount3Active || isReadonly || isUsed}
                    className="w-3.5 h-3.5 text-blue-600 bg-slate-800 border-slate-600 focus:ring-blue-500"
                  />
                  <span className="text-slate-300 dark:text-slate-300">یا</span>
                </label>
                <label className="inline-flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="Count3CombineType"
                    value="AND"
                    checked={values.Count3CombineType === "AND"}
                    onChange={(e) =>
                      handleChange("Count3CombineType", e.target.value)
                    }
                    disabled={!isCount3Active || isReadonly || isUsed}
                    className="w-3.5 h-3.5 text-blue-600 bg-slate-800 border-slate-600 focus:ring-blue-500"
                  />
                  <span className="text-slate-300 dark:text-slate-300">و</span>
                </label>
              </div>

              <div>
                <NumberInput
                  id="Count3DiscrepancyPercent"
                  name="Count3DiscrepancyPercent"
                  label="درصد مغایرت:"
                  value={values.Count3DiscrepancyPercent}
                  onChange={(val) =>
                    handleChange("Count3DiscrepancyPercent", val)
                  }
                  disabled={!isCount3Active || isReadonly || isUsed}
                  min={0}
                  max={100}
                  labelWidth="90px"
                  className="text-xs"
                />
              </div>

              <div className="flex flex-col gap-1.5 pt-1">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!values.Count3Discrepancy1And2}
                    onChange={(e) =>
                      handleChange("Count3Discrepancy1And2", e.target.checked)
                    }
                    disabled={!isCount3Active || isReadonly || isUsed}
                    className="w-3.5 h-3.5 rounded border-slate-600 text-blue-600 bg-slate-800 focus:ring-blue-500"
                  />
                  <span className="text-slate-300 dark:text-slate-300">
                    کالاهای مغایرت دار شمارش اول و دوم
                  </span>
                </label>

                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!values.Count3Discrepancy1AndInv}
                    onChange={(e) =>
                      handleChange("Count3Discrepancy1AndInv", e.target.checked)
                    }
                    disabled={!isCount3Active || isReadonly || isUsed}
                    className="w-3.5 h-3.5 rounded border-slate-600 text-blue-600 bg-slate-800 focus:ring-blue-500"
                  />
                  <span className="text-slate-300 dark:text-slate-300">
                    کالاهای مغایرت دار شمارش اول و موجودی
                  </span>
                </label>

                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!values.Count3Discrepancy2AndInv}
                    onChange={(e) =>
                      handleChange("Count3Discrepancy2AndInv", e.target.checked)
                    }
                    disabled={!isCount3Active || isReadonly || isUsed}
                    className="w-3.5 h-3.5 rounded border-slate-600 text-blue-600 bg-slate-800 focus:ring-blue-500"
                  />
                  <span className="text-slate-300 dark:text-slate-300">
                    کالاهای مغایرت دار شمارش دوم و موجودی
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  // Configuration for warehouses TabCellRow
  const warehousesTabConfig: TabCellConfig[] = [
    {
      id: "warehouses_list",
      label: "انبارهای مرتبط",
      columns: [
        {
          key: "selected",
          header: "انتخاب",
          type: "checkbox",
          width: "70px",
          filterRender: () => (
            <div className="flex items-center justify-center">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
            </div>
          ),
        },
        {
          key: "code",
          header: "کد انبار",
          type: "text",
          width: "120px",
          filterRender: () => (
            <input
              type="text"
              placeholder="...شامل"
              value={warehouseFilters.code}
              onChange={(e) =>
                setWarehouseFilters((f) => ({ ...f, code: e.target.value }))
              }
              className="w-full px-2 py-0.5 text-[11px] bg-slate-900 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-blue-500"
            />
          ),
        },
        {
          key: "title",
          header: "عنوان انبار",
          type: "text",
          width: "250px",
          filterRender: () => (
            <input
              type="text"
              placeholder="...شامل"
              value={warehouseFilters.title}
              onChange={(e) =>
                setWarehouseFilters((f) => ({ ...f, title: e.target.value }))
              }
              className="w-full px-2 py-0.5 text-[11px] bg-slate-900 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-blue-500"
            />
          ),
        },
        {
          key: "type",
          header: "نوع انبار",
          type: "text",
          width: "140px",
          filterRender: () => (
            <input
              type="text"
              placeholder="...شامل"
              value={warehouseFilters.type}
              onChange={(e) =>
                setWarehouseFilters((f) => ({ ...f, type: e.target.value }))
              }
              className="w-full px-2 py-0.5 text-[11px] bg-slate-900 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-blue-500"
            />
          ),
        },
      ],
    },
  ];

  // Handle row updates from TabCellRow
  const handleTabCellChange = (updatedList: any[]) => {
    if (isReadonly || isUsed || !Array.isArray(updatedList)) return;
    setWarehouses((prev) =>
      prev.map((w) => {
        const match = updatedList.find((item) => item.id === w.id);
        return match ? { ...w, ...match } : w;
      })
    );
  };

  // Bottom Tabs Configuration
  const bottomTabs = [
    {
      id: "warehouses_tab",
      label: (
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-blue-400" />
          <span>انبارهای مرتبط ({selectedCount}) <span className="text-red-500 font-bold">*</span></span>
        </div>
      ),
      content: (
        <div className="flex flex-col h-full w-full bg-slate-900/60 dark:bg-slate-900/60 text-slate-200">
          {/* Header bar above grid */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 border-b border-slate-700/80 bg-slate-800/50 shrink-0">
            <span className="text-xs font-medium text-slate-200">
              انبارهای مجاز برای عملیات انبارگردانی را انتخاب نمایید <span className="text-red-500 font-bold">*</span>:
            </span>
            <div className="flex items-center gap-3 text-xs">
              <button
                type="button"
                onClick={handleSelectAllWarehouses}
                disabled={isReadonly || isUsed}
                className="text-blue-400 hover:text-blue-300 font-medium transition-colors cursor-pointer disabled:opacity-50"
              >
                انتخاب همه
              </button>
              <span className="text-slate-600">|</span>
              <button
                type="button"
                onClick={handleDeselectAllWarehouses}
                disabled={isReadonly || isUsed}
                className="text-red-400 hover:text-red-300 font-medium transition-colors cursor-pointer disabled:opacity-50"
              >
                عدم انتخاب همه
              </button>
            </div>
          </div>

          {/* TabCellRow component for warehouses grid with filter row below headers */}
          <div className="flex-1 overflow-hidden min-h-0">
            <TabCellRow
              tabs={warehousesTabConfig}
              value={filteredWarehouses}
              onChange={handleTabCellChange}
              hideHeader={true}
              hideAddButton={true}
              hideDeleteButton={true}
              hideCopyPaste={true}
              hideSumRow={true}
              isReadonly={isReadonly || isUsed}
            />
          </div>
        </div>
      ),
    },
  ];

  // List Columns for List Modal
  const listColumns = [
    { key: "StocktakingSettingID", header: "کد تنظیمات", label: "کد تنظیمات", width: 100 },
    { key: "MethodName", header: "روش انبارگردانی", label: "روش انبارگردانی" },
    { 
      key: "CountTimes", 
      header: "تعداد شمارش", 
      label: "تعداد شمارش",
      width: 120,
      renderItem: (item: any) => `${item.CountTimes || 1} شمارشی` 
    },
    { 
      key: "CountWithTrackingFactors", 
      header: "شمارش عوامل ردیابی", 
      label: "شمارش عوامل ردیابی",
      width: 150,
      renderItem: (item: any) => (item.CountWithTrackingFactors ? "بله" : "خیر") 
    },
  ];

  const handleListSelect = (item: any) => {
    if (!item) return;
    const selectedWhIds = new Set<number>();
    if (Array.isArray(item.warehouses)) {
      item.warehouses.forEach((w: any) => selectedWhIds.add(Number(w.WarehouseRef)));
    }

    setValues({
      StocktakingSettingID: item.StocktakingSettingID || item.id,
      MethodName: item.MethodName || "روش انبارگردانی",
      CountTimes: String(item.CountTimes || 1),
      CountWithTrackingFactors: Boolean(item.CountWithTrackingFactors),
      Count1MinQty: Number(item.Count1MinQty || 0),
      Count1MinRial: Number(item.Count1MinRial || 0),
      Count1MinTurnover: Number(item.Count1MinTurnover || 0),
      Count2ListType: item.Count2ListType || "all_first",
      Count2DiscrepancyPercent: Number(item.Count2DiscrepancyPercent || 0),
      Count3CombineType: item.Count3CombineType || "OR",
      Count3DiscrepancyPercent: Number(item.Count3DiscrepancyPercent || 0),
      Count3Discrepancy1And2: Boolean(item.Count3Discrepancy1And2),
      Count3Discrepancy1AndInv: Boolean(item.Count3Discrepancy1AndInv),
      Count3Discrepancy2AndInv: Boolean(item.Count3Discrepancy2AndInv),
    });

    setWarehouses((prev) =>
      prev.map((w) => ({
        ...w,
        selected: selectedWhIds.has(Number(w.id)),
      }))
    );
  };

  return (
    <SimpleFormTwoRowTabbed
      title="تنظیمات انبارگردانی"
      icon={<Settings className="w-4 h-4 text-white" />}
      fields={fields}
      values={values}
      onChange={handleChange}
      onSave={handleSave}
      onSaveNew={handleSaveNew}
      onSaveClose={handleSaveClose}
      onNew={handleNew}
      onDelete={handleDelete}
      isReadonly={isReadonly || isUsed}
      bottomTabs={bottomTabs}
      showListButton={true}
      listApiUrl="/api/inv/stocktaking-settings"
      listColumns={listColumns}
      listDisplayKey="MethodName"
      onListSelect={handleListSelect}
    />
  );
}
