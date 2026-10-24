"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { MainDataGrid, DataGridParams } from '../../ui/MainDataGrid';
import { useTabs } from '../../TabsProvider';
import { useToast } from '../../ToastProvider';
import { Banknote, List } from 'lucide-react';
import { apiFetch, gregorianToJalaliDisplay } from '@/lib/utils';
import { eventBus, EVENTS } from '@/lib/events';
import momentJalaali from 'moment-jalaali';

export function BankAccountList() {
  const { addTab } = useTabs();
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

      const res = await apiFetch(`/api/rap/bank-accounts?${queryParams.toString()}`);
      if (res.ok) {
        const json = await res.json();
        const responseData = json.data || json;
        setData(responseData.items || (Array.isArray(responseData) ? responseData : []));
        setTotalItems(responseData.total || (Array.isArray(responseData) ? responseData.length : 0));
      } else {
        showToast("خطا در دریافت اطلاعات", "error");
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
      if (payload?.entity === 'BankAccount') {
        if (params) fetchData(params);
      }
    });
    return () => unsubscribe();
  }, [params]);

  const handleEdit = (row: any) => {
    addTab(
      `ویرایش حساب ${row.title || ''}`,
      'rap',
      <Banknote className="w-4 h-4" />,
      "BankAccountForm",
      { entityId: row.bankAccountId }
    );
  };

  const handleNew = () => {
    addTab(
      'حساب بانکی جدید',
      'rap',
      <Banknote className="w-4 h-4" />,
      "BankAccountForm"
    );
  };

  const handleDelete = async (item: any) => {
    try {
      const res = await apiFetch(`/api/rap/bank-accounts/${item.bankAccountId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        showToast("با موفقیت حذف شد", "success");
        eventBus.emit(EVENTS.DATA_CHANGED, { entity: 'BankAccount' });
        if (params) fetchData(params);
      } else {
        const errorData = await res.json().catch(() => ({}));
        showToast(errorData.message || "خطا در حذف ریکورد", "error");
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "خطا در ارتباط با سرور", "error");
    }
  };

  const columns = useMemo(() => [
    { key: 'bankAccountId', header: 'کد حساب', width: 80 },
    { key: 'bankBranch.title', header: 'شعبه', width: 150, cell: (info: any) => info.row.original.bankBranch?.title || '' },
    { key: 'bankAccountType.title', header: 'نوع', width: 100, cell: (info: any) => info.row.original.bankAccountType?.title || '' },
    { key: 'accountNumber', header: 'شماره حساب', width: 150 },
    { key: 'title', header: 'عنوان حساب', width: 200 },
    { key: 'shabaNumber', header: 'شماره شبا', width: 250 },
    { key: 'currency.title', header: 'ارز', width: 100, cell: (info: any) => info.row.original.currency?.title || '' },
    { key: 'account.code', header: 'کد معین', width: 100, cell: (info: any) => info.row.original.account?.code || '' },
    { key: 'account.title', header: 'عنوان معین', width: 200, cell: (info: any) => info.row.original.account?.title || '' },
    { key: 'openingDate', header: 'تاریخ افتتاح', width: 120, cell: (info: any) => info.row.original.openingDate ? gregorianToJalaliDisplay(info.row.original.openingDate) : '' },
    { key: 'initialBalance', header: 'موجودی اولیه', width: 120, type: 'number' },
    { key: 'detailedCode', header: 'کد تفصیلی', width: 100 },
    { key: 'isActive', header: 'وضعیت', width: 80, type: 'boolean' }
  ], []);

  return (
    <div className="h-full bg-white dark:bg-gray-900 overflow-hidden flex flex-col">
      <MainDataGrid
        entityName="BankAccount"
        data={data}
        columns={columns as any}
        title={`حساب‌های بانکی (${totalItems})`}
        icon={<Banknote className="w-5 h-5 text-gray-500" />}
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

export default BankAccountList;
