'use client';
import { apiFetch } from '@/lib/utils';
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { clsx } from 'clsx';
import { Building2 } from 'lucide-react';
import { MainDataGrid, DataGridColumn, DataGridParams } from '../../ui/MainDataGrid';
import { eventBus, EVENTS } from '@/lib/events';
import { useOptionalTabs } from '@/components/TabsProvider';
import { useLanguage } from '@/components/Providers';
import { useToast } from '@/components/ToastProvider';

export const useCostCenterColumns = () => {
  return [
    { key: "costCenterId", label: "کد" },
    { key: "code", label: "کد مرکز هزینه" },
    { key: "title", label: "عنوان" },
  ];
};

type CostCenter = {
  costCenterId: number;
  code: string;
  title: string;
  costCenterType: number;
  detailedAccount: { code: string; title: string } | null;
  isActive: boolean;
};

interface CostCenterListProps {
  onSelectItem?: (item: any) => void;
}

export function CostCenterList({ onSelectItem }: CostCenterListProps) {
  const { showToast } = useToast();
  const [data, setData] = useState<CostCenter[]>([]);
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

      const res = await apiFetch(`/api/accounting/cost-center/advanced?${queryParams.toString()}`);
      if (res.ok) {
        const json = await res.json();
        const responseData = json.data || json;
        setData(responseData.items || (Array.isArray(responseData) ? responseData : []));
        setTotalItems(responseData.total || (Array.isArray(responseData) ? responseData.length : 0));
      } else {
        showToast((t as any)('fetch_error') || "خطا در دریافت اطلاعات", "error");
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
      if (payload?.entity === 'CostCenter') {
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

  const getTypeName = (type: number) => {
    switch(type) {
      case 1: return (t as any)('admin_and_org') || 'اداری و تشکیلاتی';
      case 2: return (t as any)('commercial') || 'بازرگانی';
      case 3: return (t as any)('production') || 'تولیدی';
      case 4: return (t as any)('services') || 'خدماتی';
      case 5: return (t as any)('general') || 'عمومی';
      default: return (t as any)('unknown') || 'نامشخص';
    }
  };

  const columns = useCostCenterColumns();

  const handleAdd = () => {
    if (addTab) {
      addTab(
        (t as any)('cost_center_new') || 'تعریف مرکز هزینه',
        'financial',
        <Building2 className="h-[14px] w-[14px]" />,
        'CostCenter'
      );
    }
  };

  const handleEdit = (item: any) => {
    if (addTab) {
      addTab(
        `${(t as any)('cost_center_edit') || 'ویرایش مرکز هزینه'} - ${item.title}`,
        'financial',
        <Building2 className="h-[14px] w-[14px]" />,
        'CostCenter',
        { id: item.costCenterId }
      );
    }
  };

  const handleDelete = async (item: any) => {
    try {
      const res = await apiFetch(`/api/accounting/cost-center/${item.costCenterId}`, {
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

  const handleDeleteRows = async (items: any[]) => {
    try {
      const res = await apiFetch(`/api/accounting/cost-center/bulk-delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: items.map(i => i.costCenterId) }),
      });
      if (res.ok) {
        showToast((t as any)('delete_success') || "موارد با موفقیت حذف شدند", "success");
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
        entityName="CostCenter" 
        columns={columns}
        data={data}
        title={`${(t as any)('cost_center_list') || 'فهرست مراکز هزینه'} (${(t as any)('record_count') || 'رکوردها:'} ${data.length})`}
        icon={<Building2 className="h-4 w-4" />}
        isLoading={isLoading}
        onRefresh={() => params && fetchData(params)}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onDeleteRows={handleDeleteRows}
        serverSide={true}
        totalItems={totalItems}
        onParamsChange={handleParamsChange}
        onRowDoubleClick={(item) => {
          if (onSelectItem) {
            onSelectItem(item);
          } else {
            handleEdit(item);
          }
        }}
      />
    </div>
  );
}
