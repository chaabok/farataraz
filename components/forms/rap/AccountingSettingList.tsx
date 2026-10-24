"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { MainDataGrid, DataGridParams } from '../../ui/MainDataGrid';
import { useTabs } from '../../TabsProvider';
import { useLanguage } from '../../Providers';
import { useToast } from '../../ToastProvider';
import { Settings, Plus, List } from 'lucide-react';
import { apiFetch } from '@/lib/utils';
import { eventBus, EVENTS } from '@/lib/events';

export const useAccountingSettingColumns = () => {
  return [
    { key: "code", label: "کد" },
    { key: "title", label: "عنوان" },
    { key: "title_en", label: "عنوان (انگلیسی)" },
    { 
      key: "usedEntryType", 
      label: "نوع قلم مورد استفاده", 
      type: "enum",
      enumOptions: [
        { value: 1, label: "چک" },
        { value: 2, label: "سفته" },
        { value: 3, label: "وجه نقد" },
        { value: 4, label: "اعتبار" },
        { value: 5, label: "اعلامیه واریز" },
        { value: 6, label: "کارتخوان" },
        { value: 7, label: "برداشت" },
        { value: 8, label: "تضمین" }
      ]
    },
    { 
      key: "operationType", 
      label: "نوع عملیات", 
      type: "enum",
      enumOptions: [
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
      ]
    },
    { 
      key: "detailedType", 
      label: "نوع تفصیلی", 
      type: "enum",
      enumOptions: [
        { value: 1, label: "طرف مقابل" },
        { value: 2, label: "صندوق" },
        { value: 3, label: "حساب بانکی" }
      ]
    },
    { 
      key: "termType", 
      label: "نوع مدت", 
      type: "enum",
      enumOptions: [
        { value: 1, label: "به روز" },
        { value: 2, label: "کوتاه مدت" },
        { value: 3, label: "بلندمدت" },
        { value: 4, label: "هیچکدام" }
      ]
    },
    { key: "isActive", label: "فعال", type: "boolean" },
    { key: "isDefault", label: "پیش‌فرض", type: "boolean" }
  ];
};

export function AccountingSettingList() {
  const { addTab } = useTabs();
  const { t } = useLanguage();
  const { showToast } = useToast();

  const [data, setData] = useState<any[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [params, setParams] = useState<DataGridParams | null>(null);

  const fetchData = async (currentParams: DataGridParams) => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('pageIndex', currentParams.pageIndex.toString());
      queryParams.append('pageSize', currentParams.pageSize.toString());
      
      if (currentParams.sorting?.length) {
        queryParams.append('sorting', JSON.stringify(currentParams.sorting));
      }
      if (currentParams.columnFilters?.length) {
        queryParams.append('columnFilters', JSON.stringify(currentParams.columnFilters));
      }
      if (currentParams.advancedFilters?.length) {
        queryParams.append('advancedFilters', JSON.stringify(currentParams.advancedFilters));
      }
      if (currentParams.globalFilter) {
        queryParams.append('globalFilter', currentParams.globalFilter);
      }

      const res = await apiFetch(`/api/rap/accounting-setting?${queryParams.toString()}`);
      if (res.ok) {
        const json = await res.json();
        const responseData = json.data || json;
        setData(responseData.items || (Array.isArray(responseData) ? responseData : []));
        setTotalItems(responseData.total || (Array.isArray(responseData) ? responseData.length : 0));
      } else {
        showToast("خطا در دریافت اطلاعات عملیات حسابداری", "error");
      }
    } catch (err) {
      console.error('Fetch error:', err);
      showToast("عدم ارتباط با سرور", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleParamsChange = (newParams: DataGridParams) => {
    setParams(newParams);
    fetchData(newParams);
  };

  useEffect(() => {
    const unsubscribe = eventBus.on(EVENTS.DATA_CHANGED, (payload) => {
      if (payload?.entity === 'RecieptAndPaymentAccountingSetting') {
        if (params) fetchData(params);
      }
    });
    return () => unsubscribe();
  }, [params]);

  const handleEdit = (row: any) => {
    addTab(
      `ویرایش عملیات حسابداری ${row.title || ''}`,
      'rap',
      <Settings className="w-4 h-4" />,
      "RecieptAndPaymentAccountingSetting",
      { id: row.recieptAndPaymentAccountingSettingId }
    );
  };

  const handleNew = () => {
    addTab(
      'عملیات حسابداری جدید',
      'rap',
      <Settings className="w-4 h-4" />,
      "RecieptAndPaymentAccountingSetting"
    );
  };

  const handleDelete = async (item: any) => {
    try {
      const res = await apiFetch(`/api/rap/accounting-setting/${item.recieptAndPaymentAccountingSettingId || item.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        showToast("با موفقیت حذف شد", "success");
        eventBus.emit(EVENTS.DATA_CHANGED, { entity: 'RecieptAndPaymentAccountingSetting' });
        if (params) fetchData(params);
      } else {
        const errorData = await res.json().catch(() => ({}));
        showToast(errorData.message || "خطا در حذف", "error");
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "خطا در حذف", "error");
    }
  };

  const columns = useAccountingSettingColumns();

  return (
    <div className="h-full bg-white dark:bg-gray-900 overflow-hidden flex flex-col">
      <MainDataGrid
        entityName="RecieptAndPaymentAccountingSetting"
        data={data}
        columns={columns as any}
        title={`عملیات حسابداری (${totalItems})`}
        icon={<Settings className="w-5 h-5 text-gray-500" />}
        isLoading={isLoading}
        onRefresh={() => params && fetchData(params)}
        onEdit={handleEdit}
        onAdd={handleNew}
        onDelete={handleDelete}
        serverSide={true}
        totalItems={totalItems}
        onParamsChange={handleParamsChange}
      />
    </div>
  );
}

export default AccountingSettingList;
