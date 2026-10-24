'use client';
import { apiFetch } from '@/lib/utils';
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { clsx } from 'clsx';
import { List, Plus } from 'lucide-react';
import { MainDataGrid, DataGridColumn, DataGridParams } from '../../ui/MainDataGrid';
import { DetailedTypeSelector } from './DetailedTypeSelector';
import { eventBus, EVENTS } from '@/lib/events';
import { useOptionalTabs } from '@/components/TabsProvider';
import { useLanguage } from '@/components/Providers';
import { useToast } from '@/components/ToastProvider';

type DetailedAccount = {
  detailedAccountId: number;
  code: string;
  title: string;
  title_en: string;
  detailedType: { title: string } | null;
  isActive: boolean;
};

export function DetailedAccountList() {
  const { showToast } = useToast();
  const [data, setData] = useState<DetailedAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [params, setParams] = useState<DataGridParams | null>(null);
  const [showTypeSelector, setShowTypeSelector] = useState(false);

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

      const res = await apiFetch(`/api/accounting/detailed-accounts?${queryParams.toString()}`);
      if (res.ok) {
        const json = await res.json();
        const responseData = json.data || json;
        setData(responseData.items || (Array.isArray(responseData) ? responseData : []));
        setTotalItems(responseData.total || (Array.isArray(responseData) ? responseData.length : 0));
      } else {
        showToast((t as any)('fetch_error_detailed_account') || "خطا در دریافت اطلاعات", "error");
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
      if (payload?.entity === 'DetailedAccount' || payload?.entity === 'Project') {
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
    { key: 'detailedType.title', header: (t as any)('detailed_type') || 'عطف تفصیلی', width: 250, cell: (info: any) => info.row.original.detailedType?.title || '-' },
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
    setShowTypeSelector(true);
  };

  const handleEdit = async (item: any) => {
    if (!addTab) return;

    let formComponent = 'DetailedAccountForm';
    let tabProps: any = { id: item.detailedAccountId };
    let tabTitle = `${(t as any)('detailed_account_edit') || 'ویرایش حساب تفصیلی'} - ${item.title}`;
    let tabGroup = 'financial';
    let typeCode = item.detailedType?.code;
    let typeTitle = item.detailedType?.title;
    let icon = <List className="h-[14px] w-[14px]" />;

    try {
      if (typeCode === '01' || typeTitle === 'صندوق') {
         const res = await apiFetch(`/api/rap/cashes?pageIndex=0&pageSize=100&globalFilter=${encodeURIComponent(item.title)}`);
         const data = await res.json();
         let items = Array.isArray(data) ? data : (data.items || data.data?.items || data.data || []);
         if (!Array.isArray(items)) items = [];
         
         let matched = items.find((c: any) => c.detailedAccountId === item.detailedAccountId || c.detailedAccount?.detailedAccountId === item.detailedAccountId || String(c.detailedAccountCode) === String(item.code));
         if (!matched) matched = items.find((c: any) => c.title === item.title);
         
         if (matched && matched.cashId) {
           formComponent = 'CashForm';
           tabProps = { id: matched.cashId };
           tabGroup = 'rap';
           tabTitle = `ویرایش صندوق ${matched.title}`;
         }
      } else if (typeCode === '02' || typeTitle?.includes('حساب بانکی') || typeTitle?.includes('بانک') || typeTitle === 'حساب های بانکی') {
         const res = await apiFetch(`/api/rap/bank-accounts?pageIndex=0&pageSize=100&globalFilter=${encodeURIComponent(item.title)}`);
         const data = await res.json();
         let items = Array.isArray(data) ? data : (data.items || data.data?.items || data.data || []);
         if (!Array.isArray(items)) items = [];
         
         let matched = items.find((c: any) => c.detailedAccountId === item.detailedAccountId || c.detailedAccount?.detailedAccountId === item.detailedAccountId || String(c.detailedAccountCode) === String(item.code));
         if (!matched) matched = items.find((c: any) => c.title === item.title);

         if (matched && matched.bankAccountId) {
           formComponent = 'BankAccountForm';
           tabProps = { id: matched.bankAccountId };
           tabGroup = 'rap';
           tabTitle = `ویرایش حساب بانکی ${matched.title}`;
         }
      } else if (['04', '05'].includes(typeCode) || typeTitle?.includes('حقیقی') || typeTitle?.includes('حقوقی') || typeTitle?.includes('اشخاص') || typeTitle?.includes('مشتریان') || typeTitle?.includes('تامین کنندگان')) {
         const res = await apiFetch(`/api/common/parties?pageIndex=0&pageSize=100&globalFilter=${encodeURIComponent(item.title)}`);
         const data = await res.json();
         let items = Array.isArray(data) ? data : (data.items || data.data?.items || data.data || []);
         if (!Array.isArray(items)) items = [];
         
         let matched = items.find((c: any) => c.detailedAccountId === item.detailedAccountId || c.detailedAccount?.detailedAccountId === item.detailedAccountId || String(c.detailedAccountId) === String(item.detailedAccountId) || String(c.detailedAccountCode) === String(item.code));
         if (!matched) matched = items.find((c: any) => c.title === item.title || (c.firstName + ' ' + c.lastName)?.includes(item.title));

         if (matched && matched.partyId) {
           formComponent = 'Party';
           tabProps = { id: matched.partyId };
           tabGroup = 'common';
           const pTitle = matched.title || [matched.firstName, matched.lastName].filter(Boolean).join(' ');
           tabTitle = `ویرایش طرف حساب ${pTitle}`;
         }
      } else if (typeTitle?.includes('پروژه')) {
         const res = await apiFetch(`/api/cnt/projects?pageIndex=0&pageSize=100&globalFilter=${encodeURIComponent(item.title)}`);
         const data = await res.json();
         let items = Array.isArray(data) ? data : (data.items || data.data?.items || data.data || []);
         if (!Array.isArray(items)) items = [];
         
         let matched = items.find((c: any) => c.detailedAccountId === item.detailedAccountId || c.detailedAccount?.detailedAccountId === item.detailedAccountId || String(c.detailedAccountCode) === String(item.code));
         if (!matched) matched = items.find((c: any) => c.title === item.title);

         if (matched && matched.projectId) {
           formComponent = 'ProjectForm';
           tabProps = { id: matched.projectId };
           tabGroup = 'cnt';
           tabTitle = `ویرایش پروژه ${matched.title}`;
         }
      }
    } catch (err) {
      console.error("Error resolving entity for detailed account:", err);
    }

    addTab(
      tabTitle,
      tabGroup,
      icon,
      formComponent,
      tabProps
    );
  };

  const handleDelete = async (item: any) => {
    try {
      const res = await apiFetch(`/api/accounting/detailed-accounts/${item.detailedAccountId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        showToast((t as any)('delete_success') || "با موفقیت حذف شد", "success");
        eventBus.emit(EVENTS.DATA_CHANGED, { entity: 'DetailedAccount' });
        eventBus.emit(EVENTS.DATA_CHANGED, { entity: 'Project' });
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
      const res = await apiFetch(`/api/accounting/detailed-accounts/bulk-delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: items.map(i => i.detailedAccountId) }),
      });
      if (res.ok) {
        showToast((t as any)('delete_success') || "موارد با موفقیت حذف شدند", "success");
        eventBus.emit(EVENTS.DATA_CHANGED, { entity: 'DetailedAccount' });
        eventBus.emit(EVENTS.DATA_CHANGED, { entity: 'Project' });
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
        entityName="DetailedAccount" 
        columns={columns}
        data={data}
        title={`${(t as any)('detailed_account_list') || 'فهرست حساب های تفصیلی'} (${(t as any)('record_count') || 'رکوردها:'} ${data.length})`}
        icon={<List className="h-4 w-4" />}
        isLoading={isLoading}
        onRefresh={() => params && fetchData(params)}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onDeleteRows={handleDeleteRows}
        serverSide={true}
        totalItems={totalItems}
        onParamsChange={handleParamsChange}
      />
      {showTypeSelector && <DetailedTypeSelector onClose={() => setShowTypeSelector(false)} />}
    </div>
  );
}
