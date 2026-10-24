"use client";

import { useFormUsageCheck } from "@/hooks/useFormUsageCheck";
import React, { useState, useEffect } from "react";
import { SimpleFormTwoRow } from "../SimpleFormTwoRow";
import { FieldConfig } from "../SimpleFormTwoRow";
import { useLanguage } from "../../Providers";
import { useTabs } from "../../TabsProvider";
import { useToast } from "../../ToastProvider";
import { SingleSelectDropDown } from "../../inputs/SingleSelectDropDown";
import { SimpleSelectDropDown } from "../../inputs/SimpleSelectDropDown";
import { CheckBoxRightLabel } from "../../inputs/CheckBoxRightLabel";
import { CurrencyDropDown } from "../../inputs/CurrencyDropdown";
import { SlAccountDropDown } from "../../ui/SlAccountDropDown";
import { Wallet } from "lucide-react";
import { apiFetch, jalaliToGregorianISO, gregorianToJalaliDisplay } from "@/lib/utils";
import { eventBus, EVENTS } from "@/lib/events";
import { useFormUpsert } from "@/hooks/useFormUpsert";
import { FormFieldWrapper } from "../../inputs/FormFieldWrapper";
import { AmountInput } from "../../inputs/AmountInput";
import moment from "moment";
import momentJalaali from "moment-jalaali";
import { useCompanyStore } from "@/lib/stores/companyStore";

interface PettyCashFormProps {
  id?: number;
}

export function PettyCashForm({ id }: PettyCashFormProps) {
  const { t } = useLanguage();
  const { removeTab, addTab } = useTabs();
  const { showToast } = useToast();
  const { currentCompany } = useCompanyStore();
  const { activeId, method, getUrl, handleResponse } = useFormUpsert(id);
  const { isUsed } = useFormUsageCheck("PettyCash", activeId);

  const [values, setValues] = useState<Record<string, any>>({
    title: "",
    currencyId: 1,
    currentBalance: 0,
    openingDate: "",
    pettyCashLimit: 0,
    accountRef: null,
    partyRef: null,
    isPettyCashLimitControlled: false,
    isActive: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Fetch petty cash if editing
    if (activeId) {
      apiFetch(`/api/rap/petty-cashes/${activeId}`)
        .then(res => res.json())
        .then(data => {
          const item = data.data || data;
          setValues({
            title: item.title || "",
            currencyId: Number(item.currencyId || item.currencyID || 1),
            currencyId_title: item.currency?.title || "",
            currentBalance: item.currentBalance || item.initialBalance || 0,
            openingDate: item.openingDate ? item.openingDate.split('T')[0] : "",
            pettyCashLimit: item.pettyCashLimit || 0,
            accountRef: item.accountRef || item.accountId || item.accountID || null,
            accountRef_title: item.account?.title || "",
            accountRef_code: item.account?.code || "",
            partyRef: item.partyRef || item.partyId || null,
            partyRef_title: item.party ? `${item.party.firstName || ""} ${item.party.lastName || ""}`.trim() : "",
            isPettyCashLimitControlled: item.isPettyCashLimitControlled ?? false,
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
    if (!values.title) newErrors.title = "نام تنخواه الزامی است";
    if (!values.partyRef) newErrors.partyRef = "تنخواه دار الزامی است";
    if (!values.currencyId) newErrors.currencyId = "نوع ارز الزامی است";
    if (!values.accountRef) newErrors.accountRef = "حساب معین الزامی است";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submitData = async () => {
    if (!validate()) return null;

    setIsSubmitting(true);
    try {
      const url = getUrl("/api/rap/petty-cashes");

      const payload: any = { 
        ...values,
        currencyId: Number(values.currencyId),
        initialBalance: Number(values.currentBalance || 0),
        currentBalance: Number(values.currentBalance || 0),
        pettyCashLimit: Number(values.pettyCashLimit || 0),
        accountRef: Number(values.accountRef),
      };
      
      if (values.partyRef) {
        payload.partyRef = Number(values.partyRef);
      }
      
      if (payload.openingDate) {
        const iso = jalaliToGregorianISO(payload.openingDate);
        if (iso) payload.openingDate = iso;
        else delete payload.openingDate;
      } else {
        delete payload.openingDate;
      }

      const res = await apiFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
         const d = await res.json();
         throw new Error(d.message || "خطا در ذخیره تنخواه گردان");
      }

      const result = await res.json();
      showToast("تنخواه گردان با موفقیت ذخیره شد", "success");
      eventBus.emit(EVENTS.DATA_CHANGED, { entity: 'PettyCash' });
      handleResponse(result, 'pettyCashId');
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
        title: "",
        currencyId: 1,
        currentBalance: 0,
        openingDate: "",
        pettyCashLimit: 0,
        accountRef: null,
        partyRef: null,
        isPettyCashLimitControlled: false,
        isActive: true,
      });
    }
  };

  const handleSaveClose = async () => {
    const res = await submitData();
    if (res) {
      removeTab(`pettycash-${activeId || 'new'}`);
    }
  };

  const handleNew = () => {
    addTab(
      "تنخواه گردان جدید",
      "rap",
      <Wallet className="w-4 h-4" />,
      "PettyCashForm"
    );
  };

  const fields: FieldConfig[] = [
    { name: "title", label: "نام تنخواه", type: "text", required: true },
    { 
      name: "partyRef", 
      label: "تنخواه دار", 
      type: "custom",
      required: true,
      customComponent: (
        <div className="flex-1 w-full">
           <SingleSelectDropDown
             listApiUrl="/api/common/parties"
             columns={[
               { key: 'partyId', label: 'کد', width: 80 },
               { key: 'firstName', label: 'نام', width: 120 },
               { key: 'lastName', label: 'نام خانوادگی', width: 150 },
               { key: 'nationalCode', label: 'کد ملی', width: 100 }
             ]}
             displayKey="lastName"
             value={values?.partyRef ? { partyId: values.partyRef, lastName: values.partyRef_title || 'انتخاب شده' } : null}
             onChange={(item: any) => {
               handleChange('partyRef', item.partyId || item.id);
               handleChange('partyRef_title', `${item.firstName || ''} ${item.lastName || ''}`.trim());
             }}
             disabled={isUsed || false}
           />
        </div>
      )
    },
    {
      name: "currency_limit_group",
      label: " ", // empty space
      labelWidth: "0px",
      type: "custom",
      customComponent: (
        <div className="flex items-center gap-2 w-full">
           <div className="flex-1 min-w-0 pr-[4px]">
             <AmountInput 
               name="pettyCashLimit"
               label="سقف" 
               labelWidth="40px"
               value={String(values.pettyCashLimit !== undefined && values.pettyCashLimit !== null ? values.pettyCashLimit : '')}
               onChange={(val) => handleChange('pettyCashLimit', val)}
               disabled={isUsed || false}
             />
           </div>
           
           <div className="flex-1 min-w-0 pr-[4px]">
             <CurrencyDropDown
               label="نوع ارز"
               required
               labelWidth="60px"
               listApiUrl={`/api/common/currencies${currentCompany?.businessStructureId ? `?businessStructureRef=${currentCompany.businessStructureId}` : ''}`}
               value={values?.currencyId ? { currencyId: values.currencyId, currencyID: values.currencyId, title: values.currencyId_title || 'انتخاب شده', code: 0, titleEn: '', exchangeUnit: 1, precisionCount: 0, isActive: true } : null}
               onChange={(item: any) => {
                 if (item) {
                   handleChange('currencyId', item.currencyId || item.currencyID);
                   handleChange('currencyId_title', item.title);
                 } else {
                   handleChange('currencyId', null);
                   handleChange('currencyId_title', '');
                 }
               }}
               disabled={isUsed || false}
               error={errors.currencyId}
             />
           </div>
        </div>
      )
    },
    { 
      name: "accountRef", 
      label: "معین", 
      type: "custom",
      required: true, 
      customComponent: (
        <div className="flex-1 w-full">
           <SlAccountDropDown
             value={values?.accountRef ? { id: values.accountRef, accountId: values.accountRef, title: values.accountRef_title || '', code: values.accountRef_code || '' } : null}
             onChange={(val: any) => {
               handleChange('accountRef', val?.accountId || val?.id);
               handleChange('accountRef_title', val?.title || '');
               handleChange('accountRef_code', val?.code || '');
             }}
             disabled={isUsed || false}
           />
        </div>
      )
    },
    {
      name: "deploymentGroup",
      label: "اطلاعات استقرار",
      type: "group",
      groupFields: [
        { name: "openingDate", label: "تاریخ افتتاح", type: "date" },
        { name: "currentBalance", label: "مبلغ مانده", type: "amount" },
      ]
    },
    {
      name: "settingsGroup",
      label: " ",
      type: "custom",
      customComponent: (
        <div className="flex items-center gap-6 mt-2">
          <CheckBoxRightLabel
            label="کنترل سقف تنخواه"
            checked={!!values?.isPettyCashLimitControlled}
            onChange={(val) => handleChange('isPettyCashLimitControlled', val)}
            disabled={isUsed || false}
          />
          <CheckBoxRightLabel
            label="فعال"
            checked={values?.isActive !== false}
            onChange={(val) => handleChange('isActive', val)}
            disabled={isUsed || false}
          />
        </div>
      )
    },
  ];

  return (
    <SimpleFormTwoRow isReadonly={isUsed || false}
      title={activeId ? "ویرایش تنخواه گردان" : "تنخواه گردان جدید"}
      icon={<Wallet className="w-4 h-4" />}
      headerGradient="from-green-600 to-green-500"
      fields={fields}
      values={values}
      onChange={handleChange}
      errors={errors}
      onSave={handleSave}
      onSaveNew={handleSaveNew}
      
      onNew={handleNew}
      isSubmitting={isSubmitting}
      listApiUrl="/api/rap/petty-cashes"
      listColumns={[
        { key: "pettyCashId", label: "کد", width: 80 },
        { key: "title", label: "نام تنخواه", width: 250 },
      ]}
      listDisplayKey="title"
      onListSelect={(item: any) => {
        if (activeId !== item.pettyCashId) {
          addTab(
            `ویرایش تنخواه گردان ${item.title || ''}`,
            'rap',
            <Wallet className="w-4 h-4" />,
            "PettyCashForm",
            { id: item.pettyCashId }
          );
        }
      }}
      showListButton={true} 
    />
  );
}

export default PettyCashForm;
