"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { MainDataGrid, DataGridColumn } from "@/components/ui/MainDataGrid";
import { apiFetch } from "@/lib/utils";
import { useTabs } from "@/components/TabsProvider";
import { useToast } from "@/components/ToastProvider";
import { Plus, Edit, Trash2, ClipboardList, RefreshCw } from "lucide-react";
import { DocumentState, DocumentStateLabels } from "@/components/inputs/StateListInput";

export function StocktakingList() {
  const { addTab } = useTabs();
  const { showToast } = useToast();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiFetch("/api/inv/stocktaking-counts");
      if (res && res.ok) {
        const list = await res.json();
        if (Array.isArray(list)) {
          setData(list);
        }
      }
    } catch (err) {
      console.error("Error loading stocktaking counts list:", err);
      showToast("خطا در دریافت فهرست شمارش‌های انبارگردانی", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleEdit = (row: any) => {
    addTab({
      id: `StocktakingForm-${row.StocktakingCountID}`,
      title: `شمارش انبارگردانی: ${row.StocktakingNumber || row.StocktakingCountID}`,
      componentName: "StocktakingForm",
      props: { id: row.StocktakingCountID },
      closable: true,
    });
  };

  const handleNew = () => {
    addTab({
      id: `StocktakingForm-new-${Date.now()}`,
      title: "شمارش انبارگردانی جدید",
      componentName: "StocktakingForm",
      closable: true,
    });
  };

  const handleDelete = async (row: any) => {
    if (!confirm(`آیا از حذف برگه شمارش شماره ${row.StocktakingNumber} اطمینان دارید؟`)) return;
    try {
      await apiFetch(`/api/inv/stocktaking-counts/${row.StocktakingCountID}`, {
        method: "DELETE",
      });
      showToast("برگه شمارش با موفقیت حذف گردید.", "success");
      fetchData();
    } catch (err: any) {
      showToast(err?.message || "خطا در حذف برگه شمارش", "error");
    }
  };

  const columns: DataGridColumn[] = useMemo(() => [
    {
      key: "StocktakingNumber",
      label: "شماره برگه",
      width: "100px",
      align: "center",
      render: (val, row) => (
        <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
          {row.StocktakingNumber}
        </span>
      ),
    },
    {
      key: "StocktakingDate",
      label: "تاریخ شمارش",
      width: "120px",
      align: "center",
      render: (val, row) => row.StocktakingDate || "—",
    },
    {
      key: "Period",
      label: "دوره انبارگردانی",
      width: "200px",
      align: "right",
      render: (val, row) => row.tagHeader?.StocktakingPeriod || `دوره شماره ${row.tagHeader?.StocktakingNumber || '—'}`,
    },
    {
      key: "Warehouse",
      label: "انبار شمارش شده",
      width: "180px",
      align: "right",
      render: (val, row) => row.warehouse?.WarehouseName ? `${row.warehouse?.WarehouseCode || ''} - ${row.warehouse?.WarehouseName}` : "—",
    },
    {
      key: "CountRound",
      label: "نوبت شمارش",
      width: "110px",
      align: "center",
      render: (val, row) => {
        const r = Number(row.CountRound || 1);
        if (r === 2) return <span className="px-2 py-0.5 rounded text-xs bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">شمارش دوم</span>;
        if (r === 3) return <span className="px-2 py-0.5 rounded text-xs bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">شمارش سوم</span>;
        return <span className="px-2 py-0.5 rounded text-xs bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">شمارش اول</span>;
      },
    },
    {
      key: "Status",
      label: "وضعیت",
      width: "110px",
      align: "center",
      render: (val, row) => {
        const stateKey = Number(row.Status) as DocumentState;
        return (
          <span className="px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {DocumentStateLabels[stateKey] || "ثبت اولیه"}
          </span>
        );
      },
    },
    {
      key: "Description",
      label: "توضیحات",
      width: "240px",
      align: "right",
      render: (val, row) => row.Description || "—",
    },
    {
      key: "actions",
      label: "عملیات",
      width: "90px",
      align: "center",
      render: (val, row) => (
        <div className="flex items-center justify-center gap-1">
          <button
            onClick={() => handleEdit(row)}
            className="p-1 rounded text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50"
            title="ویرایش"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(row)}
            className="p-1 rounded text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50"
            title="حذف"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ], []);

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 p-4 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <h1 className="text-base font-bold text-slate-800 dark:text-slate-100">
            فهرست برگه‌های شمارش انبارگردانی
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded shadow-sm hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>به‌روزرسانی</span>
          </button>
          <button
            onClick={handleNew}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>شمارش جدید</span>
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-[400px]">
        <MainDataGrid
          columns={columns}
          data={data}
          isLoading={loading}
          emptyMessage="هیچ برگه‌ شمارش انبارگردانی یافت نشد."
          onRowDoubleClick={(row) => handleEdit(row)}
          rowKey="StocktakingCountID"
        />
      </div>
    </div>
  );
}

export default StocktakingList;
