"use client";

import React, { useState, useEffect, useMemo } from "react";
import { SimpleFormTwoRow, FieldConfig } from "../SimpleFormTwoRow";
import { NumberInput } from "@/components/inputs/NumberInput";
import { TextInput } from "@/components/inputs/TextInput";
import { Select } from "@/components/inputs/Select";
import { CheckBoxRightLabel } from "@/components/inputs/CheckBoxRightLabel";
import { MultiColumnDropdown } from "@/components/inputs/MultiColumnDropdown";
import { Boxes } from "lucide-react";
import { useTabs } from "@/components/TabsProvider";
import { useToast } from "@/components/ToastProvider";
import { apiFetch } from "@/lib/utils";
import { useFormUpsert } from "@/hooks/useFormUpsert";
import { useFormUsageCheck } from "@/hooks/useFormUsageCheck";
import { eventBus, EVENTS } from "@/lib/events";

// 1. Enum Definition for Warehouse Document Nature (Rule 13)
export enum WarehouseDocumentNature {
  INCREASING = 1, // افزاینده
  DECREASING = 2, // کاهنده
  NEUTRAL = 3,    // خنثی
}

export const WAREHOUSE_DOCUMENT_NATURE_OPTIONS = [
  { id: WarehouseDocumentNature.INCREASING, title: 'افزاینده' },
  { id: WarehouseDocumentNature.DECREASING, title: 'کاهنده' },
  { id: WarehouseDocumentNature.NEUTRAL, title: 'خنثی' },
];

export const WAREHOUSE_DOCUMENT_NATURE_SELECT_OPTIONS = [
  { value: String(WarehouseDocumentNature.INCREASING), label: 'افزاینده' },
  { value: String(WarehouseDocumentNature.DECREASING), label: 'کاهنده' },
  { value: String(WarehouseDocumentNature.NEUTRAL), label: 'خنثی' },
];

// 2. Enum Definition for Displayable Item Nature (Rule 13)
export enum DisplayableItemNature {
  RAW_MATERIAL = 1,  // مواد اولیه
  SEMI_FINISHED = 2, // نیمه ساخته
  PRODUCT = 3,       // محصول
  FIXED_ASSET = 4,   // دارایی ثابت
  WASTE = 5,         // ضایعات
  OTHER = 6,         // سایر
}

export const DISPLAYABLE_ITEM_NATURE_DATA = [
  { id: DisplayableItemNature.RAW_MATERIAL, code: 1, title: 'مواد اولیه' },
  { id: DisplayableItemNature.SEMI_FINISHED, code: 2, title: 'نیمه ساخته' },
  { id: DisplayableItemNature.PRODUCT, code: 3, title: 'محصول' },
  { id: DisplayableItemNature.FIXED_ASSET, code: 4, title: 'دارایی ثابت' },
  { id: DisplayableItemNature.WASTE, code: 5, title: 'ضایعات' },
  { id: DisplayableItemNature.OTHER, code: 6, title: 'سایر' },
];

interface WarehouseDocumentTypeProps {
  id?: number;
  tabId?: string;
  onSaved?: () => void;
}

export function WarehouseDocumentTypeForm({ id, tabId, onSaved }: WarehouseDocumentTypeProps) {
  const { showToast } = useToast();
  const { removeTab } = useTabs();
  const { activeId, setActiveId, method, getUrl, handleResponse } = useFormUpsert(id);
  const { isUsed } = useFormUsageCheck("WarehouseDocumentType", activeId);

  const [values, setValues] = useState<Record<string, any>>({
    WarehouseDocumentTypeID: "",
    WarehouseDocumentTypeCode: "",
    WarehouseDocumentTypeTitle: "",
    WarehouseDocumentTypeTitle2: "",
    WarehouseDocumentNature: 1,
    HasBaseDocument: false,
    BaseDocumentTypeRefs: [],
    WarehouseName: "",
    DetailedName: "",
    RelatedDetailedTypeRefs: [],
    DisplayableItemNatures: [],
    ShowPurchaseSalesParameters: false,
    HasAccountingDocument: false,
    IsActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [baseDocTypesList, setBaseDocTypesList] = useState<any[]>([]);
  const [detailedTypesList, setDetailedTypesList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch defined base inventory document types
  const fetchBaseDocTypes = () => {
    apiFetch("/api/inv/warehouse-document-types")
      .then((res) => res.json())
      .then((resData) => {
        const list = Array.isArray(resData?.data) ? resData.data : (Array.isArray(resData) ? resData : []);
        const formatted = list
          .filter((item: any) => Number(item.WarehouseDocumentTypeID || item.id) !== 0)
          .map((item: any) => ({
            id: item.WarehouseDocumentTypeID || item.id,
            code: item.WarehouseDocumentTypeCode || item.code,
            title: item.WarehouseDocumentTypeTitle || item.title,
            natureLabel: item.WarehouseDocumentNature === 1 ? 'افزاینده' : (item.WarehouseDocumentNature === 2 ? 'کاهنده' : 'خنثی'),
          }));

        // System base document types with neutral nature
        const systemNeutralDocs = [
          { code: 9999, title: 'فاکتور خرید کالا', natureLabel: 'خنثی' },
          { code: 9998, title: 'درخواست تامین کالا', natureLabel: 'خنثی' },
          { code: 9997, title: 'درخواست کالا', natureLabel: 'خنثی' },
          { code: 9996, title: 'رسید موقت', natureLabel: 'خنثی' },
          { code: 9995, title: 'شمارش انبارگردانی', natureLabel: 'خنثی' },
        ];

        systemNeutralDocs.forEach((sysDoc) => {
          const exists = formatted.some((item: any) => Number(item.code) === sysDoc.code);
          if (!exists) {
            formatted.push({
              id: sysDoc.code,
              code: sysDoc.code,
              title: sysDoc.title,
              natureLabel: sysDoc.natureLabel,
            });
          }
        });

        // Rule requirement 3: در لیست اسناد انبار مبنا، اولین آیتم باید بدون مبنا با کد 0 باشد.
        const defaultNoBaseItem = {
          id: 0,
          code: 0,
          title: 'بدون مبنا',
          natureLabel: '-',
        };

        setBaseDocTypesList([defaultNoBaseItem, ...formatted]);
      })
      .catch((err) => console.error("Error fetching base document types:", err));
  };

  // Rule requirement 1: نوع سند جاری فرم نباید در دراپ‌دان اسناد انبار مبنا نمایش داده شود.
  const filteredBaseDocTypesList = useMemo(() => {
    const currentId = activeId || values.WarehouseDocumentTypeID;
    if (!currentId) return baseDocTypesList;
    return baseDocTypesList.filter(
      (item) => item.id === 0 || String(item.id) !== String(currentId)
    );
  }, [baseDocTypesList, activeId, values.WarehouseDocumentTypeID]);

  // Fetch detailed types list
  const fetchDetailedTypes = () => {
    apiFetch("/api/accounting/detailed-types")
      .then((res) => res.json())
      .then((resData) => {
        const list = Array.isArray(resData?.data) ? resData.data : (Array.isArray(resData) ? resData : []);
        const formatted = list.map((item: any) => ({
          id: item.detailedTypesId || item.id,
          code: item.code,
          title: item.title,
        }));
        setDetailedTypesList(formatted);
      })
      .catch((err) => console.error("Error fetching detailed types:", err));
  };

  // Fetch Next Number for auto-code
  const fetchNextCode = () => {
    apiFetch("/api/inv/warehouse-document-types/next-number")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.documentNumber) {
          setValues((prev) => ({ ...prev, WarehouseDocumentTypeCode: data.documentNumber }));
        }
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchBaseDocTypes();
    fetchDetailedTypes();

    if (activeId) {
      setIsLoading(true);
      apiFetch(`/api/inv/warehouse-document-types/${activeId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data) {
            setValues({
              WarehouseDocumentTypeID: data.WarehouseDocumentTypeID,
              WarehouseDocumentTypeCode: data.WarehouseDocumentTypeCode || "",
              WarehouseDocumentTypeTitle: data.WarehouseDocumentTypeTitle || "",
              WarehouseDocumentTypeTitle2: data.WarehouseDocumentTypeTitle2 || "",
              WarehouseDocumentNature: data.WarehouseDocumentNature || 1,
              HasBaseDocument: !!data.HasBaseDocument,
              BaseDocumentTypeRefs: Array.isArray(data.BaseDocumentTypeRefs) ? data.BaseDocumentTypeRefs : [],
              WarehouseName: data.WarehouseName || "",
              DetailedName: data.DetailedName || "",
              RelatedDetailedTypeRefs: Array.isArray(data.RelatedDetailedTypeRefs) ? data.RelatedDetailedTypeRefs : [],
              DisplayableItemNatures: Array.isArray(data.DisplayableItemNatures) ? data.DisplayableItemNatures : [],
              ShowPurchaseSalesParameters: data.ShowPurchaseSalesParameters !== undefined ? !!data.ShowPurchaseSalesParameters : false,
              HasAccountingDocument: data.HasAccountingDocument !== undefined ? !!data.HasAccountingDocument : false,
              IsActive: data.IsActive !== undefined ? data.IsActive : true,
            });
          }
        })
        .catch((err) => {
          console.error("Error loading document type:", err);
          showToast("خطا در دریافت اطلاعات نوع سند انبار", "error");
        })
        .finally(() => setIsLoading(false));
    } else {
      fetchNextCode();
    }
  }, [activeId]);

  const handleChange = (name: string, value: any) => {
    setValues((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "HasBaseDocument" && !value) {
        updated.BaseDocumentTypeRefs = [];
      }
      return updated;
    });
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (name === "HasBaseDocument" && !value && errors.BaseDocumentTypeRefs) {
      setErrors((prev) => ({ ...prev, BaseDocumentTypeRefs: "" }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!values.WarehouseDocumentTypeCode) {
      newErrors.WarehouseDocumentTypeCode = "کد اجباری است";
    }
    if (!values.WarehouseDocumentTypeTitle || !values.WarehouseDocumentTypeTitle.trim()) {
      newErrors.WarehouseDocumentTypeTitle = "عنوان اجباری است";
    }
    if (!values.WarehouseDocumentNature) {
      newErrors.WarehouseDocumentNature = "ماهیت سند انبار اجباری است";
    }
    // Rule requirement 2: اگر کاربر دارای سند مبنا را فعال کرده بود فیلد اسناد انبار مبنا اجباری است.
    if (values.HasBaseDocument) {
      if (!values.BaseDocumentTypeRefs || !Array.isArray(values.BaseDocumentTypeRefs) || values.BaseDocumentTypeRefs.length === 0) {
        newErrors.BaseDocumentTypeRefs = "اسناد انبار مبنا اجباری است";
      }
    }
    if (!values.WarehouseName || !values.WarehouseName.trim()) {
      newErrors.WarehouseName = "نام انبار اجباری است";
    }
    if (!values.DisplayableItemNatures || !Array.isArray(values.DisplayableItemNatures) || values.DisplayableItemNatures.length === 0) {
      newErrors.DisplayableItemNatures = "ماهیت کالاهای قابل نمایش اجباری است";
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
      const payload = {
        WarehouseDocumentTypeCode: values.WarehouseDocumentTypeCode ? Number(values.WarehouseDocumentTypeCode) : undefined,
        WarehouseDocumentTypeTitle: values.WarehouseDocumentTypeTitle.trim(),
        WarehouseDocumentTypeTitle2: values.WarehouseDocumentTypeTitle2 ? values.WarehouseDocumentTypeTitle2.trim() : null,
        WarehouseDocumentNature: Number(values.WarehouseDocumentNature),
        HasBaseDocument: !!values.HasBaseDocument,
        BaseDocumentTypeRefs: values.HasBaseDocument ? (values.BaseDocumentTypeRefs || []) : [],
        WarehouseName: values.WarehouseName ? values.WarehouseName.trim() : null,
        DetailedName: values.DetailedName ? values.DetailedName.trim() : null,
        RelatedDetailedTypeRefs: values.RelatedDetailedTypeRefs || [],
        DisplayableItemNatures: values.DisplayableItemNatures || [],
        ShowPurchaseSalesParameters: !!values.ShowPurchaseSalesParameters,
        HasAccountingDocument: !!values.HasAccountingDocument,
        IsActive: values.IsActive !== undefined ? values.IsActive : true,
      };

      const response = await apiFetch(getUrl("/api/inv/warehouse-document-types"), {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        showToast(errorData.message || "خطا در ذخیره‌سازی نوع سند انبار", "error");
        return false;
      }

      const result = await response.json();
      handleResponse(result, "WarehouseDocumentTypeID");

      showToast("اطلاعات با موفقیت ذخیره شد", "success");
      eventBus.emit(EVENTS.DATA_CHANGED, { entity: "WarehouseDocumentType" });
      eventBus.emit(EVENTS.REFRESH_GRID_DATA);
      if (onSaved) onSaved();
      return true;
    } catch (err: any) {
      console.error("Save error:", err);
      showToast(err?.message || "خطا در ارتباط با سرور", "error");
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
    setValues({
      WarehouseDocumentTypeID: "",
      WarehouseDocumentTypeCode: "",
      WarehouseDocumentTypeTitle: "",
      WarehouseDocumentTypeTitle2: "",
      WarehouseDocumentNature: 1,
      HasBaseDocument: false,
      BaseDocumentTypeRefs: [],
      WarehouseName: "",
      DetailedName: "",
      RelatedDetailedTypeRefs: [],
      DisplayableItemNatures: [],
      ShowPurchaseSalesParameters: false,
      HasAccountingDocument: false,
      IsActive: true,
    });
    setErrors({});
    fetchNextCode();
  };

  const handleDelete = async (): Promise<void> => {
    if (!activeId) return;
    try {
      const response = await apiFetch(`/api/inv/warehouse-document-types/${activeId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errData = await response.json();
        showToast(errData.message || "خطا در حذف رکورد", "error");
        throw new Error(errData.message || "Delete failed");
      }

      eventBus.emit(EVENTS.DATA_CHANGED, { entity: "WarehouseDocumentType" });
      eventBus.emit(EVENTS.REFRESH_GRID_DATA);
      handleNew();
    } catch (e: any) {
      throw e;
    }
  };

  // Build field definitions for SimpleFormTwoRow
  const fields: FieldConfig[] = [
    // 1. کد (Code) - NumberInput
    {
      name: "WarehouseDocumentTypeCode",
      label: "کد",
      type: "number",
      required: true,
      disabled: isUsed,
    },
    // 2. عنوان (Title)
    {
      name: "WarehouseDocumentTypeTitle",
      label: "عنوان",
      type: "text",
      required: true,
      disabled: isUsed,
    },
    // 3. عنوان(2) (Title 2)
    {
      name: "WarehouseDocumentTypeTitle2",
      label: "عنوان(2)",
      type: "text",
      disabled: isUsed,
    },
    // 4. ماهیت سند انبار (Voucher Nature - Enum)
    {
      name: "WarehouseDocumentNature",
      label: "ماهیت سند انبار",
      type: "select",
      required: true,
      options: WAREHOUSE_DOCUMENT_NATURE_SELECT_OPTIONS,
      disabled: isUsed,
    },
    // 5. دارای سند مبنا (Has Base Document - Checkbox)
    {
      name: "HasBaseDocument",
      label: "دارای سند مبنا",
      type: "checkbox",
      disabled: isUsed,
    },
    // 6. اسناد انبار مبنا (Base Inventory Vouchers - MultiColumnDropdown)
    {
      name: "BaseDocumentTypeRefs",
      type: "custom",
      required: !!values.HasBaseDocument,
      customComponent: (
        <MultiColumnDropdown
          label="اسناد انبار مبنا"
          required={!!values.HasBaseDocument}
          data={filteredBaseDocTypesList}
          enableMultiSelection={true}
          value={values.HasBaseDocument ? values.BaseDocumentTypeRefs : []}
          onChange={(selected) => handleChange("BaseDocumentTypeRefs", selected)}
          displayKey="title"
          placeholder={values.HasBaseDocument ? "انتخاب اسناد انبار مبنا..." : "بدون سند مبنا"}
          disabled={!values.HasBaseDocument || isUsed}
          error={errors.BaseDocumentTypeRefs}
          columns={[
            { key: "code", label: "کد", width: 80 },
            { key: "title", label: "عنوان", width: 200 },
            { key: "natureLabel", label: "ماهیت", width: 100 },
          ]}
        />
      ),
    },
    // 7. نام انبار (Warehouse Name)
    {
      name: "WarehouseName",
      label: "نام انبار",
      type: "text",
      required: true,
      disabled: isUsed,
    },
    // 8. نام تفصیلی (Detailed Name)
    {
      name: "DetailedName",
      label: "نام تفصیلی",
      type: "text",
      disabled: isUsed,
    },
    // 9. نوع تفصیلی های مرتبط (Related Detailed Types - MultiColumnDropdown)
    {
      name: "RelatedDetailedTypeRefs",
      type: "custom",
      customComponent: (
        <MultiColumnDropdown
          label="نوع تفصیلی های مرتبط"
          data={detailedTypesList}
          enableMultiSelection={true}
          value={values.RelatedDetailedTypeRefs}
          onChange={(selected) => handleChange("RelatedDetailedTypeRefs", selected)}
          displayKey="title"
          placeholder="انتخاب نوع تفصیلی های مرتبط..."
          disabled={isUsed}
          columns={[
            { key: "code", label: "کد", width: 80 },
            { key: "title", label: "عنوان", width: 200 },
          ]}
        />
      ),
    },
    // 10. ماهیت کالاهای قابل نمایش (Displayable Item Natures - MultiColumnDropdown with Enum)
    {
      name: "DisplayableItemNatures",
      type: "custom",
      required: true,
      customComponent: (
        <MultiColumnDropdown
          label="ماهیت کالاهای قابل نمایش"
          required
          data={DISPLAYABLE_ITEM_NATURE_DATA}
          enableMultiSelection={true}
          value={values.DisplayableItemNatures}
          onChange={(selected) => handleChange("DisplayableItemNatures", selected)}
          displayKey="title"
          placeholder="انتخاب ماهیت کالاهای قابل نمایش..."
          disabled={isUsed}
          error={errors.DisplayableItemNatures}
          columns={[
            { key: "code", label: "کد", width: 80 },
            { key: "title", label: "عنوان", width: 200 },
          ]}
        />
      ),
    },
    // 11. نمایش پارامترهای خرید و فروش (Show Purchase/Sales Parameters - CheckBoxRightLabel)
    {
      name: "ShowPurchaseSalesParameters",
      label: " ",
      type: "custom",
      customComponent: (
        <CheckBoxRightLabel
          label="نمایش پارامترهای خرید و فروش"
          checked={!!values.ShowPurchaseSalesParameters}
          onChange={(checked: boolean) => handleChange("ShowPurchaseSalesParameters", checked)}
          disabled={isUsed}
        />
      ),
    },
    // 12. دارای سند حسابداری و فعال (HasAccountingDocument & IsActive - CheckBoxRightLabel)
    {
      name: "HasAccountingDocument",
      label: " ",
      type: "custom",
      customComponent: (
        <div className="flex items-center gap-6">
          <CheckBoxRightLabel
            label="دارای سند حسابداری"
            checked={!!values.HasAccountingDocument}
            onChange={(checked: boolean) => handleChange("HasAccountingDocument", checked)}
            disabled={isUsed}
          />
          <CheckBoxRightLabel
            label="فعال"
            checked={values.IsActive !== undefined ? !!values.IsActive : true}
            onChange={(checked: boolean) => handleChange("IsActive", checked)}
            disabled={isUsed}
          />
        </div>
      ),
    },
  ];

  return (
    <SimpleFormTwoRow
      title="نوع سند انبار جدید"
      icon={<Boxes className="w-5 h-5 text-white" />}
      fields={fields}
      values={values}
      onChange={handleChange}
      errors={errors}
      onSave={handleSave}
      onSaveNew={handleSaveNew}
      onNew={handleNew}
      showListButton={true}
      listApiUrl="/api/inv/warehouse-document-types"
      listColumns={[
        { key: "WarehouseDocumentTypeCode", label: "کد", width: 80 },
        { key: "WarehouseDocumentTypeTitle", label: "عنوان", width: 200 },
      ]}
      listDisplayKey="WarehouseDocumentTypeTitle"
      onListSelect={(item) => {
        if (item && (item.WarehouseDocumentTypeID || item.id)) {
          setActiveId(item.WarehouseDocumentTypeID || item.id);
        }
      }}
      onDelete={handleDelete}
      isUsed={isUsed}
      isSubmitting={isLoading}
      onClose={() => {
        if (tabId) removeTab(tabId);
      }}
    />
  );
}
