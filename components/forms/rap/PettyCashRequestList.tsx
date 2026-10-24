'use client';
import React, { useMemo, useState, useEffect } from 'react';
import { MainDataGrid, DataGridParams } from '@/components/ui/MainDataGrid';
import { useTabs } from '@/components/TabsProvider';
import { useLanguage } from '@/components/Providers';
import { useToast } from '@/components/ToastProvider';
import { FileText } from 'lucide-react';
import { apiFetch } from '@/lib/utils';
import { eventBus, EVENTS } from '@/lib/events';
import moment from 'moment-jalaali';

export const usePettyCashRequestColumns = () => {
  const { t } = useLanguage();
  const basisMap: Record<number, string> = {
    1: 'بدون مبنا',
    2: 'صورتخلاصه تنخواه',
  };
  const statusMap: Record<number, string> = {
    0: 'تایید شده',
    1: 'رد شده',
    2: 'در حال بررسی'
  };
  return useMemo(() => [
    { key: 'pettyCashRequestId', header: 'کد', width: 80, type: 'number' },
    { key: 'requestNumber', header: 'شماره درخواست', width: 150 },
    { key: 'requestDate', header: 'تاریخ درخواست', width: 120, cell: (info: any) => {
      const val = info.getValue();
      if (!val) return '';
      if (typeof val === 'string' && val.length === 10 && val.includes('/')) {
        const parts = val.split('/');
        if (parts.length === 3 && parseInt(parts[0]) >= 1300 && parseInt(parts[0]) <= 1500) {
          return val;
        }
      }
      try {
        return moment(val).format('jYYYY/jMM/jDD');
      } catch (e) {
        return val;
      }
    }},
    { key: 'pettyCash.title', header: 'تنخواه گردان', width: 200, cell: (info: any) => {
      const pettyCash = info.row.original.pettyCash;
      return pettyCash ? pettyCash.title : '';
    } },
    { key: 'basis', header: 'مبنا', width: 150, cell: (info: any) => basisMap[info.getValue() as number] || '' },
    { key: 'pettyCashSummary.summaryNumber', header: 'شماره صورتخلاصه', width: 150, cell: (info: any) => {
      const summary = info.row.original.pettyCashSummary;
      return summary ? summary.number : '';
    } },
    { key: 'requestedAmount', header: 'مبلغ درخواستی', width: 150, type: 'number', cell: (info: any) => info.getValue()?.toLocaleString() || '0' },
    { key: 'status', header: 'وضعیت', width: 120, cell: (info: any) => statusMap[info.getValue() as number] || '' },
    { key: 'description', header: 'توضیحات', width: 250 },
  ], [t]);
};

export default function PettyCashRequestList() {
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

      const res = await apiFetch(`/api/rap/petty-cash-requests?${queryParams.toString()}`);
      if (res.ok) {
        const json = await res.json();
        const responseData = json.data || json;
        setData(responseData.items || (Array.isArray(responseData) ? responseData : []));
        setTotalItems(responseData.total || (Array.isArray(responseData) ? responseData.length : 0));
      } else {
        showToast(t('error_fetching_petty_cash_requests' as any) || "خطا در دریافت اطلاعات درخواست‌های تنخواه", "error");
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
      if (payload?.entity === 'PettyCashRequest') {
        if (params) fetchData(params);
      }
    });
    return () => unsubscribe();
  }, [params]);

  const handleEdit = (row: any) => {
    addTab(
      `${t('edit_petty_cash_request' as any) || 'ویرایش درخواست تنخواه'} ${row.requestNumber || ''}`,
      'rap',
      <FileText className="w-4 h-4" />,
      "PettyCashRequestForm",
      { id: row.pettyCashRequestId }
    );
  };

  const handleNew = () => {
    addTab(
      t('new_petty_cash_request' as any) || 'درخواست تنخواه جدید',
      'rap',
      <FileText className="w-4 h-4" />,
      "PettyCashRequestForm"
    );
  };

  const handleDelete = async (item: any) => {
    try {
      const res = await apiFetch(`/api/rap/petty-cash-requests/${item.pettyCashRequestId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        showToast(t('delete_success' as any) || "با موفقیت حذف شد", "success");
        eventBus.emit(EVENTS.DATA_CHANGED, { entity: 'PettyCashRequest' });
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

  const basisMap: Record<number, string> = {
    0: 'بدون مبنا',
    1: 'صورتخلاصه تنخواه'
  };

  const statusMap: Record<number, string> = {
    0: 'تایید شده',
    1: 'رد شده',
    2: 'در حال بررسی'
  };

  const columns = usePettyCashRequestColumns();

  return (
    <div className="h-full bg-white dark:bg-gray-900 overflow-hidden flex flex-col">
      <MainDataGrid
        entityName="PettyCashRequest"
        data={data}
        columns={columns as any}
        title={`درخواست های تنخواه (${totalItems})`}
        icon={<FileText className="w-5 h-5 text-gray-500" />}
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
