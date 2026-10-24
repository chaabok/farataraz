"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { MainDataGrid, DataGridParams } from '../../ui/MainDataGrid';
import { useTabs } from '../../TabsProvider';
import { useLanguage } from '../../Providers';
import { useToast } from '../../ToastProvider';
import { RefreshCw } from 'lucide-react';
import { apiFetch } from '@/lib/utils';
import { eventBus, EVENTS } from '@/lib/events';
import moment from 'moment-jalaali';

export const useBankStatementColumns = () => {
  return [
    { key: "ReconcileBankStatementID", label: "کد" },
    { key: "Number", label: "شماره" },
    { key: "Date", label: "تاریخ" },
    { key: "bankAccount.accountNumber", label: "حساب بانکی" },
    { key: "previousBalance", label: "موجودی قبلی" },
  ];
};

export function BankStatementList() {
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

      const res = await apiFetch(`/api/rap/reconcile-bank-statements?${queryParams.toString()}`);
      if (res.ok) {
        const json = await res.json();
        const responseData = json.data || json;
        setData(responseData.items || (Array.isArray(responseData) ? responseData : []));
        setTotalItems(responseData.total || (Array.isArray(responseData) ? responseData.length : 0));
      } else {
        showToast("خطا در دریافت اطلاعات صورتحساب‌ها", "error");
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
      if (payload?.entity === 'ReconcileBankStatement') {
        if (params) fetchData(params);
      }
    });
    return () => unsubscribe();
  }, [params]);

  const handleEdit = (row: any) => {
    addTab(
      `ویرایش صورتحساب ${row.Number || ''}`,
      'rap',
      <RefreshCw className="w-4 h-4" />,
      "BankStatementForm",
      { id: row.ReconcileBankStatementID || row.id }
    );
  };

  const handleNew = () => {
    addTab(
      'صورت حساب بانکی جدید',
      'rap',
      <RefreshCw className="w-4 h-4" />,
      "BankStatementForm"
    );
  };

  const handleDelete = async (item: any) => {
    try {
      const res = await apiFetch(`/api/rap/reconcile-bank-statements/${item.ReconcileBankStatementID || item.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        showToast(t('delete_success' as any) || "با موفقیت حذف شد", "success");
        eventBus.emit(EVENTS.DATA_CHANGED, { entity: 'ReconcileBankStatement' });
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

  const columns = useBankStatementColumns();

  return (
    <div className="h-full bg-white dark:bg-gray-900 overflow-hidden flex flex-col">
      <MainDataGrid
        entityName="ReconcileBankStatement"
        data={data}
        columns={columns as any}
        title={`صورت‌حساب‌های بانکی (${totalItems})`}
        icon={<RefreshCw className="w-5 h-5 text-gray-500" />}
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

export default BankStatementList;
