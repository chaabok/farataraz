"use client";

import { useFormUsageCheck } from "@/hooks/useFormUsageCheck";
import React, { useEffect } from "react";
import { SimpleFormTwoRowTabbed } from "../SimpleFormTwoRowTabbed";
import { useLanguage } from "../../Providers";
import { useFormUpsert } from "@/hooks/useFormUpsert";
import { apiFetch } from "@/lib/utils";
import { MultiColumnDropdown } from "@/components/inputs/MultiColumnDropdown";
import { MainDataGrid } from "../../ui/MainDataGrid";
import { BankAccountDropDown } from "@/components/inputs";
import { useTabs } from "../../TabsProvider";
import { useToast } from "../../ToastProvider";
import { FileText, RefreshCcw, XCircle } from "lucide-react";
import { useChequebookStore } from "@/lib/stores/chequebookStore";
import { useChequebookColumns } from "./ChequebookList";

interface ChequebookProps {
  initialData?: any;
  id?: number | string;
}

export default function ChequebookForm({ initialData, id }: ChequebookProps) {
  const rawListColumns = useChequebookColumns();
  const listColumns = rawListColumns.map((c: any) => ({ ...c, label: c.header || c.label }));
  const { t, language } = useLanguage();
  const { addTab, removeTab } = useTabs();
  const { showToast } = useToast();
  const { activeId, isUpdate, method, getUrl, handleResponse, setActiveId } = useFormUpsert(id || initialData?.chequebookId);
  const { isUsed } = useFormUsageCheck("Chequebook", activeId);


  const {
    values,
    setValues,
    items,
    setItems,
    errors,
    setErrors,
    selectedItems,
    setSelectedItems,
    reset,
  } = useChequebookStore();

  // Reset store on unmount or on new form
  useEffect(() => {
    if (!id && !initialData) {
      reset();
    }
  }, [id, initialData, reset]);

  useEffect(() => {
    if (initialData) {
      setValues({
        bankAccountRef: initialData.bankAccountRef || null,
        series: initialData.series || "",
        leafCount: initialData.leafCount || "",
        startSerial: initialData.startSerial || "",
        isActive: initialData.isActive ?? true,
      });
      if (initialData.items) {
        setItems(initialData.items);
      }
    } else if (activeId) {
      apiFetch(`/api/rap/chequebooks/${activeId}`)
        .then(res => res.json())
        .then(data => {
          setValues({
            bankAccountRef: data.bankAccountRef || null,
            bankAccount: data.bankAccount || null,
            series: data.series || "",
            leafCount: data.leafCount || "",
            startSerial: data.startSerial || "",
            isActive: data.isActive ?? true,
          });
          if (data.items) {
            setItems(data.items);
          }
        })
        .catch(console.error);
    }
  }, [initialData, activeId, setValues, setItems]);

  // Generate Check items when leafCount or startSerial change
  useEffect(() => {
    if (isUpdate) return; // Only generate on create or if newly editing? Usually just on typing
    const count = parseInt(values.leafCount, 10);
    const start = parseInt(values.startSerial, 10);
    
    if (!isNaN(count) && count > 0 && count <= 500 && !isNaN(start)) {
      const newItems = Array.from({ length: count }).map((_, index) => ({
        id: `temp-${index}`, // Temporary ID for selection
        checkNumber: start + index,
        receiver: "",
        issueDate: "",
        amount: null,
        status: 1 // NORMAL
      }));
      setItems(newItems);
    } else if (!isUpdate) {
      setItems([]);
    }
  }, [values.leafCount, values.startSerial, isUpdate]);

  const handleChange = (name: string, value: any) => {
    setValues((prev: any) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!values.bankAccountRef) newErrors.bankAccountRef = "حساب بانکی الزامی است";
    if (!values.leafCount) newErrors.leafCount = "تعداد برگ الزامی است";
    if (!values.startSerial) newErrors.startSerial = "سریال شروع الزامی است";
    if (items.length === 0) newErrors.items = "جزئیات چک‌ها الزامی است";
    
    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    if (!isValid) {
      showToast("لطفا فیلدهای اجباری را تکمیل نمایید", "error");
    }
    return isValid;
  };

  const handleSave = async () => {
    if (!validate()) {
      throw new Error("VALIDATION_FAILED");
    }

    const payload = {
      ...values,
      bankAccount: undefined,
      leafCount: values.leafCount ? Number(values.leafCount) : 0,
      startSerial: values.startSerial ? Number(values.startSerial) : 0,
      items: items.map(item => ({
        ...item,
        id: undefined, // Remove temp id
      }))
    };

    try {
      const res = await apiFetch(getUrl("/api/rap/chequebooks"), {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        handleResponse(data, "chequebookId");
        showToast("اطلاعات با موفقیت ذخیره شد.", "success");
      } else {
        showToast("خطا در ذخیره اطلاعات.", "error");
        console.error("Failed to save", await res.text());
        throw new Error("API_ERROR");
      }
    } catch (e: any) {
      console.error(e);
      if (e.message !== "VALIDATION_FAILED") {
        showToast("خطای سیستمی رخ داد.", "error");
      }
      throw e;
    }
  };

  const handleCancelChecks = () => {
    if (selectedItems.length === 0) {
      showToast("لطفا ابتدا چک(های) مورد نظر را انتخاب نمایید", "error");
      return;
    }
    const selectedCheckNumbers = selectedItems.map(item => item.checkNumber);
    const newItems = items.map(item => {
      if (selectedCheckNumbers.includes(item.checkNumber)) {
        return { ...item, status: 2 }; // VOID
      }
      return item;
    });
    setItems(newItems);
  };

  const handleUndoCancelChecks = () => {
    if (selectedItems.length === 0) {
      showToast("لطفا ابتدا چک(های) مورد نظر را انتخاب نمایید", "error");
      return;
    }
    const selectedCheckNumbers = selectedItems.map(item => item.checkNumber);
    const newItems = items.map(item => {
      if (selectedCheckNumbers.includes(item.checkNumber)) {
        return { ...item, status: 1 }; // NORMAL
      }
      return item;
    });
    setItems(newItems);
  };

  const fields = [
    {
      name: "bankAccountRef",
      label: "حساب بانکی",
      type: "custom",
      required: true,
      customComponent: (
        <div style={{ minWidth: 200, width: "100%", height: "28px" }}>
            <BankAccountDropDown
                value={values.bankAccount}
                onChange={(selected: any) => {
                  handleChange("bankAccountRef", selected ? selected.bankAccountId : null);
                  handleChange("bankAccount", selected);
                }}
            />
        </div>
      )
    },
    {
      name: "series",
      label: "سری چک",
      type: "text",
    },
    {
      name: "leafCount",
      label: "تعداد برگ",
      type: "number",
      required: true,
    },
    {
      name: "startSerial",
      label: "سریال شروع",
      type: "number",
      required: true,
    },
    {
      name: "isActive",
      label: "فعال",
      type: "checkbox",
    }
  ];

  const columns = [
    { key: "row", label: "ردیف", cell: ({ row }: any) => row.index + 1 },
    { key: "checkNumber", label: "شماره چک" },
    { key: "receiver", label: "گیرنده" },
    { key: "issueDate", label: "تاریخ صدور" },
    { key: "amount", label: "مبلغ" },
    { 
      key: "status", 
      label: "وضعیت",
      cell: ({ row }: any) => {
        const s = row.original.status;
        return s === 2 ? "باطل شده" : "عادی";
      }
    },
  ];

  const detailsTab = (
      <div className="w-full h-full flex flex-col relative">
       <MainDataGrid
        entityName="Chequebook" 
         columns={columns} 
         data={items} 
         title="" 
         hideExcelExport 
         hidePdfExport 
         hideWordExport
         hideTitleBar
         enableMultiSelection={true}
         onSelectionChange={setSelectedItems}
       />
    </div>
  );

  return (
    <SimpleFormTwoRowTabbed isReadonly={isUsed || false}
      title={isUpdate ? "ویرایش دسته چک" : "دسته چک جدید"}
      fields={fields as any}
      values={values}
      errors={errors}
      onChange={handleChange}
      onSave={handleSave}
      onSaveNew={async () => {
        await handleSave();
        setValues({
          bankAccountRef: null,
          bankAccount: null,
          series: "",
          leafCount: "",
          startSerial: "",
          isActive: true,
          items: [],
        });
        setItems([]);
        setActiveId(null);
      }}
      onSaveClose={async () => {
        await handleSave();
        removeTab(`ChequebookForm-${activeId || 'new'}`);
      }}
      onDelete={activeId ? async () => {
        try {
          const res = await apiFetch(`/api/rap/chequebooks/${activeId}`, { method: "DELETE" });
          if (!res.ok) throw new Error(await res.text());
        } catch (e: any) {
          throw e;
        }
      } : undefined}
      onNew={() => {
        setValues({
          bankAccountRef: null,
          bankAccount: null,
          series: "",
          leafCount: "",
          startSerial: "",
          isActive: true,
          items: [],
        });
        setItems([]);
        setActiveId(null);
      }}
      listApiUrl="/api/rap/chequebooks"
      listColumns={listColumns}
      listDisplayKey="series"
      onListSelect={(item: any) => {
        const itemId = item.chequebookId || item.id;
        if (activeId !== itemId) {
          if (!activeId) {
             setActiveId(itemId);
             return;
          }
          addTab(
            `ویرایش دسته چک ${item.series || itemId}`,
            "rap",
            <FileText className="w-4 h-4" />,
            "ChequebookForm",
            { id: itemId }
          );
        }
      }}
      bottomTabs={[
        { id: "details", label: "جزئیات", content: detailsTab }
      ]}
      footer={
        <div className="w-full px-4 py-2 flex items-center justify-start gap-2">
          <button 
            title="ابطال چک"
            type="button"
            onClick={handleCancelChecks}
            className="flex items-center gap-2 px-3 pl-4 py-2 text-sm font-medium border border-gray-300 rounded shadow-sm hover:bg-rose-50 dark:hover:bg-rose-900/30 bg-white dark:bg-gray-800 text-rose-600 dark:text-rose-500 transition-colors"
          >
            <XCircle className="w-4 h-4" />
            ابطال چک
          </button>
          <button 
            title="برگشت از ابطال"
            type="button"
            onClick={handleUndoCancelChecks}
            className="flex items-center gap-2 px-3 pl-4 py-2 text-sm font-medium border border-gray-300 rounded shadow-sm hover:bg-emerald-50 dark:hover:bg-emerald-900/30 bg-white dark:bg-gray-800 text-emerald-600 dark:text-emerald-500 transition-colors"
          >
            <RefreshCcw className="w-4 h-4" />
            برگشت از ابطال
          </button>
        </div>
      }
    />
  );
}
