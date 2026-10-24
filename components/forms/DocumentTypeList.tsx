'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useLanguage } from '@/components/Providers';
import { useTabs } from '@/components/TabsProvider';
import { MainDataGrid, DataGridColumn, DataGridParams } from '../ui/MainDataGrid';
import { FileText } from 'lucide-react';
import { apiFetch } from '@/lib/utils';
import { useToast } from '@/components/ToastProvider';
import { eventBus, EVENTS } from '@/lib/events';

export function DocumentTypeList() {
  const { t } = useLanguage();
  const { addTab } = useTabs();
  const { showToast } = useToast();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [params, setParams] = useState<DataGridParams | null>(null);

  const fetchData = async (currentParams: DataGridParams) => {
    setLoading(true);
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
        showToast(t('error_loading_data' as any) || "خطا در دریافت اطلاعات", "error");
      }
    } catch (err) {
      console.error('Fetch error:', err);
      showToast(t('server_connection_error' as any) || "خطا در ارتباط با سرور", "error");
    } finally {
      setLoading(false);
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
    { key: 'id', header: t('row_number' as any) || 'ردیف', width: 80, type: 'number', resizable: false },
    { key: 'code', header: t('code' as any) || 'کد', width: 150, type: 'text' },
    { key: 'title', header: t('title_label' as any) || 'عنوان', width: 500, type: 'text' },
  ], [t]);

  const handleAdd = () => {
    // Open NewDocumentType inside the tabs
    addTab(
      t('new_document_type' as any) || 'نوع سند جدید', 
      'general', 
      <FileText className="h-[14px] w-[14px]" />, 
      'NewDocumentType'
    );
  };

  const handleEdit = (item: any) => {
    // Placeholder for edit functionality
    console.log('Editing:', item);
    addTab(
      (t('edit_document_type' as any) || 'ویرایش نوع سند') + ' ' + item.code, 
      'general', 
      <FileText className="h-[14px] w-[14px]" />, 
      'NewDocumentType'
    );
  };

  const handleDelete = async (item: any) => {
    try {
      const res = await apiFetch(`/api/accounting/voucher-types/${item.voucherTypeId || item.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
         showToast(t('delete_success' as any) || "با موفقیت حذف شد", "success");
         eventBus.emit(EVENTS.DATA_CHANGED, { entity: 'VoucherType' });
         if (params) fetchData(params);
      } else {
         const err = await res.json().catch(() => ({}));
         showToast(err.message || t('delete_error' as any) || "خطا در حذف", "error");
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.message || t('delete_error' as any) || "خطا در حذف", "error");
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-gray-900 rounded-lg">
      <MainDataGrid 
        columns={columns}
        data={data}
        isLoading={loading}
        title={t('document_types_list' as any) || 'لیست انواع اسناد'}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRefresh={() => params && fetchData(params)}
        serverSide={true}
        totalItems={totalItems}
        onParamsChange={handleParamsChange}
      />
    </div>
  );
}
