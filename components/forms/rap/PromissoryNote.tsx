"use client";

import { useFormUsageCheck } from "@/hooks/useFormUsageCheck";
import React, { useEffect } from "react";
import { SaveButton } from "@/components/buttons/SaveButton";
import { SaveNewButton } from "@/components/buttons/SaveNewButton";
import { SaveCloseButton } from "@/components/buttons/SaveCloseButton";
import { DeleteButton } from "@/components/buttons/DeleteButton";
import { DeleteAndNewButton } from "@/components/buttons/DeleteAndNewButton";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { SimpleFormTwoRowTabbed } from "../SimpleFormTwoRowTabbed";
import { useLanguage } from "../../Providers";
import { useFormUpsert } from "@/hooks/useFormUpsert";
import { SingleSelectDropDown } from "@/components/inputs/SingleSelectDropDown";
import { MainDataGrid } from "../../ui/MainDataGrid";
import { useTabs } from "../../TabsProvider";
import { useToast } from "@/components/ToastProvider";
import { apiFetch } from "@/lib/utils";
import { eventBus, EVENTS } from "@/lib/events";
import { FileText } from "lucide-react";
import { StateListInput } from "../../inputs/StateListInput";
import { usePromissoryNoteColumns } from "./PromissoryNoteList";

import { usePromissoryNoteStore } from "@/lib/stores/promissoryNoteStore";

interface PromissoryNoteProps {
  initialData?: any;
  id?: number | string;
}

export default function PromissoryNoteForm({ initialData, id }: PromissoryNoteProps) {
  const rawListColumns = usePromissoryNoteColumns();
  const listColumns = rawListColumns.map((c: any) => ({ ...c, label: c.header || c.label }));
  const { t } = useLanguage();
  const { showToast } = useToast();
  const { addTab, removeTab } = useTabs();
  const { activeId, isUpdate, method, getUrl, handleResponse, setActiveId } = useFormUpsert(id || initialData?.promissoryNoteId);
  const { isUsed } = useFormUsageCheck("PromissoryNote", activeId);


  const {
    values,
    setValues,
    items,
    setItems,
    errors,
    setErrors,
    maxLeaves,
    setMaxLeaves,
    isGenerating,
    setIsGenerating,
    isDeleting,
    setIsDeleting,
    reset,
  } = usePromissoryNoteStore();

  useEffect(() => {
    if (!id && !initialData) {
      reset();
    }
  }, [id, initialData, reset]);

  useEffect(() => {
    if (initialData) {
      setValues({
        cashRef: initialData.cashRef || null,
        cash: initialData.cash || null,
        series: initialData.series || "",
        leafCount: initialData.leafCount || "",
        startSerial: initialData.startSerial || "",
        valueEach: initialData.valueEach || "",
        status: initialData.status !== undefined ? initialData.status : 2,
      });
      if (initialData.items) {
        setItems(initialData.items);
      }
    } else if (activeId) {
      apiFetch(`/api/rap/promissory-notes/${activeId}`)
        .then(res => res.json())
        .then(data => {
          const fetchedData = data.data || data;
          setValues({
            cashRef: fetchedData.cashRef || null,
            cash: fetchedData.cash || null,
            series: fetchedData.series || "",
            leafCount: fetchedData.leafCount || "",
            startSerial: fetchedData.startSerial || "",
            valueEach: fetchedData.valueEach || "",
            status: fetchedData.status !== undefined ? fetchedData.status : 2,
          });
          if (fetchedData.items) {
            setItems(fetchedData.items);
          }
        })
        .catch(console.error);
    }
  }, [initialData, activeId]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await apiFetch(`/api/common/base-settings/tab/6`);
        if (res.ok) {
          const result = await res.json();
          const settings = result.data || {};
          const max = settings.maxPromissoryNoteLeaves ? parseInt(settings.maxPromissoryNoteLeaves, 10) : 500;
          setMaxLeaves(max);
        } else {
          // Silent fallback if API returns error (e.g. 401)
          setMaxLeaves(500);
        }
      } catch (e) {
        // Silent fallback if fetch fails
        setMaxLeaves(500);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    // Generate Promissory Note items when leafCount or startSerial change
    if (isUpdate) return;
    const count = parseInt(values.leafCount, 10);
    const start = parseInt(values.startSerial, 10);
    const valEach = parseFloat(values.valueEach);
    
    // Safety check for maxLeaves
    const limit = maxLeaves || 500;
    
    if (!isNaN(count) && count > 0 && count <= limit && !isNaN(start) && !isNaN(valEach)) {
      setIsGenerating(true);
      const timer = setTimeout(() => {
        const newItems = Array.from({ length: count }).map((_, index) => ({
          id: `temp-${index}`,
          promissoryNoteNumber: start + index,
          value: valEach,
          status: 1 // Unused
        }));
        setItems(newItems);
        setIsGenerating(false);
      }, 600); // Debounce to allow user to finish typing and prevent main thread lockup
      return () => clearTimeout(timer);
    } else if (!isUpdate) {
      setItems([]);
      setIsGenerating(false);
    }
  }, [values.leafCount, values.startSerial, values.valueEach, isUpdate, maxLeaves]);

  const handleChange = (name: string, value: any) => {
    setValues((prev: any) => ({ ...prev, [name]: value }));
    
    if (name === "leafCount") {
      const count = parseInt(value, 10);
      const limit = maxLeaves || 500;
      if (!isNaN(count) && count > limit) {
        setErrors((prev: Record<string, string>) => ({ 
          ...prev, 
          leafCount: `تعداد برگ نمی‌تواند بیشتر از ${limit} باشد. (تنظیمات سیستم: ${limit})` 
        }));
      } else {
        setErrors((prev: Record<string, string>) => {
          const newErrors = { ...prev };
          delete newErrors.leafCount;
          return newErrors;
        });
      }
    }
  };

  const handleSave = async (action: 'save' | 'save_and_new' | 'save_and_close' = 'save') => {
    // Check for validation errors
    const count = parseInt(values.leafCount, 10);
    const limit = maxLeaves || 500;
    
    if (!values.cashRef) {
      showToast("لطفاً صندوق را انتخاب کنید", "error");
      return;
    }
    if (!values.leafCount || !values.startSerial || !values.valueEach) {
      showToast("لطفاً همه فیلدهای اجباری را تکمیل کنید", "error");
      return;
    }
    if (count > limit) {
      showToast(`تعداد برگ نمی‌تواند بیشتر از ${limit} باشد`, "error");
      return;
    }

    try {
      const res = await apiFetch(getUrl('/api/rap/promissory-notes'), {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, items, cashRef: values.cashRef })
      });
      
      const data = await res.json().catch(() => ({}));
      
      if (res.ok) {
        handleResponse(data, 'promissoryNoteId');
        showToast("سفته با موفقیت ذخیره شد", "success");
        eventBus.emit(EVENTS.DATA_CHANGED, { entity: 'PromissoryNote' });
        
        if (action === 'save_and_close') {
           removeTab(`PromissoryNoteForm-${activeId || 'new'}`);
        } else if (action === 'save_and_new') {
           setValues({
            cashRef: null,
            cash: null,
            series: "",
            leafCount: "",
            startSerial: "",
            valueEach: "",
            status: 2,
            items: [],
           });
           setItems([]);
        }
      } else {
        showToast(data.message || "خطا در ذخیره سفته", "error");
      }
    } catch (e: any) {
      console.error("Save error:", e);
      showToast(`خطا در ارتباط با سرور: ${e.message}`, "error");
    }
  };

  const handleDelete = async (actionType: string = 'delete') => {
    if (!activeId) return;
    setIsDeleting(true);
    try {
      const res = await apiFetch(`/api/rap/promissory-notes/${activeId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setIsDeleting(false);
        showToast("سفته با موفقیت حذف شد", "success");
        eventBus.emit(EVENTS.DATA_CHANGED, { entity: 'PromissoryNote' });
        // Let the parent component call onNew or onList!
      } else {
        const err = await res.json();
        setIsDeleting(false);
        throw new Error(err.message || "خطا در حذف سفته");
      }
    } catch (e: any) {
      console.error("Delete Promissory Note Error:", e);
      setIsDeleting(false);
      throw new Error(e.message || "خطا در ارتباط با سرور");
    }
  };

  const handleNew = () => {
    reset();
    setActiveId(null);
  };

  const handleList = () => {
    addTab(
      "فهرست سفته ها",
      "rap",
      <FileText className="w-4 h-4" />,
      "PromissoryNoteList"
    );
    removeTab(`PromissoryNoteForm-${activeId || 'new'}`);
  };

  const fields = [
    {
      name: "cashRef",
      label: "صندوق",
      type: "custom",
      required: true,
      customComponent: (
        <SingleSelectDropDown
            value={values.cash || values.cashRef}
            valueKey="cashId"
            onChange={(selected: any) => {
              handleChange("cashRef", selected ? (selected.cashId ?? selected.cashID ?? selected.id) : null);
              handleChange("cash", selected);
            }}
            listApiUrl="/api/rap/cashes"
            displayKey="title"
            placeholder="انتخاب کنید..."
            columns={[
              { key: "code", label: "کد" },
              { key: "title", label: "عنوان" }
            ]}
        />
      )
    },
    {
      name: "series",
      label: "سری سفته",
      type: "text",
    },
    {
      name: "status",
      label: "وضعیت",
      type: "custom",
      customComponent: (
        <StateListInput
          value={values.status}
          onChange={(val) => handleChange("status", val)}
          disabled={isUsed || false}
        />
      )
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
      name: "valueEach",
      label: "ارزش سفته",
      type: "amount",
      required: true,
    }
  ];

  const columns = [
    { key: "row", label: "ردیف", cell: ({ row }: any) => row.index + 1 },
    { key: "promissoryNoteNumber", label: "شماره سفته" },
    { key: "value", label: "ارزش سفته" },
    { 
      key: "status", 
      label: "وضعیت",
      cell: ({ row }: any) => {
        const s = row.original.status;
        if(s === 1) return "استفاده نشده";
        if(s === 2) return "استفاده شده";
        if(s === 3) return "باطل شده";
        return "";
      }
    },
  ];

  const detailsTab = (
      <div className="w-full h-full flex flex-col relative">
       {isGenerating && (
         <div className="absolute inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center rounded-lg">
           <div className="bg-white/10 p-6 rounded-xl border border-white/20 flex flex-col items-center gap-4">
             <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
             <span className="text-white font-medium">در حال تولید اقلام سفته...</span>
           </div>
         </div>
       )}
       <MainDataGrid
        entityName="PromissoryNote" 
         columns={columns} 
         data={items} 
         title="" 
         hideExcelExport 
         hidePdfExport 
         hideWordExport
         hideTitleBar
       />
    </div>
  );

  return (
    <>
      <LoadingOverlay visible={isDeleting} message="در حال حذف سفته..." />
      <SimpleFormTwoRowTabbed isReadonly={isUsed || false}
        title={isUpdate ? "ویرایش سفته" : "سفته جدید"}
        fields={fields as any}
        values={values}
        errors={errors}
        onChange={handleChange}
        onSave={() => handleSave('save')}
        onSaveNew={() => handleSave('save_and_new')}
        onSaveClose={() => handleSave('save_and_close')}
        onDelete={handleDelete}
        onNew={handleNew}
        listApiUrl="/api/rap/promissory-notes"
        listColumns={listColumns}
        listDisplayKey="series"
        onListSelect={(item: any) => {
          const itemId = item.promissoryNoteId || item.id;
          if (activeId !== itemId) {
            if (!activeId) {
               setActiveId(itemId);
               return;
            }
            addTab(
              `ویرایش سفته ${item.number || itemId}`,
              "rap",
              <FileText className="w-4 h-4" />,
              "PromissoryNoteForm",
              { id: itemId }
            );
          }
        }}
        bottomTabs={[
          { id: "details", label: "جزئیات", content: detailsTab }
        ]}
      />
    </>
  );
}
