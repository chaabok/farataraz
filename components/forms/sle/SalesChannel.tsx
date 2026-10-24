"use client";

import { useFormUsageCheck } from "@/hooks/useFormUsageCheck";
import { apiFetch } from '@/lib/utils';
import React, { useState, useEffect } from "react";
import { SimpleFormTwoRow, FieldConfig } from "../SimpleFormTwoRow";
import { CheckBoxRightLabel } from "@/components/inputs/CheckBoxRightLabel";
import { ShoppingCart } from "lucide-react";
import { useTabs } from "@/components/TabsProvider";
import { useToast } from "@/components/ToastProvider";
import { useConfirm } from "@/components/ConfirmProvider";
import { useLanguage } from "@/components/Providers";
import { safeStringify } from "@/lib/utils";
import { useFormUpsert } from "@/hooks/useFormUpsert";

export function SalesChannelComponent({ 
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
      apiFetch(`/api/sle/sales-channels/${id}`)
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

  const { activeId, method, getUrl, handleResponse, setActiveId } = useFormUpsert(data?.SalesChannelID);
  const { isUsed } = useFormUsageCheck("SalesChannels", activeId);

  const [values, setValues] = useState<Record<string, any>>({
    Code: '',
    Title: '',
    Title2: '',
    Type: 1,
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
        Type: data.Type !== undefined ? data.Type : 1,
        IsActive: data.IsActive !== undefined ? data.IsActive : true,
        Description: data.Description || '',
      });
    }
  }, [data]);

  useEffect(() => {
    if (!data?.SalesChannelID && !activeId) {
      apiFetch(`/api/sle/sales-channels/next-number`)
        .then(res => res.json())
        .then(resData => {
          const info = resData?.data || resData;
          if (info.documentNumber) {
            setValues(prev => ({ ...prev, Code: info.documentNumber }));
          }
        })
        .catch(console.error);
    }
  }, [data?.SalesChannelID, activeId]);

  const handleChange = (name: string, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    setErrors({});
    return true;
  };

  const handleNew = () => {
    setData(undefined);
    setActiveId(null);
    setValues({
      Code: '',
      Title: '',
      Title2: '',
      Type: 1,
      IsActive: true,
      Description: '',
    });
    setErrors({});

    apiFetch(`/api/sle/sales-channels/next-number`)
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
    let codeVal = values.Code;
    if (!codeVal || Number(codeVal) <= 0) {
      try {
        const res = await apiFetch(`/api/sle/sales-channels/next-number`);
        const resData = await res.json();
        const info = resData?.data || resData;
        codeVal = info?.documentNumber || 1;
      } catch (err) {
        codeVal = 1;
      }
      if (!codeVal || Number(codeVal) <= 0) {
        codeVal = Date.now() % 100000;
      }
    }

    // Read the title from the controlled form state and normalize it before sending.
    // Do not silently substitute Description/default text for a missing required title.
    const titleVal = String(values.Title ?? values.title ?? values.TITLE ?? '').trim();
    if (!titleVal) {
      setErrors({ Title: 'فیلد عنوان اجباری است.' });
      showToast('فیلد عنوان اجباری است.', 'error');
      return;
    }
    const title2Val = String(values.Title2 ?? values.title2 ?? values.TITLE2 ?? '').trim() || titleVal;

    setErrors({});

    setIsSubmitting(true);
    try {
      const url = getUrl('/api/sle/sales-channels');
      
      const payload = {
        Code: Number(codeVal),
        Title: titleVal,
        // Include lowercase aliases for compatibility with any case-normalizing API middleware.
        title: titleVal,
        Title2: title2Val,
        title2: title2Val,
        Type: Number(values.Type || 1),
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
        if (savedItem && savedItem.SalesChannelID) {
          setData(savedItem);
          handleResponse(savedItem, 'SalesChannelID');
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

  const channelTypeOptions = [
    { value: "1", label: "فروش مستقیم" },
    { value: "2", label: "فروش وبسایت اختصاصی" },
    { value: "3", label: "پلتفرم های واسط آنلاین" },
    { value: "4", label: "شبکه های اجتماعی و پیام رسان ها" },
    { value: "5", label: "فروش تلفنی" },
    { value: "6", label: "شعب" },
    { value: "7", label: "نمایندگی ها" },
  ];

  const fields: FieldConfig[] = [
    { name: "Code", label: "کد", type: "number", required: false, disabled: isUsed, colSpan: 1 },
    { name: "Title", label: "عنوان", type: "text", required: true, colSpan: 1 },
    { name: "Title2", label: "عنوان (2)", type: "text", required: false, colSpan: 1 },
    { 
      name: "Type", 
      label: "نوع", 
      type: "select", 
      required: true, 
      colSpan: 1,
      options: channelTypeOptions
    },
    { name: "Description", label: "توضیحات", type: "textarea", required: false, colSpan: 1, rows: 1, className: "h-[25px] py-0" },
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
      title={data ? "ویرایش کانال فروش" : "کانال فروش جدید"}
      icon={<ShoppingCart className="w-4 h-4" />}
      fields={fields}
      values={values}
      onChange={handleChange}
      errors={errors}
      onSave={handleSave}
      onSaveNew={handleSaveNew}
      onSaveClose={handleSaveClose}
      onNew={handleNew}
      listApiUrl="/api/sle/sales-channels"
      listDisplayKey="Title"
      listColumns={[
        { key: "Code", header: "کد" },
        { key: "Title", header: "عنوان" },
        { key: "Title2", header: "عنوان (2)" },
        { 
          key: "Type", 
          header: "نوع",
          renderItem: (item: any) => {
            const found = channelTypeOptions.find(o => String(o.value) === String(item.Type));
            return found ? found.label : item.Type;
          }
        },
        { 
          key: "IsActive", 
          header: "وضعیت",
          renderItem: (item: any) => item.IsActive !== false ? "فعال" : "غیرفعال"
        },
      ]}
      onListSelect={(item) => {
        if (data?.SalesChannelID !== item.SalesChannelID) {
          addTab(
            `ویرایش کانال فروش - ${item.Title}`,
            'financial_group',
            undefined,
            'SalesChannelForm',
            { id: item.SalesChannelID }
          );
        }
      }}
      onDelete={data?.SalesChannelID ? async () => {
         const isConfirmed = await confirm({ message: 'آیا از حذف این کانال فروش اطمینان دارید؟' });
         if (!isConfirmed) return;
         setIsSubmitting(true);
         try {
            const res = await apiFetch(`/api/sle/sales-channels/${data.SalesChannelID}`, { method: 'DELETE' });
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

export function SalesChannel(props: any) {
  return <SalesChannelComponent {...props} />;
}

export function SalesChannelForm(props: any) {
  return <SalesChannelComponent {...props} />;
}
