"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { MainDataGrid, DataGridParams } from '../../ui/MainDataGrid';
import { useTabs } from '../../TabsProvider';
import { useLanguage } from '../../Providers';
import { useToast } from '../../ToastProvider';
import { Coins, CircleDollarSign, Plus, List } from 'lucide-react';
import { apiFetch } from '@/lib/utils';
import { CashForm } from './Cash';
import { eventBus, EVENTS } from '@/lib/events';

export function CashList() {
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

      const res = await apiFetch(`/api/rap/cashes?${queryParams.toString()}`);
      if (res.ok) {
        const json = await res.json();
        const responseData = json.data || json;
        setData(responseData.items || (Array.isArray(responseData) ? responseData : []));
        setTotalItems(responseData.total || (Array.isArray(responseData) ? responseData.length : 0));
      } else {
        showToast(t('error_fetching_cashes' as any) || "خطا در دریافت اطلاعات صندوق‌ها", "error");
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
      if (payload?.entity === 'Cash') {
        if (params) fetchData(params);
      }
    });
    return () => unsubscribe();
  }, [params]);

  const handleEdit = (row: any) => {
    addTab(
      `${t('edit_cash' as any) || 'ویرایش صندوق'} ${row.title || ''}`,
      'rap',
      <CircleDollarSign className="w-4 h-4" />,
      "CashForm",
      { id: row.cashId }
    );
  };

  const handleNew = () => {
    addTab(
      t('new_cash' as any) || 'صندوق جدید',
      'rap',
      <CircleDollarSign className="w-4 h-4" />,
      "CashForm"
    );
  };

  const handleDelete = async (item: any) => {
    try {
      const res = await apiFetch(`/api/rap/cashes/${item.cashId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        showToast(t('delete_success' as any) || "با موفقیت حذف شد", "success");
        eventBus.emit(EVENTS.DATA_CHANGED, { entity: 'Cash' });
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
    { key: 'code', header: t('code' as any) || 'کد', width: 80 },
    { key: 'title', header: t('title' as any) || 'عنوان', width: 200 },
    { key: 'detailedAccountCode', header: t('detailed_account_code' as any) || 'کد تفصیلی', width: 120,
      cell: (info: any) => info.row.original.detailedAccount?.code || ''
    },
    { key: 'title_en', header: t('title_en' as any) || 'عنوان لاتین', width: 150 },
    { key: 'cashTypeId', header: t('type' as any) || 'نوع', width: 100, 
      cell: (info: any) => info.row.original.cashTypeId === 1 ? (t('central' as any) || 'مرکزی') : (t('store' as any) || 'فروشگاه')
    },
    { key: 'currency', header: t('currency_type' as any) || 'نوع ارز', width: 120, 
      cell: (info: any) => info.row.original.currency?.title || '' 
    },
    { key: 'initialBalance', header: t('initial_balance' as any) || 'موجودی اولیه', width: 150, type: 'number' },
    { key: 'isActive', header: t('status' as any) || 'فعال', width: 80, type: 'boolean' }
  ], [t]);

  return (
    <div className="h-full bg-white dark:bg-gray-900 overflow-hidden flex flex-col">
      <MainDataGrid
        entityName="Cash"
        data={data}
        columns={columns as any}
        title={`صندوق‌ها (${totalItems})`}
        icon={<CircleDollarSign className="w-5 h-5 text-gray-500" />}
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

export default CashList;
