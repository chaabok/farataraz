"use client";

import { useFormUsageCheck } from "@/hooks/useFormUsageCheck";
import React, { useState, useEffect } from "react";
import { SimpleFormTwoRow, FieldConfig } from "../SimpleFormTwoRow";
import { FileText } from "lucide-react";
import { useTabs } from "@/components/TabsProvider";
import { useFormUpsert } from "@/hooks/useFormUpsert";
import { useConfirm } from "@/components/ConfirmProvider";
import { useToast } from "@/components/ToastProvider";
import { useLanguage } from "@/components/Providers";
import { safeStringify, apiFetch } from "@/lib/utils";
import { eventBus, EVENTS } from "@/lib/events";

export function DetailedTypeForm({ 
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
  
  const [values, setValues] = useState<Record<string, any>>({
    code: '',
    title: '',
    title_en: '',
    description: '',
    isActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [internalInitialData, setInternalInitialData] = useState<any>(initialData);

  const { activeId, method, getUrl, handleResponse, setActiveId } = useFormUpsert(internalInitialData?.detailedTypesId);
  const { isUsed } = useFormUsageCheck("DetailedType", activeId);


  useEffect(() => {
    if (initialData) {
      setInternalInitialData(initialData);
      setValues({
        code: initialData.code || '',
        title: initialData.title || '',
        title_en: initialData.title_en || '',
        description: initialData.description || '',
        isActive: initialData.isActive !== undefined ? initialData.isActive : true,
      });
    }
  }, [initialData]);

  const handleChange = (name: string, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = async (name: string, value: string) => {
    if (!value) return;
    const excludeId = activeId;
    
    try {
      const url = `/api/accounting/detailed-types/check-duplicate?field=${name}&value=${encodeURIComponent(value)}${excludeId ? `&excludeId=${excludeId}` : ''}`;
      const res = await apiFetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.isDuplicate) {
          setErrors(prev => ({
            ...prev,
            [name]: name === 'code' ? 'کد حساب تکراری است' : 'حسابی با این عنوان از قبل وجود دارد'
          }));
        }
      }
    } catch(e) {}
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!values.code) newErrors.code = (t as any)('common.required_field') || 'کد اجباری است';
    if (!values.title) newErrors.title = (t as any)('common.required_field') || 'عنوان اجباری است';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveToApi = async (isNew: boolean = false, isClose: boolean = false) => {
    if (!validate()) {
      showToast('لطفاً خطاهای فرم را برطرف کنید', 'error');
      throw new Error("VALIDATION_FAILED");
    }

    setIsSubmitting(true);
    const delayPromise = new Promise(resolve => setTimeout(resolve, 800));
    try {
      // Note: In real app, the API endpoint is /backend/src/softwares/accounting/presentation/controllers/detailed-type.controller.ts
      // Next.js proxy/rewriting should handle /api/accounting/detailed-types
      const url = getUrl('/api/accounting/detailed-types');
      
      const payload = {
        ...values,
        businessStructureRef: 2 // As requested
      };

      const res = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: safeStringify(payload)
      });

      const result = await res.json();
      
      await delayPromise;

      if (res.ok) {
        handleResponse(result, 'detailedTypesId');
        showToast(result.message || 'اطلاعات با موفقیت ذخیره گردید.', 'success');
        eventBus.emit(EVENTS.DATA_CHANGED, { entity: 'DetailedType' });
        if (onSaved) onSaved();
        if (isNew) {
          handleNew();
        } else if (isClose && activeTabId) {
          removeTab(activeTabId);
        }
      } else {
        showToast(result.message || 'خطا در ذخیره اطلاعات', 'error');
      }
    } catch (error) {
      await delayPromise;
      console.error(error);
      showToast('خطا در ارتباط با سرور', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSave = async () => {
    await saveToApi(false, false);
  };
  const handleSaveNew = async () => {
    await saveToApi(true, false);
  };
  
  
  const handleNew = () => {
    setValues({
      code: '',
      title: '',
      title_en: '',
      description: '',
      isActive: true,
    });
    setErrors({});
    setActiveId(null);
    setInternalInitialData(null);
  };

  const fields: FieldConfig[] = [
    { 
      name: "code", 
      label: (t as any)('code') || "کد", 
      type: "number", 
      required: true, 
      colSpan: 1,
      maxLength: 20,
      onBlur: (name, val) => handleBlur(name, val)
    },
    { 
      name: "title", 
      label: (t as any)('title') || "عنوان", 
      type: "text", 
      required: true, 
      colSpan: 1,
      maxLength: 50,
      onBlur: (name, val) => handleBlur(name, val)
    },
    { 
      name: "title_en", 
      label: (t as any)('title_en') || "عنوان لاتین", 
      type: "text", 
      required: false, 
      colSpan: 1,
      maxLength: 50,
      onBlur: (name, val) => handleBlur(name, val)
    },
    { 
      name: "isActive", 
      label: (t as any)('active') || "فعال", 
      type: "checkbox", 
      required: false, 
      colSpan: 1
    },
    { 
      name: "description", 
      label: (t as any)('description') || "توضیحات", 
      type: "textarea", 
      required: false, 
      colSpan: 2 
    },
  ];

  return (
    <SimpleFormTwoRow isReadonly={isUsed || false}
      title={activeId ? ((t as any)('detailed_type_edit') || "ویرایش نوع تفصیلی") : ((t as any)('detailed_type_new') || "نوع تفصیلی جدید")}
      icon={<FileText className="w-4 h-4" />}
      fields={fields}
      values={values}
      onChange={handleChange}
      errors={errors}
      onSave={handleSave}
      onSaveNew={handleSaveNew}
      
      onNew={handleNew}
      listApiUrl="/api/accounting/detailed-types"
      listDisplayKey="title"
      listColumns={[
        { key: "code", header: (t as any)('code') || "کد" },
        { key: "title", header: (t as any)('title') || "عنوان" },
        { key: "title_en", header: (t as any)('title_en') || "عنوان لاتین" },
      ]}
      onListSelect={(item) => {
        if (activeId !== item.detailedTypesId) {
          addTab(
            `${(t as any)('detailed_type_edit') || 'ویرایش نوع تفصیلی'} - ${item.title}`,
            'financial',
            undefined,
            'DetailedType',
            { initialData: item }
          );
        }
      }}
      onDelete={activeId && (Number(activeId) < 1 || Number(activeId) > 18) ? async () => {
         const isConfirmed = await confirm({ message: (t as any)('confirm_delete_msg') || 'آیا از حذف این مورد اطمینان دارید؟' });
         if (!isConfirmed) return;
         setIsSubmitting(true);
         try {
            const res = await apiFetch(`/api/accounting/detailed-types/${activeId}`, { method: 'DELETE' });
            if (!res.ok) throw new Error((t as any)('delete_error') || 'خطا در حذف');
            showToast((t as any)('delete_success') || 'با موفقیت حذف شد', 'success');
            eventBus.emit(EVENTS.DATA_CHANGED, { entity: 'DetailedType' });
            if (activeTabId) removeTab(activeTabId);
         } catch (err: any) {
            showToast(err.message || (t as any)('delete_error') || 'خطا در حذف', 'error');
         } finally {
            setIsSubmitting(false);
         }
      } : undefined}
      isSubmitting={isSubmitting}
      labelWidth="80px"
    />
  );
}
