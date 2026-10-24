'use client';
import { apiFetch, gregorianToJalaliDisplay } from '@/lib/utils';
import { useToast } from '@/components/ToastProvider';
import React, { useState, useMemo, useEffect } from 'react';
import { clsx } from 'clsx';
import { Calendar } from 'lucide-react';
import { MainDataGrid, DataGridColumn, DataGridParams } from '../../ui/MainDataGrid';
import { useOptionalTabs } from '@/components/TabsProvider';
import { useLanguage } from '@/components/Providers';
import { eventBus, EVENTS } from '@/lib/events';

import momentJalaali from 'moment-jalaali';
import momentHijri from 'moment-hijri';
import moment from 'moment';

type FiscalYearType = {
  fiscalYearID: number;
  title: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
};

export function FiscalYearList() {
  const [data, setData] = useState<FiscalYearType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [params, setParams] = useState<DataGridParams | null>(null);

  const tabsCtx = useOptionalTabs();
  const addTab = tabsCtx?.addTab;
  const { language, t } = useLanguage();
  const { showToast } = useToast();

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

      const res = await apiFetch(`/api/common/fiscalyear?${queryParams.toString()}`);
      if (res.ok) {
        const json = await res.json();
        const responseData = json.data || json;
        setData(responseData.items || (Array.isArray(responseData) ? responseData : []));
        setTotalItems(responseData.total || (Array.isArray(responseData) ? responseData.length : 0));
      }
    } catch (err) {
      console.error('Fetch error in FiscalYearList:', err);
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
      if (payload?.entity === 'FiscalYear') {
        if (params) fetchData(params);
      }
    });
    return () => unsubscribe();
  }, [params]);

  const formatISOToDateStr = (isoStr: string) => {
    if (!isoStr) return '';
    try {
      const cleanIso = isoStr.includes('T') ? isoStr.split('T')[0] : isoStr;
      if (language === 'fa') {
        return gregorianToJalaliDisplay(cleanIso);
      } else if (language === 'ar') {
        return momentHijri.utc(cleanIso, 'YYYY-MM-DD').format('iYYYY/iMM/iDD');
      } else {
        return moment.utc(cleanIso, 'YYYY-MM-DD').format('YYYY-MM-DD');
      }
    } catch {
      return isoStr.split('T')[0].replace(/-/g, '/');
    }
  };

  const columns: DataGridColumn[] = useMemo(() => [
    { key: 'title', header: 'عنوان', width: 250 },
    { 
      key: 'startDate', 
      header: 'تاریخ شروع', 
      width: 150,
      cell: (info: any) => formatISOToDateStr(info.getValue())
    },
    { 
      key: 'endDate', 
      header: 'تاریخ پایان', 
      width: 150,
      cell: (info: any) => formatISOToDateStr(info.getValue())
    },
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
  ], [language]);

  const handleAdd = () => {
    if (addTab) {
      addTab(
        'سال مالی جدید',
        'general',
        <Calendar className="h-[14px] w-[14px]" />,
        'NewFiscalYear'
      );
    }
  };

  const handleEdit = (item: any) => {
    if (addTab) {
      addTab(
        `ویرایش سال مالی - ${item.title}`,
        'general',
        <Calendar className="h-[14px] w-[14px]" />,
        'NewFiscalYear',
        { id: item.fiscalYearID, initialData: item }
      );
    }
  };

  const handleEditRows = (items: any[]) => {
    items.forEach(item => handleEdit(item));
  };

  const handleDelete = async (item: any) => {
    try {
      const res = await apiFetch(`/api/common/fiscalyear/${item.fiscalYearID}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        showToast((t as any)('delete_success') || "با موفقیت حذف شد", "success");
        eventBus.emit(EVENTS.DATA_CHANGED, { entity: 'FiscalYear' });
        if (params) fetchData(params);
      } else {
        const errorData = await res.json().catch(() => ({}));
        showToast(errorData.message || ((t as any)('delete_error') || "خطا در حذف"), "error");
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.message || ((t as any)('delete_error') || "خطا در حذف"), "error");
    }
  };

  const handleDeleteRows = async (items: any[]) => {
    try {
      let successCount = 0;
      let lastError = '';
      
      for (const item of items) {
        const res = await apiFetch(`/api/common/fiscalyear/${item.fiscalYearID}`, { method: 'DELETE' });
        if (res.ok) {
          successCount++;
        } else {
          const errorData = await res.json().catch(() => ({}));
          lastError = errorData.message;
        }
      }

      if (successCount === items.length) {
        showToast((t as any)('delete_success') || "موارد با موفقیت حذف شدند", "success");
      } else if (successCount > 0) {
        showToast(`تنها ${successCount} مورد حذف شد. ${lastError}`, "warning");
      } else {
        showToast(lastError || "خطا در حذف موارد", "error");
      }

      eventBus.emit(EVENTS.DATA_CHANGED, { entity: 'FiscalYear' });
      if (params) fetchData(params);
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "خطا در ارتباط با سرور", "error");
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-gray-900 rounded-lg">
      <MainDataGrid
        entityName="FiscalYear" 
        columns={columns}
        data={data}
        title="دوره های مالی"
        icon={<Calendar className="h-4 w-4" />}
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
