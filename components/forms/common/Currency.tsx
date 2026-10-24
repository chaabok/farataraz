"use client";
import { useFormUsageCheck } from "@/hooks/useFormUsageCheck";
import { apiFetch } from '@/lib/utils';

import React, { useState, useEffect } from "react";
import { SimpleFormTwoRow, FieldConfig } from "../SimpleFormTwoRow";
import { Coins } from "lucide-react";
import { useTabs } from "@/components/TabsProvider";
import { useToast } from "@/components/ToastProvider";
import { useConfirm } from "@/components/ConfirmProvider";
import { useLanguage } from "@/components/Providers";
import { safeStringify } from "@/lib/utils";
import { useFormUpsert } from "@/hooks/useFormUpsert";

export function Currency({ 
  onSaved, 
  initialData 
}: { 
  onSaved?: () => void,
  initialData?: any
}) {
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const { addTab, removeTab, activeTabId } = useTabs();
  const { t } = useLanguage();
  
  const { activeId, method, getUrl, handleResponse } = useFormUpsert(initialData?.currencyID);
  const { isUsed } = useFormUsageCheck("Currency", activeId);


  const [values, setValues] = useState<Record<string, any>>({
    code: '',
    title: '',
    titleEn: '',
    exchangeUnit: 1,
    precisionCount: 0,
    precisionTitle: '',
    precisionTitleEn: '',
    isActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setValues({
        code: initialData.code || '',
        title: initialData.title || '',
        titleEn: initialData.titleEn || '',
        exchangeUnit: initialData.exchangeUnit || 1,
        precisionCount: initialData.precisionCount || 0,
        precisionTitle: initialData.precisionTitle || '',
        precisionTitleEn: initialData.precisionTitleEn || '',
        isActive: initialData.isActive !== undefined ? initialData.isActive : true,
      });
    } else {
      // Fetch next code
      apiFetch('/api/common/currencies/next-code')
        .then(res => res.json())
        .then(data => {
          if (data && data.data) {
            setValues(prev => ({ ...prev, code: data.data }));
          }
        })
        .catch(err => console.error('Failed to fetch next code:', err));
    }
  }, [initialData]);

  const handleChange = (name: string, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!values.code) newErrors.code = 'کد اجباری است';
    if (!values.title) newErrors.title = 'عنوان اجباری است';
    if (!values.titleEn) newErrors.titleEn = 'عنوان لاتین اجباری است';
    if (values.exchangeUnit === undefined || values.exchangeUnit === '') newErrors.exchangeUnit = 'واحد مبادله اجباری است';
    if (values.precisionCount === undefined || values.precisionCount === '') newErrors.precisionCount = 'تعداد اعشار اجباری است';
    if (!values.precisionTitleEn) newErrors.precisionTitleEn = 'عنوان اعشار لاتین اجباری است';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveToApi = async (isNew: boolean = false, isClose: boolean = false) => {
    if (!validate()) {
      showToast('لطفاً خطاهای فرم را برطرف کنید', 'error');
      throw new Error("VALIDATION_FAILED");
    }

    setIsSubmitting(true);
    try {
      const url = getUrl('/api/common/currencies');
      
      const payload = {
        ...values,
        code: parseInt(values.code),
        exchangeUnit: parseInt(values.exchangeUnit),
        precisionCount: parseInt(values.precisionCount)
      };

      const res = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: safeStringify(payload)
      });

      const result = await res.json();
      
      if (res.ok) {
        handleResponse(result, 'currencyID');
        showToast(result.message || 'اطلاعات با موفقیت ذخیره گردید.', 'success');
        if (onSaved) onSaved();
      } else {
        showToast(result.message || 'خطا در ذخیره اطلاعات', 'error');
      }
    } catch (error) {
      console.error(error);
      showToast('خطا در ارتباط با سرور', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSave = () => saveToApi(false, false);
  const handleSaveNew = () => saveToApi(true, false);
  const handleSaveClose = () => saveToApi(false, true);
  
  const handleNew = () => {
    setValues({
      code: '',
      title: '',
      titleEn: '',
      exchangeUnit: 1,
      precisionCount: 0,
      precisionTitle: '',
      precisionTitleEn: '',
      isActive: true,
    });
    setErrors({});
    
     // Fetch next code
     apiFetch('/api/common/currencies/next-code')
     .then(res => res.json())
     .then(data => {
       if (data && data.data) {
         setValues(prev => ({ ...prev, code: data.data }));
       }
     });
  };

  const fields: FieldConfig[] = [
    { name: "code", label: (t as any)('currency.code') || "کد", type: "number", required: true },
    { name: "title", label: (t as any)('currency.title') || "عنوان", type: "text", required: true },
    { name: "titleEn", label: (t as any)('currency.titleEn') || "عنوان لاتین", type: "text", required: true },
    { name: "exchangeUnit", label: (t as any)('currency.exchangeUnit') || "واحد مبادله", type: "number", required: true },
    { name: "precisionCount", label: (t as any)('currency.precisionCount') || "تعداد اعشار", type: "number", required: true },
    { name: "precisionTitle", label: (t as any)('currency.precisionTitle') || "عنوان اعشار", type: "text", required: false },
    { name: "precisionTitleEn", label: (t as any)('currency.precisionTitleEn') || "عنوان اعشار لاتین", type: "text", required: true },
    { name: "isActive", label: (t as any)('currency.isActive') || "ثبت فعال", type: "checkbox", required: false },
  ];

  return (
    <SimpleFormTwoRow isReadonly={isUsed || false}
      title={initialData ? ((t as any)('currency.edit') || "ویرایش ارز") : ((t as any)('currency.new') || "ارز جدید")}
      icon={<Coins className="w-4 h-4" />}
      fields={fields}
      values={values}
      onChange={handleChange}
      errors={errors}
      onSave={handleSave}
      onSaveNew={handleSaveNew}
      
      onNew={handleNew}
      listApiUrl="/api/common/currencies"
      listDisplayKey="title"
      listColumns={[
        { key: "code", header: "کد" },
        { key: "title", header: "عنوان" },
        { key: "titleEn", header: "عنوان لاتین" },
        { key: "exchangeUnit", header: "واحد مبادله" },
      ]}
      onListSelect={(item) => {
        if (initialData?.currencyID !== item.currencyID) {
          addTab(
            `ویرایش ارز - ${item.title}`,
            'admin',
            undefined,
            'Currency',
            { id: item.currencyID }
          );
        }
      }}
      onDelete={initialData?.currencyID ? async () => {
         const isConfirmed = await confirm({ message: 'آیا از حذف این مورد اطمینان دارید؟' });
         if (!isConfirmed) return;
         setIsSubmitting(true);
         try {
            const res = await apiFetch(`/api/common/currencies/${initialData.currencyID}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('خطا در حذف');
            showToast('با موفقیت حذف شد', 'success');
            if (activeTabId) removeTab(activeTabId);
         } catch (err: any) {
            showToast(err.message || 'خطا در حذف', 'error');
         } finally {
            setIsSubmitting(false);
         }
      } : undefined}
      isSubmitting={isSubmitting}
      labelWidth="90px"
    />
  );
}
