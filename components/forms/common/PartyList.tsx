'use client';
import { apiFetch } from '@/lib/utils';
import React, { useState, useMemo, useEffect } from 'react';
import { clsx } from 'clsx';
import { Users } from 'lucide-react';
import { MainDataGrid, DataGridColumn, DataGridParams } from '../../ui/MainDataGrid';
import { useOptionalTabs } from '@/components/TabsProvider';
import { useLanguage, useCompany } from '@/components/Providers';
import { useToast } from '@/components/ToastProvider';
import { eventBus, EVENTS } from '@/lib/events';

type PartyType = {
  partyId: number;
  nature: string;
  firstName: string;
  lastName: string;
  nationalCode: string;
  nationalId: string;
  isActive: boolean;
  economicCode?: string;
  detailedAccount?: { code: string };
};

export function PartyList() {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const { currentCompany, currentBranch, currentRep } = useCompany();
  const [data, setData] = useState<PartyType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [params, setParams] = useState<DataGridParams>({
    pageIndex: 0,
    pageSize: 15,
    sorting: [],
    columnFilters: [],
    globalFilter: '',
    advancedFilters: [],
  });

  const tabsCtx = useOptionalTabs();
  const addTab = tabsCtx?.addTab;

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

      const res = await apiFetch(`/api/common/parties?${queryParams.toString()}`);
      if (res.ok) {
        const json = await res.json();
        const responseData = json.data || json;
        setData(responseData.items || (Array.isArray(responseData) ? responseData : []));
        setTotalItems(responseData.total || (Array.isArray(responseData) ? responseData.length : 0));
      }
    } catch (err) {
      console.error('Fetch error in PartyList:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleParamsChange = (newParams: DataGridParams) => {
    setParams(newParams);
  };

  // Watch parameters and company context to automatically fetch data
  useEffect(() => {
    fetchData(params);
  }, [
    params.pageIndex,
    params.pageSize,
    params.sorting,
    params.columnFilters,
    params.globalFilter,
    params.advancedFilters,
    currentCompany?.businessStructureId,
    currentBranch?.businessStructureId,
    currentRep?.businessStructureId
  ]);

  // Subscribe to changes in the Party entity
  useEffect(() => {
    const unsubscribe = eventBus.on(EVENTS.DATA_CHANGED, (payload) => {
      if (payload?.entity === 'Party') {
        fetchData(params);
      }
    });
    return () => unsubscribe();
  }, [params]);

  const columns: DataGridColumn[] = useMemo(() => [
    { 
      key: 'nature', 
      header: 'ماهیت', 
      width: 120,
      cell: (info: any) => {
        const nature = info.getValue();
        return nature === 'real_person' ? 'حقیقی' : 'حقوقی';
      }
    },
    { key: 'firstName', header: 'نام', width: 200 },
    { key: 'lastName', header: 'نام خانوادگی', width: 200 },
    { 
      key: 'nationalCodeOrId', 
      header: 'شناسه / کد ملی', 
      width: 150,
      cell: (info: any) => {
        const row = info.row.original;
        return row.nature === 'real_person' ? row.nationalCode : row.nationalId;
      }
    },
    { key: 'economicCode', header: 'کد اقتصادی', width: 150 },
    { 
      key: 'detailedAccountCode', 
      header: 'کد تفصیلی', 
      width: 150,
      cell: (info: any) => info.row.original.detailedAccount?.code || ''
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
  ], []);

  const handleAdd = () => {
    if (addTab) {
      addTab(
        'طرف حساب جدید',
        'persons',
        <Users className="h-[14px] w-[14px]" />,
        'Party'
      );
    }
  };

  const handleEdit = (item: any) => {
    if (addTab) {
      addTab(
        `ویرایش طرف حساب - ${item.firstName} ${item.lastName || ''}`.trim(),
        'persons',
        <Users className="h-[14px] w-[14px]" />,
        'Party',
        { id: item.partyId }
      );
    }
  };

  const handleEditRows = (items: any[]) => {
    items.forEach(item => handleEdit(item));
  };

  const handleDelete = async (item: any) => {
    try {
      const res = await apiFetch(`/api/common/parties/${item.partyId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        showToast((t as any)('delete_success') || "با موفقیت حذف شد", "success");
        eventBus.emit(EVENTS.DATA_CHANGED, { entity: 'Party' });
        if (params) fetchData(params);
      } else {
        const errorData = await res.json().catch(() => ({}));
        showToast(errorData.message || "خطا در حذف طرف حساب", "error");
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "خطا در ارتباط با سرور", "error");
    }
  };

  const handleDeleteRows = async (items: any[]) => {
    try {
      let successCount = 0;
      let lastError = '';
      
      for (const item of items) {
        const res = await apiFetch(`/api/common/parties/${item.partyId}`, { method: 'DELETE' });
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

      eventBus.emit(EVENTS.DATA_CHANGED, { entity: 'Party' });
      if (params) fetchData(params);
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "خطا در ارتباط با سرور", "error");
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-gray-900 rounded-lg">
      <MainDataGrid
        entityName="Party" 
        columns={columns}
        data={data}
        title="فهرست طرف حساب ها"
        icon={<Users className="h-4 w-4" />}
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
