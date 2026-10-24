'use client';

import { useFormUsageCheck } from "@/hooks/useFormUsageCheck";
import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/components/Providers';
import { useToast } from '@/components/ToastProvider';
import { SimpleFormTwoRow, FieldConfig } from '@/components/forms/SimpleFormTwoRow';
import { MultiColumnDropdown } from '@/components/ui/MultiColumnDropdown';
import { FormFieldWrapper } from '@/components/inputs/FormFieldWrapper';
import { Repeat } from 'lucide-react';
import { apiFetch, safeStringify } from '@/lib/utils';
import { useFormUpsert } from '@/hooks/useFormUpsert';
import { TextInput } from '@/components/inputs';
import { useTabs } from "@/components/TabsProvider";
import { useConfirm } from "@/components/ConfirmProvider";

export default function CurrencyExchangeRate({ initialData }: { initialData?: any }) {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const { addTab, removeTab, activeTabId } = useTabs();

  const { activeId, method, getUrl, handleResponse } = useFormUpsert(initialData?.currencyExchangeRateId);
  const { isUsed } = useFormUsageCheck("CurrencyExchangeRate", activeId);


  const [currencies, setCurrencies] = useState<any[]>([]);
  const [exchangeUnitStr, setExchangeUnitStr] = useState<string>('');

  const [values, setValues] = useState<Record<string, any>>({
    currencyExchangeRateId: '',
    baseCurrencyRef: null,
    targetCurrencyRef: null,
    effectiveDate: new Date().toISOString().split('T')[0],
    exchangeRate: null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setValues({
        currencyExchangeRateId: initialData.currencyExchangeRateId || '',
        baseCurrencyRef: initialData.baseCurrencyRef || null,
        targetCurrencyRef: initialData.targetCurrencyRef || null,
        effectiveDate: initialData.effectiveDate ? (initialData.effectiveDate as string).split('T')[0] : new Date().toISOString().split('T')[0],
        exchangeRate: initialData.exchangeRate || null,
      });
    }
  }, [initialData]);

  const handleChange = (name: string, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  useEffect(() => {
    // Fetch currencies
    apiFetch('/api/common/currencies')
      .then(res => res.json())
      .then(data => {
        const list = Array.isArray(data) ? data : data.data || [];
        setCurrencies(list);
        if (!initialData) {
          // fetch base settings
          apiFetch('/api/common/base-settings/2')
            .then(res => res.json())
            .then(settingsRes => {
              if (settingsRes && settingsRes.settings) {
                const defCurr = settingsRes.settings.find((s: any) => s.key === 'defaultCurrency');
                if (defCurr && defCurr.value) {
                  // Find currency with this title
                  const found = list.find((c: any) => c.title === defCurr.value);
                  if (found) {
                    handleChange('baseCurrencyRef', found.currencyID);
                  }
                }
              }
            }).catch(console.error);
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (values.targetCurrencyRef) {
      const selected = currencies.find(c => c.currencyID === values.targetCurrencyRef);
      if (selected && selected.exchangeUnit) {
        setExchangeUnitStr(String(selected.exchangeUnit));
      } else {
        setExchangeUnitStr('');
      }
    } else {
      setExchangeUnitStr('');
    }
  }, [values.targetCurrencyRef, currencies]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!values.baseCurrencyRef) newErrors.baseCurrencyRef = 'ارز مبنا اجباری است';
    if (!values.targetCurrencyRef) newErrors.targetCurrencyRef = 'ارز مورد مبادله اجباری است';
    if (!values.effectiveDate) newErrors.effectiveDate = 'تاریخ موثر اجباری است';
    if (!values.exchangeRate) newErrors.exchangeRate = 'نرخ برابری اجباری است';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveToApi = async (isNew: boolean = false, isClose: boolean = false) => {
    if (!validate()) {
      showToast('لطفاً خطاهای فرم را برطرف کنید', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const url = getUrl('/api/common/currency-exchange-rates');
      
      const payload = {
        baseCurrencyRef: values.baseCurrencyRef,
        targetCurrencyRef: values.targetCurrencyRef,
        effectiveDate: values.effectiveDate,
        exchangeRate: parseFloat(values.exchangeRate || 0)
      };

      const res = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: safeStringify(payload)
      });

      const result = await res.json();
      
      if (res.ok) {
        handleResponse(result, 'currencyExchangeRateId');
        if (result && result.currencyExchangeRateId) {
          setValues(prev => ({ ...prev, currencyExchangeRateId: result.currencyExchangeRateId }));
        }
        showToast(result.message || 'ذخیره با موفقیت انجام شد', 'success');
        if (isNew) {
           handleNew();
        } else if (isClose && activeTabId) {
           removeTab(activeTabId);
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

  const handleNew = () => {
    setValues(prev => ({
      ...prev,
      currencyExchangeRateId: '',
      targetCurrencyRef: null,
      exchangeRate: null,
      effectiveDate: new Date().toISOString().split('T')[0],
      // we keep baseCurrencyRef
    }));
    setErrors({});
  };

  const handleDelete = async () => {
    if (!activeId) return;
    const isConfirmed = await confirm({ message: 'آیا از حذف این مورد اطمینان دارید؟' });
    if (!isConfirmed) return;
    setIsSubmitting(true);
    try {
      const res = await apiFetch(`/api/common/currency-exchange-rates/${activeId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('خطا در حذف');
      showToast('با موفقیت حذف شد', 'success');
      if (activeTabId) removeTab(activeTabId);
    } catch (err: any) {
      showToast(err.message || 'خطا در حذف', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fields: FieldConfig[] = [
    {
      name: 'currencyExchangeRateId',
      label: 'ID',
      type: 'text',
      disabled: true,
      placeholder: 'سیستمی',
    },
    {
      name: 'effectiveDate',
      label: 'تاریخ موثر',
      type: 'date',
      required: true,
      isHeader: true,
    },
    {
      name: 'baseCurrencyRef',
      label: 'ارز مبنا',
      type: 'custom',
      required: true,
      customComponent: (
        <MultiColumnDropdown
          columns={[
            { header: 'کد', key: 'code', width: 60 },
            { header: 'عنوان', key: 'title', width: 150 },
          ]}
          data={currencies}
          value={values.baseCurrencyRef || ''}
          onChange={(val: any) => handleChange('baseCurrencyRef', val ? parseInt(val.currencyID || val, 10) : null)}
          displayKey="title"
          placeholder="انتخاب ارز مبنا"
        />
      )
    },
    {
      name: 'targetCurrencyRef',
      label: 'ارز مورد مبادله',
      type: 'custom',
      required: true,
      customComponent: (
        <MultiColumnDropdown
          columns={[
            { header: 'کد', key: 'code', width: 60 },
            { header: 'عنوان', key: 'title', width: 150 },
          ]}
          data={currencies}
          value={values.targetCurrencyRef || ''}
          onChange={(val: any) => handleChange('targetCurrencyRef', val ? parseInt(val.currencyID || val, 10) : null)}
          displayKey="title"
          placeholder="انتخاب ارز مورد مبادله"
        />
      )
    },
    {
      name: 'exchangeUnitStr',
      label: 'واحد مبادله',
      type: 'custom',
      disabled: true,
      customComponent: (
        <TextInput 
           name="exchangeUnitStr" 
           label="" 
           value={exchangeUnitStr}
           onChange={() => {}}
           disabled={true} 
           placeholder="از ارز مبادله استخراج میشود"
        />
      )
    },
    {
      name: 'exchangeRate',
      label: 'نرخ برابری 1 واحد',
      type: 'number',
      required: true,
    }
  ];

  return (
    <SimpleFormTwoRow isReadonly={isUsed || false}
      title="نرخ برابری ارز"
      icon={<Repeat className="w-4 h-4 text-white" />}
      fields={fields}
      values={values}
      onChange={handleChange}
      errors={errors}
      onSave={handleSave}
      onSaveNew={handleSaveNew}
      
      onNew={handleNew}
      onDelete={activeId ? handleDelete : undefined}
      isSubmitting={isSubmitting}
      useClassicToolbar={false}
    />
  );
}
