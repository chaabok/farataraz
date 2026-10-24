'use client';
import { apiFetch } from '@/lib/utils';

import React, { useState, useMemo, useEffect } from 'react';
import { clsx } from 'clsx';
import { FileText } from 'lucide-react';
import { MainDataGrid, DataGridColumn, DataGridParams } from '../ui/MainDataGrid';
import { useOptionalTabs } from '@/components/TabsProvider';
import { useToast } from '@/components/ToastProvider';
import { eventBus, EVENTS } from '@/lib/events';

type DocumentType = {
  voucherTypeId: string | number;
  code: number | string;
  title: string;
  title_en: string;
  isActive: boolean;
};

export function DocumentTypes() {
  const { showToast } = useToast();
  const [data, setData] = useState<DocumentType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [params, setParams] = useState<DataGridParams | null>(null);

  const tabsCtx = useOptionalTabs();
  const addTab = tabsCtx?.addTab; // Fallback

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

      const res = await apiFetch(`/api/accounting/voucher-types?${queryParams.toString()}`);
      if (res.ok) {
        const json = await res.json();
        const responseData = json.data || json;
        setData(responseData.items || (Array.isArray(responseData) ? responseData : []));
        setTotalItems(responseData.total || (Array.isArray(responseData) ? responseData.length : 0));
      } else {
        showToast("خطا در دریافت اطلاعات انواع سند", "error");
      }
    } catch (err) {
      console.error('Fetch error in DocumentTypes:', err);
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
      if (payload?.entity === 'VoucherType') {
        if (params) fetchData(params);
      }
    });
    return () => unsubscribe();
  }, [params]);

  const columns: DataGridColumn[] = useMemo(() => [
    { key: 'code', header: 'کد سند', width: 120 },
    { key: 'title', header: 'عنوان', width: 250 },
    { key: 'title_en', header: 'عنوان لاتین', width: 250 },
    {
      key: 'isActive',
      header: 'وضعیت',
      width: 120,
      cell: (info: any) => {
        const isActive = info.getValue() as boolean;
        return (
          <span className={clsx(
            "px-2 py-1 rounded-full text-xs font-medium inline-block",
            isActive ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
          )}>
            {isActive ? 'فعال' : 'غیرفعال'}
          </span>
        );
      }
    }
  ], []);

  const handleAdd = () => {
    if (addTab) {
      addTab(
        'نوع سند جدید',
        'financial', // It should probably be 'financial' based on context in MainDataGrid UI colors
        <FileText className="h-[14px] w-[14px]" />,
        'NewDocumentType'
      );
    }
  };

  const handleEdit = (item: any) => {
    if (addTab) {
      addTab(
        `ویرایش نوع سند ${item.code}`,
        'financial',
        <FileText className="h-[14px] w-[14px]" />,
        'NewDocumentType',
        { id: item.voucherTypeId, initialData: item }
      );
    }
  };

  const handleEditRows = (items: any[]) => {
    items.forEach(item => {
      if (addTab) {
        addTab(
          `ویرایش نوع سند ${item.code}`,
          'financial',
          <FileText className="h-[14px] w-[14px]" />,
          'NewDocumentType',
          { id: item.voucherTypeId, initialData: item }
        );
      }
    });
  };

  const handleDelete = async (item: any) => {
    try {
      const res = await apiFetch(`/api/accounting/voucher-types/${item.voucherTypeId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        eventBus.emit(EVENTS.DATA_CHANGED, { entity: 'VoucherType' });
        if (params) fetchData(params);
      } else {
        console.error("Failed to delete voucher type");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteRows = async (items: any[]) => {
    try {
      const deletePromises = items.map(item => 
        apiFetch(`/api/accounting/voucher-types/${item.voucherTypeId}`, { method: 'DELETE' })
      );
      await Promise.all(deletePromises);
      eventBus.emit(EVENTS.DATA_CHANGED, { entity: 'VoucherType' });
      if (params) fetchData(params);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-gray-900 rounded-lg">
      <MainDataGrid 
        columns={columns}
        data={data}
        title={`فهرست انواع سند (رکوردها: ${data.length})`}
        icon={<FileText className="h-4 w-4" />}
        isLoading={isLoading}
        onRefresh={() => params && fetchData(params)}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onEditRows={handleEditRows}
        onDelete={handleDelete}
        onDeleteRows={handleDeleteRows}
        serverSide={true}
        totalItems={totalItems}
        onParamsChange={handleParamsChange}
      />
    </div>
  );
}
