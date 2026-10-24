"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { MainDataGrid, DataGridParams } from '../../ui/MainDataGrid';
import { useTabs } from '../../TabsProvider';
import { useLanguage } from '../../Providers';
import { useToast } from '../../ToastProvider';
import { FileText, Plus, List } from 'lucide-react';
import { apiFetch } from '@/lib/utils';
import { eventBus, EVENTS } from '@/lib/events';

export const usePromissoryNoteColumns = () => {
  return [
    { key: "promissoryNoteId", label: "کد" },
    { key: "cash.name", label: "صندوق" },
    { key: "series", label: "سری" },
    { key: "leafCount", label: "تعداد برگ" },
    { key: "startSerial", label: "سریال شروع" },
    { key: "valueEach", label: "مبلغ هر برگ" },
  ];
};

export function PromissoryNoteList() {
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

      const res = await apiFetch(`/api/rap/promissory-notes?${queryParams.toString()}`);
      if (res.ok) {
        const json = await res.json();
        const responseData = json.data || json;
        setData(responseData.data || responseData.items || (Array.isArray(responseData) ? responseData : []));
        setTotalItems(responseData.total || (Array.isArray(responseData) ? responseData.length : 0));
      } else {
        showToast("خطا در دریافت اطلاعات سفته‌ها", "error");
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
    // Only register listener, rely on direct fetches for actions within this component or let MainDataGrid handle it
    const unsubscribe = eventBus.on(EVENTS.DATA_CHANGED, (payload) => {
      if (payload?.entity === 'PromissoryNote') {
        if (params) fetchData(params);
      }
    });
    return () => unsubscribe();
  }, [params]);

  const handleEdit = (row: any) => {
    addTab(
      `ویرایش سفته ${row.series || ''}`,
      'rap',
      <FileText className="w-4 h-4" />,
      "PromissoryNoteForm",
      { id: row.promissoryNoteId }
    );
  };

  const handleNew = () => {
    addTab(
      'سفته جدید',
      'rap',
      <FileText className="w-4 h-4" />,
      "PromissoryNoteForm"
    );
  };

  const handleDelete = async (item: any) => {
    try {
      const res = await apiFetch(`/api/rap/promissory-notes/${item.promissoryNoteId || item.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        showToast("با موفقیت حذف شد", "success");
        eventBus.emit(EVENTS.DATA_CHANGED, { entity: 'PromissoryNote' });
        // Removed fetchData(params) as eventBus listener will handle it
      } else {
        const errorData = await res.json().catch(() => ({}));
        showToast(errorData.message || "خطا در حذف", "error");
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "خطا در حذف", "error");
    }
  };

  const columns = usePromissoryNoteColumns();

  return (
    <div className="h-full bg-white dark:bg-gray-900 overflow-hidden flex flex-col">
      <MainDataGrid
        entityName="PromissoryNote"
        data={data}
        columns={columns as any}
        title={`سفته‌ها (${totalItems})`}
        icon={<FileText className="w-5 h-5 text-gray-500" />}
        isLoading={isLoading}
        // Disabled onRefresh as DATA_CHANGED is manually handled within the page
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

export default PromissoryNoteList;
