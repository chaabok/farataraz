"use client";

import { useFormUsageCheck } from "@/hooks/useFormUsageCheck";
import React, { useState, useEffect } from "react";
import { SimpleFormTwoRow, FieldConfig } from "../SimpleFormTwoRow";
import { SlAccountDropDown } from "../../ui/SlAccountDropDown";
import { CreditCard, List, Settings } from "lucide-react";
import { RadioGroup, Checkbox, CheckBoxRightLabel } from "../../inputs";
import { useLanguage } from "../../Providers";
import { useTabs } from "../../TabsProvider";
import { useToast } from "../../ToastProvider";
import { apiFetch } from "@/lib/utils";
import { eventBus, EVENTS } from "@/lib/events";
import { useFormUpsert } from "@/hooks/useFormUpsert";
import { useAccountingSettingColumns } from "./AccountingSettingList";

interface RecieptAndPaymentAccountingSettingProps {
  id?: number;
}

export function RecieptAndPaymentAccountingSetting({ id }: RecieptAndPaymentAccountingSettingProps) {
  const rawListColumns = useAccountingSettingColumns();
  const listColumns = rawListColumns.map((c: any) => ({ ...c, label: c.header || c.label }));
  const { t } = useLanguage();
  const { addTab, removeTab } = useTabs();
  const { showToast } = useToast();
  const { activeId, method, getUrl, handleResponse } = useFormUpsert(id);
  const { isUsed } = useFormUsageCheck("RecieptAndPaymentAccountingSetting", activeId);


  const [values, setValues] = useState<Record<string, any>>({
    recieptAndPaymentAccountingSettingId: "",
    code: "",
    title: "",
    title_en: "",
    accountRef: null,
    usedEntryType: 1,
    operationType: 1,
    isActive: true,
    detailedType: 1,
    isDefault: false,
    termType: 3 
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDocumentNoAuto, setIsDocumentNoAuto] = useState(false);

  useEffect(() => {
    if (activeId) {
      apiFetch(`/api/rap/accounting-setting/${activeId}`)
        .then(res => res.json())
        .then(data => {
          const item = data.data || data;
          setValues({
            recieptAndPaymentAccountingSettingId: item.recieptAndPaymentAccountingSettingId || "",
            code: item.code || "",
            title: item.title || "",
            title_en: item.title_en || "",
            accountRef: item.account || item.accountRef || null,
            usedEntryType: item.usedEntryType || "1",
            operationType: item.operationType || "1",
            isActive: item.isActive ?? true,
            detailedType: item.detailedType || "1",
            isDefault: item.isDefault ?? false,
            termType: item.termType || "3"
          });
        })
        .catch(console.error);
    } else {
      apiFetch(`/api/rap/accounting-setting/next-number`)
        .then(res => res.json())
        .then(resData => {
          setIsDocumentNoAuto(resData.isDocumentNumberAuto);
          if (resData.error) {
            showToast(resData.error, "error");
          }
          if (resData.isDocumentNumberAuto && resData.documentNumber) {
            setValues(prev => ({ ...prev, code: resData.documentNumber }));
          }
        })
        .catch(console.error);
    }
  }, [activeId]);

  useEffect(() => {
    if (values.usedEntryType === 2 && values.operationType === 2 && values.detailedType === "3") {
      setValues(prev => ({ ...prev, detailedType: 1 }));
    }
  }, [values.usedEntryType, values.operationType, values.detailedType]);

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
    if (!isDocumentNoAuto && !values.code) newErrors.code = "کد الزامی است";
    if (!values.title) newErrors.title = "عنوان الزامی است";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submitData = async () => {
    if (!validate()) return null;

    setIsSubmitting(true);
    try {
      const url = getUrl("/api/rap/accounting-setting");

      const getRefId = (val: any, idKey: string = 'id') => {
        if (typeof val === 'object' && val !== null) return val[idKey];
        return val;
      };

      const payload: any = { 
        ...values,
        recieptAndPaymentAccountingSettingId: values.recieptAndPaymentAccountingSettingId ? Number(values.recieptAndPaymentAccountingSettingId) : undefined,
      };

      if (!payload.accountRef) {
        payload.accountRef = null;
      } else {
        payload.accountRef = Number(getRefId(payload.accountRef, 'id'));
      }

      const res = await apiFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
         const d = await res.json();
         throw new Error(d.message || 'Error saving setting');
      }

      const result = await res.json();
      showToast("با موفقیت ذخیره شد", "success");
      eventBus.emit(EVENTS.DATA_CHANGED, { entity: 'RecieptAndPaymentAccountingSetting' });
      handleResponse(result, 'recieptAndPaymentAccountingSettingId');
      return result;
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "خطا در ذخیره سیستم", "error");
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
        recieptAndPaymentAccountingSettingId: "",
        code: "",
        title: "",
        title_en: "",
        accountRef: null,
        usedEntryType: 1,
        operationType: 1,
        isActive: true,
        detailedType: 1,
        isDefault: false,
        termType: 3
      });

      apiFetch(`/api/rap/accounting-setting/next-number`)
        .then(res => res.json())
        .then(resData => {
          setIsDocumentNoAuto(resData.isDocumentNumberAuto);
          if (resData.error) {
            showToast(resData.error, "error");
          }
          if (resData.isDocumentNumberAuto && resData.documentNumber) {
            setValues(prev => ({ ...prev, code: resData.documentNumber }));
          }
        })
        .catch(console.error);
    }
  };

  const handleSaveClose = async () => {
    const res = await submitData();
    if (res) {
      removeTab(`RecieptAndPaymentAccountingSetting-${activeId || 'new'}`);
    }
  };

  const handleDelete = async () => {
    if (!activeId) return;
    setIsSubmitting(true);
    try {
      const res = await apiFetch(`/api/rap/accounting-setting/${activeId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.message || "Error deleting");
      }
      showToast("حذف شد", "success");
      eventBus.emit(EVENTS.DATA_CHANGED, { entity: 'RecieptAndPaymentAccountingSetting' });
      removeTab(`RecieptAndPaymentAccountingSetting-${activeId}`);
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "خطا در حذف", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fields: FieldConfig[] = [
    { name: "code", label: "کد", type: "text", required: !isDocumentNoAuto, colSpan: 1, disabled: isDocumentNoAuto },
    { name: "title", label: "عنوان", type: "text", required: true, colSpan: 1 },
    { name: "title_en", label: "عنوان(2)", type: "text", colSpan: 1 },
    { 
      name: "accountRef", 
      label: "حساب معین", 
      type: "custom", 
      colSpan: 1,
      customComponent: (
        <div className="w-full">
          <SlAccountDropDown 
            value={values.accountRef} 
            onChange={(val) => handleChange("accountRef", val)} 
            disabled={isUsed || false}
          />
        </div>
      )
    },
    {
      name: "usedEntryType",
      label: "نوع قلم مورد استفاده",
      type: "select",
      options: [
        { value: "1", label: "چک" },
        { value: "2", label: "سفته" },
        { value: "3", label: "وجه نقد" },
        { value: "4", label: "اعتبار" },
        { value: "5", label: "اعلامیه واریز" },
        { value: "6", label: "کارتخوان" },
        { value: "7", label: "برداشت" },
        { value: "8", label: "تضمین" }
      ]
    },
    { 
      name: "detailedType", 
      label: "نوع تفصیلی", 
      type: "radio",
      options: [
        { value: "1", label: "طرف مقابل" },
        { value: "2", label: "صندوق" },
        { value: "3", label: "حساب بانکی" }
      ].filter(opt => {
        if (Number(values.usedEntryType) === 2 && Number(values.operationType) === 2) {
          return opt.value !== "3";
        }
        return true;
      })
    },
    {
      name: "combinedGroup",
      label: "",
      type: "custom",
      colSpan: 2,
      customComponent: (
        <div className="grid grid-cols-2 gap-4">
          <fieldset className="relative border border-slate-300 dark:border-slate-700 rounded-lg p-4 pt-6">
            <legend className="text-sm font-medium text-slate-700 dark:text-slate-300 px-2 bg-transparent">نوع مدت</legend>
            <div className="flex flex-wrap w-full gap-4 items-start h-full">
              <RadioGroup
                name="termType"
                value={values.termType}
                onChange={(val) => handleChange("termType", val)}
                containerClassName="flex flex-row items-center gap-4"
                disabled={isUsed || false}
                options={[
                  { value: 1, label: "به روز" },
                  { value: 2, label: "کوتاه مدت" },
                  { value: 3, label: "بلندمدت" },
                  { value: 4, label: "هیچکدام" }
                ]}
              />
            </div>
          </fieldset>
          <fieldset className="relative border border-slate-300 dark:border-slate-700 rounded-lg p-4 pt-6">
            <legend className="text-sm font-medium text-slate-700 dark:text-slate-300 px-2 bg-transparent">نوع عملیات</legend>
            <div className="flex flex-wrap w-full gap-2 h-full">
              <RadioGroup
                name="operationType"
                value={values.operationType}
                onChange={(val) => handleChange("operationType", val)}
                containerClassName="grid grid-cols-3 gap-x-2 gap-y-2 w-full"
                disabled={isUsed || false}
                options={[
                  { value: 1, label: "دریافت" },
                  { value: 2, label: "پرداخت" },
                  { value: 3, label: "حقوقی کردن" },
                  { value: 4, label: "واخواست بدون اقدام" },
                  { value: 5, label: "صندوق به صندوق" },
                  { value: 6, label: "واگذار به بانک" },
                  { value: 7, label: "وصول" },
                  { value: 8, label: "واخواست" },
                  { value: 9, label: "تغییر مدت" },
                  { value: 10, label: "تضمین" },
                  { value: 11, label: "نقد کردن" }
                ]}
              />
            </div>
          </fieldset>
        </div>
      )
    },
    {
      name: "isDefaultCustom",
      label: "",
      type: "custom",
      colSpan: 1,
      customComponent: (
        <CheckBoxRightLabel
          text="پیش فرض"
          checked={!!values.isDefault}
          onChange={(checked) => handleChange("isDefault", checked)}
          disabled={isUsed || false}
        />
      )
    },
    {
      name: "isActiveCustom",
      label: "",
      type: "custom",
      colSpan: 1,
      customComponent: (
        <CheckBoxRightLabel
          text="فعال"
          checked={!!values.isActive}
          onChange={(checked) => handleChange("isActive", checked)}
          disabled={isUsed || false}
        />
      )
    }
  ];

  const handleNew = () => {
    addTab(
      "عملیات حسابداری جدید",
      "rap",
      <CreditCard className="w-4 h-4" />,
      "RecieptAndPaymentAccountingSetting"
    );
  };

  const handleList = () => {
    addTab(
      "عملیات حسابداری",
      "rap",
      <List className="w-4 h-4" />,
      "AccountingSettingList"
    );
  };

  return (
    <SimpleFormTwoRow isReadonly={isUsed || false}
      title={activeId ? "ویرایش عملیات حسابداری" : "عملیات حسابداری جدید"}
      icon={<CreditCard className="w-4 h-4" />}
      headerGradient="from-emerald-600 to-emerald-500"
      fields={fields}
      values={values}
      onChange={handleChange}
      errors={errors}
      onNew={handleNew}
      listApiUrl="/api/rap/accounting-settings"
      listColumns={listColumns}
      listDisplayKey="title"
      onListSelect={(item: any) => {
        if (activeId !== item.recieptAndPaymentAccountingSettingId && activeId !== item.id) {
          addTab(
            `ویرایش تنظیمات ${item.title || item.code || item.recieptAndPaymentAccountingSettingId || item.id}`,
            "rap",
            <Settings className="w-4 h-4" />,
            "RecieptAndPaymentAccountingSetting",
            { id: item.recieptAndPaymentAccountingSettingId || item.id }
          );
        }
      }}
      onSave={handleSave}
      onSaveNew={handleSaveNew}
      
      onDelete={handleDelete}
      isSubmitting={isSubmitting}
    />
  );
}

export default RecieptAndPaymentAccountingSetting;
