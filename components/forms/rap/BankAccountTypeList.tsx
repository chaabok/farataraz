"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { MainDataGrid, DataGridParams } from '../../ui/MainDataGrid';
import { useTabs } from '../../TabsProvider';
import { useLanguage } from '../../Providers';
import { useToast } from '../../ToastProvider';
import { Landmark } from 'lucide-react';
import { apiFetch } from '@/lib/utils';
import { eventBus, EVENTS } from '@/lib/events';

export function BankAccountTypeList() {
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

      const res = await apiFetch(`/api/rap/bank-account-types?${queryParams.toString()}`);
      if (res.ok) {
        const json = await res.json();
        const responseData = json.data || json;
        setData(responseData.items || (Array.isArray(responseData) ? responseData : []));
        setTotalItems(responseData.total || (Array.isArray(responseData) ? responseData.length : 0));
      } else {
        showToast("خطا در دریافت اطلاعات انواع حساب بانکی", "error");
      }
    } catch (err) {
      console.error('Fetch error:', err);
      showToast(t('server_connection_error' as any) || "عدم ارتباط با سرور", "error");
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
      if (payload?.entity === 'BankAccountType') {
        if (params) fetchData(params);
      }
    });
    return () => unsubscribe();
  }, [params]);

  const handleEdit = (row: any) => {
    addTab(
      `ویرایش نوع حساب ${row.title || ''}`,
      'rap',
      <Landmark className="w-4 h-4" />,
      "BankAccountType",
      { id: row.bankAccountTypeId }
    );
  };

  const handleNew = () => {
    addTab(
      'تعریف نوع حساب باکی جدید',
      'rap',
      <Landmark className="w-4 h-4" />,
      "BankAccountType"
    );
  };

  const handleDelete = async (item: any) => {
    try {
      const res = await apiFetch(`/api/rap/bank-account-types/${item.bankAccountTypeId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        showToast(t('delete_success' as any) || "با موفقیت حذف شد", "success");
        eventBus.emit(EVENTS.DATA_CHANGED, { entity: 'BankAccountType' });
        if (params) fetchData(params);
      } else {
        const errorData = await res.json().catch(() => ({}));
        showToast(errorData.message || (t('delete_error' as any) || "خطا در حذف"), "error");
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.message || (t('delete_error' as any) || "خطا در حذف"), "error");
    }
  };

  const columns = useMemo(() => [
    { key: 'code', header: 'کد', width: 80 },
    { key: 'title', header: 'عنوان', width: 250 },
    { key: 'latinTitle', header: 'عنوان لاتین', width: 250 },
    { key: 'isActive', header: 'وضعیت', width: 100, type: 'boolean' },
  ], [t]);

  return (
    <div className="h-full bg-white dark:bg-gray-900 overflow-hidden flex flex-col">
      <MainDataGrid
        entityName="BankAccountType"
        data={data}
        columns={columns as any}
        title={`انواع حساب بانکی (${totalItems})`}
        icon={<Landmark className="w-5 h-5 text-gray-500" />}
        isLoading={isLoading}
        onRefresh={() => params && fetchData(params)}
        onEdit={handleEdit}
        onAdd={handleNew}
        onDelete={handleDelete}
        serverSide={true}
        totalItems={totalItems}
        onParamsChange={handleParamsChange}
        enableAdvancedSearch={true}
        enableColumnGrouping={true}
        enableExport={true}
      />
    </div>
  );
}

export default BankAccountTypeList;
