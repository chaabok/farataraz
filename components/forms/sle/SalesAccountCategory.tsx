"use client";

import React, { useState, useEffect } from "react";
import { SimpleFormTwoRowTabbed } from "../SimpleFormTwoRowTabbed";
import { FieldConfig } from "../SimpleFormTwoRow";
import { SlAccountDropDown } from "@/components/ui/SlAccountDropDown";
import { Layers, List, Package } from "lucide-react";
import { useTabs } from "@/components/TabsProvider";
import { useToast } from "@/components/ToastProvider";
import { apiFetch } from "@/lib/utils";
import { eventBus, EVENTS } from "@/lib/events";
import { useFormUpsert } from "@/hooks/useFormUpsert";
import { useFormUsageCheck } from "@/hooks/useFormUsageCheck";
import { TabCellRow, TabCellConfig } from "../TabCellRow";
import { MultiColumnDropDown } from "@/components/inputs/MultiColumnDropdown";
import { CurrencyDropdown } from "@/components/inputs/CurrencyDropdown";

interface SalesAccountCategoryProps {
  id?: number;
}

export function SalesAccountCategory({ id }: SalesAccountCategoryProps) {
  const { addTab, removeTab } = useTabs();
  const { showToast } = useToast();
  const { activeId, method, getUrl, handleResponse } = useFormUpsert(id);
  const { isUsed } = useFormUsageCheck("SalesAccountCategory", activeId);

  const handleAddAccount = () => {
    addTab("کدینگ حساب‌ها", "accounting", undefined, "Accounts");
  };

  const [availableItems, setAvailableItems] = useState<any[]>([]);

  const [values, setValues] = useState<Record<string, any>>({
    SalesAccountCategoryID: "",
    SalesAccountCategoryCode: "",
    SalesAccountCategoryName: "",
    SalesAccountCategoryName2: "",
    CurrencyRef: null,
    IsActive: true,
    Items: [],

    InventorySlAccountRef: null,
    IndividualPurchaseSlAccountRef: null,
    CorporatePurchaseSlAccountRef: null,
    FreightSlAccountRef: null,
    SuspensePurchaseSlAccountRef: null,
    ForeignPurchaseSlAccountRef: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDocumentNoAuto, setIsDocumentNoAuto] = useState(false);

  useEffect(() => {
    apiFetch("/api/inv/items/dropdown")
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data.data || [];
        const normalized = list.map((item: any) => ({
          ...item,
          ItemID: Number(item.ItemID),
          ItemCode: String(item.product_code || item.ItemCode || item.id || ""),
          ItemName: item.product_name || item.name || item.ItemName || "",
          ItemName2: item.name2 || item.ItemName2 || "",
          MeasurementUnitName: item.unit || item.MeasurementUnitName || "",
        }));
        setAvailableItems(normalized);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (activeId) {
      apiFetch(`/api/sle/sales-account-categories/${activeId}`)
        .then((res) => res.json())
        .then((data) => {
          const item = data.data || data;
          setValues({
            SalesAccountCategoryID: item.SalesAccountCategoryID || "",
            SalesAccountCategoryCode: item.SalesAccountCategoryCode || "",
            SalesAccountCategoryName: item.SalesAccountCategoryName || "",
            SalesAccountCategoryName2: item.SalesAccountCategoryName2 || "",
            CurrencyRef: item.CurrencyRef || null,
            IsActive: item.IsActive ?? true,
            Items: item.Items || [],

            InventorySlAccountRef: item.InventorySlAccountRef || null,
            IndividualPurchaseSlAccountRef: item.IndividualPurchaseSlAccountRef || null,
            CorporatePurchaseSlAccountRef: item.CorporatePurchaseSlAccountRef || null,
            FreightSlAccountRef: item.FreightSlAccountRef || null,
            SuspensePurchaseSlAccountRef: item.SuspensePurchaseSlAccountRef || null,
            ForeignPurchaseSlAccountRef: item.ForeignPurchaseSlAccountRef || null,
          });
        })
        .catch(console.error);
    } else {
      apiFetch(`/api/sle/sales-account-categories/next-number`)
        .then((res) => res.json())
        .then((resData) => {
          setIsDocumentNoAuto(resData.isDocumentNumberAuto);
          if (resData.error) {
            showToast(resData.error, "error");
          }
          if (resData.isDocumentNumberAuto && resData.documentNumber) {
            setValues((prev) => ({ ...prev, SalesAccountCategoryCode: resData.documentNumber }));
          }
        })
        .catch(console.error);
    }
  }, [activeId]);

  const handleChange = (name: string, value: any) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!isDocumentNoAuto && !values.SalesAccountCategoryCode) {
      newErrors.SalesAccountCategoryCode = "کد اجباری است *";
    }
    if (!values.SalesAccountCategoryName) {
      newErrors.SalesAccountCategoryName = "عنوان اجباری است *";
    }
    if (!values.CurrencyRef) {
      newErrors.CurrencyRef = "ارز اجباری است *";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const extractSlAccountId = (val: any) => {
    if (!val) return null;
    if (typeof val === "object") return val.id || val.accountId || val.code || null;
    return Number(val);
  };

  const submitData = async () => {
    if (!validate()) {
      showToast("لطفاً فیلدهای اجباری را تکمیل نمایید", "error");
      return null;
    }

    setIsSubmitting(true);
    try {
      const url = getUrl("/api/sle/sales-account-categories");

      const payload: any = {
        ...values,
        SalesAccountCategoryName2: values.SalesAccountCategoryName2 && String(values.SalesAccountCategoryName2).trim() !== "" 
          ? values.SalesAccountCategoryName2 
          : values.SalesAccountCategoryName,
        SalesAccountCategoryCode: values.SalesAccountCategoryCode ? Number(values.SalesAccountCategoryCode) : undefined,
        CurrencyRef: values.CurrencyRef ? Number(values.CurrencyRef) : null,
        IsActive: Boolean(values.IsActive),

        InventorySlAccountRef: extractSlAccountId(values.InventorySlAccountRef),
        IndividualPurchaseSlAccountRef: extractSlAccountId(values.IndividualPurchaseSlAccountRef),
        CorporatePurchaseSlAccountRef: extractSlAccountId(values.CorporatePurchaseSlAccountRef),
        FreightSlAccountRef: extractSlAccountId(values.FreightSlAccountRef),
        SuspensePurchaseSlAccountRef: extractSlAccountId(values.SuspensePurchaseSlAccountRef),
        ForeignPurchaseSlAccountRef: extractSlAccountId(values.ForeignPurchaseSlAccountRef),
      };

      const res = await apiFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.message || "خطا در ذخیره اطلاعات طبقه حساب فروش");
      }

      const result = await res.json();
      showToast("اطلاعات طبقه حساب فروش با موفقیت ذخیره گردید", "success");
      eventBus.emit(EVENTS.DATA_CHANGED, { entity: "SalesAccountCategory" });
      handleResponse(result, "SalesAccountCategoryID");
      return result;
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "خطا در ذخیره اطلاعات", "error");
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSave = async () => {
    return await submitData();
  };

  const handleSaveNew = async () => {
    const res = await submitData();
    if (res) {
      setValues({
        SalesAccountCategoryID: "",
        SalesAccountCategoryCode: "",
        SalesAccountCategoryName: "",
        SalesAccountCategoryName2: "",
        CurrencyRef: null,
        IsActive: true,
        Items: [],

        InventorySlAccountRef: null,
        IndividualPurchaseSlAccountRef: null,
        CorporatePurchaseSlAccountRef: null,
        FreightSlAccountRef: null,
        SuspensePurchaseSlAccountRef: null,
        ForeignPurchaseSlAccountRef: null,
      });

      apiFetch(`/api/sle/sales-account-categories/next-number`)
        .then((res) => res.json())
        .then((resData) => {
          setIsDocumentNoAuto(resData.isDocumentNumberAuto);
          if (resData.isDocumentNumberAuto && resData.documentNumber) {
            setValues((prev) => ({ ...prev, SalesAccountCategoryCode: resData.documentNumber }));
          }
        })
        .catch(console.error);
    }
  };

  const handleDelete = async () => {
    if (!activeId) return;
    setIsSubmitting(true);
    try {
      const res = await apiFetch(`/api/sle/sales-account-categories/${activeId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.message || "خطا در حذف رکورد");
      }
      showToast("اطلاعات طبقه حساب فروش با موفقیت حذف گردید", "success");
      eventBus.emit(EVENTS.DATA_CHANGED, { entity: "SalesAccountCategory" });
      removeTab(`SalesAccountCategory-${activeId}`);
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "خطا در حذف", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fields: FieldConfig[] = [
    {
      name: "SalesAccountCategoryCode",
      label: "کد",
      type: "number",
      required: true,
      colSpan: 1,
      disabled: isDocumentNoAuto || isUsed,
    },
    {
      name: "SalesAccountCategoryName",
      label: "عنوان",
      type: "text",
      required: true,
      colSpan: 1,
      disabled: isUsed,
    },
    {
      name: "SalesAccountCategoryName2",
      label: "عنوان (2)",
      type: "text",
      required: true,
      colSpan: 1,
      disabled: isUsed,
    },
    {
      name: "CurrencyRef",
      label: "ارز",
      type: "custom",
      required: true,
      colSpan: 1,
      disabled: isUsed,
      customComponent: (
        <CurrencyDropdown
          value={values.CurrencyRef}
          onChange={(val) => handleChange("CurrencyRef", val)}
          disabled={isUsed}
          error={errors.CurrencyRef}
        />
      ),
    },
    {
      name: "IsActive",
      label: "فعال",
      type: "checkbox",
      colSpan: 1,
      disabled: isUsed,
    },
  ];

  const itemDropdownColumns: any[] = [
    { key: "ItemCode", label: "کد کالا" },
    { key: "ItemName", label: "عنوان" },
    { key: "ItemName2", label: "عنوان (2)" },
    { key: "MeasurementUnitName", label: "واحدسنجش" },
  ];

  const itemsTabConfig: TabCellConfig[] = [
    {
      id: "category_items",
      label: "کالا",
      columns: [
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
          key: "ItemCode",
          header: "کد کالا",
          width: "220px",
          type: "custom",
          required: true,
          render: (row: any, _rowIndex: number, onChangeRow: (val: any) => void) => {
            const selectedItemObj = availableItems.find(
              (it: any) => Number(it.ItemID) === Number(row.ItemID || row.ItemRef)
            ) || null;

            return (
              <MultiColumnDropDown
                data={availableItems}
                columns={itemDropdownColumns}
                value={selectedItemObj}
                displayKey="ItemCode"
                placeholder="انتخاب کالا..."
                disabled={isUsed}
                enableMultiSelection={true}
                onChange={(selected) => {
                  if (!selected) {
                    onChangeRow({
                      ...row,
                      ItemID: null,
                      ItemRef: null,
                      ItemCode: "",
                      ItemName: "",
                      ItemName2: "",
                      MeasurementUnitName: "",
                    });
                    return;
                  }

                  if (Array.isArray(selected)) {
                    if (selected.length === 0) {
                      onChangeRow({
                        ...row,
                        ItemID: null,
                        ItemRef: null,
                        ItemCode: "",
                        ItemName: "",
                        ItemName2: "",
                        MeasurementUnitName: "",
                      });
                    } else {
                      const mappedRows = selected.map((item) => ({
                        ItemID: Number(item.ItemID),
                        ItemRef: Number(item.ItemID),
                        ItemCode: String(item.ItemCode || item.product_code || ""),
                        ItemName: item.ItemName || item.product_name || "",
                        ItemName2: item.ItemName2 || item.name2 || "",
                        MeasurementUnitName: item.MeasurementUnitName || item.unit || "",
                      }));
                      onChangeRow(mappedRows);
                    }
                  } else {
                    onChangeRow({
                      ...row,
                      ItemID: Number(selected.ItemID),
                      ItemRef: Number(selected.ItemID),
                      ItemCode: String(selected.ItemCode || selected.product_code || ""),
                      ItemName: selected.ItemName || selected.product_name || "",
                      ItemName2: selected.ItemName2 || selected.name2 || "",
                      MeasurementUnitName: selected.MeasurementUnitName || selected.unit || "",
                    });
                  }
                }}
              />
            );
          },
        },
        {
          key: "ItemName",
          header: "عنوان",
          type: "text",
          width: "200px",
          render: (row: any) => (
            <input
              type="text"
              value={row.ItemName || ""}
              readOnly={true}
              disabled={true}
              className="w-full text-[11px] px-1 bg-transparent dark:text-gray-200 outline-none h-full font-sans cursor-not-allowed opacity-80"
            />
          ),
        },
        {
          key: "ItemName2",
          header: "عنوان (2)",
          type: "text",
          width: "200px",
          render: (row: any) => (
            <input
              type="text"
              value={row.ItemName2 || ""}
              readOnly={true}
              disabled={true}
              className="w-full text-[11px] px-1 bg-transparent dark:text-gray-200 outline-none h-full font-sans cursor-not-allowed opacity-80"
            />
          ),
        },
        {
          key: "MeasurementUnitName",
          header: "واحدسنجش",
          type: "text",
          width: "140px",
          render: (row: any) => (
            <input
              type="text"
              value={row.MeasurementUnitName || ""}
              readOnly={true}
              disabled={true}
              className="w-full text-[11px] px-1 bg-transparent dark:text-gray-200 outline-none h-full font-sans cursor-not-allowed opacity-80"
            />
          ),
        },
      ],
    },
  ];

  const bottomTabs = [
    {
      id: "accounting_info",
      label: "اطلاعات حسابداری",
      content: (
        <div className="p-4 overflow-y-auto h-full space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 bg-slate-50/50 dark:bg-slate-900/40 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
            {/* Row 1, Col 1 */}
            <div className="flex items-center gap-[5px]">
              <span className="form-label-container shrink-0 px-1 text-[12px] font-medium text-slate-700 dark:text-slate-300">معین فروش:</span>
              <div className="flex-1">
                <SlAccountDropDown
                  value={values.InventorySlAccountRef}
                  onChange={(val) => handleChange("InventorySlAccountRef", val)}
                  disabled={isUsed}
                  onAdd={handleAddAccount}
                />
              </div>
            </div>

            {/* Row 1, Col 2 */}
            <div className="flex items-center gap-[5px]">
              <span className="form-label-container shrink-0 px-1 text-[12px] font-medium text-slate-700 dark:text-slate-300">معین برگشت از فروش:</span>
              <div className="flex-1">
                <SlAccountDropDown
                  value={values.IndividualPurchaseSlAccountRef}
                  onChange={(val) => handleChange("IndividualPurchaseSlAccountRef", val)}
                  disabled={isUsed}
                  onAdd={handleAddAccount}
                />
              </div>
            </div>

            {/* Row 2, Col 1 */}
            <div className="flex items-center gap-[5px]">
              <span className="form-label-container shrink-0 px-1 text-[12px] font-medium text-slate-700 dark:text-slate-300">معین حسابهای دریافتنی اشخاص:</span>
              <div className="flex-1">
                <SlAccountDropDown
                  value={values.FreightSlAccountRef}
                  onChange={(val) => handleChange("FreightSlAccountRef", val)}
                  disabled={isUsed}
                  onAdd={handleAddAccount}
                />
              </div>
            </div>

            {/* Row 2, Col 2 */}
            <div className="flex items-center gap-[5px]">
              <span className="form-label-container shrink-0 px-1 text-[12px] font-medium text-slate-700 dark:text-slate-300">معین حسابهای دریافتنی شرکتها:</span>
              <div className="flex-1">
                <SlAccountDropDown
                  value={values.SuspensePurchaseSlAccountRef}
                  onChange={(val) => handleChange("SuspensePurchaseSlAccountRef", val)}
                  disabled={isUsed}
                  onAdd={handleAddAccount}
                />
              </div>
            </div>

            {/* Row 3, Col 1 */}
            <div className="flex items-center gap-[5px]">
              <span className="form-label-container shrink-0 px-1 text-[12px] font-medium text-slate-700 dark:text-slate-300">معین بهای تمام شده فروش:</span>
              <div className="flex-1">
                <SlAccountDropDown
                  value={values.CorporatePurchaseSlAccountRef}
                  onChange={(val) => handleChange("CorporatePurchaseSlAccountRef", val)}
                  disabled={isUsed}
                  onAdd={handleAddAccount}
                />
              </div>
            </div>

            {/* Row 3, Col 2 */}
            <div className="flex items-center gap-[5px]">
              <span className="form-label-container shrink-0 px-1 text-[12px] font-medium text-slate-700 dark:text-slate-300">معین پیش دریافت ها:</span>
              <div className="flex-1">
                <SlAccountDropDown
                  value={values.ForeignPurchaseSlAccountRef}
                  onChange={(val) => handleChange("ForeignPurchaseSlAccountRef", val)}
                  disabled={isUsed}
                  onAdd={handleAddAccount}
                />
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "product_linkage",
      label: "کالا",
      content: (
        <div className="flex-1 h-full min-h-[250px] overflow-hidden p-2">
          <TabCellRow
            tabs={itemsTabConfig}
            value={values.Items || []}
            onChange={(val) => handleChange("Items", val)}
            hideHeader={true}
            isReadonly={isUsed}
          />
        </div>
      ),
    },
  ];

  const handleNew = () => {
    addTab("طبقه حساب فروش جدید", "sle", <Layers className="w-4 h-4" />, "SalesAccountCategoryForm");
  };

  const handleList = () => {
    addTab("فهرست طبقات حساب فروش", "sle", <List className="w-4 h-4" />, "SalesAccountCategoryList");
  };

  const listColumns = [
    { key: "SalesAccountCategoryCode", label: "کد" },
    { key: "SalesAccountCategoryName", label: "عنوان" },
    { key: "SalesAccountCategoryName2", label: "عنوان (2)" },
    { key: "IsActive", label: "وضعیت", renderItem: (item: any) => (item.IsActive ? "فعال" : "غیرفعال") },
  ];

  return (
    <SimpleFormTwoRowTabbed
      isReadonly={isUsed || false}
      title={activeId ? "ویرایش طبقه حساب فروش" : "طبقه حساب فروش جدید"}
      icon={<Layers className="w-4 h-4" />}
      headerGradient="from-indigo-600 to-indigo-500"
      fields={fields}
      values={values}
      onChange={handleChange}
      errors={errors}
      onNew={handleNew}
      onList={handleList}
      listApiUrl="/api/sle/sales-account-categories"
      listColumns={listColumns}
      listDisplayKey="SalesAccountCategoryName"
      onListSelect={(item: any) => {
        const catId = item.SalesAccountCategoryID || item.id;
        if (activeId !== catId) {
          addTab(
            `ویرایش طبقه حساب فروش ${item.SalesAccountCategoryName || item.SalesAccountCategoryCode || catId}`,
            "sle",
            <Layers className="w-4 h-4" />,
            "SalesAccountCategoryForm",
            { id: catId }
          );
        }
      }}
      onSave={handleSave}
      onSaveNew={handleSaveNew}
      onDelete={handleDelete}
      isSubmitting={isSubmitting}
      bottomTabs={bottomTabs}
      defaultBottomTabId="accounting_info"
    />
  );
}

export function SalesAccountCategoryForm(props: SalesAccountCategoryProps) {
  return <SalesAccountCategory {...props} />;
}

export default SalesAccountCategory;
