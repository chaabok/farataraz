"use client";

import { useFormUsageCheck } from "@/hooks/useFormUsageCheck";
import { apiFetch } from '@/lib/utils';
import React, { useState, useEffect } from "react";
import { SimpleFormTwoRow, FieldConfig } from "../SimpleFormTwoRow";
import { CheckBoxRightLabel } from "@/components/inputs/CheckBoxRightLabel";
import { Wallet as WalletIcon } from "lucide-react";
import { useTabs } from "@/components/TabsProvider";
import { useToast } from "@/components/ToastProvider";
import { useConfirm } from "@/components/ConfirmProvider";
import { useLanguage } from "@/components/Providers";
import { safeStringify } from "@/lib/utils";
import { useFormUpsert } from "@/hooks/useFormUpsert";

export function WalletComponent({ 
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
  const { t } = useLanguage();
  
  const [data, setData] = useState<any>(initialData);
  const [isLoading, setIsLoading] = useState<boolean>(!!id && !initialData);

  useEffect(() => {
    if (id && !initialData) {
      apiFetch(`/api/sle/wallets/${id}`)
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

  const { activeId, method, getUrl, handleResponse, setActiveId } = useFormUpsert(data?.WalletID);
  const { isUsed } = useFormUsageCheck("Wallets", activeId);

  const [values, setValues] = useState<Record<string, any>>({
    Code: '',
    Title: '',
    Title2: '',
    Nature: 1, // 1: افزاینده, 2: کاهنده
    IsActive: true,
    Description: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDocumentNoAuto, setIsDocumentNoAuto] = useState(false);

  useEffect(() => {
    if (data) {
      setValues({
        Code: data.Code || '',
        Title: data.Title || '',
        Title2: data.Title2 || '',
        Nature: data.Nature !== undefined ? data.Nature : 1,
        IsActive: data.IsActive !== undefined ? data.IsActive : true,
        Description: data.Description || '',
      });
    }
  }, [data]);

  useEffect(() => {
    if (!data?.WalletID && !activeId) {
      apiFetch(`/api/sle/wallets/next-number`)
        .then(res => res.json())
        .then(resData => {
          const info = resData?.data || resData;
          setIsDocumentNoAuto(info.isDocumentNumberAuto || false);
          if (info.documentNumber) {
            setValues(prev => ({ ...prev, Code: info.documentNumber }));
          }
        })
        .catch(console.error);
    } else {
      setIsDocumentNoAuto(false);
    }
  }, [data?.WalletID, activeId]);

  const handleChange = (name: string, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!values.Code && values.Code !== 0) newErrors.Code = 'کد اجباری است';
    if (!values.Title) newErrors.Title = 'عنوان اجباری است';
    if (!values.Nature) newErrors.Nature = 'ماهیت اجباری است';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNew = () => {
    setData(undefined);
    setActiveId(null);
    setValues({
      Code: '',
      Title: '',
      Title2: '',
      Nature: 1,
      IsActive: true,
      Description: '',
    });
    setErrors({});

    apiFetch(`/api/sle/wallets/next-number`)
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
    if (!validate()) {
      showToast('لطفاً خطاهای فرم را برطرف کنید', 'error');
      throw new Error("VALIDATION_FAILED");
    }

    setIsSubmitting(true);
    try {
      const url = getUrl('/api/sle/wallets');
      
      const payload = {
        ...values,
        Code: values.Code !== '' ? Number(values.Code) : undefined,
        Title2: values.Title2 && values.Title2.trim() !== '' ? values.Title2 : values.Title,
      };

      const res = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: safeStringify(payload)
      });

      const result = await res.json();
      
      if (res.ok) {
        const savedItem = result?.data || result;
        if (savedItem && savedItem.WalletID) {
          setData(savedItem);
          handleResponse(savedItem, 'WalletID');
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
    { name: "Title2", label: "عنوان (2)", type: "text", required: true, colSpan: 1 },
    { name: "Description", label: "توضیحات", type: "textarea", required: false, colSpan: 1, rows: 1, className: "h-[25px] py-0" },
    {
      name: "NatureGroup",
      label: "ماهیت",
      type: "group",
      required: true,
      groupLabel: "ماهیت",
      colSpan: 1,
      className: "px-3 py-2 h-16 flex flex-col justify-center box-border",
      containerClassName: "mb-6",
      groupFields: [
        {
          name: "NatureInc",
          label: " ",
          type: "custom",
          customComponent: (
            <CheckBoxRightLabel 
              label="افزاینده" 
              checked={values.Nature === 1} 
              onChange={(checked) => {
                if (checked) handleChange('Nature', 1);
              }} 
              disabled={isUsed}
            />
          )
        },
        {
          name: "NatureDec",
          label: " ",
          type: "custom",
          customComponent: (
            <CheckBoxRightLabel 
              label="کاهنده" 
              checked={values.Nature === 2} 
              onChange={(checked) => {
                if (checked) handleChange('Nature', 2);
              }} 
              disabled={isUsed}
            />
          )
        }
      ]
    },
    { 
      name: "IsActive", 
      label: " ", 
      type: "custom", 
      containerClassName: "mb-6",
      customComponent: (
        <CheckBoxRightLabel 
          label="فعال" 
          checked={values.IsActive} 
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
      title={data ? "ویرایش کیف پول" : "کیف پول جدید"}
      icon={<WalletIcon className="w-4 h-4" />}
      fields={fields}
      values={values}
      onChange={handleChange}
      errors={errors}
      onSave={handleSave}
      onSaveNew={handleSaveNew}
      onSaveClose={handleSaveClose}
      onNew={handleNew}
      listApiUrl="/api/sle/wallets"
      listDisplayKey="Title"
      listColumns={[
        { key: "Code", header: "کد" },
        { key: "Title", header: "عنوان" },
        { key: "Title2", header: "عنوان (2)" },
        { 
          key: "Nature", 
          header: "ماهیت",
          renderItem: (item: any) => item.Nature === 2 ? "کاهنده" : "افزاینده"
        },
        { 
          key: "IsActive", 
          header: "وضعیت",
          renderItem: (item: any) => item.IsActive !== false ? "فعال" : "غیرفعال"
        },
      ]}
      onListSelect={(item) => {
        if (data?.WalletID !== item.WalletID) {
          addTab(
            `ویرایش کیف پول - ${item.Title}`,
            'financial_group',
            undefined,
            'WalletForm',
            { id: item.WalletID }
          );
        }
      }}
      onDelete={data?.WalletID ? async () => {
         const isConfirmed = await confirm({ message: 'آیا از حذف این کیف پول اطمینان دارید؟' });
         if (!isConfirmed) return;
         setIsSubmitting(true);
         try {
            const res = await apiFetch(`/api/sle/wallets/${data.WalletID}`, { method: 'DELETE' });
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

export function Wallet(props: any) {
  return <WalletComponent {...props} />;
}

export function WalletForm(props: any) {
  return <WalletComponent {...props} />;
}
