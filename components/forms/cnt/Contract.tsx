"use client";

import { useFormUsageCheck } from "@/hooks/useFormUsageCheck";
import React, { useState } from 'react';
import { SimpleFormTwoRow, FieldConfig } from '@/components/forms/SimpleFormTwoRow';
import { MultiColumnDropdown } from '@/components/inputs/MultiColumnDropdown';
import { Checkbox } from '@/components/inputs';
import { apiFetch } from '@/lib/utils';
import { useToast } from '@/components/ToastProvider';
import { useFormUpsert } from '@/hooks/useFormUpsert';

export default function Contract({ id, initialData }: { id?: number, initialData?: any } = {}) {
  const { showToast } = useToast();
  const { activeId, method, getUrl, handleResponse } = useFormUpsert(id || initialData?.contractId || initialData?.contractID);
  const { isUsed } = useFormUsageCheck("Contract", activeId);


  const [values, setValues] = useState<Record<string, any>>({
    isActive: true,
    ...initialData
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (name: string, val: any) => {
    setValues(prev => {
      const next = { ...prev, [name]: val };
      
      if (name === 'documentNumber' || name === 'subject1') {
        const docNum = name === 'documentNumber' ? val : prev.documentNumber;
        const subj = name === 'subject1' ? val : prev.subject1;
        
        if (docNum && subj) {
          next.detailedAccountTitle = `شماره قرارداد ${docNum} با موضوع ${subj}`;
        }
      }
      return next;
    });

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = async (name: string, value: any) => {
    if (!value) return;
    
    // Validate uniqueness for specific fields
    if (['documentNumber', 'subject1', 'detailedAccountTitle', 'detailedCode'].includes(name)) {
      try {
        // In a real scenario, this would call the actual backend endpoint
        const res = await apiFetch(`/api/cnt/contracts/check-duplicate?field=${name}&value=${encodeURIComponent(value)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.isDuplicate) {
            setErrors(prev => ({ ...prev, [name]: 'این مقدار تکراری است و قبلا ثبت شده است.' }));
          }
        }
      } catch (err) {
        // Fallback for when backend is not fully ready
        console.warn('Duplicate check failed or not implemented yet:', err);
      }
    }
  };

  const fields: FieldConfig[] = [
    // Row 1
    { name: 'documentNumber', label: 'شماره', type: 'text', required: true, onBlur: handleBlur },
    { name: 'date', label: 'تاریخ', type: 'date', required: true },
    // Row 2
    { name: 'projectId', label: 'پروژه', type: 'custom', required: false,
      customComponent: (
        <MultiColumnDropdown
          listApiUrl="/api/cnt/projects"
          columns={[
            { key: 'detailedCode', label: 'کد تفصیلی' },
            { key: 'title', label: 'عنوان' },
            { key: 'title2', label: 'عنوان ۲' }
          ]}
          displayKey="title"
          value={values.projectId}
          onChange={(val) => handleChange('projectId', val)}
        />
      )
    },
    { name: 'workLocation', label: 'محل انجام کار', type: 'text' },
    // Row 3
    { name: 'partyId', label: 'طرف قرارداد', type: 'custom', required: true,
      customComponent: (
        <MultiColumnDropdown
          listApiUrl="/api/common/parties"
          columns={[
            { key: 'detailedCode', label: 'کد تفصیلی' },
            { key: 'title', label: 'عنوان' },
            { key: 'title2', label: 'عنوان ۲' },
            { key: 'nature', label: 'ماهیت' }
          ]}
          displayKey="title"
          value={values.partyId}
          onChange={(val) => handleChange('partyId', val)}
        />
      )
    },
    { name: 'detailedCode', label: 'کد تفصیلی', type: 'number', required: true, onBlur: handleBlur },
    // Row 4
    { name: 'subject1', label: 'موضوع قرارداد', type: 'text', required: true, onBlur: handleBlur },
    { name: 'subject2', label: 'موضوع قرارداد (۲)', type: 'text' },
    // Row 5
    { name: 'detailedAccountTitle', label: 'عنوان تفصیلی', type: 'text', required: true, onBlur: handleBlur },
    { name: 'detailedAccountTitle2', label: 'عنوان تفصیلی (۲)', type: 'text' },
    // Row 6
    { name: 'startDate', label: 'تاریخ شروع', type: 'date' },
    { name: 'endDate', label: 'تاریخ خاتمه', type: 'date' },
    // Row 7
    { name: 'durationDays', label: 'مدت قرارداد (روز)', type: 'number' },
    { name: 'amount', label: 'مبلغ قرارداد', type: 'amount', required: true },
    // Row 8
    { name: 'description1', label: 'شرح', type: 'textarea' },
    { name: 'description2', label: 'شرح (۲)', type: 'textarea' },
    // Row 9
    { name: 'pad13', label: '', type: 'custom', customComponent: <div /> },
    { name: 'isActive', label: 'وضعیت', type: 'custom', customComponent: (
        <div className="flex items-center gap-2 h-[29px]">
           <Checkbox 
             checked={!!values.isActive} 
             onChange={(val) => handleChange('isActive', val)} 
             className="!mt-0"
           />
           <span className="text-sm font-medium text-slate-700 dark:text-slate-300">فعال</span>
        </div>
      ) 
    }
  ];

  const handleSave = async (isNew = false) => {
    // Validate custom errors
    const hasErrors = Object.values(errors).some(e => e !== '');
    if (hasErrors) {
       showToast('لطفا خطاهای فرم را برطرف کنید', 'error');
       return;
    }

    try {
      // Map detailedCode to detailedAccountCode 
      const payload = {
        ...values,
        detailedAccountCode: values.detailedCode,
      };

      const url = getUrl('/api/cnt/contracts');

      const res = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.message || 'خطا در ذخیره قرارداد');
      }

      const result = await res.json().catch(() => ({}));
      handleResponse(result, 'contractId');

      showToast('قرارداد با موفقیت ذخیره شد', 'success');
      
      if (isNew) {
        setValues({ isActive: true });
        setErrors({});
      }
    } catch (err: any) {
      showToast(err.message || 'خطا در ذخیره', 'error');
    }
  };

  return (
    <SimpleFormTwoRow isReadonly={isUsed || false}
      title={activeId ? "ویرایش قرارداد" : "تعریف قرارداد جدید"}
      fields={fields}
      values={values}
      onChange={handleChange}
      errors={errors}
      onSave={() => handleSave(false)}
      onSaveNew={() => handleSave(true)}
    />
  );
}
