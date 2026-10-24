"use client";

import { useFormUsageCheck } from "@/hooks/useFormUsageCheck";
import { apiFetch } from '@/lib/utils';
import React, { useState, useEffect } from "react";
import { SimpleFormTwoRow, FieldConfig } from "../SimpleFormTwoRow";
import { CheckBoxRightLabel } from "@/components/inputs/CheckBoxRightLabel";
import { MapPin } from "lucide-react";
import { useTabs } from "@/components/TabsProvider";
import { useToast } from "@/components/ToastProvider";
import { useConfirm } from "@/components/ConfirmProvider";
import { useLanguage } from "@/components/Providers";
import { safeStringify } from "@/lib/utils";
import { useFormUpsert } from "@/hooks/useFormUpsert";

export function DeliveryLocationComponent({ 
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
      apiFetch(`/api/sle/delivery-locations/${id}`)
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

  const { activeId, method, getUrl, handleResponse, setActiveId } = useFormUpsert(data?.DeliveryLocationID);
  const { isUsed } = useFormUsageCheck("DeliveryLocations", activeId);

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
    if (!data?.DeliveryLocationID && !activeId) {
      apiFetch(`/api/sle/delivery-locations/next-number`)
        .then(res => res.json())
        .then(resData => {
          const info = resData?.data || resData;
          if (info.documentNumber) {
            setValues(prev => ({ ...prev, Code: info.documentNumber }));
          }
        })
        .catch(console.error);
    }
  }, [data?.DeliveryLocationID, activeId]);

  const handleChange = (name: string, value: any) => {
    setValues(prev => {
      const next = { ...prev, [name]: value };
      if (name === 'Title' && (!prev.Title2 || prev.Title2.trim() === '' || prev.Title2 === prev.Title)) {
        next.Title2 = value;
      }
      return next;
    });
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
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

    apiFetch(`/api/sle/delivery-locations/next-number`)
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
      setErrors(prev => ({ ...prev, Code: 'فیلد کد اجباری است.' }));
      showToast('فیلد کد اجباری است.', 'error');
      return;
    }

    const titleVal = String(values.Title ?? '').trim();
    if (!titleVal) {
      setErrors(prev => ({ ...prev, Title: 'فیلد عنوان اجباری است.' }));
      showToast('فیلد عنوان اجباری است.', 'error');
      return;
    }

    const title2Val = String(values.Title2 ?? '').trim() || titleVal;

    setErrors({});
    setIsSubmitting(true);

    try {
      const url = getUrl('/api/sle/delivery-locations');
      
      const payload = {
        Code: Number(codeVal),
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
        if (savedItem && savedItem.DeliveryLocationID) {
          setData(savedItem);
          handleResponse(savedItem, 'DeliveryLocationID');
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
    { name: "Title", label: "عنوان", type: "text", required: true, colSpan: 1, disabled: isUsed },
    { name: "Title2", label: "عنوان (2)", type: "text", required: true, colSpan: 1, disabled: isUsed },
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
    { name: "Description", label: "توضیحات", type: "textarea", required: false, colSpan: 2, rows: 2 },
  ];

  return (
    <SimpleFormTwoRow 
      isReadonly={isUsed || false}
      title={data ? "ویرایش مکان تحویل" : "مکان تحویل جدید"}
      icon={<MapPin className="w-4 h-4" />}
      fields={fields}
      values={values}
      onChange={handleChange}
      errors={errors}
      onSave={handleSave}
      onSaveNew={handleSaveNew}
      onSaveClose={handleSaveClose}
      onNew={handleNew}
      listApiUrl="/api/sle/delivery-locations"
      listDisplayKey="Title"
      listColumns={[
        { key: "Code", header: "کد" },
        { key: "Title", header: "عنوان" },
        { key: "Title2", header: "عنوان (2)" },
        { 
          key: "IsActive", 
          header: "وضعیت",
          renderItem: (item: any) => item.IsActive !== false ? "فعال" : "غیرفعال"
        },
        { key: "Description", header: "توضیحات" }
      ]}
      onListSelect={(item) => {
        if (data?.DeliveryLocationID !== item.DeliveryLocationID) {
          addTab(
            `ویرایش مکان تحویل - ${item.Title}`,
            'financial_group',
            undefined,
            'DeliveryLocationForm',
            { id: item.DeliveryLocationID }
          );
        }
      }}
      onDelete={data?.DeliveryLocationID && !isUsed ? async () => {
         const isConfirmed = await confirm({ message: 'آیا از حذف این مکان تحویل اطمینان دارید؟' });
         if (!isConfirmed) return;
         setIsSubmitting(true);
         try {
            const res = await apiFetch(`/api/sle/delivery-locations/${data.DeliveryLocationID}`, { method: 'DELETE' });
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

export function DeliveryLocation(props: any) {
  return <DeliveryLocationComponent {...props} />;
}

export function DeliveryLocationForm(props: any) {
  return <DeliveryLocationComponent {...props} />;
}

export default DeliveryLocationForm;
