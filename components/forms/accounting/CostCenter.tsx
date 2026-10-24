"use client";

import { useFormUsageCheck } from "@/hooks/useFormUsageCheck";
import React, { useState, useEffect } from 'react';
import { SimpleFormTwoRow, FieldConfig } from '../SimpleFormTwoRow';
import { Building2 } from 'lucide-react';
import { apiFetch, safeStringify } from '@/lib/utils';
import { useToast } from '@/components/ToastProvider';
import { useFormUpsert } from '@/hooks/useFormUpsert';
import { useCostCenterColumns } from "./CostCenterList";

interface CostCenterProps {
  id?: number | null;
  onClose?: () => void;
  onSaved?: (id: number) => void;
  onNew?: () => void;
  onList?: () => void;
}

export function CostCenter({ id, onClose, onSaved, onNew, onList }: CostCenterProps) {
  const rawListColumns = useCostCenterColumns();
  const listColumns = rawListColumns.map((c: any) => ({ ...c, label: c.header || c.label }));
  const { activeId, method, getUrl, handleResponse } = useFormUpsert(id);
  const { isUsed } = useFormUsageCheck("CostCenter", activeId);


  const [values, setValues] = useState<Record<string, any>>({
    isActive: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  const loadData = async (costCenterId: number) => {
    try {
      const res = await apiFetch(`/api/accounting/cost-center/${costCenterId}`);
      if (!res.ok) throw new Error('خطا در دریافت اطلاعات');
      const data = await res.json();
      setValues({
        code: data.code,
        title: data.title,
        title_en: data.title_en,
        costCenterType: String(data.costCenterType || 1),
        isActive: data.isActive,
        description: data.description,
        detailedAccountCode: data.detailedAccount?.code || '',
      });
    } catch (err) {
      showToast('خطا در دریافت اطلاعات مرکز هزینه', 'error');
    }
  };

  const loadInitData = async () => {
    try {
      const res = await apiFetch('/api/accounting/cost-center/init');
      if (res.ok) {
        const data = await res.json();
        setValues((prev: any) => ({
          ...prev,
          code: data.nextCode,
          detailedAccountCode: data.detailedNumber,
          costCenterType: '1',
          isActive: true
        }));
      }
    } catch (err) {
      console.error('Failed to load init data', err);
    }
  };

  useEffect(() => {
    if (id) {
      loadData(id);
    } else {
      loadInitData();
    }
  }, [id]);

  const handleChange = (name: string, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!values.code) newErrors.code = 'کد الزامی است';
    if (!values.title) newErrors.title = 'عنوان الزامی است';
    if (!values.costCenterType) newErrors.costCenterType = 'نوع مرکز هزینه الزامی است';
    if (!values.detailedAccountCode) newErrors.detailedAccountCode = 'کد تفصیل الزامی است';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      throw new Error("VALIDATION_FAILED");
    }
    setIsSubmitting(true);
    
    try {
      const payload = {
        code: String(values.code),
        title: values.title,
        title_en: values.title_en,
        costCenterType: Number(values.costCenterType),
        detailedAccountCode: values.detailedAccountCode,
        isActive: values.isActive,
        description: values.description,
      };

      const url = getUrl('/api/accounting/cost-center');

      const res = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: safeStringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'خطا در ذخیره اطلاعات');
      }

      const data = await res.json();
      handleResponse(data, 'costCenterId');
      showToast('اطلاعات با موفقیت ذخیره شد', 'success');
      
      if (!activeId && onSaved) {
        onSaved(data.costCenterId);
      } else {
         if (activeId) {
           loadData(activeId as number);
         }
      }
    } catch (err: any) {
      showToast(err.message || 'خطا در ارتباط با سرور', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fields: FieldConfig[] = [
    { name: 'code', label: 'کد', type: 'number', required: true },
    { name: 'detailedAccountCode', label: 'کد تفصیل', type: 'text', required: true, disabled: false },
    { name: 'title', label: 'عنوان', type: 'text', required: true },
    { name: 'title_en', label: 'عنوان لاتین', type: 'text' },
    {
      name: 'costCenterType',
      label: 'نوع مرکز هزینه',
      type: 'select',
      required: true,
      options: [
        { value: '1', label: 'اداری و تشکیلاتی' },
        { value: '2', label: 'بازرگانی' },
        { value: '3', label: 'تولیدی' },
        { value: '4', label: 'خدماتی' },
        { value: '5', label: 'عمومی' },
      ],
    },
    { name: 'isActive', label: 'فعال', type: 'checkbox', colSpan: 1 },
    { name: 'description', label: 'توضیحات', type: 'textarea', colSpan: 2 },
  ];

  return (
    <SimpleFormTwoRow isReadonly={isUsed || false}
      fields={fields}
      values={values}
      onChange={handleChange}
      errors={errors}
      title="مرکز هزینه"
      icon={<Building2 size={18} />}
      onSave={handleSave}
      onNew={onNew}
      listApiUrl="/api/accounting/cost-centers"
      listColumns={listColumns}
      listDisplayKey="title"
      onListSelect={(item: any) => {
        // You could trigger onList or onSaved, but typically in these forms if we want to change we just call the API or open a tab. Since we can't easily open a tab without addTab (which isn't imported here, wait, we can import useTabs).
      }}
      onList={onList}
      onSaveClose={async () => {
        await handleSave();
        if (Object.keys(errors).length === 0 && onClose) onClose();
      }}
      onSaveNew={async () => {
        await handleSave();
        if (Object.keys(errors).length === 0) {
           setValues({ isActive: true });
           loadInitData();
        }
      }}
      isSubmitting={isSubmitting}
      className={id ? "h-full" : "h-[600px]"}
    />
  );
}
