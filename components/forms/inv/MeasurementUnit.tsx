"use client";
import { useFormUsageCheck } from "@/hooks/useFormUsageCheck";
import { apiFetch } from '@/lib/utils';

import React, { useState, useEffect } from "react";
import { SimpleFormTwoRow, FieldConfig } from "../SimpleFormTwoRow";
import { CheckBoxRightLabel } from "@/components/inputs/CheckBoxRightLabel";
import { Box } from "lucide-react";
import { useTabs } from "@/components/TabsProvider";
import { useToast } from "@/components/ToastProvider";
import { useConfirm } from "@/components/ConfirmProvider";
import { useLanguage } from "@/components/Providers";
import { safeStringify } from "@/lib/utils";
import { useFormUpsert } from "@/hooks/useFormUpsert";

export function MeasurementUnit({ 
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
      apiFetch(`/api/inv/measurement-units/${id}`)
        .then(res => res.json())
        .then(resData => {
          setData(resData);
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

  const { activeId, method, getUrl, handleResponse, setActiveId } = useFormUpsert(data?.MeasurementUnitID);
  const { isUsed } = useFormUsageCheck("MeasurementUnits", activeId);

  const [values, setValues] = useState<Record<string, any>>({
    MeasurementUnitCode: '',
    MeasurementUnitName: '',
    MeasurementUnitName2: '',
    IsActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDocumentNoAuto, setIsDocumentNoAuto] = useState(false);

  useEffect(() => {
    if (data) {
      setValues({
        MeasurementUnitCode: data.MeasurementUnitCode || '',
        MeasurementUnitName: data.MeasurementUnitName || '',
        MeasurementUnitName2: data.MeasurementUnitName2 || '',
        IsActive: data.IsActive !== undefined ? data.IsActive : true,
      });
    }
  }, [data]);

  useEffect(() => {
    if (!data?.MeasurementUnitID && !activeId) {
      apiFetch(`/api/inv/measurement-units/next-number`)
        .then(res => res.json())
        .then(resData => {
          setIsDocumentNoAuto(resData.isDocumentNumberAuto);
          if (resData.error) {
            showToast(resData.error, "error");
          }
          if (resData.isDocumentNumberAuto && resData.documentNumber) {
            setValues(prev => ({ ...prev, MeasurementUnitCode: resData.documentNumber }));
          }
        })
        .catch(console.error);
    } else {
        // Assume non-auto if editing
        setIsDocumentNoAuto(false);
    }
  }, [data?.MeasurementUnitID, activeId]);

  const handleChange = (name: string, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!isDocumentNoAuto && !values.MeasurementUnitCode) newErrors.MeasurementUnitCode = 'کد اجباری است';
    if (!values.MeasurementUnitName) newErrors.MeasurementUnitName = 'عنوان اجباری است';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNew = () => {
    setData(undefined);
    setActiveId(null);
    setValues({
      MeasurementUnitCode: '',
      MeasurementUnitName: '',
      MeasurementUnitName2: '',
      IsActive: true,
    });
    setErrors({});

    apiFetch(`/api/inv/measurement-units/next-number`)
      .then(res => res.json())
      .then(resData => {
        setIsDocumentNoAuto(resData.isDocumentNumberAuto);
        if (resData.isDocumentNumberAuto && resData.documentNumber) {
          setValues(prev => ({ ...prev, MeasurementUnitCode: resData.documentNumber }));
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
      const url = getUrl('/api/inv/measurement-units');
      
      const payload = {
        ...values,
        MeasurementUnitCode: values.MeasurementUnitCode ? parseInt(values.MeasurementUnitCode) : undefined,
      };

      const res = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: safeStringify(payload)
      });

      const result = await res.json();
      
      if (res.ok) {
        if (result && result.MeasurementUnitID) {
          setData(result);
          handleResponse(result, 'MeasurementUnitID');
        } else if (result && result.data && result.data.MeasurementUnitID) {
          setData(result.data);
          handleResponse(result, 'MeasurementUnitID');
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
    { name: "MeasurementUnitCode", label: "کد", type: "number", required: true, disabled: isDocumentNoAuto || isUsed },
    { name: "MeasurementUnitName", label: "عنوان", type: "text", required: true },
    { name: "MeasurementUnitName2", label: "عنوان 2", type: "text", required: false },
    { name: "IsActive", label: " ", type: "custom", customComponent: <CheckBoxRightLabel label="فعال" checked={values.IsActive} onChange={(checked) => handleChange('IsActive', checked)} disabled={isUsed} />, required: false },
  ];

  return (
    <SimpleFormTwoRow isReadonly={isUsed || false}
      title={data ? "ویرایش واحد سنجش" : "واحد سنجش جدید"}
      icon={<Box className="w-4 h-4" />}
      fields={fields}
      values={values}
      onChange={handleChange}
      errors={errors}
      onSave={handleSave}
      onSaveNew={handleSaveNew}
      
      onNew={handleNew}
      listApiUrl="/api/inv/measurement-units"
      listDisplayKey="MeasurementUnitName"
      listColumns={[
        { key: "MeasurementUnitCode", header: "کد" },
        { key: "MeasurementUnitName", header: "عنوان" },
        { key: "MeasurementUnitName2", header: "عنوان 2" },
      ]}
      onListSelect={(item) => {
        if (data?.MeasurementUnitID !== item.MeasurementUnitID) {
          addTab(
            `ویرایش واحد سنجش - ${item.MeasurementUnitName}`,
            'warehouse',
            undefined,
            'MeasurementUnitForm',
            { id: item.MeasurementUnitID }
          );
        }
      }}
      onDelete={data?.MeasurementUnitID ? async () => {
         const isConfirmed = await confirm({ message: 'آیا از حذف این مورد اطمینان دارید؟' });
         if (!isConfirmed) return;
         setIsSubmitting(true);
         try {
            const res = await apiFetch(`/api/inv/measurement-units/${data.MeasurementUnitID}`, { method: 'DELETE' });
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
      labelWidth="90px"
    />
  );
}
