"use client";
import { useLanguage } from "@/components/Providers";

import React, { useState, useMemo, useEffect } from "react";
import { MainDataGrid, DataGridParams } from "@/components/ui/MainDataGrid";
import { apiFetch, getPersianEntityName } from "@/lib/utils";
import { useToast } from "@/components/ToastProvider";
import { useTabs } from "@/components/TabsProvider";
import { eventBus, EVENTS } from "@/lib/events";
import { List, Plus } from "lucide-react";

export const usePaidDocumentClearingColumns = () => {
  const { t } = useLanguage();
  return useMemo(() => {
    const statusMap: Record<number, string> = {
      1: "ثبت اولیه",
      2: "تایید شده"
    };
    return [
      { key: "number", header: "شماره", width: 120 },
      { key: "date", header: "تاریخ", width: 120 },
      { 
        key: "bankAccount.accountNumber", 
        header: "حساب بانکی", 
        width: 180,
        cell: (info: any) => {
          const ba = info.row.original.bankAccount;
          if (!ba) return '';
          return `${ba.title || ''} (${ba.accountNumber || ''})`.trim() || ba.accountNumber || '';
        }
      },
      { key: "description", header: "توضیحات", width: 250 },
      { 
        key: "status", 
        header: "وضعیت", 
        width: 100,
        cell: (info: any) => statusMap[info.row.original.status] || info.row.original.status || ''
      }
    ];
  }, []);
};

export default function PaidDocumentClearingList() {
  const { addTab } = useTabs();
  const { showToast } = useToast();
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [params, setParams] = useState<DataGridParams | null>(null);

  const fetchData = async (currentParams: DataGridParams) => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('pageIndex', currentParams.pageIndex.toString());
      queryParams.append('pageSize', currentParams.pageSize.toString());
      if (currentParams.sorting?.length) queryParams.append('sorting', JSON.stringify(currentParams.sorting));
      if (currentParams.columnFilters?.length) queryParams.append('columnFilters', JSON.stringify(currentParams.columnFilters));
      if (currentParams.advancedFilters?.length) queryParams.append('advancedFilters', JSON.stringify(currentParams.advancedFilters));
      if (currentParams.globalFilter) queryParams.append('globalFilter', currentParams.globalFilter);

      const res = await apiFetch(`/api/rap/paid-document-clearings?${queryParams.toString()}`);
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

  useEffect(() => {
    const unsubscribe = eventBus.on(EVENTS.DATA_CHANGED, (payload) => {
      if (payload?.entity === 'PaidDocumentClearing') {
        if (params) fetchData(params);
      }
    });
    return () => unsubscribe();
  }, [params]);

  const handleEdit = (row: any) => {
    addTab(
      `ویرایش وصول (${row.number || ''})`,
      'rap',
      <List className="w-4 h-4" />,
      "PaidDocumentClearing",
      { id: row.paidDocumentClearingId || row.id }
    );
  };

  const handleNew = () => {
    addTab(
      'وصول اسناد پرداختنی جدید',
      'rap',
      <Plus className="w-4 h-4" />,
      "PaidDocumentClearing"
    );
  };

  const columns = usePaidDocumentClearingColumns();

  const handleDelete = async (item: any) => {
    try {
      const id = item.paidDocumentClearingId || item.id;
      const usageRes = await apiFetch(`/api/core/usage-check?tableName=PaidDocumentClearing&id=${id}`);
      if (usageRes.ok) {
        const usageData = await usageRes.json();
        if (usageData.isUsed) {
          const destEntity = usageData.usedInEntity || usageData.usedInTable;
          const destNamePersian = destEntity ? getPersianEntityName(destEntity) : 'سایر بخش‌ها';
          showToast(`از اطلاعات این فرم در فرم [${destNamePersian}] استفاده شده است. امکان حذف وجود ندارد.`, "warning");
          return;
        }
      }

      const res = await apiFetch(`/api/rap/paid-document-clearings/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast("با موفقیت حذف شد", "success");
        eventBus.emit(EVENTS.DATA_CHANGED, { entity: 'PaidDocumentClearing' });
        if (params) fetchData(params);
      } else {
        const errorData = await res.json().catch(() => ({}));
        showToast(errorData.message || "خطا در حذف", "error");
      }
    } catch (err: any) {
      console.error(err);
      showToast("خطا در ارتباط با سرور", "error");
    }
  };

  return (
    <div className="h-full bg-white dark:bg-gray-900 overflow-hidden flex flex-col">
      <MainDataGrid
        entityName="PaidDocumentClearing"
        columns={columns as any}
        data={data}
        title={`وصول اسناد پرداختنی (${totalItems})`}
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
