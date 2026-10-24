"use client";

import React, { useState, useEffect } from "react";
import { SimpleFormTwoRowTabbed } from "../SimpleFormTwoRowTabbed";
import { FieldConfig } from "../SimpleFormTwoRow";
import { TabCellRow, TabCellConfig } from "../TabCellRow";
import { MultiColumnDropdown } from "@/components/inputs/MultiColumnDropdown";
import { SingleSelectDropDown } from "@/components/inputs/SingleSelectDropDown";
import { CheckBoxRightLabel } from "@/components/inputs/CheckBoxRightLabel";
import { NumberInput } from "@/components/inputs/NumberInput";
import { TextInput } from "@/components/inputs/TextInput";
import { DateInput } from "@/components/inputs/DateInput";
import { TimeInput } from "@/components/inputs/TimeInput";
import { Package, List } from "lucide-react";
import { useTabs } from "@/components/TabsProvider";
import { useToast } from "@/components/ToastProvider";
import { apiFetch } from "@/lib/utils";
import { useFormUpsert } from "@/hooks/useFormUpsert";
import { useFormUsageCheck } from "@/hooks/useFormUsageCheck";
import { eventBus, EVENTS } from "@/lib/events";

interface TrackingFactorProps {
  id?: number;
  tabId?: string;
}

const TYPE_OPTIONS = [
  { id: 1, title: 'عدد ساده' },
  { id: 2, title: 'عدد اعشاری' },
  { id: 3, title: 'بولیین' },
  { id: 4, title: 'تاریخ' },
  { id: 5, title: 'ساعت' },
  { id: 6, title: 'حرفی' },
  { id: 7, title: 'رنگ' },
  { id: 8, title: 'بازه اعداد' },
];

function containsDecimal(val?: string | null): boolean {
  if (!val) return false;
  const normalized = String(val)
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 1632));
  return /\d+[\.٫]\d+/.test(normalized) || /\.\d+/.test(normalized) || /٫\d+/.test(normalized);
}

export function TrackingFactor({ id, tabId }: TrackingFactorProps) {
  const { addTab, removeTab } = useTabs();
  const { showToast } = useToast();
  const { activeId, method, getUrl, handleResponse, setActiveId } = useFormUpsert(id);
  const { isUsed } = useFormUsageCheck("TrackingFactor", activeId);

  const [values, setValues] = useState<Record<string, any>>({
    TrackingFactorID: "",
    TrackingFactorCode: "",
    TrackingFactorName: "",
    TrackingFactorName2: "",
    TrackingFactorType: 1,
    StartValue: "",
    EndValue: "",
    IsConstantValue: false,
    DisplayPriority: 1,
    IsActive: true,
    relatedItems: [],
    constantValues: [],
  });

  const [availableItems, setAvailableItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch available products (active + unlinked)
  const fetchAvailableItems = (tfId?: number) => {
    const query = tfId ? `?trackingFactorId=${tfId}` : "";
    apiFetch(`/api/inv/tracking-factors/available-items${query}`)
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setAvailableItems(list);
      })
      .catch((err) => {
        console.error("Error fetching available items:", err);
      });
  };

  // Fetch Next Number and Priority for new records
  const fetchNextCodeAndPriority = () => {
    apiFetch('/api/inv/tracking-factors/next-number')
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setValues((prev) => ({
            ...prev,
            ...(data.documentNumber !== undefined ? { TrackingFactorCode: data.documentNumber } : {}),
            ...(data.nextPriority !== undefined ? { DisplayPriority: data.nextPriority } : {}),
          }));
        }
      })
      .catch(console.error);
  };

  // Fetch existing record if editing
  useEffect(() => {
    fetchAvailableItems(activeId ? Number(activeId) : undefined);

    if (activeId) {
      setIsLoading(true);
      apiFetch(`/api/inv/tracking-factors/${activeId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data) {
            const mappedRelated = (data.relatedItems || []).map((rel: any) => ({
              ItemRef: rel.ItemRef || rel.item?.ItemID,
              ItemCode: rel.item?.ItemCode || '',
              ItemName: rel.item?.ItemName || '',
              ItemName2: rel.item?.ItemName2 || '',
            }));

            const mappedConstantValues = (data.constantValues || []).map((cv: any, idx: number) => ({
              RowNumber: cv.RowNumber || idx + 1,
              ConstantValue: cv.ConstantValue || "",
            }));

            setValues({
              TrackingFactorID: data.TrackingFactorID,
              TrackingFactorCode: data.TrackingFactorCode,
              TrackingFactorName: data.TrackingFactorName || "",
              TrackingFactorName2: data.TrackingFactorName2 || "",
              TrackingFactorType: data.TrackingFactorType || 1,
              StartValue: data.StartValue !== undefined && data.StartValue !== null ? data.StartValue : (data.TrackingFactorType === 8 ? "از سریال" : ""),
              EndValue: data.EndValue !== undefined && data.EndValue !== null ? data.EndValue : (data.TrackingFactorType === 8 ? "تا سریال" : ""),
              IsConstantValue: !!data.IsConstantValue,
              DisplayPriority: data.DisplayPriority !== undefined ? data.DisplayPriority : 1,
              IsActive: data.IsActive !== undefined ? data.IsActive : true,
              relatedItems: mappedRelated,
              constantValues: mappedConstantValues,
            });
          }
        })
        .catch((err) => {
          console.error("Error loading tracking factor:", err);
          showToast("خطا در دریافت اطلاعات عامل ردیابی", "error");
        })
        .finally(() => setIsLoading(false));
    } else {
      fetchNextCodeAndPriority();
    }
  }, [activeId]);

  const handleFieldChange = (name: string, value: any) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (): Promise<boolean> => {
    if (!values.TrackingFactorName || !values.TrackingFactorName.trim()) {
      showToast("لطفاً عنوان عامل ردیابی را وارد کنید", "error");
      return false;
    }

    if (values.DisplayPriority === undefined || values.DisplayPriority === null || values.DisplayPriority === "") {
      showToast("لطفاً اولویت نمایش را وارد کنید", "error");
      return false;
    }

    const isRange = Number(values.TrackingFactorType) === 8;
    if (isRange) {
      if (!values.StartValue || !String(values.StartValue).trim()) {
        showToast("لطفاً مقدار شروع را وارد کنید", "error");
        return false;
      }
      if (!values.EndValue || !String(values.EndValue).trim()) {
        showToast("لطفاً مقدار پایان را وارد کنید", "error");
        return false;
      }
      if (containsDecimal(values.StartValue)) {
        showToast("مقدار فیلد شروع نمی‌تواند شامل عدد اعشاری باشد", "error");
        return false;
      }
      if (containsDecimal(values.EndValue)) {
        showToast("مقدار فیلد پایان نمی‌تواند شامل عدد اعشاری باشد", "error");
        return false;
      }
    }

    const payload = {
      TrackingFactorCode: values.TrackingFactorCode ? Number(values.TrackingFactorCode) : undefined,
      TrackingFactorName: values.TrackingFactorName.trim(),
      TrackingFactorName2: (values.TrackingFactorName2 && values.TrackingFactorName2.trim()) ? values.TrackingFactorName2.trim() : null,
      TrackingFactorType: Number(values.TrackingFactorType || 1),
      StartValue: isRange ? (values.StartValue ? String(values.StartValue).trim() : "از سریال") : null,
      EndValue: isRange ? (values.EndValue ? String(values.EndValue).trim() : "تا سریال") : null,
      IsConstantValue: !!values.IsConstantValue,
      DisplayPriority: Number(values.DisplayPriority),
      IsActive: !!values.IsActive,
      relatedItems: (values.relatedItems || [])
        .filter((item: any) => item && item.ItemRef && !isNaN(Number(item.ItemRef)))
        .map((item: any) => ({
          ItemRef: Number(item.ItemRef),
        })),
      constantValues: values.IsConstantValue
        ? (values.constantValues || [])
            .filter((cv: any) => cv && cv.ConstantValue !== undefined && cv.ConstantValue !== null && String(cv.ConstantValue).trim() !== "")
            .map((cv: any, idx: number) => ({
              RowNumber: idx + 1,
              ConstantValue: String(cv.ConstantValue).trim(),
            }))
        : [],
    };

    try {
      const response = await apiFetch(getUrl('/api/inv/tracking-factors'), {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        showToast(data.message || "خطا در ذخیره اطلاعات", "error");
        return false;
      }

      showToast("عامل ردیابی با موفقیت ذخیره گردید", "success");
      handleResponse(data, "TrackingFactorID");
      eventBus.emit(EVENTS.DATA_CHANGED, { entity: "TrackingFactor" });
      return true;
    } catch (err: any) {
      console.error("Save error:", err);
      showToast("خطا در برقراری ارتباط با سرور", "error");
      return false;
    }
  };

  const handleSaveNew = async () => {
    const success = await handleSave();
    if (success) {
      setValues({
        TrackingFactorID: "",
        TrackingFactorCode: "",
        TrackingFactorName: "",
        TrackingFactorName2: "",
        TrackingFactorType: 1,
        StartValue: "",
        EndValue: "",
        IsConstantValue: false,
        DisplayPriority: 1,
        IsActive: true,
        relatedItems: [],
        constantValues: [],
      });
      setActiveId(null);
      fetchNextCodeAndPriority();
      fetchAvailableItems();
    }
  };

  const handleSaveClose = async () => {
    const success = await handleSave();
    if (success && tabId) {
      removeTab(tabId);
    }
  };

  const handleNew = () => {
    if (activeId) {
      addTab("تعریف عامل ردیابی", "inv", <Package className="w-4 h-4" />, "TrackingFactorForm");
    } else {
      setValues({
        TrackingFactorID: "",
        TrackingFactorCode: "",
        TrackingFactorName: "",
        TrackingFactorName2: "",
        TrackingFactorType: 1,
        StartValue: "",
        EndValue: "",
        IsConstantValue: false,
        DisplayPriority: 1,
        IsActive: true,
        relatedItems: [],
        constantValues: [],
      });
      fetchNextCodeAndPriority();
      fetchAvailableItems();
    }
  };

  const handleList = () => {
    addTab("عوامل ردیابی", "inv", <List className="w-4 h-4" />, "TrackingFactorList");
  };

  const handleDelete = async () => {
    if (!activeId) return;
    try {
      const res = await apiFetch(`/api/inv/tracking-factors/${activeId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        showToast("عامل ردیابی با موفقیت حذف گردید", "success");
        eventBus.emit(EVENTS.DATA_CHANGED, { entity: "TrackingFactor" });
        if (tabId) removeTab(tabId);
      } else {
        const errorData = await res.json().catch(() => ({}));
        showToast(errorData.message || "خطا در حذف عامل ردیابی", "error");
      }
    } catch (err) {
      console.error("Delete error:", err);
      showToast("خطا در حذف عامل ردیابی", "error");
    }
  };

  // Header Fields Config
  const selectedTypeOption = TYPE_OPTIONS.find(t => t.id === Number(values.TrackingFactorType)) || TYPE_OPTIONS[0];
  const isNumberRange = Number(values.TrackingFactorType) === 8;

  const fields: FieldConfig[] = [
    {
      name: "TrackingFactorCode",
      label: "کد",
      type: "custom",
      required: true,
      customComponent: (
        <NumberInput
          value={values.TrackingFactorCode}
          onChange={(val) => handleFieldChange("TrackingFactorCode", val)}
          disabled={isUsed}
        />
      ),
    },
    {
      name: "TrackingFactorName",
      label: "عنوان عامل ردیابی",
      type: "text",
      required: true,
      disabled: isUsed,
    },
    {
      name: "TrackingFactorName2",
      label: "عنوان عامل ردیابی (2)",
      type: "text",
      disabled: isUsed,
    },
    {
      name: "TrackingFactorType",
      label: "نوع",
      type: "custom",
      required: true,
      customComponent: (
        <SingleSelectDropDown
          data={TYPE_OPTIONS}
          columns={[{ key: "title", label: "نوع" }]}
          value={selectedTypeOption}
          displayKey="title"
          disabled={isUsed}
          onChange={(selected) => {
            const newType = selected ? selected.id : 1;
            setValues((prev) => ({
              ...prev,
              TrackingFactorType: newType,
              ...(newType === 8
                ? {
                    StartValue: prev.StartValue || "از سریال",
                    EndValue: prev.EndValue || "تا سریال",
                  }
                : {}),
            }));
          }}
        />
      ),
    },
    ...(isNumberRange
      ? [
          {
            name: "StartValue",
            label: "شروع",
            type: "text" as const,
            required: true,
            placeholder: "از سریال",
            disabled: isUsed,
          },
          {
            name: "EndValue",
            label: "پایان",
            type: "text" as const,
            required: true,
            placeholder: "تا سریال",
            disabled: isUsed,
          },
        ]
      : []),
    {
      name: "IsConstantValue",
      label: " ",
      type: "custom",
      customComponent: (
        <CheckBoxRightLabel
          label="مقادیر ثابت عامل"
          checked={!!values.IsConstantValue}
          onChange={(checked) => handleFieldChange("IsConstantValue", checked)}
          disabled={isUsed}
        />
      ),
    },
    {
      name: "DisplayPriority",
      label: "اولویت نمایش",
      type: "custom",
      required: true,
      customComponent: (
        <NumberInput
          value={values.DisplayPriority}
          onChange={(val) => handleFieldChange("DisplayPriority", val)}
          disabled={isUsed}
        />
      ),
    },
    {
      name: "IsActive",
      label: " ",
      type: "custom",
      customComponent: (
        <CheckBoxRightLabel
          label="فعال"
          checked={!!values.IsActive}
          onChange={(checked) => handleFieldChange("IsActive", checked)}
          disabled={isUsed}
        />
      ),
    },
  ];

  // Tab Config for Related Products using TabCellRow
  const tabConfigs: TabCellConfig[] = [
    {
      id: "relatedProducts",
      label: "کالاهای مرتبط",
      columns: [
        {
          key: "ItemRef",
          header: "کد کالا",
          type: "custom",
          width: "220px",
          required: true,
          render: (row, _rowIndex, onChange) => (
            <MultiColumnDropdown
              data={availableItems}
              columns={[
                { key: "ItemCode", label: "کد کالا", width: 100 },
                { key: "ItemName", label: "نام کالا", width: 180 },
              ]}
              value={row.ItemRef ? { ItemID: row.ItemRef, ItemCode: row.ItemCode, ItemName: row.ItemName } : null}
              onChange={(selected) => {
                if (Array.isArray(selected)) {
                  if (selected.length === 0) {
                    row.ItemCode = "";
                    row.ItemName = "";
                    onChange("");
                  } else {
                    const mappedRows = selected.map((item) => ({
                      ItemRef: item.ItemID || item.id,
                      ItemCode: item.ItemCode || "",
                      ItemName: item.ItemName || "",
                    }));
                    row.ItemCode = mappedRows[0].ItemCode;
                    row.ItemName = mappedRows[0].ItemName;
                    onChange(mappedRows);
                  }
                } else if (selected) {
                  row.ItemCode = selected.ItemCode || "";
                  row.ItemName = selected.ItemName || "";
                  onChange(selected.ItemID || selected.id);
                } else {
                  row.ItemCode = "";
                  row.ItemName = "";
                  onChange("");
                }
              }}
              displayKey="ItemCode"
              placeholder="انتخاب کالا..."
              enableMultiSelection={true}
              disabled={isUsed}
            />
          ),
        },
        {
          key: "ItemName",
          header: "نام کالا",
          type: "text",
          width: "300px",
          render: (row) => (
            <div className="w-full h-full flex items-center px-2 text-[11px] text-gray-700 dark:text-gray-200 bg-gray-50/50 dark:bg-gray-800/30">
              {row.ItemName || ""}
            </div>
          ),
        },
      ],
    },
  ];

  // Dynamic Input Renderer for Constant Values
  const renderConstantValueInput = (row: any, onChange: (val: any) => void) => {
    const factorType = Number(values.TrackingFactorType || 1);

    switch (factorType) {
      case 1: // عدد ساده
      case 2: // عدد اعشاری
        return (
          <NumberInput
            value={row.ConstantValue}
            onChange={(val) => {
              const v = val !== undefined && val !== null ? String(val) : "";
              row.ConstantValue = v;
              onChange(v);
            }}
            disabled={isUsed}
          />
        );

      case 3: // بولیین
        return (
          <SingleSelectDropDown
            data={[
              { id: "true", title: "بله" },
              { id: "false", title: "خیر" },
            ]}
            columns={[{ key: "title", label: "عنوان" }]}
            value={
              row.ConstantValue === "true" || row.ConstantValue === "1" || row.ConstantValue === "بله"
                ? { id: "true", title: "بله" }
                : row.ConstantValue === "false" || row.ConstantValue === "0" || row.ConstantValue === "خیر"
                ? { id: "false", title: "خیر" }
                : null
            }
            displayKey="title"
            disabled={isUsed}
            onChange={(selected) => {
              const v = selected ? selected.id : "";
              row.ConstantValue = v;
              onChange(v);
            }}
            placeholder="انتخاب کنید..."
          />
        );

      case 4: // تاریخ
        return (
          <DateInput
            value={row.ConstantValue || ""}
            onChange={(val) => {
              row.ConstantValue = val || "";
              onChange(val || "");
            }}
            disabled={isUsed}
            noWrapper={true}
            checkFiscalYear={false}
          />
        );

      case 5: // ساعت
        return (
          <TimeInput
            value={row.ConstantValue || ""}
            onChange={(val) => {
              row.ConstantValue = val || "";
              onChange(val || "");
            }}
            alignVertical={true}
            disabled={isUsed}
          />
        );

      case 6: // حرفی
        return (
          <TextInput
            value={row.ConstantValue || ""}
            onChange={(val) => {
              row.ConstantValue = val || "";
              onChange(val || "");
            }}
            disabled={isUsed}
            noWrapper={true}
          />
        );

      case 7: // رنگ
        return (
          <div className="flex items-center gap-2 w-full h-[25px] px-2 bg-gray-50/50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-lg">
            <input
              type="color"
              value={row.ConstantValue && /^#[0-9A-F]{6}$/i.test(row.ConstantValue) ? row.ConstantValue : "#000000"}
              onChange={(e) => {
                row.ConstantValue = e.target.value;
                onChange(e.target.value);
              }}
              disabled={isUsed}
              className="w-5 h-5 cursor-pointer border-0 p-0 rounded bg-transparent"
            />
            <input
              type="text"
              value={row.ConstantValue || ""}
              onChange={(e) => {
                row.ConstantValue = e.target.value;
                onChange(e.target.value);
              }}
              disabled={isUsed}
              className="flex-1 bg-transparent border-0 outline-none text-[11px] dir-ltr text-slate-800 dark:text-slate-100"
              placeholder="#000000"
            />
          </div>
        );

      case 8: // بازه اعداد
        return (
          <TextInput
            value={row.ConstantValue || ""}
            onChange={(val) => {
              row.ConstantValue = val || "";
              onChange(val || "");
            }}
            disabled={isUsed}
            noWrapper={true}
          />
        );

      default:
        return (
          <TextInput
            value={row.ConstantValue || ""}
            onChange={(val) => {
              row.ConstantValue = val || "";
              onChange(val || "");
            }}
            disabled={isUsed}
            noWrapper={true}
          />
        );
    }
  };

  const constantValuesTabConfig: TabCellConfig[] = [
    {
      id: "constantValuesList",
      label: "مقادیر ثابت عامل",
      columns: [
        {
          key: "RowNumber",
          header: "ردیف",
          type: "text",
          width: "70px",
          render: (_row, rowIndex) => (
            <div className="w-full h-full flex items-center justify-center text-[11px] text-gray-700 dark:text-gray-200 bg-gray-50/50 dark:bg-gray-800/30 font-medium">
              {rowIndex + 1}
            </div>
          ),
        },
        {
          key: "ConstantValue",
          header: "مقدار عامل",
          type: "custom",
          width: "300px",
          required: true,
          render: (row, _rowIndex, onChange) => renderConstantValueInput(row, onChange),
        },
      ],
    },
  ];

  const bottomTabs: any[] = [
    {
      id: "relatedProductsTab",
      label: "کالاهای مرتبط",
      content: (
        <div className="flex-1 h-full min-h-0 overflow-hidden p-0 m-0">
          <TabCellRow
            tabs={tabConfigs}
            value={values.relatedItems}
            onChange={(val) => handleFieldChange("relatedItems", val)}
            hideHeader={true}
            isReadonly={isUsed}
          />
        </div>
      ),
    },
  ];

  if (values.IsConstantValue) {
    bottomTabs.push({
      id: "constantValuesTab",
      label: "مقادیر ثابت عامل",
      content: (
        <div className="flex-1 h-full min-h-0 overflow-hidden p-0 m-0">
          <TabCellRow
            tabs={constantValuesTabConfig}
            value={values.constantValues || []}
            onChange={(val) => handleFieldChange("constantValues", val)}
            hideHeader={true}
            isReadonly={isUsed}
          />
        </div>
      ),
    });
  }

  const listColumns = [
    { key: "TrackingFactorCode", label: "کد" },
    { key: "TrackingFactorName", label: "عنوان" },
    { key: "DisplayPriority", label: "اولویت نمایش" },
    { key: "IsActive", label: "وضعیت", renderItem: (item: any) => (item.IsActive ? "فعال" : "غیرفعال") },
  ];

  return (
    <SimpleFormTwoRowTabbed
      title={activeId ? "ویرایش عامل ردیابی" : "تعریف عامل ردیابی"}
      icon={<Package className="w-4 h-4 text-indigo-500" />}
      fields={fields}
      values={values}
      onChange={handleFieldChange}
      onSave={handleSave}
      onSaveNew={handleSaveNew}
      onSaveClose={handleSaveClose}
      onNew={handleNew}
      onList={handleList}
      onDelete={handleDelete}
      listApiUrl="/api/inv/tracking-factors"
      listColumns={listColumns}
      listDisplayKey="TrackingFactorName"
      onListSelect={(item: any) => {
        const tfId = item.TrackingFactorID || item.id;
        if (activeId !== tfId) {
          addTab(
            `ویرایش عامل ردیابی ${item.TrackingFactorName || item.TrackingFactorCode || tfId}`,
            "inv",
            <Package className="w-4 h-4" />,
            "TrackingFactorForm",
            { id: tfId }
          );
        }
      }}
      isReadonly={isUsed}
      bottomTabs={bottomTabs}
      defaultBottomTabId="relatedProductsTab"
    />
  );
}

export default TrackingFactor;

