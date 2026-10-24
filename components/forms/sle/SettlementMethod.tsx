"use client";

import { useFormUsageCheck } from "@/hooks/useFormUsageCheck";
import { apiFetch } from '@/lib/utils';
import React, { useState, useEffect } from "react";
import { SimpleFormTwoRow, FieldConfig } from "../SimpleFormTwoRow";
import { CheckBoxRightLabel } from "@/components/inputs/CheckBoxRightLabel";
import { CreditCard } from "lucide-react";
import { useTabs } from "@/components/TabsProvider";
import { useToast } from "@/components/ToastProvider";
import { useConfirm } from "@/components/ConfirmProvider";
import { safeStringify } from "@/lib/utils";
import { useFormUpsert } from "@/hooks/useFormUpsert";

export function SettlementMethodComponent({
  id,
  onSaved,
  initialData
}: {
  id?: string | number,
  onSaved?: () => void,
  initialData?: any
}) {
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const { addTab, removeTab, activeTabId } = useTabs();

  const [data, setData] = useState<any>(initialData);
  const [isLoading, setIsLoading] = useState<boolean>(!!id && !initialData);

  useEffect(() => {
    if (id && !initialData) {
      apiFetch(`/api/sle/settlement-methods/${id}`)
        .then(res => res.json())
        .then(resData => {
          const item = resData?.data || resData;
          setData(item);
          setIsLoading(false);
        })
        .catch(err => {
          console.error(err);
          setIsLoading(false);
          showToast('دریافت اطلاعات با خطا مواجه شد', 'error');
        });
    } else {
      setData(initialData);
    }
  }, [id, initialData]);

  const { activeId, method, getUrl, handleResponse, setActiveId } = useFormUpsert(data?.SettlementMethodID);
  const { isUsed } = useFormUsageCheck("SettlementMethods", activeId);

  const [values, setValues] = useState<Record<string, any>>({
    Code: '',
    Title: '',
    Title2: '',
    IsActive: true,
    Description: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (data) {
      setValues({
        Code: data.Code || '',
        Title: data.Title || '',
        Title2: data.Title2 || '',
        IsActive: data.IsActive !== undefined ? data.IsActive : true,
        Description: data.Description || '',
      });
    }
  }, [data]);

  useEffect(() => {
    if (!data?.SettlementMethodID && !activeId) {
      apiFetch(`/api/sle/settlement-methods/next-number`)
        .then(res => res.json())
        .then(resData => {
          const info = resData?.data || resData;
          if (info.documentNumber) {
            setValues(prev => ({ ...prev, Code: info.documentNumber }));
          }
        })
        .catch(console.error);
    }
  }, [data?.SettlementMethodID, activeId]);

  const handleChange = (name: string, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    // Auto-fill Title2 from Title while typing, only if Title2 is untouched/empty
    if (name === 'Title') {
      setValues(prev => {
        const currentTitle2 = String(prev.Title2 ?? '').trim();
        const newTitle = String(value ?? '').trim();
        if (currentTitle2 === '' && newTitle !== '') {
          return { ...prev, Title2: newTitle };
        }
        return prev;
      });
    }
  };

  const fetchNextNumber = async (): Promise<number> => {
    try {
      const res = await apiFetch(`/api/sle/settlement-methods/next-number`);
      const resData = await res.json();
      const info = resData?.data || resData;
      if (info?.documentNumber) return Number(info.documentNumber);
    } catch (err) {
      console.error(err);
    }
    return Date.now() % 100000;
  };

  const validate = (): boolean => {
    const nextErrors: Record<string, string> = {};

    const codeVal = values.Code;
    if (codeVal === '' || codeVal === null || codeVal === undefined || Number.isNaN(Number(codeVal))) {
      nextErrors.Code = 'فیلد کد اجباری است.';
    }

    const titleVal = String(values.Title ?? '').trim();
    if (!titleVal) {
      nextErrors.Title = 'فیلد عنوان اجباری است.';
    }

    // عنوان(2) is required, but if the user left it empty it is auto-filled with عنوان
    // (both live auto-fill on typing and this fallback before submit).

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      const firstError = Object.values(nextErrors)[0];
      showToast(firstError, 'error');
      return false;
    }
    return true;
  };

  const handleNew = () => {
    setData(undefined);
    setActiveId(null);
    setValues({
      Code: '',
      Title: '',
      Title2: '',
      IsActive: true,
      Description: '',
    });
    setErrors({});

    apiFetch(`/api/sle/settlement-methods/next-number`)
      .then(res => res.json())
      .then(resData => {
        const info = resData?.data || resData;
        if (info.documentNumber) {
          setValues(prev => ({ ...prev, Code: info.documentNumber }));
        }
      })
      .catch(console.error);
  };

  const saveToApi = async (isNew: boolean = false, isClose: boolean = false) => {
    if (!validate()) return;

    let codeVal = Number(values.Code);
    if (!codeVal || codeVal <= 0) {
      codeVal = await fetchNextNumber();
    }

    const titleVal = String(values.Title ?? '').trim();
    // عنوان(2): if empty → fill with عنوان (auto-fallback per requirement)
    const title2Val = String(values.Title2 ?? '').trim() || titleVal;

    setIsSubmitting(true);
    try {
      const url = getUrl('/api/sle/settlement-methods');

      const payload = {
        Code: codeVal,
        Title: titleVal,
        title: titleVal,
        Title2: title2Val,
        title2: title2Val,
        IsActive: values.IsActive !== undefined ? values.IsActive : true,
        Description: values.Description || '',
      };

      const res = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: safeStringify(payload)
      });

      const result = await res.json();

      if (res.ok) {
        const savedItem = result?.data || result;
        if (savedItem && savedItem.SettlementMethodID) {
          setData(savedItem);
          handleResponse(savedItem, 'SettlementMethodID');
        }
        showToast(result.message || 'اطلاعات با موفقیت ذخیره گردید.', 'success');
        if (onSaved) onSaved();

        if (isClose) {
          if (activeTabId) removeTab(activeTabId);
        } else if (isNew) {
          handleNew();
        }
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

  const fields: FieldConfig[] = [
    { name: "Code", label: "کد", type: "number", required: true, disabled: isUsed, colSpan: 1 },
    { name: "Title", label: "عنوان", type: "text", required: true, colSpan: 1 },
    { name: "Title2", label: "عنوان(2)", type: "text", required: true, colSpan: 1 },
    { name: "Description", label: "توضیحات", type: "textarea", required: false, colSpan: 1, rows: 1, className: "h-[25px] py-0" },
    {
      name: "IsActive",
      label: " ",
      type: "custom",
      containerClassName: "mb-6",
      customComponent: (
        <CheckBoxRightLabel
          label="فعال"
          checked={values.IsActive !== undefined ? values.IsActive : true}
          onChange={(checked) => handleChange('IsActive', checked)}
          disabled={isUsed}
        />
      ),
      required: false,
      colSpan: 1
    },
  ];

  return (
    <SimpleFormTwoRow
      isReadonly={isUsed || false}
      title={data ? "ویرایش روش تسویه" : "روش تسویه جدید"}
      icon={<CreditCard className="w-4 h-4" />}
      fields={fields}
      values={values}
      onChange={handleChange}
      errors={errors}
      onSave={handleSave}
      onSaveNew={handleSaveNew}
      onSaveClose={handleSaveClose}
      onNew={handleNew}
      listApiUrl="/api/sle/settlement-methods"
      listDisplayKey="Title"
      listColumns={[
        { key: "Code", header: "کد" },
        { key: "Title", header: "عنوان" },
        { key: "Title2", header: "عنوان(2)" },
        {
          key: "IsActive",
          header: "وضعیت",
          renderItem: (item: any) => item.IsActive !== false ? "فعال" : "غیرفعال"
        },
      ]}
      onListSelect={(item) => {
        if (data?.SettlementMethodID !== item.SettlementMethodID) {
          addTab(
            `ویرایش روش تسویه - ${item.Title}`,
            'general',
            undefined,
            'SettlementMethodForm',
            { id: item.SettlementMethodID }
          );
        }
      }}
      onDelete={data?.SettlementMethodID ? async () => {
        const isConfirmed = await confirm({ message: 'آیا از حذف این روش تسویه اطمینان دارید؟' });
        if (!isConfirmed) return;
        setIsSubmitting(true);
        try {
          const res = await apiFetch(`/api/sle/settlement-methods/${data.SettlementMethodID}`, { method: 'DELETE' });
          if (!res.ok) throw new Error('خطا در حذف');
          showToast('با موفقیت حذف شد', 'success');
          if (activeTabId) removeTab(activeTabId);
        } catch (err: any) {
          showToast(err.message || 'خطا در حذف', 'error');
        } finally {
          setIsSubmitting(false);
        }
      } : undefined}
      isSubmitting={isSubmitting || isLoading}
      labelWidth="100px"
    />
  );
}

export function SettlementMethod(props: any) {
  return <SettlementMethodComponent {...props} />;
}

export function SettlementMethodForm(props: any) {
  return <SettlementMethodComponent {...props} />;
}
