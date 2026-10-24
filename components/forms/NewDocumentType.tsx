"use client";
import { useFormUsageCheck } from "@/hooks/useFormUsageCheck";
import { apiFetch } from '@/lib/utils';

import React, { useState } from 'react';
import { Plus, List } from 'lucide-react';
import { SimpleForm, FieldConfig } from './SimpleForm';
import { SaveButton } from '@/components/buttons/SaveButton';
import { useToast } from '@/components/ToastProvider';
import { useTabs } from '@/components/TabsProvider';
import { safeStringify } from '@/lib/utils';
import { eventBus, EVENTS } from '@/lib/events';
import { useFormUpsert } from '@/hooks/useFormUpsert';

export function NewDocumentType({ id, initialData }: { id?: number, initialData?: any } = {}) {
  const { activeId, method, getUrl, handleResponse } = useFormUpsert(id || initialData?.voucherTypeId);
  const { isUsed } = useFormUsageCheck("NewDocumentType", activeId);


  const [values, setValues] = useState<Record<string, any>>(initialData || {});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { showToast } = useToast();
  const { addTab, removeTab, activeTabId } = useTabs();

  React.useEffect(() => {
    if (initialData) {
      setValues(initialData);
    } else if (activeId) {
      const numericId = parseInt(activeId.toString());
      if (isNaN(numericId)) {
        console.error("Invalid ID provided:", activeId);
        return;
      }
      apiFetch(`/api/accounting/voucher-types/${numericId}`)
        .then(async res => {
          if (!res.ok) {
            throw new Error(`API error: ${res.status}`);
          }
          return res.json();
        })
        .then(data => setValues(data))
        .catch(err => console.error("Error fetching data", err));
    }
  }, [activeId, initialData?.voucherTypeId]);

  const handleChange = (name: string, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    // clear error if any
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleBlur = async (name: string, value: any) => {
    if (!value) return;
    
    try {
      const url = new URL('/api/accounting/voucher-types/check-duplicate', window.location.origin);
      url.searchParams.append('field', name);
      url.searchParams.append('value', String(value));
      if (activeId) {
        url.searchParams.append('excludeId', activeId.toString());
      }
      
      const res = await apiFetch(url.toString());
      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.isDuplicate) {
          setErrors(prev => ({ 
            ...prev, 
            [name]: name === 'code' ? 'کد وارد شده تکراری است' : 'این عنوان قبلا ثبت شده است' 
          }));
        }
      }
    } catch (err) {
      console.error('Error checking duplicate', err);
    }
  };

  const fields: FieldConfig[] = [
    { name: 'code', label: 'کد', type: 'number', required: true, className: "w-full md:w-1/2", onBlur: handleBlur },
    { name: 'title', label: 'عنوان', type: 'text', required: true, className: "w-full md:w-1/2", onBlur: handleBlur },
    { name: 'title_en', label: 'عنوان لاتین', type: 'text', className: "w-full md:w-1/2", onBlur: handleBlur },
    { name: 'isActive', label: 'فعال', type: 'checkbox', required: true },
  ];

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async (action: 'save' | 'saveNew' | 'saveClose') => {
    // validation
    const newErrors = { ...errors };
    let hasError = false;
    if (!values.code) { newErrors.code = 'وارد کردن کد الزامی است'; hasError = true; }
    if (!values.title) { newErrors.title = 'وارد کردن عنوان الزامی است'; hasError = true; }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      if (hasError || (newErrors.code && newErrors.code !== '') || (newErrors.title && newErrors.title !== '') || (newErrors.title_en && newErrors.title_en !== '')) {
         return;
      }
    }
    
    setIsSubmitting(true);
    try {
      const url = getUrl('/api/accounting/voucher-types');
      const response = await apiFetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: safeStringify({
          code: Number(values.code),
          title: values.title,
          title_en: values.title_en,
          isActive: values.isActive ?? false,
        }),
      });

      if (!response.ok) {
        let errorMessage = 'خطا در ذخیره سازی اطلاعات';
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errData = await response.json();
          errorMessage = errData.message || errorMessage;
        } else {
          const text = await response.text();
          console.error('Non-JSON error response:', text);
        }
        throw new Error(errorMessage);
      }

      const result = await response.json().catch(() => ({}));
      handleResponse(result, 'voucherTypeId');

      showToast('اطلاعات با موفقیت ذخیره شد', 'success');
      eventBus.emit(EVENTS.DATA_CHANGED, { entity: 'VoucherType' });
      
      if (action === 'saveNew') {
        setValues({});
      } else if (action === 'saveClose') {
        if (activeTabId) {
          removeTab(activeTabId);
        }
      }
    } catch (error: any) {
      showToast(error.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNew = () => {
    addTab('نوع سند جدید', 'financial', <Plus className="h-[14px] w-[14px]" />, 'NewDocumentType');
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <SimpleForm isReadonly={isUsed || false} 
          fields={fields} 
          values={values} 
          onChange={handleChange} 
          errors={errors}
          labelWidth="60px"
          title="نوع سند جدید"
          icon={<Plus className="h-4 w-4" />}
          onSave={() => handleSave('save')}
          onSaveNew={() => handleSave('saveNew')}
          onSaveClose={() => handleSave('saveClose')}
          onNew={handleNew}
          listApiUrl="/api/accounting/voucher-types"
          listDisplayKey="title"
          listColumns={[
            { key: "code", header: "کد" },
            { key: "title", header: "عنوان" },
            { key: "title_en", header: "عنوان لاتین" },
          ]}
          onListSelect={(item) => {
            if (activeId !== item.voucherTypeId) {
              addTab(
                `ویرایش نوع سند - ${item.title}`,
                'financial',
                undefined,
                'NewDocumentType',
                { id: item.voucherTypeId }
              );
            }
          }}
          onDelete={activeId ? async () => {
            setIsSubmitting(true);
            try {
              const res = await apiFetch(`/api/accounting/voucher-types/${activeId}`, {
                method: 'DELETE'
              });
              if (!res.ok) throw new Error('خطا در حذف اطلاعات');
              showToast('با موفقیت حذف شد', 'success');
              eventBus.emit(EVENTS.DATA_CHANGED, { entity: 'VoucherType' });
              if (activeTabId) removeTab(activeTabId);
            } catch (err: any) {
              showToast(err.message || 'خطا در حذف', 'error');
            } finally {
              setIsSubmitting(false);
            }
          } : undefined}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}
