"use client";

import { useFormUsageCheck } from "@/hooks/useFormUsageCheck";
import React, { useState, useEffect } from "react";
import { SimpleFormTwoRowTabbed } from "../SimpleFormTwoRowTabbed";
import { TabCellRow, TabCellConfig } from "../TabCellRow";
import { FieldConfig } from "../SimpleFormTwoRow";
import { useLanguage } from "../../Providers";
import { useTabs } from "../../TabsProvider";
import { useToast } from "../../ToastProvider";
import { MultiColumnDropdown } from "../../inputs/MultiColumnDropdown";
import { Coins, CircleDollarSign, Users } from "lucide-react";
import { apiFetch } from "@/lib/utils";
import { eventBus, EVENTS } from "@/lib/events";
import { useFormUpsert } from "@/hooks/useFormUpsert";

interface CashFormProps {
  id?: number;
}

export function CashForm({ id }: CashFormProps) {
  const { t } = useLanguage();
  const { removeTab, addTab } = useTabs();
  const { showToast } = useToast();
  const { activeId, method, getUrl, handleResponse, setActiveId } = useFormUpsert(id);
  const { isUsed } = useFormUsageCheck("Cash", activeId);
  const [refreshNumbering, setRefreshNumbering] = useState(0);

  const initialState = {
    code: "",
    title: "",
    title_en: "",
    detailedAccountCode: "",
    cashTypeId: 1, // Default to central (as number)
    currencyId: 1, // Should default to base currency from settings eventually
    initialBalance: 0,
    openingDate: "",
    isActive: true,
    description: "",
    cashiers: []
  };

  const [values, setValues] = useState<Record<string, any>>(initialState);

  const [currencies, setCurrencies] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Fetch currencies
    apiFetch('/api/common/currencies')
      .then(res => res.json())
      .then(data => {
        const items = data.data || data;
        if (Array.isArray(items)) {
          // ensure currencyID is handled correctly (sometimes it's currencyId in dtos but currencyID in db)
          const mappedItems = items.map(c => ({
            ...c,
            currencyId: Number(c.currencyID || c.currencyId)
          }));
          setCurrencies(mappedItems);
          // Set default currency to first one if none selected
          if (!values.currencyId && mappedItems.length > 0) {
            setValues(prev => ({ ...prev, currencyId: mappedItems[0].currencyId }));
          }
        }
      })
      .catch(console.error);

    // Fetch users for cashier selection
    apiFetch('/api/iam/users')
      .then(res => res.json())
      .then(data => {
        const items = data.items || data.data || data;
        if (Array.isArray(items)) {
          setUsers(items.map((u: any) => ({
            value: u.userId || u.userID,
            label: `${u.firstName || ''} ${u.lastName || ''} (${u.username})`.trim()
          })));
        }
      })
      .catch(console.error);

    // Fetch detailed accounts next-code if creating new
    if (!activeId) {
       apiFetch('/api/accounting/detailed-types')
         .then(res => res.json())
         .then(data => {
             const items = data.items || data.data || data;
             const typeCash = items?.find((t: any) => String(t.code) === '2' || String(t.Code) === '2');
             if (typeCash) {
                 const typeId = typeCash.detailedTypesId || typeCash.detailedTypeID || typeCash.DetailedTypesID;
                 return apiFetch(`/api/common/detailed-accounts-numbering/next-code/${typeId}`);
             }
             return null;
         })
         .then(res => res ? res.json() : null)
         .then(data => {
             if (data && data.data) {
                 setValues(prev => ({ ...prev, detailedAccountCode: data.data }));
             }
         })
         .catch(console.error);
    }
    // ...
  }, [activeId, refreshNumbering]);

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

  const handleTabCellChange = (tabData: Record<string, any[]>) => {
    if (tabData.cashiers) {
      const ids = tabData.cashiers.map(row => Number(row.userId)).filter(id => id);
      setValues(prev => ({ ...prev, cashiers: ids }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!values.code) newErrors.code = t('cash_code_required' as any) || "کد صندوق الزامی است";
    if (!values.title) newErrors.title = t('cash_title_required' as any) || "عنوان صندوق الزامی است";
    if (!values.detailedAccountCode) newErrors.detailedAccountCode = t('detailed_account_code_required' as any) || "کد تفصیلی الزامی است";
    if (!values.currencyId) newErrors.currencyId = t('currency_required' as any) || "نوع ارز الزامی است";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submitData = async () => {
    if (!validate()) return null;

    setIsSubmitting(true);
    try {
      const url = getUrl("/api/rap/cashes");

      const payload: any = { 
        ...values,
        cashTypeId: Number(values.cashTypeId),
        currencyId: Number(values.currencyId),
        initialBalance: Number(values.initialBalance || 0),
        cashiers: Array.isArray(values.cashiers) ? values.cashiers.map(id => Number(id)) : []
      };
      if (!payload.openingDate) delete payload.openingDate;

      const res = await apiFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
         const d = await res.json();
         throw new Error(d.message || t('error_saving' as any) || 'Error saving cash');
      }

      const result = await res.json();
      showToast(t('cash_save_success' as any) || "صندوق با موفقیت ذخیره شد", "success");
      eventBus.emit(EVENTS.DATA_CHANGED, { entity: 'Cash' });
      handleResponse(result, 'cashId');
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
        code: "",
        title: "",
        title_en: "",
        detailedAccountCode: "",
        cashTypeId: 1,
        currencyId: currencies.length > 0 ? currencies[0].currencyId : 1,
        initialBalance: 0,
        openingDate: "",
        isActive: true,
        description: "",
        cashiers: []
      });
    }
  };

  const handleSaveClose = async () => {
    const res = await submitData();
    if (res) {
      removeTab(`cash-${activeId || 'new'}`);
    }
  };

  const handleNew = () => {
    setActiveId(null);
    setValues(initialState);
    setErrors({});
    setRefreshNumbering(prev => prev + 1);
  };

  const currencyColumns = [
    { key: "code", label: t('code' as any) || "کد", width: 80 },
    { key: "title", label: t('title' as any) || "عنوان", width: 150 },
    { key: "titleEn", label: t('title_en' as any) || "عنوان لاتین", width: 120 }
  ];

  const fields: FieldConfig[] = [
    { name: "code", label: t('code' as any) || "کد", type: "text", required: true },
    { name: "title", label: t('title' as any) || "عنوان", type: "text", required: true },
    { name: "title_en", label: t('title_en' as any) || "عنوان لاتین", type: "text", required: false },
    { name: "detailedAccountCode", label: t('detailed_account_code' as any) || "کد تفصیلی", type: "text", required: true },
    { 
      name: "cashTypeId", 
      label: t('cash_type' as any) || "نوع صندوق", 
      type: "radio", 
      options: [
        { value: "1", label: t('central' as any) || "مرکزی" },
        { value: "2", label: t('store' as any) || "فروشگاه" }
      ],
      required: true 
    },
    {
      name: "currencyId",
      label: t('currency_type' as any) || "نوع ارز",
      type: "custom",
      required: true,
      customComponent: (
        <div className="flex-1 w-full max-w-sm">
          <MultiColumnDropdown
            value={currencies.find(c => Number(c.currencyId) === Number(values.currencyId)) || null}
            onChange={(val: any) => handleChange("currencyId", val?.currencyId)}
            data={currencies}
            columns={currencyColumns}
            displayKey="title"
            placeholder={(t('select_currency' as any) || "انتخاب ارز...") as string}
          />
        </div>
      )
    },
    { name: "initialBalance", label: t('initial_balance' as any) || "موجودی اولیه", type: "amount" },
    { name: "openingDate", label: t('opening_date' as any) || "تاریخ افتتاح", type: "date" },
    { name: "isActive", label: t('active' as any) || "فعال", type: "checkbox" },
    { name: "description", label: t('description' as any) || "توضیحات", type: "textarea", colSpan: 2 },
  ];

  const cashierTabConfig: TabCellConfig[] = [
    {
      id: "cashiers",
      label: t('cashier' as any) || "صندوقدار",
      columns: [
        { 
          key: "userId", 
          header: t('user' as any) || "کاربر", 
          type: "select", 
          options: users.map(u => ({ label: u.label, value: String(u.value) })),
          width: "300px" 
        }
      ]
    }
  ];

  const bottomTabs = [
    {
      id: "cashier",
      label: t('cashier' as any) || "صندوقدار",
      content: (
        <div className="p-4 h-full">
           <TabCellRow 
              tabs={cashierTabConfig} 
              value={{ cashiers: (values.cashiers || []).map((id: any) => ({ userId: String(id) })) }}
              onChange={handleTabCellChange}
              hideHeader={true}
           />
        </div>
      )
    }
  ];

  return (
    <SimpleFormTwoRowTabbed isReadonly={isUsed || false}
      title={activeId ? (t('edit_cash' as any) || "ویرایش صندوق") : (t('new_cash' as any) || "صندوق جدید")}
      icon={<CircleDollarSign className="w-4 h-4" />}
      headerGradient="from-blue-600 to-blue-500"
      fields={fields}
      bottomTabs={bottomTabs}
      values={values}
      onChange={handleChange}
      errors={errors}
      onSave={handleSave}
      onSaveNew={handleSaveNew}
      
      onNew={handleNew}
      isSubmitting={isSubmitting}
      listApiUrl="/api/rap/cashes"
      listColumns={[
        { key: "code", label: "کد", width: 80 },
        { key: "title", label: "عنوان", width: 250 },
        { key: "title_en", label: "عنوان لاتین", width: 200 }
      ]}
      listDisplayKey="title"
      onListSelect={(item: any) => {
        if (activeId !== item.cashId) {
          addTab(
            `ویرایش صندوق ${item.title || ''}`,
            'rap',
            <CircleDollarSign className="w-4 h-4" />,
            "CashForm",
            { id: item.cashId }
          );
        }
      }}
      showListButton={true} 
    />
  );
}

export default CashForm;
