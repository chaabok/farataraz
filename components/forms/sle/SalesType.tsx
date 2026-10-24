"use client";

import React, { useState, useEffect } from 'react';
import { SimpleFormTwoRow, FieldConfig } from '../SimpleFormTwoRow';
import { CheckBoxRightLabel } from '@/components/inputs/CheckBoxRightLabel';
import { useToast } from '../../ToastProvider';
import { apiFetch } from '@/lib/utils';
import { ShoppingCart } from 'lucide-react';

export default function SalesTypeForm({ tabId, recordId }: { tabId?: string; recordId?: number | string }) {
  const { showToast } = useToast();
  const [formValues, setFormValues] = useState<Record<string, any>>({
    code: '',
    title: '',
    title2: '',
    isActive: true,
    description: '',
  });
  const [currentId, setCurrentId] = useState<number | null>(recordId ? Number(recordId) : null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load next code on new
  const loadNextCode = async () => {
    try {
      const res = await apiFetch('/api/sle/sales-types/next-code');
      const json = await res.json();
      if (json && json.success && json.data) {
        setFormValues(prev => ({ ...prev, code: json.data }));
      }
    } catch (err) {
      console.error('Failed to load next code:', err);
    }
  };

  const loadRecord = async (id: number) => {
    try {
      setLoading(true);
      const res = await apiFetch(`/api/sle/sales-types/${id}`);
      const json = await res.json();
      if (json && json.success && json.data) {
        const item = json.data;
        setCurrentId(item.SalesTypeID);
        setFormValues({
          code: item.Code,
          title: item.Title,
          title2: item.Title2,
          isActive: item.IsActive,
          description: item.Description || '',
        });
      }
    } catch (err) {
      console.error('Failed to load sales type record:', err);
      showToast('خطا در بارگذاری اطلاعات نوع فروش', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (recordId) {
      loadRecord(Number(recordId));
    } else {
      loadNextCode();
    }
  }, [recordId]);

  const handleFormChange = (name: string, value: any) => {
    setFormValues(prev => {
      const next = { ...prev, [name]: value };
      // If title changes and title2 is empty or matches previous title, auto-sync or leave? User said: "اگر کاربر این فیلد را خالی گذاشته بود موقع ذخیره شدن با مقدار وارد شده در فیلد عنوان ذخیره گردد."
      return next;
    });
  };

  const validate = () => {
    if (!formValues.code && formValues.code !== 0) {
      showToast('فیلد کد الزامی است.', 'error');
      return false;
    }
    if (!formValues.title || String(formValues.title).trim() === '') {
      showToast('فیلد عنوان الزامی است.', 'error');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const finalTitle2 = formValues.title2 && String(formValues.title2).trim() !== '' 
        ? formValues.title2 
        : formValues.title;

      const payload = {
        SalesTypeID: currentId ? Number(currentId) : undefined,
        Code: Number(formValues.code),
        Title: formValues.title,
        Title2: finalTitle2,
        IsActive: Boolean(formValues.isActive),
        Description: formValues.description || '',
      };

      const res = await apiFetch('/api/sle/sales-types/upsert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        showToast('اطلاعات نوع فروش با موفقیت ذخیره شد.', 'success');
        if (json.data && json.data.SalesTypeID) {
          setCurrentId(json.data.SalesTypeID);
          setFormValues(prev => ({ ...prev, title2: finalTitle2 }));
        }
        return true;
      } else {
        throw new Error(json.message || 'خطا در ذخیره‌سازی اطلاعات');
      }
    } catch (err: any) {
      showToast(err.message || 'خطا در ذخیره‌سازی اطلاعات', 'error');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNew = () => {
    setCurrentId(null);
    setFormValues({
      code: '',
      title: '',
      title2: '',
      isActive: true,
      description: '',
    });
    loadNextCode();
  };

  const handleDelete = async () => {
    if (!currentId) return;
    try {
      setIsSubmitting(true);
      const res = await apiFetch(`/api/sle/sales-types/${currentId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        showToast('نوع فروش با موفقیت حذف شد.', 'success');
        handleNew();
      } else {
        const json = await res.json();
        throw new Error(json.message || 'خطا در حذف رکورد');
      }
    } catch (err: any) {
      showToast(err.message || 'خطا در حذف رکورد', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fields: FieldConfig[] = [
    {
      name: 'code',
      label: 'کد',
      type: 'number',
      required: true,
      colSpan: 1,
    },
    {
      name: 'title',
      label: 'عنوان',
      type: 'text',
      required: true,
      colSpan: 1,
    },
    {
      name: 'title2',
      label: 'عنوان (2)',
      type: 'text',
      required: true, // required in UI (with asterisk), but if empty on save, defaults to title
      colSpan: 1,
    },
    {
      name: 'isActive',
      label: 'فعال',
      type: 'custom',
      colSpan: 1,
      customComponent: (
        <CheckBoxRightLabel
          label="فعال"
          checked={formValues.isActive ?? true}
          onChange={(checked) => handleFormChange('isActive', checked)}
        />
      ),
    },
    {
      name: 'description',
      label: 'توضیحات',
      type: 'textarea',
      required: false,
      colSpan: 2,
      rows: 3,
    },
  ];

  const listColumns = [
    { key: 'Code', label: 'کد', width: 100 },
    { key: 'Title', label: 'عنوان', width: 200 },
    { key: 'Title2', label: 'عنوان (2)', width: 200 },
    { key: 'IsActive', label: 'فعال', width: 80, render: (item: any) => (item.IsActive ? 'بله' : 'خیر') },
    { key: 'Description', label: 'توضیحات', width: 250 },
  ];

  return (
    <SimpleFormTwoRow
      title="نوع فروش جدید"
      icon={<ShoppingCart className="w-4 h-4 text-white" />}
      fields={fields}
      values={formValues}
      onChange={handleFormChange}
      onSave={handleSave}
      onSaveNew={async () => {
        const res = await handleSave();
        if (res) handleNew();
        return res;
      }}
      onSaveClose={async () => {
        const res = await handleSave();
        return res;
      }}
      onNew={handleNew}
      onDelete={currentId ? handleDelete : undefined}
      listApiUrl="/api/sle/sales-types"
      listColumns={listColumns}
      listDisplayKey="Title"
      onListSelect={(item) => {
        if (item && item.SalesTypeID) {
          loadRecord(item.SalesTypeID);
        }
      }}
      isSubmitting={isSubmitting || loading}
      currentRecordId={currentId}
      formName="SalesType"
    />
  );
}
