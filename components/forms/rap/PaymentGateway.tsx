"use client";

import { useFormUsageCheck } from "@/hooks/useFormUsageCheck";
import React, { useState, useEffect } from 'react';
import { SimpleFormTwoRowTabbed } from '../SimpleFormTwoRowTabbed';
import { TabCellRow, TabCellConfig } from '../TabCellRow';
import { useFormUpsert } from '@/hooks/useFormUpsert';
import { SingleSelectDropDown } from '../../inputs/SingleSelectDropDown';
import { BankAccountDropDown } from '@/components/inputs';
import { CheckBoxRightLabel } from '../../inputs/CheckBoxRightLabel';
import { useToast } from '../../ToastProvider';
import { useTabs } from '../../TabsProvider';
import { apiFetch } from '@/lib/utils';
import { eventBus, EVENTS } from '@/lib/events';
import { List, CreditCard } from "lucide-react";
import { usePaymentGatewayColumns } from "./PaymentGatewayList";

export default function PaymentGatewayForm({ id }: { id?: string }) {
  const rawListColumns = usePaymentGatewayColumns();
  const listColumns = rawListColumns.map((c: any) => ({ ...c, label: c.header || c.label }));
  const [activeTab, setActiveTab] = useState('contact-info');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { showToast } = useToast();
  const { addTab, removeTab } = useTabs();
  const { activeId, isUpdate, method, getUrl, handleResponse, setActiveId } = useFormUpsert(id);
  const { isUsed } = useFormUsageCheck("PaymentGateway", activeId);


  const [values, setValues] = useState<any>({
    gatewayType: 'internet',
    isActive: true,
    contacts: []
  });

  useEffect(() => {
    if (activeId) {
      apiFetch(`/api/rap/payment-gateways/${activeId}`)
        .then(res => res.json())
        .then(data => {
          setValues({
            ...data,
            detailedAccountCode: data.detailedAccount ? data.detailedAccount.code : '',
            partiesRef_title: data.party ? (data.party.firstName || data.party.lastName || '') : '',
            bankAccountRef_title: data.bankAccount ? data.bankAccount.title : ''
          });
        })
        .catch(console.error);
    }
  }, [activeId]);

  const handleChange = (name: string, value: any) => {
    setValues((prev: any) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!values.partiesRef) newErrors.partiesRef = 'انتخاب نام شرکت / PSP الزامی است';
    if (!values.bankAccountRef) newErrors.bankAccountRef = 'انتخاب حساب بانکی الزامی است';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const performSave = async () => {
    if (!validate()) return false;
    setIsSubmitting(true);
    try {
      const res = await apiFetch(getUrl('/api/rap/payment-gateways'), {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });
      if (res.ok) {
        const data = await res.json();
        handleResponse(data, 'paymentGatewayId');
        showToast('با موفقیت ذخیره شد', 'success');
        eventBus.emit(EVENTS.DATA_CHANGED, { entity: 'PaymentGateway' });
        return true;
      } else {
        showToast('خطا در ذخیره', 'error');
        return false;
      }
    } catch (err) {
      showToast('خطا در عملیات ذخیره', 'error');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSave = async () => {
    return await performSave();
  };

  const handleSaveNew = async () => {
    const saved = await performSave();
    if (saved) {
      setValues({
        gatewayType: 'internet',
        isActive: true,
        contacts: []
      });
      // reset activeId via hook is not directly exposed without setup, 
      // but normally we close tab or allow user to type a new one
    }
  };

  const handleSaveClose = async () => {
    const saved = await performSave();
    if (saved) {
      removeTab(`PaymentGatewayForm-${id || 'new'}`);
    }
  };

  const handleNew = () => {
    setActiveId(undefined);
    setValues({
      gatewayType: 'internet',
      isActive: true,
      contacts: []
    });
  };

  const handleDelete = async (actionType: 'delete' | 'delete_and_new') => {
    if (!activeId) return;
    setIsSubmitting(true);
    try {
      const res = await apiFetch(`/api/rap/payment-gateways/${activeId}`, { method: 'DELETE' });
      if (res.ok) {
        if (actionType === 'delete_and_new') {
          setActiveId(undefined);
          setValues({ gatewayType: 'internet', isActive: true, contacts: [] });
        } else {
          removeTab(`PaymentGatewayForm-${id || 'new'}`);
        }
      } else {
        throw new Error('delete failed');
      }
    } catch (e) {
      showToast('خطا در حذف', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleList = () => {
    addTab('درگاههای پرداخت', 'financial_group', <List size={18} />, 'PaymentGatewayList');
  };

  const fields = [
    {
      name: 'gatewayType',
      label: 'نوع درگاه',
      type: 'radio' as const,
      options: [
        { label: 'کارتخوان', value: 'pos' },
        { label: 'درگاه اینترنتی', value: 'internet' }
      ]
    },
    {
      name: 'partiesRef',
      label: 'نام شرکت / PSP',
      type: 'custom' as const,
      customComponent: (
        <SingleSelectDropDown
          listApiUrl="/api/common/parties?nature=legal_entity&isActive=true"
          columns={[
            { key: 'detailedAccount.code', label: 'کدتفصیلی' },
            { key: 'firstName', label: 'نام شرکت' },
            { key: 'lastName', label: 'نام شرکت(2)' },
            { key: 'nationalId', label: 'شناسه ملی' },
            { 
              key: 'isActive', 
              label: 'وضعیت',
              renderItem: (item: any) => item.isActive ? 'فعال' : 'غیرفعال'
            },
          ]}
          displayKey="firstName"
          value={values?.partiesRef ? { id: values.partiesRef, firstName: values.partiesRef_title || 'انتخاب شده' } : null}
          onChange={(item: any) => {
            handleChange('partiesRef', item.partyId);
            handleChange('partiesRef_title', item.firstName || item.lastName || '');
          }}
        />
      )
    },
    {
      name: 'detailedAccountCode',
      label: 'کد تفصیلی',
      type: 'number' as const
    },
    {
      name: 'bankAccountRef',
      label: 'حساب بانکی',
      type: 'custom' as const,
      customComponent: (
        <BankAccountDropDown
          value={values?.bankAccountRef ? { bankAccountId: values.bankAccountRef, id: values.bankAccountRef, title: values.bankAccountRef_title || 'انتخاب شده' } : null}
          onChange={(item: any) => {
            handleChange('bankAccountRef', item?.bankAccountId || item?.id || null);
            handleChange('bankAccountRef_title', item?.title || '');
          }}
        />
      )
    },
    {
      name: 'gatewayIdString',
      label: 'شناسه درگاه',
      type: 'text' as const
    },
    {
      name: 'isActive',
      label: 'فعال',
      type: 'custom' as const,
      customComponent: (
        <div className="flex items-center">
          <CheckBoxRightLabel
            label="فعال"
            checked={values?.isActive !== false} // default true
            onChange={(val) => handleChange('isActive', val)}
          />
        </div>
      )
    }
  ];

  const contactTabs: TabCellConfig[] = [
    {
      id: 'contact-info',
      label: 'اطلاعات تماس',
      columns: [
        { key: 'title', header: 'عنوان', type: 'text' },
        { key: 'title2', header: 'عنوان (۲)', type: 'text' },
        { key: 'phoneNumber', header: 'شماره تلفن', type: 'text' },
        { key: 'description', header: 'توضیحات', type: 'textarea' }
      ]
    }
  ];

  const bottomTabs = [
    {
      id: 'contact-info',
      label: 'اطلاعات تماس',
      content: (
        <TabCellRow 
          tabs={contactTabs} 
          value={values?.contacts || []}
          onChange={(val) => handleChange('contacts', val)}
          hideHeader
        />
      )
    }
  ];

  return (
    <SimpleFormTwoRowTabbed isReadonly={isUsed || false}
      title={isUpdate ? "ویرایش درگاه پرداخت" : "معرفی درگاه پرداخت جدید"}
      fields={fields as any}
      values={values}
      onChange={handleChange}
      errors={errors}
      bottomTabs={bottomTabs}
      onSave={handleSave}
      onSaveNew={handleSaveNew}
      
      onDelete={handleDelete as any}
      onNew={handleNew}
      listApiUrl="/api/rap/payment-gateways"
      listColumns={listColumns}
      listDisplayKey="gatewayIdString"
      onListSelect={(item: any) => {
        if (activeId !== item.paymentGatewayId && activeId !== item.id) {
          addTab(
            `ویرایش درگاه ${item.gatewayIdString || item.paymentGatewayId || item.id}`,
            "rap",
            <CreditCard className="w-4 h-4" />,
            "PaymentGatewayForm",
            { id: item.paymentGatewayId || item.id }
          );
        }
      }}
      isSubmitting={isSubmitting}
    />
  );
}
