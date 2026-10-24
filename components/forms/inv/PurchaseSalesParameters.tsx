"use client";

import React, { useState, useEffect, useMemo } from "react";
import { SimpleFormTwoRowTabbed } from "../SimpleFormTwoRowTabbed";
import { TabCellRow, TabCellConfig } from "../TabCellRow";
import { FieldConfig } from "../SimpleFormTwoRow";
import { CheckBoxRightLabel } from "@/components/inputs/CheckBoxRightLabel";
import { SlAccountDropDown } from "@/components/ui/SlAccountDropDown";
import { DateInput } from "@/components/inputs/DateInput";
import { MultiColumnDropDown, Column } from "@/components/inputs/MultiColumnDropdown";
import { Sliders } from "lucide-react";
import { useTabs } from "@/components/TabsProvider";
import { useToast } from "@/components/ToastProvider";
import { apiFetch } from "@/lib/utils";
import { useFormUpsert } from "@/hooks/useFormUpsert";
import { useFormUsageCheck } from "@/hooks/useFormUsageCheck";
import { eventBus, EVENTS } from "@/lib/events";

// 1. Enum Definition for System (سیستم)
export enum PurchaseSalesSystem {
  PROCUREMENT = 1, // تدارکات
  WAREHOUSE = 2,   // انبار
  SALES = 3,       // فروش
}

export const PURCHASE_SALES_SYSTEM_OPTIONS = [
  { value: String(PurchaseSalesSystem.PROCUREMENT), label: "تدارکات" },
  { value: String(PurchaseSalesSystem.WAREHOUSE), label: "انبار" },
  { value: String(PurchaseSalesSystem.SALES), label: "فروش" },
];

// 2. Enum Definition for Parameter Type (نوع پارامتر)
export enum ParameterTypeEnum {
  INCREASING = 1, // افزاینده
  DECREASING = 2, // کاهنده
  NEUTRAL = 3,    // خنثی
}

export const PARAMETER_TYPE_OPTIONS = [
  { value: String(ParameterTypeEnum.INCREASING), label: "افزاینده" },
  { value: String(ParameterTypeEnum.DECREASING), label: "کاهنده" },
  { value: String(ParameterTypeEnum.NEUTRAL), label: "خنثی" },
];

// 3. Enum Definition for Calculation Method (نحوه محاسبه)
export enum CalculationMethodEnum {
  TOTAL_SUM = 1,       // تاثیر روی جمع کل
  ROW_PRICE = 2,       // تاثیر بر قیمت ردیف سند
  QUANTITY_CHANGE = 3, // افزایش کاهش مقداری
}

export const CALCULATION_METHOD_OPTIONS = [
  { value: String(CalculationMethodEnum.TOTAL_SUM), label: "تاثیر روی جمع کل" },
  { value: String(CalculationMethodEnum.ROW_PRICE), label: "تاثیر بر قیمت ردیف سند" },
  { value: String(CalculationMethodEnum.QUANTITY_CHANGE), label: "افزایش کاهش مقداری" },
];

// 4. Enum Definition for Calculation Condition (شرط محاسبه)
export enum CalculationConditionEnum {
  NO_CONDITION = 1,     // بدون شرط
  SIMPLE_CONDITION = 2, // شرط ساده
  TIERED_CONDITION = 3, // شرط پلکانی
}

export const CALCULATION_CONDITION_OPTIONS = [
  { value: String(CalculationConditionEnum.NO_CONDITION), label: "بدون شرط" },
  { value: String(CalculationConditionEnum.SIMPLE_CONDITION), label: "شرط ساده" },
  { value: String(CalculationConditionEnum.TIERED_CONDITION), label: "شرط پلکانی" },
];

// 5. Enum Definition for Relation Type (نحوه ارتباط)
export enum RelationTypeEnum {
  INDEPENDENT = 1,                     // مستقل
  PRODUCT_SERVICE = 2,                 // کالا خدمت
  PRODUCT_PACK = 3,                    // پک محصول
  CUSTOMER = 4,                        // مشتری
  PRODUCT_SERVICE_CUSTOMER = 5,        // کالا خدمت و مشتری
  PRODUCT_PACK_CUSTOMER = 6,           // پک محصول و مشتری
  SUPPLIER = 7,                        // تامین کننده
  PRODUCT_SERVICE_SUPPLIER = 8,        // کالا خدمت و تامین کننده
  DELIVERY_LOCATION = 9,               // محل تحویل
  PAYMENT_METHOD = 10,                 // نحوه پرداخت
}

export const RELATION_TYPE_OPTIONS = [
  { value: String(RelationTypeEnum.INDEPENDENT), label: "مستقل" },
  { value: String(RelationTypeEnum.PRODUCT_SERVICE), label: "کالا خدمت" },
  { value: String(RelationTypeEnum.PRODUCT_PACK), label: "پک محصول" },
  { value: String(RelationTypeEnum.CUSTOMER), label: "مشتری" },
  { value: String(RelationTypeEnum.PRODUCT_SERVICE_CUSTOMER), label: "کالا خدمت و مشتری" },
  { value: String(RelationTypeEnum.PRODUCT_PACK_CUSTOMER), label: "پک محصول و مشتری" },
  { value: String(RelationTypeEnum.SUPPLIER), label: "تامین کننده" },
  { value: String(RelationTypeEnum.PRODUCT_SERVICE_SUPPLIER), label: "کالا خدمت و تامین کننده" },
  { value: String(RelationTypeEnum.DELIVERY_LOCATION), label: "محل تحویل" },
  { value: String(RelationTypeEnum.PAYMENT_METHOD), label: "نحوه پرداخت" },
];

export const getRelationTypeOptions = (isSales: boolean, isWarehouseOrProcurement: boolean) => {
  const allowedValues = new Set<number>([
    RelationTypeEnum.INDEPENDENT,       // مستقل
    RelationTypeEnum.PRODUCT_SERVICE,   // کالا خدمت
    RelationTypeEnum.PRODUCT_PACK,      // پک محصول
    RelationTypeEnum.DELIVERY_LOCATION, // محل تحویل
    RelationTypeEnum.PAYMENT_METHOD,    // نحوه پرداخت
  ]);

  if (isSales) {
    allowedValues.add(RelationTypeEnum.CUSTOMER);                 // مشتری
    allowedValues.add(RelationTypeEnum.PRODUCT_SERVICE_CUSTOMER); // کالا خدمت و مشتری
    allowedValues.add(RelationTypeEnum.PRODUCT_PACK_CUSTOMER);    // پک محصول و مشتری
  }

  if (isWarehouseOrProcurement) {
    allowedValues.add(RelationTypeEnum.SUPPLIER);                 // تامین کننده
    allowedValues.add(RelationTypeEnum.PRODUCT_SERVICE_SUPPLIER); // کالا خدمت و تامین کننده
  }

  if (!isSales && !isWarehouseOrProcurement) {
    return RELATION_TYPE_OPTIONS;
  }

  return RELATION_TYPE_OPTIONS.filter((opt) => allowedValues.has(Number(opt.value)));
};

// 6. Enum Definition for Operation Type (عملکرد)
export enum OperationTypeEnum {
  AMOUNT = 1,      // مبلغی
  QUANTITY = 2,    // مقداری
  PERCENTAGE = 3,  // درصدی
  UNIT_AMOUNT = 4, // مبلغ واحد
  ROUNDING = 5,    // روند
}

export const OPERATION_TYPE_OPTIONS = [
  { value: String(OperationTypeEnum.AMOUNT), label: "مبلغی" },
  { value: String(OperationTypeEnum.QUANTITY), label: "مقداری" },
  { value: String(OperationTypeEnum.PERCENTAGE), label: "درصدی" },
  { value: String(OperationTypeEnum.UNIT_AMOUNT), label: "مبلغ واحد" },
  { value: String(OperationTypeEnum.ROUNDING), label: "روند" },
];

// 7. Enum Definition for Amount Allocation Method (نحوه تسهیم مبلغ)
export enum AmountAllocationMethodEnum {
  BY_AMOUNT = 1,   // بر اساس مبلغ
  BY_QUANTITY = 2, // بر اساس مقدار
  EQUAL_RATIO = 3, // نسبت مساوی
}

export const AMOUNT_ALLOCATION_METHOD_OPTIONS = [
  { value: String(AmountAllocationMethodEnum.BY_AMOUNT), label: "بر اساس مبلغ" },
  { value: String(AmountAllocationMethodEnum.BY_QUANTITY), label: "بر اساس مقدار" },
  { value: String(AmountAllocationMethodEnum.EQUAL_RATIO), label: "نسبت مساوی" },
];

// 8. Enum Definition for Category Other (سایر)
export enum CategoryOtherEnum {
  VAT = 1,                       // مالیات ارزش افزوده
  MUNICIPAL_TAX = 2,             // عوارض ارزش افزوده
  DISCOUNT = 3,                  // تخفیف
  PERFORMANCE_GUARANTEE = 4,     // ضمانت حسن انجام کار
  PREPAYMENT = 5,                // پیش پرداخت
  ADVANCE_RECEIPT = 6,           // پیش دریافت
  INSURANCE_DEPOSIT = 7,         // سپرده بیمه
  OTHER = 8,                     // سایر
}

export const CATEGORY_OTHER_OPTIONS = [
  { value: String(CategoryOtherEnum.VAT), label: "مالیات ارزش افزوده" },
  { value: String(CategoryOtherEnum.MUNICIPAL_TAX), label: "عوارض ارزش افزوده" },
  { value: String(CategoryOtherEnum.DISCOUNT), label: "تخفیف" },
  { value: String(CategoryOtherEnum.PERFORMANCE_GUARANTEE), label: "ضمانت حسن انجام کار" },
  { value: String(CategoryOtherEnum.PREPAYMENT), label: "پیش پرداخت" },
  { value: String(CategoryOtherEnum.ADVANCE_RECEIPT), label: "پیش دریافت" },
  { value: String(CategoryOtherEnum.INSURANCE_DEPOSIT), label: "سپرده بیمه" },
  { value: String(CategoryOtherEnum.OTHER), label: "سایر" },
];

interface PurchaseSalesParametersProps {
  id?: number;
  tabId?: string;
  onSaved?: () => void;
}

export function PurchaseSalesParametersForm({ id, tabId, onSaved }: PurchaseSalesParametersProps) {
  const { showToast } = useToast();
  const { removeTab } = useTabs();
  const { activeId, setActiveId, method, getUrl, handleResponse } = useFormUpsert(id);
  const { isUsed } = useFormUsageCheck("PurchaseSalesParameter", activeId);

  const initialValues = {
    IsProcurement: false,
    IsWarehouse: true,
    IsSales: false,
    Title: "",
    Title2: "",
    CalculationPriority: 1, // default 1, can be duplicate
    PrintPriority: 1,       // default 1, cannot be duplicate
    ParameterType: ParameterTypeEnum.INCREASING,
    CalculationMethod: CalculationMethodEnum.TOTAL_SUM,
    CalculationCondition: CalculationConditionEnum.NO_CONDITION,
    RelationType: RelationTypeEnum.INDEPENDENT,
    OperationType: OperationTypeEnum.AMOUNT,
    AmountAllocationMethod: AmountAllocationMethodEnum.BY_AMOUNT,
    CategoryOther: CategoryOtherEnum.VAT,
    HasAccountingVoucher: false,
    SlAccountRef: null as any,
    IsNonDefiniteAmount: false,
    IsMandatory: false,
    IsFactorValueEditableByUser: false, // default checked = false
    IsActive: true, // default checked = true
    Description: "",
    ParameterValues: [] as any[],
  };

  const [values, setValues] = useState<Record<string, any>>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [availableItems, setAvailableItems] = useState<any[]>([]);
  const [availablePackages, setAvailablePackages] = useState<any[]>([]);

  useEffect(() => {
    apiFetch("/api/inv/items/dropdown")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        const items = Array.isArray(data) ? data : [];
        setAvailableItems(
          items.map((i: any) => ({
            ...i,
            id: i.ItemID || i.id,
            itemTypeTitle: Number(i.ItemType) === 2 ? "خدمت" : "کالا",
            MeasurementUnitName: i.MeasurementUnitName || i.mainUnit?.MeasurementUnitName || i.unitName || "",
          }))
        );
      })
      .catch(() => setAvailableItems([]));

    apiFetch("/api/inv/item-packages")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        const pkgs = Array.isArray(data) ? data : [];
        setAvailablePackages(
          pkgs.map((p: any) => ({
            ...p,
            id: p.ItemPackageID || p.id,
            PackageCode: p.PackageCode ? String(p.PackageCode) : "",
            PackageTitle: p.PackageTitle ? String(p.PackageTitle) : "",
            MeasurementUnitName: p.MeasurementUnit?.MeasurementUnitName || p.MeasurementUnitName || "",
          }))
        );
      })
      .catch(() => setAvailablePackages([]));
  }, []);

  const itemDropdownColumns: Column[] = useMemo(
    () => [
      { key: "itemTypeTitle", label: "نوع", width: 70 },
      { key: "ItemCode", label: "کد", width: 100 },
      { key: "ItemName", label: "عنوان کالا و خدمت", width: 180 },
      { key: "MeasurementUnitName", label: "واحد سنجش", width: 100 },
    ],
    []
  );

  const packageDropdownColumns: Column[] = useMemo(
    () => [
      { key: "PackageCode", label: "کد", width: 100 },
      { key: "PackageTitle", label: "عنوان پک", width: 200 },
      { key: "MeasurementUnitName", label: "واحد سنجش", width: 100 },
    ],
    []
  );

  useEffect(() => {
    if (activeId) {
      apiFetch(`/api/inv/purchase-sales-parameters/${activeId}`)
        .then((res) => res.json())
        .then((data) => {
          const item = data.data || data;
          if (item) {
            setValues({
              PurchaseSalesParameterID: item.PurchaseSalesParameterID || "",
              IsProcurement: !!item.IsProcurement,
              IsWarehouse: !!item.IsWarehouse,
              IsSales: !!item.IsSales,
              Title: item.Title || "",
              Title2: item.Title2 || "",
              CalculationPriority: item.CalculationPriority ?? 1,
              PrintPriority: item.PrintPriority ?? 1,
              ParameterType: item.ParameterType ?? ParameterTypeEnum.INCREASING,
              CalculationMethod: item.CalculationMethod ?? CalculationMethodEnum.TOTAL_SUM,
              CalculationCondition: item.CalculationCondition ?? CalculationConditionEnum.NO_CONDITION,
              RelationType: item.RelationType ?? RelationTypeEnum.INDEPENDENT,
              OperationType: item.OperationType ?? OperationTypeEnum.AMOUNT,
              AmountAllocationMethod: item.AmountAllocationMethod ?? AmountAllocationMethodEnum.BY_AMOUNT,
              CategoryOther: item.CategoryOther ?? CategoryOtherEnum.VAT,
              HasAccountingVoucher: !!item.HasAccountingVoucher,
              SlAccountRef: item.SlAccountRef || null,
              IsNonDefiniteAmount: !!item.IsNonDefiniteAmount,
              IsMandatory: !!item.IsMandatory,
              IsFactorValueEditableByUser: !!item.IsFactorValueEditableByUser,
              IsActive: item.IsActive ?? true,
              Description: item.Description || "",
              ParameterValues: item.ParameterValues || item.parameterValues || [],
            });
          }
        })
        .catch((err) => {
          console.error("Error fetching purchase sales parameter:", err);
          showToast("خطا در دریافت اطلاعات پارامتر خرید و فروش", "error");
        });
    }
  }, [activeId]);

  const handleChange = (name: string, value: any) => {
    setValues((prev) => {
      const nextValues = { ...prev, [name]: value };

      if (name === "IsSales" || name === "IsWarehouse" || name === "IsProcurement") {
        const nextIsSales = !!nextValues.IsSales;
        const nextIsWarehouseOrProcurement = !!nextValues.IsWarehouse || !!nextValues.IsProcurement;
        const newAllowedOptions = getRelationTypeOptions(nextIsSales, nextIsWarehouseOrProcurement);
        const isCurrentRelationValid = newAllowedOptions.some(
          (opt) => String(opt.value) === String(nextValues.RelationType)
        );
        if (!isCurrentRelationValid && newAllowedOptions.length > 0) {
          nextValues.RelationType = Number(newAllowedOptions[0].value);
        }
      }

      return nextValues;
    });

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!values.Title || !values.Title.trim()) {
      newErrors.Title = "عنوان اجباری است";
    }

    if (values.PrintPriority === null || values.PrintPriority === undefined || values.PrintPriority === "") {
      newErrors.PrintPriority = "اولویت چاپ اجباری است";
    }

    if (values.CalculationPriority === null || values.CalculationPriority === undefined || values.CalculationPriority === "") {
      newErrors.CalculationPriority = "اولویت محاسبه اجباری است";
    }

    if (values.HasAccountingVoucher && !values.SlAccountRef) {
      newErrors.SlAccountRef = "انتخاب حساب معین اجباری است";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (): Promise<boolean> => {
    if (!validate()) {
      showToast("لطفاً فیلدهای اجباری را تکمیل نمایید", "error");
      return false;
    }

    try {
      const url = getUrl("/api/inv/purchase-sales-parameters");
      const res = await apiFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          IsProcurement: !!values.IsProcurement,
          IsWarehouse: !!values.IsWarehouse,
          IsSales: !!values.IsSales,
          Title: values.Title?.trim(),
          Title2: values.Title2?.trim() || null,
          CalculationPriority: Number(values.CalculationPriority),
          PrintPriority: Number(values.PrintPriority),
          ParameterType: Number(values.ParameterType),
          CalculationMethod: Number(values.CalculationMethod),
          CalculationCondition: Number(values.CalculationCondition),
          RelationType: Number(values.RelationType),
          OperationType: Number(values.OperationType),
          AmountAllocationMethod: Number(values.AmountAllocationMethod),
          CategoryOther: Number(values.CategoryOther),
          HasAccountingVoucher: !!values.HasAccountingVoucher,
          SlAccountRef: values.HasAccountingVoucher && values.SlAccountRef ? Number(values.SlAccountRef) : null,
          IsNonDefiniteAmount: !!values.IsNonDefiniteAmount,
          IsMandatory: !!values.IsMandatory,
          IsFactorValueEditableByUser: !!values.IsFactorValueEditableByUser,
          IsActive: !!values.IsActive,
          Description: values.Description || "",
          ParameterValues: values.ParameterValues || [],
        }),
      });

      const resData = await res.json();
      if (!res.ok) {
        const errorMsg = resData.message || resData.error || "خطا در ثبت پارامتر خرید و فروش";
        showToast(Array.isArray(errorMsg) ? errorMsg.join("، ") : errorMsg, "error");
        return false;
      }

      const savedItem = resData.data || resData;
      if (savedItem && savedItem.PurchaseSalesParameterID) {
        setActiveId(savedItem.PurchaseSalesParameterID);
      }

      showToast("پارامترهای خرید و فروش با موفقیت ذخیره شد", "success");
      eventBus.emit(EVENTS.DATA_CHANGED, { entity: "PurchaseSalesParameter" });
      eventBus.emit(EVENTS.REFRESH_GRID, { form: "PurchaseSalesParameter" });
      if (onSaved) onSaved();
      return true;
    } catch (err: any) {
      console.error("Error saving purchase sales parameter:", err);
      showToast("خطا در برقراری ارتباط با سرور", "error");
      return false;
    }
  };

  const handleSaveNew = async (): Promise<boolean> => {
    const saved = await handleSave();
    if (saved) {
      handleNew();
      return true;
    }
    return false;
  };

  const handleNew = () => {
    setActiveId(null);
    setValues(initialValues);
    setErrors({});
  };

  const handleDelete = async (): Promise<void> => {
    if (!activeId) return;
    if (isUsed) {
      showToast("امکان حذف این پارامتر به دلیل استفاده در بخش‌های دیگر وجود ندارد.", "error");
      throw new Error("IS_USED");
    }

    try {
      const usageRes = await apiFetch(`/api/core/usage-check?tableName=PurchaseSalesParameter&id=${activeId}`);
      if (usageRes.ok) {
        const usageData = await usageRes.json();
        if (usageData?.isUsed) {
          showToast("امکان حذف این پارامتر به دلیل استفاده در بخش‌های دیگر وجود ندارد.", "error");
          throw new Error("IS_USED");
        }
      }

      const res = await apiFetch(`/api/inv/purchase-sales-parameters/${activeId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const d = await res.json();
        const msg = d.message || "خطا در حذف پارامتر خرید و فروش";
        showToast(Array.isArray(msg) ? msg.join("، ") : msg, "error");
        throw new Error(msg);
      }

      eventBus.emit(EVENTS.DATA_CHANGED, { entity: "PurchaseSalesParameter" });
      eventBus.emit(EVENTS.REFRESH_GRID, { form: "PurchaseSalesParameter" });
      handleNew();
    } catch (err: any) {
      console.error("Error deleting purchase sales parameter:", err);
      throw err;
    }
  };

  const isSales = !!values.IsSales;
  const isWarehouseOrProcurement = !!values.IsWarehouse || !!values.IsProcurement;
  const relationTypeOptions = getRelationTypeOptions(isSales, isWarehouseOrProcurement);

  // Build field definitions for SimpleFormTwoRow
  const fields: FieldConfig[] = [
    // 1- سیستم (تدارکات-انبار-فروش) با کامپوننت CheckBoxRightLabel در ردیف اول سمت راست
    {
      name: "SystemGroup",
      type: "custom",
      colSpan: 2,
      customComponent: (
        <div className="flex flex-wrap items-center gap-2.5 w-full py-1.5 px-3 bg-gray-50/70 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/70 rounded-md">
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 shrink-0">
            سیستم <span className="text-red-500">*</span> :
          </span>
          <div className="flex flex-wrap items-center gap-4">
            <CheckBoxRightLabel
              label="تدارکات"
              checked={!!values.IsProcurement}
              onChange={(val) => handleChange("IsProcurement", val)}
            />
            <CheckBoxRightLabel
              label="انبار"
              checked={!!values.IsWarehouse}
              onChange={(val) => handleChange("IsWarehouse", val)}
            />
            <CheckBoxRightLabel
              label="فروش"
              checked={!!values.IsSales}
              onChange={(val) => handleChange("IsSales", val)}
            />
          </div>
        </div>
      ),
    },
    // 2- عنوان
    {
      name: "Title",
      label: "عنوان",
      type: "text",
      required: true,
    },
    // 3- عنوان (۲)
    {
      name: "Title2",
      label: "عنوان (۲)",
      type: "text",
    },
    // 4- اولویت محاسبه (پیش‌فرض 1، امکان تکراری)
    {
      name: "CalculationPriority",
      label: "اولویت محاسبه",
      type: "number",
      required: true,
    },
    // 5- اولویت چاپ (پیش‌فرض 1، عدم امکان تکراری)
    {
      name: "PrintPriority",
      label: "اولویت چاپ",
      type: "number",
      required: true,
    },
    // 6- نوع پارامتر (افزاینده – کاهنده – خنثی)
    {
      name: "ParameterType",
      label: "نوع پارامتر",
      type: "select",
      required: true,
      options: PARAMETER_TYPE_OPTIONS,
    },
    // 7- نحوه محاسبه (تاثیر روی جمع کل-تاثیر بر قیمت ردیف سند-افزایش کاهش مقداری)
    {
      name: "CalculationMethod",
      label: "نحوه محاسبه",
      type: "select",
      required: true,
      options: CALCULATION_METHOD_OPTIONS,
    },
    // 8- شرط محاسبه (بدون شرط-شرط ساده-شرط پلکانی)
    {
      name: "CalculationCondition",
      label: "شرط محاسبه",
      type: "select",
      required: true,
      options: CALCULATION_CONDITION_OPTIONS,
    },
    // 9- نحوه ارتباط
    {
      name: "RelationType",
      label: "نحوه ارتباط",
      type: "select",
      required: true,
      options: relationTypeOptions,
    },
    // 10- عملکرد (مبلغی-مقداری-درصدی-مبلغ واحد-روند)
    {
      name: "OperationType",
      label: "عملکرد",
      type: "select",
      required: true,
      options: OPERATION_TYPE_OPTIONS,
    },
    // 11- نحوه تسهیم مبلغ (بر اساس مبلغ-بر اساس مقدار-نسبت مساوی)
    {
      name: "AmountAllocationMethod",
      label: "نحوه تسهیم مبلغ",
      type: "select",
      required: true,
      options: AMOUNT_ALLOCATION_METHOD_OPTIONS,
      disabled: Number(values.OperationType) === OperationTypeEnum.PERCENTAGE,
    },
    // 12- سایر (مالیات ارزش افزوده-عوارض ارزش افزوده-ضمانت حسن انجام کار-پیش پرداخت-سپرده بیمه-سایر)
    {
      name: "CategoryOther",
      label: "سایر",
      type: "select",
      required: true,
      options: CATEGORY_OTHER_OPTIONS,
    },
    // 13 & 14- دارای سند حسابداری و معین در ستون راست (با ۱۰ پیکسل فاصله و همتراز شدن انتهای معین با نحوه تسهیم مبلغ)
    {
      name: "AccountingVoucherAndSlAccountGroup",
      type: "custom",
      colSpan: 2,
      customComponent: (
        <div className="flex flex-wrap items-center gap-[10px] w-full py-1">
          <div className="shrink-0">
            <CheckBoxRightLabel
              label="دارای سند حسابداری"
              checked={!!values.HasAccountingVoucher}
              onChange={(val) => handleChange("HasAccountingVoucher", val)}
            />
          </div>
          <div className="flex items-center gap-2 flex-1 min-w-[220px]">
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap shrink-0">
              معین:
            </label>
            <div className="flex-1 min-w-0">
              <SlAccountDropDown
                value={values.SlAccountRef}
                onChange={(val) => handleChange("SlAccountRef", val)}
                disabled={!values.HasAccountingVoucher}
                error={errors.SlAccountRef}
              />
            </div>
          </div>
        </div>
      ),
    },
    // 15, 16, 17- مبلغ غیرقطعی، اجباری، قابل ویرایش مقدار عامل توسط کاربر و فعال در ستون چپ
    {
      name: "FlagsGroup",
      type: "custom",
      colSpan: 2,
      customComponent: (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 w-full py-2 px-3 bg-gray-50/50 dark:bg-gray-800/40 border border-gray-200/80 dark:border-gray-700/60 rounded-md">
          <CheckBoxRightLabel
            label="مبلغ غیرقطعی"
            checked={!!values.IsNonDefiniteAmount}
            onChange={(val) => handleChange("IsNonDefiniteAmount", val)}
          />
          <CheckBoxRightLabel
            label="اجباری"
            checked={!!values.IsMandatory}
            onChange={(val) => handleChange("IsMandatory", val)}
          />
          <CheckBoxRightLabel
            label="قابل ویرایش مقدار عامل توسط کاربر"
            checked={!!values.IsFactorValueEditableByUser}
            onChange={(val) => handleChange("IsFactorValueEditableByUser", val)}
          />
          <CheckBoxRightLabel
            label="فعال"
            checked={!!values.IsActive}
            onChange={(val) => handleChange("IsActive", val)}
          />
        </div>
      ),
    },
  ];

  const getParameterValueHeader = (opType: any) => {
    const numOp = Number(opType);
    switch (numOp) {
      case OperationTypeEnum.AMOUNT:
        return "مبلغ پارامتر";
      case OperationTypeEnum.QUANTITY:
        return "مقدار پارامتر";
      case OperationTypeEnum.PERCENTAGE:
        return "درصد پارامتر";
      case OperationTypeEnum.UNIT_AMOUNT:
        return "مبلغ واحد پارامتر";
      case OperationTypeEnum.ROUNDING:
        return "روند پارامتر";
      default:
        return "مقدار پارامتر";
    }
  };

  const isProductServiceCondition =
    Number(values.CalculationCondition) === CalculationConditionEnum.NO_CONDITION &&
    Number(values.RelationType) === RelationTypeEnum.PRODUCT_SERVICE;

  const isProductPackCondition =
    Number(values.CalculationCondition) === CalculationConditionEnum.NO_CONDITION &&
    Number(values.RelationType) === RelationTypeEnum.PRODUCT_PACK;

  const baseValueColumns: any[] = [
    {
      key: "RowNo",
      header: "ردیف",
      width: "60px",
      render: (_row: any, rowIndex: number) => (
        <div className="text-center font-mono text-[11px] py-1 select-none text-slate-600 dark:text-slate-300">
          {rowIndex + 1}
        </div>
      ),
    },
    {
      key: "StartDate",
      header: "تاریخ شروع",
      width: "140px",
      type: "custom",
      render: (row: any, _rowIndex: number, onChangeRow: (val: any) => void) => (
        <DateInput
          value={row.StartDate || ""}
          onChange={(val) => onChangeRow({ ...row, StartDate: val })}
          noWrapper={true}
          disabled={isUsed}
          outputFormat="dateString"
        />
      ),
    },
    {
      key: "EndDate",
      header: "تاریخ پایان",
      width: "140px",
      type: "custom",
      render: (row: any, _rowIndex: number, onChangeRow: (val: any) => void) => (
        <DateInput
          value={row.EndDate || ""}
          onChange={(val) => onChangeRow({ ...row, EndDate: val })}
          noWrapper={true}
          disabled={isUsed}
          outputFormat="dateString"
        />
      ),
    },
  ];

  if (isProductServiceCondition) {
    baseValueColumns.push(
      {
        key: "ProductServiceCode",
        header: "کد کالا خدمت",
        width: "220px",
        type: "custom",
        render: (row: any, _rowIndex: number, onChangeRow: (val: any) => void) => {
          const val = row?.ProductServiceRef || row?.ProductServiceCode;
          const selectedObj = availableItems.find(
            (i) => Number(i.id) === Number(val) || Number(i.ItemID) === Number(val) || (row?.ProductServiceCode && String(i.ItemCode) === String(row.ProductServiceCode))
          ) || null;

          return (
            <MultiColumnDropDown
              data={availableItems}
              columns={itemDropdownColumns}
              value={selectedObj}
              displayKey="ItemCode"
              placeholder="انتخاب کالا / خدمت..."
              disabled={isUsed}
              addFormOptions={[
                { title: "افزودن کالا و خدمت جدید", componentName: "ProductServiceForm", groupId: "inv" }
              ]}
              onChange={(selected) => {
                if (!selected) {
                  onChangeRow({
                    ...row,
                    ProductServiceRef: null,
                    ProductServiceCode: "",
                    ProductServiceName: "",
                    MeasurementUnitName: "",
                  });
                  return;
                }
                const itemObj = Array.isArray(selected) ? selected[0] : selected;
                const itemId = Number(itemObj.ItemID || itemObj.id);
                const matchedAvailItem = availableItems.find(
                  (i) => Number(i.id) === itemId || Number(i.ItemID) === itemId
                ) || itemObj;

                const unitName = matchedAvailItem.MeasurementUnitName || matchedAvailItem.mainUnit?.MeasurementUnitName || matchedAvailItem.unitName || "";

                onChangeRow({
                  ...row,
                  ProductServiceRef: itemId,
                  ProductServiceCode: matchedAvailItem.ItemCode ? String(matchedAvailItem.ItemCode) : "",
                  ProductServiceName: matchedAvailItem.ItemName ? String(matchedAvailItem.ItemName) : "",
                  MeasurementUnitName: unitName ? String(unitName) : "",
                });
              }}
            />
          );
        },
      },
      {
        key: "ProductServiceName",
        header: "عنوان کالا خدمت",
        width: "200px",
        type: "custom",
        render: (row: any) => (
          <input
            type="text"
            value={row.ProductServiceName || ""}
            readOnly
            disabled
            tabIndex={-1}
            className="w-full h-8 px-2 text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-700 cursor-not-allowed select-none focus:outline-none"
          />
        ),
      },
      {
        key: "MeasurementUnitName",
        header: "واحد سنجش",
        width: "120px",
        type: "custom",
        render: (row: any) => (
          <input
            type="text"
            value={row.MeasurementUnitName || ""}
            readOnly
            disabled
            tabIndex={-1}
            className="w-full h-8 px-2 text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-700 cursor-not-allowed select-none focus:outline-none"
          />
        ),
      }
    );
  } else if (isProductPackCondition) {
    baseValueColumns.push(
      {
        key: "ProductServiceCode",
        header: "کد پک",
        width: "220px",
        type: "custom",
        render: (row: any, _rowIndex: number, onChangeRow: (val: any) => void) => {
          const val = row?.ProductServiceRef || row?.ProductServiceCode;
          const selectedObj = availablePackages.find(
            (p) => Number(p.id) === Number(val) || Number(p.ItemPackageID) === Number(val) || (row?.ProductServiceCode && String(p.PackageCode) === String(row.ProductServiceCode))
          ) || null;

          return (
            <MultiColumnDropDown
              data={availablePackages}
              columns={packageDropdownColumns}
              value={selectedObj}
              displayKey="PackageCode"
              placeholder="انتخاب پک کالا و خدمت..."
              disabled={isUsed}
              addFormOptions={[
                { title: "افزودن پک کالا و خدمت جدید", componentName: "ItemPackageForm", groupId: "inv" }
              ]}
              onChange={(selected) => {
                if (!selected) {
                  onChangeRow({
                    ...row,
                    ProductServiceRef: null,
                    ProductServiceCode: "",
                    ProductServiceName: "",
                    MeasurementUnitName: "",
                  });
                  return;
                }
                const pkgObj = Array.isArray(selected) ? selected[0] : selected;
                const pkgId = Number(pkgObj.ItemPackageID || pkgObj.id);
                const matchedAvailPkg = availablePackages.find(
                  (p) => Number(p.id) === pkgId || Number(p.ItemPackageID) === pkgId
                ) || pkgObj;

                const unitName = matchedAvailPkg.MeasurementUnitName || matchedAvailPkg.MeasurementUnit?.MeasurementUnitName || "";

                onChangeRow({
                  ...row,
                  ProductServiceRef: pkgId,
                  ProductServiceCode: matchedAvailPkg.PackageCode ? String(matchedAvailPkg.PackageCode) : "",
                  ProductServiceName: matchedAvailPkg.PackageTitle ? String(matchedAvailPkg.PackageTitle) : "",
                  MeasurementUnitName: unitName ? String(unitName) : "",
                });
              }}
            />
          );
        },
      },
      {
        key: "ProductServiceName",
        header: "عنوان پک",
        width: "200px",
        type: "custom",
        render: (row: any) => (
          <input
            type="text"
            value={row.ProductServiceName || ""}
            readOnly
            disabled
            tabIndex={-1}
            className="w-full h-8 px-2 text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-700 cursor-not-allowed select-none focus:outline-none"
          />
        ),
      },
      {
        key: "MeasurementUnitName",
        header: "واحد سنجش",
        width: "120px",
        type: "custom",
        render: (row: any) => (
          <input
            type="text"
            value={row.MeasurementUnitName || ""}
            readOnly
            disabled
            tabIndex={-1}
            className="w-full h-8 px-2 text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-700 cursor-not-allowed select-none focus:outline-none"
          />
        ),
      }
    );
  }

  baseValueColumns.push(
    {
      key: "ParameterValue",
      header: getParameterValueHeader(values.OperationType),
      width: "160px",
      type: "amount",
    },
    {
      key: "Description",
      header: "توضیحات",
      width: "250px",
      type: "text",
    }
  );

  const parameterValuesTabConfig: TabCellConfig[] = [
    {
      id: "parameterValues",
      label: "مقادیر پارامتر",
      columns: baseValueColumns,
    },
  ];

  const bottomTabs = [
    {
      id: "parameterValuesTab",
      label: "مقادیر پارامتر",
      content: (
        <div className="flex-1 h-full min-h-0 overflow-hidden p-0 m-0" id="ParameterValuesContainer">
          <TabCellRow
            tabs={parameterValuesTabConfig}
            value={values.ParameterValues || []}
            onChange={(val) => handleChange("ParameterValues", val)}
            hideHeader={true}
            hideSumRow={true}
            isReadonly={isUsed}
          />
        </div>
      ),
    },
  ];

  const listColumns = [
    { key: "PurchaseSalesParameterID", label: "شناسه", width: 80 },
    { key: "Title", label: "عنوان پارامتر" },
    { key: "Title2", label: "عنوان دوم" },
    { 
      key: "IsFactorValueEditableByUser", 
      label: "قابل ویرایش مقدار عامل توسط کاربر", 
      width: 180,
      render: (val: any) => (val ? "بله" : "خیر")
    },
    { 
      key: "IsActive", 
      label: "وضعیت", 
      width: 90,
      render: (val: any) => (val ? "فعال" : "غیرفعال")
    },
  ];

  return (
    <SimpleFormTwoRowTabbed
      title="پارامترهای خرید و فروش"
      icon={<Sliders className="w-5 h-5 text-white" />}
      fields={fields}
      values={values}
      onChange={handleChange}
      errors={errors}
      onSave={handleSave}
      onSaveNew={handleSaveNew}
      onNew={handleNew}
      onDelete={handleDelete}
      isReadonly={isUsed}
      isUsed={isUsed}
      showListButton={true}
      listApiUrl="/api/inv/purchase-sales-parameters"
      listColumns={listColumns}
      listDisplayKey="Title"
      onListSelect={(selected: any) => {
        if (selected && (selected.PurchaseSalesParameterID || selected.id)) {
          setActiveId(selected.PurchaseSalesParameterID || selected.id);
        }
      }}
      bottomTabs={bottomTabs}
      onClose={() => {
        if (tabId) removeTab(tabId);
      }}
    />
  );
}

export default PurchaseSalesParametersForm;
