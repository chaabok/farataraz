"use client";
import { useLanguage } from "@/components/Providers";

import React, { useMemo, useState, useEffect } from "react";
import { MainDataGrid, DataGridParams } from "@/components/ui/MainDataGrid";
import { useTabs } from "@/components/TabsProvider";
import { useToast } from "@/components/ToastProvider";
import { FileText } from "lucide-react";
import { apiFetch } from "@/lib/utils";

export const usePettyCashSummaryColumns = () => {
  return [
    { key: "pettyCashSummaryId", label: "کد" },
    { key: "number", label: "شماره" },
    { key: "date", label: "تاریخ", type: "date" },
    { key: "pettyCashName", label: "تنخواه دار" },
    { 
      key: "currentBalance", 
      label: "مانده تنخواه", 
      type: "amount",
      cell: (info: any) => {
        const val = info.row.original.currentBalance;
        return val ? Number(val).toLocaleString('en-US') : '0';
      }
    },
    { 
      key: "totalAmount", 
      label: "مبلغ خلاصه تنخواه", 
      type: "amount",
      cell: (info: any) => {
        const val = info.row.original.totalAmount;
        return val ? Number(val).toLocaleString('en-US') : '0';
      }
    },
  ];
};

export function PettyCashSummaryList() {
  const { addTab } = useTabs();
  const { showToast } = useToast();

  const [data, setData] = useState<any[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [params, setParams] = useState<DataGridParams | null>(null);

  const columns = usePettyCashSummaryColumns();

  const fetchData = async (currentParams: DataGridParams) => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('pageIndex', currentParams.pageIndex.toString());
      queryParams.append('pageSize', currentParams.pageSize.toString());
      if (currentParams.sorting?.length) queryParams.append('sorting', JSON.stringify(currentParams.sorting));
      if (currentParams.globalFilter) queryParams.append('globalFilter', currentParams.globalFilter);

      const res = await apiFetch(`/api/rap/petty-cash-summaries?${queryParams.toString()}`);
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

  const handleDelete = async (item: any) => {
    try {
      const res = await apiFetch(`/api/rap/petty-cash-summaries/${item.pettyCashSummaryId || item.id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast("با موفقیت حذف شد", "success");
        if (params) fetchData(params);
      } else {
        showToast("خطا در حذف", "error");
      }
    } catch (err) {
      showToast("خطا در ارتباط با سرور", "error");
    }
  };

  return (
    <div className="h-full w-full bg-white dark:bg-slate-900 border-none shadow-none rounded-none md:rounded-lg md:border md:border-gray-200 md:dark:border-slate-800 p-0 md:p-2 mb-10 overflow-hidden">
      <MainDataGrid
        columns={columns}
        data={data}
        isLoading={isLoading}
        title="خلاصه تنخواه افزار"
        onEdit={(item) => {
          addTab("ویرایش خلاصه تنخواه", "rap", <FileText className="w-4 h-4" />, "PettyCashSummaryForm", { id: item.pettyCashSummaryId || item.id });
        }}
        onAdd={() => {
          addTab("خلاصه تنخواه جدید", "rap", <FileText className="w-4 h-4" />, "PettyCashSummaryForm");
        }}
        onDelete={handleDelete}
        serverSide={true}
        totalItems={totalItems}
        onParamsChange={handleParamsChange}
      />
    </div>
  );
}

export default PettyCashSummaryList;
