'use client';
import { apiFetch } from '@/lib/utils';
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { clsx } from 'clsx';
import { List, Plus } from 'lucide-react';
import { MainDataGrid, DataGridColumn, DataGridParams } from '../../ui/MainDataGrid';
import { eventBus, EVENTS } from '@/lib/events';
import { useOptionalTabs } from '@/components/TabsProvider';
import { useLanguage } from '@/components/Providers';
import { useToast } from '@/components/ToastProvider';

type DetailedType = {
  detailedTypesId: number;
  code: string;
  title: string;
  title_en: string;
  isActive: boolean;
};

export function DetailedTypeList() {
  const { showToast } = useToast();
  const [data, setData] = useState<DetailedType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [params, setParams] = useState<DataGridParams | null>(null);

  const tabsCtx = useOptionalTabs();
  const addTab = tabsCtx?.addTab;
  const { t } = useLanguage();
  const paramsRef = useRef<DataGridParams | null>(null);

  useEffect(() => {
    paramsRef.current = params;
  }, [params]);

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

      const res = await apiFetch(`/api/accounting/detailed-types?${queryParams.toString()}`);
      if (res.ok) {
        const json = await res.json();
        const responseData = json.data || json;
        setData(responseData.items || (Array.isArray(responseData) ? responseData : []));
        setTotalItems(responseData.total || (Array.isArray(responseData) ? responseData.length : 0));
      } else {
        showToast((t as any)('fetch_error_detailed_type') || "خطا در دریافت اطلاعات", "error");
      }
    } catch (err) {
      console.error('Fetch error:', err);
      showToast((t as any)('server_connection_error') || "عدم ارتباط با سرور", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = eventBus.on(EVENTS.DATA_CHANGED, (payload) => {
      if (payload?.entity === 'DetailedType') {
        if (paramsRef.current) {
          fetchData(paramsRef.current);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleParamsChange = (newParams: DataGridParams) => {
    setParams(newParams);
    fetchData(newParams);
  };

  const columns: DataGridColumn[] = useMemo(() => [
    { key: 'code', header: (t as any)('code') || 'کد', width: 100 },
    { key: 'title', header: (t as any)('title') || 'عنوان', width: 250 },
    { key: 'title_en', header: (t as any)('title_en') || 'عنوان لاتین', width: 250 },
    {
      key: 'isActive',
      header: (t as any)('status') || 'وضعیت',
      width: 120,
      cell: (info: any) => {
        const isActive = info.getValue() as boolean;
        return (
          <span className={clsx(
            "px-2 py-1 rounded-full text-xs font-medium inline-block",
            isActive ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
          )}>
            {isActive ? ((t as any)('active') || 'فعال') : ((t as any)('inactive') || 'غیرفعال')}
          </span>
        );
      }
    }
  ], [t]);

  const handleAdd = () => {
    if (addTab) {
      addTab(
        (t as any)('detailed_type_new') || 'نوع تفصیلی جدید',
        'financial',
        <Plus className="h-[14px] w-[14px]" />,
        'DetailedType'
      );
    }
  };

  const handleEdit = (item: any) => {
    if (addTab) {
      addTab(
        `${(t as any)('detailed_type_edit') || 'ویرایش نوع تفصیلی'} - ${item.title}`,
        'financial',
        <List className="h-[14px] w-[14px]" />,
        'DetailedType',
        { initialData: item }
      );
    }
  };

  const handleDelete = async (item: any) => {
    if (item.detailedTypesId >= 1 && item.detailedTypesId <= 18) {
      showToast("انواع تفصیلی سیستمی قابل حذف نیستند", "warning"); // We can translate this later if needed, but leaving for now.
      return;
    }

    try {
      const res = await apiFetch(`/api/accounting/detailed-types/${item.detailedTypesId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        showToast((t as any)('delete_success') || "با موفقیت حذف شد", "success");
        if (params) fetchData(params);
      } else {
        const error = await res.json().catch(() => ({}));
        showToast(error.message || ((t as any)('delete_error') || "خطا در حذف"), "error");
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.message || ((t as any)('delete_error') || "خطا در حذف"), "error");
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-gray-900 rounded-lg">
      <MainDataGrid
        entityName="DetailedType" 
        columns={columns}
        data={data}
        title={`${(t as any)('detailed_type_list') || 'فهرست انواع تفصیلی'} (${(t as any)('record_count') || 'رکوردها:'} ${data.length})`}
        icon={<List className="h-4 w-4" />}
        isLoading={isLoading}
        onRefresh={() => params && fetchData(params)}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        serverSide={true}
        totalItems={totalItems}
        onParamsChange={handleParamsChange}
      />
    </div>
  );
}
