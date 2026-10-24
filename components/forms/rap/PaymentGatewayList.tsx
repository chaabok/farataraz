'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { MainDataGrid, DataGridParams } from '../../ui/MainDataGrid';
import { useTabs } from '../../TabsProvider';
import { useLanguage } from '../../Providers';
import { useToast } from '../../ToastProvider';
import { CreditCard } from 'lucide-react';
import { apiFetch } from '@/lib/utils';
import { eventBus, EVENTS } from '@/lib/events';

export const usePaymentGatewayColumns = () => {
  const { t } = useLanguage();
  return useMemo(() => [
    { key: 'paymentGatewayId', header: 'شناسه', width: 80 },
    { 
      key: 'gatewayType', 
      header: 'نوع درگاه',
      width: 120,
      cell: (info: any) => info.row.original.gatewayType === 'pos' ? 'کارتخوان' : 'درگاه اینترنتی'
    },
    { key: 'gatewayIdString', header: 'شناسه درگاه', width: 150 },
    { 
      key: 'party.firstName', 
      header: 'نام شرکت / شخص',
      width: 200,
      cell: (info: any) => {
        const party = info.row.original.party;
        return party ? `${party.firstName} ${party.lastName || ''}`.trim() : '';
      }
    },
    { key: 'detailedAccount.code', header: 'کد تفصیلی', width: 150, cell: (info: any) => info.row.original.detailedAccount?.code || '' },
    { key: 'bankAccount.title', header: 'حساب بانکی', width: 200, cell: (info: any) => info.row.original.bankAccount?.title || '' },
    { key: 'isActive', header: 'وضعیت', width: 100, type: 'boolean' },
  ], []);
};

export default function PaymentGatewayList() {
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

      const res = await apiFetch(`/api/rap/payment-gateways?${queryParams.toString()}`);
      if (res.ok) {
        const json = await res.json();
        const responseData = json.data || json;
        setData(responseData.items || (Array.isArray(responseData) ? responseData : []));
        setTotalItems(responseData.total || (Array.isArray(responseData) ? responseData.length : 0));
      } else {
        showToast("خطا در دریافت اطلاعات درگاه‌های پرداخت", "error");
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
      if (payload?.entity === 'PaymentGateway') {
        if (params) fetchData(params);
      }
    });
    return () => unsubscribe();
  }, [params]);

  const handleEdit = (row: any) => {
    addTab(
      `ویرایش درگاه پرداخت`,
      'rap',
      <CreditCard className="w-4 h-4" />,
      "PaymentGatewayForm",
      { id: row.paymentGatewayId }
    );
  };

  const handleNew = () => {
    addTab(
      'تعریف درگاه پرداخت جدید',
      'rap',
      <CreditCard className="w-4 h-4" />,
      "PaymentGatewayForm"
    );
  };

  const handleDelete = async (item: any) => {
    try {
      const res = await apiFetch(`/api/rap/payment-gateways/${item.paymentGatewayId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        showToast(t('delete_success' as any) || "با موفقیت حذف شد", "success");
        eventBus.emit(EVENTS.DATA_CHANGED, { entity: 'PaymentGateway' });
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

  const columns = usePaymentGatewayColumns();

  return (
    <div className="h-full bg-white dark:bg-gray-900 overflow-hidden flex flex-col">
      <MainDataGrid
        entityName="PaymentGateway"
        data={data}
        columns={columns as any}
        title={`درگاه‌های پرداخت (${totalItems})`}
        icon={<CreditCard className="w-5 h-5 text-gray-500" />}
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
