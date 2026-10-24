"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { MainDataGrid, DataGridParams } from '../../ui/MainDataGrid';
import { useTabs } from '../../TabsProvider';
import { useLanguage } from '../../Providers';
import { useToast } from '../../ToastProvider';
import { List, Plus } from 'lucide-react';
import { apiFetch, getPersianEntityName } from '@/lib/utils';
import { eventBus, EVENTS } from '@/lib/events';
import moment from "moment-jalaali";

export const usePaymentNotificationColumns = () => {
  return useMemo(() => {
    const baseTypeMap: Record<number, string> = {
      1: "بدون مبنا",
      2: "سند حسابداری",
      3: "دستور پرداخت",
      4: "پرداخت حقوق",
      5: "درخواست تنخواه",
      6: "فاکتور خرید",
      7: "برگشت از فروش",
      8: "تسویه طرف مقابل",
    };
    const paymentTypeMap: Record<number, string> = {
      1: "تسویه تعهدات",
      2: "شارژ تنخواه",
      3: "بانک به بانک",
      4: "بانک به صندوق",
      5: "صندوق به بانک",
      6: "صندوق به صندوق",
    };
    const statusMap: Record<number, string> = {
      1: "ثبت اولیه",
      2: "تایید شده"
    };
    return [
      { key: 'documentNumber', header: 'شماره سند', width: 120 },
      { key: 'documentDate', header: 'تاریخ', width: 150, cell: (info: any) => info.row.original.documentDate ? moment(info.row.original.documentDate).format('jYYYY/jMM/jDD') : '' },
      { key: 'baseType', header: 'نوع مبنا', width: 120, cell: (info: any) => baseTypeMap[info.row.original.baseType] || info.row.original.baseType },
      { key: 'baseNumber', header: 'شماره مبنا', width: 120 },
      { key: 'paymentType', header: 'نوع پرداخت', width: 150, cell: (info: any) => paymentTypeMap[info.row.original.paymentType] || info.row.original.paymentType },
      { key: 'party.title', header: 'طرف حساب', width: 200, cell: (info: any) => {
          const p = info.row.original.party;
          if (!p) return '';
          return `${p.firstName || ''} ${p.lastName || ''}`.trim() || p.detailedAccount?.title || '';
        } 
      },
      { key: 'totalAmount', header: 'جمع کل', width: 150, cell: (info: any) => {
          const row = info.row.original;
          let sum = 0;
          if (row.cashItems) sum += row.cashItems.reduce((acc: number, item: any) => acc + (Number(item.amount) || 0), 0);
          if (row.chequeItems) sum += row.chequeItems.reduce((acc: number, item: any) => acc + (Number(item.amount) || 0), 0);
          if (row.withdrawalItems) sum += row.withdrawalItems.reduce((acc: number, item: any) => acc + (Number(item.amount) || 0), 0);
          if (row.assignmentItems) sum += row.assignmentItems.reduce((acc: number, item: any) => acc + (Number(item.amount) || 0), 0);
          return Number(sum).toLocaleString('en-US');
        } 
      },
      { key: 'status', header: 'وضعیت', width: 100, cell: (info: any) => statusMap[info.row.original.status] || info.row.original.status }
    ];
  }, []);
};

export function PaymentNotificationList() {
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

      const res = await apiFetch(`/api/rap/payment-notifications?${queryParams.toString()}`);
      if (res.ok) {
        const json = await res.json();
        const responseData = json.data || json;
        setData(responseData.items || (Array.isArray(responseData) ? responseData : []));
        setTotalItems(responseData.total || (Array.isArray(responseData) ? responseData.length : 0));
      } else {
        showToast("خطا در دریافت اطلاعات اعلامیه پرداخت", "error");
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
      if (payload?.entity === 'PaymentNotification') {
        if (params) fetchData(params);
      }
    });
    return () => unsubscribe();
  }, [params]);

  const handleEdit = (row: any) => {
    addTab(
      `ویرایش اعلامیه (${row.documentNumber || ''})`,
      'rap',
      <List className="w-4 h-4" />,
      "PaymentNotificationForm",
      { id: row.paymentNotificationId }
    );
  };

  const handleNew = () => {
    addTab(
      'اعلامیه پرداخت جدید',
      'rap',
      <Plus className="w-4 h-4" />,
      "PaymentNotificationForm"
    );
  };

  const handleDelete = async (item: any) => {
    try {
      const usageRes = await apiFetch(`/api/core/usage-check?tableName=PaymentNotification&id=${item.paymentNotificationId}`);
      if (usageRes.ok) {
        const usageData = await usageRes.json();
        if (usageData.isUsed) {
          const destEntity = usageData.usedInEntity || usageData.usedInTable;
          const destNamePersian = destEntity ? getPersianEntityName(destEntity) : 'سایر بخش‌ها';
          showToast(`از اطلاعات این فرم در فرم [${destNamePersian}] استفاده شده است. امکان حذف وجود ندارد.`, "warning");
          return;
        }
      }

      const res = await apiFetch(`/api/rap/payment-notifications/${item.paymentNotificationId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        showToast(t('delete_success' as any) || "با موفقیت حذف شد", "success");
        eventBus.emit(EVENTS.DATA_CHANGED, { entity: 'PaymentNotification' });
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

  const columns = usePaymentNotificationColumns();

  return (
    <div className="h-full bg-white dark:bg-gray-900 overflow-hidden flex flex-col">
      <MainDataGrid
        entityName="PaymentNotification"
        data={data}
        columns={columns as any}
        title={`اعلامیه پرداخت (${totalItems})`}
        icon={<List className="w-5 h-5 text-gray-500" />}
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

export default PaymentNotificationList;
