"use client";

import { useFormUsageCheck } from "@/hooks/useFormUsageCheck";
import React, { useState, useEffect } from "react";
import { SimpleFormTwoRow, FieldConfig } from "../SimpleFormTwoRow";
import { useLanguage } from "../../Providers";
import { useTabs } from "../../TabsProvider";
import { useToast } from "../../ToastProvider";
import { FileText } from "lucide-react";
import { apiFetch } from "@/lib/utils";
import { eventBus, EVENTS } from "@/lib/events";
import { useFormUpsert } from "@/hooks/useFormUpsert";

interface OtherDetailsFormProps {
  id?: number;
}

export function OtherDetailsForm({ id: initialId }: OtherDetailsFormProps) {
  const { t } = useLanguage();
  const { addTab, activeTabId, removeTab } = useTabs();
  const { showToast } = useToast();
  const { activeId, method, getUrl, handleResponse } = useFormUpsert(initialId);
  const { isUsed } = useFormUsageCheck("OtherDetails", activeId);


  const [values, setValues] = useState<any>({
    title: "",
    title_en: "",
    detailedCode: "",
    description: "",
    isActive: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const generateCode = async () => {
    // optional logic, left empty as we just use number input
  };

  const fields: FieldConfig[] = [
    { name: 'title', label: 'عنوان', type: 'text', colSpan: 1, required: true },
    { name: 'title_en', label: 'عنوان لاتین', type: 'text', colSpan: 1 },
    { 
      name: 'detailedCode', 
      label: 'کد تفصیلی', 
      type: 'number', 
      colSpan: 1 
    },
    { name: 'description', label: 'توضیحات', type: 'textarea', colSpan: 2 },
    { name: 'isActive', label: 'فعال', type: 'checkbox', colSpan: 1 }
  ];

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        title: values.title,
        title_en: values.title_en || undefined,
        description: values.description || undefined,
        detailedCode: values.detailedCode ? Number(values.detailedCode) : undefined,
        isActive: values.isActive,
      };

      const url = getUrl("/api/accounting/other-details");

      const response = await apiFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || "خطا در ذخیره اطلاعات");
      }

      showToast("تغییرات با موفقیت ذخیره شد", "success");
      eventBus.emit(EVENTS.DATA_CHANGED, { entity: 'OtherDetails' });
      handleResponse(result, 'otherDetailsId');
    } catch (error: any) {
      showToast(error.message || "خطا در ذخیره اطلاعات", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (activeId) {
      apiFetch(`/api/accounting/other-details/${activeId}`)
        .then((res) => res.json())
        .then((data) => setValues(data.data || data))
        .catch((err) => showToast(err.message || "خطا در دریافت اطلاعات", "error"));
    }
  }, [activeId, showToast]);

  return (
    <SimpleFormTwoRow isReadonly={isUsed || false}
      title={activeId ? "ویرایش تفصیلی سایر" : "تفصیلی سایر جدید"}
      icon={<FileText className="w-4 h-4" />}
      headerGradient="from-indigo-600 to-indigo-500"
      fields={fields}
      values={values}
      onChange={(name, val) => setValues((prev: any) => ({ ...prev, [name]: val }))}
      onSave={handleSave}
      isSubmitting={isSubmitting}
    />
  );
}

export default OtherDetailsForm;
