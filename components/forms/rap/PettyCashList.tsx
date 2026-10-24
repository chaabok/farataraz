'use client';
import React, { useMemo, useState, useEffect } from 'react';
import { MainDataGrid, DataGridParams } from '@/components/ui/MainDataGrid';
import { useTabs } from '@/components/TabsProvider';
import { useLanguage } from '@/components/Providers';
import { useToast } from '@/components/ToastProvider';
import { Wallet } from 'lucide-react';
import { apiFetch } from '@/lib/utils';
import { eventBus, EVENTS } from '@/lib/events';

export default function PettyCashList() {
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

      const res = await apiFetch(`/api/rap/petty-cashes?${queryParams.toString()}`);
      if (res.ok) {
        const json = await res.json();
        const responseData = json.data || json;
        setData(responseData.items || (Array.isArray(responseData) ? responseData : []));
        setTotalItems(responseData.total || (Array.isArray(responseData) ? responseData.length : 0));
      } else {
        showToast(t('error_fetching_petty_cashes' as any) || "خطا در دریافت اطلاعات تنخواه گردان‌ها", "error");
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
      if (payload?.entity === 'PettyCash') {
        if (params) fetchData(params);
      }
    });
    return () => unsubscribe();
  }, [params]);

  const handleEdit = (row: any) => {
    addTab(
      `${t('edit_petty_cash' as any) || 'ویرایش تنخواه'} ${row.title || ''}`,
      'rap',
      <Wallet className="w-4 h-4" />,
      "PettyCashForm",
      { id: row.pettyCashId }
    );
  };

  const handleNew = () => {
    addTab(
      t('new_petty_cash' as any) || 'تنخواه گردان جدید',
      'rap',
      <Wallet className="w-4 h-4" />,
      "PettyCashForm"
    );
  };

  const handleDelete = async (item: any) => {
    try {
      const res = await apiFetch(`/api/rap/petty-cashes/${item.pettyCashId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        showToast(t('delete_success' as any) || "با موفقیت حذف شد", "success");
        eventBus.emit(EVENTS.DATA_CHANGED, { entity: 'PettyCash' });
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
    { key: 'pettyCashId', header: 'کد', width: 80, type: 'number' },
    { key: 'title', header: 'نام تنخواه', width: 200 },
    { key: 'party.lastName', header: 'نام و نام خانوادگی تنخواه گردان', width: 250, cell: (info: any) => {
      const party = info.row.original.party;
      return party ? `${party.firstName || ''} ${party.lastName || ''}`.trim() : '';
    } },
    { key: 'currency', header: 'نوع ارز', width: 120, cell: (info: any) => info.row.original.currency?.title || '' },
    { key: 'currentBalance', header: 'مانده فعلی', width: 150, type: 'number', cell: (info: any) => info.getValue()?.toLocaleString() || '0' },
    { key: 'openingDate', header: 'تاریخ افتتاح', width: 120 },
    { key: 'pettyCashLimit', header: 'سقف تنخواه', width: 150, type: 'number', cell: (info: any) => info.getValue()?.toLocaleString() || '0' },
    { key: 'isPettyCashLimitControlled', header: 'کنترل سقف', width: 100, type: 'boolean' },
    { key: 'isActive', header: 'وضعیت', width: 100, type: 'boolean' },
  ], [t]);

  return (
    <div className="h-full bg-white dark:bg-gray-900 overflow-hidden flex flex-col">
      <MainDataGrid
        entityName="PettyCash"
        data={data}
        columns={columns as any}
        title={`تنخواه گردان (${totalItems})`}
        icon={<Wallet className="w-5 h-5 text-gray-500" />}
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
