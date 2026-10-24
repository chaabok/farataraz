"use client";

import { useFormUsageCheck } from "@/hooks/useFormUsageCheck";
import React, { useState, useEffect } from "react";
import { SimpleFormTwoRow, FieldConfig } from "../SimpleFormTwoRow";
import { useLanguage } from "../../Providers";
import { useTabs } from "../../TabsProvider";
import { useToast } from "../../ToastProvider";
import { Building2 } from "lucide-react";
import { apiFetch } from "@/lib/utils";
import { eventBus, EVENTS } from "@/lib/events";
import { useFormUpsert } from "@/hooks/useFormUpsert";

interface BankAccountTypeFormProps {
  id?: number;
}

export function BankAccountTypeForm({ id }: BankAccountTypeFormProps) {
  const { t } = useLanguage();
  const { removeTab, addTab } = useTabs();
  const { showToast } = useToast();
  const { activeId, method, getUrl, handleResponse } = useFormUpsert(id);
  const { isUsed } = useFormUsageCheck("BankAccountType", activeId);


  const [values, setValues] = useState<Record<string, any>>({
    bankAccountTypeId: "",
    code: "",
    title: "",
    latinTitle: "",
    isActive: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (activeId) {
      apiFetch(`/api/rap/bank-account-types/${activeId}`)
        .then(res => res.json())
        .then(data => {
          const item = data.data || data;
          setValues({
            bankAccountTypeId: item.bankAccountTypeId || "",
            code: item.code || "",
            title: item.title || "",
            latinTitle: item.latinTitle || "",
            isActive: item.isActive ?? true,
          });
        })
        .catch(console.error);
    }
  }, [activeId]);

  const handleChange = (name: string, value: any) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!values.code) newErrors.code = t('code_required' as any) || "کد الزامی است";
    if (!values.title) newErrors.title = t('title_required' as any) || "عنوان الزامی است";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submitData = async () => {
    if (!validate()) return null;

    setIsSubmitting(true);
    try {
      const url = getUrl("/api/rap/bank-account-types");

      const payload = { 
        ...values,
        code: Number(values.code),
        bankAccountTypeId: values.bankAccountTypeId ? Number(values.bankAccountTypeId) : undefined,
      };

      const res = await apiFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
         const d = await res.json();
         throw new Error(d.message || t('error_saving' as any) || 'Error saving type');
      }

      const result = await res.json();
      showToast(t('save_success' as any) || "با موفقیت ذخیره شد", "success");
      eventBus.emit(EVENTS.DATA_CHANGED, { entity: 'BankAccountType' });
      handleResponse(result, 'bankAccountTypeId');
      return result;
    } catch (err: any) {
      console.error(err);
      showToast(err.message || t('error_saving_system' as any) || "خطا در ذخیره سیستم", "error");
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSave = async () => {
    return await submitData();
  };

  const handleSaveNew = async () => {
    const res = await submitData();
    if (res) {
      setValues({
        bankAccountTypeId: "",
        code: "",
        title: "",
        latinTitle: "",
        isActive: true,
      });
    }
  };

  const handleSaveClose = async () => {
    const res = await submitData();
    if (res) {
      removeTab(`BankAccountType-${activeId || 'new'}`);
    }
  };

  const handleNew = () => {
    addTab(
      t('new_bank_account_type' as any) || "نوع حساب بانکی جدید",
      "rap",
      <Building2 className="w-4 h-4" />,
      "BankAccountType"
    );
  };

  const handleList = () => {
    addTab(
      'فهرست انواع حساب بانکی',
      'rap',
      <Building2 className="w-4 h-4" />,
      "BankAccountTypeList"
    );
  };

  const fields: FieldConfig[] = [
    { name: "code", label: t('code' as any) || "کد", type: "number", required: true },
    { name: "title", label: t('title' as any) || "عنوان", type: "text", required: true },
    { name: "latinTitle", label: t('title_en' as any) || "عنوان لاتین", type: "text" },
    { name: "isActive", label: t('active' as any) || "فعال", type: "checkbox" },
  ];

  return (
    <SimpleFormTwoRow isReadonly={isUsed || false}
      title={activeId ? (t('edit_bank_account_type' as any) || "ویرایش نوع حساب بانکی") : (t('new_bank_account_type' as any) || "نوع حساب بانکی جدید")}
      icon={<Building2 className="w-4 h-4" />}
      headerGradient="from-blue-600 to-blue-500"
      fields={fields}
      values={values}
      onChange={handleChange}
      errors={errors}
      onSave={handleSave}
      onSaveNew={handleSaveNew}
      
      onNew={handleNew}
      listApiUrl="/api/rap/bank-account-types"
      listColumns={[
        { key: "code", label: "کد", width: 80 },
        { key: "title", label: "عنوان", width: 250 },
        { key: "latinTitle", label: "عنوان لاتین", width: 250 },
      ]}
      listDisplayKey="title"
      onListSelect={(item: any) => {
        if (activeId !== item.bankAccountTypeId) {
          addTab(
            `ویرایش نوع حساب ${item.title || ''}`,
            'rap',
            <Building2 className="w-4 h-4" />,
            "BankAccountType",
            { id: item.bankAccountTypeId }
          );
        }
      }}
      isSubmitting={isSubmitting}
      showListButton={true} 
    />
  );
}

export default BankAccountTypeForm;
