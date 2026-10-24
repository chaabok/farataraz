"use client";
import { useLanguage } from "@/components/Providers";

import React, { useMemo, useState } from 'react';
import { MainDataGrid, DataGridParams } from '@/components/ui/MainDataGrid';
import { useTabs } from '@/components/TabsProvider';
import { apiFetch } from '@/lib/utils';
import { useToast } from '@/components/ToastProvider';
import { List } from 'lucide-react';

export const useReceivedChequeOperationColumns = () => {
  const { t } = useLanguage();
  return useMemo(() => [
    { 
      key: 'rowIndex', 
      header: 'ردیف', 
      width: 60,
      cell: (info: any) => {
        const state = info.table.getState();
        const pageIndex = state.pagination.pageIndex;
        const pageSize = state.pagination.pageSize;
        return (pageIndex * pageSize) + info.row.index + 1;
      }
    },
    { 
      key: 'operationType', 
      header: 'نوع', 
      width: 150,
      cell: (info: any) => {
        const val = info.row.original.operationType;
        if (val === 1) return 'واگذار به بانک';
        if (val === 2) return 'وصول / واخواست';
        if (val === 3) return 'نقد کردن واریز به حساب';
        if (val === 4) return 'نقد کردن';
        return val;
      }
    },
    { key: 'assignmentNumber', header: 'شماره واگذاری', width: 120 },
    { key: 'documentDate', header: 'تاریخ', width: 100 },
    { 
      key: 'status', 
      header: 'وضعیت', 
      width: 100,
      cell: (info: any) => {
        const val = info.row.original.status;
        if (val === 1) return 'ثبت اولیه';
        return val;
      }
    },
    { 
      key: 'bankAccount.title', 
      header: 'حساب بانکی', 
      width: 150,
      cell: (info: any) => {
        const bankAccount = info.row.original.bankAccount;
        return bankAccount ? bankAccount.title : '';
      }
    },
    { 
      key: 'voucherHeader.voucherNumber', 
      header: 'شماره سند حسابداری', 
      width: 150,
      cell: (info: any) => {
        const voucher = info.row.original.voucherHeader;
        return voucher ? voucher.voucherNumber : '';
      }
    },
    { 
      key: 'voucherHeader.referenceNumber', 
      header: 'شماره ثابت حسابداری', 
      width: 150,
      cell: (info: any) => {
        const voucher = info.row.original.voucherHeader;
        return voucher ? voucher.referenceNumber : '';
      }
    },
    { 
      key: 'voucherHeader.voucherDate', 
      header: 'تاریخ سند حسابداری', 
      width: 150,
      type: 'date',
      cell: (info: any) => {
        const voucher = info.row.original.voucherHeader;
        if (!voucher || !voucher.voucherDate) return '';
        // Use standard JS Date formatting or if formatDateByLocale was imported it could be used.
        // Assuming the Date might be returned as string or Date object.
        const d = new Date(voucher.voucherDate);
        return new Intl.DateTimeFormat('fa-IR').format(d);
      }
    }
  ], []);
};

export default function ReceivedChequeOperationList() {
  const { addTab } = useTabs();
  const { showToast } = useToast();
  const [refreshKey, setRefreshKey] = useState(0);

  const [data, setData] = useState<any[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [params, setParams] = useState<DataGridParams | null>(null);

  const columns = useReceivedChequeOperationColumns();

  const fetchData = async (currentParams: DataGridParams) => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('pageIndex', currentParams.pageIndex.toString());
      queryParams.append('pageSize', currentParams.pageSize.toString());
      if (currentParams.sorting?.length) queryParams.append('sorting', JSON.stringify(currentParams.sorting));
      if (currentParams.globalFilter) queryParams.append('globalFilter', currentParams.globalFilter);

      const res = await apiFetch(`/api/rap/received-cheque-operations?${queryParams.toString()}`);
      if (res.ok) {
        const json = await res.json();
        const responseData = json.data || json;
        setData(responseData.items || (Array.isArray(responseData) ? responseData : []));
        setTotalItems(responseData.total || (Array.isArray(responseData) ? responseData.length : 0));
      } else {
        showToast("خطا در دریافت اطلاعات", "error");
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

  const handleEdit = (item: any) => {
    const id = item.receivedChequeOperationId || item.id;
    addTab(
      `ویرایش عملیات چک`,
      'rap',
      null,
      'ReceivedChequeOperation',
      { id }
    );
  };

  const handleNew = () => {
    addTab(
      'عملیات جدید چک',
      'rap',
      null,
      'ReceivedChequeOperation'
    );
  };

  const handleDelete = async (row: any) => {
    const recordId = row.receivedChequeOperationId || row.id;
    try {
      const usageRes = await apiFetch(`/api/usage-check?entityName=ReceivedChequeOperation&recordId=${recordId}`);
      const usageData = await usageRes.json();
      if (usageData.isUsed) {
        showToast('این رکورد در سیستم استفاده شده است و قابل حذف نیست.', 'error');
        return;
      }
      
      const response = await apiFetch(`/api/rap/received-cheque-operations/${recordId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        showToast('با موفقیت حذف شد', 'success');
        setRefreshKey(prev => prev + 1);
        if (params) fetchData(params);
      } else {
        showToast('خطا در حذف', 'error');
      }
    } catch (error) {
      console.error(error);
      showToast('خطای سرور', 'error');
    }
  };

  return (
    <div className="h-full bg-white dark:bg-gray-900 overflow-hidden flex flex-col">
      <MainDataGrid
        entityName="ReceivedChequeOperation"
        key={refreshKey}
        columns={columns}
        data={data}
        icon={<List className="w-5 h-5 text-gray-500" />}
        isLoading={isLoading}
        onAdd={handleNew}
        onEdit={handleEdit}
        onDelete={handleDelete}
        title={`عملیات چک دریافتنی (${totalItems})`}
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
